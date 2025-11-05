import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

/**
 * Lightweight token checker for middleware (Edge Runtime compatible)
 * Only checks token format and expiration, not signature.
 * Full verification happens in API routes.
 * Uses atob for Edge Runtime compatibility (no Buffer dependency).
 */
function isTokenValid(token: string): boolean {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Parse payload (base64url decode) - Edge Runtime compatible
    // Convert base64url to base64, then decode
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const decoded = atob(padded);
    const payload = JSON.parse(decoded);

    // Check expiration
    if (payload.exp && typeof payload.exp === 'number') {
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) return false;
    }

    // Token format is valid and not expired
    return true;
  } catch {
    return false;
  }
}

// Routes that require authentication (without locale prefix)
const protectedRoutes = ['/dashboard', '/trades', '/analytics'];

// Routes that should redirect to dashboard if already authenticated (without locale prefix)
const authRoutes = ['/'];

// Create next-intl middleware
const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check for stored locale preference in cookie
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value;
  const preferredLocale = localeCookie && routing.locales.includes(localeCookie as any) 
    ? localeCookie 
    : null; // Only use cookie if it exists, don't default to routing.defaultLocale
  
  // Check if pathname has a locale prefix
  const pathnameHasLocale = routing.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If pathname doesn't have locale, redirect to add locale prefix
  if (!pathnameHasLocale) {
    // Let next-intl middleware handle the redirect first
    // Then we'll check if we need to override with cookie preference
    const response = intlMiddleware(request);
    
    // If we have a preferred locale from cookie and it's different from default, redirect to it
    if (preferredLocale && preferredLocale !== routing.defaultLocale) {
      const url = request.nextUrl.clone();
      if (pathname === '/') {
        url.pathname = `/${preferredLocale}`;
      } else {
        url.pathname = `/${preferredLocale}${pathname}`;
      }
      const redirectResponse = NextResponse.redirect(url);
      redirectResponse.cookies.set('NEXT_LOCALE', preferredLocale, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        sameSite: 'lax',
      });
      return redirectResponse;
    }
    
    // Set cookie if we have a preferred locale
    if (preferredLocale) {
      response.cookies.set('NEXT_LOCALE', preferredLocale, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        sameSite: 'lax',
      });
    }
    
    return response;
  }

  // At this point, pathname has a locale prefix (e.g., /en/dashboard, /pl/dashboard)
  const locale = pathname.split('/')[1] as typeof routing.locales[number];
  
  // Remove locale from pathname for route checking
  const pathnameWithoutLocale = pathname.slice(`/${locale}`.length) || '/';
  
  // Run next-intl middleware first (it handles locale detection and routing)
  const response = intlMiddleware(request);
  
  // After next-intl middleware, check if we need to enforce cookie-based locale preference
  // Only redirect if we have a preferred locale from cookie AND it differs from URL locale
  // This ensures user's preference is respected while allowing explicit locale URLs
  if (preferredLocale && locale !== preferredLocale) {
    // User has a stored preference that differs from URL - redirect to preferred locale
    const url = request.nextUrl.clone();
    url.pathname = `/${preferredLocale}${pathnameWithoutLocale}`;
    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.cookies.set('NEXT_LOCALE', preferredLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    });
    return redirectResponse;
  }
  
  // Ensure locale cookie is set to match current URL locale (if no preference was stored)
  // This syncs the cookie with the current URL locale
  if (!localeCookie || localeCookie !== locale) {
    response.cookies.set('NEXT_LOCALE', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    });
  }

  // Check authentication (lightweight check for routing decisions)
  const token = request.cookies.get('auth-token')?.value;
  const isAuthenticated = token ? isTokenValid(token) : false;

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
  // (response already has cookie set if needed)
  return response;
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
