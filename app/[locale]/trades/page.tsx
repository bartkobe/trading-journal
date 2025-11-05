import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TradesClient } from './TradesClient';

export const dynamic = 'force-dynamic';

type TradesPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function TradesPage({ params }: TradesPageProps) {
  const { locale } = await params;
  
  try {
    await requireAuth();
  } catch (error) {
    redirect(`/${locale}`);
  }

  return <TradesClient />;
}
