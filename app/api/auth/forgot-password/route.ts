import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';
import { checkRateLimit, rateLimitResponse, getClientIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`forgot_pw_${ip}`, 5, 900); // 5 per 15 min
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfterSeconds);
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Bitte E-Mail-Adresse angeben.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    // Return generic success message regardless to prevent email enumeration
    const SUCCESS_MESSAGE = 'Falls ein Konto mit dieser E-Mail-Adresse existiert, wurde ein Link zum Zurücksetzen des Passworts gesendet.';

    if (!user) {
      return NextResponse.json({ message: SUCCESS_MESSAGE });
    }

    // Generate 1-hour expiring reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpires: expires,
      },
    });

    const emailResult = await sendPasswordResetEmail(normalizedEmail, token);

    return NextResponse.json({ 
      message: SUCCESS_MESSAGE,
      previewResetToken: emailResult.previewUrl ? token : undefined,
      previewUrl: emailResult.previewUrl,
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Fehler beim Anfordern des Links.' }, { status: 500 });
  }
}
