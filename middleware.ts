import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;
    const isStaging = process.env.APP_ENV === 'staging';

    // 1. Intercept /robots.txt in Staging
    if (isStaging && pathname === '/robots.txt') {
      return new NextResponse('User-agent: *\nDisallow: /', {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'X-Robots-Tag': 'noindex, nofollow, noarchive',
        },
      });
    }

    // 2. Private Staging Access Gate
    if (isStaging && process.env.STAGING_ACCESS_PASSWORD) {
      const isPublicPath =
        pathname.startsWith('/staging-login') ||
        pathname.startsWith('/api/staging-access') ||
        pathname.startsWith('/api/health') ||
        pathname.startsWith('/api/ready') ||
        pathname.startsWith('/api/jobs') ||
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

    // 3. Security headers & response
    const response = NextResponse.next();

    if (isStaging) {
      response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    }

    return response;
  } catch (err) {
    console.error('Middleware execution error caught safely:', err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     * - public assets with extensions (.svg, .png, .jpg, .jpeg, .gif, .webp, .ico, .webmanifest)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest)$).*)',
  ],
};
