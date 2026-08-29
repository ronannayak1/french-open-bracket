import { useEffect, useState } from 'react';
import {
  downloadChampionCard,
  renderChampionCardBlob,
  shareChampionCard,
} from '../exportChampionCard';
import { getPlayerHeadshot, getPlayerInitials } from '../playerHeadshots';

interface ChampionPreviewProps {
  winnerName: string;
  bracketName?: string;
}

export default function ChampionPreview({
  winnerName,
  bracketName,
}: ChampionPreviewProps) {
  const src = getPlayerHeadshot(winnerName);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [winnerName, src]);

  const showPlaceholder = !src || imageError;

  async function buildCard() {
    return renderChampionCardBlob({
      winnerName,
      headshotSrc: src,
      bracketName,
    });
  }

  async function handleDownload() {
    setBusy(true);
    setStatus(null);
    try {
      const blob = await buildCard();
      downloadChampionCard(blob, winnerName);
      setStatus('Image downloaded.');
    } catch (err) {
      console.error('Champion export failed', err);
      setStatus('Could not export image. Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleShare() {
    setBusy(true);
    setStatus(null);
    try {
      const blob = await buildCard();
      const result = await shareChampionCard(blob, winnerName);
      setStatus(
        result === 'shared'
          ? 'Shared successfully.'
          : 'Image downloaded (sharing not available on this device).'
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setStatus(null);
        return;
      }
      console.error('Champion share failed', err);
      setStatus('Could not share image. Try download instead.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="champion-preview">
      {showPlaceholder ? (
        <div className="champion-preview__placeholder" aria-hidden>
          <span className="champion-preview__initials">
            {getPlayerInitials(winnerName)}
          </span>
        </div>
      ) : (
        <img
          src={src}
          alt={winnerName}
          className="champion-preview__image"
          onError={() => setImageError(true)}
        />
      )}
      <p className="champion-preview__label">Your champion: {winnerName}</p>
      <div className="champion-preview__actions">
        <button
          type="button"
          className="btn btn--primary champion-preview__btn"
          onClick={handleShare}
          disabled={busy}
        >
          {busy ? 'Exporting…' : 'Share'}
        </button>
        <button
          type="button"
          className="btn btn--secondary champion-preview__btn"
          onClick={handleDownload}
          disabled={busy}
        >
          Download
        </button>
      </div>
      {status && <p className="champion-preview__status">{status}</p>}
    </div>
  );
}
