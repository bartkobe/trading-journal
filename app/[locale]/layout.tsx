import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { ThemeProvider, themeScript } from '@/components/providers/ThemeProvider';
import { Navigation } from '@/components/ui/Navigation';
import { getCurrentUser } from '@/lib/auth';

// Force dynamic rendering since we need to check auth state
export const dynamic = 'force-dynamic';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  // Get current user for navigation (handle errors gracefully)
  let user = null;
  try {
    user = await getCurrentUser();
  } catch (error) {
    // Silently fail - user is not authenticated or DB is unavailable
    // This allows the app (including login page) to still load
    console.error('Layout: Failed to get current user:', error);
  }

  return (
    <ThemeProvider defaultTheme="system">
      <NextIntlClientProvider messages={messages}>
        <script
          dangerouslySetInnerHTML={{ __html: themeScript }}
          suppressHydrationWarning
        />
        {/* Skip link for keyboard navigation - hidden until focused */}
        <a
          href="#main-content"
          className="absolute left-[-9999px] focus:left-4 focus:top-4 focus:z-50 px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow-lg focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
        >
          Skip to main content
        </a>

        {/* Show navigation only for authenticated users */}
        {user && <Navigation user={user} />}
        
        {/* Main content */}
        <main 
          id="main-content" 
          tabIndex={-1}
          className={user ? '' : 'min-h-screen'}
          aria-label="Main content"
        >
          {children}
        </main>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}

