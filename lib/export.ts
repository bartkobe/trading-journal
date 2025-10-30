import { TradeWithCalculations, TradeCSVRow } from './types';

// =========================================================================
// CSV Export Utilities
// =========================================================================

/**
 * Escape a single CSV field according to RFC 4180
 * - Quote if it contains a comma, quote, newline, or leading/trailing spaces
 * - Double any embedded quotes
 */
function escapeCsvField(value: unknown): string {
  if (value === null || value === undefined) return '';

  const str = String(value);
  const needsQuoting = /[",\n\r]|^\s|\s$/.test(str);
  const escaped = str.replace(/"/g, '""');
  return needsQuoting ? `"${escaped}"` : escaped;
}

/**
 * Convert an array of values to a CSV line
 */
function toCsvLine(values: Array<string | number>): string {
  return values.map(escapeCsvField).join(',');
}

/**
 * Build a TradeCSVRow from a trade with calculations and relations
 */
export function tradeToCsvRow(trade: TradeWithCalculations): TradeCSVRow {
  const tags = trade.tags?.map((t) => t.tag?.name).filter(Boolean).join(' | ') ?? '';

  return {
    id: trade.id,
    symbol: trade.symbol,
    assetType: trade.assetType,
    currency: trade.currency,
    direction: trade.direction,
    entryDate: trade.entryDate ? new Date(trade.entryDate).toISOString() : '',
    entryPrice: trade.entryPrice ?? 0,
    exitDate: trade.exitDate ? new Date(trade.exitDate).toISOString() : '',
    exitPrice: trade.exitPrice ?? 0,
    quantity: trade.quantity ?? 0,
    stopLoss: trade.stopLoss ?? null,
    takeProfit: trade.takeProfit ?? null,
    pnl: trade.calculations?.pnl ?? 0,
    pnlPercent: trade.calculations?.pnlPercent ?? 0,
    fees: trade.fees ?? 0,
    netPnl: trade.calculations?.netPnl ?? 0,
    entryValue: trade.calculations?.entryValue ?? 0,
    exitValue: trade.calculations?.exitValue ?? 0,
    actualRiskReward: trade.calculations?.actualRiskReward,
    holdingPeriodHours: trade.calculations?.holdingPeriod ?? 0,
    strategyName: trade.strategyName ?? '',
    setupType: trade.setupType ?? '',
    timeOfDay: trade.timeOfDay ?? '',
    marketConditions: trade.marketConditions ?? '',
    emotionalStateEntry: trade.emotionalStateEntry ?? '',
    emotionalStateExit: trade.emotionalStateExit ?? '',
    holdingPeriodDays: trade.calculations?.holdingPeriodDays ?? 0,
    isWinner: Boolean(trade.calculations?.isWinner),
    isLoser: Boolean(trade.calculations?.isLoser),
    isBreakeven: Boolean(trade.calculations?.isBreakeven),
    riskRewardRatio: trade.riskRewardRatio ?? null,
    notes: trade.notes ?? '',
    createdAt: trade.createdAt ? new Date(trade.createdAt).toISOString() : '',
    updatedAt: trade.updatedAt ? new Date(trade.updatedAt).toISOString() : '',
    screenshotsCount: trade.screenshots?.length ?? 0,
    tags,
  };
}

/**
 * Convert trades to an array of TradeCSVRow in a stable header order
 */
export function tradesToCsvRows(trades: TradeWithCalculations[]): TradeCSVRow[] {
  return trades.map(tradeToCsvRow);
}

/**
 * Generate CSV string from trades. Includes header row.
 * Optionally include UTF-8 BOM for better Excel compatibility.
 */
export function tradesToCsv(
  trades: TradeWithCalculations[],
  options?: { includeBom?: boolean }
): string {
  const { includeBom = false } = options ?? {};

  const header = [
    'id',
    'symbol',
    'assetType',
    'currency',
    'direction',
    'entryDate',
    'entryPrice',
    'exitDate',
    'exitPrice',
    'quantity',
    'stopLoss',
    'takeProfit',
    'pnl',
    'pnlPercent',
    'fees',
    'netPnl',
    'entryValue',
    'exitValue',
    'actualRiskReward',
    'holdingPeriodHours',
    'strategyName',
    'setupType',
    'timeOfDay',
    'marketConditions',
    'emotionalStateEntry',
    'emotionalStateExit',
    'holdingPeriodDays',
    'isWinner',
    'isLoser',
    'isBreakeven',
    'riskRewardRatio',
    'notes',
    'createdAt',
    'updatedAt',
    'screenshotsCount',
    'tags',
  ];

  const rows = tradesToCsvRows(trades).map((r) =>
    toCsvLine([
      r.id,
      r.symbol,
      r.assetType,
      r.currency,
      r.direction,
      r.entryDate,
      r.entryPrice,
      r.exitDate,
      r.exitPrice,
      r.quantity,
      r.stopLoss ?? '',
      r.takeProfit ?? '',
      r.pnl,
      r.pnlPercent,
      r.fees,
      r.netPnl,
      r.entryValue,
      r.exitValue,
      r.actualRiskReward ?? '',
      r.holdingPeriodHours,
      r.strategyName,
      r.setupType,
      r.timeOfDay,
      r.marketConditions,
      r.emotionalStateEntry,
      r.emotionalStateExit,
      r.holdingPeriodDays,
      Number(r.isWinner),
      Number(r.isLoser),
      Number(r.isBreakeven),
      r.riskRewardRatio ?? '',
      r.notes,
      r.createdAt,
      r.updatedAt,
      r.screenshotsCount,
      r.tags,
    ])
  );

  const csvBody = [toCsvLine(header), ...rows].join('\n');
  return includeBom ? `\uFEFF${csvBody}` : csvBody;
}

/**
 * Generate a filename for CSV export based on date range or timestamp
 */
export function generateCsvFilename(params?: { prefix?: string }): string {
  const p = params?.prefix ?? 'trades';
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  return `${p}-${ts}.csv`;
}


