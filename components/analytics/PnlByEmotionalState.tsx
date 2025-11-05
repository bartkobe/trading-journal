'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { chartConfig, formatChartCurrency, getPnlColor } from '@/lib/chart-config';

// ============================================================================
// Types
// ============================================================================

interface EmotionalStatePerformance {
  emotionalStateEntry: string;
  totalPnl: number;
  trades: number;
  winRate: number;
  avgPnl: number;
}

interface PnlByEmotionalStateProps {
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

const getEmotionalIcon = (state: string): string => {
  const icons: { [key: string]: string } = {
    Confident: '😎',
    Calm: '😌',
    Neutral: '😐',
    Anxious: '😰',
    Fearful: '😨',
    Greedy: '🤑',
    Overconfident: '😤',
    FOMO: '😱',
    Revenge: '😡',
    Disciplined: '🧘',
    Excited: '🤩',
    Stressed: '😓',
  };
  return icons[state] || '😐';
};

// ============================================================================
// PnlByEmotionalState Component
// ============================================================================

export default function PnlByEmotionalState({ startDate, endDate }: PnlByEmotionalStateProps) {
  const tTitles = useTranslations('analytics.chartTitles');
  const tLabels = useTranslations('analytics.chartLabels');
  const tErrors = useTranslations('analytics.chartErrors');
  const tEmpty = useTranslations('analytics.chartEmptyStates');
  const t = useTranslations('analytics');
  const [data, setData] = useState<EmotionalStatePerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const response = await fetch(`/api/analytics/performance?${params}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(tErrors('failedToFetchEmotionalStatePerformance'));
        }

        const result = await response.json();

        // Sort by total P&L
        const sorted = (result.performance?.byEmotionalState || []).sort(
          (a: EmotionalStatePerformance, b: EmotionalStatePerformance) => b.totalPnl - a.totalPnl
        );

        setData(sorted);
      } catch (err: any) {
        console.error('Error fetching emotional state performance:', err);
        setError(err.message || tErrors('anErrorOccurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground dark:text-gray-100 mb-4">
          {tTitles('pnlByEmotionalState')}
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">{t('loading')}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground dark:text-gray-100 mb-4">
          {tTitles('pnlByEmotionalState')}
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="loss">{tErrors('anErrorOccurred')}: {error}</div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground dark:text-gray-100 mb-4">
          {tTitles('pnlByEmotionalState')}
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">{tEmpty('noEmotionalStateData')}</div>
        </div>
      </div>
    );
  }

  const bestState = data[0];
  const worstState = data[data.length - 1];
  const positiveStates = data.filter((s) => s.totalPnl > 0);
  const negativeStates = data.filter((s) => s.totalPnl < 0);

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground dark:text-gray-100 mb-4">
        {tTitles('pnlByEmotionalState')}
      </h3>

      {/* Chart */}
      <div className="mb-6" style={{ minHeight: '320px' }}>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data}>
            <CartesianGrid {...chartConfig.grid} />
            <XAxis
              dataKey="emotionalStateEntry"
              {...chartConfig.axis}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis {...chartConfig.axis} tickFormatter={formatChartCurrency} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="totalPnl" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getPnlColor(entry.totalPnl)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="profit-bg rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              {tLabels('bestPerformer')}
            </span>
            <span className="text-2xl">{getEmotionalIcon(bestState.emotionalStateEntry)}</span>
          </div>
          <p className="text-lg font-bold text-foreground dark:text-gray-100">
            {bestState.emotionalStateEntry}
          </p>
          <p className="text-sm profit font-semibold">
            {formatChartCurrency(bestState.totalPnl)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {(bestState.winRate ?? 0).toFixed(1)}% {tLabels('winRate')} • {bestState.trades} {tLabels('trades')}
          </p>
        </div>

        <div className="loss-bg rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              {tLabels('worstPerformer')}
            </span>
            <span className="text-2xl">{getEmotionalIcon(worstState.emotionalStateEntry)}</span>
          </div>
          <p className="text-lg font-bold text-foreground dark:text-gray-100">
            {worstState.emotionalStateEntry}
          </p>
          <p className="text-sm loss font-semibold">
            {formatChartCurrency(worstState.totalPnl)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {(worstState.winRate ?? 0).toFixed(1)}% {tLabels('winRate')} • {worstState.trades} {tLabels('trades')}
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              {t('emotionalBalance')}
            </span>
            <span className="text-2xl">⚖️</span>
          </div>
          <p className="text-lg font-bold text-foreground dark:text-gray-100">
            {positiveStates.length} / {data.length}
          </p>
          <p className="text-sm text-muted-foreground">{t('positiveStates')}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {((positiveStates.length / data.length) * 100).toFixed(0)}% {t('ofStates')}
          </p>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
        <p className="text-sm text-foreground">
          <span className="font-semibold">{tLabels('insight')}:</span> {t('emotionalStateInsight', {
            bestState: bestState.emotionalStateEntry,
            winRate: (bestState.winRate ?? 0).toFixed(1),
            worstState: worstState.emotionalStateEntry,
            hasOtherNegative: negativeStates.length > 2
          })}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Custom Tooltip
// ============================================================================

function CustomTooltip({ active, payload }: any) {
  const tLabels = useTranslations('analytics.chartLabels');
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload as EmotionalStatePerformance;

  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3">
      <p className="font-semibold text-foreground dark:text-gray-100 mb-2 flex items-center gap-2">
        <span className="text-xl">{getEmotionalIcon(data.emotionalStateEntry)}</span>
        {data.emotionalStateEntry}
      </p>
      <div className="space-y-1 text-sm">
        <p className="text-foreground">
          <span className="font-medium">{tLabels('totalPnl')}:</span>{' '}
          <span
            className={
              data.totalPnl >= 0
                ? 'profit font-semibold'
                : 'loss font-semibold'
            }
          >
            {formatChartCurrency(data.totalPnl)}
          </span>
        </p>
        <p className="text-foreground">
          <span className="font-medium">{tLabels('trades')}:</span> {data.trades}
        </p>
        <p className="text-foreground">
          <span className="font-medium">{tLabels('winRate')}:</span> {(data.winRate ?? 0).toFixed(1)}%
        </p>
        <p className="text-foreground">
          <span className="font-medium">{tLabels('avgPnl')}:</span> {formatChartCurrency(data.avgPnl ?? 0)}
        </p>
      </div>
    </div>
  );
}
