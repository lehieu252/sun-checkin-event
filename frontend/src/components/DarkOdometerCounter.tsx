'use client';

import { OdometerDigit } from './OdometerDigit';

interface DarkOdometerCounterProps {
  count: number;
  digits?: number;
}

export function DarkOdometerCounter({
  count,
  digits = 4,
}: DarkOdometerCounterProps) {
  const significantLength = Math.max(1, count.toString().length);
  const padded = count.toString().padStart(digits, '0').slice(-digits);
  const digitArray = padded.split('');

  return (
    <div className="dark-odometer-row">
      {digitArray.map((digit, index) => (
        <OdometerDigit
          key={`dark-${index}-${digit}`}
          digit={digit}
          variant="dark"
          active={index >= digits - significantLength}
        />
      ))}
    </div>
  );
}
