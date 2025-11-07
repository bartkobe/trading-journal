import { v2 as cloudinary } from 'cloudinary';
import { S3Client, PutObjectCommand, DeleteObjectCommand, CopyObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Storage provider type
type StorageProvider = 'cloudinary' | 's3' | 'supabase-s3' | 'none';

// Determine which storage provider to use based on environment variables
// This is called at runtime to ensure environment variables are available
const getStorageProvider = (): StorageProvider => {
  // Check Supabase Storage via S3 API first (since user is already using Supabase for database)
  const hasSupabaseStorage = !!(
    process.env['SUPABASE_STORAGE_ENDPOINT'] &&
    process.env['SUPABASE_STORAGE_ACCESS_KEY_ID'] &&
    process.env['SUPABASE_STORAGE_SECRET_ACCESS_KEY'] &&
    process.env['SUPABASE_STORAGE_BUCKET'] &&
    process.env['SUPABASE_STORAGE_REGION']
  );
  
  // Debug logging (only log first few chars of sensitive values)
  if (process.env.NODE_ENV !== 'production' || process.env.DEBUG_STORAGE === 'true') {
    console.log('Storage provider check:', {
      hasSupabaseStorage,
      hasEndpoint: !!process.env['SUPABASE_STORAGE_ENDPOINT'],
      hasAccessKey: !!process.env['SUPABASE_STORAGE_ACCESS_KEY_ID'],
      hasSecretKey: !!process.env['SUPABASE_STORAGE_SECRET_ACCESS_KEY'],
      hasBucket: !!process.env['SUPABASE_STORAGE_BUCKET'],
      hasRegion: !!process.env['SUPABASE_STORAGE_REGION'],
      endpoint: process.env['SUPABASE_STORAGE_ENDPOINT']?.substring(0, 30) + '...',
      accessKeyPrefix: process.env['SUPABASE_STORAGE_ACCESS_KEY_ID']?.substring(0, 8) + '...',
      bucket: process.env['SUPABASE_STORAGE_BUCKET'],
      region: process.env['SUPABASE_STORAGE_REGION'],
    });
  }
  
  if (hasSupabaseStorage) {
    return 'supabase-s3';
  }

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

// Lazy initialization - get provider at runtime instead of module load time
let _storageProvider: StorageProvider | null = null;
const getStorageProviderCached = (): StorageProvider => {
  if (_storageProvider === null) {
    _storageProvider = getStorageProvider();
  }
  return _storageProvider;
};

// Initialize Cloudinary (lazy initialization)
let cloudinaryInitialized = false;
const initializeCloudinary = () => {
  if (!cloudinaryInitialized && getStorageProviderCached() === 'cloudinary') {
    cloudinary.config({
      cloud_name: process.env['CLOUDINARY_CLOUD_NAME'] as string,
      api_key: process.env['CLOUDINARY_API_KEY'] as string,
      api_secret: process.env['CLOUDINARY_API_SECRET'] as string,
    });
    cloudinaryInitialized = true;
  }
};

// Initialize AWS S3 (for regular S3 or Supabase Storage via S3 API) - lazy initialization
let s3Client: S3Client | null = null;
const getS3Client = (): S3Client | null => {
  const provider = getStorageProviderCached();
  if (provider === 's3' || provider === 'supabase-s3') {
    if (!s3Client) {
      const isSupabase = provider === 'supabase-s3';
      
      // Get and trim environment variables to avoid whitespace issues
      const accessKeyId = (isSupabase
        ? process.env['SUPABASE_STORAGE_ACCESS_KEY_ID']
        : process.env['AWS_ACCESS_KEY_ID'])?.trim();
      const secretAccessKey = (isSupabase
        ? process.env['SUPABASE_STORAGE_SECRET_ACCESS_KEY']
        : process.env['AWS_SECRET_ACCESS_KEY'])?.trim();
      const region = (isSupabase 
        ? process.env['SUPABASE_STORAGE_REGION']
        : process.env['AWS_REGION'])?.trim();
      const endpoint = (isSupabase 
        ? process.env['SUPABASE_STORAGE_ENDPOINT']
        : undefined)?.trim();
      
      // Debug logging
      if (process.env.NODE_ENV !== 'production' || process.env.DEBUG_STORAGE === 'true') {
        console.log('Initializing S3 client:', {
          provider,
          isSupabase,
          region,
          endpoint: endpoint?.substring(0, 50) + '...',
          accessKeyIdPrefix: accessKeyId?.substring(0, 8) + '...',
          hasAccessKey: !!accessKeyId,
          hasSecretKey: !!secretAccessKey,
        });
      }
      
      if (!accessKeyId || !secretAccessKey || !region) {
        console.error('Missing S3 credentials:', {
          hasAccessKey: !!accessKeyId,
          hasSecretKey: !!secretAccessKey,
          hasRegion: !!region,
          accessKeyLength: accessKeyId?.length || 0,
          secretKeyLength: secretAccessKey?.length || 0,
          regionValue: region,
          envKeys: Object.keys(process.env).filter(k => k.includes('STORAGE') || k.includes('AWS')),
        });
        throw new Error('S3 credentials not configured - missing required environment variables');
      }
      
      // Log the actual values being used (first few chars only for security)
      console.log('Using S3 credentials:', {
        accessKeyIdPrefix: accessKeyId.substring(0, 8) + '...',
        accessKeyIdLength: accessKeyId.length,
        secretKeyLength: secretAccessKey.length,
        region,
        endpoint: endpoint?.substring(0, 50) + '...',
      });
      
      s3Client = new S3Client({
        region,
        endpoint,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
        forcePathStyle: isSupabase ? true : false, // Supabase requires path-style URLs
      });
    }
  }
  return s3Client;
};

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
 * @param folder - Optional folder path (e.g., 'temp' for temp folder, '' for root)
 * @returns Upload result with URL and metadata
 */
export async function uploadImage(
  file: Buffer | string,
  filename: string,
  folder: string = ''
): Promise<UploadResult> {
  const provider = getStorageProviderCached();
  
  if (provider === 'none') {
    throw new Error(
      'No cloud storage provider configured. Please set up Supabase Storage (S3 API), Cloudinary, or AWS S3 credentials in environment variables.'
    );
  }

  if (provider === 'supabase-s3' || provider === 's3') {
    return uploadToS3(file, filename, folder);
  }

  if (provider === 'cloudinary') {
    initializeCloudinary();
    return uploadToCloudinary(file, filename, folder);
  }

  throw new Error('Invalid storage provider');
}

/**
 * Delete an image from cloud storage
 * @param publicId - Cloudinary public_id or S3 key
 * @returns Success boolean
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  const provider = getStorageProviderCached();
  
  if (provider === 'none') {
    return false;
  }

  try {
    if (provider === 'supabase-s3' || provider === 's3') {
      return await deleteFromS3(publicId);
    }

    if (provider === 'cloudinary') {
      initializeCloudinary();
      return await deleteFromCloudinary(publicId);
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
  return getStorageProviderCached();
}

/**
 * Move an image from one path to another in cloud storage
 * Used to move files from temporary storage to permanent storage
 * @param publicId - Current public_id (Cloudinary) or key (S3) of the file
 * @param fromFolder - Source folder path (e.g., 'temp' or '' for root)
 * @param toFolder - Destination folder path (e.g., '' for root)
 * @returns New publicId/key and URL after move
 */
export async function moveImage(
  publicId: string,
  fromFolder: string,
  toFolder: string
): Promise<{ publicId: string; url: string }> {
  const provider = getStorageProviderCached();
  
  if (provider === 'none') {
    throw new Error(
      'No cloud storage provider configured. Please set up Supabase Storage (S3 API), Cloudinary, or AWS S3 credentials in environment variables.'
    );
  }

  if (provider === 'supabase-s3' || provider === 's3') {
    return moveInS3(publicId, fromFolder, toFolder);
  }

  if (provider === 'cloudinary') {
    initializeCloudinary();
    return moveInCloudinary(publicId, fromFolder, toFolder);
  }

  throw new Error('Invalid storage provider');
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
  const client = getS3Client();
  if (!client) {
    throw new Error('S3 client not initialized');
  }

  const provider = getStorageProviderCached();
  const isSupabase = provider === 'supabase-s3';
  const bucket = isSupabase
    ? process.env['SUPABASE_STORAGE_BUCKET']!
    : process.env['AWS_S3_BUCKET']!;
  // Build key: if folder is empty, just use filename; otherwise folder/filename
  const key = folder ? `${folder}/${Date.now()}-${filename}` : `${Date.now()}-${filename}`;

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

  await client.send(command);

  // Generate URL - use signed URL for private buckets, public URL for public buckets
  let url: string;
  if (isSupabase) {
    // For Supabase, try to generate a signed URL (works for both public and private buckets)
    // Signed URLs are valid for 1 year (max for S3)
    try {
      const getObjectCommand = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      url = await getSignedUrl(client, getObjectCommand, { expiresIn: 31536000 }); // 1 year
    } catch (error) {
      // Fallback to public URL format if signed URL generation fails
      const endpoint = process.env['SUPABASE_STORAGE_ENDPOINT']!;
      const baseUrl = endpoint.replace('/storage/v1/s3', '');
      url = `${baseUrl}/storage/v1/object/public/${bucket}/${key}`;
    }
  } else {
      // Regular S3 - generate signed URL
      const getObjectCommand = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      url = await getSignedUrl(client, getObjectCommand, { expiresIn: 31536000 }); // 1 year
    }

  return {
    url,
    publicId: key,
    filename,
    fileSize: fileBuffer.length,
    mimeType: 'image/jpeg',
  };
}

async function deleteFromS3(key: string): Promise<boolean> {
  const client = getS3Client();
  if (!client) {
    return false;
  }

  try {
    const provider = getStorageProviderCached();
    const isSupabase = provider === 'supabase-s3';
    const bucket = isSupabase
      ? process.env['SUPABASE_STORAGE_BUCKET']!
      : process.env['AWS_S3_BUCKET']!;

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await client.send(command);
    return true;
  } catch (error) {
    console.error('S3 deletion error:', error);
    return false;
  }
}

/**
 * Move file in Cloudinary by renaming (which moves between folders)
 */
async function moveInCloudinary(
  publicId: string,
  fromFolder: string,
  toFolder: string
): Promise<{ publicId: string; url: string }> {
  return new Promise((resolve, reject) => {
    // Extract filename from publicId (remove folder prefix if present)
    const filename = publicId.includes('/') ? publicId.split('/').pop()! : publicId;
    const newPublicId = `${toFolder}/${filename}`;

    cloudinary.uploader.rename(publicId, newPublicId, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      if (!result) {
        reject(new Error('Move failed: No result returned'));
        return;
      }

      resolve({
        publicId: result.public_id,
        url: result.secure_url,
      });
    });
  });
}

/**
 * Move file in S3 by copying to new location and deleting original
 */
async function moveInS3(
  key: string,
  fromFolder: string,
  toFolder: string
): Promise<{ publicId: string; url: string }> {
  const client = getS3Client();
  if (!client) {
    throw new Error('S3 client not initialized');
  }

  const provider = getStorageProviderCached();
  const isSupabase = provider === 'supabase-s3';
  const bucket = isSupabase
    ? process.env['SUPABASE_STORAGE_BUCKET']!
    : process.env['AWS_S3_BUCKET']!;

  // Extract filename from key (remove folder prefix if present)
  const filename = key.includes('/') ? key.split('/').pop()! : key;
  // Build new key: if toFolder is empty, just use filename; otherwise toFolder/filename
  const newKey = toFolder ? `${toFolder}/${filename}` : filename;

  try {
    // Copy object to new location
    const copyCommand = new CopyObjectCommand({
      Bucket: bucket,
      CopySource: `${bucket}/${key}`,
      Key: newKey,
    });

    await client.send(copyCommand);

    // Delete original object
    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await client.send(deleteCommand);

    // Generate new URL - use signed URL for private buckets
    let url: string;
    if (isSupabase) {
      // For Supabase, generate a signed URL (works for both public and private buckets)
      try {
        const getObjectCommand = new GetObjectCommand({
          Bucket: bucket,
          Key: newKey,
        });
        url = await getSignedUrl(client, getObjectCommand, { expiresIn: 31536000 }); // 1 year
      } catch (error) {
        // Fallback to public URL format if signed URL generation fails
        const endpoint = process.env['SUPABASE_STORAGE_ENDPOINT']!;
        const baseUrl = endpoint.replace('/storage/v1/s3', '');
        url = `${baseUrl}/storage/v1/object/public/${bucket}/${newKey}`;
      }
    } else {
      // Regular S3 - generate signed URL
      const getObjectCommand = new GetObjectCommand({
        Bucket: bucket,
        Key: newKey,
      });
      url = await getSignedUrl(client, getObjectCommand, { expiresIn: 31536000 }); // 1 year
    }

    return {
      publicId: newKey,
      url,
    };
  } catch (error) {
    console.error('S3 move error:', error);
    throw new Error(`Failed to move file in S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
