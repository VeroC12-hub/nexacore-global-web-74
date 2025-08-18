import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, UserPlus, Shield } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  created_at: string;
  last_sign_in_at: string;
}

interface AdminTeamTabProps {
  onStatsUpdate: () => void;
}

export function AdminTeamTab({ onStatsUpdate }: AdminTeamTabProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    email: '',
    full_name: '',
    role: 'staff'
  });

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'staff', 'project_manager'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error loading team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    try {
      // In a real implementation, you would invite the user via email
      // For now, we'll just add a placeholder entry
      const { error } = await supabase
        .from('profiles')
        .insert([{
          id: crypto.randomUUID(),
          email: newMember.email,
          full_name: newMember.full_name,
          role: newMember.role,
          status: 'invited'
        }]);

      if (error) throw error;

      toast.success('Team member invited successfully');
      setIsAddModalOpen(false);
      setNewMember({ email: '', full_name: '', role: 'staff' });
      loadTeamMembers();
      onStatsUpdate();
    } catch (error: any) {
      console.error('Error adding team member:', error);
      toast.error(error.message || 'Failed to add team member');
    }
  };

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

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'member', status: 'inactive' })
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500 text-white';
      case 'project_manager': return 'bg-blue-500 text-white';
      case 'staff': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500 text-white';
      case 'invited': return 'bg-yellow-500 text-white';
      case 'inactive': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return <div>Loading team members...</div>;
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Team Member</DialogTitle>
              <DialogDescription>
                Invite a new team member to join your organization.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={newMember.full_name}
                  onChange={(e) => setNewMember({ ...newMember, full_name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newMember.role} onValueChange={(value) => setNewMember({ ...newMember, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="project_manager">Project Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMember}>
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.full_name || 'N/A'}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>
                  <Badge className={getRoleColor(member.role)}>
                    <Shield className="h-3 w-3 mr-1" />
                    {member.role.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(member.status)}>
                    {member.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {member.last_sign_in_at 
                    ? new Date(member.last_sign_in_at).toLocaleDateString()
                    : 'Never'
                  }
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Select 
                      value={member.role} 
                      onValueChange={(value) => handleUpdateRole(member.id, value)}
                    >
                      <SelectTrigger className="w-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="project_manager">Project Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {teamMembers.length === 0 && (
          <div className="text-center py-8">
            <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No team members found</h3>
            <p className="text-muted-foreground mb-4">
              Start building your team by adding members
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add First Team Member
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}