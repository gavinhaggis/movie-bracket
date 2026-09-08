import { useEffect, useState } from 'react';
import { getTrailerKey, POSTER_BASE } from '../lib/tmdb';
import type { Film } from '../types';

export function FinalRound({
  apiKey,
  films,
  onPickWinner,
}: {
  apiKey: string;
  films: [Film, Film];
  onPickWinner: (id: string) => void;
}) {
  const [trailers, setTrailers] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all(films.map((f) => getTrailerKey(apiKey, f.tmdbId))).then(([a, b]) => {
      if (cancelled) return;
      setTrailers({ [films[0].id]: a, [films[1].id]: b });
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [apiKey, films]);

  return (
    <div className="screen">
      <h1>🏆 The Final Two</h1>
      <p className="muted">Watch the trailers, then cast the deciding vote.</p>

      <div className="final-two">
        {films.map((f) => {
          const key = trailers[f.id];
          return (
            <div className="final-card" key={f.id}>
              <div className="final-header">
                {f.posterPath && <img className="final-poster" src={`${POSTER_BASE}${f.posterPath}`} alt="" />}
                <div>
                  <div className="final-title">{f.title}</div>
                  <div className="film-card-meta">
                    {f.year && <span>{f.year}</span>}
                    {f.runtime && <span>{f.runtime} min</span>}
                  </div>
                </div>
              </div>

              <div className="trailer-slot">
                {loading && <div className="search-hint">Loading trailer…</div>}
                {!loading && key && (
                  <iframe
                    src={`https://www.youtube.com/embed/${key}`}
                    title={`${f.title} trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
                {!loading && !key && (
                  <a
                    className="search-hint link"
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${f.title} ${f.year} trailer`)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    No trailer found on TMDb — search YouTube ↗
                  </a>
                )}
              </div>

              <button className="primary full" onClick={() => onPickWinner(f.id)}>
                Crown "{f.title}"
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
