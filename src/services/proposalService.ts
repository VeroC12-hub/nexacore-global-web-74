// =====================================================
// NexaCore Proposal Service - CRUD Operations
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import type {
  Proposal,
  ProposalVersion,
  ProposalActivity,
  CreateProposalInput,
  UpdateProposalInput,
  ProposalResponseInput,
  ProposalListParams,
  ProposalListResponse,
  ProposalWithRelations,
  ProposalActivityType,
} from '@/types/proposal';
import { DEFAULT_BRANDING_CONFIG, DEFAULT_CURRENCY } from '@/types/proposal';

// =====================================================
// 1. CREATE OPERATIONS
// =====================================================

/**
 * Create a new proposal
 */
export async function createProposal(
  input: CreateProposalInput
): Promise<{ data: Proposal | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to create proposals');
    }

    // Prepare proposal data with defaults
    const proposalData = {
      // Client information
      client_id: input.client_id || null,
      client_email: input.client_email,
      client_name: input.client_name,
      client_company: input.client_company || null,
      client_phone: input.client_phone || null,

      // Basic information
      title: input.title,
      service_type: input.service_type,
      status: 'draft',

      // Financial details
      total_price: input.total_price,
      currency: input.currency || DEFAULT_CURRENCY,

      // Timeline
      timeline: input.timeline || null,
      estimated_start_date: input.estimated_start_date || null,
      estimated_end_date: input.estimated_end_date || null,
      valid_until: input.valid_until || null,

      // Content sections (with defaults)
      executive_summary: input.executive_summary || {
        overview: '',
        key_benefits: [],
        investment_summary: '',
      },
      scope_of_work: input.scope_of_work || {
        description: '',
        inclusions: [],
        exclusions: [],
      },
      methodology: input.methodology || {
        approach: '',
        phases: [],
        tools_technologies: [],
      },
      deliverables: input.deliverables || {
        items: [],
      },
      team_bios: input.team_bios || {
        members: [],
      },
      risk_analysis: input.risk_analysis || {
        risks: [],
        mitigation_strategies: [],
      },
      success_metrics: input.success_metrics || {
        kpis: [],
        measurement_approach: '',
      },
      custom_sections: input.custom_sections || [],
      terms_and_conditions: input.terms_and_conditions || null,

      // Branding
      use_custom_branding: input.use_custom_branding || false,
      branding_config: input.branding_config || DEFAULT_BRANDING_CONFIG,

      // Relationships
      quote_request_id: input.quote_request_id || null,
      quote_id: input.quote_id || null,

      // Version tracking
      version_number: '1.0',
      is_latest_version: true,

      // Metadata
      created_by: user.id,
      internal_notes: input.internal_notes || null,
    };

    const { data, error } = await supabase
      .from('proposals')
      .insert([proposalData] as any)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await logProposalActivity({
      proposal_id: data.id,
      activity_type: 'created',
      actor_id: user.id,
      description: `Proposal created: ${data.title}`,
      metadata: { proposal_number: data.proposal_number },
    });

    return { data: data as unknown as Proposal, error: null };
  } catch (error) {
    console.error('Error creating proposal:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Create proposal from quote request (pre-filled data)
 */
export async function createProposalFromQuoteRequest(
  quoteRequestId: string
): Promise<{ data: Proposal | null; error: Error | null }> {
  try {
    // Fetch quote request data - use correct column names
    const { data: quoteRequest, error: qrError } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('id', quoteRequestId)
      .single();

    if (qrError) throw qrError;
    if (!quoteRequest) throw new Error('Quote request not found');

    // Check if there's an associated quote
    const { data: quote } = await supabase
      .from('quotes')
      .select('*')
      .eq('quote_request_id', quoteRequestId)
      .single();

    // Build proposal input from quote request - use correct column names
    const proposalInput: CreateProposalInput = {
      quote_request_id: quoteRequestId,
      quote_id: quote?.id || undefined,
      client_id: undefined, // quote_requests doesn't have client_id
      client_email: quoteRequest.email, // correct column name
      client_name: quoteRequest.full_name, // correct column name
      client_company: quoteRequest.company, // correct column name
      client_phone: quoteRequest.phone,
      title: `Project Proposal: ${quoteRequest.service_type}`,
      service_type: quoteRequest.service_type,
      total_price: quote?.price || 0, // quotes use 'price' not 'total_price'
      currency: quote?.currency || 'USD',
      timeline: quoteRequest.timeline || undefined,
      executive_summary: {
        overview: `This proposal outlines our approach to ${quoteRequest.service_type} for ${quoteRequest.full_name}.`,
        key_benefits: [],
        investment_summary: quote ? `Total investment: ${quote.currency} ${quote.price}` : '',
      },
      scope_of_work: {
        description: quoteRequest.description || '',
        inclusions: [],
        exclusions: [],
      },
    };

    return await createProposal(proposalInput);
  } catch (error) {
    console.error('Error creating proposal from quote request:', error);
    return { data: null, error: error as Error };
  }
}

// =====================================================
// 2. READ OPERATIONS
// =====================================================

/**
 * Get proposal by ID
 */
export async function getProposal(
  proposalId: string
): Promise<{ data: Proposal | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', proposalId)
      .single();

    if (error) throw error;

    return { data: data as unknown as Proposal, error: null };
  } catch (error) {
    console.error('Error fetching proposal:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Get proposal by proposal number
 */
export async function getProposalByNumber(
  proposalNumber: string
): Promise<{ data: Proposal | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('proposal_number', proposalNumber)
      .single();

    if (error) throw error;

    return { data: data as unknown as Proposal, error: null };
  } catch (error) {
    console.error('Error fetching proposal by number:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Get proposal with all relations
 */
export async function getProposalWithRelations(
  proposalId: string
): Promise<{ data: ProposalWithRelations | null; error: Error | null }> {
  try {
    // Fetch proposal without complex joins to avoid ambiguity
    const { data: proposal, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', proposalId)
      .single();

    if (error) throw error;

    // Fetch creator separately
    let creator = null;
    if (proposal.created_by) {
      const { data: creatorData } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('id', proposal.created_by)
        .single();
      creator = creatorData;
    }

    // Fetch versions and activities
    const [versionsResult, activitiesResult] = await Promise.all([
      getProposalVersions(proposalId),
      getProposalActivities(proposalId),
    ]);

    const data: ProposalWithRelations = {
      ...(proposal as unknown as Proposal),
      creator: creator as any,
      versions: versionsResult.data || [],
      activities: activitiesResult.data || [],
    };

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching proposal with relations:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * List proposals with filters and pagination
 */
export async function listProposals(
  params?: ProposalListParams
): Promise<{ data: ProposalListResponse | null; error: Error | null }> {
  try {
    const {
      filters = {},
      sort_by = 'created_at',
      sort_order = 'desc',
      page = 1,
      page_size = 20,
    } = params || {};

    // Build query
    let query = supabase
      .from('proposals')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }

    if (filters.client_id) {
      query = query.eq('client_id', filters.client_id);
    }

    if (filters.client_email) {
      query = query.eq('client_email', filters.client_email);
    }

    if (filters.service_type) {
      query = query.eq('service_type', filters.service_type);
    }

    if (filters.created_by) {
      query = query.eq('created_by', filters.created_by);
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,` +
        `client_name.ilike.%${filters.search}%,` +
        `proposal_number.ilike.%${filters.search}%`
      );
    }

    // Apply sorting
    query = query.order(sort_by, { ascending: sort_order === 'asc' });

    // Apply pagination
    const from = (page - 1) * page_size;
    const to = from + page_size - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    const response: ProposalListResponse = {
      data: (data || []) as unknown as Proposal[],
      total: count || 0,
      page,
      page_size,
      total_pages: Math.ceil((count || 0) / page_size),
    };

    return { data: response, error: null };
  } catch (error) {
    console.error('Error listing proposals:', error);
    return { data: null, error: error as Error };
  }
}

// =====================================================
// 3. UPDATE OPERATIONS
// =====================================================

/**
 * Update proposal
 */
export async function updateProposal(
  input: UpdateProposalInput
): Promise<{ data: Proposal | null; error: Error | null }> {
  try {
    const { id, ...updates } = input;

    const { data, error } = await supabase
      .from('proposals')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    const { data: { user } } = await supabase.auth.getUser();
    await logProposalActivity({
      proposal_id: id,
      activity_type: 'updated',
      actor_id: user?.id,
      description: 'Proposal updated',
      metadata: { updated_fields: Object.keys(updates) },
    });

    return { data: data as unknown as Proposal, error: null };
  } catch (error) {
    console.error('Error updating proposal:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Send proposal to client
 */
export async function sendProposal(
  proposalId: string
): Promise<{ data: Proposal | null; error: Error | null }> {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('proposals')
      .update({
        status: 'sent',
        sent_at: now,
      })
      .eq('id', proposalId)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    const { data: { user } } = await supabase.auth.getUser();
    await logProposalActivity({
      proposal_id: proposalId,
      activity_type: 'sent',
      actor_id: user?.id,
      description: `Proposal sent to ${data.client_name}`,
      metadata: { sent_at: now },
    });

    return { data: data as unknown as Proposal, error: null };
  } catch (error) {
    console.error('Error sending proposal:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Mark proposal as viewed (when client opens it)
 */
export async function markProposalViewed(
  proposalId: string
): Promise<{ data: Proposal | null; error: Error | null }> {
  try {
    const { data: existingProposal } = await getProposal(proposalId);

    // Only update if not already viewed
    if (existingProposal && !existingProposal.viewed_at) {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('proposals')
        .update({
          status: 'viewed',
          viewed_at: now,
        })
        .eq('id', proposalId)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await logProposalActivity({
        proposal_id: proposalId,
        activity_type: 'viewed',
        description: `Proposal viewed by ${data.client_name}`,
        metadata: { viewed_at: now },
      });

      return { data: data as unknown as Proposal, error: null };
    }

    return { data: existingProposal, error: null };
  } catch (error) {
    console.error('Error marking proposal as viewed:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Client responds to proposal (accept/reject/request revision)
 */
export async function respondToProposal(
  input: ProposalResponseInput
): Promise<{ data: Proposal | null; error: Error | null }> {
  try {
    const now = new Date().toISOString();
    const updateData: Record<string, any> = {
      status: input.status,
      client_response: input.client_response,
    };

    if (input.status === 'accepted') {
      updateData.accepted_at = now;
    } else if (input.status === 'rejected') {
      updateData.rejected_at = now;
    }

    const { data, error } = await supabase
      .from('proposals')
      .update(updateData)
      .eq('id', input.proposal_id)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await logProposalActivity({
      proposal_id: input.proposal_id,
      activity_type: input.status as ProposalActivityType,
      description: `Proposal ${input.status} by client`,
      metadata: { response: input.client_response },
    });

    return { data: data as unknown as Proposal, error: null };
  } catch (error) {
    console.error('Error responding to proposal:', error);
    return { data: null, error: error as Error };
  }
}

// =====================================================
// 4. DELETE OPERATIONS
// =====================================================

/**
 * Delete a proposal (soft delete by setting status to 'deleted' or hard delete)
 */
export async function deleteProposal(
  proposalId: string,
  hardDelete: boolean = false
): Promise<{ success: boolean; error: Error | null }> {
  try {
    if (hardDelete) {
      // First delete related records
      await supabase.from('proposal_activities').delete().eq('proposal_id', proposalId);
      await supabase.from('proposal_versions').delete().eq('proposal_id', proposalId);
      
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', proposalId);

      if (error) throw error;
    } else {
      // Soft delete - just update status (we'd need to add 'deleted' status)
      const { error } = await supabase
        .from('proposals')
        .update({ status: 'expired' }) // Using expired as a form of soft delete
        .eq('id', proposalId);

      if (error) throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting proposal:', error);
    return { success: false, error: error as Error };
  }
}

// =====================================================
// 5. VERSION MANAGEMENT
// =====================================================

/**
 * Get all versions of a proposal
 */
export async function getProposalVersions(
  proposalId: string
): Promise<{ data: ProposalVersion[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('proposal_versions')
      .select('*')
      .eq('proposal_id', proposalId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data as unknown as ProposalVersion[], error: null };
  } catch (error) {
    console.error('Error fetching proposal versions:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Rollback to a previous version
 */
export async function rollbackToVersion(
  proposalId: string,
  versionId: string
): Promise<{ data: Proposal | null; error: Error | null }> {
  try {
    // Get the version to rollback to
    const { data: version, error: versionError } = await supabase
      .from('proposal_versions')
      .select('*')
      .eq('id', versionId)
      .single();

    if (versionError) throw versionError;
    if (!version) throw new Error('Version not found');

    // Update the proposal with the version snapshot
    const snapshot = version.content_snapshot as Record<string, any>;
    const { data, error } = await supabase
      .from('proposals')
      .update({
        ...snapshot,
        version_number: `${parseFloat(version.version_number) + 0.1}`.slice(0, 4),
      } as any)
      .eq('id', proposalId)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    const { data: { user } } = await supabase.auth.getUser();
    await logProposalActivity({
      proposal_id: proposalId,
      activity_type: 'rollback',
      actor_id: user?.id,
      description: `Rolled back to version ${version.version_number}`,
      metadata: { from_version: data.version_number, to_version: version.version_number },
    });

    return { data: data as unknown as Proposal, error: null };
  } catch (error) {
    console.error('Error rolling back proposal:', error);
    return { data: null, error: error as Error };
  }
}

// =====================================================
// 6. ACTIVITY LOGGING
// =====================================================

interface LogActivityInput {
  proposal_id: string;
  activity_type: ProposalActivityType;
  actor_id?: string | null;
  actor_email?: string | null;
  actor_name?: string | null;
  description: string;
  metadata?: Record<string, any>;
}

/**
 * Log a proposal activity
 */
export async function logProposalActivity(
  input: LogActivityInput
): Promise<{ data: ProposalActivity | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('proposal_activities')
      .insert([{
        proposal_id: input.proposal_id,
        activity_type: input.activity_type,
        actor_id: input.actor_id || null,
        actor_email: input.actor_email || null,
        actor_name: input.actor_name || null,
        description: input.description,
        metadata: input.metadata || {},
      }])
      .select()
      .single();

    if (error) throw error;

    return { data: data as unknown as ProposalActivity, error: null };
  } catch (error) {
    console.error('Error logging proposal activity:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Get activities for a proposal
 */
export async function getProposalActivities(
  proposalId: string
): Promise<{ data: ProposalActivity[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('proposal_activities')
      .select('*')
      .eq('proposal_id', proposalId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data as unknown as ProposalActivity[], error: null };
  } catch (error) {
    console.error('Error fetching proposal activities:', error);
    return { data: null, error: error as Error };
  }
}

// =====================================================
// 7. UTILITY FUNCTIONS
// =====================================================

/**
 * Duplicate a proposal (create a new draft from existing)
 */
export async function duplicateProposal(
  proposalId: string
): Promise<{ data: Proposal | null; error: Error | null }> {
  try {
    // Get the original proposal
    const { data: original, error: fetchError } = await getProposal(proposalId);
    if (fetchError) throw fetchError;
    if (!original) throw new Error('Proposal not found');

    // Create a new proposal with the same data
    const input: CreateProposalInput = {
      client_id: original.client_id || undefined,
      client_email: original.client_email,
      client_name: original.client_name,
      client_company: original.client_company || undefined,
      client_phone: original.client_phone || undefined,
      title: `${original.title} (Copy)`,
      service_type: original.service_type,
      total_price: original.total_price,
      currency: original.currency,
      timeline: original.timeline || undefined,
      estimated_start_date: original.estimated_start_date || undefined,
      estimated_end_date: original.estimated_end_date || undefined,
      valid_until: original.valid_until || undefined,
      executive_summary: original.executive_summary,
      scope_of_work: original.scope_of_work,
      methodology: original.methodology,
      deliverables: original.deliverables,
      team_bios: original.team_bios,
      risk_analysis: original.risk_analysis,
      success_metrics: original.success_metrics,
      custom_sections: original.custom_sections,
      terms_and_conditions: original.terms_and_conditions || undefined,
      use_custom_branding: original.use_custom_branding,
      branding_config: original.branding_config,
      internal_notes: original.internal_notes || undefined,
    };

    return await createProposal(input);
  } catch (error) {
    console.error('Error duplicating proposal:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Get proposal statistics
 */
export async function getProposalStats(): Promise<{
  data: {
    total: number;
    draft: number;
    sent: number;
    viewed: number;
    accepted: number;
    rejected: number;
    revision_requested: number;
    expired: number;
    total_value: number;
    accepted_value: number;
  } | null;
  error: Error | null;
}> {
  try {
    const { data: proposals, error } = await supabase
      .from('proposals')
      .select('status, total_price');

    if (error) throw error;

    const stats = {
      total: proposals.length,
      draft: 0,
      sent: 0,
      viewed: 0,
      accepted: 0,
      rejected: 0,
      revision_requested: 0,
      expired: 0,
      total_value: 0,
      accepted_value: 0,
    };

    proposals.forEach((p) => {
      const status = p.status as keyof typeof stats;
      if (status in stats && typeof stats[status] === 'number') {
        (stats[status] as number)++;
      }
      stats.total_value += p.total_price || 0;
      if (p.status === 'accepted') {
        stats.accepted_value += p.total_price || 0;
      }
    });

    return { data: stats, error: null };
  } catch (error) {
    console.error('Error fetching proposal stats:', error);
    return { data: null, error: error as Error };
  }
}

// Default export for backward compatibility
export const proposalService = {
  createProposal,
  createProposalFromQuoteRequest,
  getProposal,
  getProposalByNumber,
  getProposalWithRelations,
  listProposals,
  updateProposal,
  sendProposal,
  markProposalViewed,
  respondToProposal,
  deleteProposal,
  getProposalVersions,
  rollbackToVersion,
  logProposalActivity,
  getProposalActivities,
  duplicateProposal,
  getProposalStats,
};
