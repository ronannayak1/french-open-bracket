import { useState, useEffect, useMemo, useCallback } from 'react';
import { Match, ROUND_LABELS, OfficialResult } from '../types';
import { getMatchesByRound, getEliminatedSlashKeys } from '../bracketEngine';
import {
  getBracketHeights,
  getBracketTotalHeight,
  getColumnHeight,
  getFinalTop,
  getMatchTop,
  getBlockSize,
  getSemiTop,
} from '../bracketLayout';
import MatchCard from './MatchCard';
import BracketRoundFocus from './BracketRoundFocus';

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
  onViewScore?: (matchId: string) => void;
  onViewMatch?: (matchId: string) => void;
}

function RoundColumn({
  matches,
  round,
  readOnly,
  side,
  officialResults,
  showScores,
  compact,
  eliminatedSlashKeys,
  onMatchFocus,
}: {
  matches: Match[];
  round: number;
  readOnly: boolean;
  side: 'left' | 'right';
  officialResults?: Record<string, OfficialResult>;
  showScores?: boolean;
  compact: boolean;
  eliminatedSlashKeys?: Set<string>;
  onMatchFocus?: (match: Match) => void;
}) {
  const { cardHeight, slotHeight } = getBracketHeights(compact, !!showScores);
  const columnHeight = getColumnHeight(matches.length, round, slotHeight);
  const blockSize = getBlockSize(round, slotHeight);

  return (
    <div className="round-column" data-side={side}>
      <div className="round-label">{ROUND_LABELS[round]}</div>
      <div
        className="round-matches round-matches--positioned"
        style={{ height: columnHeight }}
      >
        {matches.map((match, i) => (
          <div
            key={match.id}
            className="round-match-cell"
            style={{ top: getMatchTop(i, round, slotHeight, cardHeight) }}
          >
            <MatchCard
              match={match}
              readOnly={readOnly}
              compact
              overviewMode
              officialWinner={officialResults?.[match.id]?.winnerName}
              showScore={showScores}
              eliminatedSlashKeys={eliminatedSlashKeys}
              onMatchFocus={onMatchFocus}
            />
            {round >= 1 && round <= 6 && (
              <Connector
                side={side}
                halfSpan={blockSize / 2}
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
  halfSpan,
  isEven,
  hasNext,
}: {
  side: 'left' | 'right';
  halfSpan: number;
  isEven: boolean;
  hasNext: boolean;
}) {
  if (!hasNext) return null;

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
          height: `${halfSpan}px`,
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
  onViewScore,
  onViewMatch,
}: BracketProps) {
  const compactLayout = useCompactBracket();
  const { cardHeight, slotHeight } = getBracketHeights(compactLayout, showScores);
  const totalHeight = getBracketTotalHeight(slotHeight);
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

  const r1 = splitByHalf(1, 32);
  const r2 = splitByHalf(2, 16);
  const r3 = splitByHalf(3, 8);
  const r4 = splitByHalf(4, 4);
  const qf = splitByHalf(5, 2);
  const semis = byRound.get(6) || [];
  const final = byRound.get(7) || [];

  const leftRounds = [
    { round: 1, matches: r1.top },
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
    { round: 1, matches: r1.bottom },
  ];

  const [focusRound, setFocusRound] = useState<number | null>(null);
  const [highlightMatchId, setHighlightMatchId] = useState<string | null>(null);

  const handleMatchFocus = useCallback((match: Match) => {
    setFocusRound(match.round);
    setHighlightMatchId(match.id);
  }, []);

  const closeFocus = useCallback(() => {
    setFocusRound(null);
    setHighlightMatchId(null);
  }, []);

  return (
    <div className="bracket-scroll-wrap bracket-scroll-wrap--edge-to-edge">
      <p className="bracket-overview-hint">
        Full bracket — tap any match to open that round and make picks.
      </p>
      <div className="bracket-overview-viewport">
        <div className="bracket-sponsor" aria-label="Sponsored by Bain & Company">
          <span className="bracket-sponsor-label">Made possible by</span>
          <img
            src={`${import.meta.env.BASE_URL}bain-logo.png`}
            alt="Bain & Company"
            className="bracket-sponsor-logo"
            width={320}
            height={32}
            decoding="async"
          />
        </div>
        <div className="bracket-grid bracket-grid--overview" style={{ minHeight: totalHeight }}>
          {leftRounds.map(({ round, matches: roundMatches }) => (
            <RoundColumn
              key={`left-${round}`}
              matches={roundMatches}
              round={round}
              readOnly={readOnly}
              side="left"
              officialResults={officialResults}
              showScores={showScores}
              compact={compactLayout}
              eliminatedSlashKeys={eliminatedSlashKeys}
              onMatchFocus={handleMatchFocus}
            />
          ))}

          <div className="round-column round-column--center round-column--semi round-column--semi-left">
            <div className="round-label">{ROUND_LABELS[6]}</div>
            <div
              className="round-matches round-matches--positioned round-matches--center-cluster"
              style={{ height: totalHeight }}
            >
              {semis
                .filter((m) => m.position === 1)
                .map((match) => (
                  <div
                    key={match.id}
                    className="round-match-cell"
                    style={{ top: getSemiTop(1, slotHeight, cardHeight) }}
                  >
                    <MatchCard
                      match={match}
                      readOnly={readOnly}
                      compact
                      overviewMode
                      officialWinner={officialResults?.[match.id]?.winnerName}
                      showScore={showScores}
                      eliminatedSlashKeys={eliminatedSlashKeys}
                      onMatchFocus={handleMatchFocus}
                    />
                  </div>
                ))}
            </div>
          </div>

          <div className="round-column round-column--center round-column--final">
            <div className="round-label round-label--final">{ROUND_LABELS[7]}</div>
            <div
              className="round-matches round-matches--positioned round-matches--center-cluster"
              style={{ height: totalHeight }}
            >
              {final.map((match) => (
                <div
                  key={match.id}
                  className="final-wrapper final-wrapper--aligned round-match-cell"
                  style={{ top: getFinalTop(slotHeight, cardHeight) }}
                >
                  <div className="trophy trophy--floated">🏆</div>
                  <MatchCard
                    match={match}
                    readOnly={readOnly}
                    compact
                    overviewMode
                    officialWinner={officialResults?.[match.id]?.winnerName}
                    showScore={showScores}
                    eliminatedSlashKeys={eliminatedSlashKeys}
                    onMatchFocus={handleMatchFocus}
                  />
                  {match.winnerName && (
                    <div className="champion-label champion-label--floated">
                      CHAMPION: {match.winnerName}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="round-column round-column--center round-column--semi round-column--semi-right">
            <div className="round-label">{ROUND_LABELS[6]}</div>
            <div
              className="round-matches round-matches--positioned round-matches--center-cluster"
              style={{ height: totalHeight }}
            >
              {semis
                .filter((m) => m.position === 2)
                .map((match) => (
                  <div
                    key={match.id}
                    className="round-match-cell"
                    style={{ top: getSemiTop(2, slotHeight, cardHeight) }}
                  >
                    <MatchCard
                      match={match}
                      readOnly={readOnly}
                      compact
                      overviewMode
                      officialWinner={officialResults?.[match.id]?.winnerName}
                      showScore={showScores}
                      eliminatedSlashKeys={eliminatedSlashKeys}
                      onMatchFocus={handleMatchFocus}
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
              readOnly={readOnly}
              side="right"
              officialResults={officialResults}
              showScores={showScores}
              compact={compactLayout}
              eliminatedSlashKeys={eliminatedSlashKeys}
              onMatchFocus={handleMatchFocus}
            />
          ))}
        </div>
      </div>

      {focusRound !== null && (
        <BracketRoundFocus
          round={focusRound}
          matches={matches}
          highlightMatchId={highlightMatchId}
          onRoundChange={(round) => {
            setFocusRound(round);
            setHighlightMatchId(null);
          }}
          onClose={closeFocus}
          onPickWinner={onPickWinner}
          readOnly={readOnly}
          officialResults={officialResults}
          showScores={showScores}
          eliminatedSlashKeys={eliminatedSlashKeys}
          onViewScore={onViewScore}
          onViewMatch={readOnly ? onViewMatch : undefined}
        />
      )}
    </div>
  );
}
