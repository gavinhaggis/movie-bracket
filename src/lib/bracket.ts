import type { Film, Match } from '../types';

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Builds the next round's matchups from a pool of films, handling byes for odd counts. */
export function buildRound(pool: Film[], byeHistory: string[]): { matches: Match[]; byeFilm: Film | null } {
  const shuffled = shuffle(pool);

  let byeFilm: Film | null = null;
  let contenders = shuffled;

  if (shuffled.length % 2 !== 0) {
    const noPriorBye = shuffled.filter((f) => !byeHistory.includes(f.id));
    const candidates = noPriorBye.length > 0 ? noPriorBye : shuffled;
    byeFilm = candidates[Math.floor(Math.random() * candidates.length)];
    contenders = shuffled.filter((f) => f.id !== byeFilm!.id);
  }

  const matches: Match[] = [];
  for (let i = 0; i < contenders.length; i += 2) {
    matches.push({ a: contenders[i], b: contenders[i + 1] });
  }

  return { matches, byeFilm };
}

/** Determines what phase the app should be in for a given surviving pool size. */
export function phaseForPoolSize(size: number): 'bracket' | 'elimination3' | 'final2' | 'winner' {
  if (size >= 4) return 'bracket';
  if (size === 3) return 'elimination3';
  if (size === 2) return 'final2';
  return 'winner';
}
