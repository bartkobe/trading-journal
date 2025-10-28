import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { enrichTradesWithCalculations } from '@/lib/trades';
import { calculatePerformanceByDimension } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/performance
 * Returns performance breakdowns by various dimensions
 * Query params:
 * - startDate (optional): ISO date string for filtering
 * - endDate (optional): ISO date string for filtering
 * - dimension (optional): Specific dimension to return (symbol, strategy, assetType, timeOfDay, emotionalState, marketConditions, dayOfWeek)
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const dimension = searchParams.get('dimension');

    // Build where clause
    const where: any = {
      userId: user.id,
    };

    // Apply date filters if provided
    if (startDate || endDate) {
      where.entryDate = {};
      if (startDate) {
        where.entryDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.entryDate.lte = new Date(endDate);
      }
    }

    // Fetch trades from database
    const rawTrades = await prisma.trade.findMany({
      where,
      include: {
        screenshots: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        entryDate: 'asc',
      },
    });

    // Enrich trades with calculations
    const trades = enrichTradesWithCalculations(rawTrades);

    // If no trades, return empty data
    if (trades.length === 0) {
      return NextResponse.json({
        success: true,
        dateRange: {
          start: startDate || null,
          end: endDate || null,
          filtered: !!(startDate || endDate),
        },
        totalTrades: 0,
        performance: {
          bySymbol: [],
          byStrategy: [],
          bySetupType: [],
          byAssetType: [],
          byTimeOfDay: [],
          byEmotionalState: [],
          byMarketConditions: [],
          byDayOfWeek: [],
        },
      });
    }

    // Calculate performance by requested dimensions
    const dimensions = dimension
      ? [dimension]
      : [
          'symbol',
          'strategyName',
          'setupType',
          'assetType',
          'timeOfDay',
          'emotionalStateEntry',
          'marketConditions',
          'dayOfWeek',
        ];

    const performanceData: any = {};

    for (const dim of dimensions) {
      switch (dim) {
        case 'symbol':
          performanceData.bySymbol = calculatePerformanceByDimension(trades, 'symbol');
          break;
        case 'strategy':
        case 'strategyName':
          performanceData.byStrategy = calculatePerformanceByDimension(trades, 'strategyName');
          break;
        case 'setupType':
          performanceData.bySetupType = calculatePerformanceByDimension(trades, 'setupType');
          break;
        case 'assetType':
          performanceData.byAssetType = calculatePerformanceByDimension(trades, 'assetType');
          break;
        case 'timeOfDay':
          performanceData.byTimeOfDay = calculatePerformanceByDimension(trades, 'timeOfDay');
          break;
        case 'emotionalState':
        case 'emotionalStateEntry':
          performanceData.byEmotionalState = calculatePerformanceByDimension(
            trades,
            'emotionalStateEntry'
          );
          break;
        case 'marketConditions':
          performanceData.byMarketConditions = calculatePerformanceByDimension(
            trades,
            'marketConditions'
          );
          break;
        case 'dayOfWeek':
          // Calculate day of week performance
          const byDayOfWeek: any = {};
          const dayNames = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
          ];

          trades.forEach((trade) => {
            const dayOfWeek = dayNames[trade.entryDate.getDay()];
            if (!byDayOfWeek[dayOfWeek]) {
              byDayOfWeek[dayOfWeek] = [];
            }
            byDayOfWeek[dayOfWeek].push(trade);
          });

          // Calculate metrics for each day
          const dayOfWeekMetrics: any[] = [];
          Object.entries(byDayOfWeek).forEach(([day, dayTrades]: [string, any]) => {
            const totalPnl = dayTrades.reduce((sum: number, t: any) => sum + t.netPnl, 0);
            const wins = dayTrades.filter((t: any) => t.netPnl > 0).length;
            const losses = dayTrades.filter((t: any) => t.netPnl < 0).length;
            const winRate = dayTrades.length > 0 ? (wins / dayTrades.length) * 100 : 0;

            dayOfWeekMetrics.push({
              dimension: day,
              tradeCount: dayTrades.length,
              totalPnl,
              averagePnl: dayTrades.length > 0 ? totalPnl / dayTrades.length : 0,
              winningTrades: wins,
              losingTrades: losses,
              winRate,
            });
          });

          // Sort by day of week order
          performanceData.byDayOfWeek = dayOfWeekMetrics.sort((a, b) => {
            return dayNames.indexOf(a.dimension) - dayNames.indexOf(b.dimension);
          });
          break;
      }
    }

    return NextResponse.json({
      success: true,
      dateRange: {
        start: startDate || null,
        end: endDate || null,
        filtered: !!(startDate || endDate),
      },
      totalTrades: trades.length,
      performance: performanceData,
    });
  } catch (error: any) {
    console.error('Performance analytics error:', error);
    console.error('Error stack:', error.stack);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to calculate performance breakdowns',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
