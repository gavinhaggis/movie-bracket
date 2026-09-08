const BASE = 'https://api.themoviedb.org/3';
export const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';

export interface TmdbSearchResult {
  id: number;
  title: string;
  release_date?: string;
  poster_path: string | null;
}

export async function searchMovies(apiKey: string, query: string): Promise<TmdbSearchResult[]> {
  if (!query.trim()) return [];
  const url = `${BASE}/search/movie?api_key=${encodeURIComponent(apiKey)}&query=${encodeURIComponent(query)}&include_adult=false`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDb search failed (${res.status})`);
  const data = await res.json();
  return (data.results ?? []).slice(0, 8);
}

export async function getRuntime(apiKey: string, tmdbId: number): Promise<number | null> {
  const url = `${BASE}/movie/${tmdbId}?api_key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return typeof data.runtime === 'number' && data.runtime > 0 ? data.runtime : null;
}

export interface TmdbVideo {
  key: string;
  site: string;
  type: string;
  name: string;
}

export async function getTrailerKey(apiKey: string, tmdbId: number): Promise<string | null> {
  const url = `${BASE}/movie/${tmdbId}/videos?api_key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const videos: TmdbVideo[] = data.results ?? [];
  const trailer =
    videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ??
    videos.find((v) => v.site === 'YouTube' && v.type === 'Teaser') ??
    videos.find((v) => v.site === 'YouTube');
  return trailer?.key ?? null;
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/configuration?api_key=${encodeURIComponent(apiKey)}`);
    return res.ok;
  } catch {
    return false;
  }
}
