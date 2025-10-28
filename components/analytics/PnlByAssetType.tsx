'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  chartColors,
  chartConfig,
  formatChartCurrency,
  chartDimensions,
  getPnlColor,
} from '@/lib/chart-config';

// ============================================================================
// Types
// ============================================================================

interface AssetTypeData {
  name: string;
  totalPnl: number;
  tradeCount: number;
  winRate: number;
}

interface PnlByAssetTypeProps {
  startDate?: string;
  endDate?: string;
  height?: number;
}

// ============================================================================
// Custom Tooltip
// ============================================================================

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div style={chartConfig.tooltip.contentStyle}>
      <p style={chartConfig.tooltip.labelStyle}>{data.name}</p>
      <p style={{ color: getPnlColor(data.totalPnl) }}>
        <strong>Total P&L:</strong> {formatChartCurrency(data.totalPnl)}
      </p>
      <p style={{ color: chartColors.bar.neutral }}>
        <strong>Trades:</strong> {data.tradeCount}
      </p>
      <p style={{ color: chartColors.bar.neutral }}>
        <strong>Win Rate:</strong> {data.winRate.toFixed(1)}%
      </p>
      <p style={{ color: chartColors.bar.neutral }}>
        <strong>Avg P&L:</strong>{' '}
        {formatChartCurrency(data.totalPnl / data.tradeCount)}
      </p>
    </div>
  );
};

// ============================================================================
// PnlByAssetType Component
// ============================================================================

export default function PnlByAssetType({
  startDate,
  endDate,
  height = chartDimensions.height.medium,
}: PnlByAssetTypeProps) {
  const [data, setData] = useState<AssetTypeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        params.append('chartType', 'breakdown');

        const url = `/api/analytics/charts${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch asset type data');
        }

        const result = await response.json();
        setData(result.charts.byAssetType || []);
      } catch (err: any) {
        console.error('Error fetching asset type data:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div
        className="rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"
        style={{ height: `${height}px` }}
      />
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          Error Loading Chart
        </h3>
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-12 text-center flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Data Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Start logging trades across different asset types.
          </p>
        </div>
      </div>
    );
  }

  // Sort by total P&L descending
  const sortedData = [...data].sort((a, b) => b.totalPnl - a.totalPnl);

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          P&L by Asset Type
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Performance across different asset classes
        </p>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={sortedData} margin={chartDimensions.margin.full}>
          <CartesianGrid {...chartConfig.grid} />
          <XAxis dataKey="name" {...chartConfig.axis} />
          <YAxis
            tickFormatter={(value) => formatChartCurrency(value)}
            {...chartConfig.axis}
            label={{
              value: 'Total P&L',
              angle: -90,
              position: 'insideLeft',
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={0}
            stroke={chartColors.breakeven}
            strokeDasharray="3 3"
          />
          <Bar dataKey="totalPnl" animationDuration={1000}>
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getPnlColor(entry.totalPnl)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {sortedData.slice(0, 4).map((asset) => {
          const avgPnl = asset.totalPnl / asset.tradeCount;
          return (
            <div
              key={asset.name}
              className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
            >
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                {asset.name}
              </p>
              <p
                className={`text-lg font-bold ${
                  asset.totalPnl > 0
                    ? 'text-green-600 dark:text-green-400'
                    : asset.totalPnl < 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {formatChartCurrency(asset.totalPnl)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {asset.tradeCount} trades • {asset.winRate.toFixed(0)}% win
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Avg: {formatChartCurrency(avgPnl)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

