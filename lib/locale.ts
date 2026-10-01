export const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'de', 'ja', 'ko', 'pt', 'zh'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'en';

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

export function normalizeLocale(locale?: string | null): SupportedLocale {
  if (!locale) return DEFAULT_LOCALE;

  const normalized = locale.toLowerCase();

  if (isSupportedLocale(normalized)) {
    return normalized;
  }

  return DEFAULT_LOCALE;
}

export function getLocaleLabel(locale: string): string {
  const labels: Record<SupportedLocale, string> = {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    ja: '日本語',
    ko: '한국어',
    pt: 'Português',
    zh: '中文',
  };

  return labels[normalizeLocale(locale)];
}
