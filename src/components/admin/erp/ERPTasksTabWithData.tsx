import React, { useState, useCallback, useMemo } from 'react';
import { useERPTasks } from '@/hooks/queries/useERPQueries';
import { ERPTasksTab } from './ERPTasksTab';
import { DashboardSkeleton } from '../LoadingSkeletons';
import { Pagination } from '../Pagination';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Map DB status values to what the component expects
const STATUS_MAP: Record<string, string> = {
  'pending': 'todo',
  'new': 'todo',
  'blocked': 'todo',
  'cancelled': 'todo',
  'in_progress': 'in_progress',
  'review': 'review',
  'testing': 'review',
  'completed': 'completed',
};

function transformTask(task: any) {
  return {
    ...task,
    assignee: task.profiles?.full_name || 'Unassigned',
    project_id: task.erp_project_id || '',
    project_title: task.erp_projects?.title || 'N/A',
    status: STATUS_MAP[task.status] || task.status,
    due_date: task.due_date || '',
    estimated_hours: task.estimated_hours || 0,
    actual_hours: task.actual_hours || 0,
  };
}

interface ERPTasksTabWithDataProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
  onCreateTask: () => void;
  onEditTask: (task: any) => void;
  onViewTask: (task: any) => void;
  onStartTask: (task: any) => void;
  onCompleteTask: (task: any) => void;
  onDeleteTask: (task: any) => void;
  onDuplicateTask: (task: any) => void;
  onExportTasks: () => void;
  onExportSingleTask: (task: any) => void;
}

export function ERPTasksTabWithData(props: ERPTasksTabWithDataProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const {
    data: tasksData,
    isLoading,
    error,
    refetch,
  } = useERPTasks({
    page,
    pageSize,
    statusFilter: props.statusFilter,
    priorityFilter: props.priorityFilter,
    searchTerm: props.searchTerm,
  });

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">Failed to load tasks</AlertTitle>
          <AlertDescription className="mt-3">
            <p className="mb-4 text-sm">
              {error.message || 'An error occurred while loading tasks. Please try again.'}
            </p>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const rawTasks = tasksData?.data || [];
  const tasks = rawTasks.map(transformTask);
  const totalCount = tasksData?.count || 0;
  const totalPages = tasksData?.totalPages || 1;

  return (
    <div>
      <ERPTasksTab
        {...props}
        tasks={tasks}
        loading={false}
      />
      
      {totalCount > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalCount}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
}
