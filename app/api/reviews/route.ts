import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit, rateLimitResponse, getClientIp } from '@/lib/rateLimit';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get('targetId');
    const minRating = searchParams.get('minRating');
    const withCommentOnly = searchParams.get('withCommentOnly') === 'true';
    const sortBy = searchParams.get('sortBy') || 'newest';

    if (!targetId) {
      return NextResponse.json({ error: 'Nutzer-ID erforderlich' }, { status: 400 });
    }

    if (targetId.startsWith('seller-')) {
      return NextResponse.json({
        averageRating: 4.9,
        reviewCount: 14,
        recommendationRate: 98,
        ratingDistribution: { 5: 12, 4: 2, 3: 0, 2: 0, 1: 0 },
        subRatings: {
          communication: 4.9,
          reliability: 5.0,
          friendliness: 4.8,
          description: 4.9,
        },
        badges: {
          isTopRated: true,
          isReliable: true,
          isFastResponder: true,
        },
        reviews: [
          {
            id: 'mock-rev-1',
            author: { id: 'u1', name: 'Laura Schmidt', avatar: null },
            transaction: { id: 'tx1', listing: { id: 'l1', title: 'Apple iPhone 15 Pro Max' } },
            role: 'BUYER',
            ratingOverall: 5,
            ratingCommunication: 5,
            ratingReliability: 5,
            ratingDescription: 5,
            ratingFriendliness: 5,
            comment: 'Absolut perfekter Ablauf! Sehr netter Kontakt, pünktlich bei der Übergabe und das iPhone war wie neu im Originalkarton. Gerne wieder!',
            tags: ['⚡ Sehr schnell geantwortet', '🤝 Pünktlich', '📦 Top Zustand'],
            sellerReply: 'Vielen Dank Laura! Viel Spaß mit dem neuen iPhone!',
            sellerReplyAt: '2026-08-20T10:00:00Z',
            helpfulCount: 4,
            createdAt: '2026-08-19T14:30:00Z',
          },
          {
            id: 'mock-rev-2',
            author: { id: 'u2', name: 'Dennis Weber', avatar: null },
            transaction: { id: 'tx2', listing: { id: 'l2', title: 'Sony PlayStation 5' } },
            role: 'BUYER',
            ratingOverall: 5,
            ratingCommunication: 5,
            ratingReliability: 5,
            ratingDescription: 5,
            ratingFriendliness: 5,
            comment: 'Super schneller Versand, extrem sicher verpackt. Die Konsole läuft einwandfrei. Ein vorbildlicher Verkäufer auf KleinDeal!',
            tags: ['📦 Top Zustand', '👍 Sehr empfehlenswert'],
            sellerReply: null,
            helpfulCount: 2,
            createdAt: '2026-08-15T09:15:00Z',
          },
          {
            id: 'mock-rev-3',
            author: { id: 'u3', name: 'Sabine Becker', avatar: null },
            transaction: { id: 'tx3', listing: { id: 'l3', title: 'Fahrrad Vintage Rennrad' } },
            role: 'BUYER',
            ratingOverall: 4,
            ratingCommunication: 4,
            ratingReliability: 5,
            ratingDescription: 4,
            ratingFriendliness: 5,
            comment: 'Gute Kommunikation und reibungslose Übergabe vor Ort in Karlsruhe. Das Rad fährt sich super.',
            tags: ['🤝 Pünktlich'],
            sellerReply: null,
            helpfulCount: 1,
            createdAt: '2026-08-02T18:40:00Z',
          },
        ],
      });
    }

    const whereClause: any = {
      targetId,
      status: 'ACTIVE',
    };

    if (minRating) {
      const parsedMin = parseInt(minRating, 10);
      if (!isNaN(parsedMin)) {
        whereClause.ratingOverall = parsedMin;
      }
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'ratingDesc') orderBy = { ratingOverall: 'desc' };
    if (sortBy === 'ratingAsc') orderBy = { ratingOverall: 'asc' };

    const reviews = await prisma.review.findMany({
      where: whereClause,
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        transaction: { select: { id: true, listing: { select: { id: true, title: true } } } },
      },
      orderBy,
    });

    if (reviews.length === 0) {
      return NextResponse.json({
        averageRating: null,
        reviewCount: 0,
        recommendationRate: 100,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        subRatings: {
          communication: 5.0,
          reliability: 5.0,
          friendliness: 5.0,
          description: 5.0,
        },
        badges: {
          isTopRated: false,
          isReliable: false,
          isFastResponder: false,
        },
        reviews: [],
      });
    }

    // Calculations
    const sum = reviews.reduce((acc, r) => acc + r.ratingOverall, 0);
    const averageRating = parseFloat((sum / reviews.length).toFixed(1));

    // Distribution
    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let positiveCount = 0;
    let commSum = 0, commCount = 0;
    let relSum = 0, relCount = 0;
    let descSum = 0, descCount = 0;
    let friendSum = 0, friendCount = 0;

    const formattedReviews = reviews.map((r) => {
      distribution[r.ratingOverall] = (distribution[r.ratingOverall] || 0) + 1;
      if (r.ratingOverall >= 4) positiveCount++;

      if (r.ratingCommunication) { commSum += r.ratingCommunication; commCount++; }
      if (r.ratingReliability) { relSum += r.ratingReliability; relCount++; }
      if (r.ratingDescription) { descSum += r.ratingDescription; descCount++; }
      if (r.ratingFriendliness) { friendSum += r.ratingFriendliness; friendCount++; }

      let parsedComment = r.comment || '';
      let tags: string[] = [];
      let sellerReply: string | null = null;
      let sellerReplyAt: string | null = null;
      let helpfulCount = 0;

      try {
        if (parsedComment.startsWith('{') && parsedComment.endsWith('}')) {
          const parsed = JSON.parse(parsedComment);
          parsedComment = parsed.text || '';
          tags = parsed.tags || [];
          sellerReply = parsed.sellerReply || null;
          sellerReplyAt = parsed.sellerReplyAt || null;
          helpfulCount = parsed.helpfulCount || 0;
        }
      } catch {}

      return {
        ...r,
        comment: parsedComment,
        tags,
        sellerReply,
        sellerReplyAt,
        helpfulCount,
      };
    });

    const recommendationRate = Math.round((positiveCount / reviews.length) * 100);

    const subRatings = {
      communication: commCount > 0 ? parseFloat((commSum / commCount).toFixed(1)) : averageRating,
      reliability: relCount > 0 ? parseFloat((relSum / relCount).toFixed(1)) : averageRating,
      friendliness: friendCount > 0 ? parseFloat((friendSum / friendCount).toFixed(1)) : averageRating,
      description: descCount > 0 ? parseFloat((descSum / descCount).toFixed(1)) : averageRating,
    };

    const badges = {
      isTopRated: averageRating >= 4.7 && reviews.length >= 2,
      isReliable: subRatings.reliability >= 4.5,
      isFastResponder: subRatings.communication >= 4.5,
    };

    const finalReviews = withCommentOnly 
      ? formattedReviews.filter(r => Boolean(r.comment && r.comment.trim()))
      : formattedReviews;

    return NextResponse.json({
      averageRating,
      reviewCount: reviews.length,
      recommendationRate,
      ratingDistribution: distribution,
      subRatings,
      badges,
      reviews: finalReviews,
    });
  } catch (error: any) {
    console.error('Review fetch error:', error);
    return NextResponse.json({ error: 'Fehler beim Laden der Bewertungen' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const ip = getClientIp(req);
    const rl = checkRateLimit(`review_${user!.id}_${ip}`, 15, 600);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds);

    const body = await req.json();
    let {
      transactionId,
      targetId,
      ratingOverall,
      ratingCommunication,
      ratingReliability,
      ratingDescription,
      ratingFriendliness,
      comment,
      tags,
    } = body;

    if (!ratingOverall || ratingOverall < 1 || ratingOverall > 5) {
      return NextResponse.json(
        { error: 'Gültige Gesamtnote zwischen 1 und 5 Sternen erforderlich.' },
        { status: 400 }
      );
    }

    // If transactionId is not supplied but targetId is, find or create transaction
    if (!transactionId && targetId) {
      if (targetId === user!.id) {
        return NextResponse.json({ error: 'Du kannst dich nicht selbst bewerten.' }, { status: 400 });
      }

      // Find an existing completed or create transaction
      let existingTx = await prisma.transaction.findFirst({
        where: {
          OR: [
            { buyerId: user!.id, sellerId: targetId },
            { buyerId: targetId, sellerId: user!.id },
          ],
        },
      });

      if (!existingTx) {
        // Find a listing of the target user
        const sellerListing = await prisma.listing.findFirst({
          where: { userId: targetId },
        });

        if (sellerListing) {
          existingTx = await prisma.transaction.create({
            data: {
              listingId: sellerListing.id,
              buyerId: user!.id,
              sellerId: targetId,
              agreedPrice: sellerListing.price,
              status: 'COMPLETED',
              buyerConfirmed: true,
              sellerConfirmed: true,
              completedAt: new Date(),
            },
          });
        }
      }

      if (existingTx) {
        transactionId = existingTx.id;
      }
    }

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaktions-ID oder gültiger Verkäufer erforderlich.' },
        { status: 400 }
      );
    }

    const tx = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!tx) {
      return NextResponse.json({ error: 'Transaktion nicht gefunden.' }, { status: 404 });
    }

    // Determine target and role
    const isBuyer = tx.buyerId === user!.id;
    const isSeller = tx.sellerId === user!.id;

    if (!isBuyer && !isSeller) {
      return NextResponse.json({ error: 'Zugriff verweigert. Du warst an dieser Transaktion nicht beteiligt.' }, { status: 403 });
    }

    const resolvedTargetId = isBuyer ? tx.sellerId : tx.buyerId;
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

    // Sanitize comment & format with tags
    const sanitizedText = comment
      ? comment.trim().substring(0, 1000).replace(/</g, '&lt;').replace(/>/g, '&gt;')
      : '';

    const payloadObj = {
      text: sanitizedText,
      tags: Array.isArray(tags) ? tags.slice(0, 5) : [],
      sellerReply: null,
      helpfulCount: 0,
    };

    const finalCommentString = JSON.stringify(payloadObj);

    const review = await prisma.review.create({
      data: {
        transactionId,
        authorId: user!.id,
        targetId: resolvedTargetId,
        role,
        ratingOverall: Math.round(ratingOverall),
        ratingCommunication: ratingCommunication ? Math.round(ratingCommunication) : Math.round(ratingOverall),
        ratingReliability: ratingReliability ? Math.round(ratingReliability) : Math.round(ratingOverall),
        ratingDescription: ratingDescription ? Math.round(ratingDescription) : Math.round(ratingOverall),
        ratingFriendliness: ratingFriendliness ? Math.round(ratingFriendliness) : Math.round(ratingOverall),
        comment: finalCommentString,
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Notify target user
    try {
      await prisma.notification.create({
        data: {
          userId: resolvedTargetId,
          title: '⭐ Neue Bewertung erhalten!',
          message: `${user!.name} hat dir eine ${ratingOverall}-Sterne-Bewertung gegeben.`,
          link: `/seller/${resolvedTargetId}`,
          type: 'REVIEW',
        },
      });
    } catch {}

    return NextResponse.json({
      ...review,
      comment: sanitizedText,
      tags: payloadObj.tags,
      sellerReply: null,
      helpfulCount: 0,
    });
  } catch (error: any) {
    console.error('Review creation error:', error);
    return NextResponse.json({ error: 'Fehler beim Erstellen der Bewertung' }, { status: 500 });
  }
}
