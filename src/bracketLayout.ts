/** Vertical layout for March Madness–style bracket alignment */

export function getBracketHeights(compact: boolean, showScores: boolean) {
  const cardHeight = compact ? (showScores ? 76 : 56) : showScores ? 92 : 70;
  const slotHeight = compact ? 58 : 72;
  return { cardHeight, slotHeight };
}

import { FIRST_ROUND } from './types';

/** Block size per match index step at this round (R1 = roundIndex 0). */
export function getBlockSize(round: number, slotHeight: number): number {
  const roundIndex = round - FIRST_ROUND;
  return slotHeight * Math.pow(2, roundIndex + 1);
}

/** Top offset so match i is centered in its feeder pair region. */
export function getMatchTop(
  matchIndex: number,
  round: number,
  slotHeight: number,
  cardHeight: number
): number {
  const blockSize = getBlockSize(round, slotHeight);
  return matchIndex * blockSize + (blockSize - cardHeight) / 2;
}

export function getColumnHeight(
  matchCount: number,
  round: number,
  slotHeight: number
): number {
  if (matchCount === 0) return 0;
  const blockSize = getBlockSize(round, slotHeight);
  return matchCount * blockSize;
}

export function getBracketTotalHeight(slotHeight: number): number {
  return 32 * getBlockSize(FIRST_ROUND, slotHeight);
}

/** Final match card — vertically centered on the bracket spine. */
export function getFinalTop(slotHeight: number, cardHeight: number): number {
  return getBracketTotalHeight(slotHeight) / 2 - cardHeight / 2;
}

/**
 * Semifinal beside the final. Each column shows one semi; position 1 sits
 * just above the final, position 2 just below, keeping all three in a tight
 * horizontal cluster at the bracket center.
 */
export function getSemiTop(
  position: number,
  slotHeight: number,
  cardHeight: number
): number {
  const centerTop = getFinalTop(slotHeight, cardHeight);
  const step = cardHeight + 8;
  if (position === 1) return centerTop - step;
  return centerTop + step;
}
