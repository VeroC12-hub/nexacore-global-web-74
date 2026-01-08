import { usePaginatedSupabaseQuery } from './usePaginatedSupabaseQuery';
import { useSupabaseMutation } from './useSupabaseMutation';
import { supabase } from '@/integrations/supabase/client';

// Users Query with Pagination
export function useUsers({
  page = 1,
  pageSize = 20,
  roleFilter = 'all',
  statusFilter = 'all',
  searchTerm = '',
  sortBy = 'created_at',
  sortOrder = 'desc',
}: {
  page?: number;
  pageSize?: number;
  roleFilter?: string;
  statusFilter?: string;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return usePaginatedSupabaseQuery(
    ['users'],
    'profiles',
    {
      page,
      pageSize,
      select: '*',
      filters: (query) => {
        let filtered = query;

        if (roleFilter !== 'all') {
          filtered = filtered.eq('role', roleFilter);
        }

        if (statusFilter !== 'all') {
          filtered = filtered.eq('status', statusFilter);
        }

        if (searchTerm) {
          filtered = filtered.or(
            `full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`
          );
        }

        return filtered;
      },
      orderBy: { column: sortBy, ascending: sortOrder === 'asc' },
    }
  );
}

// Update User Mutation
export function useUpdateUser() {
  return useSupabaseMutation(
    async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      invalidateKeys: [['users']],
      successMessage: 'User updated successfully',
      errorMessage: 'Failed to update user',
    }
  );
}

// Delete User Mutation
export function useDeleteUser() {
  return useSupabaseMutation(
    async (userId: string) => {
      const { error} = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      return { id: userId };
    },
    {
      invalidateKeys: [['users']],
      successMessage: 'User deleted successfully',
      errorMessage: 'Failed to delete user',
    }
  );
}
