'use client';

import { useEffect, useState } from 'react';
import { formatCurrency, formatPercent } from '@/lib/trades';

// ============================================================================
// Types
// ============================================================================

interface DashboardMetricsData {
  totalTrades: number;
  dateRange: {
    start: string | null;
    end: string | null;
    filtered: boolean;
  };
  performance: {
    totalPnl: number;
    averagePnl: number;
    winRate: number;
    lossRate: number;
    breakevenRate: number;
    profitFactor: number;
  };
  winLoss: {
    winningTrades: number;
    losingTrades: number;
    breakevenTrades: number;
    averageWin: number;
    averageLoss: number;
    largestWin: number;
    largestLoss: number;
  };
  advanced: {
    expectancy: number;
    expectancyPercent: number;
    sharpeRatio: number;
    averageReturn: number;
    standardDeviation: number;
  };
  drawdown: {
    maxDrawdown: number;
    maxDrawdownPercent: number;
    currentDrawdown: number;
    currentDrawdownPercent: number;
    averageDrawdown: number;
  };
  streaks: {
    currentStreak: number;
    longestWinStreak: number;
    longestLossStreak: number;
    averageWinStreak: number;
    averageLossStreak: number;
  };
}

interface DashboardMetricsProps {
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// MetricCard Component
// ============================================================================

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'positive' | 'negative' | 'neutral';
  className?: string;
}

const MetricCard = ({ title, value, subtitle, trend, className = '' }: MetricCardProps) => {
  const getTrendColor = () => {
    if (!trend) return '';
    switch (trend) {
      case 'positive':
        return 'text-green-600 dark:text-green-400';
      case 'negative':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div
      className={`rounded-lg border border-border bg-card p-6 shadow-sm ${className}`}
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
      <p className={`text-3xl font-bold ${getTrendColor()}`}>{value}</p>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
};

// ============================================================================
// DashboardMetrics Component
// ============================================================================

export default function DashboardMetrics({ startDate, endDate }: DashboardMetricsProps) {
  const [metrics, setMetrics] = useState<DashboardMetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const url = `/api/analytics/dashboard${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await fetch(url, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard metrics');
        }

        const data = await response.json();
        setMetrics(data.metrics);
      } catch (err: any) {
        console.error('Error fetching dashboard metrics:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          Error Loading Metrics
        </h3>
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (
    !metrics ||
    !metrics.performance ||
    !metrics.winLoss ||
    !metrics.advanced ||
    !metrics.drawdown ||
    !metrics.streaks ||
    metrics.totalTrades === 0
  ) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <h3 className="text-lg font-semibold text-foreground dark:text-gray-100 mb-2">
          No Trading Data
        </h3>
        <p className="text-muted-foreground">
          Start logging trades to see your performance metrics.
        </p>
      </div>
    );
  }

  const getPnlTrend = (value: number) => {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  };

  return (
    <div className="space-y-8">
      {/* Overview Section */}
      <div>
        <h2 className="text-xl font-bold text-foreground dark:text-gray-100 mb-4">
          Performance Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Trades"
            value={metrics?.totalTrades ?? 0}
            subtitle="All recorded trades"
            trend="neutral"
          />
          <MetricCard
            title="Total P&L"
            value={formatCurrency(metrics.performance?.totalPnl ?? 0)}
            subtitle="Net profit/loss"
            trend={getPnlTrend(metrics.performance?.totalPnl ?? 0)}
          />
          <MetricCard
            title="Average P&L"
            value={formatCurrency(metrics.performance?.averagePnl ?? 0)}
            subtitle="Per trade"
            trend={getPnlTrend(metrics.performance?.averagePnl ?? 0)}
          />
          <MetricCard
            title="Win Rate"
            value={`${(metrics.performance?.winRate ?? 0).toFixed(1)}%`}
            subtitle={`${metrics.winLoss?.winningTrades ?? 0} wins, ${metrics.winLoss?.losingTrades ?? 0} losses`}
            trend={(metrics.performance?.winRate ?? 0) >= 50 ? 'positive' : 'negative'}
          />
        </div>
      </div>

      {/* Win/Loss Analysis */}
      <div>
        <h2 className="text-xl font-bold text-foreground dark:text-gray-100 mb-4">
          Win/Loss Analysis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Average Win"
            value={formatCurrency(metrics.winLoss?.averageWin ?? 0)}
            subtitle={`${metrics.winLoss?.winningTrades ?? 0} winning trades`}
            trend="positive"
          />
          <MetricCard
            title="Average Loss"
            value={formatCurrency(metrics.winLoss?.averageLoss ?? 0)}
            subtitle={`${metrics.winLoss?.losingTrades ?? 0} losing trades`}
            trend="negative"
          />
          <MetricCard
            title="Largest Win"
            value={formatCurrency(metrics.winLoss?.largestWin ?? 0)}
            subtitle="Best trade"
            trend="positive"
          />
          <MetricCard
            title="Largest Loss"
            value={formatCurrency(metrics.winLoss?.largestLoss ?? 0)}
            subtitle="Worst trade"
            trend="negative"
          />
        </div>
      </div>

      {/* Advanced Metrics */}
      <div>
        <h2 className="text-xl font-bold text-foreground dark:text-gray-100 mb-4">
          Advanced Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Profit Factor"
            value={(metrics.performance?.profitFactor ?? 0).toFixed(2)}
            subtitle="Gross profit / Gross loss"
            trend={(metrics.performance?.profitFactor ?? 0) > 1 ? 'positive' : 'negative'}
          />
          <MetricCard
            title="Expectancy"
            value={formatCurrency(metrics.advanced?.expectancy ?? 0)}
            subtitle={`${formatPercent(metrics.advanced?.expectancyPercent ?? 0)} per trade`}
            trend={getPnlTrend(metrics.advanced?.expectancy ?? 0)}
          />
          <MetricCard
            title="Sharpe Ratio"
            value={(metrics.advanced?.sharpeRatio ?? 0).toFixed(2)}
            subtitle="Risk-adjusted return"
            trend={(metrics.advanced?.sharpeRatio ?? 0) > 1 ? 'positive' : 'neutral'}
          />
          <MetricCard
            title="Std Deviation"
            value={formatPercent(metrics.advanced?.standardDeviation ?? 0)}
            subtitle="Return volatility"
            trend="neutral"
          />
        </div>
      </div>

      {/* Risk Metrics */}
      <div>
        <h2 className="text-xl font-bold text-foreground dark:text-gray-100 mb-4">Risk Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Max Drawdown"
            value={formatCurrency(metrics.drawdown?.maxDrawdown ?? 0)}
            subtitle={`${formatPercent(metrics.drawdown?.maxDrawdownPercent ?? 0)} peak to trough`}
            trend="negative"
          />
          <MetricCard
            title="Current Drawdown"
            value={formatCurrency(metrics.drawdown?.currentDrawdown ?? 0)}
            subtitle={formatPercent(metrics.drawdown?.currentDrawdownPercent ?? 0)}
            trend={(metrics.drawdown?.currentDrawdown ?? 0) === 0 ? 'neutral' : 'negative'}
          />
          <MetricCard
            title="Average Drawdown"
            value={formatCurrency(metrics.drawdown?.averageDrawdown ?? 0)}
            subtitle="Typical drawdown"
            trend="neutral"
          />
          <MetricCard
            title="Current Streak"
            value={
              (metrics.streaks?.currentStreak ?? 0) > 0
                ? `+${metrics.streaks?.currentStreak}`
                : (metrics.streaks?.currentStreak ?? 0)
            }
            subtitle={
              (metrics.streaks?.currentStreak ?? 0) > 0
                ? 'Winning streak'
                : (metrics.streaks?.currentStreak ?? 0) < 0
                  ? 'Losing streak'
                  : 'No streak'
            }
            trend={
              (metrics.streaks?.currentStreak ?? 0) > 0
                ? 'positive'
                : (metrics.streaks?.currentStreak ?? 0) < 0
                  ? 'negative'
                  : 'neutral'
            }
          />
        </div>
      </div>

      {/* Streak Analysis */}
      <div>
        <h2 className="text-xl font-bold text-foreground dark:text-gray-100 mb-4">Streak Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Longest Win Streak"
            value={metrics.streaks?.longestWinStreak ?? 0}
            subtitle="Consecutive wins"
            trend="positive"
          />
          <MetricCard
            title="Longest Loss Streak"
            value={metrics.streaks?.longestLossStreak ?? 0}
            subtitle="Consecutive losses"
            trend="negative"
          />
          <MetricCard
            title="Avg Win Streak"
            value={(metrics.streaks?.averageWinStreak ?? 0).toFixed(1)}
            subtitle="Typical winning run"
            trend="neutral"
          />
          <MetricCard
            title="Avg Loss Streak"
            value={(metrics.streaks?.averageLossStreak ?? 0).toFixed(1)}
            subtitle="Typical losing run"
            trend="neutral"
          />
        </div>
      </div>
    </div>
  );
}
