import { useCallback } from 'react';
import { getPlatformMovies } from '../services/api';
import { useAsyncResource } from './useAsyncResource';

export function usePlatform(platform: string | null) {
  const loader = useCallback(
    (signal: AbortSignal) => (platform ? getPlatformMovies(platform, signal) : Promise.resolve([])),
    [platform]
  );

  return useAsyncResource(loader, [], [loader], Boolean(platform));
}
