import { Match } from './types';

/** Wimbledon men's singles draw — link to official draw (per-match pages use dynamic IDs). */
export function wimbledonMatchUrl(_match: Match): string {
  return 'https://www.wimbledon.com/en_GB/draws/gentlemens-singles';
}
