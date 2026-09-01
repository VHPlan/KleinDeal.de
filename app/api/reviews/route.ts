import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit, rateLimitResponse, getClientIp } from '@/lib/rateLimit';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get('targetId');

    if (!targetId) {
      return NextResponse.json({ error: 'Nutzer-ID erforderlich' }, { status: 400 });
    }

    if (targetId.startsWith('seller-')) {
      return NextResponse.json({
        averageRating: null,
        reviewCount: 0,
        reviews: [],
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      });
    }

    const reviews = await prisma.review.findMany({
      where: {
        targetId,
        status: 'ACTIVE',
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        transaction: { select: { id: true, listing: { select: { id: true, title: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (reviews.length === 0) {
      return NextResponse.json({
        averageRating: null,
        reviewCount: 0,
        reviews: [],
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      });
    }

    const sum = reviews.reduce((acc, r) => acc + r.ratingOverall, 0);
    const averageRating = parseFloat((sum / reviews.length).toFixed(1));

    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      distribution[r.ratingOverall] = (distribution[r.ratingOverall] || 0) + 1;
    });

    return NextResponse.json({
      averageRating,
      reviewCount: reviews.length,
      reviews,
      ratingDistribution: distribution,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Laden der Bewertungen' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const ip = getClientIp(req);
    const rl = checkRateLimit(`review_${user!.id}_${ip}`, 10, 600);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds);

    const body = await req.json();
    const {
      transactionId,
      ratingOverall,
      ratingCommunication,
      ratingReliability,
      ratingDescription,
      ratingFriendliness,
      comment,
    } = body;

    if (!transactionId || !ratingOverall || ratingOverall < 1 || ratingOverall > 5) {
      return NextResponse.json(
        { error: 'Gültige Gesamtnote zwischen 1 und 5 Sternen erforderlich.' },
        { status: 400 }
      );
    }

    const tx = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!tx || tx.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Bewertungen können nur für erfolgreich abgeschlossene Transaktionen abgegeben werden.' },
        { status: 400 }
      );
    }

    // Determine target and role
    const isBuyer = tx.buyerId === user!.id;
    const isSeller = tx.sellerId === user!.id;

    if (!isBuyer && !isSeller) {
      return NextResponse.json({ error: 'Zugriff verweigert. Du warst an dieser Transaktion nicht beteiligt.' }, { status: 403 });
    }

    const targetId = isBuyer ? tx.sellerId : tx.buyerId;
    const role = isBuyer ? 'BUYER' : 'SELLER';

    // Prevent duplicate review per transaction
    const existing = await prisma.review.findUnique({
      where: {
        transactionId_authorId: {
          transactionId,
          authorId: user!.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Du hast für diese Transaktion bereits eine Bewertung abgegeben.' },
        { status: 400 }
      );
    }

    // Sanitize comment
    const sanitizedComment = comment
      ? comment.trim().substring(0, 1000).replace(/</g, '&lt;').replace(/>/g, '&gt;')
      : null;

    const review = await prisma.review.create({
      data: {
        transactionId,
        authorId: user!.id,
        targetId,
        role,
        ratingOverall: Math.round(ratingOverall),
        ratingCommunication: ratingCommunication ? Math.round(ratingCommunication) : null,
        ratingReliability: ratingReliability ? Math.round(ratingReliability) : null,
        ratingDescription: ratingDescription ? Math.round(ratingDescription) : null,
        ratingFriendliness: ratingFriendliness ? Math.round(ratingFriendliness) : null,
        comment: sanitizedComment,
      },
    });

    // Notify target user
    await prisma.notification.create({
      data: {
        userId: targetId,
        title: 'Neue Bewertung erhalten!',
        message: `${user!.name} hat dir eine ${ratingOverall}-Sterne-Bewertung gegeben.`,
        link: `/seller/${targetId}`,
        type: 'REVIEW',
      },
    });

    return NextResponse.json(review);
  } catch (error: any) {
    console.error('Review creation error:', error);
    return NextResponse.json({ error: 'Fehler beim Erstellen der Bewertung' }, { status: 500 });
  }
}
