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

type ActionStatus = { type: 'success' | 'error'; message: string };

export default function App() {
  const [userId, setUserId] = useState<string | null>(() =>
    localStorage.getItem('wimbledon_user')
  );
  const [displayName, setDisplayName] = useState<string>('');
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<number | undefined>();
  const [bracketLoaded, setBracketLoaded] = useState(false);
  const [actionStatus, setActionStatus] = useState<ActionStatus | null>(null);
  const [allBrackets, setAllBrackets] = useState<UserBracket[]>([]);
  const [officialResults, setOfficialResults] = useState<Record<string, OfficialResult>>({});
  const [page, setPage] = useState<Page>('bracket');
  const [viewingBracketUserId, setViewingBracketUserId] = useState<string | null>(null);
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
    if (!actionStatus) return;
    const id = setTimeout(() => setActionStatus(null), 4000);
    return () => clearTimeout(id);
  }, [actionStatus]);

  useEffect(() => {
    if (!userId) {
      setBracketLoaded(false);
      return;
    }
    setBracketLoaded(false);
    loadBracket(userId).then((bracket) => {
      if (bracket) {
        setPicks(bracket.picks);
        setSubmitted(bracket.submitted);
        setSubmittedAt(bracket.submittedAt);
        setDisplayName(bracket.displayName || userId);
      } else {
        const acct = USER_ACCOUNTS.find((a) => a.id === userId);
        const defaultName = acct?.defaultName || userId;
        setPicks({});
        setSubmitted(false);
        setSubmittedAt(undefined);
        setDisplayName(defaultName);
      }
    }).catch((err) => {
      console.error('Failed to load bracket', err);
      setActionStatus({
        type: 'error',
        message: 'Could not load your bracket from Firebase. Refresh and try again.',
      });
    }).finally(() => {
      setBracketLoaded(true);
    });
  }, [userId]);

  const bracketReadOnly = submitted || locked;

  const canEditBracket = !submitted && !locked;
  const canUnsubmit = submitted && !locked;

  const handleLogin = useCallback((id: string) => {
    setUserId(id);
    localStorage.setItem('wimbledon_user', id);
  }, []);

  const handleLogout = useCallback(() => {
    setUserId(null);
    setDisplayName('');
    setPicks({});
    setSubmitted(false);
    setSubmittedAt(undefined);
    setBracketLoaded(false);
    setActionStatus(null);
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
    if (!userId || !canEditBracket || !bracketLoaded || saving) return;
    setSaving(true);
    setActionStatus(null);
    try {
      await saveBracket({ userId, displayName, picks, submitted: false });
      setSubmitted(false);
      setSubmittedAt(undefined);
      setActionStatus({ type: 'success', message: 'Draft saved to Firebase.' });
    } catch (err) {
      console.error('Failed to save draft', err);
      setActionStatus({
        type: 'error',
        message: 'Could not save draft. Check your connection and try again.',
      });
    } finally {
      setSaving(false);
    }
  }, [userId, displayName, picks, canEditBracket, bracketLoaded, saving]);

  const handleSubmit = useCallback(async () => {
    if (!userId || !canEditBracket || !bracketLoaded || saving) return;
    const totalNeeded = getTotalPicksNeeded();
    const totalPicked = Object.keys(picks).length;
    if (totalPicked < totalNeeded) {
      const remaining = totalNeeded - totalPicked;
      if (!window.confirm(`You still have ${remaining} match(es) to pick. Submit anyway?`)) {
        return;
      }
    }
    setSaving(true);
    setActionStatus(null);
    try {
      const now = Date.now();
      await saveBracket({
        userId,
        displayName,
        picks,
        submitted: true,
        submittedAt: now,
      });
      setSubmitted(true);
      setSubmittedAt(now);
      setActionStatus({ type: 'success', message: 'Bracket submitted and saved to Firebase.' });
    } catch (err) {
      console.error('Failed to submit bracket', err);
      setActionStatus({
        type: 'error',
        message: 'Could not submit bracket. Check your connection and try again.',
      });
    } finally {
      setSaving(false);
    }
  }, [userId, displayName, picks, canEditBracket, bracketLoaded, saving]);

  const handleUnsubmit = useCallback(async () => {
    if (!userId || !canUnsubmit || !bracketLoaded || saving) return;
    if (
      !window.confirm(
        'Unsubmit your bracket? You can edit picks and submit again before the deadline.'
      )
    ) {
      return;
    }
    setSaving(true);
    setActionStatus(null);
    try {
      await saveBracket({ userId, displayName, picks, submitted: false });
      setSubmitted(false);
      setSubmittedAt(undefined);
      setActionStatus({
        type: 'success',
        message: 'Bracket unsubmitted — you can edit and submit again.',
      });
    } catch (err) {
      console.error('Failed to unsubmit bracket', err);
      setActionStatus({
        type: 'error',
        message: 'Could not unsubmit bracket. Check your connection and try again.',
      });
    } finally {
      setSaving(false);
    }
  }, [userId, displayName, picks, canUnsubmit, bracketLoaded, saving]);

  const handleReset = useCallback(async () => {
    if (!userId || submitted || locked || saving || !bracketLoaded) return;
    if (!window.confirm('Clear all your picks and start over?')) return;
    setSaving(true);
    setActionStatus(null);
    try {
      setPicks({});
      setSubmitted(false);
      setSubmittedAt(undefined);
      await saveBracket({ userId, displayName, picks: {}, submitted: false });
      setActionStatus({ type: 'success', message: 'Bracket reset and saved.' });
    } catch (err) {
      console.error('Failed to reset bracket', err);
      setActionStatus({
        type: 'error',
        message: 'Could not reset bracket. Try again.',
      });
    } finally {
      setSaving(false);
    }
  }, [userId, displayName, submitted, locked, saving, bracketLoaded]);

  const handleSaveName = useCallback(async () => {
    if (!userId || !nameInput.trim() || saving) return;
    const newName = nameInput.trim();
    setSaving(true);
    setActionStatus(null);
    try {
      await updateDisplayName(userId, newName, { picks, submitted, submittedAt });
      setDisplayName(newName);
      setEditingName(false);
      setActionStatus({ type: 'success', message: 'Bracket name saved.' });
    } catch (err) {
      console.error('Failed to save bracket name', err);
      setActionStatus({
        type: 'error',
        message: 'Could not save name. Check your connection and try again.',
      });
    } finally {
      setSaving(false);
    }
  }, [userId, nameInput, picks, submitted, submittedAt, saving]);

  const handleViewBracket = useCallback((bracketUserId: string) => {
    setViewingBracketUserId(bracketUserId);
    setPage('view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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
            <div className="nav-bracket-identity">
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
                  <button className="nav-name-save" onClick={handleSaveName} disabled={saving || !nameInput.trim()}>
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button className="nav-name-cancel" onClick={() => setEditingName(false)}>Cancel</button>
                </div>
              ) : (
                <>
                  <span className="nav-bracket-name" title={displayName}>{displayName}</span>
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
            </div>
          </div>

          <NavTabs
            page={page}
            onNavigate={setPage}
            submittedCount={submittedCount}
            variant="header"
          />

          <div className="nav-right">
            <Countdown />

            <div className="nav-user">
              <button className="nav-logout" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {actionStatus && (
        <div
          className={`action-status action-status--${actionStatus.type}`}
          role="status"
        >
          {actionStatus.message}
        </div>
      )}

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
                disabled={saving || !canEditBracket || !bracketLoaded}
              >
                {saving ? 'Saving...' : !bracketLoaded ? 'Loading...' : 'Save Draft'}
              </button>
              <button
                className="btn btn--primary"
                onClick={canUnsubmit ? handleUnsubmit : handleSubmit}
                disabled={saving || locked || (!canEditBracket && !canUnsubmit) || !bracketLoaded}
              >
                {saving
                  ? 'Saving...'
                  : !bracketLoaded
                    ? 'Loading...'
                    : canUnsubmit
                      ? 'Unsubmit & Edit'
                      : locked
                        ? 'Locked'
                        : 'Submit Bracket'}
              </button>
              <button
                className="btn btn--danger"
                onClick={handleReset}
                disabled={saving || submitted || locked}
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
              Brackets are open for picks and submission. Submit before the deadline — you can unsubmit and edit again until picks lock.
            </div>
          )}

          {canUnsubmit && (
            <div className="official-hint">
              Your bracket is submitted. Tap &ldquo;Unsubmit &amp; Edit&rdquo; to change picks before the deadline.
            </div>
          )}

          {locked && !submitted && (
            <div className="official-hint official-hint--locked">
              The submission deadline has passed. Brackets are locked and can no longer be edited.
            </div>
          )}

          {submitted && locked && (
            <div className="official-hint">
              Tap any match to see picks and scores.
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
            bracketName={displayName}
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
            onViewBracket={handleViewBracket}
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
            initialViewingUserId={viewingBracketUserId}
          />
        </main>
      )}
    </div>
  );
}
