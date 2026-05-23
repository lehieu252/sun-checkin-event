'use client';

import Image from 'next/image';
import { RefObject } from 'react';
import { DarkOdometerCounter } from '@/components/DarkOdometerCounter';
import { SlideToCheckIn } from '@/components/SlideToCheckIn';
import { useLanguage } from '@/lib/i18n/context';

interface DarkScreenProps {
  count: number;
  brightness: number;
  placeholderRef: RefObject<HTMLDivElement | null>;
}

export function DarkScreen({ count, brightness, placeholderRef }: DarkScreenProps) {
  const { t } = useLanguage();

  return (
    <div className="dark-screen">
      <div
        className="dark-screen-bg-wrap"
        style={{ filter: `brightness(${brightness})` }}
      >
        <Image
          src="/background_dark.png"
          alt=""
          fill
          className="dark-screen-bg object-cover"
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

      <div className="dark-screen-slogan-left">
        <Image
          src="/we_are_made_of_sun.svg"
          alt="We are made of sun"
          width={745}
          height={799}
          className="dark-slogan-img dark-slogan-img--left"
          priority
        />
        <p className="dark-plug-in-slogan">{t('display.darkPlugInSlogan')}</p>
      </div>

      <div className="dark-screen-sun-area">
        <div ref={placeholderRef} className="dark-sun-placeholder" />
      </div>

      <div className="dark-screen-right-column">
        <div className="dark-screen-slogan dark-screen-slogan--right">
          <p className="dark-slogan-text">{t('display.darkRightParagraph1')}</p>
          <p className="dark-slogan-text">{t('display.darkRightParagraph2')}</p>
        </div>
        <SlideToCheckIn />
      </div>

      <div className="dark-screen-footer">
        <DarkOdometerCounter count={count} digits={4} />
        <div className="dark-odometer-label">
          {t('display.darkCounterLabel')}
        </div>
      </div>
    </div>
  );
}
