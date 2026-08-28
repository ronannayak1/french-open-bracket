import { Match } from '../types';
import { usOpenMatchUrl } from '../usOpenUrl';

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
      <a
        href={usOpenMatchUrl(match)}
        target="_blank"
        rel="noopener noreferrer"
        className="match-detail-official-link"
      >
        Official Stats
      </a>
    </div>
  );
}
