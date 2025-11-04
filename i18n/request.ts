import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { defaultLocale } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that the incoming `locale` is valid
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = defaultLocale;
  }

  // Load all message namespaces
  const [common, navigation, forms, trades, analytics, errors] = await Promise.all([
    import(`../locales/${locale}/common.json`),
    import(`../locales/${locale}/navigation.json`),
    import(`../locales/${locale}/forms.json`),
    import(`../locales/${locale}/trades.json`),
    import(`../locales/${locale}/analytics.json`),
    import(`../locales/${locale}/errors.json`),
  ]);

  return {
    locale,
    messages: {
      common: common.default,
      navigation: navigation.default,
      forms: forms.default,
      trades: trades.default,
      analytics: analytics.default,
      errors: errors.default,
    },
  };
});

