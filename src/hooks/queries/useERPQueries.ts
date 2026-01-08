import { useQuery } from '@tanstack/react-query';
import { usePaginatedSupabaseQuery } from './usePaginatedSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';

// ERP Stats Query - Load immediately for dashboard overview
export function useERPStats() {
  return useQuery({
    queryKey: ['erp', 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('erp_projects')
        .select('id, status, is_active, budget, actual_cost', { count: 'exact' });

      if (error) throw error;

      // Calculate stats from projects
      const total = data?.length || 0;
      const active = data?.filter(p => p.is_active).length || 0;
      const completed = data?.filter(p => p.status === 'completed').length || 0;
      const totalBudget = data?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0;
      const totalSpent = data?.reduce((sum, p) => sum + (p.actual_cost || 0), 0) || 0;

      return {
        totalProjects: total,
        activeProjects: active,
        completedProjects: completed,
        totalBudget,
        totalSpent,
        budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes - stats should be relatively fresh
  });
}

// ERP Projects Query - Paginated, lazy loaded
export function useERPProjects({
  page = 1,
  pageSize = 20,
  statusFilter = 'all',
  departmentFilter = 'all',
  searchTerm = '',
  enabled = true,
}: {
  page?: number;
  pageSize?: number;
  statusFilter?: string;
  departmentFilter?: string;
  searchTerm?: string;
  enabled?: boolean;
}) {
  return usePaginatedSupabaseQuery(
    ['erp', 'projects'],
    'erp_projects',
    {
      page,
      pageSize,
      select: '*',
      filters: (query) => {
        let filtered = query;

        // Status filter
        if (statusFilter !== 'all') {
          filtered = filtered.eq('status', statusFilter);
        }

        // Department filter
        if (departmentFilter !== 'all') {
          filtered = filtered.eq('department', departmentFilter);
        }

        // Search filter
        if (searchTerm) {
          filtered = filtered.or(
            `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,department.ilike.%${searchTerm}%`
          );
        }

        return filtered;
      },
      orderBy: { column: 'created_at', ascending: false },
      enabled,
    }
  );
}

// ERP Tasks Query - Paginated, lazy loaded
export function useERPTasks({
  page = 1,
  pageSize = 20,
  statusFilter = 'all',
  priorityFilter = 'all',
  searchTerm = '',
  enabled = true,
}: {
  page?: number;
  pageSize?: number;
  statusFilter?: string;
  priorityFilter?: string;
  searchTerm?: string;
  enabled?: boolean;
}) {
  return usePaginatedSupabaseQuery(
    ['erp', 'tasks'],
    'erp_tasks',
    {
      page,
      pageSize,
      select: '*',
      filters: (query) => {
        let filtered = query;

        if (statusFilter !== 'all') {
          filtered = filtered.eq('status', statusFilter);
        }

        if (priorityFilter !== 'all') {
          filtered = filtered.eq('priority', priorityFilter);
        }

        if (searchTerm) {
          filtered = filtered.or(
            `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
          );
        }

        return filtered;
      },
      orderBy: { column: 'created_at', ascending: false },
      enabled,
    }
  );
}

// ERP Time Entries Query - Paginated, lazy loaded
export function useERPTimeEntries({
  page = 1,
  pageSize = 20,
  dateFilter = '',
  userFilter = 'all',
  enabled = true,
}: {
  page?: number;
  pageSize?: number;
  dateFilter?: string;
  userFilter?: string;
  enabled?: boolean;
}) {
  return usePaginatedSupabaseQuery(
    ['erp', 'time-entries'],
    'erp_time_entries',
    {
      page,
      pageSize,
      select: `
        *,
        profiles!user_id (full_name, email),
        erp_projects!project_id (title)
      `,
      filters: (query) => {
        let filtered = query;

        if (dateFilter) {
          filtered = filtered.gte('created_at', dateFilter);
        }

        if (userFilter !== 'all') {
          filtered = filtered.eq('user_id', userFilter);
        }

        return filtered;
      },
      orderBy: { column: 'created_at', ascending: false },
      enabled,
    }
  );
}

// ERP Staff Roles Query - Load when needed
export function useERPStaffRoles(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['erp', 'staff-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, phone, role, status, created_at')
        .in('role', ['admin', 'staff', 'project_manager'])
        .order('full_name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes - staff data changes less frequently
    enabled: options?.enabled !== false,
  });
}
