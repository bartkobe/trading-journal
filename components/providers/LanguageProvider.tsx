'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { routing } from '@/i18n/routing';

/**
 * Supported locale types
 */
export type Locale = (typeof routing.locales)[number];

interface LanguageContextValue {
  /** The current locale */
  locale: Locale;
  /** Set the locale and persist to localStorage */
  setLocale: (locale: Locale) => void;
  /** Get the current locale from localStorage or default */
  getStoredLocale: () => Locale;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'trading-journal-locale';

interface LanguageProviderProps {
  children: React.ReactNode;
  /** Default locale if no stored preference exists */
  defaultLocale?: Locale;
  /** Storage key for localStorage (default: 'trading-journal-locale') */
  storageKey?: string;
}

/**
 * LanguageProvider - Manages language preference and persists to localStorage
 *
 * Features:
 * - Language preference persistence in localStorage
 * - Defaults to 'en' if no preference is stored
 * - Updates URL path when language changes
 * - Works with next-intl routing
 */
export function LanguageProvider({
  children,
  defaultLocale = 'en',
  storageKey = LANGUAGE_STORAGE_KEY,
}: LanguageProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  // Get stored locale from localStorage
  const getStoredLocale = useCallback((): Locale => {
    if (typeof window === 'undefined') return defaultLocale;
    
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored && routing.locales.includes(stored as Locale)) {
        return stored as Locale;
      }
    } catch (error) {
      console.error('Failed to load language preference:', error);
    }
    
    return defaultLocale;
  }, [defaultLocale, storageKey]);

  // Set locale and persist to localStorage
  const setLocale = useCallback(
    (newLocale: Locale) => {
      // Validate locale
      if (!routing.locales.includes(newLocale)) {
        console.warn(`Invalid locale: ${newLocale}. Using default: ${defaultLocale}`);
        return;
      }

      setLocaleState(newLocale);

      // Save to localStorage
      try {
        localStorage.setItem(storageKey, newLocale);
      } catch (error) {
        console.error('Failed to save language preference:', error);
      }

      // Update URL path if we're on a page with locale prefix
      // Extract current path without locale
      const pathWithoutLocale = pathname.replace(/^\/(en|pl)/, '') || '/';
      const newPath = `/${newLocale}${pathWithoutLocale}`;
      
      // Only navigate if the path actually changed
      if (newPath !== pathname) {
        router.push(newPath);
      }
    },
    [storageKey, pathname, router, defaultLocale]
  );

  // Initialize locale on mount
  useEffect(() => {
    // Try to get locale from current pathname first
    const pathLocale = pathname.match(/^\/(en|pl)(\/|$)/)?.[1];
    let initialLocale: Locale = defaultLocale;

    if (pathLocale && routing.locales.includes(pathLocale as Locale)) {
      // Use locale from URL path
      initialLocale = pathLocale as Locale;
    } else {
      // Try to load from localStorage
      initialLocale = getStoredLocale();
    }

    setLocaleState(initialLocale);
    
    // Save to localStorage if not already set
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored || stored !== initialLocale) {
        localStorage.setItem(storageKey, initialLocale);
      }
    } catch (error) {
      console.error('Failed to save initial language preference:', error);
    }

    setMounted(true);
  }, [defaultLocale, storageKey, getStoredLocale, pathname]);

  const contextValue = useMemo(
    () => ({
      locale,
      setLocale,
      getStoredLocale,
    }),
    [locale, setLocale, getStoredLocale]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to access language context
 *
 * @throws Error if used outside LanguageProvider
 *
 * @example
 * const { locale, setLocale, getStoredLocale } = useLanguage();
 *
 * // Set locale
 * setLocale('pl');
 *
 * // Get stored locale
 * const stored = getStoredLocale();
 */
export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);

  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
}

