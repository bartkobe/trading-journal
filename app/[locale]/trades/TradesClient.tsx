'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { TradeList } from '@/components/trades/TradeList';
import { TradeFilters } from '@/components/trades/TradeFilters';

export function TradesClient() {
  const t = useTranslations('trades');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    assetType: '',
    outcome: '',
    status: '',
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
      status: '',
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
          alert(t('pleaseLoginToExport'));
          return;
        }
        alert(t('failedToExportCsv'));
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
      alert(t('unexpectedExportError'));
    }
  };

  // Convert filters to TradeList format
  const tradeListFilters: {
    startDate?: string;
    endDate?: string;
    assetType?: string;
    outcome?: string;
    status?: string;
    search?: string;
    symbol?: string;
    strategyName?: string;
    tags?: string[];
    sortBy?: 'date' | 'pnl' | 'pnlPercent' | 'symbol';
    sortOrder?: 'asc' | 'desc';
  } = {
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
    ...(filters.assetType && { assetType: filters.assetType }),
    ...(filters.outcome && { outcome: filters.outcome }),
    ...(filters.status && { status: filters.status }),
    ...(filters.search && { search: filters.search }),
    ...(filters.symbol && { symbol: filters.symbol }),
    ...(filters.strategyName && { strategyName: filters.strategyName }),
    ...(filters.tags && filters.tags.length > 0 && { tags: filters.tags }),
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground tracking-tight">{t('tradeJournal')}</h1>
            <p className="text-base text-muted-foreground">{t('viewAndManageAllTrades')}</p>
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

