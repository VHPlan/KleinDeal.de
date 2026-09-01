import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit, rateLimitResponse, getClientIp } from '@/lib/rateLimit';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get('listingId');
    const conversationId = searchParams.get('conversationId');

    const where: any = {
      OR: [{ buyerId: user!.id }, { sellerId: user!.id }],
    };

    if (listingId) where.listingId = listingId;
    if (conversationId) where.conversationId = conversationId;

    const offers = await prisma.offer.findMany({
      where,
      include: {
        listing: { select: { id: true, title: true, price: true, images: true } },
        buyer: { select: { id: true, name: true, avatar: true } },
        seller: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(offers);
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Laden der Angebote' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const ip = getClientIp(req);
    const rl = checkRateLimit(`offer_${user!.id}_${ip}`, 15, 300);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds);

    const body = await req.json();
    const { listingId, amount, conversationId } = body;

    if (!listingId || !amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Ungültiger Angebotsbetrag.' }, { status: 400 });
    }

    if (listingId.startsWith('demo-')) {
      return NextResponse.json(
        { error: 'Diese Funktion ist für Beispielanzeigen deaktiviert.' },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing || listing.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Anzeige nicht gefunden oder nicht mehr aktiv.' }, { status: 404 });
    }

    // Prevent self-offering
    if (listing.userId === user!.id) {
      return NextResponse.json({ error: 'Du kannst dir selbst kein Angebot machen.' }, { status: 400 });
    }

    // Check if buyer has an active pending offer
    const pendingExisting = await prisma.offer.findFirst({
      where: {
        listingId,
        buyerId: user!.id,
        status: { in: ['PENDING', 'COUNTERED'] },
      },
    });

    if (pendingExisting) {
      // Update amount on existing pending offer
      const updated = await prisma.offer.update({
        where: { id: pendingExisting.id },
        data: {
          amount,
          status: 'PENDING',
          counterAmount: null,
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
        },
      });
      return NextResponse.json(updated);
    }

    // Find or create conversation
    let convId = conversationId;
    if (!convId) {
      const existingConv = await prisma.conversation.findFirst({
        where: { buyerId: user!.id, sellerId: listing.userId, listingId },
      });
      if (existingConv) {
        convId = existingConv.id;
      } else {
        const newConv = await prisma.conversation.create({
          data: { buyerId: user!.id, sellerId: listing.userId, listingId },
        });
        convId = newConv.id;
      }
    }

    const offer = await prisma.offer.create({
      data: {
        listingId,
        conversationId: convId,
        buyerId: user!.id,
        sellerId: listing.userId,
        amount,
        currency: 'EUR',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      },
      include: {
        listing: { select: { id: true, title: true, price: true } },
      },
    });

    // Notify seller
    await prisma.notification.create({
      data: {
        userId: listing.userId,
        title: 'Neues Preisangebot erhalten',
        message: `${user!.name} hat dir ein Angebot über ${amount} € für "${listing.title}" gemacht.`,
        link: `/messages?conv=${convId}`,
        type: 'OFFER',
      },
    });

    return NextResponse.json(offer);
  } catch (error: any) {
    console.error('Create offer error:', error);
    return NextResponse.json({ error: 'Fehler beim Senden des Angebots' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { offerId, action, counterAmount, counterNote } = body;

    if (!offerId || !action) {
      return NextResponse.json({ error: 'Angebots-ID und Aktion erforderlich.' }, { status: 400 });
    }

    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: { listing: true },
    });

    if (!offer) {
      return NextResponse.json({ error: 'Angebot nicht gefunden.' }, { status: 404 });
    }

    // Check authorization: must be buyer or seller
    const isBuyer = offer.buyerId === user!.id;
    const isSeller = offer.sellerId === user!.id;

    if (!isBuyer && !isSeller) {
      return NextResponse.json({ error: 'Zugriff verweigert.' }, { status: 403 });
    }

    const now = new Date();

    // 1. Action: ACCEPT
    if (action === 'ACCEPT') {
      if (offer.status === 'ACCEPTED') {
        return NextResponse.json({ error: 'Angebot wurde bereits angenommen.' }, { status: 400 });
      }

      const agreedPrice = offer.status === 'COUNTERED' && offer.counterAmount ? offer.counterAmount : offer.amount;

      // Update offer status
      const updatedOffer = await prisma.offer.update({
        where: { id: offerId },
        data: { status: 'ACCEPTED', respondedAt: now },
      });

      // Create transaction record
      await prisma.transaction.create({
        data: {
          listingId: offer.listingId,
          buyerId: offer.buyerId,
          sellerId: offer.sellerId,
          offerId: offer.id,
          agreedPrice,
          status: 'AGREED',
        },
      });

      // Notify other party
      const notifyUserId = isBuyer ? offer.sellerId : offer.buyerId;
      await prisma.notification.create({
        data: {
          userId: notifyUserId,
          title: 'Angebot angenommen!',
          message: `Das Angebot über ${agreedPrice} € für "${offer.listing.title}" wurde angenommen.`,
          link: `/messages?conv=${offer.conversationId}`,
          type: 'OFFER',
        },
      });

      return NextResponse.json(updatedOffer);
    }

    // 2. Action: REJECT
    if (action === 'REJECT') {
      const updatedOffer = await prisma.offer.update({
        where: { id: offerId },
        data: { status: 'REJECTED', respondedAt: now },
      });

      const notifyUserId = isBuyer ? offer.sellerId : offer.buyerId;
      await prisma.notification.create({
        data: {
          userId: notifyUserId,
          title: 'Angebot abgelehnt',
          message: `Das Angebot für "${offer.listing.title}" wurde abgelehnt.`,
          link: `/messages?conv=${offer.conversationId}`,
          type: 'OFFER',
        },
      });

      return NextResponse.json(updatedOffer);
    }

    // 3. Action: COUNTER (Gegenangebot)
    if (action === 'COUNTER') {
      if (!isSeller) {
        return NextResponse.json({ error: 'Nur der Verkäufer kann ein Gegenangebot senden.' }, { status: 403 });
      }
      if (!counterAmount || counterAmount <= 0) {
        return NextResponse.json({ error: 'Gültigen Betrag für Gegenangebot eingeben.' }, { status: 400 });
      }

      const updatedOffer = await prisma.offer.update({
        where: { id: offerId },
        data: {
          status: 'COUNTERED',
          counterAmount,
          counterNote: counterNote || null,
          respondedAt: now,
        },
      });

      await prisma.notification.create({
        data: {
          userId: offer.buyerId,
          title: 'Gegenangebot erhalten',
          message: `Der Verkäufer hat ein Gegenangebot von ${counterAmount} € für "${offer.listing.title}" gesendet.`,
          link: `/messages?conv=${offer.conversationId}`,
          type: 'OFFER',
        },
      });

      return NextResponse.json(updatedOffer);
    }

    // 4. Action: WITHDRAW (Zurückziehen)
    if (action === 'WITHDRAW') {
      if (!isBuyer) {
        return NextResponse.json({ error: 'Nur der Käufer kann sein Angebot zurückziehen.' }, { status: 403 });
      }

      const updatedOffer = await prisma.offer.update({
        where: { id: offerId },
        data: { status: 'WITHDRAWN', respondedAt: now },
      });

      return NextResponse.json(updatedOffer);
    }

    return NextResponse.json({ error: 'Unbekannte Aktion.' }, { status: 400 });
  } catch (error: any) {
    console.error('Update offer error:', error);
    return NextResponse.json({ error: 'Fehler beim Bearbeiten des Angebots' }, { status: 500 });
  }
}
