'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/lib/validation';

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        if (response.status === 400) {
          setError(result.error || 'Invalid registration information. Please check your details and try again.');
        } else if (response.status === 409) {
          setError('An account with this email already exists. Please log in or use a different email address.');
        } else if (response.status === 500) {
          setError('Unable to create account due to a server error. Please try again in a moment.');
        } else {
          setError(result.error || 'Failed to create account. Please try again.');
        }
        return;
      }

      // Redirect to dashboard on success (force full page reload to update navigation)
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Registration error:', err);
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
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
          Name (Optional)
        </label>
        <input
          id="name"
          type="text"
          {...register('name')}
          className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground transition-colors"
          placeholder="John Doe"
          disabled={isLoading}
        />
        {errors.name && <p className="mt-1 text-sm text-danger">{errors.name.message}</p>}
      </div>

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
        <p className="mt-1 text-xs text-muted-foreground">
          Must be at least 8 characters with uppercase, lowercase, and number
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  );
}
