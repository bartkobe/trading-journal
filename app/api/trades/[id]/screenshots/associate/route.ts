import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { moveImage } from '@/lib/storage';
import prisma from '@/lib/db';

interface TempFileInfo {
  publicId: string;
  filename: string;
  fileSize?: number;
  mimeType?: string;
}

// Maximum number of screenshots allowed per trade
const MAX_SCREENSHOTS_PER_TRADE = 5;

/**
 * POST /api/trades/[id]/screenshots/associate
 * Associate temporary files with a trade by moving them to permanent storage
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Parse request body
    const body = await request.json();
    const tempFiles: TempFileInfo[] = body.tempFiles;

    if (!Array.isArray(tempFiles) || tempFiles.length === 0) {
      return NextResponse.json(
        {
          error: 'tempFiles array is required and must not be empty',
        },
        { status: 400 }
      );
    }

    // Validate max files limit
    const existingScreenshots = await prisma.screenshot.count({
      where: { tradeId },
    });

    if (existingScreenshots + tempFiles.length > MAX_SCREENSHOTS_PER_TRADE) {
      return NextResponse.json(
        {
          error: `Maximum ${MAX_SCREENSHOTS_PER_TRADE} files per trade. Trade already has ${existingScreenshots} file(s).`,
        },
        { status: 400 }
      );
    }

    const createdScreenshots = [];
    const errors = [];

    // Process each temp file
    for (const tempFile of tempFiles) {
      try {
        // Move file from temp storage to permanent storage
        const moveResult = await moveImage(
          tempFile.publicId,
          'temp',
          ''
        );

        // Create screenshot record in database
        const screenshot = await prisma.screenshot.create({
          data: {
            tradeId,
            url: moveResult.url,
            filename: tempFile.filename,
            fileSize: tempFile.fileSize ?? null,
            mimeType: tempFile.mimeType ?? null,
          },
        });

        createdScreenshots.push(screenshot);
      } catch (error) {
        console.error(`Failed to associate file ${tempFile.filename}:`, error);
        errors.push({
          filename: tempFile.filename,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // If some files succeeded, return partial success
    if (createdScreenshots.length > 0) {
      return NextResponse.json(
        {
          screenshots: createdScreenshots,
          message: `Successfully associated ${createdScreenshots.length} file(s)`,
          ...(errors.length > 0 && {
            errors,
            warning: `${errors.length} file(s) failed to associate`,
          }),
        },
        { status: errors.length > 0 ? 207 : 201 } // 207 Multi-Status for partial success
      );
    }

    // All files failed
    return NextResponse.json(
      {
        error: 'Failed to associate any files',
        errors,
      },
      { status: 500 }
    );
  } catch (error) {
    console.error('Associate screenshots error:', error);

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
        error: 'Failed to associate screenshots',
      },
      { status: 500 }
    );
  }
}


