'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TradeWithCalculations } from '@/lib/types';
import { formatCurrency, formatDate, isTradeOpen } from '@/lib/trades';
import { TradeStatusBadge } from './TradeStatusBadge';
import { ErrorMessage, EmptyState } from '@/components/ui/ErrorMessage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function OpenTradesSection() {
  const router = useRouter();
  const [openTrades, setOpenTrades] = useState<TradeWithCalculations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchOpenTrades = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Fetch only open trades using status filter
        const response = await fetch('/api/trades?status=open&limit=10&sortBy=date&sortOrder=desc');

        if (!response.ok) {
          const result = await response.json();
          if (response.status === 401) {
            setError('Your session has expired. Please log in again.');
          } else {
            setError(result.error || 'Failed to load open trades.');
          }
          return;
        }

        const result = await response.json();
        setOpenTrades(result.trades || []);
      } catch (err) {
        console.error('Fetch open trades error:', err);
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          setError('Unable to connect to the server. Please check your internet connection and try again.');
        } else {
          setError('An unexpected error occurred while loading open trades. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpenTrades();
  }, []);

  if (error) {
    return (
      <ErrorMessage
        title="Failed to Load Open Trades"
        message={error}
        onRetry={() => window.location.reload()}
        retryText="Reload"
      />
    );
  }

  if (isLoading) {
    return (
      <section className="bg-card rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-card rounded-xl shadow-sm border border-border p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Open Trades</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {openTrades.length === 0
                ? 'No open trades'
                : `${openTrades.length} ${openTrades.length === 1 ? 'trade' : 'trades'} currently open`}
            </p>
          </div>
          {openTrades.length > 0 && (
            <Link
              href="/trades?status=open"
              className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
            >
              View All →
            </Link>
          )}
        </div>
      </div>

      {openTrades.length === 0 ? (
        <EmptyState
          icon="data"
          title="No Open Trades"
          message="You don't have any open trades at the moment. Start a new trade to track your active positions."
          action={{
            label: 'Log New Trade',
            onClick: () => (window.location.href = '/trades/new'),
          }}
        />
      ) : (
        <div className="space-y-4">
          {openTrades.map((trade) => (
            <div
              key={trade.id}
              onClick={() => router.push(`/trades/${trade.id}`)}
              className="block p-4 rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {trade.symbol.toUpperCase()}
                    </h3>
                    <TradeStatusBadge isOpen={isTradeOpen(trade)} />
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        trade.direction === 'LONG' ? 'profit-bg' : 'loss-bg'
                      }`}
                    >
                      {trade.direction}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Entry Date</p>
                      <p className="font-medium text-foreground">{formatDate(trade.entryDate)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Entry Price</p>
                      <p className="font-medium text-foreground">
                        {formatCurrency(trade.entryPrice, trade.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Quantity</p>
                      <p className="font-medium text-foreground">{trade.quantity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Asset Type</p>
                      <p className="font-medium text-foreground">{trade.assetType}</p>
                    </div>
                  </div>

                  {trade.strategyName && (
                    <div className="mt-2">
                      <span className="text-xs text-muted-foreground">Strategy: </span>
                      <span className="text-xs font-medium text-foreground">{trade.strategyName}</span>
                    </div>
                  )}
                </div>

                <div className="ml-4 flex flex-col items-end gap-2">
                  <Link
                    href={`/trades/${trade.id}/edit`}
                    onClick={(e) => e.stopPropagation()}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                  >
                    Close Trade
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

