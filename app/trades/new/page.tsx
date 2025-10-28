import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TradeForm } from '@/components/trades/TradeForm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NewTradePage() {
  const user = await requireAuth().catch(() => {
    redirect('/');
  });

  if (!user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/trades"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Trades
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Record New Trade
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Capture all the details of your trade for future analysis and learning.
          </p>
        </div>

        {/* Form */}
        <TradeForm />
      </div>
    </div>
  );
}

