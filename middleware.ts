import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const isStaging = process.env.APP_ENV === 'staging';

  // In production / development, pass through immediately with zero overhead
  if (!isStaging) {
    return NextResponse.next();
  }

  try {
    const { pathname } = req.nextUrl;

    // 1. Intercept /robots.txt in Staging
    if (pathname === '/robots.txt') {
      return new NextResponse('User-agent: *\nDisallow: /', {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'X-Robots-Tag': 'noindex, nofollow, noarchive',
        },
      });
    }

    // 2. Private Staging Access Gate
    if (process.env.STAGING_ACCESS_PASSWORD) {
      const isPublicPath =
        pathname.startsWith('/staging-login') ||
        pathname.startsWith('/api/') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/uploads') ||
        pathname.startsWith('/brand') ||
        pathname === '/favicon.ico' ||
        pathname === '/icon.svg' ||
        pathname === '/apple-icon.png' ||
        pathname === '/site.webmanifest';

      if (!isPublicPath) {
        const accessCookie = req.cookies.get('kleindeal_staging_access');
        if (!accessCookie || !accessCookie.value) {
          const loginUrl = new URL('/staging-login', req.url);
          return NextResponse.redirect(loginUrl);
        }
      }
    }

    // 3. Add noindex header in staging
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return response;
  } catch (err) {
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Official Next.js regex matcher pattern
     * Excludes _next/static, _next/image, and favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
