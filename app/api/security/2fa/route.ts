import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const dbUser = await prisma.user.findUnique({
      where: { id: user!.id },
      select: { twoFactorEnabled: true },
    });

    return NextResponse.json({ enabled: dbUser?.twoFactorEnabled || false });
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Laden des 2FA-Status' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { action, code } = body;

    // 1. Action: SETUP (Generate secret and backup codes)
    if (action === 'SETUP') {
      const secret = crypto.randomBytes(20).toString('hex');
      const recoveryCodes = Array.from({ length: 6 }, () =>
        crypto.randomBytes(4).toString('hex').toUpperCase()
      );

      const hashedCodes = await Promise.all(
        recoveryCodes.map((rc) => bcrypt.hash(rc, 10))
      );

      await prisma.user.update({
        where: { id: user!.id },
        data: {
          twoFactorSecret: secret,
          twoFactorRecoveryCodes: JSON.stringify(hashedCodes),
        },
      });

      return NextResponse.json({
        secret,
        qrUri: `otpauth://totp/KleinDeal:${encodeURIComponent(user!.email)}?secret=${secret}&issuer=KleinDeal.de`,
        recoveryCodes,
      });
    }

    // 2. Action: VERIFY_AND_ENABLE
    if (action === 'ENABLE') {
      if (!code || code.length !== 6) {
        return NextResponse.json({ error: 'Bitte gib den 6-stelligen Bestätigungscode ein.' }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: user!.id },
        data: { twoFactorEnabled: true },
      });

      await prisma.securityEvent.create({
        data: {
          userId: user!.id,
          eventType: 'TWO_FACTOR_ENABLED',
          details: 'Zwei-Faktor-Authentifizierung (2FA) wurde erfolgreich aktiviert.',
        },
      });

      return NextResponse.json({ success: true, message: '2FA erfolgreich aktiviert.' });
    }

    // 3. Action: DISABLE
    if (action === 'DISABLE') {
      await prisma.user.update({
        where: { id: user!.id },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
          twoFactorRecoveryCodes: null,
        },
      });

      await prisma.securityEvent.create({
        data: {
          userId: user!.id,
          eventType: 'TWO_FACTOR_DISABLED',
          details: 'Zwei-Faktor-Authentifizierung (2FA) wurde deaktiviert.',
        },
      });

      return NextResponse.json({ success: true, message: '2FA erfolgreich deaktiviert.' });
    }

    return NextResponse.json({ error: 'Ungültige Aktion.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler bei der 2FA-Verwaltung' }, { status: 500 });
  }
}
