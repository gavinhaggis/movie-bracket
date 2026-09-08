import { useState } from 'react';
import { POSTER_BASE } from '../lib/tmdb';
import type { TournamentHistoryEntry } from '../types';

function TournamentCard({ entry }: { entry: TournamentHistoryEntry }) {
  const [open, setOpen] = useState(false);
  const date = new Date(entry.date);

  return (
    <div className="history-card">
      <button className="history-card-header" onClick={() => setOpen((o) => !o)}>
        {entry.winner.posterPath ? (
          <img src={`${POSTER_BASE}${entry.winner.posterPath}`} alt="" />
        ) : (
          <div className="poster-placeholder small" />
        )}
        <div className="history-card-info">
          <div className="history-card-title">🏆 {entry.winner.title}</div>
          <div className="film-card-meta">
            <span>{entry.participantCount} films</span>
            <span>
              {date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
        <span className="history-toggle">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="elimination-timeline">
          {entry.eliminations.map((e, i) => (
            <div className="elimination-row" key={i}>
              <span className="elimination-round">{e.round}</span>
              <span className="elimination-film">{e.filmTitle}</span>
              <span className="elimination-reason">
                {e.eliminatedBy ? `lost to ${e.eliminatedBy}` : 'voted out'}
              </span>
            </div>
          ))}
          <div className="elimination-row winner-row">
            <span className="elimination-round">Champion</span>
            <span className="elimination-film">{entry.winner.title}</span>
            <span className="elimination-reason">🏆</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function HistoryScreen({
  history,
  onBack,
}: {
  history: TournamentHistoryEntry[];
  onBack: () => void;
}) {
  return (
    <div className="screen">
      <div className="entry-footer" style={{ marginTop: 0, marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Past Tournaments</h1>
        <button onClick={onBack}>← Back</button>
      </div>

      {history.length === 0 ? (
        <p className="muted">No completed tournaments yet — crown a winner to start building history.</p>
      ) : (
        <div className="history-list">
          {history.map((entry) => (
            <TournamentCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
