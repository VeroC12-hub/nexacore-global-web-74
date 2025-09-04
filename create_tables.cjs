const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const url = process.env.VITE_SUPABASE_URL || 'https://vxbnupdgkvsqyevyofqq.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4Ym51cGRna3ZzcXlldnlvZnFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMzM2MjM2NiwiZXhwIjoyMDM4OTM4MzY2fQ.yJvPYNGBAGpCuRb2i4dKGlnP0KYSFzb-qqx4O3fGNTQ';

const supabase = createClient(url, serviceKey);

async function runMigration() {
  console.log('Creating ERP tables...');
  
  // Create the basic tables we need first
  const createTablesSQL = `
    -- Enable UUID extension if not already enabled
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- Create tenants table for multi-tenant architecture
    CREATE TABLE IF NOT EXISTS tenants (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      domain TEXT UNIQUE,
      settings JSONB DEFAULT '{}',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Create projects table for project management
    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
      title TEXT NOT NULL,
      description TEXT,
      client_id UUID,
      manager_id UUID,
      status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'in_progress', 'on_hold', 'completed', 'cancelled')),
      priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
      budget DECIMAL(12,2),
      start_date DATE,
      end_date DATE,
      expected_end_date DATE,
      progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
      tags TEXT[] DEFAULT '{}',
      metadata JSONB DEFAULT '{}',
      is_billable BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Create tasks table for project task management
    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
      project_id UUID,
      title TEXT NOT NULL,
      description TEXT,
      assigned_to UUID,
      created_by UUID,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'review', 'completed', 'blocked', 'cancelled')),
      priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
      due_date TIMESTAMP WITH TIME ZONE,
      estimated_hours DECIMAL(5,2),
      actual_hours DECIMAL(5,2) DEFAULT 0,
      completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
      tags TEXT[] DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Create time_entries table for time tracking
    CREATE TABLE IF NOT EXISTS time_entries (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
      user_id UUID,
      project_id UUID,
      task_id UUID,
      description TEXT,
      hours DECIMAL(4,2) NOT NULL CHECK (hours > 0),
      billable BOOLEAN DEFAULT true,
      hourly_rate DECIMAL(8,2),
      total_amount DECIMAL(10,2),
      date DATE DEFAULT CURRENT_DATE,
      start_time TIMESTAMP WITH TIME ZONE,
      end_time TIMESTAMP WITH TIME ZONE,
      is_approved BOOLEAN DEFAULT false,
      approved_by UUID,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Insert default tenant for NexaCore
    INSERT INTO tenants (id, name, domain, settings) 
    VALUES (
      '00000000-0000-0000-0000-000000000001',
      'NexaCore Innovations',
      'nexacore-innovations.com',
      '{"theme": "default", "timezone": "UTC", "business_hours": "9-17"}'
    ) ON CONFLICT (id) DO NOTHING;
  `;

  try {
    // Try to execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: createTablesSQL });
    
    if (error) {
      console.error('Error creating tables:', error);
      return;
    }
    
    console.log('Tables created successfully!');
    
    // Test if tables exist
    const { data: projectsTest } = await supabase
      .from('projects')
      .select('count', { count: 'exact' })
      .limit(1);
      
    console.log('Projects table test: Success');
    
    const { data: tasksTest } = await supabase
      .from('tasks')
      .select('count', { count: 'exact' })
      .limit(1);
      
    console.log('Tasks table test: Success');
    
    const { data: timeTest } = await supabase
      .from('time_entries')
      .select('count', { count: 'exact' })
      .limit(1);
      
    console.log('Time entries table test: Success');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration();