// =====================================================
// useProposals - Proposals List Query Hook
// =====================================================

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { listProposals, getProposalActivities, getProposalVersions } from '@/services/proposalService';
import type { ProposalListParams, ProposalListResponse, ProposalActivity, ProposalVersion, ProposalTemplate } from '@/types/proposal';
import { supabase } from '@/integrations/supabase/client';

export const PROPOSALS_QUERY_KEY = 'proposals';
export const PROPOSAL_ACTIVITIES_QUERY_KEY = 'proposal-activities';
export const PROPOSAL_VERSIONS_QUERY_KEY = 'proposal-versions';
export const PROPOSAL_TEMPLATES_QUERY_KEY = 'proposal-templates';

/**
 * Fetch proposals list with filters and pagination
 */
export function useProposals(
  params?: ProposalListParams,
  options?: Omit<UseQueryOptions<ProposalListResponse | null, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ProposalListResponse | null, Error>({
    queryKey: [PROPOSALS_QUERY_KEY, params],
    queryFn: async () => {
      const { data, error } = await listProposals(params);
      if (error) throw error;
      return data;
    },
    ...options,
  });
}

/**
 * Fetch proposal activities
 */
export function useProposalActivities(
  proposalId: string | undefined,
  options?: Omit<UseQueryOptions<ProposalActivity[] | null, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ProposalActivity[] | null, Error>({
    queryKey: [PROPOSAL_ACTIVITIES_QUERY_KEY, proposalId],
    queryFn: async () => {
      if (!proposalId) return null;
      const { data, error } = await getProposalActivities(proposalId);
      if (error) throw error;
      return data;
    },
    enabled: !!proposalId,
    ...options,
  });
}

/**
 * Fetch proposal versions
 */
export function useProposalVersions(
  proposalId: string | undefined,
  options?: Omit<UseQueryOptions<ProposalVersion[] | null, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ProposalVersion[] | null, Error>({
    queryKey: [PROPOSAL_VERSIONS_QUERY_KEY, proposalId],
    queryFn: async () => {
      if (!proposalId) return null;
      const { data, error } = await getProposalVersions(proposalId);
      if (error) throw error;
      return data;
    },
    enabled: !!proposalId,
    ...options,
  });
}

/**
 * Fetch proposal templates
 */
export function useProposalTemplates(
  options?: Omit<UseQueryOptions<ProposalTemplate[] | null, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ProposalTemplate[] | null, Error>({
    queryKey: [PROPOSAL_TEMPLATES_QUERY_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposal_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as unknown as ProposalTemplate[];
    },
    ...options,
  });
}
