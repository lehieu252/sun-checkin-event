"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n/context";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n/types";

interface CheckinLanguagePickerProps {
  onSelect: (locale: Locale) => void;
}

export function CheckinLanguagePicker({
  onSelect,
}: CheckinLanguagePickerProps) {
  const { t } = useLanguage();

  return (
    <main className="checkin-page checkin-page--lang-picker flex min-h-screen items-center justify-center p-4">
      <div className="checkin-lang-picker-bg" aria-hidden="true">
        <Image
          src="/background_dark.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="checkin-lang-picker flex w-full max-w-md flex-col items-center gap-8 p-6 md:p-8">
        <Image
          src="/we_are_made_of_sun.svg"
          alt="We are made of sun"
          width={298}
          height={264}
          className="checkin-lang-sun-img"
          priority
        />

        <p className="checkin-lang-slogan">{t("display.darkPlugInSlogan")}</p>

        <div>
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
          <p className="checkin-lang-subtitle" style={{ marginTop: "8px" }}>{t("checkin.langSubtitle")}</p>
        </div>
      </div>
    </main>
  );
}
