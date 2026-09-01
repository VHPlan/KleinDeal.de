import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, rateLimitResponse, getClientIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`verify_email_${ip}`, 20, 300);
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfterSeconds);
    }

    const { token } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Ungültiger oder fehlender Verifizierungs-Token.' },
        { status: 400 }
      );
    }

    // Find user with matching unexpired verification token
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationTokenExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Der Verifizierungslink ist ungültig oder bereits abgelaufen.' },
        { status: 400 }
      );
    }

    // Consume single-use token and mark verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenExpires: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Deine E-Mail-Adresse wurde erfolgreich bestätigt!',
    });
  } catch (error: any) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Fehler bei der E-Mail-Verifizierung.' },
      { status: 500 }
    );
  }
}
