import { Player } from './types';
import { playerToAbbrev } from './playerNames';

export interface ParsedSet {
  won: boolean;
  winnerGames: number;
  loserGames: number;
  tiebreakLost?: number;
  tiebreakWon?: number;
  abandoned?: boolean;
}

export interface ParsedMatchScore {
  displayLine: string;
  winnerLabel: string;
  seed?: number;
  sets: ParsedSet[];
  walkover?: boolean;
}

const SET_TOKEN =
  /(\d+)\/(\d+)(?:\((\d+)\))?(?:\s+Ab)?/g;

/** Parse "6/1 6/3 6/4" or "6/7(3) 6/2" from winner's perspective. */
export function parseSetScores(scorePart: string): ParsedSet[] {
  const sets: ParsedSet[] = [];
  const trimmed = scorePart.trim();
  if (trimmed === 'WO' || trimmed === 'W/O') {
    return [];
  }

  let m: RegExpExecArray | null;
  const re = new RegExp(SET_TOKEN.source, 'g');
  while ((m = re.exec(trimmed)) !== null) {
    const a = parseInt(m[1]!, 10);
    const b = parseInt(m[2]!, 10);
    const tb = m[3] ? parseInt(m[3], 10) : undefined;
    const abandoned = m[0].includes('Ab');
    const won = a > b;
    const winnerGames = won ? a : b;
    const loserGames = won ? b : a;
    sets.push({
      won,
      winnerGames,
      loserGames,
      tiebreakLost: !won && tb !== undefined ? tb : undefined,
      tiebreakWon: won && winnerGames === 7 && loserGames === 6 && tb !== undefined ? tb : undefined,
      abandoned,
    });
  }
  return sets;
}

export function buildDisplayScore(
  winner: Player,
  scorePart: string
): ParsedMatchScore {
  const seed = winner.seed;
  const abbrev = formatWinnerAbbrev(winner.name);
  const seedTag = seed ? ` [${seed}]` : '';
  const walkover = /^\s*WO\s*$/i.test(scorePart);
  return {
    displayLine: `${abbrev}${seedTag} ${scorePart.trim()}`.trim(),
    winnerLabel: winner.name,
    seed,
    sets: parseSetScores(scorePart),
    walkover,
  };
}

function formatWinnerAbbrev(fullName: string): string {
  return playerToAbbrev(fullName);
}

export function describeSet(set: ParsedSet, index: number): string {
  if (set.abandoned) {
    const label = set.won ? 'Won' : 'Lost';
    return `Set ${index + 1}: ${label} ${set.winnerGames}-${set.loserGames} (abandoned)`;
  }
  if (!set.won && set.tiebreakLost !== undefined) {
    return `Set ${index + 1}: Lost ${set.loserGames}-${set.winnerGames} (tiebreak ${7}-${set.tiebreakLost})`;
  }
  if (set.won && set.tiebreakWon !== undefined) {
    return `Set ${index + 1}: Won ${set.winnerGames}-${set.loserGames} (tiebreak won)`;
  }
  if (set.won) {
    return `Set ${index + 1}: Won ${set.winnerGames}-${set.loserGames}`;
  }
  return `Set ${index + 1}: Lost ${set.loserGames}-${set.winnerGames}`;
}

/** Pull score tokens from a stored display line like "J.SINNER [1] 6/1 6/3 6/4" */
export function scorePartFromDisplayLine(displayLine: string): string {
  const m = displayLine.match(
    /(?:\[\d+\]\s+)?((?:(?:\d+\/\d+(?:\(\d+\))?(?:\s+Ab)?|WO)\s*)+)$/
  );
  return m ? m[1]!.trim() : displayLine;
}
