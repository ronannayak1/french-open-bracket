import { Match, Player } from '../types';

interface MatchCardProps {
  match: Match;
  onPickWinner?: (matchId: string, playerName: string) => void;
  readOnly?: boolean;
  compact?: boolean;
  /** The official winner for this match, used to color-code user picks */
  officialWinner?: string;
  /** Show score below winner */
  showScore?: boolean;
}

function PlayerSlot({
  player,
  isWinner,
  canSelect,
  onSelect,
  verdict,
}: {
  player: Player | null;
  isWinner: boolean;
  canSelect: boolean;
  onSelect?: () => void;
  verdict?: 'correct' | 'incorrect' | 'official' | null;
}) {
  if (!player) {
    return (
      <div className="player-slot player-slot--empty">
        <span className="player-tbd">TBD</span>
      </div>
    );
  }

  const seedLabel = player.seed ? `[${player.seed}]` : '';
  const statusLabel = player.status ? `(${player.status})` : '';
  const tag = [seedLabel, statusLabel].filter(Boolean).join(' ');

  const verdictClass = verdict === 'correct'
    ? 'player-slot--correct'
    : verdict === 'incorrect'
      ? 'player-slot--incorrect'
      : verdict === 'official'
        ? 'player-slot--official'
        : '';

  return (
    <div
      className={`player-slot ${isWinner ? 'player-slot--winner' : ''} ${canSelect ? 'player-slot--selectable' : ''} ${verdictClass}`}
      onClick={canSelect ? onSelect : undefined}
      title={canSelect ? `Pick ${player.name}` : undefined}
    >
      <span className="player-tag">{tag}</span>
      <span className={`player-name ${isWinner ? 'player-name--bold' : ''}`}>
        {player.name}
      </span>
      <span className="player-country">{player.country}</span>
    </div>
  );
}

export default function MatchCard({
  match,
  onPickWinner,
  readOnly = false,
  compact = false,
  officialWinner,
  showScore = false,
}: MatchCardProps) {
  const canPick = !readOnly && !!onPickWinner;
  const p1CanSelect = canPick && !!match.player1;
  const p2CanSelect = canPick && !!match.player2;

  const p1IsWinner = !!match.winnerName && match.player1?.name === match.winnerName;
  const p2IsWinner = !!match.winnerName && match.player2?.name === match.winnerName;

  function getVerdict(player: Player | null, isPicked: boolean): 'correct' | 'incorrect' | 'official' | null {
    if (!officialWinner || !player) return null;
    if (isPicked && player.name === officialWinner) return 'correct';
    if (isPicked && player.name !== officialWinner) return 'incorrect';
    if (!isPicked && player.name === officialWinner) return 'official';
    return null;
  }

  return (
    <div className={`match-card ${compact ? 'match-card--compact' : ''}`}>
      <PlayerSlot
        player={match.player1}
        isWinner={p1IsWinner}
        canSelect={p1CanSelect}
        onSelect={() => onPickWinner?.(match.id, match.player1!.name)}
        verdict={getVerdict(match.player1, p1IsWinner)}
      />
      <div className="match-divider" />
      <PlayerSlot
        player={match.player2}
        isWinner={p2IsWinner}
        canSelect={p2CanSelect}
        onSelect={() => onPickWinner?.(match.id, match.player2!.name)}
        verdict={getVerdict(match.player2, p2IsWinner)}
      />
      {showScore && match.score && (
        <div className="match-score">{match.score}</div>
      )}
    </div>
  );
}
