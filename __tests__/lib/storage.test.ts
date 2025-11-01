import {
  uploadImage,
  deleteImage,
  getStorageProviderName,
  isValidImageType,
  isValidImageSize,
  sanitizeFilename,
} from '@/lib/storage';

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
});

// Mock cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

// Mock AWS S3
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  PutObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
}));

describe('Storage Utilities', () => {
  describe('Storage Provider Detection', () => {
    it('should return "cloudinary" when Cloudinary credentials are set', () => {
      process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
      process.env.CLOUDINARY_API_KEY = 'test-key';
      process.env.CLOUDINARY_API_SECRET = 'test-secret';

      // Re-import to get fresh module with new env
      const { getStorageProviderName } = require('@/lib/storage');
      expect(getStorageProviderName()).toBe('cloudinary');
    });

    it('should return "s3" when AWS S3 credentials are set', () => {
      process.env.AWS_ACCESS_KEY_ID = 'test-key';
      process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
      process.env.AWS_REGION = 'us-east-1';
      process.env.AWS_S3_BUCKET = 'test-bucket';

      // Clear Cloudinary credentials
      delete process.env.CLOUDINARY_CLOUD_NAME;
      delete process.env.CLOUDINARY_API_KEY;
      delete process.env.CLOUDINARY_API_SECRET;

      // Re-import to get fresh module with new env
      const { getStorageProviderName } = require('@/lib/storage');
      expect(getStorageProviderName()).toBe('s3');
    });

    it('should return "none" when no credentials are set', () => {
      delete process.env.CLOUDINARY_CLOUD_NAME;
      delete process.env.CLOUDINARY_API_KEY;
      delete process.env.CLOUDINARY_API_SECRET;
      delete process.env.AWS_ACCESS_KEY_ID;
      delete process.env.AWS_SECRET_ACCESS_KEY;
      delete process.env.AWS_REGION;
      delete process.env.AWS_S3_BUCKET;

      const { getStorageProviderName } = require('@/lib/storage');
      expect(getStorageProviderName()).toBe('none');
    });

    it('should prioritize Cloudinary over S3 when both are configured', () => {
      process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
      process.env.CLOUDINARY_API_KEY = 'test-key';
      process.env.CLOUDINARY_API_SECRET = 'test-secret';
      process.env.AWS_ACCESS_KEY_ID = 'test-key';
      process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
      process.env.AWS_REGION = 'us-east-1';
      process.env.AWS_S3_BUCKET = 'test-bucket';

      const { getStorageProviderName } = require('@/lib/storage');
      expect(getStorageProviderName()).toBe('cloudinary');
    });
  });

  describe('isValidImageType', () => {
    it('should return true for valid image types', () => {
      expect(isValidImageType('image/jpeg')).toBe(true);
      expect(isValidImageType('image/jpg')).toBe(true);
      expect(isValidImageType('image/png')).toBe(true);
      expect(isValidImageType('image/gif')).toBe(true);
      expect(isValidImageType('image/webp')).toBe(true);
    });

    it('should return false for invalid image types', () => {
      expect(isValidImageType('image/bmp')).toBe(false);
      expect(isValidImageType('image/tiff')).toBe(false);
      expect(isValidImageType('text/plain')).toBe(false);
      expect(isValidImageType('application/pdf')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(isValidImageType('IMAGE/JPEG')).toBe(true);
      expect(isValidImageType('Image/Png')).toBe(true);
    });
  });

  describe('isValidImageSize', () => {
    it('should return true for files under the default limit (10MB)', () => {
      expect(isValidImageSize(1024 * 1024)).toBe(true); // 1MB
      expect(isValidImageSize(5 * 1024 * 1024)).toBe(true); // 5MB
      expect(isValidImageSize(10 * 1024 * 1024)).toBe(true); // 10MB
    });

    it('should return false for files over the default limit (10MB)', () => {
      expect(isValidImageSize(11 * 1024 * 1024)).toBe(false); // 11MB
      expect(isValidImageSize(50 * 1024 * 1024)).toBe(false); // 50MB
    });

    it('should respect custom max size', () => {
      expect(isValidImageSize(1024 * 1024, 2)).toBe(true); // 1MB with 2MB limit
      expect(isValidImageSize(3 * 1024 * 1024, 2)).toBe(false); // 3MB with 2MB limit
    });
  });

  describe('sanitizeFilename', () => {
    it('should convert to lowercase', () => {
      expect(sanitizeFilename('MyFile.JPG')).toBe('myfile.jpg');
    });

    it('should replace invalid characters with dashes', () => {
      expect(sanitizeFilename('file@#$%name.png')).toBe('file-name.png');
    });

    it('should collapse multiple dashes', () => {
      expect(sanitizeFilename('file---name.png')).toBe('file-name.png');
    });

    it('should remove leading and trailing dashes', () => {
      expect(sanitizeFilename('-file-name-')).toBe('file-name');
    });

    it('should preserve dots and numbers', () => {
      expect(sanitizeFilename('my.file123.png')).toBe('my.file123.png');
    });

    it('should handle empty string', () => {
      expect(sanitizeFilename('')).toBe('');
    });
  });

  describe('uploadImage', () => {
    const { uploadImage } = require('@/lib/storage');

    it('should throw error when no storage provider is configured', async () => {
      delete process.env.CLOUDINARY_CLOUD_NAME;
      delete process.env.CLOUDINARY_API_KEY;
      delete process.env.CLOUDINARY_API_SECRET;
      delete process.env.AWS_ACCESS_KEY_ID;
      delete process.env.AWS_SECRET_ACCESS_KEY;

      await expect(uploadImage(Buffer.from('test'), 'test.jpg')).rejects.toThrow(
        'No cloud storage provider configured'
      );
    });

    // Note: Cloudinary and S3 upload tests would require mocking the external services
    // These are integration tests that would be better suited for e2e testing
    // or with proper mocking of the cloudinary and S3 SDKs
  });

  describe('deleteImage', () => {
    it('should return false when no storage provider is configured', async () => {
      delete process.env.CLOUDINARY_CLOUD_NAME;
      delete process.env.CLOUDINARY_API_KEY;
      delete process.env.CLOUDINARY_API_SECRET;
      delete process.env.AWS_ACCESS_KEY_ID;
      delete process.env.AWS_SECRET_ACCESS_KEY;

      const { deleteImage } = require('@/lib/storage');
      const result = await deleteImage('test-public-id');
      expect(result).toBe(false);
    });

    // Note: Cloudinary and S3 delete tests would require mocking the external services
  });
});

