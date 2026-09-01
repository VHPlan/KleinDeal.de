import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { env } from '@/lib/env';

const ACCESS_COOKIE_NAME = 'kleindeal_staging_access';
const COOKIE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

function createAccessToken(): string {
  const payload = { access: 'staging_authorized', exp: Date.now() + COOKIE_DURATION_MS };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', env.SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${signature}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!env.STAGING_ACCESS_PASSWORD) {
      return NextResponse.json(
        { error: 'STAGING_ACCESS_PASSWORD ist auf dem Server nicht konfiguriert.' },
        { status: 500 }
      );
    }

    if (password !== env.STAGING_ACCESS_PASSWORD) {
      return NextResponse.json(
        { error: 'Ungültiges Passwort für die Staging-Umgebung.' },
        { status: 401 }
      );
    }

    const token = createAccessToken();
    const isProd = env.NODE_ENV === 'production';
    const cookieHeader = `${ACCESS_COOKIE_NAME}=${token}; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax${
      isProd ? '; Secure' : ''
    }`;

    return NextResponse.json(
      { success: true, message: 'Staging-Zugang erfolgreich autorisiert.' },
      {
        status: 200,
        headers: {
          'Set-Cookie': cookieHeader,
        },
      }
    );
  } catch (err) {
    return NextResponse.json({ error: 'Serverfehler bei der Autorisierung.' }, { status: 500 });
  }
}

export async function DELETE() {
  const isProd = env.NODE_ENV === 'production';
  const cookieHeader = `${ACCESS_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${
    isProd ? '; Secure' : ''
  }`;

  return NextResponse.json(
    { success: true, message: 'Staging-Sitzung beendet.' },
    {
      status: 200,
      headers: {
        'Set-Cookie': cookieHeader,
      },
    }
  );
}
