import { QueryClient } from '@tanstack/react-query';

const queryConfig = {
  defaultOptions: {
    queries: {
      // Stale time: 5 minutes - data is considered fresh for 5 minutes
      staleTime: 1000 * 60 * 5,
      // Garbage collection time: 10 minutes - cached data stays in memory
      gcTime: 1000 * 60 * 10,
      // Retry failed requests with exponential backoff
      retry: 2,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch on window focus to reduce unnecessary requests
      refetchOnWindowFocus: false,
      // Refetch on reconnect for fresh data
      refetchOnReconnect: true,
      // Only works in online mode
      networkMode: 'online' as const,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      networkMode: 'online' as const,
    },
  },
};

export const queryClient = new QueryClient(queryConfig);
