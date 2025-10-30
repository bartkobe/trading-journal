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

interface StrategyData {
  name: string;
  totalPnl: number;
  tradeCount: number;
  winRate: number;
}

interface PnlByStrategyProps {
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
        <strong>Avg P&L:</strong> {formatChartCurrency(data.totalPnl / data.tradeCount)}
      </p>
    </div>
  );
};

// ============================================================================
// PnlByStrategy Component
// ============================================================================

export default function PnlByStrategy({
  startDate,
  endDate,
  height = chartDimensions.height.medium,
}: PnlByStrategyProps) {
  const [data, setData] = useState<StrategyData[]>([]);
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
          throw new Error('Failed to fetch strategy data');
        }

        const result = await response.json();
        setData(result.charts.byStrategy || []);
      } catch (err: any) {
        console.error('Error fetching strategy data:', err);
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
        className="rounded-lg bg-card border border-border p-6 flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-danger loss-bg p-6">
        <h3 className="text-lg font-semibold loss mb-2">
          Error Loading Chart
        </h3>
        <p className="loss">{error}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        className="rounded-lg border border-border bg-card p-12 text-center flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        <div>
          <h3 className="text-lg font-semibold text-foreground dark:text-gray-100 mb-2">
            No Data Available
          </h3>
          <p className="text-muted-foreground">
            Start logging trades with different strategies.
          </p>
        </div>
      </div>
    );
  }

  // Sort by total P&L descending
  const sortedData = [...data].sort((a, b) => b.totalPnl - a.totalPnl);

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground dark:text-gray-100">P&L by Strategy</h3>
        <p className="text-sm text-muted-foreground">
          Performance of different trading strategies
        </p>
      </div>

      <ResponsiveContainer width="100%" height={height} minHeight={0}>
        <BarChart data={sortedData} margin={chartDimensions.margin.full}>
          <CartesianGrid {...chartConfig.grid} />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} {...chartConfig.axis} />
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
          <ReferenceLine y={0} stroke={chartColors.breakeven} strokeDasharray="3 3" />
          <Bar dataKey="totalPnl" animationDuration={1000}>
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getPnlColor(entry.totalPnl)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="mt-6 overflow-x-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedData.slice(0, 8).map((strategy) => {
            const avgPnl = strategy.totalPnl / strategy.tradeCount;
            return (
              <div
                key={strategy.name}
                className="text-center p-3 rounded-lg bg-muted dark:bg-gray-700"
              >
                <p className="text-xs font-medium text-muted-foreground mb-1 truncate">
                  {strategy.name}
                </p>
                <p
                  className={`text-lg font-bold ${
                    strategy.totalPnl > 0
                      ? 'profit'
                      : strategy.totalPnl < 0
                        ? 'loss'
                        : 'breakeven'
                  }`}
                >
                  {formatChartCurrency(strategy.totalPnl)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {strategy.tradeCount} trades • {strategy.winRate.toFixed(0)}% win
                </p>
                <p className="text-xs text-muted-foreground">
                  Avg: {formatChartCurrency(avgPnl)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
