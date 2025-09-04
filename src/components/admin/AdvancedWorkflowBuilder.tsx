import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  X, 
  ArrowDown, 
  ArrowUp, 
  Play, 
  Save,
  Settings,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Workflow,
  Zap,
  Eye
} from "lucide-react";
import { toast } from "sonner";

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  stepType: 'task' | 'approval' | 'automation' | 'notification' | 'condition';
  autoAssignTo: string;
  estimatedHours: number;
  dependencies: string[];
  automationRules?: {
    trigger: string;
    action: string;
    conditions: any[];
  };
}

interface WorkflowTemplate {
  id?: string;
  name: string;
  description: string;
  category: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  estimatedDuration: number;
  steps: WorkflowStep[];
  automationEnabled: boolean;
  approvalRequired: boolean;
}

interface AdvancedWorkflowBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  templateToEdit?: WorkflowTemplate | null;
  onSave: (template: WorkflowTemplate) => Promise<void>;
}

export const AdvancedWorkflowBuilder: React.FC<AdvancedWorkflowBuilderProps> = ({
  isOpen,
  onClose,
  templateToEdit,
  onSave
}) => {
  const [template, setTemplate] = useState<WorkflowTemplate>({
    name: '',
    description: '',
    category: 'general',
    priority: 'normal',
    estimatedDuration: 1,
    steps: [],
    automationEnabled: false,
    approvalRequired: false
  });

  const [currentStep, setCurrentStep] = useState<WorkflowStep>({
    id: '',
    name: '',
    description: '',
    stepType: 'task',
    autoAssignTo: '',
    estimatedHours: 1,
    dependencies: []
  });

  const [showStepBuilder, setShowStepBuilder] = useState(false);
  const [saving, setSaving] = useState(false);

  const stepTypes = [
    { value: 'task', label: 'Task', icon: CheckCircle, color: 'bg-blue-500' },
    { value: 'approval', label: 'Approval', icon: Users, color: 'bg-orange-500' },
    { value: 'automation', label: 'Automation', icon: Zap, color: 'bg-green-500' },
    { value: 'notification', label: 'Notification', icon: AlertTriangle, color: 'bg-yellow-500' },
    { value: 'condition', label: 'Condition', icon: Settings, color: 'bg-purple-500' }
  ];

  const categories = [
    'project', 'approval', 'communication', 'general', 'hr', 'finance'
  ];

  useEffect(() => {
    if (templateToEdit) {
      setTemplate(templateToEdit);
    }
  }, [templateToEdit]);

  const addStep = () => {
    if (!currentStep.name.trim()) {
      toast.error('Step name is required');
      return;
    }

    const newStep: WorkflowStep = {
      ...currentStep,
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    setTemplate(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));

    setCurrentStep({
      id: '',
      name: '',
      description: '',
      stepType: 'task',
      autoAssignTo: '',
      estimatedHours: 1,
      dependencies: []
    });

    setShowStepBuilder(false);
    toast.success('Step added successfully');
  };

  const removeStep = (stepId: string) => {
    setTemplate(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));
    toast.success('Step removed');
  };

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    const steps = [...template.steps];
    const currentIndex = steps.findIndex(step => step.id === stepId);
    
    if (direction === 'up' && currentIndex > 0) {
      [steps[currentIndex], steps[currentIndex - 1]] = [steps[currentIndex - 1], steps[currentIndex]];
    } else if (direction === 'down' && currentIndex < steps.length - 1) {
      [steps[currentIndex], steps[currentIndex + 1]] = [steps[currentIndex + 1], steps[currentIndex]];
    }

    setTemplate(prev => ({ ...prev, steps }));
  };

  const handleSave = async () => {
    if (!template.name.trim()) {
      toast.error('Workflow name is required');
      return;
    }

    if (template.steps.length === 0) {
      toast.error('At least one step is required');
      return;
    }

    setSaving(true);
    try {
      await onSave(template);
      onClose();
      toast.success('Workflow template saved successfully');
    } catch (error) {
      toast.error('Failed to save workflow template');
    } finally {
      setSaving(false);
    }
  };

  const previewWorkflow = () => {
    // TODO: Implement workflow preview
    toast.info('Workflow preview coming soon');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Workflow className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Advanced Workflow Builder</h2>
                <p className="text-gray-600">Create enterprise-grade automated workflows</p>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Workflow Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="workflow-name">Workflow Name</Label>
                  <Input
                    id="workflow-name"
                    value={template.name}
                    onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter workflow name"
                  />
                </div>
                <div>
                  <Label htmlFor="workflow-category">Category</Label>
                  <Select 
                    value={template.category}
                    onValueChange={(value) => setTemplate(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="workflow-description">Description</Label>
                <Textarea
                  id="workflow-description"
                  value={template.description}
                  onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the workflow purpose and process"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Priority Level</Label>
                  <Select 
                    value={template.priority}
                    onValueChange={(value: any) => setTemplate(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="normal">Normal Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="estimated-duration">Est. Duration (days)</Label>
                  <Input
                    id="estimated-duration"
                    type="number"
                    min="1"
                    value={template.estimatedDuration}
                    onChange={(e) => setTemplate(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>Advanced Features</Label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={template.automationEnabled}
                        onChange={(e) => setTemplate(prev => ({ ...prev, automationEnabled: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">Auto-Assignment</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={template.approvalRequired}
                        onChange={(e) => setTemplate(prev => ({ ...prev, approvalRequired: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">Approval Flow</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Steps */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Workflow Steps ({template.steps.length})</span>
                </CardTitle>
                <Button 
                  onClick={() => setShowStepBuilder(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Step
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {template.steps.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Workflow className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No steps added yet. Click "Add Step" to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {template.steps.map((step, index) => {
                    const stepTypeInfo = stepTypes.find(t => t.value === step.stepType);
                    const StepIcon = stepTypeInfo?.icon || CheckCircle;
                    
                    return (
                      <div key={step.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                        <div className={`p-2 rounded-lg ${stepTypeInfo?.color || 'bg-gray-500'}`}>
                          <StepIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">{step.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                              <div className="flex items-center space-x-4 mt-2">
                                <Badge variant="outline">{stepTypeInfo?.label}</Badge>
                                <span className="text-xs text-gray-500 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {step.estimatedHours}h
                                </span>
                                {step.autoAssignTo && (
                                  <span className="text-xs text-gray-500 flex items-center">
                                    <Users className="w-3 h-3 mr-1" />
                                    {step.autoAssignTo}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveStep(step.id, 'up')}
                                disabled={index === 0}
                              >
                                <ArrowUp className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveStep(step.id, 'down')}
                                disabled={index === template.steps.length - 1}
                              >
                                <ArrowDown className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeStep(step.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step Builder Modal */}
          {showStepBuilder && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Add Workflow Step</CardTitle>
                    <Button variant="ghost" onClick={() => setShowStepBuilder(false)}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="step-name">Step Name</Label>
                      <Input
                        id="step-name"
                        value={currentStep.name}
                        onChange={(e) => setCurrentStep(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter step name"
                      />
                    </div>
                    <div>
                      <Label>Step Type</Label>
                      <Select 
                        value={currentStep.stepType}
                        onValueChange={(value: any) => setCurrentStep(prev => ({ ...prev, stepType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {stepTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="step-description">Description</Label>
                    <Textarea
                      id="step-description"
                      value={currentStep.description}
                      onChange={(e) => setCurrentStep(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what needs to be done in this step"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="auto-assign">Auto-assign to</Label>
                      <Input
                        id="auto-assign"
                        value={currentStep.autoAssignTo}
                        onChange={(e) => setCurrentStep(prev => ({ ...prev, autoAssignTo: e.target.value }))}
                        placeholder="Role or user email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="estimated-hours">Estimated Hours</Label>
                      <Input
                        id="estimated-hours"
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={currentStep.estimatedHours}
                        onChange={(e) => setCurrentStep(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 1 }))}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setShowStepBuilder(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addStep} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Step
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={previewWorkflow}>
              <Eye className="w-4 h-4 mr-2" />
              Preview Workflow
            </Button>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Workflow'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};