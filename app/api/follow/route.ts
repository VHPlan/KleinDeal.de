import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit, rateLimitResponse, getClientIp } from '@/lib/rateLimit';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId');

    // If specific seller check
    if (sellerId) {
      if (sellerId.startsWith('seller-')) {
        return NextResponse.json({ following: false, isDemo: true });
      }

      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: user!.id,
            followingId: sellerId,
          },
        },
      });

      return NextResponse.json({ following: !!follow });
    }

    // List all followed sellers
    const following = await prisma.follow.findMany({
      where: { followerId: user!.id },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            avatar: true,
            city: true,
            plz: true,
            accountType: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(following.map((f) => f.following));
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Laden der gefolgten Nutzer' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const ip = getClientIp(req);
    const rl = checkRateLimit(`follow_${user!.id}_${ip}`, 30, 300);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds);

    const body = await req.json();
    const { sellerId } = body;

    if (!sellerId) {
      return NextResponse.json({ error: 'Verkäufer-ID erforderlich' }, { status: 400 });
    }

    if (sellerId.startsWith('seller-')) {
      return NextResponse.json({ following: true, isDemo: true });
    }

    if (sellerId === user!.id) {
      return NextResponse.json({ error: 'Du kannst dir nicht selbst folgen.' }, { status: 400 });
    }

    const seller = await prisma.user.findUnique({ where: { id: sellerId } });
    if (!seller) {
      return NextResponse.json({ error: 'Verkäufer nicht gefunden' }, { status: 404 });
    }

    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user!.id,
          followingId: sellerId,
        },
      },
    });

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      return NextResponse.json({ following: false });
    } else {
      await prisma.follow.create({
        data: {
          followerId: user!.id,
          followingId: sellerId,
        },
      });
      return NextResponse.json({ following: true });
    }
  } catch (error: any) {
    console.error('Follow error:', error);
    return NextResponse.json({ error: 'Fehler beim Folgen des Nutzers' }, { status: 500 });
  }
}
