// =====================================================
// Proposal Accept/Reject Interface for Clients
// =====================================================

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Edit, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useAcceptProposal, useRejectProposal, useRequestRevision } from '@/hooks/useProposalActions';
import type { Proposal } from '@/types/proposal';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';

interface ProposalAcceptRejectProps {
  proposal: Proposal;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ProposalAcceptReject: React.FC<ProposalAcceptRejectProps> = ({
  proposal,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [action, setAction] = useState<'accept' | 'reject' | 'revise' | null>(null);
  const [message, setMessage] = useState('');

  const acceptMutation = useAcceptProposal();
  const rejectMutation = useRejectProposal();
  const reviseMutation = useRequestRevision();

  const handleAccept = async () => {
    try {
      await acceptMutation.mutateAsync({
        proposalId: proposal.id,
        clientResponse: message || 'Proposal accepted',
      });
      toast.success('Proposal accepted! A project will be created for you.');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error accepting proposal:', error);
      toast.error('Failed to accept proposal');
    }
  };

  const handleReject = async () => {
    if (!message.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        proposalId: proposal.id,
        clientResponse: message,
      });
      toast.success('Proposal rejected. We\'ll be in touch soon.');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      toast.error('Failed to reject proposal');
    }
  };

  const handleRevise = async () => {
    if (!message.trim()) {
      toast.error('Please describe the changes you\'d like');
      return;
    }

    try {
      await reviseMutation.mutateAsync({
        proposalId: proposal.id,
        clientResponse: message,
      });
      toast.success('Revision requested. We\'ll update the proposal and get back to you.');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error requesting revision:', error);
      toast.error('Failed to request revision');
    }
  };

  const isLoading = acceptMutation.isPending || rejectMutation.isPending || reviseMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Respond to Proposal</DialogTitle>
          <DialogDescription>
            Please choose how you'd like to respond to {proposal.proposal_number}
          </DialogDescription>
        </DialogHeader>

        {!action ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
            {/* Accept Option */}
            <Card
              className="cursor-pointer hover:border-green-500 hover:shadow-lg transition-all"
              onClick={() => setAction('accept')}
            >
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Accept</h3>
                <p className="text-sm text-gray-600">
                  Accept this proposal and proceed with the project
                </p>
              </CardContent>
            </Card>

            {/* Request Revision Option */}
            <Card
              className="cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all"
              onClick={() => setAction('revise')}
            >
              <CardContent className="p-6 text-center">
                <Edit className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Request Changes</h3>
                <p className="text-sm text-gray-600">
                  Request revisions or modifications to the proposal
                </p>
              </CardContent>
            </Card>

            {/* Reject Option */}
            <Card
              className="cursor-pointer hover:border-red-500 hover:shadow-lg transition-all"
              onClick={() => setAction('reject')}
            >
              <CardContent className="p-6 text-center">
                <XCircle className="h-12 w-12 text-red-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Decline</h3>
                <p className="text-sm text-gray-600">
                  Decline this proposal
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-4 my-4">
            {/* Action Header */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
              {action === 'accept' && (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-900">Accept Proposal</h4>
                    <p className="text-sm text-green-700">
                      A project will be automatically created once you confirm
                    </p>
                  </div>
                </>
              )}
              {action === 'reject' && (
                <>
                  <XCircle className="h-6 w-6 text-red-600" />
                  <div>
                    <h4 className="font-semibold text-red-900">Decline Proposal</h4>
                    <p className="text-sm text-red-700">
                      Please let us know why this proposal isn't a good fit
                    </p>
                  </div>
                </>
              )}
              {action === 'revise' && (
                <>
                  <Edit className="h-6 w-6 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Request Changes</h4>
                    <p className="text-sm text-blue-700">
                      Describe the changes you'd like us to make
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="space-y-2">
              <Label htmlFor="message">
                {action === 'accept' && 'Additional Comments (Optional)'}
                {action === 'reject' && 'Reason for Declining (Required)'}
                {action === 'revise' && 'Changes Requested (Required)'}
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  action === 'accept'
                    ? 'Any additional comments or notes...'
                    : action === 'reject'
                    ? 'Please explain why this proposal isn\'t suitable...'
                    : 'Describe the changes you\'d like to see...'
                }
                rows={5}
                className="resize-none"
              />
            </div>

            {/* Confirmation Info */}
            {action === 'accept' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>What happens next:</strong>
                  <br />• A project will be created automatically
                  <br />• You'll receive access to the project dashboard
                  <br />• Our team will begin work as outlined in the proposal
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => action ? setAction(null) : onClose()} disabled={isLoading}>
            {action ? 'Back' : 'Cancel'}
          </Button>
          {action && (
            <Button
              onClick={
                action === 'accept'
                  ? handleAccept
                  : action === 'reject'
                  ? handleReject
                  : handleRevise
              }
              disabled={isLoading}
              className={
                action === 'accept'
                  ? 'bg-green-600 hover:bg-green-700'
                  : action === 'reject'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {action === 'accept' && <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Acceptance
                  </>}
                  {action === 'reject' && <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Confirm Decline
                  </>}
                  {action === 'revise' && <>
                    <Edit className="h-4 w-4 mr-2" />
                    Submit Request
                  </>}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
