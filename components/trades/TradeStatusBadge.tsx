'use client';

import { useTranslations } from 'next-intl';

interface TradeStatusBadgeProps {
  isOpen: boolean;
  className?: string;
}

export function TradeStatusBadge({ isOpen, className = '' }: TradeStatusBadgeProps) {
  const t = useTranslations('trades');

  if (isOpen) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 ${className}`}
      >
        <svg
          className="w-3 h-3 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {t('open')}
      </span>
    );
  }

  // Per PRD design: no badge or subtle badge for closed trades
  // Returning nothing for closed trades to avoid clutter
  return null;
}

