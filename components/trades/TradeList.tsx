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
    if (trade.calculations.isWinner) return 'text-green-600 dark:text-green-400';
    if (trade.calculations.isLoser) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getOutcomeIcon = (trade: TradeWithCalculations) => {
    if (trade.calculations.isWinner) {
      return (
        <svg
          className="w-5 h-5 text-green-600"
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
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    );
  };

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <p className="text-red-700 dark:text-red-400">{error}</p>
        <button
          onClick={fetchTrades}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600 dark:text-gray-400">Loading trades...</p>
        </div>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No trades found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {filters ? 'Try adjusting your filters.' : 'Get started by recording your first trade.'}
          </p>
          {!filters && (
            <div className="mt-6">
              <Link
                href="/trades/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
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
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Direction
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Entry
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Exit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  P&L
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Return
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Result
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {trades.map((trade) => (
                <tr
                  key={trade.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onClick={() => (window.location.href = `/trades/${trade.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {trade.symbol.toUpperCase()}
                        </div>
                        {trade.strategyName && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {trade.strategyName}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {formatDate(trade.entryDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {trade.assetType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        trade.direction === 'LONG'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {trade.direction}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-300">
                    {formatCurrency(trade.entryPrice, trade.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-300">
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
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : trade.calculations.isLoser
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}
          >
            {/* Header Row */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {trade.symbol.toUpperCase()}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(trade.entryDate)}
                </p>
                {trade.strategyName && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Strategy: {trade.strategyName}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {getOutcomeIcon(trade)}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    trade.direction === 'LONG'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {trade.direction}
                </span>
              </div>
            </div>

            {/* Prices Row */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Entry</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {formatCurrency(trade.entryPrice, trade.currency)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Exit</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {trade.exitPrice ? formatCurrency(trade.exitPrice, trade.currency) : 'Open'}
                </p>
              </div>
            </div>

            {/* P&L Row */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">P&L</p>
                <p className={`text-xl font-bold ${getOutcomeColor(trade)}`}>
                  {formatCurrency(trade.calculations.netPnl, trade.currency)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Return</p>
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
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {trades.length} of {total} trades
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
