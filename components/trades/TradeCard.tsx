import Link from 'next/link';
import { TradeWithCalculations } from '@/lib/types';
import { formatCurrency, formatPercent, formatDate, isTradeOpen } from '@/lib/trades';
import { TradeStatusBadge } from './TradeStatusBadge';

interface TradeCardProps {
  trade: TradeWithCalculations;
  onClick?: () => void;
}

export function TradeCard({ trade, onClick }: TradeCardProps) {
  const tradeIsOpen = isTradeOpen(trade);

  const getOutcomeColor = () => {
    if (tradeIsOpen) return 'text-foreground';
    if (trade.calculations.isWinner) return 'profit';
    if (trade.calculations.isLoser) return 'loss';
    return 'breakeven';
  };

  const getOutcomeBg = () => {
    if (tradeIsOpen) return 'bg-card border-blue-300 dark:border-blue-700';
    if (trade.calculations.isWinner) return 'profit-bg border-success';
    if (trade.calculations.isLoser) return 'loss-bg border-danger';
    return 'bg-card border-border';
  };

  const getOutcomeIcon = () => {
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
        <svg
          className="w-5 h-5 loss"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
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
      <svg
        className="w-5 h-5 breakeven"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    );
  };

  const getDirectionBadge = () => (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        trade.direction === 'LONG' ? 'profit-bg' : 'loss-bg'
      }`}
    >
      {trade.direction}
    </span>
  );

  const content = (
    <div className={`rounded-lg border p-4 transition-all hover:shadow-md ${getOutcomeBg()}`}>
      {/* Header: Symbol, Date, and Outcome */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-lg font-semibold text-foreground">
              {trade.symbol.toUpperCase()}
            </h3>
            {getDirectionBadge()}
            <TradeStatusBadge isOpen={tradeIsOpen} />
          </div>
          <p className="text-sm text-muted-foreground">{formatDate(trade.entryDate)}</p>
          {trade.strategyName && (
            <p className="text-xs text-muted-foreground mt-1">
              Strategy: {trade.strategyName}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">{!tradeIsOpen && getOutcomeIcon()}</div>
      </div>

      {/* Asset Type Badge */}
      <div className="mb-3">
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-muted dark:bg-gray-700 text-foreground">
          {trade.assetType}
        </span>
      </div>

      {/* Entry and Exit Prices */}
      <div className="grid grid-cols-2 gap-4 mb-3 pb-3 border-b border-border">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Entry
          </p>
          <p className="text-sm font-medium text-foreground">
            {formatCurrency(trade.entryPrice, trade.currency)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Qty: {trade.quantity}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Exit
          </p>
          {tradeIsOpen ? (
            <>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">In Progress</p>
              <p className="text-xs text-muted-foreground mt-0.5">Not yet closed</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-foreground">
                {formatCurrency(trade.exitPrice!, trade.currency)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDate(trade.exitDate!)}
              </p>
            </>
          )}
        </div>
      </div>

      {/* P&L and Return */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            P&L
          </p>
          {tradeIsOpen ? (
            <p className="text-xl font-bold text-muted-foreground">—</p>
          ) : (
            <p className={`text-xl font-bold ${getOutcomeColor()}`}>
              {formatCurrency(trade.calculations.netPnl!, trade.currency)}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Return
          </p>
          {tradeIsOpen ? (
            <p className="text-xl font-bold text-muted-foreground">—</p>
          ) : (
            <p className={`text-xl font-bold ${getOutcomeColor()}`}>
              {formatPercent(trade.calculations.pnlPercent!)}
            </p>
          )}
        </div>
      </div>

      {/* Additional Info */}
      {(trade.setupType || trade.timeOfDay || trade.marketConditions) && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {trade.setupType && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                {trade.setupType}
              </span>
            )}
            {trade.timeOfDay && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                {trade.timeOfDay.replace('_', ' ')}
              </span>
            )}
            {trade.marketConditions && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                {trade.marketConditions}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tags */}
      {trade.tags && trade.tags.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {trade.tags.map((tradeTag) => (
              <span
                key={tradeTag.tag.id}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted dark:bg-gray-700 text-foreground"
              >
                #{tradeTag.tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Screenshot indicator */}
      {trade.screenshots && trade.screenshots.length > 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>
            {trade.screenshots.length} screenshot{trade.screenshots.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left">
        {content}
      </button>
    );
  }

  return (
    <Link href={`/trades/${trade.id}`} className="block">
      {content}
    </Link>
  );
}
