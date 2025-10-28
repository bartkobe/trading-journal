import { v2 as cloudinary } from 'cloudinary';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Storage provider type
type StorageProvider = 'cloudinary' | 's3' | 'none';

// Determine which storage provider to use based on environment variables
const getStorageProvider = (): StorageProvider => {
  if (
    process.env['CLOUDINARY_CLOUD_NAME'] &&
    process.env['CLOUDINARY_API_KEY'] &&
    process.env['CLOUDINARY_API_SECRET']
  ) {
    return 'cloudinary';
  }

  if (
    process.env['AWS_ACCESS_KEY_ID'] &&
    process.env['AWS_SECRET_ACCESS_KEY'] &&
    process.env['AWS_REGION'] &&
    process.env['AWS_S3_BUCKET']
  ) {
    return 's3';
  }

  return 'none';
};

const STORAGE_PROVIDER = getStorageProvider();

// Initialize Cloudinary
if (STORAGE_PROVIDER === 'cloudinary') {
  cloudinary.config({
    cloud_name: process.env['CLOUDINARY_CLOUD_NAME'],
    api_key: process.env['CLOUDINARY_API_KEY'],
    api_secret: process.env['CLOUDINARY_API_SECRET'],
  });
}

// Initialize AWS S3
let s3Client: S3Client | null = null;
if (STORAGE_PROVIDER === 's3') {
  s3Client = new S3Client({
    region: process.env['AWS_REGION']!,
    credentials: {
      accessKeyId: process.env['AWS_ACCESS_KEY_ID']!,
      secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY']!,
    },
  });
}

export interface UploadResult {
  url: string;
  publicId?: string;
  filename: string;
  fileSize?: number;
  mimeType?: string;
}

/**
 * Upload an image file to cloud storage
 * @param file - File buffer or base64 string
 * @param filename - Original filename
 * @param folder - Optional folder path (e.g., 'trades/screenshots')
 * @returns Upload result with URL and metadata
 */
export async function uploadImage(
  file: Buffer | string,
  filename: string,
  folder: string = 'trades/screenshots'
): Promise<UploadResult> {
  if (STORAGE_PROVIDER === 'none') {
    throw new Error(
      'No cloud storage provider configured. Please set up Cloudinary or AWS S3 credentials in .env'
    );
  }

  if (STORAGE_PROVIDER === 'cloudinary') {
    return uploadToCloudinary(file, filename, folder);
  }

  if (STORAGE_PROVIDER === 's3') {
    return uploadToS3(file, filename, folder);
  }

  throw new Error('Invalid storage provider');
}

/**
 * Delete an image from cloud storage
 * @param publicId - Cloudinary public_id or S3 key
 * @returns Success boolean
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  if (STORAGE_PROVIDER === 'none') {
    return false;
  }

  try {
    if (STORAGE_PROVIDER === 'cloudinary') {
      return await deleteFromCloudinary(publicId);
    }

    if (STORAGE_PROVIDER === 's3') {
      return await deleteFromS3(publicId);
    }

    return false;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}

/**
 * Get the current storage provider
 */
export function getStorageProviderName(): string {
  return STORAGE_PROVIDER;
}

// ============================================================================
// Cloudinary Implementation
// ============================================================================

async function uploadToCloudinary(
  file: Buffer | string,
  filename: string,
  folder: string
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: 'image' as const,
      public_id: `${Date.now()}-${filename.replace(/\.[^/.]+$/, '')}`,
    };

    // If file is a Buffer, convert to base64
    const fileData =
      typeof file === 'string' ? file : `data:image/png;base64,${file.toString('base64')}`;

    cloudinary.uploader.upload(fileData, uploadOptions, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      if (!result) {
        reject(new Error('Upload failed: No result returned'));
        return;
      }

      resolve({
        url: result.secure_url,
        publicId: result.public_id,
        filename,
        fileSize: result.bytes,
        mimeType: `image/${result.format}`,
      });
    });
  });
}

async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    return false;
  }
}

// ============================================================================
// AWS S3 Implementation
// ============================================================================

async function uploadToS3(
  file: Buffer | string,
  filename: string,
  folder: string
): Promise<UploadResult> {
  if (!s3Client) {
    throw new Error('S3 client not initialized');
  }

  const bucket = process.env['AWS_S3_BUCKET']!;
  const key = `${folder}/${Date.now()}-${filename}`;

  // Convert base64 string to Buffer if necessary
  const fileBuffer =
    typeof file === 'string'
      ? Buffer.from(file.replace(/^data:image\/\w+;base64,/, ''), 'base64')
      : file;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fileBuffer,
    ContentType: 'image/jpeg', // Default, should be determined from file
  });

  await s3Client.send(command);

  // Generate public URL
  const url = `https://${bucket}.s3.${process.env['AWS_REGION']}.amazonaws.com/${key}`;

  return {
    url,
    publicId: key,
    filename,
    fileSize: fileBuffer.length,
    mimeType: 'image/jpeg',
  };
}

async function deleteFromS3(key: string): Promise<boolean> {
  if (!s3Client) {
    return false;
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env['AWS_S3_BUCKET']!,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('S3 deletion error:', error);
    return false;
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Validate image file type
 */
export function isValidImageType(mimeType: string): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(mimeType.toLowerCase());
}

/**
 * Validate image file size (max 10MB by default)
 */
export function isValidImageSize(size: number, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return size <= maxSizeBytes;
}

/**
 * Generate a safe filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
