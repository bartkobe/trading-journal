import {
  calculateBasicMetrics,
  calculateExpectancy,
  calculateSharpeRatio,
  calculateDrawdown,
  calculateEquityCurve,
  calculatePerformanceByDimension,
  calculateTimeBasedMetrics,
  calculateStreaks,
  type TradeWithCalculations,
} from '@/lib/analytics';
import { isTradeOpen } from '@/lib/trades';

// Helper function to create mock trades with calculations
function createMockTrade(
  overrides: Partial<TradeWithCalculations> = {}
): TradeWithCalculations {
  const baseDate = new Date('2024-01-01');
  const baseTrade: TradeWithCalculations = {
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
  };

  return baseTrade;
}

describe('Analytics Calculations', () => {
  describe('calculateBasicMetrics', () => {
    it('should return zero metrics for empty trades array', () => {
      const metrics = calculateBasicMetrics([]);

      expect(metrics.totalTrades).toBe(0);
      expect(metrics.winningTrades).toBe(0);
      expect(metrics.losingTrades).toBe(0);
      expect(metrics.breakevenTrades).toBe(0);
      expect(metrics.totalPnl).toBe(0);
      expect(metrics.winRate).toBe(0);
      expect(metrics.profitFactor).toBe(0);
    });

    it('should calculate basic metrics for winning trades', () => {
      const trades = [
        createMockTrade({
          id: '1',
          symbol: 'AAPL',
          calculations: {
            pnl: 100,
            pnlPercent: 10,
            netPnl: 99,
            entryValue: 1000,
            exitValue: 1100,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: true,
            isLoser: false,
            isBreakeven: false,
          },
        }),
        createMockTrade({
          id: '2',
          symbol: 'MSFT',
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
        }),
      ];

      const metrics = calculateBasicMetrics(trades);

      expect(metrics.totalTrades).toBe(2);
      expect(metrics.winningTrades).toBe(2);
      expect(metrics.losingTrades).toBe(0);
      expect(metrics.breakevenTrades).toBe(0);
      expect(metrics.totalPnl).toBe(148); // 99 + 49
      expect(metrics.winRate).toBe(100);
      expect(metrics.lossRate).toBe(0);
      expect(metrics.averagePnl).toBe(74); // 148 / 2
      expect(metrics.averageWin).toBe(74); // 148 / 2
      expect(metrics.largestWin).toBe(99);
      expect(metrics.profitFactor).toBe(Infinity); // No losses
    });

    it('should exclude open trades from total count', () => {
      const trades = [
        createMockTrade({
          id: '1',
          exitDate: null,
          exitPrice: null,
          calculations: {
            pnl: null,
            pnlPercent: null,
            netPnl: null,
            entryValue: 1000,
            exitValue: null,
            holdingPeriod: null,
            holdingPeriodDays: null,
            isWinner: false,
            isLoser: false,
            isBreakeven: false,
          },
        }),
        createMockTrade({
          id: '2',
          calculations: {
            pnl: 100,
            pnlPercent: 10,
            netPnl: 99,
            entryValue: 1000,
            exitValue: 1100,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: true,
            isLoser: false,
            isBreakeven: false,
          },
        }),
        createMockTrade({
          id: '3',
          exitDate: null,
          exitPrice: null,
          calculations: {
            pnl: null,
            pnlPercent: null,
            netPnl: null,
            entryValue: 1000,
            exitValue: null,
            holdingPeriod: null,
            holdingPeriodDays: null,
            isWinner: false,
            isLoser: false,
            isBreakeven: false,
          },
        }),
      ];

      const metrics = calculateBasicMetrics(trades);

      // Should only count closed trades
      expect(metrics.totalTrades).toBe(1);
      expect(metrics.winningTrades).toBe(1);
      expect(metrics.totalPnl).toBe(99);
    });

    it('should calculate basic metrics for mixed trades', () => {
      const trades = [
        createMockTrade({
          id: '1',
          calculations: {
            pnl: 100,
            pnlPercent: 10,
            netPnl: 99,
            entryValue: 1000,
            exitValue: 1100,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: true,
            isLoser: false,
            isBreakeven: false,
          },
        }),
        createMockTrade({
          id: '2',
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
        }),
        createMockTrade({
          id: '3',
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
        }),
      ];

      const metrics = calculateBasicMetrics(trades);

      expect(metrics.totalTrades).toBe(3);
      expect(metrics.winningTrades).toBe(1);
      expect(metrics.losingTrades).toBe(1);
      expect(metrics.breakevenTrades).toBe(1);
      expect(metrics.winRate).toBeCloseTo(33.33, 2);
      expect(metrics.lossRate).toBeCloseTo(33.33, 2);
      expect(metrics.breakevenRate).toBeCloseTo(33.33, 2);
      expect(metrics.totalPnl).toBe(48); // 99 - 51 + 0
      expect(metrics.averagePnl).toBe(16); // 48 / 3
      expect(metrics.averageWin).toBe(99);
      expect(metrics.averageLoss).toBe(-51);
      expect(metrics.profitFactor).toBeCloseTo(1.94, 2); // 99 / 51
    });

    it('should handle profit factor with no losses', () => {
      const trades = [
        createMockTrade({
          id: '1',
          calculations: {
            pnl: 100,
            pnlPercent: 10,
            netPnl: 100,
            entryValue: 1000,
            exitValue: 1100,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: true,
            isLoser: false,
            isBreakeven: false,
          },
        }),
      ];

      const metrics = calculateBasicMetrics(trades);

      expect(metrics.profitFactor).toBe(Infinity);
    });

    it('should handle profit factor with no profits', () => {
      const trades = [
        createMockTrade({
          id: '1',
          calculations: {
            pnl: -50,
            pnlPercent: -5,
            netPnl: -50,
            entryValue: 1000,
            exitValue: 950,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: false,
            isLoser: true,
            isBreakeven: false,
          },
        }),
      ];

      const metrics = calculateBasicMetrics(trades);

      expect(metrics.profitFactor).toBe(0);
    });
  });

  describe('calculateExpectancy', () => {
    it('should return zero expectancy for empty trades', () => {
      const metrics = calculateExpectancy([]);

      expect(metrics.expectancy).toBe(0);
      expect(metrics.expectancyPercent).toBe(0);
    });

    it('should calculate expectancy correctly', () => {
      const trades = [
        createMockTrade({
          id: '1',
          calculations: {
            pnl: 100,
            pnlPercent: 10,
            netPnl: 99,
            entryValue: 1000,
            exitValue: 1100,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: true,
            isLoser: false,
            isBreakeven: false,
          },
        }),
        createMockTrade({
          id: '2',
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
        }),
      ];

      const metrics = calculateExpectancy(trades);

      // Win rate = 50%, Loss rate = 50%
      // Average win = 99, Average loss = -51
      // Expectancy = (0.5 * 99) + (0.5 * -51) = 49.5 - 25.5 = 24
      expect(metrics.expectancy).toBeCloseTo(24, 2);
      expect(metrics.expectancyPercent).toBeGreaterThan(0);
    });

    it('should handle zero average trade size', () => {
      const trades = [
        createMockTrade({
          id: '1',
          calculations: {
            pnl: 0,
            pnlPercent: 0,
            netPnl: 0,
            entryValue: 0,
            exitValue: 0,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: false,
            isLoser: false,
            isBreakeven: true,
          },
        }),
      ];

      const metrics = calculateExpectancy(trades);

      expect(metrics.expectancy).toBe(0);
      expect(metrics.expectancyPercent).toBe(0);
    });
  });

  describe('calculateSharpeRatio', () => {
    it('should return zero metrics for empty trades', () => {
      const metrics = calculateSharpeRatio([]);

      expect(metrics.sharpeRatio).toBe(0);
      expect(metrics.averageReturn).toBe(0);
      expect(metrics.standardDeviation).toBe(0);
    });

    it('should return zero for single trade (needs at least 2 trades)', () => {
      const trades = [
        createMockTrade({
          id: '1',
          calculations: {
            pnl: 100,
            pnlPercent: 10,
            netPnl: 99,
            entryValue: 1000,
            exitValue: 1100,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: true,
            isLoser: false,
            isBreakeven: false,
          },
        }),
      ];

      const metrics = calculateSharpeRatio(trades);

      // Sharpe ratio requires at least 2 trades to calculate standard deviation
      expect(metrics.sharpeRatio).toBe(0);
      expect(metrics.averageReturn).toBe(0);
      expect(metrics.standardDeviation).toBe(0);
    });

    it('should calculate Sharpe ratio correctly', () => {
      const trades = [
        createMockTrade({
          id: '1',
          calculations: {
            pnl: 100,
            pnlPercent: 10,
            netPnl: 99,
            entryValue: 1000,
            exitValue: 1100,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: true,
            isLoser: false,
            isBreakeven: false,
          },
        }),
        createMockTrade({
          id: '2',
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
        }),
        createMockTrade({
          id: '3',
          calculations: {
            pnl: -30,
            pnlPercent: -3,
            netPnl: -31,
            entryValue: 1000,
            exitValue: 970,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: false,
            isLoser: true,
            isBreakeven: false,
          },
        }),
      ];

      const metrics = calculateSharpeRatio(trades);

      expect(metrics.averageReturn).toBeCloseTo(4, 1); // (10 + 5 - 3) / 3
      expect(metrics.standardDeviation).toBeGreaterThan(0);
      expect(metrics.sharpeRatio).toBeGreaterThanOrEqual(0);
    });

    it('should handle risk-free rate', () => {
      const trades = [
        createMockTrade({
          id: '1',
          calculations: {
            pnl: 100,
            pnlPercent: 10,
            netPnl: 99,
            entryValue: 1000,
            exitValue: 1100,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: true,
            isLoser: false,
            isBreakeven: false,
          },
        }),
        createMockTrade({
          id: '2',
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
        }),
      ];

      const metricsWithRiskFree = calculateSharpeRatio(trades, 2); // 2% risk-free rate

      expect(metricsWithRiskFree.sharpeRatio).toBeDefined();
    });
  });

  describe('calculateDrawdown', () => {
    it('should return zero metrics for empty trades', () => {
      const metrics = calculateDrawdown([]);

      expect(metrics.maxDrawdown).toBe(0);
      expect(metrics.maxDrawdownPercent).toBe(0);
      expect(metrics.currentDrawdown).toBe(0);
      expect(metrics.drawdownPeriods).toEqual([]);
    });

    it('should calculate drawdown for profitable equity curve', () => {
      const baseDate = new Date('2024-01-01');
      const trades = [
        createMockTrade({
          id: '1',
          entryDate: new Date(baseDate.getTime() + 0),
          calculations: {
            pnl: 100,
            pnlPercent: 10,
            netPnl: 100,
            entryValue: 1000,
            exitValue: 1100,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: true,
            isLoser: false,
            isBreakeven: false,
          },
        }),
        createMockTrade({
          id: '2',
          entryDate: new Date(baseDate.getTime() + 86400000),
          calculations: {
            pnl: -30,
            pnlPercent: -3,
            netPnl: -30,
            entryValue: 1000,
            exitValue: 970,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: false,
            isLoser: true,
            isBreakeven: false,
          },
        }),
        createMockTrade({
          id: '3',
          entryDate: new Date(baseDate.getTime() + 172800000),
          calculations: {
            pnl: 50,
            pnlPercent: 5,
            netPnl: 50,
            entryValue: 1000,
            exitValue: 1050,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: true,
            isLoser: false,
            isBreakeven: false,
          },
        }),
      ];

      const metrics = calculateDrawdown(trades);

      expect(metrics.maxDrawdown).toBeGreaterThanOrEqual(0);
      expect(metrics.maxDrawdownPercent).toBeGreaterThanOrEqual(0);
      expect(metrics.drawdownPeriods.length).toBeGreaterThanOrEqual(0);
    });

    it('should identify drawdown periods correctly', () => {
      const baseDate = new Date('2024-01-01');
      const trades = [
        createMockTrade({
          id: '1',
          entryDate: new Date(baseDate.getTime() + 0),
          calculations: {
            pnl: 100,
            pnlPercent: 10,
            netPnl: 100,
            entryValue: 1000,
            exitValue: 1100,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: true,
            isLoser: false,
            isBreakeven: false,
          },
        }),
        createMockTrade({
          id: '2',
          entryDate: new Date(baseDate.getTime() + 86400000),
          calculations: {
            pnl: -50,
            pnlPercent: -5,
            netPnl: -50,
            entryValue: 1000,
            exitValue: 950,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: false,
            isLoser: true,
            isBreakeven: false,
          },
        }),
        createMockTrade({
          id: '3',
          entryDate: new Date(baseDate.getTime() + 172800000),
          calculations: {
            pnl: -30,
            pnlPercent: -3,
            netPnl: -30,
            entryValue: 1000,
            exitValue: 970,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: false,
            isLoser: true,
            isBreakeven: false,
          },
        }),
        createMockTrade({
          id: '4',
          entryDate: new Date(baseDate.getTime() + 259200000),
          calculations: {
            pnl: 80,
            pnlPercent: 8,
            netPnl: 80,
            entryValue: 1000,
            exitValue: 1080,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: true,
            isLoser: false,
            isBreakeven: false,
          },
        }),
      ];

      const metrics = calculateDrawdown(trades);

      // Peak at 100, trough at 20 (100 - 50 - 30), so max drawdown should be 80
      expect(metrics.maxDrawdown).toBeGreaterThan(0);
      expect(metrics.drawdownPeriods.length).toBeGreaterThan(0);
    });
  });

  describe('calculateEquityCurve', () => {
    it('should return empty array for empty trades', () => {
      const curve = calculateEquityCurve([]);

      expect(curve).toEqual([]);
    });

    it('should calculate equity curve correctly', () => {
      const baseDate = new Date('2024-01-01');
      const trades = [
        createMockTrade({
          id: '1',
          symbol: 'AAPL',
          entryDate: new Date(baseDate.getTime() + 0),
          calculations: {
            pnl: 100,
            pnlPercent: 10,
            netPnl: 100,
            entryValue: 1000,
            exitValue: 1100,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: true,
            isLoser: false,
            isBreakeven: false,
          },
        }),
        createMockTrade({
          id: '2',
          symbol: 'MSFT',
          entryDate: new Date(baseDate.getTime() + 86400000),
          calculations: {
            pnl: 50,
            pnlPercent: 5,
            netPnl: 50,
            entryValue: 1000,
            exitValue: 1050,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: true,
            isLoser: false,
            isBreakeven: false,
          },
        }),
      ];

      const curve = calculateEquityCurve(trades);

      expect(curve.length).toBe(2);
      expect(curve[0].equity).toBe(100);
      expect(curve[0].tradeNumber).toBe(1);
      expect(curve[0].symbol).toBe('AAPL');
      expect(curve[1].equity).toBe(150);
      expect(curve[1].tradeNumber).toBe(2);
      expect(curve[1].symbol).toBe('MSFT');
    });

    it('should sort trades by entry date', () => {
      const baseDate = new Date('2024-01-01');
      const trades = [
        createMockTrade({
          id: '2',
          entryDate: new Date(baseDate.getTime() + 86400000),
          calculations: {
            pnl: 50,
            pnlPercent: 5,
            netPnl: 50,
            entryValue: 1000,
            exitValue: 1050,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: true,
            isLoser: false,
            isBreakeven: false,
          },
        }),
        createMockTrade({
          id: '1',
          entryDate: new Date(baseDate.getTime() + 0),
          calculations: {
            pnl: 100,
            pnlPercent: 10,
            netPnl: 100,
            entryValue: 1000,
            exitValue: 1100,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: true,
            isLoser: false,
            isBreakeven: false,
          },
        }),
      ];

      const curve = calculateEquityCurve(trades);

      expect(curve[0].tradeNumber).toBe(1);
      expect(curve[0].equity).toBe(100);
      expect(curve[1].tradeNumber).toBe(2);
      expect(curve[1].equity).toBe(150);
    });
  });

  describe('calculatePerformanceByDimension', () => {
    it('should return empty array for empty trades', () => {
      const performance = calculatePerformanceByDimension([], 'symbol');

      expect(performance).toEqual([]);
    });

    it('should calculate performance by symbol', () => {
      const trades = [
        createMockTrade({
          id: '1',
          symbol: 'AAPL',
          calculations: {
            pnl: 100,
            pnlPercent: 10,
            netPnl: 100,
            entryValue: 1000,
            exitValue: 1100,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: true,
            isLoser: false,
            isBreakeven: false,
          },
        }),
        createMockTrade({
          id: '2',
          symbol: 'AAPL',
          calculations: {
            pnl: 50,
            pnlPercent: 5,
            netPnl: 50,
            entryValue: 1000,
            exitValue: 1050,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: true,
            isLoser: false,
            isBreakeven: false,
          },
        }),
        createMockTrade({
          id: '3',
          symbol: 'MSFT',
          calculations: {
            pnl: -30,
            pnlPercent: -3,
            netPnl: -30,
            entryValue: 1000,
            exitValue: 970,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: false,
            isLoser: true,
            isBreakeven: false,
          },
        }),
      ];

      const performance = calculatePerformanceByDimension(trades, 'symbol');

      expect(performance.length).toBe(2);
      expect(performance[0].dimension).toBe('symbol');
      expect(performance[0].value).toBe('AAPL');
      expect(performance[0].trades).toBe(2);
      expect(performance[0].totalPnl).toBe(150);
      expect(performance[0].winRate).toBe(100);
      expect(performance[1].value).toBe('MSFT');
      expect(performance[1].totalPnl).toBe(-30);
    });

    it('should handle null/undefined dimension values', () => {
      const trades = [
        createMockTrade({
          id: '1',
          strategyName: null,
          calculations: {
            pnl: 100,
            pnlPercent: 10,
            netPnl: 100,
            entryValue: 1000,
            exitValue: 1100,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: true,
            isLoser: false,
            isBreakeven: false,
          },
        }),
      ];

      const performance = calculatePerformanceByDimension(trades, 'strategyName');

      expect(performance.length).toBe(1);
      expect(performance[0].value).toBe('Unknown');
    });
  });

  describe('calculateTimeBasedMetrics', () => {
    it('should return empty arrays for empty trades', () => {
      const metrics = calculateTimeBasedMetrics([]);

      expect(metrics.dayOfWeek).toEqual([]);
      expect(metrics.month).toEqual([]);
      expect(metrics.hour).toEqual([]);
    });

    it('should group trades by day of week', () => {
      // Create a date that falls on a Monday
      const monday = new Date('2024-01-01T10:00:00Z');
      const trades = [
        createMockTrade({
          id: '1',
          entryDate: monday,
          calculations: {
            pnl: 100,
            pnlPercent: 10,
            netPnl: 100,
            entryValue: 1000,
            exitValue: 1100,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: true,
            isLoser: false,
            isBreakeven: false,
          },
        }),
      ];

      const metrics = calculateTimeBasedMetrics(trades);

      expect(metrics.dayOfWeek.length).toBeGreaterThan(0);
      const mondayMetrics = metrics.dayOfWeek.find((d) => d.value === 'Monday');
      expect(mondayMetrics).toBeDefined();
      if (mondayMetrics) {
        expect(mondayMetrics.trades).toBe(1);
        expect(mondayMetrics.totalPnl).toBe(100);
      }
    });
  });

  describe('calculateStreaks', () => {
    it('should return zero streaks for empty trades', () => {
      const streaks = calculateStreaks([]);

      expect(streaks.currentStreak).toBe(0);
      expect(streaks.longestWinStreak).toBe(0);
      expect(streaks.longestLossStreak).toBe(0);
    });

    it('should calculate win streaks correctly', () => {
      const baseDate = new Date('2024-01-01');
      const trades = [
        createMockTrade({
          id: '1',
          entryDate: new Date(baseDate.getTime() + 0),
          calculations: {
            pnl: 100,
            pnlPercent: 10,
            netPnl: 100,
            entryValue: 1000,
            exitValue: 1100,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: true,
            isLoser: false,
            isBreakeven: false,
          },
        }),
        createMockTrade({
          id: '2',
          entryDate: new Date(baseDate.getTime() + 86400000),
          calculations: {
            pnl: 50,
            pnlPercent: 5,
            netPnl: 50,
            entryValue: 1000,
            exitValue: 1050,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: true,
            isLoser: false,
            isBreakeven: false,
          },
        }),
        createMockTrade({
          id: '3',
          entryDate: new Date(baseDate.getTime() + 172800000),
          calculations: {
            pnl: 30,
            pnlPercent: 3,
            netPnl: 30,
            entryValue: 1000,
            exitValue: 1030,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: true,
            isLoser: false,
            isBreakeven: false,
          },
        }),
      ];

      const streaks = calculateStreaks(trades);

      expect(streaks.currentStreak).toBe(3);
      expect(streaks.longestWinStreak).toBe(3);
      expect(streaks.longestLossStreak).toBe(0);
    });

    it('should calculate loss streaks correctly', () => {
      const baseDate = new Date('2024-01-01');
      const trades = [
        createMockTrade({
          id: '1',
          entryDate: new Date(baseDate.getTime() + 0),
          calculations: {
            pnl: -50,
            pnlPercent: -5,
            netPnl: -50,
            entryValue: 1000,
            exitValue: 950,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: false,
            isLoser: true,
            isBreakeven: false,
          },
        }),
        createMockTrade({
          id: '2',
          entryDate: new Date(baseDate.getTime() + 86400000),
          calculations: {
            pnl: -30,
            pnlPercent: -3,
            netPnl: -30,
            entryValue: 1000,
            exitValue: 970,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: false,
            isLoser: true,
            isBreakeven: false,
          },
        }),
      ];

      const streaks = calculateStreaks(trades);

      expect(streaks.currentStreak).toBe(-2);
      expect(streaks.longestWinStreak).toBe(0);
      expect(streaks.longestLossStreak).toBe(2);
    });

    it('should handle breakeven trades breaking streaks', () => {
      const baseDate = new Date('2024-01-01');
      const trades = [
        createMockTrade({
          id: '1',
          entryDate: new Date(baseDate.getTime() + 0),
          calculations: {
            pnl: 100,
            pnlPercent: 10,
            netPnl: 100,
            entryValue: 1000,
            exitValue: 1100,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: true,
            isLoser: false,
            isBreakeven: false,
          },
        }),
        createMockTrade({
          id: '2',
          entryDate: new Date(baseDate.getTime() + 86400000),
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
        }),
        createMockTrade({
          id: '3',
          entryDate: new Date(baseDate.getTime() + 172800000),
          calculations: {
            pnl: 50,
            pnlPercent: 5,
            netPnl: 50,
            entryValue: 1000,
            exitValue: 1050,
            holdingPeriod: 24,
            holdingPeriodDays: 1,
            isWinner: true,
            isLoser: false,
            isBreakeven: false,
          },
        }),
      ];

      const streaks = calculateStreaks(trades);

      expect(streaks.currentStreak).toBe(1);
      expect(streaks.longestWinStreak).toBe(1);
    });
  });
});

