import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddPaymentMethodModal({ isOpen, onClose, onSuccess }: AddPaymentMethodModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    api_key: '',
    webhook_secret: '',
    configuration: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let configuration = {};
      if (formData.configuration) {
        try {
          configuration = JSON.parse(formData.configuration);
        } catch (error) {
          throw new Error('Invalid JSON configuration');
        }
      }

      const { error } = await supabase
        .from('payment_methods')
        .insert({
          name: formData.name,
          type: formData.type,
          api_key: formData.api_key || null,
          webhook_secret: formData.webhook_secret || null,
          configuration,
          is_active: true
        });

      if (error) throw error;

      toast.success('Payment method added successfully');
      onSuccess();
      setFormData({
        name: '',
        type: '',
        api_key: '',
        webhook_secret: '',
        configuration: ''
      });
    } catch (error: any) {
      console.error('Error adding payment method:', error);
      toast.error(error.message || 'Failed to add payment method');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getConfigurationPlaceholder = () => {
    switch (formData.type) {
      case 'stripe':
        return '{\n  "publishable_key": "pk_...",\n  "webhook_endpoint": "https://..."\n}';
      case 'paypal':
        return '{\n  "client_id": "...",\n  "sandbox": false\n}';
      case 'square':
        return '{\n  "application_id": "...",\n  "location_id": "..."\n}';
      default:
        return '{\n  "custom_field": "value"\n}';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
          <DialogDescription>
            Configure a new payment method for your clients
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Payment Method Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Stripe, PayPal, Credit Card"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleInputChange('type', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="manual">Manual/Bank Transfer</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api_key">API Key (Optional)</Label>
            <Input
              id="api_key"
              type="password"
              value={formData.api_key}
              onChange={(e) => handleInputChange('api_key', e.target.value)}
              placeholder="Enter API key if required"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook_secret">Webhook Secret (Optional)</Label>
            <Input
              id="webhook_secret"
              type="password"
              value={formData.webhook_secret}
              onChange={(e) => handleInputChange('webhook_secret', e.target.value)}
              placeholder="Enter webhook secret if required"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="configuration">Configuration (JSON)</Label>
            <Textarea
              id="configuration"
              value={formData.configuration}
              onChange={(e) => handleInputChange('configuration', e.target.value)}
              placeholder={getConfigurationPlaceholder()}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Optional JSON configuration for additional settings
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Payment Method'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}