'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/routing';
import { TradeWithCalculations } from '@/lib/types';
import { formatCurrency, formatDate, isTradeOpen } from '@/lib/trades';
import { TradeStatusBadge } from './TradeStatusBadge';
import { ErrorMessage, EmptyState } from '@/components/ui/ErrorMessage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function OpenTradesSection() {
  const t = useTranslations('trades');
  const tErrors = useTranslations('errors');
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
            setError(tErrors('sessionExpired'));
          } else {
            setError(result.error || tErrors('failedToLoadOpenTradesRetry'));
          }
          return;
        }

        const result = await response.json();
        setOpenTrades(result.trades || []);
      } catch (err) {
        console.error('Fetch open trades error:', err);
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          setError(tErrors('unableToConnect'));
        } else {
          setError(tErrors('unexpectedErrorLoadOpenTrades'));
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
        title={t('failedToLoadOpenTrades')}
        message={error}
        onRetry={() => window.location.reload()}
        retryText={tErrors('retry')}
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
            <h2 className="text-2xl font-bold text-foreground">{t('openTrades')}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {openTrades.length === 0
                ? t('noOpenTrades')
                : t('tradesCurrentlyOpen', { count: openTrades.length })}
            </p>
          </div>
          {openTrades.length > 0 && (
            <Link
              href="/trades?status=open"
              className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
            >
              {t('viewAll')}
            </Link>
          )}
        </div>
      </div>

      {openTrades.length === 0 ? (
        <EmptyState
          icon="data"
          title={t('noOpenTrades')}
          message={t('noOpenTradesAtMoment')}
          action={{
            label: t('logNewTrade'),
            onClick: () => router.push('/trades/new'),
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
                      {trade.direction === 'LONG' ? t('long') : t('short')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">{t('entryDate')}</p>
                      <p className="font-medium text-foreground">{formatDate(trade.entryDate)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">{t('entryPrice')}</p>
                      <p className="font-medium text-foreground">
                        {formatCurrency(trade.entryPrice, trade.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">{t('quantity')}</p>
                      <p className="font-medium text-foreground">{trade.quantity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">{t('assetType')}</p>
                      <p className="font-medium text-foreground">
                        {trade.assetType === 'STOCK' ? t('stock') :
                         trade.assetType === 'FOREX' ? t('forex') :
                         trade.assetType === 'CRYPTO' ? t('crypto') :
                         trade.assetType === 'OPTIONS' ? t('options') : trade.assetType}
                      </p>
                    </div>
                  </div>

                  {trade.strategyName && (
                    <div className="mt-2">
                      <span className="text-xs text-muted-foreground">{t('strategyLabel')} </span>
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
                    {t('closeTrade')}
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

