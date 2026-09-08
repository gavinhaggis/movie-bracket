import { POSTER_BASE } from '../lib/tmdb';
import type { Film } from '../types';

export function WinnerScreen({ film, onRestart }: { film: Film; onRestart: () => void }) {
  return (
    <div className="screen centered">
      <div className="winner-card">
        <div className="confetti">🎉</div>
        <h1>We have a winner!</h1>
        {film.posterPath && <img src={`${POSTER_BASE}${film.posterPath}`} alt={film.title} />}
        <h2>{film.title}</h2>
        <div className="film-card-meta">
          {film.year && <span>{film.year}</span>}
          {film.runtime && <span>{film.runtime} min</span>}
        </div>
        <button className="primary" onClick={onRestart}>
          Start a New Tournament
        </button>
      </div>
    </div>
  );
}
