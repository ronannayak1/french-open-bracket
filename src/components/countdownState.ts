export const PICKS_OPEN_TIME = new Date('2026-08-30T15:00:00Z').getTime(); // 11 AM ET, first round

export function isPickWindowOpen() {
  return Date.now() >= PICKS_OPEN_TIME;
}

export function isLocked() {
  return !isPickWindowOpen();
}
