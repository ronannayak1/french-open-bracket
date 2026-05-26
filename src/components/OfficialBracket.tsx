import { useState, useEffect, useCallback } from 'react';
import { OfficialResult } from '../types';
import { resolveBracket, cascadeClear } from '../bracketEngine';
import { saveOfficialResults, onOfficialChange } from '../firebase';
import Bracket from './Bracket';

export default function OfficialBracket() {
  const [officialResults, setOfficialResults] = useState<Record<string, OfficialResult>>({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
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
      setLocalPicks((prev) => {
        let next = cascadeClear(prev, matchId, playerName);
        next = { ...next, [matchId]: playerName };
        return next;
      });
    },
    [editing]
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const results: Record<string, OfficialResult> = {};
      for (const [matchId, winnerName] of Object.entries(localPicks)) {
        results[matchId] = {
          winnerName,
          score: officialResults[matchId]?.score,
        };
      }
      await saveOfficialResults(results);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }, [localPicks, officialResults]);

  const handleCancel = useCallback(() => {
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
              className="btn btn--primary"
              onClick={() => setEditing(true)}
            >
              Edit Results
            </button>
          ) : (
            <>
              <button
                className="btn btn--secondary"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
              <button
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
