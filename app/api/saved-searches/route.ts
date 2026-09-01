import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit, rateLimitResponse, getClientIp } from '@/lib/rateLimit';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const searches = await prisma.savedSearch.findMany({
      where: { userId: user!.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(searches);
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Laden der Suchaufträge' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const ip = getClientIp(req);
    const rl = checkRateLimit(`saved_search_${user!.id}_${ip}`, 20, 600);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds);

    const body = await req.json();
    const {
      name,
      query,
      categorySlug,
      subcategory,
      minPrice,
      maxPrice,
      priceType,
      condition,
      locationCity,
      locationPlz,
      radiusKm,
      sellerType,
      deliveryOnly,
      alertsEnabled,
      alertFrequency,
    } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Bitte gib einen Namen für deinen Suchauftrag ein.' }, { status: 400 });
    }

    // Check duplicate saved search
    const existing = await prisma.savedSearch.findFirst({
      where: {
        userId: user!.id,
        name: name.trim(),
        query: query ? query.trim() : null,
        categorySlug: categorySlug || null,
      },
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId: user!.id,
        name: name.trim().substring(0, 100),
        query: query ? query.trim() : null,
        categorySlug: categorySlug || null,
        subcategory: subcategory || null,
        minPrice: minPrice !== undefined && minPrice !== null ? parseFloat(minPrice.toString()) : null,
        maxPrice: maxPrice !== undefined && maxPrice !== null ? parseFloat(maxPrice.toString()) : null,
        priceType: priceType || null,
        condition: condition || null,
        locationCity: locationCity ? locationCity.trim() : null,
        locationPlz: locationPlz ? locationPlz.trim() : null,
        radiusKm: radiusKm ? parseInt(radiusKm.toString(), 10) : 10,
        sellerType: sellerType || 'all',
        deliveryOnly: !!deliveryOnly,
        alertsEnabled: alertsEnabled !== undefined ? !!alertsEnabled : true,
        alertFrequency: alertFrequency || 'IMMEDIATE',
      },
    });

    return NextResponse.json(savedSearch);
  } catch (error: any) {
    console.error('Create saved search error:', error);
    return NextResponse.json({ error: 'Fehler beim Erstellen des Suchauftrags' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { id, name, alertsEnabled, alertFrequency } = body;

    if (!id) {
      return NextResponse.json({ error: 'Suchauftrags-ID erforderlich' }, { status: 400 });
    }

    const existing = await prisma.savedSearch.findUnique({ where: { id } });
    if (!existing || existing.userId !== user!.id) {
      return NextResponse.json({ error: 'Suchauftrag nicht gefunden oder keine Berechtigung.' }, { status: 403 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim().substring(0, 100);
    if (alertsEnabled !== undefined) updateData.alertsEnabled = !!alertsEnabled;
    if (alertFrequency !== undefined) updateData.alertFrequency = alertFrequency;

    const updated = await prisma.savedSearch.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Aktualisieren des Suchauftrags' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Suchauftrags-ID erforderlich' }, { status: 400 });
    }

    const existing = await prisma.savedSearch.findUnique({ where: { id } });
    if (!existing || existing.userId !== user!.id) {
      return NextResponse.json({ error: 'Suchauftrag nicht gefunden oder keine Berechtigung.' }, { status: 403 });
    }

    await prisma.savedSearch.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Suchauftrag gelöscht.' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Löschen des Suchauftrags' }, { status: 500 });
  }
}
