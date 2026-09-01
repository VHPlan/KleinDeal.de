import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit, rateLimitResponse, getClientIp } from '@/lib/rateLimit';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const favorites = await prisma.favorite.findMany({
      where: { userId: user!.id },
      include: {
        listing: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = favorites.map((fav) => ({
      id: fav.listing.id,
      isDemo: false,
      title: fav.listing.title,
      categorySlug: fav.listing.categorySlug,
      categoryNameDe: fav.listing.categoryNameDe,
      categoryNameEn: fav.listing.categoryNameEn,
      price: fav.listing.price,
      priceType: fav.listing.priceType,
      locationCity: fav.listing.locationCity,
      locationPlz: fav.listing.locationPlz,
      distanceKm: fav.listing.distanceKm,
      postedDate: fav.listing.postedDate,
      condition: fav.listing.condition,
      status: fav.listing.status,
      descriptionDe: fav.listing.descriptionDe,
      descriptionEn: fav.listing.descriptionEn,
      images: JSON.parse(fav.listing.images || '[]'),
      hasVideo: fav.listing.hasVideo,
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Laden der Favoriten' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const ip = getClientIp(req);
    const rl = checkRateLimit(`fav_${user!.id}_${ip}`, 60, 300); // 60 per 5 min
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfterSeconds);
    }

    const { listingId } = await req.json();

    if (!listingId) {
      return NextResponse.json({ error: 'Anzeigen-ID ist erforderlich' }, { status: 400 });
    }

    // Demo listings do not create DB records
    if (listingId.startsWith('demo-')) {
      return NextResponse.json({ success: true, isDemo: true });
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      return NextResponse.json({ error: 'Anzeige nicht gefunden' }, { status: 404 });
    }

    // Prevent favoriting own listing
    if (listing.userId === user!.id) {
      return NextResponse.json(
        { error: 'Du kannst deine eigene Anzeige nicht zu den Favoriten hinzufügen.' },
        { status: 400 }
      );
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_listingId: { userId: user!.id, listingId },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ favorited: false });
    } else {
      await prisma.favorite.create({
        data: { userId: user!.id, listingId },
      });
      return NextResponse.json({ favorited: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Verwalten der Favoriten' }, { status: 500 });
  }
}
