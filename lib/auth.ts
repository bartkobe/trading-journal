import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';

// Types
export interface JWTPayload {
  userId: string;
  email: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}

// Constants
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const COOKIE_NAME = 'auth-token';

// ============================================================================
// Password Hashing
// ============================================================================

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns True if password matches
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============================================================================
// JWT Token Management
// ============================================================================

/**
 * Generate a JWT token for a user
 * @param userId - User ID
 * @param email - User email
 * @returns JWT token string
 */
export function generateToken(userId: string, email: string): string {
  const payload: JWTPayload = {
    userId,
    email,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as string,
  } as jwt.SignOptions);
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// ============================================================================
// Cookie Management
// ============================================================================

/**
 * Set authentication cookie
 * @param token - JWT token
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Get authentication cookie
 * @returns JWT token or undefined
 */
export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

/**
 * Clear authentication cookie
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// ============================================================================
// Session Management
// ============================================================================

/**
 * Get the current authenticated user from the request
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const token = await getAuthCookie();

    if (!token) {
      return null;
    }

    const payload = verifyToken(token);

    if (!payload) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Require authentication - throws error if not authenticated
 * @returns Authenticated user
 * @throws Error if not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  return user;
}

// ============================================================================
// User Registration & Login
// ============================================================================

/**
 * Register a new user
 * @param email - User email
 * @param password - Plain text password
 * @param name - Optional user name
 * @returns Created user and auth token
 */
export async function registerUser(
  email: string,
  password: string,
  name?: string
): Promise<{ user: AuthUser; token: string }> {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  // Generate token
  const token = generateToken(user.id, user.email);

  return { user, token };
}

/**
 * Login a user
 * @param email - User email
 * @param password - Plain text password
 * @returns User and auth token
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ user: AuthUser; token: string }> {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isValidPassword = await verifyPassword(password, user.password);

  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const token = generateToken(user.id, user.email);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    },
    token,
  };
}
