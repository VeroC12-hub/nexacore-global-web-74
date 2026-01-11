import { supabase } from '@/integrations/supabase/client';

// This service will create the workflow tables in production Supabase
export const runWorkflowMigration = async () => {
  console.log('Running workflow automation migration...');
  
  try {
    // Check if workflow_templates table already exists by querying it
    const { error: checkError } = await supabase
      .from('workflow_templates')
      .select('id')
      .limit(1);

    if (!checkError) {
      console.log('Workflow tables already exist, skipping migration');
      return { success: true, message: 'Tables already exist' };
    }

    // Since we can't run DDL from client, we'll return instructions
    const migrationSQL = `
-- Phase 6: Enterprise Features - Workflow Automation System
-- Create comprehensive workflow automation tables

-- Workflow Templates Table
CREATE TABLE public.workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT workflow_templates_category_check 
  CHECK (category IN ('project', 'approval', 'communication', 'general', 'hr', 'finance'))
);

-- Continue with other tables...
`;

    console.log('Workflow migration SQL ready. Tables need to be created in Supabase dashboard.');
    return { 
      success: false, 
      message: 'Tables need to be created manually in Supabase dashboard',
      sql: migrationSQL
    };

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

// Check if workflow tables exist and are ready
export const checkWorkflowTablesExist = async () => {
  try {
    // Try to query workflow_templates table
    const { data, error } = await supabase
      .from('workflow_templates')
      .select('id')
      .limit(1);

    if (error) {
      console.log('Workflow tables do not exist yet:', error.message);
      return false;
    }

    console.log('Workflow tables exist and are accessible');
    return true;
  } catch (error) {
    console.log('Error checking workflow tables:', error);
    return false;
  }
};
