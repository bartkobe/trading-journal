'use client';

import React from 'react';

export interface TradeFiltersState {
  startDate: string;
  endDate: string;
  assetType: string;
  outcome: string;
  status: string;
  search: string;
  symbol: string;
  strategyName: string;
  tags: string[];
  sortBy: 'date' | 'pnl' | 'pnlPercent' | 'symbol';
  sortOrder: 'asc' | 'desc';
}

interface TradeFiltersProps {
  filters: TradeFiltersState;
  onChange: (field: keyof TradeFiltersState, value: string | string[]) => void;
  onApply: () => void;
  onReset: () => void;
  onExportCsv?: () => void;
}

import { TagInput } from '@/components/ui/TagInput';

export function TradeFilters({ filters, onChange, onApply, onReset, onExportCsv }: TradeFiltersProps) {
  return (
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
            onChange={(e) => onChange('startDate', e.target.value)}
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
            onChange={(e) => onChange('endDate', e.target.value)}
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
            onChange={(e) => onChange('assetType', e.target.value)}
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
            onChange={(e) => onChange('outcome', e.target.value)}
            className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground transition-colors"
          >
            <option value="">All Outcomes</option>
            <option value="win">Wins</option>
            <option value="loss">Losses</option>
            <option value="breakeven">Break Even</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-2 text-foreground">
            Status
          </label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => onChange('status', e.target.value)}
            className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground transition-colors"
          >
            <option value="">All Trades</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Symbol */}
        <div>
          <label htmlFor="symbol" className="block text-sm font-medium mb-2 text-foreground">
            Symbol
          </label>
          <input
            id="symbol"
            type="text"
            value={filters.symbol}
            onChange={(e) => onChange('symbol', e.target.value)}
            placeholder="e.g. AAPL"
            className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground transition-colors"
          />
        </div>

        {/* Strategy */}
        <div>
          <label htmlFor="strategyName" className="block text-sm font-medium mb-2 text-foreground">
            Strategy
          </label>
          <input
            id="strategyName"
            type="text"
            value={filters.strategyName}
            onChange={(e) => onChange('strategyName', e.target.value)}
            placeholder="e.g. Breakout"
            className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground transition-colors"
          />
        </div>
      </div>

      {/* Search and Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by symbol, strategy, or notes..."
            value={filters.search}
            onChange={(e) => onChange('search', e.target.value)}
            className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground transition-colors"
          />
        </div>
        {/* Sorting */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-by" className="text-sm text-muted-foreground">
            Sort by
          </label>
          <select
            id="sort-by"
            value={filters.sortBy}
            onChange={(e) => onChange('sortBy', e.target.value)}
            className="px-2 py-2 border border-input rounded-lg bg-background text-foreground"
          >
            <option value="date">Date</option>
            <option value="pnl">P&L</option>
            <option value="pnlPercent">P&L%</option>
            <option value="symbol">Symbol</option>
          </select>
          <select
            aria-label="Sort order"
            value={filters.sortOrder}
            onChange={(e) => onChange('sortOrder', e.target.value)}
            className="px-2 py-2 border border-input rounded-lg bg-background text-foreground"
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 border border-border hover:bg-muted text-foreground rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onApply}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            Apply Filters
          </button>
          {onExportCsv && (
            <button
              type="button"
              onClick={onExportCsv}
              className="px-4 py-2 border border-border hover:bg-muted text-foreground rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Export trades to CSV"
            >
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="mt-6">
        <TagInput
          label="Tags"
          value={filters.tags}
          onChange={(tags) => onChange('tags', tags)}
          placeholder="Type to search or add tags"
        />
      </div>

      {/* Active Filters Indicator */}
      {(filters.startDate ||
        filters.endDate ||
        filters.assetType ||
        filters.outcome ||
        filters.status ||
        filters.search ||
        filters.symbol ||
        filters.strategyName ||
        (filters.tags && filters.tags.length > 0)) && (
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
          {filters.status && (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
              Status: {filters.status === 'open' ? 'Open' : filters.status === 'closed' ? 'Closed' : filters.status}
            </span>
          )}
          {filters.search && (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
              Search: {filters.search}
            </span>
          )}
          {filters.symbol && (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
              Symbol: {filters.symbol.toUpperCase()}
            </span>
          )}
          {filters.strategyName && (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
              Strategy: {filters.strategyName}
            </span>
          )}
          {filters.tags && filters.tags.length > 0 && (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
              Tags: {filters.tags.join(', ')}
            </span>
          )}
        </div>
      )}
    </div>
  );
}


