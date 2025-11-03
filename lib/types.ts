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
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type Trade = Prisma.TradeGetPayload<{}>;

// Screenshot type
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type Screenshot = Prisma.ScreenshotGetPayload<{}>;

// Tag type
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type Tag = Prisma.TagGetPayload<{}>;

// User type (without password)
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type User = Omit<Prisma.UserGetPayload<{}>, 'password'>;

// Enums from Prisma schema
export type Direction = 'LONG' | 'SHORT';
export type AssetType = 'STOCK' | 'FOREX' | 'CRYPTO' | 'OPTIONS';

// ============================================================================
// Calculated Trade Metrics
// ============================================================================

export interface TradeCalculations {
  pnl: number | null; // Profit/Loss in trade currency (null for open trades)
  pnlPercent: number | null; // P&L as percentage of entry value (null for open trades)
  netPnl: number | null; // P&L after fees (null for open trades)
  entryValue: number; // Entry price * quantity
  exitValue: number | null; // Exit price * quantity (null for open trades)
  actualRiskReward?: number; // Actual R:R based on outcome
  holdingPeriod: number | null; // Duration in hours (null for open trades)
  holdingPeriodDays: number | null; // Duration in days (null for open trades)
  isWinner: boolean; // Is this a winning trade
  isLoser: boolean; // Is this a losing trade
  isBreakeven: boolean; // Is this a breakeven trade
}

// Define TradeWithCalculations interface explicitly to avoid conflicts with Prisma types
export interface TradeWithCalculations {
  // Base Trade properties (matching Prisma schema)
  id: string;
  userId: string;
  symbol: string;
  assetType: AssetType;
  currency: string;
  entryDate: Date;
  entryPrice: number;
  exitDate: Date | null;
  exitPrice: number | null;
  quantity: number;
  direction: Direction;
  setupType: string | null;
  strategyName: string | null;
  stopLoss: number | null;
  takeProfit: number | null;
  fees: number;
  timeOfDay: string | null;
  marketConditions: string | null;
  emotionalStateEntry: string | null;
  emotionalStateExit: string | null;
  notes: string | null;
  riskRewardRatio: number | null;
  createdAt: Date;
  updatedAt: Date;

  // Additional properties
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
  exitDate?: Date | string;
  exitPrice?: number;

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
  id: string;
  symbol: string;
  assetType: string;
  currency: string;
  direction: string;
  status: string;
  entryDate: string;
  entryPrice: number;
  exitDate: string;
  exitPrice: number;
  quantity: number;
  stopLoss: number | null;
  takeProfit: number | null;
  pnl: number | null;
  pnlPercent: number | null;
  fees: number;
  netPnl: number | null;
  entryValue: number;
  exitValue: number | null;
  actualRiskReward: number | undefined;
  holdingPeriodHours: number | null;
  strategyName: string;
  setupType: string;
  timeOfDay: string;
  marketConditions: string;
  emotionalStateEntry: string;
  emotionalStateExit: string;
  holdingPeriodDays: number | null;
  isWinner: boolean;
  isLoser: boolean;
  isBreakeven: boolean;
  riskRewardRatio: number | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
  screenshotsCount: number;
  tags: string;
}
