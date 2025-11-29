import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Clock, MessageSquare, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface TimeEntry {
  id: string;
  user_name: string;
  project_title: string;
  task_title?: string;
  description: string;
  date?: string;
  created_at: string;
  hours: number;
  rate: number;
  billable: boolean;
  status: string;
}

interface TimeEntryApprovalProps {
  pendingEntries: TimeEntry[];
  onRefresh: () => void;
}

export function TimeEntryApproval({ pendingEntries, onRefresh }: TimeEntryApprovalProps) {
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleEntry = (entryId: string) => {
    const newSelected = new Set(selectedEntries);
    if (newSelected.has(entryId)) {
      newSelected.delete(entryId);
    } else {
      newSelected.add(entryId);
    }
    setSelectedEntries(newSelected);
  };

  const toggleAll = () => {
    if (selectedEntries.size === pendingEntries.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(pendingEntries.map(e => e.id)));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedEntries.size === 0) {
      toast.error('Please select entries to approve');
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('erp_time_entries')
        .update({ status: 'approved' })
        .in('id', Array.from(selectedEntries));

      if (error) throw error;

      toast.success(`Approved ${selectedEntries.size} time entries`);
      setSelectedEntries(new Set());
      onRefresh();
    } catch (error: any) {
      console.error('Approval error:', error);
      toast.error(error.message || 'Failed to approve entries');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedEntries.size === 0) {
      toast.error('Please select entries to reject');
      return;
    }

    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setIsProcessing(true);
    try {
      // Update status to rejected and add rejection comment
      // Note: This assumes you have a comments or notes column. If not, you may just update status.
      const { error } = await supabase
        .from('erp_time_entries')
        .update({
          status: 'rejected'
          // If you have a notes/comments column, add: notes: rejectionReason
        })
        .in('id', Array.from(selectedEntries));

      if (error) throw error;

      toast.success(`Rejected ${selectedEntries.size} time entries`);
      setSelectedEntries(new Set());
      setRejectionReason('');
      setIsRejectModalOpen(false);
      onRefresh();
    } catch (error: any) {
      console.error('Rejection error:', error);
      toast.error(error.message || 'Failed to reject entries');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSingleApprove = async (entryId: string) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('erp_time_entries')
        .update({ status: 'approved' })
        .eq('id', entryId);

      if (error) throw error;

      toast.success('Time entry approved');
      onRefresh();
    } catch (error: any) {
      console.error('Approval error:', error);
      toast.error(error.message || 'Failed to approve entry');
    } finally {
      setIsProcessing(false);
    }
  };

  if (pendingEntries.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
          <p className="text-sm text-muted-foreground">
            No pending time entries to review
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalPendingHours = pendingEntries.reduce((sum, e) => sum + e.hours, 0);
  const totalPendingRevenue = pendingEntries.reduce((sum, e) => sum + (e.hours * e.rate), 0);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Pending Approvals
              <Badge variant="secondary">
                {pendingEntries.length} entries
              </Badge>
            </span>
            <div className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
              <span>{totalPendingHours.toFixed(1)} hours</span>
              <span>•</span>
              <span className="text-green-600 font-semibold">
                ${totalPendingRevenue.toFixed(2)}
              </span>
            </div>
          </CardTitle>
          <CardDescription>
            Review and approve time entries submitted by your team
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Bulk Actions */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedEntries.size === pendingEntries.length && pendingEntries.length > 0}
                onCheckedChange={toggleAll}
              />
              <span className="text-sm text-muted-foreground">
                {selectedEntries.size > 0
                  ? `${selectedEntries.size} selected`
                  : 'Select all'}
              </span>
            </div>

            {selectedEntries.size > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkApprove}
                  disabled={isProcessing}
                  className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve ({selectedEntries.size})
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsRejectModalOpen(true)}
                  disabled={isProcessing}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4" />
                  Reject ({selectedEntries.size})
                </Button>
              </div>
            )}
          </div>

          {/* Pending Entries Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Project/Task</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingEntries.map(entry => {
                  const amount = entry.hours * entry.rate;
                  return (
                    <TableRow key={entry.id} className={selectedEntries.has(entry.id) ? 'bg-blue-50' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={selectedEntries.has(entry.id)}
                          onCheckedChange={() => toggleEntry(entry.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{entry.user_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {entry.date || new Date(entry.created_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{entry.project_title}</p>
                          {entry.task_title && (
                            <p className="text-xs text-muted-foreground">{entry.task_title}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-sm">
                          {entry.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{entry.hours.toFixed(2)}h</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-green-600">
                            ${amount.toFixed(2)}
                          </span>
                          <Badge
                            variant={entry.billable ? 'default' : 'secondary'}
                            className="w-fit text-xs"
                          >
                            {entry.billable ? 'Billable' : 'Internal'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSingleApprove(entry.id)}
                            disabled={isProcessing}
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Rejection Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-red-600" />
              Reject Time Entries
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedEntries.size} time entries
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Textarea
                placeholder="Enter rejection reason (e.g., 'Incorrect hours logged', 'Wrong project selected', etc.)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectionReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkReject}
                disabled={isProcessing || !rejectionReason.trim()}
                className="flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Reject Entries
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
