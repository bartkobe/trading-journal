/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST, DELETE } from '@/app/api/trades/[id]/screenshots/route';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// Mock Prisma
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    trade: {
      findUnique: jest.fn(),
    },
    screenshot: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Mock auth
jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn(),
}));

// Mock storage
jest.mock('@/lib/storage', () => ({
  uploadImage: jest.fn(),
  deleteImage: jest.fn(),
  isValidImageType: jest.fn(),
  isValidImageSize: jest.fn(),
}));

import { uploadImage, deleteImage, isValidImageType, isValidImageSize } from '@/lib/storage';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockUploadImage = uploadImage as jest.MockedFunction<typeof uploadImage>;
const mockDeleteImage = deleteImage as jest.MockedFunction<typeof deleteImage>;
const mockIsValidImageType = isValidImageType as jest.MockedFunction<typeof isValidImageType>;
const mockIsValidImageSize = isValidImageSize as jest.MockedFunction<typeof isValidImageSize>;

describe('Screenshot Upload API Endpoint', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
  };

  const mockTrade = {
    id: 'trade-1',
    userId: mockUser.id,
    symbol: 'AAPL',
    assetType: 'STOCK',
    currency: 'USD',
    entryDate: new Date(),
    entryPrice: 100,
    exitDate: new Date(),
    exitPrice: 105,
    quantity: 10,
    direction: 'LONG',
    fees: 1,
  };

  const mockScreenshot = {
    id: 'screenshot-1',
    tradeId: 'trade-1',
    url: 'https://cloudinary.com/image.jpg',
    filename: 'test.jpg',
    fileSize: 1024000,
    mimeType: 'image/jpeg',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(mockUser);
    mockIsValidImageType.mockReturnValue(true);
    mockIsValidImageSize.mockReturnValue(true);
  });

  describe('POST /api/trades/[id]/screenshots', () => {
    it('should upload screenshot successfully', async () => {
      // Mock trade exists
      mockPrisma.trade.findUnique.mockResolvedValue(mockTrade as any);

      // Mock upload result
      const uploadResult = {
        url: 'https://cloudinary.com/image.jpg',
        publicId: 'trades/screenshots/test-123',
        filename: 'test.jpg',
        fileSize: 1024000,
        mimeType: 'image/jpeg',
      };
      mockUploadImage.mockResolvedValue(uploadResult);

      // Mock database create
      mockPrisma.screenshot.create.mockResolvedValue(mockScreenshot as any);

      // Create form data with file
      const formData = new FormData();
      const mockFile = new File(['test image content'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('file', mockFile);

      // Create request
      const url = 'http://localhost/api/trades/trade-1/screenshots';
      const requestInit: RequestInit = {
        method: 'POST',
        body: formData,
      };
      const request = new NextRequest(url, requestInit);

      const params = Promise.resolve({ id: 'trade-1' });
      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.screenshot).toBeDefined();
      expect(data.message).toBe('Screenshot uploaded successfully');
      expect(mockPrisma.trade.findUnique).toHaveBeenCalledWith({
        where: { id: 'trade-1', userId: mockUser.id },
      });
      expect(mockUploadImage).toHaveBeenCalledWith(
        expect.any(Buffer),
        'test.jpg',
        'trades/screenshots'
      );
      expect(mockPrisma.screenshot.create).toHaveBeenCalledWith({
        data: {
          tradeId: 'trade-1',
          url: 'https://cloudinary.com/image.jpg',
          filename: 'test.jpg',
          fileSize: 1024000,
          mimeType: 'image/jpeg',
        },
      });
    });

    it('should return 401 when not authenticated', async () => {
      mockRequireAuth.mockRejectedValue(new Error('Authentication required'));

      const formData = new FormData();
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('file', mockFile);

      const request = new NextRequest('http://localhost/api/trades/trade-1/screenshots', {
        method: 'POST',
        body: formData,
      });
      const params = Promise.resolve({ id: 'trade-1' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
      expect(mockPrisma.trade.findUnique).not.toHaveBeenCalled();
    });

    it('should return 404 when trade not found', async () => {
      mockPrisma.trade.findUnique.mockResolvedValue(null);

      const formData = new FormData();
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('file', mockFile);

      const request = new NextRequest('http://localhost/api/trades/nonexistent/screenshots', {
        method: 'POST',
        body: formData,
      });
      const params = Promise.resolve({ id: 'nonexistent' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Trade not found');
    });

    it('should return 400 when no file provided', async () => {
      mockPrisma.trade.findUnique.mockResolvedValue(mockTrade as any);

      const formData = new FormData();
      // No file appended

      const request = new NextRequest('http://localhost/api/trades/trade-1/screenshots', {
        method: 'POST',
        body: formData,
      });
      const params = Promise.resolve({ id: 'trade-1' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('No file provided');
    });

    it('should return 400 for invalid file type', async () => {
      mockPrisma.trade.findUnique.mockResolvedValue(mockTrade as any);
      mockIsValidImageType.mockReturnValue(false);

      const formData = new FormData();
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      formData.append('file', mockFile);

      const request = new NextRequest('http://localhost/api/trades/trade-1/screenshots', {
        method: 'POST',
        body: formData,
      });
      const params = Promise.resolve({ id: 'trade-1' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
    });

    it('should return 400 for file too large', async () => {
      mockPrisma.trade.findUnique.mockResolvedValue(mockTrade as any);
      mockIsValidImageType.mockReturnValue(true);
      mockIsValidImageSize.mockReturnValue(false);

      const formData = new FormData();
      const mockFile = new File(['x'.repeat(20 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      formData.append('file', mockFile);

      const request = new NextRequest('http://localhost/api/trades/trade-1/screenshots', {
        method: 'POST',
        body: formData,
      });
      const params = Promise.resolve({ id: 'trade-1' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('File too large. Maximum size is 10MB.');
    });

    it('should return 500 when storage not configured', async () => {
      mockPrisma.trade.findUnique.mockResolvedValue(mockTrade as any);
      mockUploadImage.mockRejectedValue(new Error('No cloud storage provider configured'));

      const formData = new FormData();
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('file', mockFile);

      const request = new NextRequest('http://localhost/api/trades/trade-1/screenshots', {
        method: 'POST',
        body: formData,
      });
      const params = Promise.resolve({ id: 'trade-1' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Cloud storage not configured. Please set up Cloudinary or AWS S3.');
    });

    it('should return 500 on upload failure', async () => {
      mockPrisma.trade.findUnique.mockResolvedValue(mockTrade as any);
      mockUploadImage.mockRejectedValue(new Error('Upload failed'));

      const formData = new FormData();
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('file', mockFile);

      const request = new NextRequest('http://localhost/api/trades/trade-1/screenshots', {
        method: 'POST',
        body: formData,
      });
      const params = Promise.resolve({ id: 'trade-1' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to upload screenshot');
    });
  });

  describe('DELETE /api/trades/[id]/screenshots', () => {
    it('should delete screenshot successfully', async () => {
      // Mock screenshot exists and belongs to user
      mockPrisma.screenshot.findFirst.mockResolvedValue({
        ...mockScreenshot,
        trade: mockTrade,
      } as any);

      mockDeleteImage.mockResolvedValue(true);
      mockPrisma.screenshot.delete.mockResolvedValue(mockScreenshot as any);

      const url = 'http://localhost/api/trades/trade-1/screenshots?screenshotId=screenshot-1';
      const request = new NextRequest(url, { method: 'DELETE' });
      const params = Promise.resolve({ id: 'trade-1' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Screenshot deleted successfully');
      expect(mockPrisma.screenshot.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'screenshot-1',
          tradeId: 'trade-1',
          trade: {
            userId: mockUser.id,
          },
        },
      });
      expect(mockDeleteImage).toHaveBeenCalled();
      expect(mockPrisma.screenshot.delete).toHaveBeenCalledWith({
        where: { id: 'screenshot-1' },
      });
    });

    it('should return 401 when not authenticated', async () => {
      mockRequireAuth.mockRejectedValue(new Error('Authentication required'));

      const url = 'http://localhost/api/trades/trade-1/screenshots?screenshotId=screenshot-1';
      const request = new NextRequest(url, { method: 'DELETE' });
      const params = Promise.resolve({ id: 'trade-1' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should return 400 when screenshotId is missing', async () => {
      const url = 'http://localhost/api/trades/trade-1/screenshots';
      const request = new NextRequest(url, { method: 'DELETE' });
      const params = Promise.resolve({ id: 'trade-1' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Screenshot ID is required');
    });

    it('should return 404 when screenshot not found', async () => {
      mockPrisma.screenshot.findFirst.mockResolvedValue(null);

      const url = 'http://localhost/api/trades/trade-1/screenshots?screenshotId=nonexistent';
      const request = new NextRequest(url, { method: 'DELETE' });
      const params = Promise.resolve({ id: 'trade-1' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Screenshot not found');
    });

    it('should delete screenshot even if cloud storage deletion fails', async () => {
      mockPrisma.screenshot.findFirst.mockResolvedValue({
        ...mockScreenshot,
        trade: mockTrade,
      } as any);

      mockDeleteImage.mockResolvedValue(false); // Cloud deletion fails
      mockPrisma.screenshot.delete.mockResolvedValue(mockScreenshot as any);

      const url = 'http://localhost/api/trades/trade-1/screenshots?screenshotId=screenshot-1';
      const request = new NextRequest(url, { method: 'DELETE' });
      const params = Promise.resolve({ id: 'trade-1' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrisma.screenshot.delete).toHaveBeenCalled();
    });

    it('should return 500 on database error', async () => {
      mockPrisma.screenshot.findFirst.mockResolvedValue({
        ...mockScreenshot,
        trade: mockTrade,
      } as any);

      mockPrisma.screenshot.delete.mockRejectedValue(new Error('Database error'));

      const url = 'http://localhost/api/trades/trade-1/screenshots?screenshotId=screenshot-1';
      const request = new NextRequest(url, { method: 'DELETE' });
      const params = Promise.resolve({ id: 'trade-1' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to delete screenshot');
    });
  });
});

