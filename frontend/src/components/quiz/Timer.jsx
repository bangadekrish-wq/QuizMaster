import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { formatTimeSeconds } from '../../utils/formatters';

export const Timer = ({ durationMinutes = 10, initialSeconds, onTimeUp }) => {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    initialSeconds !== undefined ? initialSeconds : durationMinutes * 60
  );

  useEffect(() => {
    if (initialSeconds !== undefined) {
      setSecondsLeft(initialSeconds);
    }
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (onTimeUp) onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onTimeUp]);

  const isLowTime = secondsLeft < 120; // Under 2 mins warning

  return (
    <div
      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-sm font-mono font-bold transition-all duration-300 ${
        isLowTime
          ? 'bg-brand-red/20 border-brand-red text-brand-redLight animate-pulse shadow-ms-glow'
          : 'bg-dark-card border-brand-cyan/40 text-brand-cyanLight shadow-sm'
      }`}
    >
      {isLowTime ? (
        <AlertTriangle className="w-4 h-4 text-brand-red animate-bounce" />
      ) : (
        <Clock className="w-4 h-4 text-brand-cyan" />
      )}
      <span>Time Remaining: {formatTimeSeconds(secondsLeft)}</span>
    </div>
  );
};
