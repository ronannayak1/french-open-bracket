import { Match } from './types';

/** US Open men's singles match codes: R1→064, R2→032, R3→016, R4→008, QF→004, SF→002, F→001. */
export function usOpenMatchNumber(match: Match): number {
  return 2 ** (7 - match.round) + (match.position - 1);
}

export function usOpenMatchUrl(match: Match): string {
  const code = String(usOpenMatchNumber(match)).padStart(3, '0');
  return `https://www.usopen.org/en_US/matchup/${code}-MS.html`;
}
