'use client';

import { QRCodeSVG } from 'qrcode.react';
import { CHECKIN_URL } from '@/lib/config';

export function QRCodePanel() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-xl bg-white p-2 shadow-md">
        <QRCodeSVG
          value={CHECKIN_URL}
          size={70}
          level="H"
          includeMargin
          fgColor="#633236"
        />
      </div>
      <p className="max-w-xs text-center text-xs font-medium text-[#92400e]">
        Quét mã QR để check-in
      </p>
    </div>
  );
}
