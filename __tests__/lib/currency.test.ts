import { formatCurrency } from '@/lib/trades';
import { formatCurrencyAmount, getCurrencySymbol, CURRENCIES } from '@/components/ui/CurrencySelector';
import { calculateTradeMetrics } from '@/lib/trades';
import { Trade } from '@/lib/types';

describe('Multi-Currency Support', () => {
  describe('formatCurrency (lib/trades)', () => {
    it('should format USD amounts correctly', () => {
      const formatted = formatCurrency(1234.56, 'USD');
      expect(formatted).toContain('1,234.56');
      expect(formatted).toContain('$');
    });

    it('should format EUR amounts correctly', () => {
      const formatted = formatCurrency(1234.56, 'EUR');
      expect(formatted).toContain('1,234.56');
      expect(formatted).toContain('€');
    });

    it('should format GBP amounts correctly', () => {
      const formatted = formatCurrency(1234.56, 'GBP');
      expect(formatted).toContain('1,234.56');
      expect(formatted).toContain('£');
    });

    it('should format JPY amounts correctly', () => {
      const formatted = formatCurrency(1234.56, 'JPY');
      // Intl.NumberFormat may or may not round JPY, so just check it contains the amount
      expect(formatted).toMatch(/1,23[45]/);
      expect(formatted).toContain('¥');
    });

    it('should format CAD amounts correctly', () => {
      const formatted = formatCurrency(1234.56, 'CAD');
      expect(formatted).toContain('1,234.56');
    });

    it('should format AUD amounts correctly', () => {
      const formatted = formatCurrency(1234.56, 'AUD');
      expect(formatted).toContain('1,234.56');
    });

    it('should format CHF amounts correctly', () => {
      const formatted = formatCurrency(1234.56, 'CHF');
      expect(formatted).toContain('1,234.56');
    });

    it('should format negative amounts correctly', () => {
      const formatted = formatCurrency(-1234.56, 'USD');
      expect(formatted).toContain('-');
      expect(formatted).toContain('1,234.56');
    });

    it('should format zero amounts correctly', () => {
      const formatted = formatCurrency(0, 'USD');
      expect(formatted).toContain('0.00');
    });

    it('should default to USD when currency is not provided', () => {
      const formatted = formatCurrency(1234.56);
      expect(formatted).toContain('$');
    });

    it('should handle very large amounts', () => {
      const formatted = formatCurrency(999999999.99, 'USD');
      expect(formatted).toContain('999,999,999.99');
    });

    it('should handle very small amounts', () => {
      const formatted = formatCurrency(0.01, 'USD');
      expect(formatted).toContain('0.01');
    });
  });

  describe('formatCurrencyAmount (CurrencySelector)', () => {
    it('should format USD amounts correctly', () => {
      const formatted = formatCurrencyAmount(1234.56, 'USD');
      expect(formatted).toContain('1,234.56');
      expect(formatted).toContain('$');
    });

    it('should format EUR amounts correctly', () => {
      const formatted = formatCurrencyAmount(1234.56, 'EUR');
      expect(formatted).toContain('1,234.56');
      expect(formatted).toContain('€');
    });

    it('should handle invalid currency code with fallback', () => {
      const formatted = formatCurrencyAmount(1234.56, 'INVALID');
      expect(formatted).toContain('1234.56');
    });
  });

  describe('getCurrencySymbol', () => {
    it('should return correct symbol for USD', () => {
      expect(getCurrencySymbol('USD')).toBe('$');
    });

    it('should return correct symbol for EUR', () => {
      expect(getCurrencySymbol('EUR')).toBe('€');
    });

    it('should return correct symbol for GBP', () => {
      expect(getCurrencySymbol('GBP')).toBe('£');
    });

    it('should return correct symbol for JPY', () => {
      expect(getCurrencySymbol('JPY')).toBe('¥');
    });

    it('should return correct symbol for CAD', () => {
      expect(getCurrencySymbol('CAD')).toBe('C$');
    });

    it('should return code as fallback for unknown currency', () => {
      expect(getCurrencySymbol('UNKNOWN')).toBe('UNKNOWN');
    });
  });

  describe('CURRENCIES constant', () => {
    it('should have all major currencies', () => {
      const currencyCodes = CURRENCIES.map((c) => c.code);
      expect(currencyCodes).toContain('USD');
      expect(currencyCodes).toContain('EUR');
      expect(currencyCodes).toContain('GBP');
      expect(currencyCodes).toContain('JPY');
      expect(currencyCodes).toContain('CAD');
      expect(currencyCodes).toContain('AUD');
      expect(currencyCodes).toContain('CHF');
      expect(currencyCodes).toContain('CNY');
      expect(currencyCodes).toContain('SEK');
      expect(currencyCodes).toContain('NZD');
    });

    it('should have symbols for all currencies', () => {
      CURRENCIES.forEach((currency) => {
        expect(currency.symbol).toBeDefined();
        expect(currency.symbol.length).toBeGreaterThan(0);
      });
    });

    it('should have names for all currencies', () => {
      CURRENCIES.forEach((currency) => {
        expect(currency.name).toBeDefined();
        expect(currency.name.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Trade Calculations with Different Currencies', () => {
    const createMockTrade = (currency: string): Trade => ({
      id: 'trade-1',
      userId: 'user-1',
      symbol: 'AAPL',
      assetType: 'STOCK',
      currency,
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
    });

    it('should calculate P&L correctly for USD trade', () => {
      const trade = createMockTrade('USD');
      const calculations = calculateTradeMetrics(trade);

      expect(calculations.pnl).toBe(50); // (105 - 100) * 10
      expect(calculations.netPnl).toBe(49); // 50 - 1 fee
      expect(calculations.pnlPercent).toBe(5); // (50 / 1000) * 100
    });

    it('should calculate P&L correctly for EUR trade', () => {
      const trade = createMockTrade('EUR');
      const calculations = calculateTradeMetrics(trade);

      // Calculations should be currency-agnostic
      expect(calculations.pnl).toBe(50);
      expect(calculations.netPnl).toBe(49);
      expect(calculations.pnlPercent).toBe(5);
    });

    it('should calculate P&L correctly for GBP trade', () => {
      const trade = createMockTrade('GBP');
      const calculations = calculateTradeMetrics(trade);

      expect(calculations.pnl).toBe(50);
      expect(calculations.netPnl).toBe(49);
      expect(calculations.pnlPercent).toBe(5);
    });

    it('should calculate P&L correctly for JPY trade', () => {
      const trade = createMockTrade('JPY');
      const calculations = calculateTradeMetrics(trade);

      expect(calculations.pnl).toBe(50);
      expect(calculations.netPnl).toBe(49);
      expect(calculations.pnlPercent).toBe(5);
    });

    it('should calculate SHORT trade P&L correctly in any currency', () => {
      const trade = createMockTrade('EUR');
      trade.direction = 'SHORT';
      trade.entryPrice = 105;
      trade.exitPrice = 100;

      const calculations = calculateTradeMetrics(trade);

      expect(calculations.pnl).toBe(50); // (105 - 100) * 10
      expect(calculations.netPnl).toBe(49);
    });

    it('should handle negative P&L correctly across currencies', () => {
      const trade = createMockTrade('CAD');
      trade.exitPrice = 95; // Loss

      const calculations = calculateTradeMetrics(trade);

      expect(calculations.pnl).toBe(-50); // (95 - 100) * 10
      expect(calculations.netPnl).toBe(-51); // -50 - 1 fee
      expect(calculations.isLoser).toBe(true);
    });
  });

  describe('Currency Persistence in Trade Data', () => {
    it('should preserve currency in trade calculations', () => {
      const trade: Trade = {
        id: 'trade-1',
        userId: 'user-1',
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
      };

      const calculations = calculateTradeMetrics(trade);

      // Currency should be preserved in the trade object
      expect(trade.currency).toBe('EUR');
      // Calculations work the same regardless of currency
      // Handle floating point precision
      expect(calculations.pnl).toBeCloseTo(200, 2); // (1.12 - 1.10) * 10000
    });
  });
});

