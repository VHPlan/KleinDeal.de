import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const sessions = await prisma.userSession.findMany({
      where: { userId: user!.id, isRevoked: false },
      orderBy: { lastActiveAt: 'desc' },
    });

    return NextResponse.json(sessions);
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Laden der Sitzungen' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const revokeAllOthers = searchParams.get('allOthers') === 'true';

    if (revokeAllOthers) {
      await prisma.userSession.updateMany({
        where: { userId: user!.id },
        data: { isRevoked: true },
      });

      await prisma.securityEvent.create({
        data: {
          userId: user!.id,
          eventType: 'ALL_SESSIONS_REVOKED',
          details: 'Alle anderen aktiven Sitzungen wurden widerrufen.',
        },
      });

      return NextResponse.json({ success: true, message: 'Alle anderen Sitzungen wurden erfolgreich abgemeldet.' });
    }

    if (sessionId) {
      await prisma.userSession.update({
        where: { id: sessionId },
        data: { isRevoked: true },
      });

      return NextResponse.json({ success: true, message: 'Sitzung erfolgreich beendet.' });
    }

    return NextResponse.json({ error: 'Aktion nicht angegeben' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Widerrufen der Sitzung' }, { status: 500 });
  }
}
