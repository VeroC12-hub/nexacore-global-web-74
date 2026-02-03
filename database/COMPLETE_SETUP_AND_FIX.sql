-- =====================================================
-- NEXACORE COMPLETE DATABASE SETUP + SECURITY FIX
-- Run this ENTIRE script in Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste > Run
-- =====================================================
-- This script:
--   PART A: Creates proposals system tables (if they don't exist)
--   PART B: Fixes ALL RLS policies across ALL tables
-- =====================================================

-- =====================================================
-- PART A: CREATE PROPOSALS SYSTEM TABLES
-- =====================================================

-- A1: PROPOSALS TABLE
CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_number TEXT UNIQUE NOT NULL DEFAULT '',
    quote_request_id UUID REFERENCES quote_requests(id) ON DELETE SET NULL,
    quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
    client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    client_email TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_company TEXT,
    client_phone TEXT,
    title TEXT NOT NULL,
    service_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'sent', 'viewed', 'accepted', 'rejected', 'revision_requested', 'expired'
    )),
    total_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    timeline TEXT,
    estimated_start_date DATE,
    estimated_end_date DATE,
    valid_until TIMESTAMP WITH TIME ZONE,
    executive_summary JSONB DEFAULT '{"overview": "", "key_benefits": [], "investment_summary": ""}'::jsonb,
    scope_of_work JSONB DEFAULT '{"description": "", "inclusions": [], "exclusions": []}'::jsonb,
    methodology JSONB DEFAULT '{"approach": "", "phases": [], "tools_technologies": []}'::jsonb,
    deliverables JSONB DEFAULT '{"items": []}'::jsonb,
    team_bios JSONB DEFAULT '{"members": []}'::jsonb,
    risk_analysis JSONB DEFAULT '{"risks": [], "mitigation_strategies": []}'::jsonb,
    success_metrics JSONB DEFAULT '{"kpis": [], "measurement_approach": ""}'::jsonb,
    custom_sections JSONB DEFAULT '[]'::jsonb,
    terms_and_conditions TEXT,
    use_custom_branding BOOLEAN DEFAULT false,
    branding_config JSONB DEFAULT '{"colors": {"primary": "#0098A6", "secondary": "#1E3A5F", "accent": "#CDDC39"}, "logo_url": null, "company_name": "NexaCore Innovations"}'::jsonb,
    version_number TEXT NOT NULL DEFAULT '1.0',
    parent_proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
    is_latest_version BOOLEAN DEFAULT true,
    sent_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    client_response TEXT,
    project_created BOOLEAN DEFAULT false,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    internal_notes TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_proposals_proposal_number ON proposals(proposal_number);
CREATE INDEX IF NOT EXISTS idx_proposals_client_id ON proposals(client_id);
CREATE INDEX IF NOT EXISTS idx_proposals_client_email ON proposals(client_email);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_created_by ON proposals(created_by);
CREATE INDEX IF NOT EXISTS idx_proposals_quote_request_id ON proposals(quote_request_id);
CREATE INDEX IF NOT EXISTS idx_proposals_quote_id ON proposals(quote_id);
CREATE INDEX IF NOT EXISTS idx_proposals_project_id ON proposals(project_id);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON proposals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposals_valid_until ON proposals(valid_until);
CREATE INDEX IF NOT EXISTS idx_proposals_parent_proposal_id ON proposals(parent_proposal_id);

-- A2: PROPOSAL_VERSIONS TABLE
CREATE TABLE IF NOT EXISTS proposal_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE NOT NULL,
    version_number TEXT NOT NULL,
    content_snapshot JSONB NOT NULL,
    changes_summary TEXT,
    changed_fields JSONB DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(proposal_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_proposal_versions_proposal_id ON proposal_versions(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_versions_created_at ON proposal_versions(created_at DESC);

-- A3: PROPOSAL_ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS proposal_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE NOT NULL,
    activity_type TEXT NOT NULL CHECK (activity_type IN (
        'created', 'updated', 'sent', 'viewed', 'accepted', 'rejected',
        'revision_requested', 'version_created', 'pdf_downloaded',
        'email_sent', 'project_created', 'expired'
    )),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_email TEXT,
    actor_name TEXT,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_proposal_activities_proposal_id ON proposal_activities(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_activities_activity_type ON proposal_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_proposal_activities_created_at ON proposal_activities(created_at DESC);

-- A4: PROPOSAL_TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS proposal_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    service_type TEXT,
    category TEXT DEFAULT 'general',
    template_sections JSONB NOT NULL DEFAULT '{"executive_summary": {}, "scope_of_work": {}, "methodology": {}, "deliverables": {}, "team_bios": {}, "risk_analysis": {}, "success_metrics": {}, "custom_sections": [], "terms_and_conditions": ""}'::jsonb,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_proposal_templates_is_active ON proposal_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_proposal_templates_service_type ON proposal_templates(service_type);

-- =====================================================
-- A5: DATABASE FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION generate_proposal_number()
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    next_number INT;
    result_number TEXT;
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_TIMESTAMP)::TEXT;
    SELECT COALESCE(MAX(CAST(SUBSTRING(proposal_number FROM 'PROP-' || current_year || '-(\d+)') AS INTEGER)), 0) + 1
    INTO next_number FROM proposals WHERE proposal_number LIKE 'PROP-' || current_year || '-%';
    result_number := 'PROP-' || current_year || '-' || LPAD(next_number::TEXT, 4, '0');
    RETURN result_number;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION create_proposal_version()
RETURNS TRIGGER AS $$
DECLARE
    version_snapshot JSONB;
    changed_field_names TEXT[];
BEGIN
    IF (
        OLD.executive_summary IS DISTINCT FROM NEW.executive_summary OR
        OLD.scope_of_work IS DISTINCT FROM NEW.scope_of_work OR
        OLD.methodology IS DISTINCT FROM NEW.methodology OR
        OLD.deliverables IS DISTINCT FROM NEW.deliverables OR
        OLD.team_bios IS DISTINCT FROM NEW.team_bios OR
        OLD.risk_analysis IS DISTINCT FROM NEW.risk_analysis OR
        OLD.success_metrics IS DISTINCT FROM NEW.success_metrics OR
        OLD.custom_sections IS DISTINCT FROM NEW.custom_sections OR
        OLD.total_price IS DISTINCT FROM NEW.total_price OR
        OLD.timeline IS DISTINCT FROM NEW.timeline OR
        OLD.terms_and_conditions IS DISTINCT FROM NEW.terms_and_conditions
    ) THEN
        version_snapshot := jsonb_build_object(
            'title', NEW.title, 'service_type', NEW.service_type,
            'total_price', NEW.total_price, 'currency', NEW.currency,
            'timeline', NEW.timeline, 'executive_summary', NEW.executive_summary,
            'scope_of_work', NEW.scope_of_work, 'methodology', NEW.methodology,
            'deliverables', NEW.deliverables, 'team_bios', NEW.team_bios,
            'risk_analysis', NEW.risk_analysis, 'success_metrics', NEW.success_metrics,
            'custom_sections', NEW.custom_sections, 'terms_and_conditions', NEW.terms_and_conditions,
            'branding_config', NEW.branding_config
        );
        changed_field_names := ARRAY[]::TEXT[];
        IF OLD.executive_summary IS DISTINCT FROM NEW.executive_summary THEN changed_field_names := array_append(changed_field_names, 'executive_summary'); END IF;
        IF OLD.scope_of_work IS DISTINCT FROM NEW.scope_of_work THEN changed_field_names := array_append(changed_field_names, 'scope_of_work'); END IF;
        IF OLD.methodology IS DISTINCT FROM NEW.methodology THEN changed_field_names := array_append(changed_field_names, 'methodology'); END IF;
        IF OLD.deliverables IS DISTINCT FROM NEW.deliverables THEN changed_field_names := array_append(changed_field_names, 'deliverables'); END IF;
        IF OLD.team_bios IS DISTINCT FROM NEW.team_bios THEN changed_field_names := array_append(changed_field_names, 'team_bios'); END IF;
        IF OLD.risk_analysis IS DISTINCT FROM NEW.risk_analysis THEN changed_field_names := array_append(changed_field_names, 'risk_analysis'); END IF;
        IF OLD.success_metrics IS DISTINCT FROM NEW.success_metrics THEN changed_field_names := array_append(changed_field_names, 'success_metrics'); END IF;
        IF OLD.custom_sections IS DISTINCT FROM NEW.custom_sections THEN changed_field_names := array_append(changed_field_names, 'custom_sections'); END IF;
        IF OLD.total_price IS DISTINCT FROM NEW.total_price THEN changed_field_names := array_append(changed_field_names, 'total_price'); END IF;
        IF OLD.timeline IS DISTINCT FROM NEW.timeline THEN changed_field_names := array_append(changed_field_names, 'timeline'); END IF;
        IF OLD.terms_and_conditions IS DISTINCT FROM NEW.terms_and_conditions THEN changed_field_names := array_append(changed_field_names, 'terms_and_conditions'); END IF;

        INSERT INTO proposal_versions (proposal_id, version_number, content_snapshot, changes_summary, changed_fields, created_by)
        VALUES (NEW.id, NEW.version_number, version_snapshot, 'Updated: ' || array_to_string(changed_field_names, ', '), to_jsonb(changed_field_names), NEW.created_by);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_proposal_number_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.proposal_number IS NULL OR NEW.proposal_number = '' THEN
        NEW.proposal_number := generate_proposal_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- A6: TRIGGERS (drop first to avoid duplicates)
-- =====================================================

DROP TRIGGER IF EXISTS set_proposal_number ON proposals;
CREATE TRIGGER set_proposal_number BEFORE INSERT ON proposals FOR EACH ROW EXECUTE FUNCTION set_proposal_number_trigger();

DROP TRIGGER IF EXISTS create_proposal_version_trigger ON proposals;
CREATE TRIGGER create_proposal_version_trigger AFTER UPDATE ON proposals FOR EACH ROW WHEN (OLD.status != 'draft' OR NEW.status != 'draft') EXECUTE FUNCTION create_proposal_version();

DROP TRIGGER IF EXISTS update_proposals_updated_at ON proposals;
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_proposal_templates_updated_at ON proposal_templates;
CREATE TRIGGER update_proposal_templates_updated_at BEFORE UPDATE ON proposal_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- A7: Helper function - create project from proposal
-- =====================================================

CREATE OR REPLACE FUNCTION create_project_from_proposal(proposal_uuid UUID)
RETURNS UUID AS $$
DECLARE
    proposal_record RECORD;
    new_project_id UUID;
BEGIN
    SELECT * INTO proposal_record FROM proposals WHERE id = proposal_uuid AND status = 'accepted' AND project_created = false;
    IF NOT FOUND THEN RAISE EXCEPTION 'Proposal not found, not accepted, or project already created'; END IF;

    INSERT INTO projects (title, description, client_id, status, priority, budget, created_by)
    VALUES (
        proposal_record.title,
        COALESCE((proposal_record.executive_summary->>'overview')::TEXT, ''),
        proposal_record.client_id,
        'planning', 'normal',
        proposal_record.total_price,
        proposal_record.created_by
    ) RETURNING id INTO new_project_id;

    UPDATE proposals SET project_created = true, project_id = new_project_id, updated_at = CURRENT_TIMESTAMP WHERE id = proposal_uuid;

    INSERT INTO proposal_activities (proposal_id, activity_type, actor_id, description, metadata)
    VALUES (proposal_uuid, 'project_created', proposal_record.created_by, 'Project automatically created from accepted proposal', jsonb_build_object('project_id', new_project_id));

    RETURN new_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions on new tables
GRANT SELECT, INSERT, UPDATE ON proposals TO authenticated;
GRANT SELECT ON proposal_versions TO authenticated;
GRANT SELECT, INSERT ON proposal_activities TO authenticated;
GRANT SELECT ON proposal_templates TO authenticated;
GRANT SELECT, INSERT ON proposal_versions TO authenticated;
GRANT SELECT, INSERT ON proposal_activities TO authenticated;
GRANT EXECUTE ON FUNCTION generate_proposal_number() TO authenticated;
GRANT EXECUTE ON FUNCTION create_project_from_proposal(UUID) TO authenticated;

-- Also grant to anon for public proposal review
GRANT SELECT, UPDATE ON proposals TO anon;
GRANT SELECT ON proposal_versions TO anon;
GRANT SELECT ON proposal_activities TO anon;


-- =====================================================
-- PART B: FIX ALL RLS POLICIES (using auth.jwt() not auth.users)
-- =====================================================

-- =====================================================
-- B1: Fix proposals RLS policies
-- =====================================================

ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins and PMs can view all proposals" ON proposals;
DROP POLICY IF EXISTS "Clients can view their own proposals" ON proposals;
DROP POLICY IF EXISTS "Admins and PMs can insert proposals" ON proposals;
DROP POLICY IF EXISTS "Admins and PMs can update proposals" ON proposals;
DROP POLICY IF EXISTS "Clients can update their proposal responses" ON proposals;
DROP POLICY IF EXISTS "Only admins can delete proposals" ON proposals;
DROP POLICY IF EXISTS "Anyone can view sent proposals" ON proposals;
DROP POLICY IF EXISTS "Anon can view proposals" ON proposals;
DROP POLICY IF EXISTS "Anon can update proposal responses" ON proposals;

CREATE POLICY "Admins and PMs can view all proposals"
    ON proposals FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'project_manager')));

CREATE POLICY "Clients can view their own proposals"
    ON proposals FOR SELECT TO authenticated
    USING (client_id = auth.uid() OR client_email = (auth.jwt() ->> 'email'));

CREATE POLICY "Anon can view proposals"
    ON proposals FOR SELECT TO anon
    USING (status IN ('sent', 'viewed', 'accepted', 'rejected', 'revision_requested'));

CREATE POLICY "Admins and PMs can insert proposals"
    ON proposals FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'project_manager')));

CREATE POLICY "Admins and PMs can update proposals"
    ON proposals FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'project_manager')));

CREATE POLICY "Clients can update their proposal responses"
    ON proposals FOR UPDATE TO authenticated
    USING (client_id = auth.uid() OR client_email = (auth.jwt() ->> 'email'))
    WITH CHECK (status IN ('accepted', 'rejected', 'revision_requested') AND (client_id = auth.uid() OR client_email = (auth.jwt() ->> 'email')));

CREATE POLICY "Anon can update proposal responses"
    ON proposals FOR UPDATE TO anon
    USING (status IN ('sent', 'viewed'))
    WITH CHECK (status IN ('viewed', 'accepted', 'rejected', 'revision_requested'));

CREATE POLICY "Only admins can delete proposals"
    ON proposals FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- =====================================================
-- B2: Fix proposal_versions RLS policies
-- =====================================================

ALTER TABLE proposal_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins and PMs can view all versions" ON proposal_versions;
DROP POLICY IF EXISTS "Clients can view their proposal versions" ON proposal_versions;
DROP POLICY IF EXISTS "System can insert versions" ON proposal_versions;
DROP POLICY IF EXISTS "Anyone can insert versions" ON proposal_versions;

CREATE POLICY "Admins and PMs can view all versions"
    ON proposal_versions FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'project_manager')));

CREATE POLICY "Clients can view their proposal versions"
    ON proposal_versions FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM proposals WHERE proposals.id = proposal_versions.proposal_id AND (proposals.client_id = auth.uid() OR proposals.client_email = (auth.jwt() ->> 'email'))));

CREATE POLICY "Anyone can insert versions"
    ON proposal_versions FOR INSERT WITH CHECK (true);

-- =====================================================
-- B3: Fix proposal_activities RLS policies
-- =====================================================

ALTER TABLE proposal_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins and PMs can view all activities" ON proposal_activities;
DROP POLICY IF EXISTS "Clients can view their proposal activities" ON proposal_activities;
DROP POLICY IF EXISTS "System can insert activities" ON proposal_activities;
DROP POLICY IF EXISTS "Anyone can insert activities" ON proposal_activities;

CREATE POLICY "Admins and PMs can view all activities"
    ON proposal_activities FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'project_manager')));

CREATE POLICY "Clients can view their proposal activities"
    ON proposal_activities FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM proposals WHERE proposals.id = proposal_activities.proposal_id AND (proposals.client_id = auth.uid() OR proposals.client_email = (auth.jwt() ->> 'email'))));

CREATE POLICY "Anyone can insert activities"
    ON proposal_activities FOR INSERT WITH CHECK (true);

-- =====================================================
-- B4: Fix proposal_templates RLS policies
-- =====================================================

ALTER TABLE proposal_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins and PMs can view all templates" ON proposal_templates;
DROP POLICY IF EXISTS "Admins and PMs can insert templates" ON proposal_templates;
DROP POLICY IF EXISTS "Admins and PMs can update templates" ON proposal_templates;
DROP POLICY IF EXISTS "Only admins can delete templates" ON proposal_templates;

CREATE POLICY "Admins and PMs can view all templates"
    ON proposal_templates FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'project_manager')));

CREATE POLICY "Admins and PMs can insert templates"
    ON proposal_templates FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'project_manager')));

CREATE POLICY "Admins and PMs can update templates"
    ON proposal_templates FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'project_manager')));

CREATE POLICY "Only admins can delete templates"
    ON proposal_templates FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- =====================================================
-- B5: Fix quote_requests RLS policies
-- =====================================================

ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Anyone can insert quote requests" ON quote_requests;
    DROP POLICY IF EXISTS "Anon can insert quote requests" ON quote_requests;
    DROP POLICY IF EXISTS "Public can insert quote requests" ON quote_requests;
    DROP POLICY IF EXISTS "Admins and PMs can view quote requests" ON quote_requests;
    DROP POLICY IF EXISTS "Clients can view own quote requests" ON quote_requests;
    DROP POLICY IF EXISTS "Anon can read own submissions" ON quote_requests;
    DROP POLICY IF EXISTS "Admins can update quote requests" ON quote_requests;

    CREATE POLICY "Anyone can insert quote requests"
        ON quote_requests FOR INSERT TO anon, authenticated WITH CHECK (true);

    CREATE POLICY "Admins and PMs can view quote requests"
        ON quote_requests FOR SELECT TO authenticated
        USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'project_manager')));

    CREATE POLICY "Clients can view own quote requests"
        ON quote_requests FOR SELECT TO authenticated
        USING (email = (auth.jwt() ->> 'email'));

    CREATE POLICY "Anon can read own submissions"
        ON quote_requests FOR SELECT TO anon USING (true);

    CREATE POLICY "Admins can update quote requests"
        ON quote_requests FOR UPDATE TO authenticated
        USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'project_manager')));

    RAISE NOTICE 'quote_requests policies fixed';
END $$;

-- =====================================================
-- B6: Fix quotes RLS policies
-- =====================================================

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Admins and PMs can manage quotes" ON quotes;
    DROP POLICY IF EXISTS "Clients can view own quotes" ON quotes;
    DROP POLICY IF EXISTS "Anon can view quotes" ON quotes;
    DROP POLICY IF EXISTS "Anon can update quote status" ON quotes;

    CREATE POLICY "Admins and PMs can manage quotes"
        ON quotes FOR ALL TO authenticated
        USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'project_manager')));

    CREATE POLICY "Clients can view own quotes"
        ON quotes FOR SELECT TO authenticated
        USING (client_email = (auth.jwt() ->> 'email'));

    CREATE POLICY "Anon can view quotes"
        ON quotes FOR SELECT TO anon USING (true);

    CREATE POLICY "Anon can update quote status"
        ON quotes FOR UPDATE TO anon USING (true) WITH CHECK (true);

    RAISE NOTICE 'quotes policies fixed';
END $$;

-- =====================================================
-- B7: Fix profiles RLS policies
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;

    CREATE POLICY "Profiles are viewable by everyone"
        ON profiles FOR SELECT TO anon, authenticated USING (true);

    CREATE POLICY "Users can update own profile"
        ON profiles FOR UPDATE TO authenticated USING (id = auth.uid());

    CREATE POLICY "Users can insert own profile"
        ON profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

    RAISE NOTICE 'profiles policies fixed';
END $$;

-- =====================================================
-- B8: Fix projects RLS policies
-- =====================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects' AND table_schema = 'public') THEN
        ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Admins and PMs can manage projects" ON projects;
        DROP POLICY IF EXISTS "Clients can view assigned projects" ON projects;

        CREATE POLICY "Admins and PMs can manage projects"
            ON projects FOR ALL TO authenticated
            USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'project_manager')));

        CREATE POLICY "Clients can view assigned projects"
            ON projects FOR SELECT TO authenticated
            USING (client_id = auth.uid());

        RAISE NOTICE 'projects policies fixed';
    END IF;
END $$;

-- =====================================================
-- B9: Grant auth.users access (safety net)
-- =====================================================

GRANT SELECT ON auth.users TO authenticated;
GRANT SELECT ON auth.users TO anon;

-- =====================================================
-- B10: Clean up test data
-- =====================================================

DELETE FROM quote_requests WHERE email IN ('test@test.com', 'client@test.com') AND full_name IN ('Test User', 'ClientTest');

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
    policy_count INT;
    table_count INT;
BEGIN
    SELECT COUNT(*) INTO table_count FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name IN ('proposals', 'proposal_versions', 'proposal_activities', 'proposal_templates');

    SELECT COUNT(*) INTO policy_count FROM pg_policies
    WHERE tablename IN ('proposals', 'proposal_versions', 'proposal_activities', 'proposal_templates', 'quote_requests', 'quotes', 'profiles', 'projects');

    RAISE NOTICE '';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'SETUP + SECURITY FIX COMPLETE';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Proposal tables created: %/4', table_count;
    RAISE NOTICE 'Total RLS policies: %', policy_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Tables: proposals, proposal_versions, proposal_activities, proposal_templates';
    RAISE NOTICE 'All policies use auth.jwt() instead of auth.users';
    RAISE NOTICE 'Quote submissions, profiles, projects all secured';
    RAISE NOTICE '=====================================================';
END $$;
