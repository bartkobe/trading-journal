'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { loginSchema, type LoginInput } from '@/lib/validation';

export function LoginForm() {
  const router = useRouter();
  const t = useTranslations('forms');
  const tErrors = useTranslations('errors');
  const tCommon = useTranslations('common');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        if (response.status === 401) {
          setError(tErrors('invalidEmailOrPassword'));
        } else if (response.status === 500) {
          setError(tErrors('serverErrorSignIn'));
        } else {
          setError(result.error || tErrors('failedToSignIn'));
        }
        return;
      }

      // Redirect to dashboard on success with locale prefix
      // Extract locale from current URL path (e.g., /en or /pl)
      const pathname = window.location.pathname;
      const localeMatch = pathname.match(/^\/(en|pl)(\/|$)/);
      const extractedLocale = localeMatch ? localeMatch[1] : 'en';
      window.location.href = `/${extractedLocale}/dashboard`;
    } catch (err) {
      console.error('Login error:', err);
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError(tErrors('unableToConnect'));
      } else {
        setError(tErrors('unexpectedError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-danger-light border border-danger text-danger-dark px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
          {t('emailAddress')}
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground transition-colors"
          placeholder={t('emailPlaceholder')}
          disabled={isLoading}
        />
        {errors.email && <p className="mt-1 text-sm text-danger">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
          {t('password')}
        </label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground transition-colors"
          placeholder={t('passwordPlaceholder')}
          disabled={isLoading}
        />
        {errors.password && <p className="mt-1 text-sm text-danger">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? tCommon('signingIn') : t('signIn')}
      </button>
    </form>
  );
}
