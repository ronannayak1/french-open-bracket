import { useState, useEffect, useCallback } from 'react';
import { UserBracket, OfficialResult, USER_ACCOUNTS } from './types';
import { resolveBracket, cascadeClear, clearDownstreamPicks, getTotalPicksNeeded, calculateScore } from './bracketEngine';
import BracketPointsBanner from './components/BracketPointsBanner';
import { saveBracket, loadBracket, onBracketsChange, onOfficialChange, updateDisplayName } from './firebase';
import Login from './components/Login';
import Bracket from './components/Bracket';
import BracketViewer from './components/BracketViewer';
import OfficialBracket from './components/OfficialBracket';
import Leaderboard from './components/Leaderboard';
import Countdown, { isLocked } from './components/Countdown';
import NavTabs from './components/NavTabs';
import BrandLogo from './components/BrandLogo';
import MatchDetailModal from './components/MatchDetailModal';
import { tournamentData } from './data';

type Page = 'bracket' | 'view' | 'official' | 'leaderboard';

export default function App() {
  const [userId, setUserId] = useState<string | null>(() =>
    localStorage.getItem('wimbledon_user')
  );
  const [displayName, setDisplayName] = useState<string>('');
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [allBrackets, setAllBrackets] = useState<UserBracket[]>([]);
  const [officialResults, setOfficialResults] = useState<Record<string, OfficialResult>>({});
  const [page, setPage] = useState<Page>('bracket');
  const [saving, setSaving] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [locked, setLocked] = useState(isLocked());
  const [detailMatchId, setDetailMatchId] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setLocked(isLocked()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const unsub = onBracketsChange(setAllBrackets);
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onOfficialChange(setOfficialResults);
    return unsub;
  }, []);

  useEffect(() => {
    if (!userId) return;
    loadBracket(userId).then((bracket) => {
      if (bracket) {
        setPicks(bracket.picks);
        setSubmitted(bracket.submitted);
        setDisplayName(bracket.displayName || userId);
      } else {
        const acct = USER_ACCOUNTS.find((a) => a.id === userId);
        const defaultName = acct?.defaultName || userId;
        setPicks({});
        setSubmitted(false);
        setDisplayName(defaultName);
      }
    });
  }, [userId]);

  const bracketReadOnly = submitted || locked;

  const canEditBracket = !submitted && !locked;

  const handleLogin = useCallback((id: string) => {
    setUserId(id);
    localStorage.setItem('wimbledon_user', id);
  }, []);

  const handleLogout = useCallback(() => {
    setUserId(null);
    setDisplayName('');
    setPicks({});
    setSubmitted(false);
    localStorage.removeItem('wimbledon_user');
  }, []);

  const handlePickWinner = useCallback(
    (matchId: string, playerName: string) => {
      if (bracketReadOnly) return;
      setPicks((prev) => {
        if (!playerName) {
          const oldWinner = prev[matchId];
          const next = { ...prev };
          delete next[matchId];
          if (oldWinner) {
            clearDownstreamPicks(next, matchId, oldWinner);
          }
          return next;
        }
        let next = cascadeClear(prev, matchId, playerName);
        next = { ...next, [matchId]: playerName };
        return next;
      });
    },
    [bracketReadOnly]
  );

  const handleSave = useCallback(async () => {
    if (!userId || !canEditBracket) return;
    setSaving(true);
    try {
      await saveBracket({ userId, displayName, picks, submitted: false });
    } finally {
      setSaving(false);
    }
  }, [userId, displayName, picks, canEditBracket]);

  const handleSubmit = useCallback(async () => {
    if (!userId || !canEditBracket) return;
    const totalNeeded = getTotalPicksNeeded();
    const totalPicked = Object.keys(picks).length;
    if (totalPicked < totalNeeded) {
      const remaining = totalNeeded - totalPicked;
      if (!window.confirm(`You still have ${remaining} match(es) to pick. Submit anyway?`)) {
        return;
      }
    }
    setSaving(true);
    try {
      await saveBracket({
        userId,
        displayName,
        picks,
        submitted: true,
        submittedAt: Date.now(),
      });
      setSubmitted(true);
    } finally {
      setSaving(false);
    }
  }, [userId, displayName, picks, canEditBracket]);

  const handleReset = useCallback(async () => {
    if (!userId || submitted) return;
    if (!window.confirm('Clear all your picks and start over?')) return;
    setPicks({});
    setSubmitted(false);
    setSaving(true);
    try {
      await saveBracket({ userId, displayName, picks: {}, submitted: false });
    } finally {
      setSaving(false);
    }
  }, [userId, displayName, submitted]);

  const handleSaveName = useCallback(async () => {
    if (!userId || !nameInput.trim()) return;
    const newName = nameInput.trim();
    setDisplayName(newName);
    setEditingName(false);
    await updateDisplayName(userId, newName);
  }, [userId, nameInput]);

  if (!userId) {
    return <Login onLogin={handleLogin} />;
  }

  const resolvedMatches = resolveBracket(picks);
  const totalPicked = Object.keys(picks).length;
  const totalNeeded = getTotalPicksNeeded();
  const submittedCount = allBrackets.filter((b) => b.submitted).length;
  const myScore = calculateScore(picks, officialResults);
  const detailMatch = detailMatchId
    ? resolvedMatches.find((m) => m.id === detailMatchId) ??
      tournamentData.find((m) => m.id === detailMatchId)
    : null;
  const detailResult = detailMatchId ? officialResults[detailMatchId] : undefined;

  return (
    <div className="app">
      <nav className="app-nav">
        <div className="nav-inner">
          <div className="nav-brand">
            <BrandLogo height={40} className="nav-brand-logo" />
            <div className="nav-brand-text">
              <h1>
                <span className="nav-brand-rg">US OPEN</span>{' '}
                <span className="nav-brand-accent">2026</span>
              </h1>
              <div className="nav-brand-sub">
                <span className="status-dot" />
                Bracket Challenge
              </div>
            </div>
          </div>

          <Countdown />

          <NavTabs
            page={page}
            onNavigate={setPage}
            submittedCount={submittedCount}
            variant="header"
          />

          <div className="nav-user">
            {editingName ? (
              <div className="nav-name-edit">
                <input
                  className="nav-name-input"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') setEditingName(false);
                  }}
                  autoFocus
                  maxLength={20}
                  placeholder="Enter bracket name"
                />
                <button className="nav-name-save" onClick={handleSaveName}>Save</button>
                <button className="nav-name-cancel" onClick={() => setEditingName(false)}>Cancel</button>
              </div>
            ) : (
              <>
                <span className="nav-user-name-display">{displayName}</span>
                <button
                  className="nav-rename-btn"
                  onClick={() => {
                    setNameInput(displayName);
                    setEditingName(true);
                  }}
                >
                  Rename
                </button>
              </>
            )}
            <button className="nav-logout" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <nav className="nav-bottom-bar" aria-label="Mobile navigation">
        <NavTabs
          page={page}
          onNavigate={setPage}
          submittedCount={submittedCount}
          variant="bottom"
        />
      </nav>

      {page === 'bracket' && (
        <main className="main-content">
          <div className="toolbar">
            <div className="toolbar-info">
              <span className="toolbar-progress">
                {totalPicked} / {totalNeeded} picks made
              </span>
              {myScore.decided > 0 && (
                <span className="toolbar-score">
                  {myScore.total} pts ({myScore.correct}/{myScore.decided} correct)
                </span>
              )}
              {submitted && (
                <span className="toolbar-submitted">Submitted</span>
              )}
              {locked && !submitted && (
                <span className="toolbar-locked">Locked</span>
              )}
            </div>
            <div className="toolbar-actions">
              <button
                className="btn btn--secondary"
                onClick={handleSave}
                disabled={saving || !canEditBracket}
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                className="btn btn--primary"
                onClick={handleSubmit}
                disabled={saving || !canEditBracket}
              >
                {submitted ? 'Submitted' : locked ? 'Locked' : 'Submit Bracket'}
              </button>
              <button
                className="btn btn--danger"
                onClick={handleReset}
                disabled={saving || submitted}
              >
                Reset
              </button>
            </div>
          </div>

          <BracketPointsBanner
            picks={picks}
            officialResults={officialResults}
            resolvedMatches={resolvedMatches}
            currentPoints={myScore.decided > 0 ? myScore.total : undefined}
          />

          {canEditBracket && (
            <div className="official-hint">
              Pick winners from the Round of 64 onward. Submit when finished — your bracket locks after submission and cannot be edited.
            </div>
          )}

          {submitted && (
            <div className="official-hint">
              Tap any match to see picks, scores, and official stats.
            </div>
          )}

          <Bracket
            matches={resolvedMatches}
            onPickWinner={handlePickWinner}
            readOnly={bracketReadOnly}
            userPicks={picks}
            officialResults={officialResults}
            showScores={bracketReadOnly}
            onViewMatch={bracketReadOnly ? setDetailMatchId : undefined}
          />

          {detailMatch && (
            <MatchDetailModal
              match={detailMatch}
              officialResult={detailResult}
              brackets={allBrackets}
              onClose={() => setDetailMatchId(null)}
            />
          )}
        </main>
      )}

      {page === 'leaderboard' && (
        <main className="main-content">
          <Leaderboard
            brackets={allBrackets}
            officialResults={officialResults}
            currentUserId={userId}
          />
        </main>
      )}

      {page === 'official' && (
        <main className="main-content">
          <OfficialBracket />
        </main>
      )}

      {page === 'view' && (
        <main className="main-content">
          <BracketViewer
            brackets={allBrackets}
            currentUserId={userId}
            officialResults={officialResults}
          />
        </main>
      )}
    </div>
  );
}
