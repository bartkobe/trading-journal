import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/db';
import { tradeSchema } from '@/lib/validation';
import { addCalculations } from '@/lib/trades';

/**
 * GET /api/trades/[id]
 * Get a single trade by ID
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const trade = await prisma.trade.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        screenshots: true,
        tags: {
          include: {
            tag: true,
          },
        },
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

    // Add calculations
    const tradeWithCalculations = addCalculations(trade);

    return NextResponse.json({
      success: true,
      trade: tradeWithCalculations,
    });
  } catch (error) {
    console.error('Get trade error:', error);

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
        error: 'Failed to fetch trade',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/trades/[id]
 * Update a trade
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    // Check if trade exists and belongs to user
    const existingTrade = await prisma.trade.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingTrade) {
      return NextResponse.json(
        {
          error: 'Trade not found',
        },
        { status: 404 }
      );
    }

    // Validate input (partial validation for update)
    const validationResult = tradeSchema.partial().safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Extract tags from input
    const { tags, ...tradeData } = data;

    // Convert dates if provided
    const updateData: any = { ...tradeData };
    if (tradeData.entryDate) {
      updateData.entryDate = new Date(tradeData.entryDate);
    }
    if (tradeData.exitDate) {
      updateData.exitDate = new Date(tradeData.exitDate);
    }

    // Update trade
    const trade = await prisma.trade.update({
      where: { id },
      data: updateData,
      include: {
        screenshots: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Handle tags if provided
    if (tags !== undefined) {
      // Delete existing trade-tag relationships
      await prisma.tradeTag.deleteMany({
        where: { tradeId: id },
      });

      // Create new relationships
      if (tags.length > 0) {
        for (const tagName of tags) {
          // Find or create tag
          let tag = await prisma.tag.findUnique({
            where: { name: tagName },
          });

          if (!tag) {
            tag = await prisma.tag.create({
              data: { name: tagName },
            });
          }

          // Create trade-tag relationship
          await prisma.tradeTag.create({
            data: {
              tradeId: id,
              tagId: tag.id,
            },
          });
        }
      }

      // Fetch updated trade with tags
      const updatedTrade = await prisma.trade.findUnique({
        where: { id },
        include: {
          screenshots: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Trade updated successfully',
        trade: updatedTrade,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Trade updated successfully',
      trade,
    });
  } catch (error) {
    console.error('Update trade error:', error);

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
        error: 'Failed to update trade',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/trades/[id]
 * Delete a trade
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Check if trade exists and belongs to user
    const existingTrade = await prisma.trade.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingTrade) {
      return NextResponse.json(
        {
          error: 'Trade not found',
        },
        { status: 404 }
      );
    }

    // Delete trade (cascades to screenshots and trade-tags)
    await prisma.trade.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Trade deleted successfully',
    });
  } catch (error) {
    console.error('Delete trade error:', error);

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
        error: 'Failed to delete trade',
      },
      { status: 500 }
    );
  }
}

