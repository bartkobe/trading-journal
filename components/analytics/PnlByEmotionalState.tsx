'use client';

import { useState, useEffect } from 'react';
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
          throw new Error('Failed to fetch emotional state performance data');
        }

        const result = await response.json();

        // Sort by total P&L
        const sorted = (result.performance?.byEmotionalState || []).sort(
          (a: EmotionalStatePerformance, b: EmotionalStatePerformance) => b.totalPnl - a.totalPnl
        );

        setData(sorted);
      } catch (err: any) {
        console.error('Error fetching emotional state performance:', err);
        setError(err.message || 'An error occurred');
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
          P&L by Emotional State
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground dark:text-gray-100 mb-4">
          P&L by Emotional State
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="loss">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground dark:text-gray-100 mb-4">
          P&L by Emotional State
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">No trading data available</div>
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
        P&L by Emotional State
      </h3>

      {/* Chart */}
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%" minHeight={0}>
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
              Best Emotional State
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
            {(bestState.winRate ?? 0).toFixed(1)}% win rate • {bestState.trades} trades
          </p>
        </div>

        <div className="loss-bg rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Worst Emotional State
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
            {(worstState.winRate ?? 0).toFixed(1)}% win rate • {worstState.trades} trades
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Emotional Balance
            </span>
            <span className="text-2xl">⚖️</span>
          </div>
          <p className="text-lg font-bold text-foreground dark:text-gray-100">
            {positiveStates.length} / {data.length}
          </p>
          <p className="text-sm text-muted-foreground">Positive states</p>
          <p className="text-xs text-muted-foreground mt-1">
            {((positiveStates.length / data.length) * 100).toFixed(0)}% of states
          </p>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
        <p className="text-sm text-foreground">
          <span className="font-semibold">🧠 Insight:</span> You perform best when{' '}
          <span className="font-semibold">{bestState.emotionalStateEntry}</span> with a{' '}
          {(bestState.winRate ?? 0).toFixed(1)}% win rate. Avoid trading when feeling{' '}
          <span className="font-semibold">{worstState.emotionalStateEntry}</span>
          {negativeStates.length > 2 && ' or other negative emotional states'}. Consider your
          emotional state before entering trades.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Custom Tooltip
// ============================================================================

function CustomTooltip({ active, payload }: any) {
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
          <span className="font-medium">Total P&L:</span>{' '}
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
          <span className="font-medium">Trades:</span> {data.trades}
        </p>
        <p className="text-foreground">
          <span className="font-medium">Win Rate:</span> {(data.winRate ?? 0).toFixed(1)}%
        </p>
        <p className="text-foreground">
          <span className="font-medium">Avg P&L:</span> {formatChartCurrency(data.avgPnl ?? 0)}
        </p>
      </div>
    </div>
  );
}
