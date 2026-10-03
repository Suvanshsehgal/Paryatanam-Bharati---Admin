import { QueryClient } from '@tanstack/react-query';

// Shared so the auth store can drop every cached query when the signed-in
// account changes; otherwise the next account would briefly see (and act on)
// the previous account's data.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error?.status === 401 || error?.status === 403) return false;
        return failureCount < 1;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes cache
    },
  },
});
