import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { FolderOpen, Loader2 } from 'lucide-react';

interface ERPProject {
  id?: string;
  title: string;
  description: string;
  department: string;
  project_type: string;
  status: string;
  priority: string;
  budget: number;
  actual_cost?: number;
  start_date: string;
  end_date: string;
  progress?: number;
  is_active: boolean;
}

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project?: ERPProject | null;
}

export function ProjectFormModal({ isOpen, onClose, onSuccess, project }: ProjectFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ERPProject>({
    title: '',
    description: '',
    department: 'cad_engineering',
    project_type: 'client',
    status: 'pending',
    priority: 'medium',
    budget: 0,
    actual_cost: 0,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    progress: 0,
    is_active: true
  });

  // Reset form when modal opens/closes or project changes
  useEffect(() => {
    if (isOpen) {
      if (project) {
        // Editing existing project
        setFormData({
          ...project,
          start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          end_date: project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : ''
        });
      } else {
        // Creating new project
        setFormData({
          title: '',
          description: '',
          department: 'cad_engineering',
          project_type: 'client',
          status: 'pending',
          priority: 'medium',
          budget: 0,
          actual_cost: 0,
          start_date: new Date().toISOString().split('T')[0],
          end_date: '',
          progress: 0,
          is_active: true
        });
      }
    }
  }, [isOpen, project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter a project title');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please enter a project description');
      return;
    }

    if (!formData.end_date) {
      toast.error('Please select an end date');
      return;
    }

    if (formData.budget <= 0) {
      toast.error('Budget must be greater than 0');
      return;
    }

    setLoading(true);

    try {
      const projectData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        department: formData.department,
        project_type: formData.project_type,
        status: formData.status,
        priority: formData.priority,
        budget: formData.budget,
        actual_cost: formData.actual_cost || 0,
        start_date: formData.start_date,
        end_date: formData.end_date,
        progress: formData.progress || 0,
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      };

      if (project?.id) {
        // Update existing project
        const { error } = await supabase
          .from('erp_projects')
          .update(projectData)
          .eq('id', project.id);

        if (error) throw error;
        toast.success('Project updated successfully!');
      } else {
        // Create new project
        const { error } = await supabase
          .from('erp_projects')
          .insert([{
            ...projectData,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
        toast.success('Project created successfully!');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving project:', error);
      toast.error(error.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-blue-500" />
            {project ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
          <DialogDescription>
            {project ? 'Update project details and settings' : 'Fill in the details to create a new project'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter project title"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the project objectives and scope"
              rows={3}
              required
            />
          </div>

          {/* Department and Project Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Service Department *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cad_engineering">CAD Design & Engineering</SelectItem>
                  <SelectItem value="civil_engineering">Civil Engineering</SelectItem>
                  <SelectItem value="architecture">Architecture</SelectItem>
                  <SelectItem value="software_development">Software Development</SelectItem>
                  <SelectItem value="ai_ml">AI/ML Solutions</SelectItem>
                  <SelectItem value="digital_services">Digital Services</SelectItem>
                  <SelectItem value="consulting">Professional Consulting</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="hr">Human Resources</SelectItem>
                  <SelectItem value="marketing">Marketing & Sales</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project_type">Project Type *</Label>
              <Select
                value={formData.project_type}
                onValueChange={(value) => setFormData({ ...formData, project_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client Project</SelectItem>
                  <SelectItem value="internal">Internal Project</SelectItem>
                  <SelectItem value="research">Research & Development</SelectItem>
                  <SelectItem value="training">Training/Certification</SelectItem>
                  <SelectItem value="maintenance">Maintenance & Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Budget and Actual Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget ($) *</Label>
              <Input
                id="budget"
                type="number"
                min="0"
                step="0.01"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actual_cost">Actual Cost ($)</Label>
              <Input
                id="actual_cost"
                type="number"
                min="0"
                step="0.01"
                value={formData.actual_cost}
                onChange={(e) => setFormData({ ...formData, actual_cost: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                min={formData.start_date}
                required
              />
            </div>
          </div>

          {/* Progress */}
          {project && (
            <div className="space-y-2">
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          )}

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Active Project
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {project ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>{project ? 'Update Project' : 'Create Project'}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
