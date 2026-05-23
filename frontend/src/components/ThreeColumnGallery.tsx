'use client';

import Image from 'next/image';
import { API_URL } from '@/lib/config';
import type { NewCheckinPayload } from '@/lib/types';

const CARD_GAP = 16;
const PX_PER_SEC = 40;

interface ThreeColumnGalleryProps {
  checkins: NewCheckinPayload[];
  galleryEpoch: number;
  highlightId: number | null;
}

function splitIntoColumns(items: NewCheckinPayload[]) {
  const cols: NewCheckinPayload[][] = [[], [], []];
  items.forEach((item, i) => cols[i % 3].push(item));
  return cols;
}

function Column({
  items,
  direction,
  galleryEpoch,
  highlightId,
}: {
  items: NewCheckinPayload[];
  direction: 'up' | 'down';
  galleryEpoch: number;
  highlightId: number | null;
}) {
  if (items.length === 0) {
    return <div className="gallery-col gallery-col--empty" />;
  }

  const doubled = [...items, ...items];
  const cardH = 330;
  const stripH = items.length * (cardH + CARD_GAP);
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
              <Image
                src={`${API_URL}${checkin.photoUrl}`}
                alt={checkin.name}
                fill
                className="object-cover"
                unoptimized
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
}

export function ThreeColumnGallery({
  checkins,
  galleryEpoch,
  highlightId,
}: ThreeColumnGalleryProps) {
  const columns = splitIntoColumns(checkins);

  return (
    <div className="gallery-three-col">
      <Column
        items={columns[0]}
        direction="up"
        galleryEpoch={galleryEpoch}
        highlightId={highlightId}
      />
      <Column
        items={columns[1]}
        direction="down"
        galleryEpoch={galleryEpoch}
        highlightId={highlightId}
      />
      <Column
        items={columns[2]}
        direction="up"
        galleryEpoch={galleryEpoch}
        highlightId={highlightId}
      />
    </div>
  );
}
