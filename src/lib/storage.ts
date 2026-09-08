import type { AppState, TournamentHistoryEntry } from '../types';

// Bumped whenever AppState's shape changes, so a stale/older shape saved
// under the old key is never loaded into new code (that mismatch used to
// crash the app on refresh instead of falling back gracefully).
const KEY = 'movie-bracket-state-v2';
const HISTORY_KEY = 'movie-bracket-history-v1';
const MAX_HISTORY = 30;

const PHASES = ['setup', 'entry', 'bracket', 'elimination3', 'final2', 'winner'];

function isFilm(x: unknown): boolean {
  if (!x || typeof x !== 'object') return false;
  const f = x as Record<string, unknown>;
  return typeof f.id === 'string' && typeof f.title === 'string' && Array.isArray(f.genres);
}

function isMatch(x: unknown): boolean {
  if (!x || typeof x !== 'object') return false;
  const m = x as Record<string, unknown>;
  return isFilm(m.a) && (m.b === null || isFilm(m.b));
}

/** Guards against loading a stale/corrupt shape that would otherwise crash the app on render. */
export function isValidAppState(x: unknown): x is AppState {
  if (!x || typeof x !== 'object') return false;
  const s = x as Record<string, unknown>;
  if (typeof s.apiKey !== 'string') return false;
  if (typeof s.phase !== 'string' || !PHASES.includes(s.phase)) return false;
  if (!Array.isArray(s.films) || !s.films.every(isFilm)) return false;
  if (!Array.isArray(s.currentRound) || !s.currentRound.every(isMatch)) return false;
  if (typeof s.currentMatchIndex !== 'number') return false;
  if (typeof s.roundComplete !== 'boolean') return false;
  if (typeof s.roundNumber !== 'number') return false;
  if (!Array.isArray(s.byeHistory)) return false;
  if (!Array.isArray(s.eliminations)) return false;

  if (s.phase === 'bracket') {
    if (!s.roundComplete && (s.currentMatchIndex as number) >= (s.currentRound as unknown[]).length) return false;
  }
  if (s.phase === 'final2' && (s.films as unknown[]).length !== 2) return false;
  if (s.phase === 'elimination3' && (s.films as unknown[]).length !== 3) return false;
  if (s.phase === 'winner' && !isFilm(s.winner)) return false;

  return true;
}

export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isValidAppState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Best-effort recovery of just the API key from a corrupt/stale save, so the user isn't forced to re-enter it. */
export function tryRecoverApiKey(): string | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed.apiKey === 'string' && parsed.apiKey ? parsed.apiKey : null;
  } catch {
    return null;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage unavailable, ignore
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function loadHistory(): TournamentHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendHistoryEntry(entry: TournamentHistoryEntry): void {
  try {
    const existing = loadHistory();
    const next = [entry, ...existing].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // storage unavailable, ignore
  }
}

/** Used when "Back" undoes a just-crowned winner, so history reflects the final pick, not a misclick. */
export function removeHistoryEntry(id: string): void {
  try {
    const existing = loadHistory();
    localStorage.setItem(HISTORY_KEY, JSON.stringify(existing.filter((e) => e.id !== id)));
  } catch {
    // storage unavailable, ignore
  }
}
