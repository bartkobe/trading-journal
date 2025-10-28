import { TradeWithCalculations } from '@/lib/types';
import { formatCurrency, formatPercent, formatDateTime } from '@/lib/trades';

interface TradeDetailProps {
  trade: TradeWithCalculations;
}

export function TradeDetail({ trade }: TradeDetailProps) {
  const getOutcomeColor = () => {
    if (trade.calculations.isWinner) return 'text-green-600 dark:text-green-400';
    if (trade.calculations.isLoser) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getOutcomeBadge = () => {
    if (trade.calculations.isWinner) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Winner
        </span>
      );
    }
    if (trade.calculations.isLoser) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Loser
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400">
        Break Even
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* P&L Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Net P&L</p>
          <p className={`text-2xl font-bold ${getOutcomeColor()}`}>
            {formatCurrency(trade.calculations.netPnl, trade.currency)}
          </p>
          {trade.fees && trade.fees > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Fees: {formatCurrency(trade.fees, trade.currency)}
            </p>
          )}
        </div>

        {/* Return % Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Return</p>
          <p className={`text-2xl font-bold ${getOutcomeColor()}`}>
            {formatPercent(trade.calculations.pnlPercent)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formatCurrency(trade.calculations.pnl, trade.currency)} gross
          </p>
        </div>

        {/* Holding Period Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Holding Period</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {trade.calculations.holdingPeriodDays.toFixed(1)}d
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {trade.calculations.holdingPeriod.toFixed(1)} hours
          </p>
        </div>

        {/* Outcome Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Outcome</p>
          <div className="mt-2">{getOutcomeBadge()}</div>
        </div>
      </div>

      {/* Trade Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trade Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Symbol</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {trade.symbol.toUpperCase()}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Asset Type</p>
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {trade.assetType}
              </span>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Direction</p>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium ${
                  trade.direction === 'LONG'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}
              >
                {trade.direction}
              </span>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Entry Date</p>
              <p className="text-base text-gray-900 dark:text-white">
                {formatDateTime(trade.entryDate)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Entry Price</p>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {formatCurrency(trade.entryPrice, trade.currency)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Quantity</p>
              <p className="text-base text-gray-900 dark:text-white">{trade.quantity}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Entry Value</p>
              <p className="text-base text-gray-900 dark:text-white">
                {formatCurrency(trade.calculations.entryValue, trade.currency)}
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Currency</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {trade.currency}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Exit Date</p>
              <p className="text-base text-gray-900 dark:text-white">
                {trade.exitDate ? formatDateTime(trade.exitDate) : 'Still open'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Exit Price</p>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {trade.exitPrice ? formatCurrency(trade.exitPrice, trade.currency) : 'N/A'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Exit Value</p>
              <p className="text-base text-gray-900 dark:text-white">
                {formatCurrency(trade.calculations.exitValue, trade.currency)}
              </p>
            </div>

            {trade.stopLoss && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Stop Loss</p>
                <p className="text-base text-gray-900 dark:text-white">
                  {formatCurrency(trade.stopLoss, trade.currency)}
                </p>
              </div>
            )}

            {trade.takeProfit && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Take Profit</p>
                <p className="text-base text-gray-900 dark:text-white">
                  {formatCurrency(trade.takeProfit, trade.currency)}
                </p>
              </div>
            )}

            {trade.riskRewardRatio && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Risk:Reward Ratio</p>
                <p className="text-base text-gray-900 dark:text-white">
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Strategy & Context
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {trade.strategyName && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Strategy</p>
                  <p className="text-base text-gray-900 dark:text-white">{trade.strategyName}</p>
                </div>
              )}

              {trade.setupType && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Setup Type</p>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                    {trade.setupType}
                  </span>
                </div>
              )}

              {trade.timeOfDay && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Time of Day</p>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                    {trade.timeOfDay.replace('_', ' ')}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {trade.marketConditions && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Market Conditions</p>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                    {trade.marketConditions}
                  </span>
                </div>
              )}

              {trade.emotionalStateEntry && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Emotional State (Entry)
                  </p>
                  <p className="text-base text-gray-900 dark:text-white">
                    {trade.emotionalStateEntry}
                  </p>
                </div>
              )}

              {trade.emotionalStateExit && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Emotional State (Exit)
                  </p>
                  <p className="text-base text-gray-900 dark:text-white">
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {trade.tags.map((tradeTag) => (
              <span
                key={tradeTag.tag.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                #{tradeTag.tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Screenshots */}
      {trade.screenshots && trade.screenshots.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Screenshots ({trade.screenshots.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {trade.screenshots.map((screenshot) => (
              <a
                key={screenshot.id}
                href={screenshot.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors"
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes</h2>
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-gray-900 dark:text-gray-100"
            dangerouslySetInnerHTML={{ __html: trade.notes }}
          />
        </div>
      )}

      {/* Timestamps */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Created: {formatDateTime(trade.createdAt)}</span>
          <span>Updated: {formatDateTime(trade.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}
