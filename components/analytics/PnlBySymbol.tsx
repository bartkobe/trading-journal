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
import {
  chartConfig,
  formatChartCurrency,
  getPnlColor,
} from '@/lib/chart-config';

// ============================================================================
// Types
// ============================================================================

interface SymbolPerformance {
  symbol: string;
  totalPnl: number;
  trades: number;
  winRate: number;
  avgPnl: number;
}

interface PnlBySymbolProps {
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// PnlBySymbol Component
// ============================================================================

export default function PnlBySymbol({ startDate, endDate }: PnlBySymbolProps) {
  const [data, setData] = useState<SymbolPerformance[]>([]);
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
          throw new Error('Failed to fetch symbol performance data');
        }

        const result = await response.json();
        
        // Sort by total P&L and take top 10
        const sorted = (result.performance?.bySymbol || [])
          .sort((a: SymbolPerformance, b: SymbolPerformance) => b.totalPnl - a.totalPnl)
          .slice(0, 10);

        setData(sorted);
      } catch (err: any) {
        console.error('Error fetching symbol performance:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          P&L by Symbol
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          P&L by Symbol
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          P&L by Symbol
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">
            No trading data available
          </div>
        </div>
      </div>
    );
  }

  const topSymbol = data[0];
  const bottomSymbol = data[data.length - 1];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        P&L by Symbol (Top 10)
      </h3>

      {/* Chart */}
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid {...chartConfig.grid} />
            <XAxis
              dataKey="symbol"
              {...chartConfig.axis}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis {...chartConfig.axis} tickFormatter={formatChartCurrency} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="totalPnl" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getPnlColor(entry.totalPnl)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Best Performer
            </span>
            <span className="text-2xl">🏆</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {topSymbol.symbol}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
            {formatChartCurrency(topSymbol.totalPnl)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {topSymbol.trades} trades • {(topSymbol.winRate ?? 0).toFixed(1)}% win rate
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Worst Performer
            </span>
            <span className="text-2xl">📉</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {bottomSymbol.symbol}
          </p>
          <p className="text-sm text-red-600 dark:text-red-400 font-semibold">
            {formatChartCurrency(bottomSymbol.totalPnl)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {bottomSymbol.trades} trades • {(bottomSymbol.winRate ?? 0).toFixed(1)}% win rate
          </p>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-semibold">💡 Insight:</span> Your best symbol{' '}
          <span className="font-semibold">{topSymbol.symbol}</span> has a{' '}
          {(topSymbol.winRate ?? 0).toFixed(1)}% win rate with an average P&L of{' '}
          {formatChartCurrency(topSymbol.avgPnl ?? 0)} per trade. Consider focusing
          on your top performers.
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

  const data = payload[0].payload as SymbolPerformance;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
      <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {data.symbol}
      </p>
      <div className="space-y-1 text-sm">
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-medium">Total P&L:</span>{' '}
          <span
            className={
              data.totalPnl >= 0
                ? 'text-green-600 dark:text-green-400 font-semibold'
                : 'text-red-600 dark:text-red-400 font-semibold'
            }
          >
            {formatChartCurrency(data.totalPnl)}
          </span>
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-medium">Trades:</span> {data.trades}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-medium">Win Rate:</span>{' '}
          {(data.winRate ?? 0).toFixed(1)}%
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-medium">Avg P&L:</span>{' '}
          {formatChartCurrency(data.avgPnl ?? 0)}
        </p>
      </div>
    </div>
  );
}

