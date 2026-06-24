import type { AdvisorResponse, ApiMovie, Movie, Provider, SearchParams, StreamingProvider } from '../types/movie';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const PLACEHOLDER_POSTER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"%3E%3Crect width="400" height="600" fill="%23141b2b"/%3E%3Crect x="88" y="180" width="224" height="150" rx="18" fill="%23191f2f"/%3E%3Ccircle cx="154" cy="236" r="28" fill="%23dce2f7" opacity=".2"/%3E%3Cpath d="M108 310l62-62 45 45 24-24 53 41H108z" fill="%23dce2f7" opacity=".18"/%3E%3Ctext x="200" y="390" text-anchor="middle" fill="%23dce2f7" opacity=".55" font-family="Arial" font-size="20" font-weight="700"%3ENo Poster%3C/text%3E%3C/svg%3E';

class ApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

const providerIconMap: Record<string, string> = {
  netflix: 'play_circle',
  disney: 'star',
  disneyplus: 'star',
  'disney+': 'star',
  prime: 'shopping_cart',
  'prime video': 'shopping_cart',
  amazon: 'shopping_cart',
  apple: 'tv',
  'apple tv+': 'tv',
  hbo: 'movie_filter',
  max: 'movie_filter',
  mubi: 'star',
  criterion: 'auto_awesome',
};

function buildUrl(path: string, params?: Partial<Record<keyof SearchParams | 'q', string | undefined>>) {
  const url = new URL(path, API_BASE_URL);
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value?.trim()) url.searchParams.set(key, value.trim());
  });
  return url.toString();
}

async function requestJson<T>(path: string, options?: RequestInit, params?: Partial<Record<keyof SearchParams | 'q', string | undefined>>): Promise<T> {
  const response = await fetch(buildUrl(path, params), {
    ...options,
    headers: {
      Accept: 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError('Movie not available for now.', response.status);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError('Invalid response from server.', response.status);
  }
}

function responseToArray(payload: unknown): ApiMovie[] {
  if (Array.isArray(payload)) return payload as ApiMovie[];
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.results)) return record.results as ApiMovie[];
    if (Array.isArray(record.movies)) return record.movies as ApiMovie[];
    if (Array.isArray(record.data)) return record.data as ApiMovie[];
  }
  throw new ApiError('Invalid response from server.');
}

function normalizeImage(value?: string | null) {
  if (!value) return undefined;
  if (value.startsWith('http') || value.startsWith('data:')) return value;
  return `${TMDB_IMAGE_BASE}${value.startsWith('/') ? value : `/${value}`}`;
}

function normalizeYear(movie: ApiMovie) {
  const releaseDate = movie.release_date || movie.first_air_date;
  const parsed = releaseDate ? Number.parseInt(releaseDate.slice(0, 4), 10) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : new Date().getFullYear();
}

function normalizeRuntime(runtime?: string | number | null) {
  if (typeof runtime === 'number') {
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }
  return runtime || 'Runtime unavailable';
}

function normalizeGenres(genres: ApiMovie['genres']) {
  if (Array.isArray(genres)) {
    return genres
      .map((genre) => (typeof genre === 'string' ? genre : genre.name))
      .filter((genre): genre is string => Boolean(genre));
  }
  if (typeof genres === 'string') {
    try {
      const parsed = JSON.parse(genres);
      return normalizeGenres(parsed);
    } catch {
      return genres.split(',').map((genre) => genre.trim()).filter(Boolean);
    }
  }
  return [];
}

function normalizeProviderType(type?: string | null): StreamingProvider['type'] {
  const lowered = type?.toLowerCase();
  if (lowered?.includes('rent')) return 'Rent';
  if (lowered?.includes('buy') || lowered?.includes('purchase')) return 'Buy';
  if (lowered?.includes('free')) return 'Free';
  return 'Sub';
}

function normalizeProviders(movie: ApiMovie) {
  const providers = movie.streamingProviders ?? movie.providers ?? [];
  return providers.map((provider: Provider | StreamingProvider): StreamingProvider => {
    const platform = provider.platform || 'Unknown Platform';
    const iconKey = platform.toLowerCase().replace(/\s+/g, ' ');
    return {
      platform,
      type: normalizeProviderType(provider.type),
      price: provider.price ?? undefined,
      logoUrl: provider.logoUrl ?? undefined,
      iconName: 'iconName' in provider ? provider.iconName : providerIconMap[iconKey] || providerIconMap[iconKey.replace(/\s+/g, '')] || 'live_tv',
      colorClass: 'colorClass' in provider ? provider.colorClass : 'text-[#dce2f7]',
      watchUrl: provider.watchUrl || '#',
    };
  });
}

export function normalizeMovie(movie: ApiMovie): Movie {
  const id = String(movie.id ?? movie.movie_id ?? crypto.randomUUID());
  const posterUrl = normalizeImage(movie.posterUrl || movie.poster || movie.poster_path) || PLACEHOLDER_POSTER;
  const releaseDate = movie.release_date || movie.first_air_date || undefined;

  return {
    id,
    title: movie.title || movie.name || 'Unknown Title',
    type: movie.type === 'tv' || movie.media_type === 'tv' ? 'tv' : 'movie',
    year: normalizeYear(movie),
    runtime: normalizeRuntime(movie.runtime),
    rating: typeof movie.rating === 'string' ? movie.rating : 'NR',
    stars: Number(movie.vote_average ?? (typeof movie.rating === 'number' ? movie.rating : 0)) || 0,
    genres: normalizeGenres(movie.genres),
    description: movie.overview || movie.description || 'No overview available.',
    posterUrl,
    backdropUrl: normalizeImage(movie.backdropUrl || movie.backdrop || movie.backdrop_path) || posterUrl,
    streamingProviders: normalizeProviders(movie),
    cast: movie.cast ?? undefined,
    director: movie.director ?? undefined,
    language: movie.language || movie.original_language || undefined,
    releaseDate,
  };
}

async function requestMovieArray(path: string, signal?: AbortSignal, params?: Partial<Record<keyof SearchParams | 'q', string | undefined>>) {
  const payload = await requestJson<unknown>(path, { signal }, params);
  return responseToArray(payload).map(normalizeMovie);
}

export async function searchMovies(params: SearchParams, signal?: AbortSignal): Promise<Movie[]> {
  try {
    return await requestMovieArray('/api/search', signal, params);
  } catch (error) {
    const shouldTryLegacySearch = params.title && error instanceof ApiError && error.status === 400;
    if (!shouldTryLegacySearch) throw error;
    return requestMovieArray('/api/search', signal, { q: params.title });
  }
}

export function getTrendingMovies(signal?: AbortSignal): Promise<Movie[]> {
  return requestMovieArray('/api/trending', signal);
}

export async function getMovieDetails(id: string, signal?: AbortSignal): Promise<Movie> {
  const payload = await requestJson<ApiMovie>(`/api/movie/${encodeURIComponent(id)}`, { signal });
  return normalizeMovie(payload);
}

export function getPlatformMovies(platform: string, signal?: AbortSignal): Promise<Movie[]> {
  return requestMovieArray(`/api/platform/${encodeURIComponent(platform)}`, signal);
}

export function getSimilarMovies(id: string, signal?: AbortSignal): Promise<Movie[]> {
  return requestMovieArray(`/api/movie/${encodeURIComponent(id)}/similar`, signal);
}

export async function askAdvisor(message: string, signal?: AbortSignal): Promise<{ reply: string; movies: Movie[] }> {
  const payload = await requestJson<AdvisorResponse>('/api/advisor', {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  return {
    reply: payload.reply || 'Movie not available for now.',
    movies: responseToArray(payload).map(normalizeMovie),
  };
}
