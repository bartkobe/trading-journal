'use client';

import { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function HomePage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative">
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Trading Journal</h1>
          <p className="text-muted-foreground">
            Track, analyze, and improve your trading performance
          </p>
        </div>

        {/* Card */}
        <div className="bg-card shadow-xl rounded-2xl p-8 border border-border">
          {/* Tabs */}
          <div className="flex border-b border-border mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
                mode === 'login'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
                mode === 'register'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Forms */}
          {mode === 'login' ? <LoginForm /> : <RegisterForm />}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Single-user trading journal application</p>
          <p className="mt-2">Built with Next.js, TypeScript, and Prisma</p>
        </div>
      </div>
    </div>
  );
}
