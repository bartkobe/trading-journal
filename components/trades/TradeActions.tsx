'use client';

import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

interface TradeActionsProps {
  tradeId: string;
}

export function TradeActions({ tradeId }: TradeActionsProps) {
  const router = useRouter();
  const t = useTranslations('trades');
  const tErrors = useTranslations('errors');
  const tCommon = useTranslations('common');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [error, setError] = useState<string>('');

  const handleDeleteClick = () => {
    setShowConfirmDialog(true);
    setError('');
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/trades/${tradeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.error || tErrors('deleteFailedMessage'));
        setShowConfirmDialog(false);
        setIsDeleting(false);
        return;
      }

      // Redirect to trades list after successful deletion
      router.push('/trades');
    } catch (error) {
      console.error('Delete error:', error);
      setError(tErrors('unableToDeleteTrade'));
      setShowConfirmDialog(false);
      setIsDeleting(false);
    }
  };

  return (
    <>
      {error && (
        <div className="mb-4">
          <ErrorMessage
            title={tErrors('deleteFailed')}
            message={error}
            onRetry={handleDeleteClick}
            retryText={tCommon('tryAgain')}
            dismissible
            onDismiss={() => setError('')}
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        <Link
          href={`/trades/${tradeId}/edit`}
          className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          {tCommon('edit')}
        </Link>

        <button
          onClick={handleDeleteClick}
          disabled={isDeleting}
          className="inline-flex items-center px-4 py-2 bg-danger hover:bg-danger-dark text-danger-foreground font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          {isDeleting ? t('deleting') : tCommon('delete')}
        </button>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title={t('deleteTrade')}
        message={t('deleteTradeConfirm')}
        confirmLabel={t('deleteTrade')}
        cancelLabel={tCommon('cancel')}
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmDialog(false)}
        isLoading={isDeleting}
      />
    </>
  );
}
