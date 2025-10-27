import { NextRequest, NextResponse } from 'next/server';
import { loginUser, setAuthCookie } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';

/**
 * POST /api/auth/login
 * Authenticate a user and create session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Login user
    const { user, token } = await loginUser(email, password);

    // Set auth cookie
    await setAuthCookie(token);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('Invalid email or password')) {
        return NextResponse.json(
          {
            error: 'Invalid email or password',
          },
          { status: 401 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      {
        error: 'Failed to login',
      },
      { status: 500 }
    );
  }
}
