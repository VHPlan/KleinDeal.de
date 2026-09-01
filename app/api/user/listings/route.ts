import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const listings = await prisma.listing.findMany({
      where: { userId: user!.id },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = listings.map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      priceType: item.priceType,
      locationCity: item.locationCity,
      locationPlz: item.locationPlz,
      condition: item.condition,
      status: item.status,
      images: JSON.parse(item.images || '[]'),
      hasVideo: item.hasVideo,
      postedDate: item.postedDate,
      createdAt: item.createdAt,
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Laden deiner Anzeigen' }, { status: 500 });
  }
}
