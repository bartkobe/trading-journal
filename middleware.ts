import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { routing } from './i18n/routing';

// Routes that require authentication (without locale prefix)
const protectedRoutes = ['/dashboard', '/trades', '/analytics'];

// Routes that should redirect to dashboard if already authenticated (without locale prefix)
const authRoutes = ['/'];

// Create next-intl middleware
const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check if pathname has a locale prefix
  const pathnameHasLocale = routing.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If pathname doesn't have locale, redirect to add locale prefix
  if (!pathnameHasLocale) {
    // For root path, redirect to default locale
    if (pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = `/${routing.defaultLocale}`;
      return NextResponse.redirect(url);
    }
    
    // For other paths without locale, let next-intl middleware handle it
    // It will redirect to add the locale prefix (e.g., /dashboard -> /en/dashboard)
    return intlMiddleware(request);
  }

  // At this point, pathname has a locale prefix (e.g., /en/dashboard, /pl/dashboard)
  const locale = pathname.split('/')[1] as typeof routing.locales[number];
  
  // Remove locale from pathname for route checking
  const pathnameWithoutLocale = pathname.slice(`/${locale}`.length) || '/';

  // Check authentication
  const token = request.cookies.get('auth-token')?.value;
  const isAuthenticated = token ? verifyToken(token) !== null : false;

  // Check if the route is protected (without locale prefix)
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  );
  const isAuthRoute = pathnameWithoutLocale === '/';

  // Handle protected routes - redirect to login with locale prefix
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL(`/${locale}`, request.url);
    loginUrl.searchParams.set('redirect', pathnameWithoutLocale);
    return NextResponse.redirect(loginUrl);
  }

  // Handle auth routes - redirect to dashboard with locale prefix if authenticated
  if (isAuthRoute && isAuthenticated) {
    const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Continue with next-intl middleware for any additional locale handling
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * 
     * The pattern ensures root path '/' is matched
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|).*)',
    '/', // Explicitly match root path
  ],
};
