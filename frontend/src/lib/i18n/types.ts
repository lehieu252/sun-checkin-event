export type Locale = 'vi' | 'en';

export const LOCALES: Locale[] = ['vi', 'en'];

export const LOCALE_LABELS: Record<Locale, string> = {
  vi: 'VI',
  en: 'EN',
};

export const LOCALE_STORAGE_KEY = 'locale';
export const CHECKIN_LANG_CONFIRMED_KEY = 'checkin-lang-confirmed';
