'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
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
  const tTitles = useTranslations('analytics.chartTitles');
  const tLabels = useTranslations('analytics.chartLabels');
  const tErrors = useTranslations('analytics.chartErrors');
  const tEmpty = useTranslations('analytics.chartEmptyStates');
  const t = useTranslations('analytics');
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
          throw new Error(tErrors('failedToFetchSetupTypePerformance'));
        }

        const result = await response.json();

        // Sort by total P&L
        const sorted = (result.performance?.bySetupType || []).sort(
          (a: SetupTypePerformance, b: SetupTypePerformance) => b.totalPnl - a.totalPnl
        );

        setData(sorted);
      } catch (err: any) {
        console.error('Error fetching setup type performance:', err);
        setError(err.message || tErrors('anErrorOccurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground dark:text-gray-100 mb-4">
          {tTitles('pnlBySetupType')}
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">{t('loading')}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground dark:text-gray-100 mb-4">
          {tTitles('pnlBySetupType')}
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="loss">{tErrors('anErrorOccurred')}: {error}</div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground dark:text-gray-100 mb-4">
          {tTitles('pnlBySetupType')}
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">{tEmpty('noSetupTypeData')}</div>
        </div>
      </div>
    );
  }

  const topSetup = data[0];
  const totalTrades = data.reduce((sum, item) => sum + item.trades, 0);
  const mostUsedSetup = [...data].sort((a, b) => b.trades - a.trades)[0];

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground dark:text-gray-100 mb-4">
        {tTitles('pnlBySetupType')}
      </h3>

      {/* Chart */}
      <div className="mb-6" style={{ minHeight: '320px' }}>
        <ResponsiveContainer width="100%" height={320}>
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
        <div className="profit-bg rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">{tLabels('bestPerformer')}</span>
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-lg font-bold text-foreground dark:text-gray-100">{topSetup.setupType}</p>
          <p className="text-sm profit font-semibold">
            {formatChartCurrency(topSetup.totalPnl)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {(topSetup.winRate ?? 0).toFixed(1)}% {tLabels('winRate')}
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">{t('mostUsed')}</span>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-lg font-bold text-foreground dark:text-gray-100">
            {mostUsedSetup.setupType}
          </p>
          <p className="text-sm text-muted-foreground">
            {mostUsedSetup.trades} {tLabels('trades')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {((mostUsedSetup.trades / totalTrades) * 100).toFixed(1)}% {t('ofAllTrades')}
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              {t('totalSetups')}
            </span>
            <span className="text-2xl">🎯</span>
          </div>
          <p className="text-lg font-bold text-foreground dark:text-gray-100">{data.length}</p>
          <p className="text-sm text-muted-foreground">{t('differentSetups')}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {totalTrades} {t('totalTrades')}
          </p>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-foreground">
          <span className="font-semibold">{tLabels('insight')}:</span> {t('mostProfitableSetupInsight', {
            setup: topSetup.setupType,
            pnl: formatChartCurrency(topSetup.totalPnl),
            winRate: (topSetup.winRate ?? 0).toFixed(1)
          })}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Custom Tooltip
// ============================================================================

function CustomTooltip({ active, payload }: any) {
  const tLabels = useTranslations('analytics.chartLabels');
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload as SetupTypePerformance;

  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3">
      <p className="font-semibold text-foreground dark:text-gray-100 mb-2">{data.setupType}</p>
      <div className="space-y-1 text-sm">
        <p className="text-foreground">
          <span className="font-medium">{tLabels('totalPnl')}:</span>{' '}
          <span
            className={
              data.totalPnl >= 0
                ? 'profit font-semibold'
                : 'loss font-semibold'
            }
          >
            {formatChartCurrency(data.totalPnl)}
          </span>
        </p>
        <p className="text-foreground">
          <span className="font-medium">{tLabels('trades')}:</span> {data.trades}
        </p>
        <p className="text-foreground">
          <span className="font-medium">{tLabels('winRate')}:</span> {(data.winRate ?? 0).toFixed(1)}%
        </p>
        <p className="text-foreground">
          <span className="font-medium">{tLabels('avgPnl')}:</span> {formatChartCurrency(data.avgPnl ?? 0)}
        </p>
      </div>
    </div>
  );
}
