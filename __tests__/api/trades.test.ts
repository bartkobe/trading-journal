/**
 * @jest-environment node
 */

import { POST, GET } from '@/app/api/trades/route';
import { GET as GET_TRADE, PUT, DELETE } from '@/app/api/trades/[id]/route';
import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// Helper to create NextRequest for testing
function createMockRequest(url: string, options: { method?: string; body?: string; headers?: Record<string, string> } = {}) {
  const { method = 'GET', body, headers = {} } = options;
  
  // Create a URL object
  const urlObj = new URL(url);
  
  // Create request with proper URL
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
  
  // Use the URL object directly
  return new NextRequest(urlObj, requestInit);
}

// Mock Prisma
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    trade: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    tag: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    tradeTag: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

// Mock auth
jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn(),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;

describe('Trade API Endpoints', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(mockUser);
  });

  describe('POST /api/trades', () => {
    it('should create a new trade successfully', async () => {
      const mockTrade = {
        id: 'trade-1',
        userId: mockUser.id,
        symbol: 'AAPL',
        assetType: 'STOCK',
        currency: 'USD',
        entryDate: new Date('2024-01-01'),
        entryPrice: 100,
        exitDate: new Date('2024-01-02'),
        exitPrice: 105,
        quantity: 10,
        direction: 'LONG',
        fees: 1,
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
      };

      mockPrisma.trade.create.mockResolvedValue(mockTrade as any);

      const requestBody = {
        symbol: 'AAPL',
        assetType: 'STOCK',
        currency: 'USD',
        entryDate: '2024-01-01T00:00:00.000Z',
        entryPrice: 100,
        exitDate: '2024-01-02T00:00:00.000Z',
        exitPrice: 105,
        quantity: 10,
        direction: 'LONG',
        fees: 1,
      };

      const request = createMockRequest('http://localhost/api/trades', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.trade).toBeDefined();
      expect(data.trade.symbol).toBe('AAPL');
      expect(mockPrisma.trade.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            symbol: 'AAPL',
            userId: mockUser.id,
          }),
        })
      );
    });

    it('should return 400 for invalid trade data', async () => {
      const requestBody = {
        symbol: '', // Invalid: empty symbol
        assetType: 'STOCK',
        entryPrice: 100,
      };

      const request = createMockRequest('http://localhost/api/trades', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
      expect(mockPrisma.trade.create).not.toHaveBeenCalled();
    });

    it('should return 401 when not authenticated', async () => {
      mockRequireAuth.mockRejectedValue(new Error('Authentication required'));

      const requestBody = {
        symbol: 'AAPL',
        assetType: 'STOCK',
        currency: 'USD',
        entryDate: '2024-01-01T00:00:00.000Z',
        entryPrice: 100,
        exitDate: '2024-01-02T00:00:00.000Z',
        exitPrice: 105,
        quantity: 10,
        direction: 'LONG',
        fees: 1,
      };

      const request = createMockRequest('http://localhost/api/trades', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should create a trade without exit fields (open trade)', async () => {
      const mockTrade = {
        id: 'trade-open-1',
        userId: mockUser.id,
        symbol: 'AAPL',
        assetType: 'STOCK',
        currency: 'USD',
        entryDate: new Date('2024-01-01'),
        entryPrice: 100,
        exitDate: null,
        exitPrice: null,
        quantity: 10,
        direction: 'LONG',
        fees: 0,
        setupType: null,
        strategyName: null,
        stopLoss: null,
        takeProfit: null,
        riskRewardRatio: null,
        actualRiskReward: null,
        timeOfDay: null,
        marketConditions: null,
        emotionalStateEntry: null,
        emotionalStateExit: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        screenshots: [],
        tags: [],
      };

      mockPrisma.trade.create.mockResolvedValue(mockTrade as any);

      const requestBody = {
        symbol: 'AAPL',
        assetType: 'STOCK',
        currency: 'USD',
        entryDate: '2024-01-01T00:00:00.000Z',
        entryPrice: 100,
        quantity: 10,
        direction: 'LONG',
        // exitDate and exitPrice omitted for open trade
      };

      const request = createMockRequest('http://localhost/api/trades', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.trade).toBeDefined();
      expect(mockPrisma.trade.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            symbol: 'AAPL',
            exitDate: null,
            exitPrice: null,
          }),
        })
      );
    });

    it('should create trade with tags', async () => {
      const mockTrade = {
        id: 'trade-1',
        userId: mockUser.id,
        symbol: 'AAPL',
        assetType: 'STOCK',
        currency: 'USD',
        entryDate: new Date('2024-01-01'),
        entryPrice: 100,
        exitDate: new Date('2024-01-02'),
        exitPrice: 105,
        quantity: 10,
        direction: 'LONG',
        fees: 1,
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
      };

      const mockTag = {
        id: 'tag-1',
        name: 'momentum',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.trade.create.mockResolvedValue(mockTrade as any);
      mockPrisma.tag.findUnique.mockResolvedValue(null);
      mockPrisma.tag.create.mockResolvedValue(mockTag as any);
      mockPrisma.tradeTag.create.mockResolvedValue({} as any);
      mockPrisma.trade.findUnique.mockResolvedValue({
        ...mockTrade,
        tags: [{ tag: mockTag }],
      } as any);

      const requestBody = {
        symbol: 'AAPL',
        assetType: 'STOCK',
        currency: 'USD',
        entryDate: '2024-01-01T00:00:00.000Z',
        entryPrice: 100,
        exitDate: '2024-01-02T00:00:00.000Z',
        exitPrice: 105,
        quantity: 10,
        direction: 'LONG',
        fees: 1,
        tags: ['momentum'],
      };

      const request = createMockRequest('http://localhost/api/trades', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockPrisma.tag.create).toHaveBeenCalledWith({
        data: { name: 'momentum' },
      });
      expect(mockPrisma.tradeTag.create).toHaveBeenCalled();
    });
  });

  describe('GET /api/trades', () => {
    it('should return list of trades', async () => {
      const mockTrades = [
        {
          id: 'trade-1',
          userId: mockUser.id,
          symbol: 'AAPL',
          assetType: 'STOCK',
          currency: 'USD',
          entryDate: new Date('2024-01-01'),
          entryPrice: 100,
          exitDate: new Date('2024-01-02'),
          exitPrice: 105,
          quantity: 10,
          direction: 'LONG',
          fees: 1,
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
        },
      ];

      mockPrisma.trade.findMany.mockResolvedValue(mockTrades as any);
      mockPrisma.trade.count.mockResolvedValue(1);

      const request = createMockRequest('http://localhost/api/trades');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.trades).toBeDefined();
      expect(Array.isArray(data.trades)).toBe(true);
      expect(mockPrisma.trade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: mockUser.id,
          }),
        })
      );
    });

    it('should filter trades by date range', async () => {
      mockPrisma.trade.findMany.mockResolvedValue([]);
      mockPrisma.trade.count.mockResolvedValue(0);

      const request = createMockRequest(
        'http://localhost/api/trades?startDate=2024-01-01&endDate=2024-01-31'
      );

      await GET(request);

      expect(mockPrisma.trade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            entryDate: expect.objectContaining({
              gte: expect.anything(),
              lte: expect.anything(),
            }),
          }),
        })
      );
    });

    it('should filter trades by symbol', async () => {
      mockPrisma.trade.findMany.mockResolvedValue([]);
      mockPrisma.trade.count.mockResolvedValue(0);

      const request = createMockRequest('http://localhost/api/trades?symbol=AAPL');

      await GET(request);

      expect(mockPrisma.trade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            symbol: expect.objectContaining({
              contains: 'AAPL',
              mode: 'insensitive',
            }),
          }),
        })
      );
    });

    it('should return 401 when not authenticated', async () => {
      mockRequireAuth.mockRejectedValue(new Error('Authentication required'));

      const request = createMockRequest('http://localhost/api/trades');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });
  });

  describe('GET /api/trades/[id]', () => {
    it('should return a single trade by ID', async () => {
      const mockTrade = {
        id: 'trade-1',
        userId: mockUser.id,
        symbol: 'AAPL',
        assetType: 'STOCK',
        currency: 'USD',
        entryDate: new Date('2024-01-01'),
        entryPrice: 100,
        exitDate: new Date('2024-01-02'),
        exitPrice: 105,
        quantity: 10,
        direction: 'LONG',
        fees: 1,
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
      };

      mockPrisma.trade.findUnique.mockResolvedValue(mockTrade as any);

      const request = createMockRequest('http://localhost/api/trades/trade-1');
      const params = Promise.resolve({ id: 'trade-1' });

      const response = await GET_TRADE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.trade).toBeDefined();
      expect(data.trade.id).toBe('trade-1');
      expect(mockPrisma.trade.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 'trade-1',
            userId: mockUser.id,
          },
        })
      );
    });

    it('should return 404 when trade not found', async () => {
      mockPrisma.trade.findUnique.mockResolvedValue(null);

      const request = createMockRequest('http://localhost/api/trades/nonexistent');
      const params = Promise.resolve({ id: 'nonexistent' });

      const response = await GET_TRADE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Trade not found');
    });

    it('should return 401 when not authenticated', async () => {
      mockRequireAuth.mockRejectedValue(new Error('Authentication required'));

      const request = createMockRequest('http://localhost/api/trades/trade-1');
      const params = Promise.resolve({ id: 'trade-1' });

      const response = await GET_TRADE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });
  });

  describe('PUT /api/trades/[id]', () => {
    it('should update a trade successfully', async () => {
      const existingTrade = {
        id: 'trade-1',
        userId: mockUser.id,
        symbol: 'AAPL',
        entryPrice: 100,
      };

      const updatedTrade = {
        ...existingTrade,
        symbol: 'MSFT',
        entryPrice: 150,
        exitPrice: 160,
        quantity: 20,
        screenshots: [],
        tags: [],
      };

      mockPrisma.trade.findUnique.mockResolvedValue(existingTrade as any);
      mockPrisma.trade.update.mockResolvedValue(updatedTrade as any);
      mockPrisma.tradeTag.deleteMany.mockResolvedValue({ count: 0 });

      const requestBody = {
        symbol: 'MSFT',
        assetType: 'STOCK',
        currency: 'USD',
        entryDate: '2024-01-01T00:00:00.000Z',
        entryPrice: 150,
        exitDate: '2024-01-02T00:00:00.000Z',
        exitPrice: 160,
        quantity: 20,
        direction: 'LONG',
        fees: 1,
      };

      const request = createMockRequest('http://localhost/api/trades/trade-1', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
      });
      const params = Promise.resolve({ id: 'trade-1' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.trade).toBeDefined();
      expect(mockPrisma.trade.update).toHaveBeenCalled();
    });

    it('should update an open trade to add exit fields (closing the trade)', async () => {
      const existingOpenTrade = {
        id: 'trade-open-1',
        userId: mockUser.id,
        symbol: 'AAPL',
        assetType: 'STOCK',
        currency: 'USD',
        entryDate: new Date('2024-01-01'),
        entryPrice: 100,
        exitDate: null,
        exitPrice: null,
        quantity: 10,
        direction: 'LONG',
        fees: 0,
        setupType: null,
        strategyName: null,
        stopLoss: null,
        takeProfit: null,
        riskRewardRatio: null,
        actualRiskReward: null,
        timeOfDay: null,
        marketConditions: null,
        emotionalStateEntry: null,
        emotionalStateExit: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        screenshots: [],
        tags: [],
      };

      const updatedClosedTrade = {
        ...existingOpenTrade,
        exitDate: new Date('2024-01-02'),
        exitPrice: 105,
      };

      mockPrisma.trade.findUnique.mockResolvedValue(existingOpenTrade as any);
      mockPrisma.trade.update.mockResolvedValue(updatedClosedTrade as any);
      mockPrisma.tradeTag.deleteMany.mockResolvedValue({ count: 0 });

      const requestBody = {
        symbol: 'AAPL',
        assetType: 'STOCK',
        currency: 'USD',
        entryDate: '2024-01-01T00:00:00.000Z',
        entryPrice: 100,
        exitDate: '2024-01-02T00:00:00.000Z',
        exitPrice: 105,
        quantity: 10,
        direction: 'LONG',
        fees: 0,
      };

      const request = createMockRequest('http://localhost/api/trades/trade-open-1', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
      });
      const params = Promise.resolve({ id: 'trade-open-1' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.trade).toBeDefined();
      expect(mockPrisma.trade.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            exitDate: expect.any(Date),
            exitPrice: 105,
          }),
        })
      );
    });

    it('should update a closed trade to remove exit fields (reopening the trade)', async () => {
      const existingClosedTrade = {
        id: 'trade-closed-1',
        userId: mockUser.id,
        symbol: 'AAPL',
        assetType: 'STOCK',
        currency: 'USD',
        entryDate: new Date('2024-01-01'),
        entryPrice: 100,
        exitDate: new Date('2024-01-02'),
        exitPrice: 105,
        quantity: 10,
        direction: 'LONG',
        fees: 0,
        setupType: null,
        strategyName: null,
        stopLoss: null,
        takeProfit: null,
        riskRewardRatio: null,
        actualRiskReward: null,
        timeOfDay: null,
        marketConditions: null,
        emotionalStateEntry: null,
        emotionalStateExit: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        screenshots: [],
        tags: [],
      };

      const updatedOpenTrade = {
        ...existingClosedTrade,
        exitDate: null,
        exitPrice: null,
      };

      mockPrisma.trade.findUnique.mockResolvedValue(existingClosedTrade as any);
      mockPrisma.trade.update.mockResolvedValue(updatedOpenTrade as any);
      mockPrisma.tradeTag.deleteMany.mockResolvedValue({ count: 0 });

      const requestBody = {
        symbol: 'AAPL',
        assetType: 'STOCK',
        currency: 'USD',
        entryDate: '2024-01-01T00:00:00.000Z',
        entryPrice: 100,
        // exitDate and exitPrice omitted to reopen the trade
        quantity: 10,
        direction: 'LONG',
        fees: 0,
      };

      const request = createMockRequest('http://localhost/api/trades/trade-closed-1', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
      });
      const params = Promise.resolve({ id: 'trade-closed-1' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.trade).toBeDefined();
      expect(mockPrisma.trade.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            exitDate: null,
            exitPrice: null,
          }),
        })
      );
    });

    it('should return 404 when trade not found', async () => {
      mockPrisma.trade.findUnique.mockResolvedValue(null);

      const requestBody = {
        symbol: 'MSFT',
        assetType: 'STOCK',
        currency: 'USD',
        entryDate: '2024-01-01T00:00:00.000Z',
        entryPrice: 150,
        exitDate: '2024-01-02T00:00:00.000Z',
        exitPrice: 160,
        quantity: 20,
        direction: 'LONG',
        fees: 1,
      };

      const request = new NextRequest('http://localhost/api/trades/nonexistent', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      const params = Promise.resolve({ id: 'nonexistent' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Trade not found');
      expect(mockPrisma.trade.update).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid update data', async () => {
      const existingTrade = {
        id: 'trade-1',
        userId: mockUser.id,
        symbol: 'AAPL',
      };

      mockPrisma.trade.findUnique.mockResolvedValue(existingTrade as any);

      const requestBody = {
        symbol: '', // Invalid: empty symbol
        entryPrice: 150,
      };

      const request = createMockRequest('http://localhost/api/trades/trade-1', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
      });
      const params = Promise.resolve({ id: 'trade-1' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });
  });

  describe('DELETE /api/trades/[id]', () => {
    it('should delete a trade successfully', async () => {
      const existingTrade = {
        id: 'trade-1',
        userId: mockUser.id,
        symbol: 'AAPL',
      };

      mockPrisma.trade.findUnique.mockResolvedValue(existingTrade as any);
      mockPrisma.trade.delete.mockResolvedValue(existingTrade as any);

      const request = createMockRequest('http://localhost/api/trades/trade-1', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ id: 'trade-1' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Trade deleted successfully');
      expect(mockPrisma.trade.delete).toHaveBeenCalledWith({
        where: { id: 'trade-1' },
      });
    });

    it('should return 404 when trade not found', async () => {
      mockPrisma.trade.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/trades/nonexistent', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ id: 'nonexistent' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Trade not found');
      expect(mockPrisma.trade.delete).not.toHaveBeenCalled();
    });

    it('should return 401 when not authenticated', async () => {
      mockRequireAuth.mockRejectedValue(new Error('Authentication required'));

      const request = createMockRequest('http://localhost/api/trades/trade-1', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ id: 'trade-1' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });
  });
});

