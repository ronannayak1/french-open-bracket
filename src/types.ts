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
  1: '1st Round',
  2: '2nd Round',
  3: '3rd Round',
  4: '4th Round',
  5: 'Quarterfinals',
  6: 'Semifinals',
  7: 'Final',
};

/** Points double each round: R1=1, R2=2, R3=4, R4=8, QF=16, SF=32, F=64 */
export const ROUND_POINTS: Record<number, number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 8,
  5: 16,
  6: 32,
  7: 64,
};

export interface UserAccount {
  id: string;
  defaultName: string;
  password: string;
}

export const USER_ACCOUNTS: UserAccount[] = [
  { id: 'R', defaultName: 'R', password: 'wimbledon1' },
  { id: 'S', defaultName: 'S', password: 'wimbledon2' },
  { id: 'M', defaultName: 'M', password: 'wimbledon3' },
  { id: 'T', defaultName: 'T', password: 'wimbledon4' },
  { id: 'M2', defaultName: 'M2', password: 'wimbledon5' },
];
