import { useState } from 'react';
import { validateApiKey } from '../lib/tmdb';

export function ApiKeySetup({ onSubmit }: { onSubmit: (key: string) => void }) {
  const [key, setKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'invalid'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim()) return;
    setStatus('checking');
    const ok = await validateApiKey(key.trim());
    if (ok) {
      onSubmit(key.trim());
    } else {
      setStatus('invalid');
    }
  }

  return (
    <div className="screen centered">
      <div className="card setup-card">
        <h1>🎬 Movie Club Bracket</h1>
        <p className="muted">
          This app pulls posters and runtimes from TMDb. Grab a free API key at{' '}
          <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer">
            themoviedb.org/settings/api
          </a>{' '}
          (v3 auth key) and paste it below. It's saved only in this browser.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="TMDb API key"
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              setStatus('idle');
            }}
            autoFocus
          />
          <button type="submit" disabled={status === 'checking'}>
            {status === 'checking' ? 'Checking…' : 'Save & Continue'}
          </button>
        </form>
        {status === 'invalid' && <p className="error">That key didn't work — double-check it and try again.</p>}
      </div>
    </div>
  );
}
