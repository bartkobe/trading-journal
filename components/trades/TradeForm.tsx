'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trade, Screenshot } from '@/lib/types';
import { AssetType, Direction, TimeOfDay, MarketConditions } from '@prisma/client';
import { tradeSchema, type TradeInput } from '@/lib/validation';
import { CurrencySelector } from '@/components/ui/CurrencySelector';
import { TagInput } from '@/components/ui/TagInput';
import { ScreenshotUpload } from '@/components/ui/ScreenshotUpload';
import { RichTextEditor } from '@/components/ui/RichTextEditor';

interface TradeFormProps {
  trade?: Trade;
  userId: string;
  onSuccess?: () => void;
}

export function TradeForm({ trade, userId, onSuccess }: TradeFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(tradeSchema),
    defaultValues: trade
      ? {
          symbol: trade.symbol,
          assetType: trade.assetType,
          currency: trade.currency,
          direction: trade.direction,
          entryDate: trade.entryDate ? new Date(trade.entryDate) : undefined,
          entryPrice: trade.entryPrice,
          exitDate: trade.exitDate ? new Date(trade.exitDate) : undefined,
          exitPrice: trade.exitPrice,
          quantity: trade.quantity,
          fees: trade.fees || 0,
          setupType: trade.setupType || '',
          strategyName: trade.strategyName || '',
          stopLoss: trade.stopLoss || undefined,
          takeProfit: trade.takeProfit || undefined,
          riskRewardRatio: trade.riskRewardRatio || undefined,
          timeOfDay: trade.timeOfDay || undefined,
          marketConditions: trade.marketConditions || undefined,
          emotionalStateEntry: trade.emotionalStateEntry || '',
          emotionalStateExit: trade.emotionalStateExit || '',
          notes: trade.notes || '',
          tags: trade.tags?.map((tt) => tt.tag.name) || [],
        }
      : {
          currency: 'USD',
          direction: Direction.LONG,
          assetType: AssetType.STOCK,
          fees: 0,
          tags: [],
        },
  });

  const [selectedTags, setSelectedTags] = useState<string[]>(
    trade?.tags?.map((tt) => tt.tag.name) || []
  );
  const [localScreenshots, setLocalScreenshots] = useState<Screenshot[]>(
    (trade?.screenshots as Screenshot[]) || []
  );
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!trade;

  useEffect(() => {
    setValue('tags', selectedTags);
  }, [selectedTags, setValue]);

  const handleScreenshotUpload = (newScreenshot: Screenshot) => {
    setLocalScreenshots((prev) => [...prev, newScreenshot]);
  };

  const handleScreenshotDelete = (screenshotId: string) => {
    setLocalScreenshots((prev) => prev.filter((s) => s.id !== screenshotId));
  };

  const onSubmit = async (data: TradeInput) => {
    try {
      setError(null);

      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `/api/trades/${trade.id}` : '/api/trades';

      const payload = {
        ...data,
        userId,
        entryDate: data.entryDate?.toISOString(),
        exitDate: data.exitDate?.toISOString(),
        tags: selectedTags,
        screenshots: localScreenshots.map((s) => ({
          id: s.id,
          url: s.url,
          filename: s.filename,
          mimeType: s.mimeType,
          fileSize: s.fileSize,
        })),
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} trade`);
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
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      console.error('Form submission error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Basic Trade Information */}
      <section className="rounded-lg bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">Basic Trade Information</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Symbol */}
          <div>
            <label htmlFor="symbol" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Symbol/Ticker <span className="text-red-500">*</span>
            </label>
            <input
              id="symbol"
              type="text"
              {...register('symbol')}
              className="w-full rounded-md border border-gray-300 bg-background px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
              placeholder="AAPL"
            />
            {errors.symbol && <p className="mt-1 text-sm text-red-500">{errors.symbol.message}</p>}
          </div>

          {/* Asset Type */}
          <div>
            <label htmlFor="assetType" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Asset Type <span className="text-red-500">*</span>
            </label>
            <select
              id="assetType"
              {...register('assetType')}
              className="w-full rounded-md border border-gray-300 bg-background px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
            >
              {Object.values(AssetType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.assetType && <p className="mt-1 text-sm text-red-500">{errors.assetType.message}</p>}
          </div>

          {/* Currency */}
          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <CurrencySelector {...field} label="Currency" error={errors.currency?.message} />
            )}
          />

          {/* Direction */}
          <div>
            <label htmlFor="direction" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Direction <span className="text-red-500">*</span>
            </label>
            <select
              id="direction"
              {...register('direction')}
              className="w-full rounded-md border border-gray-300 bg-background px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
            >
              {Object.values(Direction).map((dir) => (
                <option key={dir} value={dir}>
                  {dir}
                </option>
              ))}
            </select>
            {errors.direction && <p className="mt-1 text-sm text-red-500">{errors.direction.message}</p>}
          </div>

          {/* Entry Date & Time */}
          <div>
            <label htmlFor="entryDate" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Entry Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              id="entryDate"
              type="datetime-local"
              {...register('entryDate', { valueAsDate: true })}
              className="w-full rounded-md border border-gray-300 bg-background px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
            />
            {errors.entryDate && <p className="mt-1 text-sm text-red-500">{errors.entryDate.message}</p>}
          </div>

          {/* Entry Price */}
          <div>
            <label htmlFor="entryPrice" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Entry Price <span className="text-red-500">*</span>
            </label>
            <input
              id="entryPrice"
              type="number"
              step="any"
              {...register('entryPrice', { valueAsNumber: true })}
              className="w-full rounded-md border border-gray-300 bg-background px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
              placeholder="100.00"
            />
            {errors.entryPrice && <p className="mt-1 text-sm text-red-500">{errors.entryPrice.message}</p>}
          </div>

          {/* Exit Date & Time */}
          <div>
            <label htmlFor="exitDate" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Exit Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              id="exitDate"
              type="datetime-local"
              {...register('exitDate', { valueAsDate: true })}
              className="w-full rounded-md border border-gray-300 bg-background px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
            />
            {errors.exitDate && <p className="mt-1 text-sm text-red-500">{errors.exitDate.message}</p>}
          </div>

          {/* Exit Price */}
          <div>
            <label htmlFor="exitPrice" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Exit Price <span className="text-red-500">*</span>
            </label>
            <input
              id="exitPrice"
              type="number"
              step="any"
              {...register('exitPrice', { valueAsNumber: true })}
              className="w-full rounded-md border border-gray-300 bg-background px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
              placeholder="105.00"
            />
            {errors.exitPrice && <p className="mt-1 text-sm text-red-500">{errors.exitPrice.message}</p>}
          </div>

          {/* Quantity */}
          <div>
            <label htmlFor="quantity" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Quantity/Position Size <span className="text-red-500">*</span>
            </label>
            <input
              id="quantity"
              type="number"
              step="any"
              {...register('quantity', { valueAsNumber: true })}
              className="w-full rounded-md border border-gray-300 bg-background px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
              placeholder="100"
            />
            {errors.quantity && <p className="mt-1 text-sm text-red-500">{errors.quantity.message}</p>}
          </div>

          {/* Fees */}
          <div>
            <label htmlFor="fees" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Fees/Commissions
            </label>
            <input
              id="fees"
              type="number"
              step="any"
              {...register('fees', { valueAsNumber: true })}
              className="w-full rounded-md border border-gray-300 bg-background px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
              placeholder="0.00"
            />
            {errors.fees && <p className="mt-1 text-sm text-red-500">{errors.fees.message}</p>}
          </div>
        </div>
      </section>

      {/* Trade Metadata */}
      <section className="rounded-lg bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">Trade Metadata</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Setup Type */}
          <div>
            <label htmlFor="setupType" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Setup Type
            </label>
            <input
              id="setupType"
              type="text"
              {...register('setupType')}
              className="w-full rounded-md border border-gray-300 bg-background px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
              placeholder="e.g., breakout, pullback, reversal"
            />
            {errors.setupType && <p className="mt-1 text-sm text-red-500">{errors.setupType.message}</p>}
          </div>

          {/* Strategy Name */}
          <div>
            <label htmlFor="strategyName" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Strategy Name
            </label>
            <input
              id="strategyName"
              type="text"
              {...register('strategyName')}
              className="w-full rounded-md border border-gray-300 bg-background px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
              placeholder="e.g., Momentum Play, Support Bounce"
            />
            {errors.strategyName && <p className="mt-1 text-sm text-red-500">{errors.strategyName.message}</p>}
          </div>

          {/* Stop Loss */}
          <div>
            <label htmlFor="stopLoss" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Stop Loss Level
            </label>
            <input
              id="stopLoss"
              type="number"
              step="any"
              {...register('stopLoss', { valueAsNumber: true })}
              className="w-full rounded-md border border-gray-300 bg-background px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
              placeholder="95.00"
            />
            {errors.stopLoss && <p className="mt-1 text-sm text-red-500">{errors.stopLoss.message}</p>}
          </div>

          {/* Take Profit */}
          <div>
            <label htmlFor="takeProfit" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Take Profit Target
            </label>
            <input
              id="takeProfit"
              type="number"
              step="any"
              {...register('takeProfit', { valueAsNumber: true })}
              className="w-full rounded-md border border-gray-300 bg-background px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
              placeholder="110.00"
            />
            {errors.takeProfit && <p className="mt-1 text-sm text-red-500">{errors.takeProfit.message}</p>}
          </div>

          {/* Risk/Reward Ratio */}
          <div>
            <label htmlFor="riskRewardRatio" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Planned Risk/Reward Ratio
            </label>
            <input
              id="riskRewardRatio"
              type="number"
              step="any"
              {...register('riskRewardRatio', { valueAsNumber: true })}
              className="w-full rounded-md border border-gray-300 bg-background px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
              placeholder="2.0"
            />
            {errors.riskRewardRatio && (
              <p className="mt-1 text-sm text-red-500">{errors.riskRewardRatio.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* Context Information */}
      <section className="rounded-lg bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">Context Information</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Time of Day */}
          <div>
            <label htmlFor="timeOfDay" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Time of Day
            </label>
            <select
              id="timeOfDay"
              {...register('timeOfDay')}
              className="w-full rounded-md border border-gray-300 bg-background px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="">Select...</option>
              {Object.values(TimeOfDay).map((time) => (
                <option key={time} value={time}>
                  {time.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            {errors.timeOfDay && <p className="mt-1 text-sm text-red-500">{errors.timeOfDay.message}</p>}
          </div>

          {/* Market Conditions */}
          <div>
            <label htmlFor="marketConditions" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Market Conditions
            </label>
            <select
              id="marketConditions"
              {...register('marketConditions')}
              className="w-full rounded-md border border-gray-300 bg-background px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="">Select...</option>
              {Object.values(MarketConditions).map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
            {errors.marketConditions && (
              <p className="mt-1 text-sm text-red-500">{errors.marketConditions.message}</p>
            )}
          </div>

          {/* Emotional State at Entry */}
          <div>
            <label htmlFor="emotionalStateEntry" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Emotional State at Entry
            </label>
            <input
              id="emotionalStateEntry"
              type="text"
              {...register('emotionalStateEntry')}
              className="w-full rounded-md border border-gray-300 bg-background px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
              placeholder="e.g., confident, fearful, FOMO, disciplined"
            />
            {errors.emotionalStateEntry && (
              <p className="mt-1 text-sm text-red-500">{errors.emotionalStateEntry.message}</p>
            )}
          </div>

          {/* Emotional State at Exit */}
          <div>
            <label htmlFor="emotionalStateExit" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Emotional State at Exit
            </label>
            <input
              id="emotionalStateExit"
              type="text"
              {...register('emotionalStateExit')}
              className="w-full rounded-md border border-gray-300 bg-background px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
              placeholder="e.g., satisfied, regret, relieved"
            />
            {errors.emotionalStateExit && (
              <p className="mt-1 text-sm text-red-500">{errors.emotionalStateExit.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* Tags */}
      <section className="rounded-lg bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">Tags</h2>
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <TagInput
              value={selectedTags}
              onChange={setSelectedTags}
              label="Custom Tags"
              placeholder="Add tags (e.g., breakout, earnings-play)"
              error={errors.tags?.message}
            />
          )}
        />
      </section>

      {/* Screenshots */}
      <section className="rounded-lg bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">Screenshots</h2>
        <ScreenshotUpload
          tradeId={trade?.id}
          existingScreenshots={localScreenshots as any}
          onUploadComplete={handleScreenshotUpload as any}
          onDeleteSuccess={handleScreenshotDelete}
        />
      </section>

      {/* Notes */}
      <section className="rounded-lg bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">Trade Notes & Reflections</h2>
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              value={field.value || ''}
              onChange={field.onChange}
              label="Detailed Journal Entry"
              placeholder="Document your pre-trade analysis, post-trade reflections, and lessons learned..."
              minHeight="250px"
              error={errors.notes?.message}
            />
          )}
        />
      </section>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="rounded-md border border-gray-300 bg-background px-6 py-2 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center rounded-md bg-primary-600 px-6 py-2 text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Trade' : 'Record Trade'}
        </button>
      </div>
    </form>
  );
}
