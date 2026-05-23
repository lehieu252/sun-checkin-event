'use client';

import { useLanguage } from '@/lib/i18n/context';
import { LOCALE_LABELS, LOCALES, type Locale } from '@/lib/i18n/types';

interface LanguageSwitcherProps {
  variant?: 'display' | 'checkin';
}

export function LanguageSwitcher({ variant = 'display' }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className={`lang-switcher lang-switcher--${variant}`}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          className={`lang-switcher-btn${
            locale === code ? ' lang-switcher-btn--active' : ''
          }`}
          onClick={() => setLocale(code as Locale)}
          aria-pressed={locale === code}
        >
          {LOCALE_LABELS[code]}
        </button>
      ))}
    </div>
  );
}
