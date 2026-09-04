import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    if (user!.role !== 'ADMIN' && user!.role !== 'MODERATOR') {
      return NextResponse.json(
        { error: 'Zugriff verweigert. Administrator-Rechte erforderlich.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase().trim();
    const roleFilter = searchParams.get('role');
    const statusFilter = searchParams.get('status');

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { city: { contains: search } },
        { plz: { contains: search } },
      ];
    }

    if (roleFilter && roleFilter !== 'ALL') {
      where.role = roleFilter;
    }

    if (statusFilter && statusFilter !== 'ALL') {
      where.status = statusFilter;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        accountType: true,
        city: true,
        plz: true,
        phone: true,
        avatar: true,
        emailVerified: true,
        twoFactorEnabled: true,
        createdAt: true,
        _count: {
          select: {
            listings: true,
            sentMessages: true,
            reportsReceived: true,
            reviewsReceived: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Admin users GET error:', error);
    return NextResponse.json({ error: 'Fehler beim Abrufen der Benutzerliste' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    if (user!.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Zugriff verweigert. Nur Haupt-Administratoren können Benutzerrechte und Status ändern.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, role, status, emailVerified } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Benutzer-ID erforderlich' }, { status: 400 });
    }

    // Protect self from losing admin rights accidentally
    if (userId === user!.id && role && role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Du kannst dir deine eigenen Administrator-Rechte nicht selbst entziehen.' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (role && ['USER', 'MODERATOR', 'ADMIN'].includes(role)) {
      updateData.role = role;
    }
    if (status && ['ACTIVE', 'SUSPENDED', 'BANNED'].includes(status)) {
      updateData.status = status;
    }
    if (emailVerified !== undefined) {
      updateData.emailVerified = Boolean(emailVerified);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Benutzer ${updated.name} erfolgreich aktualisiert.`,
      user: updated,
    });
  } catch (error: any) {
    console.error('Admin users PATCH error:', error);
    return NextResponse.json({ error: 'Fehler beim Aktualisieren des Benutzers' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    if (user!.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Zugriff verweigert. Nur Administratoren dürfen Konten löschen.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('userId');

    if (!targetUserId) {
      return NextResponse.json({ error: 'Benutzer-ID fehlt' }, { status: 400 });
    }

    if (targetUserId === user!.id) {
      return NextResponse.json(
        { error: 'Du kannst dein eigenes Administratorkonto nicht hierüber löschen.' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: targetUserId },
    });

    return NextResponse.json({
      success: true,
      message: 'Benutzerkonto und alle zugehörigen Daten wurden erfolgreich gelöscht.',
    });
  } catch (error: any) {
    console.error('Admin users DELETE error:', error);
    return NextResponse.json({ error: 'Fehler beim Löschen des Benutzers' }, { status: 500 });
  }
}
