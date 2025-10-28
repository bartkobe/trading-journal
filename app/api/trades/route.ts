import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/db';
import { tradeSchema, tradeFilterSchema } from '@/lib/validation';
import { addCalculationsToAll } from '@/lib/trades';

/**
 * POST /api/trades
 * Create a new trade
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
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
    const { tags, ...tradeData } = data;

    // Create trade
    const trade = await prisma.trade.create({
      data: {
        ...tradeData,
        userId: user.id,
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

    // Handle tags if provided
    if (tags && tags.length > 0) {
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
            tradeId: trade.id,
            tagId: tag.id,
          },
        });
      }

      // Fetch updated trade with tags
      const updatedTrade = await prisma.trade.findUnique({
        where: { id: trade.id },
        include: {
          screenshots: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Trade created successfully',
          trade: updatedTrade,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Trade created successfully',
        trade,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create trade error:', error);

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
        error: 'Failed to create trade',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/trades
 * List all trades with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const filterData = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      assetType: searchParams.get('assetType') || undefined,
      symbol: searchParams.get('symbol') || undefined,
      strategyName: searchParams.get('strategyName') || undefined,
      setupType: searchParams.get('setupType') || undefined,
      outcome: searchParams.get('outcome') || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
      sortBy: searchParams.get('sortBy') || 'date',
      sortOrder: searchParams.get('sortOrder') || 'desc',
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    // Validate filters
    const validationResult = tradeFilterSchema.safeParse(filterData);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid filter parameters',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const filters = validationResult.data;

    // Build where clause
    const where: any = {
      userId: user.id,
    };

    if (filters.startDate) {
      where.entryDate = { ...where.entryDate, gte: new Date(filters.startDate) };
    }

    if (filters.endDate) {
      where.entryDate = { ...where.entryDate, lte: new Date(filters.endDate) };
    }

    if (filters.assetType) {
      where.assetType = filters.assetType;
    }

    if (filters.symbol) {
      where.symbol = { contains: filters.symbol, mode: 'insensitive' };
    }

    if (filters.strategyName) {
      where.strategyName = { contains: filters.strategyName, mode: 'insensitive' };
    }

    if (filters.setupType) {
      where.setupType = { contains: filters.setupType, mode: 'insensitive' };
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            name: {
              in: filters.tags,
            },
          },
        },
      };
    }

    // Build order by
    const orderBy: any = {};
    switch (filters.sortBy) {
      case 'date':
        orderBy.entryDate = filters.sortOrder;
        break;
      case 'symbol':
        orderBy.symbol = filters.sortOrder;
        break;
      default:
        orderBy.entryDate = filters.sortOrder;
    }

    // Fetch trades
    const [trades, total] = await Promise.all([
      prisma.trade.findMany({
        where,
        orderBy,
        take: filters.limit,
        skip: filters.offset,
        include: {
          screenshots: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
      prisma.trade.count({ where }),
    ]);

    // Add calculations to trades
    const tradesWithCalculations = addCalculationsToAll(trades);

    // Filter by outcome if specified (calculated field)
    let filteredTrades = tradesWithCalculations;
    if (filters.outcome) {
      filteredTrades = tradesWithCalculations.filter((t) => t.outcome === filters.outcome);
    }

    // Sort by P&L if specified (calculated field)
    if (filters.sortBy === 'pnl' || filters.sortBy === 'pnlPercent') {
      filteredTrades = [...filteredTrades].sort((a, b) => {
        const aValue = filters.sortBy === 'pnl' ? a.netPnl : a.netPnlPercent;
        const bValue = filters.sortBy === 'pnl' ? b.netPnl : b.netPnlPercent;
        return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      });
    }

    return NextResponse.json({
      success: true,
      trades: filteredTrades,
      total,
      limit: filters.limit,
      offset: filters.offset,
      hasMore: filters.offset + filteredTrades.length < total,
    });
  } catch (error) {
    console.error('List trades error:', error);

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
        error: 'Failed to fetch trades',
      },
      { status: 500 }
    );
  }
}

