import React, { useState, useCallback } from 'react';
import { useERPProjects } from '@/hooks/queries/useERPQueries';
import { ERPProjectsTab } from './ERPProjectsTab';
import { DashboardSkeleton } from '../LoadingSkeletons';
import { Pagination } from '../Pagination';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ERPProjectsTabWithDataProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (department: string) => void;
  onCreateProject: () => void;
  onEditProject: (project: any) => void;
  onViewProject: (project: any) => void;
  onAssignTeam: (project: any) => void;
  onExportProjects: () => void;
  onExportSingleProject: (project: any) => void;
}

export function ERPProjectsTabWithData(props: ERPProjectsTabWithDataProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const {
    data: projectsData,
    isLoading,
    error,
    refetch,
  } = useERPProjects({
    page,
    pageSize,
    statusFilter: props.statusFilter,
    departmentFilter: props.departmentFilter,
    searchTerm: props.searchTerm,
  });

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPage(1); // Reset to first page when changing page size
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">Failed to load projects</AlertTitle>
          <AlertDescription className="mt-3">
            <p className="mb-4 text-sm">
              {error.message || 'An error occurred while loading ERP projects. Please try again.'}
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

  const projects = projectsData?.data || [];
  const totalCount = projectsData?.count || 0;
  const totalPages = projectsData?.totalPages || 1;

  return (
    <div>
      <ERPProjectsTab
        {...props}
        projects={projects}
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
