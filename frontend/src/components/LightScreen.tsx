'use client';

import Image from 'next/image';
import { DarkOdometerCounter } from '@/components/DarkOdometerCounter';
import { SlideToCheckIn } from '@/components/SlideToCheckIn';
import { ThreeColumnGallery } from '@/components/ThreeColumnGallery';
import { useLanguage } from '@/lib/i18n/context';
import type { NewCheckinPayload } from '@/lib/types';

interface LightScreenProps {
  count: number;
  checkins: NewCheckinPayload[];
  galleryEpoch: number;
  highlightId: number | null;
}

export function LightScreen({
  count,
  checkins,
  galleryEpoch,
  highlightId,
}: LightScreenProps) {
  const { t } = useLanguage();

  return (
    <main className="display-main">
      <div className="light-top-gradient" aria-hidden="true" />
      <div className="light-bottom-gradient" aria-hidden="true" />

      <div className="display-header">
        <Image
          src="/global_gateway.svg"
          alt="Global Gateway"
          width={323}
          height={179}
          className="display-logo display-logo--left"
          priority
        />
        <Image
          src="/euro_union.svg"
          alt="European Union"
          width={162}
          height={132}
          className="display-logo display-logo--right"
          priority
        />
      </div>

      <div className="light-screen-gallery">
        {checkins.length > 0 ? (
          <ThreeColumnGallery
            checkins={checkins}
            galleryEpoch={galleryEpoch}
            highlightId={highlightId}
            variant="light"
          />
        ) : (
          <div className="gallery-empty">
            <p>{t('display.galleryEmpty')}</p>
          </div>
        )}
      </div>

      <div className="light-sun-area">
        <div className="sun-inner sun-inner--bobbing sun-inner--light">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/sun_dark.svg" alt="" className="light-sun-svg" />
          <div className="light-sun-overlay">
            <Image
              src="/we_are_made_of_sun.svg"
              alt="We are made of sun"
              width={298}
              height={264}
              className="light-sun-slogan-img"
              priority
            />
            <p className="light-plug-in-slogan">{t('display.darkPlugInSlogan')}</p>
          </div>
        </div>
      </div>

      <div className="light-screen-footer">
        <DarkOdometerCounter count={count} digits={4} />
        <div className="light-odometer-label">
          {t('display.darkCounterLabel')}
        </div>
        <div className="light-screen-copy">
          <p>{t('display.darkRightParagraph1')}</p>
          <p>{t('display.darkRightParagraph2')}</p>
        </div>
        <SlideToCheckIn variant="wide" />
      </div>
    </main>
  );
}
