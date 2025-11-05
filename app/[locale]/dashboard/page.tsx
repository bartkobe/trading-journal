import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import DashboardContent from '@/components/analytics/DashboardContent';

export const dynamic = 'force-dynamic';

type DashboardPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  const t = await getTranslations('common');
  const tNav = await getTranslations('navigation');
  
  const user = await requireAuth().catch(() => {
    redirect(`/${locale}`);
  });

  if (!user) {
    redirect(`/${locale}`);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-muted/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-foreground tracking-tight">{tNav('dashboard')}</h1>
            <p className="text-base text-muted-foreground">
                {t('welcomeBack', { name: user.name || user.email })}
              </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <DashboardContent />
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-border mt-20">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {t('footerCopyright')}
          </p>
        </div>
      </footer>
    </div>
  );
}
