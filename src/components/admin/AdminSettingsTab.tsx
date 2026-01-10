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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Trash2, 
  Plus, 
  Shield, 
  AlertTriangle, 
  Users, 
  Settings, 
  CreditCard, 
  UserCheck,
  Edit,
  Search,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { AddPaymentMethodModal } from './AddPaymentMethodModal';
import { SecurePaymentConfig } from './SecurePaymentConfig';
import { useRolePermissions } from '@/hooks/useRolePermissions';
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

interface ERPStaffRole {
  id: string;
  user_id: string;
  role: 'admin' | 'project_manager' | 'operations_manager' | 'developer' | 'designer' | 'qa_tester' | 'business_analyst' | 'support';
  permissions: any;
  department: string;
  position: string;
  hourly_rate: number;
  can_approve_timesheets: boolean;
  can_create_projects: boolean;
  can_manage_users: boolean;
  can_view_all_projects: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
    full_name: string;
  };
}

interface User {
  id: string;
  email: string;
  full_name: string;
}

const ROLE_TEMPLATES = {
  admin: {
    name: 'Administrator',
    can_approve_timesheets: true,
    can_create_projects: true,
    can_manage_users: true,
    can_view_all_projects: true
  },
  project_manager: {
    name: 'Project Manager',
    can_approve_timesheets: true,
    can_create_projects: true,
    can_manage_users: false,
    can_view_all_projects: true
  },
  operations_manager: {
    name: 'Operations Manager',
    can_approve_timesheets: true,
    can_create_projects: false,
    can_manage_users: false,
    can_view_all_projects: true
  },
  developer: {
    name: 'Developer',
    can_approve_timesheets: false,
    can_create_projects: false,
    can_manage_users: false,
    can_view_all_projects: false
  },
  designer: {
    name: 'Designer',
    can_approve_timesheets: false,
    can_create_projects: false,
    can_manage_users: false,
    can_view_all_projects: false
  },
  qa_tester: {
    name: 'QA Tester',
    can_approve_timesheets: false,
    can_create_projects: false,
    can_manage_users: false,
    can_view_all_projects: false
  },
  business_analyst: {
    name: 'Business Analyst',
    can_approve_timesheets: false,
    can_create_projects: true,
    can_manage_users: false,
    can_view_all_projects: true
  },
  support: {
    name: 'Support Staff',
    can_approve_timesheets: false,
    can_create_projects: false,
    can_manage_users: false,
    can_view_all_projects: false
  }
};

export function AdminSettingsTab() {
  const { permissions, loading: permissionsLoading } = useRolePermissions();
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

  // ERP Role Management State
  const [staffRoles, setStaffRoles] = useState<ERPStaffRole[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<ERPStaffRole | null>(null);
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [roleSearchTerm, setRoleSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [formData, setFormData] = useState({
    user_id: '',
    role: 'developer' as ERPStaffRole['role'],
    department: '',
    position: '',
    hourly_rate: 0,
    can_approve_timesheets: false,
    can_create_projects: false,
    can_manage_users: false,
    can_view_all_projects: false,
    permissions: {} as any
  });

  useEffect(() => {
    if (!permissionsLoading) {
      loadSettings();
      loadStaffRoles();
      loadUsers();
      // Only load payment methods if user has admin access
      if (permissions.canAccessPaymentConfig) {
        loadPaymentMethods();
      }
    }
  }, [permissions, permissionsLoading]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*');

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data && data.length > 0) {
        const settingsMap = data.reduce((acc: any, setting: any) => {
          acc[setting.setting_key] = setting.setting_value;
          return acc;
        }, {});

        setSettings({
          company_name: settingsMap.company_name || '',
          company_email: settingsMap.company_email || '',
          company_phone: settingsMap.company_phone || '',
          default_currency: settingsMap.default_currency || 'USD',
          auto_send_invoices: settingsMap.auto_send_invoices ?? true,
          payment_reminder_days: settingsMap.payment_reminder_days || 7,
          require_approval: settingsMap.require_approval ?? true
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
      const updates = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value
      }));

      const { error } = await supabase
        .from('admin_settings')
        .upsert(updates, { 
          onConflict: 'setting_key'
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

  // ERP Role Management Functions
  const loadStaffRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('erp_staff_roles')
        .select(`
          *,
          user:user_id (email, full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStaffRoles((data || []) as any);
    } catch (error) {
      console.error('Error loading staff roles:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('full_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleCreateRole = async () => {
    try {
      const { error } = await supabase
        .from('erp_staff_roles')
        .insert([{
          user_id: formData.user_id,
          role: formData.role,
          department: formData.department,
          position: formData.position,
          hourly_rate: formData.hourly_rate,
          permissions: formData.permissions,
          can_approve_timesheets: formData.can_approve_timesheets,
          can_create_projects: formData.can_create_projects,
          can_manage_users: formData.can_manage_users,
          can_view_all_projects: formData.can_view_all_projects
        }]);

      if (error) throw error;

      await loadStaffRoles();
      setIsCreateRoleModalOpen(false);
      resetRoleForm();
      toast.success('Staff role created successfully');
    } catch (error) {
      console.error('Error creating staff role:', error);
      toast.error('Failed to create staff role');
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;

    try {
      const { error } = await supabase
        .from('erp_staff_roles')
        .update({
          role: formData.role,
          department: formData.department,
          position: formData.position,
          hourly_rate: formData.hourly_rate,
          permissions: formData.permissions,
          can_approve_timesheets: formData.can_approve_timesheets,
          can_create_projects: formData.can_create_projects,
          can_manage_users: formData.can_manage_users,
          can_view_all_projects: formData.can_view_all_projects,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedRole.id);

      if (error) throw error;

      await loadStaffRoles();
      setIsEditRoleModalOpen(false);
      setSelectedRole(null);
      resetRoleForm();
      toast.success('Staff role updated successfully');
    } catch (error) {
      console.error('Error updating staff role:', error);
      toast.error('Failed to update staff role');
    }
  };

  const handleToggleRoleActive = async (roleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('erp_staff_roles')
        .update({ 
          is_active: !isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', roleId);

      if (error) throw error;

      setStaffRoles(staffRoles.map(role => 
        role.id === roleId ? { ...role, is_active: !isActive } : role
      ));
      toast.success(`Role ${!isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling role status:', error);
      toast.error('Failed to update role status');
    }
  };

  const applyRoleTemplate = (roleType: keyof typeof ROLE_TEMPLATES) => {
    const template = ROLE_TEMPLATES[roleType];
    setFormData(prev => ({
      ...prev,
      role: roleType as ERPStaffRole['role'],
      can_approve_timesheets: template.can_approve_timesheets,
      can_create_projects: template.can_create_projects,
      can_manage_users: template.can_manage_users,
      can_view_all_projects: template.can_view_all_projects
    }));
  };

  const resetRoleForm = () => {
    setFormData({
      user_id: '',
      role: 'developer',
      department: '',
      position: '',
      hourly_rate: 0,
      can_approve_timesheets: false,
      can_create_projects: false,
      can_manage_users: false,
      can_view_all_projects: false,
      permissions: {}
    });
  };

  const openEditRoleModal = (role: ERPStaffRole) => {
    setSelectedRole(role);
    setFormData({
      user_id: role.user_id,
      role: role.role,
      department: role.department || '',
      position: role.position || '',
      hourly_rate: role.hourly_rate || 0,
      can_approve_timesheets: role.can_approve_timesheets,
      can_create_projects: role.can_create_projects,
      can_manage_users: role.can_manage_users,
      can_view_all_projects: role.can_view_all_projects,
      permissions: role.permissions || {}
    });
    setIsEditRoleModalOpen(true);
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-red-500/20 text-red-400 border-red-500/30',
      project_manager: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      operations_manager: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      developer: 'bg-green-500/20 text-green-400 border-green-500/30',
      designer: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      qa_tester: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      business_analyst: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      support: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[role as keyof typeof colors] || colors.support;
  };

  const filteredStaffRoles = staffRoles.filter(role => {
    const matchesSearch = role.user?.full_name?.toLowerCase().includes(roleSearchTerm.toLowerCase()) ||
                         role.user?.email?.toLowerCase().includes(roleSearchTerm.toLowerCase()) ||
                         role.department?.toLowerCase().includes(roleSearchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || role.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold">Admin Settings</h2>
        <p className="text-muted-foreground">
          Manage system settings, user roles, and payment configurations
        </p>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Company Settings
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            ERP Staff Roles
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Methods
          </TabsTrigger>
        </TabsList>

        {/* Company Settings Tab */}
        <TabsContent value="company" className="space-y-6">
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
        </TabsContent>

        {/* ERP Staff Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                    <p className="text-2xl font-bold">{staffRoles.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <UserCheck className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold">
                      {staffRoles.filter(role => role.is_active).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Managers</p>
                    <p className="text-2xl font-bold">
                      {staffRoles.filter(role => role.role.includes('manager') || role.role === 'admin').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Settings className="h-8 w-8 text-orange-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Departments</p>
                    <p className="text-2xl font-bold">
                      {new Set(staffRoles.map(role => role.department).filter(Boolean)).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>ERP Staff Roles</CardTitle>
                  <CardDescription>
                    Manage staff roles and permissions for the ERP system. Set who can view what and who can edit what.
                  </CardDescription>
                </div>
                <Button onClick={() => setIsCreateRoleModalOpen(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Staff Role
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search">Search Staff</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by name, email..."
                      value={roleSearchTerm}
                      onChange={(e) => setRoleSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="role-filter">Role</Label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {Object.entries(ROLE_TEMPLATES).map(([key, template]) => (
                        <SelectItem key={key} value={key}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Staff Roles Table */}
              <div className="mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaffRoles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="text-center text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No staff roles found</p>
                            <p className="text-sm">Add your first staff role to get started</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStaffRoles.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{role.user?.full_name || 'No name'}</div>
                              <div className="text-sm text-muted-foreground">{role.user?.email}</div>
                              {role.position && (
                                <div className="text-xs text-muted-foreground">{role.position}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRoleColor(role.role)}>
                              {ROLE_TEMPLATES[role.role].name}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{role.department || '-'}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {role.can_create_projects && (
                                <Badge variant="outline" className="text-xs">Create Projects</Badge>
                              )}
                              {role.can_approve_timesheets && (
                                <Badge variant="outline" className="text-xs">Approve Time</Badge>
                              )}
                              {role.can_manage_users && (
                                <Badge variant="outline" className="text-xs">Manage Users</Badge>
                              )}
                              {role.can_view_all_projects && (
                                <Badge variant="outline" className="text-xs">View All</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleRoleActive(role.id, role.is_active)}
                                className="h-8 w-8 p-0"
                              >
                                {role.is_active ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditRoleModal(role)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payments" className="space-y-6">
          {/* Payment Methods - Admin Only */}
          {permissions.canAccessPaymentConfig && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-orange-500" />
                  Payment Methods
                </CardTitle>
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
      )}

      {/* Access Denied Notice for Payment Methods */}
      {!permissions.canAccessPaymentConfig && !permissionsLoading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              Payment Configuration Access Restricted
            </CardTitle>
            <CardDescription className="text-amber-700">
              Payment method configuration is restricted to admin users only for security purposes.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

          <AddPaymentMethodModal
            isOpen={isAddPaymentModalOpen}
            onClose={() => setIsAddPaymentModalOpen(false)}
            onSuccess={() => {
              loadPaymentMethods();
              setIsAddPaymentModalOpen(false);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Role Management Modals */}
      <Dialog open={isCreateRoleModalOpen || isEditRoleModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateRoleModalOpen(false);
          setIsEditRoleModalOpen(false);
          resetRoleForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreateRoleModalOpen ? 'Create Staff Role' : 'Edit Staff Role'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="user_id">Staff Member *</Label>
                <Select 
                  value={formData.user_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, user_id: value }))}
                  disabled={isEditRoleModalOpen}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || user.email} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="role">Role *</Label>
                <Select 
                  value={formData.role}
                  onValueChange={(value: ERPStaffRole['role']) => {
                    applyRoleTemplate(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_TEMPLATES).map(([key, template]) => (
                      <SelectItem key={key} value={key}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="e.g., Development, Design, QA"
                />
              </div>

              <div>
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="e.g., Senior Developer, UI Designer"
                />
              </div>

              <div>
                <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.hourly_rate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: parseFloat(e.target.value) || 0 }))}
                  placeholder="50.00"
                />
              </div>
            </div>

            {/* Permission Toggles */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium">Permissions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="can_approve_timesheets"
                    checked={formData.can_approve_timesheets}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, can_approve_timesheets: checked }))}
                  />
                  <Label htmlFor="can_approve_timesheets">Can approve timesheets</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="can_create_projects"
                    checked={formData.can_create_projects}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, can_create_projects: checked }))}
                  />
                  <Label htmlFor="can_create_projects">Can create projects</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="can_manage_users"
                    checked={formData.can_manage_users}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, can_manage_users: checked }))}
                  />
                  <Label htmlFor="can_manage_users">Can manage users</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="can_view_all_projects"
                    checked={formData.can_view_all_projects}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, can_view_all_projects: checked }))}
                  />
                  <Label htmlFor="can_view_all_projects">Can view all projects</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateRoleModalOpen(false);
              setIsEditRoleModalOpen(false);
              resetRoleForm();
            }}>
              Cancel
            </Button>
            <Button onClick={isCreateRoleModalOpen ? handleCreateRole : handleUpdateRole}>
              {isCreateRoleModalOpen ? 'Create Role' : 'Update Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}