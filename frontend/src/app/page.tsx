'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';
import { OdometerCounter } from '@/components/OdometerCounter';
import { PhotoGallery } from '@/components/PhotoGallery';
import { API_URL, CHECKIN_URL } from '@/lib/config';
import type { NewCheckinPayload } from '@/lib/types';

const RAYS = Array.from({ length: 8 }, (_, i) => i);
const DISPLAY_MS = 12000;
const FADE_MS = 1400;

interface Celebration {
  person: NewCheckinPayload;
  count: number;
  fadingOut: boolean;
}

export default function DisplayPage() {
  const [count, setCount] = useState(0);
  const [checkins, setCheckins] = useState<NewCheckinPayload[]>([]);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [sunPos, setSunPos] = useState<{ left: string; top: string } | null>(null);

  const placeholderRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const countRef = useRef(0);

  // Calculate sun's natural (left-panel) position from the placeholder element
  useEffect(() => {
    const el = placeholderRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      setSunPos({ left: `${r.left + r.width / 2}px`, top: `${r.top + r.height / 2}px` });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, []);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/checkins/count`);
      const data = await res.json();
      countRef.current = data.count ?? 0;
      setCount(countRef.current);
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  useEffect(() => {
    const socket = io(API_URL, { transports: ['websocket', 'polling'] });

    socket.on('new-checkin', (payload: NewCheckinPayload) => {
      countRef.current++;
      const c = countRef.current;
      setCount(c);
      setCheckins((prev) => [payload, ...prev]);

      // Cancel any in-progress celebration
      timersRef.current.forEach(clearTimeout);

      setCelebration({ person: payload, count: c, fadingOut: false });

      const t1 = setTimeout(() => {
        setCelebration((prev) => (prev ? { ...prev, fadingOut: true } : null));
      }, DISPLAY_MS - FADE_MS);

      const t2 = setTimeout(() => {
        setCelebration(null);
      }, DISPLAY_MS);

      timersRef.current = [t1, t2];
    });

    return () => {
      socket.disconnect();
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const celebrating = celebration !== null && !celebration.fadingOut;
  const fadingOut = celebration !== null && celebration.fadingOut;

  // Sun position: moves to center when celebrating, returns to placeholder otherwise
  const sunLeft = celebrating ? '50vw' : (sunPos?.left ?? '-999px');
  const sunTop = celebrating ? '40vh' : (sunPos?.top ?? '-999px');
  const sunTransition = sunPos
    ? 'left 1.3s cubic-bezier(0.34,1.1,0.64,1), top 1.3s ease-in-out'
    : 'none';

  return (
    <main className="display-main">
      {/* ─── Left panel ─────────────────────────────── */}
      <div className="display-left">
        {/* Invisible placeholder — reserves the exact space the fixed sun occupies */}
        <div ref={placeholderRef} className="sun-placeholder" />

        <p className="cta-label">CALL TO ACTION</p>

        <div className="cta-qr-box">
          <QRCodeSVG
            value={CHECKIN_URL}
            size={130}
            level="H"
            includeMargin={false}
            fgColor="#633236"
          />
          <p className="cta-qr-hint">Quét mã để check-in</p>
        </div>

        <OdometerCounter count={count} digits={6} label="Lượt check-in thành công" />
      </div>

      {/* ─── Right panel — photo gallery ─────────────── */}
      <div className="display-right">
        {checkins.length > 0 ? (
          <PhotoGallery checkins={checkins} />
        ) : (
          <div className="gallery-empty">
            <p>Quét mã QR bên trái để check-in!</p>
          </div>
        )}
      </div>

      {/* ─── Fixed sun — transitions from left panel to screen center ── */}
      {sunPos && (
        <div
          className={`sun-fixed${celebrating ? ' sun-fixed--celebrating' : ''}`}
          style={{ left: sunLeft, top: sunTop, transition: sunTransition }}
        >
          <div className="sun-inner">
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
        </div>
      )}

      {/* ─── Backdrop (dims background during celebration) ─── */}
      {celebration && (
        <div
          className={`celebration-backdrop${fadingOut ? ' celebration-backdrop--out' : ''}`}
        />
      )}

      {/* ─── Celebration message ─────────────────────── */}
      {celebration && (
        <div
          className={`celebration-msg${fadingOut ? ' celebration-msg--out' : ''}`}
        >
          <p className="celebration-thanks">
            Cảm ơn <strong>{celebration.person.name}</strong> đã tham gia sự kiện! 🎉
          </p>
          <p className="celebration-order">
            Bạn là người thứ <strong>{celebration.count}</strong> check-in hôm nay
          </p>
          {celebration.person.message && (
            <p className="celebration-wish">&ldquo;{celebration.person.message}&rdquo;</p>
          )}
        </div>
      )}
    </main>
  );
}
