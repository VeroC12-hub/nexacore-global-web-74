import React, { useState, useCallback } from 'react';
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

  const timeEntries = timeEntriesData?.data || [];
  const totalCount = timeEntriesData?.count || 0;
  const totalPages = timeEntriesData?.totalPages || 1;

  return (
    <div>
      <ERPTimeTab
        {...props}
        timeEntries={timeEntries}
        loading={false}
        fetchTimeEntries={refetch}
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
