import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';
import { checkRateLimit, rateLimitResponse, getClientIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`resend_verif_${ip}`, 3, 600); // 3 per 10 min
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfterSeconds);
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Bitte E-Mail-Adresse angeben.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    // Always return generic German feedback to prevent enumeration
    const GENERIC_MSG = 'Falls ein unbestätigtes Konto mit dieser E-Mail-Adresse existiert, wurde ein neuer Bestätigungslink gesendet.';

    if (!user || user.emailVerified) {
      return NextResponse.json({ message: GENERIC_MSG });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpires: verificationExpires,
      },
    });

    const emailResult = await sendVerificationEmail(normalizedEmail, verificationToken);

    return NextResponse.json({
      message: GENERIC_MSG,
      previewUrl: emailResult.previewUrl,
    });
  } catch (error: any) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ error: 'Fehler beim Senden des Bestätigungslinks.' }, { status: 500 });
  }
}
