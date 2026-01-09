// =====================================================
// NexaCore Proposal Service - CRUD Operations
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import type {
  Proposal,
  ProposalVersion,
  ProposalActivity,
  ProposalTemplate,
  CreateProposalInput,
  UpdateProposalInput,
  ProposalResponseInput,
  ProposalFilters,
  ProposalListParams,
  ProposalListResponse,
  ProposalWithRelations,
  ProposalActivityType,
  DEFAULT_BRANDING_CONFIG,
  DEFAULT_CURRENCY,
} from '@/types/proposal';

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
      status: 'draft' as const,

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
      .insert([proposalData])
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

    return { data, error: null };
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
    // Fetch quote request data
    const { data: quoteRequest, error: qrError } = await supabase
      .from('quote_requests')
      .select('*, profiles:client_id(*)')
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

    // Build proposal input from quote request
    const proposalInput: CreateProposalInput = {
      quote_request_id: quoteRequestId,
      quote_id: quote?.id || undefined,
      client_id: quoteRequest.client_id,
      client_email: quoteRequest.client_email,
      client_name: quoteRequest.client_name,
      client_company: quoteRequest.company_name,
      client_phone: quoteRequest.phone,
      title: `Project Proposal: ${quoteRequest.service_type}`,
      service_type: quoteRequest.service_type,
      total_price: quote?.total_price || 0,
      currency: quote?.currency || 'USD',
      timeline: quoteRequest.timeline || undefined,
      executive_summary: {
        overview: `This proposal outlines our approach to ${quoteRequest.service_type} for ${quoteRequest.client_name}.`,
        key_benefits: [],
        investment_summary: quote ? `Total investment: ${quote.currency} ${quote.total_price}` : '',
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

    return { data, error: null };
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

    return { data, error: null };
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
    const { data: proposal, error } = await supabase
      .from('proposals')
      .select(`
        *,
        creator:created_by(id, full_name, email, role),
        client:client_id(id, full_name, email, company),
        quote_request:quote_request_id(id, service_type, status),
        quote:quote_id(id, quote_number, total_price),
        project:project_id(id, title, status)
      `)
      .eq('id', proposalId)
      .single();

    if (error) throw error;

    // Fetch versions and activities
    const [versionsResult, activitiesResult] = await Promise.all([
      getProposalVersions(proposalId),
      getProposalActivities(proposalId),
    ]);

    const data: ProposalWithRelations = {
      ...proposal,
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
      data: data || [],
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
      .update(updates)
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

    return { data, error: null };
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

    // TODO: Trigger email notification
    // await sendProposalEmail(data);

    return { data, error: null };
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

      return { data, error: null };
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
    const { proposal_id, status, client_response } = input;

    const updates: any = {
      status,
      client_response,
    };

    const now = new Date().toISOString();

    if (status === 'accepted') {
      updates.accepted_at = now;
    } else if (status === 'rejected') {
      updates.rejected_at = now;
    }

    const { data, error } = await supabase
      .from('proposals')
      .update(updates)
      .eq('id', proposal_id)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    const { data: { user } } = await supabase.auth.getUser();
    await logProposalActivity({
      proposal_id,
      activity_type: status,
      actor_id: user?.id,
      actor_email: data.client_email,
      actor_name: data.client_name,
      description: `Proposal ${status.replace('_', ' ')}${client_response ? `: ${client_response}` : ''}`,
      metadata: { response: client_response },
    });

    // If accepted, create project
    if (status === 'accepted') {
      await createProjectFromAcceptedProposal(proposal_id);
    }

    // TODO: Send email notification to PM
    // await notifyPMOfResponse(data, status, client_response);

    return { data, error: null };
  } catch (error) {
    console.error('Error responding to proposal:', error);
    return { data: null, error: error as Error };
  }
}

// =====================================================
// 4. DELETE OPERATIONS
// =====================================================

/**
 * Delete proposal (soft delete by setting status to 'expired')
 */
export async function deleteProposal(
  proposalId: string,
  permanent: boolean = false
): Promise<{ success: boolean; error: Error | null }> {
  try {
    if (permanent) {
      // Permanent delete (admin only)
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', proposalId);

      if (error) throw error;
    } else {
      // Soft delete
      const { error } = await supabase
        .from('proposals')
        .update({ status: 'expired' })
        .eq('id', proposalId);

      if (error) throw error;

      // Log activity
      const { data: { user } } = await supabase.auth.getUser();
      await logProposalActivity({
        proposal_id: proposalId,
        activity_type: 'expired',
        actor_id: user?.id,
        description: 'Proposal marked as expired',
      });
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting proposal:', error);
    return { success: false, error: error as Error };
  }
}

// =====================================================
// 5. VERSION OPERATIONS
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

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching proposal versions:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Get specific version
 */
export async function getProposalVersion(
  versionId: string
): Promise<{ data: ProposalVersion | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('proposal_versions')
      .select('*')
      .eq('id', versionId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching proposal version:', error);
    return { data: null, error: error as Error };
  }
}

// =====================================================
// 6. ACTIVITY OPERATIONS
// =====================================================

/**
 * Get all activities for a proposal
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

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching proposal activities:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Log proposal activity
 */
export async function logProposalActivity(activity: {
  proposal_id: string;
  activity_type: ProposalActivityType;
  actor_id?: string;
  actor_email?: string;
  actor_name?: string;
  description: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    await supabase.from('proposal_activities').insert([
      {
        proposal_id: activity.proposal_id,
        activity_type: activity.activity_type,
        actor_id: activity.actor_id || null,
        actor_email: activity.actor_email || null,
        actor_name: activity.actor_name || null,
        description: activity.description,
        metadata: activity.metadata || {},
      },
    ]);
  } catch (error) {
    console.error('Error logging proposal activity:', error);
  }
}

// =====================================================
// 7. TEMPLATE OPERATIONS
// =====================================================

/**
 * List all active proposal templates
 */
export async function listProposalTemplates(): Promise<{
  data: ProposalTemplate[] | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('proposal_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error listing proposal templates:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Get template by ID
 */
export async function getProposalTemplate(
  templateId: string
): Promise<{ data: ProposalTemplate | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('proposal_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching proposal template:', error);
    return { data: null, error: error as Error };
  }
}

// =====================================================
// 8. HELPER FUNCTIONS
// =====================================================

/**
 * Create project from accepted proposal
 */
async function createProjectFromAcceptedProposal(
  proposalId: string
): Promise<void> {
  try {
    const { data: projectId, error } = await supabase.rpc(
      'create_project_from_proposal',
      { proposal_uuid: proposalId }
    );

    if (error) throw error;

    console.log('Project created from proposal:', projectId);
  } catch (error) {
    console.error('Error creating project from proposal:', error);
  }
}

/**
 * Check if proposal is expired
 */
export function isProposalExpired(proposal: Proposal): boolean {
  if (!proposal.valid_until) return false;
  return new Date(proposal.valid_until) < new Date();
}

/**
 * Calculate proposal completion percentage
 */
export function calculateProposalCompletion(proposal: Proposal): number {
  const sections = [
    { name: 'Executive Summary', complete: !!proposal.executive_summary?.overview },
    { name: 'Scope of Work', complete: !!proposal.scope_of_work?.description },
    { name: 'Methodology', complete: !!proposal.methodology?.approach },
    { name: 'Deliverables', complete: (proposal.deliverables?.items?.length || 0) > 0 },
    { name: 'Team Bios', complete: (proposal.team_bios?.members?.length || 0) > 0 },
    { name: 'Risk Analysis', complete: (proposal.risk_analysis?.risks?.length || 0) > 0 },
    { name: 'Success Metrics', complete: (proposal.success_metrics?.kpis?.length || 0) > 0 },
    { name: 'Terms', complete: !!proposal.terms_and_conditions },
  ];

  const completedSections = sections.filter((s) => s.complete).length;
  return Math.round((completedSections / sections.length) * 100);
}

/**
 * Generate public proposal URL
 */
export function generateProposalURL(proposalId: string, token?: string): string {
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  return `${baseUrl}/proposal/${proposalId}${token ? `?token=${token}` : ''}`;
}
