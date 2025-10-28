import Link from 'next/link';
import { TradeWithCalculations } from '@/lib/types';
import { formatCurrency, formatPercentage } from '@/lib/trades';

interface TradeCardProps {
  trade: TradeWithCalculations;
}

export function TradeCard({ trade }: TradeCardProps) {
  return (
    <Link
      href={`/trades/${trade.id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
    >
      {/* Header with Symbol and Direction */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{trade.symbol}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{trade.assetType}</p>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            trade.direction === 'LONG'
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
          }`}
        >
          {trade.direction}
        </span>
      </div>

      {/* P&L - Main Focus */}
      <div className="mb-4">
        <div
          className={`text-2xl font-bold ${
            trade.outcome === 'winning'
              ? 'text-green-600 dark:text-green-400'
              : trade.outcome === 'losing'
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          {formatCurrency(trade.netPnl, trade.currency)}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {formatPercentage(trade.netPnlPercent)}
        </div>
      </div>

      {/* Trade Details */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Entry</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {trade.entryPrice.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Exit</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {trade.exitPrice.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Quantity</span>
          <span className="font-medium text-gray-900 dark:text-white">{trade.quantity}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Date</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {new Date(trade.entryDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Strategy */}
      {trade.strategyName && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">Strategy</div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {trade.strategyName}
          </div>
        </div>
      )}

      {/* Tags */}
      {trade.tags && trade.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1">
          {trade.tags.slice(0, 3).map((tt) => (
            <span
              key={tt.id}
              className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
            >
              {tt.tag.name}
            </span>
          ))}
          {trade.tags.length > 3 && (
            <span className="inline-block px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
              +{trade.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Visual Indicator - Bottom Border */}
      <div
        className={`mt-4 pt-4 border-t-2 ${
          trade.outcome === 'winning'
            ? 'border-green-500'
            : trade.outcome === 'losing'
              ? 'border-red-500'
              : 'border-gray-300 dark:border-gray-600'
        }`}
      >
        <div className="flex items-center justify-between text-xs">
          <span
            className={`font-medium ${
              trade.outcome === 'winning'
                ? 'text-green-600 dark:text-green-400'
                : trade.outcome === 'losing'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {trade.outcome === 'winning' ? '✓ Winner' : trade.outcome === 'losing' ? '✗ Loser' : '− Breakeven'}
          </span>
          {trade.actualRR && (
            <span className="text-gray-500 dark:text-gray-400">R:R {trade.actualRR.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

