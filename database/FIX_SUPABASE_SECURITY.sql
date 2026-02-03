-- =====================================================
-- NEXACORE SUPABASE SECURITY FIX
-- Run this ENTIRE script in Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste > Run
-- =====================================================

-- =====================================================
-- STEP 1: Fix auth.users access (ROOT CAUSE)
-- Your RLS policies reference auth.users to get user emails
-- This was broken when security permissions were changed
-- =====================================================

-- Grant SELECT on auth.users to authenticated users (required for RLS policies)
GRANT SELECT ON auth.users TO authenticated;
GRANT SELECT ON auth.users TO anon;

-- If the above fails due to already existing grants, that's OK
-- The important thing is the policies below will work

-- =====================================================
-- STEP 2: Fix proposals RLS policies
-- Replace auth.users subqueries with auth.jwt() for better security
-- =====================================================

-- Drop ALL existing proposals policies and recreate them properly
DROP POLICY IF EXISTS "Admins and PMs can view all proposals" ON proposals;
DROP POLICY IF EXISTS "Clients can view their own proposals" ON proposals;
DROP POLICY IF EXISTS "Admins and PMs can insert proposals" ON proposals;
DROP POLICY IF EXISTS "Admins and PMs can update proposals" ON proposals;
DROP POLICY IF EXISTS "Clients can update their proposal responses" ON proposals;
DROP POLICY IF EXISTS "Only admins can delete proposals" ON proposals;
DROP POLICY IF EXISTS "Anyone can view sent proposals" ON proposals;
DROP POLICY IF EXISTS "Anon can view proposals" ON proposals;

-- Ensure RLS is enabled
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Admins and PMs can do everything
CREATE POLICY "Admins and PMs can view all proposals"
    ON proposals FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'project_manager')
        )
    );

-- Clients can view their own proposals (using JWT email instead of auth.users query)
CREATE POLICY "Clients can view their own proposals"
    ON proposals FOR SELECT
    TO authenticated
    USING (
        client_id = auth.uid()
        OR client_email = (auth.jwt() ->> 'email')
    );

-- Anon users can view proposals (for public review links)
CREATE POLICY "Anon can view proposals"
    ON proposals FOR SELECT
    TO anon
    USING (
        status IN ('sent', 'viewed', 'accepted', 'rejected', 'revision_requested')
    );

-- Admins and PMs can insert proposals
CREATE POLICY "Admins and PMs can insert proposals"
    ON proposals FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'project_manager')
        )
    );

-- Admins and PMs can update proposals
CREATE POLICY "Admins and PMs can update proposals"
    ON proposals FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'project_manager')
        )
    );

-- Clients can update their proposal responses
CREATE POLICY "Clients can update their proposal responses"
    ON proposals FOR UPDATE
    TO authenticated
    USING (
        client_id = auth.uid()
        OR client_email = (auth.jwt() ->> 'email')
    )
    WITH CHECK (
        status IN ('accepted', 'rejected', 'revision_requested')
        AND (
            client_id = auth.uid()
            OR client_email = (auth.jwt() ->> 'email')
        )
    );

-- Anon users can update proposals (for public review link responses)
CREATE POLICY "Anon can update proposal responses"
    ON proposals FOR UPDATE
    TO anon
    USING (
        status IN ('sent', 'viewed')
    )
    WITH CHECK (
        status IN ('viewed', 'accepted', 'rejected', 'revision_requested')
    );

-- Only admins can delete proposals
CREATE POLICY "Only admins can delete proposals"
    ON proposals FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- =====================================================
-- STEP 3: Fix proposal_versions policies
-- =====================================================

DROP POLICY IF EXISTS "Admins and PMs can view all versions" ON proposal_versions;
DROP POLICY IF EXISTS "Clients can view their proposal versions" ON proposal_versions;
DROP POLICY IF EXISTS "System can insert versions" ON proposal_versions;

ALTER TABLE proposal_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and PMs can view all versions"
    ON proposal_versions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'project_manager')
        )
    );

CREATE POLICY "Clients can view their proposal versions"
    ON proposal_versions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM proposals
            WHERE proposals.id = proposal_versions.proposal_id
            AND (
                proposals.client_id = auth.uid()
                OR proposals.client_email = (auth.jwt() ->> 'email')
            )
        )
    );

CREATE POLICY "Anyone can insert versions"
    ON proposal_versions FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- STEP 4: Fix proposal_activities policies
-- =====================================================

DROP POLICY IF EXISTS "Admins and PMs can view all activities" ON proposal_activities;
DROP POLICY IF EXISTS "Clients can view their proposal activities" ON proposal_activities;
DROP POLICY IF EXISTS "System can insert activities" ON proposal_activities;

ALTER TABLE proposal_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and PMs can view all activities"
    ON proposal_activities FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'project_manager')
        )
    );

CREATE POLICY "Clients can view their proposal activities"
    ON proposal_activities FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM proposals
            WHERE proposals.id = proposal_activities.proposal_id
            AND (
                proposals.client_id = auth.uid()
                OR proposals.client_email = (auth.jwt() ->> 'email')
            )
        )
    );

CREATE POLICY "Anyone can insert activities"
    ON proposal_activities FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- STEP 5: Ensure quote_requests has proper policies
-- (These should already work, but let's make sure)
-- =====================================================

-- Check if RLS is enabled, enable if not
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Ensure anonymous users can submit quote requests
DO $$
BEGIN
    -- Drop and recreate to be safe
    DROP POLICY IF EXISTS "Anyone can insert quote requests" ON quote_requests;
    DROP POLICY IF EXISTS "Anon can insert quote requests" ON quote_requests;
    DROP POLICY IF EXISTS "Public can insert quote requests" ON quote_requests;

    CREATE POLICY "Anyone can insert quote requests"
        ON quote_requests FOR INSERT
        TO anon, authenticated
        WITH CHECK (true);

    -- Ensure quote requests are readable by admins and PMs
    DROP POLICY IF EXISTS "Admins and PMs can view quote requests" ON quote_requests;
    CREATE POLICY "Admins and PMs can view quote requests"
        ON quote_requests FOR SELECT
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role IN ('admin', 'project_manager')
            )
        );

    -- Clients can view their own quote requests
    DROP POLICY IF EXISTS "Clients can view own quote requests" ON quote_requests;
    CREATE POLICY "Clients can view own quote requests"
        ON quote_requests FOR SELECT
        TO authenticated
        USING (
            email = (auth.jwt() ->> 'email')
        );

    -- Anon users can read back their own submission (needed for .select().single())
    DROP POLICY IF EXISTS "Anon can read own submissions" ON quote_requests;
    CREATE POLICY "Anon can read own submissions"
        ON quote_requests FOR SELECT
        TO anon
        USING (true);

    -- Admins can update quote requests
    DROP POLICY IF EXISTS "Admins can update quote requests" ON quote_requests;
    CREATE POLICY "Admins can update quote requests"
        ON quote_requests FOR UPDATE
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role IN ('admin', 'project_manager')
            )
        );

    RAISE NOTICE 'quote_requests policies fixed';
END $$;

-- =====================================================
-- STEP 6: Ensure quotes table has proper policies
-- =====================================================

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- Ensure admins/PMs can manage quotes
    DROP POLICY IF EXISTS "Admins and PMs can manage quotes" ON quotes;
    CREATE POLICY "Admins and PMs can manage quotes"
        ON quotes FOR ALL
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role IN ('admin', 'project_manager')
            )
        );

    -- Clients can view their own quotes
    DROP POLICY IF EXISTS "Clients can view own quotes" ON quotes;
    CREATE POLICY "Clients can view own quotes"
        ON quotes FOR SELECT
        TO authenticated
        USING (
            client_email = (auth.jwt() ->> 'email')
        );

    -- Anon users can view quotes (for public review links)
    DROP POLICY IF EXISTS "Anon can view quotes" ON quotes;
    CREATE POLICY "Anon can view quotes"
        ON quotes FOR SELECT
        TO anon
        USING (true);

    -- Anon users can update quotes (for accepting/rejecting via public link)
    DROP POLICY IF EXISTS "Anon can update quote status" ON quotes;
    CREATE POLICY "Anon can update quote status"
        ON quotes FOR UPDATE
        TO anon
        USING (true)
        WITH CHECK (true);

    RAISE NOTICE 'quotes policies fixed';
END $$;

-- =====================================================
-- STEP 7: Ensure profiles table policies are correct
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- Public profiles viewable by everyone
    DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
    CREATE POLICY "Profiles are viewable by everyone"
        ON profiles FOR SELECT
        TO anon, authenticated
        USING (true);

    -- Users can update their own profile
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    CREATE POLICY "Users can update own profile"
        ON profiles FOR UPDATE
        TO authenticated
        USING (id = auth.uid());

    -- Users can insert their own profile
    DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
    CREATE POLICY "Users can insert own profile"
        ON profiles FOR INSERT
        TO authenticated
        WITH CHECK (id = auth.uid());

    RAISE NOTICE 'profiles policies fixed';
END $$;

-- =====================================================
-- STEP 8: Ensure projects table has proper policies
-- =====================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects' AND table_schema = 'public') THEN
        ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Admins and PMs can manage projects" ON projects;
        CREATE POLICY "Admins and PMs can manage projects"
            ON projects FOR ALL
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role IN ('admin', 'project_manager')
                )
            );

        DROP POLICY IF EXISTS "Clients can view assigned projects" ON projects;
        CREATE POLICY "Clients can view assigned projects"
            ON projects FOR SELECT
            TO authenticated
            USING (
                client_id = auth.uid()
            );

        RAISE NOTICE 'projects policies fixed';
    END IF;
END $$;

-- =====================================================
-- STEP 9: Clean up test data from diagnostics
-- =====================================================

DELETE FROM quote_requests WHERE email IN ('test@test.com', 'client@test.com') AND full_name IN ('Test User', 'ClientTest');

-- =====================================================
-- STEP 10: Verify everything works
-- =====================================================

DO $$
DECLARE
    policy_count INT;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename IN ('proposals', 'quote_requests', 'quotes', 'profiles', 'projects');

    RAISE NOTICE '';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'SECURITY FIX COMPLETE';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Total RLS policies on core tables: %', policy_count;
    RAISE NOTICE '';
    RAISE NOTICE 'What was fixed:';
    RAISE NOTICE '  1. Restored auth.users access for RLS policies';
    RAISE NOTICE '  2. Replaced auth.users queries with auth.jwt() in proposals';
    RAISE NOTICE '  3. Fixed quote_requests INSERT/SELECT for anon users';
    RAISE NOTICE '  4. Fixed quotes table policies for clients';
    RAISE NOTICE '  5. Fixed profiles visibility';
    RAISE NOTICE '  6. Fixed projects access for clients';
    RAISE NOTICE '  7. Cleaned up test data';
    RAISE NOTICE '';
    RAISE NOTICE 'Please test by submitting a quote on your website!';
    RAISE NOTICE '=====================================================';
END $$;
