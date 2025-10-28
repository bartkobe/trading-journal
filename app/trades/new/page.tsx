import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TradeForm } from '@/components/trades/TradeForm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NewTradePage() {
  try {
    await requireAuth();
  } catch (error) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/trades"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Trades
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">New Trade</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Record a new trade with all the details, screenshots, and notes.
          </p>
        </div>

        {/* Trade Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <TradeForm />
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Tips for Recording Trades
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
            <li>Record trades as soon as possible for accuracy</li>
            <li>Include screenshots of your entry and exit points</li>
            <li>Document your reasoning and emotional state</li>
            <li>Tag trades with strategies and setups for better analysis</li>
            <li>Review and update trade notes after the trade closes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
