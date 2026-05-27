import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { tournamentData } from './data';
import { Match, OfficialResult, Player } from './types';
import { abbrevMatchesPlayer, playerToAbbrev } from './playerNames';
import { buildDisplayScore } from './scoreFormat';

GlobalWorkerOptions.workerSrc = pdfWorker;

export interface PdfParsedResult {
  abbrev: string;
  seed?: number;
  scorePart: string;
  rawLine: string;
}

const RESULT_LINE_RE =
  /([A-Z](?:[A-Z])?\.[A-Z][A-Z'.\-]+?)(?:\s+\[(\d+)\])?\s+((?:(?:\d+\/\d+(?:\(\d+\))?(?:\s+Ab)?|WO)\s*)+)/g;

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

export function parsePdfResults(text: string): PdfParsedResult[] {
  const results: PdfParsedResult[] = [];
  const re = new RegExp(RESULT_LINE_RE.source, 'g');
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const abbrev = m[1]!.trim();
    const seed = m[2] ? parseInt(m[2], 10) : undefined;
    const scorePart = m[3]!.trim();
    if (!scorePart || scorePart.length < 3) continue;
    results.push({
      abbrev,
      seed,
      scorePart,
      rawLine: m[0].trim(),
    });
  }
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

function findMatchingPdfResult(
  pdfResults: PdfParsedResult[],
  used: Set<number>,
  player1: Player | null,
  player2: Player | null
): { index: number; winner: Player; parsed: PdfParsedResult } | null {
  for (let i = 0; i < pdfResults.length; i++) {
    if (used.has(i)) continue;
    const pr = pdfResults[i]!;
    if (player1 && abbrevMatchesPlayer(pr.abbrev, player1.name)) {
      return { index: i, winner: player1, parsed: pr };
    }
    if (player2 && abbrevMatchesPlayer(pr.abbrev, player2.name)) {
      return { index: i, winner: player2, parsed: pr };
    }
  }
  return null;
}

export interface ApplyPdfReport {
  results: Record<string, OfficialResult>;
  matched: number;
  unmatchedPdfLines: string[];
  skippedMatches: string[];
}

/**
 * Map PDF score lines onto bracket matches in draw order (round 2 → final).
 * Merges with existing official results (new PDF data overrides per match).
 */
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

      const hit = findMatchingPdfResult(pdfResults, used, player1, player2);
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
