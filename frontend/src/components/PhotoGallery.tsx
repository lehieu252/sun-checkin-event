'use client';

import Image from 'next/image';
import { API_URL } from '@/lib/config';
import type { NewCheckinPayload } from '@/lib/types';

const CARD_W = 210;
const CARD_GAP = 20;
const PX_PER_SEC = 55;

interface PhotoGalleryProps {
  checkins: NewCheckinPayload[];
}

export function PhotoGallery({ checkins }: PhotoGalleryProps) {
  if (checkins.length === 0) return null;

  // Duplicate the array for a seamless infinite loop
  const doubled = [...checkins, ...checkins];
  const stripW = checkins.length * (CARD_W + CARD_GAP);
  const duration = Math.max(stripW / PX_PER_SEC, 6);

  return (
    <div className="gallery-viewport">
      {/*
        key={checkins.length} restarts the animation whenever a new photo is
        added, so the newest card is always visible at the left edge first.
      */}
      <div
        key={checkins.length}
        className="gallery-strip"
        style={
          {
            '--strip-w': `${stripW}px`,
            '--gallery-dur': `${duration}s`,
          } as React.CSSProperties
        }
      >
        {doubled.map((checkin, index) => (
          <div key={`${checkin.id}-${index}`} className="gallery-card">
            <div className="gallery-photo">
              <Image
                src={`${API_URL}${checkin.photoUrl}`}
                alt={checkin.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="gallery-card-overlay">
              <p className="gallery-card-name">{checkin.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
