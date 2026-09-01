import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { checkRateLimit, rateLimitResponse, getClientIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`reset_pw_${ip}`, 10, 600);
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfterSeconds);
    }

    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token und neues Passwort sind erforderlich.' }, { status: 400 });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 10) {
      return NextResponse.json({ error: 'Das neue Passwort muss mindestens 10 Zeichen lang sein.' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Der Link ist ungültig oder abgelaufen.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Consume single-use token and update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Das Passwort wurde erfolgreich geändert. Du kannst dich jetzt anmelden.' 
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Fehler beim Zurücksetzen des Passworts.' }, { status: 500 });
  }
}
