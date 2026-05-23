'use client';

import { RefObject, useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import {
  isFullscreenActive,
  requestDisplayFullscreen,
  toggleDisplayFullscreen,
} from '@/lib/fullscreen';

const KIOSK_STARTED_KEY = 'display-kiosk-started';

interface DisplayKioskPromptProps {
  containerRef: RefObject<HTMLElement | null>;
}

export function DisplayKioskPrompt({ containerRef }: DisplayKioskPromptProps) {
  const { t } = useLanguage();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const started = sessionStorage.getItem(KIOSK_STARTED_KEY) === '1';
    setShowPrompt(!started && !isFullscreenActive());
    setIsFullscreen(isFullscreenActive());

    const onChange = () => setIsFullscreen(isFullscreenActive());
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, []);

  const handleStart = async () => {
    sessionStorage.setItem(KIOSK_STARTED_KEY, '1');
    setShowPrompt(false);
    await requestDisplayFullscreen(containerRef.current);
  };

  const handleToggle = async () => {
    await toggleDisplayFullscreen(containerRef.current);
  };

  return (
    <>
      {showPrompt && (
        <button
          type="button"
          className="kiosk-prompt"
          onClick={handleStart}
          aria-label={t('display.fullscreenPrompt')}
        >
          <span className="kiosk-prompt-icon" aria-hidden="true">
            ⛶
          </span>
          <span className="kiosk-prompt-title">{t('display.fullscreenPrompt')}</span>
          <span className="kiosk-prompt-hint">{t('display.fullscreenHint')}</span>
        </button>
      )}

      {!showPrompt && (
        <div className="kiosk-toggle-wrap">
          <button
            type="button"
            className={`kiosk-toggle${isFullscreen ? ' kiosk-toggle--active' : ''}`}
            onClick={handleToggle}
            aria-label={
              isFullscreen
                ? t('display.exitFullscreen')
                : t('display.enterFullscreen')
            }
            title={
              isFullscreen
                ? t('display.exitFullscreen')
                : t('display.enterFullscreen')
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M1 1h5v1.5H2.5V5H1V1zm9 0h5v4h-1.5V2.5H10V1zM1 10h1.5v2.5H5V14H1v-4zm14 0v4h-4v-1.5h2.5V10H15z" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
