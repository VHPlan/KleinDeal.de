import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { IS_DEMO_MODE_ENABLED } from '@/lib/config';
import { DEMO_LISTINGS } from '@/lib/demoListings';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit, rateLimitResponse, getClientIp } from '@/lib/rateLimit';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.toLowerCase().trim();
    const location = searchParams.get('location')?.toLowerCase().trim();
    const videoOnly = searchParams.get('videoOnly') === 'true';
    const subcategory = searchParams.get('subcategory');
    const condition = searchParams.get('condition');
    const sortBy = searchParams.get('sortBy');

    // 1. Check real database listings - ONLY ACTIVE listings are exposed to public search
    const where: any = {
      status: 'ACTIVE',
    };

    if (category) where.categorySlug = category;
    if (subcategory) where.subcategory = subcategory;
    if (videoOnly) where.hasVideo = true;
    if (condition && condition !== 'all') where.condition = condition;

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { descriptionDe: { contains: search } },
        { descriptionEn: { contains: search } },
      ];
    }

    if (location) {
      where.OR = [
        { locationCity: { contains: location } },
        { locationPlz: { contains: location } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'priceAsc') orderBy = { price: 'asc' };
    if (sortBy === 'priceDesc') orderBy = { price: 'desc' };

    let realListings: any[] = [];
    try {
      realListings = await prisma.listing.findMany({
        where,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              accountType: true,
              emailVerified: true,
              createdAt: true,
              // Strictly exclude email and phone from public search listings
            },
          },
        },
      });
    } catch (dbErr: any) {
      console.warn('Database listing query notice:', dbErr?.message || dbErr);
    }

    // Real listings always take priority if present
    if (realListings && realListings.length > 0) {
      const formattedListings = realListings.map((item) => ({
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
        videoUrl: item.videoUrl || undefined,
        seller: {
          id: item.user.id,
          name: item.user.name,
          accountType: item.user.accountType || 'Privat',
          emailVerified: item.user.emailVerified,
          memberSince: `${new Date(item.user.createdAt).getFullYear()}`,
        },
      }));
      return NextResponse.json(formattedListings);
    }

    // 2. Serve in-memory demo listings ONLY if DB has no active listings and Demo Mode is strictly true
    if (IS_DEMO_MODE_ENABLED) {
      let filtered = [...DEMO_LISTINGS];

      if (category) {
        filtered = filtered.filter((item) => item.categorySlug === category);
      }

      if (videoOnly) {
        filtered = filtered.filter((item) => item.hasVideo);
      }

      if (condition && condition !== 'all') {
        filtered = filtered.filter((item) => item.condition === condition);
      }

      if (search) {
        filtered = filtered.filter(
          (item) =>
            item.title.toLowerCase().includes(search) ||
            item.descriptionDe.toLowerCase().includes(search) ||
            item.descriptionEn.toLowerCase().includes(search)
        );
      }

      if (location) {
        filtered = filtered.filter(
          (item) =>
            item.locationCity.toLowerCase().includes(location) ||
            item.locationPlz.toLowerCase().includes(location)
        );
      }

      // Numerical price sorting
      if (sortBy === 'priceAsc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'priceDesc') {
        filtered.sort((a, b) => b.price - a.price);
      }

      return NextResponse.json(filtered);
    }

    return NextResponse.json([]);
  } catch (error: any) {
    console.error('Fetch listings error:', error);
    return NextResponse.json({ error: 'Fehler beim Laden der Anzeigen' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Enforce authentication from verified session
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    // 2. Rate limit listing creation
    const ip = getClientIp(req);
    const rl = checkRateLimit(`create_listing_${user!.id}_${ip}`, 10, 600); // 10 per 10 min
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfterSeconds);
    }

    const body = await req.json();
    const {
      title,
      categorySlug,
      categoryNameDe,
      categoryNameEn,
      subcategory,
      price,
      priceType,
      locationCity,
      locationPlz,
      condition,
      deliveryOptions,
      status,
      descriptionDe,
      descriptionEn,
      images,
      hasVideo,
      videoUrl,
    } = body;

    if (!title || price === undefined || !locationCity || !locationPlz) {
      return NextResponse.json({ error: 'Alle Pflichtfelder müssen ausgefüllt werden.' }, { status: 400 });
    }

    const allowedStatuses = ['ACTIVE', 'DRAFT', 'RESERVED', 'SOLD', 'DEACTIVATED'];
    const listingStatus = allowedStatuses.includes(status) ? status : 'ACTIVE';

    const newListing = await prisma.listing.create({
      data: {
        userId: user!.id, // Owner strictly bound to authenticated session user
        title: title.toString().trim().substring(0, 150),
        categorySlug: categorySlug || 'elektronik',
        categoryNameDe: categoryNameDe || 'Tech & Elektronik',
        categoryNameEn: categoryNameEn || 'Tech & Electronics',
        subcategory: subcategory || null,
        price: parseFloat(price.toString()) || 0,
        priceType: priceType || 'negotiable',
        locationCity: locationCity.toString().trim(),
        locationPlz: locationPlz.toString().trim(),
        condition: condition || 'Wie neu',
        deliveryOptions: deliveryOptions || null,
        status: listingStatus,
        descriptionDe: descriptionDe || title,
        descriptionEn: descriptionEn || title,
        images: JSON.stringify(Array.isArray(images) ? images.slice(0, 10) : []),
        hasVideo: !!hasVideo,
        videoUrl: videoUrl || null,
        postedDate: 'Heute',
      },
    });

    return NextResponse.json(newListing);
  } catch (error: any) {
    console.error('Create listing error:', error);
    return NextResponse.json({ error: 'Fehler beim Erstellen der Anzeige' }, { status: 500 });
  }
}
