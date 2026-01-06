// src/components/client/ProjectEditModal.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  progress: number;
  start_date: string;
  end_date: string;
  budget: number;
  spent?: number;
  service_type: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

interface ProjectEditModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProjectEditModal: React.FC<ProjectEditModalProps> = ({
  project,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    priority: 'medium',
    end_date: new Date(),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        description: project.description || '',
        priority: project.priority || 'medium',
        end_date: project.end_date ? new Date(project.end_date) : new Date(),
      });
      setErrors({});
    }
  }, [project]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    // Validate end date (should not be before today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (formData.end_date < today) {
      newErrors.end_date = 'End date cannot be in the past';
    }

    // Validate end date (should not be before start date)
    if (project && project.start_date) {
      const startDate = new Date(project.start_date);
      startDate.setHours(0, 0, 0, 0);
      if (formData.end_date < startDate) {
        newErrors.end_date = 'End date cannot be before start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!project) {
      toast.error('No project selected');
      return;
    }

    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      // Update project in database
      const { error } = await supabase
        .from('projects')
        .update({
          description: formData.description.trim(),
          priority: formData.priority,
          end_date: format(formData.end_date, 'yyyy-MM-dd'),
          updated_at: new Date().toISOString(),
        })
        .eq('id', project.id);

      if (error) throw error;

      toast.success('Project updated successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast.error(error.message || 'Failed to update project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setErrors({});
    onClose();
  };

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update your project details. You can modify the description, priority, and deadline.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Title (Read-only) */}
          <div className="space-y-2">
            <Label>Project Title</Label>
            <Input
              value={project.title}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Project title cannot be changed. Contact support if you need assistance.
            </p>
          </div>

          {/* Service Type (Read-only) */}
          <div className="space-y-2">
            <Label>Service Type</Label>
            <Input
              value={project.service_type}
              disabled
              className="bg-muted"
            />
          </div>

          {/* Description (Editable) */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Project Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your project requirements in detail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={5}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Minimum 10 characters. Be as detailed as possible.
            </p>
          </div>

          {/* Priority (Editable) */}
          <div className="space-y-2">
            <Label htmlFor="priority">
              Priority <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - No rush</SelectItem>
                <SelectItem value="medium">Medium - Standard timeline</SelectItem>
                <SelectItem value="high">High - Important</SelectItem>
                <SelectItem value="urgent">Urgent - Critical</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Higher priority projects may be completed faster (subject to availability).
            </p>
          </div>

          {/* End Date (Editable) */}
          <div className="space-y-2">
            <Label>
              Target Completion Date <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !formData.end_date && 'text-muted-foreground',
                    errors.end_date && 'border-red-500'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.end_date ? (
                    format(formData.end_date, 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.end_date}
                  onSelect={(date) => date && setFormData({ ...formData, end_date: date })}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.end_date && (
              <p className="text-xs text-red-500">{errors.end_date}</p>
            )}
            {project.start_date && (
              <p className="text-xs text-muted-foreground">
                Project started: {format(new Date(project.start_date), 'PPP')}
              </p>
            )}
          </div>

          {/* Budget (Read-only) */}
          <div className="space-y-2">
            <Label>Budget</Label>
            <Input
              value={`$${project.budget?.toLocaleString() || '0'}`}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Contact support to discuss budget adjustments.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Project'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
