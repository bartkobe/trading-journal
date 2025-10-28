import { requireAuth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { TradeDetail } from '@/components/trades/TradeDetail';
import { calculateTradeMetrics } from '@/lib/trades';
import type { TradeWithCalculations } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface TradeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TradeDetailPage({ params }: TradeDetailPageProps) {
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
      userId: user.id, // Ensure user can only access their own trades
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

  // Calculate metrics
  const tradeWithCalculations: TradeWithCalculations = {
    ...trade,
    ...calculateTradeMetrics(trade),
  };

  return (
    <div className="container mx-auto max-w-7xl p-4">
      <TradeDetail trade={tradeWithCalculations} userId={user.id} />
    </div>
  );
}

