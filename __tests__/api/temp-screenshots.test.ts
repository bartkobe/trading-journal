/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/trades/temp/screenshots/route';
import { requireAuth } from '@/lib/auth';

// Mock auth
jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn(),
}));

// Mock storage
jest.mock('@/lib/storage', () => ({
  uploadImage: jest.fn(),
  isValidImageType: jest.fn(),
  isValidImageSize: jest.fn(),
}));

import { uploadImage, isValidImageType, isValidImageSize } from '@/lib/storage';

const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockUploadImage = uploadImage as jest.MockedFunction<typeof uploadImage>;
const mockIsValidImageType = isValidImageType as jest.MockedFunction<typeof isValidImageType>;
const mockIsValidImageSize = isValidImageSize as jest.MockedFunction<typeof isValidImageSize>;

describe('Temporary Screenshot Upload API Endpoint', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(mockUser);
    mockIsValidImageType.mockReturnValue(true);
    mockIsValidImageSize.mockReturnValue(true);
  });

  describe('POST /api/temp/screenshots', () => {
    it('should upload file to temporary storage successfully', async () => {
      // Mock upload result
      const uploadResult = {
        url: 'https://storage.example.com/temp/test-123.jpg',
        publicId: 'temp/test-123.jpg',
        filename: 'test.jpg',
        fileSize: 1024000,
        mimeType: 'image/jpeg',
      };
      mockUploadImage.mockResolvedValue(uploadResult);

      // Create form data with file
      const formData = new FormData();
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('file', mockFile);

      const request = new NextRequest('http://localhost/api/temp/screenshots', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.tempFileId).toBeDefined();
      expect(data.url).toBe(uploadResult.url);
      expect(data.publicId).toBe(uploadResult.publicId);
      expect(data.filename).toBe('test.jpg');
      expect(data.message).toBe('File uploaded to temporary storage successfully');
      expect(mockUploadImage).toHaveBeenCalledWith(
        expect.any(Buffer),
        'test.jpg',
        'temp'
      );
    });

    it('should return 400 when no file is provided', async () => {
      const formData = new FormData();
      const request = new NextRequest('http://localhost/api/temp/screenshots', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('No file provided');
      expect(mockUploadImage).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid file type', async () => {
      mockIsValidImageType.mockReturnValue(false);

      const formData = new FormData();
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      formData.append('file', mockFile);

      const request = new NextRequest('http://localhost/api/temp/screenshots', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
      expect(mockUploadImage).not.toHaveBeenCalled();
    });

    it('should return 400 for file too large', async () => {
      mockIsValidImageSize.mockReturnValue(false);

      const formData = new FormData();
      const mockFile = new File(['x'.repeat(20 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      formData.append('file', mockFile);

      const request = new NextRequest('http://localhost/api/temp/screenshots', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('File too large. Maximum size is 10MB.');
      expect(mockUploadImage).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', async () => {
      mockRequireAuth.mockRejectedValue(new Error('Authentication required'));

      const formData = new FormData();
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('file', mockFile);

      const request = new NextRequest('http://localhost/api/temp/screenshots', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should return 500 when storage is not configured', async () => {
      mockUploadImage.mockRejectedValue(
        new Error('No cloud storage provider configured')
      );

      const formData = new FormData();
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('file', mockFile);

      const request = new NextRequest('http://localhost/api/temp/screenshots', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Cloud storage not configured. Please set up Cloudinary or AWS S3.');
    });

    it('should return 500 on upload failure', async () => {
      mockUploadImage.mockRejectedValue(new Error('Upload failed'));

      const formData = new FormData();
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('file', mockFile);

      const request = new NextRequest('http://localhost/api/temp/screenshots', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to upload file to temporary storage');
    });

    it('should generate unique tempFileId for each upload', async () => {
      const uploadResult = {
        url: 'https://storage.example.com/temp/test-123.jpg',
        publicId: 'temp/test-123.jpg',
        filename: 'test.jpg',
        fileSize: 1024000,
        mimeType: 'image/jpeg',
      };
      mockUploadImage.mockResolvedValue(uploadResult);

      const formData1 = new FormData();
      const mockFile1 = new File(['test content 1'], 'test1.jpg', { type: 'image/jpeg' });
      formData1.append('file', mockFile1);

      const formData2 = new FormData();
      const mockFile2 = new File(['test content 2'], 'test2.jpg', { type: 'image/jpeg' });
      formData2.append('file', mockFile2);

      const request1 = new NextRequest('http://localhost/api/temp/screenshots', {
        method: 'POST',
        body: formData1,
      });

      const request2 = new NextRequest('http://localhost/api/temp/screenshots', {
        method: 'POST',
        body: formData2,
      });

      const response1 = await POST(request1);
      const response2 = await POST(request2);

      const data1 = await response1.json();
      const data2 = await response2.json();

      expect(data1.tempFileId).toBeDefined();
      expect(data2.tempFileId).toBeDefined();
      expect(data1.tempFileId).not.toBe(data2.tempFileId);
    });
  });
});

