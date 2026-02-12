import React, { useState, useCallback, useMemo } from 'react';
import { useERPTimeEntries } from '@/hooks/queries/useERPQueries';
import { ERPTimeTab } from './ERPTimeTab';
import { DashboardSkeleton } from '../LoadingSkeletons';
import { Pagination } from '../Pagination';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ERPTimeTabWithDataProps {
  dateFilter: string;
  setDateFilter: (date: string) => void;
  userFilter: string;
  setUserFilter: (user: string) => void;
  onCreateTimeEntry: () => void;
  onEditTimeEntry: (entry: any) => void;
  onStartTimer: (projectId: string, taskId?: string) => void;
  onStopTimer: (entryId: string) => void;
  onDeleteTimeEntry: (entry: any) => void;
}

// Transform DB shape to what ERPTimeTab component expects
function transformTimeEntry(entry: any) {
  return {
    ...entry,
    user_name: entry.profiles?.full_name || 'Unknown',
    project_title: entry.erp_projects?.title || 'N/A',
    task_title: entry.erp_tasks?.title || '',
    rate: entry.hourly_rate || 0,
    project_id: entry.erp_project_id || '',
    task_id: entry.erp_task_id || '',
    start_time: entry.date || entry.created_at,
    end_time: null,
    status: (entry.status === 'approved' || entry.status === 'submitted' || entry.status === 'invoiced') ? 'completed' : 'active',
  };
}

export function ERPTimeTabWithData(props: ERPTimeTabWithDataProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const {
    data: timeEntriesData,
    isLoading,
    error,
    refetch,
  } = useERPTimeEntries({
    page,
    pageSize,
    dateFilter: props.dateFilter,
    userFilter: props.userFilter,
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
          <AlertTitle className="text-lg font-semibold">Failed to load time entries</AlertTitle>
          <AlertDescription className="mt-3">
            <p className="mb-4 text-sm">
              {error.message || 'An error occurred while loading time entries. Please try again.'}
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

  const rawEntries = timeEntriesData?.data || [];
  const timeEntries = rawEntries.map(transformTimeEntry);
  const totalCount = timeEntriesData?.count || 0;
  const totalPages = timeEntriesData?.totalPages || 1;

  // Extract unique projects for the projects prop
  const projects = useMemo(() => {
    const seen = new Set<string>();
    return rawEntries
      .filter((e: any) => e.erp_project_id && !seen.has(e.erp_project_id) && seen.add(e.erp_project_id))
      .map((e: any) => ({ id: e.erp_project_id, title: e.erp_projects?.title || 'Unknown' }));
  }, [rawEntries]);

  return (
    <div>
      <ERPTimeTab
        dateFilter={props.dateFilter}
        setDateFilter={props.setDateFilter}
        userFilter={props.userFilter}
        setUserFilter={props.setUserFilter}
        onCreateTimeEntry={props.onCreateTimeEntry}
        onEditTimeEntry={props.onEditTimeEntry}
        onStartTimer={props.onStartTimer}
        onStopTimer={props.onStopTimer}
        onDeleteTimeEntry={props.onDeleteTimeEntry}
        timeEntries={timeEntries}
        loading={false}
        onRefresh={refetch}
        searchTerm=""
        setSearchTerm={() => {}}
        projects={projects}
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
