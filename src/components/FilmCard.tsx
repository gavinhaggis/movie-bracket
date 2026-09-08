import { POSTER_BASE } from '../lib/tmdb';
import type { Film } from '../types';

export function FilmCard({
  film,
  onClick,
  selected,
  faded,
  tag,
}: {
  film: Film;
  onClick?: () => void;
  selected?: boolean;
  faded?: boolean;
  tag?: string;
}) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      className={`vote-card${selected ? ' selected' : ''}${faded ? ' faded' : ''}`}
      onClick={onClick}
    >
      {tag && <div className="vote-card-tag">{tag}</div>}
      {film.posterPath ? (
        <img src={`${POSTER_BASE}${film.posterPath}`} alt={film.title} />
      ) : (
        <div className="poster-placeholder" />
      )}
      <div className="vote-card-title">{film.title}</div>
      <div className="film-card-meta">
        {film.year && <span>{film.year}</span>}
        {film.runtime && <span>{film.runtime} min</span>}
      </div>
    </Tag>
  );
}
