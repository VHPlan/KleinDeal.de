import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSessionToken, getSessionCookieHeader } from '@/lib/auth';
import { checkRateLimit, rateLimitResponse, getClientIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`login_${ip}`, 15, 300); // 15 attempts per 5 min
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfterSeconds);
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Bitte E-Mail und Passwort eingeben.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Generic login error to prevent account enumeration
    const GENERIC_ERROR = 'E-Mail-Adresse oder Passwort ungültig.';

    if (!user) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
    }

    // Generate secure session token and set HttpOnly cookie
    const sessionToken = createSessionToken({ userId: user.id, email: user.email });
    const cookieHeader = getSessionCookieHeader(sessionToken);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      accountType: user.accountType,
      city: user.city,
      plz: user.plz,
      phone: user.phone,
      avatar: user.avatar,
      bio: user.bio,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };

    const response = NextResponse.json({
      user: safeUser,
      token: sessionToken, // Also return bearer token for API clients / test scripts
    });

    response.headers.set('Set-Cookie', cookieHeader);
    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Fehler bei der Anmeldung' }, { status: 500 });
  }
}
