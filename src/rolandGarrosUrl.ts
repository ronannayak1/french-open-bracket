import { Match } from './types';

/** Roland-Garros men's singles match codes: R2→032, R3→016, R4→008, QF→004, SF→002, F→001. */
export function rolandGarrosMatchNumber(match: Match): number {
  return 2 ** (7 - match.round) + (match.position - 1);
}

export function rolandGarrosMatchUrl(match: Match): string {
  const code = String(rolandGarrosMatchNumber(match)).padStart(3, '0');
  return `https://www.rolandgarros.com/en-us/matches/2026/SM${code}`;
}
