import {
  calculateTradeMetrics,
  enrichTradeWithCalculations,
  enrichTradesWithCalculations,
  filterByOutcome,
  sortTrades,
  formatCurrency,
  formatPercent,
  formatDate,
  formatDateTime,
  formatHoldingPeriod,
  calculatePlannedRR,
  calculatePositionSize,
  calculateWinRate,
  calculateAverageWin,
  calculateAverageLoss,
  calculateProfitFactor,
  calculateExpectancy as calculateTradesExpectancy,
  calculateSharpeRatio as calculateTradesSharpeRatio,
  calculateMaxDrawdown,
  generateEquityCurve,
  isTradeOpen,
} from '@/lib/trades';
import type { Trade, TradeWithCalculations } from '@/lib/types';

// Helper function to create mock trades
function createMockTrade(overrides: Partial<Trade> = {}): Trade {
  const baseDate = new Date('2024-01-01T10:00:00Z');
  const baseTrade: Trade = {
    id: '1',
    userId: 'user1',
    symbol: 'AAPL',
    assetType: 'STOCK',
    currency: 'USD',
    entryDate: baseDate,
    entryPrice: 100,
    exitDate: new Date(baseDate.getTime() + 86400000), // +1 day
    exitPrice: 105,
    quantity: 10,
    direction: 'LONG',
    setupType: null,
    strategyName: null,
    stopLoss: null,
    takeProfit: null,
    fees: 1,
    timeOfDay: null,
    marketConditions: null,
    emotionalStateEntry: null,
    emotionalStateExit: null,
    notes: null,
    riskRewardRatio: null,
    createdAt: baseDate,
    updatedAt: baseDate,
    ...overrides,
  };

  return baseTrade;
}

function createMockTradeWithCalculations(overrides: Partial<TradeWithCalculations> = {}): TradeWithCalculations {
  const baseTrade = createMockTrade();
  const calculations = calculateTradeMetrics(baseTrade);
  
  return {
    ...baseTrade,
    calculations,
    screenshots: [],
    tags: [],
    ...overrides,
  };
}

describe('Trade Calculations', () => {
  describe('isTradeOpen', () => {
    it('should return true when exitDate is null', () => {
      const trade = createMockTrade({
        exitDate: null,
        exitPrice: null,
      });

      expect(isTradeOpen(trade)).toBe(true);
    });

    it('should return false when exitDate is not null', () => {
      const trade = createMockTrade({
        exitDate: new Date('2024-01-02T10:00:00Z'),
        exitPrice: 105,
      });

      expect(isTradeOpen(trade)).toBe(false);
    });

    it('should handle trade object with only exitDate property', () => {
      const tradeObj = { exitDate: null };
      expect(isTradeOpen(tradeObj)).toBe(true);

      const tradeObj2 = { exitDate: new Date() };
      expect(isTradeOpen(tradeObj2)).toBe(false);
    });
  });

  describe('calculateTradeMetrics', () => {
    it('should calculate P&L for LONG position', () => {
      const trade = createMockTrade({
        entryPrice: 100,
        exitPrice: 105,
        quantity: 10,
        direction: 'LONG',
        fees: 1,
      });

      const metrics = calculateTradeMetrics(trade);

      expect(metrics.pnl).toBe(50); // (105 - 100) * 10
      expect(metrics.pnlPercent).toBe(5); // 50 / 1000 * 100
      expect(metrics.netPnl).toBe(49); // 50 - 1
      expect(metrics.entryValue).toBe(1000); // 100 * 10
      expect(metrics.exitValue).toBe(1050); // 105 * 10
      expect(metrics.isWinner).toBe(true);
      expect(metrics.isLoser).toBe(false);
      expect(metrics.isBreakeven).toBe(false);
    });

    it('should calculate P&L for SHORT position', () => {
      const trade = createMockTrade({
        entryPrice: 100,
        exitPrice: 95,
        quantity: 10,
        direction: 'SHORT',
        fees: 1,
      });

      const metrics = calculateTradeMetrics(trade);

      expect(metrics.pnl).toBe(50); // (100 - 95) * 10
      expect(metrics.netPnl).toBe(49); // 50 - 1
      expect(metrics.isWinner).toBe(true);
    });

    it('should handle losing LONG trade', () => {
      const trade = createMockTrade({
        entryPrice: 100,
        exitPrice: 95,
        quantity: 10,
        direction: 'LONG',
        fees: 1,
      });

      const metrics = calculateTradeMetrics(trade);

      expect(metrics.pnl).toBe(-50); // (95 - 100) * 10
      expect(metrics.netPnl).toBe(-51); // -50 - 1
      expect(metrics.isWinner).toBe(false);
      expect(metrics.isLoser).toBe(true);
    });

    it('should handle breakeven trade', () => {
      const trade = createMockTrade({
        entryPrice: 100,
        exitPrice: 100,
        quantity: 10,
        direction: 'LONG',
        fees: 0,
      });

      const metrics = calculateTradeMetrics(trade);

      expect(metrics.pnl).toBe(0);
      expect(metrics.netPnl).toBe(0);
      expect(metrics.isWinner).toBe(false);
      expect(metrics.isLoser).toBe(false);
      expect(metrics.isBreakeven).toBe(true);
    });

    it('should handle null fees', () => {
      const trade = createMockTrade({
        fees: null,
      });

      const metrics = calculateTradeMetrics(trade);

      expect(metrics.netPnl).toBe(50); // P&L without fees
    });

    it('should calculate holding period correctly', () => {
      const baseDate = new Date('2024-01-01T10:00:00Z');
      const trade = createMockTrade({
        entryDate: baseDate,
        exitDate: new Date(baseDate.getTime() + 86400000), // +1 day = 24 hours
      });

      const metrics = calculateTradeMetrics(trade);

      expect(metrics.holdingPeriod).toBe(24);
      expect(metrics.holdingPeriodDays).toBe(1);
    });

    it('should calculate actual risk/reward for LONG with stop loss', () => {
      const trade = createMockTrade({
        entryPrice: 100,
        exitPrice: 110,
        stopLoss: 95,
        quantity: 10,
        direction: 'LONG',
      });

      const metrics = calculateTradeMetrics(trade);

      // P&L = (110 - 100) * 10 = 100
      // Risk = (100 - 95) * 10 = 50
      // R:R = 100 / 50 = 2
      expect(metrics.actualRiskReward).toBeCloseTo(2, 2);
    });

    it('should not include actualRiskReward when stop loss is null', () => {
      const trade = createMockTrade({
        stopLoss: null,
      });

      const metrics = calculateTradeMetrics(trade);

      expect(metrics.actualRiskReward).toBeUndefined();
    });

    it('should return null P&L values for open trades (no exitDate)', () => {
      const trade = createMockTrade({
        exitDate: null,
        exitPrice: null,
      });

      const metrics = calculateTradeMetrics(trade);

      expect(metrics.pnl).toBeNull();
      expect(metrics.pnlPercent).toBeNull();
      expect(metrics.netPnl).toBeNull();
      expect(metrics.exitValue).toBeNull();
      expect(metrics.holdingPeriod).toBeNull();
      expect(metrics.holdingPeriodDays).toBeNull();
      expect(metrics.isWinner).toBe(false);
      expect(metrics.isLoser).toBe(false);
      expect(metrics.isBreakeven).toBe(false);
      expect(metrics.entryValue).toBe(1000); // Entry value should still be calculated
    });

    it('should return null P&L values for open trades (no exitPrice)', () => {
      const trade = createMockTrade({
        exitDate: new Date('2024-01-02T10:00:00Z'),
        exitPrice: null,
      });

      const metrics = calculateTradeMetrics(trade);

      expect(metrics.pnl).toBeNull();
      expect(metrics.pnlPercent).toBeNull();
      expect(metrics.netPnl).toBeNull();
      expect(metrics.exitValue).toBeNull();
      expect(metrics.holdingPeriod).toBeNull();
      expect(metrics.holdingPeriodDays).toBeNull();
    });

    it('should calculate correctly for closed trades', () => {
      const trade = createMockTrade({
        entryPrice: 100,
        exitPrice: 105,
        quantity: 10,
        direction: 'LONG',
        fees: 1,
        exitDate: new Date('2024-01-02T10:00:00Z'),
      });

      const metrics = calculateTradeMetrics(trade);

      expect(metrics.pnl).not.toBeNull();
      expect(metrics.pnlPercent).not.toBeNull();
      expect(metrics.netPnl).not.toBeNull();
      expect(metrics.exitValue).not.toBeNull();
      expect(metrics.holdingPeriod).not.toBeNull();
      expect(metrics.holdingPeriodDays).not.toBeNull();
      expect(metrics.pnl).toBe(50);
      expect(metrics.netPnl).toBe(49);
      expect(metrics.isWinner).toBe(true);
    });
  });

  describe('enrichTradeWithCalculations', () => {
    it('should add calculations to trade object', () => {
      const trade = createMockTrade();
      const enriched = enrichTradeWithCalculations(trade);

      expect(enriched.calculations).toBeDefined();
      expect(enriched.calculations.pnl).toBe(50);
      expect(enriched.symbol).toBe('AAPL');
    });
  });

  describe('enrichTradesWithCalculations', () => {
    it('should add calculations to multiple trades', () => {
      const trades = [
        createMockTrade({ id: '1', symbol: 'AAPL' }),
        createMockTrade({ id: '2', symbol: 'MSFT' }),
      ];

      const enriched = enrichTradesWithCalculations(trades);

      expect(enriched.length).toBe(2);
      expect(enriched[0].calculations).toBeDefined();
      expect(enriched[1].calculations).toBeDefined();
    });
  });

  describe('filterByOutcome', () => {
    it('should filter winning trades', () => {
      const trades = [
        createMockTradeWithCalculations({ id: '1', calculations: { ...calculateTradeMetrics(createMockTrade({ exitPrice: 105 })), isWinner: true, isLoser: false } }),
        createMockTradeWithCalculations({ id: '2', calculations: { ...calculateTradeMetrics(createMockTrade({ exitPrice: 95 })), isWinner: false, isLoser: true } }),
        createMockTradeWithCalculations({ id: '3', calculations: { ...calculateTradeMetrics(createMockTrade({ exitPrice: 105 })), isWinner: true, isLoser: false } }),
      ];

      const winners = filterByOutcome(trades, 'winning');

      expect(winners.length).toBe(2);
      expect(winners.every((t) => t.calculations.isWinner)).toBe(true);
    });

    it('should filter losing trades', () => {
      const trades = [
        createMockTradeWithCalculations({ id: '1', calculations: { ...calculateTradeMetrics(createMockTrade({ exitPrice: 105 })), isWinner: true, isLoser: false } }),
        createMockTradeWithCalculations({ id: '2', calculations: { ...calculateTradeMetrics(createMockTrade({ exitPrice: 95 })), isWinner: false, isLoser: true } }),
      ];

      const losers = filterByOutcome(trades, 'losing');

      expect(losers.length).toBe(1);
      expect(losers[0].calculations.isLoser).toBe(true);
    });
  });

  describe('sortTrades', () => {
    it('should sort by date ascending', () => {
      const baseDate = new Date('2024-01-01');
      const trades = [
        createMockTradeWithCalculations({ id: '2', entryDate: new Date(baseDate.getTime() + 86400000) }),
        createMockTradeWithCalculations({ id: '1', entryDate: baseDate }),
      ];

      const sorted = sortTrades(trades, 'date', 'asc');

      expect(sorted[0].id).toBe('1');
      expect(sorted[1].id).toBe('2');
    });

    it('should sort by P&L descending', () => {
      const trades = [
        createMockTradeWithCalculations({ id: '1', calculations: { ...calculateTradeMetrics(createMockTrade({ exitPrice: 105 })), pnl: 50, netPnl: 49 } }),
        createMockTradeWithCalculations({ id: '2', calculations: { ...calculateTradeMetrics(createMockTrade({ exitPrice: 110 })), pnl: 100, netPnl: 99 } }),
      ];

      const sorted = sortTrades(trades, 'pnl', 'desc');

      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('1');
    });

    it('should sort by symbol alphabetically', () => {
      const trades = [
        createMockTradeWithCalculations({ id: '1', symbol: 'MSFT' }),
        createMockTradeWithCalculations({ id: '2', symbol: 'AAPL' }),
      ];

      const sorted = sortTrades(trades, 'symbol', 'asc');

      expect(sorted[0].symbol).toBe('AAPL');
      expect(sorted[1].symbol).toBe('MSFT');
    });

    it('should sort open trades (null P&L) to the end when sorting by P&L', () => {
      const trades = [
        createMockTradeWithCalculations({
          id: '1',
          exitDate: null,
          exitPrice: null,
          calculations: { ...calculateTradeMetrics(createMockTrade({ exitDate: null, exitPrice: null })), netPnl: null, pnl: null },
        }),
        createMockTradeWithCalculations({
          id: '2',
          calculations: { ...calculateTradeMetrics(createMockTrade()), netPnl: 50, pnl: 50 },
        }),
        createMockTradeWithCalculations({
          id: '3',
          exitDate: null,
          exitPrice: null,
          calculations: { ...calculateTradeMetrics(createMockTrade({ exitDate: null, exitPrice: null })), netPnl: null, pnl: null },
        }),
        createMockTradeWithCalculations({
          id: '4',
          calculations: { ...calculateTradeMetrics(createMockTrade()), netPnl: 100, pnl: 100 },
        }),
      ];

      const sorted = sortTrades(trades, 'pnl', 'desc');
      expect(sorted[0].id).toBe('4');
      expect(sorted[1].id).toBe('2');
      // Open trades (null P&L) should be at the end
      expect(sorted[2].calculations.netPnl).toBeNull();
      expect(sorted[3].calculations.netPnl).toBeNull();
    });
  });

  describe('formatCurrency', () => {
    it('should format USD currency', () => {
      const formatted = formatCurrency(1234.56, 'USD');

      expect(formatted).toContain('$');
      expect(formatted).toContain('1,234.56');
    });

    it('should format EUR currency', () => {
      const formatted = formatCurrency(1234.56, 'EUR');

      expect(formatted).toContain('€');
    });

    it('should handle null values (open trades)', () => {
      expect(formatCurrency(null, 'USD')).toBe('—');
      expect(formatCurrency(undefined, 'USD')).toBe('—');
    });
  });

  describe('formatPercent', () => {
    it('should format positive percentage with + sign', () => {
      const formatted = formatPercent(5.25);

      expect(formatted).toBe('+5.25%');
    });

    it('should format negative percentage', () => {
      const formatted = formatPercent(-3.5);

      expect(formatted).toBe('-3.50%');
    });

    it('should use custom decimal places', () => {
      const formatted = formatPercent(5.1234, 1);

      expect(formatted).toBe('+5.1%');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);

      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });

    it('should handle string dates', () => {
      const formatted = formatDate('2024-01-15');

      expect(formatted).toBeDefined();
    });
  });

  describe('formatDateTime', () => {
    it('should format datetime with time', () => {
      const date = new Date('2024-01-15T14:30:00Z');
      const formatted = formatDateTime(date);

      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
    });
  });

  describe('formatHoldingPeriod', () => {
    it('should format minutes for periods less than 1 hour', () => {
      const formatted = formatHoldingPeriod(0.5);

      expect(formatted).toContain('minutes');
    });

    it('should format hours for periods less than 24 hours', () => {
      const formatted = formatHoldingPeriod(12.5);

      expect(formatted).toBe('12.5 hours');
    });

    it('should format days for periods 24+ hours', () => {
      const formatted = formatHoldingPeriod(48);

      expect(formatted).toBe('2.0 days');
    });
  });

  describe('calculatePlannedRR', () => {
    it('should calculate R:R for LONG position', () => {
      const rr = calculatePlannedRR(100, 95, 110, 'LONG');

      // Risk = 100 - 95 = 5
      // Reward = 110 - 100 = 10
      // R:R = 10 / 5 = 2
      expect(rr).toBe(2);
    });

    it('should calculate R:R for SHORT position', () => {
      const rr = calculatePlannedRR(100, 105, 90, 'SHORT');

      // Risk = 105 - 100 = 5
      // Reward = 100 - 90 = 10
      // R:R = 10 / 5 = 2
      expect(rr).toBe(2);
    });
  });

  describe('calculatePositionSize', () => {
    it('should calculate position size based on risk', () => {
      const positionSize = calculatePositionSize(10000, 2, 100, 95);

      // Risk amount = 10000 * 0.02 = 200
      // Risk per share = 100 - 95 = 5
      // Position size = 200 / 5 = 40
      expect(positionSize).toBe(40);
    });

    it('should handle different risk percentages', () => {
      const positionSize = calculatePositionSize(10000, 1, 100, 95);

      // Risk amount = 100
      // Position size = 100 / 5 = 20
      expect(positionSize).toBe(20);
    });
  });

  describe('calculateWinRate', () => {
    it('should return 0 for empty trades', () => {
      const winRate = calculateWinRate([]);

      expect(winRate).toBe(0);
    });

    it('should calculate win rate correctly', () => {
      const trades = [
        createMockTradeWithCalculations({ calculations: { ...calculateTradeMetrics(createMockTrade()), isWinner: true, isLoser: false } }),
        createMockTradeWithCalculations({ calculations: { ...calculateTradeMetrics(createMockTrade()), isWinner: true, isLoser: false } }),
        createMockTradeWithCalculations({ calculations: { ...calculateTradeMetrics(createMockTrade({ exitPrice: 95 })), isWinner: false, isLoser: true } }),
      ];

      const winRate = calculateWinRate(trades);

      expect(winRate).toBeCloseTo(66.67, 2);
    });
  });

  describe('calculateAverageWin', () => {
    it('should return 0 for no winning trades', () => {
      const trades = [
        createMockTradeWithCalculations({ calculations: { ...calculateTradeMetrics(createMockTrade({ exitPrice: 95 })), isWinner: false, isLoser: true, netPnl: -50 } }),
      ];

      const avgWin = calculateAverageWin(trades);

      expect(avgWin).toBe(0);
    });

    it('should calculate average win correctly', () => {
      const trades = [
        createMockTradeWithCalculations({ calculations: { ...calculateTradeMetrics(createMockTrade({ exitPrice: 110 })), isWinner: true, isLoser: false, netPnl: 99 } }),
        createMockTradeWithCalculations({ calculations: { ...calculateTradeMetrics(createMockTrade({ exitPrice: 105 })), isWinner: true, isLoser: false, netPnl: 49 } }),
      ];

      const avgWin = calculateAverageWin(trades);

      expect(avgWin).toBe(74); // (99 + 49) / 2
    });
  });

  describe('calculateAverageLoss', () => {
    it('should return 0 for no losing trades', () => {
      const trades = [
        createMockTradeWithCalculations({ calculations: { ...calculateTradeMetrics(createMockTrade()), isWinner: true, isLoser: false } }),
      ];

      const avgLoss = calculateAverageLoss(trades);

      expect(avgLoss).toBe(0);
    });

    it('should calculate average loss correctly', () => {
      const trades = [
        createMockTradeWithCalculations({ calculations: { ...calculateTradeMetrics(createMockTrade({ exitPrice: 90 })), isWinner: false, isLoser: true, netPnl: -101 } }),
        createMockTradeWithCalculations({ calculations: { ...calculateTradeMetrics(createMockTrade({ exitPrice: 95 })), isWinner: false, isLoser: true, netPnl: -51 } }),
      ];

      const avgLoss = calculateAverageLoss(trades);

      expect(avgLoss).toBe(-76); // (-101 + -51) / 2
    });
  });

  describe('calculateProfitFactor', () => {
    it('should return Infinity when no losses', () => {
      const trades = [
        createMockTradeWithCalculations({ calculations: { ...calculateTradeMetrics(createMockTrade()), isWinner: true, isLoser: false, netPnl: 100 } }),
      ];

      const pf = calculateProfitFactor(trades);

      expect(pf).toBe(Infinity);
    });

    it('should return 0 when no profits', () => {
      const trades = [
        createMockTradeWithCalculations({ calculations: { ...calculateTradeMetrics(createMockTrade({ exitPrice: 95 })), isWinner: false, isLoser: true, netPnl: -50 } }),
      ];

      const pf = calculateProfitFactor(trades);

      expect(pf).toBe(0);
    });

    it('should calculate profit factor correctly', () => {
      const trades = [
        createMockTradeWithCalculations({ calculations: { ...calculateTradeMetrics(createMockTrade({ exitPrice: 110 })), isWinner: true, isLoser: false, netPnl: 99 } }),
        createMockTradeWithCalculations({ calculations: { ...calculateTradeMetrics(createMockTrade({ exitPrice: 90 })), isWinner: false, isLoser: true, netPnl: -51 } }),
      ];

      const pf = calculateProfitFactor(trades);

      expect(pf).toBeCloseTo(1.94, 2); // 99 / 51
    });
  });

  describe('calculateExpectancy', () => {
    it('should return 0 for empty trades', () => {
      const expectancy = calculateTradesExpectancy([]);

      expect(expectancy).toBe(0);
    });

    it('should calculate expectancy correctly', () => {
      const trades = [
        createMockTradeWithCalculations({ calculations: { ...calculateTradeMetrics(createMockTrade({ exitPrice: 110 })), isWinner: true, isLoser: false, netPnl: 99, pnlPercent: 10 } }),
        createMockTradeWithCalculations({ calculations: { ...calculateTradeMetrics(createMockTrade({ exitPrice: 90 })), isWinner: false, isLoser: true, netPnl: -51, pnlPercent: -5 } }),
      ];

      const expectancy = calculateTradesExpectancy(trades);

      // Win rate = 50%, Avg win = 99, Avg loss = 51
      // Expectancy = 0.5 * 99 - 0.5 * 51 = 49.5 - 25.5 = 24
      expect(expectancy).toBeCloseTo(24, 2);
    });
  });

  describe('calculateSharpeRatio', () => {
    it('should return 0 for empty trades', () => {
      const sharpe = calculateTradesSharpeRatio([]);

      expect(sharpe).toBe(0);
    });

    it('should return 0 when standard deviation is 0', () => {
      const trades = [
        createMockTradeWithCalculations({ calculations: { ...calculateTradeMetrics(createMockTrade()), pnlPercent: 10 } }),
        createMockTradeWithCalculations({ calculations: { ...calculateTradeMetrics(createMockTrade()), pnlPercent: 10 } }),
      ];

      const sharpe = calculateTradesSharpeRatio(trades);

      expect(sharpe).toBe(0);
    });

    it('should calculate Sharpe ratio correctly', () => {
      const trades = [
        createMockTradeWithCalculations({ calculations: { ...calculateTradeMetrics(createMockTrade({ exitPrice: 110 })), pnlPercent: 10 } }),
        createMockTradeWithCalculations({ calculations: { ...calculateTradeMetrics(createMockTrade({ exitPrice: 105 })), pnlPercent: 5 } }),
        createMockTradeWithCalculations({ calculations: { ...calculateTradeMetrics(createMockTrade({ exitPrice: 97 })), pnlPercent: -3 } }),
      ];

      const sharpe = calculateTradesSharpeRatio(trades);

      expect(sharpe).toBeDefined();
      expect(sharpe).toBeGreaterThan(0);
    });
  });

  describe('calculateMaxDrawdown', () => {
    it('should return 0 for empty trades', () => {
      const drawdown = calculateMaxDrawdown([]);

      expect(drawdown).toBe(0);
    });

    it('should calculate max drawdown correctly', () => {
      const baseDate = new Date('2024-01-01');
      const trades = [
        createMockTradeWithCalculations({
          id: '1',
          entryDate: baseDate,
          calculations: { ...calculateTradeMetrics(createMockTrade({ exitPrice: 110 })), netPnl: 100 },
        }),
        createMockTradeWithCalculations({
          id: '2',
          entryDate: new Date(baseDate.getTime() + 86400000),
          calculations: { ...calculateTradeMetrics(createMockTrade({ exitPrice: 90 })), netPnl: -50 },
        }),
        createMockTradeWithCalculations({
          id: '3',
          entryDate: new Date(baseDate.getTime() + 172800000),
          calculations: { ...calculateTradeMetrics(createMockTrade({ exitPrice: 87 })), netPnl: -30 },
        }),
      ];

      const drawdown = calculateMaxDrawdown(trades);

      // Peak at 100, trough at 20 (100 - 50 - 30), max drawdown = 80
      expect(drawdown).toBe(80);
    });
  });

  describe('generateEquityCurve', () => {
    it('should generate equity curve correctly', () => {
      const baseDate = new Date('2024-01-01');
      const trades = [
        createMockTradeWithCalculations({
          id: '1',
          entryDate: baseDate,
          exitDate: new Date(baseDate.getTime() + 86400000),
          calculations: { ...calculateTradeMetrics(createMockTrade()), netPnl: 100 },
        }),
        createMockTradeWithCalculations({
          id: '2',
          entryDate: new Date(baseDate.getTime() + 86400000),
          exitDate: new Date(baseDate.getTime() + 172800000),
          calculations: { ...calculateTradeMetrics(createMockTrade({ exitPrice: 105 })), netPnl: 50 },
        }),
      ];

      const curve = generateEquityCurve(trades);

      expect(curve.length).toBe(2);
      expect(curve[0].cumulativePnl).toBe(100);
      expect(curve[0].tradeNumber).toBe(1);
      expect(curve[1].cumulativePnl).toBe(150);
      expect(curve[1].tradeNumber).toBe(2);
    });

    it('should handle trades with null exitDate', () => {
      const baseDate = new Date('2024-01-01');
      const trades = [
        createMockTradeWithCalculations({
          id: '1',
          entryDate: baseDate,
          exitDate: null,
          calculations: { ...calculateTradeMetrics(createMockTrade()), netPnl: 100 },
        }),
      ];

      const curve = generateEquityCurve(trades);

      expect(curve.length).toBe(1);
      expect(curve[0].cumulativePnl).toBe(100);
    });
  });
});

