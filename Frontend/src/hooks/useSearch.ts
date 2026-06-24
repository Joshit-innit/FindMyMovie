import { useCallback } from 'react';
import { searchMovies } from '../services/api';
import type { SearchParams } from '../types/movie';
import { useAsyncResource } from './useAsyncResource';

export function useSearch(params: SearchParams, enabled = true) {
  const title = params.title ?? '';
  const platform = params.platform ?? '';
  const language = params.language ?? '';
  const region = params.region ?? '';

  const loader = useCallback(
    (signal: AbortSignal) => searchMovies({ title, platform, language, region }, signal),
    [language, platform, region, title]
  );

  return useAsyncResource(loader, [], [loader], enabled);
}
