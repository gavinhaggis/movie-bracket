export interface Film {
  id: string;
  tmdbId: number;
  title: string;
  year: string;
  posterPath: string | null;
  backdropPath: string | null;
  runtime: number | null;
  tagline: string | null;
  overview: string | null;
  voteAverage: number | null;
  genres: string[];
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
  currentMatchIndex: number;
  roundComplete: boolean;
  roundNumber: number;
  byeHistory: string[];
  winner?: Film | null;
}

export const emptyState = (apiKey: string): AppState => ({
  apiKey,
  phase: 'entry',
  films: [],
  currentRound: [],
  currentMatchIndex: 0,
  roundComplete: false,
  roundNumber: 1,
  byeHistory: [],
});
