import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { createSessionToken, getSessionCookieHeader } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';
import { checkRateLimit, rateLimitResponse, getClientIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`register_${ip}`, 10, 600); // 10 per 10 min
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfterSeconds);
    }

    const { name, email, password, passwordConfirm, accountType, city, plz, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, E-Mail und Passwort sind Pflichtfelder.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Password strength requirement: minimum 10 characters
    if (password.length < 10) {
      return NextResponse.json({ error: 'Das Passwort muss mindestens 10 Zeichen lang sein.' }, { status: 400 });
    }

    if (passwordConfirm && password !== passwordConfirm) {
      return NextResponse.json({ error: 'Die Passwörter stimmen nicht überein.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Diese E-Mail-Adresse wird bereits verwendet.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate secure email verification token (expires in 24 hours)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        accountType: accountType === 'Gewerblich' ? 'Gewerblich' : 'Privat',
        city: city || 'Berlin',
        plz: plz || '10115',
        phone: phone || '',
        emailVerified: false, // Must be verified via token
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpires: verificationExpires,
      },
    });

    // Send verification email (or log dev URL)
    const emailResult = await sendVerificationEmail(normalizedEmail, verificationToken);

    // Create session token and set HttpOnly cookie
    const sessionToken = createSessionToken({ userId: user.id, email: user.email });
    const cookieHeader = getSessionCookieHeader(sessionToken);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      accountType: user.accountType,
      role: user.role,
      status: user.status,
      city: user.city,
      plz: user.plz,
      phone: user.phone,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };

    const response = NextResponse.json({
      user: safeUser,
      emailDelivery: {
        provider: emailResult.provider,
        previewUrl: emailResult.previewUrl,
      },
      message: 'Konto erfolgreich erstellt. Bitte bestätige deine E-Mail-Adresse.',
    });

    response.headers.set('Set-Cookie', cookieHeader);
    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Fehler bei der Registrierung' }, { status: 500 });
  }
}
