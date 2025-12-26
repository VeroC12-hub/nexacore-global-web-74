import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Target } from 'lucide-react';

interface ERPProject {
  id: string;
  title: string;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
}

interface ERPTask {
  id?: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee_id?: string;  // Form field name
  assigned_to?: string;  // Database column name
  project_id: string;
  due_date: string;
  estimated_hours: number;
  actual_hours?: number;
}

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task?: ERPTask | null;
}

export function TaskFormModal({ isOpen, onClose, onSuccess, task }: TaskFormModalProps) {
  const [projects, setProjects] = useState<ERPProject[]>([]);
  const [staff, setStaff] = useState<Profile[]>([]);
  const [formData, setFormData] = useState<ERPTask>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    project_id: '',
    assignee_id: '',
    due_date: '',
    estimated_hours: 8,
    actual_hours: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProjects();
      loadStaff();

      // If editing existing task, populate form
      if (task && task.id) {
        setFormData({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          project_id: task.project_id,
          assignee_id: task.assigned_to || '',  // Database uses 'assigned_to' column
          due_date: task.due_date.split('T')[0], // Extract date part
          estimated_hours: task.estimated_hours,
          actual_hours: task.actual_hours || 0
        });
      } else {
        // Creating new task - completely reset form with fresh default values
        const defaultDueDate = new Date();
        defaultDueDate.setDate(defaultDueDate.getDate() + 7);
        setFormData({
          title: '',
          description: '',
          status: 'todo',
          priority: 'medium',
          project_id: '',
          assignee_id: '',
          due_date: defaultDueDate.toISOString().split('T')[0],
          estimated_hours: 8,
          actual_hours: 0
        });
      }
    }
  }, [isOpen, task]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('erp_projects')
        .select('id, title, status')
        .order('title');

      if (error) {
        console.error('Error loading projects:', error);
        toast.error('Failed to load projects');
        return;
      }

      console.log('Loaded projects:', data);
      setProjects(data || []);

      if (!data || data.length === 0) {
        toast.info('No projects found. Please create a project first.');
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    }
  };

  const loadStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .order('full_name');

      if (error) {
        console.error('Error loading staff:', error);
        toast.error('Failed to load staff members');
        return;
      }

      console.log('Loaded staff:', data);
      setStaff(data || []);

      if (!data || data.length === 0) {
        toast.info('No staff members found in the system.');
      }
    } catch (error) {
      console.error('Error loading staff:', error);
      toast.error('Failed to load staff members');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        toast.error('Task title is required');
        setIsSubmitting(false);
        return;
      }
      if (!formData.project_id) {
        toast.error('Please select a project');
        setIsSubmitting(false);
        return;
      }

      if (task?.id) {
        // Update existing task - don't update erp_project_id as it's a fixed relationship
        const updateData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          status: formData.status === 'todo' ? 'new' : formData.status,  // Map 'todo' to 'new'
          priority: formData.priority,
          erp_project_id: formData.project_id,  // Allow changing project when editing
          assigned_to: formData.assignee_id || null,
          due_date: formData.due_date,
          estimated_hours: formData.estimated_hours,
          actual_hours: formData.actual_hours || 0
        };

        console.log('Updating task:', task.id, updateData);
        const { error } = await supabase
          .from('erp_tasks')
          .update(updateData)
          .eq('id', task.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        toast.success('Task updated successfully');
      } else {
        // Create new task - include erp_project_id on creation
        const insertData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          status: formData.status === 'todo' ? 'new' : formData.status,
          priority: formData.priority,
          erp_project_id: formData.project_id,  // Column is erp_project_id, not project_id
          assigned_to: formData.assignee_id || null,
          due_date: formData.due_date,
          estimated_hours: formData.estimated_hours,
          actual_hours: formData.actual_hours || 0
        };

        console.log('Creating new task with data:', insertData);

        const { data, error } = await supabase
          .from('erp_tasks')
          .insert(insertData)
          .select();

        if (error) {
          console.error('Insert error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }
        console.log('Task created successfully:', data);
        toast.success('Task created successfully');
      }

      onSuccess();
      resetForm();
    } catch (error: any) {
      console.error('Error saving task:', error);
      const errorMessage = error?.message || 'Unknown error';
      toast.error(task?.id ? `Failed to update task: ${errorMessage}` : `Failed to create task: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      project_id: '',
      assignee_id: '',
      due_date: '',
      estimated_hours: 8,
      actual_hours: 0
    });
  };

  const handleInputChange = (field: keyof ERPTask, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            {task?.id ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          <DialogDescription>
            {task?.id ? 'Update task details and assignment' : 'Create a new task and assign it to a team member'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the task in detail"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project *</Label>
              <Select
                value={formData.project_id}
                onValueChange={(value) => handleInputChange('project_id', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Select
                value={formData.assignee_id || 'unassigned'}
                onValueChange={(value) => handleInputChange('assignee_id', value === 'unassigned' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name || member.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value as ERPTask['status'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">In Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange('priority', value as ERPTask['priority'])}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Estimated Hours *</Label>
              <Input
                id="estimatedHours"
                type="number"
                step="0.5"
                min="0"
                value={formData.estimated_hours}
                onChange={(e) => handleInputChange('estimated_hours', parseFloat(e.target.value) || 0)}
                placeholder="8.0"
                required
              />
            </div>
          </div>

          {task?.id && (
            <div className="space-y-2">
              <Label htmlFor="actualHours">Actual Hours Spent</Label>
              <Input
                id="actualHours"
                type="number"
                step="0.5"
                min="0"
                value={formData.actual_hours}
                onChange={(e) => handleInputChange('actual_hours', parseFloat(e.target.value) || 0)}
                placeholder="0.0"
              />
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (task?.id ? 'Updating...' : 'Creating...') : (task?.id ? 'Update Task' : 'Create Task')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
