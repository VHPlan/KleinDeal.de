import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const notifications = await prisma.notification.findMany({
      where: { userId: user!.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json(notifications);
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Laden der Benachrichtigungen' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const { id } = await req.json();

    if (id) {
      await prisma.notification.updateMany({
        where: { id, userId: user!.id },
        data: { isRead: true },
      });
    } else {
      // Mark all as read
      await prisma.notification.updateMany({
        where: { userId: user!.id, isRead: false },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Aktualisieren der Benachrichtigungen' }, { status: 500 });
  }
}
