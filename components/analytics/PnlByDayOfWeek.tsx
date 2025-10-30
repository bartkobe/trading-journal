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

interface DayOfWeekData {
  name: string;
  totalPnl: number;
  tradeCount: number;
  winRate: number;
}

interface PnlByDayOfWeekProps {
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
// PnlByDayOfWeek Component
// ============================================================================

export default function PnlByDayOfWeek({
  startDate,
  endDate,
  height = chartDimensions.height.large,
}: PnlByDayOfWeekProps) {
  const [data, setData] = useState<DayOfWeekData[]>([]);
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
          throw new Error('Failed to fetch day of week data');
        }

        const result = await response.json();

        // The data is already sorted by day of week in the API
        // (Sunday through Saturday as returned by the API)
        setData(result.charts.byDayOfWeek || []);
      } catch (err: any) {
        console.error('Error fetching day of week data:', err);
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
            Start logging trades across different days of the week.
          </p>
        </div>
      </div>
    );
  }

  // Abbreviate day names for mobile
  const displayData = data.map((item) => ({
    ...item,
    shortName: item.name.substring(0, 3),
  }));

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground dark:text-gray-100">
          P&L by Day of Week
        </h3>
        <p className="text-sm text-muted-foreground">
          Performance across different days of the week
        </p>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={displayData} margin={chartDimensions.margin.full}>
          <CartesianGrid {...chartConfig.grid} />
          <XAxis dataKey="shortName" {...chartConfig.axis} />
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

      {/* Summary Stats Grid */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3">
        {displayData.map((day) => {
          const avgPnl = day.totalPnl / day.tradeCount;

          // Determine if this is a weekend day
          const isWeekend = day.name === 'Saturday' || day.name === 'Sunday';

          return (
            <div
              key={day.name}
              className={`text-center p-3 rounded-lg ${
                isWeekend
                  ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
                  : 'bg-muted dark:bg-gray-700'
              }`}
            >
              <p className="text-xs font-medium text-muted-foreground mb-1">
                {day.shortName}
              </p>
              <p
                className={`text-base font-bold ${
                  day.totalPnl > 0
                    ? 'profit'
                    : day.totalPnl < 0
                      ? 'loss'
                      : 'breakeven'
                }`}
              >
                {formatChartCurrency(day.totalPnl)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {day.tradeCount} trades
              </p>
              <p className="text-xs text-muted-foreground">
                {day.winRate.toFixed(0)}% win
              </p>
              <p className="text-xs text-muted-foreground">
                {formatChartCurrency(avgPnl)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Insights */}
      {displayData.length > 0 && (
        <div className="mt-4 space-y-2">
          {/* Best Day */}
          {(() => {
            const best = [...displayData].sort((a, b) => b.totalPnl - a.totalPnl)[0];
            if (best.totalPnl > 0) {
              return (
                <div className="p-3 rounded-lg profit-bg">
                  <p className="text-sm profit">
                    <strong>🎯 Best Day:</strong> {best.name} with{' '}
                    {formatChartCurrency(best.totalPnl)} ({best.tradeCount} trades,{' '}
                    {best.winRate.toFixed(0)}% win rate)
                  </p>
                </div>
              );
            }
            return null;
          })()}

          {/* Worst Day */}
          {(() => {
            const worst = [...displayData].sort((a, b) => a.totalPnl - b.totalPnl)[0];
            if (worst.totalPnl < 0) {
              return (
                <div className="p-3 rounded-lg loss-bg">
                  <p className="text-sm loss">
                    <strong>⚠️ Worst Day:</strong> {worst.name} with{' '}
                    {formatChartCurrency(worst.totalPnl)} ({worst.tradeCount} trades,{' '}
                    {worst.winRate.toFixed(0)}% win rate)
                  </p>
                </div>
              );
            }
            return null;
          })()}

          {/* Weekday vs Weekend Analysis */}
          {(() => {
            const weekdays = displayData.filter(
              (d) => d.name !== 'Saturday' && d.name !== 'Sunday'
            );
            const weekends = displayData.filter(
              (d) => d.name === 'Saturday' || d.name === 'Sunday'
            );

            if (weekdays.length > 0 && weekends.length > 0) {
              const weekdayPnl = weekdays.reduce((sum, d) => sum + d.totalPnl, 0);
              const weekendPnl = weekends.reduce((sum, d) => sum + d.totalPnl, 0);
              const weekdayTrades = weekdays.reduce((sum, d) => sum + d.tradeCount, 0);
              const weekendTrades = weekends.reduce((sum, d) => sum + d.tradeCount, 0);

              const weekdayAvg = weekdayTrades > 0 ? weekdayPnl / weekdayTrades : 0;
              const weekendAvg = weekendTrades > 0 ? weekendPnl / weekendTrades : 0;

              return (
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>📊 Weekday vs Weekend:</strong> Weekdays:{' '}
                    {formatChartCurrency(weekdayAvg)} avg/trade ({weekdayTrades} trades) • Weekends:{' '}
                    {formatChartCurrency(weekendAvg)} avg/trade ({weekendTrades} trades)
                  </p>
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}
    </div>
  );
}
