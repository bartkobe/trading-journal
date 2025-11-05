'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { formatCurrency, formatPercent } from '@/lib/trades';

// ============================================================================
// Types
// ============================================================================

interface DashboardMetricsData {
  totalTrades: number;
  openTradesCount: number;
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
        return 'profit';
      case 'negative':
        return 'loss';
      default:
        return 'breakeven';
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
  const t = useTranslations('analytics');
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
          throw new Error(t('failedToFetchMetrics'));
        }

        const data = await response.json();
        setMetrics(data.metrics);
      } catch (err: any) {
        console.error('Error fetching dashboard metrics:', err);
        setError(err.message || t('anErrorOccurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="h-4 bg-muted rounded animate-pulse w-2/3 mb-3" />
              <div className="h-8 bg-muted rounded animate-pulse w-1/2 mb-2" />
              <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
            </div>
          ))}
        </div>

        {/* Section Skeletons */}
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg border border-border p-6">
              <div className="h-5 bg-muted rounded animate-pulse w-1/4 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j}>
                    <div className="h-4 bg-muted rounded animate-pulse w-2/3 mb-2" />
                    <div className="h-6 bg-muted rounded animate-pulse w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-danger loss-bg p-6">
        <h3 className="text-lg font-semibold loss mb-2">
          {t('errorLoadingMetrics')}
        </h3>
        <p className="loss">{error}</p>
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
          {t('noTradingData')}
        </h3>
        <p className="text-muted-foreground">
          {t('startLoggingTradesMetrics')}
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
          {t('performanceOverview')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title={t('totalTrades')}
            value={metrics?.totalTrades ?? 0}
            subtitle={t('allClosedTrades')}
            trend="neutral"
          />
          <MetricCard
            title={t('openTradesCount')}
            value={metrics?.openTradesCount ?? 0}
            subtitle={t('currentlyActivePositions')}
            trend="neutral"
            className="border-blue-300 dark:border-blue-700"
          />
          <MetricCard
            title={t('totalPnl')}
            value={formatCurrency(metrics.performance?.totalPnl ?? 0)}
            subtitle={t('netProfitLoss')}
            trend={getPnlTrend(metrics.performance?.totalPnl ?? 0)}
          />
          <MetricCard
            title={t('averagePnl')}
            value={formatCurrency(metrics.performance?.averagePnl ?? 0)}
            subtitle={t('perTrade')}
            trend={getPnlTrend(metrics.performance?.averagePnl ?? 0)}
          />
          <MetricCard
            title={t('winRate')}
            value={`${(metrics.performance?.winRate ?? 0).toFixed(1)}%`}
            subtitle={t('winsLosses', { wins: metrics.winLoss?.winningTrades ?? 0, losses: metrics.winLoss?.losingTrades ?? 0 })}
            trend={(metrics.performance?.winRate ?? 0) >= 50 ? 'positive' : 'negative'}
          />
        </div>
      </div>

      {/* Win/Loss Analysis */}
      <div>
        <h2 className="text-xl font-bold text-foreground dark:text-gray-100 mb-4">
          {t('winLossAnalysis')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title={t('averageWin')}
            value={formatCurrency(metrics.winLoss?.averageWin ?? 0)}
            subtitle={`${metrics.winLoss?.winningTrades ?? 0} ${t('winningTrades').toLowerCase()}`}
            trend="positive"
          />
          <MetricCard
            title={t('averageLoss')}
            value={formatCurrency(metrics.winLoss?.averageLoss ?? 0)}
            subtitle={`${metrics.winLoss?.losingTrades ?? 0} ${t('losingTrades').toLowerCase()}`}
            trend="negative"
          />
          <MetricCard
            title={t('largestWin')}
            value={formatCurrency(metrics.winLoss?.largestWin ?? 0)}
            subtitle={t('bestTrade')}
            trend="positive"
          />
          <MetricCard
            title={t('largestLoss')}
            value={formatCurrency(metrics.winLoss?.largestLoss ?? 0)}
            subtitle={t('worstTrade')}
            trend="negative"
          />
        </div>
      </div>

      {/* Advanced Metrics */}
      <div>
        <h2 className="text-xl font-bold text-foreground dark:text-gray-100 mb-4">
          {t('advancedMetrics')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title={t('profitFactor')}
            value={(metrics.performance?.profitFactor ?? 0).toFixed(2)}
            subtitle={t('grossProfitGrossLoss')}
            trend={(metrics.performance?.profitFactor ?? 0) > 1 ? 'positive' : 'negative'}
          />
          <MetricCard
            title={t('expectancy')}
            value={formatCurrency(metrics.advanced?.expectancy ?? 0)}
            subtitle={`${formatPercent(metrics.advanced?.expectancyPercent ?? 0)} ${t('perTrade')}`}
            trend={getPnlTrend(metrics.advanced?.expectancy ?? 0)}
          />
          <MetricCard
            title={t('sharpeRatio')}
            value={(metrics.advanced?.sharpeRatio ?? 0).toFixed(2)}
            subtitle={t('riskAdjustedReturn')}
            trend={(metrics.advanced?.sharpeRatio ?? 0) > 1 ? 'positive' : 'neutral'}
          />
          <MetricCard
            title={t('standardDeviation')}
            value={formatPercent(metrics.advanced?.standardDeviation ?? 0)}
            subtitle={t('returnVolatility')}
            trend="neutral"
          />
        </div>
      </div>

      {/* Risk Metrics */}
      <div>
        <h2 className="text-xl font-bold text-foreground dark:text-gray-100 mb-4">{t('riskMetrics')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title={t('maxDrawdown')}
            value={formatCurrency(metrics.drawdown?.maxDrawdown ?? 0)}
            subtitle={t('peakToTrough', { percent: formatPercent(metrics.drawdown?.maxDrawdownPercent ?? 0) })}
            trend="negative"
          />
          <MetricCard
            title={t('currentDrawdown')}
            value={formatCurrency(metrics.drawdown?.currentDrawdown ?? 0)}
            subtitle={formatPercent(metrics.drawdown?.currentDrawdownPercent ?? 0)}
            trend={(metrics.drawdown?.currentDrawdown ?? 0) === 0 ? 'neutral' : 'negative'}
          />
          <MetricCard
            title={t('averageDrawdown')}
            value={formatCurrency(metrics.drawdown?.averageDrawdown ?? 0)}
            subtitle={t('typicalDrawdown')}
            trend="neutral"
          />
          <MetricCard
            title={t('currentStreak')}
            value={
              (metrics.streaks?.currentStreak ?? 0) > 0
                ? `+${metrics.streaks?.currentStreak}`
                : (metrics.streaks?.currentStreak ?? 0)
            }
            subtitle={
              (metrics.streaks?.currentStreak ?? 0) > 0
                ? t('winningStreak')
                : (metrics.streaks?.currentStreak ?? 0) < 0
                  ? t('losingStreak')
                  : t('noStreak')
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
        <h2 className="text-xl font-bold text-foreground dark:text-gray-100 mb-4">{t('streakAnalysis')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title={t('longestWinStreak')}
            value={metrics.streaks?.longestWinStreak ?? 0}
            subtitle={t('consecutiveWins')}
            trend="positive"
          />
          <MetricCard
            title={t('longestLossStreak')}
            value={metrics.streaks?.longestLossStreak ?? 0}
            subtitle={t('consecutiveLosses')}
            trend="negative"
          />
          <MetricCard
            title={t('averageWinStreak')}
            value={(metrics.streaks?.averageWinStreak ?? 0).toFixed(1)}
            subtitle={t('typicalWinningRun')}
            trend="neutral"
          />
          <MetricCard
            title={t('averageLossStreak')}
            value={(metrics.streaks?.averageLossStreak ?? 0).toFixed(1)}
            subtitle={t('typicalLosingRun')}
            trend="neutral"
          />
        </div>
      </div>
    </div>
  );
}
