import { useEffect, useRef } from 'react';
import { Match, OfficialResult, ROUND_LABELS, TOURNAMENT_ROUNDS } from '../types';
import MatchCard from './MatchCard';

interface BracketRoundFocusProps {
  round: number;
  matches: Match[];
  highlightMatchId: string | null;
  onRoundChange: (round: number) => void;
  onClose: () => void;
  onPickWinner?: (matchId: string, playerName: string) => void;
  readOnly?: boolean;
  officialResults?: Record<string, OfficialResult>;
  showScores?: boolean;
  eliminatedSlashKeys?: Set<string>;
  onViewScore?: (matchId: string) => void;
  onViewMatch?: (matchId: string) => void;
}

export default function BracketRoundFocus({
  round,
  matches,
  highlightMatchId,
  onRoundChange,
  onClose,
  onPickWinner,
  readOnly = false,
  officialResults,
  showScores = false,
  eliminatedSlashKeys,
  onViewScore,
  onViewMatch,
}: BracketRoundFocusProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const roundMatches = matches
    .filter((m) => m.round === round)
    .sort((a, b) => a.position - b.position);

  const roundIndex = TOURNAMENT_ROUNDS.indexOf(round as (typeof TOURNAMENT_ROUNDS)[number]);
  const hasPrev = roundIndex > 0;
  const hasNext = roundIndex < TOURNAMENT_ROUNDS.length - 1;

  useEffect(() => {
    if (!highlightMatchId || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-match-id="${highlightMatchId}"]`);
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [highlightMatchId, round]);

  return (
    <div
      className="bracket-round-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bracket-round-modal-title"
      onClick={onClose}
    >
      <div className="bracket-round-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="score-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="bracket-round-focus">
          <button
            type="button"
            className="bracket-round-nav bracket-round-nav--prev"
            disabled={!hasPrev}
            onClick={() => onRoundChange(TOURNAMENT_ROUNDS[roundIndex - 1])}
            aria-label="Previous round"
          >
            ‹
          </button>

          <div className="bracket-round-focus-main">
            <div className="bracket-round-focus-header">
              <h3 id="bracket-round-modal-title" className="bracket-round-focus-title">
                {ROUND_LABELS[round]}
              </h3>
              <span className="bracket-round-focus-count">
                {roundMatches.length} match{roundMatches.length !== 1 ? 'es' : ''}
              </span>
            </div>

            <div className="bracket-round-tabs" role="tablist" aria-label="Rounds">
              {TOURNAMENT_ROUNDS.map((r) => (
                <button
                  key={r}
                  type="button"
                  role="tab"
                  aria-selected={r === round}
                  className={`bracket-round-tab ${r === round ? 'bracket-round-tab--active' : ''}`}
                  onClick={() => onRoundChange(r)}
                >
                  {ROUND_LABELS[r]}
                </button>
              ))}
            </div>

            <div className="bracket-round-matches-scroll" ref={listRef}>
              {roundMatches.map((match) => (
                <div
                  key={match.id}
                  data-match-id={match.id}
                  className={`bracket-round-match-row ${match.id === highlightMatchId ? 'bracket-round-match-row--highlight' : ''}`}
                >
                  <span className="bracket-round-match-num">#{match.position}</span>
                  <MatchCard
                    match={match}
                    onPickWinner={onPickWinner}
                    readOnly={readOnly}
                    officialWinner={officialResults?.[match.id]?.winnerName}
                    showScore={showScores}
                    eliminatedSlashKeys={eliminatedSlashKeys}
                    onViewScore={onViewScore}
                    onViewMatch={onViewMatch}
                    highlighted={match.id === highlightMatchId}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="bracket-round-nav bracket-round-nav--next"
            disabled={!hasNext}
            onClick={() => onRoundChange(TOURNAMENT_ROUNDS[roundIndex + 1])}
            aria-label="Next round"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
