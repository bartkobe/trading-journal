/**
 * i18n Configuration
 * 
 * Locale configuration for next-intl
 * The actual routing configuration is in routing.ts
 * The request configuration is in request.ts
 */

export const locales = ['en', 'pl'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

