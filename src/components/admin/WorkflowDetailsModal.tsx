import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  Calendar,
  FileText,
  ArrowRight,
  MessageSquare,
  Edit
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

interface WorkflowStep {
  id: string;
  step_order: number;
  name: string;
  description: string | null;
  step_type: string;
  status: string;
  assigned_to: string | null;
  completed_by: string | null;
  notes: string | null;
  started_at: string | null;
  completed_at: string | null;
  profiles_assigned: {
    full_name: string | null;
    email: string | null;
  } | null;
  profiles_completed: {
    full_name: string | null;
    email: string | null;
  } | null;
}

interface WorkflowDetailsModalProps {
  workflow: WorkflowInstance;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const WorkflowDetailsModal: React.FC<WorkflowDetailsModalProps> = ({
  workflow,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [stepNotes, setStepNotes] = useState('');
  const [workflowStatus, setWorkflowStatus] = useState(workflow.status);

  useEffect(() => {
    if (isOpen && workflow) {
      fetchWorkflowSteps();
      setWorkflowStatus(workflow.status);
    }
  }, [isOpen, workflow]);

  const fetchWorkflowSteps = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workflow_step_instances')
        .select(`
          *,
          workflow_steps (
            name,
            description,
            step_type,
            step_order
          ),
          profiles_assigned:profiles!assigned_to (full_name, email),
          profiles_completed:profiles!completed_by (full_name, email)
        `)
        .eq('workflow_instance_id', workflow.id)
        .order('workflow_steps.step_order', { ascending: true });

      if (error) throw error;

      const processedSteps = data?.map(step => ({
        id: step.id,
        step_order: step.workflow_steps?.step_order || 0,
        name: step.workflow_steps?.name || 'Unknown Step',
        description: step.workflow_steps?.description,
        step_type: step.workflow_steps?.step_type || 'task',
        status: step.status,
        assigned_to: step.assigned_to,
        completed_by: step.completed_by,
        notes: step.notes,
        started_at: step.started_at,
        completed_at: step.completed_at,
        profiles_assigned: step.profiles_assigned,
        profiles_completed: step.profiles_completed
      })) || [];

      setSteps(processedSteps.sort((a, b) => a.step_order - b.step_order));
    } catch (error) {
      console.error('Error fetching workflow steps:', error);
      toast.error('Failed to load workflow steps');
    } finally {
      setLoading(false);
    }
  };

  const updateWorkflowStatus = async (newStatus: string) => {
    if (newStatus === workflowStatus) return;

    setUpdating(true);
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('workflow_instances')
        .update(updateData)
        .eq('id', workflow.id);

      if (error) throw error;

      setWorkflowStatus(newStatus);
      toast.success('Workflow status updated successfully');
      onUpdate();
    } catch (error: any) {
      console.error('Error updating workflow status:', error);
      toast.error(error.message || 'Failed to update workflow status');
    } finally {
      setUpdating(false);
    }
  };

  const updateStepStatus = async (stepId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to update steps');
        return;
      }

      const updateData: any = { 
        status: newStatus,
        notes: stepNotes || null
      };
      
      if (newStatus === 'in_progress' && !steps.find(s => s.id === stepId)?.started_at) {
        updateData.started_at = new Date().toISOString();
      }
      
      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
        updateData.completed_by = user.id;
      }

      const { error } = await supabase
        .from('workflow_step_instances')
        .update(updateData)
        .eq('id', stepId);

      if (error) throw error;

      toast.success('Step updated successfully');
      setActiveStep(null);
      setStepNotes('');
      fetchWorkflowSteps();
      onUpdate();
    } catch (error: any) {
      console.error('Error updating step:', error);
      toast.error(error.message || 'Failed to update step');
    } finally {
      setUpdating(false);
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
      case 'skipped':
        return <ArrowRight className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'waiting_approval':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'skipped':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
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

  const getStepTypeIcon = (stepType: string) => {
    switch (stepType) {
      case 'approval':
        return <CheckCircle className="h-4 w-4" />;
      case 'notification':
        return <MessageSquare className="h-4 w-4" />;
      case 'integration':
        return <ArrowRight className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{workflow.title}</DialogTitle>
              <DialogDescription className="mt-1">
                {workflow.workflow_templates?.name || 'Custom Workflow'} • 
                {workflow.workflow_templates?.category && (
                  <span className="ml-1 capitalize">{workflow.workflow_templates.category}</span>
                )}
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getPriorityColor(workflow.priority)}>
                {workflow.priority}
              </Badge>
              <Select
                value={workflowStatus}
                onValueChange={updateWorkflowStatus}
                disabled={updating}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="waiting_approval">Waiting Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Workflow Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Workflow Information</CardTitle>
            </CardHeader>
            <CardContent>
              {workflow.description && (
                <p className="text-gray-600 mb-4">{workflow.description}</p>
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

          {/* Workflow Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Workflow Steps</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : steps.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No workflow steps found. This workflow may not have been created from a template.
                </p>
              ) : (
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div key={step.id}>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`p-2 rounded-full ${
                            step.status === 'completed' ? 'bg-green-100 text-green-600' :
                            step.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                            'bg-gray-100 text-gray-400'
                          }`}>
                            {getStepTypeIcon(step.step_type)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">
                                {step.step_order}. {step.name}
                              </h4>
                              {step.description && (
                                <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(step.status)}>
                                {step.status.replace('_', ' ')}
                              </Badge>
                              {step.status !== 'completed' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setActiveStep(activeStep === step.id ? null : step.id);
                                    setStepNotes(step.notes || '');
                                  }}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Step Details */}
                          <div className="text-sm text-gray-500 space-y-1">
                            {step.profiles_assigned && (
                              <p>Assigned to: {step.profiles_assigned.full_name || step.profiles_assigned.email}</p>
                            )}
                            {step.started_at && (
                              <p>Started: {formatDate(step.started_at)}</p>
                            )}
                            {step.completed_at && (
                              <p>Completed: {formatDate(step.completed_at)} by {step.profiles_completed?.full_name || step.profiles_completed?.email}</p>
                            )}
                            {step.notes && (
                              <p>Notes: {step.notes}</p>
                            )}
                          </div>

                          {/* Step Update Form */}
                          {activeStep === step.id && (
                            <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-3">
                              <div>
                                <label className="text-sm font-medium text-gray-700">Update Status</label>
                                <Select
                                  value={step.status}
                                  onValueChange={(newStatus) => {
                                    if (newStatus !== step.status) {
                                      updateStepStatus(step.id, newStatus);
                                    }
                                  }}
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="skipped">Skipped</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700">Notes</label>
                                <Textarea
                                  value={stepNotes}
                                  onChange={(e) => setStepNotes(e.target.value)}
                                  placeholder="Add notes about this step..."
                                  className="mt-1"
                                  rows={2}
                                />
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => updateStepStatus(step.id, step.status)}
                                  disabled={updating}
                                >
                                  Save Notes
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setActiveStep(null);
                                    setStepNotes('');
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {index < steps.length - 1 && (
                        <div className="ml-6 mt-2 mb-4">
                          <div className="w-px h-4 bg-gray-200"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};