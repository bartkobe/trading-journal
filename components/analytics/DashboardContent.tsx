'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardMetrics from './DashboardMetrics';
import PerformanceCharts from './PerformanceCharts';
import DateRangeFilter from '../ui/DateRangeFilter';

export default function DashboardContent() {
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();

  const handleDateRangeChange = (
    newStartDate: string | undefined,
    newEndDate: string | undefined
  ) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  return (
    <div className="space-y-8">
      {/* Date Range Filter */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Filter by Date Range
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Customize the date range to analyze specific periods
          </p>
        </div>
        <DateRangeFilter onDateRangeChange={handleDateRangeChange} />
      </section>

      {/* Key Metrics Section */}
      <section>
        <DashboardMetrics startDate={startDate} endDate={endDate} />
      </section>

      {/* Performance Charts Section */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Performance Analysis
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Visual breakdown of your trading performance
          </p>
        </div>
        <PerformanceCharts startDate={startDate} endDate={endDate} />
      </section>

      {/* Quick Actions */}
      <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Link
            href="/trades/new"
            className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <span className="text-2xl">📝</span>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Log New Trade</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Record your latest trade</p>
            </div>
          </Link>
          <Link
            href="/trades"
            className="flex items-center gap-3 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <span className="text-2xl">📋</span>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">View All Trades</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Browse trade history</p>
            </div>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <span className="text-2xl">📈</span>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Analytics</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">View detailed stats</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
