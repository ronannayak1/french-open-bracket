import { Match, Player, OfficialResult, ROUND_POINTS } from './types';
import { tournamentData } from './data';

/**
 * Given a set of user picks (matchId → playerName),
 * produce a full bracket state with players propagated forward
 * through the rounds based on selections.
 */
export function resolveBracket(
  picks: Record<string, string>
): Match[] {
  const matchMap = new Map<string, Match>();
  for (const m of tournamentData) {
    matchMap.set(m.id, { ...m, player1: m.player1 ? { ...m.player1 } : null, player2: m.player2 ? { ...m.player2 } : null });
  }

  const rounds = [2, 3, 4, 5, 6, 7];

  for (const round of rounds) {
    const matchesInRound = [...matchMap.values()]
      .filter((m) => m.round === round)
      .sort((a, b) => a.position - b.position);

    for (const match of matchesInRound) {
      const pickedName = picks[match.id];
      if (pickedName) {
        match.winnerName = pickedName;

        if (match.nextMatchId) {
          const nextMatch = matchMap.get(match.nextMatchId)!;
          const winner = findPlayerInMatch(match, pickedName);
          if (winner) {
            const feeders = getFeedersForMatch(nextMatch.id, matchMap);
            const isFirstFeeder = feeders[0] === match.id;
            if (isFirstFeeder) {
              nextMatch.player1 = { ...winner };
            } else {
              nextMatch.player2 = { ...winner };
            }
          }
        }
      }
    }
  }

  return [...matchMap.values()];
}

function findPlayerInMatch(match: Match, playerName: string): Player | null {
  if (match.player1 && match.player1.name === playerName) return match.player1;
  if (match.player2 && match.player2.name === playerName) return match.player2;
  return null;
}

/**
 * Returns the IDs of the two matches that feed into the given match,
 * in the order [player1Source, player2Source].
 */
function getFeedersForMatch(
  matchId: string,
  matchMap: Map<string, Match>
): [string, string] {
  const feeders: string[] = [];
  for (const [id, m] of matchMap) {
    if (m.nextMatchId === matchId) {
      feeders.push(id);
    }
  }
  feeders.sort((a, b) => {
    const mA = matchMap.get(a)!;
    const mB = matchMap.get(b)!;
    return mA.position - mB.position;
  });
  return [feeders[0] || '', feeders[1] || ''];
}

/**
 * When a pick changes, cascade-clear any downstream picks
 * that depended on a different winner from this match.
 */
export function cascadeClear(
  picks: Record<string, string>,
  changedMatchId: string,
  newWinner: string
): Record<string, string> {
  const next = { ...picks };
  const matchMap = new Map<string, Match>();
  for (const m of tournamentData) {
    matchMap.set(m.id, m);
  }

  const changedMatch = matchMap.get(changedMatchId);
  if (!changedMatch?.nextMatchId) return next;

  const oldWinner = picks[changedMatchId];
  if (oldWinner && oldWinner !== newWinner) {
    clearDownstream(next, changedMatch.nextMatchId, oldWinner, matchMap);
  }

  return next;
}

function clearDownstream(
  picks: Record<string, string>,
  matchId: string,
  displacedPlayer: string,
  matchMap: Map<string, Match>
) {
  if (picks[matchId] === displacedPlayer) {
    const match = matchMap.get(matchId);
    delete picks[matchId];
    if (match?.nextMatchId) {
      clearDownstream(picks, match.nextMatchId, displacedPlayer, matchMap);
    }
  }
}

/**
 * Remove a deselected player from all downstream matches.
 */
export function clearDownstreamPicks(
  picks: Record<string, string>,
  matchId: string,
  removedPlayer: string
): void {
  const matchMap = new Map<string, Match>();
  for (const m of tournamentData) {
    matchMap.set(m.id, m);
  }
  const match = matchMap.get(matchId);
  if (match?.nextMatchId) {
    clearDownstream(picks, match.nextMatchId, removedPlayer, matchMap);
  }
}

export function getMatchesByRound(matches: Match[]): Map<number, Match[]> {
  const byRound = new Map<number, Match[]>();
  for (const m of matches) {
    const arr = byRound.get(m.round) || [];
    arr.push(m);
    byRound.set(m.round, arr);
  }
  for (const arr of byRound.values()) {
    arr.sort((a, b) => a.position - b.position);
  }
  return byRound;
}

export function getTotalPicksNeeded(): number {
  return tournamentData.length;
}

export function calculateScore(
  picks: Record<string, string>,
  officialResults: Record<string, OfficialResult>
): { total: number; correct: number; decided: number } {
  let total = 0;
  let correct = 0;
  const decided = Object.keys(officialResults).length;

  for (const match of tournamentData) {
    const official = officialResults[match.id];
    if (!official) continue;
    if (picks[match.id] === official.winnerName) {
      total += ROUND_POINTS[match.round] ?? 0;
      correct++;
    }
  }

  return { total, correct, decided };
}
