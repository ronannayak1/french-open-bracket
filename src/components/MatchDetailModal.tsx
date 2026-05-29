import { Match, OfficialResult, UserBracket, ROUND_LABELS } from '../types';
import {
  parseSetScores,
  scorePartFromDisplayLine,
  describeSet,
} from '../scoreFormat';

interface MatchDetailModalProps {
  match: Match;
  officialResult?: OfficialResult;
  brackets: UserBracket[];
  onClose: () => void;
}

function pickInMatch(match: Match, pick: string): boolean {
  return pick === match.player1?.name || pick === match.player2?.name;
}

export default function MatchDetailModal({
  match,
  officialResult,
  brackets,
  onClose,
}: MatchDetailModalProps) {
  const submitted = brackets.filter((b) => b.submitted);
  const scorePart = officialResult?.score
    ? scorePartFromDisplayLine(officialResult.score)
    : '';
  const sets = scorePart ? parseSetScores(scorePart) : [];
  const officialWinner = officialResult?.winnerName;

  return (
    <div
      className="score-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-detail-title"
      onClick={onClose}
    >
      <div className="score-modal match-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="score-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h3 id="match-detail-title" className="score-modal-title">
          {ROUND_LABELS[match.round]} — Match details
        </h3>

        <div className="match-detail-matchup">
          <span>{match.player1?.name ?? 'TBD'}</span>
          <span className="match-detail-vs">vs</span>
          <span>{match.player2?.name ?? 'TBD'}</span>
        </div>

        {officialResult?.score && (
          <>
            <p className="score-modal-line">{officialResult.score}</p>
            {officialWinner && (
              <div className="score-modal-players">
                <div>
                  <span className="score-modal-label">Official winner</span>
                  <span className="score-modal-winner">{officialWinner}</span>
                </div>
              </div>
            )}
            {/^\s*WO\s*$/i.test(scorePart) ? (
              <p className="score-modal-note">Match won by walkover.</p>
            ) : sets.length > 0 ? (
              <ul className="score-modal-sets">
                {sets.map((set, i) => (
                  <li key={i}>{describeSet(set, i)}</li>
                ))}
              </ul>
            ) : (
              <p className="score-modal-note">Score not parsed.</p>
            )}
            {sets.length > 0 && (
              <p className="score-modal-footnote">
                Scores are read from the winner&apos;s perspective — their games are listed first in each set (e.g. 6/7(3) is a tiebreak loss).
              </p>
            )}
          </>
        )}

        {officialWinner && !officialResult?.score && (
          <div className="score-modal-players">
            <div>
              <span className="score-modal-label">Official winner</span>
              <span className="score-modal-winner">{officialWinner}</span>
            </div>
          </div>
        )}

        <div className="match-detail-picks">
          <h4 className="match-detail-picks-title">User picks</h4>
          {submitted.length === 0 ? (
            <p className="score-modal-note">No brackets submitted yet.</p>
          ) : (
            <ul className="match-detail-picks-list">
              {submitted.map((bracket) => {
                const pick = bracket.picks[match.id];
                const inMatch = pick ? pickInMatch(match, pick) : false;
                const verdict =
                  officialWinner && pick
                    ? pick === officialWinner
                      ? 'correct'
                      : 'incorrect'
                    : null;

                return (
                  <li
                    key={bracket.userId}
                    className={`match-detail-pick-row ${verdict ? `match-detail-pick-row--${verdict}` : ''}`}
                  >
                    <span className="match-detail-pick-name">{bracket.displayName}</span>
                    <span className="match-detail-pick-player">
                      {pick ?? '—'}
                      {pick && !inMatch && (
                        <span className="match-detail-pick-note"> (not in match)</span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
