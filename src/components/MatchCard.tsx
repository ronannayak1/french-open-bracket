import { Match, Player } from '../types';
import type { MouseEvent } from 'react';
import { eliminatedSlashKey } from '../bracketEngine';

interface MatchCardProps {
  match: Match;
  onPickWinner?: (matchId: string, playerName: string) => void;
  readOnly?: boolean;
  compact?: boolean;
  officialWinner?: string;
  showScore?: boolean;
  eliminatedSlashKeys?: Set<string>;
  onViewScore?: (matchId: string) => void;
  onViewMatch?: (matchId: string) => void;
  /** Click match card to zoom into round view (overview mode). */
  onMatchFocus?: (match: Match) => void;
  highlighted?: boolean;
}

function PlayerSlot({
  player,
  isWinner,
  canSelect,
  onSelect,
  verdict,
  showEliminatedSlash,
}: {
  player: Player | null;
  isWinner: boolean;
  canSelect: boolean;
  onSelect?: () => void;
  verdict?: 'correct' | 'incorrect' | 'official' | null;
  showEliminatedSlash?: boolean;
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

  const handleClick = (e: MouseEvent) => {
    if (!canSelect) return;
    e.stopPropagation();
    onSelect?.();
  };

  return (
    <div
      className={`player-slot ${isWinner ? 'player-slot--winner' : ''} ${canSelect ? 'player-slot--selectable' : ''} ${verdictClass}`}
      onClick={handleClick}
      title={player.name}
    >
      <span className="player-tag">{tag}</span>
      <span
        className={`player-name-wrap ${showEliminatedSlash ? 'player-name-wrap--struck' : ''}`}
      >
        <span className={`player-name ${isWinner ? 'player-name--bold' : ''}`}>
          {player.name}
        </span>
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
  eliminatedSlashKeys,
  onViewScore,
  onViewMatch,
  onMatchFocus,
  highlighted = false,
}: MatchCardProps) {
  const canPick = !readOnly && !!onPickWinner;
  const inRoundFocus = readOnly && !!onViewMatch && !onMatchFocus;
  const canViewMatch = inRoundFocus;
  const canViewScore = inRoundFocus && !!match.score && !!onViewScore && !onViewMatch;
  const canFocus = !!onMatchFocus;
  const p1CanSelect = canPick && !!match.player1;
  const p2CanSelect = canPick && !!match.player2;

  const p1IsWinner = !!match.winnerName && match.player1?.name === match.winnerName;
  const p2IsWinner = !!match.winnerName && match.player2?.name === match.winnerName;

  function isStruck(player: Player | null): boolean {
    if (!player || !eliminatedSlashKeys) return false;
    return eliminatedSlashKeys.has(eliminatedSlashKey(match.id, player.name));
  }

  function getVerdict(player: Player | null, isPicked: boolean): 'correct' | 'incorrect' | 'official' | null {
    if (!officialWinner || !player) return null;
    if (isPicked && player.name === officialWinner) return 'correct';
    if (isPicked && player.name !== officialWinner) return 'incorrect';
    if (!isPicked && player.name === officialWinner) return 'official';
    return null;
  }

  function handleCardClick() {
    if (canViewMatch) {
      onViewMatch!(match.id);
    } else if (canViewScore) {
      onViewScore!(match.id);
    } else if (canFocus) {
      onMatchFocus!(match);
    }
  }

  return (
    <div
      className={`match-card ${compact ? 'match-card--compact' : ''} ${canViewMatch || canViewScore ? 'match-card--view-score' : ''} ${canFocus ? 'match-card--focusable' : ''} ${highlighted ? 'match-card--highlighted' : ''}`}
      onClick={canViewMatch || canViewScore || canFocus ? handleCardClick : undefined}
      title={
        canViewMatch
          ? 'View match details'
          : canViewScore
            ? 'View match score'
            : canFocus
              ? 'Zoom into this round'
              : undefined
      }
    >
      <PlayerSlot
        player={match.player1}
        isWinner={p1IsWinner}
        canSelect={p1CanSelect}
        onSelect={() => onPickWinner?.(match.id, p1IsWinner ? '' : match.player1!.name)}
        verdict={getVerdict(match.player1, p1IsWinner)}
        showEliminatedSlash={isStruck(match.player1)}
      />
      <div className="match-divider" />
      <PlayerSlot
        player={match.player2}
        isWinner={p2IsWinner}
        canSelect={p2CanSelect}
        onSelect={() => onPickWinner?.(match.id, p2IsWinner ? '' : match.player2!.name)}
        verdict={getVerdict(match.player2, p2IsWinner)}
        showEliminatedSlash={isStruck(match.player2)}
      />
      {showScore && match.score && (
        <div className="match-score">
          {match.score}
          {(canViewMatch || canViewScore) && (
            <span className="match-score-hint"> Tap for details</span>
          )}
        </div>
      )}
      {!match.score && canViewMatch && (
        <div className="match-score match-score--hint-only">
          <span className="match-score-hint">Tap for details</span>
        </div>
      )}
      {canFocus && !canPick && (
        <div className="match-score match-score--hint-only">
          <span className="match-score-hint">Tap to zoom in</span>
        </div>
      )}
    </div>
  );
}
