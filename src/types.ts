export interface Film {
  id: string;
  tmdbId: number;
  title: string;
  year: string;
  posterPath: string | null;
  runtime: number | null;
}

export interface Match {
  a: Film;
  b: Film | null; // null means `a` has a bye
  winnerId?: string;
}

export type Phase = 'setup' | 'entry' | 'bracket' | 'elimination3' | 'final2' | 'winner';

export interface AppState {
  apiKey: string;
  phase: Phase;
  films: Film[];
  currentRound: Match[];
  currentByeFilm?: Film | null;
  roundNumber: number;
  byeHistory: string[];
  eliminationPick?: string | null;
  finalPick?: string | null;
  winner?: Film | null;
}

export const emptyState = (apiKey: string): AppState => ({
  apiKey,
  phase: 'entry',
  films: [],
  currentRound: [],
  roundNumber: 1,
  byeHistory: [],
});
