import { useEffect, useState } from 'react';
import './index.css';
import { ApiKeySetup } from './components/ApiKeySetup';
import { EntryPhase } from './components/EntryPhase';
import { BracketView } from './components/BracketView';
import { EliminationRound } from './components/EliminationRound';
import { FinalRound } from './components/FinalRound';
import { WinnerScreen } from './components/WinnerScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { buildRound, phaseForPoolSize } from './lib/bracket';
import { appendHistoryEntry, clearState, loadHistory, loadState, removeHistoryEntry, saveState, tryRecoverApiKey } from './lib/storage';
import { emptyState, type AppState, type EliminationRecord, type Film, type TournamentHistoryEntry } from './types';

const MAX_UNDO = 30;

function byeIdFromRound(round: AppState['currentRound']): string | null {
  return round.find((m) => m.b === null)?.a.id ?? null;
}

export default function App() {
  const [rawState, setState] = useState<AppState | null>(null);
  const [undoStack, setUndoStack] = useState<AppState[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<TournamentHistoryEntry[]>([]);

  useEffect(() => {
    const loaded = loadState();
    if (loaded) {
      setState(loaded);
    } else {
      // Either first run, or a stale/corrupt save — start fresh but keep the
      // API key if we can still find it, so the user isn't forced to re-enter it.
      // Note: deliberately not clearing storage here — the save effect below
      // overwrites it with valid state on the next render, and this path must
      // stay a pure read since StrictMode invokes it twice in dev.
      const recoveredKey = tryRecoverApiKey();
      setState(recoveredKey ? { ...emptyState(recoveredKey), phase: 'entry' } : { ...emptyState(''), phase: 'setup' });
    }
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    if (rawState) saveState(rawState);
  }, [rawState]);

  if (!rawState) return null;
  // Bound to a definite (non-null) type here so closures below — event
  // handlers, renderPhase — don't lose the narrowing TS can't carry through
  // a nested-function boundary on a nullable variable.
  const state: AppState = rawState;

  function update(patch: Partial<AppState>) {
    setUndoStack((stack) => [...stack, state].slice(-MAX_UNDO));
    setState({ ...state, ...patch });
  }

  function goBack() {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    if (state.phase === 'winner' && history[0]) {
      // Undoing a crowning should retract the history entry it just wrote,
      // otherwise a misclick leaves a stale/incorrect record behind.
      removeHistoryEntry(history[0].id);
      setHistory((h) => h.slice(1));
    }
    setUndoStack(undoStack.slice(0, -1));
    setState(prev);
  }

  function recordHistory(winner: Film, eliminations: EliminationRecord[]) {
    const entry: TournamentHistoryEntry = {
      id: `t-${Date.now()}`,
      date: new Date().toISOString(),
      winner: { title: winner.title, posterPath: winner.posterPath, year: winner.year },
      participantCount: eliminations.length + 1,
      eliminations,
    };
    appendHistoryEntry(entry);
    setHistory((h) => [entry, ...h]);
  }

  function renderPhase() {
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
          onShowHistory={() => setShowHistory(true)}
          onStart={() => {
            const pool = state.films;
            const phase = phaseForPoolSize(pool.length);
            setUndoStack([]);
            if (phase === 'bracket') {
              const matches = buildRound(pool, []);
              const byeId = byeIdFromRound(matches);
              setState({
                ...state,
                phase: 'bracket',
                currentRound: matches,
                currentMatchIndex: 0,
                roundComplete: false,
                roundNumber: 1,
                byeHistory: byeId ? [byeId] : [],
                eliminations: [],
                films: pool,
              });
            } else {
              setState({ ...state, phase, films: pool, eliminations: [] });
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
            const currentRound = state.currentRound.map((m, i) =>
              i === matchIndex ? { ...m, winnerId: filmId } : m
            );
            update({ currentRound });
          }}
          onAdvance={() => {
            const match = state.currentRound[state.currentMatchIndex];
            let eliminations = state.eliminations;
            if (match.b && match.winnerId) {
              const loser = match.winnerId === match.a.id ? match.b : match.a;
              const winnerFilm = match.winnerId === match.a.id ? match.a : match.b;
              eliminations = [
                ...eliminations,
                { filmTitle: loser.title, posterPath: loser.posterPath, round: `Round ${state.roundNumber}`, eliminatedBy: winnerFilm.title },
              ];
            }
            if (state.currentMatchIndex + 1 < state.currentRound.length) {
              update({ currentMatchIndex: state.currentMatchIndex + 1, eliminations });
            } else {
              update({ roundComplete: true, eliminations });
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
            } else if (nextPhase === 'winner') {
              // Defensive: only reachable if a tournament starts with a single film.
              recordHistory(survivors[0], state.eliminations);
              update({ phase: nextPhase, films: survivors, winner: survivors[0], currentRound: [], currentMatchIndex: 0, roundComplete: false });
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
            const eliminated = state.films.find((f) => f.id === id)!;
            const survivors = state.films.filter((f) => f.id !== id);
            update({
              phase: 'final2',
              films: survivors,
              eliminations: [...state.eliminations, { filmTitle: eliminated.title, posterPath: eliminated.posterPath, round: 'Final Three' }],
            });
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
            const runnerUp = state.films.find((f) => f.id !== id)!;
            const eliminations = [
              ...state.eliminations,
              { filmTitle: runnerUp.title, posterPath: runnerUp.posterPath, round: 'Final', eliminatedBy: winner.title },
            ];
            recordHistory(winner, eliminations);
            update({ phase: 'winner', winner, eliminations });
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
            setUndoStack([]);
            setState({ ...emptyState(state.apiKey), phase: 'entry' });
          }}
          onShowHistory={() => setShowHistory(true)}
        />
      );
    }

    return null;
  }

  if (showHistory) {
    return <HistoryScreen history={history} onBack={() => setShowHistory(false)} />;
  }

  return (
    <>
      {undoStack.length > 0 && state.phase !== 'setup' && (
        <button className="global-back-btn" onClick={goBack}>
          ← Back
        </button>
      )}
      {renderPhase()}
    </>
  );
}
