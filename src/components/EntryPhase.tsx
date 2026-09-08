import { useEffect, useRef, useState } from 'react';
import { getRuntime, POSTER_BASE, searchMovies, type TmdbSearchResult } from '../lib/tmdb';
import type { Film } from '../types';

let uid = 0;
const nextId = () => `film-${Date.now()}-${uid++}`;

export function EntryPhase({
  apiKey,
  films,
  onAdd,
  onRemove,
  onStart,
}: {
  apiKey: string;
  films: Film[];
  onAdd: (film: Film) => void;
  onRemove: (id: string) => void;
  onStart: () => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TmdbSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await searchMovies(apiKey, query);
        setResults(r);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, apiKey]);

  async function addFromResult(r: TmdbSearchResult) {
    if (films.some((f) => f.tmdbId === r.id)) return;
    const runtime = await getRuntime(apiKey, r.id);
    const film: Film = {
      id: nextId(),
      tmdbId: r.id,
      title: r.title,
      year: r.release_date ? r.release_date.slice(0, 4) : '',
      posterPath: r.poster_path,
      runtime,
    };
    onAdd(film);
    setQuery('');
    setResults([]);
  }

  function addManual() {
    if (!query.trim()) return;
    const film: Film = {
      id: nextId(),
      tmdbId: -Date.now(),
      title: query.trim(),
      year: '',
      posterPath: null,
      runtime: null,
    };
    onAdd(film);
    setQuery('');
    setResults([]);
  }

  return (
    <div className="screen">
      <h1>🎬 Add Your Picks</h1>
      <p className="muted">One film per person. Search TMDb for posters &amp; runtime, or add manually if it's obscure.</p>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search a film title…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && results.length === 0 && query.trim()) addManual();
          }}
        />
        {query.trim() && (
          <div className="search-results">
            {searching && <div className="search-hint">Searching…</div>}
            {!searching &&
              results.map((r) => (
                <button key={r.id} className="search-result" onClick={() => addFromResult(r)}>
                  {r.poster_path ? (
                    <img src={`${POSTER_BASE}${r.poster_path}`} alt="" />
                  ) : (
                    <div className="poster-placeholder small" />
                  )}
                  <span>
                    {r.title} {r.release_date ? <em>({r.release_date.slice(0, 4)})</em> : null}
                  </span>
                </button>
              ))}
            {!searching && results.length === 0 && (
              <button className="search-result manual" onClick={addManual}>
                No TMDb match — add "{query.trim()}" manually
              </button>
            )}
          </div>
        )}
      </div>

      <div className="film-grid">
        {films.map((f) => (
          <div key={f.id} className="film-card">
            <button className="remove-btn" onClick={() => onRemove(f.id)} title="Remove">
              ×
            </button>
            {f.posterPath ? (
              <img src={`${POSTER_BASE}${f.posterPath}`} alt={f.title} />
            ) : (
              <div className="poster-placeholder" />
            )}
            <div className="film-card-title">{f.title}</div>
            <div className="film-card-meta">
              {f.year && <span>{f.year}</span>}
              {f.runtime && <span>{f.runtime} min</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="entry-footer">
        <span className="muted">{films.length} film{films.length === 1 ? '' : 's'} added</span>
        <button className="primary" disabled={films.length < 2} onClick={onStart}>
          Start Tournament
        </button>
      </div>
    </div>
  );
}
