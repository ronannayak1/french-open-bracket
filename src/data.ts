import { Match } from './types';

/**
 * 2026 Wimbledon Men's Singles bracket — Round 2 onwards (Round of 64).
 * Players shown are R1 winners from the official draw (29 June 2026).
 */
export const tournamentData: Match[] = [
  // ============================================================
  // ROUND 2 — 32 matches (Round of 64)
  // TOP HALF (positions 1-16)
  // ============================================================

  // --- Section 1 (positions 1-4) ---
  {
    id: 'r2-m1', round: 2, position: 1,
    player1: { name: 'Jannik SINNER', country: 'ITA', seed: 1 },
    player2: { name: 'Nuno BORGES', country: 'POR' },
    nextMatchId: 'r3-m1',
  },
  {
    id: 'r2-m2', round: 2, position: 2,
    player1: { name: 'Jenson BROOKSBY', country: 'USA' },
    player2: { name: 'Ignacio BUSE', country: 'PER', seed: 31 },
    nextMatchId: 'r3-m1',
  },
  {
    id: 'r2-m3', round: 2, position: 3,
    player1: { name: 'Rafael JODAR', country: 'ESP', seed: 23 },
    player2: { name: 'Pablo CARRENO BUSTA', country: 'ESP' },
    nextMatchId: 'r3-m2',
  },
  {
    id: 'r2-m4', round: 2, position: 4,
    player1: { name: 'Shintaro MOCHIZUKI', country: 'JPN', status: 'Q' },
    player2: { name: 'Ethan QUINN', country: 'USA' },
    nextMatchId: 'r3-m2',
  },

  // --- Section 2 (positions 5-8) ---
  {
    id: 'r2-m5', round: 2, position: 5,
    player1: { name: 'Hubert HURKACZ', country: 'POL' },
    player2: { name: 'Sebastian OFNER', country: 'AUT' },
    nextMatchId: 'r3-m3',
  },
  {
    id: 'r2-m6', round: 2, position: 6,
    player1: { name: 'Soon-woo KWON', country: 'KOR', status: 'Q' },
    player2: { name: 'Tommy PAUL', country: 'USA', seed: 21 },
    nextMatchId: 'r3-m3',
  },
  {
    id: 'r2-m7', round: 2, position: 7,
    player1: { name: 'Brandon NAKASHIMA', country: 'USA', seed: 28 },
    player2: { name: 'Jan-Lennard STRUFF', country: 'GER' },
    nextMatchId: 'r3-m4',
  },
  {
    id: 'r2-m8', round: 2, position: 8,
    player1: { name: 'Daniel MERIDA', country: 'ESP' },
    player2: { name: 'Daniil MEDVEDEV', country: '---', seed: 8 },
    nextMatchId: 'r3-m4',
  },

  // --- Section 3 (positions 9-12) ---
  {
    id: 'r2-m9', round: 2, position: 9,
    player1: { name: 'Felix AUGER-ALIASSIME', country: 'CAN', seed: 3 },
    player2: { name: 'Dino PRIZMIC', country: 'CRO' },
    nextMatchId: 'r3-m5',
  },
  {
    id: 'r2-m10', round: 2, position: 10,
    player1: { name: 'Nicolas MEJIA', country: 'COL', status: 'Q' },
    player2: { name: 'Michael ZHENG', country: 'USA', status: 'Q' },
    nextMatchId: 'r3-m5',
  },
  {
    id: 'r2-m11', round: 2, position: 11,
    player1: { name: 'Alejandro DAVIDOVICH FOKINA', country: 'ESP', seed: 22 },
    player2: { name: 'Fabian MAROZSAN', country: 'HUN' },
    nextMatchId: 'r3-m6',
  },
  {
    id: 'r2-m12', round: 2, position: 12,
    player1: { name: 'Marton FUCSOVICS', country: 'HUN' },
    player2: { name: 'Learner TIEN', country: 'USA', seed: 16 },
    nextMatchId: 'r3-m6',
  },

  // --- Section 4 (positions 13-16) ---
  {
    id: 'r2-m13', round: 2, position: 13,
    player1: { name: 'Roman SAFIULLIN', country: '---', status: 'Q' },
    player2: { name: 'Botic VAN DE ZANDSCHULP', country: 'NED' },
    nextMatchId: 'r3-m7',
  },
  {
    id: 'r2-m14', round: 2, position: 14,
    player1: { name: 'Jesper DE JONG', country: 'NED' },
    player2: { name: 'Joao FONSECA', country: 'BRA', seed: 24 },
    nextMatchId: 'r3-m7',
  },
  {
    id: 'r2-m15', round: 2, position: 15,
    player1: { name: 'Arthur RINDERKNECH', country: 'FRA', seed: 25 },
    player2: { name: 'Martin DAMM', country: 'USA' },
    nextMatchId: 'r3-m8',
  },
  {
    id: 'r2-m16', round: 2, position: 16,
    player1: { name: 'Stefanos TSITSIPAS', country: 'GRE' },
    player2: { name: 'Novak DJOKOVIC', country: 'SRB', seed: 7 },
    nextMatchId: 'r3-m8',
  },

  // ============================================================
  // BOTTOM HALF (positions 17-32)
  // ============================================================

  // --- Section 5 (positions 17-20) ---
  {
    id: 'r2-m17', round: 2, position: 17,
    player1: { name: 'Alex DE MINAUR', country: 'AUS', seed: 5 },
    player2: { name: 'Adrian MANNARINO', country: 'FRA' },
    nextMatchId: 'r3-m9',
  },
  {
    id: 'r2-m18', round: 2, position: 18,
    player1: { name: 'Zachary SVAJDA', country: 'USA' },
    player2: { name: 'Kamil MAJCHRAK', country: 'POL' },
    nextMatchId: 'r3-m9',
  },
  {
    id: 'r2-m19', round: 2, position: 19,
    player1: { name: 'Karen KHACHANOV', country: '---', seed: 19 },
    player2: { name: 'Yannick HANFMANN', country: 'GER' },
    nextMatchId: 'r3-m10',
  },
  {
    id: 'r2-m20', round: 2, position: 20,
    player1: { name: 'James DUCKWORTH', country: 'AUS' },
    player2: { name: 'Flavio COBOLLI', country: 'ITA', seed: 9 },
    nextMatchId: 'r3-m10',
  },

  // --- Section 6 (positions 21-24) ---
  {
    id: 'r2-m21', round: 2, position: 21,
    player1: { name: 'Jakub MENSIK', country: 'CZE', seed: 15 },
    player2: { name: 'Grigor DIMITROV', country: 'BUL', status: 'W' },
    nextMatchId: 'r3-m11',
  },
  {
    id: 'r2-m22', round: 2, position: 22,
    player1: { name: 'Matteo BERRETTINI', country: 'ITA' },
    player2: { name: 'Arthur FILS', country: 'FRA', seed: 20 },
    nextMatchId: 'r3-m11',
  },
  {
    id: 'r2-m23', round: 2, position: 23,
    player1: { name: 'Zizou BERGS', country: 'BEL' },
    player2: { name: 'Jaime FARIA', country: 'POR', status: 'Q' },
    nextMatchId: 'r3-m12',
  },
  {
    id: 'r2-m24', round: 2, position: 24,
    player1: { name: 'Arthur FERY', country: 'GBR', status: 'W' },
    player2: { name: 'Otto VIRTANEN', country: 'FIN', status: 'Q' },
    nextMatchId: 'r3-m12',
  },

  // --- Section 7 (positions 25-28) ---
  {
    id: 'r2-m25', round: 2, position: 25,
    player1: { name: 'Taylor FRITZ', country: 'USA', seed: 6 },
    player2: { name: 'Patrick KYPSON', country: 'USA' },
    nextMatchId: 'r3-m13',
  },
  {
    id: 'r2-m26', round: 2, position: 26,
    player1: { name: 'Gabriel DIALLO', country: 'CAN' },
    player2: { name: 'Lorenzo SONEGO', country: 'ITA' },
    nextMatchId: 'r3-m13',
  },
  {
    id: 'r2-m27', round: 2, position: 27,
    player1: { name: 'Frances TIAFOE', country: 'USA', seed: 17 },
    player2: { name: 'Jan CHOINSKI', country: 'GBR' },
    nextMatchId: 'r3-m14',
  },
  {
    id: 'r2-m28', round: 2, position: 28,
    player1: { name: 'Kyrian JACQUET', country: 'FRA', status: 'Q' },
    player2: { name: 'Alexander BUBLIK', country: 'KAZ', seed: 10 },
    nextMatchId: 'r3-m14',
  },

  // --- Section 8 (positions 29-32) ---
  {
    id: 'r2-m29', round: 2, position: 29,
    player1: { name: 'Jiri LEHECEK', country: 'CZE', seed: 13 },
    player2: { name: 'Alex MOLCAN', country: 'SVK' },
    nextMatchId: 'r3-m15',
  },
  {
    id: 'r2-m30', round: 2, position: 30,
    player1: { name: 'Alex MICHELSEN', country: 'USA' },
    player2: { name: 'Jaume MUNAR', country: 'ESP' },
    nextMatchId: 'r3-m15',
  },
  {
    id: 'r2-m31', round: 2, position: 31,
    player1: { name: 'Quentin HALYS', country: 'FRA' },
    player2: { name: 'Marcos GIRON', country: 'USA' },
    nextMatchId: 'r3-m16',
  },
  {
    id: 'r2-m32', round: 2, position: 32,
    player1: { name: 'Valentin ROYER', country: 'FRA' },
    player2: { name: 'Alexander ZVEREV', country: 'GER', seed: 2 },
    nextMatchId: 'r3-m16',
  },

  // ============================================================
  // ROUND 3 — 16 matches
  // ============================================================
  {
    id: 'r3-m1', round: 3, position: 1,
    player1: null, player2: null, nextMatchId: 'r4-m1',
  },
  {
    id: 'r3-m2', round: 3, position: 2,
    player1: null, player2: null, nextMatchId: 'r4-m1',
  },
  {
    id: 'r3-m3', round: 3, position: 3,
    player1: null, player2: null, nextMatchId: 'r4-m2',
  },
  {
    id: 'r3-m4', round: 3, position: 4,
    player1: null, player2: null, nextMatchId: 'r4-m2',
  },
  {
    id: 'r3-m5', round: 3, position: 5,
    player1: null, player2: null, nextMatchId: 'r4-m3',
  },
  {
    id: 'r3-m6', round: 3, position: 6,
    player1: null, player2: null, nextMatchId: 'r4-m3',
  },
  {
    id: 'r3-m7', round: 3, position: 7,
    player1: null, player2: null, nextMatchId: 'r4-m4',
  },
  {
    id: 'r3-m8', round: 3, position: 8,
    player1: null, player2: null, nextMatchId: 'r4-m4',
  },
  {
    id: 'r3-m9', round: 3, position: 9,
    player1: null, player2: null, nextMatchId: 'r4-m5',
  },
  {
    id: 'r3-m10', round: 3, position: 10,
    player1: null, player2: null, nextMatchId: 'r4-m5',
  },
  {
    id: 'r3-m11', round: 3, position: 11,
    player1: null, player2: null, nextMatchId: 'r4-m6',
  },
  {
    id: 'r3-m12', round: 3, position: 12,
    player1: null, player2: null, nextMatchId: 'r4-m6',
  },
  {
    id: 'r3-m13', round: 3, position: 13,
    player1: null, player2: null, nextMatchId: 'r4-m7',
  },
  {
    id: 'r3-m14', round: 3, position: 14,
    player1: null, player2: null, nextMatchId: 'r4-m7',
  },
  {
    id: 'r3-m15', round: 3, position: 15,
    player1: null, player2: null, nextMatchId: 'r4-m8',
  },
  {
    id: 'r3-m16', round: 3, position: 16,
    player1: null, player2: null, nextMatchId: 'r4-m8',
  },

  // ============================================================
  // ROUND 4 (4th Round) — 8 matches
  // ============================================================
  {
    id: 'r4-m1', round: 4, position: 1,
    player1: null, player2: null, nextMatchId: 'qf-m1',
  },
  {
    id: 'r4-m2', round: 4, position: 2,
    player1: null, player2: null, nextMatchId: 'qf-m1',
  },
  {
    id: 'r4-m3', round: 4, position: 3,
    player1: null, player2: null, nextMatchId: 'qf-m2',
  },
  {
    id: 'r4-m4', round: 4, position: 4,
    player1: null, player2: null, nextMatchId: 'qf-m2',
  },
  {
    id: 'r4-m5', round: 4, position: 5,
    player1: null, player2: null, nextMatchId: 'qf-m3',
  },
  {
    id: 'r4-m6', round: 4, position: 6,
    player1: null, player2: null, nextMatchId: 'qf-m3',
  },
  {
    id: 'r4-m7', round: 4, position: 7,
    player1: null, player2: null, nextMatchId: 'qf-m4',
  },
  {
    id: 'r4-m8', round: 4, position: 8,
    player1: null, player2: null, nextMatchId: 'qf-m4',
  },

  // ============================================================
  // QUARTERFINALS — 4 matches
  // ============================================================
  {
    id: 'qf-m1', round: 5, position: 1,
    player1: null, player2: null, nextMatchId: 'sf-m1',
  },
  {
    id: 'qf-m2', round: 5, position: 2,
    player1: null, player2: null, nextMatchId: 'sf-m1',
  },
  {
    id: 'qf-m3', round: 5, position: 3,
    player1: null, player2: null, nextMatchId: 'sf-m2',
  },
  {
    id: 'qf-m4', round: 5, position: 4,
    player1: null, player2: null, nextMatchId: 'sf-m2',
  },

  // ============================================================
  // SEMIFINALS — 2 matches
  // ============================================================
  {
    id: 'sf-m1', round: 6, position: 1,
    player1: null, player2: null, nextMatchId: 'f-m1',
  },
  {
    id: 'sf-m2', round: 6, position: 2,
    player1: null, player2: null, nextMatchId: 'f-m1',
  },

  // ============================================================
  // FINAL — 1 match
  // ============================================================
  {
    id: 'f-m1', round: 7, position: 1,
    player1: null, player2: null,
  },
];
