'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tradeSchema, type TradeInput } from '@/lib/validation';

interface TradeFormProps {
  tradeId?: string;
  initialData?: Partial<TradeInput>;
  onSuccess?: () => void;
}

export function TradeForm({ tradeId, initialData, onSuccess }: TradeFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = !!tradeId;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(tradeSchema) as any,
    defaultValues: initialData || {
      currency: 'USD',
      direction: 'LONG',
      assetType: 'STOCK',
      fees: 0,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      setError('');

      const url = isEditMode ? `/api/trades/${tradeId}` : '/api/trades';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        if (response.status === 400) {
          setError(result.error || 'Invalid trade data. Please check all required fields and try again.');
        } else if (response.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else if (response.status === 404 && isEditMode) {
          setError('Trade not found. It may have been deleted.');
        } else if (response.status === 500) {
          setError('Unable to save trade due to a server error. Please try again in a moment.');
        } else {
          setError(result.error || `Failed to ${isEditMode ? 'update' : 'create'} trade. Please try again.`);
        }
        return;
      }

      const result = await response.json();

      // Call success callback or redirect
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/trades/${result.trade.id}`);
      }
    } catch (err) {
      console.error('Save trade error:', err);
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        setError('An unexpected error occurred while saving the trade. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="bg-danger-light border border-danger text-danger-dark px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Basic Information Section */}
      <div className="bg-card shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Symbol */}
          <div>
            <label htmlFor="symbol" className="block text-sm font-medium text-foreground mb-2">
              Symbol/Ticker <span className="text-danger">*</span>
            </label>
            <input
              id="symbol"
              type="text"
              {...register('symbol')}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              placeholder="AAPL, EUR/USD, BTC, etc."
              disabled={isLoading}
            />
            {errors.symbol && <p className="mt-1 text-sm text-danger">{errors.symbol.message}</p>}
          </div>

          {/* Asset Type */}
          <div>
            <label htmlFor="assetType" className="block text-sm font-medium text-foreground mb-2">
              Asset Type <span className="text-danger">*</span>
            </label>
            <select
              id="assetType"
              {...register('assetType')}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              disabled={isLoading}
            >
              <option value="STOCK">Stock</option>
              <option value="FOREX">Forex</option>
              <option value="CRYPTO">Crypto</option>
              <option value="OPTIONS">Options/Derivatives</option>
            </select>
            {errors.assetType && (
              <p className="mt-1 text-sm text-danger">{errors.assetType.message}</p>
            )}
          </div>

          {/* Currency */}
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-foreground mb-2">
              Currency
            </label>
            <select
              id="currency"
              {...register('currency')}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              disabled={isLoading}
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
              <option value="CHF">CHF - Swiss Franc</option>
            </select>
            {errors.currency && (
              <p className="mt-1 text-sm text-danger">{errors.currency.message}</p>
            )}
          </div>

          {/* Direction */}
          <div>
            <label htmlFor="direction" className="block text-sm font-medium text-foreground mb-2">
              Direction <span className="text-danger">*</span>
            </label>
            <select
              id="direction"
              {...register('direction')}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              disabled={isLoading}
            >
              <option value="LONG">Long</option>
              <option value="SHORT">Short</option>
            </select>
            {errors.direction && (
              <p className="mt-1 text-sm text-danger">{errors.direction.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Entry Details Section */}
      <div className="bg-card shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Entry Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="entryDate" className="block text-sm font-medium text-foreground mb-2">
              Entry Date & Time <span className="text-danger">*</span>
            </label>
            <input
              id="entryDate"
              type="datetime-local"
              {...register('entryDate')}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              disabled={isLoading}
            />
            {errors.entryDate && (
              <p className="mt-1 text-sm text-danger">{errors.entryDate.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="entryPrice" className="block text-sm font-medium text-foreground mb-2">
              Entry Price <span className="text-danger">*</span>
            </label>
            <input
              id="entryPrice"
              type="number"
              step="0.01"
              {...register('entryPrice', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              placeholder="0.00"
              disabled={isLoading}
            />
            {errors.entryPrice && (
              <p className="mt-1 text-sm text-danger">{errors.entryPrice.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-foreground mb-2">
              Quantity <span className="text-danger">*</span>
            </label>
            <input
              id="quantity"
              type="number"
              step="0.01"
              {...register('quantity', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              placeholder="0"
              disabled={isLoading}
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-danger">{errors.quantity.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Exit Details Section */}
      <div className="bg-card shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Exit Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="exitDate" className="block text-sm font-medium text-foreground mb-2">
              Exit Date & Time <span className="text-danger">*</span>
            </label>
            <input
              id="exitDate"
              type="datetime-local"
              {...register('exitDate')}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              disabled={isLoading}
            />
            {errors.exitDate && (
              <p className="mt-1 text-sm text-danger">{errors.exitDate.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="exitPrice" className="block text-sm font-medium text-foreground mb-2">
              Exit Price <span className="text-danger">*</span>
            </label>
            <input
              id="exitPrice"
              type="number"
              step="0.01"
              {...register('exitPrice', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              placeholder="0.00"
              disabled={isLoading}
            />
            {errors.exitPrice && (
              <p className="mt-1 text-sm text-danger">{errors.exitPrice.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Trade Strategy Section */}
      <div className="bg-card shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Strategy & Risk Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="strategyName" className="block text-sm font-medium text-foreground mb-2">
              Strategy Name
            </label>
            <input
              id="strategyName"
              type="text"
              {...register('strategyName')}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              placeholder="e.g., Momentum Play, Breakout"
              disabled={isLoading}
            />
            {errors.strategyName && (
              <p className="mt-1 text-sm text-danger">{errors.strategyName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="setupType" className="block text-sm font-medium text-foreground mb-2">
              Setup Type
            </label>
            <input
              id="setupType"
              type="text"
              {...register('setupType')}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              placeholder="e.g., Pullback, Reversal, Continuation"
              disabled={isLoading}
            />
            {errors.setupType && (
              <p className="mt-1 text-sm text-danger">{errors.setupType.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="stopLoss" className="block text-sm font-medium text-foreground mb-2">
              Stop Loss
            </label>
            <input
              id="stopLoss"
              type="number"
              step="0.01"
              {...register('stopLoss', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              placeholder="0.00"
              disabled={isLoading}
            />
            {errors.stopLoss && (
              <p className="mt-1 text-sm text-danger">{errors.stopLoss.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="takeProfit" className="block text-sm font-medium text-foreground mb-2">
              Take Profit Target
            </label>
            <input
              id="takeProfit"
              type="number"
              step="0.01"
              {...register('takeProfit', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              placeholder="0.00"
              disabled={isLoading}
            />
            {errors.takeProfit && (
              <p className="mt-1 text-sm text-danger">{errors.takeProfit.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="riskRewardRatio" className="block text-sm font-medium text-foreground mb-2">
              Planned Risk/Reward Ratio
            </label>
            <input
              id="riskRewardRatio"
              type="number"
              step="0.1"
              {...register('riskRewardRatio', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              placeholder="e.g., 2.0"
              disabled={isLoading}
            />
            {errors.riskRewardRatio && (
              <p className="mt-1 text-sm text-danger">{errors.riskRewardRatio.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="fees" className="block text-sm font-medium text-foreground mb-2">
              Commissions/Fees
            </label>
            <input
              id="fees"
              type="number"
              step="0.01"
              {...register('fees', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              placeholder="0.00"
              disabled={isLoading}
            />
            {errors.fees && <p className="mt-1 text-sm text-danger">{errors.fees.message}</p>}
          </div>
        </div>
      </div>

      {/* Context Section */}
      <div className="bg-card shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Context & Conditions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="timeOfDay" className="block text-sm font-medium text-foreground mb-2">
              Time of Day
            </label>
            <select
              id="timeOfDay"
              {...register('timeOfDay')}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              disabled={isLoading}
            >
              <option value="">Select time of day</option>
              <option value="PRE_MARKET">Pre-Market</option>
              <option value="MARKET_OPEN">Market Open</option>
              <option value="MID_DAY">Mid-Day</option>
              <option value="MARKET_CLOSE">Market Close</option>
              <option value="AFTER_HOURS">After Hours</option>
            </select>
            {errors.timeOfDay && (
              <p className="mt-1 text-sm text-danger">{errors.timeOfDay.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="marketConditions" className="block text-sm font-medium text-foreground mb-2">
              Market Conditions
            </label>
            <select
              id="marketConditions"
              {...register('marketConditions')}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              disabled={isLoading}
            >
              <option value="">Select market conditions</option>
              <option value="TRENDING">Trending</option>
              <option value="RANGING">Ranging</option>
              <option value="VOLATILE">Volatile</option>
              <option value="CALM">Calm</option>
            </select>
            {errors.marketConditions && (
              <p className="mt-1 text-sm text-danger">{errors.marketConditions.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="emotionalStateEntry" className="block text-sm font-medium text-foreground mb-2">
              Emotional State at Entry
            </label>
            <input
              id="emotionalStateEntry"
              type="text"
              {...register('emotionalStateEntry')}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              placeholder="e.g., Confident, Fearful, FOMO, Disciplined"
              disabled={isLoading}
            />
            {errors.emotionalStateEntry && (
              <p className="mt-1 text-sm text-danger">{errors.emotionalStateEntry.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="emotionalStateExit" className="block text-sm font-medium text-foreground mb-2">
              Emotional State at Exit
            </label>
            <input
              id="emotionalStateExit"
              type="text"
              {...register('emotionalStateExit')}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              placeholder="e.g., Satisfied, Regretful, Relieved"
              disabled={isLoading}
            />
            {errors.emotionalStateExit && (
              <p className="mt-1 text-sm text-danger">{errors.emotionalStateExit.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-card shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Trade Notes & Journal</h2>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
            Notes
          </label>
          <textarea
            id="notes"
            {...register('notes')}
            rows={8}
            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
            placeholder="Write about your analysis, reasoning, what you learned, etc."
            disabled={isLoading}
          />
          {errors.notes && <p className="mt-1 text-sm text-danger">{errors.notes.message}</p>}
          <p className="mt-1 text-sm text-muted-foreground">
            Document your pre-trade analysis, post-trade reflections, and lessons learned
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-border rounded-lg hover:bg-muted text-foreground transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-primary hover:bg-primary-hover text-primary-foreground font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : isEditMode ? 'Update Trade' : 'Create Trade'}
        </button>
      </div>
    </form>
  );
}
