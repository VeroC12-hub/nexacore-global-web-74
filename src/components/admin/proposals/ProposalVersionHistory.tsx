// =====================================================
// Proposal Version History Component
// =====================================================

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  History,
  GitBranch,
  RotateCcw,
  Eye,
  GitCompare,
  Clock,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProposalVersions, rollbackToVersion } from '@/services/proposalVersionService';
import type { ProposalVersion } from '@/types/proposal';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ProposalVersionHistoryProps {
  proposalId: string;
  onCompareVersions?: (version1Id: string, version2Id: string) => void;
}

export const ProposalVersionHistory: React.FC<ProposalVersionHistoryProps> = ({
  proposalId,
  onCompareVersions,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<ProposalVersion | null>(null);
  const [showRollbackDialog, setShowRollbackDialog] = useState(false);
  const [compareVersion1, setCompareVersion1] = useState<string | null>(null);
  const [compareVersion2, setCompareVersion2] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Fetch versions
  const {
    data: versions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['proposal-versions', proposalId],
    queryFn: () => getProposalVersions(proposalId),
  });

  // Rollback mutation
  const rollbackMutation = useMutation({
    mutationFn: (versionId: string) => rollbackToVersion(proposalId, versionId),
    onSuccess: () => {
      toast.success('Successfully rolled back to version');
      queryClient.invalidateQueries({ queryKey: ['proposal', proposalId] });
      queryClient.invalidateQueries({ queryKey: ['proposal-versions', proposalId] });
      setShowRollbackDialog(false);
      setSelectedVersion(null);
    },
    onError: (error: any) => {
      console.error('Error rolling back:', error);
      toast.error('Failed to rollback version');
    },
  });

  const handleRollback = (version: ProposalVersion) => {
    setSelectedVersion(version);
    setShowRollbackDialog(true);
  };

  const confirmRollback = () => {
    if (selectedVersion) {
      rollbackMutation.mutate(selectedVersion.id);
    }
  };

  const handleCompareSelect = (versionId: string) => {
    if (!compareVersion1) {
      setCompareVersion1(versionId);
      toast.info('Select another version to compare');
    } else if (!compareVersion2) {
      setCompareVersion2(versionId);
      if (onCompareVersions) {
        onCompareVersions(compareVersion1, versionId);
      }
      // Reset after comparison
      setCompareVersion1(null);
      setCompareVersion2(null);
    }
  };

  const cancelCompare = () => {
    setCompareVersion1(null);
    setCompareVersion2(null);
    toast.info('Comparison cancelled');
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load version history</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Version History
              </CardTitle>
              <CardDescription>
                View, compare, and rollback to previous versions of this proposal
              </CardDescription>
            </div>
            {compareVersion1 && (
              <Button variant="outline" size="sm" onClick={cancelCompare}>
                Cancel Comparison
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : !versions || versions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No version history yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Versions are automatically created when significant changes are made
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version, index) => (
                <Card
                  key={version.id}
                  className={`border-2 ${
                    compareVersion1 === version.id || compareVersion2 === version.id
                      ? 'border-blue-500 bg-blue-50'
                      : index === 0
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Version header */}
                        <div className="flex items-center gap-2 mb-2">
                          <GitBranch className="h-4 w-4 text-gray-600" />
                          <span className="font-semibold text-lg">
                            Version {version.version_number}
                          </span>
                          {index === 0 && (
                            <Badge className="bg-green-600 text-white">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Current
                            </Badge>
                          )}
                          {(compareVersion1 === version.id || compareVersion2 === version.id) && (
                            <Badge className="bg-blue-600 text-white">
                              Selected for Comparison
                            </Badge>
                          )}
                        </div>

                        {/* Changes summary */}
                        {version.changes_summary && (
                          <p className="text-sm text-gray-700 mb-2">
                            {version.changes_summary}
                          </p>
                        )}

                        {/* Changed fields */}
                        {version.changed_fields && version.changed_fields.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {version.changed_fields.slice(0, 5).map((field, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {field.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                            {version.changed_fields.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{version.changed_fields.length - 5} more
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="flex items-center gap-4 text-xs text-gray-600 mt-2">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(version.created_at)}
                          </div>
                          {version.created_by && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              Created by user
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCompareSelect(version.id)}
                          disabled={
                            index === 0 ||
                            (compareVersion1 !== null &&
                              compareVersion1 !== version.id &&
                              compareVersion2 !== null)
                          }
                        >
                          <GitCompare className="h-4 w-4 mr-1" />
                          Compare
                        </Button>

                        {index !== 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRollback(version)}
                            disabled={rollbackMutation.isPending}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Rollback
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rollback Confirmation Dialog */}
      <AlertDialog open={showRollbackDialog} onOpenChange={setShowRollbackDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rollback to Version {selectedVersion?.version_number}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new version with the content from version{' '}
              {selectedVersion?.version_number}. The current version will be saved in the history.
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800 font-medium">
                  ⚠️ This action cannot be undone, but you can always rollback again if needed.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={rollbackMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRollback}
              disabled={rollbackMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {rollbackMutation.isPending ? 'Rolling back...' : 'Rollback'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
