'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('trades');
  
  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-8">
      <h2 className="text-xl font-semibold mb-6 text-foreground">{t('filters')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Date Range */}
        <div>
          <label htmlFor="date-from" className="block text-sm font-medium mb-2 text-foreground">
            {t('dateFrom')}
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
            {t('dateTo')}
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
            {t('assetType')}
          </label>
          <select
            id="asset-type"
            value={filters.assetType}
            onChange={(e) => onChange('assetType', e.target.value)}
            className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground transition-colors"
          >
            <option value="">{t('allTypes')}</option>
            <option value="STOCK">{t('stock')}</option>
            <option value="FOREX">{t('forex')}</option>
            <option value="CRYPTO">{t('crypto')}</option>
            <option value="OPTIONS">{t('options')}</option>
          </select>
        </div>

        {/* Outcome */}
        <div>
          <label htmlFor="outcome" className="block text-sm font-medium mb-2 text-foreground">
            {t('outcome')}
          </label>
          <select
            id="outcome"
            value={filters.outcome}
            onChange={(e) => onChange('outcome', e.target.value)}
            className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground transition-colors"
          >
            <option value="">{t('allOutcomes')}</option>
            <option value="win">{t('wins')}</option>
            <option value="loss">{t('losses')}</option>
            <option value="breakeven">{t('breakEven')}</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-2 text-foreground">
            {t('status')}
          </label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => onChange('status', e.target.value)}
            className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground transition-colors"
          >
            <option value="">{t('allTrades')}</option>
            <option value="open">{t('open')}</option>
            <option value="closed">{t('closed')}</option>
          </select>
        </div>

        {/* Symbol */}
        <div>
          <label htmlFor="symbol" className="block text-sm font-medium mb-2 text-foreground">
            {t('symbol')}
          </label>
          <input
            id="symbol"
            type="text"
            value={filters.symbol}
            onChange={(e) => onChange('symbol', e.target.value)}
            placeholder={t('symbolPlaceholder')}
            className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground transition-colors"
          />
        </div>

        {/* Strategy */}
        <div>
          <label htmlFor="strategyName" className="block text-sm font-medium mb-2 text-foreground">
            {t('strategy')}
          </label>
          <input
            id="strategyName"
            type="text"
            value={filters.strategyName}
            onChange={(e) => onChange('strategyName', e.target.value)}
            placeholder={t('strategyPlaceholder')}
            className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground transition-colors"
          />
        </div>
      </div>

      {/* Search and Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={filters.search}
            onChange={(e) => onChange('search', e.target.value)}
            className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground transition-colors"
          />
        </div>
        {/* Sorting */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-by" className="text-sm text-muted-foreground">
            {t('sortBy')}
          </label>
          <select
            id="sort-by"
            value={filters.sortBy}
            onChange={(e) => onChange('sortBy', e.target.value)}
            className="px-2 py-2 border border-input rounded-lg bg-background text-foreground"
          >
            <option value="date">{t('sortDate')}</option>
            <option value="pnl">{t('sortPnl')}</option>
            <option value="pnlPercent">{t('sortPnlPercent')}</option>
            <option value="symbol">{t('sortSymbol')}</option>
          </select>
          <select
            aria-label={t('sortOrder')}
            value={filters.sortOrder}
            onChange={(e) => onChange('sortOrder', e.target.value)}
            className="px-2 py-2 border border-input rounded-lg bg-background text-foreground"
          >
            <option value="desc">{t('desc')}</option>
            <option value="asc">{t('asc')}</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 border border-border hover:bg-muted text-foreground rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {t('reset')}
          </button>
          <button
            type="button"
            onClick={onApply}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {t('applyFilters')}
          </button>
          {onExportCsv && (
            <button
              type="button"
              onClick={onExportCsv}
              className="px-4 py-2 border border-border hover:bg-muted text-foreground rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label={t('exportCsv')}
            >
              {t('exportCsv')}
            </button>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="mt-6">
        <TagInput
          label={t('tags')}
          value={filters.tags}
          onChange={(tags) => onChange('tags', tags)}
          placeholder={t('typeToSearchOrAddTags')}
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
          <span className="text-sm font-medium text-foreground">{t('activeFilters')}</span>
          {filters.startDate && (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
              {t('from')} {new Date(filters.startDate).toLocaleDateString()}
            </span>
          )}
          {filters.endDate && (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
              {t('to')} {new Date(filters.endDate).toLocaleDateString()}
            </span>
          )}
          {filters.assetType && (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
              {t('type')}: {filters.assetType === 'STOCK' ? t('stock') :
                              filters.assetType === 'FOREX' ? t('forex') :
                              filters.assetType === 'CRYPTO' ? t('crypto') :
                              filters.assetType === 'OPTIONS' ? t('options') : filters.assetType}
            </span>
          )}
          {filters.outcome && (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
              {t('outcome')}: {filters.outcome === 'win' ? t('wins') :
                                filters.outcome === 'loss' ? t('losses') :
                                filters.outcome === 'breakeven' ? t('breakEven') : filters.outcome}
            </span>
          )}
          {filters.status && (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
              {t('status')}: {filters.status === 'open' ? t('open') : filters.status === 'closed' ? t('closed') : filters.status}
            </span>
          )}
          {filters.search && (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
              {t('search')}: {filters.search}
            </span>
          )}
          {filters.symbol && (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
              {t('symbol')}: {filters.symbol.toUpperCase()}
            </span>
          )}
          {filters.strategyName && (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
              {t('strategy')}: {filters.strategyName}
            </span>
          )}
          {filters.tags && filters.tags.length > 0 && (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
              {t('tags')}: {filters.tags.join(', ')}
            </span>
          )}
        </div>
      )}
    </div>
  );
}


