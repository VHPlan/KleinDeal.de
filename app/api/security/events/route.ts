import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const events = await prisma.securityEvent.findMany({
      where: { userId: user!.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json(events);
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Laden der Sicherheitsereignisse' }, { status: 500 });
  }
}
