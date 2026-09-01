import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit, rateLimitResponse, getClientIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const ip = getClientIp(req);
    const rl = checkRateLimit(`report_${user!.id}_${ip}`, 10, 600);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds);

    const body = await req.json();
    const { targetType, targetId, reportedUserId, reason, description } = body;

    if (!targetType || !targetId || !reason || !description) {
      return NextResponse.json({ error: 'Bitte fülle alle Pflichtfelder aus.' }, { status: 400 });
    }

    if (targetId.startsWith('demo-') || (reportedUserId && reportedUserId.startsWith('seller-'))) {
      return NextResponse.json({
        message: 'Vielen Dank. Deine Meldung wird geprüft.',
        isDemo: true,
      });
    }

    // Check duplicate pending report
    const existing = await prisma.report.findFirst({
      where: {
        reporterId: user!.id,
        targetType,
        targetId,
        status: { in: ['PENDING', 'UNDER_REVIEW'] },
      },
    });

    if (existing) {
      return NextResponse.json({
        message: 'Vielen Dank. Deine Meldung wird geprüft.',
        duplicate: true,
      });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: user!.id,
        targetType,
        targetId,
        reportedUserId: reportedUserId || null,
        reason: reason.substring(0, 100),
        description: description.trim().substring(0, 2000),
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      message: 'Vielen Dank. Deine Meldung wird geprüft.',
      id: report.id,
    });
  } catch (error: any) {
    console.error('Report submission error:', error);
    return NextResponse.json({ error: 'Fehler beim Senden der Meldung' }, { status: 500 });
  }
}
