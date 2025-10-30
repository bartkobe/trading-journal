import type { Metadata, Viewport } from 'next';
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
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
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
        </ThemeProvider>
      </body>
    </html>
  );
}
