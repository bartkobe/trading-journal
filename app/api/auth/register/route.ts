import { NextRequest, NextResponse } from 'next/server';
import { registerUser, setAuthCookie } from '@/lib/auth';
import { registerSchema } from '@/lib/validation';
import { getApiTranslations } from '@/lib/api-translations';

/**
 * POST /api/auth/register
 * Register a new user account
 */
export async function POST(request: NextRequest) {
  const t = await getApiTranslations(request, 'errors');
  
  try {
    const body = await request.json();

    // Validate input
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: t('validationFailed'),
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password, name } = validationResult.data;

    // Register user
    const { user, token } = await registerUser(email, password, name);

    // Set auth cookie
    await setAuthCookie(token);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: t('userRegisteredSuccessfully'),
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        return NextResponse.json(
          {
            error: t('accountExists'),
          },
          { status: 409 }
        );
      }
      
      // Return detailed error in development/non-production for debugging
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json(
          {
            error: t('failedToCreateAccount'),
            details: error.message,
            stack: error.stack,
          },
          { status: 500 }
        );
      }
      
      // Log full error to console for production debugging
      console.error('Full registration error:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }

    // Generic error response
    return NextResponse.json(
      {
        error: t('failedToCreateAccount'),
      },
      { status: 500 }
    );
  }
}
