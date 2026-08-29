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

const R1_MATCHES_PER_COLUMN = 32;

export function getBracketTotalHeight(slotHeight: number): number {
  return R1_MATCHES_PER_COLUMN * getBlockSize(FIRST_ROUND, slotHeight);
}

/** Final — vertically centered between the top and bottom R1 matches. */
export function getFinalTop(slotHeight: number, cardHeight: number): number {
  const lastIndex = R1_MATCHES_PER_COLUMN - 1;
  const topCenter =
    getMatchTop(0, FIRST_ROUND, slotHeight, cardHeight) + cardHeight / 2;
  const bottomCenter =
    getMatchTop(lastIndex, FIRST_ROUND, slotHeight, cardHeight) + cardHeight / 2;
  return (topCenter + bottomCenter) / 2 - cardHeight / 2;
}

/** Semifinals flank the final in a tight vertical cluster. */
export function getSemiTop(
  position: number,
  slotHeight: number,
  cardHeight: number
): number {
  const finalTop = getFinalTop(slotHeight, cardHeight);
  const step = cardHeight + 10;
  if (position === 1) return finalTop - step;
  return finalTop + step;
}
