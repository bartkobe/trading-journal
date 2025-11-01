/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/trades/route';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// Mock Prisma
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    trade: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

// Mock auth
jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn(),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;

describe('Trade Filtering API Endpoint', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
  };

  const createMockTrade = (overrides: any = {}) => ({
    id: 'trade-1',
    userId: mockUser.id,
    symbol: 'AAPL',
    assetType: 'STOCK',
    currency: 'USD',
    entryDate: new Date('2024-01-15T10:00:00Z'),
    entryPrice: 100,
    exitDate: new Date('2024-01-16T10:00:00Z'),
    exitPrice: 105,
    quantity: 10,
    direction: 'LONG',
    fees: 1,
    setupType: null,
    strategyName: 'Momentum Trading',
    stopLoss: null,
    takeProfit: null,
    riskRewardRatio: null,
    timeOfDay: null,
    marketConditions: null,
    emotionalStateEntry: null,
    emotionalStateExit: null,
    notes: 'Great trade setup',
    createdAt: new Date(),
    updatedAt: new Date(),
    screenshots: [],
    tags: [],
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(mockUser);
  });

  describe('GET /api/trades - Filtering', () => {
    it('should return trades without filters', async () => {
      const mockTrades = [createMockTrade()];
      mockPrisma.trade.findMany.mockResolvedValue(mockTrades as any);
      mockPrisma.trade.count.mockResolvedValue(1);

      const request = new NextRequest('http://localhost/api/trades');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.trades).toHaveLength(1);
      expect(data.total).toBe(1);
      expect(mockPrisma.trade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUser.id },
        })
      );
    });

    it('should filter by date range', async () => {
      mockPrisma.trade.findMany.mockResolvedValue([]);
      mockPrisma.trade.count.mockResolvedValue(0);

      const request = new NextRequest(
        'http://localhost/api/trades?startDate=2024-01-01&endDate=2024-01-31'
      );
      await GET(request);

      expect(mockPrisma.trade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: mockUser.id,
            entryDate: {
              gte: new Date('2024-01-01'),
              lte: new Date('2024-01-31'),
            },
          }),
        })
      );
    });

    it('should filter by asset type', async () => {
      mockPrisma.trade.findMany.mockResolvedValue([]);
      mockPrisma.trade.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost/api/trades?assetType=STOCK');
      await GET(request);

      expect(mockPrisma.trade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: mockUser.id,
            assetType: 'STOCK',
          }),
        })
      );
    });

    it('should filter by symbol (case insensitive)', async () => {
      mockPrisma.trade.findMany.mockResolvedValue([]);
      mockPrisma.trade.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost/api/trades?symbol=aapl');
      await GET(request);

      expect(mockPrisma.trade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: mockUser.id,
            symbol: {
              contains: 'aapl',
              mode: 'insensitive',
            },
          }),
        })
      );
    });

    it('should filter by strategy name (case insensitive)', async () => {
      mockPrisma.trade.findMany.mockResolvedValue([]);
      mockPrisma.trade.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost/api/trades?strategyName=momentum');
      await GET(request);

      expect(mockPrisma.trade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: mockUser.id,
            strategyName: {
              contains: 'momentum',
              mode: 'insensitive',
            },
          }),
        })
      );
    });

    it('should filter by tags', async () => {
      mockPrisma.trade.findMany.mockResolvedValue([]);
      mockPrisma.trade.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost/api/trades?tags=momentum,breakout');
      await GET(request);

      expect(mockPrisma.trade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: mockUser.id,
            tags: {
              some: {
                tag: {
                  name: {
                    in: ['momentum', 'breakout'],
                  },
                },
              },
            },
          }),
        })
      );
    });

    it('should search across multiple fields', async () => {
      mockPrisma.trade.findMany.mockResolvedValue([]);
      mockPrisma.trade.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost/api/trades?search=apple');
      await GET(request);

      expect(mockPrisma.trade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: mockUser.id,
            AND: [
              {
                OR: [
                  { symbol: { contains: 'apple', mode: 'insensitive' } },
                  { strategyName: { contains: 'apple', mode: 'insensitive' } },
                  { notes: { contains: 'apple', mode: 'insensitive' } },
                  {
                    tags: {
                      some: {
                        tag: {
                          name: { contains: 'apple', mode: 'insensitive' },
                        },
                      },
                    },
                  },
                ],
              },
            ],
          }),
        })
      );
    });

    it('should combine search with other filters', async () => {
      mockPrisma.trade.findMany.mockResolvedValue([]);
      mockPrisma.trade.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost/api/trades?search=aapl&assetType=STOCK');
      await GET(request);

      expect(mockPrisma.trade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: mockUser.id,
            assetType: 'STOCK',
            AND: [
              {
                OR: [
                  { symbol: { contains: 'aapl', mode: 'insensitive' } },
                  { strategyName: { contains: 'aapl', mode: 'insensitive' } },
                  { notes: { contains: 'aapl', mode: 'insensitive' } },
                  {
                    tags: {
                      some: {
                        tag: {
                          name: { contains: 'aapl', mode: 'insensitive' },
                        },
                      },
                    },
                  },
                ],
              },
            ],
          }),
        })
      );
    });

    it('should filter by outcome after calculations', async () => {
      const winningTrade = createMockTrade({
        exitPrice: 105,
        // This creates a winning trade with pnl = (105-100)*10 - 1 = 49 > 0
      });
      const losingTrade = createMockTrade({
        id: 'trade-2',
        symbol: 'MSFT',
        exitPrice: 95,
        // This creates a losing trade with pnl = (95-100)*10 - 1 = -51 < 0
      });

      mockPrisma.trade.findMany.mockResolvedValue([winningTrade, losingTrade] as any);
      mockPrisma.trade.count.mockResolvedValue(2);

      const request = new NextRequest('http://localhost/api/trades?outcome=winning');
      const response = await GET(request);
      const data = await response.json();

      expect(data.trades).toHaveLength(1);
      expect(data.trades[0].symbol).toBe('AAPL'); // Only the winning trade
    });

    it('should sort by date', async () => {
      mockPrisma.trade.findMany.mockResolvedValue([]);
      mockPrisma.trade.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost/api/trades?sortBy=date&sortOrder=asc');
      await GET(request);

      expect(mockPrisma.trade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { entryDate: 'asc' },
        })
      );
    });

    it('should sort by symbol', async () => {
      mockPrisma.trade.findMany.mockResolvedValue([]);
      mockPrisma.trade.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost/api/trades?sortBy=symbol&sortOrder=desc');
      await GET(request);

      expect(mockPrisma.trade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { symbol: 'desc' },
        })
      );
    });

    it('should handle pagination', async () => {
      mockPrisma.trade.findMany.mockResolvedValue([]);
      mockPrisma.trade.count.mockResolvedValue(100);

      const request = new NextRequest('http://localhost/api/trades?limit=10&offset=20');
      const response = await GET(request);
      const data = await response.json();

      expect(mockPrisma.trade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        })
      );
      expect(data.page).toBe(3); // (20 / 10) + 1 = 3
      expect(data.limit).toBe(10);
      expect(data.hasMore).toBe(true);
      expect(data.total).toBe(100);
    });

    it('should validate filter parameters', async () => {
      const request = new NextRequest('http://localhost/api/trades?assetType=INVALID');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid filter parameters');
      expect(mockPrisma.trade.findMany).not.toHaveBeenCalled();
    });

    it('should return 401 when not authenticated', async () => {
      mockRequireAuth.mockRejectedValue(new Error('Authentication required'));

      const request = new NextRequest('http://localhost/api/trades');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should handle database errors', async () => {
      mockPrisma.trade.findMany.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trades');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch trades');
    });

    it('should include related data (tags, screenshots)', async () => {
      const mockTrade = createMockTrade({
        tags: [
          { tag: { id: 'tag-1', name: 'momentum', createdAt: new Date(), updatedAt: new Date() } },
        ],
        screenshots: [
          { id: 'screenshot-1', url: 'test.jpg', filename: 'test.jpg', fileSize: 1000, mimeType: 'image/jpeg', createdAt: new Date(), updatedAt: new Date() },
        ],
      });
      mockPrisma.trade.findMany.mockResolvedValue([mockTrade] as any);
      mockPrisma.trade.count.mockResolvedValue(1);

      const request = new NextRequest('http://localhost/api/trades');
      const response = await GET(request);
      const data = await response.json();

      expect(mockPrisma.trade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            screenshots: true,
            tags: {
              include: {
                tag: true,
              },
            },
          },
        })
      );
    });

    it('should enrich trades with calculations', async () => {
      const mockTrade = createMockTrade();
      mockPrisma.trade.findMany.mockResolvedValue([mockTrade] as any);
      mockPrisma.trade.count.mockResolvedValue(1);

      const request = new NextRequest('http://localhost/api/trades');
      const response = await GET(request);
      const data = await response.json();

      expect(data.trades[0]).toHaveProperty('calculations');
      expect(data.trades[0].calculations).toHaveProperty('pnl');
      expect(data.trades[0].calculations).toHaveProperty('pnlPercent');
      expect(data.trades[0].calculations).toHaveProperty('netPnl');
    });

    it('should sort by pnl/pnlPercent in memory after calculations', async () => {
      const trade1 = createMockTrade({ id: 'trade-1', exitPrice: 110 }); // Higher pnl
      const trade2 = createMockTrade({ id: 'trade-2', exitPrice: 102 }); // Lower pnl

      mockPrisma.trade.findMany.mockResolvedValue([trade1, trade2] as any);
      mockPrisma.trade.count.mockResolvedValue(2);

      const request = new NextRequest('http://localhost/api/trades?sortBy=pnl&sortOrder=desc');
      const response = await GET(request);
      const data = await response.json();

      // Should be sorted by pnl descending (trade1 first due to higher pnl)
      expect(data.trades[0].id).toBe('trade-1');
      expect(data.trades[1].id).toBe('trade-2');
    });

    it('should handle empty results', async () => {
      mockPrisma.trade.findMany.mockResolvedValue([]);
      mockPrisma.trade.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost/api/trades');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.trades).toEqual([]);
      expect(data.total).toBe(0);
      expect(data.hasMore).toBe(false);
    });
  });
});

