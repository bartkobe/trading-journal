import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider, themeScript } from '@/components/providers/ThemeProvider';
import { Navigation } from '@/components/ui/Navigation';
import { getCurrentUser } from '@/lib/auth';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Trading Journal',
  description: 'Track, analyze, and learn from your trades',
  keywords: 'trading journal, trade tracking, trading analytics, trade analysis',
  authors: [{ name: 'Trading Journal Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
};

// Force dynamic rendering since we need to check auth state
export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent flash of unstyled content (FOUC) by applying theme before render */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider defaultTheme="system">
          {/* Skip link for keyboard navigation */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
        </ThemeProvider>
      </body>
    </html>
  );
}
