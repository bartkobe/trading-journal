'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
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
import { ErrorMessage, EmptyState } from '@/components/ui/ErrorMessage';
import { Link } from '@/i18n/routing';

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

// ============================================================================
// EquityCurve Component
// ============================================================================

export default function EquityCurve({
  startDate,
  endDate,
  height = chartDimensions.height.large,
  showArea = true,
}: EquityCurveProps) {
  const t = useTranslations('analytics');
  const tTitles = useTranslations('analytics.chartTitles');
  const tLabels = useTranslations('analytics.chartLabels');
  const tErrors = useTranslations('analytics.chartErrors');
  const tEmpty = useTranslations('analytics.chartEmptyStates');
  const [data, setData] = useState<EquityCurvePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div style={chartConfig.tooltip.contentStyle}>
        <p style={chartConfig.tooltip.labelStyle}>{formatChartDate(data.date)}</p>
        <p style={{ color: chartColors.line.primary }}>
          <strong>{tLabels('cumulativePnl')}:</strong> {formatChartCurrency(data.cumulativePnl)}
        </p>
        <p style={{ color: chartColors.bar.neutral, fontSize: '12px' }}>
          {tLabels('tradeNumber', { number: data.tradeNumber })}
        </p>
      </div>
    );
  };

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
          if (response.status === 401) {
            throw new Error(tErrors('sessionExpired'));
          } else if (response.status === 500) {
            throw new Error(tErrors('serverErrorLoadChart'));
          } else {
            throw new Error(errorData.error || tErrors('unableToLoadEquityCurve', { status: response.status }));
          }
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
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          setError(tErrors('unableToConnect'));
        } else {
          setError(err.message || tErrors('unexpectedErrorEquityCurve'));
        }
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
      <div className="rounded-lg border border-border bg-card p-6">
        <ErrorMessage
          title={tErrors('failedToLoadEquityCurve')}
          message={error}
          onRetry={() => {
            setLoading(true);
            setError(null);
            // Trigger re-fetch by changing state
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
                  throw new Error(errorData.error || tErrors('unableToLoadEquityCurve', { status: response.status }));
                }
                const result = await response.json();
                const equityCurve = result.charts.equityCurve.map((point: any) => ({
                  ...point,
                  date: new Date(point.date),
                }));
                setData(equityCurve);
              } catch (err: any) {
                setError(err.message || tErrors('unexpectedErrorEquityCurve'));
              } finally {
                setLoading(false);
              }
            };
            fetchData();
          }}
          retryText={tErrors('reloadChart')}
        />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <EmptyState
          icon="data"
          title={tEmpty('noTradeData')}
          message={tEmpty('startLoggingTradesEquity')}
          action={{
            label: tEmpty('recordFirstTrade'),
            onClick: () => (window.location.href = '/trades/new'),
          }}
          className="py-12"
        />
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
        <h3 className="text-lg font-semibold text-foreground dark:text-gray-100">{tTitles('equityCurve')}</h3>
        <p className="text-sm text-muted-foreground">
          {tTitles('equityCurveSubtitle', { count: data.length })}
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
              label={{ value: tLabels('breakEven'), position: 'right', fill: chartColors.breakeven }}
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
              label={{ value: tLabels('breakEven'), position: 'right', fill: chartColors.breakeven }}
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
