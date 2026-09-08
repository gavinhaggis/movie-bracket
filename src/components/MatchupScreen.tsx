import { BACKDROP_BASE } from '../lib/tmdb';
import type { Film, Match } from '../types';

function FilmPanel({
  film,
  onClick,
  state,
}: {
  film: Film;
  onClick?: () => void;
  state: 'idle' | 'winner' | 'loser';
}) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag className={`matchup-panel matchup-panel-${state}`} onClick={onClick}>
      {film.backdropPath && (
        <div className="matchup-bg" style={{ backgroundImage: `url(${BACKDROP_BASE}${film.backdropPath})` }} />
      )}
      <div className="matchup-scrim" />
      <div className="matchup-content">
        <h2 className="matchup-title">{film.title}</h2>
        <div className="film-card-meta center">
          {film.year && <span>{film.year}</span>}
          {film.runtime && <span>{film.runtime} min</span>}
          {film.voteAverage && <span>★ {film.voteAverage.toFixed(1)}</span>}
        </div>
        {film.genres.length > 0 && (
          <div className="genre-row">
            {film.genres.slice(0, 3).map((g) => (
              <span className="genre-pill" key={g}>
                {g}
              </span>
            ))}
          </div>
        )}
        {film.tagline && <p className="tagline">"{film.tagline}"</p>}
        {film.overview && <p className="blurb">{film.overview}</p>}
        {state === 'winner' && <div className="advances-banner">ADVANCES ▸</div>}
      </div>
    </Tag>
  );
}

export function MatchupScreen({
  match,
  roundNumber,
  matchIndex,
  totalMatches,
  onVote,
  onContinue,
}: {
  match: Match;
  roundNumber: number;
  matchIndex: number;
  totalMatches: number;
  onVote: (filmId: string) => void;
  onContinue: () => void;
}) {
  const decided = !!match.winnerId;
  const stateFor = (film: Film): 'idle' | 'winner' | 'loser' =>
    !decided ? 'idle' : match.winnerId === film.id ? 'winner' : 'loser';

  return (
    <div className="matchup-screen">
      <div className="matchup-progress">
        <span>Round {roundNumber}</span>
        <span className="dot">•</span>
        <span>
          Match {matchIndex + 1} of {totalMatches}
        </span>
      </div>

      {match.b === null ? (
        <div className="bye-wrap">
          <FilmPanel film={match.a} state="winner" />
          <div className="bye-label">BYE — no opponent this round, advances automatically</div>
        </div>
      ) : (
        <div className="matchup-split">
          <FilmPanel film={match.a} state={stateFor(match.a)} onClick={decided ? undefined : () => onVote(match.a.id)} />
          <div className="matchup-vs">VS</div>
          <FilmPanel film={match.b} state={stateFor(match.b)} onClick={decided ? undefined : () => onVote(match.b!.id)} />
        </div>
      )}

      {decided && (
        <div className="continue-bar">
          <button className="primary" onClick={onContinue}>
            Continue →
          </button>
        </div>
      )}
    </div>
  );
}
