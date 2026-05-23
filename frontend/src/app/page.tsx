'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';
import { OdometerCounter } from '@/components/OdometerCounter';
import { ThreeColumnGallery } from '@/components/ThreeColumnGallery';
import { API_URL, CHECKIN_URL } from '@/lib/config';
import type { NewCheckinPayload } from '@/lib/types';

const DISPLAY_MS = 10000;
const GAP_MS = 3000;

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
  const [galleryEpoch, setGalleryEpoch] = useState(0);
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const [sunPos, setSunPos] = useState<{ left: string; top: string } | null>(
    null,
  );

  const placeholderRef = useRef<HTMLDivElement>(null);
  const queueRef = useRef<QueueItem[]>([]);
  const phaseRef = useRef<'idle' | 'celebrating' | 'gap'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
      queueRef.current.push(item);
      processQueue();
    },
    [processQueue],
  );

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
    queueRef.current = [];
    phaseRef.current = 'idle';
    countRef.current = 0;
    setCount(0);
    setCheckins([]);
    setCelebration(null);
    setGalleryEpoch(0);
    setHighlightId(null);
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
    };
  }, [enqueueCelebration, resetDisplay]);

  const celebrating = celebration !== null;

  const sunLeft = celebrating ? '50vw' : (sunPos?.left ?? '-999px');
  const sunTop = celebrating ? '42vh' : (sunPos?.top ?? '-999px');
  const sunScale = celebrating ? 2 : 1;
  const sunTransition = sunPos
    ? 'left 1.4s cubic-bezier(0.34,1.1,0.64,1), top 1.4s ease-in-out, transform 1.4s cubic-bezier(0.34,1.1,0.64,1)'
    : 'none';

  return (
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
          <div className="odometer-label">Tia sáng Mặt Trời đã được kích hoạt</div>
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
              <p className="cta-qr-title">Quét mã ngay</p>
              <p className="cta-qr-sub">
                Để check-in và trở thành một phần của Mặt Trời
              </p>
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
              <p>Quét mã QR để check-in!</p>
            </div>
          )}
        </div>

        {/* Bottom gradient — CSS linear gradient per design spec */}
        <div className="display-bottom-gradient" aria-hidden="true" />
      </div>

      {/* Fixed sun — SVG with bob animation */}
      {sunPos && (
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
            <img src="/sun.svg" alt="Sun" className="sun-svg" />
          </div>
        </div>
      )}

      {/* Celebration message */}
      {celebration && (
        <div className="celebration-msg">
          <p className="celebration-thanks">
            Cảm ơn {celebration.person.name}
          </p>
          <p className="celebration-order">
            Bạn là người check in thứ {celebration.count}
          </p>
        </div>
      )}
    </main>
  );
}
