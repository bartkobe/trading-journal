import { TradeWithCalculations } from './types';

// ============================================================================
// Basic Metrics
// ============================================================================

export interface BasicMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  winRate: number; // Percentage
  lossRate: number; // Percentage
  breakevenRate: number; // Percentage
  totalPnl: number;
  averagePnl: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  profitFactor: number; // Gross profit / Gross loss
}

export function calculateBasicMetrics(trades: TradeWithCalculations[]): BasicMetrics {
  const totalTrades = trades.length;

  if (totalTrades === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      breakevenTrades: 0,
      winRate: 0,
      lossRate: 0,
      breakevenRate: 0,
      totalPnl: 0,
      averagePnl: 0,
      averageWin: 0,
      averageLoss: 0,
      largestWin: 0,
      largestLoss: 0,
      profitFactor: 0,
    };
  }

  const winningTrades = trades.filter((t) => t.calculations.isWinner);
  const losingTrades = trades.filter((t) => t.calculations.isLoser);
  const breakevenTrades = trades.filter((t) => t.calculations.isBreakeven);

  const totalPnl = trades.reduce((sum, t) => sum + t.calculations.netPnl, 0);
  const grossProfit = winningTrades.reduce((sum, t) => sum + t.calculations.netPnl, 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.calculations.netPnl, 0));

  const averageWin =
    winningTrades.length > 0
      ? winningTrades.reduce((sum, t) => sum + t.calculations.netPnl, 0) / winningTrades.length
      : 0;

  const averageLoss =
    losingTrades.length > 0
      ? losingTrades.reduce((sum, t) => sum + t.calculations.netPnl, 0) / losingTrades.length
      : 0;

  const largestWin =
    winningTrades.length > 0
      ? Math.max(...winningTrades.map((t) => t.calculations.netPnl))
      : 0;

  const largestLoss =
    losingTrades.length > 0
      ? Math.min(...losingTrades.map((t) => t.calculations.netPnl))
      : 0;

  return {
    totalTrades,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    breakevenTrades: breakevenTrades.length,
    winRate: (winningTrades.length / totalTrades) * 100,
    lossRate: (losingTrades.length / totalTrades) * 100,
    breakevenRate: (breakevenTrades.length / totalTrades) * 100,
    totalPnl,
    averagePnl: totalPnl / totalTrades,
    averageWin,
    averageLoss,
    largestWin,
    largestLoss,
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0,
  };
}

// ============================================================================
// Expectancy
// ============================================================================

export interface ExpectancyMetrics {
  expectancy: number; // Average expected profit per trade
  expectancyPercent: number; // Expectancy as percentage of average trade size
}

export function calculateExpectancy(trades: TradeWithCalculations[]): ExpectancyMetrics {
  if (trades.length === 0) {
    return {
      expectancy: 0,
      expectancyPercent: 0,
    };
  }

  const metrics = calculateBasicMetrics(trades);

  // Expectancy = (Win Rate × Average Win) - (Loss Rate × |Average Loss|)
  const expectancy =
    (metrics.winRate / 100) * metrics.averageWin +
    (metrics.lossRate / 100) * metrics.averageLoss;

  // Calculate average trade size for percentage
  const averageTradeSize =
    trades.reduce((sum, t) => sum + t.calculations.entryValue, 0) / trades.length;

  const expectancyPercent = averageTradeSize > 0 ? (expectancy / averageTradeSize) * 100 : 0;

  return {
    expectancy,
    expectancyPercent,
  };
}

// ============================================================================
// Sharpe Ratio
// ============================================================================

export interface SharpeRatioMetrics {
  sharpeRatio: number; // Risk-adjusted return metric
  averageReturn: number; // Average return percentage
  standardDeviation: number; // Volatility of returns
}

export function calculateSharpeRatio(
  trades: TradeWithCalculations[],
  riskFreeRate: number = 0
): SharpeRatioMetrics {
  if (trades.length < 2) {
    return {
      sharpeRatio: 0,
      averageReturn: 0,
      standardDeviation: 0,
    };
  }

  // Calculate average return
  const returns = trades.map((t) => t.calculations.pnlPercent);
  const averageReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;

  // Calculate standard deviation
  const squaredDifferences = returns.map((r) => Math.pow(r - averageReturn, 2));
  const variance = squaredDifferences.reduce((sum, sd) => sum + sd, 0) / returns.length;
  const standardDeviation = Math.sqrt(variance);

  // Sharpe Ratio = (Average Return - Risk Free Rate) / Standard Deviation
  const sharpeRatio =
    standardDeviation > 0 ? (averageReturn - riskFreeRate) / standardDeviation : 0;

  return {
    sharpeRatio,
    averageReturn,
    standardDeviation,
  };
}

// ============================================================================
// Drawdown
// ============================================================================

export interface DrawdownMetrics {
  maxDrawdown: number; // Maximum peak-to-trough decline
  maxDrawdownPercent: number; // Max drawdown as percentage
  currentDrawdown: number; // Current drawdown from peak
  currentDrawdownPercent: number; // Current drawdown as percentage
  averageDrawdown: number; // Average of all drawdowns
  drawdownPeriods: DrawdownPeriod[]; // All drawdown periods
}

export interface DrawdownPeriod {
  startDate: Date;
  endDate: Date | null; // null if still in drawdown
  peak: number;
  trough: number;
  drawdown: number;
  drawdownPercent: number;
  duration: number; // in days
}

export function calculateDrawdown(trades: TradeWithCalculations[]): DrawdownMetrics {
  if (trades.length === 0) {
    return {
      maxDrawdown: 0,
      maxDrawdownPercent: 0,
      currentDrawdown: 0,
      currentDrawdownPercent: 0,
      averageDrawdown: 0,
      drawdownPeriods: [],
    };
  }

  // Sort trades by entry date
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
  );

  // Calculate cumulative P&L
  let cumulativePnl = 0;
  const equityCurve: { date: Date; equity: number }[] = [];

  for (const trade of sortedTrades) {
    cumulativePnl += trade.calculations.netPnl;
    equityCurve.push({
      date: new Date(trade.entryDate),
      equity: cumulativePnl,
    });
  }

  // Find drawdown periods
  const drawdownPeriods: DrawdownPeriod[] = [];
  let peak = equityCurve[0].equity;
  let peakIndex = 0;
  let inDrawdown = false;
  let drawdownStart: Date | null = null;

  for (let i = 0; i < equityCurve.length; i++) {
    const current = equityCurve[i];

    if (current.equity > peak) {
      // New peak reached
      if (inDrawdown && drawdownStart) {
        // End of drawdown period
        const trough = Math.min(...equityCurve.slice(peakIndex, i).map((e) => e.equity));
        const drawdown = peak - trough;
        const drawdownPercent = peak > 0 ? (drawdown / peak) * 100 : 0;

        drawdownPeriods.push({
          startDate: drawdownStart,
          endDate: current.date,
          peak,
          trough,
          drawdown,
          drawdownPercent,
          duration:
            (current.date.getTime() - drawdownStart.getTime()) / (1000 * 60 * 60 * 24),
        });

        inDrawdown = false;
        drawdownStart = null;
      }

      peak = current.equity;
      peakIndex = i;
    } else if (current.equity < peak) {
      // In drawdown
      if (!inDrawdown) {
        inDrawdown = true;
        drawdownStart = current.date;
      }
    }
  }

  // Handle ongoing drawdown
  if (inDrawdown && drawdownStart) {
    const trough = Math.min(...equityCurve.slice(peakIndex).map((e) => e.equity));
    const drawdown = peak - trough;
    const drawdownPercent = peak > 0 ? (drawdown / peak) * 100 : 0;

    drawdownPeriods.push({
      startDate: drawdownStart,
      endDate: null,
      peak,
      trough,
      drawdown,
      drawdownPercent,
      duration:
        (equityCurve[equityCurve.length - 1].date.getTime() - drawdownStart.getTime()) /
        (1000 * 60 * 60 * 24),
    });
  }

  // Calculate metrics
  const maxDrawdown =
    drawdownPeriods.length > 0
      ? Math.max(...drawdownPeriods.map((d) => d.drawdown))
      : 0;

  const maxDrawdownPercent =
    drawdownPeriods.length > 0
      ? Math.max(...drawdownPeriods.map((d) => d.drawdownPercent))
      : 0;

  const currentEquity = equityCurve[equityCurve.length - 1].equity;
  const currentDrawdown = Math.max(0, peak - currentEquity);
  const currentDrawdownPercent = peak > 0 ? (currentDrawdown / peak) * 100 : 0;

  const averageDrawdown =
    drawdownPeriods.length > 0
      ? drawdownPeriods.reduce((sum, d) => sum + d.drawdown, 0) / drawdownPeriods.length
      : 0;

  return {
    maxDrawdown,
    maxDrawdownPercent,
    currentDrawdown,
    currentDrawdownPercent,
    averageDrawdown,
    drawdownPeriods,
  };
}

// ============================================================================
// Equity Curve
// ============================================================================

export interface EquityCurvePoint {
  date: Date;
  equity: number;
  tradeNumber: number;
  pnl: number;
  symbol: string;
}

export function calculateEquityCurve(trades: TradeWithCalculations[]): EquityCurvePoint[] {
  if (trades.length === 0) {
    return [];
  }

  // Sort trades by entry date
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
  );

  let cumulativePnl = 0;
  const equityCurve: EquityCurvePoint[] = [];

  sortedTrades.forEach((trade, index) => {
    cumulativePnl += trade.calculations.netPnl;
    equityCurve.push({
      date: new Date(trade.entryDate),
      equity: cumulativePnl,
      tradeNumber: index + 1,
      pnl: trade.calculations.netPnl,
      symbol: trade.symbol,
    });
  });

  return equityCurve;
}

// ============================================================================
// Performance by Dimension
// ============================================================================

export interface DimensionPerformance {
  dimension: string;
  value: string;
  trades: number;
  totalPnl: number;
  averagePnl: number;
  winRate: number;
  profitFactor: number;
}

export function calculatePerformanceByDimension(
  trades: TradeWithCalculations[],
  dimension: 'symbol' | 'assetType' | 'direction' | 'strategyName' | 'setupType' | 'timeOfDay' | 'marketConditions' | 'emotionalStateEntry'
): DimensionPerformance[] {
  // Group trades by dimension
  const grouped = new Map<string, TradeWithCalculations[]>();

  trades.forEach((trade) => {
    const value = (trade[dimension] || 'Unknown').toString();
    if (!grouped.has(value)) {
      grouped.set(value, []);
    }
    grouped.get(value)!.push(trade);
  });

  // Calculate metrics for each group
  const results: DimensionPerformance[] = [];

  grouped.forEach((groupTrades, value) => {
    const metrics = calculateBasicMetrics(groupTrades);

    results.push({
      dimension,
      value,
      trades: metrics.totalTrades,
      totalPnl: metrics.totalPnl,
      averagePnl: metrics.averagePnl,
      winRate: metrics.winRate,
      profitFactor: metrics.profitFactor,
    });
  });

  // Sort by total P&L descending
  return results.sort((a, b) => b.totalPnl - a.totalPnl);
}

// ============================================================================
// Time-based Analysis
// ============================================================================

export interface TimeBasedMetrics {
  dayOfWeek: DimensionPerformance[];
  month: DimensionPerformance[];
  hour: DimensionPerformance[];
}

export function calculateTimeBasedMetrics(trades: TradeWithCalculations[]): TimeBasedMetrics {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Group by day of week
  const dayGroups = new Map<string, TradeWithCalculations[]>();
  // Group by month
  const monthGroups = new Map<string, TradeWithCalculations[]>();
  // Group by hour
  const hourGroups = new Map<string, TradeWithCalculations[]>();

  trades.forEach((trade) => {
    const date = new Date(trade.entryDate);
    const day = dayNames[date.getDay()];
    const month = monthNames[date.getMonth()];
    const hour = date.getHours().toString().padStart(2, '0') + ':00';

    if (!dayGroups.has(day)) dayGroups.set(day, []);
    if (!monthGroups.has(month)) monthGroups.set(month, []);
    if (!hourGroups.has(hour)) hourGroups.set(hour, []);

    dayGroups.get(day)!.push(trade);
    monthGroups.get(month)!.push(trade);
    hourGroups.get(hour)!.push(trade);
  });

  const processGroup = (
    groups: Map<string, TradeWithCalculations[]>,
    dimension: string
  ): DimensionPerformance[] => {
    const results: DimensionPerformance[] = [];

    groups.forEach((groupTrades, value) => {
      const metrics = calculateBasicMetrics(groupTrades);

      results.push({
        dimension,
        value,
        trades: metrics.totalTrades,
        totalPnl: metrics.totalPnl,
        averagePnl: metrics.averagePnl,
        winRate: metrics.winRate,
        profitFactor: metrics.profitFactor,
      });
    });

    return results.sort((a, b) => b.totalPnl - a.totalPnl);
  };

  return {
    dayOfWeek: processGroup(dayGroups, 'dayOfWeek'),
    month: processGroup(monthGroups, 'month'),
    hour: processGroup(hourGroups, 'hour'),
  };
}

// ============================================================================
// Consecutive Win/Loss Streaks
// ============================================================================

export interface StreakMetrics {
  currentStreak: number; // Current streak (positive for wins, negative for losses)
  longestWinStreak: number;
  longestLossStreak: number;
  averageWinStreak: number;
  averageLossStreak: number;
}

export function calculateStreaks(trades: TradeWithCalculations[]): StreakMetrics {
  if (trades.length === 0) {
    return {
      currentStreak: 0,
      longestWinStreak: 0,
      longestLossStreak: 0,
      averageWinStreak: 0,
      averageLossStreak: 0,
    };
  }

  // Sort trades by entry date
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
  );

  let currentStreak = 0;
  let longestWinStreak = 0;
  let longestLossStreak = 0;
  const winStreaks: number[] = [];
  const lossStreaks: number[] = [];

  let tempWinStreak = 0;
  let tempLossStreak = 0;

  sortedTrades.forEach((trade) => {
    if (trade.calculations.isWinner) {
      if (tempLossStreak > 0) {
        lossStreaks.push(tempLossStreak);
        tempLossStreak = 0;
      }
      tempWinStreak++;
      currentStreak = tempWinStreak;
    } else if (trade.calculations.isLoser) {
      if (tempWinStreak > 0) {
        winStreaks.push(tempWinStreak);
        tempWinStreak = 0;
      }
      tempLossStreak++;
      currentStreak = -tempLossStreak;
    } else {
      // Breakeven - end both streaks
      if (tempWinStreak > 0) {
        winStreaks.push(tempWinStreak);
        tempWinStreak = 0;
      }
      if (tempLossStreak > 0) {
        lossStreaks.push(tempLossStreak);
        tempLossStreak = 0;
      }
      currentStreak = 0;
    }

    longestWinStreak = Math.max(longestWinStreak, tempWinStreak);
    longestLossStreak = Math.max(longestLossStreak, tempLossStreak);
  });

  // Add final streaks
  if (tempWinStreak > 0) winStreaks.push(tempWinStreak);
  if (tempLossStreak > 0) lossStreaks.push(tempLossStreak);

  const averageWinStreak =
    winStreaks.length > 0 ? winStreaks.reduce((a, b) => a + b, 0) / winStreaks.length : 0;

  const averageLossStreak =
    lossStreaks.length > 0
      ? lossStreaks.reduce((a, b) => a + b, 0) / lossStreaks.length
      : 0;

  return {
    currentStreak,
    longestWinStreak,
    longestLossStreak,
    averageWinStreak,
    averageLossStreak,
  };
}

