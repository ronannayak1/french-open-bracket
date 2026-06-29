import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { tournamentData } from './data';
import { Match, OfficialResult, Player } from './types';
import {
  abbrevMatchesPlayer,
  opponentSearchTokens,
  playerToAbbrev,
} from './playerNames';
import { buildDisplayScore, parseSetScores } from './scoreFormat';

GlobalWorkerOptions.workerSrc = pdfWorker;

const MAX_SETS = 5;

export interface PdfParsedResult {
  abbrev: string;
  seed?: number;
  scorePart: string;
  rawLine: string;
  charIndex: number;
  walkoverWin?: boolean;
  orphan?: boolean;
}

const PDF_ABBREV_PART =
  '[A-Z](?:[A-Z])?\\.(?:[A-Z][A-Z\'.\\-]+(?:\\s+[A-Z][A-Z\'.\\-]+)*)';

const SET_SCORE_PART =
  '(?:\\d+\\/\\d+(?:\\(\\d+\\))?(?:\\s+Ab)?|\\d+\\/\\d+\\s+Ab)';

/** At most MAX_SETS per match — prevents merging adjacent PDF results. */
const SCORE_GROUP_PART = `(?:(?:${SET_SCORE_PART})\\s*){1,5}`;

const RESULT_WITH_SCORES_RE = new RegExp(
  `(${PDF_ABBREV_PART})(?:\\s+\\[(\\d+)\\])?\\s+(${SCORE_GROUP_PART})`,
  'g'
);

const RESULT_WO_WIN_RE = new RegExp(
  `(${PDF_ABBREV_PART})(?:\\s+\\[(\\d+)\\])?\\s+WO\\b`,
  'g'
);

const STANDALONE_SCORES_RE = new RegExp(SCORE_GROUP_PART, 'g');

export async function extractTextFromPdf(file: File): Promise<string> {
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await getDocument({ data }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .concat(' ');
  }
  return text;
}

function trimToMaxSets(scorePart: string): string {
  const sets = scorePart.trim().match(new RegExp(SET_SCORE_PART, 'g'));
  if (!sets) return scorePart.trim();
  return sets.slice(0, MAX_SETS).join(' ');
}

function isLoserWalkoverLine(scorePart: string): boolean {
  return /\d+\/\d+/.test(scorePart) && /\bWO\s*$/i.test(scorePart.trim());
}

function spansOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function parsePdfResults(text: string): PdfParsedResult[] {
  const results: PdfParsedResult[] = [];
  const claimedRanges: { start: number; end: number }[] = [];

  let m: RegExpExecArray | null;
  const scoreRe = new RegExp(RESULT_WITH_SCORES_RE.source, 'g');
  while ((m = scoreRe.exec(text)) !== null) {
    const abbrev = m[1]!.trim();
    const seed = m[2] ? parseInt(m[2], 10) : undefined;
    const scorePart = trimToMaxSets(m[3]!);
    if (!scorePart || isLoserWalkoverLine(scorePart)) continue;
    const start = m.index;
    const end = m.index + m[0].length;
    claimedRanges.push({ start, end });
    results.push({
      abbrev,
      seed,
      scorePart,
      rawLine: m[0].trim(),
      charIndex: start,
      orphan: false,
    });
  }

  const woRe = new RegExp(RESULT_WO_WIN_RE.source, 'g');
  while ((m = woRe.exec(text)) !== null) {
    const match = m;
    const abbrev = match[1]!.trim();
    const seed = match[2] ? parseInt(match[2], 10) : undefined;
    const idx = match.index;
    if (claimedRanges.some((r) => spansOverlap(idx, idx + match[0].length, r.start, r.end))) {
      continue;
    }
    claimedRanges.push({ start: idx, end: idx + match[0].length });
    results.push({
      abbrev,
      seed,
      scorePart: 'WO',
      rawLine: match[0].trim(),
      charIndex: idx,
      walkoverWin: true,
      orphan: false,
    });
  }

  const orphanRe = new RegExp(STANDALONE_SCORES_RE.source, 'g');
  while ((m = orphanRe.exec(text)) !== null) {
    const scorePart = trimToMaxSets(m[0]);
    if (!scorePart || scorePart.length < 3) continue;
    const start = m.index;
    const end = start + m[0].length;
    if (claimedRanges.some((r) => spansOverlap(start, end, r.start, r.end))) {
      continue;
    }
    const before = text.slice(Math.max(0, start - 3), start);
    if (/[A-Z]\.\s*$/.test(before) || /\[\d+\]\s*$/.test(before)) continue;
    claimedRanges.push({ start, end });
    results.push({
      abbrev: '',
      scorePart,
      rawLine: scorePart,
      charIndex: start,
      orphan: true,
    });
  }

  results.sort((a, b) => a.charIndex - b.charIndex);
  return results;
}

function getFeedersForMatch(matchId: string): string[] {
  return tournamentData
    .filter((m) => m.nextMatchId === matchId)
    .sort((a, b) => a.position - b.position)
    .map((m) => m.id);
}

function resolvePlayersForMatch(
  match: Match,
  results: Record<string, OfficialResult>
): { player1: Player | null; player2: Player | null } {
  if (match.round === 1) {
    return { player1: match.player1, player2: match.player2 };
  }
  const feeders = getFeedersForMatch(match.id);
  const players: (Player | null)[] = [null, null];
  feeders.forEach((fid, i) => {
    const feeder = tournamentData.find((m) => m.id === fid);
    const winnerName = results[fid]?.winnerName;
    if (!feeder || !winnerName) return;
    const p =
      feeder.player1?.name === winnerName
        ? feeder.player1
        : feeder.player2?.name === winnerName
          ? feeder.player2
          : { name: winnerName, country: '—' };
    players[i] = p;
  });
  return { player1: players[0], player2: players[1] };
}

function windowBefore(text: string, charIndex: number, size: number): string {
  return text.slice(Math.max(0, charIndex - size), charIndex).toUpperCase();
}

function windowHasPlayer(window: string, player: Player): boolean {
  const tokens = opponentSearchTokens(player.name);
  return tokens.some((t) => t.length >= 3 && window.includes(t));
}

function bothPlayersInWindow(
  text: string,
  charIndex: number,
  p1: Player,
  p2: Player,
  size = 280
): boolean {
  const w = windowBefore(text, charIndex, size);
  return windowHasPlayer(w, p1) && windowHasPlayer(w, p2);
}

/** Last abbrev+score line in the short window before this position. */
function lastAbbrevScoreBefore(
  text: string,
  charIndex: number,
  lookback = 90
): string | null {
  const slice = text.slice(Math.max(0, charIndex - lookback), charIndex);
  const re = new RegExp(
    `(${PDF_ABBREV_PART})(?:\\s+\\[(\\d+)\\])?\\s+${SCORE_GROUP_PART}`,
    'g'
  );
  let last: string | null = null;
  let m: RegExpExecArray | null;
  while ((m = re.exec(slice)) !== null) {
    last = m[1]!.trim();
  }
  return last;
}

function winnerFromOrphanScore(
  text: string,
  pr: PdfParsedResult,
  p1: Player,
  p2: Player
): Player | null {
  const sets = parseSetScores(pr.scorePart);
  if (sets.length === 0 || sets.length > MAX_SETS) return null;
  const wins = sets.filter((s) => s.won).length;
  const losses = sets.length - wins;
  if (wins <= losses) return null;

  const prevAbbrev = lastAbbrevScoreBefore(text, pr.charIndex, 100);
  if (prevAbbrev) {
    if (abbrevMatchesPlayer(prevAbbrev, p1.name)) return p2;
    if (abbrevMatchesPlayer(prevAbbrev, p2.name)) return p1;
  }

  if (windowHasPlayer(windowBefore(text, pr.charIndex, 120), p1)) return p1;
  return p2;
}

function winnerFromAbbrevLine(pr: PdfParsedResult, p1: Player, p2: Player): Player {
  if (abbrevMatchesPlayer(pr.abbrev, p1.name)) return p1;
  if (abbrevMatchesPlayer(pr.abbrev, p2.name)) return p2;
  return p1;
}

interface MatchCandidate {
  index: number;
  score: number;
}

function scoreCandidate(
  text: string,
  pr: PdfParsedResult,
  p1: Player,
  p2: Player
): number {
  const sets = parseSetScores(pr.scorePart);
  if (pr.walkoverWin) {
    if (!bothPlayersInWindow(text, pr.charIndex, p1, p2, 200)) return -1;
    return 50;
  }
  if (sets.length === 0 || sets.length > MAX_SETS) return -1;
  if (!bothPlayersInWindow(text, pr.charIndex, p1, p2, 260)) return -1;

  let score = 0;

  if (pr.orphan) {
    const wins = sets.filter((s) => s.won).length;
    const losses = sets.length - wins;
    if (wins <= losses) return -1;
    score += 100;
    const prevAbbrev = lastAbbrevScoreBefore(text, pr.charIndex, 90);
    if (prevAbbrev) {
      const winnerGuess = abbrevMatchesPlayer(prevAbbrev, p1.name)
        ? p2
        : abbrevMatchesPlayer(prevAbbrev, p2.name)
          ? p1
          : null;
      if (winnerGuess) score += 30;
    }
    return score;
  }

  const winner = winnerFromAbbrevLine(pr, p1, p2);
  const opponent = winner === p1 ? p2 : p1;
  const tight = windowBefore(text, pr.charIndex, 120);
  if (!windowHasPlayer(tight, opponent)) return -1;

  const prevAbbrev = lastAbbrevScoreBefore(text, pr.charIndex, 90);
  if (
    prevAbbrev &&
    abbrevMatchesPlayer(prevAbbrev, winner.name) &&
    sets.length < 4
  ) {
    return -1;
  }

  score += 40;
  if (windowHasPlayer(tight, opponent)) score += 20;
  return score;
}

function findBestPdfResultForMatch(
  pdfText: string,
  pdfResults: PdfParsedResult[],
  used: Set<number>,
  minCharIndex: number,
  player1: Player,
  player2: Player
): { index: number; winner: Player; parsed: PdfParsedResult } | null {
  const ranked: MatchCandidate[] = [];

  for (let i = 0; i < pdfResults.length; i++) {
    if (used.has(i)) continue;
    if (pdfResults[i]!.charIndex < minCharIndex) continue;
    const pr = pdfResults[i]!;
    const s = scoreCandidate(pdfText, pr, player1, player2);
    if (s >= 0) ranked.push({ index: i, score: s });
  }

  if (ranked.length === 0) return null;

  ranked.sort((a, b) => b.score - a.score);
  const best = ranked[0]!;
  const pr = pdfResults[best.index]!;

  let winner: Player;
  if (pr.orphan) {
    winner = winnerFromOrphanScore(pdfText, pr, player1, player2) ?? player1;
  } else if (pr.walkoverWin) {
    winner = winnerFromAbbrevLine(pr, player1, player2);
  } else {
    winner = winnerFromAbbrevLine(pr, player1, player2);
  }

  return { index: best.index, winner, parsed: pr };
}

export interface ApplyPdfReport {
  results: Record<string, OfficialResult>;
  matched: number;
  unmatchedPdfLines: string[];
  skippedMatches: string[];
}

export function applyPdfResultsToOfficial(
  pdfText: string,
  existing: Record<string, OfficialResult> = {}
): ApplyPdfReport {
  const pdfResults = parsePdfResults(pdfText);
  const used = new Set<number>();
  const results: Record<string, OfficialResult> = { ...existing };
  const skippedMatches: string[] = [];

  const rounds = [1, 2, 3, 4, 5, 6, 7];
  let minCharIndex = 0;
  for (const round of rounds) {
    const matches = tournamentData
      .filter((m) => m.round === round)
      .sort((a, b) => a.position - b.position);

    for (const match of matches) {
      const { player1, player2 } = resolvePlayersForMatch(match, results);
      if (!player1 || !player2) {
        skippedMatches.push(`${match.id} (players TBD)`);
        continue;
      }

      const hit = findBestPdfResultForMatch(
        pdfText,
        pdfResults,
        used,
        minCharIndex,
        player1,
        player2
      );
      if (!hit) continue;

      used.add(hit.index);
      minCharIndex = hit.parsed.charIndex;
      const display = buildDisplayScore(hit.winner, hit.parsed.scorePart);
      results[match.id] = {
        winnerName: hit.winner.name,
        score: display.displayLine,
      };
    }
  }

  const unmatchedPdfLines = pdfResults
    .map((p, i) => (used.has(i) ? null : p.rawLine))
    .filter((x): x is string => !!x);

  return {
    results,
    matched: used.size,
    unmatchedPdfLines,
    skippedMatches,
  };
}

export function getPlayerAbbrevHint(name: string): string {
  return playerToAbbrev(name);
}
