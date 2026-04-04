import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, CheckCircle, AlertTriangle, Users, FolderOpen, Mail, Trash2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StaffProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
}

interface SeedResult {
  staff: StaffProfile;
  projectTitle: string;
  taskCount: number;
  emailSent: boolean;
  success: boolean;
  error?: string;
}

interface ERPSeedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSeeded: () => void;
}

const ROLE_TEMPLATES: Record<string, {
  project: { title: string; description: string; department: string; project_type: string };
  tasks: { title: string; description: string; priority: 'low' | 'medium' | 'high' | 'urgent'; estimated_hours: number }[];
}> = {
  admin: {
    project: {
      title: 'Administration & System Management',
      description: 'Oversee platform administration, user management, compliance, and operational reporting for NexaCore Innovations.',
      department: 'Administration',
      project_type: 'internal',
    },
    tasks: [
      { title: 'User accounts audit and access review', description: 'Review all user accounts, verify role assignments, and deactivate stale accounts.', priority: 'high', estimated_hours: 4 },
      { title: 'Monthly operational report preparation', description: 'Compile and publish the monthly operational performance report for stakeholders.', priority: 'medium', estimated_hours: 6 },
      { title: 'System configuration and settings review', description: 'Review platform settings, notification configs, and integration health.', priority: 'medium', estimated_hours: 3 },
      { title: 'Compliance and data governance check', description: 'Ensure all data handling and access controls meet compliance requirements.', priority: 'high', estimated_hours: 5 },
      { title: 'Staff onboarding workflow documentation', description: 'Document and update the onboarding checklist for new hires.', priority: 'low', estimated_hours: 4 },
    ],
  },
  project_manager: {
    project: {
      title: 'Project Portfolio Management',
      description: 'Manage the full project lifecycle — planning, execution, client liaison, and delivery tracking across the NexaCore portfolio.',
      department: 'Project Management',
      project_type: 'client',
    },
    tasks: [
      { title: 'Q2 project roadmap and milestone planning', description: 'Define milestones, deliverables, and timelines for all active Q2 projects.', priority: 'urgent', estimated_hours: 8 },
      { title: 'Client progress report and status update', description: 'Prepare and send weekly status reports to all active clients.', priority: 'high', estimated_hours: 3 },
      { title: 'Risk register review and mitigation planning', description: 'Update project risk register with current blockers and outline mitigation steps.', priority: 'high', estimated_hours: 4 },
      { title: 'Resource allocation and capacity review', description: 'Review team capacity and redistribute workload to meet project deadlines.', priority: 'medium', estimated_hours: 5 },
      { title: 'Project retrospective facilitation', description: 'Facilitate sprint/project retrospectives and document lessons learned.', priority: 'low', estimated_hours: 3 },
    ],
  },
  operations_manager: {
    project: {
      title: 'Operations Optimization Initiative',
      description: 'Drive operational efficiency through process analysis, KPI monitoring, and workflow improvements across NexaCore.',
      department: 'Operations',
      project_type: 'internal',
    },
    tasks: [
      { title: 'KPI dashboard setup and monitoring', description: 'Configure key performance indicators and establish baseline benchmarks.', priority: 'high', estimated_hours: 6 },
      { title: 'Workflow analysis and process mapping', description: 'Map current workflows, identify bottlenecks, and propose optimizations.', priority: 'high', estimated_hours: 8 },
      { title: 'Vendor and supplier performance review', description: 'Evaluate vendor SLAs, flag underperforming contracts, and prepare review report.', priority: 'medium', estimated_hours: 5 },
      { title: 'Operational cost reduction assessment', description: 'Identify opportunities to reduce operational costs without compromising quality.', priority: 'medium', estimated_hours: 6 },
      { title: 'Team productivity and attendance tracking', description: 'Review team productivity metrics and set targets for the next quarter.', priority: 'low', estimated_hours: 3 },
    ],
  },
  developer: {
    project: {
      title: 'Platform Development & Maintenance',
      description: 'Design, develop, test, and maintain NexaCore platform features, bug fixes, and technical infrastructure.',
      department: 'Engineering',
      project_type: 'internal',
    },
    tasks: [
      { title: 'Feature development sprint planning', description: 'Plan and scope upcoming feature work, break into actionable tickets.', priority: 'high', estimated_hours: 4 },
      { title: 'Bug triage and critical fix resolution', description: 'Review open bug reports, prioritize critical issues, and deploy fixes.', priority: 'urgent', estimated_hours: 10 },
      { title: 'Code review and quality assurance', description: 'Review team pull requests, enforce code standards, and document feedback.', priority: 'medium', estimated_hours: 6 },
      { title: 'Unit and integration test coverage improvement', description: 'Write tests for untested modules, targeting 80%+ coverage.', priority: 'medium', estimated_hours: 8 },
      { title: 'Technical documentation update', description: 'Update API docs, component docs, and developer setup guides.', priority: 'low', estimated_hours: 5 },
    ],
  },
  support: {
    project: {
      title: 'Customer Support & Issue Resolution',
      description: 'Handle client support tickets, onboarding assistance, and documentation to maintain high satisfaction levels.',
      department: 'Support',
      project_type: 'client',
    },
    tasks: [
      { title: 'Support ticket backlog clearance', description: 'Review and resolve all open support tickets older than 48 hours.', priority: 'urgent', estimated_hours: 6 },
      { title: 'New client onboarding assistance', description: 'Guide newly registered clients through platform setup and initial configuration.', priority: 'high', estimated_hours: 4 },
      { title: 'FAQ and knowledge base update', description: 'Update help documentation with recent product changes and common questions.', priority: 'medium', estimated_hours: 5 },
      { title: 'Client satisfaction survey follow-up', description: 'Contact clients with low satisfaction scores and resolve outstanding issues.', priority: 'high', estimated_hours: 3 },
      { title: 'Support process improvement proposal', description: 'Identify recurring issues and propose workflow changes to reduce ticket volume.', priority: 'low', estimated_hours: 4 },
    ],
  },
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700 border-red-200',
  project_manager: 'bg-blue-100 text-blue-700 border-blue-200',
  operations_manager: 'bg-purple-100 text-purple-700 border-purple-200',
  developer: 'bg-green-100 text-green-700 border-green-200',
  support: 'bg-orange-100 text-orange-700 border-orange-200',
};

type Phase = 'preview' | 'clearing' | 'seeding' | 'emailing' | 'done';

export function ERPSeedModal({ open, onOpenChange, onSeeded }: ERPSeedModalProps) {
  const [phase, setPhase] = useState<Phase>('preview');
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [results, setResults] = useState<SeedResult[]>([]);
  const [statusLine, setStatusLine] = useState('');

  const loadStaff = async () => {
    setLoadingStaff(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .in('role', ['admin', 'project_manager', 'operations_manager', 'developer', 'support'])
        .order('role');
      if (error) throw error;
      setStaffList(data || []);
    } catch {
      toast.error('Failed to load staff profiles');
    } finally {
      setLoadingStaff(false);
    }
  };

  React.useEffect(() => {
    if (open && phase === 'preview') loadStaff();
  }, [open]);

  const handleSeed = async () => {
    const today = new Date().toISOString().split('T')[0];
    const oneMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // ── Step 1: Clear all existing ERP projects (cascades to tasks via FK) ──
    setPhase('clearing');
    setStatusLine('Removing all existing ERP projects and tasks…');

    try {
      // Delete tasks first (FK may not cascade)
      await supabase.from('erp_tasks').delete().not('id', 'is', null);
      await supabase.from('erp_projects').delete().not('id', 'is', null);
    } catch (err: any) {
      toast.error(`Clear failed: ${err?.message}`);
      setPhase('preview');
      return;
    }

    // ── Step 2: Seed projects and tasks ──
    setPhase('seeding');
    const seedResults: SeedResult[] = [];
    const emailPayloads: any[] = [];

    for (const staff of staffList) {
      const role = staff.role || 'support';
      const template = ROLE_TEMPLATES[role] || ROLE_TEMPLATES['support'];
      setStatusLine(`Creating project for ${staff.full_name || staff.email || 'Staff'}…`);

      try {
        const { data: project, error: projError } = await supabase
          .from('erp_projects')
          .insert({
            title: `${template.project.title} — ${staff.full_name || staff.email || 'Staff'}`,
            description: template.project.description,
            department: template.project.department,
            project_type: template.project.project_type,
            assigned_manager: staff.id,
            status: 'in_progress',
            priority: 'medium',
            progress: 0,
            start_date: today,
            end_date: oneMonth,
            budget: 0,
            actual_cost: 0,
            estimated_hours: template.tasks.reduce((s, t) => s + t.estimated_hours, 0),
            actual_hours: 0,
          })
          .select('id')
          .single();

        if (projError) throw projError;

        const taskInserts = template.tasks.map(task => ({
          title: task.title,
          description: task.description,
          priority: task.priority,
          estimated_hours: task.estimated_hours,
          actual_hours: 0,
          status: 'todo',
          progress: 0,
          assigned_to: staff.id,
          erp_project_id: project.id,
          due_date: oneMonth,
        }));

        const { error: taskError } = await supabase.from('erp_tasks').insert(taskInserts);
        if (taskError) throw taskError;

        seedResults.push({ staff, projectTitle: template.project.title, taskCount: template.tasks.length, emailSent: false, success: true });

        // Build email payload
        emailPayloads.push({
          staff,
          project: {
            id: project.id,
            title: `${template.project.title} — ${staff.full_name || staff.email || 'Staff'}`,
            description: template.project.description,
            department: template.project.department,
            start_date: today,
            end_date: oneMonth,
          },
          tasks: template.tasks.map(t => ({ ...t, due_date: oneMonth })),
        });
      } catch (err: any) {
        seedResults.push({ staff, projectTitle: template.project.title, taskCount: 0, emailSent: false, success: false, error: err?.message || 'Unknown error' });
      }
    }

    setResults(seedResults);

    // ── Step 3: Send emails ──
    setPhase('emailing');
    setStatusLine('Sending project assignment emails…');

    try {
      const resp = await fetch('/api/admin/send-project-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payloads: emailPayloads }),
      });

      if (resp.ok) {
        const { results: emailResults } = await resp.json();
        // Merge email status into seedResults
        setResults(prev => prev.map(r => {
          const match = (emailResults as any[]).find((e: any) => e.email === r.staff.email);
          return match ? { ...r, emailSent: match.success } : r;
        }));
      }
    } catch {
      // Email failure is non-fatal — projects were created successfully
    }

    setPhase('done');
    const succeeded = seedResults.filter(r => r.success).length;
    toast.success(`Seeded ${succeeded} projects · emails dispatched`);
    onSeeded();
  };

  const handleClose = () => {
    setPhase('preview');
    setResults([]);
    setStaffList([]);
    setStatusLine('');
    onOpenChange(false);
  };

  const isProcessing = phase === 'clearing' || phase === 'seeding' || phase === 'emailing';

  const phaseLabel: Record<Phase, string> = {
    preview: '',
    clearing: 'Clearing existing data…',
    seeding: statusLine,
    emailing: 'Sending emails…',
    done: '',
  };

  return (
    <Dialog open={open} onOpenChange={isProcessing ? undefined : handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Seed ERP Projects for Staff
          </DialogTitle>
          <DialogDescription>
            Clears all existing ERP projects, creates one 1-month project + 5 tasks per staff member, then sends each person a project assignment email from <strong>admin@nexacore-innovations.com</strong>.
          </DialogDescription>
        </DialogHeader>

        {/* PREVIEW */}
        {phase === 'preview' && (
          <>
            {loadingStaff ? (
              <div className="flex items-center justify-center py-10 gap-3 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading staff profiles…
              </div>
            ) : staffList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                <p>No staff found with recognised ERP roles.</p>
                <p className="text-xs">Roles: admin, project_manager, operations_manager, developer, support</p>
              </div>
            ) : (
              <ScrollArea className="max-h-72">
                <div className="space-y-2 pr-2">
                  {staffList.map(staff => {
                    const role = staff.role || 'support';
                    const template = ROLE_TEMPLATES[role] || ROLE_TEMPLATES['support'];
                    return (
                      <div key={staff.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{staff.full_name || '(No name)'}</div>
                          <div className="text-xs text-muted-foreground truncate">{staff.email}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <Badge className={ROLE_COLORS[role] || 'bg-gray-100 text-gray-700'} variant="outline">
                            {role.replace(/_/g, ' ')}
                          </Badge>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <FolderOpen className="w-3 h-3" />
                            {template.tasks.length} tasks
                          </div>
                          {staff.email && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}

            <div className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded p-3 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-amber-700">
                <Trash2 className="w-3.5 h-3.5" />
                This will first delete ALL existing ERP projects and tasks, then create fresh ones.
              </div>
              <div>Creates {staffList.length} project{staffList.length !== 1 ? 's' : ''} · {staffList.length * 5} tasks · {staffList.filter(s => s.email).length} emails will be sent.</div>
            </div>
          </>
        )}

        {/* PROCESSING */}
        {isProcessing && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            {phase === 'clearing' && <Trash2 className="w-8 h-8 text-red-400 animate-pulse" />}
            {phase === 'seeding' && <RefreshCw className="w-8 h-8 text-primary animate-spin" />}
            {phase === 'emailing' && <Mail className="w-8 h-8 text-blue-500 animate-pulse" />}
            <div className="text-center">
              <p className="font-medium">
                {phase === 'clearing' && 'Clearing existing data…'}
                {phase === 'seeding' && 'Seeding projects and tasks…'}
                {phase === 'emailing' && 'Sending email notifications…'}
              </p>
              {statusLine && phase === 'seeding' && (
                <p className="text-sm text-muted-foreground mt-1">{statusLine}</p>
              )}
            </div>
          </div>
        )}

        {/* DONE */}
        {phase === 'done' && (
          <ScrollArea className="max-h-80">
            <div className="space-y-2 pr-2">
              {results.map((result, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3 min-w-0">
                    {result.success
                      ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      : <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    }
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{result.staff.full_name || result.staff.email}</div>
                      {result.success
                        ? <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span>{result.taskCount} tasks created</span>
                            {result.emailSent
                              ? <span className="flex items-center gap-1 text-green-600"><Mail className="w-3 h-3" />Email sent</span>
                              : <span className="flex items-center gap-1 text-amber-600"><Mail className="w-3 h-3" />Email pending</span>
                            }
                          </div>
                        : <div className="text-xs text-red-500 truncate">{result.error}</div>
                      }
                    </div>
                  </div>
                  <Badge className={ROLE_COLORS[result.staff.role || ''] || 'bg-gray-100 text-gray-600'} variant="outline">
                    {(result.staff.role || '').replace(/_/g, ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          {phase === 'preview' && (
            <>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button
                onClick={handleSeed}
                disabled={loadingStaff || staffList.length === 0}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear & Reseed {staffList.length} Members
              </Button>
            </>
          )}
          {isProcessing && <Button variant="outline" disabled>Processing…</Button>}
          {phase === 'done' && <Button onClick={handleClose}>Done</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
