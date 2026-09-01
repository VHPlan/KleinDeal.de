import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit, rateLimitResponse, getClientIp } from '@/lib/rateLimit';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const isStaff = user!.role === 'ADMIN' || user!.role === 'MODERATOR';

    const appeals = await prisma.moderationAppeal.findMany({
      where: isStaff ? undefined : { userId: user!.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(appeals);
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Laden der Einsprüche' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const ip = getClientIp(req);
    const rl = checkRateLimit(`appeal_${user!.id}_${ip}`, 5, 600);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds);

    const body = await req.json();
    const { targetType, targetId, reason } = body;

    if (!targetType || !targetId || !reason) {
      return NextResponse.json({ error: 'Bitte gib eine Begründung für deinen Einspruch an.' }, { status: 400 });
    }

    const appeal = await prisma.moderationAppeal.create({
      data: {
        userId: user!.id,
        targetType,
        targetId,
        reason: reason.trim().substring(0, 2000),
        status: 'SUBMITTED',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Dein Einspruch wurde erfolgreich übermittelt und wird vom Team geprüft.',
      appeal,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Senden des Einspruchs' }, { status: 500 });
  }
}
