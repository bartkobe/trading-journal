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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get current user for navigation
  const user = await getCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent flash of unstyled content (FOUC) by applying theme before render */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider defaultTheme="system">
          {/* Show navigation only for authenticated users */}
          {user && <Navigation user={user} />}
          
          {/* Main content */}
          <main className={user ? '' : 'min-h-screen'}>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
