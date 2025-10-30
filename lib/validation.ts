import { z } from 'zod';

// ============================================================================
// Authentication Schemas
// ============================================================================

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(1, 'Name is required').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// ============================================================================
// Trade Schemas
// ============================================================================

export const tradeSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  assetType: z.enum(['STOCK', 'FOREX', 'CRYPTO', 'OPTIONS']),
  currency: z.string().default('USD'),
  entryDate: z.coerce.date(),
  entryPrice: z.number().positive('Entry price must be positive'),
  exitDate: z.coerce.date(),
  exitPrice: z.number().positive('Exit price must be positive'),
  quantity: z.number().positive('Quantity must be positive'),
  direction: z.enum(['LONG', 'SHORT']),

  // Optional metadata
  setupType: z.string().optional(),
  strategyName: z.string().optional(),
  stopLoss: z.number().positive().optional(),
  takeProfit: z.number().positive().optional(),
  riskRewardRatio: z.number().optional(),
  actualRiskReward: z.number().optional(),

  // Fees
  fees: z.number().min(0).optional().default(0),

  // Context
  timeOfDay: z
    .enum(['PRE_MARKET', 'MARKET_OPEN', 'MID_DAY', 'MARKET_CLOSE', 'AFTER_HOURS'])
    .optional(),
  marketConditions: z.enum(['TRENDING', 'RANGING', 'VOLATILE', 'CALM']).optional(),
  emotionalStateEntry: z.string().optional(),
  emotionalStateExit: z.string().optional(),

  // Notes
  notes: z.string().optional(),

  // Tags (array of tag IDs or names)
  tags: z.array(z.string()).optional(),
});

export type TradeInput = z.infer<typeof tradeSchema>;

// ============================================================================
// Tag Schema
// ============================================================================

export const tagSchema = z.object({
  name: z
    .string()
    .min(1, 'Tag name is required')
    .max(50, 'Tag name must be less than 50 characters')
    .regex(
      /^[a-zA-Z0-9-_]+$/,
      'Tag name can only contain letters, numbers, hyphens, and underscores'
    ),
});

export type TagInput = z.infer<typeof tagSchema>;

// ============================================================================
// Filter Schemas
// ============================================================================

export const tradeFilterSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  assetType: z.enum(['STOCK', 'FOREX', 'CRYPTO', 'OPTIONS']).optional(),
  symbol: z.string().optional(),
  search: z.string().optional(),
  strategyName: z.string().optional(),
  setupType: z.string().optional(),
  tags: z.array(z.string()).optional(),
  outcome: z.enum(['winning', 'losing', 'breakeven']).optional(),
  sortBy: z.enum(['date', 'pnl', 'pnlPercent', 'symbol']).optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  limit: z.number().int().positive().optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
});

export type TradeFilterInput = z.infer<typeof tradeFilterSchema>;
