import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PaginationParams {
  page?: number;
  pageSize?: number;
}

interface PaginatedQueryOptions<TData = any> {
  page?: number;
  pageSize?: number;
  select?: string;
  filters?: (query: any) => any;
  orderBy?: { column: string; ascending?: boolean };
  enabled?: boolean;
  staleTime?: number;
}

interface PaginatedResult<TData> {
  data: TData[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function usePaginatedSupabaseQuery<TData = any>(
  queryKey: (string | number)[],
  tableName: string,
  options: PaginatedQueryOptions<TData> = {}
) {
  const {
    page = 1,
    pageSize = 20,
    select = '*',
    filters,
    orderBy,
    enabled = true,
    staleTime,
  } = options;

  return useQuery<PaginatedResult<TData>, Error>({
    queryKey: [...queryKey, page, pageSize],
    queryFn: async ({ signal }) => {
      // Calculate range for pagination
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;

      // Create abort controller for timeout
      const timeoutId = setTimeout(() => {
        signal?.throwIfAborted();
      }, 30000); // 30 second timeout

      try {
        // Build query with pagination
        let query = supabase
          .from(tableName)
          .select(select, { count: 'exact' })
          .range(start, end);

        // Apply custom filters if provided
        if (filters) {
          query = filters(query);
        }

        // Apply ordering if provided
        if (orderBy) {
          query = query.order(orderBy.column, {
            ascending: orderBy.ascending ?? false
          });
        }

        // Execute query
        const { data, error, count } = await query;

        clearTimeout(timeoutId);

        if (error) {
          console.error(`Error fetching ${tableName}:`, error);
          throw new Error(error.message || `Failed to load ${tableName}`);
        }

        // Return paginated result
        return {
          data: (data || []) as TData[],
          count: count || 0,
          page,
          pageSize,
          totalPages: Math.ceil((count || 0) / pageSize),
        };
      } catch (error) {
        clearTimeout(timeoutId);
        if (signal?.aborted) {
          throw new Error('Query timeout - please try again');
        }
        throw error;
      }
    },
    enabled,
    staleTime: staleTime || 1000 * 60 * 5, // 5 minutes default
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}
