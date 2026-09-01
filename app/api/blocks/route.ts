import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit, rateLimitResponse, getClientIp } from '@/lib/rateLimit';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const blocked = await prisma.block.findMany({
      where: { blockerId: user!.id },
      include: {
        blocked: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(blocked.map((b) => b.blocked));
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Laden blockierter Nutzer' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const ip = getClientIp(req);
    const rl = checkRateLimit(`block_${user!.id}_${ip}`, 20, 600);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds);

    const body = await req.json();
    const { blockedId } = body;

    if (!blockedId) {
      return NextResponse.json({ error: 'Nutzer-ID erforderlich' }, { status: 400 });
    }

    if (blockedId === user!.id) {
      return NextResponse.json({ error: 'Du kannst dich nicht selbst blockieren.' }, { status: 400 });
    }

    const existing = await prisma.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: user!.id,
          blockedId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ blocked: true, message: 'Nutzer ist bereits blockiert.' });
    }

    await prisma.block.create({
      data: {
        blockerId: user!.id,
        blockedId,
      },
    });

    return NextResponse.json({ blocked: true, message: 'Nutzer erfolgreich blockiert.' });
  } catch (error: any) {
    console.error('Block user error:', error);
    return NextResponse.json({ error: 'Fehler beim Blockieren des Nutzers' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const blockedId = searchParams.get('blockedId');

    if (!blockedId) {
      return NextResponse.json({ error: 'Nutzer-ID erforderlich' }, { status: 400 });
    }

    const existing = await prisma.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: user!.id,
          blockedId,
        },
      },
    });

    if (existing) {
      await prisma.block.delete({ where: { id: existing.id } });
    }

    return NextResponse.json({ success: true, message: 'Blockierung aufgehoben.' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Entsperren des Nutzers' }, { status: 500 });
  }
}
