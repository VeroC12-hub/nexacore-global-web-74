// =====================================================
// Proposal Version Service - Version Control & History
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import type {
  ProposalVersion,
  Proposal,
  ProposalVersionComparison,
  ProposalVersionDiff
} from '@/types/proposal';

// =====================================================
// Version Retrieval Operations
// =====================================================

/**
 * Get all versions for a proposal
 */
export async function getProposalVersions(proposalId: string): Promise<ProposalVersion[]> {
  const { data, error } = await supabase
    .from('proposal_versions')
    .select('*')
    .eq('proposal_id', proposalId)
    .order('version_number', { ascending: false });

  if (error) {
    console.error('Error fetching proposal versions:', error);
    throw error;
  }

  return (data || []) as unknown as ProposalVersion[];
}

/**
 * Get a specific version by ID
 */
export async function getProposalVersion(versionId: string): Promise<ProposalVersion | null> {
  const { data, error } = await supabase
    .from('proposal_versions')
    .select('*')
    .eq('id', versionId)
    .single();

  if (error) {
    console.error('Error fetching proposal version:', error);
    throw error;
  }

  return data as unknown as ProposalVersion;
}

/**
 * Get a specific version by proposal ID and version number
 */
export async function getProposalVersionByNumber(
  proposalId: string,
  versionNumber: string
): Promise<ProposalVersion | null> {
  const { data, error } = await supabase
    .from('proposal_versions')
    .select('*')
    .eq('proposal_id', proposalId)
    .eq('version_number', versionNumber)
    .single();

  if (error) {
    console.error('Error fetching proposal version by number:', error);
    throw error;
  }

  return data as unknown as ProposalVersion;
}

// =====================================================
// Version Creation Operations
// =====================================================

/**
 * Create a new version snapshot of a proposal
 */
export async function createProposalVersion(
  proposalId: string,
  changesSummary: string,
  changedFields: string[] = []
): Promise<ProposalVersion> {
  // Get current proposal data
  const { data: proposal, error: proposalError } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', proposalId)
    .single();

  if (proposalError || !proposal) {
    throw new Error('Proposal not found');
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // Create version snapshot
  const { data, error } = await supabase
    .from('proposal_versions')
    .insert({
      proposal_id: proposalId,
      version_number: proposal.version_number,
      content_snapshot: proposal as any,
      changes_summary: changesSummary,
      changed_fields: changedFields as any,
      created_by: user?.id || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating proposal version:', error);
    throw error;
  }

  return data as unknown as ProposalVersion;
}

// =====================================================
// Version Comparison Operations
// =====================================================

/**
 * Compare two proposal versions
 */
export async function compareProposalVersions(
  version1Id: string,
  version2Id: string
): Promise<ProposalVersionComparison> {
  const [version1, version2] = await Promise.all([
    getProposalVersion(version1Id),
    getProposalVersion(version2Id),
  ]);

  if (!version1 || !version2) {
    throw new Error('One or both versions not found');
  }

  const diffs = calculateVersionDiffs(
    version1.content_snapshot as Proposal,
    version2.content_snapshot as Proposal
  );

  return {
    version1,
    version2,
    diffs,
    totalChanges: diffs.length,
  };
}

/**
 * Calculate differences between two proposal versions
 */
function calculateVersionDiffs(
  oldVersion: Proposal,
  newVersion: Proposal
): ProposalVersionDiff[] {
  const diffs: ProposalVersionDiff[] = [];

  // Compare scalar fields
  const scalarFields: (keyof Proposal)[] = [
    'title',
    'service_type',
    'status',
    'total_price',
    'currency',
    'timeline',
    'valid_until',
    'client_name',
    'client_email',
    'terms_and_conditions',
  ];

  scalarFields.forEach((field) => {
    if (oldVersion[field] !== newVersion[field]) {
      diffs.push({
        field,
        oldValue: oldVersion[field],
        newValue: newVersion[field],
        changeType: 'modified',
      });
    }
  });

  // Compare JSONB fields (executive summary, scope, etc.)
  const jsonbFields: (keyof Proposal)[] = [
    'executive_summary',
    'scope_of_work',
    'methodology',
    'deliverables',
    'team_bios',
    'risk_analysis',
    'success_metrics',
    'custom_sections',
  ];

  jsonbFields.forEach((field) => {
    const oldValue = JSON.stringify(oldVersion[field]);
    const newValue = JSON.stringify(newVersion[field]);
    if (oldValue !== newValue) {
      diffs.push({
        field,
        oldValue: oldVersion[field],
        newValue: newVersion[field],
        changeType: 'modified',
      });
    }
  });

  // Compare branding config
  if (JSON.stringify(oldVersion.branding_config) !== JSON.stringify(newVersion.branding_config)) {
    diffs.push({
      field: 'branding_config',
      oldValue: oldVersion.branding_config,
      newValue: newVersion.branding_config,
      changeType: 'modified',
    });
  }

  return diffs;
}

// =====================================================
// Version Rollback Operations
// =====================================================

/**
 * Rollback proposal to a specific version
 */
export async function rollbackToVersion(
  proposalId: string,
  versionId: string
): Promise<Proposal> {
  // Get the version to rollback to
  const version = await getProposalVersion(versionId);
  if (!version) {
    throw new Error('Version not found');
  }

  const versionData = version.content_snapshot as Proposal;

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // Create a new version snapshot of current state before rollback
  await createProposalVersion(
    proposalId,
    `Rollback to version ${version.version_number}`,
    ['rollback']
  );

  // Parse version number and increment
  const currentVersionNum = parseFloat(versionData.version_number) || 1;
  const newVersionNumber = (currentVersionNum + 0.1).toFixed(1);

  // Update proposal with version data, incrementing version number
  const { data, error } = await supabase
    .from('proposals')
    .update({
      ...versionData,
      id: proposalId, // Keep same ID
      version_number: newVersionNumber,
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', proposalId)
    .select()
    .single();

  if (error) {
    console.error('Error rolling back proposal:', error);
    throw error;
  }

  // Log activity
  await supabase.from('proposal_activities').insert({
    proposal_id: proposalId,
    activity_type: 'rollback',
    actor_id: user?.id || null,
    description: `Rolled back to version ${version.version_number}`,
    metadata: {
      version_id: versionId,
      version_number: version.version_number,
    },
  });

  return data as unknown as Proposal;
}

// =====================================================
// Version Diff Formatting
// =====================================================

/**
 * Format a field name for display
 */
export function formatFieldName(field: string): string {
  return field
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Format a value for display in comparison
 */
export function formatFieldValue(value: any): string {
  if (value === null || value === undefined) {
    return 'Not set';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return String(value);
}

/**
 * Get a human-readable summary of changes
 */
export function getChangesSummary(diffs: ProposalVersionDiff[]): string {
  if (diffs.length === 0) {
    return 'No changes';
  }

  const fieldNames = diffs.map(diff => formatFieldName(diff.field));

  if (diffs.length === 1) {
    return `Changed ${fieldNames[0]}`;
  }

  if (diffs.length === 2) {
    return `Changed ${fieldNames[0]} and ${fieldNames[1]}`;
  }

  return `Changed ${diffs.length} fields: ${fieldNames.slice(0, 3).join(', ')}${diffs.length > 3 ? '...' : ''}`;
}
