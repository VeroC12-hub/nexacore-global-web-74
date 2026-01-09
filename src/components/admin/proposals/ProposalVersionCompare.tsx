// =====================================================
// Proposal Version Comparison Component
// =====================================================

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { GitCompare, ArrowRight, X, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { compareProposalVersions, formatFieldName, formatFieldValue } from '@/services/proposalVersionService';
import { format } from 'date-fns';
import type { ProposalVersionDiff } from '@/types/proposal';

interface ProposalVersionCompareProps {
  version1Id: string;
  version2Id: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ProposalVersionCompare: React.FC<ProposalVersionCompareProps> = ({
  version1Id,
  version2Id,
  isOpen,
  onClose,
}) => {
  const {
    data: comparison,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['proposal-version-comparison', version1Id, version2Id],
    queryFn: () => compareProposalVersions(version1Id, version2Id),
    enabled: isOpen && !!version1Id && !!version2Id,
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  const renderDiffValue = (diff: ProposalVersionDiff, isOld: boolean) => {
    const value = isOld ? diff.oldValue : diff.newValue;
    const formattedValue = formatFieldValue(value);

    // For objects/arrays, render in a code block
    if (typeof value === 'object' && value !== null) {
      return (
        <pre className="text-xs bg-gray-50 p-2 rounded border overflow-x-auto max-h-40">
          <code>{formattedValue}</code>
        </pre>
      );
    }

    // For primitives, render inline
    return <p className="text-sm">{formattedValue}</p>;
  };

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'added':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'removed':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'modified':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Version Comparison
          </DialogTitle>
          <DialogDescription>
            Comparing changes between two proposal versions
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : error ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <p>Failed to compare versions</p>
                </div>
              </CardContent>
            </Card>
          ) : comparison ? (
            <div className="space-y-4">
              {/* Version Headers */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-2 border-blue-200 bg-blue-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">
                      Version {comparison.version1.version_number}
                    </CardTitle>
                    <p className="text-xs text-gray-600">
                      {formatDate(comparison.version1.created_at)}
                    </p>
                  </CardHeader>
                </Card>

                <Card className="border-2 border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">
                      Version {comparison.version2.version_number}
                    </CardTitle>
                    <p className="text-xs text-gray-600">
                      {formatDate(comparison.version2.created_at)}
                    </p>
                  </CardHeader>
                </Card>
              </div>

              {/* Changes Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Changes Summary
                    <Badge className="ml-2" variant="outline">
                      {comparison.totalChanges} {comparison.totalChanges === 1 ? 'change' : 'changes'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Differences */}
              {comparison.diffs.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-gray-600">
                    <p>No differences found between these versions</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {comparison.diffs.map((diff, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">
                            {formatFieldName(diff.field)}
                          </CardTitle>
                          <Badge className={getChangeTypeColor(diff.changeType)} variant="outline">
                            {diff.changeType}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          {/* Old Value */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                                Version {comparison.version1.version_number}
                              </Badge>
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded p-3">
                              {renderDiffValue(diff, true)}
                            </div>
                          </div>

                          {/* Arrow */}
                          <div className="flex items-center justify-center">
                            <ArrowRight className="h-5 w-5 text-gray-400" />
                          </div>

                          {/* New Value */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                Version {comparison.version2.version_number}
                              </Badge>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded p-3">
                              {renderDiffValue(diff, false)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
