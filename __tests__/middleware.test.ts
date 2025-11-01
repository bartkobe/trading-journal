/**
 * @jest-environment node
 */

import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '@/middleware';
import { verifyToken, generateToken } from '@/lib/auth';

// Mock auth library
jest.mock('@/lib/auth', () => ({
  verifyToken: jest.fn(),
  generateToken: jest.fn(),
}));

const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Protected Routes', () => {
    it('should allow access to protected route when authenticated', () => {
      mockVerifyToken.mockReturnValue({
        userId: 'user-1',
        email: 'user@example.com',
      });

      const request = new NextRequest('http://localhost/dashboard', {
        headers: {
          cookie: 'auth-token=valid-token',
        },
      });

      const response = middleware(request);

      expect(response.status).toBe(200);
      expect(mockVerifyToken).toHaveBeenCalledWith('valid-token');
    });

    it('should redirect to login when accessing protected route without auth', () => {
      mockVerifyToken.mockReturnValue(null);

      const request = new NextRequest('http://localhost/dashboard');

      const response = middleware(request);

      expect(response.status).toBe(307); // Redirect
      const location = response.headers.get('location');
      // URL is encoded, so /dashboard becomes %2Fdashboard
      expect(location).toMatch(/redirect=.*dashboard/);
    });

    it('should redirect to login when token is invalid', () => {
      mockVerifyToken.mockReturnValue(null);

      const request = new NextRequest('http://localhost/dashboard', {
        headers: {
          cookie: 'auth-token=invalid-token',
        },
      });

      const response = middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toMatch(/redirect=.*dashboard/);
    });

    it('should protect /trades route', () => {
      mockVerifyToken.mockReturnValue(null);

      const request = new NextRequest('http://localhost/trades');

      const response = middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toMatch(/redirect=.*trades/);
    });

    it('should protect /trades/[id] route', () => {
      mockVerifyToken.mockReturnValue(null);

      const request = new NextRequest('http://localhost/trades/123');

      const response = middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toMatch(/redirect=.*trades.*123/);
    });

    it('should protect /analytics route', () => {
      mockVerifyToken.mockReturnValue(null);

      const request = new NextRequest('http://localhost/analytics');

      const response = middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toMatch(/redirect=.*analytics/);
    });
  });

  describe('Auth Routes', () => {
    it('should redirect to dashboard when accessing login while authenticated', () => {
      mockVerifyToken.mockReturnValue({
        userId: 'user-1',
        email: 'user@example.com',
      });

      const request = new NextRequest('http://localhost/', {
        headers: {
          cookie: 'auth-token=valid-token',
        },
      });

      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('http://localhost/dashboard');
    });

    it('should allow access to login page when not authenticated', () => {
      mockVerifyToken.mockReturnValue(null);

      const request = new NextRequest('http://localhost/');

      const response = middleware(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Public Routes', () => {
    it('should allow access to public routes without authentication', () => {
      mockVerifyToken.mockReturnValue(null);

      // Test with a route that's not protected
      const request = new NextRequest('http://localhost/some-public-route');

      const response = middleware(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Token Verification', () => {
    it('should verify token from cookie', () => {
      const mockToken = 'test-token-123';
      mockVerifyToken.mockReturnValue({
        userId: 'user-1',
        email: 'user@example.com',
      });

      const request = new NextRequest('http://localhost/dashboard', {
        headers: {
          cookie: `auth-token=${mockToken}`,
        },
      });

      middleware(request);

      expect(mockVerifyToken).toHaveBeenCalledWith(mockToken);
    });

    it('should handle missing token', () => {
      mockVerifyToken.mockReturnValue(null);

      const request = new NextRequest('http://localhost/dashboard');

      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(mockVerifyToken).not.toHaveBeenCalled();
    });
  });
});

