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
    console.log('Apply clicked - startDate:', startDate, 'endDate:', endDate);
    onDateRangeChange(startDate || undefined, endDate || undefined);
  };

  const handleClear = () => {
    console.log('Clear clicked');
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
      className={`bg-card rounded-lg border border-border p-4 ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        {/* Date Inputs */}
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex-1">
            <label
              htmlFor="start-date"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Start Date
            </label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="end-date"
              className="block text-sm font-medium text-foreground mb-2"
            >
              End Date
            </label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Apply date range filter"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 border border-border hover:bg-muted text-foreground font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Clear date range filter"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-sm font-medium text-foreground self-center">
          Quick Select:
        </span>
        <button
          type="button"
          onClick={() => handlePreset(7)}
          className="px-3 py-1 text-sm border border-border hover:bg-muted text-foreground rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Last 7 days
        </button>
        <button
          type="button"
          onClick={() => handlePreset(30)}
          className="px-3 py-1 text-sm border border-border hover:bg-muted text-foreground rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Last 30 days
        </button>
        <button
          type="button"
          onClick={() => handlePreset(90)}
          className="px-3 py-1 text-sm border border-border hover:bg-muted text-foreground rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Last 90 days
        </button>
        <button
          type="button"
          onClick={() => handlePreset(365)}
          className="px-3 py-1 text-sm border border-border hover:bg-muted text-foreground rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Last Year
        </button>
      </div>

      {/* Active Filter Indicator */}
      {(startDate || endDate) && (
        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
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
