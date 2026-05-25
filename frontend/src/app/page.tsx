'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { CheckinQrModal } from '@/components/CheckinQrModal';
import { DarkScreen } from '@/components/DarkScreen';
import { DisplayKioskPrompt } from '@/components/DisplayKioskPrompt';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { LightScreen } from '@/components/LightScreen';
import { ThankYou } from '@/components/ThankYou';
import { API_URL } from '@/lib/config';
import { getDarkScreenBrightness } from '@/lib/darkBrightness';
import type { NewCheckinPayload } from '@/lib/types';

const DARK_SCREEN_MS = 20000;
const LIGHT_SCREEN_MS = 15000;
const THANK_YOU_MS = 10000;
const GAP_MS = 3000;
const SCREEN_LAYER_MS = 800;

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
  const [count, setCount] = useState(0);
  const [checkins, setCheckins] = useState<NewCheckinPayload[]>([]);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [celebrationFadingOut, setCelebrationFadingOut] = useState(false);
  const [galleryEpoch, setGalleryEpoch] = useState(0);
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const [screenMode, setScreenMode] = useState<ScreenMode>('dark');
  const [rotationEnabled, setRotationEnabled] = useState(true);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [darkSunPos, setDarkSunPos] = useState<{
    left: string;
    top: string;
  } | null>(null);

  const displayRootRef = useRef<HTMLDivElement>(null);
  const darkPlaceholderRef = useRef<HTMLDivElement>(null);
  const queueRef = useRef<QueueItem[]>([]);
  const phaseRef = useRef<'idle' | 'celebrating' | 'gap'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rotateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countRef = useRef(0);
  const lastCelebrationRef = useRef<Celebration | null>(null);

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
    setCelebrationFadingOut(false);
    setCelebration({ person: next.person, count: next.count });

    clearTimer();
    timerRef.current = setTimeout(() => {
      setCelebrationFadingOut(true);

      timerRef.current = setTimeout(() => {
        setCelebration(null);
        setCelebrationFadingOut(false);
        phaseRef.current = 'gap';

        timerRef.current = setTimeout(() => {
          phaseRef.current = 'idle';
          if (queueRef.current.length === 0) {
            setRotationEnabled(true);
          }
          processQueueRef.current?.();
        }, GAP_MS);
      }, SCREEN_LAYER_MS);
    }, THANK_YOU_MS);
  }, []);

  useEffect(() => {
    processQueueRef.current = processQueue;
  }, [processQueue]);

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
      setQrModalOpen(false);
      queueRef.current.push(item);
      processQueue();
    },
    [processQueue],
  );

  useEffect(() => {
    if (!rotationEnabled || celebration !== null || qrModalOpen) {
      clearRotateTimer();
      return;
    }

    const rotateMs = screenMode === 'dark' ? DARK_SCREEN_MS : LIGHT_SCREEN_MS;

    rotateTimerRef.current = setTimeout(() => {
      setScreenMode((prev) => (prev === 'dark' ? 'bright' : 'dark'));
    }, rotateMs);

    return () => clearRotateTimer();
  }, [rotationEnabled, celebration, screenMode, qrModalOpen]);

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
    setCelebrationFadingOut(false);
    setGalleryEpoch(0);
    setHighlightId(null);
    setScreenMode('dark');
    setRotationEnabled(true);
    setQrModalOpen(false);
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
  const showThankYouLayer = celebrating && !celebrationFadingOut;
  const showDarkLayer = screenMode === 'dark' && !celebrating;
  const showBrightLayer =
    screenMode === 'bright' && (!celebrating || celebrationFadingOut);
  const darkBrightness = getDarkScreenBrightness(count);

  return (
    <div ref={displayRootRef} className="display-root">
      <DisplayKioskPrompt containerRef={displayRootRef} />
      <LanguageSwitcher variant="display" />

      <div
        className={`screen-layer screen-layer--dark${showDarkLayer ? ' screen-layer--active' : ''}`}
      >
        <DarkScreen
          brightness={darkBrightness}
          placeholderRef={darkPlaceholderRef}
          onSlideComplete={() => {
            clearRotateTimer();
            setScreenMode('bright');
          }}
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

      <div
        className={`screen-layer screen-layer--bright${showBrightLayer ? ' screen-layer--active' : ''}`}
      >
        <LightScreen
          count={count}
          checkins={checkins}
          galleryEpoch={galleryEpoch}
          highlightId={highlightId}
          onQrOpen={() => setQrModalOpen(true)}
        />
      </div>

      <div
        className={`screen-layer screen-layer--thank-you${showThankYouLayer ? ' screen-layer--active' : ''}`}
      >
        {celebration ? (
          <ThankYou
            name={celebration.person.name}
            photoUrl={celebration.person.photoUrl}
          />
        ) : null}
      </div>

      <CheckinQrModal
        open={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />
    </div>
  );
}
