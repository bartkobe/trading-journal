'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { tradeSchema, type TradeInput } from '@/lib/validation';
import { CurrencySelector } from '@/components/ui/CurrencySelector';
import { ScreenshotUpload } from '@/components/ui/ScreenshotUpload';

interface TradeFormProps {
  tradeId?: string;
  initialData?: Partial<TradeInput>;
  onSuccess?: () => void;
}

export function TradeForm({ tradeId, initialData, onSuccess }: TradeFormProps) {
  const router = useRouter();
  const t = useTranslations('forms');
  const tTrades = useTranslations('trades');
  const tErrors = useTranslations('errors');
  const tCommon = useTranslations('common');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTradeOpen, setIsTradeOpen] = useState<boolean>(() => {
    // Check if trade is initially open (no exitDate/exitPrice in initialData)
    if (initialData) {
      return !initialData.exitDate && !initialData.exitPrice;
    }
    return true; // Default to open for new trades
  });
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<any>(null);
  const [tempFiles, setTempFiles] = useState<Array<{
    tempFileId: string;
    publicId: string;
    url: string;
    filename: string;
    fileSize?: number;
    mimeType?: string;
  }>>([]);
  const [uploadedScreenshots, setUploadedScreenshots] = useState<any[]>([]);

  const isEditMode = !!tradeId;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
    setValue,
  } = useForm({
    resolver: zodResolver(tradeSchema) as any,
    defaultValues: initialData || {
      currency: 'USD',
      direction: 'LONG',
      assetType: 'STOCK',
      fees: 0,
    },
  });

  // Watch exit fields to determine if trade is open
  const exitDate = watch('exitDate');
  const exitPrice = watch('exitPrice');
  const wasOpenInitially = !initialData?.exitDate && !initialData?.exitPrice;

  // Track if user has manually toggled the checkbox (to prevent auto-reset)
  const [manualToggle, setManualToggle] = useState(false);
  
  // Ref for the confirmation dialog to scroll into view when it appears
  const [confirmDialogElement, setConfirmDialogElement] = useState<HTMLDivElement | null>(null);

  // Update isTradeOpen when exit fields change
  // Only automatically close the trade when BOTH fields are filled
  // Don't reset it to open if user manually unchecked and is filling fields
  useEffect(() => {
    const hasExitData = exitDate && exitPrice;
    // Only auto-update if both fields are filled (close the trade automatically)
    // Or if both are empty (open the trade automatically) AND user hasn't manually toggled
    if (hasExitData) {
      setIsTradeOpen(false);
      setManualToggle(false); // Reset manual toggle since both fields are now filled
    } else if (!exitDate && !exitPrice && !manualToggle) {
      // Only auto-open if both are empty AND user hasn't manually unchecked
      setIsTradeOpen(true);
    }
    // If user manually unchecked and is filling fields (one or neither filled), don't reset
  }, [exitDate, exitPrice, manualToggle]);

  // Scroll confirmation dialog into view when it appears
  useEffect(() => {
    if (showCloseConfirm && confirmDialogElement) {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        confirmDialogElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);
    }
  }, [showCloseConfirm, confirmDialogElement]);

  // Load existing screenshots when in edit mode
  useEffect(() => {
    if (isEditMode && tradeId) {
      const loadScreenshots = async () => {
        try {
          const response = await fetch(`/api/trades/${tradeId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.trade?.screenshots) {
              setUploadedScreenshots(data.trade.screenshots);
            }
          }
        } catch (error) {
          console.error('Failed to load screenshots:', error);
        }
      };
      loadScreenshots();
    }
  }, [isEditMode, tradeId]);

  // Handle "Trade is still open" toggle
  const handleTradeOpenToggle = (checked: boolean) => {
    setIsTradeOpen(checked);
    setManualToggle(true); // Mark as manual toggle to prevent auto-reset
    if (checked) {
      // Clear exit fields when marking as open
      setValue('exitDate', undefined);
      setValue('exitPrice', undefined);
    }
  };

  const doSubmit = async (data: any) => {
    // Helper function to convert NaN to undefined for optional number fields
    const cleanNumber = (val: any): number | undefined => {
      if (val === null || val === '' || (typeof val === 'number' && isNaN(val))) {
        return undefined;
      }
      return val;
    };

    // Prepare data: convert NaN/empty to undefined/null for optional fields
    // Handle exitDate: convert empty string/undefined to null
    let exitDateValue: string | null = null;
    if (data.exitDate) {
      if (typeof data.exitDate === 'string' && data.exitDate.trim() !== '') {
        exitDateValue = data.exitDate;
      }
      // If it's a Date object, convert to ISO string
      else if (data.exitDate instanceof Date) {
        exitDateValue = data.exitDate.toISOString().slice(0, 16); // Format for datetime-local
      }
    }
    const exitPriceValue = cleanNumber(data.exitPrice);
    
    const submitData: any = {
      ...data,
    };
    
    // Ensure both exit fields are either both null or both have values
    // If trade is open (checkbox checked), both should be null
    if (isTradeOpen || (!exitDateValue && !exitPriceValue)) {
      submitData.exitDate = null;
      submitData.exitPrice = null;
    } else {
      submitData.exitDate = exitDateValue;
      submitData.exitPrice = exitPriceValue ?? null;
    }

    // Only include optional number fields if they have values (omit undefined)
    const optionalFields = ['stopLoss', 'takeProfit', 'riskRewardRatio', 'actualRiskReward'];
    optionalFields.forEach((field) => {
      const cleaned = cleanNumber(data[field]);
      if (cleaned !== undefined) {
        submitData[field] = cleaned;
      } else {
        // Remove the field if it's undefined to avoid sending it
        delete submitData[field];
      }
    });

    // Fees defaults to 0 if empty
    submitData.fees = cleanNumber(data.fees) ?? 0;

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
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const result = await response.json();
        if (response.status === 400) {
          // Display detailed validation errors if available
          if (result.details) {
            const errorMessages: string[] = [];
            Object.entries(result.details).forEach(([field, errors]) => {
              if (Array.isArray(errors)) {
                errorMessages.push(`${field}: ${errors.join(', ')}`);
              }
            });
            setError(errorMessages.length > 0 
              ? `${tErrors('validationErrors')} ${errorMessages.join('; ')}` 
              : result.error || tErrors('invalidTradeData'));
          } else {
            setError(result.error || tErrors('invalidTradeData'));
          }
          console.error('Validation error details:', result.details);
        } else if (response.status === 401) {
          setError(tErrors('sessionExpired'));
        } else if (response.status === 404 && isEditMode) {
          setError(tErrors('tradeNotFound'));
        } else if (response.status === 500) {
          const errorMsg = result.details ? `${result.error}: ${result.details}` : result.error || tErrors('serverErrorSaveTrade');
          setError(errorMsg);
          console.error('Server error details:', result);
        } else {
          setError(result.error || (isEditMode ? tErrors('failedToUpdateTrade') : tErrors('failedToCreateTrade')));
        }
        return;
      }

      const result = await response.json();
      const tradeIdFromResponse = result.trade.id;

      // If this is a new trade and we have temporary files, associate them
      if (!isEditMode && tempFiles.length > 0 && tradeIdFromResponse) {
        try {
          // Convert tempFiles to the format expected by the associate endpoint
          const tempFilesForAssociate = tempFiles.map((tf) => ({
            publicId: tf.publicId,
            filename: tf.filename,
            fileSize: tf.fileSize,
            mimeType: tf.mimeType,
          }));

          const associateResponse = await fetch(`/api/trades/${tradeIdFromResponse}/screenshots/associate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tempFiles: tempFilesForAssociate }),
          });

          if (!associateResponse.ok) {
            const associateResult = await associateResponse.json();
            console.error('Failed to associate screenshots:', associateResult);
            // Don't fail the whole operation, just log the error
            // The trade was created successfully, screenshots can be added later
            setError(
              tErrors('tradeCreatedButScreenshotsFailed') || 
              'Trade created successfully, but some screenshots could not be attached. You can add them later.'
            );
          }
        } catch (associateError) {
          console.error('Error associating screenshots:', associateError);
          // Don't fail the whole operation
          setError(
            tErrors('tradeCreatedButScreenshotsFailed') || 
            'Trade created successfully, but screenshots could not be attached. You can add them later.'
          );
        }
      }

      // Call success callback or redirect
      if (onSuccess) {
        onSuccess();
      } else {
        // Use next-intl router which automatically handles locale prefix
        router.push(`/trades/${tradeIdFromResponse}`);
      }
    } catch (err) {
      console.error('Save trade error:', err);
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError(tErrors('unableToConnect'));
      } else {
        setError(tErrors('unexpectedErrorSavingTrade'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    // If trade is marked as open, clear exit fields before validation/submission
    if (isTradeOpen) {
      data.exitDate = undefined;
      data.exitPrice = undefined;
      // Also clear from form state to prevent validation errors
      setValue('exitDate', undefined);
      setValue('exitPrice', undefined);
    }
    
    // Convert Date objects to ISO strings for exitDate if present
    if (data.exitDate instanceof Date) {
      data.exitDate = data.exitDate.toISOString();
    }
    
    // Check if we're closing an open trade (adding exit data where it didn't exist before)
    const isClosingTrade = isEditMode && wasOpenInitially && data.exitDate && data.exitPrice;
    
    if (isClosingTrade && !showCloseConfirm) {
      // Show confirmation dialog before closing
      setPendingSubmit(data);
      setShowCloseConfirm(true);
      return;
    }

    // Clear confirmation state
    setShowCloseConfirm(false);
    await doSubmit(data);
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
        <h2 className="text-lg font-semibold mb-4">{t('basicInformation')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Symbol */}
          <div>
            <label htmlFor="symbol" className="block text-sm font-medium text-foreground mb-2">
              {t('symbolTicker')} <span className="text-danger">*</span>
            </label>
            <input
              id="symbol"
              type="text"
              {...register('symbol')}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              placeholder={t('symbolPlaceholder')}
              disabled={isLoading}
            />
            {errors.symbol && <p className="mt-1 text-sm text-danger">{errors.symbol.message}</p>}
          </div>

          {/* Asset Type */}
          <div>
            <label htmlFor="assetType" className="block text-sm font-medium text-foreground mb-2">
              {t('assetType')} <span className="text-danger">*</span>
            </label>
            <select
              id="assetType"
              {...register('assetType')}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              disabled={isLoading}
            >
              <option value="STOCK">{tTrades('stock')}</option>
              <option value="FOREX">{tTrades('forex')}</option>
              <option value="CRYPTO">{tTrades('crypto')}</option>
              <option value="OPTIONS">{tTrades('options')}</option>
            </select>
            {errors.assetType && (
              <p className="mt-1 text-sm text-danger">{errors.assetType.message}</p>
            )}
          </div>

          {/* Currency */}
          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <CurrencySelector
                value={field.value || 'USD'}
                onChange={field.onChange}
                disabled={isLoading}
                error={errors.currency?.message || undefined}
                label={t('currency')}
                showSymbol={true}
              />
            )}
          />

          {/* Direction */}
          <div>
            <label htmlFor="direction" className="block text-sm font-medium text-foreground mb-2">
              {t('direction')} <span className="text-danger">*</span>
            </label>
            <select
              id="direction"
              {...register('direction')}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              disabled={isLoading}
            >
              <option value="LONG">{tTrades('long')}</option>
              <option value="SHORT">{tTrades('short')}</option>
            </select>
            {errors.direction && (
              <p className="mt-1 text-sm text-danger">{errors.direction.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Entry Details Section */}
      <div className="bg-card shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">{t('entryDetails')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="entryDate" className="block text-sm font-medium text-foreground mb-2">
              {t('entryDateAndTime')} <span className="text-danger">*</span>
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
              {t('entryPrice')} <span className="text-danger">*</span>
            </label>
            <input
              id="entryPrice"
              type="number"
              step="0.01"
              {...register('entryPrice', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              placeholder={t('pricePlaceholder')}
              disabled={isLoading}
            />
            {errors.entryPrice && (
              <p className="mt-1 text-sm text-danger">{errors.entryPrice.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-foreground mb-2">
              {t('quantity')} <span className="text-danger">*</span>
            </label>
            <input
              id="quantity"
              type="number"
              step="0.01"
              {...register('quantity', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              placeholder={t('quantityPlaceholder')}
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t('exitDetails')}</h2>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isTradeOpen}
              onChange={(e) => handleTradeOpenToggle(e.target.checked)}
              disabled={isLoading}
              className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring"
            />
            <span className="text-sm font-medium text-foreground">{t('tradeIsStillOpen')}</span>
          </label>
        </div>
        
        {isTradeOpen && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>{t('tradeWillBeMarkedAsOpen')}</strong>
            </p>
          </div>
        )}

        {showCloseConfirm && (
          <div
            ref={setConfirmDialogElement}
            className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
          >
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
              <strong>{t('markTradeAsClosed')}</strong> {t('willFinalizeTrade')}
            </p>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={async () => {
                  if (pendingSubmit) {
                    setShowCloseConfirm(false);
                    await doSubmit(pendingSubmit);
                    setPendingSubmit(null);
                  }
                }}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-medium rounded-lg transition-colors"
              >
                {t('yesCloseTrade')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCloseConfirm(false);
                  setPendingSubmit(null);
                }}
                className="px-4 py-2 border border-border hover:bg-muted text-foreground text-sm font-medium rounded-lg transition-colors"
              >
                {tCommon('cancel')}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="exitDate" className="block text-sm font-medium text-foreground mb-2">
              {t('exitDateAndTime')} <span className="text-muted-foreground font-normal">({tCommon('optional')})</span>
            </label>
            <input
              id="exitDate"
              type="datetime-local"
              {...register('exitDate')}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || isTradeOpen}
            />
            {errors.exitDate && (
              <p className="mt-1 text-sm text-danger">{errors.exitDate.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="exitPrice" className="block text-sm font-medium text-foreground mb-2">
              {t('exitPrice')} <span className="text-muted-foreground font-normal">({tCommon('optional')})</span>
            </label>
            <input
              id="exitPrice"
              type="number"
              step="0.01"
              {...register('exitPrice', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder={t('pricePlaceholder')}
              disabled={isLoading || isTradeOpen}
            />
            {errors.exitPrice && (
              <p className="mt-1 text-sm text-danger">{errors.exitPrice.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Trade Strategy Section */}
      <div className="bg-card shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">{t('strategyAndRiskManagement')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="strategyName" className="block text-sm font-medium text-foreground mb-2">
              {t('strategyName')}
            </label>
            <input
              id="strategyName"
              type="text"
              {...register('strategyName')}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              placeholder={t('strategyNamePlaceholder')}
              disabled={isLoading}
            />
            {errors.strategyName && (
              <p className="mt-1 text-sm text-danger">{errors.strategyName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="setupType" className="block text-sm font-medium text-foreground mb-2">
              {t('setupType')}
            </label>
            <input
              id="setupType"
              type="text"
              {...register('setupType')}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              placeholder={t('setupTypePlaceholder')}
              disabled={isLoading}
            />
            {errors.setupType && (
              <p className="mt-1 text-sm text-danger">{errors.setupType.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="stopLoss" className="block text-sm font-medium text-foreground mb-2">
              {t('stopLoss')}
            </label>
            <input
              id="stopLoss"
              type="number"
              step="0.01"
              {...register('stopLoss', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              placeholder={t('pricePlaceholder')}
              disabled={isLoading}
            />
            {errors.stopLoss && (
              <p className="mt-1 text-sm text-danger">{errors.stopLoss.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="takeProfit" className="block text-sm font-medium text-foreground mb-2">
              {t('takeProfitTarget')}
            </label>
            <input
              id="takeProfit"
              type="number"
              step="0.01"
              {...register('takeProfit', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              placeholder={t('pricePlaceholder')}
              disabled={isLoading}
            />
            {errors.takeProfit && (
              <p className="mt-1 text-sm text-danger">{errors.takeProfit.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="riskRewardRatio" className="block text-sm font-medium text-foreground mb-2">
              {t('plannedRiskRewardRatio')}
            </label>
            <input
              id="riskRewardRatio"
              type="number"
              step="0.1"
              {...register('riskRewardRatio', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              placeholder={t('riskRewardRatioPlaceholder')}
              disabled={isLoading}
            />
            {errors.riskRewardRatio && (
              <p className="mt-1 text-sm text-danger">{errors.riskRewardRatio.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="fees" className="block text-sm font-medium text-foreground mb-2">
              {t('commissionsFees')}
            </label>
            <input
              id="fees"
              type="number"
              step="0.01"
              {...register('fees', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              placeholder={t('pricePlaceholder')}
              disabled={isLoading}
            />
            {errors.fees && <p className="mt-1 text-sm text-danger">{errors.fees.message}</p>}
          </div>
        </div>
      </div>

      {/* Context Section */}
      <div className="bg-card shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">{t('contextAndConditions')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="timeOfDay" className="block text-sm font-medium text-foreground mb-2">
              {t('timeOfDay')}
            </label>
            <select
              id="timeOfDay"
              {...register('timeOfDay')}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              disabled={isLoading}
            >
              <option value="">{t('selectTimeOfDay')}</option>
              <option value="PRE_MARKET">{tTrades('preMarket')}</option>
              <option value="MARKET_OPEN">{tTrades('marketOpen')}</option>
              <option value="MID_DAY">{tTrades('midDay')}</option>
              <option value="MARKET_CLOSE">{tTrades('marketClose')}</option>
              <option value="AFTER_HOURS">{tTrades('afterHours')}</option>
            </select>
            {errors.timeOfDay && (
              <p className="mt-1 text-sm text-danger">{errors.timeOfDay.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="marketConditions" className="block text-sm font-medium text-foreground mb-2">
              {t('marketConditions')}
            </label>
            <select
              id="marketConditions"
              {...register('marketConditions')}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              disabled={isLoading}
            >
              <option value="">{t('selectMarketConditions')}</option>
              <option value="TRENDING">{tTrades('trending')}</option>
              <option value="RANGING">{tTrades('ranging')}</option>
              <option value="VOLATILE">{tTrades('volatile')}</option>
              <option value="CALM">{tTrades('calm')}</option>
            </select>
            {errors.marketConditions && (
              <p className="mt-1 text-sm text-danger">{errors.marketConditions.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="emotionalStateEntry" className="block text-sm font-medium text-foreground mb-2">
              {t('emotionalStateAtEntry')}
            </label>
            <input
              id="emotionalStateEntry"
              type="text"
              {...register('emotionalStateEntry')}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              placeholder={t('emotionalStateEntryPlaceholder')}
              disabled={isLoading}
            />
            {errors.emotionalStateEntry && (
              <p className="mt-1 text-sm text-danger">{errors.emotionalStateEntry.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="emotionalStateExit" className="block text-sm font-medium text-foreground mb-2">
              {t('emotionalStateAtExit')}
            </label>
            <input
              id="emotionalStateExit"
              type="text"
              {...register('emotionalStateExit')}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
              placeholder={t('emotionalStateExitPlaceholder')}
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
        <h2 className="text-lg font-semibold mb-4">{t('tradeNotesAndJournal')}</h2>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
            {t('notes')}
          </label>
          <textarea
            id="notes"
            {...register('notes')}
            rows={8}
            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
            placeholder={t('notesPlaceholder')}
            disabled={isLoading}
          />
          {errors.notes && <p className="mt-1 text-sm text-danger">{errors.notes.message}</p>}
          <p className="mt-1 text-sm text-muted-foreground">
            {t('notesHelpText')}
          </p>
        </div>
      </div>

      {/* Screenshots Section */}
      <div className="bg-card shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">{tTrades('screenshots')}</h2>
        <ScreenshotUpload
          tradeId={isEditMode ? tradeId : undefined}
          screenshots={isEditMode ? uploadedScreenshots : []}
          tempUploadMode={!isEditMode}
          onTempFilesChange={(tempFilesList) => {
            setTempFiles(tempFilesList);
          }}
          onUploadSuccess={(screenshot) => {
            if (isEditMode) {
              setUploadedScreenshots((prev) => [...prev, screenshot]);
            }
          }}
          onDeleteSuccess={(screenshotId) => {
            if (isEditMode) {
              setUploadedScreenshots((prev) => prev.filter((s) => s.id !== screenshotId));
            }
          }}
          disabled={isLoading}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-border rounded-lg hover:bg-muted text-foreground transition-colors"
          disabled={isLoading}
        >
          {tCommon('cancel')}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-primary hover:bg-primary-hover text-primary-foreground font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? tCommon('saving') : isEditMode ? t('updateTrade') : t('createTrade')}
        </button>
      </div>
    </form>
  );
}
