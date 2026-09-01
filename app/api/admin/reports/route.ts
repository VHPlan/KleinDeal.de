import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    if (user!.role !== 'ADMIN' && user!.role !== 'MODERATOR') {
      return NextResponse.json({ error: 'Zugriff verweigert. Administrator- oder Moderationsrechte erforderlich.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'PENDING';

    const reports = await prisma.report.findMany({
      where: status === 'ALL' ? undefined : { status },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        reportedUser: { select: { id: true, name: true, email: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(reports);
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Laden der Moderationsmeldungen' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    if (user!.role !== 'ADMIN' && user!.role !== 'MODERATOR') {
      return NextResponse.json({ error: 'Zugriff verweigert.' }, { status: 403 });
    }

    const body = await req.json();
    const { reportId, status, moderationNote } = body;

    if (!reportId || !status) {
      return NextResponse.json({ error: 'Meldungs-ID und Status erforderlich' }, { status: 400 });
    }

    const updated = await prisma.report.update({
      where: { id: reportId },
      data: {
        status,
        moderationNote: moderationNote || null,
        resolvedAt: new Date(),
        resolvedById: user!.id,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Bearbeiten der Meldung' }, { status: 500 });
  }
}
