import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardContent from '@/components/analytics/DashboardContent';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await requireAuth().catch(() => {
    redirect('/');
  });

  if (!user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-muted/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Dashboard</h1>
            <p className="text-base text-muted-foreground">
                Welcome back, {user.name || user.email}
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
            Trading Journal © 2025 • Track, Analyze, Improve
          </p>
        </div>
      </footer>
    </div>
  );
}
