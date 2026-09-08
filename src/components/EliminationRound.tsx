import { useState } from 'react';
import type { Film } from '../types';
import { FilmCard } from './FilmCard';

export function EliminationRound({ films, onEliminate }: { films: Film[]; onEliminate: (id: string) => void }) {
  const [pending, setPending] = useState<Film | null>(null);

  return (
    <div className="screen">
      <h1>Final Three</h1>
      <p className="muted">Vote to eliminate the weakest of the three. The other two move on to the final.</p>

      <div className="matches elimination">
        {films.map((f) => (
          <FilmCard key={f.id} film={f} selected={pending?.id === f.id} onClick={() => setPending(f)} />
        ))}
      </div>

      {pending && (
        <div className="confirm-bar">
          <span>
            Eliminate <strong>{pending.title}</strong>?
          </span>
          <button className="danger" onClick={() => onEliminate(pending.id)}>
            Confirm elimination
          </button>
          <button className="ghost" onClick={() => setPending(null)}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
