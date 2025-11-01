/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST as POST_REGISTER } from '@/app/api/auth/register/route';
import { POST as POST_LOGIN } from '@/app/api/auth/login/route';
import { POST as POST_LOGOUT } from '@/app/api/auth/logout/route';
import { GET as GET_ME } from '@/app/api/auth/me/route';
import prisma from '@/lib/db';
import * as authLib from '@/lib/auth';
import { cookies } from 'next/headers';

// Helper to create NextRequest for testing
function createMockRequest(url: string, options: { method?: string; body?: string; cookies?: Record<string, string> } = {}) {
  const { method = 'GET', body, cookies: cookieObj = {} } = options;
  
  const urlObj = new URL(url);
  
  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (body) {
    requestInit.body = body;
  }
  
  const request = new NextRequest(urlObj, requestInit);
  
  // Add cookies to the request
  Object.entries(cookieObj).forEach(([name, value]) => {
    request.cookies.set(name, value);
  });
  
  return request;
}

// Mock Prisma
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

// Mock next/headers cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

// Mock auth library functions
jest.mock('@/lib/auth', () => {
  const actual = jest.requireActual('@/lib/auth');
  return {
    ...actual,
    hashPassword: jest.fn(),
    verifyPassword: jest.fn(),
    registerUser: jest.fn(),
    loginUser: jest.fn(),
    setAuthCookie: jest.fn(),
    clearAuthCookie: jest.fn(),
    getCurrentUser: jest.fn(),
  };
});

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockCookies = cookies as jest.MockedFunction<typeof cookies>;
const mockAuthLib = authLib as jest.Mocked<typeof authLib>;

describe('Authentication API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock cookies() to return a mock cookie store
    const mockCookieStore = {
      set: jest.fn(),
      delete: jest.fn(),
      get: jest.fn(),
    };
    mockCookies.mockReturnValue(mockCookieStore as any);
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'newuser@example.com',
        name: 'New User',
        createdAt: new Date(),
      };
      const mockToken = 'mock-jwt-token';

      mockAuthLib.registerUser.mockResolvedValue({
        user: mockUser,
        token: mockToken,
      });
      mockAuthLib.setAuthCookie.mockResolvedValue();

      const requestBody = {
        email: 'newuser@example.com',
        password: 'Password123',
        name: 'New User',
      };

      const request = createMockRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST_REGISTER(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.user.email).toBe('newuser@example.com');
      expect(data.user.name).toBe('New User');
      expect(mockAuthLib.registerUser).toHaveBeenCalledWith('newuser@example.com', 'Password123', 'New User');
      expect(mockAuthLib.setAuthCookie).toHaveBeenCalledWith(mockToken);
    });

    it('should register user without name if not provided', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'newuser@example.com',
        name: null,
        createdAt: new Date(),
      };
      const mockToken = 'mock-jwt-token';

      mockAuthLib.registerUser.mockResolvedValue({
        user: mockUser,
        token: mockToken,
      });
      mockAuthLib.setAuthCookie.mockResolvedValue();

      const requestBody = {
        email: 'newuser@example.com',
        password: 'Password123',
      };

      const request = createMockRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST_REGISTER(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.user.name).toBeNull();
      expect(mockAuthLib.registerUser).toHaveBeenCalledWith('newuser@example.com', 'Password123', undefined);
    });

    it('should return 409 if user already exists', async () => {
      mockAuthLib.registerUser.mockRejectedValue(new Error('User with this email already exists'));

      const requestBody = {
        email: 'existing@example.com',
        password: 'Password123',
      };

      const request = createMockRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST_REGISTER(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBeDefined();
      expect(mockAuthLib.setAuthCookie).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid email', async () => {
      const requestBody = {
        email: 'invalid-email',
        password: 'Password123',
      };

      const request = createMockRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST_REGISTER(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should return 400 for weak password', async () => {
      const requestBody = {
        email: 'user@example.com',
        password: 'weak', // Too short, doesn't meet requirements
      };

      const request = createMockRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST_REGISTER(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/login', () => {
    const mockUser = {
      id: 'user-1',
      email: 'user@example.com',
      name: 'Test User',
      createdAt: new Date(),
    };

    it('should login user successfully with correct credentials', async () => {
      const mockToken = 'mock-jwt-token';
      
      mockAuthLib.loginUser.mockResolvedValue({
        user: mockUser,
        token: mockToken,
      });
      mockAuthLib.setAuthCookie.mockResolvedValue();

      const requestBody = {
        email: 'user@example.com',
        password: 'Password123',
      };

      const request = createMockRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST_LOGIN(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.email).toBe('user@example.com');
      expect(mockAuthLib.loginUser).toHaveBeenCalledWith('user@example.com', 'Password123');
      expect(mockAuthLib.setAuthCookie).toHaveBeenCalledWith(mockToken);
    });

    it('should return 401 for invalid email', async () => {
      mockAuthLib.loginUser.mockRejectedValue(new Error('Invalid email or password'));

      const requestBody = {
        email: 'nonexistent@example.com',
        password: 'Password123',
      };

      const request = createMockRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST_LOGIN(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid email or password');
      expect(mockAuthLib.setAuthCookie).not.toHaveBeenCalled();
    });

    it('should return 401 for incorrect password', async () => {
      mockAuthLib.loginUser.mockRejectedValue(new Error('Invalid email or password'));

      const requestBody = {
        email: 'user@example.com',
        password: 'WrongPassword123',
      };

      const request = createMockRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST_LOGIN(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid email or password');
    });

    it('should return 400 for invalid email format', async () => {
      const requestBody = {
        email: 'invalid-email',
        password: 'Password123',
      };

      const request = createMockRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST_LOGIN(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should return 400 for missing password', async () => {
      const requestBody = {
        email: 'user@example.com',
      };

      const request = createMockRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST_LOGIN(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout user successfully', async () => {
      mockAuthLib.clearAuthCookie.mockResolvedValue();

      const request = createMockRequest('http://localhost/api/auth/logout', {
        method: 'POST',
      });

      const response = await POST_LOGOUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Logout successful');
      expect(mockAuthLib.clearAuthCookie).toHaveBeenCalled();
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user when authenticated', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user@example.com',
        name: 'Test User',
        createdAt: new Date(),
      };

      mockAuthLib.getCurrentUser.mockResolvedValue(mockUser);

      const request = createMockRequest('http://localhost/api/auth/me');

      const response = await GET_ME(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe('user@example.com');
    });

    it('should return 401 when not authenticated', async () => {
      mockAuthLib.getCurrentUser.mockResolvedValue(null);

      const request = createMockRequest('http://localhost/api/auth/me');

      const response = await GET_ME(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Not authenticated');
    });
  });
});

