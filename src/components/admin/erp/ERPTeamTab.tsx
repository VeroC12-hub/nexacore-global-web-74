import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Users,
  UserPlus,
  UserCheck,
  X,
  Users2
} from 'lucide-react';

interface ERPProject {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  budget: number;
  actual_cost: number;
  start_date: string;
  end_date: string;
  project_type: string;
  department: string;
  created_at: string;
  updated_at: string;
}

interface StaffRole {
  id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  profiles: {
    id: string;
    email: string;
    full_name: string;
  };
}

interface ERPTeamTabProps {
  projects: ERPProject[];
  staffRoles: StaffRole[];
  selectedProjectForTeam: ERPProject | null;
  setSelectedProjectForTeam: (project: ERPProject | null) => void;
  selectedTeamMembers: string[];
  setSelectedTeamMembers: (members: string[]) => void;
  selectedProjectRole: string;
  setSelectedProjectRole: (role: string) => void;
  existingTeamMembers: any[];
  onAssignTeamMembers: () => void;
  mapStaffRoleToProjectRole: (staffRole: string) => string;
  onTeamChanged?: () => void;
  showOverview?: boolean;
}

// Projects that can still take team members
const isOpenProject = (project: ERPProject) => !['completed', 'cancelled', 'archived'].includes(project.status);

export function ERPTeamTab({
  projects,
  staffRoles,
  selectedProjectForTeam,
  setSelectedProjectForTeam,
  selectedTeamMembers,
  setSelectedTeamMembers,
  selectedProjectRole,
  setSelectedProjectRole,
  existingTeamMembers,
  onAssignTeamMembers,
  mapStaffRoleToProjectRole,
  onTeamChanged,
  showOverview = false
}: ERPTeamTabProps) {
  const queryClient = useQueryClient();

  // Every active assignment, for the overview of who works on what
  const { data: allMembers = [] } = useQuery({
    queryKey: ['erp', 'team-overview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_members')
        .select('id, project_id, user_id, role, profiles:profiles!fk_project_members_profiles_user(full_name, email)')
        .eq('is_active', true);
      if (error) throw error;
      return data || [];
    },
    enabled: showOverview,
  });

  const removeMember = async (projectId: string, userId: string, name: string) => {
    const { error } = await supabase
      .from('project_members')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('project_id', projectId)
      .eq('user_id', userId);
    if (error) {
      console.error('Error removing team member:', error);
      toast.error('Failed to remove team member');
      return;
    }
    toast.success(`${name} removed from the project`);
    queryClient.invalidateQueries({ queryKey: ['erp', 'team-overview'] });
    onTeamChanged?.();
  };

  const openProjects = projects.filter(isOpenProject);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users2 className="h-5 w-5 text-purple-500" />
            Team Assignment
          </CardTitle>
          <CardDescription>
            Assign team members to projects with automatic role suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Project</label>
            <Select 
              value={selectedProjectForTeam?.id || ''} 
              onValueChange={(value) => {
                const project = projects.find(p => p.id === value);
                setSelectedProjectForTeam(project || null);
                setSelectedTeamMembers([]);
                setSelectedProjectRole('');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a project..." />
              </SelectTrigger>
              <SelectContent>
                {openProjects.length === 0 && (
                  <SelectItem value="none" disabled>No open projects</SelectItem>
                )}
                {openProjects
                  .map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{project.title}</span>
                        {project.department && (
                          <Badge className="ml-2 text-xs">
                            {project.department}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>

          {selectedProjectForTeam && (
            <>
              {/* Current Team Members */}
              {existingTeamMembers.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Team Members</label>
                  <div className="flex flex-wrap gap-2">
                    {existingTeamMembers.map((member) => (
                      <Badge key={member.user_id} variant="secondary" className="flex items-center gap-1">
                        <UserCheck className="h-3 w-3" />
                        {member.profiles?.full_name || member.profiles?.email || 'Unknown User'}
                        <span className="text-xs">({member.role})</span>
                        <button
                          type="button"
                          aria-label="Remove from project"
                          onClick={() => removeMember(
                            selectedProjectForTeam.id,
                            member.user_id,
                            member.profiles?.full_name || member.profiles?.email || 'Team member'
                          )}
                          className="ml-1 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Team Members */}
              {selectedTeamMembers.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Selected Team Members</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTeamMembers.map((memberId) => {
                      const staff = staffRoles.find(s => s.user_id === memberId);
                      return (
                        <Badge key={memberId} variant="outline" className="flex items-center gap-1">
                          <UserPlus className="h-3 w-3" />
                          {staff?.profiles?.full_name || staff?.profiles?.email || 'Unknown User'}
                          <button
                            onClick={() => {
                              setSelectedTeamMembers(selectedTeamMembers.filter(id => id !== memberId));
                            }}
                            className="ml-1 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Team Member Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Add Team Members</label>
                <Select onValueChange={(value) => {
                  if (value && !selectedTeamMembers.includes(value)) {
                    setSelectedTeamMembers([...selectedTeamMembers, value]);
                    
                    // Auto-suggest role based on staff member's role
                    const selectedStaff = staffRoles.find(staff => staff.user_id === value);
                    if (selectedStaff && selectedStaff.role) {
                      const suggestedRole = mapStaffRoleToProjectRole(selectedStaff.role);
                      if (suggestedRole && suggestedRole !== selectedProjectRole) {
                        setSelectedProjectRole(suggestedRole);
                      }
                    }
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose team members to add..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      const availableStaff = staffRoles.filter(staff => {
                        return (
                          staff.is_active && 
                          staff.role !== 'member' && // Exclude clients/members
                          staff.role !== 'client' && // Exclude clients
                          staff.role && // Must have a role
                          !selectedTeamMembers.includes(staff.user_id) &&
                          !existingTeamMembers.some(member => member.user_id === staff.user_id)
                        );
                      });
                      
                      if (availableStaff.length === 0) {
                        return <SelectItem value="none" disabled>No available team members</SelectItem>;
                      }
                      
                      return availableStaff.map((staff) => (
                        <SelectItem key={staff.id} value={staff.user_id}>
                          {staff.profiles?.full_name || staff.profiles?.email || 'Unknown User'}
                          <span className="text-sm text-muted-foreground ml-2">
                            ({staff.role})
                          </span>
                        </SelectItem>
                      ));
                    })()}
                  </SelectContent>
                </Select>
              </div>

              {/* Project Roles */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Roles</label>
                {selectedTeamMembers.length > 1 ? (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-medium">Auto-Role Assignment</span>
                    </div>
                    <p className="text-sm text-blue-600 mb-3">
                      Each team member will be automatically assigned their optimal project role based on their expertise:
                    </p>
                    <div className="space-y-1">
                      {selectedTeamMembers.map(memberId => {
                        const staff = staffRoles.find(s => s.user_id === memberId);
                        if (!staff) return null;
                        const suggestedRole = mapStaffRoleToProjectRole(staff.role);
                        return (
                          <div key={memberId} className="flex justify-between text-xs text-blue-700">
                            <span>{staff.profiles?.full_name || staff.profiles?.email}</span>
                            <span className="font-medium">{suggestedRole}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : selectedTeamMembers.length === 1 ? (
                  <div className="space-y-2">
                    {(() => {
                      const staff = staffRoles.find(s => s.user_id === selectedTeamMembers[0]);
                      const suggestedRole = staff?.role ? mapStaffRoleToProjectRole(staff.role) : 'contributor';
                      return (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-2">
                          <div className="flex items-center gap-2 text-green-700 mb-1">
                            <UserCheck className="h-4 w-4" />
                            <span className="text-sm font-medium">Suggested Role: {suggestedRole}</span>
                          </div>
                          <p className="text-xs text-green-600">
                            Based on {staff?.profiles?.full_name || 'team member'}'s expertise ({staff?.role})
                          </p>
                        </div>
                      );
                    })()}
                    <Select value={selectedProjectRole} onValueChange={setSelectedProjectRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Override suggested role if needed..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="developer">Developer</SelectItem>
                        <SelectItem value="designer">Designer</SelectItem>
                        <SelectItem value="manager">Project Manager</SelectItem>
                        <SelectItem value="analyst">Business Analyst</SelectItem>
                        <SelectItem value="tester">QA Tester</SelectItem>
                        <SelectItem value="contributor">Contributor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500">
                    Select team members to see role assignments
                  </div>
                )}
              </div>

              {/* Assign Button */}
              {selectedTeamMembers.length > 0 && (
                <div className="pt-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={onAssignTeamMembers}
                          className="w-full flex items-center gap-2"
                          disabled={selectedTeamMembers.length === 0}
                        >
                          <UserPlus className="h-4 w-4" />
                          Assign {selectedTeamMembers.length} Team Member{selectedTeamMembers.length !== 1 ? 's' : ''} to Project
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">Assign Team Members</p>
                        <p className="text-xs text-muted-foreground">Add selected members to the project</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {showOverview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Project Teams
            </CardTitle>
            <CardDescription>Who is assigned to each open project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {openProjects.length === 0 && (
              <p className="text-sm text-muted-foreground">No open projects</p>
            )}
            {openProjects.map(project => {
              const members = (allMembers as any[]).filter(m => m.project_id === project.id);
              return (
                <div key={project.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{project.title}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedProjectForTeam(project);
                        setSelectedTeamMembers([]);
                        setSelectedProjectRole('');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Manage
                    </Button>
                  </div>
                  {members.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No one assigned yet</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {members.map(member => {
                        const name = member.profiles?.full_name || member.profiles?.email || 'Unknown User';
                        return (
                          <Badge key={member.id} variant="secondary" className="flex items-center gap-1">
                            <UserCheck className="h-3 w-3" />
                            {name}
                            {member.role && <span className="text-xs">({member.role})</span>}
                            <button
                              type="button"
                              aria-label="Remove from project"
                              onClick={() => removeMember(project.id, member.user_id, name)}
                              className="ml-1 text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}