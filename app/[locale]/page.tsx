'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default function HomePage({ params }: HomePageProps) {
  const t = useTranslations('common');
  const tForms = useTranslations('forms');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(true);
  const [locale, setLocale] = useState<string>('en');
  const router = useRouter();
  const pathname = usePathname();

  // Get locale from params
  useEffect(() => {
    params.then((p) => {
      setLocale(p.locale);
    });
  }, [params]);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          // User is authenticated, redirect to dashboard with locale
          router.replace(`/${locale}/dashboard`);
          return;
        }
      } catch (error) {
        // Ignore errors - user is not authenticated
        console.log('User not authenticated, showing login form');
      }

      // Only set loading to false if we're not redirecting
      setIsLoading(false);
    };

    if (locale) {
      checkAuth();
    }
  }, [router, locale]);

  // Show minimal loading state while checking authentication to avoid flash
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {/* Minimal loading indicator - theme toggle and language selector */}
        <div className="absolute top-6 right-6 flex items-center gap-3">
          <LanguageSelector />
          <ThemeToggle />
        </div>
        {/* No content shown until auth check completes */}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative">
      {/* Language Selector and Theme Toggle - Top Right */}
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <LanguageSelector />
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-5xl font-bold text-foreground tracking-tight">{t('appName')}</h1>
          <p className="text-lg text-muted-foreground">
            {t('appDescription')}
          </p>
        </div>

        {/* Card */}
        <div className="bg-card shadow-2xl rounded-2xl border border-border overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-4 text-center font-medium border-b-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
                mode === 'login'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              aria-current={mode === 'login' ? 'page' : undefined}
            >
              {tForms('signIn')}
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-4 text-center font-medium border-b-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
                mode === 'register'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              aria-current={mode === 'register' ? 'page' : undefined}
            >
              {tForms('createAccount')}
            </button>
          </div>

          {/* Forms */}
          <div className="p-8">
            {mode === 'login' ? <LoginForm /> : <RegisterForm />}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {t('singleUserApp')}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('builtWith')}
          </p>
        </div>
      </div>
    </div>
  );
}
