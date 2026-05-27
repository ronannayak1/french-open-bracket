import { useMemo } from 'react';
import { Match, OfficialResult } from '../types';
import {
  calculateMaxPointsPossible,
  calculateEliminatedPointsLost,
  getTournamentMaxPoints,
} from '../bracketEngine';

interface BracketPointsBannerProps {
  picks: Record<string, string>;
  officialResults: Record<string, OfficialResult>;
  resolvedMatches: Match[];
  currentPoints?: number;
}

export default function BracketPointsBanner({
  picks,
  officialResults,
  resolvedMatches,
  currentPoints,
}: BracketPointsBannerProps) {
  const tournamentMax = getTournamentMaxPoints();
  const { maxPossible, eliminatedLost } = useMemo(() => {
    const maxPossible = calculateMaxPointsPossible(
      picks,
      officialResults,
      resolvedMatches
    );
    const eliminatedLost = calculateEliminatedPointsLost(
      picks,
      officialResults,
      resolvedMatches
    );
    return { maxPossible, eliminatedLost };
  }, [picks, officialResults, resolvedMatches]);

  const hasOfficial = Object.keys(officialResults).length > 0;

  return (
    <div className="bracket-points-banner">
      <div className="bracket-points-banner-main">
        <span className="bracket-points-banner-label">Max Points Possible</span>
        <span className="bracket-points-banner-value">
          {maxPossible}
          <span className="bracket-points-banner-of"> / {tournamentMax}</span>
        </span>
      </div>
      <div className="bracket-points-banner-meta">
        {currentPoints !== undefined && hasOfficial && (
          <span className="bracket-points-banner-current">
            Current: {currentPoints} pts
          </span>
        )}
        {eliminatedLost > 0 && (
          <span className="bracket-points-banner-lost">
            {eliminatedLost} pts lost to eliminated picks
          </span>
        )}
      </div>
    </div>
  );
}
