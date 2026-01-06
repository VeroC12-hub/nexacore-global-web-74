// src/components/client/ServiceRequestEditModal.tsx
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
import { CalendarIcon, Loader2, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  request_type: string;
  category: string;
  status: string;
  priority: string;
  budget_estimate: number;
  requested_completion: string;
  created_at: string;
  updated_at: string;
}

interface ServiceRequestEditModalProps {
  serviceRequest: ServiceRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ServiceRequestEditModal: React.FC<ServiceRequestEditModalProps> = ({
  serviceRequest,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    budget_estimate: 0,
    requested_completion: new Date(),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when service request changes
  useEffect(() => {
    if (serviceRequest) {
      setFormData({
        title: serviceRequest.title || '',
        description: serviceRequest.description || '',
        category: serviceRequest.category || '',
        priority: serviceRequest.priority || 'medium',
        budget_estimate: serviceRequest.budget_estimate || 0,
        requested_completion: serviceRequest.requested_completion
          ? new Date(serviceRequest.requested_completion)
          : new Date(),
      });
      setErrors({});
    }
  }, [serviceRequest]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate title
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    // Validate category
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    // Validate budget estimate
    if (formData.budget_estimate <= 0) {
      newErrors.budget_estimate = 'Budget estimate must be greater than 0';
    }

    // Validate requested completion date (should not be in the past)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (formData.requested_completion < today) {
      newErrors.requested_completion = 'Completion date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.stopPropagation();

    if (!serviceRequest) {
      toast.error('No service request selected');
      return;
    }

    // Only allow editing if status is not completed or cancelled
    if (serviceRequest.status === 'completed' || serviceRequest.status === 'cancelled') {
      toast.error('Cannot edit completed or cancelled service requests');
      return;
    }

    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      // Update service request in database
      const { error } = await supabase
        .from('service_requests')
        .update({
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          priority: formData.priority,
          budget_estimate: formData.budget_estimate,
          requested_completion: format(formData.requested_completion, 'yyyy-MM-dd'),
          updated_at: new Date().toISOString(),
        })
        .eq('id', serviceRequest.id);

      if (error) throw error;

      toast.success('Service request updated successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating service request:', error);
      toast.error(error.message || 'Failed to update service request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setErrors({});
    onClose();
  };

  if (!serviceRequest) return null;

  // Check if the service request can be edited
  const canEdit = serviceRequest.status !== 'completed' && serviceRequest.status !== 'cancelled';

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Service Request</DialogTitle>
          <DialogDescription>
            Update your service request details. Changes will be reviewed by our team.
          </DialogDescription>
        </DialogHeader>

        {!canEdit ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              This service request cannot be edited because it is {serviceRequest.status}.
              Please contact support if you need to make changes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Request Type (Read-only) */}
            <div className="space-y-2">
              <Label>Request Type</Label>
              <Input
                value={serviceRequest.request_type}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Request type cannot be changed. Contact support for major changes.
              </p>
            </div>

            {/* Title (Editable) */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Brief title for your service request..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Minimum 5 characters. Be clear and concise.
              </p>
            </div>

            {/* Description (Editable) */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Detailed description of your service request..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-xs text-red-500">{errors.description}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Minimum 20 characters. Include all relevant details.
              </p>
            </div>

            {/* Category (Editable) */}
            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category" className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CAD Design">CAD Design</SelectItem>
                  <SelectItem value="Software Development">Software Development</SelectItem>
                  <SelectItem value="AI/ML Solutions">AI/ML Solutions</SelectItem>
                  <SelectItem value="Blockchain">Blockchain</SelectItem>
                  <SelectItem value="Digital Services">Digital Services</SelectItem>
                  <SelectItem value="Consulting">Consulting</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-red-500">{errors.category}</p>
              )}
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
                  <SelectItem value="low">Low - Not urgent</SelectItem>
                  <SelectItem value="medium">Medium - Standard</SelectItem>
                  <SelectItem value="high">High - Important</SelectItem>
                  <SelectItem value="urgent">Urgent - Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Budget Estimate (Editable) */}
            <div className="space-y-2">
              <Label htmlFor="budget">
                Budget Estimate <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  step="100"
                  placeholder="0"
                  value={formData.budget_estimate}
                  onChange={(e) => setFormData({ ...formData, budget_estimate: parseFloat(e.target.value) || 0 })}
                  className={cn('pl-9', errors.budget_estimate ? 'border-red-500' : '')}
                />
              </div>
              {errors.budget_estimate && (
                <p className="text-xs text-red-500">{errors.budget_estimate}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Approximate budget for this service request.
              </p>
            </div>

            {/* Requested Completion Date (Editable) */}
            <div className="space-y-2">
              <Label>
                Requested Completion Date <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.requested_completion && 'text-muted-foreground',
                      errors.requested_completion && 'border-red-500'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.requested_completion ? (
                      format(formData.requested_completion, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.requested_completion}
                    onSelect={(date) => date && setFormData({ ...formData, requested_completion: date })}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.requested_completion && (
                <p className="text-xs text-red-500">{errors.requested_completion}</p>
              )}
              <p className="text-xs text-muted-foreground">
                When do you need this completed? We'll do our best to meet your timeline.
              </p>
            </div>

            {/* Status (Read-only) */}
            <div className="space-y-2">
              <Label>Current Status</Label>
              <Input
                value={serviceRequest.status}
                disabled
                className="bg-muted capitalize"
              />
              <p className="text-xs text-muted-foreground">
                Status is managed by our team.
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
                  'Update Request'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {!canEdit && (
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
