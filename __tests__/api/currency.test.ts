/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/trades/route';
import { GET as GET_TRADE } from '@/app/api/trades/[id]/route';
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

// Mock Prisma
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    trade: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
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

describe('Multi-Currency Support in API', () => {
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

  describe('POST /api/trades - Currency Support', () => {
    it('should create trade with USD currency', async () => {
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
      mockPrisma.trade.findUnique.mockResolvedValue(mockTrade as any);

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
      expect(data.trade.currency).toBe('USD');
    });

    it('should create trade with EUR currency', async () => {
      const mockTrade = {
        id: 'trade-1',
        userId: mockUser.id,
        symbol: 'EURUSD',
        assetType: 'FOREX',
        currency: 'EUR',
        entryDate: new Date('2024-01-01'),
        entryPrice: 1.10,
        exitDate: new Date('2024-01-02'),
        exitPrice: 1.12,
        quantity: 10000,
        direction: 'LONG',
        fees: 0,
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
      mockPrisma.trade.findUnique.mockResolvedValue(mockTrade as any);

      const requestBody = {
        symbol: 'EURUSD',
        assetType: 'FOREX',
        currency: 'EUR',
        entryDate: '2024-01-01T00:00:00.000Z',
        entryPrice: 1.10,
        exitDate: '2024-01-02T00:00:00.000Z',
        exitPrice: 1.12,
        quantity: 10000,
        direction: 'LONG',
        fees: 0,
      };

      const request = createMockRequest('http://localhost/api/trades', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.trade.currency).toBe('EUR');
    });

    it('should create trade with GBP currency', async () => {
      const mockTrade = {
        id: 'trade-1',
        userId: mockUser.id,
        symbol: 'GBPAUD',
        assetType: 'FOREX',
        currency: 'GBP',
        entryDate: new Date('2024-01-01'),
        entryPrice: 1.85,
        exitDate: new Date('2024-01-02'),
        exitPrice: 1.87,
        quantity: 5000,
        direction: 'LONG',
        fees: 2.5,
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
      mockPrisma.trade.findUnique.mockResolvedValue(mockTrade as any);

      const requestBody = {
        symbol: 'GBPAUD',
        assetType: 'FOREX',
        currency: 'GBP',
        entryDate: '2024-01-01T00:00:00.000Z',
        entryPrice: 1.85,
        exitDate: '2024-01-02T00:00:00.000Z',
        exitPrice: 1.87,
        quantity: 5000,
        direction: 'LONG',
        fees: 2.5,
      };

      const request = createMockRequest('http://localhost/api/trades', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.trade.currency).toBe('GBP');
    });

    it('should default to USD when currency is not provided', async () => {
      const mockTrade = {
        id: 'trade-1',
        userId: mockUser.id,
        symbol: 'AAPL',
        assetType: 'STOCK',
        currency: 'USD', // Default
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
      mockPrisma.trade.findUnique.mockResolvedValue(mockTrade as any);

      const requestBody = {
        symbol: 'AAPL',
        assetType: 'STOCK',
        // currency not provided
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
      expect(data.trade.currency).toBe('USD');
    });
  });

  describe('GET /api/trades/[id] - Currency Support', () => {
    it('should return trade with correct currency', async () => {
      const mockTrade = {
        id: 'trade-1',
        userId: mockUser.id,
        symbol: 'BTCUSD',
        assetType: 'CRYPTO',
        currency: 'USD',
        entryDate: new Date('2024-01-01'),
        entryPrice: 40000,
        exitDate: new Date('2024-01-02'),
        exitPrice: 41000,
        quantity: 0.5,
        direction: 'LONG',
        fees: 20,
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
      expect(data.trade.currency).toBe('USD');
    });
  });

  describe('GET /api/trades - Currency Filtering', () => {
    it('should return trades with mixed currencies', async () => {
      const mockTrades = [
        {
          id: 'trade-1',
          userId: mockUser.id,
          symbol: 'AAPL',
          currency: 'USD',
          entryDate: new Date('2024-01-01'),
          entryPrice: 100,
          exitDate: new Date('2024-01-02'),
          exitPrice: 105,
          quantity: 10,
          direction: 'LONG',
          assetType: 'STOCK',
          fees: 1,
          screenshots: [],
          tags: [],
        },
        {
          id: 'trade-2',
          userId: mockUser.id,
          symbol: 'EURUSD',
          currency: 'EUR',
          entryDate: new Date('2024-01-03'),
          entryPrice: 1.10,
          exitDate: new Date('2024-01-04'),
          exitPrice: 1.12,
          quantity: 10000,
          direction: 'LONG',
          assetType: 'FOREX',
          fees: 0,
          screenshots: [],
          tags: [],
        },
      ];

      mockPrisma.trade.findMany.mockResolvedValue(mockTrades as any);
      mockPrisma.trade.count.mockResolvedValue(2);

      const request = createMockRequest('http://localhost/api/trades');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.trades.length).toBe(2);
      expect(data.trades[0].currency).toBe('USD');
      expect(data.trades[1].currency).toBe('EUR');
    });
  });
});

