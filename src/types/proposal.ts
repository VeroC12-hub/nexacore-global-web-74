// =====================================================
// NexaCore Project Proposal System - TypeScript Types
// =====================================================

// =====================================================
// 1. ENUM TYPES
// =====================================================

export type ProposalStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'accepted'
  | 'rejected'
  | 'revision_requested'
  | 'expired';

export type ProposalActivityType =
  | 'created'
  | 'updated'
  | 'sent'
  | 'viewed'
  | 'accepted'
  | 'rejected'
  | 'revision_requested'
  | 'version_created'
  | 'rollback'
  | 'pdf_downloaded'
  | 'email_sent'
  | 'project_created'
  | 'expired';

export type ProposalPriority = 'low' | 'normal' | 'high' | 'urgent';

// =====================================================
// 2. PROPOSAL CONTENT SECTIONS (JSONB STRUCTURES)
// =====================================================

export interface ExecutiveSummary {
  overview: string;
  key_benefits: string[];
  investment_summary: string;
}

export interface ScopeOfWork {
  description: string;
  inclusions: string[];
  exclusions: string[];
}

export interface Methodology {
  approach: string;
  phases: MethodologyPhase[];
  tools_technologies: string[];
}

export interface MethodologyPhase {
  phase_number: number;
  title: string;
  description: string;
  duration: string;
  deliverables: string[];
}

export interface Deliverable {
  id: string;
  title: string;
  description: string;
  format: string; // e.g., "PDF", "Web Application", "Report"
  delivery_date?: string;
  status?: 'pending' | 'in_progress' | 'completed';
}

export interface DeliverablesSection {
  items: Deliverable[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  expertise: string[];
  photo_url?: string;
  linkedin_url?: string;
}

export interface TeamBios {
  members: TeamMember[];
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  probability: 'low' | 'medium' | 'high';
  mitigation_strategy: string;
}

export interface RiskAnalysis {
  risks: Risk[];
  mitigation_strategies: string[];
}

export interface KPI {
  id: string;
  name: string;
  description: string;
  target: string;
  measurement_method: string;
}

export interface SuccessMetrics {
  kpis: KPI[];
  measurement_approach: string;
}

export interface CustomSection {
  id: string;
  title: string;
  content: string;
  order: number;
  type?: 'text' | 'list' | 'table';
}

// =====================================================
// 3. BRANDING CONFIGURATION
// =====================================================

export interface BrandingConfig {
  colors: {
    primary: string; // Hex color
    secondary: string; // Hex color
    accent: string; // Hex color
  };
  logo_url?: string | null;
  company_name: string;
}

// =====================================================
// 4. MAIN PROPOSAL INTERFACE
// =====================================================

export interface Proposal {
  // Primary key
  id: string;

  // Auto-generated proposal number
  proposal_number: string;

  // Relationships
  quote_request_id?: string | null;
  quote_id?: string | null;
  client_id?: string | null;
  project_id?: string | null;

  // Client information
  client_email: string;
  client_name: string;
  client_company?: string | null;
  client_phone?: string | null;

  // Basic information
  title: string;
  service_type: string;
  status: ProposalStatus;

  // Financial details
  total_price: number;
  currency: string;

  // Timeline
  timeline?: string | null;
  estimated_start_date?: string | null;
  estimated_end_date?: string | null;
  valid_until?: string | null;

  // Proposal content sections
  executive_summary: ExecutiveSummary;
  scope_of_work: ScopeOfWork;
  methodology: Methodology;
  deliverables: DeliverablesSection;
  team_bios: TeamBios;
  risk_analysis: RiskAnalysis;
  success_metrics: SuccessMetrics;
  custom_sections: CustomSection[];
  terms_and_conditions?: string | null;

  // Branding
  use_custom_branding: boolean;
  branding_config: BrandingConfig;

  // Version tracking
  version_number: string;
  parent_proposal_id?: string | null;
  is_latest_version: boolean;

  // Status tracking
  sent_at?: string | null;
  viewed_at?: string | null;
  accepted_at?: string | null;
  rejected_at?: string | null;
  client_response?: string | null;

  // Project creation
  project_created: boolean;

  // Metadata
  created_by: string;
  created_at: string;
  updated_at: string;
  internal_notes?: string | null;
}

// =====================================================
// 5. PROPOSAL VERSION INTERFACE
// =====================================================

export interface ProposalVersion {
  id: string;
  proposal_id: string;
  version_number: string;
  content_snapshot: Record<string, any>; // Full proposal snapshot
  changes_summary?: string | null;
  changed_fields: string[];
  created_by?: string | null;
  created_at: string;
}

// =====================================================
// 6. PROPOSAL ACTIVITY INTERFACE
// =====================================================

export interface ProposalActivity {
  id: string;
  proposal_id: string;
  activity_type: ProposalActivityType;
  actor_id?: string | null;
  actor_email?: string | null;
  actor_name?: string | null;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
}

// =====================================================
// 7. PROPOSAL TEMPLATE INTERFACE
// =====================================================

export interface ProposalTemplate {
  id: string;
  name: string;
  description?: string | null;
  service_type?: string | null;
  category: string;
  template_sections: {
    executive_summary?: Partial<ExecutiveSummary>;
    scope_of_work?: Partial<ScopeOfWork>;
    methodology?: Partial<Methodology>;
    deliverables?: Partial<DeliverablesSection>;
    team_bios?: Partial<TeamBios>;
    risk_analysis?: Partial<RiskAnalysis>;
    success_metrics?: Partial<SuccessMetrics>;
    custom_sections?: CustomSection[];
    terms_and_conditions?: string;
  };
  created_by?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// =====================================================
// 8. FORM/INPUT TYPES (For Creating/Editing)
// =====================================================

export interface CreateProposalInput {
  // From quote request (optional)
  quote_request_id?: string;
  quote_id?: string;

  // Client information
  client_id?: string;
  client_email: string;
  client_name: string;
  client_company?: string;
  client_phone?: string;

  // Basic information
  title: string;
  service_type: string;

  // Financial details
  total_price: number;
  currency?: string;

  // Timeline
  timeline?: string;
  estimated_start_date?: string;
  estimated_end_date?: string;
  valid_until?: string;

  // Content sections (all optional during creation)
  executive_summary?: Partial<ExecutiveSummary>;
  scope_of_work?: Partial<ScopeOfWork>;
  methodology?: Partial<Methodology>;
  deliverables?: Partial<DeliverablesSection>;
  team_bios?: Partial<TeamBios>;
  risk_analysis?: Partial<RiskAnalysis>;
  success_metrics?: Partial<SuccessMetrics>;
  custom_sections?: CustomSection[];
  terms_and_conditions?: string;

  // Branding
  use_custom_branding?: boolean;
  branding_config?: Partial<BrandingConfig>;

  // Metadata
  internal_notes?: string;
}

export interface UpdateProposalInput extends Partial<CreateProposalInput> {
  id: string;
  status?: ProposalStatus;
}

export interface ProposalResponseInput {
  proposal_id: string;
  status: 'accepted' | 'rejected' | 'revision_requested';
  client_response: string;
}

// =====================================================
// 9. LIST/FILTER TYPES
// =====================================================

export interface ProposalFilters {
  status?: ProposalStatus | ProposalStatus[];
  client_id?: string;
  client_email?: string;
  service_type?: string;
  created_by?: string;
  date_from?: string;
  date_to?: string;
  search?: string; // Search in title, client_name, proposal_number
}

export interface ProposalListParams {
  filters?: ProposalFilters;
  sort_by?: 'created_at' | 'updated_at' | 'sent_at' | 'total_price' | 'proposal_number';
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

// =====================================================
// 10. RESPONSE TYPES
// =====================================================

export interface ProposalListResponse {
  data: Proposal[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ProposalWithRelations extends Proposal {
  creator?: {
    id: string;
    full_name: string | null;
    email: string | null;
    role: string;
  };
  client?: {
    id: string;
    full_name: string | null;
    email: string | null;
    company: string | null;
  };
  quote_request?: {
    id: string;
    service_type: string;
    status: string;
  };
  quote?: {
    id: string;
    quote_number: string;
    total_price: number;
  };
  project?: {
    id: string;
    title: string;
    status: string;
  };
  versions?: ProposalVersion[];
  activities?: ProposalActivity[];
}

// =====================================================
// 11. PDF GENERATION TYPES
// =====================================================

export interface ProposalPDFOptions {
  include_cover_page?: boolean;
  include_table_of_contents?: boolean;
  include_appendices?: boolean;
  page_numbering?: boolean;
  watermark?: string;
  custom_footer?: string;
}

export interface ProposalPDFMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string[];
  creator: string;
  producer: string;
}

// =====================================================
// 12. EMAIL NOTIFICATION TYPES
// =====================================================

export interface ProposalEmailData {
  proposal_id: string;
  proposal_number: string;
  client_name: string;
  client_email: string;
  title: string;
  total_price: number;
  currency: string;
  valid_until?: string;
  view_url: string;
  pdf_url: string;
}

export interface ProposalEmailOptions {
  send_to_client?: boolean;
  send_to_pm?: boolean;
  include_pdf_attachment?: boolean;
  custom_message?: string;
}

// =====================================================
// 13. VALIDATION TYPES
// =====================================================

export interface ProposalValidationResult {
  is_valid: boolean;
  errors: {
    field: string;
    message: string;
  }[];
  warnings: {
    field: string;
    message: string;
  }[];
}

// =====================================================
// 14. UTILITY TYPES
// =====================================================

// Type for proposal status badge colors
export type ProposalStatusColor = {
  [key in ProposalStatus]: {
    bg: string;
    text: string;
    border: string;
  };
};

// Type for proposal completion percentage
export interface ProposalCompletionStatus {
  overall_percentage: number;
  sections: {
    section_name: string;
    is_complete: boolean;
    completion_percentage: number;
  }[];
}

// Type for version comparison
export interface ProposalVersionComparison {
  version1: ProposalVersion;
  version2: ProposalVersion;
  diffs: ProposalVersionDiff[];
  totalChanges: number;
}

export interface ProposalVersionDiff {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'added' | 'removed' | 'modified';
}

export interface ProposalVersionCreateData {
  proposal_id: string;
  changes_summary: string;
  changed_fields?: string[];
}

// =====================================================
// 15. DATABASE TABLE TYPES (for Supabase)
// =====================================================

export interface Database {
  public: {
    Tables: {
      proposals: {
        Row: Proposal;
        Insert: Omit<Proposal, 'id' | 'created_at' | 'updated_at' | 'proposal_number'>;
        Update: Partial<Omit<Proposal, 'id' | 'created_at' | 'proposal_number'>>;
      };
      proposal_versions: {
        Row: ProposalVersion;
        Insert: Omit<ProposalVersion, 'id' | 'created_at'>;
        Update: Partial<Omit<ProposalVersion, 'id' | 'created_at'>>;
      };
      proposal_activities: {
        Row: ProposalActivity;
        Insert: Omit<ProposalActivity, 'id' | 'created_at'>;
        Update: Partial<Omit<ProposalActivity, 'id' | 'created_at'>>;
      };
      proposal_templates: {
        Row: ProposalTemplate;
        Insert: Omit<ProposalTemplate, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ProposalTemplate, 'id' | 'created_at'>>;
      };
    };
    Functions: {
      generate_proposal_number: {
        Args: Record<string, never>;
        Returns: string;
      };
      create_project_from_proposal: {
        Args: { proposal_uuid: string };
        Returns: string;
      };
    };
  };
}

// =====================================================
// 16. CONSTANTS
// =====================================================

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  viewed: 'Viewed',
  accepted: 'Accepted',
  rejected: 'Rejected',
  revision_requested: 'Revision Requested',
  expired: 'Expired',
};

export const PROPOSAL_STATUS_COLORS: ProposalStatusColor = {
  draft: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300',
  },
  sent: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-300',
  },
  viewed: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-300',
  },
  accepted: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-300',
  },
  rejected: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-300',
  },
  revision_requested: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-300',
  },
  expired: {
    bg: 'bg-gray-100',
    text: 'text-gray-500',
    border: 'border-gray-300',
  },
};

export const DEFAULT_BRANDING_CONFIG: BrandingConfig = {
  colors: {
    primary: '#0098A6', // Teal
    secondary: '#1E3A5F', // Navy
    accent: '#CDDC39', // Lime
  },
  logo_url: null,
  company_name: 'NexaCore Innovations',
};

export const DEFAULT_CURRENCY = 'USD';

export const PROPOSAL_EXPIRY_DAYS = 30; // Default proposal validity period
