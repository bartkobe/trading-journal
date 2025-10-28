import { requireAuth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { TradeForm } from '@/components/trades/TradeForm';

export const dynamic = 'force-dynamic';

interface TradeEditPageProps {
  params: {
    id: string;
  };
}

export default async function TradeEditPage({ params }: TradeEditPageProps) {
  // Await params (Next.js 15+ requirement)
  const { id } = await params;
  
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    redirect('/');
  }

  // Fetch trade data directly from database
  const trade = await prisma.trade.findUnique({
    where: {
      id: id,
      userId: user.id, // Ensure user owns this trade
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!trade) {
    notFound();
  }

  // Prepare initial data for the form
  const initialData = {
    symbol: trade.symbol,
    assetType: trade.assetType,
    currency: trade.currency,
    entryDate: trade.entryDate,
    entryPrice: trade.entryPrice,
    exitDate: trade.exitDate,
    exitPrice: trade.exitPrice,
    quantity: trade.quantity,
    direction: trade.direction,
    setupType: trade.setupType || undefined,
    strategyName: trade.strategyName || undefined,
    stopLoss: trade.stopLoss || undefined,
    takeProfit: trade.takeProfit || undefined,
    riskRewardRatio: trade.riskRewardRatio || undefined,
    fees: trade.fees || 0,
    timeOfDay: trade.timeOfDay || undefined,
    marketConditions: trade.marketConditions || undefined,
    emotionalStateEntry: trade.emotionalStateEntry || undefined,
    emotionalStateExit: trade.emotionalStateExit || undefined,
    notes: trade.notes || undefined,
    tags: trade.tags.map((tt: { tag: { name: string } }) => tt.tag.name),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/trades/${id}`}
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Trade Details
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Trade: {trade.symbol.toUpperCase()}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Update trade details, add screenshots, or modify notes.
          </p>
        </div>

        {/* Trade Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <TradeForm tradeId={id} initialData={initialData} />
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Editing Tips
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
            <li>All changes will be saved when you click "Save Trade"</li>
            <li>You can add or remove screenshots and tags</li>
            <li>The form will validate your input before saving</li>
            <li>Use the rich text editor for detailed trade notes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

