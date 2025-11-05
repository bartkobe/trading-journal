'use client';

import { usePathname } from '@/i18n/routing';
import { Link as IntlLink } from '@/i18n/routing';

export default function NotFound() {
  const pathname = usePathname();
  
  // Extract locale from pathname if present
  const localeMatch = typeof window !== 'undefined' 
    ? window.location.pathname.match(/^\/(en|pl)(\/|$)/)?.[1]
    : 'en';
  const locale = localeMatch || 'en';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-foreground">Page Not Found</h2>
        <p className="mb-8 text-lg text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <IntlLink
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-primary-foreground shadow-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
          >
            Go to Home
          </IntlLink>
        </div>
      </div>
    </div>
  );
}

