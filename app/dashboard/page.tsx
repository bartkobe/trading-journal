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
      <div className="bg-muted border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, {user.name || user.email}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardContent />
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-border mt-12">
        <div className="text-center text-sm text-muted-foreground">
          <p>Trading Journal © 2025 • Track, Analyze, Improve</p>
        </div>
      </footer>
    </div>
  );
}
