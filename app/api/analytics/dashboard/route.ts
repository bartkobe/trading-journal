import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { enrichTradesWithCalculations } from '@/lib/trades';
import {
  calculateBasicMetrics,
  calculateExpectancy,
  calculateSharpeRatio,
  calculateDrawdown,
  calculateStreaks,
} from '@/lib/analytics';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/dashboard
 * Returns comprehensive dashboard metrics for the authenticated user
 * Query params:
 * - startDate (optional): ISO date string for filtering
 * - endDate (optional): ISO date string for filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

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
    const trades = enrichTradesWithCalculations(rawTrades);

    // Calculate all metrics
    const basicMetrics = calculateBasicMetrics(trades);
    const expectancy = calculateExpectancy(trades);
    const sharpeRatio = calculateSharpeRatio(trades);
    const drawdown = calculateDrawdown(trades);
    const streaks = calculateStreaks(trades);

    // Prepare response
    const dashboardMetrics = {
      // Overview
      totalTrades: basicMetrics.totalTrades,
      dateRange: {
        start: startDate || null,
        end: endDate || null,
        filtered: !!(startDate || endDate),
      },

      // Performance Summary
      performance: {
        totalPnl: basicMetrics.totalPnl,
        averagePnl: basicMetrics.averagePnl,
        winRate: basicMetrics.winRate,
        lossRate: basicMetrics.lossRate,
        breakevenRate: basicMetrics.breakevenRate,
        profitFactor: basicMetrics.profitFactor,
      },

      // Win/Loss Breakdown
      winLoss: {
        winningTrades: basicMetrics.winningTrades,
        losingTrades: basicMetrics.losingTrades,
        breakevenTrades: basicMetrics.breakevenTrades,
        averageWin: basicMetrics.averageWin,
        averageLoss: basicMetrics.averageLoss,
        largestWin: basicMetrics.largestWin,
        largestLoss: basicMetrics.largestLoss,
      },

      // Advanced Metrics
      advanced: {
        expectancy: expectancy.expectancy,
        expectancyPercent: expectancy.expectancyPercent,
        sharpeRatio: sharpeRatio.sharpeRatio,
        averageReturn: sharpeRatio.averageReturn,
        standardDeviation: sharpeRatio.standardDeviation,
      },

      // Drawdown
      drawdown: {
        maxDrawdown: drawdown.maxDrawdown,
        maxDrawdownPercent: drawdown.maxDrawdownPercent,
        currentDrawdown: drawdown.currentDrawdown,
        currentDrawdownPercent: drawdown.currentDrawdownPercent,
        averageDrawdown: drawdown.averageDrawdown,
      },

      // Streaks
      streaks: {
        currentStreak: streaks.currentStreak,
        longestWinStreak: streaks.longestWinStreak,
        longestLossStreak: streaks.longestLossStreak,
        averageWinStreak: streaks.averageWinStreak,
        averageLossStreak: streaks.averageLossStreak,
      },
    };

    return NextResponse.json({
      success: true,
      metrics: dashboardMetrics,
    });
  } catch (error: any) {
    console.error('Dashboard metrics error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { success: false, error: 'Failed to calculate dashboard metrics' },
      { status: 500 }
    );
  }
}
