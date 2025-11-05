'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
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

// ============================================================================
// PnlByAssetType Component
// ============================================================================

export default function PnlByAssetType({
  startDate,
  endDate,
  height = chartDimensions.height.medium,
}: PnlByAssetTypeProps) {
  const tTitles = useTranslations('analytics.chartTitles');
  const tLabels = useTranslations('analytics.chartLabels');
  const tErrors = useTranslations('analytics.chartErrors');
  const tEmpty = useTranslations('analytics.chartEmptyStates');
  const t = useTranslations('analytics');
  const [data, setData] = useState<AssetTypeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div style={chartConfig.tooltip.contentStyle}>
        <p style={chartConfig.tooltip.labelStyle}>{data.name}</p>
        <p style={{ color: getPnlColor(data.totalPnl) }}>
          <strong>{tLabels('totalPnl')}:</strong> {formatChartCurrency(data.totalPnl)}
        </p>
        <p style={{ color: chartColors.bar.neutral }}>
          <strong>{tLabels('trades')}:</strong> {data.tradeCount}
        </p>
        <p style={{ color: chartColors.bar.neutral }}>
          <strong>{tLabels('winRate')}:</strong> {data.winRate.toFixed(1)}%
        </p>
        <p style={{ color: chartColors.bar.neutral }}>
          <strong>{tLabels('avgPnl')}:</strong> {formatChartCurrency(data.totalPnl / data.tradeCount)}
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
        params.append('chartType', 'breakdown');

        const url = `/api/analytics/charts${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(tErrors('failedToFetchAssetTypePerformance'));
        }

        const result = await response.json();
        setData(result.charts.byAssetType || []);
      } catch (err: any) {
        console.error('Error fetching asset type data:', err);
        setError(err.message || tErrors('anErrorOccurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div className="rounded-lg bg-card border border-border p-6" style={{ height: `${height}px` }}>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">{t('loading')}</p>
          </div>
        </div>
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

  if (!data || data.length === 0) {
    return (
      <div
        className="rounded-lg border border-border bg-card p-12 text-center flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        <div>
          <h3 className="text-lg font-semibold text-foreground dark:text-gray-100 mb-2">
            {tEmpty('noAssetTypeData')}
          </h3>
          <p className="text-muted-foreground">
            {tEmpty('startLoggingTradesEquity')}
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
        <h3 className="text-lg font-semibold text-foreground dark:text-gray-100">
          {tTitles('pnlByAssetType')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('byAssetType')}
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
              value: tLabels('totalPnl'),
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
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {sortedData.slice(0, 4).map((asset) => {
          const avgPnl = asset.totalPnl / asset.tradeCount;
          return (
            <div
              key={asset.name}
              className="text-center p-3 rounded-lg bg-muted dark:bg-gray-700"
            >
              <p className="text-xs font-medium text-muted-foreground mb-1">
                {asset.name}
              </p>
              <p
                className={`text-lg font-bold ${
                  asset.totalPnl > 0
                    ? 'profit'
                    : asset.totalPnl < 0
                      ? 'loss'
                      : 'breakeven'
                }`}
              >
                {formatChartCurrency(asset.totalPnl)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {tLabels('tradesWithWinRate', { trades: asset.tradeCount, winRate: asset.winRate.toFixed(0) })}
              </p>
              <p className="text-xs text-muted-foreground">
                {tLabels('avgPnl')}: {formatChartCurrency(avgPnl)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
