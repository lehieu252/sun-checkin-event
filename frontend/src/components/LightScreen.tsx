'use client';

import Image from 'next/image';
import { DarkOdometerCounter } from '@/components/DarkOdometerCounter';
import { SlideToCheckIn } from '@/components/SlideToCheckIn';
import { ThreeColumnGallery } from '@/components/ThreeColumnGallery';
import { useLanguage } from '@/lib/i18n/context';
import { getLightScreenSunOpacity } from '@/lib/darkBrightness';
import type { NewCheckinPayload } from '@/lib/types';

interface LightScreenProps {
  count: number;
  checkins: NewCheckinPayload[];
  galleryEpoch: number;
  highlightId: number | null;
  onQrOpen: () => void;
}

export function LightScreen({
  count,
  checkins,
  galleryEpoch,
  highlightId,
  onQrOpen,
}: LightScreenProps) {
  const { t, locale } = useLanguage();
  const sunOpacity = getLightScreenSunOpacity(count);

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

      <Image
        src="/we_are_made_of_sun.svg"
        alt="We are made of sun"
        width={283}
        height={251}
        className="light-sun-slogan-left"
        priority
      />

      <div className="light-sun-area">
        <div className="sun-inner sun-inner--bobbing sun-inner--light">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sun_dark.svg"
            alt=""
            className="light-sun-svg"
            style={{ opacity: sunOpacity }}
          />
        </div>
      </div>

      {locale === 'en' ? (
        <Image
          src="/plug_into_evolution_3.svg"
          alt={t('display.darkPlugInSlogan')}
          width={350}
          height={148}
          className="light-plug-in-right light-plug-in-right--en"
          priority
        />
      ) : (
        <Image
          src="/nhan_ket_noi_bat_thay_doi_vi.svg"
          alt={t('display.darkPlugInSlogan')}
          width={355}
          height={142}
          className="light-plug-in-right"
          priority
        />
      )}

      <div className="light-screen-footer">
        <DarkOdometerCounter count={count} digits={4} />
        <div className="light-odometer-label">
          {t('display.darkCounterLabel')}
        </div>
        <div className="light-screen-copy">
          <p>{t('display.darkRightParagraph1')}</p>
          <p>{t('display.darkRightParagraph2')}</p>
        </div>
        <SlideToCheckIn variant="wide" onComplete={onQrOpen} />
      </div>
    </main>
  );
}
