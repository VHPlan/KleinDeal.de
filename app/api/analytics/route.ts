import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get('listingId');

    // 1. Specific listing analytics
    if (listingId) {
      if (listingId.startsWith('demo-')) {
        return NextResponse.json({
          views7d: 142,
          views30d: 580,
          viewsTotal: 1240,
          favoritesCount: 18,
          inquiriesCount: 6,
          offersCount: 3,
          visibilityRating: 'Sehr gute Sichtbarkeit',
          isDemo: true,
        });
      }

      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        include: {
          _count: {
            select: {
              favorites: true,
              conversations: true,
              offers: true,
              views: true,
            },
          },
        },
      });

      if (!listing || listing.userId !== user!.id) {
        return NextResponse.json({ error: 'Anzeige nicht gefunden oder keine Berechtigung.' }, { status: 403 });
      }

      const now = new Date();
      const date7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const date30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const views7d = await prisma.listingView.count({
        where: { listingId, createdAt: { gte: date7d } },
      });

      const views30d = await prisma.listingView.count({
        where: { listingId, createdAt: { gte: date30d } },
      });

      const totalViews = listing._count.views;

      let visibilityRating = 'Geringe Sichtbarkeit';
      if (views7d > 50 || totalViews > 200) {
        visibilityRating = 'Sehr gute Sichtbarkeit';
      } else if (views7d > 15 || totalViews > 50) {
        visibilityRating = 'Durchschnittliche Sichtbarkeit';
      }

      return NextResponse.json({
        views7d,
        views30d,
        viewsTotal: totalViews,
        favoritesCount: listing._count.favorites,
        inquiriesCount: listing._count.conversations,
        offersCount: listing._count.offers,
        visibilityRating,
      });
    }

    // 2. Global seller account analytics
    const userListings = await prisma.listing.findMany({
      where: { userId: user!.id },
      select: { id: true },
    });

    const listingIds = userListings.map((l) => l.id);

    const totalListings = listingIds.length;
    const totalFavorites = await prisma.favorite.count({
      where: { listingId: { in: listingIds } },
    });
    const totalInquiries = await prisma.conversation.count({
      where: { sellerId: user!.id },
    });
    const totalOffers = await prisma.offer.count({
      where: { sellerId: user!.id },
    });
    const totalViews = await prisma.listingView.count({
      where: { listingId: { in: listingIds } },
    });

    return NextResponse.json({
      totalListings,
      totalViews,
      totalFavorites,
      totalInquiries,
      totalOffers,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Laden der Statistiken' }, { status: 500 });
  }
}
