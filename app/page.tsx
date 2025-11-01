'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function HomePage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          // User is authenticated, redirect to dashboard
          router.push('/dashboard');
          return;
        }
      } catch (error) {
        // Ignore errors - user is not authenticated
        console.log('User not authenticated, showing login form');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative">
        {/* Theme Toggle - Top Right */}
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="max-w-md w-full space-y-12">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-5xl font-bold text-foreground tracking-tight">Trading Journal</h1>
            <p className="text-lg text-muted-foreground">
              Track, analyze, and improve your trading performance
            </p>
          </div>

          {/* Loading Card */}
          <div className="bg-card shadow-2xl rounded-2xl border border-border p-8">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Checking authentication...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative">
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-5xl font-bold text-foreground tracking-tight">Trading Journal</h1>
          <p className="text-lg text-muted-foreground">
            Track, analyze, and improve your trading performance
          </p>
        </div>

        {/* Card */}
        <div className="bg-card shadow-2xl rounded-2xl border border-border overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-4 text-center font-medium border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring ${
                mode === 'login'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              aria-current={mode === 'login' ? 'page' : undefined}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-4 text-center font-medium border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring ${
                mode === 'register'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              aria-current={mode === 'register' ? 'page' : undefined}
            >
              Create Account
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
            Single-user trading journal application
          </p>
          <p className="text-xs text-muted-foreground">
            Built with Next.js, TypeScript, and Prisma
          </p>
        </div>
      </div>
    </div>
  );
}
