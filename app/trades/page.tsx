import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function TradesPage() {
  const user = await requireAuth().catch(() => {
    redirect('/');
  });

  if (!user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Trades</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              View, search, and analyze all your trades
            </p>
          </div>
          <Link
            href="/trades/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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

        {/* Coming Soon Message */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
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
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Trade List Coming Soon
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The trade list with filtering, sorting, and detailed cards will be implemented in the
            next tasks.
          </p>
          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <p>✅ Task 3.19: Trade List page - Current</p>
            <p>⏳ Task 3.20: TradeList component - Next</p>
            <p>⏳ Task 3.21: TradeCard component - Next</p>
            <p>⏳ Task 3.22: Trade Detail page - Next</p>
          </div>
          <div className="mt-8">
            <Link
              href="/trades/new"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Create Your First Trade
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              📊 Analytics Dashboard
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              View your performance metrics and charts
            </p>
            <Link
              href="/dashboard"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Go to Dashboard →
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              ➕ Record Trade
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Log a new trade with all details
            </p>
            <Link
              href="/trades/new"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              New Trade →
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              🏷️ Manage Tags
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Organize your trades with tags
            </p>
            <span className="text-sm text-gray-400">Coming soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}

