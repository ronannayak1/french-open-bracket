import { Match, OfficialResult, ROUND_LABELS } from '../types';
import {
  parseSetScores,
  scorePartFromDisplayLine,
  describeSet,
} from '../scoreFormat';
import MatchMatchupHeader from './MatchMatchupHeader';

interface MatchScoreModalProps {
  match: Match;
  result: OfficialResult;
  onClose: () => void;
}

export default function MatchScoreModal({
  match,
  result,
  onClose,
}: MatchScoreModalProps) {
  const scorePart = scorePartFromDisplayLine(result.score || '');
  const sets = parseSetScores(scorePart);
  const loser =
    match.player1?.name === result.winnerName ? match.player2 : match.player1;

  return (
    <div
      className="score-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="score-modal-title"
      onClick={onClose}
    >
      <div className="score-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="score-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h3 id="score-modal-title" className="score-modal-title">
          {ROUND_LABELS[match.round]} — Match score
        </h3>
        <MatchMatchupHeader match={match} />
        <p className="score-modal-line">{result.score}</p>
        <div className="score-modal-players">
          <div>
            <span className="score-modal-label">Winner</span>
            <span className="score-modal-winner">{result.winnerName}</span>
          </div>
          {loser && (
            <div>
              <span className="score-modal-label">Opponent</span>
              <span>{loser.name}</span>
            </div>
          )}
        </div>
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
        <p className="score-modal-footnote">
          Scores are read from the winner&apos;s perspective — their games are listed first in each set (e.g. 6/7(3) is a tiebreak loss).
        </p>
      </div>
    </div>
  );
}
