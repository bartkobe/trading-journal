'use client';

import { useState } from 'react';
import { TradeList } from '@/components/trades/TradeList';

export function TradesClient() {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    assetType: '',
    outcome: '',
    search: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    // Filters are applied automatically via state
    console.log('Applying filters:', filters);
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      assetType: '',
      outcome: '',
      search: '',
    });
  };

  // Convert filters to TradeList format
  const tradeListFilters = {
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    assetType: filters.assetType || undefined,
    outcome: filters.outcome || undefined,
    symbol: filters.search || undefined,
  };

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
        <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-foreground">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Date Range */}
            <div>
              <label htmlFor="date-from" className="block text-sm font-medium mb-2 text-foreground">
                Date From
              </label>
              <input
                id="date-from"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground transition-colors"
              />
            </div>

            <div>
              <label htmlFor="date-to" className="block text-sm font-medium mb-2 text-foreground">
                Date To
              </label>
              <input
                id="date-to"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground transition-colors"
              />
            </div>

            {/* Asset Type */}
            <div>
              <label htmlFor="asset-type" className="block text-sm font-medium mb-2 text-foreground">
                Asset Type
              </label>
              <select
                id="asset-type"
                value={filters.assetType}
                onChange={(e) => handleInputChange('assetType', e.target.value)}
                className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground transition-colors"
              >
                <option value="">All Types</option>
                <option value="STOCK">Stock</option>
                <option value="FOREX">Forex</option>
                <option value="CRYPTO">Crypto</option>
                <option value="OPTIONS">Options</option>
              </select>
            </div>

            {/* Outcome */}
            <div>
              <label htmlFor="outcome" className="block text-sm font-medium mb-2 text-foreground">
                Outcome
              </label>
              <select
                id="outcome"
                value={filters.outcome}
                onChange={(e) => handleInputChange('outcome', e.target.value)}
                className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground transition-colors"
              >
                <option value="">All Outcomes</option>
                <option value="win">Wins</option>
                <option value="loss">Losses</option>
                <option value="breakeven">Break Even</option>
              </select>
            </div>
          </div>

          {/* Search and Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by symbol, strategy, or notes..."
                value={filters.search}
                onChange={(e) => handleInputChange('search', e.target.value)}
                className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 border border-border hover:bg-muted text-foreground rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Active Filters Indicator */}
          {(filters.startDate || filters.endDate || filters.assetType || filters.outcome || filters.search) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-foreground">Active Filters:</span>
              {filters.startDate && (
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                  From: {new Date(filters.startDate).toLocaleDateString()}
                </span>
              )}
              {filters.endDate && (
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                  To: {new Date(filters.endDate).toLocaleDateString()}
                </span>
              )}
              {filters.assetType && (
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                  Type: {filters.assetType}
                </span>
              )}
              {filters.outcome && (
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                  Outcome: {filters.outcome}
                </span>
              )}
              {filters.search && (
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                  Search: {filters.search}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Trade List */}
        <TradeList filters={tradeListFilters} />
      </div>
    </div>
  );
}

