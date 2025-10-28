import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/db';
import { uploadImage, isValidImageType, isValidImageSize } from '@/lib/storage';

/**
 * POST /api/trades/[id]/screenshots
 * Upload a screenshot for a trade
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: tradeId } = await params;

    // Check if trade exists and belongs to user
    const trade = await prisma.trade.findFirst({
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

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

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

    // Validate file size (max 10MB)
    if (!isValidImageSize(file.size)) {
      return NextResponse.json(
        {
          error: 'File too large. Maximum file size is 10MB.',
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to cloud storage
    const uploadResult = await uploadImage(buffer, file.name, `trades/${tradeId}`);

    // Save screenshot to database
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
        success: true,
        message: 'Screenshot uploaded successfully',
        screenshot,
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

      if (error.message.includes('cloud storage')) {
        return NextResponse.json(
          {
            error:
              'Cloud storage not configured. Please set up Cloudinary or AWS S3 credentials.',
          },
          { status: 503 }
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
 * GET /api/trades/[id]/screenshots
 * Get all screenshots for a trade
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id: tradeId } = await params;

    // Check if trade exists and belongs to user
    const trade = await prisma.trade.findFirst({
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

    // Get all screenshots for the trade
    const screenshots = await prisma.screenshot.findMany({
      where: {
        tradeId,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      screenshots,
    });
  } catch (error) {
    console.error('Get screenshots error:', error);

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        {
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch screenshots',
      },
      { status: 500 }
    );
  }
}

