import { useState, useEffect } from 'react';

/** Round of 64 (app round 2) — users may pick and submit from this point onward. */
const PICKS_OPEN_TIME = new Date('2026-07-02T10:00:00Z').getTime();

export function isPickWindowOpen(): boolean {
  return Date.now() >= PICKS_OPEN_TIME;
}

/** True only before the pick window opens (not after submit — use `submitted` for that). */
export function isLocked(): boolean {
  return !isPickWindowOpen();
}

export default function Countdown() {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (isPickWindowOpen()) {
    return (
      <div className="countdown countdown--open">
        <span className="countdown-icon">✓</span>
        <span className="countdown-label">Round 2 picks open</span>
      </div>
    );
  }

  const diff = PICKS_OPEN_TIME - now;
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1_000);
  const pad = (n: number) => String(n).padStart(2, '0');
  const urgent = diff < 3_600_000;

  return (
    <div className={`countdown ${urgent ? 'countdown--urgent' : ''}`}>
      <span className="countdown-icon">⏱</span>
      <span className="countdown-label">Picks open in</span>
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
