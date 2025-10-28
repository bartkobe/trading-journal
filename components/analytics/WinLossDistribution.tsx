'use client';

import { useEffect, useState } from 'react';
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
import {
  chartColors,
  chartConfig,
  chartDimensions,
  formatChartCurrency,
} from '@/lib/chart-config';

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

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];

  return (
    <div style={chartConfig.tooltip.contentStyle}>
      <p style={chartConfig.tooltip.labelStyle}>{data.name}</p>
      <p style={{ color: data.payload.fill }}>
        <strong>Count:</strong> {data.value}
      </p>
      <p style={{ color: data.payload.fill }}>
        <strong>Percentage:</strong> {data.payload.percentage.toFixed(1)}%
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
        <strong>Trades:</strong> {data.value}
      </p>
    </div>
  );
};

// ============================================================================
// WinLossDistribution Component
// ============================================================================

export default function WinLossDistribution({
  startDate,
  endDate,
  height = chartDimensions.height.medium,
  showPnlHistogram = true,
}: WinLossDistributionProps) {
  const [distribution, setDistribution] = useState<DistributionData | null>(
    null
  );
  const [pnlDistribution, setPnlDistribution] = useState<
    PnlDistributionData[]
  >([]);
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
        params.append('chartType', 'distribution');

        const url = `/api/analytics/charts${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch distribution data');
        }

        const result = await response.json();
        setDistribution(result.charts.distribution);
        setPnlDistribution(result.charts.pnlDistribution);
      } catch (err: any) {
        console.error('Error fetching distribution data:', err);
        setError(err.message || 'An error occurred');
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
          className="rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"
          style={{ height: `${height}px` }}
        />
        {showPnlHistogram && (
          <div
            className="rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"
            style={{ height: `${height}px` }}
          />
        )}
      </div>
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

  if (!distribution) {
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
            Start logging trades to see distribution charts.
          </p>
        </div>
      </div>
    );
  }

  // Prepare pie chart data
  const pieData = [
    {
      name: 'Wins',
      value: distribution.wins,
      percentage: distribution.winRate,
      fill: chartColors.profit,
    },
    {
      name: 'Losses',
      value: distribution.losses,
      percentage: distribution.lossRate,
      fill: chartColors.loss,
    },
  ];

  // Include breakeven if there are any
  if (distribution.breakeven > 0) {
    pieData.push({
      name: 'Breakeven',
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
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Win/Loss Distribution
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {distribution.wins + distribution.losses + distribution.breakeven}{' '}
            total trades
          </p>
        </div>

        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }: any) =>
                `${name}: ${percentage.toFixed(1)}%`
              }
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
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {distribution.wins}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Wins</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {distribution.losses}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Losses</p>
          </div>
          {distribution.breakeven > 0 && (
            <div>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {distribution.breakeven}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Breakeven
              </p>
            </div>
          )}
        </div>
      </div>

      {/* P&L Distribution Histogram */}
      {showPnlHistogram && pnlDistribution.length > 0 && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              P&L Distribution
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Trade count by profit/loss range
            </p>
          </div>

          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={pnlDistribution}
              margin={chartDimensions.margin.full}
            >
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
                  value: 'Number of Trades',
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

