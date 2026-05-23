'use client';

import Image from 'next/image';
import { useLanguage } from '@/lib/i18n/context';
import { LOCALE_LABELS, LOCALES, type Locale } from '@/lib/i18n/types';

interface CheckinLanguagePickerProps {
  onSelect: (locale: Locale) => void;
}

export function CheckinLanguagePicker({ onSelect }: CheckinLanguagePickerProps) {
  const { t } = useLanguage();

  return (
    <main className="checkin-page flex min-h-screen items-center justify-center p-4">
      <div className="checkin-lang-picker flex w-full max-w-md flex-col items-center gap-8 p-6 md:p-8">
        <div className="checkin-header">
          <Image
            src="/sun.svg"
            alt=""
            width={160}
            height={110}
            className="checkin-sun-img"
            priority
          />
          <Image
            src="/plug_in_evolution.svg"
            alt="Plug in to evolution"
            width={320}
            height={38}
            className="checkin-plug-logo"
            priority
          />
        </div>

        <div className="text-center">
          <p className="mt-2 text-sm text-[#6b4a2e]">{t('checkin.langSubtitle')}</p>
        </div>

        <div className="checkin-lang-options">
          {LOCALES.map((code) => (
            <button
              key={code}
              type="button"
              className="checkin-lang-option"
              onClick={() => onSelect(code)}
            >
              {LOCALE_LABELS[code]}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
