'use client';

import { OdometerDigit } from './OdometerDigit';

interface OdometerCounterProps {
  count: number;
  digits?: number;
  label: string;
}

export function OdometerCounter({
  count,
  digits = 6,
  label,
}: OdometerCounterProps) {
  const padded = count.toString().padStart(digits, '0').slice(-digits);
  const digitArray = padded.split('');

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex gap-3">
        {digitArray.map((digit, index) => (
          <OdometerDigit key={`${index}-${digit}`} digit={digit} />
        ))}
      </div>
    </div>
  );
}
