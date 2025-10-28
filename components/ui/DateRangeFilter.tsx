'use client';

import { useState } from 'react';

// ============================================================================
// Types
// ============================================================================

interface DateRangeFilterProps {
  onDateRangeChange: (startDate: string | undefined, endDate: string | undefined) => void;
  className?: string;
}

// ============================================================================
// DateRangeFilter Component
// ============================================================================

export default function DateRangeFilter({
  onDateRangeChange,
  className = '',
}: DateRangeFilterProps) {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleApply = () => {
    onDateRangeChange(startDate || undefined, endDate || undefined);
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    onDateRangeChange(undefined, undefined);
  };

  // Quick date range presets
  const handlePreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    setStartDate(startStr);
    setEndDate(endStr);
    onDateRangeChange(startStr, endStr);
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        {/* Date Inputs */}
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex-1">
            <label
              htmlFor="start-date"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Start Date
            </label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="end-date"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              End Date
            </label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Apply
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 self-center">
          Quick Select:
        </span>
        <button
          onClick={() => handlePreset(7)}
          className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
        >
          Last 7 days
        </button>
        <button
          onClick={() => handlePreset(30)}
          className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
        >
          Last 30 days
        </button>
        <button
          onClick={() => handlePreset(90)}
          className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
        >
          Last 90 days
        </button>
        <button
          onClick={() => handlePreset(365)}
          className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
        >
          Last Year
        </button>
      </div>

      {/* Active Filter Indicator */}
      {(startDate || endDate) && (
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Active Filter:</span>
          <span>
            {startDate && `From ${new Date(startDate).toLocaleDateString()}`}
            {startDate && endDate && ' - '}
            {endDate && `To ${new Date(endDate).toLocaleDateString()}`}
          </span>
        </div>
      )}
    </div>
  );
}
