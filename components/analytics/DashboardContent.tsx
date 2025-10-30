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
    <div className="space-y-12">
      {/* Date Range Filter */}
      <section>
        <div className="mb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-foreground">
              Filter by Date Range
            </h2>
            <p className="text-sm text-muted-foreground">
              Customize the date range to analyze specific periods
            </p>
          </div>
        </div>
        <DateRangeFilter onDateRangeChange={handleDateRangeChange} />
      </section>

      {/* Key Metrics Section */}
      <section className="mt-16">
        <DashboardMetrics startDate={startDate} endDate={endDate} />
      </section>

      {/* Performance Charts Section */}
      <section className="mt-20">
        <div className="mb-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground">
              Performance Analysis
            </h2>
            <p className="text-base text-muted-foreground">
              Visual breakdown of your trading performance
            </p>
          </div>
        </div>
        <PerformanceCharts startDate={startDate} endDate={endDate} />
      </section>

      {/* Quick Actions */}
      <section className="bg-card rounded-xl border border-border p-8">
        <div className="mb-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-foreground">
              Quick Actions
            </h2>
            <p className="text-sm text-muted-foreground">
              Frequently used features and shortcuts
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Link
            href="/trades/new"
            className="flex items-center gap-3 p-5 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
          >
            <span className="text-2xl">📝</span>
            <div>
              <p className="font-medium text-foreground dark:text-gray-100">Log New Trade</p>
              <p className="text-sm text-muted-foreground">Record your latest trade</p>
            </div>
          </Link>
          <Link
            href="/trades"
            className="flex items-center gap-3 p-5 rounded-xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
          >
            <span className="text-2xl">📋</span>
            <div>
              <p className="font-medium text-foreground dark:text-gray-100">View All Trades</p>
              <p className="text-sm text-muted-foreground">Browse trade history</p>
            </div>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-3 p-5 rounded-xl profit-bg hover:bg-success-light transition-colors border border-transparent hover:border-success"
          >
            <span className="text-2xl">📈</span>
            <div>
              <p className="font-medium text-foreground dark:text-gray-100">Analytics</p>
              <p className="text-sm text-muted-foreground">View detailed stats</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
