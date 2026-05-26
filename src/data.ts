import { Match } from './types';

/**
 * 2026 Roland-Garros Men's Singles bracket — Round 2 onwards.
 * Players shown are the R1 winners from the official draw (26 May 2026).
 */
export const tournamentData: Match[] = [
  // ============================================================
  // ROUND 2 — 32 matches
  // TOP HALF (positions 1-16)
  // ============================================================

  // --- Quarter 1: Sinner section (1-8) ---
  {
    id: 'r2-m1', round: 2, position: 1,
    player1: { name: 'Jannik SINNER', country: 'ITA', seed: 1 },
    player2: { name: 'Juan Manuel CERUNDOLO', country: 'ARG' },
    nextMatchId: 'r3-m1',
  },
  {
    id: 'r2-m2', round: 2, position: 2,
    player1: { name: 'Martin LANDALUCE', country: 'ESP' },
    player2: { name: 'Vit KOPRIVA', country: 'CZE' },
    nextMatchId: 'r3-m1',
  },
  {
    id: 'r2-m3', round: 2, position: 3,
    player1: { name: 'Arthur RINDERKNECH', country: 'FRA', seed: 22 },
    player2: { name: 'Matteo BERRETTINI', country: 'ITA' },
    nextMatchId: 'r3-m2',
  },
  {
    id: 'r2-m4', round: 2, position: 4,
    player1: { name: 'Francisco COMESANA', country: 'ARG' },
    player2: { name: 'Luciano DARDERI', country: 'ITA', seed: 14 },
    nextMatchId: 'r3-m2',
  },
  {
    id: 'r2-m5', round: 2, position: 5,
    player1: { name: 'Jan-Lennard STRUFF', country: 'GER' },
    player2: { name: 'Jaime FARIA', country: 'POR', status: 'Q' },
    nextMatchId: 'r3-m3',
  },
  {
    id: 'r2-m6', round: 2, position: 6,
    player1: { name: 'Hubert HURKACZ', country: 'POL' },
    player2: { name: 'Frances TIAFOE', country: 'USA', seed: 19 },
    nextMatchId: 'r3-m3',
  },
  {
    id: 'r2-m7', round: 2, position: 7,
    player1: { name: 'Matteo ARNALDI', country: 'ITA' },
    player2: { name: 'Stefanos TSITSIPAS', country: 'GRE' },
    nextMatchId: 'r3-m4',
  },
  {
    id: 'r2-m8', round: 2, position: 8,
    player1: { name: 'Raphael COLLIGNON', country: 'BEL' },
    player2: { name: 'Ben SHELTON', country: 'USA', seed: 5 },
    nextMatchId: 'r3-m4',
  },

  // --- Quarter 2: Auger-Aliassime section (9-16) ---
  {
    id: 'r2-m9', round: 2, position: 9,
    player1: { name: 'Felix AUGER-ALIASSIME', country: 'CAN', seed: 4 },
    player2: { name: 'Roman Andres BURRUCHAGA', country: 'ARG' },
    nextMatchId: 'r3-m5',
  },
  {
    id: 'r2-m10', round: 2, position: 10,
    player1: { name: 'Luca VAN ASSCHE', country: 'FRA' },
    player2: { name: 'Brandon NAKASHIMA', country: 'USA', seed: 31 },
    nextMatchId: 'r3-m5',
  },
  {
    id: 'r2-m11', round: 2, position: 11,
    player1: { name: 'Adolfo Daniel VALLEJO', country: 'PAR' },
    player2: { name: 'Moise KOUAME', country: 'FRA', status: 'W' },
    nextMatchId: 'r3-m6',
  },
  {
    id: 'r2-m12', round: 2, position: 12,
    player1: { name: 'Alejandro TABILO', country: 'CHI' },
    player2: { name: 'Valentin VACHEROT', country: 'MON', seed: 16 },
    nextMatchId: 'r3-m6',
  },
  {
    id: 'r2-m13', round: 2, position: 13,
    player1: { name: 'Flavio COBOLLI', country: 'ITA', seed: 10 },
    player2: { name: 'Yibing WU', country: 'CHN' },
    nextMatchId: 'r3-m7',
  },
  {
    id: 'r2-m14', round: 2, position: 14,
    player1: { name: 'Facundo DIAZ ACOSTA', country: 'ARG', status: 'Q' },
    player2: { name: 'Learner TIEN', country: 'USA', seed: 18 },
    nextMatchId: 'r3-m7',
  },
  {
    id: 'r2-m15', round: 2, position: 15,
    player1: { name: 'Francisco CERUNDOLO', country: 'ARG', seed: 25 },
    player2: { name: 'Hugo GASTON', country: 'FRA', status: 'W' },
    nextMatchId: 'r3-m8',
  },
  {
    id: 'r2-m16', round: 2, position: 16,
    player1: { name: 'Zachary SVAJDA', country: 'USA' },
    player2: { name: 'Adam WALTON', country: 'AUS', status: 'W' },
    nextMatchId: 'r3-m8',
  },

  // ============================================================
  // BOTTOM HALF (positions 17-32)
  // ============================================================

  // --- Quarter 3: De Minaur section (17-24) ---
  {
    id: 'r2-m17', round: 2, position: 17,
    player1: { name: 'Alex DE MINAUR', country: 'AUS', seed: 8 },
    player2: { name: 'Alexander BLOCKX', country: 'BEL' },
    nextMatchId: 'r3-m9',
  },
  {
    id: 'r2-m18', round: 2, position: 18,
    player1: { name: 'Mariano NAVONE', country: 'ARG' },
    player2: { name: 'Jakub MENSIK', country: 'CZE', seed: 26 },
    nextMatchId: 'r3-m9',
  },
  {
    id: 'r2-m19', round: 2, position: 19,
    player1: { name: 'Nuno BORGES', country: 'POR' },
    player2: { name: 'Miomir KECMANOVIC', country: 'SRB' },
    nextMatchId: 'r3-m10',
  },
  {
    id: 'r2-m20', round: 2, position: 20,
    player1: { name: 'Camilo UGO CARABELLI', country: 'ARG' },
    player2: { name: 'Andrey RUBLEV', country: '---', seed: 11 },
    nextMatchId: 'r3-m10',
  },
  {
    id: 'r2-m21', round: 2, position: 21,
    player1: { name: 'Casper RUUD', country: 'NOR', seed: 15 },
    player2: { name: 'Hamad MEDJEDOVIC', country: 'SRB' },
    nextMatchId: 'r3-m11',
  },
  {
    id: 'r2-m22', round: 2, position: 22,
    player1: { name: 'Lorenzo SONEGO', country: 'ITA' },
    player2: { name: 'Tommy PAUL', country: 'USA', seed: 24 },
    nextMatchId: 'r3-m11',
  },
  {
    id: 'r2-m23', round: 2, position: 23,
    player1: { name: 'Joao FONSECA', country: 'BRA', seed: 28 },
    player2: { name: 'Dino PRIZMIC', country: 'CRO' },
    nextMatchId: 'r3-m12',
  },
  {
    id: 'r2-m24', round: 2, position: 24,
    player1: { name: 'Valentin ROYER', country: 'FRA' },
    player2: { name: 'Novak DJOKOVIC', country: 'SRB', seed: 3 },
    nextMatchId: 'r3-m12',
  },

  // --- Quarter 4: Zverev section (25-32) ---
  {
    id: 'r2-m25', round: 2, position: 25,
    player1: { name: 'Nishesh BASAVAREDDY', country: 'USA', status: 'W' },
    player2: { name: 'Alex MICHELSEN', country: 'USA' },
    nextMatchId: 'r3-m13',
  },
  {
    id: 'r2-m26', round: 2, position: 26,
    player1: { name: 'James DUCKWORTH', country: 'AUS' },
    player2: { name: 'Rafael JODAR', country: 'ESP', seed: 27 },
    nextMatchId: 'r3-m13',
  },
  {
    id: 'r2-m27', round: 2, position: 27,
    player1: { name: 'Alejandro DAVIDOVICH FOKINA', country: 'ESP', seed: 21 },
    player2: { name: 'Thiago Agustin TIRANTE', country: 'ARG' },
    nextMatchId: 'r3-m14',
  },
  {
    id: 'r2-m28', round: 2, position: 28,
    player1: { name: 'Thanasi KOKKINAKIS', country: 'AUS' },
    player2: { name: 'Pablo CARRENO BUSTA', country: 'ESP' },
    nextMatchId: 'r3-m14',
  },
  {
    id: 'r2-m29', round: 2, position: 29,
    player1: { name: 'Karen KHACHANOV', country: '---', seed: 13 },
    player2: { name: 'Marco TRUNGELLITI', country: 'ARG' },
    nextMatchId: 'r3-m15',
  },
  {
    id: 'r2-m30', round: 2, position: 30,
    player1: { name: 'Federico CINA', country: 'ITA', status: 'Q' },
    player2: { name: 'Jesper DE JONG', country: 'NED', status: 'L' },
    nextMatchId: 'r3-m15',
  },
  {
    id: 'r2-m31', round: 2, position: 31,
    player1: { name: 'Ugo HUMBERT', country: 'FRA', seed: 32 },
    player2: { name: 'Quentin HALYS', country: 'FRA' },
    nextMatchId: 'r3-m16',
  },
  {
    id: 'r2-m32', round: 2, position: 32,
    player1: { name: 'Tomas MACHAC', country: 'CZE' },
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
