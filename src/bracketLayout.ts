/** Vertical layout for March Madness–style bracket alignment */

export function getBracketHeights(compact: boolean, showScores: boolean) {
  const cardHeight = compact ? (showScores ? 76 : 56) : showScores ? 92 : 70;
  const slotHeight = compact ? 58 : 72;
  return { cardHeight, slotHeight };
}

/** Block size per match index step at this round (R1 = roundIndex 0). */
export function getBlockSize(round: number, slotHeight: number): number {
  const roundIndex = round - 1;
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

/** Semifinal vertical position (position 1 = top half, 2 = bottom half). */
export function getSemiTop(
  position: number,
  slotHeight: number,
  cardHeight: number
): number {
  const halfBlock = 16 * getBlockSize(1, slotHeight);
  const centerY = halfBlock / 2;
  const y = position === 1 ? centerY : halfBlock + centerY;
  return y - cardHeight / 2;
}

export function getFinalTop(
  slotHeight: number,
  cardHeight: number
): number {
  const halfBlock = 16 * getBlockSize(1, slotHeight);
  const semi1 = halfBlock / 2;
  const semi2 = halfBlock + halfBlock / 2;
  return (semi1 + semi2) / 2 - cardHeight / 2;
}

export function getBracketTotalHeight(slotHeight: number): number {
  return 32 * getBlockSize(1, slotHeight);
}
