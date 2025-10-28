'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tradeSchema, type TradeInput } from '@/lib/validation';
import { Trade } from '@/lib/types';

interface TradeFormProps {
  trade?: Trade;
  userId: string;
  onSuccess?: () => void;
}

export function TradeForm({ trade, userId, onSuccess }: TradeFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!trade;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(tradeSchema),
    defaultValues: trade
      ? {
          symbol: trade.symbol,
          assetType: trade.assetType,
          currency: trade.currency,
          entryDate: new Date(trade.entryDate).toISOString().slice(0, 16),
          entryPrice: trade.entryPrice,
          exitDate: new Date(trade.exitDate).toISOString().slice(0, 16),
          exitPrice: trade.exitPrice,
          quantity: trade.quantity,
          direction: trade.direction,
          setupType: trade.setupType || '',
          strategyName: trade.strategyName || '',
          stopLoss: trade.stopLoss || undefined,
          takeProfit: trade.takeProfit || undefined,
          riskRewardRatio: trade.riskRewardRatio || undefined,
          fees: trade.fees || 0,
          timeOfDay: trade.timeOfDay || undefined,
          marketConditions: trade.marketConditions || undefined,
          emotionalStateEntry: trade.emotionalStateEntry || '',
          emotionalStateExit: trade.emotionalStateExit || '',
          notes: trade.notes || '',
        }
      : {
          currency: 'USD',
          direction: 'LONG',
          assetType: 'STOCK',
          fees: 0,
        },
  });

  const onSubmit = async (data: TradeInput) => {
    try {
      setIsLoading(true);
      setError('');

      const url = isEditing ? `/api/trades/${trade.id}` : '/api/trades';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          userId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || `Failed to ${isEditing ? 'update' : 'create'} trade`);
        return;
      }

      if (onSuccess) {
        onSuccess();
      } else if (isEditing) {
        router.push(`/trades/${trade.id}`);
        router.refresh();
      } else {
        router.push('/trades');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Trade form error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* FR-1: Basic Trade Information */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Symbol */}
          <div>
            <label htmlFor="symbol" className="block text-sm font-medium mb-2">
              Symbol/Ticker <span className="text-red-500">*</span>
            </label>
            <input
              id="symbol"
              type="text"
              {...register('symbol')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900"
              placeholder="AAPL"
              disabled={isLoading}
            />
            {errors.symbol && (
              <p className="mt-1 text-sm text-red-600">{errors.symbol.message}</p>
            )}
          </div>

          {/* Asset Type */}
          <div>
            <label htmlFor="assetType" className="block text-sm font-medium mb-2">
              Asset Type <span className="text-red-500">*</span>
            </label>
            <select
              id="assetType"
              {...register('assetType')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900"
              disabled={isLoading}
            >
              <option value="STOCK">Stock</option>
              <option value="FOREX">Forex</option>
              <option value="CRYPTO">Crypto</option>
              <option value="OPTIONS">Options/Derivatives</option>
            </select>
            {errors.assetType && (
              <p className="mt-1 text-sm text-red-600">{errors.assetType.message}</p>
            )}
          </div>

          {/* Currency */}
          <div>
            <label htmlFor="currency" className="block text-sm font-medium mb-2">
              Currency
            </label>
            <select
              id="currency"
              {...register('currency')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900"
              disabled={isLoading}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
              <option value="CHF">CHF</option>
            </select>
          </div>

          {/* Direction */}
          <div>
            <label htmlFor="direction" className="block text-sm font-medium mb-2">
              Direction <span className="text-red-500">*</span>
            </label>
            <select
              id="direction"
              {...register('direction')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900"
              disabled={isLoading}
            >
              <option value="LONG">Long</option>
              <option value="SHORT">Short</option>
            </select>
            {errors.direction && (
              <p className="mt-1 text-sm text-red-600">{errors.direction.message}</p>
            )}
          </div>

          {/* Entry Date */}
          <div>
            <label htmlFor="entryDate" className="block text-sm font-medium mb-2">
              Entry Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              id="entryDate"
              type="datetime-local"
              {...register('entryDate')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900"
              disabled={isLoading}
            />
            {errors.entryDate && (
              <p className="mt-1 text-sm text-red-600">{errors.entryDate.message}</p>
            )}
          </div>

          {/* Entry Price */}
          <div>
            <label htmlFor="entryPrice" className="block text-sm font-medium mb-2">
              Entry Price <span className="text-red-500">*</span>
            </label>
            <input
              id="entryPrice"
              type="number"
              step="0.01"
              {...register('entryPrice', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900"
              placeholder="100.00"
              disabled={isLoading}
            />
            {errors.entryPrice && (
              <p className="mt-1 text-sm text-red-600">{errors.entryPrice.message}</p>
            )}
          </div>

          {/* Exit Date */}
          <div>
            <label htmlFor="exitDate" className="block text-sm font-medium mb-2">
              Exit Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              id="exitDate"
              type="datetime-local"
              {...register('exitDate')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900"
              disabled={isLoading}
            />
            {errors.exitDate && (
              <p className="mt-1 text-sm text-red-600">{errors.exitDate.message}</p>
            )}
          </div>

          {/* Exit Price */}
          <div>
            <label htmlFor="exitPrice" className="block text-sm font-medium mb-2">
              Exit Price <span className="text-red-500">*</span>
            </label>
            <input
              id="exitPrice"
              type="number"
              step="0.01"
              {...register('exitPrice', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900"
              placeholder="105.00"
              disabled={isLoading}
            />
            {errors.exitPrice && (
              <p className="mt-1 text-sm text-red-600">{errors.exitPrice.message}</p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium mb-2">
              Quantity/Position Size <span className="text-red-500">*</span>
            </label>
            <input
              id="quantity"
              type="number"
              step="0.01"
              {...register('quantity', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900"
              placeholder="100"
              disabled={isLoading}
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
            )}
          </div>

          {/* Fees */}
          <div>
            <label htmlFor="fees" className="block text-sm font-medium mb-2">
              Fees/Commissions
            </label>
            <input
              id="fees"
              type="number"
              step="0.01"
              {...register('fees', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900"
              placeholder="0.00"
              disabled={isLoading}
            />
            {errors.fees && <p className="mt-1 text-sm text-red-600">{errors.fees.message}</p>}
          </div>
        </div>
      </div>

      {/* FR-2: Trade Metadata */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Trade Metadata</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Setup Type */}
          <div>
            <label htmlFor="setupType" className="block text-sm font-medium mb-2">
              Setup Type
            </label>
            <input
              id="setupType"
              type="text"
              {...register('setupType')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900"
              placeholder="e.g., breakout, pullback, reversal"
              disabled={isLoading}
            />
            {errors.setupType && (
              <p className="mt-1 text-sm text-red-600">{errors.setupType.message}</p>
            )}
          </div>

          {/* Strategy Name */}
          <div>
            <label htmlFor="strategyName" className="block text-sm font-medium mb-2">
              Strategy Name
            </label>
            <input
              id="strategyName"
              type="text"
              {...register('strategyName')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900"
              placeholder="e.g., Momentum Play, Support Bounce"
              disabled={isLoading}
            />
            {errors.strategyName && (
              <p className="mt-1 text-sm text-red-600">{errors.strategyName.message}</p>
            )}
          </div>

          {/* Stop Loss */}
          <div>
            <label htmlFor="stopLoss" className="block text-sm font-medium mb-2">
              Stop Loss Level
            </label>
            <input
              id="stopLoss"
              type="number"
              step="0.01"
              {...register('stopLoss', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900"
              placeholder="95.00"
              disabled={isLoading}
            />
            {errors.stopLoss && (
              <p className="mt-1 text-sm text-red-600">{errors.stopLoss.message}</p>
            )}
          </div>

          {/* Take Profit */}
          <div>
            <label htmlFor="takeProfit" className="block text-sm font-medium mb-2">
              Take Profit Target
            </label>
            <input
              id="takeProfit"
              type="number"
              step="0.01"
              {...register('takeProfit', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900"
              placeholder="110.00"
              disabled={isLoading}
            />
            {errors.takeProfit && (
              <p className="mt-1 text-sm text-red-600">{errors.takeProfit.message}</p>
            )}
          </div>

          {/* Risk/Reward Ratio */}
          <div>
            <label htmlFor="riskRewardRatio" className="block text-sm font-medium mb-2">
              Planned Risk/Reward Ratio
            </label>
            <input
              id="riskRewardRatio"
              type="number"
              step="0.1"
              {...register('riskRewardRatio', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900"
              placeholder="2.0"
              disabled={isLoading}
            />
            {errors.riskRewardRatio && (
              <p className="mt-1 text-sm text-red-600">{errors.riskRewardRatio.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* FR-3: Context Information */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Context & Conditions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Time of Day */}
          <div>
            <label htmlFor="timeOfDay" className="block text-sm font-medium mb-2">
              Time of Day
            </label>
            <select
              id="timeOfDay"
              {...register('timeOfDay')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900"
              disabled={isLoading}
            >
              <option value="">Select...</option>
              <option value="PRE_MARKET">Pre-Market</option>
              <option value="MARKET_OPEN">Market Open</option>
              <option value="MID_DAY">Mid-Day</option>
              <option value="MARKET_CLOSE">Market Close</option>
              <option value="AFTER_HOURS">After Hours</option>
            </select>
            {errors.timeOfDay && (
              <p className="mt-1 text-sm text-red-600">{errors.timeOfDay.message}</p>
            )}
          </div>

          {/* Market Conditions */}
          <div>
            <label htmlFor="marketConditions" className="block text-sm font-medium mb-2">
              Market Conditions
            </label>
            <select
              id="marketConditions"
              {...register('marketConditions')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900"
              disabled={isLoading}
            >
              <option value="">Select...</option>
              <option value="TRENDING">Trending</option>
              <option value="RANGING">Ranging</option>
              <option value="VOLATILE">Volatile</option>
              <option value="CALM">Calm</option>
            </select>
            {errors.marketConditions && (
              <p className="mt-1 text-sm text-red-600">{errors.marketConditions.message}</p>
            )}
          </div>

          {/* Emotional State at Entry */}
          <div>
            <label htmlFor="emotionalStateEntry" className="block text-sm font-medium mb-2">
              Emotional State at Entry
            </label>
            <input
              id="emotionalStateEntry"
              type="text"
              {...register('emotionalStateEntry')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900"
              placeholder="e.g., confident, fearful, FOMO, disciplined"
              disabled={isLoading}
            />
            {errors.emotionalStateEntry && (
              <p className="mt-1 text-sm text-red-600">{errors.emotionalStateEntry.message}</p>
            )}
          </div>

          {/* Emotional State at Exit */}
          <div>
            <label htmlFor="emotionalStateExit" className="block text-sm font-medium mb-2">
              Emotional State at Exit
            </label>
            <input
              id="emotionalStateExit"
              type="text"
              {...register('emotionalStateExit')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900"
              placeholder="e.g., satisfied, regret, relieved"
              disabled={isLoading}
            />
            {errors.emotionalStateExit && (
              <p className="mt-1 text-sm text-red-600">{errors.emotionalStateExit.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* FR-6: Notes */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Journal Notes</h2>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-2">
            Trade Notes & Reflections
          </label>
          <textarea
            id="notes"
            {...register('notes')}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900"
            placeholder="Detailed notes about your trade, pre-trade analysis, post-trade reflections, lessons learned..."
            disabled={isLoading}
          />
          {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : isEditing ? 'Update Trade' : 'Create Trade'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isLoading}
          className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

