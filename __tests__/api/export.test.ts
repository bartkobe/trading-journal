/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/export/csv/route';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// Helper to create NextRequest for testing
function createMockRequest(url: string, options: { method?: string; headers?: Record<string, string> } = {}) {
  const { method = 'GET', headers = {} } = options;
  
  const urlObj = new URL(url);
  
  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };
  
  return new NextRequest(urlObj, requestInit);
}

// Mock Prisma
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    trade: {
      findMany: jest.fn(),
    },
  },
}));

// Mock auth
jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn(),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;

describe('CSV Export API Endpoint', () => {
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

  describe('GET /api/export/csv', () => {
    it('should export trades as CSV with proper headers', async () => {
      const mockTrades = [
        {
          id: 'trade-1',
          userId: mockUser.id,
          symbol: 'AAPL',
          assetType: 'STOCK',
          currency: 'USD',
          entryDate: new Date('2024-01-01T10:00:00Z'),
          entryPrice: 100,
          exitDate: new Date('2024-01-02T10:00:00Z'),
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

      const request = createMockRequest('http://localhost/api/export/csv');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/csv; charset=utf-8');
      expect(response.headers.get('Content-Disposition')).toContain('attachment');
      expect(response.headers.get('Content-Disposition')).toContain('.csv');
      expect(response.headers.get('Cache-Control')).toBe('no-store');
    });

    it('should include CSV data with header row', async () => {
      const mockTrades = [
        {
          id: 'trade-1',
          userId: mockUser.id,
          symbol: 'AAPL',
          assetType: 'STOCK',
          currency: 'USD',
          entryDate: new Date('2024-01-01T10:00:00Z'),
          entryPrice: 100,
          exitDate: new Date('2024-01-02T10:00:00Z'),
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
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-01T00:00:00Z'),
          screenshots: [],
          tags: [],
        },
      ];

      mockPrisma.trade.findMany.mockResolvedValue(mockTrades as any);

      const request = createMockRequest('http://localhost/api/export/csv');
      const response = await GET(request);
      const csv = await response.text();

      expect(csv).toContain('id,symbol,assetType');
      expect(csv).toContain('trade-1');
      expect(csv).toContain('AAPL');
      expect(csv).toContain('USD');
    });

    it('should include UTF-8 BOM in CSV', async () => {
      const mockTrades = [
        {
          id: 'trade-1',
          userId: mockUser.id,
          symbol: 'AAPL',
          assetType: 'STOCK',
          currency: 'USD',
          entryDate: new Date('2024-01-01T10:00:00Z'),
          entryPrice: 100,
          exitDate: new Date('2024-01-02T10:00:00Z'),
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

      const request = createMockRequest('http://localhost/api/export/csv');
      const response = await GET(request);
      
      // Clone response to read as both array buffer and text
      const clonedResponse = response.clone();
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Check for UTF-8 BOM: 0xEF 0xBB 0xBF (in raw bytes)
      // Or check as text character (U+FEFF)
      if (uint8Array.length >= 3 && uint8Array[0] === 0xef && uint8Array[1] === 0xbb && uint8Array[2] === 0xbf) {
        // UTF-8 BOM found in raw bytes
        expect(uint8Array[0]).toBe(0xef);
        expect(uint8Array[1]).toBe(0xbb);
        expect(uint8Array[2]).toBe(0xbf);
      } else {
        // Check as text (BOM character U+FEFF)
        const csv = await clonedResponse.text();
        expect(csv.charCodeAt(0)).toBe(0xfeff);
      }
    });

    it('should export multiple trades', async () => {
      const mockTrades = [
        {
          id: 'trade-1',
          userId: mockUser.id,
          symbol: 'AAPL',
          assetType: 'STOCK',
          currency: 'USD',
          entryDate: new Date('2024-01-01T10:00:00Z'),
          entryPrice: 100,
          exitDate: new Date('2024-01-02T10:00:00Z'),
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
        {
          id: 'trade-2',
          userId: mockUser.id,
          symbol: 'MSFT',
          assetType: 'STOCK',
          currency: 'USD',
          entryDate: new Date('2024-01-03T10:00:00Z'),
          entryPrice: 200,
          exitDate: new Date('2024-01-04T10:00:00Z'),
          exitPrice: 210,
          quantity: 5,
          direction: 'LONG',
          fees: 2,
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

      const request = createMockRequest('http://localhost/api/export/csv');
      const response = await GET(request);
      const csv = await response.text();

      const lines = csv.split('\n');
      expect(lines.length).toBe(3); // Header + 2 data rows
      expect(csv).toContain('trade-1');
      expect(csv).toContain('trade-2');
      expect(csv).toContain('AAPL');
      expect(csv).toContain('MSFT');
    });

    it('should include tags in CSV', async () => {
      const mockTrades = [
        {
          id: 'trade-1',
          userId: mockUser.id,
          symbol: 'AAPL',
          assetType: 'STOCK',
          currency: 'USD',
          entryDate: new Date('2024-01-01T10:00:00Z'),
          entryPrice: 100,
          exitDate: new Date('2024-01-02T10:00:00Z'),
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
          tags: [
            { tag: { id: 'tag-1', name: 'momentum', createdAt: new Date(), updatedAt: new Date() } },
            { tag: { id: 'tag-2', name: 'breakout', createdAt: new Date(), updatedAt: new Date() } },
          ],
        },
      ];

      mockPrisma.trade.findMany.mockResolvedValue(mockTrades as any);

      const request = createMockRequest('http://localhost/api/export/csv');
      const response = await GET(request);
      const csv = await response.text();

      expect(csv).toContain('momentum | breakout');
    });

    it('should include screenshots count in CSV', async () => {
      const mockTrades = [
        {
          id: 'trade-1',
          userId: mockUser.id,
          symbol: 'AAPL',
          assetType: 'STOCK',
          currency: 'USD',
          entryDate: new Date('2024-01-01T10:00:00Z'),
          entryPrice: 100,
          exitDate: new Date('2024-01-02T10:00:00Z'),
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
          screenshots: [
            {
              id: 'screenshot-1',
              tradeId: 'trade-1',
              url: 'https://example.com/img1.jpg',
              filename: 'img1.jpg',
              fileSize: 100000,
              mimeType: 'image/jpeg',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: 'screenshot-2',
              tradeId: 'trade-1',
              url: 'https://example.com/img2.jpg',
              filename: 'img2.jpg',
              fileSize: 200000,
              mimeType: 'image/jpeg',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          tags: [],
        },
      ];

      mockPrisma.trade.findMany.mockResolvedValue(mockTrades as any);

      const request = createMockRequest('http://localhost/api/export/csv');
      const response = await GET(request);
      const csv = await response.text();

      // Screenshots count should be 2
      // Find the screenshotsCount column value (second to last column, before tags)
      const lines = csv.split('\n').filter((line) => line.trim());
      const dataLine = lines[1]; // First data row
      const columns = dataLine.split(',');
      // screenshotsCount is second to last (before tags which may be quoted)
      const screenshotsCountIndex = columns.length - 2;
      expect(parseInt(columns[screenshotsCountIndex], 10)).toBe(2);
    });

    it('should handle empty trades list', async () => {
      mockPrisma.trade.findMany.mockResolvedValue([]);

      const request = createMockRequest('http://localhost/api/export/csv');
      const response = await GET(request);
      const csv = await response.text();

      expect(response.status).toBe(200);
      // Should still have header row
      expect(csv).toContain('id,symbol');
      const lines = csv.split('\n').filter((line) => line.trim());
      expect(lines.length).toBe(1); // Only header row
    });

    it('should order trades by entryDate ascending', async () => {
      const mockTrades = [
        {
          id: 'trade-3',
          userId: mockUser.id,
          symbol: 'GOOGL',
          assetType: 'STOCK',
          currency: 'USD',
          entryDate: new Date('2024-01-03T10:00:00Z'),
          entryPrice: 100,
          exitDate: new Date('2024-01-04T10:00:00Z'),
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
        {
          id: 'trade-1',
          userId: mockUser.id,
          symbol: 'AAPL',
          assetType: 'STOCK',
          currency: 'USD',
          entryDate: new Date('2024-01-01T10:00:00Z'),
          entryPrice: 100,
          exitDate: new Date('2024-01-02T10:00:00Z'),
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
        {
          id: 'trade-2',
          userId: mockUser.id,
          symbol: 'MSFT',
          assetType: 'STOCK',
          currency: 'USD',
          entryDate: new Date('2024-01-02T10:00:00Z'),
          entryPrice: 100,
          exitDate: new Date('2024-01-03T10:00:00Z'),
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

      const request = createMockRequest('http://localhost/api/export/csv');
      await GET(request);

      expect(mockPrisma.trade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { entryDate: 'asc' },
        })
      );
    });

    it('should return 401 when not authenticated', async () => {
      mockRequireAuth.mockRejectedValue(new Error('Authentication required'));

      const request = createMockRequest('http://localhost/api/export/csv');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
      expect(mockPrisma.trade.findMany).not.toHaveBeenCalled();
    });

    it('should return 500 on server error', async () => {
      mockPrisma.trade.findMany.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest('http://localhost/api/export/csv');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to export CSV');
    });

    it('should include calculated metrics in CSV', async () => {
      const mockTrades = [
        {
          id: 'trade-1',
          userId: mockUser.id,
          symbol: 'AAPL',
          assetType: 'STOCK',
          currency: 'USD',
          entryDate: new Date('2024-01-01T10:00:00Z'),
          entryPrice: 100,
          exitDate: new Date('2024-01-02T10:00:00Z'),
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

      const request = createMockRequest('http://localhost/api/export/csv');
      const response = await GET(request);
      const csv = await response.text();

      // Should include calculated fields
      expect(csv).toContain('pnl');
      expect(csv).toContain('pnlPercent');
      expect(csv).toContain('netPnl');
      expect(csv).toContain('entryValue');
      expect(csv).toContain('exitValue');
      expect(csv).toContain('holdingPeriodHours');
      expect(csv).toContain('holdingPeriodDays');
      expect(csv).toContain('isWinner');
      expect(csv).toContain('isLoser');
      expect(csv).toContain('isBreakeven');
    });
  });
});

