import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react';

interface ResourceState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

export function useAsyncResource<T>(
  loader: (signal: AbortSignal) => Promise<T>,
  fallbackData: T,
  deps: DependencyList,
  enabled = true
) {
  const [state, setState] = useState<ResourceState<T>>({
    data: fallbackData,
    loading: enabled,
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(() => {
    abortRef.current?.abort();

    if (!enabled) {
      setState((prev) => ({ ...prev, loading: false, error: null }));
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    loader(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error.message : 'Movie not available for now.',
          }));
        }
      });
  }, [enabled, loader]);

  useEffect(() => {
    fetchData();
    return () => abortRef.current?.abort();
  }, deps);

  return {
    ...state,
    refetch: fetchData,
  };
}
