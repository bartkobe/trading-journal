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

interface TimeOfDayData {
  name: string;
  totalPnl: number;
  tradeCount: number;
  winRate: number;
}

interface PnlByTimeOfDayProps {
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
// PnlByTimeOfDay Component
// ============================================================================

export default function PnlByTimeOfDay({
  startDate,
  endDate,
  height = chartDimensions.height.medium,
}: PnlByTimeOfDayProps) {
  const [data, setData] = useState<TimeOfDayData[]>([]);
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
          throw new Error('Failed to fetch time of day data');
        }

        const result = await response.json();

        // Order the data chronologically (Morning, Afternoon, Evening)
        const timeOrder = ['MORNING', 'AFTERNOON', 'EVENING'];
        const orderedData = (result.charts.byTimeOfDay || []).sort(
          (a: TimeOfDayData, b: TimeOfDayData) => {
            return timeOrder.indexOf(a.name) - timeOrder.indexOf(b.name);
          }
        );

        setData(orderedData);
      } catch (err: any) {
        console.error('Error fetching time of day data:', err);
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
            Start logging trades at different times of day.
          </p>
        </div>
      </div>
    );
  }

  // Format the names for display
  const displayData = data.map((item) => ({
    ...item,
    displayName: item.name.charAt(0) + item.name.slice(1).toLowerCase(),
  }));

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground dark:text-gray-100">
          P&L by Time of Day
        </h3>
        <p className="text-sm text-muted-foreground">
          Performance during different trading sessions
        </p>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={displayData} margin={chartDimensions.margin.full}>
          <CartesianGrid {...chartConfig.grid} />
          <XAxis dataKey="displayName" {...chartConfig.axis} />
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
            {displayData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getPnlColor(entry.totalPnl)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {displayData.map((timeSlot) => {
          const avgPnl = timeSlot.totalPnl / timeSlot.tradeCount;

          // Get icon based on time of day
          const getTimeIcon = (name: string) => {
            if (name.includes('Morning')) return '🌅';
            if (name.includes('Afternoon')) return '☀️';
            if (name.includes('Evening')) return '🌙';
            return '🕐';
          };

          return (
            <div
              key={timeSlot.name}
              className="text-center p-3 rounded-lg bg-muted dark:bg-gray-700"
            >
              <p className="text-2xl mb-1">{getTimeIcon(timeSlot.displayName)}</p>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                {timeSlot.displayName}
              </p>
              <p
                className={`text-lg font-bold ${
                  timeSlot.totalPnl > 0
                    ? 'profit'
                    : timeSlot.totalPnl < 0
                      ? 'loss'
                      : 'breakeven'
                }`}
              >
                {formatChartCurrency(timeSlot.totalPnl)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {timeSlot.tradeCount} trades
              </p>
              <p className="text-xs text-muted-foreground">
                {timeSlot.winRate.toFixed(0)}% win • Avg: {formatChartCurrency(avgPnl)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Best Time Insight */}
      {displayData.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>💡 Insight:</strong>{' '}
            {(() => {
              const best = [...displayData].sort((a, b) => b.totalPnl - a.totalPnl)[0];
              const worst = [...displayData].sort((a, b) => a.totalPnl - b.totalPnl)[0];

              if (best.totalPnl > 0 && worst.totalPnl < 0) {
                return `You perform best during ${best.displayName.toLowerCase()} (${formatChartCurrency(best.totalPnl)}) and struggle during ${worst.displayName.toLowerCase()} (${formatChartCurrency(worst.totalPnl)}).`;
              } else if (best.totalPnl > 0) {
                return `Your most profitable time is ${best.displayName.toLowerCase()} with ${formatChartCurrency(best.totalPnl)} total P&L.`;
              } else {
                return `Consider analyzing why ${worst.displayName.toLowerCase()} trades are underperforming.`;
              }
            })()}
          </p>
        </div>
      )}
    </div>
  );
}
