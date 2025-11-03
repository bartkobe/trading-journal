import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

/**
 * POST /api/auth/logout
 * Logout user and clear session, then redirect to login page
 */
export async function POST(request: NextRequest) {
  try {
    // Clear auth cookie
    await clearAuthCookie();

    // Redirect to login page using the request origin
    const origin = request.nextUrl.origin;
    return NextResponse.redirect(new URL('/', origin));
  } catch (error) {
    console.error('Logout error:', error);

    // Even on error, redirect to login page
    const origin = request.nextUrl.origin;
    return NextResponse.redirect(new URL('/', origin));
  }
}
