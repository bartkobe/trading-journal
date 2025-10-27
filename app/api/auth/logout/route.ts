import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

/**
 * POST /api/auth/logout
 * Logout user and clear session
 */
export async function POST() {
  try {
    // Clear auth cookie
    await clearAuthCookie();

    return NextResponse.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);

    return NextResponse.json(
      {
        error: 'Failed to logout',
      },
      { status: 500 }
    );
  }
}
