'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TradeWithCalculations } from '@/lib/types';
import { formatCurrency, formatPercent, formatDate } from '@/lib/trades';
import { TradeCard } from './TradeCard';

interface TradeListProps {
  filters?: {
    startDate?: string;
    endDate?: string;
    assetType?: string;
    symbol?: string;
    strategy?: string;
    tags?: string[];
    outcome?: string;
  };
  sortBy?: string;
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
      params.set('page', page.toString());
      params.set('limit', '20');

      if (sortBy) params.set('sortBy', sortBy);
      if (filters?.startDate) params.set('startDate', filters.startDate);
      if (filters?.endDate) params.set('endDate', filters.endDate);
      if (filters?.assetType) params.set('assetType', filters.assetType);
      if (filters?.symbol) params.set('symbol', filters.symbol);
      if (filters?.strategy) params.set('strategy', filters.strategy);
      if (filters?.outcome) params.set('outcome', filters.outcome);
      if (filters?.tags && filters.tags.length > 0) {
        params.set('tags', filters.tags.join(','));
      }

      const response = await fetch(`/api/trades?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to fetch trades');
        return;
      }

      setTrades(result.trades);
      setTotal(result.total);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Fetch trades error:', err);
      setError('An unexpected error occurred');
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
    if (trade.calculations.isWinner) return 'profit';
    if (trade.calculations.isLoser) return 'loss';
    return 'breakeven';
  };

  const getOutcomeIcon = (trade: TradeWithCalculations) => {
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
      <div className="loss-bg border border-danger rounded-lg p-6 text-center">
        <p className="loss">{error}</p>
        <button
          onClick={fetchTrades}
          className="mt-4 px-4 py-2 bg-danger hover:bg-danger-dark text-danger-foreground rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg shadow-sm border border-border p-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="ml-4 text-muted-foreground">Loading trades...</p>
        </div>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="bg-card rounded-lg shadow-sm border border-border">
        <div className="px-6 py-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-foreground">
            No trades found
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {filters ? 'Try adjusting your filters.' : 'Get started by recording your first trade.'}
          </p>
          {!filters && (
            <div className="mt-6">
              <Link
                href="/trades/new"
                className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground font-medium rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Record First Trade
              </Link>
            </div>
          )}
        </div>
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
                    {trade.exitPrice ? formatCurrency(trade.exitPrice, trade.currency) : '-'}
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
                    {getOutcomeIcon(trade)}
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
              trade.calculations.isWinner
                ? 'profit-bg border-success'
                : trade.calculations.isLoser
                  ? 'loss-bg border-danger'
                  : 'bg-card border-border'
            }`}
          >
            {/* Header Row */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {trade.symbol.toUpperCase()}
                </h3>
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
                <p className="text-base font-medium text-foreground">
                  {trade.exitPrice ? formatCurrency(trade.exitPrice, trade.currency) : 'Open'}
                </p>
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
