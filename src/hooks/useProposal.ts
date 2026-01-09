// =====================================================
// useProposal - Single Proposal Query Hook
// =====================================================

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getProposal, getProposalWithRelations, getProposalByNumber } from '@/services/proposalService';
import type { Proposal, ProposalWithRelations } from '@/types/proposal';

export const PROPOSAL_QUERY_KEY = 'proposal';

/**
 * Fetch a single proposal by ID
 */
export function useProposal(
  proposalId: string | undefined,
  options?: Omit<UseQueryOptions<Proposal | null, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Proposal | null, Error>({
    queryKey: [PROPOSAL_QUERY_KEY, proposalId],
    queryFn: async () => {
      if (!proposalId) return null;
      const { data, error } = await getProposal(proposalId);
      if (error) throw error;
      return data;
    },
    enabled: !!proposalId,
    ...options,
  });
}

/**
 * Fetch a proposal with all relations (creator, client, versions, activities, etc.)
 */
export function useProposalWithRelations(
  proposalId: string | undefined,
  options?: Omit<UseQueryOptions<ProposalWithRelations | null, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ProposalWithRelations | null, Error>({
    queryKey: [PROPOSAL_QUERY_KEY, 'with-relations', proposalId],
    queryFn: async () => {
      if (!proposalId) return null;
      const { data, error } = await getProposalWithRelations(proposalId);
      if (error) throw error;
      return data;
    },
    enabled: !!proposalId,
    ...options,
  });
}

/**
 * Fetch a proposal by proposal number (e.g., PROP-2025-0001)
 */
export function useProposalByNumber(
  proposalNumber: string | undefined,
  options?: Omit<UseQueryOptions<Proposal | null, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Proposal | null, Error>({
    queryKey: [PROPOSAL_QUERY_KEY, 'by-number', proposalNumber],
    queryFn: async () => {
      if (!proposalNumber) return null;
      const { data, error } = await getProposalByNumber(proposalNumber);
      if (error) throw error;
      return data;
    },
    enabled: !!proposalNumber,
    ...options,
  });
}
