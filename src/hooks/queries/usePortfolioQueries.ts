import { usePaginatedSupabaseQuery } from './usePaginatedSupabaseQuery';
import { useSupabaseMutation } from './useSupabaseMutation';
import { supabase } from '@/integrations/supabase/client';

// Portfolio Projects Query with Pagination
export function usePortfolioProjects({
  page = 1,
  pageSize = 20,
  filter = 'all',
  searchTerm = '',
}: {
  page?: number;
  pageSize?: number;
  filter?: 'all' | 'pending' | 'approved' | 'rejected';
  searchTerm?: string;
}) {
  return usePaginatedSupabaseQuery(
    ['portfolio'],
    'portfolio_projects',
    {
      page,
      pageSize,
      select: '*, portfolio_files(*)',
      filters: (query) => {
        let filtered = query;

        // Filter by submission status
        if (filter === 'pending') {
          filtered = filtered.eq('submission_status', 'pending_review');
        } else if (filter === 'approved') {
          filtered = filtered.eq('submission_status', 'approved');
        } else if (filter === 'rejected') {
          filtered = filtered.in('submission_status', ['rejected', 'revision_needed']);
        }

        // Search filter
        if (searchTerm) {
          filtered = filtered.or(
            `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,client_name.ilike.%${searchTerm}%,service_id.ilike.%${searchTerm}%`
          );
        }

        return filtered;
      },
      orderBy: { column: 'created_at', ascending: false },
    }
  );
}

// Update Portfolio Project Mutation
export function useUpdatePortfolioProject() {
  return useSupabaseMutation(
    async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      invalidateKeys: [['portfolio']],
      successMessage: 'Portfolio project updated successfully',
      errorMessage: 'Failed to update portfolio project',
    }
  );
}

// Delete Portfolio Project Mutation
export function useDeletePortfolioProject() {
  return useSupabaseMutation(
    async (projectId: string) => {
      const { error } = await supabase
        .from('portfolio_projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      return { id: projectId };
    },
    {
      invalidateKeys: [['portfolio']],
      successMessage: 'Portfolio project deleted successfully',
      errorMessage: 'Failed to delete portfolio project',
    }
  );
}
