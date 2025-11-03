import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { tradeSchema, tradeFilterSchema } from '@/lib/validation';
import { enrichTradeWithCalculations, sortTrades, filterByOutcome } from '@/lib/trades';
import prisma from '@/lib/db';

/**
 * POST /api/trades
 * Create a new trade
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
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

    // Extract tags from input (array of tag names)
    const tagNames = data.tags || [];

    // Prepare trade data without tags
    const { tags: _tags, ...tradeData } = data;

    // Create the trade
    const trade = await prisma.trade.create({
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
        userId: user.id,
        entryDate: new Date(tradeData.entryDate),
        exitDate: tradeData.exitDate ? new Date(tradeData.exitDate) : null,
        exitPrice: tradeData.exitPrice ?? null,
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

    // Process tags if provided
    if (tagNames.length > 0) {
      // Create or connect tags
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
            tradeId: trade.id,
            tagId: tag.id,
          },
        });
      }

      // Refetch trade with tags
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

      if (updatedTrade) {
        const enrichedTrade = enrichTradeWithCalculations(updatedTrade);

        return NextResponse.json(
          {
            trade: enrichedTrade,
            message: 'Trade created successfully',
          },
          { status: 201 }
        );
      }
    }

    // Return enriched trade with calculations
    const enrichedTrade = enrichTradeWithCalculations(trade);

    return NextResponse.json(
      {
        trade: enrichedTrade,
        message: 'Trade created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create trade error:', error);

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
        error: 'Failed to create trade',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/trades
 * List all trades with filtering, sorting, and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Parse query parameters
    const { searchParams } = new URL(request.url);

    const filterData = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      assetType: searchParams.get('assetType') || undefined,
      symbol: searchParams.get('symbol') || undefined,
      strategyName: searchParams.get('strategyName') || undefined,
      setupType: searchParams.get('setupType') || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
      outcome: searchParams.get('outcome') || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') || 'date',
      sortOrder: searchParams.get('sortOrder') || 'desc',
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };

    // Validate filter data
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
      where.entryDate = {
        ...where.entryDate,
        gte: filters.startDate,
      };
    }

    if (filters.endDate) {
      where.entryDate = {
        ...where.entryDate,
        lte: filters.endDate,
      };
    }

    if (filters.assetType) {
      where.assetType = filters.assetType;
    }

    if (filters.symbol) {
      where.symbol = {
        contains: filters.symbol,
        mode: 'insensitive',
      };
    }

    if (filters.strategyName) {
      where.strategyName = {
        contains: filters.strategyName,
        mode: 'insensitive',
      };
    }

    if (filters.setupType) {
      where.setupType = {
        contains: filters.setupType,
        mode: 'insensitive',
      };
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

    // Free-text search across symbol, strategyName, notes, and tag names
    if (filters.search) {
      const q = filters.search;
      where.AND = where.AND || [];
      where.AND.push({
        OR: [
          { symbol: { contains: q, mode: 'insensitive' } },
          { strategyName: { contains: q, mode: 'insensitive' } },
          { notes: { contains: q, mode: 'insensitive' } },
          {
            tags: {
              some: {
                tag: {
                  name: { contains: q, mode: 'insensitive' },
                },
              },
            },
          },
        ],
      });
    }

    // Fetch trades
    const [trades, total] = await Promise.all([
      prisma.trade.findMany({
        where,
        include: {
          screenshots: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
        skip: filters.offset,
        take: filters.limit,
        orderBy:
          filters.sortBy === 'date'
            ? { entryDate: filters.sortOrder }
            : filters.sortBy === 'symbol'
              ? { symbol: filters.sortOrder }
              : { entryDate: filters.sortOrder }, // Default to date for pnl/pnlPercent (will sort in memory)
      }),
      prisma.trade.count({ where }),
    ]);

    // Enrich trades with calculations
    let enrichedTrades = trades.map(enrichTradeWithCalculations);

    // Filter by outcome if specified (after calculations)
    if (filters.outcome) {
      enrichedTrades = filterByOutcome(enrichedTrades, filters.outcome);
    }

    // Sort by pnl or pnlPercent if specified (requires calculations)
    if (filters.sortBy === 'pnl' || filters.sortBy === 'pnlPercent') {
      enrichedTrades = sortTrades(enrichedTrades, filters.sortBy, filters.sortOrder);
    }

    const hasMore = filters.offset + filters.limit < total;

    return NextResponse.json({
      trades: enrichedTrades,
      total,
      page: Math.floor(filters.offset / filters.limit) + 1,
      limit: filters.limit,
      hasMore,
    });
  } catch (error) {
    console.error('List trades error:', error);

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
        error: 'Failed to fetch trades',
      },
      { status: 500 }
    );
  }
}
