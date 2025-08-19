// src/components/admin/AdminTeamTab.tsx - Fixed with correct Supabase import

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { UserPlus, Settings, Trash2, Mail, Phone, Calendar } from 'lucide-react';
// Use the correct Supabase import based on your project structure
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  created_at: string;
  last_sign_in_at?: string;
  phone?: string;
  avatar_url?: string;
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

  // Load team members on component mount
  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading team members:', error);
        toast.error('Failed to load team members');
        return;
      }

      setTeamMembers(data || []);
    } catch (error: any) {
      console.error('Error loading team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  // Generate a secure temporary password
  const generateTemporaryPassword = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check if user already exists
  const checkUserExists = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  };

  // Main function to add new team member
  const handleAddMember = async () => {
    try {
      // Validation
      if (!newMember.email || !newMember.full_name || !newMember.role) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (!isValidEmail(newMember.email)) {
        toast.error('Please enter a valid email address');
        return;
      }

      // Check if user already exists
      const userExists = await checkUserExists(newMember.email);
      if (userExists) {
        toast.error('A user with this email already exists');
        return;
      }

      // Show loading state
      toast.loading('Creating team member account...');

      // Step 1: Create the authenticated user first using Supabase Auth
      const temporaryPassword = generateTemporaryPassword();
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newMember.email,
        password: temporaryPassword,
        options: {
          data: {
            full_name: newMember.full_name,
            role: newMember.role
          }
        }
      });

      if (authError) {
        console.error('Auth creation failed:', authError);
        toast.dismiss();
        toast.error(`Account creation failed: ${authError.message}`);
        return;
      }

      if (!authData.user) {
        toast.dismiss();
        toast.error('User creation failed - no user returned');
        return;
      }

      // Step 2: Create/update the profile using the auth user's ID
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([{
          id: authData.user.id, // Use the auth user's ID, not a random UUID
          email: newMember.email,
          full_name: newMember.full_name,
          role: newMember.role,
          status: 'pending' // They'll need to reset password and activate account
        }]);

      if (profileError) {
        console.error('Profile creation failed:', profileError);
        toast.dismiss();
        toast.error(`Profile creation failed: ${profileError.message}`);
        return;
      }

      // Step 3: Send invitation email with password reset link
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        newMember.email,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`
        }
      );

      if (resetError) {
        console.warn('Password reset email failed:', resetError);
        // Don't fail the whole process if email fails
      }

      toast.dismiss();
      toast.success('Team member invited successfully! They will receive an email to set up their account.');
      
      // Reset form and close modal
      setIsAddModalOpen(false);
      setNewMember({ email: '', full_name: '', role: 'staff' });
      
      // Reload team members and update stats
      loadTeamMembers();
      onStatsUpdate();

    } catch (error: any) {
      console.error('Error adding team member:', error);
      toast.dismiss();
      toast.error(error.message || 'Failed to add team member');
    }
  };

  // Update team member role
  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      toast.success('Role updated successfully');
      loadTeamMembers();
      onStatsUpdate();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(error.message || 'Failed to update role');
    }
  };

  // Remove team member
  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      // Update status to inactive instead of deleting
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'inactive' })
        .eq('id', memberId);

      if (error) throw error;

      toast.success('Team member removed successfully');
      loadTeamMembers();
      onStatsUpdate();
    } catch (error: any) {
      console.error('Error removing team member:', error);
      toast.error(error.message || 'Failed to remove team member');
    }
  };

  // Resend invitation
  const handleResendInvitation = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`
        }
      );

      if (error) {
        toast.error('Failed to send invitation email');
        return;
      }

      toast.success('Invitation email sent successfully');
    } catch (error) {
      toast.error('Failed to send invitation email');
    }
  };

  // Get role color for badges
  const getRoleColor = (role: string) => {
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

  // Get status color for badges
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      case 'inactive': return 'bg-gray-500 text-white';
      case 'suspended': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
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
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Team Member</DialogTitle>
              <DialogDescription>
                Invite a new team member to join your organization. They will receive an email to set up their account.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="benjamin.agbesi@nexacore-innovations.com"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  placeholder="Benjamin Agbesi"
                  value={newMember.full_name}
                  onChange={(e) => setNewMember({ ...newMember, full_name: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={newMember.role} onValueChange={(value) => setNewMember({ ...newMember, role: value })}>
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
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMember}>
                Send Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {teamMembers.length === 0 ? (
          <div className="text-center py-8">
            <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
            <p className="text-gray-500 mb-4">Start building your team by inviting members.</p>
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
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-gray-400" />
                        {member.email}
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge className={getRoleColor(member.role)}>
                        {member.role?.replace('_', ' ') || 'No role'}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Badge className={getStatusColor(member.status)}>
                        {member.status || 'Unknown'}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {member.last_sign_in_at 
                          ? new Date(member.last_sign_in_at).toLocaleDateString()
                          : 'Never'
                        }
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        <Select 
                          value={member.role} 
                          onValueChange={(newRole) => handleUpdateRole(member.id, newRole)}
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
                        
                        {member.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResendInvitation(member.email)}
                            className="h-8 px-2"
                          >
                            <Mail className="h-3 w-3" />
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveMember(member.id)}
                          className="h-8 px-2 text-red-600 hover:text-red-700"
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

export default AdminTeamTab;
