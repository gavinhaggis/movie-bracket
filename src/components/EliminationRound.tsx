import { useState } from 'react';
import { BACKDROP_BASE } from '../lib/tmdb';
import type { Film } from '../types';

export function EliminationRound({ films, onEliminate }: { films: Film[]; onEliminate: (id: string) => void }) {
  const [pending, setPending] = useState<Film | null>(null);

  return (
    <div className="matchup-screen">
      <div className="matchup-progress">
        <span>Final Three</span>
      </div>
      <p className="elim-instruction">Vote to eliminate the weakest of the three. The other two move on to the final.</p>

      <div className="matchup-split three">
        {films.map((f) => (
          <button
            key={f.id}
            className={`matchup-panel matchup-panel-${pending?.id === f.id ? 'winner' : pending ? 'loser' : 'idle'}`}
            onClick={() => setPending(f)}
          >
            {f.backdropPath && (
              <div className="matchup-bg" style={{ backgroundImage: `url(${BACKDROP_BASE}${f.backdropPath})` }} />
            )}
            <div className="matchup-scrim" />
            <div className="matchup-content">
              <h2 className="matchup-title">{f.title}</h2>
              <div className="film-card-meta center">
                {f.year && <span>{f.year}</span>}
                {f.runtime && <span>{f.runtime} min</span>}
                {f.voteAverage && <span>★ {f.voteAverage.toFixed(1)}</span>}
              </div>
              {f.tagline && <p className="tagline">"{f.tagline}"</p>}
              {f.overview && <p className="blurb">{f.overview}</p>}
              {pending?.id === f.id && <div className="advances-banner eliminate">ELIMINATE ✕</div>}
            </div>
          </button>
        ))}
      </div>

      {pending && (
        <div className="continue-bar">
          <span className="confirm-text">
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
