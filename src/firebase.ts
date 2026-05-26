import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
} from 'firebase/database';
import { UserBracket, OfficialResult } from './types';

const firebaseConfig = {
  apiKey: 'AIzaSyCGDOKVi5-dlS_VClMEyKpl7_AQLrF3qr4',
  authDomain: 'aopool.firebaseapp.com',
  databaseURL: 'https://aopool-default-rtdb.firebaseio.com',
  projectId: 'aopool',
  storageBucket: 'aopool.firebasestorage.app',
  messagingSenderId: '1047771739023',
  appId: '1:1047771739023:web:603e3ced5b2932e49851fa',
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const BRACKET_PATH = 'frenchOpen2026/brackets';
const OFFICIAL_PATH = 'frenchOpen2026/official';

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

export async function saveOfficialResults(
  results: Record<string, OfficialResult>
): Promise<void> {
  await set(ref(db, OFFICIAL_PATH), results);
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
    callback(snapshot.exists() ? snapshot.val() : {});
  });
  return unsub;
}
