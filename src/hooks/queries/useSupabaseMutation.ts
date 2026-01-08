import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface SupabaseMutationOptions<TData, TVariables> extends Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'> {
  invalidateKeys?: (string | number)[][];
  successMessage?: string;
  errorMessage?: string;
}

export function useSupabaseMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: SupabaseMutationOptions<TData, TVariables>
) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn,

    onSuccess: (data, variables, context) => {
      // Invalidate related queries to refetch fresh data
      if (options?.invalidateKeys) {
        options.invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }

      // Show success toast if message provided
      if (options?.successMessage) {
        toast.success(options.successMessage);
      }

      // Call user's onSuccess handler
      options?.onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      // Show error toast
      const errorMsg = options?.errorMessage || error.message || 'An error occurred';
      toast.error(errorMsg);

      console.error('Mutation error:', error);

      // Call user's onError handler
      options?.onError?.(error, variables, context);
    },

    onSettled: (data, error, variables, context) => {
      // Call user's onSettled handler
      options?.onSettled?.(data, error, variables, context);
    },

    // Pass through other options
    retry: options?.retry ?? 1,
    ...options,
  });
}
