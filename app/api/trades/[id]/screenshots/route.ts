import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { uploadImage, isValidImageType, isValidImageSize } from '@/lib/storage';
import prisma from '@/lib/db';

// Maximum number of screenshots allowed per trade
const MAX_SCREENSHOTS_PER_TRADE = 5;

/**
 * POST /api/trades/[id]/screenshots
 * Upload screenshots for a trade
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Require authentication
    const user = await requireAuth();
    const { id: tradeId } = await params;

    // Verify trade exists and user owns it
    const trade = await prisma.trade.findUnique({
      where: {
        id: tradeId,
        userId: user.id,
      },
    });

    if (!trade) {
      return NextResponse.json(
        {
          error: 'Trade not found',
        },
        { status: 404 }
      );
    }

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

    // Validate max files limit
    const existingScreenshots = await prisma.screenshot.count({
      where: { tradeId },
    });

    if (existingScreenshots >= MAX_SCREENSHOTS_PER_TRADE) {
      return NextResponse.json(
        {
          error: `Maximum ${MAX_SCREENSHOTS_PER_TRADE} screenshots per trade. Trade already has ${existingScreenshots} screenshot(s).`,
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to cloud storage (empty folder = root of bucket)
    const uploadResult = await uploadImage(buffer, file.name, '');

    // Save screenshot metadata to database
    const screenshot = await prisma.screenshot.create({
      data: {
        tradeId,
        url: uploadResult.url,
        filename: uploadResult.filename,
        fileSize: uploadResult.fileSize ?? null,
        mimeType: uploadResult.mimeType ?? null,
      },
    });

    return NextResponse.json(
      {
        screenshot,
        message: 'Screenshot uploaded successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload screenshot error:', error);
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
          error: 'Failed to upload screenshot',
          details: error.message,
          connectionInfo: connectionInfo || null,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to upload screenshot',
        details: String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/trades/[id]/screenshots
 * Delete a screenshot (query param: screenshotId)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const user = await requireAuth();
    const { id: tradeId } = await params;

    // Get screenshot ID from query params
    const { searchParams } = new URL(request.url);
    const screenshotId = searchParams.get('screenshotId');

    if (!screenshotId) {
      return NextResponse.json(
        {
          error: 'Screenshot ID is required',
        },
        { status: 400 }
      );
    }

    // Verify screenshot exists and belongs to user's trade
    const screenshot = await prisma.screenshot.findFirst({
      where: {
        id: screenshotId,
        tradeId,
        trade: {
          userId: user.id,
        },
      },
    });

    if (!screenshot) {
      return NextResponse.json(
        {
          error: 'Screenshot not found',
        },
        { status: 404 }
      );
    }

    // Delete from cloud storage (best effort - don't fail if this fails)
    try {
      const { deleteImage } = await import('@/lib/storage');
      if (screenshot.url) {
        // Extract public ID from URL or use the full URL
        const publicId = screenshot.url.split('/').pop()?.split('.')[0] || screenshot.url;
        await deleteImage(publicId);
      }
    } catch (storageError) {
      console.error('Failed to delete from cloud storage:', storageError);
      // Continue with database deletion even if cloud deletion fails
    }

    // Delete from database
    await prisma.screenshot.delete({
      where: { id: screenshotId },
    });

    return NextResponse.json({
      success: true,
      message: 'Screenshot deleted successfully',
    });
  } catch (error) {
    console.error('Delete screenshot error:', error);

    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json(
          {
            error: 'Authentication required',
          },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to delete screenshot',
      },
      { status: 500 }
    );
  }
}
