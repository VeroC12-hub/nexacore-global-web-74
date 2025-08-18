-- Create client portal tables

-- Projects table for tracking client projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'review', 'completed', 'on_hold')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  budget DECIMAL(10,2),
  spent_amount DECIMAL(10,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  estimated_completion DATE,
  actual_completion DATE,
  service_type TEXT NOT NULL,
  project_manager_id UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tasks/milestones for projects
CREATE TABLE public.project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to UUID REFERENCES auth.users(id),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  dependencies TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Project files and documents
CREATE TABLE public.project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  version INTEGER DEFAULT 1,
  is_latest BOOLEAN DEFAULT true,
  uploaded_by UUID REFERENCES auth.users(id),
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'deliverable', 'reference', 'contract', 'invoice')),
  access_level TEXT DEFAULT 'client' CHECK (access_level IN ('client', 'internal', 'public')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Service requests from clients
CREATE TABLE public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('new_project', 'change_order', 'support', 'consultation')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'approved', 'in_progress', 'completed', 'rejected')),
  budget_estimate DECIMAL(10,2),
  requested_completion DATE,
  assigned_to UUID REFERENCES auth.users(id),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  response_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Communication messages
CREATE TABLE public.project_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'general' CHECK (message_type IN ('general', 'update', 'question', 'feedback', 'approval_request')),
  is_internal BOOLEAN DEFAULT false,
  parent_message_id UUID REFERENCES public.project_messages(id),
  attachments JSONB DEFAULT '[]',
  read_by JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Invoices for project billing
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id),
  invoice_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date DATE,
  paid_date DATE,
  payment_method TEXT,
  stripe_payment_intent_id TEXT,
  notes TEXT,
  line_items JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Client portal access and preferences
CREATE TABLE public.client_portal_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}',
  dashboard_layout JSONB DEFAULT '{}',
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_portal_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients to see their own data
CREATE POLICY "Clients can view their own projects" ON public.projects
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Clients can view their project tasks" ON public.project_tasks
  FOR SELECT USING (project_id IN (SELECT id FROM public.projects WHERE client_id = auth.uid()));

CREATE POLICY "Clients can view their project files" ON public.project_files
  FOR SELECT USING (project_id IN (SELECT id FROM public.projects WHERE client_id = auth.uid()) AND access_level IN ('client', 'public'));

CREATE POLICY "Clients can create service requests" ON public.service_requests
  FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can view their service requests" ON public.service_requests
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Clients can view their project messages" ON public.project_messages
  FOR SELECT USING (project_id IN (SELECT id FROM public.projects WHERE client_id = auth.uid()) AND is_internal = false);

CREATE POLICY "Clients can send project messages" ON public.project_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid() AND project_id IN (SELECT id FROM public.projects WHERE client_id = auth.uid()));

CREATE POLICY "Clients can view their invoices" ON public.invoices
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Clients can manage their portal settings" ON public.client_portal_settings
  FOR ALL USING (client_id = auth.uid());

-- Admin/staff policies (can manage all data)
CREATE POLICY "Staff can manage all projects" ON public.projects
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff', 'project_manager')));

CREATE POLICY "Staff can manage all tasks" ON public.project_tasks
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff', 'project_manager')));

CREATE POLICY "Staff can manage all files" ON public.project_files
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff', 'project_manager')));

CREATE POLICY "Staff can manage service requests" ON public.service_requests
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff', 'project_manager')));

CREATE POLICY "Staff can manage all messages" ON public.project_messages
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff', 'project_manager')));

CREATE POLICY "Staff can manage all invoices" ON public.invoices
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff', 'project_manager')));

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_tasks_updated_at BEFORE UPDATE ON public.project_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_portal_settings_updated_at BEFORE UPDATE ON public.client_portal_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number = 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 6));
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_invoice_number_trigger BEFORE INSERT ON public.invoices FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();