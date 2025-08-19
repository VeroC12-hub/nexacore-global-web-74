import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  Settings, 
  Mail, 
  Trash2, 
  Phone, 
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  UserMinus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TeamMember {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  status: string;
  created_at: string;
  last_sign_in_at: string | null;
  bio: string | null;
}

interface NewMemberData {
  email: string;
  full_name: string;
  role: string;
}

interface AdminTeamTabProps {
  onStatsUpdate: () => void;
}

const AdminTeamTab: React.FC<AdminTeamTabProps> = ({ onStatsUpdate }) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMember, setNewMember] = useState<NewMemberData>({
    email: '',
    full_name: '',
    role: 'staff'
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  // Load team members from Supabase
  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          phone,
          role,
          status,
          created_at,
          last_sign_in_at,
          bio
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading team members:', error);
        toast({
          title: 'Error',
          description: 'Failed to load team members',
          variant: 'destructive'
        });
        return;
      }

      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error loading team members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load team members',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeamMembers();
  }, []);

  // Add new team member
  const handleAddMember = async () => {
    if (!newMember.email || !newMember.full_name) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setActionLoading('adding');
      // Note: Loading toast not needed with shadcn/ui toast system

      // First, invite the user to create an account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newMember.email,
        password: generateTempPassword(), // Generate a temporary password
        options: {
          data: {
            full_name: newMember.full_name,
            role: newMember.role,
          }
        }
      });

      if (authError) {
        // If user already exists, try to create profile directly
        if (authError.message.includes('already registered')) {
          // Get existing user and update profile
          const { data: existingUser, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', newMember.email)
            .single();

          if (fetchError) {
            throw new Error('User email already exists but profile not found');
          }

          // Update existing profile
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              full_name: newMember.full_name,
              role: newMember.role,
              status: 'approved'
            })
            .eq('email', newMember.email);

          if (updateError) throw updateError;
        } else {
          throw authError;
        }
      } else if (authData.user) {
        // Create profile for new user
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: newMember.email,
            full_name: newMember.full_name,
            role: newMember.role,
            status: 'pending'
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw profileError;
        }

        // Send password reset email so they can set their own password
        await supabase.auth.resetPasswordForEmail(newMember.email, {
          redirectTo: `${window.location.origin}/reset-password`
        });
      }

      toast({
        title: 'Success',
        description: 'Team member added successfully! They will receive an email to set up their account.'
      });
      
      setIsAddModalOpen(false);
      setNewMember({ email: '', full_name: '', role: 'staff' });
      loadTeamMembers();
      onStatsUpdate();

    } catch (error: any) {
      console.error('Error adding team member:', error);
      toast.dismiss();
      toast.error(error.message || 'Failed to add team member');
    } finally {
      setActionLoading(null);
    }
  };

  // Update team member role
  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      setActionLoading(memberId);
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Role updated successfully'
      });
      loadTeamMembers();
      onStatsUpdate();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update role',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Update team member status
  const handleUpdateStatus = async (memberId: string, newStatus: string) => {
    try {
      setActionLoading(memberId);
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', memberId);

      if (error) throw error;

      const statusText = newStatus === 'approved' ? 'approved' : 
                        newStatus === 'inactive' ? 'deactivated' : 
                        newStatus === 'suspended' ? 'suspended' : 'updated';
      
      toast({
        title: 'Success',
        description: `User ${statusText} successfully`
      });
      loadTeamMembers();
      onStatsUpdate();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Remove team member (set status to inactive)
  const handleRemoveMember = async (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return;

    const confirmMessage = `Are you sure you want to remove ${member.full_name || member.email}? This will deactivate their account.`;
    if (!confirm(confirmMessage)) return;

    try {
      setActionLoading(memberId);
      
      // Set status to inactive instead of deleting
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'inactive' })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Team member removed successfully'
      });
      loadTeamMembers();
      onStatsUpdate();
    } catch (error: any) {
      console.error('Error removing team member:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove team member',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Permanently delete team member
  const handleDeleteMember = async (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return;

    const confirmMessage = `Are you sure you want to PERMANENTLY DELETE ${member.full_name || member.email}? This action cannot be undone and will remove all their data.`;
    if (!confirm(confirmMessage)) return;

    try {
      setActionLoading(memberId);
      
      // Delete from profiles table (this will cascade due to foreign key constraints)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Team member deleted permanently'
      });
      loadTeamMembers();
      onStatsUpdate();
    } catch (error: any) {
      console.error('Error deleting team member:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete team member',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Resend invitation email
  const handleResendInvitation = async (email: string) => {
    try {
      setActionLoading(email);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to send invitation email',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Invitation email sent successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send invitation email',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Generate temporary password
  const generateTempPassword = (): string => {
    return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
  };

  // Get role color styling
  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'admin': return 'bg-red-500 text-white';
      case 'project_manager': return 'bg-blue-500 text-white';
      case 'operations_manager': return 'bg-purple-500 text-white';
      case 'business_analyst': return 'bg-indigo-500 text-white';
      case 'quality_assurance': return 'bg-orange-500 text-white';
      case 'sales_manager': return 'bg-pink-500 text-white';
      case 'staff': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Get status color styling
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'approved': return 'bg-green-500 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      case 'inactive': return 'bg-gray-500 text-white';
      case 'suspended': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'inactive': return <UserMinus className="h-4 w-4" />;
      case 'suspended': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading team members...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-2xl font-bold">Team Management</CardTitle>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button disabled={actionLoading === 'adding'}>
              <UserPlus className="h-4 w-4 mr-2" />
              {actionLoading === 'adding' ? 'Adding...' : 'Add Team Member'}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Team Member</DialogTitle>
              <DialogDescription>
                Invite a new team member to join NexaCore Innovations. They will receive an email to set up their account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={newMember.email}
                  onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                  disabled={actionLoading === 'adding'}
                />
              </div>
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  placeholder="John Smith"
                  value={newMember.full_name}
                  onChange={(e) => setNewMember(prev => ({ ...prev, full_name: e.target.value }))}
                  disabled={actionLoading === 'adding'}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={newMember.role} 
                  onValueChange={(value) => setNewMember(prev => ({ ...prev, role: value }))}
                  disabled={actionLoading === 'adding'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="project_manager">Project Manager</SelectItem>
                    <SelectItem value="operations_manager">Operations Manager</SelectItem>
                    <SelectItem value="business_analyst">Business Analyst</SelectItem>
                    <SelectItem value="quality_assurance">Quality Assurance</SelectItem>
                    <SelectItem value="sales_manager">Sales Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={actionLoading === 'adding'}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddMember}
                  disabled={actionLoading === 'adding'}
                >
                  {actionLoading === 'adding' ? 'Adding...' : 'Add Member'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {teamMembers.length === 0 ? (
          <div className="text-center py-8">
            <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
            <p className="text-gray-500 mb-4">Start building your NexaCore team by inviting members.</p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add First Team Member
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Role</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Last Active</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <tr key={member.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                          {member.full_name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{member.full_name || 'No name'}</div>
                          {member.phone && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {member.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-2 text-sm text-gray-600">{member.email}</td>
                    <td className="p-2">
                      <Badge className={getRoleColor(member.role)}>
                        {member.role.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(member.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(member.status)}
                            {member.status}
                          </div>
                        </Badge>
                      </div>
                    </td>
                    <td className="p-2 text-sm text-gray-500">
                      <div>
                        {member.last_sign_in_at 
                          ? formatDate(member.last_sign_in_at)
                          : 'Never'
                        }
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        {/* Role Update */}
                        <Select 
                          value={member.role} 
                          onValueChange={(newRole) => handleUpdateRole(member.id, newRole)}
                          disabled={actionLoading === member.id}
                        >
                          <SelectTrigger className="w-auto h-8 text-xs">
                            <Settings className="h-3 w-3" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="project_manager">Project Manager</SelectItem>
                            <SelectItem value="operations_manager">Operations Manager</SelectItem>
                            <SelectItem value="business_analyst">Business Analyst</SelectItem>
                            <SelectItem value="quality_assurance">Quality Assurance</SelectItem>
                            <SelectItem value="sales_manager">Sales Manager</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Status Update */}
                        <Select 
                          value={member.status} 
                          onValueChange={(newStatus) => handleUpdateStatus(member.id, newStatus)}
                          disabled={actionLoading === member.id}
                        >
                          <SelectTrigger className="w-auto h-8 text-xs">
                            {getStatusIcon(member.status)}
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {/* Resend Invitation */}
                        {member.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResendInvitation(member.email)}
                            className="h-8 px-2"
                            disabled={actionLoading === member.email}
                            title="Resend invitation email"
                          >
                            <Mail className="h-3 w-3" />
                          </Button>
                        )}
                        
                        {/* Remove/Deactivate */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveMember(member.id)}
                          className="h-8 px-2 text-orange-600 hover:text-orange-700"
                          disabled={actionLoading === member.id}
                          title="Deactivate user"
                        >
                          <UserMinus className="h-3 w-3" />
                        </Button>

                        {/* Permanent Delete */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteMember(member.id)}
                          className="h-8 px-2 text-red-600 hover:text-red-700"
                          disabled={actionLoading === member.id}
                          title="Permanently delete user"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { AdminTeamTab };
export default AdminTeamTab;
