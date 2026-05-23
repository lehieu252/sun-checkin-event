'use client';

import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { OdometerCounter } from '@/components/OdometerCounter';
import { ThreeColumnGallery } from '@/components/ThreeColumnGallery';
import { CHECKIN_URL } from '@/lib/config';
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
      <div className="display-top-gradient" aria-hidden="true" />

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

      <div className="display-idle">
        <div className="display-left">
          <Image
            src="/plug_in_evolution.svg"
            alt="Plug in to evolution"
            width={480}
            height={56}
            className="plug-in-logo"
            priority
          />

          <OdometerCounter count={count} digits={4} label="" />
          <div className="odometer-label">{t('display.odometerLabel')}</div>
          <div className="cta-qr-row">
            <div className="cta-qr-box">
              <QRCodeSVG
                value={CHECKIN_URL}
                size={112}
                level="H"
                includeMargin={false}
                fgColor="#3F1700"
              />
            </div>
            <div className="cta-qr-text">
              <p className="cta-qr-title">{t('display.qrTitle')}</p>
              <p className="cta-qr-sub">{t('display.qrSub')}</p>
            </div>
          </div>
        </div>

        <div className="display-right">
          {checkins.length > 0 ? (
            <ThreeColumnGallery
              checkins={checkins}
              galleryEpoch={galleryEpoch}
              highlightId={highlightId}
            />
          ) : (
            <div className="gallery-empty">
              <p>{t('display.galleryEmpty')}</p>
            </div>
          )}
        </div>

        <div className="display-bottom-gradient" aria-hidden="true" />
      </div>
    </main>
  );
}
