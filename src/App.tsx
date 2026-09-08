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

function byeIdFromRound(round: AppState['currentRound']): string | null {
  return round.find((m) => m.b === null)?.a.id ?? null;
}

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
            const matches = buildRound(pool, []);
            const byeId = byeIdFromRound(matches);
            update({
              phase: 'bracket',
              currentRound: matches,
              currentMatchIndex: 0,
              roundComplete: false,
              roundNumber: 1,
              byeHistory: byeId ? [byeId] : [],
              films: pool,
            });
          } else {
            update({ phase, films: pool });
          }
        }}
      />
    );
  }

  if (state.phase === 'bracket') {
    return (
      <BracketView
        round={state.currentRound}
        roundNumber={state.roundNumber}
        currentMatchIndex={state.currentMatchIndex}
        roundComplete={state.roundComplete}
        onVote={(matchIndex, filmId) => {
          const currentRound = state.currentRound.map((m, i) => (i === matchIndex ? { ...m, winnerId: filmId } : m));
          update({ currentRound });
        }}
        onAdvance={() => {
          if (state.currentMatchIndex + 1 < state.currentRound.length) {
            update({ currentMatchIndex: state.currentMatchIndex + 1 });
          } else {
            update({ roundComplete: true });
          }
        }}
        onNextRound={() => {
          const survivors = state.currentRound.map((m) => (m.winnerId === m.a.id ? m.a : (m.b as Film)));
          const nextPhase = phaseForPoolSize(survivors.length);

          if (nextPhase === 'bracket') {
            const matches = buildRound(survivors, state.byeHistory);
            const byeId = byeIdFromRound(matches);
            update({
              phase: 'bracket',
              currentRound: matches,
              currentMatchIndex: 0,
              roundComplete: false,
              roundNumber: state.roundNumber + 1,
              byeHistory: byeId ? [...state.byeHistory, byeId] : state.byeHistory,
              films: survivors,
            });
          } else {
            update({ phase: nextPhase, films: survivors, currentRound: [], currentMatchIndex: 0, roundComplete: false });
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
