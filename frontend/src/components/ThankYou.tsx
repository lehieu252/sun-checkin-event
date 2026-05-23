'use client';

import { useLanguage } from '@/lib/i18n/context';

interface ThankYouProps {
  name: string;
  count: number;
}

export function ThankYou({ name, count }: ThankYouProps) {
  const { t } = useLanguage();

  return (
    <main className="display-main thank-you-screen">
      <div className="celebration-msg">
        <p className="celebration-thanks">
          {t('display.celebrationThanks', { name })}
        </p>
        <p className="celebration-order">
          {t('display.celebrationOrder', { count })}
        </p>
      </div>
    </main>
  );
}
