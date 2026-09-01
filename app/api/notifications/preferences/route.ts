import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    let prefs = await prisma.notificationPreference.findUnique({
      where: { userId: user!.id },
    });

    if (!prefs) {
      prefs = await prisma.notificationPreference.create({
        data: { userId: user!.id },
      });
    }

    return NextResponse.json(prefs);
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Laden der Einstellungen' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();

    const prefs = await prisma.notificationPreference.upsert({
      where: { userId: user!.id },
      create: {
        userId: user!.id,
        ...body,
      },
      update: {
        ...body,
      },
    });

    return NextResponse.json(prefs);
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Speichern der Einstellungen' }, { status: 500 });
  }
}
