import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { tournamentData } from './data';
import { Match, OfficialResult, Player } from './types';
import {
  abbrevMatchesPlayer,
  opponentSearchTokens,
  playerToAbbrev,
} from './playerNames';
import { buildDisplayScore } from './scoreFormat';

GlobalWorkerOptions.workerSrc = pdfWorker;

export interface PdfParsedResult {
  abbrev: string;
  seed?: number;
  scorePart: string;
  rawLine: string;
  charIndex: number;
  walkoverWin?: boolean;
}

const PDF_ABBREV_PART =
  '[A-Z](?:[A-Z])?\\.(?:[A-Z][A-Z\'.\\-]+(?:\\s+[A-Z][A-Z\'.\\-]+)*)';

const SET_SCORE_PART =
  '(?:\\d+\\/\\d+(?:\\(\\d+\\))?(?:\\s+Ab)?|\\d+\\/\\d+\\s+Ab)';

const RESULT_WITH_SCORES_RE = new RegExp(
  `(${PDF_ABBREV_PART})(?:\\s+\\[(\\d+)\\])?\\s+((?:${SET_SCORE_PART}\\s*)+)`,
  'g'
);

const RESULT_WO_WIN_RE = new RegExp(
  `(${PDF_ABBREV_PART})(?:\\s+\\[(\\d+)\\])?\\s+WO\\b`,
  'g'
);

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
      .concat('\n');
  }
  return text;
}

/** Loser line in PDF: has set scores then WO suffix — not the match winner. */
function isLoserWalkoverLine(scorePart: string): boolean {
  return /\d+\/\d+/.test(scorePart) && /\bWO\s*$/i.test(scorePart.trim());
}

export function parsePdfResults(text: string): PdfParsedResult[] {
  const results: PdfParsedResult[] = [];

  let m: RegExpExecArray | null;
  const scoreRe = new RegExp(RESULT_WITH_SCORES_RE.source, 'g');
  while ((m = scoreRe.exec(text)) !== null) {
    const abbrev = m[1]!.trim();
    const seed = m[2] ? parseInt(m[2], 10) : undefined;
    const scorePart = m[3]!.trim();
    if (!scorePart || isLoserWalkoverLine(scorePart)) continue;
    results.push({
      abbrev,
      seed,
      scorePart,
      rawLine: m[0].trim(),
      charIndex: m.index,
    });
  }

  const woRe = new RegExp(RESULT_WO_WIN_RE.source, 'g');
  while ((m = woRe.exec(text)) !== null) {
    const abbrev = m[1]!.trim();
    const seed = m[2] ? parseInt(m[2], 10) : undefined;
    const idx = m.index;
    const already = results.some((r) => Math.abs(r.charIndex - idx) < 30);
    if (already) continue;
    results.push({
      abbrev,
      seed,
      scorePart: 'WO',
      rawLine: m[0].trim(),
      charIndex: idx,
      walkoverWin: true,
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
  if (match.round === 2) {
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

function contextWindow(text: string, charIndex: number, size = 320): string {
  const start = Math.max(0, charIndex - size);
  return text.slice(start, charIndex).toUpperCase();
}

function contextIncludesOpponent(
  window: string,
  opponent: Player
): boolean {
  const tokens = opponentSearchTokens(opponent.name);
  return tokens.some((t) => t.length >= 3 && window.includes(t));
}

function findBestPdfResultForMatch(
  pdfText: string,
  pdfResults: PdfParsedResult[],
  used: Set<number>,
  player1: Player,
  player2: Player
): { index: number; winner: Player; parsed: PdfParsedResult } | null {
  const candidates: number[] = [];
  for (let i = 0; i < pdfResults.length; i++) {
    if (used.has(i)) continue;
    const pr = pdfResults[i]!;
    if (
      abbrevMatchesPlayer(pr.abbrev, player1.name) ||
      abbrevMatchesPlayer(pr.abbrev, player2.name)
    ) {
      candidates.push(i);
    }
  }

  if (candidates.length === 0) return null;
  if (candidates.length === 1) {
    const i = candidates[0]!;
    const pr = pdfResults[i]!;
    const winner = abbrevMatchesPlayer(pr.abbrev, player1.name) ? player1 : player2;
    return { index: i, winner, parsed: pr };
  }

  const scored: { index: number; score: number }[] = [];
  for (const i of candidates) {
    const pr = pdfResults[i]!;
    const winner = abbrevMatchesPlayer(pr.abbrev, player1.name) ? player1 : player2;
    const opponent = winner === player1 ? player2 : player1;
    const window = contextWindow(pdfText, pr.charIndex);
    let score = 0;
    if (contextIncludesOpponent(window, opponent)) score += 10;
    if (pr.walkoverWin) score += 3;
    score += i / 1000;
    scored.push({ index: i, score });
  }

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0]!;
  if (best.score >= 10) {
    const pr = pdfResults[best.index]!;
    const winner = abbrevMatchesPlayer(pr.abbrev, player1.name) ? player1 : player2;
    return { index: best.index, winner, parsed: pr };
  }

  const last = candidates[candidates.length - 1]!;
  const pr = pdfResults[last]!;
  const winner = abbrevMatchesPlayer(pr.abbrev, player1.name) ? player1 : player2;
  return { index: last, winner, parsed: pr };
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

  const rounds = [2, 3, 4, 5, 6, 7];
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
        player1,
        player2
      );
      if (!hit) continue;

      used.add(hit.index);
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
