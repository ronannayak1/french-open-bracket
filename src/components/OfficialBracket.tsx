import { useState, useEffect, useCallback } from 'react';
import { OfficialResult } from '../types';
import { resolveBracket, cascadeClear } from '../bracketEngine';
import { saveOfficialResults, onOfficialChange } from '../firebase';
import Bracket from './Bracket';

export default function OfficialBracket() {
  const [officialResults, setOfficialResults] = useState<Record<string, OfficialResult>>({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [localPicks, setLocalPicks] = useState<Record<string, string>>({});

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
        `${msg} If this says Permission denied, add rules for frenchOpen2026/official — see FIREBASE.md in the repo.`
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

  const resolvedMatches = resolveBracket(localPicks);
  const decidedCount = Object.keys(localPicks).length;

  return (
    <div>
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

      {saveSuccess && !editing && (
        <div className="official-success" role="status">
          Official results saved.
        </div>
      )}

      {saveError && (
        <div className="official-error" role="alert">
          {saveError}
        </div>
      )}

      {editing && (
        <div className="official-hint">
          Click a player's name to record them as the match winner. Changes cascade forward through the bracket.
        </div>
      )}

      <Bracket
        matches={resolvedMatches}
        onPickWinner={handlePickWinner}
        readOnly={!editing}
        showScores
      />
    </div>
  );
}
