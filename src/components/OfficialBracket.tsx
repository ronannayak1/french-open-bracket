import { useState, useEffect, useCallback, useMemo } from 'react';
import { OfficialResult, UserBracket } from '../types';
import { resolveBracket, cascadeClear } from '../bracketEngine';
import { saveOfficialResults, onOfficialChange, onBracketsChange } from '../firebase';
import { tournamentData } from '../data';
import Bracket from './Bracket';
import OfficialPdfUpload from './OfficialPdfUpload';
import MatchDetailModal from './MatchDetailModal';

export default function OfficialBracket() {
  const [officialResults, setOfficialResults] = useState<Record<string, OfficialResult>>({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [localPicks, setLocalPicks] = useState<Record<string, string>>({});
  const [detailMatchId, setDetailMatchId] = useState<string | null>(null);
  const [allBrackets, setAllBrackets] = useState<UserBracket[]>([]);

  useEffect(() => {
    const unsub = onBracketsChange(setAllBrackets);
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onOfficialChange((results) => {
      setOfficialResults(results);
      const picks: Record<string, string> = {};
      for (const [matchId, r] of Object.entries(results)) {
        picks[matchId] = r.winnerName;
      }
      setLocalPicks(picks);
    });
    return unsub;
  }, []);

  const handlePickWinner = useCallback(
    (matchId: string, playerName: string) => {
      if (!editing) return;
      setSaveSuccess(false);
      setImportMessage(null);
      setLocalPicks((prev) => {
        if (!playerName) {
          const next = { ...prev };
          delete next[matchId];
          return next;
        }
        let next = cascadeClear(prev, matchId, playerName);
        next = { ...next, [matchId]: playerName };
        return next;
      });
    },
    [editing]
  );

  const handleSave = useCallback(async () => {
    setSaveError(null);
    setSaveSuccess(false);
    setSaving(true);
    try {
      const results: Record<string, OfficialResult> = {};
      for (const [matchId, winnerName] of Object.entries(localPicks)) {
        if (!winnerName) continue;
        const prev = officialResults[matchId];
        results[matchId] = prev?.score
          ? { winnerName, score: prev.score }
          : { winnerName };
      }
      await saveOfficialResults(results);
      setEditing(false);
      setSaveSuccess(true);
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : 'Could not save official results.';
      setSaveError(
        `${msg} If this says Permission denied, add rules for usopen2026/official — see FIREBASE.md in the repo.`
      );
    } finally {
      setSaving(false);
    }
  }, [localPicks, officialResults]);

  const handleCancel = useCallback(() => {
    setSaveError(null);
    const picks: Record<string, string> = {};
    for (const [matchId, r] of Object.entries(officialResults)) {
      picks[matchId] = r.winnerName;
    }
    setLocalPicks(picks);
    setEditing(false);
  }, [officialResults]);

  const handlePdfApplied = useCallback(
    async (results: Record<string, OfficialResult>, report: string) => {
      const picks: Record<string, string> = {};
      for (const [matchId, r] of Object.entries(results)) {
        picks[matchId] = r.winnerName;
      }
      setLocalPicks(picks);
      setOfficialResults(results);
      setImportMessage(report);
      setSaveSuccess(false);
      setSaveError(null);
      setSaving(true);
      try {
        await saveOfficialResults(results);
        setSaveSuccess(true);
      } catch (e: unknown) {
        const msg =
          e instanceof Error ? e.message : 'Could not save imported results.';
        setSaveError(msg);
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const displayMatches = useMemo(() => {
    return resolveBracket(localPicks).map((m) => ({
      ...m,
      score: officialResults[m.id]?.score,
    }));
  }, [localPicks, officialResults]);

  const detailMatch = detailMatchId
    ? displayMatches.find((m) => m.id === detailMatchId) ??
      tournamentData.find((m) => m.id === detailMatchId)
    : null;
  const detailResult = detailMatchId ? officialResults[detailMatchId] : undefined;

  const decidedCount = Object.keys(localPicks).length;

  return (
    <div>
      <OfficialPdfUpload
        existingResults={officialResults}
        onApplied={handlePdfApplied}
        disabled={saving}
      />

      <div className="toolbar official-toolbar">
        <div className="toolbar-info">
          <span className="official-badge">Official Draw</span>
          <span className="toolbar-progress">
            {decidedCount} match{decidedCount !== 1 ? 'es' : ''} decided
          </span>
        </div>
        <div className="toolbar-actions">
          {!editing ? (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                setSaveError(null);
                setSaveSuccess(false);
                setEditing(true);
              }}
            >
              Edit Results
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Results'}
              </button>
            </>
          )}
        </div>
      </div>

      {importMessage && (
        <div className="official-success" role="status">
          {importMessage}
        </div>
      )}

      {saveSuccess && !editing && !importMessage && (
        <div className="official-success" role="status">
          Official results saved.
        </div>
      )}

      {saveError && (
        <div className="official-error" role="alert">
          {saveError}
        </div>
      )}

      {editing ? (
        <div className="official-hint">
          Click a player to set the winner. Upload the nightly PDF to import scores and results in bulk.
        </div>
      ) : (
        <div className="official-hint">
          Tap any match to see user picks and score details.
        </div>
      )}

      <Bracket
        matches={displayMatches}
        onPickWinner={handlePickWinner}
        readOnly={!editing}
        showScores
        onViewMatch={!editing ? setDetailMatchId : undefined}
      />

      {detailMatch && (
        <MatchDetailModal
          match={detailMatch}
          officialResult={detailResult}
          brackets={allBrackets}
          onClose={() => setDetailMatchId(null)}
        />
      )}
    </div>
  );
}
