'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { chartColors, chartConfig, chartDimensions, formatChartCurrency } from '@/lib/chart-config';

// ============================================================================
// Types
// ============================================================================

interface DistributionData {
  wins: number;
  losses: number;
  breakeven: number;
  winRate: number;
  lossRate: number;
  breakevenRate: number;
}

interface PnlDistributionData {
  range: string;
  count: number;
}

interface WinLossDistributionProps {
  startDate?: string;
  endDate?: string;
  height?: number;
  showPnlHistogram?: boolean;
}

// ============================================================================
// Custom Tooltips
// ============================================================================

// ============================================================================
// WinLossDistribution Component
// ============================================================================

export default function WinLossDistribution({
  startDate,
  endDate,
  height = chartDimensions.height.medium,
  showPnlHistogram = true,
}: WinLossDistributionProps) {
  const tTitles = useTranslations('analytics.chartTitles');
  const tLabels = useTranslations('analytics.chartLabels');
  const tErrors = useTranslations('analytics.chartErrors');
  const tEmpty = useTranslations('analytics.chartEmptyStates');
  const t = useTranslations('analytics');
  const [distribution, setDistribution] = useState<DistributionData | null>(null);
  const [pnlDistribution, setPnlDistribution] = useState<PnlDistributionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const PieTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0];

    return (
      <div style={chartConfig.tooltip.contentStyle}>
        <p style={chartConfig.tooltip.labelStyle}>{data.name}</p>
        <p style={{ color: data.payload.fill }}>
          <strong>{t('count')}:</strong> {data.value}
        </p>
        <p style={{ color: data.payload.fill }}>
          <strong>{t('percentage')}:</strong> {data.payload.percentage.toFixed(1)}%
        </p>
      </div>
    );
  };

  const BarTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0];

    return (
      <div style={chartConfig.tooltip.contentStyle}>
        <p style={chartConfig.tooltip.labelStyle}>{data.payload.range}</p>
        <p style={{ color: data.fill }}>
          <strong>{tLabels('trades')}:</strong> {data.value}
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
        params.append('chartType', 'distribution');

        const url = `/api/analytics/charts${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(tErrors('failedToFetchWinLossDistribution'));
        }

        const result = await response.json();
        setDistribution(result.charts.distribution);
        setPnlDistribution(result.charts.pnlDistribution);
      } catch (err: any) {
        console.error('Error fetching distribution data:', err);
        setError(err.message || tErrors('anErrorOccurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div
          className="rounded-lg bg-card border border-border p-6 flex items-center justify-center"
          style={{ height: `${height}px` }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">{t('loading')}</p>
          </div>
        </div>
        {showPnlHistogram && (
          <div
            className="rounded-lg bg-card border border-border p-6 flex items-center justify-center"
            style={{ height: `${height}px` }}
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">{t('loading')}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-danger loss-bg p-6">
        <h3 className="text-lg font-semibold loss mb-2">
          {tErrors('anErrorOccurred')}
        </h3>
        <p className="loss">{error}</p>
      </div>
    );
  }

  if (!distribution) {
    return (
      <div
        className="rounded-lg border border-border bg-card p-12 text-center flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        <div>
          <h3 className="text-lg font-semibold text-foreground dark:text-gray-100 mb-2">
            {tEmpty('noWinLossData')}
          </h3>
          <p className="text-muted-foreground">
            {tEmpty('startLoggingTradesEquity')}
          </p>
        </div>
      </div>
    );
  }

  // Prepare pie chart data
  const pieData = [
    {
      name: tLabels('wins'),
      value: distribution.wins,
      percentage: distribution.winRate,
      fill: chartColors.profit,
    },
    {
      name: tLabels('losses'),
      value: distribution.losses,
      percentage: distribution.lossRate,
      fill: chartColors.loss,
    },
  ];

  // Include breakeven if there are any
  if (distribution.breakeven > 0) {
    pieData.push({
      name: t('breakeven'),
      value: distribution.breakeven,
      percentage: distribution.breakevenRate,
      fill: chartColors.breakeven,
    });
  }

  // Get bar colors based on range
  const getBarColor = (range: string): string => {
    if (range.includes('Win')) return chartColors.profit;
    if (range.includes('Loss')) return chartColors.loss;
    return chartColors.breakeven;
  };

  return (
    <div className="space-y-6">
      {/* Win/Loss Pie Chart */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground dark:text-gray-100">
            {tTitles('winLossDistribution')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {distribution.wins + distribution.losses + distribution.breakeven} {t('totalTrades')}
          </p>
        </div>

        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }: any) => `${name}: ${percentage.toFixed(1)}%`}
              outerRadius={height / 3}
              fill="#8884d8"
              dataKey="value"
              animationDuration={1000}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
            <Legend {...chartConfig.legend} />
          </PieChart>
        </ResponsiveContainer>

        {/* Stats Summary */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold profit">
              {distribution.wins}
            </p>
            <p className="text-sm text-muted-foreground">{tLabels('wins')}</p>
          </div>
          <div>
            <p className="text-2xl font-bold loss">
              {distribution.losses}
            </p>
            <p className="text-sm text-muted-foreground">{tLabels('losses')}</p>
          </div>
          {distribution.breakeven > 0 && (
            <div>
              <p className="text-2xl font-bold text-muted-foreground">
                {distribution.breakeven}
              </p>
              <p className="text-sm text-muted-foreground">{t('breakeven')}</p>
            </div>
          )}
        </div>
      </div>

      {/* P&L Distribution Histogram */}
      {showPnlHistogram && pnlDistribution.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground dark:text-gray-100">
              {tLabels('pnl')} {t('distribution')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('tradeCountByPnlRange')}
            </p>
          </div>

          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={pnlDistribution} margin={chartDimensions.margin.full}>
              <CartesianGrid {...chartConfig.grid} />
              <XAxis
                dataKey="range"
                angle={-45}
                textAnchor="end"
                height={100}
                {...chartConfig.axis}
              />
              <YAxis
                label={{
                  value: t('numberOfTrades'),
                  angle: -90,
                  position: 'insideLeft',
                }}
                {...chartConfig.axis}
              />
              <Tooltip content={<BarTooltip />} />
              <Bar dataKey="count" animationDuration={1000}>
                {pnlDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.range)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
