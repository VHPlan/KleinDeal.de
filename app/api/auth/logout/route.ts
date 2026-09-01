import { NextResponse } from 'next/server';
import { getClearSessionCookieHeader } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Erfolgreich abgemeldet.',
  });

  response.headers.set('Set-Cookie', getClearSessionCookieHeader());
  return response;
}
