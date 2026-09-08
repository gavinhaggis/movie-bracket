import type { Film, Match } from '../types';
import { FilmCard } from './FilmCard';

export function BracketView({
  round,
  byeFilm,
  roundNumber,
  onVote,
  onNextRound,
}: {
  round: Match[];
  byeFilm: Film | null;
  roundNumber: number;
  onVote: (matchIndex: number, filmId: string) => void;
  onNextRound: () => void;
}) {
  const allDecided = round.every((m) => m.winnerId);

  return (
    <div className="screen">
      <h1>Round {roundNumber}</h1>
      <p className="muted">Click the film that goes through to the next round.</p>

      <div className="matches">
        {round.map((m, i) => (
          <div className="match" key={m.a.id}>
            <FilmCard
              film={m.a}
              selected={m.winnerId === m.a.id}
              faded={!!m.winnerId && m.winnerId !== m.a.id}
              onClick={() => onVote(i, m.a.id)}
            />
            <div className="vs">VS</div>
            {m.b ? (
              <FilmCard
                film={m.b}
                selected={m.winnerId === m.b.id}
                faded={!!m.winnerId && m.winnerId !== m.b.id}
                onClick={() => onVote(i, m.b!.id)}
              />
            ) : null}
          </div>
        ))}

        {byeFilm && (
          <div className="match">
            <FilmCard film={byeFilm} tag="BYE — advances automatically" faded={false} />
          </div>
        )}
      </div>

      <div className="entry-footer">
        <span className="muted">
          {round.filter((m) => m.winnerId).length} / {round.length} matches decided
        </span>
        <button className="primary" disabled={!allDecided} onClick={onNextRound}>
          Next Round
        </button>
      </div>
    </div>
  );
}
