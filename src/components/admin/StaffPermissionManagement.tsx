import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Shield, UserPlus, X, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface StaffMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface Permission {
  id: string;
  staff_user_id: string;
  permission_type: string;
  granted_by: string;
  granted_at: string;
  expires_at: string | null;
  revoked: boolean;
  staff_name?: string;
}

const AVAILABLE_PERMISSIONS = [
  { value: 'quotes_manage', label: 'Manage Quotes', description: 'Create and manage client quote requests' },
  { value: 'invoices_manage', label: 'Manage Invoices', description: 'Create and manage client invoices' },
  { value: 'projects_view', label: 'View Projects', description: 'View all projects (read-only)' },
  { value: 'projects_manage', label: 'Manage Projects', description: 'Create and edit projects' },
  { value: 'users_view', label: 'View Users', description: 'View user list (read-only)' },
  { value: 'users_manage', label: 'Manage Users', description: 'Edit user details (no role changes)' },
  { value: 'reports_view', label: 'View Reports', description: 'Access analytics and reports' },
  { value: 'workflows_manage', label: 'Manage Workflows', description: 'Create and manage workflows' },
  { value: 'messages_manage', label: 'Manage Messages', description: 'Send messages to clients and team' },
  { value: 'files_manage', label: 'Manage Files', description: 'Upload and manage files' },
  { value: 'team_view', label: 'View Team', description: 'View team members' },
  { value: 'portfolio_manage', label: 'Manage Portfolio', description: 'Manage portfolio submissions' },
  { value: 'erp_view', label: 'View ERP', description: 'View ERP data (read-only)' },
  { value: 'erp_manage', label: 'Manage ERP', description: 'Full ERP access' },
];

export function StaffPermissionManagement() {
  const { user } = useAuth();
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [expiryDays, setExpiryDays] = useState<number>(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load staff members
      const { data: staff, error: staffError } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('role', 'staff')
        .order('full_name');

      if (staffError) throw staffError;
      setStaffMembers(staff || []);

      // Load existing permissions
      const { data: perms, error: permsError } = await supabase
        .from('staff_permissions')
        .select(`
          id,
          staff_user_id,
          permission_type,
          granted_by,
          granted_at,
          expires_at,
          revoked,
          profiles:staff_user_id (full_name)
        `)
        .eq('revoked', false)
        .order('granted_at', { ascending: false });

      if (permsError) throw permsError;

      // Format permissions with staff names
      const formattedPerms = (perms || []).map((p: any) => ({
        ...p,
        staff_name: p.profiles?.full_name || 'Unknown',
      }));

      setPermissions(formattedPerms);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load staff permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleGrantPermissions = async () => {
    if (!selectedStaff || selectedPermissions.length === 0) {
      toast.error('Please select a staff member and at least one permission');
      return;
    }

    try {
      const expiresAt = expiryDays > 0
        ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const permissionsToGrant = selectedPermissions.map(permission_type => ({
        staff_user_id: selectedStaff,
        granted_by: user?.id,
        permission_type,
        expires_at: expiresAt,
        revoked: false,
      }));

      const { error } = await supabase
        .from('staff_permissions')
        .insert(permissionsToGrant);

      if (error) throw error;

      toast.success(`Granted ${selectedPermissions.length} permissions successfully`);
      setDialogOpen(false);
      setSelectedStaff('');
      setSelectedPermissions([]);
      setExpiryDays(0);
      await loadData();
    } catch (error) {
      console.error('Error granting permissions:', error);
      toast.error('Failed to grant permissions');
    }
  };

  const handleRevokePermission = async (permissionId: string) => {
    if (!confirm('Are you sure you want to revoke this permission?')) return;

    try {
      const { error } = await supabase
        .from('staff_permissions')
        .update({
          revoked: true,
          revoked_at: new Date().toISOString(),
          revoked_by: user?.id,
        })
        .eq('id', permissionId);

      if (error) throw error;

      toast.success('Permission revoked successfully');
      await loadData();
    } catch (error) {
      console.error('Error revoking permission:', error);
      toast.error('Failed to revoke permission');
    }
  };

  const togglePermission = (permissionValue: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionValue)
        ? prev.filter(p => p !== permissionValue)
        : [...prev, permissionValue]
    );
  };

  const getPermissionLabel = (type: string) => {
    return AVAILABLE_PERMISSIONS.find(p => p.value === type)?.label || type;
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading permissions...</div>;
  }

  // Group permissions by staff member
  const permissionsByStaff = permissions.reduce((acc, perm) => {
    if (!acc[perm.staff_user_id]) {
      acc[perm.staff_user_id] = [];
    }
    acc[perm.staff_user_id].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Staff Permission Management
              </CardTitle>
              <CardDescription>
                Delegate dashboard access to staff members
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Grant Permissions
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Grant Staff Permissions</DialogTitle>
                  <DialogDescription>
                    Select a staff member and choose which permissions to grant
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Staff Selection */}
                  <div className="space-y-2">
                    <Label>Select Staff Member</Label>
                    <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        {staffMembers.map(staff => (
                          <SelectItem key={staff.id} value={staff.id}>
                            {staff.full_name} ({staff.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Expiry */}
                  <div className="space-y-2">
                    <Label>Permission Duration</Label>
                    <Select
                      value={expiryDays.toString()}
                      onValueChange={(value) => setExpiryDays(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Permanent (No expiry)</SelectItem>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">180 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Permissions Selection */}
                  <div className="space-y-3">
                    <Label>Select Permissions</Label>
                    <div className="grid grid-cols-1 gap-3">
                      {AVAILABLE_PERMISSIONS.map(perm => (
                        <div
                          key={perm.value}
                          className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => togglePermission(perm.value)}
                        >
                          <Checkbox
                            checked={selectedPermissions.includes(perm.value)}
                            onCheckedChange={() => togglePermission(perm.value)}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{perm.label}</div>
                            <div className="text-sm text-gray-500">{perm.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleGrantPermissions}
                      disabled={!selectedStaff || selectedPermissions.length === 0}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Grant {selectedPermissions.length} Permission(s)
                    </Button>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Active Permissions by Staff */}
      {staffMembers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-muted-foreground">
            No staff members found. Add staff members in the Users tab first.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {staffMembers.map(staff => {
            const staffPerms = permissionsByStaff[staff.id] || [];
            const activePerms = staffPerms.filter(p => !isExpired(p.expires_at));

            return (
              <Card key={staff.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">{staff.full_name}</CardTitle>
                      <CardDescription>{staff.email}</CardDescription>
                    </div>
                    <Badge variant={activePerms.length > 0 ? 'default' : 'secondary'}>
                      {activePerms.length} Active Permission(s)
                    </Badge>
                  </div>
                </CardHeader>
                {activePerms.length > 0 && (
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Permission</TableHead>
                          <TableHead>Granted</TableHead>
                          <TableHead>Expires</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activePerms.map(perm => (
                          <TableRow key={perm.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-blue-600" />
                                {getPermissionLabel(perm.permission_type)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(perm.granted_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {perm.expires_at ? (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(perm.expires_at).toLocaleDateString()}
                                </div>
                              ) : (
                                <Badge variant="outline">Permanent</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRevokePermission(perm.id)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Revoke
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-blue-900">How Staff Permissions Work:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Staff members have NO access by default</li>
                <li>Project managers can grant specific permissions</li>
                <li>Permissions can be permanent or temporary</li>
                <li>Revoked permissions take effect immediately</li>
                <li>Staff will see only the tabs they have access to</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
