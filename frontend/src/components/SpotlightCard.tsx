'use client';

import Image from 'next/image';
import { useEffect, useReducer, useRef } from 'react';
import { API_URL } from '@/lib/config';
import type { NewCheckinPayload } from '@/lib/types';

const MAX_SIMULTANEOUS = 5;
const DISPLAY_MS = 10000;
const FADE_MS = 800;

/**
 * 6 positions around the sun (sun center ≈ left:50%, top:38%).
 * Values point to the CENTER of the photo card (transform: translate(-50%,-50%)).
 * Adjusted for larger photo cards (130px circle) to stay on-screen and avoid sun overlap.
 */
const PHOTO_POSITIONS = [
  { top: '14%', left: '10%' }, // upper-left
  { top: '14%', left: '72%' }, // upper-right
  { top: '38%', left: '6%'  }, // mid-left
  { top: '38%', left: '80%' }, // mid-right
  { top: '58%', left: '10%' }, // lower-left
  { top: '58%', left: '72%' }, // lower-right
] as const;

type Phase = 'fade-in' | 'visible' | 'fade-out';

interface ActiveItem {
  id: number;
  checkin: NewCheckinPayload;
  positionIdx: number;
  phase: Phase;
}

interface State {
  activeItems: ActiveItem[];
  pendingQueue: NewCheckinPayload[];
  nextId: number;
}

type Action =
  | { type: 'ENQUEUE'; checkin: NewCheckinPayload }
  | { type: 'SET_PHASE'; id: number; phase: Phase }
  | { type: 'REMOVE'; id: number };

/** Pick a position index not currently used by active items. */
function pickPositionIdx(activeItems: ActiveItem[]): number {
  const used = new Set(activeItems.map((i) => i.positionIdx));
  let idx: number;
  do {
    idx = Math.floor(Math.random() * PHOTO_POSITIONS.length);
  } while (used.has(idx) && used.size < PHOTO_POSITIONS.length);
  return idx;
}

function makeActiveItem(id: number, checkin: NewCheckinPayload, siblings: ActiveItem[]): ActiveItem {
  return { id, checkin, positionIdx: pickPositionIdx(siblings), phase: 'fade-in' };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ENQUEUE': {
      // Slot available — start showing immediately
      if (state.activeItems.length < MAX_SIMULTANEOUS) {
        const item = makeActiveItem(state.nextId, action.checkin, state.activeItems);
        return { ...state, nextId: state.nextId + 1, activeItems: [...state.activeItems, item] };
      }
      // All slots taken — add to waiting queue
      return { ...state, pendingQueue: [...state.pendingQueue, action.checkin] };
    }
    case 'SET_PHASE': {
      return {
        ...state,
        activeItems: state.activeItems.map((i) =>
          i.id === action.id ? { ...i, phase: action.phase } : i,
        ),
      };
    }
    case 'REMOVE': {
      const remaining = state.activeItems.filter((i) => i.id !== action.id);
      // Promote next waiting item into the freed slot
      if (state.pendingQueue.length > 0) {
        const [next, ...restQueue] = state.pendingQueue;
        const newItem = makeActiveItem(state.nextId, next, remaining);
        return {
          ...state,
          nextId: state.nextId + 1,
          activeItems: [...remaining, newItem],
          pendingQueue: restQueue,
        };
      }
      return { ...state, activeItems: remaining };
    }
    default:
      return state;
  }
}

const RAYS = Array.from({ length: 8 }, (_, i) => i);

interface SpotlightCardProps {
  /** Append-only list of all check-ins received so far. */
  checkinList: NewCheckinPayload[];
}

export function SpotlightCard({ checkinList }: SpotlightCardProps) {
  const [state, dispatch] = useReducer(reducer, {
    activeItems: [],
    pendingQueue: [],
    nextId: 0,
  });

  // How many items from checkinList we have already enqueued
  const processedCount = useRef(0);

  // Timer IDs per active item — keyed by item.id
  const timersRef = useRef(new Map<number, ReturnType<typeof setTimeout>[]>());

  // ── Detect new check-ins and enqueue them ──────────────────────────────────
  useEffect(() => {
    const newItems = checkinList.slice(processedCount.current);
    if (newItems.length === 0) return;
    processedCount.current = checkinList.length;
    newItems.forEach((checkin) => dispatch({ type: 'ENQUEUE', checkin }));
  }, [checkinList]);

  // ── Schedule timers for newly activated items (phase === 'fade-in') ────────
  useEffect(() => {
    state.activeItems.forEach((item) => {
      if (item.phase !== 'fade-in' || timersRef.current.has(item.id)) return;
      const { id } = item;
      timersRef.current.set(id, [
        setTimeout(() => dispatch({ type: 'SET_PHASE', id, phase: 'visible' }), FADE_MS),
        setTimeout(() => dispatch({ type: 'SET_PHASE', id, phase: 'fade-out' }), DISPLAY_MS - FADE_MS),
        setTimeout(() => dispatch({ type: 'REMOVE', id }), DISPLAY_MS),
      ]);
    });

    // Clear timers for items that have been fully removed from state
    timersRef.current.forEach((timers, id) => {
      if (!state.activeItems.find((i) => i.id === id)) {
        timers.forEach(clearTimeout);
        timersRef.current.delete(id);
      }
    });
  }, [state.activeItems]);

  // ── Cleanup all timers on unmount ──────────────────────────────────────────
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timers) => timers.forEach(clearTimeout));
    };
  }, []);

  const { activeItems } = state;

  return (
    <div className="sun-panel">
      <div className="horizon-line" />

      {/* Sun — always fixed */}
      <div className="sun-scene-fixed">
        <div className="sun-wrapper">
          <div className="sun-rays-ring sun-rays-ring--spinning">
            {RAYS.map((i) => (
              <div
                key={i}
                className="sun-ray"
                style={{ '--ray-i': i } as React.CSSProperties}
              />
            ))}
          </div>
          <div className="sun-body">
            <div className="sun-eyes">
              <div className="sun-eye" />
              <div className="sun-eye" />
            </div>
          </div>
        </div>
      </div>

      {/* Up to MAX_SIMULTANEOUS photos shown at once */}
      {activeItems.map((item) => {
        const pos = PHOTO_POSITIONS[item.positionIdx];
        return (
          <div
            key={item.id}
            className={`photo-float photo-float--${item.phase}`}
            style={{ top: pos.top, left: pos.left }}
          >
            <div className="photo-float-img">
              <Image
                src={`${API_URL}${item.checkin.photoUrl}`}
                alt={item.checkin.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <p className="photo-float-name">{item.checkin.name}</p>
            <p className="photo-float-message">&ldquo;{item.checkin.message}&rdquo;</p>
          </div>
        );
      })}
    </div>
  );
}
