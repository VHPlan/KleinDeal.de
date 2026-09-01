import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit, rateLimitResponse, getClientIp } from '@/lib/rateLimit';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [{ buyerId: user!.id }, { sellerId: user!.id }],
      },
      include: {
        listing: { select: { id: true, title: true, images: true, price: true } },
        buyer: { select: { id: true, name: true, avatar: true } },
        seller: { select: { id: true, name: true, avatar: true } },
        reviews: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(transactions);
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Laden der Transaktionen' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const ip = getClientIp(req);
    const rl = checkRateLimit(`tx_${user!.id}_${ip}`, 15, 300);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds);

    const body = await req.json();
    const { action, transactionId, listingId, buyerId, agreedPrice, code } = body;

    // 1. Action: GENERATE_HANDOVER_CODE (Buyer generates code)
    if (action === 'GENERATE_HANDOVER_CODE') {
      if (!transactionId) {
        return NextResponse.json({ error: 'Transaktions-ID erforderlich' }, { status: 400 });
      }

      const tx = await prisma.transaction.findUnique({ where: { id: transactionId } });
      if (!tx || tx.buyerId !== user!.id) {
        return NextResponse.json({ error: 'Nur der Käufer kann einen Übergabecode generieren.' }, { status: 403 });
      }

      const plainCode = crypto.randomInt(100000, 999999).toString();
      const codeHash = await bcrypt.hash(plainCode, 10);

      await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          handoverCodeHash: codeHash,
          status: 'HANDOVER_PENDING',
        },
      });

      return NextResponse.json({ code: plainCode });
    }

    // 2. Action: VERIFY_HANDOVER_CODE (Seller enters code to complete)
    if (action === 'VERIFY_HANDOVER_CODE') {
      if (!transactionId || !code) {
        return NextResponse.json({ error: 'Transaktions-ID und Übergabecode erforderlich' }, { status: 400 });
      }

      const tx = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { listing: true },
      });

      if (!tx || tx.sellerId !== user!.id) {
        return NextResponse.json({ error: 'Nur der Verkäufer kann den Übergabecode bestätigen.' }, { status: 403 });
      }

      if (!tx.handoverCodeHash) {
        return NextResponse.json({ error: 'Kein aktiver Übergabecode für diese Transaktion gefunden.' }, { status: 400 });
      }

      const isValid = await bcrypt.compare(code.trim(), tx.handoverCodeHash);
      if (!isValid) {
        return NextResponse.json({ error: 'Ungültiger Übergabecode. Bitte überprüfe die Eingabe.' }, { status: 400 });
      }

      const now = new Date();

      // Atomically complete transaction and mark listing SOLD
      const completedTx = await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'COMPLETED',
          buyerConfirmed: true,
          sellerConfirmed: true,
          completedAt: now,
          handoverCodeHash: null, // Clear single-use code
        },
      });

      await prisma.listing.update({
        where: { id: tx.listingId },
        data: { status: 'SOLD' },
      });

      // Notify buyer to leave a review
      await prisma.notification.create({
        data: {
          userId: tx.buyerId,
          title: 'Übergabe erfolgreich bestätigt!',
          message: `Die Übergabe für "${tx.listing.title}" wurde bestätigt. Bewerte jetzt deinen Verkäufer!`,
          link: `/profile?tab=transactions`,
          type: 'TRANSACTION',
        },
      });

      return NextResponse.json(completedTx);
    }

    // 3. Action: CREATE (Direct agreement creation)
    if (!listingId || !buyerId || !agreedPrice) {
      return NextResponse.json({ error: 'Pflichtfelder für Transaktion fehlen.' }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing || listing.userId !== user!.id) {
      return NextResponse.json({ error: 'Nur der Eigentümer der Anzeige kann eine Transaktion starten.' }, { status: 403 });
    }

    const tx = await prisma.transaction.create({
      data: {
        listingId,
        buyerId,
        sellerId: user!.id,
        agreedPrice: parseFloat(agreedPrice.toString()),
        status: 'AGREED',
      },
    });

    return NextResponse.json(tx);
  } catch (error: any) {
    console.error('Transaction error:', error);
    return NextResponse.json({ error: 'Fehler bei der Transaktionsverwaltung' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { transactionId, action } = body;

    if (!transactionId || !action) {
      return NextResponse.json({ error: 'Transaktions-ID und Aktion erforderlich' }, { status: 400 });
    }

    const tx = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { listing: true },
    });

    if (!tx || (tx.buyerId !== user!.id && tx.sellerId !== user!.id)) {
      return NextResponse.json({ error: 'Zugriff verweigert.' }, { status: 403 });
    }

    const isBuyer = tx.buyerId === user!.id;
    const isSeller = tx.sellerId === user!.id;

    if (action === 'CONFIRM_MANUAL') {
      const updateData: any = {};
      if (isBuyer) updateData.buyerConfirmed = true;
      if (isSeller) updateData.sellerConfirmed = true;

      const bothConfirmed = (isBuyer && tx.sellerConfirmed) || (isSeller && tx.buyerConfirmed);

      if (bothConfirmed) {
        updateData.status = 'COMPLETED';
        updateData.completedAt = new Date();

        await prisma.listing.update({
          where: { id: tx.listingId },
          data: { status: 'SOLD' },
        });
      }

      const updated = await prisma.transaction.update({
        where: { id: transactionId },
        data: updateData,
      });

      return NextResponse.json(updated);
    }

    if (action === 'CANCEL') {
      const updated = await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: 'CANCELLED' },
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Unbekannte Aktion.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Aktualisieren der Transaktion' }, { status: 500 });
  }
}
