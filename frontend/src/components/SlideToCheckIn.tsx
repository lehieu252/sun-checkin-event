'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/lib/i18n/context';

const SIZES = {
  default: {
    trackWidth: 745,
    handleWidth: 600,
    trackPadding: 8,
  },
  wide: {
    trackWidth: 1136,
    handleWidth: 915,
    trackPadding: 8,
  },
} as const;

const RESET_DELAY_MS = 450;

interface SlideToCheckInProps {
  onComplete?: () => void;
  variant?: keyof typeof SIZES;
  label?: string;
}

export function SlideToCheckIn({
  onComplete,
  variant = 'default',
  label,
}: SlideToCheckInProps) {
  const { trackWidth, handleWidth, trackPadding } = SIZES[variant];
  const maxOffset = trackWidth - handleWidth - trackPadding * 2;
  const completeThreshold = maxOffset * 0.85;
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

    if (offsetRef.current >= completeThreshold) {
      resettingRef.current = true;
      setDragOffset(maxOffset);
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
      className={`slide-checkin${
        variant === 'wide' ? ' slide-checkin--wide' : ''
      }${completed ? ' slide-checkin--completed' : ''}${
        dragging ? ' slide-checkin--dragging' : ''
      }`}
    >
      <div className="slide-checkin-arrow" aria-hidden="true">
        <Image src="/arrow.svg" alt="" width={54} height={54} priority />
      </div>

      <div
        className="slide-checkin-handle"
        style={{ transform: `translateX(${trackPadding + offset}px)` }}
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
            maxOffset,
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
        {label ?? t('display.slideCheckIn')}
      </div>
    </div>
  );
}
