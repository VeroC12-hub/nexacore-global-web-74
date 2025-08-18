import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus } from 'lucide-react';
import { AddPaymentMethodModal } from './AddPaymentMethodModal';
import { toast } from 'sonner';

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  api_key?: string;
  webhook_secret?: string;
  configuration: any;
}

interface AdminSettings {
  company_name: string;
  company_email: string;
  company_phone: string;
  default_currency: string;
  auto_send_invoices: boolean;
  payment_reminder_days: number;
  require_approval: boolean;
}

export function AdminSettingsTab() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [settings, setSettings] = useState<AdminSettings>({
    company_name: '',
    company_email: '',
    company_phone: '',
    default_currency: 'USD',
    auto_send_invoices: true,
    payment_reminder_days: 7,
    require_approval: true
  });
  const [loading, setLoading] = useState(true);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);

  useEffect(() => {
    loadSettings();
    loadPaymentMethods();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          company_name: data.company_name || '',
          company_email: data.company_email || '',
          company_phone: data.company_phone || '',
          default_currency: data.default_currency || 'USD',
          auto_send_invoices: data.auto_send_invoices ?? true,
          payment_reminder_days: data.payment_reminder_days || 7,
          require_approval: data.require_approval ?? true
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          id: 1, // Using a fixed ID for singleton settings
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const togglePaymentMethod = async (methodId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_active: isActive })
        .eq('id', methodId);

      if (error) throw error;

      setPaymentMethods(methods =>
        methods.map(method =>
          method.id === methodId ? { ...method, is_active: isActive } : method
        )
      );
      toast.success(`Payment method ${isActive ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating payment method:', error);
      toast.error('Failed to update payment method');
    }
  };

  const deletePaymentMethod = async (methodId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;

    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', methodId);

      if (error) throw error;

      setPaymentMethods(methods => methods.filter(method => method.id !== methodId));
      toast.success('Payment method deleted successfully');
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast.error('Failed to delete payment method');
    }
  };

  return (
    <div className="space-y-6">
      {/* Company Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Company Settings</CardTitle>
          <CardDescription>Configure your company information and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={settings.company_name}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                placeholder="Your Company Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_email">Company Email</Label>
              <Input
                id="company_email"
                type="email"
                value={settings.company_email}
                onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
                placeholder="company@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_phone">Company Phone</Label>
              <Input
                id="company_phone"
                value={settings.company_phone}
                onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_currency">Default Currency</Label>
              <Select
                value={settings.default_currency}
                onValueChange={(value) => setSettings({ ...settings, default_currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-send Invoices</Label>
                <p className="text-sm text-muted-foreground">Automatically send invoices to clients when created</p>
              </div>
              <Switch
                checked={settings.auto_send_invoices}
                onCheckedChange={(checked) => setSettings({ ...settings, auto_send_invoices: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Approval</Label>
                <p className="text-sm text-muted-foreground">Require admin approval for new service requests</p>
              </div>
              <Switch
                checked={settings.require_approval}
                onCheckedChange={(checked) => setSettings({ ...settings, require_approval: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_reminder_days">Payment Reminder (Days)</Label>
              <Input
                id="payment_reminder_days"
                type="number"
                value={settings.payment_reminder_days}
                onChange={(e) => setSettings({ ...settings, payment_reminder_days: parseInt(e.target.value) || 0 })}
                placeholder="7"
              />
            </div>
          </div>

          <Button onClick={saveSettings}>Save Settings</Button>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage available payment methods for clients</CardDescription>
            </div>
            <Button onClick={() => setIsAddPaymentModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {paymentMethods.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payment methods configured. Add your first payment method to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Configuration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentMethods.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell className="font-medium">{method.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {method.type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={method.is_active ? 'bg-green-500' : 'bg-gray-500'}>
                        {method.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {method.api_key ? 'API Key configured' : 'Not configured'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Switch
                          checked={method.is_active}
                          onCheckedChange={(checked) => togglePaymentMethod(method.id, checked)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deletePaymentMethod(method.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AddPaymentMethodModal
        isOpen={isAddPaymentModalOpen}
        onClose={() => setIsAddPaymentModalOpen(false)}
        onSuccess={() => {
          loadPaymentMethods();
          setIsAddPaymentModalOpen(false);
        }}
      />
    </div>
  );
}