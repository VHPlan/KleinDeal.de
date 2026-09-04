import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { requireAuth, getClearSessionCookieHeader } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const profile = await prisma.user.findUnique({
      where: { id: user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        accountType: true,
        role: true,
        status: true,
        city: true,
        plz: true,
        phone: true,
        avatar: true,
        bio: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Laden des Profils' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { name, city, plz, phone, bio, avatar, accountType, currentPassword, newPassword } = body;

    const updateData: any = {};
    if (name) updateData.name = name.toString().trim();
    if (city) updateData.city = city.toString().trim();
    if (plz) updateData.plz = plz.toString().trim();
    if (phone !== undefined) updateData.phone = phone ? phone.toString().trim() : '';
    if (bio !== undefined) updateData.bio = bio ? bio.toString().trim() : '';
    if (avatar !== undefined) updateData.avatar = avatar;
    if (accountType && ['Privat', 'Gewerblich'].includes(accountType)) {
      updateData.accountType = accountType;
    }

    // Handle password change if requested
    if (currentPassword && newPassword) {
      if (newPassword.length < 10) {
        return NextResponse.json({ error: 'Das neue Passwort muss mindestens 10 Zeichen lang sein.' }, { status: 400 });
      }
      const isMatch = await bcrypt.compare(currentPassword, user!.password);
      if (!isMatch) {
        return NextResponse.json({ error: 'Das aktuelle Passwort ist nicht korrekt.' }, { status: 400 });
      }
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user!.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        accountType: true,
        role: true,
        status: true,
        city: true,
        plz: true,
        phone: true,
        avatar: true,
        bio: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Aktualisieren des Profils' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    await prisma.user.delete({ where: { id: user!.id } });

    const response = NextResponse.json({ success: true, message: 'Konto wurde erfolgreich gelöscht.' });
    response.headers.set('Set-Cookie', getClearSessionCookieHeader());
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Löschen des Kontos' }, { status: 500 });
  }
}
