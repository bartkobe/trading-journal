import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { uploadImage, isValidImageType, isValidImageSize } from '@/lib/storage';
import prisma from '@/lib/db';

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

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to cloud storage
    const uploadResult = await uploadImage(buffer, file.name, 'trades/screenshots');

    // Save screenshot metadata to database
    const screenshot = await prisma.screenshot.create({
      data: {
        tradeId,
        url: uploadResult.url,
        filename: uploadResult.filename,
        fileSize: uploadResult.fileSize,
        mimeType: uploadResult.mimeType,
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
            error: 'Cloud storage not configured. Please set up Cloudinary or AWS S3.',
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to upload screenshot',
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
