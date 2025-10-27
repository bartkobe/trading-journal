import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await requireAuth().catch(() => {
    redirect('/');
  });

  if (!user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Your Trading Journal
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Hello, {user.name || user.email}!</p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-blue-800 dark:text-blue-300">
              ✅ Authentication is working! You are successfully logged in.
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
              Next steps: Trade management features are coming in Section 3.0
            </p>
          </div>

          <div className="mt-6">
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
