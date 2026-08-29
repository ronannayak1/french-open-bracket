import { getPlayerHeadshot } from '../playerHeadshots';

interface ChampionPreviewProps {
  winnerName: string;
}

export default function ChampionPreview({ winnerName }: ChampionPreviewProps) {
  const src = getPlayerHeadshot(winnerName);
  if (!src) return null;

  return (
    <div className="champion-preview">
      <img
        src={src}
        alt={winnerName}
        className="champion-preview__image"
      />
      <p className="champion-preview__label">Your champion: {winnerName}</p>
    </div>
  );
}
