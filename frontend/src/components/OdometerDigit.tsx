'use client';

import { useEffect, useRef, useState } from 'react';

interface OdometerDigitProps {
  digit: string;
}

export function OdometerDigit({ digit }: OdometerDigitProps) {
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
    <div className="odometer-digit-box">
      <span
        className={`odometer-digit-text ${isFlipping ? 'odometer-flip' : ''}`}
      >
        {displayDigit}
      </span>
    </div>
  );
}
