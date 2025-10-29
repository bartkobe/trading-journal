'use client';

import { forwardRef } from 'react';

// Major currencies with symbols
export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]['code'];

interface CurrencySelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  showSymbol?: boolean;
  className?: string;
  name?: string;
}

export const CurrencySelector = forwardRef<HTMLSelectElement, CurrencySelectorProps>(
  (
    {
      value,
      onChange,
      disabled = false,
      error,
      label = 'Currency',
      required = false,
      showSymbol = true,
      className = '',
      name,
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    return (
      <div className={className}>
        {label && (
          <label htmlFor="currency" className="block text-sm font-medium mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id="currency"
          name={name || 'currency'}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card disabled:opacity-50 disabled:cursor-not-allowed"
          {...props}
        >
          {CURRENCIES.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.code} - {currency.name}
              {showSymbol && ` (${currency.symbol})`}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

CurrencySelector.displayName = 'CurrencySelector';

// Helper function to get currency symbol
export function getCurrencySymbol(code: string): string {
  const currency = CURRENCIES.find((c) => c.code === code);
  return currency?.symbol || code;
}

// Helper function to format amount with currency
export function formatCurrencyAmount(amount: number, currencyCode: string): string {
  const currency = CURRENCIES.find((c) => c.code === currencyCode);

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback if currency code is not supported by Intl
    const symbol = currency?.symbol || currencyCode;
    return `${symbol}${amount.toFixed(2)}`;
  }
}
