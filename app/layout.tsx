import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider, themeScript } from '@/components/providers/ThemeProvider';
import { LanguageProvider } from '@/components/providers/LanguageProvider';

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
  return (
    <html suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const path = window.location.pathname;
                const localeMatch = path.match(/^\\/(en|pl)(\\/|$)/);
                const locale = localeMatch ? localeMatch[1] : 'en';
                document.documentElement.lang = locale;
              })();
            `,
          }}
        />
        {/* Prevent flash of unstyled content (FOUC) by applying theme before render */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider defaultTheme="system">
          <LanguageProvider defaultLocale="en">
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
