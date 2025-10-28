import Link from 'next/link';
import { ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function TradeNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <ExclamationTriangleIcon className="mx-auto mb-6 h-20 w-20 text-yellow-500" />
        <h1 className="mb-4 text-4xl font-bold text-foreground">Trade Not Found</h1>
        <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
          The trade you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/trades"
            className="inline-flex items-center justify-center rounded-md bg-primary-600 px-6 py-3 text-white shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <ArrowLeftIcon className="mr-2 h-5 w-5" />
            Back to Trades
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-background px-6 py-3 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

