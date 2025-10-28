import {
  Trade,
  TradeCalculations,
  TradeWithCalculations,
  Outcome,
  AssetType,
  Direction,
} from '@/lib/types';

// ============================================================================
// Trade Calculations
// ============================================================================

/**
 * Calculate P&L (Profit/Loss) for a trade
 * @param trade - Trade object
 * @returns P&L in currency
 */
export function calculatePnl(trade: Trade): number {
  const { entryPrice, exitPrice, quantity, direction } = trade;

  if (direction === 'LONG') {
    // Long: profit when exit > entry
    return (exitPrice - entryPrice) * quantity;
  } else {
    // Short: profit when exit < entry
    return (entryPrice - exitPrice) * quantity;
  }
}

/**
 * Calculate P&L percentage
 * @param trade - Trade object
 * @returns P&L as percentage
 */
export function calculatePnlPercent(trade: Trade): number {
  const { entryPrice, exitPrice, direction } = trade;

  if (direction === 'LONG') {
    return ((exitPrice - entryPrice) / entryPrice) * 100;
  } else {
    return ((entryPrice - exitPrice) / entryPrice) * 100;
  }
}

/**
 * Calculate net P&L after fees
 * @param trade - Trade object
 * @returns Net P&L in currency
 */
export function calculateNetPnl(trade: Trade): number {
  const pnl = calculatePnl(trade);
  const fees = trade.fees || 0;
  return pnl - fees;
}

/**
 * Calculate net P&L percentage after fees
 * @param trade - Trade object
 * @returns Net P&L as percentage
 */
export function calculateNetPnlPercent(trade: Trade): number {
  const netPnl = calculateNetPnl(trade);
  const entryValue = trade.entryPrice * trade.quantity;
  return (netPnl / entryValue) * 100;
}

/**
 * Determine trade outcome
 * @param pnl - Trade P&L
 * @returns Outcome (winning, losing, or breakeven)
 */
export function determineOutcome(pnl: number): Outcome {
  if (pnl > 0) return 'winning';
  if (pnl < 0) return 'losing';
  return 'breakeven';
}

/**
 * Calculate entry value (position size)
 * @param trade - Trade object
 * @returns Entry value in currency
 */
export function calculateEntryValue(trade: Trade): number {
  return trade.entryPrice * trade.quantity;
}

/**
 * Calculate exit value
 * @param trade - Trade object
 * @returns Exit value in currency
 */
export function calculateExitValue(trade: Trade): number {
  return trade.exitPrice * trade.quantity;
}

/**
 * Calculate actual risk/reward ratio
 * @param trade - Trade object
 * @returns Actual R:R ratio or undefined
 */
export function calculateActualRR(trade: Trade): number | undefined {
  const { stopLoss, entryPrice, exitPrice, direction } = trade;

  if (!stopLoss) return undefined;

  const risk = Math.abs(entryPrice - stopLoss);
  if (risk === 0) return undefined;

  const reward = Math.abs(exitPrice - entryPrice);
  return reward / risk;
}

/**
 * Add all calculated fields to a trade
 * @param trade - Trade object
 * @returns Trade with calculations
 */
export function addCalculations(trade: Trade): TradeWithCalculations {
  const pnl = calculatePnl(trade);
  const pnlPercent = calculatePnlPercent(trade);
  const netPnl = calculateNetPnl(trade);
  const netPnlPercent = calculateNetPnlPercent(trade);
  const outcome = determineOutcome(netPnl);
  const entryValue = calculateEntryValue(trade);
  const exitValue = calculateExitValue(trade);
  const actualRR = calculateActualRR(trade);

  return {
    ...trade,
    pnl,
    grossPnl: pnl, // Alias for clarity
    pnlPercent,
    netPnl,
    netPnlPercent,
    outcome,
    entryValue,
    exitValue,
    actualRR,
  };
}

// Alias for consistency with naming in other parts of the app
export const calculateTradeMetrics = addCalculations;

/**
 * Add calculations to multiple trades
 * @param trades - Array of trades
 * @returns Trades with calculations
 */
export function addCalculationsToAll(trades: Trade[]): TradeWithCalculations[] {
  return trades.map((trade) => addCalculations(trade));
}

// ============================================================================
// Trade Filtering & Sorting
// ============================================================================

/**
 * Filter trades by outcome
 * @param trades - Array of trades with calculations
 * @param outcome - Desired outcome
 * @returns Filtered trades
 */
export function filterByOutcome(
  trades: TradeWithCalculations[],
  outcome: Outcome
): TradeWithCalculations[] {
  return trades.filter((trade) => trade.outcome === outcome);
}

/**
 * Sort trades
 * @param trades - Array of trades with calculations
 * @param sortBy - Sort field
 * @param sortOrder - Sort direction
 * @returns Sorted trades
 */
export function sortTrades(
  trades: TradeWithCalculations[],
  sortBy: 'date' | 'pnl' | 'pnlPercent' | 'symbol' = 'date',
  sortOrder: 'asc' | 'desc' = 'desc'
): TradeWithCalculations[] {
  const sorted = [...trades].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'date':
        comparison = new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime();
        break;
      case 'pnl':
        comparison = a.netPnl - b.netPnl;
        break;
      case 'pnlPercent':
        comparison = a.netPnlPercent - b.netPnlPercent;
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
// Trade Statistics
// ============================================================================

/**
 * Calculate win rate from trades
 * @param trades - Array of trades with calculations
 * @returns Win rate as percentage (0-100)
 */
export function calculateWinRate(trades: TradeWithCalculations[]): number {
  if (trades.length === 0) return 0;
  const winningTrades = trades.filter((t) => t.outcome === 'winning').length;
  return (winningTrades / trades.length) * 100;
}

/**
 * Calculate average win
 * @param trades - Array of trades with calculations
 * @returns Average winning trade P&L
 */
export function calculateAverageWin(trades: TradeWithCalculations[]): number {
  const winningTrades = trades.filter((t) => t.outcome === 'winning');
  if (winningTrades.length === 0) return 0;

  const totalWin = winningTrades.reduce((sum, t) => sum + t.netPnl, 0);
  return totalWin / winningTrades.length;
}

/**
 * Calculate average loss
 * @param trades - Array of trades with calculations
 * @returns Average losing trade P&L (negative value)
 */
export function calculateAverageLoss(trades: TradeWithCalculations[]): number {
  const losingTrades = trades.filter((t) => t.outcome === 'losing');
  if (losingTrades.length === 0) return 0;

  const totalLoss = losingTrades.reduce((sum, t) => sum + t.netPnl, 0);
  return totalLoss / losingTrades.length;
}

/**
 * Calculate profit factor
 * @param trades - Array of trades with calculations
 * @returns Profit factor (gross profit / gross loss)
 */
export function calculateProfitFactor(trades: TradeWithCalculations[]): number {
  const grossProfit = trades
    .filter((t) => t.outcome === 'winning')
    .reduce((sum, t) => sum + t.netPnl, 0);

  const grossLoss = Math.abs(
    trades.filter((t) => t.outcome === 'losing').reduce((sum, t) => sum + t.netPnl, 0)
  );

  if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0;
  return grossProfit / grossLoss;
}

/**
 * Calculate expectancy (average expected profit per trade)
 * @param trades - Array of trades with calculations
 * @returns Expectancy value
 */
export function calculateExpectancy(trades: TradeWithCalculations[]): number {
  if (trades.length === 0) return 0;

  const winRate = calculateWinRate(trades) / 100;
  const avgWin = calculateAverageWin(trades);
  const avgLoss = Math.abs(calculateAverageLoss(trades));

  return winRate * avgWin - (1 - winRate) * avgLoss;
}

/**
 * Calculate total P&L
 * @param trades - Array of trades with calculations
 * @returns Total P&L
 */
export function calculateTotalPnl(trades: TradeWithCalculations[]): number {
  return trades.reduce((sum, t) => sum + t.netPnl, 0);
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate trade dates
 * @param entryDate - Entry date
 * @param exitDate - Exit date
 * @returns Validation result
 */
export function validateTradeDates(
  entryDate: Date | string,
  exitDate: Date | string
): { valid: boolean; error?: string } {
  const entry = new Date(entryDate);
  const exit = new Date(exitDate);

  if (exit < entry) {
    return {
      valid: false,
      error: 'Exit date must be after entry date',
    };
  }

  return { valid: true };
}

/**
 * Validate trade prices
 * @param entryPrice - Entry price
 * @param exitPrice - Exit price
 * @param stopLoss - Stop loss (optional)
 * @param takeProfit - Take profit (optional)
 * @returns Validation result
 */
export function validateTradePrices(
  entryPrice: number,
  exitPrice: number,
  stopLoss?: number,
  takeProfit?: number
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  if (entryPrice <= 0 || exitPrice <= 0) {
    return {
      valid: false,
      warnings: ['Prices must be positive'],
    };
  }

  if (stopLoss !== undefined && stopLoss <= 0) {
    warnings.push('Stop loss should be positive');
  }

  if (takeProfit !== undefined && takeProfit <= 0) {
    warnings.push('Take profit should be positive');
  }

  return { valid: true, warnings };
}

// ============================================================================
// Formatting Helpers
// ============================================================================

/**
 * Format currency value
 * @param value - Numeric value
 * @param currency - Currency code
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage
 * @param value - Numeric value (as percentage, e.g., 15.5 for 15.5%)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}

