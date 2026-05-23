'use client';

import Image from 'next/image';
import { RefObject } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { OdometerCounter } from '@/components/OdometerCounter';
import { CHECKIN_URL } from '@/lib/config';

interface DarkScreenProps {
  count: number;
  placeholderRef: RefObject<HTMLDivElement | null>;
}

export function DarkScreen({ count, placeholderRef }: DarkScreenProps) {
  return (
    <div className="dark-screen">
      <Image
        src="/background_dark.png"
        alt=""
        fill
        className="dark-screen-bg object-cover"
        priority
      />

      <div className="dark-screen-header">
        <Image
          src="/global_gateway_white.svg"
          alt="Global Gateway"
          width={220}
          height={48}
          className="dark-screen-logo dark-screen-logo--left"
          priority
        />
        <Image
          src="/euro_union_2.svg"
          alt="European Union"
          width={150}
          height={96}
          className="dark-screen-logo dark-screen-logo--right"
          priority
        />
      </div>

      <div className="dark-screen-body">
        <div className="dark-screen-slogan dark-screen-slogan--left">
          <Image
            src="/plug_in_evolution_2.svg"
            alt="Plug in to evolution"
            width={120}
            height={200}
            className="dark-slogan-img"
            priority
          />
        </div>

        <div className="dark-screen-sun-area">
          <div ref={placeholderRef} className="dark-sun-placeholder" />
        </div>

        <div className="dark-screen-slogan dark-screen-slogan--right">
          <Image
            src="/nhan_ket_noi.svg"
            alt="Nhấn kết nối bật thay đổi"
            width={120}
            height={200}
            className="dark-slogan-img"
            priority
          />
        </div>
      </div>

      <div className="dark-screen-footer">
        <OdometerCounter count={count} digits={4} label="" />
        <p className="dark-odometer-label">
          Tia sáng Mặt Trời đã được kích hoạt
        </p>

        <div className="dark-cta-qr-row">
          <div className="dark-cta-qr-box">
            <QRCodeSVG
              value={CHECKIN_URL}
              size={112}
              level="H"
              includeMargin={false}
              fgColor="#3F1700"
            />
          </div>
          <div className="dark-cta-qr-text">
            <p className="dark-cta-qr-title">Quét mã ngay</p>
            <p className="dark-cta-qr-sub">
              Để check-in và trở thành một phần của Mặt Trời
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
