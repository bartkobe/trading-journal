/**
 * @jest-environment node
 */

import { GET as GET_DASHBOARD } from '@/app/api/analytics/dashboard/route';
import { GET as GET_PERFORMANCE } from '@/app/api/analytics/performance/route';
import { GET as GET_CHARTS } from '@/app/api/analytics/charts/route';
import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// Helper to create NextRequest for testing
function createMockRequest(url: string, options: { method?: string; body?: string; headers?: Record<string, string> } = {}) {
  const { method = 'GET', body, headers = {} } = options;
  
  const urlObj = new URL(url);
  
  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };
  
  if (body) {
    requestInit.body = body;
  }
  
  return new NextRequest(urlObj, requestInit);
}

// Mock Prisma - need to mock both named and default exports
jest.mock('@/lib/db', () => {
  const mockPrismaInstance = {
    trade: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };
  return {
    __esModule: true,
    prisma: mockPrismaInstance,
    default: mockPrismaInstance,
  };
});

// Mock auth
jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn(),
}));

import prisma from '@/lib/db';
const mockPrisma = prisma as any;
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;

describe('Analytics API Endpoints', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
  };

  const createMockTrade = (overrides: any = {}) => {
    const baseEntryDate = overrides.entryDate || new Date('2024-01-01T10:00:00Z');
    const baseExitDate = overrides.exitDate || new Date(baseEntryDate.getTime() + 86400000); // +1 day
    
    return {
      id: 'trade-1',
      userId: mockUser.id,
      symbol: 'AAPL',
      assetType: 'STOCK',
      currency: 'USD',
      entryDate: baseEntryDate,
      entryPrice: 100,
      exitDate: baseExitDate,
      exitPrice: overrides.exitPrice !== undefined ? overrides.exitPrice : 105,
      quantity: overrides.quantity !== undefined ? overrides.quantity : 10,
      direction: 'LONG',
      fees: overrides.fees !== undefined ? overrides.fees : 1,
      setupType: null,
      strategyName: null,
      stopLoss: null,
      takeProfit: null,
      riskRewardRatio: null,
      timeOfDay: null,
      marketConditions: null,
      emotionalStateEntry: null,
      emotionalStateExit: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      screenshots: [],
      tags: [],
      ...overrides,
      // Ensure these are always set even if overridden
      entryDate: overrides.entryDate || baseEntryDate,
      exitDate: overrides.exitDate || baseExitDate,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(mockUser);
  });

  describe('GET /api/analytics/dashboard', () => {
    it('should return dashboard metrics successfully', async () => {
      const mockTrades = [createMockTrade()];
      mockPrisma.trade.findMany.mockResolvedValue(mockTrades as any);

      const request = createMockRequest('http://localhost/api/analytics/dashboard');
      const response = await GET_DASHBOARD(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.metrics).toBeDefined();
      expect(data.metrics.totalTrades).toBeDefined();
      expect(data.metrics.performance).toBeDefined();
      expect(data.metrics.winLoss).toBeDefined();
      expect(data.metrics.advanced).toBeDefined();
      expect(data.metrics.drawdown).toBeDefined();
      expect(data.metrics.streaks).toBeDefined();
      expect(mockPrisma.trade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: mockUser.id,
          }),
        })
      );
    });

    it('should filter by date range when provided', async () => {
      mockPrisma.trade.findMany.mockResolvedValue([]);

      const request = createMockRequest(
        'http://localhost/api/analytics/dashboard?startDate=2024-01-01&endDate=2024-01-31'
      );
      await GET_DASHBOARD(request);

      expect(mockPrisma.trade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            entryDate: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        })
      );
    });

    it('should return 401 when not authenticated', async () => {
      const authError = new Error('Unauthorized');
      mockRequireAuth.mockRejectedValue(authError);

      const request = createMockRequest('http://localhost/api/analytics/dashboard');
      const response = await GET_DASHBOARD(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle empty trades array', async () => {
      mockPrisma.trade.findMany.mockResolvedValue([]);

      const request = createMockRequest('http://localhost/api/analytics/dashboard');
      const response = await GET_DASHBOARD(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.metrics.totalTrades).toBe(0);
    });

    it('should exclude open trades from dashboard metrics', async () => {
      mockPrisma.trade.findMany.mockResolvedValue([]);
      mockPrisma.trade.count.mockResolvedValue(0);

      const request = createMockRequest('http://localhost/api/analytics/dashboard');
      await GET_DASHBOARD(request);

      // Verify that the where clause includes exitDate filter
      expect(mockPrisma.trade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            exitDate: expect.objectContaining({
              not: null,
            }),
          }),
        })
      );
    });
  });

  describe('GET /api/analytics/performance', () => {
    it('should return all performance breakdowns when no dimension specified', async () => {
      const mockTrades = [createMockTrade()];
      mockPrisma.trade.findMany.mockResolvedValue(mockTrades as any);

      const request = createMockRequest('http://localhost/api/analytics/performance');
      const response = await GET_PERFORMANCE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.performance).toBeDefined();
      expect(data.performance.bySymbol).toBeDefined();
      expect(data.performance.byStrategy).toBeDefined();
      expect(data.performance.bySetupType).toBeDefined();
      expect(data.performance.byAssetType).toBeDefined();
      expect(data.performance.byTimeOfDay).toBeDefined();
      expect(data.performance.byEmotionalState).toBeDefined();
      expect(data.performance.byMarketConditions).toBeDefined();
      expect(data.performance.byDayOfWeek).toBeDefined();
    });

    it('should return specific dimension when requested', async () => {
      const mockTrades = [
        createMockTrade({ symbol: 'AAPL' }),
        createMockTrade({ symbol: 'MSFT' }),
      ];
      mockPrisma.trade.findMany.mockResolvedValue(mockTrades as any);

      const request = createMockRequest('http://localhost/api/analytics/performance?dimension=symbol');
      const response = await GET_PERFORMANCE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.performance.bySymbol).toBeDefined();
      expect(Array.isArray(data.performance.bySymbol)).toBe(true);
      // Other dimensions should not be present when specific dimension is requested
    });

    it('should return empty arrays when no trades exist', async () => {
      mockPrisma.trade.findMany.mockResolvedValue([]);

      const request = createMockRequest('http://localhost/api/analytics/performance');
      const response = await GET_PERFORMANCE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.totalTrades).toBe(0);
      expect(data.performance.bySymbol).toEqual([]);
      expect(data.performance.byStrategy).toEqual([]);
    });

    it('should filter by date range when provided', async () => {
      mockPrisma.trade.findMany.mockResolvedValue([]);

      const request = createMockRequest(
        'http://localhost/api/analytics/performance?startDate=2024-01-01&endDate=2024-01-31'
      );
      await GET_PERFORMANCE(request);

      expect(mockPrisma.trade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            entryDate: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        })
      );
    });

    it('should return 401 when not authenticated', async () => {
      const authError = new Error('Unauthorized');
      mockRequireAuth.mockRejectedValue(authError);

      const request = createMockRequest('http://localhost/api/analytics/performance');
      const response = await GET_PERFORMANCE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });

    it('should exclude open trades from performance breakdowns', async () => {
      mockPrisma.trade.findMany.mockResolvedValue([]);

      const request = createMockRequest('http://localhost/api/analytics/performance');
      await GET_PERFORMANCE(request);

      // Verify that the where clause includes exitDate filter
      expect(mockPrisma.trade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            exitDate: expect.objectContaining({
              not: null,
            }),
          }),
        })
      );
    });

    it('should handle performance by strategyName dimension', async () => {
      const mockTrades = [
        createMockTrade({ strategyName: 'Momentum' }),
        createMockTrade({ strategyName: 'Reversal' }),
      ];
      mockPrisma.trade.findMany.mockResolvedValue(mockTrades as any);

      const request = createMockRequest('http://localhost/api/analytics/performance?dimension=strategy');
      const response = await GET_PERFORMANCE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.performance.byStrategy).toBeDefined();
    });

    it('should handle performance by dayOfWeek dimension', async () => {
      const mockTrades = [
        createMockTrade({ entryDate: new Date('2024-01-01T10:00:00Z') }), // Monday
        createMockTrade({ entryDate: new Date('2024-01-02T10:00:00Z') }), // Tuesday
      ];
      mockPrisma.trade.findMany.mockResolvedValue(mockTrades as any);

      const request = createMockRequest('http://localhost/api/analytics/performance?dimension=dayOfWeek');
      const response = await GET_PERFORMANCE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.performance.byDayOfWeek).toBeDefined();
      expect(Array.isArray(data.performance.byDayOfWeek)).toBe(true);
    });
  });

  describe('GET /api/analytics/charts', () => {
    it('should return all chart data when no chartType specified', async () => {
      const mockTrades = [createMockTrade()];
      mockPrisma.trade.findMany.mockResolvedValue(mockTrades as any);

      const request = createMockRequest('http://localhost/api/analytics/charts');
      const response = await GET_CHARTS(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.charts).toBeDefined();
      expect(data.charts.equityCurve).toBeDefined();
      expect(data.charts.distribution).toBeDefined();
      expect(data.charts.pnlDistribution).toBeDefined();
      expect(data.charts.byAssetType).toBeDefined();
      expect(data.charts.byStrategy).toBeDefined();
      expect(data.charts.byTimeOfDay).toBeDefined();
      expect(data.charts.byDayOfWeek).toBeDefined();
      expect(data.charts.bySymbol).toBeDefined();
      expect(data.charts.byMarketConditions).toBeDefined();
      expect(data.charts.monthlyPerformance).toBeDefined();
      
      // Verify that the where clause includes exitDate filter
      expect(mockPrisma.trade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            exitDate: expect.objectContaining({
              not: null,
            }),
          }),
        })
      );
    });

    it('should return equity curve only when chartType=equity', async () => {
      const mockTrades = [createMockTrade()];
      mockPrisma.trade.findMany.mockResolvedValue(mockTrades as any);

      const request = createMockRequest('http://localhost/api/analytics/charts?chartType=equity');
      const response = await GET_CHARTS(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.charts.equityCurve).toBeDefined();
      expect(Array.isArray(data.charts.equityCurve)).toBe(true);
    });

    it('should return distribution only when chartType=distribution', async () => {
      const mockTrades = [
        createMockTrade({ exitPrice: 105 }), // Win
        createMockTrade({ exitPrice: 95 }), // Loss
      ];
      mockPrisma.trade.findMany.mockResolvedValue(mockTrades as any);

      const request = createMockRequest('http://localhost/api/analytics/charts?chartType=distribution');
      const response = await GET_CHARTS(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.charts.distribution).toBeDefined();
      expect(data.charts.pnlDistribution).toBeDefined();
      expect(typeof data.charts.distribution.wins).toBe('number');
      expect(typeof data.charts.distribution.losses).toBe('number');
    });

    it('should return breakdown only when chartType=breakdown', async () => {
      const mockTrades = [createMockTrade()];
      mockPrisma.trade.findMany.mockResolvedValue(mockTrades as any);

      const request = createMockRequest('http://localhost/api/analytics/charts?chartType=breakdown');
      const response = await GET_CHARTS(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.charts.byAssetType).toBeDefined();
      expect(data.charts.byStrategy).toBeDefined();
      expect(data.charts.byTimeOfDay).toBeDefined();
      expect(data.charts.byDayOfWeek).toBeDefined();
      expect(data.charts.bySymbol).toBeDefined();
      expect(data.charts.byMarketConditions).toBeDefined();
    });

    it('should return monthly performance when chartType=monthly', async () => {
      const mockTrades = [
        createMockTrade({ entryDate: new Date('2024-01-15T10:00:00Z') }),
        createMockTrade({ entryDate: new Date('2024-02-15T10:00:00Z') }),
      ];
      mockPrisma.trade.findMany.mockResolvedValue(mockTrades as any);

      const request = createMockRequest('http://localhost/api/analytics/charts?chartType=monthly');
      const response = await GET_CHARTS(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.charts.monthlyPerformance).toBeDefined();
      expect(Array.isArray(data.charts.monthlyPerformance)).toBe(true);
    });

    it('should filter by date range when provided', async () => {
      mockPrisma.trade.findMany.mockResolvedValue([]);

      const request = createMockRequest(
        'http://localhost/api/analytics/charts?startDate=2024-01-01&endDate=2024-01-31'
      );
      await GET_CHARTS(request);

      expect(mockPrisma.trade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            entryDate: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        })
      );
    });

    it('should return 401 when not authenticated', async () => {
      const authError = new Error('Unauthorized');
      mockRequireAuth.mockRejectedValue(authError);

      const request = createMockRequest('http://localhost/api/analytics/charts');
      const response = await GET_CHARTS(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle empty trades array', async () => {
      mockPrisma.trade.findMany.mockResolvedValue([]);

      const request = createMockRequest('http://localhost/api/analytics/charts');
      const response = await GET_CHARTS(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.totalTrades).toBe(0);
    });

    it('should calculate P&L distribution buckets correctly', async () => {
      const mockTrades = [
        createMockTrade({ exitPrice: 110, quantity: 10, fees: 1 }), // Win > $500
        createMockTrade({ exitPrice: 101, quantity: 10, fees: 1 }), // Win $0-$100
        createMockTrade({ exitPrice: 90, quantity: 10, fees: 1 }), // Loss $0-$100
        createMockTrade({ exitPrice: 100, quantity: 10, fees: 0 }), // Breakeven
      ];
      mockPrisma.trade.findMany.mockResolvedValue(mockTrades as any);

      const request = createMockRequest('http://localhost/api/analytics/charts?chartType=distribution');
      const response = await GET_CHARTS(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.charts.pnlDistribution).toBeDefined();
      expect(Array.isArray(data.charts.pnlDistribution)).toBe(true);
      
      // Check that buckets are present
      const bucketRanges = data.charts.pnlDistribution.map((b: any) => b.range);
      expect(bucketRanges).toContain('Breakeven');
    });
  });
});

