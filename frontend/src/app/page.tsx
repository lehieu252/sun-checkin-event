'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';
import { DarkScreen } from '@/components/DarkScreen';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { OdometerCounter } from '@/components/OdometerCounter';
import { ThreeColumnGallery } from '@/components/ThreeColumnGallery';
import { API_URL, CHECKIN_URL } from '@/lib/config';
import { getDarkScreenBrightness } from '@/lib/darkBrightness';
import { useLanguage } from '@/lib/i18n/context';
import type { NewCheckinPayload } from '@/lib/types';

const DISPLAY_MS = 10000;
const GAP_MS = 3000;
const ROTATE_MS = 15000;

type ScreenMode = 'dark' | 'bright';

interface QueueItem {
  person: NewCheckinPayload;
  count: number;
}

interface Celebration {
  person: NewCheckinPayload;
  count: number;
}

export default function DisplayPage() {
  const { t } = useLanguage();
  const [count, setCount] = useState(0);
  const [checkins, setCheckins] = useState<NewCheckinPayload[]>([]);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [galleryEpoch, setGalleryEpoch] = useState(0);
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const [screenMode, setScreenMode] = useState<ScreenMode>('dark');
  const [rotationEnabled, setRotationEnabled] = useState(true);
  const [sunPos, setSunPos] = useState<{ left: string; top: string } | null>(
    null,
  );
  const [darkSunPos, setDarkSunPos] = useState<{
    left: string;
    top: string;
  } | null>(null);

  const placeholderRef = useRef<HTMLDivElement>(null);
  const darkPlaceholderRef = useRef<HTMLDivElement>(null);
  const queueRef = useRef<QueueItem[]>([]);
  const phaseRef = useRef<'idle' | 'celebrating' | 'gap'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rotateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countRef = useRef(0);
  const lastCelebrationRef = useRef<Celebration | null>(null);

  // Sun resting position from placeholder in left panel
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

  // Dark screen sun position
  useEffect(() => {
    const el = darkPlaceholderRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      setDarkSunPos({
        left: `${r.left + r.width / 2}px`,
        top: `${r.top + r.height / 2}px`,
      });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [screenMode]);

  const clearRotateTimer = () => {
    if (rotateTimerRef.current) {
      clearTimeout(rotateTimerRef.current);
      rotateTimerRef.current = null;
    }
  };

  const clearHighlightTimer = () => {
    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = null;
    }
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const processQueueRef = useRef<(() => void) | null>(null);

  const processQueue = useCallback(() => {
    if (phaseRef.current !== 'idle' || queueRef.current.length === 0) return;

    const next = queueRef.current.shift()!;
    phaseRef.current = 'celebrating';
    setCelebration({ person: next.person, count: next.count });

    clearTimer();
    timerRef.current = setTimeout(() => {
      setCelebration(null);
      phaseRef.current = 'gap';

      timerRef.current = setTimeout(() => {
        phaseRef.current = 'idle';
        if (queueRef.current.length === 0) {
          setRotationEnabled(true);
        }
        processQueueRef.current?.();
      }, GAP_MS);
    }, DISPLAY_MS);
  }, []);

  useEffect(() => {
    processQueueRef.current = processQueue;
  }, [processQueue]);

  // Reset gallery viewport + highlight when celebration ends
  useEffect(() => {
    const wasCelebrating = lastCelebrationRef.current !== null;
    const ended = wasCelebrating && celebration === null;

    if (ended && lastCelebrationRef.current) {
      setGalleryEpoch((e) => e + 1);
      setHighlightId(lastCelebrationRef.current.person.id);

      clearHighlightTimer();
      highlightTimerRef.current = setTimeout(() => {
        setHighlightId(null);
      }, 3000);
    }

    lastCelebrationRef.current = celebration;
  }, [celebration]);

  const enqueueCelebration = useCallback(
    (item: QueueItem) => {
      clearRotateTimer();
      setRotationEnabled(false);
      setScreenMode('bright');
      queueRef.current.push(item);
      processQueue();
    },
    [processQueue],
  );

  // Alternate dark / bright every 15s when idle
  useEffect(() => {
    if (!rotationEnabled || celebration !== null) {
      clearRotateTimer();
      return;
    }

    rotateTimerRef.current = setTimeout(() => {
      setScreenMode((prev) => (prev === 'dark' ? 'bright' : 'dark'));
    }, ROTATE_MS);

    return () => clearRotateTimer();
  }, [rotationEnabled, celebration, screenMode]);

  const fetchInitial = useCallback(async () => {
    try {
      const [countRes, listRes] = await Promise.all([
        fetch(`${API_URL}/checkins/count`),
        fetch(`${API_URL}/checkins`),
      ]);
      const countData = await countRes.json();
      const listData = await listRes.json();
      countRef.current = countData.count ?? 0;
      setCount(countRef.current);
      if (Array.isArray(listData)) {
        setCheckins(listData);
      }
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  const resetDisplay = useCallback(() => {
    clearTimer();
    clearHighlightTimer();
    clearRotateTimer();
    queueRef.current = [];
    phaseRef.current = 'idle';
    countRef.current = 0;
    setCount(0);
    setCheckins([]);
    setCelebration(null);
    setGalleryEpoch(0);
    setHighlightId(null);
    setScreenMode('dark');
    setRotationEnabled(true);
    lastCelebrationRef.current = null;
  }, []);

  useEffect(() => {
    const socket = io(API_URL, { transports: ['websocket', 'polling'] });

    socket.on('new-checkin', (payload: NewCheckinPayload) => {
      countRef.current++;
      const c = countRef.current;
      setCount(c);
      setCheckins((prev) => [payload, ...prev]);
      enqueueCelebration({ person: payload, count: c });
    });

    socket.on('reset-checkins', () => {
      resetDisplay();
    });

    return () => {
      socket.disconnect();
      clearTimer();
      clearHighlightTimer();
      clearRotateTimer();
    };
  }, [enqueueCelebration, resetDisplay]);

  const celebrating = celebration !== null;
  const showDarkLayer = !celebrating && screenMode === 'dark';
  const showBrightLayer = celebrating || screenMode === 'bright';
  const darkBrightness = getDarkScreenBrightness(count);

  const sunLeft = celebrating ? '50vw' : (sunPos?.left ?? '-999px');
  const sunTop = celebrating ? '42vh' : (sunPos?.top ?? '-999px');
  const sunScale = celebrating ? 1.5 : 0.75;
  const sunTransition = sunPos
    ? 'left 1.4s cubic-bezier(0.34,1.1,0.64,1), top 1.4s ease-in-out, transform 1.4s cubic-bezier(0.34,1.1,0.64,1)'
    : 'none';

  return (
    <div className="display-root">
      <LanguageSwitcher variant="display" />

      {/* ─── Dark screen layer ─── */}
      <div
        className={`screen-layer screen-layer--dark${showDarkLayer ? ' screen-layer--active' : ''}`}
      >
        <DarkScreen
          count={count}
          brightness={darkBrightness}
          placeholderRef={darkPlaceholderRef}
        />

        {darkSunPos && showDarkLayer && (
          <div
            className="sun-fixed dark-sun-fixed"
            style={{
              left: darkSunPos.left,
              top: darkSunPos.top,
              transform: 'translate(-50%, -50%) scale(1)',
            }}
          >
            <div
              className="sun-inner sun-inner--bobbing dark-sun-brightness"
              style={{ filter: `brightness(${darkBrightness})` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/sun_dark.svg" alt="Sun" className="dark-sun-svg" />
            </div>
          </div>
        )}
      </div>

      {/* ─── Bright check-in screen layer ─── */}
      <div
        className={`screen-layer screen-layer--bright${showBrightLayer ? ' screen-layer--active' : ''}`}
      >
    <main className="display-main">
      {/* Top gradient — mirror of bottom, at header */}
      <div className="display-top-gradient" aria-hidden="true" />

      {/* Header logos */}
      <div className="display-header">
        <Image
          src="/global_gateway.svg"
          alt="Global Gateway"
          width={220}
          height={48}
          className="display-logo display-logo--left"
          priority
        />
        <Image
          src="/euro_union.svg"
          alt="European Union"
          width={150}
          height={96}
          className="display-logo display-logo--right"
          priority
        />
      </div>

      {/* Idle layout — hidden during celebration */}
      <div
        className={`display-idle${celebrating ? ' display-idle--hidden' : ''}`}
      >
        {/* Left panel */}
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

          <OdometerCounter
            count={count}
            digits={4}
            label=""
          />
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

        {/* Right panel — 3-column gallery */}
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

        {/* Bottom gradient — CSS linear gradient per design spec */}
        <div className="display-bottom-gradient" aria-hidden="true" />
      </div>

      {/* Fixed sun — bright SVG with bob animation */}
      {sunPos && showBrightLayer && (
        <div
          className="sun-fixed"
          style={{
            left: sunLeft,
            top: sunTop,
            transition: sunTransition,
            transform: `translate(-50%, -50%) scale(${sunScale})`,
          }}
        >
          <div className="sun-inner sun-inner--bobbing">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/sun_dark.svg" alt="Sun" className="sun-svg" />
          </div>
        </div>
      )}

      {/* Celebration message */}
      {celebration && (
        <div className="celebration-msg">
          <p className="celebration-thanks">
            {t('display.celebrationThanks', { name: celebration.person.name })}
          </p>
          <p className="celebration-order">
            {t('display.celebrationOrder', { count: celebration.count })}
          </p>
        </div>
      )}
    </main>
      </div>
    </div>
  );
}
