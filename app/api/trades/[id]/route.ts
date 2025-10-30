import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { tradeSchema } from '@/lib/validation';
import { enrichTradeWithCalculations } from '@/lib/trades';
import prisma from '@/lib/db';

/**
 * GET /api/trades/[id]
 * Fetch a single trade by ID with all details
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Require authentication
    const user = await requireAuth();
    const { id } = await params;

    // Fetch the trade
    const trade = await prisma.trade.findUnique({
      where: {
        id,
        userId: user.id, // Ensure user owns this trade
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

    // Enrich with calculations
    const enrichedTrade = enrichTradeWithCalculations(trade);

    return NextResponse.json({
      trade: enrichedTrade,
    });
  } catch (error) {
    console.error('Get trade error:', error);

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
    // Require authentication
    const user = await requireAuth();
    const { id } = await params;

    // Check if trade exists and user owns it
    const existingTrade = await prisma.trade.findUnique({
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

    const body = await request.json();

    // Validate input
    const validationResult = tradeSchema.safeParse(body);

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
    const tagNames = data.tags || [];

    // Prepare trade data without tags
    const { tags: _tags, ...tradeData } = data;

    // Update the trade
    const updatedTrade = await prisma.trade.update({
      where: { id },
      data: {
        ...tradeData,
        setupType: tradeData.setupType ?? null,
        strategyName: tradeData.strategyName ?? null,
        stopLoss: tradeData.stopLoss ?? null,
        takeProfit: tradeData.takeProfit ?? null,
        riskRewardRatio: tradeData.riskRewardRatio ?? null,
        timeOfDay: tradeData.timeOfDay ?? null,
        marketConditions: tradeData.marketConditions ?? null,
        emotionalStateEntry: tradeData.emotionalStateEntry ?? null,
        emotionalStateExit: tradeData.emotionalStateExit ?? null,
        entryDate: new Date(tradeData.entryDate),
        exitDate: new Date(tradeData.exitDate),
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

    // Update tags if provided
    if (tagNames.length >= 0) {
      // Remove all existing tag associations
      await prisma.tradeTag.deleteMany({
        where: { tradeId: id },
      });

      // Add new tag associations
      for (const tagName of tagNames) {
        // Find or create tag
        let tag = await prisma.tag.findUnique({
          where: { name: tagName },
        });

        if (!tag) {
          tag = await prisma.tag.create({
            data: { name: tagName },
          });
        }

        // Connect tag to trade
        await prisma.tradeTag.create({
          data: {
            tradeId: id,
            tagId: tag.id,
          },
        });
      }

      // Refetch trade with updated tags
      const tradeWithTags = await prisma.trade.findUnique({
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

      if (tradeWithTags) {
        const enrichedTrade = enrichTradeWithCalculations(tradeWithTags);

        return NextResponse.json({
          trade: enrichedTrade,
          message: 'Trade updated successfully',
        });
      }
    }

    // Return enriched trade
    const enrichedTrade = enrichTradeWithCalculations(updatedTrade);

    return NextResponse.json({
      trade: enrichedTrade,
      message: 'Trade updated successfully',
    });
  } catch (error) {
    console.error('Update trade error:', error);

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
    // Require authentication
    const user = await requireAuth();
    const { id } = await params;

    // Check if trade exists and user owns it
    const existingTrade = await prisma.trade.findUnique({
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

    // Delete the trade (cascade will delete screenshots and trade-tag relations)
    await prisma.trade.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Trade deleted successfully',
    });
  } catch (error) {
    console.error('Delete trade error:', error);

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
        error: 'Failed to delete trade',
      },
      { status: 500 }
    );
  }
}
