import { useState, useEffect } from 'react';

/** Global deadline — brackets lock for everyone at this time (11 AM ET, first round). */
export const LOCK_TIME = new Date('2026-08-30T15:00:00Z').getTime();

export function isLocked(): boolean {
  return Date.now() >= LOCK_TIME;
}

export default function Countdown() {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = LOCK_TIME - now;

  if (diff <= 0) {
    return (
      <div className="countdown countdown--locked">
        <span className="countdown-icon">🔒</span>
        <span className="countdown-label">Brackets are locked</span>
      </div>
    );
  }

  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1_000);
  const pad = (n: number) => String(n).padStart(2, '0');
  const urgent = diff < 3_600_000;

  return (
    <div className={`countdown countdown--open ${urgent ? 'countdown--urgent' : ''}`}>
      <span className="countdown-icon">✓</span>
      <span className="countdown-label">Picks open — lock in</span>
      <div className="countdown-digits">
        <span className="cd-unit">
          <span className="cd-num">{pad(hours)}</span>
          <span className="cd-lbl">h</span>
        </span>
        <span className="cd-sep">:</span>
        <span className="cd-unit">
          <span className="cd-num">{pad(minutes)}</span>
          <span className="cd-lbl">m</span>
        </span>
        <span className="cd-sep">:</span>
        <span className="cd-unit">
          <span className="cd-num">{pad(seconds)}</span>
          <span className="cd-lbl">s</span>
        </span>
      </div>
    </div>
  );
}
