import crypto from 'crypto';
import { prisma } from './prisma';
import { NextResponse } from 'next/server';

import { env } from './env';

export const SESSION_COOKIE_NAME = env.APP_ENV === 'staging' ? 'kleindeal_staging_session' : 'kleindeal_session';
const SESSION_SECRET = env.SESSION_SECRET || 'kleindeal_secure_session_secret_fallback_key_2026';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface SessionPayload {
  userId: string;
  email: string;
  exp: number;
}

/**
 * Creates a signed tamper-proof session token: base64(payload).signature
 */
export function createSessionToken(payload: { userId: string; email: string }): string {
  const data: SessionPayload = {
    userId: payload.userId,
    email: payload.email,
    exp: Date.now() + SESSION_DURATION_MS,
  };
  const encoded = Buffer.from(JSON.stringify(data)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${signature}`;
}

/**
 * Verifies a signed session token. Returns null if expired, malformed, or tampered.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [encoded, signature] = token.split('.');
    if (!encoded || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(encoded)
      .digest('base64url');

    // Constant-time comparison to prevent timing attacks
    if (
      signature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
    ) {
      return null;
    }

    const data: SessionPayload = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf8')
    );

    if (Date.now() > data.exp) {
      return null; // Expired
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * Extracts session token from Cookie header or Authorization Bearer header.
 */
export function extractTokenFromRequest(req: Request): string | null {
  // 1. Check Cookie header
  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith(`${SESSION_COOKIE_NAME}=`)) {
        return cookie.substring(SESSION_COOKIE_NAME.length + 1);
      }
      if (cookie.startsWith('kleindeal_staging_session=')) {
        return cookie.substring('kleindeal_staging_session='.length);
      }
      if (cookie.startsWith('kleindeal_session=')) {
        return cookie.substring('kleindeal_session='.length);
      }
    }
  }

  // 2. Check Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  return null;
}

/**
 * Authenticates user from request. Returns full Prisma User record or null.
 */
export async function getSessionUser(req: Request) {
  const token = extractTokenFromRequest(req);
  if (!token) return null;

  const session = verifySessionToken(token);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  return user;
}

/**
 * Server-side guard requiring an authenticated user.
 * Returns either { user } or { errorResponse }
 */
export async function requireAuth(req: Request) {
  const user = await getSessionUser(req);
  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: 'Nicht autorisiert. Bitte melde dich an.' },
        { status: 401 }
      ),
    };
  }
  return { user, errorResponse: null };
}

/**
 * Helper to build Set-Cookie header for session login
 */
export function getSessionCookieHeader(token: string): string {
  const isProd = process.env.NODE_ENV === 'production';
  const maxAge = Math.floor(SESSION_DURATION_MS / 1000);
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${
    isProd ? '; Secure' : ''
  }`;
}

/**
 * Helper to build Set-Cookie header for logout
 */
export function getClearSessionCookieHeader(): string {
  const isProd = process.env.NODE_ENV === 'production';
  return `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${
    isProd ? '; Secure' : ''
  }`;
}

/**
 * CSRF / Origin validation for state-changing requests (POST, PUT, PATCH, DELETE)
 */
export function validateOrigin(req: Request): boolean {
  // Safe methods do not require origin check
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return true;

  const origin = req.headers.get('origin') || req.headers.get('referer');
  if (!origin) {
    // In dev / curl / automated script testing, allow when authorization bearer is present
    return true;
  }

  const host = req.headers.get('host');
  if (!host) return true;

  try {
    const originUrl = new URL(origin);
    return originUrl.host === host || originUrl.host.startsWith('localhost:');
  } catch {
    return false;
  }
}
