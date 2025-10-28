import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { TradeList } from '@/components/trades/TradeList';

export const dynamic = 'force-dynamic';

export default async function TradesPage() {
  try {
    await requireAuth();
  } catch (error) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trade Journal</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">View and manage all your trades</p>
          </div>

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
            New Trade
          </Link>
        </div>

        {/* Filters Section - Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Date From
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Date To
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Asset Type */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Asset Type
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option value="">All Types</option>
                <option value="STOCK">Stock</option>
                <option value="FOREX">Forex</option>
                <option value="CRYPTO">Crypto</option>
                <option value="OPTION">Option</option>
                <option value="FUTURE">Future</option>
                <option value="COMMODITY">Commodity</option>
              </select>
            </div>

            {/* Outcome */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Outcome
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option value="">All Outcomes</option>
                <option value="win">Wins</option>
                <option value="loss">Losses</option>
                <option value="breakeven">Break Even</option>
              </select>
            </div>
          </div>

          {/* Search and Reset */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by symbol, strategy, or notes..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors">
              Reset
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Apply Filters
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Trades</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Win Rate</p>
            <p className="text-2xl font-bold text-green-600">0%</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total P&L</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">$0.00</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg P&L</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">$0.00</p>
          </div>
        </div>

        {/* Trade List */}
        <TradeList />
      </div>
    </div>
  );
}
