import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { IS_DEMO_MODE_ENABLED } from '@/lib/config';
import { DEMO_SELLERS, DEMO_LISTINGS } from '@/lib/demoListings';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const sellerId = params.id;

    // 1. Check if demo seller profile requested
    if (sellerId.startsWith('seller-')) {
      if (IS_DEMO_MODE_ENABLED) {
        const demoSeller = Object.values(DEMO_SELLERS).find((s) => s.id === sellerId);
        if (demoSeller) {
          const sellerListings = DEMO_LISTINGS.filter((l) => l.seller?.id === sellerId);
          return NextResponse.json({
            seller: demoSeller,
            activeCount: sellerListings.length,
            listings: sellerListings,
          });
        }
      }
      return NextResponse.json({ error: 'Verkäufer nicht gefunden' }, { status: 404 });
    }

    // 2. Query real database seller profile
    const user = await prisma.user.findUnique({
      where: { id: sellerId },
      select: {
        id: true,
        name: true,
        accountType: true,
        city: true,
        plz: true,
        avatar: true,
        bio: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Verkäufer nicht gefunden' }, { status: 404 });
    }

    const activeListings = await prisma.listing.findMany({
      where: {
        userId: sellerId,
        status: 'ACTIVE',
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedListings = activeListings.map((item) => ({
      id: item.id,
      isDemo: false,
      title: item.title,
      categorySlug: item.categorySlug,
      categoryNameDe: item.categoryNameDe,
      categoryNameEn: item.categoryNameEn,
      price: item.price,
      priceType: item.priceType,
      locationCity: item.locationCity,
      locationPlz: item.locationPlz,
      distanceKm: item.distanceKm,
      postedDate: item.postedDate,
      condition: item.condition,
      status: item.status,
      descriptionDe: item.descriptionDe,
      descriptionEn: item.descriptionEn,
      images: JSON.parse(item.images || '[]'),
      hasVideo: item.hasVideo,
    }));

    return NextResponse.json({
      seller: {
        id: user.id,
        name: user.name,
        accountType: user.accountType || 'Privat',
        city: user.city || 'Berlin',
        plz: user.plz || '10115',
        avatar: user.avatar,
        bio: user.bio,
        emailVerified: user.emailVerified,
        memberSince: `${new Date(user.createdAt).getFullYear()}`,
        // Truthful: No artificial trust scores or fake identity verification
      },
      activeCount: formattedListings.length,
      listings: formattedListings,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Laden des Verkäuferprofils' }, { status: 500 });
  }
}
