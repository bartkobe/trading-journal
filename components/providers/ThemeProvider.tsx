'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';

/**
 * Theme options:
 * - 'light': Force light theme
 * - 'dark': Force dark theme
 * - 'system': Follow system preference
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * The actual resolved theme (what's currently applied)
 */
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  /** The current theme setting (light, dark, or system) */
  theme: Theme;
  /** The actual resolved theme being applied */
  resolvedTheme: ResolvedTheme;
  /** Set the theme */
  setTheme: (theme: Theme) => void;
  /** Toggle between light and dark themes */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'trading-journal-theme';

interface ThemeProviderProps {
  children: React.ReactNode;
  /** Default theme if no stored preference exists */
  defaultTheme?: Theme;
  /** Storage key for localStorage (default: 'trading-journal-theme') */
  storageKey?: string;
}

/**
 * ThemeProvider - Manages theme state and applies theme classes to document
 *
 * Features:
 * - Manual theme selection (light/dark/system)
 * - System preference detection
 * - localStorage persistence
 * - Automatic theme application
 * - No flash of unstyled content (FOUC)
 */
export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = THEME_STORAGE_KEY,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false);

  // Get system theme preference
  const getSystemTheme = useCallback((): ResolvedTheme => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }, []);

  // Resolve the actual theme to apply
  const resolveTheme = useCallback(
    (themeValue: Theme): ResolvedTheme => {
      if (themeValue === 'system') {
        return getSystemTheme();
      }
      return themeValue;
    },
    [getSystemTheme]
  );

  // Apply theme to document
  const applyTheme = useCallback((resolvedThemeValue: ResolvedTheme) => {
    const root = document.documentElement;

    // Remove both classes first
    root.classList.remove('light', 'dark');

    // Add the resolved theme class
    root.classList.add(resolvedThemeValue);

    // Set data attribute for CSS selectors
    root.setAttribute('data-theme', resolvedThemeValue);

    // Update color-scheme for native browser controls
    root.style.colorScheme = resolvedThemeValue;
  }, []);

  // Set theme and persist to localStorage
  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);

      // Save to localStorage
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch (error) {
        console.error('Failed to save theme preference:', error);
      }

      // Resolve and apply the theme
      const resolved = resolveTheme(newTheme);
      setResolvedTheme(resolved);
      applyTheme(resolved);
    },
    [storageKey, resolveTheme, applyTheme]
  );

  // Toggle between light and dark (ignores system preference)
  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);

  // Initialize theme on mount
  useEffect(() => {
    let initialTheme = defaultTheme;

    // Try to load from localStorage
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored && (stored === 'light' || stored === 'dark' || stored === 'system')) {
        initialTheme = stored as Theme;
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    }

    setThemeState(initialTheme);
    const resolved = resolveTheme(initialTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
    setMounted(true);
  }, [defaultTheme, storageKey, resolveTheme, applyTheme]);

  // Listen for system theme changes when theme is set to 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const newResolvedTheme = e.matches ? 'dark' : 'light';
      setResolvedTheme(newResolvedTheme);
      applyTheme(newResolvedTheme);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Fallback for older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme, applyTheme]);

  const contextValue = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  );

  // Prevent flash of unstyled content by rendering nothing until mounted
  // The theme will already be applied via the script in layout
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 *
 * @throws Error if used outside ThemeProvider
 *
 * @example
 * const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
 *
 * // Set specific theme
 * setTheme('dark');
 *
 * // Toggle between light and dark
 * toggleTheme();
 *
 * // Follow system preference
 * setTheme('system');
 *
 * // Check current theme
 * if (resolvedTheme === 'dark') {
 *   // Dark theme is active
 * }
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

/**
 * Script to prevent FOUC (Flash of Unstyled Content)
 *
 * This should be added to the document head before any other content.
 * It runs synchronously before the page renders to apply the correct theme.
 *
 * Usage: Add to app/layout.tsx in the <head>:
 * <script dangerouslySetInnerHTML={{ __html: themeScript }} />
 */
export const themeScript = `
(function() {
  try {
    var storageKey = '${THEME_STORAGE_KEY}';
    var theme = localStorage.getItem(storageKey) || 'system';
    var resolvedTheme = theme;
    
    if (theme === 'system') {
      resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    document.documentElement.classList.add(resolvedTheme);
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    document.documentElement.style.colorScheme = resolvedTheme;
  } catch (e) {
    console.error('Failed to apply theme:', e);
  }
})();
`;

