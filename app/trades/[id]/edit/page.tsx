import { requireAuth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { TradeForm } from '@/components/trades/TradeForm';

export const dynamic = 'force-dynamic';

interface EditTradePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTradePage({ params }: EditTradePageProps) {
  const user = await requireAuth().catch(() => {
    redirect('/');
  });

  if (!user) {
    redirect('/');
  }

  const { id } = await params;

  // Fetch the trade with all related data
  const trade = await prisma.trade.findUnique({
    where: {
      id,
      userId: user.id, // Ensure user can only edit their own trades
    },
    include: {
      screenshots: {
        orderBy: {
          uploadedAt: 'asc',
        },
      },
      tags: {
        include: {
          tag: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (!trade) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/trades/${trade.id}`}
          className="flex items-center text-primary-500 hover:text-primary-600"
        >
          <ChevronLeftIcon className="mr-1 h-5 w-5" />
          Back to Trade Details
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Edit Trade</h1>
        <div></div> {/* Spacer for alignment */}
      </div>
      <p className="mb-8 text-center text-gray-600 dark:text-gray-300">
        Update the details of your trade entry for{' '}
        <span className="font-semibold text-foreground">{trade.symbol}</span>
      </p>
      <TradeForm trade={trade} userId={user.id} />
    </div>
  );
}

