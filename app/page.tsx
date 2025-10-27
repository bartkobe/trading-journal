'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function HomePage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Trading Journal</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track, analyze, and improve your trading performance
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
                mode === 'login'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
                mode === 'register'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Forms */}
          {mode === 'login' ? <LoginForm /> : <RegisterForm />}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Single-user trading journal application</p>
          <p className="mt-2">Built with Next.js, TypeScript, and Prisma</p>
        </div>
      </div>
    </div>
  );
}
