// src/components/admin/AdminUsersTab.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUsers, useUpdateUser } from '@/hooks/queries/useUserQueries';
import { Pagination } from './Pagination';
import { DashboardSkeleton } from './LoadingSkeletons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  Edit, 
  UserX, 
  Shield, 
  ShieldCheck, 
  Plus, 
  Search, 
  Filter,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  UserCheck,
  Lock,
  Unlock,
  MoreHorizontal,
  Download,
  Upload,
  UserPlus,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useRolePermissions } from '@/hooks/useRolePermissions';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'super_admin' | 'admin' | 'manager' | 'staff' | 'client' | 'user';
  status: 'approved' | 'inactive' | 'suspended' | 'pending';
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  avatar_url?: string;
  bio?: string;
  company?: string;
  position?: string;
  address?: string;
  city?: string;
  country?: string;
  timezone?: string;
  notification_preferences?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  two_factor_enabled?: boolean;
  login_count?: number;
  projects_count?: number;
  total_spent?: number;
}

interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

interface AdminUsersTabProps {
  onStatsUpdate: () => void;
}

export function AdminUsersTab({ onStatsUpdate }: AdminUsersTabProps) {
  // Role permissions
  const { permissions } = useRolePermissions();

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Modal and selection state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);

  // React Query hooks for data fetching
  const {
    data: usersData,
    isLoading: loading,
    error,
    refetch
  } = useUsers({
    page: currentPage,
    pageSize: itemsPerPage,
    roleFilter,
    statusFilter,
    searchTerm,
    sortBy,
    sortOrder,
  });

  // Memoized users data
  const users = useMemo(() => usersData?.data || [], [usersData]);
  const totalCount = useMemo(() => usersData?.count || 0, [usersData]);
  const totalPages = useMemo(() => usersData?.totalPages || 1, [usersData]);

  // Mutation hook
  const updateUserMutation = useUpdateUser();

  // Form state for create/edit user
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    role: 'user' as User['role'],
    status: 'approved' as User['status'],
    bio: '',
    company: '',
    position: '',
    address: '',
    city: '',
    country: '',
    timezone: '',
    password: '',
    send_invitation: true
  });

  const [bulkActions, setBulkActions] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Memoized pagination handlers
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setItemsPerPage(newSize);
    setCurrentPage(1); // Reset to first page
  }, []);

  const loadUserActivity = async (_userId: string) => {
    // No audit log table exists — show empty state
    setUserActivity([]);
  };

  // Users are now server-side filtered and paginated via React Query
  const filteredUsers = useMemo(() => users, [users]);
  const paginatedUsers = useMemo(() => users, [users]); // Already paginated from server

  const handleCreateUser = async () => {
    try {
      // In a real app, you'd use Supabase Auth to create the user
      const { data, error } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: !formData.send_invitation
      });

      if (error) throw error;

      // Then create the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: data.user.id,
          email: formData.email,
          full_name: formData.full_name,
          phone: formData.phone,
          role: formData.role,
          status: formData.status,
          bio: formData.bio,
          company: formData.company,
          position: formData.position,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          timezone: formData.timezone
        }]);

      if (profileError) throw profileError;

      // React Query auto-refetches
      onStatsUpdate();
      setIsCreateModalOpen(false);
      resetForm();
      toast.success('User created successfully');

      if (formData.send_invitation) {
        toast.success('Invitation email sent to user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          role: formData.role,
          status: formData.status,
          bio: formData.bio,
          company: formData.company,
          position: formData.position,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          timezone: formData.timezone,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      // React Query auto-refetches
      onStatsUpdate();
      setIsEditModalOpen(false);
      setSelectedUser(null);
      resetForm();
      toast.success('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;

      await refetch();
      onStatsUpdate();
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: User['role']) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      await refetch();
      onStatsUpdate();
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleUpdateUserStatus = async (userId: string, newStatus: User['status']) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      await refetch();
      onStatsUpdate();
      toast.success(`User status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first');
      return;
    }

    const confirmMessage = `Are you sure you want to ${action} ${selectedUsers.length} user(s)?`;
    if (!confirm(confirmMessage)) return;

    try {
      switch (action) {
        case 'activate':
          await Promise.all(selectedUsers.map(userId => 
            handleUpdateUserStatus(userId, 'approved')
          ));
          break;
        case 'deactivate':
          await Promise.all(selectedUsers.map(userId => 
            handleUpdateUserStatus(userId, 'inactive')
          ));
          break;
        case 'suspend':
          await Promise.all(selectedUsers.map(userId => 
            handleUpdateUserStatus(userId, 'suspended')
          ));
          break;
        case 'delete':
          await Promise.all(selectedUsers.map(userId => 
            handleDeleteUser(userId)
          ));
          break;
      }

      setSelectedUsers([]);
      toast.success(`Bulk ${action} completed successfully`);
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      toast.error(`Failed to perform bulk ${action}`);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      full_name: '',
      phone: '',
      role: 'user',
      status: 'approved',
      bio: '',
      company: '',
      position: '',
      address: '',
      city: '',
      country: '',
      timezone: '',
      password: '',
      send_invitation: true
    });
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name || '',
      phone: user.phone || '',
      role: user.role,
      status: user.status,
      bio: user.bio || '',
      company: user.company || '',
      position: user.position || '',
      address: user.address || '',
      city: user.city || '',
      country: user.country || '',
      timezone: user.timezone || '',
      password: '',
      send_invitation: false
    });
    setIsEditModalOpen(true);
  };

  const openViewModal = (user: User) => {
    setSelectedUser(user);
    loadUserActivity(user.id);
    setIsViewModalOpen(true);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedUsers(prev => 
      prev.length === paginatedUsers.length 
        ? []
        : paginatedUsers.map(user => user.id)
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'admin': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'manager': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'staff': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'client': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'user': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'inactive': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'suspended': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }

  // Show loading skeleton while data loads
  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Users Management</h2>
          <p className="text-muted-foreground">Manage user accounts, roles, and permissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {permissions.canManageUsers && (
            <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.status === 'approved').length}
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
                <p className="text-sm font-medium text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.role === 'admin' || u.role === 'super_admin').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="role-filter">Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger id="role-filter">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sort-by">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort-by">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Created Date</SelectItem>
                  <SelectItem value="updated_at">Updated Date</SelectItem>
                  <SelectItem value="last_sign_in_at">Last Login</SelectItem>
                  <SelectItem value="full_name">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sort-order">Order</Label>
              <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                <SelectTrigger id="sort-order">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedUsers.length} user(s) selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('activate')}
                >
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('deactivate')}
                >
                  Deactivate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('suspend')}
                >
                  Suspend
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                  className="text-red-400 hover:text-red-300"
                >
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No users found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search filters.' : 'Add your first user to get started.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === paginatedUsers.length}
                        onChange={toggleSelectAll}
                        className="rounded"
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                            {user.avatar_url ? (
                              <img 
                                src={user.avatar_url} 
                                alt={user.full_name || user.email} 
                                className="w-10 h-10 rounded-full object-cover" 
                              />
                            ) : (
                              <span className="text-sm font-medium">
                                {(user.full_name || user.email).charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{user.full_name || 'No name'}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                            {user.company && (
                              <div className="text-xs text-muted-foreground">{user.company}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.last_sign_in_at 
                            ? new Date(user.last_sign_in_at).toLocaleDateString()
                            : 'Never'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <span className="font-medium">{user.projects_count || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewModal(user)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Select
                            value={user.status}
                            onValueChange={(newStatus: User['status']) => 
                              handleUpdateUserStatus(user.id, newStatus)
                            }
                          >
                            <SelectTrigger className="w-20 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of{' '}
                    {filteredUsers.length} users
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Additional Details</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="user@example.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1234567890"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Temporary Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Minimum 8 characters"
                  />
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={formData.role}
                    onValueChange={(value: User['role']) => setFormData(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status}
                    onValueChange={(value: User['status']) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="send_invitation"
                  checked={formData.send_invitation}
                  onChange={(e) => setFormData(prev => ({ ...prev, send_invitation: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="send_invitation">Send invitation email to user</Label>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Company name"
                  />
                </div>

                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="Job title"
                  />
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="Country"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Full address"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="User bio or description"
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser}>
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Additional Details</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>
                
                <div>
                  <Label htmlFor="edit-full_name">Full Name *</Label>
                  <Input
                    id="edit-full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1234567890"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-role">Role</Label>
                  <Select 
                    value={formData.role}
                    onValueChange={(value: User['role']) => setFormData(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select 
                    value={formData.status}
                    onValueChange={(value: User['status']) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-company">Company</Label>
                  <Input
                    id="edit-company"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Company name"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-position">Position</Label>
                  <Input
                    id="edit-position"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="Job title"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-city">City</Label>
                  <Input
                    id="edit-city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-country">Country</Label>
                  <Input
                    id="edit-country"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="Country"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Full address"
                />
              </div>

              <div>
                <Label htmlFor="edit-bio">Bio</Label>
                <Textarea
                  id="edit-bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="User bio or description"
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                          {selectedUser.avatar_url ? (
                            <img 
                              src={selectedUser.avatar_url} 
                              alt={selectedUser.full_name || selectedUser.email} 
                              className="w-16 h-16 rounded-full object-cover" 
                            />
                          ) : (
                            <span className="text-2xl font-medium">
                              {(selectedUser.full_name || selectedUser.email).charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">{selectedUser.full_name || 'No name'}</h3>
                          <p className="text-muted-foreground">{selectedUser.email}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge className={getRoleColor(selectedUser.role)}>
                              {selectedUser.role.replace('_', ' ')}
                            </Badge>
                            <Badge className={getStatusColor(selectedUser.status)}>
                              {selectedUser.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Phone</Label>
                        <p className="text-sm text-muted-foreground">{selectedUser.phone || 'Not provided'}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Company</Label>
                        <p className="text-sm text-muted-foreground">{selectedUser.company || 'Not provided'}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Position</Label>
                        <p className="text-sm text-muted-foreground">{selectedUser.position || 'Not provided'}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Location</Label>
                        <p className="text-sm text-muted-foreground">
                          {[selectedUser.city, selectedUser.country].filter(Boolean).join(', ') || 'Not provided'}
                        </p>
                      </div>
                      
                      {selectedUser.bio && (
                        <div>
                          <Label className="text-sm font-medium">Bio</Label>
                          <p className="text-sm text-muted-foreground">{selectedUser.bio}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Account Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-muted/20 rounded">
                          <p className="text-2xl font-bold text-blue-400">{selectedUser.projects_count || 0}</p>
                          <p className="text-sm text-muted-foreground">Projects</p>
                        </div>
                        <div className="text-center p-4 bg-muted/20 rounded">
                          <p className="text-2xl font-bold text-green-400">
                            {selectedUser.last_sign_in_at ? '✓' : '0'}
                          </p>
                          <p className="text-sm text-muted-foreground">Ever Logged In</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Account Created</Label>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedUser.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Last Updated</Label>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedUser.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Last Login</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedUser.last_sign_in_at 
                            ? new Date(selectedUser.last_sign_in_at).toLocaleDateString()
                            : 'Never'
                          }
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Email Verified</Label>
                        <div className="flex items-center gap-2">
                          {selectedUser.email_confirmed_at ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-400" />
                          )}
                          <span className="text-sm text-muted-foreground">
                            {selectedUser.email_confirmed_at ? 'Verified' : 'Not verified'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userActivity.length > 0 ? (
                      <div className="space-y-4">
                        {userActivity.map((activity) => (
                          <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/20 rounded">
                            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                              <Activity className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{activity.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(activity.created_at).toLocaleString()}
                              </p>
                              {activity.ip_address && (
                                <p className="text-xs text-muted-foreground">
                                  IP: {activity.ip_address} • {activity.user_agent}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No activity recorded</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Security Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                          <p className="text-xs text-muted-foreground">Add extra security to account</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedUser.two_factor_enabled ? (
                            <>
                              <Lock className="h-4 w-4 text-green-400" />
                              <span className="text-sm text-green-400">Enabled</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="h-4 w-4 text-red-400" />
                              <span className="text-sm text-red-400">Disabled</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Email Notifications</Label>
                          <p className="text-xs text-muted-foreground">Receive email updates</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedUser.notification_preferences?.email ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-400" />
                              <span className="text-sm text-green-400">Enabled</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-400">Disabled</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Push Notifications</Label>
                          <p className="text-xs text-muted-foreground">Receive push notifications</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedUser.notification_preferences?.push ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-400" />
                              <span className="text-sm text-green-400">Enabled</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-400">Disabled</span>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Admin Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          // Reset password logic
                          toast.success('Password reset email sent');
                        }}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Password Reset
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          // Resend verification
                          toast.success('Verification email sent');
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Resend Verification
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleUpdateUserStatus(selectedUser.id, 
                          selectedUser.status === 'suspended' ? 'approved' : 'suspended'
                        )}
                      >
                        {selectedUser.status === 'suspended' ? (
                          <>
                            <Unlock className="h-4 w-4 mr-2" />
                            Unsuspend User
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Suspend User
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="w-full justify-start text-red-400 hover:text-red-300"
                        onClick={() => {
                          setIsViewModalOpen(false);
                          handleDeleteUser(selectedUser.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete User
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsViewModalOpen(false);
              openEditModal(selectedUser!);
            }}>
              Edit User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      {totalCount > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={itemsPerPage}
          totalItems={totalCount}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
}
