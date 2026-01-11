import { usePaginatedSupabaseQuery } from './usePaginatedSupabaseQuery';
import { useSupabaseMutation } from './useSupabaseMutation';
import { supabase } from '@/integrations/supabase/client';

// Projects Query with Pagination
export function useProjects({
  page = 1,
  pageSize = 20,
  statusFilter = 'all',
  priorityFilter = 'all',
  serviceFilter = 'all',
  searchTerm = '',
  sortBy = 'created_at',
  sortOrder = 'desc',
}: {
  page?: number;
  pageSize?: number;
  statusFilter?: string;
  priorityFilter?: string;
  serviceFilter?: string;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return usePaginatedSupabaseQuery(
    ['projects'],
    'projects',
    {
      page,
      pageSize,
      select: `
        *,
        profiles!client_id (
          full_name,
          email
        )
      `,
      filters: (query) => {
        let filtered = query;

        if (statusFilter !== 'all') {
          filtered = filtered.eq('status', statusFilter);
        }

        if (priorityFilter !== 'all') {
          filtered = filtered.eq('priority', priorityFilter);
        }

        if (serviceFilter !== 'all') {
          filtered = filtered.eq('service_type', serviceFilter);
        }

        if (searchTerm) {
          filtered = filtered.or(
            `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,service_type.ilike.%${searchTerm}%`
          );
        }

        return filtered;
      },
      orderBy: { column: sortBy, ascending: sortOrder === 'asc' },
    }
  );
}

// Create Project Mutation
export function useCreateProject() {
  return useSupabaseMutation(
    async (projectData: any) => {
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select(`
          *,
          profiles!client_id (
            full_name,
            email
          )
        `)
        .single();

      if (error) throw error;
      return data;
    },
    {
      invalidateKeys: [['projects']],
      successMessage: 'Project created successfully',
      errorMessage: 'Failed to create project',
    }
  );
}

// Update Project Mutation
export function useUpdateProject() {
  return useSupabaseMutation(
    async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          profiles!client_id (
            full_name,
            email
          )
        `)
        .single();

      if (error) throw error;
      return data;
    },
    {
      invalidateKeys: [['projects']],
      successMessage: 'Project updated successfully',
      errorMessage: 'Failed to update project',
    }
  );
}

// Delete Project Mutation
export function useDeleteProject() {
  return useSupabaseMutation(
    async (projectId: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      return { id: projectId };
    },
    {
      invalidateKeys: [['projects']],
      successMessage: 'Project deleted successfully',
      errorMessage: 'Failed to delete project',
    }
  );
}

// Assign Team Member Mutation
export function useAssignTeamMember() {
  return useSupabaseMutation(
    async ({ projectId, userId }: { projectId: string; userId: string }) => {
      // Use erp_project_teams instead of project_team_members
      const { data, error } = await supabase
        .from('erp_project_teams')
        .insert([{ erp_project_id: projectId, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      invalidateKeys: [['projects']],
      successMessage: 'Team member assigned successfully',
      errorMessage: 'Failed to assign team member',
    }
  );
}
