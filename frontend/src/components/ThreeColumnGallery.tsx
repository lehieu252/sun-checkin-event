'use client';

import { memo, useMemo } from 'react';
import { API_URL } from '@/lib/config';
import type { NewCheckinPayload } from '@/lib/types';

const GALLERY_LAYOUT = {
  default: {
    cardGap: 16,
    photoHeight: 240,
    messageMinHeight: 80,
  },
  light: {
    cardGap: 34,
    photoHeight: 1140,
    messageMinHeight: 420,
  },
} as const;

/** Only the newest N entries are rendered; counter/brightness still use full count. */
const GALLERY_MAX_ITEMS = 90;
const PX_PER_SEC = 40;

interface ThreeColumnGalleryProps {
  checkins: NewCheckinPayload[];
  galleryEpoch: number;
  highlightId: number | null;
  variant?: keyof typeof GALLERY_LAYOUT;
}

function splitIntoColumns(items: NewCheckinPayload[]) {
  const cols: NewCheckinPayload[][] = [[], [], []];
  const columnOrder = [1, 2, 0] as const;
  items.forEach((item, i) => cols[columnOrder[i % 3]].push(item));
  return cols;
}

const Column = memo(function Column({
  items,
  direction,
  galleryEpoch,
  highlightId,
  variant,
}: {
  items: NewCheckinPayload[];
  direction: 'up' | 'down';
  galleryEpoch: number;
  highlightId: number | null;
  variant: keyof typeof GALLERY_LAYOUT;
}) {
  if (items.length === 0) {
    return <div className="gallery-col gallery-col--empty" />;
  }

  const { cardGap, photoHeight, messageMinHeight } = GALLERY_LAYOUT[variant];
  const entryHeight = photoHeight + cardGap + messageMinHeight;
  const doubled = [...items, ...items];
  const stripH = items.length * (entryHeight + cardGap);
  const duration = Math.max(stripH / PX_PER_SEC, 12);

  const msgColors = ['#FFA724', '#D93B16'];

  return (
    <div className="gallery-col">
      <div
        key={`${direction}-${galleryEpoch}-${items.length}`}
        className={`gallery-col-strip gallery-col-strip--${direction}`}
        style={
          {
            '--strip-h': `${stripH}px`,
            '--col-dur': `${duration}s`,
          } as React.CSSProperties
        }
      >
        {doubled.map((checkin, index) => (
          <div
            key={`${checkin.id}-${index}`}
            className={`gallery-entry${checkin.id === highlightId ? ' gallery-entry--highlight' : ''}`}
          >
            <div className="gallery-photo-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${API_URL}${checkin.photoUrl}`}
                alt={checkin.name}
                className="gallery-photo-img"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div
              className="gallery-msg-card"
              style={{ backgroundColor: msgColors[index % 2] }}
            >
              <p className="gallery-msg-text">{checkin.message}</p>
              <p className="gallery-msg-name">{checkin.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export function ThreeColumnGallery({
  checkins,
  galleryEpoch,
  highlightId,
  variant = 'default',
}: ThreeColumnGalleryProps) {
  const galleryCheckins = useMemo(
    () => checkins.slice(0, GALLERY_MAX_ITEMS),
    [checkins],
  );
  const columns = useMemo(
    () => splitIntoColumns(galleryCheckins),
    [galleryCheckins],
  );

  return (
    <div
      className={`gallery-three-col${
        variant === 'light' ? ' gallery-three-col--light' : ''
      }`}
    >
      <Column
        items={columns[0]}
        direction="up"
        galleryEpoch={galleryEpoch}
        highlightId={highlightId}
        variant={variant}
      />
      <Column
        items={columns[1]}
        direction="down"
        galleryEpoch={galleryEpoch}
        highlightId={highlightId}
        variant={variant}
      />
      <Column
        items={columns[2]}
        direction="up"
        galleryEpoch={galleryEpoch}
        highlightId={highlightId}
        variant={variant}
      />
    </div>
  );
}
