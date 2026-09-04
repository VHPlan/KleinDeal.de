import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, requireAuth } from '@/lib/auth';
import { getClientIp } from '@/lib/rateLimit';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const listingId = params.id;
    const item = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            accountType: true,
            city: true,
            plz: true,
            emailVerified: true,
            createdAt: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Anzeige nicht gefunden' }, { status: 404 });
    }

    // Check draft privacy: DRAFT listings are only accessible by the owner
    const currentUser = await getSessionUser(req);
    if (item.status === 'DRAFT' && (!currentUser || currentUser.id !== item.userId)) {
      return NextResponse.json({ error: 'Anzeige nicht gefunden' }, { status: 404 });
    }

    // Record unique listing view (deduplicate within 30 min per IP/client, ignore owner views)
    try {
      const isOwner = currentUser && currentUser.id === item.userId;
      if (!isOwner) {
        const ip = getClientIp(req);
        const ipHash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

        const recentView = await prisma.listingView.findFirst({
          where: {
            listingId: item.id,
            viewerIpHash: ipHash,
            createdAt: { gte: thirtyMinutesAgo },
          },
        });

        if (!recentView) {
          await prisma.listingView.create({
            data: {
              listingId: item.id,
              viewerIpHash: ipHash,
            },
          });
        }
      }
    } catch (_) {}

    const [viewsTotal, favoritesTotal] = await Promise.all([
      prisma.listingView.count({ where: { listingId: item.id } }),
      prisma.favorite.count({ where: { listingId: item.id } }),
    ]);

    return NextResponse.json({
      id: item.id,
      isDemo: false,
      title: item.title,
      categorySlug: item.categorySlug,
      categoryNameDe: item.categoryNameDe,
      categoryNameEn: item.categoryNameEn,
      subcategory: item.subcategory,
      price: item.price,
      priceType: item.priceType,
      locationCity: item.locationCity,
      locationPlz: item.locationPlz,
      distanceKm: item.distanceKm,
      postedDate: item.postedDate,
      condition: item.condition,
      status: item.status,
      deliveryOptions: item.deliveryOptions,
      descriptionDe: item.descriptionDe,
      descriptionEn: item.descriptionEn,
      images: JSON.parse(item.images || '[]'),
      hasVideo: item.hasVideo,
      views: viewsTotal,
      viewsCount: viewsTotal,
      favoritesCount: favoritesTotal,
      seller: {
        id: item.user.id,
        name: item.user.name,
        accountType: item.user.accountType || 'Privat',
        emailVerified: item.user.emailVerified,
        memberSince: `${new Date(item.user.createdAt).getFullYear()}`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Laden der Anzeige' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const listingId = params.id;

    // Block mutation of demo listings
    if (listingId.startsWith('demo-')) {
      return NextResponse.json(
        { error: 'Diese Funktion ist für Beispielanzeigen deaktiviert.' },
        { status: 400 }
      );
    }

    // Require authenticated user
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const existing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Anzeige nicht gefunden' }, { status: 404 });
    }

    // Strict ownership enforcement
    if (existing.userId !== user!.id) {
      return NextResponse.json(
        { error: 'Zugriff verweigert. Du bist nicht der Eigentümer dieser Anzeige.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updateData: any = {};

    if (body.title !== undefined) updateData.title = body.title.toString().trim().substring(0, 150);
    if (body.price !== undefined) updateData.price = parseFloat(body.price.toString()) || 0;
    if (body.priceType !== undefined) updateData.priceType = body.priceType;
    if (body.condition !== undefined) updateData.condition = body.condition;
    if (body.descriptionDe !== undefined) updateData.descriptionDe = body.descriptionDe;
    if (body.descriptionEn !== undefined) updateData.descriptionEn = body.descriptionEn;
    if (body.deliveryOptions !== undefined) updateData.deliveryOptions = body.deliveryOptions;
    if (body.images !== undefined) updateData.images = JSON.stringify(Array.isArray(body.images) ? body.images : []);

    // Allowed status transitions
    const allowedStatuses = ['ACTIVE', 'DRAFT', 'RESERVED', 'SOLD', 'DEACTIVATED', 'REMOVED'];
    if (body.status && allowedStatuses.includes(body.status)) {
      updateData.status = body.status;
    }

    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Update listing error:', error);
    return NextResponse.json({ error: 'Fehler beim Bearbeiten der Anzeige' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const listingId = params.id;

    // Block deletion of demo listings
    if (listingId.startsWith('demo-')) {
      return NextResponse.json(
        { error: 'Diese Funktion ist für Beispielanzeigen deaktiviert.' },
        { status: 400 }
      );
    }

    // Require authenticated user
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const existing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Anzeige nicht gefunden' }, { status: 404 });
    }

    // Strict ownership enforcement
    if (existing.userId !== user!.id) {
      return NextResponse.json(
        { error: 'Zugriff verweigert. Du bist nicht der Eigentümer dieser Anzeige.' },
        { status: 403 }
      );
    }

    await prisma.listing.delete({
      where: { id: listingId },
    });

    return NextResponse.json({ success: true, message: 'Anzeige erfolgreich gelöscht.' });
  } catch (error: any) {
    console.error('Delete listing error:', error);
    return NextResponse.json({ error: 'Fehler beim Löschen der Anzeige' }, { status: 500 });
  }
}
