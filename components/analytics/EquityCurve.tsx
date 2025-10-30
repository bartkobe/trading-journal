'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from 'recharts';
import {
  chartColors,
  chartConfig,
  formatChartCurrency,
  formatChartDate,
  chartDimensions,
} from '@/lib/chart-config';
import { ChartSkeleton } from '@/components/ui/ChartSkeleton';

// ============================================================================
// Types
// ============================================================================

interface EquityCurvePoint {
  date: Date;
  cumulativePnl: number;
  tradeNumber: number;
}

interface EquityCurveProps {
  startDate?: string;
  endDate?: string;
  height?: number;
  showArea?: boolean;
}

// ============================================================================
// Custom Tooltip
// ============================================================================

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div style={chartConfig.tooltip.contentStyle}>
      <p style={chartConfig.tooltip.labelStyle}>{formatChartDate(data.date)}</p>
      <p style={{ color: chartColors.line.primary }}>
        <strong>Cumulative P&L:</strong> {formatChartCurrency(data.cumulativePnl)}
      </p>
      <p style={{ color: chartColors.bar.neutral, fontSize: '12px' }}>Trade #{data.tradeNumber}</p>
    </div>
  );
};

// ============================================================================
// EquityCurve Component
// ============================================================================

export default function EquityCurve({
  startDate,
  endDate,
  height = chartDimensions.height.large,
  showArea = true,
}: EquityCurveProps) {
  const [data, setData] = useState<EquityCurvePoint[]>([]);
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
        params.append('chartType', 'equity');

        const url = `/api/analytics/charts${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await fetch(url);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch equity curve data (${response.status})`);
        }

        const result = await response.json();

        // Transform the data - convert date strings to Date objects
        const equityCurve = result.charts.equityCurve.map((point: any) => ({
          ...point,
          date: new Date(point.date),
        }));

        setData(equityCurve);
      } catch (err: any) {
        console.error('Error fetching equity curve:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  if (loading) {
    return <ChartSkeleton height={height} />;
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
            Start logging trades to see your equity curve.
          </p>
        </div>
      </div>
    );
  }

  // Determine if the overall curve is positive or negative
  const finalPnl = data[data.length - 1]?.cumulativePnl || 0;
  const lineColor = finalPnl >= 0 ? chartColors.profit : chartColors.loss;
  const areaGradientId = finalPnl >= 0 ? 'colorProfit' : 'colorLoss';

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground dark:text-gray-100">Equity Curve</h3>
        <p className="text-sm text-muted-foreground">
          Cumulative P&L over time ({data.length} trades)
        </p>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        {showArea ? (
          <AreaChart data={data} margin={chartDimensions.margin.full}>
            <defs>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.profit} stopOpacity={0.3} />
                <stop offset="95%" stopColor={chartColors.profit} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.loss} stopOpacity={0.3} />
                <stop offset="95%" stopColor={chartColors.loss} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...chartConfig.grid} />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => formatChartDate(date)}
              {...chartConfig.axis}
            />
            <YAxis tickFormatter={(value) => formatChartCurrency(value)} {...chartConfig.axis} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={0}
              stroke={chartColors.breakeven}
              strokeDasharray="3 3"
              label={{ value: 'Break Even', position: 'right', fill: chartColors.breakeven }}
            />
            <Area
              type="monotone"
              dataKey="cumulativePnl"
              stroke={lineColor}
              strokeWidth={2}
              fill={`url(#${areaGradientId})`}
              animationDuration={1000}
            />
          </AreaChart>
        ) : (
          <LineChart data={data} margin={chartDimensions.margin.full}>
            <CartesianGrid {...chartConfig.grid} />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => formatChartDate(date)}
              {...chartConfig.axis}
            />
            <YAxis tickFormatter={(value) => formatChartCurrency(value)} {...chartConfig.axis} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={0}
              stroke={chartColors.breakeven}
              strokeDasharray="3 3"
              label={{ value: 'Break Even', position: 'right', fill: chartColors.breakeven }}
            />
            <Line
              type="monotone"
              dataKey="cumulativePnl"
              stroke={lineColor}
              strokeWidth={2}
              dot={{ fill: lineColor, r: 3 }}
              activeDot={{ r: 5 }}
              animationDuration={1000}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
