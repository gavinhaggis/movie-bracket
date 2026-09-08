import { POSTER_BASE } from '../lib/tmdb';
import type { Film } from '../types';

export function RoundCompleteScreen({
  roundNumber,
  survivors,
  onContinue,
}: {
  roundNumber: number;
  survivors: Film[];
  onContinue: () => void;
}) {
  return (
    <div className="screen centered round-complete">
      <h1>Round {roundNumber} Complete</h1>
      <p className="muted">{survivors.length} film{survivors.length === 1 ? '' : 's'} move on.</p>
      <div className="film-grid survivors">
        {survivors.map((f) => (
          <div className="film-card" key={f.id}>
            {f.posterPath ? (
              <img src={`${POSTER_BASE}${f.posterPath}`} alt={f.title} />
            ) : (
              <div className="poster-placeholder" />
            )}
            <div className="film-card-title">{f.title}</div>
          </div>
        ))}
      </div>
      <button className="primary" onClick={onContinue}>
        Continue →
      </button>
    </div>
  );
}
