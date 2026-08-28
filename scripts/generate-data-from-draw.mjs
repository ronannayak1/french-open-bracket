import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

const path = process.argv[2] || '/Users/torinnayak/Downloads/2026_MS_draw (1).pdf';
const data = new Uint8Array(fs.readFileSync(path));
const pdf = await getDocument({ data, useSystemFonts: true }).promise;

/** @type {{ page: number; x: number; y: number; t: string }[]} */
const items = [];
for (let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i);
  const content = await page.getTextContent();
  for (const it of content.items) {
    if (!('str' in it) || !it.str.trim()) continue;
    items.push({
      page: i,
      x: Math.round(it.transform[4]),
      y: Math.round(it.transform[5]),
      t: it.str.trim(),
    });
  }
}

const NEUTRAL = '---';

function toAppName(first, last) {
  const title = (s) =>
    s
      .split(/(\s+|-)/)
      .map((w) => (w && w !== ' ' && w !== '-' ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
      .join('');
  return `${title(first)} ${last.toUpperCase()}`;
}

function parsePlayerLine(t) {
  // "ZVEREV, Alexander GER" or "MEDVEDEV, Daniil" (no country for some)
  const withCountry = t.match(/^(.+),\s+(.+?)\s+([A-Z]{3})$/);
  if (withCountry) {
    return {
      name: toAppName(withCountry[2].trim(), withCountry[1].trim()),
      country: withCountry[3],
    };
  }
  const noCountry = t.match(/^(.+),\s+(.+)$/);
  if (noCountry) {
    return {
      name: toAppName(noCountry[2].trim(), noCountry[1].trim()),
      country: NEUTRAL,
    };
  }
  return { name: t, country: NEUTRAL };
}

/** @type {Map<number, { name: string; country: string; seed?: number; status?: string }>} */
const slots = new Map();

for (const it of items) {
  const posM = it.t.match(/^(\d+)\.$/);
  if (!posM) continue;
  const pos = Number(posM[1]);
  if (pos < 1 || pos > 128) continue;

  const row = items.filter((r) => r.page === it.page && r.y === it.y);
  let seed;
  let status;
  let playerLine;
  for (const r of row) {
    const sm = r.t.match(/^\[(\d+)\]$/);
    if (sm) seed = Number(sm[1]);
    const st = r.t.match(/^\(([QWL])\)$/);
    if (st) status = st[1];
    if (r.x >= 30 && r.x <= 40 && r.t.includes(',')) playerLine = r.t;
  }
  if (!playerLine) continue;
  const p = parsePlayerLine(playerLine);
  if (seed) p.seed = seed;
  if (status) p.status = status;
  slots.set(pos, p);
}

if (slots.size !== 128) {
  console.error('Expected 128 slots, got', slots.size);
  const missing = [];
  for (let i = 1; i <= 128; i++) if (!slots.has(i)) missing.push(i);
  console.error('Missing:', missing.join(', '));
  process.exit(1);
}

function fmtPlayer(p) {
  const parts = [`{ name: '${p.name.replace(/'/g, "\\'")}', country: '${p.country}'`];
  if (p.seed) parts.push(`seed: ${p.seed}`);
  if (p.status) parts.push(`status: '${p.status}'`);
  return parts.join(', ') + ' }';
}

function fmtMatch(m) {
  return `  {
    id: '${m.id}', round: ${m.round}, position: ${m.position},
    player1: ${fmtPlayer(m.player1)},
    player2: ${fmtPlayer(m.player2)},
    nextMatchId: '${m.nextMatchId}',
  },`;
}

const r1 = [];
for (let m = 1; m <= 64; m++) {
  const p1 = slots.get(2 * m - 1);
  const p2 = slots.get(2 * m);
  r1.push({
    id: `r1-m${m}`,
    round: 1,
    position: m,
    player1: p1,
    player2: p2,
    nextMatchId: `r2-m${Math.ceil(m / 2)}`,
  });
}

const later = [];
for (let r = 2; r <= 7; r++) {
  const count = 2 ** (7 - r);
  const prefix = r === 5 ? 'qf' : r === 6 ? 'sf' : r === 7 ? 'f' : `r${r}`;
  for (let p = 1; p <= count; p++) {
    const id = r === 7 ? 'f-m1' : `${prefix}-m${p}`;
    const nextRound = r + 1;
    const nextPrefix =
      nextRound === 5 ? 'qf' : nextRound === 6 ? 'sf' : nextRound === 7 ? 'f' : `r${nextRound}`;
    const nextId =
      r < 7 ? (nextRound === 7 ? 'f-m1' : `${nextPrefix}-m${Math.ceil(p / 2)}`) : undefined;
    later.push({ id, round: r, position: p, player1: null, player2: null, nextMatchId: nextId });
  }
}

let out = `import { Match } from './types';

/**
 * 2026 US Open Men's Singles — full 128-player main draw.
 * First-round pairings from the official draw PDF (27 August 2026).
 */
export const tournamentData: Match[] = [
  // ROUND 1 — 64 matches (draw positions 1–128)
`;
for (const m of r1) out += fmtMatch(m) + '\n';
out += '\n  // ROUNDS 2–7 — filled by bracket resolution\n';
for (const m of later) {
  if (m.player1 === null) {
    out += `  {
    id: '${m.id}', round: ${m.round}, position: ${m.position},
    player1: null, player2: null,${m.nextMatchId ? `\n    nextMatchId: '${m.nextMatchId}',` : ''}
  },\n`;
  }
}
out += '];\n';

fs.writeFileSync('src/data.ts', out);
console.log('Wrote src/data.ts with', r1.length + later.length, 'matches from', path);
