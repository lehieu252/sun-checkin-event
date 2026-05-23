'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
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
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [sunPos, setSunPos] = useState<{ left: string; top: string } | null>(
    null,
  );

  useEffect(() => {
    const el = placeholderRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      setSunPos({
        left: `${r.left + r.width / 2}px`,
        top: `${r.top + r.height / 2}px`,
      });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, []);

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

      <div className="display-idle">
        <div className="display-left">
          <div ref={placeholderRef} className="sun-placeholder" />

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

      {sunPos && (
        <div
          className="sun-fixed"
          style={{
            left: sunPos.left,
            top: sunPos.top,
            transform: 'translate(-50%, -50%) scale(0.75)',
          }}
        >
          <div className="sun-inner sun-inner--bobbing">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/sun_dark.svg" alt="Sun" className="sun-svg" />
          </div>
        </div>
      )}
    </main>
  );
}
