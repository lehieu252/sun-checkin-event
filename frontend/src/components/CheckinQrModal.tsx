'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CHECKIN_URL } from '@/lib/config';
import { useLanguage } from '@/lib/i18n/context';

const DISPLAY_SECONDS = 15;
const CLOSE_ANIM_MS = 450;

interface CheckinQrModalProps {
  open: boolean;
  onClose: () => void;
}

export function CheckinQrModal({ open, onClose }: CheckinQrModalProps) {
  const { t } = useLanguage();
  const onCloseRef = useRef(onClose);
  const dismissingRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [closing, setClosing] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(DISPLAY_SECONDS);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const dismiss = useCallback(() => {
    if (dismissingRef.current) return;
    dismissingRef.current = true;
    setClosing(true);
    setActive(false);
    window.setTimeout(() => {
      dismissingRef.current = false;
      setMounted(false);
      setClosing(false);
      onCloseRef.current();
    }, CLOSE_ANIM_MS);
  }, []);

  useEffect(() => {
    if (!open && mounted) {
      dismissingRef.current = true;
      setActive(false);
      setMounted(false);
      setClosing(false);
      dismissingRef.current = false;
    }
  }, [open, mounted]);

  useEffect(() => {
    if (!open) return;

    dismissingRef.current = false;
    setMounted(true);
    setClosing(false);
    setSecondsRemaining(DISPLAY_SECONDS);

    const enterFrame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setActive(true));
    });

    let remaining = DISPLAY_SECONDS;
    const interval = window.setInterval(() => {
      remaining -= 1;
      setSecondsRemaining(remaining);
      if (remaining <= 0) {
        window.clearInterval(interval);
        dismiss();
      }
    }, 1000);

    return () => {
      cancelAnimationFrame(enterFrame);
      window.clearInterval(interval);
    };
  }, [open, dismiss]);

  if (!mounted) return null;

  return (
    <div
      className={`checkin-qr-modal${active ? ' checkin-qr-modal--active' : ''}${
        closing ? ' checkin-qr-modal--closing' : ''
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={t('display.qrModalHeadline')}
    >
      <button
        type="button"
        className="checkin-qr-modal__backdrop"
        aria-label={t('display.qrModalClose')}
        onClick={dismiss}
      />

      <div className="checkin-qr-modal__panel">
        <p className="checkin-qr-modal__countdown">
          {t('display.qrCountdown', { seconds: secondsRemaining })}
        </p>
        <div className="checkin-qr-modal__qr-box">
          <QRCodeSVG
            value={CHECKIN_URL}
            size={750}
            level="H"
            includeMargin={false}
            fgColor="#3F1700"
          />
        </div>

        <div className="checkin-qr-modal__copy">
          <p className="checkin-qr-modal__headline">
            {t('display.qrModalHeadline')}
          </p>
          <p className="checkin-qr-modal__body">{t('display.qrModalBody')}</p>
        </div>
      </div>
    </div>
  );
}
