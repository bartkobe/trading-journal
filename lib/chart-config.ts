/**
 * Recharts Configuration
 * Common styles, themes, and utilities for charts across the application
 * 
 * This file provides:
 * - Color palettes for profit/loss, chart series, and themed colors
 * - Standard chart dimensions and margins
 * - Reusable chart configurations (tooltip, axis, grid, legend styles)
 * - Formatter functions for currency, percentage, and date values
 * - Utility functions for consistent chart styling
 * 
 * Usage example:
 * ```tsx
 * import { chartColors, formatChartCurrency, chartConfig } from '@/lib/chart-config';
 * import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
 * 
 * <LineChart data={data}>
 *   <CartesianGrid {...chartConfig.grid} />
 *   <XAxis {...chartConfig.axis} />
 *   <YAxis {...chartConfig.axis} tickFormatter={formatChartCurrency} />
 *   <Tooltip {...chartConfig.tooltip} />
 *   <Line dataKey="pnl" stroke={chartColors.profit} />
 * </LineChart>
 * ```
 */

// ============================================================================
// Chart Colors & Theme
// ============================================================================

export const chartColors = {
  // Primary colors for charts
  primary: 'hsl(222.2 47.4% 11.2%)',
  secondary: 'hsl(210 40% 96.1%)',
  
  // P&L colors
  profit: 'hsl(142 76% 36%)', // Green
  loss: 'hsl(0 72% 51%)', // Red
  breakeven: 'hsl(240 6% 50%)', // Gray
  
  // Chart line/area colors
  line: {
    primary: 'hsl(221 83% 53%)', // Blue
    secondary: 'hsl(280 65% 60%)', // Purple
    tertiary: 'hsl(173 58% 39%)', // Teal
    quaternary: 'hsl(25 95% 53%)', // Orange
  },
  
  // Bar chart colors
  bar: {
    positive: 'hsl(142 76% 36%)', // Green
    negative: 'hsl(0 72% 51%)', // Red
    neutral: 'hsl(215 16% 47%)', // Gray
  },
  
  // Gradient stops for area charts
  gradient: {
    profit: {
      start: 'hsl(142 76% 36%)',
      stop: 'hsl(142 76% 36% / 0)',
    },
    loss: {
      start: 'hsl(0 72% 51%)',
      stop: 'hsl(0 72% 51% / 0)',
    },
  },
  
  // Multi-series colors
  series: [
    'hsl(221 83% 53%)', // Blue
    'hsl(280 65% 60%)', // Purple
    'hsl(173 58% 39%)', // Teal
    'hsl(25 95% 53%)', // Orange
    'hsl(142 76% 36%)', // Green
    'hsl(346 77% 50%)', // Pink
    'hsl(48 96% 53%)', // Yellow
    'hsl(262 83% 58%)', // Indigo
  ],
};

// ============================================================================
// Chart Dimensions & Spacing
// ============================================================================

export const chartDimensions = {
  height: {
    small: 200,
    medium: 300,
    large: 400,
    xlarge: 500,
  },
  margin: {
    default: { top: 10, right: 30, left: 0, bottom: 0 },
    withLegend: { top: 10, right: 30, left: 0, bottom: 40 },
    withYAxis: { top: 10, right: 30, left: 50, bottom: 0 },
    full: { top: 10, right: 30, left: 50, bottom: 40 },
  },
};

// ============================================================================
// Common Chart Configurations
// ============================================================================

export const chartConfig = {
  // Tooltip styles
  tooltip: {
    contentStyle: {
      backgroundColor: 'hsl(0 0% 100%)',
      border: '1px solid hsl(214.3 31.8% 91.4%)',
      borderRadius: '6px',
      padding: '12px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    },
    labelStyle: {
      fontWeight: 600,
      marginBottom: '8px',
    },
    itemStyle: {
      padding: '2px 0',
    },
    cursor: {
      stroke: 'hsl(214.3 31.8% 91.4%)',
      strokeWidth: 1,
    },
  },
  
  // Axis styles
  axis: {
    stroke: 'hsl(214.3 31.8% 91.4%)',
    style: {
      fontSize: '12px',
      fill: 'hsl(215.4 16.3% 46.9%)',
    },
  },
  
  // Grid styles
  grid: {
    stroke: 'hsl(214.3 31.8% 91.4%)',
    strokeDasharray: '3 3',
  },
  
  // Legend styles
  legend: {
    iconSize: 12,
    wrapperStyle: {
      fontSize: '14px',
      paddingTop: '20px',
    },
  },
};

// ============================================================================
// Formatter Functions
// ============================================================================

/**
 * Format currency values for chart display
 */
export const formatChartCurrency = (value: number): string => {
  if (value === 0) return '$0';
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
};

/**
 * Format percentage values for chart display
 */
export const formatChartPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

/**
 * Format date for chart display
 */
export const formatChartDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Format month for chart display
 */
export const formatChartMonth = (monthString: string): string => {
  const [year, month] = monthString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

/**
 * Get color based on P&L value
 */
export const getPnlColor = (value: number): string => {
  if (value > 0) return chartColors.profit;
  if (value < 0) return chartColors.loss;
  return chartColors.breakeven;
};

/**
 * Get color from series palette by index
 */
export const getSeriesColor = (index: number): string => {
  return chartColors.series[index % chartColors.series.length];
};

// ============================================================================
// Tooltip Data Types
// ============================================================================

/**
 * Interface for custom tooltip props
 * Use this when creating custom tooltip components
 */
export interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

// ============================================================================
// Chart Utilities
// ============================================================================

/**
 * Get chart height based on size name
 */
export const getChartHeight = (size: 'small' | 'medium' | 'large' | 'xlarge' = 'medium'): number => {
  return chartDimensions.height[size];
};

/**
 * Get chart margin based on needs
 */
export const getChartMargin = (
  type: 'default' | 'withLegend' | 'withYAxis' | 'full' = 'default'
) => {
  return chartDimensions.margin[type];
};

