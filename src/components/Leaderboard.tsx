import { UserBracket, OfficialResult, ROUND_LABELS, ROUND_POINTS } from '../types';
import { calculateScore } from '../bracketEngine';
import { tournamentData } from '../data';

interface LeaderboardProps {
  brackets: UserBracket[];
  officialResults: Record<string, OfficialResult>;
  currentUserId: string;
}

export default function Leaderboard({
  brackets,
  officialResults,
  currentUserId,
}: LeaderboardProps) {
  const allUsers = brackets.filter((b) => b.submitted);
  const hasOfficial = Object.keys(officialResults).length > 0;

  const scored = allUsers
    .map((b) => ({
      bracket: b,
      score: calculateScore(b.picks, officialResults),
    }))
    .sort((a, b) => b.score.total - a.score.total);

  const rounds = [2, 3, 4, 5, 6, 7] as const;

  function roundBreakdown(
    picks: Record<string, string>,
    official: Record<string, OfficialResult>,
    round: number
  ) {
    let correct = 0;
    let total = 0;
    for (const m of tournamentData) {
      if (m.round !== round) continue;
      const off = official[m.id];
      if (!off) continue;
      total++;
      if (picks[m.id] === off.winnerName) correct++;
    }
    return { correct, total, points: correct * (ROUND_POINTS[round] ?? 0) };
  }

  const maxPoints = 1 * 32 + 2 * 16 + 4 * 8 + 8 * 4 + 16 * 2 + 32 * 1;

  if (allUsers.length === 0) {
    return (
      <div className="viewer-empty">
        <p>No brackets submitted yet.</p>
        <p className="viewer-empty-sub">
          The leaderboard will appear once users submit their brackets.
        </p>
      </div>
    );
  }

  return (
    <div className="lb-page">
      <div className="lb-page-header">
        <h2>Leaderboard</h2>
        <span className="lb-page-sub">Live scores &middot; Updates in real time</span>
      </div>

      {/* Main standings */}
      <div className="lb-standings">
        {scored.map((entry, i) => {
          const isMe = entry.bracket.userId === currentUserId;
          return (
            <div
              key={entry.bracket.userId}
              className={`lb-card ${isMe ? 'lb-card--me' : ''} ${i === 0 && hasOfficial ? 'lb-card--leader' : ''}`}
            >
              <div className="lb-card-rank">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </div>
              <div className="lb-card-main">
                <div className="lb-card-name">
                  {entry.bracket.displayName}
                  {isMe && <span className="lb-card-you">You</span>}
                </div>
                <div className="lb-card-stats">
                  {entry.score.correct}/{entry.score.decided} correct picks
                </div>
              </div>
              <div className="lb-card-points">
                <span className="lb-card-pts-num">{entry.score.total}</span>
                <span className="lb-card-pts-label">pts</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Per-round breakdown table */}
      {hasOfficial && (
        <div className="lb-breakdown">
          <h3 className="lb-breakdown-title">Round-by-Round Breakdown</h3>
          <div className="lb-table-scroll">
            <table className="lb-table">
              <thead>
                <tr>
                  <th className="lb-th-name">Player</th>
                  {rounds.map((r) => (
                    <th key={r} className="lb-th-round">
                      <div>{ROUND_LABELS[r]}</div>
                      <div className="lb-th-pts">{ROUND_POINTS[r]} pt{ROUND_POINTS[r] > 1 ? 's' : ''}/ea</div>
                    </th>
                  ))}
                  <th className="lb-th-total">Total</th>
                </tr>
              </thead>
              <tbody>
                {scored.map((entry) => (
                  <tr key={entry.bracket.userId}>
                    <td className="lb-td-name">
                      {entry.bracket.displayName}
                    </td>
                    {rounds.map((r) => {
                      const bd = roundBreakdown(entry.bracket.picks, officialResults, r);
                      return (
                        <td key={r} className="lb-td-round">
                          {bd.total > 0 ? (
                            <>
                              <span className="lb-td-correct">{bd.correct}/{bd.total}</span>
                              <span className="lb-td-rpts">{bd.points}</span>
                            </>
                          ) : (
                            <span className="lb-td-pending">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="lb-td-total">{entry.score.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="lb-max">Max possible: {maxPoints} pts</div>
        </div>
      )}
    </div>
  );
}
