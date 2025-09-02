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

-- Workflow Instances Table
CREATE TABLE public.workflow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_template_id UUID REFERENCES public.workflow_templates(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'normal',
  initiated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT workflow_instances_status_check 
  CHECK (status IN ('pending', 'in_progress', 'waiting_approval', 'approved', 'rejected', 'completed', 'cancelled')),
  
  CONSTRAINT workflow_instances_priority_check 
  CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

-- Workflow Steps Table
CREATE TABLE public.workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_template_id UUID REFERENCES public.workflow_templates(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  step_type TEXT NOT NULL DEFAULT 'task',
  auto_assign_to TEXT, -- role or specific user
  requires_approval BOOLEAN DEFAULT false,
  is_parallel BOOLEAN DEFAULT false,
  estimated_duration_hours INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT workflow_steps_type_check 
  CHECK (step_type IN ('task', 'approval', 'notification', 'integration', 'condition')),
  
  UNIQUE(workflow_template_id, step_order)
);

-- Workflow Step Instances Table
CREATE TABLE public.workflow_step_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_instance_id UUID REFERENCES public.workflow_instances(id) ON DELETE CASCADE,
  workflow_step_id UUID REFERENCES public.workflow_steps(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  completed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT workflow_step_instances_status_check 
  CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'failed'))
);

-- Workflow Approvals Table
CREATE TABLE public.workflow_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_step_instance_id UUID REFERENCES public.workflow_step_instances(id) ON DELETE CASCADE,
  approver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  comments TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT workflow_approvals_status_check 
  CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Workflow Automation Rules Table
CREATE TABLE public.workflow_automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_template_id UUID REFERENCES public.workflow_templates(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL,
  trigger_condition JSONB NOT NULL DEFAULT '{}',
  action_type TEXT NOT NULL,
  action_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT automation_rules_trigger_type_check 
  CHECK (trigger_type IN ('time_based', 'status_change', 'user_action', 'external_event')),
  
  CONSTRAINT automation_rules_action_type_check 
  CHECK (action_type IN ('assign_task', 'send_notification', 'update_status', 'create_task', 'send_email'))
);

-- Create indexes for better performance
CREATE INDEX idx_workflow_instances_status ON public.workflow_instances(status);
CREATE INDEX idx_workflow_instances_assigned_to ON public.workflow_instances(assigned_to);
CREATE INDEX idx_workflow_instances_project_id ON public.workflow_instances(project_id);
CREATE INDEX idx_workflow_step_instances_workflow_id ON public.workflow_step_instances(workflow_instance_id);
CREATE INDEX idx_workflow_step_instances_assigned_to ON public.workflow_step_instances(assigned_to);
CREATE INDEX idx_workflow_approvals_approver_id ON public.workflow_approvals(approver_id);

-- Enable RLS on all workflow tables
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_step_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_automation_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workflow_templates
CREATE POLICY "Workflow templates viewable by authenticated users" 
ON public.workflow_templates 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage workflow templates" 
ON public.workflow_templates 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for workflow_instances
CREATE POLICY "Users can view assigned workflows or created by them" 
ON public.workflow_instances 
FOR SELECT 
USING (
  assigned_to = auth.uid() OR 
  initiated_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'project_manager')
  )
);

CREATE POLICY "Users can create workflow instances" 
ON public.workflow_instances 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Assigned users and admins can update workflows" 
ON public.workflow_instances 
FOR UPDATE 
USING (
  assigned_to = auth.uid() OR 
  initiated_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'project_manager')
  )
);

-- RLS Policies for workflow_steps
CREATE POLICY "Workflow steps viewable by authenticated users" 
ON public.workflow_steps 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage workflow steps" 
ON public.workflow_steps 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for workflow_step_instances
CREATE POLICY "Users can view step instances they are involved in" 
ON public.workflow_step_instances 
FOR SELECT 
USING (
  assigned_to = auth.uid() OR 
  completed_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.workflow_instances wi
    WHERE wi.id = workflow_instance_id AND (wi.assigned_to = auth.uid() OR wi.initiated_by = auth.uid())
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'project_manager')
  )
);

CREATE POLICY "Assigned users can update step instances" 
ON public.workflow_step_instances 
FOR UPDATE 
USING (
  assigned_to = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'project_manager')
  )
);

-- RLS Policies for workflow_approvals
CREATE POLICY "Users can view approvals assigned to them" 
ON public.workflow_approvals 
FOR SELECT 
USING (
  approver_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Approvers can manage their approvals" 
ON public.workflow_approvals 
FOR ALL 
USING (
  approver_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for workflow_automation_rules
CREATE POLICY "Automation rules viewable by admins" 
ON public.workflow_automation_rules 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage automation rules" 
ON public.workflow_automation_rules 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Insert some default workflow templates
INSERT INTO public.workflow_templates (name, description, category) VALUES
('Project Approval Workflow', 'Standard project approval process with stakeholder review', 'project'),
('Client Onboarding', 'Complete client onboarding process from contract to project setup', 'general'),
('Content Review Process', 'Review and approval process for marketing content', 'approval'),
('Bug Fix Workflow', 'Standard process for handling and resolving bug reports', 'project'),
('Invoice Approval', 'Financial approval process for client invoices', 'finance');