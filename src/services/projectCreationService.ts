// =====================================================
// Project Creation Service
// Handles creating projects from proposals and quotes
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import type { Proposal } from '@/types/proposal';

/**
 * Create a project from an accepted proposal
 * This function is called automatically when a proposal is accepted
 */
export async function createProjectFromProposal(proposal: Proposal): Promise<string> {
  try {
    // Use the database function to create the project
    const { data, error } = await supabase.rpc('create_project_from_proposal', {
      proposal_uuid: proposal.id,
    });

    if (error) {
      console.error('Error creating project from proposal:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No project ID returned from database function');
    }

    // Return the created project ID
    return data as string;
  } catch (error) {
    console.error('Error in createProjectFromProposal:', error);
    throw error;
  }
}

/**
 * Check if a project already exists for a proposal
 */
export async function checkProjectExists(proposalId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('proposals')
      .select('project_created, project_id')
      .eq('id', proposalId)
      .single();

    if (error) throw error;

    return data?.project_created === true && !!data?.project_id;
  } catch (error) {
    console.error('Error checking if project exists:', error);
    return false;
  }
}

// Default export for backward compatibility
export const projectCreationService = {
  createProjectFromProposal,
  checkProjectExists,
};
