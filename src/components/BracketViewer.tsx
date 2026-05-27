import { useState } from 'react';
import { UserBracket, OfficialResult, ROUND_POINTS } from '../types';
import { resolveBracket, calculateScore } from '../bracketEngine';
import Bracket from './Bracket';

interface BracketViewerProps {
  brackets: UserBracket[];
  currentUserId: string;
  officialResults: Record<string, OfficialResult>;
}

export default function BracketViewer({
  brackets,
  currentUserId,
  officialResults,
}: BracketViewerProps) {
  const submittedBrackets = brackets.filter((b) => b.submitted);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const hasOfficialResults = Object.keys(officialResults).length > 0;

  const scored = submittedBrackets
    .map((b) => ({
      bracket: b,
      score: calculateScore(b.picks, officialResults),
    }))
    .sort((a, b) => b.score.total - a.score.total);

  if (submittedBrackets.length === 0) {
    return (
      <div className="viewer-empty">
        <p>No brackets have been submitted yet.</p>
        <p className="viewer-empty-sub">
          Once someone submits their bracket, it will appear here.
        </p>
      </div>
    );
  }

  const activeEntry =
    scored.find((e) => e.bracket.userId === (viewingId || scored[0].bracket.userId)) ||
    scored[0];
  const activeBracket = activeEntry.bracket;
  const resolvedMatches = resolveBracket(activeBracket.picks);

  const maxPoints =
    1 * 32 + 2 * 16 + 4 * 8 + 8 * 4 + 16 * 2 + 32 * 1;

  return (
    <div className="viewer-container">
      {/* Leaderboard */}
      {hasOfficialResults && (
        <div className="leaderboard">
          <h3 className="leaderboard-title">Leaderboard</h3>
          <div className="leaderboard-header">
            <span className="lb-rank">#</span>
            <span className="lb-name">Name</span>
            <span className="lb-correct">Correct</span>
            <span className="lb-pts">Points</span>
          </div>
          {scored.map((entry, i) => (
            <div
              key={entry.bracket.userId}
              className={`leaderboard-row ${entry.bracket.userId === (viewingId || scored[0].bracket.userId) ? 'leaderboard-row--active' : ''}`}
              onClick={() => setViewingId(entry.bracket.userId)}
            >
              <span className="lb-rank">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
              </span>
              <span className="lb-name">
                {entry.bracket.displayName}
                {entry.bracket.userId === currentUserId && (
                  <span className="lb-you"> (You)</span>
                )}
              </span>
              <span className="lb-correct">
                {entry.score.correct}/{entry.score.decided}
              </span>
              <span className="lb-pts">{entry.score.total}</span>
            </div>
          ))}
          <div className="leaderboard-footer">
            Max possible: {maxPoints} pts
            <span className="lb-legend">
              Scoring: {Object.entries(ROUND_POINTS).map(([r, p]) => `R${r}=${p}`).join(', ')}
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="viewer-tabs">
        {scored.map(({ bracket }) => (
          <button
            key={bracket.userId}
            className={`viewer-tab ${(viewingId || scored[0].bracket.userId) === bracket.userId ? 'viewer-tab--active' : ''}`}
            onClick={() => setViewingId(bracket.userId)}
          >
            {bracket.displayName}
            {bracket.userId === currentUserId && (
              <span className="viewer-tab-you"> (You)</span>
            )}
          </button>
        ))}
      </div>

      <div className="viewer-header">
        <h3>{activeBracket.displayName}'s Bracket</h3>
        <div className="viewer-meta">
          {hasOfficialResults && (
            <span className="viewer-score">
              {activeEntry.score.total} pts &middot; {activeEntry.score.correct}/{activeEntry.score.decided} correct
            </span>
          )}
          {activeBracket.submittedAt && (
            <span className="viewer-timestamp">
              Submitted {new Date(activeBracket.submittedAt).toLocaleString()}
            </span>
          )}
        </div>
      </div>
      <Bracket
        matches={resolvedMatches}
        readOnly
        userPicks={activeBracket.picks}
        officialResults={officialResults}
      />
    </div>
  );
}
