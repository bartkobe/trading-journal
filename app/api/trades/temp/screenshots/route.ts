import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { uploadImage, isValidImageType, isValidImageSize } from '@/lib/storage';
import { randomUUID } from 'crypto';

/**
 * POST /api/trades/temp/screenshots
 * Upload a file to temporary storage (before trade is created)
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        {
          error: 'No file provided',
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!isValidImageType(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.',
        },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (!isValidImageSize(file.size)) {
      return NextResponse.json(
        {
          error: 'File too large. Maximum size is 10MB.',
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to temporary storage folder
    const uploadResult = await uploadImage(buffer, file.name, 'temp');

    // Generate unique temporary file ID
    const tempFileId = randomUUID();

    // Return temporary file information
    // We'll store the publicId/URL mapping when associating with trade
    return NextResponse.json(
      {
        tempFileId,
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        filename: uploadResult.filename,
        fileSize: uploadResult.fileSize ?? null,
        mimeType: uploadResult.mimeType ?? null,
        message: 'File uploaded to temporary storage successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload temp screenshot error:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json(
          {
            error: 'Authentication required',
          },
          { status: 401 }
        );
      }

      // Handle storage errors
      if (error.message.includes('No cloud storage provider configured')) {
        return NextResponse.json(
          {
            error: 'Cloud storage not configured. Please set up Supabase Storage (S3 API), Cloudinary, or AWS S3.',
            details: error.message,
          },
          { status: 500 }
        );
      }

      // Extract connection info if available
      const connectionInfo = (error as any).connectionInfo;

      // Return the actual error message with connection parameters
      return NextResponse.json(
        {
          error: 'Failed to upload file to temporary storage',
          details: error.message,
          connectionInfo: connectionInfo || null,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to upload file to temporary storage',
        details: String(error),
      },
      { status: 500 }
    );
  }
}


