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
 * Create a project from an accepted quote
 * This function is called automatically when a quote is accepted
 */
export async function createProjectFromQuote(quote: any): Promise<any> {
  try {
    // Create project directly in the database
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        title: quote.service_type || 'New Project',
        description: quote.scope || '',
        client_id: quote.client_id,
        status: 'planning',
        priority: 'normal',
        budget: quote.price,
        timeline: quote.timeline,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project from quote:', error);
      throw error;
    }

    // Update quote to mark project as created
    await supabase
      .from('quotes')
      .update({ project_created: true, project_id: project.id })
      .eq('id', quote.id);

    return project;
  } catch (error) {
    console.error('Error in createProjectFromQuote:', error);
    throw error;
  }
}

/**
 * Check if a project already exists for a proposal
 */
export async function checkProjectExists(proposalId: string): Promise<boolean> {
  try {
    const { data, error} = await supabase
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
  createProjectFromQuote,
  checkProjectExists,
};
