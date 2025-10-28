import { Prisma } from '@prisma/client';

// ============================================================================
// Prisma-based Types (from database schema)
// ============================================================================

// Trade with all relations
export type TradeWithRelations = Prisma.TradeGetPayload<{
  include: {
    user: true;
    screenshots: true;
    tags: {
      include: {
        tag: true;
      };
    };
  };
}>;

// Trade without relations
export type Trade = Prisma.TradeGetPayload<{}>;

// Screenshot type
export type Screenshot = Prisma.ScreenshotGetPayload<{}>;

// Tag type
export type Tag = Prisma.TagGetPayload<{}>;

// User type (without password)
export type User = Omit<Prisma.UserGetPayload<{}>, 'password'>;

// ============================================================================
// Calculated Trade Metrics
// ============================================================================

export interface TradeCalculations {
  pnl: number; // Profit/Loss in trade currency
  pnlPercent: number; // P&L as percentage of entry value
  netPnl: number; // P&L after fees
  entryValue: number; // Entry price * quantity
  exitValue: number; // Exit price * quantity
  actualRiskReward?: number; // Actual R:R based on outcome
  holdingPeriod: number; // Duration in hours
  holdingPeriodDays: number; // Duration in days
  isWinner: boolean; // Is this a winning trade
  isLoser: boolean; // Is this a losing trade
  isBreakeven: boolean; // Is this a breakeven trade
}

export interface TradeWithCalculations extends Trade {
  calculations: TradeCalculations;
  screenshots: Screenshot[];
  tags: Array<{
    tag: Tag;
  }>;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface TradeListResponse {
  trades: TradeWithCalculations[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface TradeDetailResponse {
  trade: TradeWithCalculations;
}

export interface TradeCreateResponse {
  trade: TradeWithCalculations;
  message: string;
}

export interface TradeUpdateResponse {
  trade: TradeWithCalculations;
  message: string;
}

export interface TradeDeleteResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// Filter & Sort Types
// ============================================================================

export type TradeOutcome = 'winning' | 'losing' | 'breakeven';

export type TradeSortField = 'date' | 'pnl' | 'pnlPercent' | 'symbol';

export type SortOrder = 'asc' | 'desc';

export interface TradeFilters {
  startDate?: Date;
  endDate?: Date;
  assetType?: 'STOCK' | 'FOREX' | 'CRYPTO' | 'OPTIONS';
  symbol?: string;
  strategyName?: string;
  setupType?: string;
  tags?: string[];
  outcome?: TradeOutcome;
  search?: string; // Search in symbol, notes, strategy
}

export interface TradeSortOptions {
  sortBy: TradeSortField;
  sortOrder: SortOrder;
}

export interface TradePaginationOptions {
  limit: number;
  offset: number;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface DashboardMetrics {
  // Basic metrics
  totalTrades: number;
  totalPnl: number;
  netPnl: number;
  winRate: number;
  lossRate: number;

  // Win/Loss analysis
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;

  // Performance metrics
  profitFactor: number; // Gross profit / Gross loss
  expectancy: number; // Average expected profit per trade
  sharpeRatio: number; // Risk-adjusted return
  maxDrawdown: number; // Largest peak-to-trough decline
  averageDrawdown: number;

  // Trading behavior
  averageHoldingPeriod: number; // In hours
  totalFees: number;
  averageFees: number;
}

export interface PerformanceBreakdown {
  byAssetType: Record<string, MetricsByCategory>;
  byStrategy: Record<string, MetricsByCategory>;
  bySetupType: Record<string, MetricsByCategory>;
  bySymbol: Record<string, MetricsByCategory>;
  byTimeOfDay: Record<string, MetricsByCategory>;
  byDayOfWeek: Record<string, MetricsByCategory>;
  byEmotionalState: Record<string, MetricsByCategory>;
}

export interface MetricsByCategory {
  trades: number;
  pnl: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
}

export interface EquityCurvePoint {
  date: Date;
  cumulativePnl: number;
  tradeNumber: number;
  tradePnl: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  count?: number;
}

// ============================================================================
// Form Types
// ============================================================================

export interface TradeFormData {
  // Basic info
  symbol: string;
  assetType: 'STOCK' | 'FOREX' | 'CRYPTO' | 'OPTIONS';
  currency: string;
  direction: 'LONG' | 'SHORT';

  // Entry
  entryDate: Date | string;
  entryPrice: number;
  quantity: number;

  // Exit
  exitDate: Date | string;
  exitPrice: number;

  // Metadata
  setupType?: string;
  strategyName?: string;
  stopLoss?: number;
  takeProfit?: number;
  riskRewardRatio?: number;
  fees?: number;

  // Context
  timeOfDay?: 'PRE_MARKET' | 'MARKET_OPEN' | 'MID_DAY' | 'MARKET_CLOSE' | 'AFTER_HOURS';
  marketConditions?: 'TRENDING' | 'RANGING' | 'VOLATILE' | 'CALM';
  emotionalStateEntry?: string;
  emotionalStateExit?: string;

  // Notes
  notes?: string;

  // Tags (array of tag names)
  tags?: string[];
}

// ============================================================================
// Screenshot Upload Types
// ============================================================================

export interface ScreenshotUploadData {
  file: File | Blob;
  filename: string;
}

export interface ScreenshotUploadResponse {
  screenshot: Screenshot;
  message: string;
}

// ============================================================================
// Tag Management Types
// ============================================================================

export interface TagWithCount extends Tag {
  _count: {
    trades: number;
  };
}

export interface TagListResponse {
  tags: TagWithCount[];
}

export interface TagCreateResponse {
  tag: Tag;
  message: string;
}

// ============================================================================
// Error Types
// ============================================================================

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
  statusCode?: number;
}

// ============================================================================
// Export CSV Types
// ============================================================================

export interface TradeCSVRow {
  symbol: string;
  assetType: string;
  currency: string;
  direction: string;
  entryDate: string;
  entryPrice: number;
  exitDate: string;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  fees: number;
  netPnl: number;
  strategyName: string;
  setupType: string;
  timeOfDay: string;
  marketConditions: string;
  emotionalStateEntry: string;
  emotionalStateExit: string;
  holdingPeriodDays: number;
  tags: string;
}
