import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Pause, CheckCircle, Clock, AlertTriangle, User, Calendar, RefreshCw, ExternalLink, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreateWorkflowModal } from "./CreateWorkflowModal";
import { WorkflowDetailsModal } from "./WorkflowDetailsModal";
import { checkWorkflowTablesExist } from "@/services/workflowMigration";
import { SeedWorkflowTemplatesButton } from "./SeedWorkflowTemplatesButton";

interface WorkflowInstance {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  created_at: string;
  initiated_by: string | null;
  assigned_to: string | null;
  workflow_templates: {
    name: string;
    category: string;
  } | null;
  profiles_initiated: {
    full_name: string | null;
    email: string | null;
  } | null;
  profiles_assigned: {
    full_name: string | null;
    email: string | null;
  } | null;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  is_active: boolean;
  created_at: string;
}

export const AdminWorkflowTab: React.FC = () => {
  const [workflows, setWorkflows] = useState<WorkflowInstance[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [tablesExist, setTablesExist] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'instances' | 'templates'>('instances');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowInstance | null>(null);

  useEffect(() => {
    initializeWorkflowSystem();
  }, []);

  const initializeWorkflowSystem = async () => {
    setLoading(true);
    try {
      const exist = await checkWorkflowTablesExist();
      setTablesExist(exist);
      
      if (exist) {
        await fetchWorkflowData();
      }
    } catch (error) {
      console.error('Error initializing workflow system:', error);
      setTablesExist(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkflowData = async () => {
    setLoading(true);
    try {
      // Fetch workflow instances
      const { data: workflowData, error: workflowError } = await supabase
        .from('workflow_instances')
        .select(`
          *,
          workflow_templates (name, category),
          profiles_initiated:profiles!initiated_by (full_name, email),
          profiles_assigned:profiles!assigned_to (full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (workflowError) {
        console.error('Error fetching workflows:', workflowError);
        toast.error('Failed to load workflows');
        return;
      }

      // Fetch workflow templates
      const { data: templateData, error: templateError } = await supabase
        .from('workflow_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (templateError) {
        console.error('Error fetching templates:', templateError);
        toast.error('Failed to load workflow templates');
        return;
      }

      setWorkflows(workflowData || []);
      setTemplates(templateData || []);
    } catch (error) {
      console.error('Error fetching workflow data:', error);
      toast.error('Failed to load workflow data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <Play className="h-4 w-4" />;
      case 'waiting_approval':
        return <AlertTriangle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <Pause className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'waiting_approval':
        return 'bg-orange-500';
      case 'completed':
      case 'approved':
        return 'bg-green-500';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'project':
        return 'bg-purple-100 text-purple-800';
      case 'approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'communication':
        return 'bg-green-100 text-green-800';
      case 'hr':
        return 'bg-pink-100 text-pink-800';
      case 'finance':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show setup guide if tables don't exist
  if (tablesExist === false) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Workflow Automation</h2>
            <p className="text-muted-foreground">
              Enterprise workflow automation system setup required
            </p>
          </div>
        </div>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-yellow-800">Setup Required</CardTitle>
            </div>
            <CardDescription className="text-yellow-700">
              The workflow automation system requires database tables to be created first.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-yellow-800">To complete setup:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-700">
                <li>Go to your <a href="https://supabase.com/dashboard/org/mkmdvisncldglrixzswy" target="_blank" className="underline font-medium">Supabase Dashboard</a></li>
                <li>Navigate to the SQL Editor</li>
                <li>Run the workflow migration SQL from the migration file</li>
                <li>Refresh this page to use the workflow system</li>
              </ol>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={initializeWorkflowSystem}
                variant="outline"
                className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Again
              </Button>
              <Button 
                onClick={() => window.open('https://supabase.com/dashboard/org/mkmdvisncldglrixzswy', '_blank')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Supabase Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Migration SQL</CardTitle>
            <CardDescription>Copy this SQL and run it in your Supabase SQL Editor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto">
              <pre>{`-- Phase 6: Enterprise Features - Workflow Automation System
-- Run this SQL in your Supabase SQL Editor

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

-- Continue with the rest of the migration from the file:
-- /supabase/migrations/20250902230354_workflow_automation_system.sql`}</pre>
            </div>
            <div className="mt-4">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText('-- See migration file: /supabase/migrations/20250902230354_workflow_automation_system.sql');
                  toast.success('Instructions copied to clipboard');
                }}
                size="sm"
                variant="outline"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Instructions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Workflow Automation</h2>
          <p className="text-muted-foreground">
            Manage automated workflows and business processes
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Workflow
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={activeTab === 'instances' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('instances')}
          className="flex-1"
        >
          Active Workflows ({workflows.length})
        </Button>
        <Button
          variant={activeTab === 'templates' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('templates')}
          className="flex-1"
        >
          Templates ({templates.length})
        </Button>
      </div>

      {/* Workflow Instances Tab */}
      {activeTab === 'instances' && (
        <div className="grid gap-4">
          {workflows.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <Play className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active workflows</h3>
                <p className="text-gray-500 text-center mb-4">
                  Create your first workflow to get started with process automation
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Workflow
                </Button>
              </CardContent>
            </Card>
          ) : (
            workflows.map((workflow) => (
              <Card
                key={workflow.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedWorkflow(workflow)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${getStatusColor(workflow.status)}`}>
                        {getStatusIcon(workflow.status)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{workflow.title}</CardTitle>
                        <CardDescription className="flex items-center space-x-2">
                          <span>{workflow.workflow_templates?.name || 'Custom Workflow'}</span>
                          {workflow.workflow_templates?.category && (
                            <Badge className={getCategoryColor(workflow.workflow_templates.category)}>
                              {workflow.workflow_templates.category}
                            </Badge>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(workflow.priority)}>
                        {workflow.priority}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(workflow.status).replace('bg-', 'border-').replace('500', '300')}>
                        {workflow.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {workflow.description && (
                    <p className="text-sm text-gray-600 mb-4">{workflow.description}</p>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Initiated by</p>
                        <p className="font-medium">
                          {workflow.profiles_initiated?.full_name || workflow.profiles_initiated?.email || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Assigned to</p>
                        <p className="font-medium">
                          {workflow.profiles_assigned?.full_name || workflow.profiles_assigned?.email || 'Unassigned'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Due date</p>
                        <p className="font-medium">{formatDate(workflow.due_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Created</p>
                        <p className="font-medium">{formatDate(workflow.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Workflow Templates Tab */}
      {activeTab === 'templates' && (
        <>
          {templates.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Templates Found</CardTitle>
                <CardDescription>
                  Get started by seeding the default NexaCore workflow templates
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground mb-4">
                  Click below to create default workflow templates for your organization
                </p>
                <SeedWorkflowTemplatesButton onSuccess={fetchWorkflowData} />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge className={getCategoryColor(template.category)}>
                        {template.category}
                      </Badge>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Created {formatDate(template.created_at)}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => {
                          // TODO: Implement template-based workflow creation
                          toast.info('Template-based workflow creation coming soon!');
                        }}
                      >
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateWorkflowModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchWorkflowData();
          }}
          templates={templates}
        />
      )}

      {selectedWorkflow && (
        <WorkflowDetailsModal
          workflow={selectedWorkflow}
          isOpen={!!selectedWorkflow}
          onClose={() => setSelectedWorkflow(null)}
          onUpdate={fetchWorkflowData}
        />
      )}
    </div>
  );
};