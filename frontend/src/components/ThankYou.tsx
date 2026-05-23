'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { API_URL } from '@/lib/config';
import { useLanguage } from '@/lib/i18n/context';

interface ThankYouProps {
  name: string;
  photoUrl: string;
}

export function ThankYou({ name, photoUrl }: ThankYouProps) {
  const { t } = useLanguage();
  const [copyVisible, setCopyVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setCopyVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="thank-you-screen dark-screen">
      <div className="thank-you-screen-bg-wrap">
        <Image
          src="/background_dark.png"
          alt=""
          fill
          className="dark-screen-bg object-cover"
          priority
        />
        <Image
          src="/background_2.png"
          alt=""
          fill
          className="thank-you-screen-bg-overlay object-cover"
          priority
        />
      </div>

      <div className="dark-screen-header">
        <Image
          src="/global_gateway_white.svg"
          alt="Global Gateway"
          width={323}
          height={179}
          className="dark-screen-logo dark-screen-logo--left"
          priority
        />
        <Image
          src="/euro_union_2.svg"
          alt="European Union"
          width={162}
          height={132}
          className="dark-screen-logo dark-screen-logo--right"
          priority
        />
      </div>

      <div className="thank-you-content">
        <div className="thank-you-avatar">
          <div className="thank-you-avatar-inner thank-you-avatar-inner--bobbing">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${API_URL}${photoUrl}`}
              alt={name}
              className="thank-you-avatar-photo"
            />
          </div>
        </div>

        <div className={`thank-you-copy${copyVisible ? ' thank-you-copy--rise' : ''}`}>
          <div className="thank-you-headline">
            <p>{t('display.thankYouHeadline')}</p>
            <p>{t('display.thankYouSunQuote')}</p>
          </div>

          <p className="thank-you-body">
            {t('display.thankYouBody', { name })}
          </p>
        </div>
      </div>
    </div>
  );
}
