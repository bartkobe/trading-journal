import { NextRequest, NextResponse } from 'next/server';
import { loginUser, setAuthCookie } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';
import { getApiTranslations } from '@/lib/api-translations';

/**
 * POST /api/auth/login
 * Authenticate a user and create session
 */
export async function POST(request: NextRequest) {
  const t = await getApiTranslations(request, 'errors');
  
  try {
    const body = await request.json();

    // Validate input
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: t('validationFailed'),
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
      message: t('loginSuccessful'),
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
            error: t('invalidEmailOrPassword'),
          },
          { status: 401 }
        );
      }
      
      // Return detailed error in development/for debugging
      return NextResponse.json(
        {
          error: t('failedToSignIn'),
          details: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        },
        { status: 500 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        error: t('failedToSignIn'),
        details: String(error),
      },
      { status: 500 }
    );
  }
}
