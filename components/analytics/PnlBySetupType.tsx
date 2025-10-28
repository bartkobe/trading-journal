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

interface SetupTypePerformance {
  setupType: string;
  totalPnl: number;
  trades: number;
  winRate: number;
  avgPnl: number;
}

interface PnlBySetupTypeProps {
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// PnlBySetupType Component
// ============================================================================

export default function PnlBySetupType({ startDate, endDate }: PnlBySetupTypeProps) {
  const [data, setData] = useState<SetupTypePerformance[]>([]);
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
          throw new Error('Failed to fetch setup type performance data');
        }

        const result = await response.json();

        // Sort by total P&L
        const sorted = (result.performance?.bySetupType || []).sort(
          (a: SetupTypePerformance, b: SetupTypePerformance) => b.totalPnl - a.totalPnl
        );

        setData(sorted);
      } catch (err: any) {
        console.error('Error fetching setup type performance:', err);
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
          P&L by Setup Type
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
          P&L by Setup Type
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
          P&L by Setup Type
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">No trading data available</div>
        </div>
      </div>
    );
  }

  const topSetup = data[0];
  const totalTrades = data.reduce((sum, item) => sum + item.trades, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        P&L by Setup Type
      </h3>

      {/* Chart */}
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid {...chartConfig.grid} />
            <XAxis
              dataKey="setupType"
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
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Best Setup</span>
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{topSetup.setupType}</p>
          <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
            {formatChartCurrency(topSetup.totalPnl)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {(topSetup.winRate ?? 0).toFixed(1)}% win rate
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Most Used</span>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {data.sort((a, b) => b.trades - a.trades)[0].setupType}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {data.sort((a, b) => b.trades - a.trades)[0].trades} trades
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {((data.sort((a, b) => b.trades - a.trades)[0].trades / totalTrades) * 100).toFixed(1)}%
            of all trades
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Setups
            </span>
            <span className="text-2xl">🎯</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{data.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Different setups</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {totalTrades} total trades
          </p>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-semibold">💡 Insight:</span> Your most profitable setup is{' '}
          <span className="font-semibold">{topSetup.setupType}</span> with{' '}
          {formatChartCurrency(topSetup.totalPnl)} total P&L and a{' '}
          {(topSetup.winRate ?? 0).toFixed(1)}% win rate. Focus on your proven setups and consider
          documenting what makes them successful.
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

  const data = payload[0].payload as SetupTypePerformance;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
      <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{data.setupType}</p>
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
          <span className="font-medium">Win Rate:</span> {(data.winRate ?? 0).toFixed(1)}%
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-medium">Avg P&L:</span> {formatChartCurrency(data.avgPnl ?? 0)}
        </p>
      </div>
    </div>
  );
}
