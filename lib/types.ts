import { Prisma } from '@prisma/client';

// ============================================================================
// Database Model Types (from Prisma)
// ============================================================================

export type User = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    name: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

export type Trade = Prisma.TradeGetPayload<{
  include: {
    screenshots: true;
    tags: {
      include: {
        tag: true;
      };
    };
  };
}>;

export type TradeWithDetails = Trade;

export type Screenshot = Prisma.ScreenshotGetPayload<object>;

export type Tag = Prisma.TagGetPayload<object>;

export type TradeTag = Prisma.TradeTagGetPayload<{
  include: {
    tag: true;
  };
}>;

// ============================================================================
// Enum Types (from Prisma)
// ============================================================================

export type AssetType = 'STOCK' | 'FOREX' | 'CRYPTO' | 'OPTIONS';
export type Direction = 'LONG' | 'SHORT';
export type TimeOfDay = 'PRE_MARKET' | 'MARKET_OPEN' | 'MID_DAY' | 'MARKET_CLOSE' | 'AFTER_HOURS';
export type MarketConditions = 'TRENDING' | 'RANGING' | 'VOLATILE' | 'CALM';

// ============================================================================
// Trade Creation/Update Types
// ============================================================================

export interface CreateTradeInput {
  // Required fields
  symbol: string;
  assetType: AssetType;
  currency?: string;
  entryDate: Date | string;
  entryPrice: number;
  exitDate: Date | string;
  exitPrice: number;
  quantity: number;
  direction: Direction;

  // Optional metadata
  setupType?: string;
  strategyName?: string;
  stopLoss?: number;
  takeProfit?: number;
  riskRewardRatio?: number;
  actualRiskReward?: number;

  // Fees
  fees?: number;

  // Context
  timeOfDay?: TimeOfDay;
  marketConditions?: MarketConditions;
  emotionalStateEntry?: string;
  emotionalStateExit?: string;

  // Notes
  notes?: string;

  // Tags (array of tag names or IDs)
  tags?: string[];
}

export type UpdateTradeInput = Partial<CreateTradeInput>;

// ============================================================================
// Trade Calculated Fields
// ============================================================================

export interface TradeCalculations {
  // P&L calculations
  pnl: number; // Profit/Loss in currency
  pnlPercent: number; // P&L as percentage
  netPnl: number; // P&L after fees
  netPnlPercent: number; // Net P&L as percentage

  // Trade outcome
  outcome: 'winning' | 'losing' | 'breakeven';

  // Position value
  entryValue: number; // entryPrice * quantity
  exitValue: number; // exitPrice * quantity

  // Risk/Reward
  actualRR?: number; // Actual risk/reward ratio
}

export type TradeWithCalculations = Trade & TradeCalculations;

// ============================================================================
// Trade Filter & Query Types
// ============================================================================

export interface TradeFilters {
  // Date range
  startDate?: Date | string;
  endDate?: Date | string;

  // Trade properties
  symbol?: string;
  assetType?: AssetType;
  direction?: Direction;
  strategyName?: string;
  setupType?: string;

  // Outcome
  outcome?: 'winning' | 'losing' | 'breakeven';

  // Tags
  tags?: string[];

  // Sorting
  sortBy?: 'date' | 'pnl' | 'pnlPercent' | 'symbol';
  sortOrder?: 'asc' | 'desc';

  // Pagination
  limit?: number;
  offset?: number;
}

export interface TradeListResponse {
  trades: TradeWithCalculations[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface DashboardMetrics {
  // Basic metrics
  totalTrades: number;
  totalPnl: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;

  // Win rate
  winRate: number; // percentage
  lossRate: number; // percentage

  // Average metrics
  averageWin: number;
  averageLoss: number;
  averagePnl: number;

  // Advanced metrics
  profitFactor: number; // gross profit / gross loss
  expectancy: number; // average expected profit per trade
  sharpeRatio: number;
  maxDrawdown: number;
  averageDrawdown: number;

  // Period
  startDate?: Date;
  endDate?: Date;
}

export interface PerformanceBreakdown {
  // By symbol
  bySymbol: Array<{
    symbol: string;
    trades: number;
    pnl: number;
    winRate: number;
  }>;

  // By asset type
  byAssetType: Array<{
    assetType: AssetType;
    trades: number;
    pnl: number;
    winRate: number;
  }>;

  // By strategy
  byStrategy: Array<{
    strategyName: string;
    trades: number;
    pnl: number;
    winRate: number;
  }>;

  // By setup type
  bySetupType: Array<{
    setupType: string;
    trades: number;
    pnl: number;
    winRate: number;
  }>;

  // By time of day
  byTimeOfDay: Array<{
    timeOfDay: TimeOfDay;
    trades: number;
    pnl: number;
    winRate: number;
  }>;

  // By day of week
  byDayOfWeek: Array<{
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    dayName: string;
    trades: number;
    pnl: number;
    winRate: number;
  }>;

  // By emotional state
  byEmotionalState: Array<{
    emotionalState: string;
    trades: number;
    pnl: number;
    winRate: number;
  }>;
}

export interface ChartData {
  // Equity curve (cumulative P&L over time)
  equityCurve: Array<{
    date: Date | string;
    cumulativePnl: number;
    tradeCount: number;
  }>;

  // Win/Loss distribution
  pnlDistribution: Array<{
    range: string; // e.g., "-500 to -400"
    count: number;
    pnl: number;
  }>;

  // Monthly performance
  monthlyPerformance: Array<{
    month: string; // e.g., "2025-01"
    trades: number;
    pnl: number;
    winRate: number;
  }>;
}

// ============================================================================
// Screenshot Upload Types
// ============================================================================

export interface ScreenshotUpload {
  file: File | Buffer;
  filename: string;
  mimeType?: string;
}

export interface ScreenshotResult {
  id?: string;
  url: string;
  filename: string;
  fileSize?: number;
  mimeType?: string;
}

// ============================================================================
// Tag Management Types
// ============================================================================

export interface CreateTagInput {
  name: string;
}

export interface TagWithCount extends Tag {
  _count?: {
    trades: number;
  };
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
  statusCode?: number;
}

// ============================================================================
// Utility Types
// ============================================================================

export type Outcome = 'winning' | 'losing' | 'breakeven';

export interface DateRange {
  startDate: Date | string;
  endDate: Date | string;
}

export interface Pagination {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

