'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useRouter, usePathname } from '@/i18n/routing';
import { routing } from '@/i18n/routing';

type Locale = (typeof routing.locales)[number];

const localeLabels: Record<Locale, string> = {
  en: 'English',
  pl: 'Polski',
};

/**
 * LanguageSelector - Dropdown component to switch between languages
 *
 * Features:
 * - Dropdown with English and Polish options
 * - Visual indicator for current language
 * - Keyboard accessible (tab navigation, Enter/Space to select)
 * - ARIA labels for screen readers
 * - Saves preference to localStorage
 * - Updates URL path when language changes
 * - Professional styling matching the trading journal aesthetic
 */
export function LanguageSelector() {
  const { locale, setLocale } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Sync locale with URL pathname to ensure we show the correct language
  // This is important because middleware might redirect based on cookie
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathLocale = window.location.pathname.match(/^\/(en|pl)(\/|$)/)?.[1];
      if (pathLocale && routing.locales.includes(pathLocale as Locale) && pathLocale !== locale) {
        // URL locale doesn't match context locale - update context
        setLocale(pathLocale as Locale);
      }
    }
  }, [pathname, locale, setLocale]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
    
    // Get the current full pathname from window.location
    // pathname from next-intl returns path WITHOUT locale prefix (e.g., /dashboard)
    // So we need to use window.location.pathname to get the full path with locale
    const fullPathname = typeof window !== 'undefined' ? window.location.pathname : pathname;
    
    // Extract the path without locale prefix
    // e.g., /en/dashboard -> /dashboard, /en -> /
    let pathWithoutLocale = fullPathname;
    for (const loc of routing.locales) {
      if (fullPathname.startsWith(`/${loc}/`)) {
        // Remove locale prefix (e.g., /en/dashboard -> /dashboard)
        pathWithoutLocale = fullPathname.slice(`/${loc}`.length);
        break;
      } else if (fullPathname === `/${loc}`) {
        pathWithoutLocale = '/';
        break;
      }
    }
    
    // Construct new path with new locale prefix
    // next-intl's router.push expects path WITHOUT locale, so we pass pathWithoutLocale
    // and let the router handle adding the locale prefix
    const pathToNavigate = pathWithoutLocale || '/';
    
    // Use window.location directly to navigate to the new locale path
    // This ensures we get the correct URL structure
    if (typeof window !== 'undefined') {
      const newPath = `/${newLocale}${pathToNavigate === '/' ? '' : pathToNavigate}`;
      window.location.href = newPath;
    }
  };

  const currentLocaleLabel = localeLabels[locale] || 'English';

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        aria-label={`Current language: ${currentLocaleLabel}. Click to change language.`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="language-selector-menu"
      >
        <GlobeIcon className="h-5 w-5 mr-2" aria-hidden="true" />
        <span className="hidden sm:inline">{currentLocaleLabel}</span>
        <span className="sm:hidden">{locale.toUpperCase()}</span>
        <ChevronDownIcon 
          className={`h-4 w-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          id="language-selector-menu"
          role="listbox"
          className="absolute right-0 mt-2 w-48 rounded-md border border-border bg-card shadow-lg z-50 focus:outline-none"
          aria-label="Select language"
        >
          <div className="py-1" role="group">
            {routing.locales.map((loc) => {
              const isSelected = loc === locale;
              return (
                <button
                  key={loc}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleLanguageChange(loc)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors focus:outline-none focus:bg-muted ${
                    isSelected
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-foreground hover:bg-muted'
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleLanguageChange(loc);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span>{localeLabels[loc]}</span>
                    {isSelected && (
                      <CheckIcon className="h-4 w-4" aria-hidden="true" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Icon Components

function GlobeIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m-2.873-9.671A8.959 8.959 0 0 0 12 3c-.778 0-1.533.099-2.253.284m7.873 9.671A8.959 8.959 0 0 1 12 21c-.778 0-1.533-.099-2.253-.284"
      />
    </svg>
  );
}

function ChevronDownIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m19.5 8.25-7.5 7.5-7.5-7.5"
      />
    </svg>
  );
}

function CheckIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  );
}

