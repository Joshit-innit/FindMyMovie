import { useCallback } from 'react';
import { getMovieDetails, getSimilarMovies } from '../services/api';
import type { Movie } from '../types/movie';
import { useAsyncResource } from './useAsyncResource';

interface MovieData {
  movie: Movie | null;
  similar: Movie[];
}

export function useMovie(id: string | null) {
  const loader = useCallback(async (signal: AbortSignal): Promise<MovieData> => {
    if (!id) return { movie: null, similar: [] };

    const movie = await getMovieDetails(id, signal);
    const similar = await getSimilarMovies(id, signal).catch(() => []);
    return { movie, similar };
  }, [id]);

  return useAsyncResource(loader, { movie: null, similar: [] }, [loader], Boolean(id));
}
