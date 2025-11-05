'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { TradeWithCalculations } from '@/lib/types';
import { formatCurrency, formatPercent, formatDateTime, isTradeOpen } from '@/lib/trades';
import { TradeStatusBadge } from './TradeStatusBadge';

interface TradeDetailProps {
  trade: TradeWithCalculations;
}

export function TradeDetail({ trade }: TradeDetailProps) {
  const t = useTranslations('trades');
  const tradeIsOpen = isTradeOpen(trade);

  const getOutcomeColor = () => {
    if (tradeIsOpen) return 'text-foreground';
    if (trade.calculations.isWinner) return 'profit';
    if (trade.calculations.isLoser) return 'loss';
    return 'breakeven';
  };

  const getOutcomeBadge = () => {
    if (trade.calculations.isWinner) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium profit-bg">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {t('winner')}
        </span>
      );
    }
    if (trade.calculations.isLoser) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium loss-bg">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          {t('loser')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">
        {t('breakEven')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Trade Status Header */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TradeStatusBadge isOpen={tradeIsOpen} />
            <h1 className="text-2xl font-bold text-foreground">
              {tradeIsOpen ? t('openTrade') : t('closedTrade')}
            </h1>
          </div>
          {tradeIsOpen && (
            <Link
              href={`/trades/${trade.id}/edit`}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground font-medium rounded-lg transition-colors"
            >
              {t('closeTrade')}
            </Link>
          )}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* P&L Card */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">{t('netPnl')}</p>
          {tradeIsOpen ? (
            <p className="text-2xl font-bold text-muted-foreground">{t('notAvailable')}</p>
          ) : (
            <>
              <p className={`text-2xl font-bold ${getOutcomeColor()}`}>
                {formatCurrency(trade.calculations.netPnl!, trade.currency)}
              </p>
              {trade.fees && trade.fees > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t('fees')}: {formatCurrency(trade.fees, trade.currency)}
                </p>
              )}
            </>
          )}
        </div>

        {/* Return % Card */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">{t('return')}</p>
          {tradeIsOpen ? (
            <p className="text-2xl font-bold text-muted-foreground">{t('notAvailable')}</p>
          ) : (
            <>
              <p className={`text-2xl font-bold ${getOutcomeColor()}`}>
                {formatPercent(trade.calculations.pnlPercent!)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(trade.calculations.pnl!, trade.currency)} {t('gross')}
              </p>
            </>
          )}
        </div>

        {/* Holding Period Card */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">{t('holdingPeriod')}</p>
          {tradeIsOpen ? (
            <>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{t('ongoing')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('tradeStillOpen')}</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-foreground">
                {trade.calculations.holdingPeriodDays!.toFixed(1)}d
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {trade.calculations.holdingPeriod!.toFixed(1)} {t('hours')}
              </p>
            </>
          )}
        </div>

        {/* Outcome Card */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">{t('outcome')}</p>
          <div className="mt-2">
            {tradeIsOpen ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                {t('open')}
              </span>
            ) : (
              getOutcomeBadge()
            )}
          </div>
        </div>
      </div>

      {/* Trade Details */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">{t('tradeDetails')}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t('symbol')}</p>
              <p className="text-lg font-semibold text-foreground">
                {trade.symbol.toUpperCase()}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">{t('assetType')}</p>
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-muted text-foreground">
                {trade.assetType === 'STOCK' ? t('stock') :
                 trade.assetType === 'FOREX' ? t('forex') :
                 trade.assetType === 'CRYPTO' ? t('crypto') :
                 trade.assetType === 'OPTIONS' ? t('options') : trade.assetType}
              </span>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">{t('direction')}</p>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium ${
                  trade.direction === 'LONG' ? 'profit-bg' : 'loss-bg'
                }`}
              >
                {trade.direction === 'LONG' ? t('long') : t('short')}
              </span>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">{t('entryDate')}</p>
              <p className="text-base text-foreground">
                {formatDateTime(trade.entryDate)}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">{t('entryPrice')}</p>
              <p className="text-base font-medium text-foreground">
                {formatCurrency(trade.entryPrice, trade.currency)}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">{t('quantity')}</p>
              <p className="text-base text-foreground">{trade.quantity}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">{t('entryValue')}</p>
              <p className="text-base text-foreground">
                {formatCurrency(trade.calculations.entryValue, trade.currency)}
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t('currency')}</p>
              <p className="text-lg font-semibold text-foreground">
                {trade.currency}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">{t('exitDate')}</p>
              {tradeIsOpen ? (
                <p className="text-base text-blue-600 dark:text-blue-400">{t('notYetClosed')}</p>
              ) : (
                <p className="text-base text-foreground">
                  {formatDateTime(trade.exitDate!)}
                </p>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">{t('exitPrice')}</p>
              {tradeIsOpen ? (
                <p className="text-base font-medium text-blue-600 dark:text-blue-400">{t('notYetClosed')}</p>
              ) : (
                <p className="text-base font-medium text-foreground">
                  {formatCurrency(trade.exitPrice!, trade.currency)}
                </p>
              )}
            </div>

            {!tradeIsOpen && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('exitValue')}</p>
                <p className="text-base text-foreground">
                  {formatCurrency(trade.calculations.exitValue!, trade.currency)}
                </p>
              </div>
            )}

            {trade.stopLoss && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('stopLoss')}</p>
                <p className="text-base text-foreground">
                  {formatCurrency(trade.stopLoss, trade.currency)}
                </p>
              </div>
            )}

            {trade.takeProfit && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('takeProfit')}</p>
                <p className="text-base text-foreground">
                  {formatCurrency(trade.takeProfit, trade.currency)}
                </p>
              </div>
            )}

            {trade.riskRewardRatio && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('riskRewardRatio')}</p>
                <p className="text-base text-foreground">
                  1:{trade.riskRewardRatio.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Strategy & Context */}
      {(trade.strategyName ||
        trade.setupType ||
        trade.timeOfDay ||
        trade.marketConditions ||
        trade.emotionalStateEntry ||
        trade.emotionalStateExit) && (
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {t('strategyAndContext')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {trade.strategyName && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('strategy')}</p>
                  <p className="text-base text-foreground">{trade.strategyName}</p>
                </div>
              )}

              {trade.setupType && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('setupType')}</p>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                    {trade.setupType}
                  </span>
                </div>
              )}

              {trade.timeOfDay && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('timeOfDay')}</p>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                    {trade.timeOfDay === 'PRE_MARKET' ? t('preMarket') :
                     trade.timeOfDay === 'MARKET_OPEN' ? t('marketOpen') :
                     trade.timeOfDay === 'MID_DAY' ? t('midDay') :
                     trade.timeOfDay === 'MARKET_CLOSE' ? t('marketClose') :
                     trade.timeOfDay === 'AFTER_HOURS' ? t('afterHours') :
                     trade.timeOfDay.replace('_', ' ')}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {trade.marketConditions && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('marketConditions')}</p>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                    {trade.marketConditions === 'TRENDING' ? t('trending') :
                     trade.marketConditions === 'RANGING' ? t('ranging') :
                     trade.marketConditions === 'VOLATILE' ? t('volatile') :
                     trade.marketConditions === 'CALM' ? t('calm') :
                     trade.marketConditions}
                  </span>
                </div>
              )}

              {trade.emotionalStateEntry && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t('emotionalStateEntry')}
                  </p>
                  <p className="text-base text-foreground">
                    {trade.emotionalStateEntry}
                  </p>
                </div>
              )}

              {trade.emotionalStateExit && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t('emotionalStateExit')}
                  </p>
                  <p className="text-base text-foreground">
                    {trade.emotionalStateExit}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tags */}
      {trade.tags && trade.tags.length > 0 && (
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">{t('tags')}</h2>
          <div className="flex flex-wrap gap-2">
            {trade.tags.map((tradeTag) => (
              <span
                key={tradeTag.tag.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-muted dark:bg-gray-700 text-foreground"
              >
                #{tradeTag.tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Screenshots */}
      {trade.screenshots && trade.screenshots.length > 0 && (
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {t('screenshots')} ({trade.screenshots.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {trade.screenshots.map((screenshot) => (
              <a
                key={screenshot.id}
                href={screenshot.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative group aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
              >
                <img
                  src={screenshot.url}
                  alt={screenshot.filename}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {trade.notes && (
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">{t('notes')}</h2>
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-foreground dark:text-gray-100"
            dangerouslySetInnerHTML={{ __html: trade.notes }}
          />
        </div>
      )}

      {/* Timestamps */}
      <div className="bg-muted bg-card/50 rounded-lg border border-border p-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{t('created')}: {formatDateTime(trade.createdAt)}</span>
          <span>{t('updated')}: {formatDateTime(trade.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}
