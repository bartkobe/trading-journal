import { NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';
import { defaultLocale } from '@/i18n/config';

/**
 * Get locale from request (cookie, header, or default)
 */
function getLocaleFromRequest(request: NextRequest): string {
  // First, try to get locale from cookie
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value;
  if (localeCookie && routing.locales.includes(localeCookie as any)) {
    return localeCookie;
  }

  // Try to extract from referer URL (e.g., /en/dashboard, /pl/trades)
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const pathname = refererUrl.pathname;
      const localeFromPath = pathname.split('/')[1];
      if (localeFromPath && routing.locales.includes(localeFromPath as any)) {
        return localeFromPath;
      }
    } catch {
      // Invalid referer URL, continue
    }
  }

  // Try Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    // Parse Accept-Language header (e.g., "en-US,en;q=0.9,pl;q=0.8")
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const [code] = lang.trim().split(';');
        return code.split('-')[0]; // Extract language code (e.g., "en" from "en-US")
      });

    // Find first matching locale
    for (const lang of languages) {
      if (routing.locales.includes(lang as any)) {
        return lang;
      }
    }
  }

  // Default to defaultLocale
  return defaultLocale;
}

/**
 * Get translations for API routes
 * Usage: const t = await getApiTranslations(request, 'errors');
 * Returns a function that can be called with a key to get the translated string
 */
export async function getApiTranslations(
  request: NextRequest,
  namespace: 'errors' | 'common' | 'forms' | 'trades' | 'analytics' | 'navigation' = 'errors'
) {
  const locale = getLocaleFromRequest(request);
  
  // Load the translation file directly
  const messages = await import(`../locales/${locale}/${namespace}.json`);
  const translations = messages.default;

  // Return a function that works like useTranslations
  return (key: string, values?: Record<string, any>): string => {
    let translation = translations[key];
    
    if (!translation) {
      // Fallback to English if key not found
      if (locale !== 'en') {
        const englishMessages = require(`../locales/en/${namespace}.json`);
        translation = englishMessages[key] || key;
      } else {
        translation = key;
      }
    }

    // Simple variable interpolation (for ICU format, we'd need a library)
    if (values && typeof translation === 'string') {
      return translation.replace(/\{(\w+)\}/g, (match, key) => {
        return values[key] !== undefined ? String(values[key]) : match;
      });
    }

    return translation;
  };
}

