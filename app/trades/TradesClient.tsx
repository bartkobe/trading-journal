'use client';

import { useState } from 'react';
import { TradeList } from '@/components/trades/TradeList';
import { TradeFilters } from '@/components/trades/TradeFilters';

export function TradesClient() {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    assetType: '',
    outcome: '',
    search: '',
    symbol: '',
    strategyName: '',
    tags: [] as string[],
    sortBy: 'date' as 'date' | 'pnl' | 'pnlPercent' | 'symbol',
    sortOrder: 'desc' as 'asc' | 'desc',
  });

  const handleInputChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    // Filters are applied automatically via state
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      assetType: '',
      outcome: '',
      search: '',
      symbol: '',
      strategyName: '',
      tags: [],
      sortBy: 'date',
      sortOrder: 'desc',
    });
  };

  const handleExportCsv = async () => {
    try {
      const response = await fetch('/api/export/csv', {
        method: 'GET',
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert('Please log in to export your trades.');
          return;
        }
        alert('Failed to export CSV. Please try again.');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'trades-export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export CSV error:', error);
      alert('An unexpected error occurred while exporting.');
    }
  };

  // Convert filters to TradeList format
  const tradeListFilters = {
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    assetType: filters.assetType || undefined,
    outcome: filters.outcome || undefined,
    search: filters.search || undefined,
    symbol: filters.symbol || undefined,
    strategyName: filters.strategyName || undefined,
    tags: filters.tags && filters.tags.length ? filters.tags : undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  } as const;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Trade Journal</h1>
            <p className="text-base text-muted-foreground">View and manage all your trades</p>
          </div>
        </div>

        {/* Filters Section */}
        <TradeFilters
          filters={filters}
          onChange={handleInputChange as any}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          onExportCsv={handleExportCsv}
        />

        {/* Trade List */}
        <TradeList filters={tradeListFilters} />
      </div>
    </div>
  );
}

