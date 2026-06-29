import { Match } from './types';
import { buildRound1Matches } from './round1Draw';

const round1Matches = buildRound1Matches();

/** Rounds 2–7: structure only — players propagate from R1 picks. */
const laterRoundMatches: Match[] = [
  // ROUND 2 — 32 matches
  { id: 'r2-m1', round: 2, position: 1, player1: null, player2: null, nextMatchId: 'r3-m1' },
  { id: 'r2-m2', round: 2, position: 2, player1: null, player2: null, nextMatchId: 'r3-m1' },
  { id: 'r2-m3', round: 2, position: 3, player1: null, player2: null, nextMatchId: 'r3-m2' },
  { id: 'r2-m4', round: 2, position: 4, player1: null, player2: null, nextMatchId: 'r3-m2' },
  { id: 'r2-m5', round: 2, position: 5, player1: null, player2: null, nextMatchId: 'r3-m3' },
  { id: 'r2-m6', round: 2, position: 6, player1: null, player2: null, nextMatchId: 'r3-m3' },
  { id: 'r2-m7', round: 2, position: 7, player1: null, player2: null, nextMatchId: 'r3-m4' },
  { id: 'r2-m8', round: 2, position: 8, player1: null, player2: null, nextMatchId: 'r3-m4' },
  { id: 'r2-m9', round: 2, position: 9, player1: null, player2: null, nextMatchId: 'r3-m5' },
  { id: 'r2-m10', round: 2, position: 10, player1: null, player2: null, nextMatchId: 'r3-m5' },
  { id: 'r2-m11', round: 2, position: 11, player1: null, player2: null, nextMatchId: 'r3-m6' },
  { id: 'r2-m12', round: 2, position: 12, player1: null, player2: null, nextMatchId: 'r3-m6' },
  { id: 'r2-m13', round: 2, position: 13, player1: null, player2: null, nextMatchId: 'r3-m7' },
  { id: 'r2-m14', round: 2, position: 14, player1: null, player2: null, nextMatchId: 'r3-m7' },
  { id: 'r2-m15', round: 2, position: 15, player1: null, player2: null, nextMatchId: 'r3-m8' },
  { id: 'r2-m16', round: 2, position: 16, player1: null, player2: null, nextMatchId: 'r3-m8' },
  { id: 'r2-m17', round: 2, position: 17, player1: null, player2: null, nextMatchId: 'r3-m9' },
  { id: 'r2-m18', round: 2, position: 18, player1: null, player2: null, nextMatchId: 'r3-m9' },
  { id: 'r2-m19', round: 2, position: 19, player1: null, player2: null, nextMatchId: 'r3-m10' },
  { id: 'r2-m20', round: 2, position: 20, player1: null, player2: null, nextMatchId: 'r3-m10' },
  { id: 'r2-m21', round: 2, position: 21, player1: null, player2: null, nextMatchId: 'r3-m11' },
  { id: 'r2-m22', round: 2, position: 22, player1: null, player2: null, nextMatchId: 'r3-m11' },
  { id: 'r2-m23', round: 2, position: 23, player1: null, player2: null, nextMatchId: 'r3-m12' },
  { id: 'r2-m24', round: 2, position: 24, player1: null, player2: null, nextMatchId: 'r3-m12' },
  { id: 'r2-m25', round: 2, position: 25, player1: null, player2: null, nextMatchId: 'r3-m13' },
  { id: 'r2-m26', round: 2, position: 26, player1: null, player2: null, nextMatchId: 'r3-m13' },
  { id: 'r2-m27', round: 2, position: 27, player1: null, player2: null, nextMatchId: 'r3-m14' },
  { id: 'r2-m28', round: 2, position: 28, player1: null, player2: null, nextMatchId: 'r3-m14' },
  { id: 'r2-m29', round: 2, position: 29, player1: null, player2: null, nextMatchId: 'r3-m15' },
  { id: 'r2-m30', round: 2, position: 30, player1: null, player2: null, nextMatchId: 'r3-m15' },
  { id: 'r2-m31', round: 2, position: 31, player1: null, player2: null, nextMatchId: 'r3-m16' },
  { id: 'r2-m32', round: 2, position: 32, player1: null, player2: null, nextMatchId: 'r3-m16' },

  // ROUND 3 — 16 matches
  { id: 'r3-m1', round: 3, position: 1, player1: null, player2: null, nextMatchId: 'r4-m1' },
  { id: 'r3-m2', round: 3, position: 2, player1: null, player2: null, nextMatchId: 'r4-m1' },
  { id: 'r3-m3', round: 3, position: 3, player1: null, player2: null, nextMatchId: 'r4-m2' },
  { id: 'r3-m4', round: 3, position: 4, player1: null, player2: null, nextMatchId: 'r4-m2' },
  { id: 'r3-m5', round: 3, position: 5, player1: null, player2: null, nextMatchId: 'r4-m3' },
  { id: 'r3-m6', round: 3, position: 6, player1: null, player2: null, nextMatchId: 'r4-m3' },
  { id: 'r3-m7', round: 3, position: 7, player1: null, player2: null, nextMatchId: 'r4-m4' },
  { id: 'r3-m8', round: 3, position: 8, player1: null, player2: null, nextMatchId: 'r4-m4' },
  { id: 'r3-m9', round: 3, position: 9, player1: null, player2: null, nextMatchId: 'r4-m5' },
  { id: 'r3-m10', round: 3, position: 10, player1: null, player2: null, nextMatchId: 'r4-m5' },
  { id: 'r3-m11', round: 3, position: 11, player1: null, player2: null, nextMatchId: 'r4-m6' },
  { id: 'r3-m12', round: 3, position: 12, player1: null, player2: null, nextMatchId: 'r4-m6' },
  { id: 'r3-m13', round: 3, position: 13, player1: null, player2: null, nextMatchId: 'r4-m7' },
  { id: 'r3-m14', round: 3, position: 14, player1: null, player2: null, nextMatchId: 'r4-m7' },
  { id: 'r3-m15', round: 3, position: 15, player1: null, player2: null, nextMatchId: 'r4-m8' },
  { id: 'r3-m16', round: 3, position: 16, player1: null, player2: null, nextMatchId: 'r4-m8' },

  // ROUND 4 — 8 matches
  { id: 'r4-m1', round: 4, position: 1, player1: null, player2: null, nextMatchId: 'qf-m1' },
  { id: 'r4-m2', round: 4, position: 2, player1: null, player2: null, nextMatchId: 'qf-m1' },
  { id: 'r4-m3', round: 4, position: 3, player1: null, player2: null, nextMatchId: 'qf-m2' },
  { id: 'r4-m4', round: 4, position: 4, player1: null, player2: null, nextMatchId: 'qf-m2' },
  { id: 'r4-m5', round: 4, position: 5, player1: null, player2: null, nextMatchId: 'qf-m3' },
  { id: 'r4-m6', round: 4, position: 6, player1: null, player2: null, nextMatchId: 'qf-m3' },
  { id: 'r4-m7', round: 4, position: 7, player1: null, player2: null, nextMatchId: 'qf-m4' },
  { id: 'r4-m8', round: 4, position: 8, player1: null, player2: null, nextMatchId: 'qf-m4' },

  // QUARTERFINALS — 4 matches
  { id: 'qf-m1', round: 5, position: 1, player1: null, player2: null, nextMatchId: 'sf-m1' },
  { id: 'qf-m2', round: 5, position: 2, player1: null, player2: null, nextMatchId: 'sf-m1' },
  { id: 'qf-m3', round: 5, position: 3, player1: null, player2: null, nextMatchId: 'sf-m2' },
  { id: 'qf-m4', round: 5, position: 4, player1: null, player2: null, nextMatchId: 'sf-m2' },

  // SEMIFINALS — 2 matches
  { id: 'sf-m1', round: 6, position: 1, player1: null, player2: null, nextMatchId: 'f-m1' },
  { id: 'sf-m2', round: 6, position: 2, player1: null, player2: null, nextMatchId: 'f-m1' },

  // FINAL
  { id: 'f-m1', round: 7, position: 1, player1: null, player2: null },
];

/**
 * 2026 Wimbledon Gentlemen's Singles — full 128-player main draw.
 * Round 1 has all 128 entrants; later rounds fill from picks.
 */
export const tournamentData: Match[] = [...round1Matches, ...laterRoundMatches];
