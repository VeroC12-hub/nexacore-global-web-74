import { useQuery } from '@tanstack/react-query';
import { usePaginatedSupabaseQuery } from './usePaginatedSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';

// ERP Stats Query - Load immediately for dashboard overview
export function useERPStats() {
  return useQuery({
    queryKey: ['erp', 'stats'],
    queryFn: async () => {
      const [projectsRes, tasksRes, membersRes] = await Promise.all([
        supabase.from('erp_projects').select('id, status, budget, actual_cost, start_date, end_date'),
        supabase.from('erp_tasks').select('id, status'),
        supabase.from('profiles').select('id').in('role', ['admin', 'project_manager', 'operations_manager', 'developer', 'support']),
      ]);

      const projectList = projectsRes.data as any[] || [];
      const taskList = tasksRes.data as any[] || [];
      const memberList = membersRes.data as any[] || [];

      const total = projectList.length;
      const active = projectList.filter(p => p.status === 'in_progress').length;
      const completed = projectList.filter(p => p.status === 'completed').length;
      const totalBudget = projectList.reduce((sum, p) => sum + (p.budget || 0), 0);
      const totalSpent = projectList.reduce((sum, p) => sum + (p.actual_cost || 0), 0);

      const totalTasks = taskList.length;
      const completedTasks = taskList.filter(t => t.status === 'completed').length;
      const pendingTasks = taskList.filter(t => t.status !== 'completed').length;

      // Average project duration in days (completed projects only)
      const completedWithDates = projectList.filter(p => p.status === 'completed' && p.start_date && p.end_date);
      const avgProjectDuration = completedWithDates.length > 0
        ? Math.round(completedWithDates.reduce((sum, p) => {
            const days = (new Date(p.end_date).getTime() - new Date(p.start_date).getTime()) / (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0) / completedWithDates.length)
        : 0;

      return {
        totalProjects: total,
        activeProjects: active,
        completedProjects: completed,
        totalBudget,
        totalSpent,
        budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
        totalTasks,
        completedTasks,
        pendingTasks,
        teamMembers: memberList.length,
        avgProjectDuration,
      };
    },
    staleTime: 1000 * 60 * 2,
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
      select: '*, profiles:profiles!erp_tasks_assigned_to_fkey(full_name), erp_projects:erp_projects!erp_tasks_erp_project_id_fkey(title)',
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
        profiles:profiles!erp_time_entries_user_id_fkey(full_name, email),
        erp_projects:erp_projects!erp_time_entries_erp_project_id_fkey(title),
        erp_tasks:erp_tasks!erp_time_entries_erp_task_id_fkey(title)
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
        .in('role', ['admin', 'project_manager', 'operations_manager', 'developer'])
        .order('full_name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes - staff data changes less frequently
    enabled: options?.enabled !== false,
  });
}
