'use client';

import { forwardRef } from 'react';

// Major currencies supported in the trading journal (FR-1)
export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]['code'];

interface CurrencySelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export const CurrencySelector = forwardRef<HTMLSelectElement, CurrencySelectorProps>(
  ({ value, onChange, disabled, error, label, required, className = '', ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          {...props}
        >
          {CURRENCIES.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.code} - {currency.name} ({currency.symbol})
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

CurrencySelector.displayName = 'CurrencySelector';

/**
 * Get currency symbol by code
 */
export function getCurrencySymbol(code: string): string {
  const currency = CURRENCIES.find((c) => c.code === code);
  return currency?.symbol || code;
}

/**
 * Get currency name by code
 */
export function getCurrencyName(code: string): string {
  const currency = CURRENCIES.find((c) => c.code === code);
  return currency?.name || code;
}

/**
 * Format amount with currency
 */
export function formatCurrencyAmount(amount: number, currencyCode: string): string {
  const symbol = getCurrencySymbol(currencyCode);
  
  // Format with 2 decimal places
  const formatted = Math.abs(amount).toFixed(2);
  
  // Add thousands separator
  const parts = formatted.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  const formattedAmount = parts.join('.');
  
  // Add sign and symbol
  if (amount < 0) {
    return `-${symbol}${formattedAmount}`;
  }
  return `${symbol}${formattedAmount}`;
}

