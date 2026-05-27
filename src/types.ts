export interface Player {
  name: string;
  country: string;
  seed?: number;
  status?: 'Q' | 'W' | 'L';
}

export interface Match {
  id: string;
  round: number;
  position: number;
  player1: Player | null;
  player2: Player | null;
  winnerName?: string;
  score?: string;
  nextMatchId?: string;
}

export interface UserBracket {
  userId: string;
  displayName: string;
  picks: Record<string, string>;
  submitted: boolean;
  submittedAt?: number;
}

export interface OfficialResult {
  winnerName: string;
  score?: string;
}

export type Section = 'top' | 'bottom';

export const ROUND_LABELS: Record<number, string> = {
  2: '2nd Round',
  3: '3rd Round',
  4: '4th Round',
  5: 'Quarterfinals',
  6: 'Semifinals',
  7: 'Final',
};

/** Points double each round: R2=1, R3=2, R4=4, QF=8, SF=16, F=32 */
export const ROUND_POINTS: Record<number, number> = {
  2: 1,
  3: 2,
  4: 4,
  5: 8,
  6: 16,
  7: 32,
};

export interface UserAccount {
  id: string;
  defaultName: string;
  password: string;
}

export const USER_ACCOUNTS: UserAccount[] = [
  { id: 'R', defaultName: 'R', password: 'roland1' },
  { id: 'S', defaultName: 'S', password: 'roland2' },
  { id: 'M', defaultName: 'M', password: 'roland3' },
  { id: 'T', defaultName: 'T', password: 'roland4' },
  { id: 'M2', defaultName: 'M2', password: 'roland5' },
];
