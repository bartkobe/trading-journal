'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validation';

export function LoginForm() {
  const router = useRouter();
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
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (response.status === 500) {
          setError('Unable to sign in due to a server error. Please try again in a moment.');
        } else {
          setError(result.error || 'Failed to sign in. Please try again.');
        }
        return;
      }

      // Redirect to dashboard on success
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error('Login error:', err);
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
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
          Email Address
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground transition-colors"
          placeholder="you@example.com"
          disabled={isLoading}
        />
        {errors.email && <p className="mt-1 text-sm text-danger">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground transition-colors"
          placeholder="••••••••"
          disabled={isLoading}
        />
        {errors.password && <p className="mt-1 text-sm text-danger">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
