'use client';

import Image from 'next/image';
import { RefObject } from 'react';
import { SlideToCheckIn } from '@/components/SlideToCheckIn';
import { useLanguage } from '@/lib/i18n/context';

interface DarkScreenProps {
  brightness: number;
  placeholderRef: RefObject<HTMLDivElement | null>;
  onSlideComplete: () => void;
}

export function DarkScreen({
  brightness,
  placeholderRef,
  onSlideComplete,
}: DarkScreenProps) {
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

      <div className="dark-screen-left">
        <div className="dark-screen-headline-block">
          <p className="dark-screen-headline">{t('display.darkHeadline1')}</p>
          <p className="dark-screen-headline">{t('display.darkHeadline2')}</p>
        </div>

        <p className="dark-screen-body">
          {t('display.darkBody3Part1')}
          <span className="dark-screen-body-highlight">
            {t('display.darkBodyHighlight')}
          </span>
          {t('display.darkBody3Part2')}
        </p>

        <p className="dark-screen-cta">{t('display.darkCta')}</p>

        <div className="dark-screen-slide-wrap">
          <SlideToCheckIn
            label={t('display.slideReady')}
            onComplete={onSlideComplete}
          />
        </div>
      </div>

      <Image
        src="/mask.svg"
        alt=""
        width={1578.5}
        height={1280}
        className="dark-sun-mask"
        aria-hidden="true"
        priority
      />

      <div className="dark-screen-sun-area">
        <div ref={placeholderRef} className="dark-sun-placeholder" />
      </div>

      <Image
        src="/we_are_made_of_sun_white.svg"
        alt="We are made of sun"
        width={727}
        height={143}
        className="dark-screen-sun-white-img"
        priority
      />

      <p className="dark-screen-plug-slogan">{t('display.darkPlugInSlogan')}</p>
    </div>
  );
}
