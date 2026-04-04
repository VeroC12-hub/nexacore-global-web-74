-- Create erp_time_entries table for ERP time tracking
-- This table is separate from the legacy time_entries table and is used by the ERP module.

CREATE TABLE IF NOT EXISTS public.erp_time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  erp_project_id UUID NOT NULL REFERENCES public.erp_projects(id) ON DELETE CASCADE,
  erp_task_id UUID REFERENCES public.erp_tasks(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  hours DECIMAL(6, 2) NOT NULL CHECK (hours > 0),
  hourly_rate DECIMAL(8, 2) DEFAULT 0 CHECK (hourly_rate >= 0),
  billable BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'invoiced')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_erp_time_entries_user ON public.erp_time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_erp_time_entries_project ON public.erp_time_entries(erp_project_id);
CREATE INDEX IF NOT EXISTS idx_erp_time_entries_task ON public.erp_time_entries(erp_task_id);
CREATE INDEX IF NOT EXISTS idx_erp_time_entries_date ON public.erp_time_entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_erp_time_entries_status ON public.erp_time_entries(status);

-- Auto-update updated_at
CREATE OR REPLACE TRIGGER update_erp_time_entries_updated_at
  BEFORE UPDATE ON public.erp_time_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.erp_time_entries ENABLE ROW LEVEL SECURITY;

-- Admins and managers can see all entries
CREATE POLICY erp_time_entries_admin_all ON public.erp_time_entries
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'project_manager', 'operations_manager')
    )
  );

-- Staff can view and manage their own entries
CREATE POLICY erp_time_entries_own ON public.erp_time_entries
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

GRANT ALL ON public.erp_time_entries TO authenticated;
