import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
} from 'firebase/database';
import { UserBracket, OfficialResult } from './types';
import { filterOfficialResultsToValidWinners } from './bracketEngine';

const firebaseConfig = {
  apiKey: 'AIzaSyAmGflQbDLB_li65J6KYRisp7JjfsB2hiI',
  authDomain: 'aopool-2a0a5.firebaseapp.com',
  databaseURL: 'https://aopool-2a0a5-default-rtdb.firebaseio.com',
  projectId: 'aopool-2a0a5',
  storageBucket: 'aopool-2a0a5.firebasestorage.app',
  messagingSenderId: '800811470720',
  appId: '1:800811470720:web:a9508613badf930abf3b65',
  measurementId: 'G-CHVR3CBJ0V',
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

void isSupported().then((supported) => {
  if (supported) getAnalytics(app);
});

const BRACKET_PATH = 'wimbledon2026/brackets';
const OFFICIAL_PATH = 'wimbledon2026/official';

// --- User brackets ---

export async function saveBracket(bracket: UserBracket): Promise<void> {
  await set(ref(db, `${BRACKET_PATH}/${bracket.userId}`), {
    displayName: bracket.displayName,
    picks: bracket.picks,
    submitted: bracket.submitted,
    submittedAt: bracket.submittedAt ?? null,
  });
}

export async function loadBracket(
  userId: string
): Promise<UserBracket | null> {
  const snapshot = await get(ref(db, `${BRACKET_PATH}/${userId}`));
  if (!snapshot.exists()) return null;
  const data = snapshot.val();
  return {
    userId,
    displayName: data.displayName || userId,
    picks: data.picks || {},
    submitted: data.submitted || false,
    submittedAt: data.submittedAt || undefined,
  };
}

export function onBracketsChange(
  callback: (brackets: UserBracket[]) => void
): () => void {
  const unsub = onValue(ref(db, BRACKET_PATH), (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const data = snapshot.val();
    const brackets = Object.entries(data).map(
      ([userId, val]: [string, any]) => ({
        userId,
        displayName: val.displayName || userId,
        picks: val.picks || {},
        submitted: val.submitted || false,
        submittedAt: val.submittedAt || undefined,
      })
    );
    callback(brackets);
  });
  return unsub;
}

export async function updateDisplayName(
  userId: string,
  displayName: string
): Promise<void> {
  await set(ref(db, `${BRACKET_PATH}/${userId}/displayName`), displayName);
}

// --- Official bracket results ---

/** Firebase RTDB rejects undefined property values (e.g. optional score). */
function sanitizeOfficialResults(
  results: Record<string, OfficialResult>
): Record<string, OfficialResult> {
  const clean: Record<string, OfficialResult> = {};
  for (const [matchId, r] of Object.entries(results)) {
    if (!r?.winnerName) continue;
    const entry: OfficialResult = { winnerName: r.winnerName };
    if (r.score != null && r.score !== '') {
      entry.score = r.score;
    }
    clean[matchId] = entry;
  }
  return filterOfficialResultsToValidWinners(clean);
}

export async function saveOfficialResults(
  results: Record<string, OfficialResult>
): Promise<void> {
  await set(ref(db, OFFICIAL_PATH), sanitizeOfficialResults(results));
}

export async function loadOfficialResults(): Promise<Record<string, OfficialResult>> {
  const snapshot = await get(ref(db, OFFICIAL_PATH));
  if (!snapshot.exists()) return {};
  return snapshot.val();
}

export function onOfficialChange(
  callback: (results: Record<string, OfficialResult>) => void
): () => void {
  const unsub = onValue(ref(db, OFFICIAL_PATH), (snapshot) => {
    callback(sanitizeOfficialResults(snapshot.exists() ? snapshot.val() : {}));
  });
  return unsub;
}
