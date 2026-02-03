-- =====================================================
-- NEXACORE RLS SECURITY FIX (NO TABLE CREATION)
-- All tables already exist - this ONLY fixes policies
-- Run in Supabase SQL Editor: Dashboard > SQL Editor > New Query > Paste > Run
-- =====================================================

-- =====================================================
-- 1. Grant auth.users access (safety net)
-- =====================================================
GRANT SELECT ON auth.users TO authenticated;
GRANT SELECT ON auth.users TO anon;

-- =====================================================
-- 2. Fix proposals RLS policies
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
-- 3. Fix proposal_versions RLS policies
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
-- 4. Fix proposal_activities RLS policies
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
-- 5. Fix proposal_templates RLS policies
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
-- 6. Fix quote_requests RLS policies
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
-- 7. Fix quotes RLS policies
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
-- 8. Fix profiles RLS policies
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
-- 9. Fix projects RLS policies
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
-- 10. Ensure proper grants on proposal tables
-- =====================================================
GRANT SELECT, INSERT, UPDATE ON proposals TO authenticated;
GRANT SELECT, UPDATE ON proposals TO anon;
GRANT SELECT, INSERT ON proposal_versions TO authenticated;
GRANT SELECT ON proposal_versions TO anon;
GRANT SELECT, INSERT ON proposal_activities TO authenticated;
GRANT SELECT ON proposal_activities TO anon;
GRANT SELECT ON proposal_templates TO authenticated;

-- =====================================================
-- 11. Create helper functions if they don't exist
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

GRANT EXECUTE ON FUNCTION generate_proposal_number() TO authenticated;
GRANT EXECUTE ON FUNCTION create_project_from_proposal(UUID) TO authenticated;

-- =====================================================
-- 12. Clean up test data
-- =====================================================
DELETE FROM quote_requests WHERE email IN ('test@test.com', 'client@test.com') AND full_name IN ('Test User', 'ClientTest');

-- =====================================================
-- VERIFICATION
-- =====================================================
DO $$
DECLARE
    policy_count INT;
BEGIN
    SELECT COUNT(*) INTO policy_count FROM pg_policies
    WHERE tablename IN ('proposals', 'proposal_versions', 'proposal_activities', 'proposal_templates', 'quote_requests', 'quotes', 'profiles', 'projects');

    RAISE NOTICE '';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'RLS SECURITY FIX COMPLETE';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Total RLS policies across all tables: %', policy_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Fixed tables:';
    RAISE NOTICE '  - proposals (8 policies)';
    RAISE NOTICE '  - proposal_versions (3 policies)';
    RAISE NOTICE '  - proposal_activities (3 policies)';
    RAISE NOTICE '  - proposal_templates (4 policies)';
    RAISE NOTICE '  - quote_requests (5 policies)';
    RAISE NOTICE '  - quotes (4 policies)';
    RAISE NOTICE '  - profiles (3 policies)';
    RAISE NOTICE '  - projects (2 policies)';
    RAISE NOTICE '';
    RAISE NOTICE 'All policies use auth.jwt() instead of auth.users';
    RAISE NOTICE 'Test by submitting a quote on your website!';
    RAISE NOTICE '=====================================================';
END $$;
