import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface SupabaseMutationOptions<TData, TVariables> {
  invalidateKeys?: (string | number)[][];
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables) => void;
  retry?: number;
}

export function useSupabaseMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: SupabaseMutationOptions<TData, TVariables>
) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn,

    onSuccess: (data, variables) => {
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

      // Call user's onSuccess handler if provided
      if (options?.onSuccess) {
        options.onSuccess(data, variables);
      }
    },

    onError: (error, variables) => {
      // Show error toast
      const errorMsg = options?.errorMessage || error.message || 'An error occurred';
      toast.error(errorMsg);

      console.error('Mutation error:', error);

      // Call user's onError handler if provided
      if (options?.onError) {
        options.onError(error, variables);
      }
    },

    onSettled: (data, error, variables) => {
      // Call user's onSettled handler if provided
      if (options?.onSettled) {
        options.onSettled(data, error, variables);
      }
    },

    retry: options?.retry ?? 1,
  });
}
