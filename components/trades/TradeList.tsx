'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TradeWithCalculations } from '@/lib/types';
import { formatCurrency, formatPercent, formatDate, isTradeOpen } from '@/lib/trades';
import { TradeCard } from './TradeCard';
import { ErrorMessage, EmptyState } from '@/components/ui/ErrorMessage';

interface TradeListProps {
  filters?: {
    startDate?: string;
    endDate?: string;
    assetType?: string;
    search?: string;
    strategyName?: string;
    symbol?: string;
    tags?: string[];
    outcome?: string;
    status?: string;
    sortBy?: 'date' | 'pnl' | 'pnlPercent' | 'symbol';
    sortOrder?: 'asc' | 'desc';
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  initialTrades?: TradeWithCalculations[];
}

export function TradeList({ filters, sortBy, initialTrades }: TradeListProps) {
  const [trades, setTrades] = useState<TradeWithCalculations[]>(initialTrades || []);
  const [isLoading, setIsLoading] = useState(!initialTrades);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchTrades = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Build query params
      const params = new URLSearchParams();
      const limit = 20;
      const offset = (page - 1) * limit;
      params.set('limit', String(limit));
      params.set('offset', String(offset));

      if (sortBy) params.set('sortBy', sortBy);
      if (filters?.sortBy) params.set('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.set('sortOrder', filters.sortOrder);
      if (filters?.startDate) params.set('startDate', filters.startDate);
      if (filters?.endDate) params.set('endDate', filters.endDate);
      if (filters?.assetType) params.set('assetType', filters.assetType);
      if (filters?.search) params.set('search', filters.search);
      if (filters?.symbol) params.set('symbol', filters.symbol);
      if (filters?.strategyName) params.set('strategyName', filters.strategyName);
      if (filters?.outcome) params.set('outcome', filters.outcome);
      if (filters?.status) params.set('status', filters.status);
      if (filters?.tags && filters.tags.length > 0) {
        params.set('tags', filters.tags.join(','));
      }

      const response = await fetch(`/api/trades?${params.toString()}`);

      if (!response.ok) {
        const result = await response.json();
        if (response.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else if (response.status === 500) {
          setError('Server error while loading trades. Our team has been notified. Please try again in a moment.');
        } else {
          setError(result.error || 'Failed to load trades. Please try again.');
        }
        return;
      }

      const result = await response.json();
      setTrades(result.trades);
      setTotal(result.total);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Fetch trades error:', err);
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        setError('An unexpected error occurred while loading trades. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialTrades) {
      fetchTrades();
    }
  }, [filters, sortBy, page]);

  const getOutcomeColor = (trade: TradeWithCalculations) => {
    if (isTradeOpen(trade)) return 'text-foreground';
    if (trade.calculations.isWinner) return 'profit';
    if (trade.calculations.isLoser) return 'loss';
    return 'breakeven';
  };

  const getOutcomeIcon = (trade: TradeWithCalculations) => {
    if (isTradeOpen(trade)) return null;
    if (trade.calculations.isWinner) {
      return (
        <svg
          className="w-5 h-5 profit"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    }
    if (trade.calculations.isLoser) {
      return (
        <svg className="w-5 h-5 loss" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 breakeven" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    );
  };

  if (error) {
    return (
      <ErrorMessage
        title="Failed to Load Trades"
        message={error}
        onRetry={fetchTrades}
        retryText="Reload Trades"
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Desktop Table Skeleton */}
        <div className="hidden md:block bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  {['Symbol', 'Date', 'Asset', 'Direction', 'Entry', 'Exit', 'P&L', '%', 'Outcome'].map((header) => (
                    <th key={header} className="px-6 py-3">
                      <div className="h-4 bg-muted-foreground/20 rounded animate-pulse" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(9)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-muted rounded animate-pulse" style={{ width: '80%' }} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card Skeleton */}
        <div className="md:hidden space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg border border-border p-4">
              <div className="space-y-3">
                <div className="h-6 bg-muted rounded animate-pulse w-1/3" />
                <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="bg-card rounded-lg shadow-sm border border-border">
        <EmptyState
          icon={filters ? 'search' : 'data'}
          title="No trades found"
          message={
            filters
              ? 'No trades match your current filters. Try adjusting your date range, asset type, or other criteria.'
              : 'You haven\'t recorded any trades yet. Start building your trading journal by recording your first trade.'
          }
          action={
            !filters
              ? {
                  label: 'Record First Trade',
                  onClick: () => {
                    window.location.assign('/trades/new');
                  },
                }
              : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Desktop Table View */}
      <div className="hidden md:block bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Direction
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Entry
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Exit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  P&L
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Return
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Result
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {trades.map((trade) => (
                <tr
                  key={trade.id}
                  className="hover:bg-muted dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onClick={() => (window.location.href = `/trades/${trade.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {trade.symbol.toUpperCase()}
                        </div>
                        {trade.strategyName && (
                          <div className="text-xs text-muted-foreground">
                            {trade.strategyName}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {formatDate(trade.entryDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {trade.assetType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        trade.direction === 'LONG' ? 'profit-bg' : 'loss-bg'
                      }`}
                    >
                      {trade.direction}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-foreground">
                    {formatCurrency(trade.entryPrice, trade.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-foreground">
                    {isTradeOpen(trade) ? (
                      <span className="text-blue-600 dark:text-blue-400">In Progress</span>
                    ) : trade.exitPrice ? (
                      formatCurrency(trade.exitPrice, trade.currency)
                    ) : (
                      '-'
                    )}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${getOutcomeColor(trade)}`}
                  >
                    {formatCurrency(trade.calculations.netPnl, trade.currency)}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${getOutcomeColor(trade)}`}
                  >
                    {formatPercent(trade.calculations.pnlPercent)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {getOutcomeIcon(trade) || (isTradeOpen(trade) && <span className="text-blue-600 dark:text-blue-400 text-xs">Open</span>)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {trades.map((trade) => (
          <Link
            key={trade.id}
            href={`/trades/${trade.id}`}
            className={`block rounded-lg border p-4 hover:shadow-md transition-shadow ${
              isTradeOpen(trade)
                ? 'bg-card border-blue-300 dark:border-blue-700'
                : trade.calculations.isWinner
                  ? 'profit-bg border-success'
                  : trade.calculations.isLoser
                    ? 'loss-bg border-danger'
                    : 'bg-card border-border'
            }`}
          >
            {/* Header Row */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {trade.symbol.toUpperCase()}
                  </h3>
                  {isTradeOpen(trade) && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      OPEN
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDate(trade.entryDate)}
                </p>
                {trade.strategyName && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Strategy: {trade.strategyName}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {getOutcomeIcon(trade)}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    trade.direction === 'LONG' ? 'profit-bg' : 'loss-bg'
                  }`}
                >
                  {trade.direction}
                </span>
              </div>
            </div>

            {/* Prices Row */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Entry</p>
                <p className="text-base font-medium text-foreground">
                  {formatCurrency(trade.entryPrice, trade.currency)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">Exit</p>
                {isTradeOpen(trade) ? (
                  <>
                    <p className="text-base font-medium text-blue-600 dark:text-blue-400">
                      In Progress
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Not yet closed</p>
                  </>
                ) : (
                  <p className="text-base font-medium text-foreground">
                    {trade.exitPrice ? formatCurrency(trade.exitPrice, trade.currency) : 'Open'}
                  </p>
                )}
              </div>
            </div>

            {/* P&L Row */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">P&L</p>
                <p className={`text-xl font-bold ${getOutcomeColor(trade)}`}>
                  {formatCurrency(trade.calculations.netPnl, trade.currency)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">Return</p>
                <p className={`text-xl font-bold ${getOutcomeColor(trade)}`}>
                  {formatPercent(trade.calculations.pnlPercent)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {trades.length} of {total} trades
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 border border-border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-card text-foreground hover:bg-muted dark:hover:bg-gray-700 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore}
            className="px-3 py-2 border border-border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-card text-foreground hover:bg-muted dark:hover:bg-gray-700 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
