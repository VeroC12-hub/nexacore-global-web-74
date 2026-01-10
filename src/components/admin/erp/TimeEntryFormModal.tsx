import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Clock, DollarSign } from 'lucide-react';

interface ERPProject {
  id: string;
  title: string;
}

interface ERPTask {
  id: string;
  title: string;
  project_id: string;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
}

interface TimeEntry {
  id?: string;
  user_id: string;
  project_id: string;
  task_id?: string;
  description: string;
  start_time: string;
  end_time: string | null;
  hours: number;
  rate: number;
  billable: boolean;
  status: 'active' | 'completed';
}

interface TimeEntryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  timeEntry?: TimeEntry | null;
}

export function TimeEntryFormModal({ isOpen, onClose, onSuccess, timeEntry }: TimeEntryFormModalProps) {
  const [projects, setProjects] = useState<ERPProject[]>([]);
  const [tasks, setTasks] = useState<ERPTask[]>([]);
  const [staff, setStaff] = useState<Profile[]>([]);
  const [formData, setFormData] = useState<TimeEntry>({
    user_id: '',
    project_id: '',
    task_id: '',
    description: '',
    start_time: '',
    end_time: '',
    hours: 0,
    rate: 50,
    billable: true,
    status: 'completed'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProjects();
      loadStaff();

      // If editing existing time entry, populate form
      if (timeEntry && timeEntry.id) {
        setFormData({
          id: timeEntry.id,
          user_id: timeEntry.user_id,
          project_id: timeEntry.project_id,
          task_id: timeEntry.task_id || '',
          description: timeEntry.description,
          start_time: timeEntry.start_time,
          end_time: timeEntry.end_time || '',
          hours: timeEntry.hours,
          rate: timeEntry.rate,
          billable: timeEntry.billable,
          status: timeEntry.status
        });

        // Load tasks for the selected project
        if (timeEntry.project_id) {
          loadTasksForProject(timeEntry.project_id);
        }
      } else {
        // Creating new time entry - reset form
        const now = new Date();
        const startTime = new Date(now.getTime() - (1 * 60 * 60 * 1000)); // 1 hour ago

        setFormData({
          user_id: '',
          project_id: '',
          task_id: '',
          description: '',
          start_time: startTime.toISOString().slice(0, 16),
          end_time: now.toISOString().slice(0, 16),
          hours: 1,
          rate: 50,
          billable: true,
          status: 'completed'
        });
        setTasks([]);
      }
    }
  }, [isOpen, timeEntry]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('erp_projects')
        .select('id, title')
        .order('title');

      if (error) throw error;
      console.log('Loaded projects for time entry:', data);
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    }
  };

  const loadStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name');

      if (error) throw error;
      console.log('Loaded staff for time entry:', data);
      setStaff(data || []);
    } catch (error) {
      console.error('Error loading staff:', error);
      toast.error('Failed to load staff members');
    }
  };

  const loadTasksForProject = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('erp_tasks')
        .select('id, title, erp_project_id')
        .eq('erp_project_id', projectId)
        .order('title');

      if (error) {
        console.log('No tasks found for project:', projectId, error.message);
        setTasks([]);
        return;
      }
      console.log('Loaded tasks for project:', projectId, data);
      setTasks(data || []);
    } catch (error) {
      console.log('Error loading tasks (tasks are optional):', error);
      setTasks([]);
    }
  };

  const handleProjectChange = (projectId: string) => {
    setFormData({ ...formData, project_id: projectId, task_id: '' });
    if (projectId) {
      loadTasksForProject(projectId);
    } else {
      setTasks([]);
    }
  };

  const calculateHours = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.max(0, parseFloat(diffHours.toFixed(2)));
  };

  const handleTimeChange = (field: 'start_time' | 'end_time', value: string) => {
    const updatedData = { ...formData, [field]: value };

    // Auto-calculate hours if both start and end times are set
    if (updatedData.start_time && updatedData.end_time) {
      updatedData.hours = calculateHours(updatedData.start_time, updatedData.end_time);
    }

    setFormData(updatedData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.user_id) {
      toast.error('Please select a user');
      return;
    }
    if (!formData.project_id) {
      toast.error('Please select a project');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    if (!formData.start_time) {
      toast.error('Please enter a start time');
      return;
    }
    if (formData.status === 'completed' && !formData.end_time) {
      toast.error('Please enter an end time for completed entries');
      return;
    }
    if (formData.hours <= 0) {
      toast.error('Hours must be greater than 0');
      return;
    }

    setIsSubmitting(true);

    try {
      const timeEntryData = {
        user_id: formData.user_id,
        erp_project_id: formData.project_id,
        erp_task_id: formData.task_id || null,
        description: formData.description.trim(),
        date: formData.start_time ? new Date(formData.start_time).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        hours: formData.hours,
        hourly_rate: formData.rate,
        billable: formData.billable,
        status: 'pending'
      };

      if (formData.id) {
        // Update existing time entry
        const { error } = await supabase
          .from('erp_time_entries')
          .update(timeEntryData)
          .eq('id', formData.id);

        if (error) throw error;
        toast.success('Time entry updated successfully');
      } else {
        // Create new time entry
        const { error } = await supabase
          .from('erp_time_entries')
          .insert([timeEntryData]);

        if (error) throw error;
        toast.success('Time entry created successfully');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving time entry:', error);
      toast.error(error.message || 'Failed to save time entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            {formData.id ? 'Edit Time Entry' : 'Create Time Entry'}
          </DialogTitle>
          <DialogDescription>
            {formData.id
              ? 'Update the time entry details below'
              : 'Track time spent on projects and tasks'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Selection */}
          <div className="space-y-2">
            <Label htmlFor="user">User *</Label>
            <Select
              value={formData.user_id || undefined}
              onValueChange={(value) => setFormData({ ...formData, user_id: value })}
            >
              <SelectTrigger id="user">
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {staff.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.full_name || member.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Project Selection */}
          <div className="space-y-2">
            <Label htmlFor="project">Project *</Label>
            <Select
              value={formData.project_id || undefined}
              onValueChange={handleProjectChange}
            >
              <SelectTrigger id="project">
                <SelectValue placeholder="Select project" />
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

          {/* Task Selection (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="task">Task (Optional)</Label>
            <Select
              value={formData.task_id || undefined}
              onValueChange={(value) => setFormData({ ...formData, task_id: value || '' })}
              disabled={!formData.project_id}
            >
              <SelectTrigger id="task">
                <SelectValue placeholder={!formData.project_id ? "Select a project first" : tasks.length === 0 ? "No tasks available" : "Select task (optional)"} />
              </SelectTrigger>
              <SelectContent>
                {tasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="What did you work on?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => handleTimeChange('start_time', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">
                End Time {formData.status === 'completed' ? '*' : '(Optional)'}
              </Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => handleTimeChange('end_time', e.target.value)}
                disabled={formData.status === 'active'}
              />
            </div>
          </div>

          {/* Hours and Rate */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hours">Hours *</Label>
              <Input
                id="hours"
                type="number"
                step="0.25"
                min="0"
                placeholder="0.00"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate" className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Hourly Rate *
              </Label>
              <Input
                id="rate"
                type="number"
                step="5"
                min="0"
                placeholder="50"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Status and Billable */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'completed') => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active (Timer Running)</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex items-end">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="billable"
                  checked={formData.billable}
                  onCheckedChange={(checked) => setFormData({ ...formData, billable: checked as boolean })}
                />
                <Label htmlFor="billable" className="cursor-pointer">
                  Billable to client
                </Label>
              </div>
            </div>
          </div>

          {/* Total Revenue Preview */}
          {formData.billable && formData.hours > 0 && formData.rate > 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm font-medium text-green-900">
                Estimated Revenue: ${(formData.hours * formData.rate).toFixed(2)}
              </div>
              <div className="text-xs text-green-700">
                {formData.hours}h × ${formData.rate}/hr
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : formData.id ? 'Update Time Entry' : 'Create Time Entry'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
