import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RefreshCw, CheckCircle } from 'lucide-react';

export const SeedWorkflowTemplatesButton: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [seeding, setSeeding] = useState(false);

  const seedTemplates = async () => {
    setSeeding(true);
    toast.info('Seeding workflow templates...');

    const templates = [
      {
        name: 'Project Initiation Workflow',
        description: 'Complete workflow for starting new projects - from client onboarding to team assignment (includes: client info gathering, feasibility assessment, quote preparation, client approval, team assignment, project kickoff)',
        category: 'project',
        is_active: true
      },
      {
        name: 'Project Milestone Approval',
        description: 'Workflow for reviewing and approving project milestones (includes: milestone review, QA, PM approval, client notification, payment processing)',
        category: 'project',
        is_active: true
      },
      {
        name: 'Project Change Request',
        description: 'Handle scope changes and change requests during project execution (includes: request submission, impact analysis, quote revision, stakeholder approval, implementation planning)',
        category: 'project',
        is_active: true
      },
      {
        name: 'Client Onboarding',
        description: 'Complete onboarding process for new clients (includes: welcome package, contract signing, account setup, requirements workshop, PM assignment, kickoff meeting)',
        category: 'communication',
        is_active: true
      },
      {
        name: 'Quote Approval Workflow',
        description: 'Multi-stage approval process for client quotes (includes: quote prep, technical review, pricing review, final approval, client submission)',
        category: 'approval',
        is_active: true
      },
      {
        name: 'Invoice Approval',
        description: 'Workflow for approving and sending client invoices (includes: invoice creation, project verification, amount verification, manager approval, client distribution)',
        category: 'approval',
        is_active: true
      },
      {
        name: 'Employee Onboarding',
        description: 'Complete onboarding process for new team members (includes: pre-boarding prep, first day welcome, account provisioning, team intro, training, 30-day check-in)',
        category: 'hr',
        is_active: true
      },
      {
        name: 'Leave Request',
        description: 'Process for requesting and approving employee leave (includes: request submission, impact assessment, manager review, HR processing, confirmation)',
        category: 'hr',
        is_active: true
      },
      {
        name: 'Client Escalation',
        description: 'Handle escalated client issues or complaints (includes: issue documentation, immediate ack, root cause analysis, resolution planning, client communication, follow-up)',
        category: 'communication',
        is_active: true
      },
      {
        name: 'Payment Processing',
        description: 'Process client payments and update records (includes: payment receipt, amount verification, invoice reconciliation, receipt generation, accounting update, PM notification)',
        category: 'finance',
        is_active: true
      },
      {
        name: 'Expense Approval',
        description: 'Workflow for approving employee expense claims (includes: expense submission, receipt verification, policy compliance, manager approval, finance approval, reimbursement)',
        category: 'finance',
        is_active: true
      },
      {
        name: 'Code Review Workflow',
        description: 'Standard code review and approval process for development work (includes: code submission, automated testing, peer review, security scan, approval & merge)',
        category: 'approval',
        is_active: true
      }
    ];

    try {
      // Check existing templates
      const { data: existing, error: checkError } = await supabase
        .from('workflow_templates')
        .select('name')
        .in('name', templates.map(t => t.name));

      if (checkError) {
        console.error('Error checking templates:', checkError);
        toast.error('Failed to check existing templates');
        setSeeding(false);
        return;
      }

      const existingNames = new Set((existing || []).map((t: any) => t.name));
      const newTemplates = templates.filter(t => !existingNames.has(t.name));

      if (newTemplates.length === 0) {
        toast.success('All templates already exist!');
        setSeeding(false);
        onSuccess?.();
        return;
      }

      // Get current user for created_by
      const { data: { user } } = await supabase.auth.getUser();

      const templatesToInsert = newTemplates.map(t => ({
        ...t,
        created_by: user?.id || null
      }));

      // Insert new templates
      const { data, error } = await supabase
        .from('workflow_templates')
        .insert(templatesToInsert)
        .select();

      if (error) {
        console.error('Error inserting templates:', error);
        toast.error(`Failed to seed templates: ${error.message}`);
        setSeeding(false);
        return;
      }

      toast.success(`Successfully seeded ${data.length} workflow templates!`);
      setSeeding(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast.error(`Error: ${error.message}`);
      setSeeding(false);
    }
  };

  return (
    <Button
      onClick={seedTemplates}
      disabled={seeding}
      variant="outline"
      className="flex items-center gap-2"
    >
      {seeding ? (
        <>
          <RefreshCw className="h-4 w-4 animate-spin" />
          Seeding Templates...
        </>
      ) : (
        <>
          <CheckCircle className="h-4 w-4" />
          Seed Default Templates
        </>
      )}
    </Button>
  );
};
