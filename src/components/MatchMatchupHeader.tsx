import { Match } from '../types';

interface MatchMatchupHeaderProps {
  match: Match;
}

export default function MatchMatchupHeader({ match }: MatchMatchupHeaderProps) {
  return (
    <div className="match-detail-matchup">
      <div className="match-detail-matchup-players">
        <span>{match.player1?.name ?? 'TBD'}</span>
        <span className="match-detail-vs">vs</span>
        <span>{match.player2?.name ?? 'TBD'}</span>
      </div>
    </div>
  );
}
