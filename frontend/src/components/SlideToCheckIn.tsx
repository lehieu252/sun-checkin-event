'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/lib/i18n/context';

const TRACK_WIDTH = 745;
const TRACK_PADDING = 8;
const HANDLE_WIDTH = 600;
const MAX_OFFSET = TRACK_WIDTH - HANDLE_WIDTH - TRACK_PADDING * 2;
const COMPLETE_THRESHOLD = MAX_OFFSET * 0.85;
const RESET_DELAY_MS = 450;

interface SlideToCheckInProps {
  onComplete?: () => void;
}

export function SlideToCheckIn({ onComplete }: SlideToCheckInProps) {
  const { t } = useLanguage();
  const [offset, setOffset] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const draggingRef = useRef(false);
  const resettingRef = useRef(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragStartX = useRef(0);
  const dragStartOffset = useRef(0);
  const offsetRef = useRef(0);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const setDragOffset = (next: number) => {
    offsetRef.current = next;
    setOffset(next);
  };

  const resetHandle = () => {
    resettingRef.current = false;
    setCompleted(false);
    setDragOffset(0);
  };

  const finishDrag = (pointerId: number, target: HTMLElement) => {
    target.releasePointerCapture(pointerId);
    draggingRef.current = false;
    setDragging(false);

    if (offsetRef.current >= COMPLETE_THRESHOLD) {
      resettingRef.current = true;
      setDragOffset(MAX_OFFSET);
      setCompleted(true);
      onComplete?.();

      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(resetHandle, RESET_DELAY_MS);
    } else {
      setDragOffset(0);
    }
  };

  return (
    <div
      className={`slide-checkin${completed ? ' slide-checkin--completed' : ''}${
        dragging ? ' slide-checkin--dragging' : ''
      }`}
    >
      <div className="slide-checkin-arrow" aria-hidden="true">
        <Image src="/arrow.svg" alt="" width={54} height={54} priority />
      </div>

      <div
        className="slide-checkin-handle"
        style={{ transform: `translateX(${TRACK_PADDING + offset}px)` }}
        onPointerDown={(e) => {
          if (resettingRef.current) return;
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          draggingRef.current = true;
          setDragging(true);
          dragStartX.current = e.clientX;
          dragStartOffset.current = offsetRef.current;
        }}
        onPointerMove={(e) => {
          if (!draggingRef.current || resettingRef.current) return;
          const delta = e.clientX - dragStartX.current;
          const next = Math.min(
            MAX_OFFSET,
            Math.max(0, dragStartOffset.current + delta),
          );
          setDragOffset(next);
        }}
        onPointerUp={(e) => {
          if (!draggingRef.current) return;
          finishDrag(e.pointerId, e.currentTarget);
        }}
        onPointerCancel={(e) => {
          if (!draggingRef.current) return;
          finishDrag(e.pointerId, e.currentTarget);
        }}
      >
        {t('display.slideCheckIn')}
      </div>
    </div>
  );
}
