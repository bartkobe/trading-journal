import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { enrichTradesWithCalculations } from '@/lib/trades';
import { TradeWithCalculations } from '@/lib/types';
import { calculateEquityCurve, calculatePerformanceByDimension } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/charts
 * Returns chart-ready data for visualizations
 * Query params:
 * - startDate (optional): ISO date string for filtering
 * - endDate (optional): ISO date string for filtering
 * - chartType (optional): Specific chart to return (equity, distribution, breakdown)
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const chartType = searchParams.get('chartType');

    // Build where clause
    const where: any = {
      userId: user.id,
      // Exclude open trades - only include closed trades for analytics
      exitDate: {
        not: null,
      },
    };

    // Apply date filters if provided
    if (startDate || endDate) {
      where.entryDate = {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      };
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
    const allTrades = enrichTradesWithCalculations(rawTrades);

    // Filter out any trades with null netPnl (shouldn't happen if database query is correct, but ensures type safety)
    // Type guard ensures TypeScript knows netPnl is non-null
    type ClosedTrade = TradeWithCalculations & { calculations: { netPnl: number } };
    const trades = allTrades.filter((t): t is ClosedTrade => t.calculations.netPnl !== null);

    const chartData: any = {};

    // Determine which charts to generate
    const shouldGenerateAll = !chartType;

    // Equity Curve
    if (shouldGenerateAll || chartType === 'equity') {
      chartData.equityCurve = calculateEquityCurve(trades);
    }

    // Win/Loss Distribution
    if (shouldGenerateAll || chartType === 'distribution') {
      const winningTrades = trades.filter((t) => t.calculations.netPnl > 0);
      const losingTrades = trades.filter((t) => t.calculations.netPnl < 0);
      const breakevenTrades = trades.filter((t) => t.calculations.netPnl === 0);

      chartData.distribution = {
        wins: winningTrades.length,
        losses: losingTrades.length,
        breakeven: breakevenTrades.length,
        winRate: trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0,
        lossRate: trades.length > 0 ? (losingTrades.length / trades.length) * 100 : 0,
        breakevenRate: trades.length > 0 ? (breakevenTrades.length / trades.length) * 100 : 0,
      };

      // P&L distribution buckets (for histogram)
      const pnlBuckets = {
        'Loss > $500': 0,
        'Loss $100-$500': 0,
        'Loss $0-$100': 0,
        Breakeven: 0,
        'Win $0-$100': 0,
        'Win $100-$500': 0,
        'Win > $500': 0,
      };

      trades.forEach((trade) => {
        const pnl = trade.calculations.netPnl;
        if (pnl === 0) {
          pnlBuckets['Breakeven']++;
        } else if (pnl > 0) {
          if (pnl > 500) pnlBuckets['Win > $500']++;
          else if (pnl >= 100) pnlBuckets['Win $100-$500']++;
          else pnlBuckets['Win $0-$100']++;
        } else {
          if (pnl < -500) pnlBuckets['Loss > $500']++;
          else if (pnl <= -100) pnlBuckets['Loss $100-$500']++;
          else pnlBuckets['Loss $0-$100']++;
        }
      });

      chartData.pnlDistribution = Object.entries(pnlBuckets).map(([range, count]) => ({
        range,
        count,
      }));
    }

    // Performance Breakdowns
    if (shouldGenerateAll || chartType === 'breakdown') {
      // By Asset Type
      const byAssetType = calculatePerformanceByDimension(trades, 'assetType');
      chartData.byAssetType = byAssetType.map((item) => ({
        name: item.value || 'Unknown',
        totalPnl: item.totalPnl,
        tradeCount: item.trades,
        winRate: item.winRate,
      }));

      // By Strategy
      const byStrategy = calculatePerformanceByDimension(trades, 'strategyName');
      chartData.byStrategy = byStrategy.map((item) => ({
        name: item.value || 'Unknown',
        totalPnl: item.totalPnl,
        tradeCount: item.trades,
        winRate: item.winRate,
      }));

      // By Time of Day
      const byTimeOfDay = calculatePerformanceByDimension(trades, 'timeOfDay');
      chartData.byTimeOfDay = byTimeOfDay.map((item) => ({
        name: item.value || 'Unknown',
        totalPnl: item.totalPnl,
        tradeCount: item.trades,
        winRate: item.winRate,
      }));

      // By Day of Week
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
          byDayOfWeek[dayOfWeek] = { totalPnl: 0, count: 0, wins: 0 };
        }
        byDayOfWeek[dayOfWeek].totalPnl += trade.calculations.netPnl;
        byDayOfWeek[dayOfWeek].count += 1;
        if (trade.calculations.netPnl > 0) byDayOfWeek[dayOfWeek].wins += 1;
      });

      chartData.byDayOfWeek = dayNames.map((day) => ({
        name: day,
        totalPnl: byDayOfWeek[day]?.totalPnl || 0,
        tradeCount: byDayOfWeek[day]?.count || 0,
        winRate:
          byDayOfWeek[day]?.count > 0 ? (byDayOfWeek[day].wins / byDayOfWeek[day].count) * 100 : 0,
      }));

      // By Symbol (top 10)
      const bySymbol = calculatePerformanceByDimension(trades, 'symbol');
      chartData.bySymbol = bySymbol
        .sort((a, b) => b.totalPnl - a.totalPnl)
        .slice(0, 10)
        .map((item) => ({
          name: item.value || 'Unknown',
          totalPnl: item.totalPnl,
          tradeCount: item.trades,
          winRate: item.winRate,
        }));

      // By Market Conditions
      const byMarketConditions = calculatePerformanceByDimension(trades, 'marketConditions');
      chartData.byMarketConditions = byMarketConditions.map((item) => ({
        name: item.value || 'Unknown',
        totalPnl: item.totalPnl,
        tradeCount: item.trades,
        winRate: item.winRate,
      }));
    }

    // Monthly Performance
    if (shouldGenerateAll || chartType === 'monthly') {
      const monthlyData: any = {};

      trades.forEach((trade) => {
        const monthKey = `${trade.entryDate.getFullYear()}-${String(trade.entryDate.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { totalPnl: 0, count: 0, wins: 0 };
        }
        // TypeScript knows netPnl is number here due to the type guard filter
        const netPnl = trade.calculations.netPnl;
        monthlyData[monthKey].totalPnl += netPnl;
        monthlyData[monthKey].count += 1;
        if (netPnl > 0) monthlyData[monthKey].wins += 1;
      });

      chartData.monthlyPerformance = Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]: [string, any]) => ({
          month,
          totalPnl: data.totalPnl,
          tradeCount: data.count,
          winRate: data.count > 0 ? (data.wins / data.count) * 100 : 0,
        }));
    }

    return NextResponse.json({
      success: true,
      dateRange: {
        start: startDate || null,
        end: endDate || null,
        filtered: !!(startDate || endDate),
      },
      totalTrades: trades.length,
      charts: chartData,
    });
  } catch (error: any) {
    console.error('Chart data error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { success: false, error: 'Failed to generate chart data' },
      { status: 500 }
    );
  }
}
