'use client';

import { TradeWithCalculations } from '@/lib/types';
import { formatCurrency, formatPercentage } from '@/lib/trades';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import {
  ChevronLeftIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  TagIcon,
  ClockIcon,
  CloudIcon,
  FaceSmileIcon,
  LightBulbIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

interface TradeDetailProps {
  trade: TradeWithCalculations;
  userId: string;
}

export function TradeDetail({ trade, userId }: TradeDetailProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  const outcomeColor =
    trade.outcome === 'winning'
      ? 'text-green-600 dark:text-green-400'
      : trade.outcome === 'losing'
        ? 'text-red-600 dark:text-red-400'
        : 'text-gray-600 dark:text-gray-400';

  const outcomeBgColor =
    trade.outcome === 'winning'
      ? 'bg-green-100 dark:bg-green-900'
      : trade.outcome === 'losing'
        ? 'bg-red-100 dark:bg-red-900'
        : 'bg-gray-100 dark:bg-gray-900';

  const directionColor =
    trade.direction === 'LONG'
      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/trades/${trade.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete trade');
      }

      // Redirect to trades list after successful deletion
      window.location.href = '/trades';
    } catch (error) {
      console.error('Error deleting trade:', error);
      alert('Failed to delete trade. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/trades"
            className="flex items-center text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
          >
            <ChevronLeftIcon className="mr-1 h-5 w-5" />
            Back to Trades
          </Link>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/trades/${trade.id}/edit`}
            className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <PencilIcon className="mr-2 h-5 w-5" />
            Edit Trade
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center rounded-md border border-red-600 bg-white px-4 py-2 text-red-600 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-gray-800 dark:hover:bg-red-900"
          >
            <TrashIcon className="mr-2 h-5 w-5" />
            Delete
          </button>
        </div>
      </div>

      {/* Trade Header Card */}
      <div className={`mb-6 rounded-lg ${outcomeBgColor} p-6 shadow-md`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-4xl font-bold text-foreground">{trade.symbol}</h1>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${directionColor}`}>
                {trade.direction}
              </span>
              <span className="rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                {trade.assetType}
              </span>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {new Date(trade.entryDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-5xl font-bold ${outcomeColor}`}>
              {formatCurrency(trade.netPnl, trade.currency)}
            </div>
            <div className={`text-2xl font-semibold ${outcomeColor}`}>
              {formatPercentage(trade.netPnlPercent)}
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {trade.outcome === 'winning' && '✓ Winning Trade'}
              {trade.outcome === 'losing' && '✗ Losing Trade'}
              {trade.outcome === 'breakeven' && '− Breakeven Trade'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Trade Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Price & Execution Details */}
          <section className="rounded-lg bg-card p-6 shadow-sm">
            <h2 className="mb-4 flex items-center text-2xl font-semibold text-foreground">
              <CurrencyDollarIcon className="mr-2 h-6 w-6" />
              Price & Execution
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Entry Price</p>
                <p className="text-xl font-semibold text-foreground">
                  {formatCurrency(trade.entryPrice, trade.currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Exit Price</p>
                <p className="text-xl font-semibold text-foreground">
                  {formatCurrency(trade.exitPrice, trade.currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Quantity</p>
                <p className="text-xl font-semibold text-foreground">{trade.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gross P&L</p>
                <p className={`text-xl font-semibold ${outcomeColor}`}>
                  {formatCurrency(trade.grossPnl, trade.currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Fees</p>
                <p className="text-xl font-semibold text-foreground">
                  {formatCurrency(trade.fees || 0, trade.currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Net P&L</p>
                <p className={`text-xl font-semibold ${outcomeColor}`}>
                  {formatCurrency(trade.netPnl, trade.currency)}
                </p>
              </div>
            </div>
          </section>

          {/* Trade Strategy & Risk Management */}
          {(trade.setupType ||
            trade.strategyName ||
            trade.stopLoss ||
            trade.takeProfit ||
            trade.riskRewardRatio ||
            trade.actualRiskReward) && (
            <section className="rounded-lg bg-card p-6 shadow-sm">
              <h2 className="mb-4 flex items-center text-2xl font-semibold text-foreground">
                <ChartBarIcon className="mr-2 h-6 w-6" />
                Strategy & Risk Management
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {trade.setupType && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Setup Type</p>
                    <p className="text-lg font-medium text-foreground">{trade.setupType}</p>
                  </div>
                )}
                {trade.strategyName && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Strategy</p>
                    <p className="text-lg font-medium text-foreground">{trade.strategyName}</p>
                  </div>
                )}
                {trade.stopLoss && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Stop Loss</p>
                    <p className="text-lg font-medium text-foreground">
                      {formatCurrency(trade.stopLoss, trade.currency)}
                    </p>
                  </div>
                )}
                {trade.takeProfit && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Take Profit</p>
                    <p className="text-lg font-medium text-foreground">
                      {formatCurrency(trade.takeProfit, trade.currency)}
                    </p>
                  </div>
                )}
                {trade.riskRewardRatio && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Planned R:R</p>
                    <p className="text-lg font-medium text-foreground">
                      1:{trade.riskRewardRatio.toFixed(2)}
                    </p>
                  </div>
                )}
                {trade.actualRiskReward && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Actual R:R</p>
                    <p className="text-lg font-medium text-foreground">
                      1:{trade.actualRiskReward.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Trade Context */}
          {(trade.timeOfDay ||
            trade.marketConditions ||
            trade.emotionalStateEntry ||
            trade.emotionalStateExit) && (
            <section className="rounded-lg bg-card p-6 shadow-sm">
              <h2 className="mb-4 flex items-center text-2xl font-semibold text-foreground">
                <LightBulbIcon className="mr-2 h-6 w-6" />
                Trade Context
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {trade.timeOfDay && (
                  <div>
                    <p className="mb-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <ClockIcon className="mr-1 h-4 w-4" />
                      Time of Day
                    </p>
                    <p className="text-lg font-medium text-foreground">
                      {trade.timeOfDay.replace(/_/g, ' ')}
                    </p>
                  </div>
                )}
                {trade.marketConditions && (
                  <div>
                    <p className="mb-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <CloudIcon className="mr-1 h-4 w-4" />
                      Market Conditions
                    </p>
                    <p className="text-lg font-medium text-foreground">{trade.marketConditions}</p>
                  </div>
                )}
                {trade.emotionalStateEntry && (
                  <div>
                    <p className="mb-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <FaceSmileIcon className="mr-1 h-4 w-4" />
                      Emotional State (Entry)
                    </p>
                    <p className="text-lg font-medium text-foreground">
                      {trade.emotionalStateEntry}
                    </p>
                  </div>
                )}
                {trade.emotionalStateExit && (
                  <div>
                    <p className="mb-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <FaceSmileIcon className="mr-1 h-4 w-4" />
                      Emotional State (Exit)
                    </p>
                    <p className="text-lg font-medium text-foreground">
                      {trade.emotionalStateExit}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Trade Notes */}
          {trade.notes && (
            <section className="rounded-lg bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">Trade Notes</h2>
              <div
                className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-a:text-primary-600 prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground"
                dangerouslySetInnerHTML={{ __html: trade.notes }}
              />
            </section>
          )}

          {/* Screenshots Gallery */}
          {trade.screenshots && trade.screenshots.length > 0 && (
            <section className="rounded-lg bg-card p-6 shadow-sm">
              <h2 className="mb-4 flex items-center text-2xl font-semibold text-foreground">
                <PhotoIcon className="mr-2 h-6 w-6" />
                Screenshots ({trade.screenshots.length})
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {trade.screenshots.map((screenshot) => (
                  <div
                    key={screenshot.id}
                    className="group relative aspect-video cursor-pointer overflow-hidden rounded-lg shadow-md transition-transform hover:scale-105"
                    onClick={() => setSelectedScreenshot(screenshot.url)}
                  >
                    <Image
                      src={screenshot.url}
                      alt={screenshot.filename}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 transition-opacity group-hover:bg-opacity-20" />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column - Summary Info */}
        <div className="space-y-6">
          {/* Timeline */}
          <section className="rounded-lg bg-card p-6 shadow-sm">
            <h2 className="mb-4 flex items-center text-xl font-semibold text-foreground">
              <CalendarIcon className="mr-2 h-5 w-5" />
              Timeline
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Entry</p>
                <p className="font-medium text-foreground">
                  {new Date(trade.entryDate).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Exit</p>
                <p className="font-medium text-foreground">
                  {new Date(trade.exitDate).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                <p className="font-medium text-foreground">
                  {(() => {
                    const duration =
                      new Date(trade.exitDate).getTime() - new Date(trade.entryDate).getTime();
                    const days = Math.floor(duration / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

                    if (days > 0) return `${days}d ${hours}h`;
                    if (hours > 0) return `${hours}h ${minutes}m`;
                    return `${minutes}m`;
                  })()}
                </p>
              </div>
            </div>
          </section>

          {/* Tags */}
          {trade.tags && trade.tags.length > 0 && (
            <section className="rounded-lg bg-card p-6 shadow-sm">
              <h2 className="mb-4 flex items-center text-xl font-semibold text-foreground">
                <TagIcon className="mr-2 h-5 w-5" />
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {trade.tags.map((tt) => (
                  <span
                    key={tt.id}
                    className="inline-block rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800 dark:bg-primary-800 dark:text-primary-100"
                  >
                    {tt.tag.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Metadata */}
          <section className="rounded-lg bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-foreground">Metadata</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Trade ID</span>
                <span className="font-mono text-xs text-foreground">{trade.id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Created</span>
                <span className="text-foreground">
                  {new Date(trade.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
                <span className="text-foreground">
                  {new Date(trade.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Screenshot Lightbox Modal */}
      {selectedScreenshot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div className="relative max-h-full max-w-7xl">
            <Image
              src={selectedScreenshot}
              alt="Screenshot"
              width={1920}
              height={1080}
              className="max-h-[90vh] w-auto object-contain"
            />
            <button
              onClick={() => setSelectedScreenshot(null)}
              className="absolute right-4 top-4 rounded-full bg-black bg-opacity-50 p-2 text-white hover:bg-opacity-70"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="mb-4 text-xl font-semibold text-foreground">Delete Trade</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this trade? This action cannot be undone and will
              permanently remove all associated data including screenshots.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Trade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

