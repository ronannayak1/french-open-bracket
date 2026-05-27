import { useState, useEffect, useMemo } from 'react';
import { Match, ROUND_LABELS, OfficialResult } from '../types';
import { getMatchesByRound, getEliminatedSlashKeys } from '../bracketEngine';
import MatchCard from './MatchCard';

function useCompactBracket() {
  const [compact, setCompact] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return compact;
}

interface BracketProps {
  matches: Match[];
  onPickWinner?: (matchId: string, playerName: string) => void;
  readOnly?: boolean;
  officialResults?: Record<string, OfficialResult>;
  /** User picks — required with officialResults to show elimination slashes. */
  userPicks?: Record<string, string>;
  showScores?: boolean;
}

function RoundColumn({
  matches,
  round,
  onPickWinner,
  readOnly,
  side,
  officialResults,
  showScores,
  compact,
  eliminatedSlashKeys,
}: {
  matches: Match[];
  round: number;
  onPickWinner?: (matchId: string, playerName: string) => void;
  readOnly: boolean;
  side: 'left' | 'right';
  officialResults?: Record<string, OfficialResult>;
  showScores?: boolean;
  compact: boolean;
  eliminatedSlashKeys?: Set<string>;
}) {
  const baseUnit = compact ? 36 : 60;
  const roundIndex = round - 2;
  const spacing = baseUnit * Math.pow(2, roundIndex);

  return (
    <div className="round-column" data-side={side}>
      <div className="round-label">{ROUND_LABELS[round]}</div>
      <div
        className="round-matches"
        style={{
          gap: `${spacing - baseUnit}px`,
          paddingTop: `${(spacing - baseUnit) / 2}px`,
        }}
      >
        {matches.map((match, i) => (
          <div key={match.id} className="round-match-cell">
            <MatchCard
              match={match}
              onPickWinner={onPickWinner}
              readOnly={readOnly}
              compact={round >= 3}
              officialWinner={officialResults?.[match.id]?.winnerName}
              showScore={showScores}
              eliminatedSlashKeys={eliminatedSlashKeys}
            />
            {round >= 2 && round <= 6 && (
              <Connector
                side={side}
                spacing={spacing}
                isEven={i % 2 === 0}
                hasNext={!!match.nextMatchId}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Connector({
  side,
  spacing,
  isEven,
  hasNext,
}: {
  side: 'left' | 'right';
  spacing: number;
  isEven: boolean;
  hasNext: boolean;
}) {
  if (!hasNext) return null;

  const halfHeight = spacing / 2;
  const lineX = side === 'left' ? 'right' : 'left';

  return (
    <div
      className={`bracket-connector bracket-connector--${side}`}
      style={{ [lineX]: '-16px' }}
    >
      <div
        className="connector-h"
        style={{ width: '16px', top: '50%', [lineX]: 0 }}
      />
      <div
        className="connector-v"
        style={{
          [lineX]: 0,
          height: `${halfHeight}px`,
          top: isEven ? '50%' : undefined,
          bottom: isEven ? undefined : '50%',
        }}
      />
    </div>
  );
}

export default function Bracket({
  matches,
  onPickWinner,
  readOnly = false,
  officialResults,
  userPicks,
  showScores = false,
}: BracketProps) {
  const compactLayout = useCompactBracket();
  const eliminatedSlashKeys = useMemo(() => {
    if (!userPicks || !officialResults || Object.keys(officialResults).length === 0) {
      return undefined;
    }
    return getEliminatedSlashKeys(userPicks, officialResults, matches);
  }, [userPicks, officialResults, matches]);

  const byRound = getMatchesByRound(matches);

  const splitByHalf = (round: number, splitAt: number) => {
    const all = byRound.get(round) || [];
    return {
      top: all.filter((m) => m.position <= splitAt),
      bottom: all.filter((m) => m.position > splitAt),
    };
  };

  const r2 = splitByHalf(2, 16);
  const r3 = splitByHalf(3, 8);
  const r4 = splitByHalf(4, 4);
  const qf = splitByHalf(5, 2);
  const semis = byRound.get(6) || [];
  const final = byRound.get(7) || [];

  const leftRounds = [
    { round: 2, matches: r2.top },
    { round: 3, matches: r3.top },
    { round: 4, matches: r4.top },
    { round: 5, matches: qf.top },
  ];

  const rightRounds = [
    { round: 5, matches: qf.bottom },
    { round: 4, matches: r4.bottom },
    { round: 3, matches: r3.bottom },
    { round: 2, matches: r2.bottom },
  ];

  return (
    <div className="bracket-scroll-wrap">
      <p className="bracket-scroll-hint" aria-hidden="true">
        Swipe sideways to explore the full bracket
      </p>
      <div className="bracket-scroll">
        <div className="bracket-grid">
        {leftRounds.map(({ round, matches: roundMatches }) => (
          <RoundColumn
            key={`left-${round}`}
            matches={roundMatches}
            round={round}
            onPickWinner={onPickWinner}
            readOnly={readOnly}
            side="left"
            officialResults={officialResults}
            showScores={showScores}
            compact={compactLayout}
            eliminatedSlashKeys={eliminatedSlashKeys}
          />
        ))}

        <div className="round-column round-column--center">
          <div className="round-label">{ROUND_LABELS[6]}</div>
          <div className="center-stack">
            {semis
              .filter((m) => m.position === 1)
              .map((match) => (
                <div key={match.id} className="round-match-cell">
                  <MatchCard
                    match={match}
                    onPickWinner={onPickWinner}
                    readOnly={readOnly}
                    officialWinner={officialResults?.[match.id]?.winnerName}
                    showScore={showScores}
                    eliminatedSlashKeys={eliminatedSlashKeys}
                  />
                </div>
              ))}
          </div>
        </div>

        <div className="round-column round-column--center round-column--final">
          <div className="round-label round-label--final">{ROUND_LABELS[7]}</div>
          <div className="center-stack">
            {final.map((match) => (
              <div key={match.id} className="final-wrapper">
                <div className="trophy">🏆</div>
                <MatchCard
                  match={match}
                  onPickWinner={onPickWinner}
                  readOnly={readOnly}
                  officialWinner={officialResults?.[match.id]?.winnerName}
                  showScore={showScores}
                  eliminatedSlashKeys={eliminatedSlashKeys}
                />
                {match.winnerName && (
                  <div className="champion-label">
                    CHAMPION: {match.winnerName}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="round-column round-column--center">
          <div className="round-label">{ROUND_LABELS[6]}</div>
          <div className="center-stack">
            {semis
              .filter((m) => m.position === 2)
              .map((match) => (
                <div key={match.id} className="round-match-cell">
                  <MatchCard
                    match={match}
                    onPickWinner={onPickWinner}
                    readOnly={readOnly}
                    officialWinner={officialResults?.[match.id]?.winnerName}
                    showScore={showScores}
                    eliminatedSlashKeys={eliminatedSlashKeys}
                  />
                </div>
              ))}
          </div>
        </div>

        {rightRounds.map(({ round, matches: roundMatches }) => (
          <RoundColumn
            key={`right-${round}`}
            matches={roundMatches}
            round={round}
            onPickWinner={onPickWinner}
            readOnly={readOnly}
            side="right"
            officialResults={officialResults}
            showScores={showScores}
            compact={compactLayout}
            eliminatedSlashKeys={eliminatedSlashKeys}
          />
        ))}
        </div>
      </div>
    </div>
  );
}
