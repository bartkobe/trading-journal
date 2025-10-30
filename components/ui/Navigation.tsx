'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';

interface NavigationProps {
  user?: {
    name?: string | null;
    email: string;
  } | null;
}

/**
 * Navigation - Main navigation component for the Trading Journal
 *
 * Features:
 * - Responsive navigation bar
 * - Active link highlighting
 * - Theme toggle integration
 * - User menu with logout
 * - Professional financial aesthetic
 */
export function Navigation({ user }: NavigationProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    if (path === '/trades') {
      return pathname.startsWith('/trades');
    }
    return pathname === path;
  };

  const navLinks = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      href: '/trades',
      label: 'Trades',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
    },
  ];

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg"
              aria-label="Trading Journal home"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg group-hover:bg-primary-hover transition-colors" aria-hidden="true">
                <svg
                  className="w-6 h-6 text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-foreground">Trading Journal</h1>
                <p className="text-xs text-muted-foreground">Track. Analyze. Improve.</p>
              </div>
            </Link>
          </div>

          {/* Main Navigation Links */}
          <div className="hidden md:flex items-center space-x-1" role="navigation" aria-label="Primary">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  isActive(link.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
                aria-current={isActive(link.href) ? 'page' : undefined}
              >
                <span aria-hidden="true">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}

            <Link
              href="/trades/new"
              className="flex items-center space-x-2 px-4 py-2 ml-2 bg-success hover:bg-success-dark text-success-foreground rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Create new trade"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>New Trade</span>
            </Link>
          </div>

          {/* Right side - Theme Toggle and User Menu */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />

            {user && (
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {user.name || 'Trader'}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>

                <form action="/api/auth/logout" method="POST">
                  <button
                    type="submit"
                    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-danger hover:bg-danger-light rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    aria-label="Log out of Trading Journal"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span className="hidden lg:inline">Logout</span>
                  </button>
                </form>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Open mobile menu"
              aria-expanded="false"
              aria-controls="mobile-menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Hidden by default, would need state management to show/hide */}
      <div id="mobile-menu" className="md:hidden hidden border-t border-border" role="navigation" aria-label="Mobile navigation">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                isActive(link.href)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
              }`}
              aria-current={isActive(link.href) ? 'page' : undefined}
            >
              <span aria-hidden="true">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}

          <Link
            href="/trades/new"
            className="flex items-center space-x-3 px-3 py-2 bg-success hover:bg-success-dark text-success-foreground rounded-lg text-base font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>New Trade</span>
          </Link>

          {user && (
            <div className="pt-4 border-t border-border mt-4">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-foreground">{user.name || 'Trader'}</p>
                <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
              </div>
              <form action="/api/auth/logout" method="POST" className="mt-2">
                <button
                  type="submit"
                  className="w-full flex items-center space-x-3 px-3 py-2 text-base font-medium text-danger hover:bg-danger-light rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Logout</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

/**
 * NavigationSkeleton - Loading state for Navigation
 */
export function NavigationSkeleton() {
  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
            <div className="hidden sm:block space-y-2">
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            <div className="h-9 w-24 bg-muted rounded-lg animate-pulse" />
            <div className="h-9 w-24 bg-muted rounded-lg animate-pulse" />
            <div className="h-9 w-32 bg-muted rounded-lg animate-pulse ml-2" />
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-muted rounded-md animate-pulse" />
            <div className="hidden sm:block space-y-2">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-3 w-32 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

