import { useEffect, useState } from 'react';
import './index.css';
import { ApiKeySetup } from './components/ApiKeySetup';
import { EntryPhase } from './components/EntryPhase';
import { BracketView } from './components/BracketView';
import { EliminationRound } from './components/EliminationRound';
import { FinalRound } from './components/FinalRound';
import { WinnerScreen } from './components/WinnerScreen';
import { buildRound, phaseForPoolSize } from './lib/bracket';
import { loadState, saveState, clearState } from './lib/storage';
import { emptyState, type AppState, type Film } from './types';

export default function App() {
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    const loaded = loadState();
    setState(loaded ?? { ...emptyState(''), phase: 'setup' });
  }, []);

  useEffect(() => {
    if (state) saveState(state);
  }, [state]);

  if (!state) return null;

  function update(patch: Partial<AppState>) {
    setState((s) => (s ? { ...s, ...patch } : s));
  }

  if (state.phase === 'setup') {
    return <ApiKeySetup onSubmit={(apiKey) => update({ apiKey, phase: 'entry' })} />;
  }

  if (state.phase === 'entry') {
    return (
      <EntryPhase
        apiKey={state.apiKey}
        films={state.films}
        onAdd={(film: Film) => update({ films: [...state.films, film] })}
        onRemove={(id) => update({ films: state.films.filter((f) => f.id !== id) })}
        onStart={() => {
          const pool = state.films;
          const phase = phaseForPoolSize(pool.length);
          if (phase === 'bracket') {
            const { matches, byeFilm } = buildRound(pool, []);
            update({
              phase: 'bracket',
              currentRound: matches,
              roundNumber: 1,
              byeHistory: byeFilm ? [byeFilm.id] : [],
              films: pool,
              currentByeFilm: byeFilm,
            } as Partial<AppState>);
          } else {
            update({ phase, films: pool });
          }
        }}
      />
    );
  }

  if (state.phase === 'bracket') {
    const byeFilm = state.currentByeFilm;
    return (
      <BracketView
        round={state.currentRound}
        byeFilm={byeFilm ?? null}
        roundNumber={state.roundNumber}
        onVote={(matchIndex, filmId) => {
          const currentRound = state.currentRound.map((m, i) => (i === matchIndex ? { ...m, winnerId: filmId } : m));
          update({ currentRound });
        }}
        onNextRound={() => {
          const winners = state.currentRound.map((m) => (m.winnerId === m.a.id ? m.a : (m.b as Film)));
          const survivors = byeFilm ? [...winners, byeFilm] : winners;
          const newByeHistory = byeFilm ? [...state.byeHistory, byeFilm.id] : state.byeHistory;
          const nextPhase = phaseForPoolSize(survivors.length);

          if (nextPhase === 'bracket') {
            const { matches, byeFilm: nextBye } = buildRound(survivors, newByeHistory);
            update({
              phase: 'bracket',
              currentRound: matches,
              roundNumber: state.roundNumber + 1,
              byeHistory: newByeHistory,
              films: survivors,
              currentByeFilm: nextBye,
            } as Partial<AppState>);
          } else {
            update({ phase: nextPhase, films: survivors, byeHistory: newByeHistory, currentRound: [] });
          }
        }}
      />
    );
  }

  if (state.phase === 'elimination3') {
    return (
      <EliminationRound
        films={state.films}
        onEliminate={(id) => {
          const survivors = state.films.filter((f) => f.id !== id);
          update({ phase: 'final2', films: survivors });
        }}
      />
    );
  }

  if (state.phase === 'final2') {
    const [a, b] = state.films;
    return (
      <FinalRound
        apiKey={state.apiKey}
        films={[a, b]}
        onPickWinner={(id) => {
          const winner = state.films.find((f) => f.id === id)!;
          update({ phase: 'winner', winner });
        }}
      />
    );
  }

  if (state.phase === 'winner' && state.winner) {
    return (
      <WinnerScreen
        film={state.winner}
        onRestart={() => {
          clearState();
          setState({ ...emptyState(state.apiKey), phase: 'entry' });
        }}
      />
    );
  }

  return null;
}
