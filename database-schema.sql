-- ==============================================================
-- NexaCore ERP System - Database Schema
-- ==============================================================
-- Description: Complete database schema for ERP project management
-- Date: December 26, 2025
-- Version: 1.0.0
-- ==============================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================
-- TABLE: erp_projects
-- Description: Main project management table
-- ==============================================================
CREATE TABLE IF NOT EXISTS erp_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  department TEXT NOT NULL CHECK (department IN (
    'cad_engineering',
    'civil_engineering',
    'architecture',
    'software_development',
    'ai_ml',
    'digital_services',
    'consulting',
    'operations',
    'finance',
    'hr',
    'marketing'
  )),
  project_type TEXT NOT NULL CHECK (project_type IN (
    'client',
    'internal',
    'research',
    'training',
    'maintenance'
  )),
  status TEXT NOT NULL CHECK (status IN (
    'pending',
    'in_progress',
    'completed',
    'on_hold',
    'cancelled'
  )),
  priority TEXT NOT NULL CHECK (priority IN (
    'low',
    'medium',
    'high',
    'urgent'
  )),
  budget DECIMAL(12, 2) NOT NULL CHECK (budget > 0),
  actual_cost DECIMAL(12, 2) DEFAULT 0 CHECK (actual_cost >= 0),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL CHECK (end_date >= start_date),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX idx_erp_projects_status ON erp_projects(status);
CREATE INDEX idx_erp_projects_department ON erp_projects(department);
CREATE INDEX idx_erp_projects_is_active ON erp_projects(is_active);
CREATE INDEX idx_erp_projects_created_at ON erp_projects(created_at DESC);

-- ==============================================================
-- TABLE: erp_tasks
-- Description: Task management linked to projects
-- ==============================================================
CREATE TABLE IF NOT EXISTS erp_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN (
    'new',
    'in_progress',
    'review',
    'completed'
  )),
  priority TEXT NOT NULL CHECK (priority IN (
    'low',
    'medium',
    'high',
    'urgent'
  )),
  erp_project_id UUID NOT NULL REFERENCES erp_projects(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  due_date DATE NOT NULL,
  estimated_hours DECIMAL(6, 2) NOT NULL CHECK (estimated_hours > 0),
  actual_hours DECIMAL(6, 2) DEFAULT 0 CHECK (actual_hours >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX idx_erp_tasks_project ON erp_tasks(erp_project_id);
CREATE INDEX idx_erp_tasks_assignee ON erp_tasks(assigned_to);
CREATE INDEX idx_erp_tasks_status ON erp_tasks(status);
CREATE INDEX idx_erp_tasks_priority ON erp_tasks(priority);
CREATE INDEX idx_erp_tasks_due_date ON erp_tasks(due_date);

-- ==============================================================
-- TABLE: erp_time_entries
-- Description: Time tracking for projects and tasks
-- ==============================================================
CREATE TABLE IF NOT EXISTS erp_time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  erp_project_id UUID NOT NULL REFERENCES erp_projects(id) ON DELETE CASCADE,
  erp_task_id UUID REFERENCES erp_tasks(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  hours DECIMAL(6, 2) NOT NULL CHECK (hours > 0),
  hourly_rate DECIMAL(8, 2) DEFAULT 0 CHECK (hourly_rate >= 0),
  billable BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'approved',
    'rejected'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX idx_erp_time_entries_user ON erp_time_entries(user_id);
CREATE INDEX idx_erp_time_entries_project ON erp_time_entries(erp_project_id);
CREATE INDEX idx_erp_time_entries_task ON erp_time_entries(erp_task_id);
CREATE INDEX idx_erp_time_entries_date ON erp_time_entries(date DESC);
CREATE INDEX idx_erp_time_entries_status ON erp_time_entries(status);

-- ==============================================================
-- TABLE: project_members
-- Description: Team member assignments to projects
-- ==============================================================
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES erp_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN (
    'manager',
    'lead',
    'developer',
    'designer',
    'tester',
    'analyst',
    'consultant',
    'contributor',
    'cad_engineer',
    'cad_designer',
    'cad_drafter',
    'civil_engineer',
    'structural_engineer',
    'mechanical_engineer',
    'electrical_engineer',
    'architect',
    'ai_specialist'
  )),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(project_id, user_id)
);

-- Add indexes for common queries
CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);
CREATE INDEX idx_project_members_is_active ON project_members(is_active);

-- ==============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================

-- Enable RLS on all tables
ALTER TABLE erp_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Projects: Admins and managers can see all, staff can see assigned
CREATE POLICY "Admin full access to projects"
  ON erp_projects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Staff can view assigned projects"
  ON erp_projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = erp_projects.id
      AND project_members.user_id = auth.uid()
      AND project_members.is_active = true
    )
  );

-- Tasks: Admins and managers can see all, staff can see assigned
CREATE POLICY "Admin full access to tasks"
  ON erp_tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Staff can view assigned tasks"
  ON erp_tasks FOR SELECT
  USING (assigned_to = auth.uid());

CREATE POLICY "Staff can update their tasks"
  ON erp_tasks FOR UPDATE
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

-- Time Entries: Users can manage their own, admins can manage all
CREATE POLICY "Users can manage own time entries"
  ON erp_time_entries FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Admin full access to time entries"
  ON erp_time_entries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

-- Project Members: Admins can manage, staff can view
CREATE POLICY "Admin full access to project members"
  ON project_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Staff can view project members"
  ON project_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
      AND pm.is_active = true
    )
  );

-- ==============================================================
-- FUNCTIONS AND TRIGGERS
-- ==============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_erp_projects_updated_at
  BEFORE UPDATE ON erp_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_erp_tasks_updated_at
  BEFORE UPDATE ON erp_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_erp_time_entries_updated_at
  BEFORE UPDATE ON erp_time_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================
-- VIEWS FOR COMMON QUERIES
-- ==============================================================

-- View: Project summary with task counts
CREATE OR REPLACE VIEW erp_project_summary AS
SELECT
  p.id,
  p.title,
  p.department,
  p.status,
  p.priority,
  p.budget,
  p.actual_cost,
  p.progress,
  COUNT(DISTINCT t.id) as task_count,
  COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
  COUNT(DISTINCT pm.user_id) as team_size,
  SUM(COALESCE(te.hours, 0)) as total_hours_logged
FROM erp_projects p
LEFT JOIN erp_tasks t ON t.erp_project_id = p.id
LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.is_active = true
LEFT JOIN erp_time_entries te ON te.erp_project_id = p.id
GROUP BY p.id;

-- View: User workload
CREATE OR REPLACE VIEW erp_user_workload AS
SELECT
  p.id as user_id,
  p.full_name,
  p.email,
  COUNT(DISTINCT t.id) as assigned_tasks,
  COUNT(DISTINCT CASE WHEN t.status != 'completed' THEN t.id END) as active_tasks,
  COUNT(DISTINCT pm.project_id) as active_projects,
  SUM(COALESCE(te.hours, 0)) as total_hours_this_month
FROM profiles p
LEFT JOIN erp_tasks t ON t.assigned_to = p.id
LEFT JOIN project_members pm ON pm.user_id = p.id AND pm.is_active = true
LEFT JOIN erp_time_entries te ON te.user_id = p.id
  AND te.date >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY p.id, p.full_name, p.email;

-- ==============================================================
-- GRANT PERMISSIONS
-- ==============================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON erp_projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON erp_tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON erp_time_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON project_members TO authenticated;

-- Grant SELECT on views
GRANT SELECT ON erp_project_summary TO authenticated;
GRANT SELECT ON erp_user_workload TO authenticated;

-- ==============================================================
-- END OF SCHEMA
-- ==============================================================
