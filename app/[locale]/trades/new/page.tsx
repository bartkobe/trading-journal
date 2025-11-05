import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TradeForm } from '@/components/trades/TradeForm';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

type NewTradePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NewTradePage({ params }: NewTradePageProps) {
  const { locale } = await params;
  const t = await getTranslations('trades');
  const tNav = await getTranslations('navigation');
  
  try {
    await requireAuth();
  } catch (error) {
    redirect(`/${locale}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/trades"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground dark:hover:text-gray-100 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {t('backToTrades')}
          </Link>

          <h1 className="text-3xl font-bold text-foreground">{tNav('newTrade')}</h1>
          <p className="mt-2 text-muted-foreground">
            {t('recordNewTradeDescription')}
          </p>
        </div>

        {/* Trade Form */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <TradeForm />
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            {t('tipsForRecordingTrades')}
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
            <li>{t('tipRecordAsSoonAsPossible')}</li>
            <li>{t('tipIncludeScreenshots')}</li>
            <li>{t('tipDocumentReasoning')}</li>
            <li>{t('tipTagTrades')}</li>
            <li>{t('tipReviewAndUpdate')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
