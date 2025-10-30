import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TradesClient } from './TradesClient';

export const dynamic = 'force-dynamic';

export default async function TradesPage() {
  try {
    await requireAuth();
  } catch (error) {
    redirect('/');
  }

  return <TradesClient />;
}
