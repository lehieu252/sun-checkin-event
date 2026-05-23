'use client';

import { useEffect, useRef, useState } from 'react';

interface OdometerDigitProps {
  digit: string;
  variant?: 'default' | 'dark';
  active?: boolean;
}

export function OdometerDigit({
  digit,
  variant = 'default',
  active = true,
}: OdometerDigitProps) {
  const [displayDigit, setDisplayDigit] = useState(digit);
  const [isFlipping, setIsFlipping] = useState(false);
  const prevDigit = useRef(digit);

  useEffect(() => {
    if (prevDigit.current !== digit) {
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setDisplayDigit(digit);
        setIsFlipping(false);
        prevDigit.current = digit;
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [digit]);

  return (
    <div
      className={`odometer-digit-box${
        variant === 'dark' ? ' dark-odometer-digit-box' : ''
      }`}
    >
      <span
        className={`odometer-digit-text${
          variant === 'dark' ? ' dark-odometer-digit-text' : ''
        }${
          variant === 'dark'
            ? active
              ? ' dark-odometer-digit-text--active'
              : ' dark-odometer-digit-text--inactive'
            : ''
        } ${isFlipping ? 'odometer-flip' : ''}`}
      >
        {displayDigit}
      </span>
    </div>
  );
}
