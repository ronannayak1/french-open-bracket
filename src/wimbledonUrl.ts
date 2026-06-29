import { Match } from './types';

/** Wimbledon men's singles match codes: R1→064, R2→032, R3→016, R4→008, QF→004, SF→002, F→001. */
export function wimbledonMatchNumber(match: Match): number {
  return 2 ** (7 - match.round) + (match.position - 1);
}

export function wimbledonMatchUrl(match: Match): string {
  const code = String(wimbledonMatchNumber(match)).padStart(3, '0');
  return `https://www.wimbledon.com/en/scores/2026/mens-singles/${code}`;
}
