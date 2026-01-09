// =====================================================
// useProposalActions - Proposal Mutation Hooks
// =====================================================

import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createProposal,
  createProposalFromQuoteRequest,
  updateProposal,
  sendProposal,
  markProposalViewed,
  respondToProposal,
  deleteProposal,
} from '@/services/proposalService';
import type {
  Proposal,
  CreateProposalInput,
  UpdateProposalInput,
  ProposalResponseInput,
} from '@/types/proposal';
import { PROPOSAL_QUERY_KEY } from './useProposal';
import { PROPOSALS_QUERY_KEY, PROPOSAL_ACTIVITIES_QUERY_KEY, PROPOSAL_VERSIONS_QUERY_KEY } from './useProposals';

// =====================================================
// 1. CREATE MUTATIONS
// =====================================================

/**
 * Create a new proposal
 */
export function useCreateProposal(
  options?: UseMutationOptions<{ data: Proposal | null; error: Error | null }, Error, CreateProposalInput>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProposalInput) => {
      return await createProposal(input);
    },
    onSuccess: (result) => {
      if (result.error) {
        toast.error('Failed to create proposal: ' + result.error.message);
      } else {
        toast.success('Proposal created successfully!');
        // Invalidate proposals list
        queryClient.invalidateQueries({ queryKey: [PROPOSALS_QUERY_KEY] });
      }
    },
    onError: (error) => {
      toast.error('Failed to create proposal: ' + error.message);
    },
    ...options,
  });
}

/**
 * Create proposal from quote request
 */
export function useCreateProposalFromQuoteRequest(
  options?: UseMutationOptions<{ data: Proposal | null; error: Error | null }, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quoteRequestId: string) => {
      return await createProposalFromQuoteRequest(quoteRequestId);
    },
    onSuccess: (result) => {
      if (result.error) {
        toast.error('Failed to create proposal: ' + result.error.message);
      } else {
        toast.success('Proposal created from quote request!');
        queryClient.invalidateQueries({ queryKey: [PROPOSALS_QUERY_KEY] });
      }
    },
    onError: (error) => {
      toast.error('Failed to create proposal: ' + error.message);
    },
    ...options,
  });
}

// =====================================================
// 2. UPDATE MUTATIONS
// =====================================================

/**
 * Update an existing proposal
 */
export function useUpdateProposal(
  options?: UseMutationOptions<{ data: Proposal | null; error: Error | null }, Error, UpdateProposalInput>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateProposalInput) => {
      return await updateProposal(input);
    },
    onSuccess: (result, variables) => {
      if (result.error) {
        toast.error('Failed to update proposal: ' + result.error.message);
      } else {
        toast.success('Proposal updated successfully!');
        // Invalidate specific proposal and list
        queryClient.invalidateQueries({ queryKey: [PROPOSAL_QUERY_KEY, variables.id] });
        queryClient.invalidateQueries({ queryKey: [PROPOSALS_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [PROPOSAL_VERSIONS_QUERY_KEY, variables.id] });
        queryClient.invalidateQueries({ queryKey: [PROPOSAL_ACTIVITIES_QUERY_KEY, variables.id] });
      }
    },
    onError: (error) => {
      toast.error('Failed to update proposal: ' + error.message);
    },
    ...options,
  });
}

/**
 * Send proposal to client
 */
export function useSendProposal(
  options?: UseMutationOptions<{ data: Proposal | null; error: Error | null }, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposalId: string) => {
      return await sendProposal(proposalId);
    },
    onSuccess: (result, proposalId) => {
      if (result.error) {
        toast.error('Failed to send proposal: ' + result.error.message);
      } else {
        toast.success('Proposal sent to client!');
        queryClient.invalidateQueries({ queryKey: [PROPOSAL_QUERY_KEY, proposalId] });
        queryClient.invalidateQueries({ queryKey: [PROPOSALS_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [PROPOSAL_ACTIVITIES_QUERY_KEY, proposalId] });
      }
    },
    onError: (error) => {
      toast.error('Failed to send proposal: ' + error.message);
    },
    ...options,
  });
}

/**
 * Mark proposal as viewed
 */
export function useMarkProposalViewed(
  options?: UseMutationOptions<{ data: Proposal | null; error: Error | null }, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposalId: string) => {
      return await markProposalViewed(proposalId);
    },
    onSuccess: (result, proposalId) => {
      if (!result.error) {
        // Silently update (no toast needed for view tracking)
        queryClient.invalidateQueries({ queryKey: [PROPOSAL_QUERY_KEY, proposalId] });
        queryClient.invalidateQueries({ queryKey: [PROPOSAL_ACTIVITIES_QUERY_KEY, proposalId] });
      }
    },
    ...options,
  });
}

// =====================================================
// 3. RESPONSE MUTATIONS (Client Actions)
// =====================================================

/**
 * Respond to proposal (accept/reject/request revision)
 */
export function useRespondToProposal(
  options?: UseMutationOptions<{ data: Proposal | null; error: Error | null }, Error, ProposalResponseInput>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ProposalResponseInput) => {
      return await respondToProposal(input);
    },
    onSuccess: (result, variables) => {
      if (result.error) {
        toast.error('Failed to respond to proposal: ' + result.error.message);
      } else {
        const statusMessages = {
          accepted: 'Proposal accepted! Project will be created.',
          rejected: 'Proposal rejected. The project manager has been notified.',
          revision_requested: 'Revision requested. The project manager has been notified.',
        };
        toast.success(statusMessages[variables.status]);

        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: [PROPOSAL_QUERY_KEY, variables.proposal_id] });
        queryClient.invalidateQueries({ queryKey: [PROPOSALS_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [PROPOSAL_ACTIVITIES_QUERY_KEY, variables.proposal_id] });
      }
    },
    onError: (error) => {
      toast.error('Failed to respond to proposal: ' + error.message);
    },
    ...options,
  });
}

/**
 * Accept proposal (shorthand)
 */
export function useAcceptProposal(
  options?: UseMutationOptions<
    { data: Proposal | null; error: Error | null },
    Error,
    { proposalId: string; message?: string }
  >
) {
  const respondMutation = useRespondToProposal();

  return useMutation({
    mutationFn: async ({ proposalId, message }: { proposalId: string; message?: string }) => {
      return await respondToProposal({
        proposal_id: proposalId,
        status: 'accepted',
        client_response: message || 'I accept the proposal terms and conditions.',
      });
    },
    ...options,
  });
}

/**
 * Reject proposal (shorthand)
 */
export function useRejectProposal(
  options?: UseMutationOptions<
    { data: Proposal | null; error: Error | null },
    Error,
    { proposalId: string; reason: string }
  >
) {
  return useMutation({
    mutationFn: async ({ proposalId, reason }: { proposalId: string; reason: string }) => {
      return await respondToProposal({
        proposal_id: proposalId,
        status: 'rejected',
        client_response: reason,
      });
    },
    ...options,
  });
}

/**
 * Request revision (shorthand)
 */
export function useRequestRevision(
  options?: UseMutationOptions<
    { data: Proposal | null; error: Error | null },
    Error,
    { proposalId: string; changes: string }
  >
) {
  return useMutation({
    mutationFn: async ({ proposalId, changes }: { proposalId: string; changes: string }) => {
      return await respondToProposal({
        proposal_id: proposalId,
        status: 'revision_requested',
        client_response: changes,
      });
    },
    ...options,
  });
}

// =====================================================
// 4. DELETE MUTATIONS
// =====================================================

/**
 * Delete proposal (soft delete by default)
 */
export function useDeleteProposal(
  options?: UseMutationOptions<
    { success: boolean; error: Error | null },
    Error,
    { proposalId: string; permanent?: boolean }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ proposalId, permanent = false }: { proposalId: string; permanent?: boolean }) => {
      return await deleteProposal(proposalId, permanent);
    },
    onSuccess: (result, variables) => {
      if (result.error) {
        toast.error('Failed to delete proposal: ' + result.error.message);
      } else {
        const message = variables.permanent
          ? 'Proposal permanently deleted'
          : 'Proposal marked as expired';
        toast.success(message);

        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: [PROPOSAL_QUERY_KEY, variables.proposalId] });
        queryClient.invalidateQueries({ queryKey: [PROPOSALS_QUERY_KEY] });
      }
    },
    onError: (error) => {
      toast.error('Failed to delete proposal: ' + error.message);
    },
    ...options,
  });
}

// =====================================================
// 5. BATCH OPERATIONS
// =====================================================

/**
 * Bulk delete proposals
 */
export function useBulkDeleteProposals(
  options?: UseMutationOptions<void, Error, string[]>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposalIds: string[]) => {
      const results = await Promise.all(
        proposalIds.map((id) => deleteProposal(id, false))
      );

      const errors = results.filter((r) => r.error);
      if (errors.length > 0) {
        throw new Error(`Failed to delete ${errors.length} proposal(s)`);
      }
    },
    onSuccess: () => {
      toast.success('Proposals deleted successfully');
      queryClient.invalidateQueries({ queryKey: [PROPOSALS_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error('Failed to delete proposals: ' + error.message);
    },
    ...options,
  });
}

/**
 * Bulk send proposals
 */
export function useBulkSendProposals(
  options?: UseMutationOptions<void, Error, string[]>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposalIds: string[]) => {
      const results = await Promise.all(
        proposalIds.map((id) => sendProposal(id))
      );

      const errors = results.filter((r) => r.error);
      if (errors.length > 0) {
        throw new Error(`Failed to send ${errors.length} proposal(s)`);
      }
    },
    onSuccess: (_, proposalIds) => {
      toast.success(`Successfully sent ${proposalIds.length} proposal(s)`);
      queryClient.invalidateQueries({ queryKey: [PROPOSALS_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error('Failed to send proposals: ' + error.message);
    },
    ...options,
  });
}
