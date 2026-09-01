import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
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
      pathname === '/favicon.ico' ||
      pathname === '/icon.svg' ||
      pathname === '/apple-icon.png';

    if (!isPublicPath) {
      const accessCookie = req.cookies.get('kleindeal_staging_access');
      if (!accessCookie || !accessCookie.value) {
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = '/staging-login';
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  // 3. Clone and inject security / noindex headers
  const response = NextResponse.next();

  if (isStaging) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     */
    '/((?!_next/static|_next/image).*)',
  ],
};
