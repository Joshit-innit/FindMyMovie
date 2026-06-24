import { useCallback } from 'react';
import { getTrendingMovies } from '../services/api';
import { useAsyncResource } from './useAsyncResource';

export function useTrending() {
  const loader = useCallback((signal: AbortSignal) => getTrendingMovies(signal), []);
  return useAsyncResource(loader, [], [loader]);
}
