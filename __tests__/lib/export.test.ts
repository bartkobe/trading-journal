import {
  tradeToCsvRow,
  tradesToCsvRows,
  tradesToCsv,
  generateCsvFilename,
} from '@/lib/export';
import { TradeWithCalculations } from '@/lib/types';

describe('CSV Export Utilities', () => {
  const createMockTrade = (overrides: Partial<TradeWithCalculations> = {}): TradeWithCalculations => {
    const baseEntryDate = overrides.entryDate || new Date('2024-01-01T10:00:00Z');
    const baseExitDate = overrides.exitDate || new Date(baseEntryDate.getTime() + 86400000); // +1 day

    return {
      id: 'trade-1',
      userId: 'user-1',
      symbol: 'AAPL',
      assetType: 'STOCK',
      currency: 'USD',
      entryDate: baseEntryDate,
      entryPrice: 100,
      exitDate: baseExitDate,
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
      calculations: {
        pnl: 50,
        pnlPercent: 5,
        netPnl: 49,
        entryValue: 1000,
        exitValue: 1050,
        holdingPeriod: 24,
        holdingPeriodDays: 1,
        isWinner: true,
        isLoser: false,
        isBreakeven: false,
      },
      ...overrides,
      entryDate: overrides.entryDate || baseEntryDate,
      exitDate: overrides.exitDate || baseExitDate,
    };
  };

  describe('tradeToCsvRow', () => {
    it('should convert a trade to CSV row format', () => {
      const trade = createMockTrade();
      const csvRow = tradeToCsvRow(trade);

      expect(csvRow.id).toBe('trade-1');
      expect(csvRow.symbol).toBe('AAPL');
      expect(csvRow.assetType).toBe('STOCK');
      expect(csvRow.currency).toBe('USD');
      expect(csvRow.direction).toBe('LONG');
      expect(csvRow.entryPrice).toBe(100);
      expect(csvRow.exitPrice).toBe(105);
      expect(csvRow.quantity).toBe(10);
      expect(csvRow.pnl).toBe(50);
      expect(csvRow.netPnl).toBe(49);
      expect(csvRow.isWinner).toBe(true);
      expect(csvRow.isLoser).toBe(false);
      expect(csvRow.isBreakeven).toBe(false);
    });

    it('should format dates as ISO strings', () => {
      const trade = createMockTrade();
      const csvRow = tradeToCsvRow(trade);

      expect(csvRow.entryDate).toBe(trade.entryDate.toISOString());
      expect(csvRow.exitDate).toBe(trade.exitDate?.toISOString());
      expect(csvRow.createdAt).toBe(trade.createdAt.toISOString());
      expect(csvRow.updatedAt).toBe(trade.updatedAt.toISOString());
    });

    it('should handle null exit date', () => {
      const trade = createMockTrade();
      // Override exitDate and exitPrice after creation
      trade.exitDate = null;
      trade.exitPrice = null;
      const csvRow = tradeToCsvRow(trade);

      expect(csvRow.exitDate).toBe('');
      expect(csvRow.exitPrice).toBe(0);
    });

    it('should include tags as pipe-separated string', () => {
      const trade = createMockTrade({
        tags: [
          { tag: { id: 'tag-1', name: 'momentum', createdAt: new Date(), updatedAt: new Date() } },
          { tag: { id: 'tag-2', name: 'breakout', createdAt: new Date(), updatedAt: new Date() } },
        ],
      });
      const csvRow = tradeToCsvRow(trade);

      expect(csvRow.tags).toBe('momentum | breakout');
    });

    it('should handle empty tags array', () => {
      const trade = createMockTrade({ tags: [] });
      const csvRow = tradeToCsvRow(trade);

      expect(csvRow.tags).toBe('');
    });

    it('should include screenshots count', () => {
      const trade = createMockTrade({
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
      });
      const csvRow = tradeToCsvRow(trade);

      expect(csvRow.screenshotsCount).toBe(2);
    });

    it('should handle optional fields', () => {
      const trade = createMockTrade({
        strategyName: 'Momentum Trading',
        setupType: 'Breakout',
        stopLoss: 95,
        takeProfit: 110,
        riskRewardRatio: 2.0,
        timeOfDay: 'MARKET_OPEN',
        marketConditions: 'TRENDING',
        emotionalStateEntry: 'Confident',
        emotionalStateExit: 'Satisfied',
        notes: 'Great trade!',
      });
      const csvRow = tradeToCsvRow(trade);

      expect(csvRow.strategyName).toBe('Momentum Trading');
      expect(csvRow.setupType).toBe('Breakout');
      expect(csvRow.stopLoss).toBe(95);
      expect(csvRow.takeProfit).toBe(110);
      expect(csvRow.riskRewardRatio).toBe(2.0);
      expect(csvRow.timeOfDay).toBe('MARKET_OPEN');
      expect(csvRow.marketConditions).toBe('TRENDING');
      expect(csvRow.emotionalStateEntry).toBe('Confident');
      expect(csvRow.emotionalStateExit).toBe('Satisfied');
      expect(csvRow.notes).toBe('Great trade!');
    });

    it('should handle null optional fields', () => {
      const trade = createMockTrade({
        stopLoss: null,
        takeProfit: null,
        riskRewardRatio: null,
      });
      const csvRow = tradeToCsvRow(trade);

      expect(csvRow.stopLoss).toBeNull();
      expect(csvRow.takeProfit).toBeNull();
      expect(csvRow.riskRewardRatio).toBeNull();
    });

    it('should handle losing trade', () => {
      const trade = createMockTrade({
        exitPrice: 95,
        calculations: {
          pnl: -50,
          pnlPercent: -5,
          netPnl: -51,
          entryValue: 1000,
          exitValue: 950,
          holdingPeriod: 24,
          holdingPeriodDays: 1,
          isWinner: false,
          isLoser: true,
          isBreakeven: false,
        },
      });
      const csvRow = tradeToCsvRow(trade);

      expect(csvRow.pnl).toBe(-50);
      expect(csvRow.netPnl).toBe(-51);
      expect(csvRow.isWinner).toBe(false);
      expect(csvRow.isLoser).toBe(true);
    });

    it('should handle breakeven trade', () => {
      const trade = createMockTrade({
        exitPrice: 100,
        fees: 0,
        calculations: {
          pnl: 0,
          pnlPercent: 0,
          netPnl: 0,
          entryValue: 1000,
          exitValue: 1000,
          holdingPeriod: 24,
          holdingPeriodDays: 1,
          isWinner: false,
          isLoser: false,
          isBreakeven: true,
        },
      });
      const csvRow = tradeToCsvRow(trade);

      expect(csvRow.isBreakeven).toBe(true);
      expect(csvRow.isWinner).toBe(false);
      expect(csvRow.isLoser).toBe(false);
    });

    it('should handle actualRiskReward calculation', () => {
      const trade = createMockTrade({
        stopLoss: 95,
        calculations: {
          pnl: 50,
          pnlPercent: 5,
          netPnl: 49,
          entryValue: 1000,
          exitValue: 1050,
          holdingPeriod: 24,
          holdingPeriodDays: 1,
          actualRiskReward: 1.0,
          isWinner: true,
          isLoser: false,
          isBreakeven: false,
        },
      });
      const csvRow = tradeToCsvRow(trade);

      expect(csvRow.actualRiskReward).toBe(1.0);
    });
  });

  describe('tradesToCsvRows', () => {
    it('should convert multiple trades to CSV rows', () => {
      const trades = [
        createMockTrade({ id: 'trade-1', symbol: 'AAPL' }),
        createMockTrade({ id: 'trade-2', symbol: 'MSFT' }),
        createMockTrade({ id: 'trade-3', symbol: 'GOOGL' }),
      ];

      const csvRows = tradesToCsvRows(trades);

      expect(csvRows.length).toBe(3);
      expect(csvRows[0].symbol).toBe('AAPL');
      expect(csvRows[1].symbol).toBe('MSFT');
      expect(csvRows[2].symbol).toBe('GOOGL');
    });

    it('should handle empty array', () => {
      const csvRows = tradesToCsvRows([]);

      expect(csvRows).toEqual([]);
    });
  });

  describe('tradesToCsv', () => {
    it('should generate CSV string with header and data rows', () => {
      const trades = [
        createMockTrade({ id: 'trade-1', symbol: 'AAPL' }),
        createMockTrade({ id: 'trade-2', symbol: 'MSFT' }),
      ];

      const csv = tradesToCsv(trades);

      expect(csv).toContain('id,symbol,assetType');
      expect(csv).toContain('trade-1,AAPL');
      expect(csv).toContain('trade-2,MSFT');
      expect(csv.split('\n').length).toBe(3); // Header + 2 data rows
    });

    it('should include all expected columns in header', () => {
      const trades = [createMockTrade()];
      const csv = tradesToCsv(trades);
      const lines = csv.split('\n');
      const header = lines[0];

      expect(header).toContain('id');
      expect(header).toContain('symbol');
      expect(header).toContain('currency');
      expect(header).toContain('pnl');
      expect(header).toContain('netPnl');
      expect(header).toContain('tags');
      expect(header).toContain('screenshotsCount');
    });

    it('should include UTF-8 BOM when includeBom is true', () => {
      const trades = [createMockTrade()];
      const csv = tradesToCsv(trades, { includeBom: true });

      expect(csv.charCodeAt(0)).toBe(0xfeff); // UTF-8 BOM
    });

    it('should not include BOM when includeBom is false', () => {
      const trades = [createMockTrade()];
      const csv = tradesToCsv(trades, { includeBom: false });

      expect(csv.charCodeAt(0)).not.toBe(0xfeff);
    });

    it('should not include BOM by default', () => {
      const trades = [createMockTrade()];
      const csv = tradesToCsv(trades);

      expect(csv.charCodeAt(0)).not.toBe(0xfeff);
    });

    it('should escape CSV special characters in data', () => {
      const trade = createMockTrade({
        symbol: 'AAPL, Inc.',
        notes: 'Trade with "quotes" and, commas',
      });
      const csv = tradesToCsv([trade]);

      // The CSV should properly escape quotes and commas
      expect(csv).toContain('"AAPL, Inc."');
      expect(csv).toContain('"Trade with ""quotes"" and, commas"');
    });

    it('should handle newlines in notes', () => {
      const trade = createMockTrade({
        notes: 'Line 1\nLine 2\nLine 3',
      });
      const csv = tradesToCsv([trade]);

      // Newlines should be escaped
      expect(csv).toContain('"Line 1');
    });

    it('should handle null values in CSV', () => {
      const trade = createMockTrade({
        stopLoss: null,
        takeProfit: null,
        riskRewardRatio: null,
        actualRiskReward: undefined,
      });
      const csv = tradesToCsv([trade]);
      const lines = csv.split('\n');
      const dataRow = lines[1];

      // Null values should be empty strings in CSV
      expect(dataRow).toContain(',,,'); // Multiple consecutive commas for null values
    });

    it('should convert boolean values to 0/1 in CSV', () => {
      const winningTrade = createMockTrade({
        calculations: {
          pnl: 50,
          pnlPercent: 5,
          netPnl: 49,
          entryValue: 1000,
          exitValue: 1050,
          holdingPeriod: 24,
          holdingPeriodDays: 1,
          isWinner: true,
          isLoser: false,
          isBreakeven: false,
        },
      });
      const csv = tradesToCsv([winningTrade]);

      expect(csv).toContain(',1,'); // isWinner = 1
      expect(csv).toContain(',0,'); // isLoser = 0
      expect(csv).toContain(',0'); // isBreakeven = 0
    });

    it('should handle empty trades array', () => {
      const csv = tradesToCsv([]);

      expect(csv).toContain('id,symbol');
      expect(csv.split('\n').length).toBe(1); // Only header row
    });

    it('should handle trades with different currencies', () => {
      const trades = [
        createMockTrade({ currency: 'USD', symbol: 'AAPL' }),
        createMockTrade({ currency: 'EUR', symbol: 'EURUSD' }),
        createMockTrade({ currency: 'GBP', symbol: 'GBPAUD' }),
      ];

      const csv = tradesToCsv(trades);

      expect(csv).toContain('USD');
      expect(csv).toContain('EUR');
      expect(csv).toContain('GBP');
    });
  });

  describe('generateCsvFilename', () => {
    it('should generate filename with default prefix', () => {
      const filename = generateCsvFilename();

      expect(filename).toMatch(/^trades-/);
      expect(filename).toMatch(/\.csv$/);
      expect(filename).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/); // ISO timestamp pattern
    });

    it('should generate filename with custom prefix', () => {
      const filename = generateCsvFilename({ prefix: 'my-trades' });

      expect(filename).toMatch(/^my-trades-/);
      expect(filename).toMatch(/\.csv$/);
    });

    it('should replace colons and dots in timestamp', () => {
      const filename = generateCsvFilename();

      // Filenames shouldn't contain colons or dots (except .csv extension)
      expect(filename).not.toContain(':');
      expect(filename.split('.').length).toBe(2); // Only .csv extension
    });
  });
});

