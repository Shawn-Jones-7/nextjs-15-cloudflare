import { getRequestConfig } from 'next-intl/server';
import { routing } from '@/lib/i18n/routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  const messages = await import(`../../messages/${locale}.json`) as { default: Record<string, unknown> };
  return {
    locale,
    messages: messages.default,
  };
});
