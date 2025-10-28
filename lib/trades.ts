import { Trade } from '@prisma/client';
import { TradeCalculations, TradeWithCalculations } from './types';

// ============================================================================
// Trade Calculations
// ============================================================================

/**
 * Calculate all metrics for a trade
 */
export function calculateTradeMetrics(trade: Trade): TradeCalculations {
  const { direction, entryPrice, exitPrice, quantity, fees, entryDate, exitDate } = trade;

  // Handle null fees
  const tradeFees = fees ?? 0;

  // Entry and exit values
  const entryValue = entryPrice * quantity;
  const exitValue = exitPrice * quantity;

  // Calculate P&L based on direction
  let pnl: number;
  if (direction === 'LONG') {
    pnl = (exitPrice - entryPrice) * quantity;
  } else {
    // SHORT
    pnl = (entryPrice - exitPrice) * quantity;
  }

  // P&L percentage (return on investment)
  const pnlPercent = (pnl / entryValue) * 100;

  // Net P&L after fees
  const netPnl = pnl - tradeFees;

  // Actual Risk:Reward (if applicable)
  const actualRiskReward =
    trade.stopLoss && trade.stopLoss > 0
      ? Math.abs(pnl / ((entryPrice - trade.stopLoss) * quantity))
      : undefined;

  // Holding period
  const entryTime = new Date(entryDate).getTime();
  const exitTime = new Date(exitDate).getTime();
  const holdingPeriod = (exitTime - entryTime) / (1000 * 60 * 60); // hours
  const holdingPeriodDays = holdingPeriod / 24; // days

  // Trade outcome
  const isWinner = netPnl > 0;
  const isLoser = netPnl < 0;
  const isBreakeven = netPnl === 0;

  return {
    pnl,
    pnlPercent,
    netPnl,
    entryValue,
    exitValue,
    actualRiskReward,
    holdingPeriod,
    holdingPeriodDays,
    isWinner,
    isLoser,
    isBreakeven,
  };
}

/**
 * Add calculations to a trade object
 */
export function enrichTradeWithCalculations(trade: any): TradeWithCalculations {
  const calculations = calculateTradeMetrics(trade);

  return {
    ...trade,
    calculations,
  };
}

/**
 * Add calculations to multiple trades
 */
export function enrichTradesWithCalculations(trades: Trade[]): TradeWithCalculations[] {
  return trades.map((trade) => enrichTradeWithCalculations(trade));
}

// ============================================================================
// Filtering & Sorting
// ============================================================================

/**
 * Filter trades based on outcome
 */
export function filterByOutcome(
  trades: TradeWithCalculations[],
  outcome: 'winning' | 'losing' | 'breakeven'
): TradeWithCalculations[] {
  return trades.filter((trade) => {
    if (outcome === 'winning') return trade.calculations.isWinner;
    if (outcome === 'losing') return trade.calculations.isLoser;
    if (outcome === 'breakeven') return trade.calculations.isBreakeven;
    return true;
  });
}

/**
 * Sort trades by various fields
 */
export function sortTrades(
  trades: TradeWithCalculations[],
  sortBy: 'date' | 'pnl' | 'pnlPercent' | 'symbol',
  sortOrder: 'asc' | 'desc' = 'desc'
): TradeWithCalculations[] {
  const sorted = [...trades].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'date':
        comparison = new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime();
        break;
      case 'pnl':
        comparison = a.calculations.pnl - b.calculations.pnl;
        break;
      case 'pnlPercent':
        comparison = a.calculations.pnlPercent - b.calculations.pnlPercent;
        break;
      case 'symbol':
        comparison = a.symbol.localeCompare(b.symbol);
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

// ============================================================================
// Formatting Helpers
// ============================================================================

/**
 * Format currency value
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage value
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

/**
 * Format date
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Format datetime
 */
export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * Format holding period
 */
export function formatHoldingPeriod(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} minutes`;
  } else if (hours < 24) {
    return `${hours.toFixed(1)} hours`;
  } else {
    const days = hours / 24;
    return `${days.toFixed(1)} days`;
  }
}

// ============================================================================
// Risk:Reward Helpers
// ============================================================================

/**
 * Calculate planned Risk:Reward ratio
 */
export function calculatePlannedRR(
  entryPrice: number,
  stopLoss: number,
  takeProfit: number,
  direction: 'LONG' | 'SHORT'
): number {
  if (direction === 'LONG') {
    const risk = entryPrice - stopLoss;
    const reward = takeProfit - entryPrice;
    return Math.abs(reward / risk);
  } else {
    // SHORT
    const risk = stopLoss - entryPrice;
    const reward = entryPrice - takeProfit;
    return Math.abs(reward / risk);
  }
}

/**
 * Calculate position size based on risk amount
 */
export function calculatePositionSize(
  accountSize: number,
  riskPercent: number,
  entryPrice: number,
  stopLoss: number
): number {
  const riskAmount = accountSize * (riskPercent / 100);
  const riskPerShare = Math.abs(entryPrice - stopLoss);
  return riskAmount / riskPerShare;
}

// ============================================================================
// Analytics Helpers
// ============================================================================

/**
 * Calculate win rate from trades
 */
export function calculateWinRate(trades: TradeWithCalculations[]): number {
  if (trades.length === 0) return 0;
  const winners = trades.filter((t) => t.calculations.isWinner).length;
  return (winners / trades.length) * 100;
}

/**
 * Calculate average win
 */
export function calculateAverageWin(trades: TradeWithCalculations[]): number {
  const winners = trades.filter((t) => t.calculations.isWinner);
  if (winners.length === 0) return 0;
  const totalWins = winners.reduce((sum, t) => sum + t.calculations.netPnl, 0);
  return totalWins / winners.length;
}

/**
 * Calculate average loss
 */
export function calculateAverageLoss(trades: TradeWithCalculations[]): number {
  const losers = trades.filter((t) => t.calculations.isLoser);
  if (losers.length === 0) return 0;
  const totalLosses = losers.reduce((sum, t) => sum + t.calculations.netPnl, 0);
  return totalLosses / losers.length;
}

/**
 * Calculate profit factor
 */
export function calculateProfitFactor(trades: TradeWithCalculations[]): number {
  const grossProfit = trades
    .filter((t) => t.calculations.isWinner)
    .reduce((sum, t) => sum + t.calculations.netPnl, 0);

  const grossLoss = Math.abs(
    trades.filter((t) => t.calculations.isLoser).reduce((sum, t) => sum + t.calculations.netPnl, 0)
  );

  if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0;
  return grossProfit / grossLoss;
}

/**
 * Calculate expectancy (average expected profit per trade)
 */
export function calculateExpectancy(trades: TradeWithCalculations[]): number {
  if (trades.length === 0) return 0;

  const winRate = calculateWinRate(trades) / 100;
  const avgWin = calculateAverageWin(trades);
  const avgLoss = Math.abs(calculateAverageLoss(trades));

  return winRate * avgWin - (1 - winRate) * avgLoss;
}

/**
 * Calculate Sharpe ratio (simplified - assuming risk-free rate = 0)
 */
export function calculateSharpeRatio(trades: TradeWithCalculations[]): number {
  if (trades.length === 0) return 0;

  const returns = trades.map((t) => t.calculations.pnlPercent);
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;

  // Calculate standard deviation
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0;
  return avgReturn / stdDev;
}

/**
 * Calculate maximum drawdown
 */
export function calculateMaxDrawdown(trades: TradeWithCalculations[]): number {
  if (trades.length === 0) return 0;

  // Sort by date
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
  );

  let peak = 0;
  let maxDrawdown = 0;
  let cumulative = 0;

  for (const trade of sortedTrades) {
    cumulative += trade.calculations.netPnl;

    if (cumulative > peak) {
      peak = cumulative;
    }

    const drawdown = peak - cumulative;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return maxDrawdown;
}

/**
 * Generate equity curve data
 */
export function generateEquityCurve(
  trades: TradeWithCalculations[]
): Array<{ date: Date; cumulativePnl: number; tradeNumber: number }> {
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
  );

  let cumulative = 0;
  const equityCurve = sortedTrades.map((trade, index) => {
    cumulative += trade.calculations.netPnl;
    return {
      date: new Date(trade.exitDate),
      cumulativePnl: cumulative,
      tradeNumber: index + 1,
    };
  });

  return equityCurve;
}
