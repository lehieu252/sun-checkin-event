'use client';

import { useCallback, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { OdometerCounter } from '@/components/OdometerCounter';
import { QRCodePanel } from '@/components/QRCodePanel';
import { SpotlightCard } from '@/components/SpotlightCard';
import { API_URL } from '@/lib/config';
import type { NewCheckinPayload } from '@/lib/types';

export default function DisplayPage() {
  const [count, setCount] = useState(0);
  /**
   * Append-only list of all check-ins received via WebSocket.
   * SpotlightCard tracks how many it has processed so it can detect new ones.
   */
  const [checkinList, setCheckinList] = useState<NewCheckinPayload[]>([]);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/checkins/count`);
      const data = await res.json();
      setCount(data.count ?? 0);
    } catch (err) {
      console.error('Failed to fetch count:', err);
    }
  }, []);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  useEffect(() => {
    const socket = io(API_URL, { transports: ['websocket', 'polling'] });

    socket.on('new-checkin', (payload: NewCheckinPayload) => {
      setCount((prev) => prev + 1);
      setCheckinList((prev) => [...prev, payload]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <main className="relative h-screen overflow-hidden">
      <SpotlightCard checkinList={checkinList} />

      {/* Counter + QR — overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-end justify-between px-16 py-8">
        <OdometerCounter
          count={count}
          digits={6}
          label="Lượt check-in thành công"
        />
        <QRCodePanel />
      </div>
    </main>
  );
}
