import { requireAuth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { enrichTradeWithCalculations } from '@/lib/trades';
import { TradeActions } from '@/components/trades/TradeActions';
import { TradeDetail } from '@/components/trades/TradeDetail';

export const dynamic = 'force-dynamic';

type TradeDetailPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function TradeDetailPage({ params }: TradeDetailPageProps) {
  // Await params (Next.js 15+ requirement)
  const { locale, id } = await params;

  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    redirect(`/${locale}`);
  }

  // Fetch trade data directly from database
  const rawTrade = await prisma.trade.findUnique({
    where: {
      id: id,
      userId: user.id, // Ensure user owns this trade
    },
    include: {
      screenshots: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!rawTrade) {
    notFound();
  }

  // Enrich with calculations
  const trade = enrichTradeWithCalculations(rawTrade);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with navigation */}
        <div className="mb-8">
          <Link
            href={`/${locale}/trades`}
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
            Back to Trades
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {trade.symbol.toUpperCase()} Trade
              </h1>
              <p className="mt-2 text-muted-foreground">View and manage trade details</p>
            </div>

            <TradeActions tradeId={id} />
          </div>
        </div>

        {/* Trade Detail Component */}
        <TradeDetail trade={trade} />
      </div>
    </div>
  );
}
