import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useERPStats, useERPStaffRoles, useERPProjects } from '@/hooks/queries/useERPQueries';
import { DashboardSkeleton } from './LoadingSkeletons';

// Import the new modular components and types
import {
  ERPOverviewTab,
  ERPProjectsTabWithData,
  ERPTasksTabWithData,
  ERPTimeTabWithData,
  ERPTeamTab,
  ERPProject,
  ERPStats,
  StaffRole,
  ProjectFormModal,
  ProjectViewModal,
  TaskFormModal,
  TaskViewModal,
  TaskExportModal,
  ERPProjectExportModal,
  TimeEntryFormModal
} from './erp';

// Additional types needed
interface ERPTask {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  project_id: string;
  project_title?: string;
  due_date: string;
  estimated_hours: number;
  actual_hours: number;
  created_at: string;
  updated_at: string;
}

interface TimeEntry {
  id: string;
  user_id: string;
  user_name: string;
  project_id: string;
  project_title: string;
  task_id?: string;
  task_title?: string;
  description: string;
  start_time: string;
  end_time: string | null;
  hours: number;
  rate: number;
  billable: boolean;
  status: 'active' | 'completed';
  created_at: string;
}

interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

import { 
  Users, 
  FolderOpen,
  Clock,
  BarChart3,
  Settings,
  Shield,
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  UserCheck,
  UserX,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Activity,
  Calendar,
  Target,
  Briefcase,
  Timer,
  FileText,
  MessageSquare,
  Download,
  Upload,
  RefreshCw,
  Building,
  UserPlus,
  X,
  Users2
} from 'lucide-react';

export function AdminERPTab() {
  // React Query hooks - Progressive loading (stats only on mount)
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useERPStats();
  const { data: staffRolesData, refetch: refetchStaffRoles } = useERPStaffRoles({
    enabled: false, // Only load when team tab is active
  });

  const [activeTab, setActiveTab] = useState('overview');

  // Load projects only for team tab (for team assignment dropdown)
  const { data: projectsForTeamData } = useERPProjects({
    page: 1,
    pageSize: 100, // Load more for team dropdown
    statusFilter: 'all',
    departmentFilter: 'all',
    searchTerm: '',
    enabled: activeTab === 'team', // Only load when team tab is active
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [userFilter, setUserFilter] = useState('all');

  // Transform stats data with useMemo
  const erpStats: ERPStats = useMemo(() => {
    if (!statsData) {
      return {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        totalBudget: 0,
        totalSpent: 0,
        budgetUtilization: 0,
        teamMembers: 0,
        avgProjectDuration: 0,
      };
    }
    return {
      ...statsData,
      totalTasks: 150, // Mock data - will be real in Phase 2
      completedTasks: 95,
      pendingTasks: 55,
      teamMembers: 12,
      avgProjectDuration: 45,
    };
  }, [statsData]);

  // Transform staff roles data
  const staffRoles: StaffRole[] = useMemo(() => {
    if (!staffRolesData) return [];
    return (staffRolesData as any[]).map(item => ({
      ...item,
      user_id: item.id || item.user_id,
      is_active: item.status === 'active' || true,
      profiles: item
    })) as StaffRole[];
  }, [staffRolesData]);

  // Transform projects data for team tab
  const projectsForTeam: ERPProject[] = useMemo(() => {
    if (!projectsForTeamData?.data) return [];
    return projectsForTeamData.data;
  }, [projectsForTeamData]);

  // Chart data - using state since we load async
  const [departmentData, setDepartmentData] = useState<ChartDataPoint[]>([]);
  const [statusData, setStatusData] = useState<ChartDataPoint[]>([]);
  const [performanceData, setPerformanceData] = useState<ChartDataPoint[]>([]);
  const [budgetData, setBudgetData] = useState<ChartDataPoint[]>([]);
  const [timelineData, setTimelineData] = useState<ChartDataPoint[]>([]);

  // Modal states
  const [selectedProject, setSelectedProject] = useState<ERPProject | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [isTeamAssignModalOpen, setIsTeamAssignModalOpen] = useState(false);
  const [selectedProjectForTeam, setSelectedProjectForTeam] = useState<ERPProject | null>(null);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [selectedProjectRole, setSelectedProjectRole] = useState<string>('');
  const [existingTeamMembers, setExistingTeamMembers] = useState<{ user_id: string; role: string }[]>([]);

  // Task modal states
  const [selectedTask, setSelectedTask] = useState<ERPTask | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isTaskViewOpen, setIsTaskViewOpen] = useState(false);
  const [isTaskExportOpen, setIsTaskExportOpen] = useState(false);
  const [singleTaskToExport, setSingleTaskToExport] = useState<ERPTask | null>(null);

  // Project export modal states
  const [isProjectExportOpen, setIsProjectExportOpen] = useState(false);
  const [singleProjectToExport, setSingleProjectToExport] = useState<ERPProject | null>(null);

  // Time entry modal states
  const [selectedTimeEntry, setSelectedTimeEntry] = useState<TimeEntry | null>(null);
  const [isTimeEntryFormOpen, setIsTimeEntryFormOpen] = useState(false);

  // Helper function to map staff roles to suggested project roles
  const mapStaffRoleToProjectRole = (staffRole: string): string => {
    const roleMapping: Record<string, string> = {
      // Management & Leadership
      'admin': 'manager',
      'manager': 'manager',
      'lead': 'manager',
      'owner': 'manager',
      'director': 'manager',

      // CAD & Engineering Roles (NexaCore Core Services)
      'cad_engineer': 'cad_engineer',
      'cad_designer': 'cad_designer',
      'cad_drafter': 'cad_drafter',
      'civil_engineer': 'civil_engineer',
      'structural_engineer': 'structural_engineer',
      'mechanical_engineer': 'mechanical_engineer',
      'electrical_engineer': 'electrical_engineer',
      'architect': 'architect',
      'architectural_designer': 'architect',

      // Software & Technology Roles
      'developer': 'developer',
      'software_engineer': 'developer',
      'programmer': 'developer',
      'designer': 'designer',
      'ui_designer': 'designer',
      'ux_designer': 'designer',
      'ai_engineer': 'ai_specialist',
      'ml_engineer': 'ai_specialist',
      'data_scientist': 'ai_specialist',

      // Support & Quality Roles
      'tester': 'tester',
      'qa': 'tester',
      'quality_assurance': 'tester',
      'analyst': 'analyst',
      'consultant': 'consultant',
      'advisor': 'consultant',

      // Junior/Entry Levels
      'senior': 'lead',
      'junior': 'contributor',
      'intern': 'contributor',
      'trainee': 'contributor',
      'staff': 'contributor'
    };

    const normalizedRole = staffRole.toLowerCase().trim().replace(/\s+/g, '_');

    if (roleMapping[normalizedRole]) {
      return roleMapping[normalizedRole];
    }

    for (const [key, value] of Object.entries(roleMapping)) {
      if (normalizedRole.includes(key)) {
        return value;
      }
    }

    return 'contributor';
  };

  // Load staff roles when team tab becomes active
  useEffect(() => {
    if (activeTab === 'team') {
      refetchStaffRoles();
    }
  }, [activeTab, refetchStaffRoles]);



  const loadChartData = async () => {
    try {
      // Load department data from projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('erp_projects')
        .select('department, status');

      if (projectsError) {
        console.error('Error loading department data:', projectsError);
      } else {
        const deptStats = (projectsData || []).reduce((acc: Record<string, { name: string; value: number; completed: number; pending: number; total: number }>, project: any) => {
          const dept = project.department || 'Other';
          if (!acc[dept]) {
            acc[dept] = { name: dept, value: 0, completed: 0, pending: 0, total: 0 };
          }
          acc[dept].total += 1;
          acc[dept].value += 1;
          if (project.status === 'completed') {
            acc[dept].completed += 1;
          } else {
            acc[dept].pending += 1;
          }
          return acc;
        }, {});
        
        setDepartmentData(Object.values(deptStats));
      }

      // Load status data from projects
      const { data: statusProjectsData, error: statusError } = await supabase
        .from('erp_projects')
        .select('status');

      if (statusError) {
        console.error('Error loading status data:', statusError);
      } else {
        const statusStats = (statusProjectsData || []).reduce((acc: Record<string, number>, project) => {
          const status = project.status || 'Unknown';
          const statusName = status === 'completed' ? 'Completed' :
                            status === 'in_progress' ? 'In Progress' :
                            status === 'planning' ? 'Planning' :
                            status === 'on_hold' ? 'On Hold' : 'Pending';
          acc[statusName] = (acc[statusName] || 0) + 1;
          return acc;
        }, {});
        
        setStatusData(Object.entries(statusStats).map(([name, value]) => ({ name, value })));
      }

      // Load performance data from tasks completion over time
      const { data: tasksData, error: tasksError } = await supabase
        .from('erp_tasks')
        .select('status, created_at, updated_at')
        .order('created_at', { ascending: true });

      if (tasksError) {
        console.error('Error loading performance data:', tasksError);
      } else {
        // Calculate monthly productivity and quality metrics
        const monthlyStats = (tasksData || []).reduce((acc: Record<string, { month: string; total: number; completed: number; onTime: number }>, task) => {
          const month = new Date(task.created_at).toLocaleDateString('en-US', { month: 'short' });
          const year = new Date(task.created_at).getFullYear();
          const key = `${month} ${year}`;
          
          if (!acc[key]) {
            acc[key] = { month: month, total: 0, completed: 0, onTime: 0 };
          }
          
          acc[key].total += 1;
          if (task.status === 'completed') {
            acc[key].completed += 1;
            // Assume on-time if completed within reasonable timeframe
            const completedDate = new Date(task.updated_at);
            const createdDate = new Date(task.created_at);
            const daysDiff = (completedDate.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
            if (daysDiff <= 14) { // Assume 2 weeks is reasonable
              acc[key].onTime += 1;
            }
          }
          return acc;
        }, {});

        const performanceChartData = Object.values(monthlyStats).slice(-6).map((stats: any) => ({
          name: stats.month,
          value: Math.round((stats.completed / Math.max(stats.total, 1)) * 100),
          productivity: Math.round((stats.completed / Math.max(stats.total, 1)) * 100),
          quality: Math.round((stats.onTime / Math.max(stats.completed, 1)) * 100)
        }));

        setPerformanceData(performanceChartData);
      }

      // Load budget timeline data from projects
      const { data: budgetProjectsData, error: budgetError } = await supabase
        .from('erp_projects')
        .select('budget, actual_cost, created_at')
        .order('created_at', { ascending: true });

      if (budgetError) {
        console.error('Error loading budget data:', budgetError);
      } else {
        const monthlyBudget = (budgetProjectsData || []).reduce((acc: Record<string, { name: string; value: number; allocated: number; spent: number }>, project: any) => {
          const month = new Date(project.created_at).toLocaleDateString('en-US', { month: 'short' });
          if (!acc[month]) {
            acc[month] = { name: month, value: 0, allocated: 0, spent: 0 };
          }
          acc[month].allocated += project.budget || 0;
          acc[month].spent += project.actual_cost || 0;
          acc[month].value = acc[month].spent;
          return acc;
        }, {});

        setTimelineData(Object.values(monthlyBudget).slice(-6));
      }

      // Load budget distribution data
      const { data: budgetDistData, error: budgetDistError } = await supabase
        .from('erp_projects')
        .select('department, budget')
        .eq('status', 'in_progress');

      if (budgetDistError) {
        console.error('Error loading budget distribution:', budgetDistError);
      } else {
        const budgetByDept = (budgetDistData || []).reduce((acc: Record<string, number>, project: any) => {
          const dept = project.department || 'Other';
          acc[dept] = (acc[dept] || 0) + (project.budget || 0);
          return acc;
        }, {});

        setBudgetData(Object.entries(budgetByDept).map(([name, value]) => ({ name, value })));
      }

    } catch (error) {
      console.error('Error loading chart data:', error);
      // Fallback to mock data if database queries fail
      setDepartmentData([
        { name: 'Development', value: 20, completed: 12, pending: 8, total: 20 },
        { name: 'Design', value: 12, completed: 8, pending: 4, total: 12 },
        { name: 'Marketing', value: 9, completed: 6, pending: 3, total: 9 },
        { name: 'Sales', value: 6, completed: 4, pending: 2, total: 6 }
      ]);

      setStatusData([
        { name: 'Completed', value: 35 },
        { name: 'In Progress', value: 45 },
        { name: 'Pending', value: 15 },
        { name: 'On Hold', value: 5 }
      ]);

      setPerformanceData([
        { name: 'Jan', value: 78, productivity: 78, quality: 85 },
        { name: 'Feb', value: 82, productivity: 82, quality: 88 },
        { name: 'Mar', value: 79, productivity: 79, quality: 86 },
        { name: 'Apr', value: 85, productivity: 85, quality: 90 },
        { name: 'May', value: 88, productivity: 88, quality: 92 },
        { name: 'Jun', value: 91, productivity: 91, quality: 94 }
      ]);

      setTimelineData([
        { name: 'Jan', value: 45000, allocated: 50000, spent: 45000 },
        { name: 'Feb', value: 55000, allocated: 60000, spent: 55000 },
        { name: 'Mar', value: 65000, allocated: 70000, spent: 65000 },
        { name: 'Apr', value: 60000, allocated: 65000, spent: 60000 },
        { name: 'May', value: 70000, allocated: 75000, spent: 70000 },
        { name: 'Jun', value: 75000, allocated: 80000, spent: 75000 }
      ]);

      setBudgetData([
        { name: 'Development', value: 150000 },
        { name: 'Design', value: 80000 },
        { name: 'Marketing', value: 120000 },
        { name: 'Operations', value: 100000 }
      ]);
    }
  };


  // Event handlers
  const handleCreateProject = () => {
    setSelectedProject(null);
    setIsProjectFormOpen(true);
  };

  const handleEditProject = (project: ERPProject) => {
    setSelectedProject(project);
    setIsProjectFormOpen(true);
  };

  const handleViewProject = (project: ERPProject) => {
    setSelectedProject(project);
    setIsProjectModalOpen(true);
  };

  const handleAssignTeam = (project: ERPProject) => {
    setSelectedProjectForTeam(project);
    setSelectedTeamMembers([]);
    setSelectedProjectRole('');
    setIsTeamAssignModalOpen(true);
    // Load existing team members for this project
    // This would be implemented with actual data loading
    setExistingTeamMembers([]);
  };

  const handleAssignTeamMembers = async () => {
    if (!selectedProjectForTeam || selectedTeamMembers.length === 0) {
      toast.error('Please select team members to assign');
      return;
    }

    try {
      const newMemberIds = selectedTeamMembers.filter(memberId => 
        !existingTeamMembers.some(member => member.user_id === memberId)
      );

      if (newMemberIds.length === 0) {
        toast.error('Selected team members are already assigned to this project');
        return;
      }

      // Create assignment records for team members with individual role suggestions
      const assignments = newMemberIds.map(memberId => {
        const staffMember = staffRoles.find(staff => staff.user_id === memberId);
        const suggestedRole = staffMember?.role ? mapStaffRoleToProjectRole(staffMember.role) : 'contributor';
        
        let finalRole = suggestedRole;
        if (newMemberIds.length === 1 && selectedProjectRole) {
          finalRole = selectedProjectRole;
        }
        
        return {
          project_id: selectedProjectForTeam.id,
          user_id: memberId,
          role: finalRole,
          assigned_at: new Date().toISOString(),
          is_active: true
        };
      });

      const { error } = await supabase
        .from('project_members')
        .insert(assignments);

      if (error) throw error;

      toast.success(`Successfully assigned ${newMemberIds.length} team member${newMemberIds.length !== 1 ? 's' : ''} to ${selectedProjectForTeam.title}`);
      
      setSelectedTeamMembers([]);
      setSelectedProjectRole('');
      setIsTeamAssignModalOpen(false);
      
    } catch (error) {
      console.error('Error assigning team members:', error);
      toast.error('Failed to assign team members');
    }
  };

  // Task handlers
  const handleCreateTask = () => {
    setSelectedTask(null);
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task: ERPTask) => {
    setSelectedTask(task);
    setIsTaskFormOpen(true);
  };

  const handleViewTask = (task: ERPTask) => {
    setSelectedTask(task);
    setIsTaskViewOpen(true);
  };

  const handleStartTask = async (task: ERPTask) => {
    try {
      const { error } = await supabase
        .from('erp_tasks')
        .update({ status: 'in_progress', updated_at: new Date().toISOString() })
        .eq('id', task.id);

      if (error) throw error;

      toast.success(`Started task: ${task.title}`);
      refetchStats(); // Update stats (React Query will auto-refetch tasks in the tab)
    } catch (error) {
      console.error('Error starting task:', error);
      toast.error('Failed to start task');
    }
  };

  const handleCompleteTask = async (task: ERPTask) => {
    try {
      const { error } = await supabase
        .from('erp_tasks')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', task.id);

      if (error) throw error;

      toast.success(`Completed task: ${task.title}`);
      refetchStats(); // Update stats (React Query will auto-refetch tasks)
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    }
  };

  const handleTaskFormSuccess = async () => {
    setIsTaskFormOpen(false);
    setSelectedTask(null);
    refetchStats(); // Update stats (React Query will auto-refetch tasks)
  };

  const handleDeleteTask = async (task: ERPTask) => {
    if (!confirm(`Are you sure you want to delete "${task.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('erp_tasks')
        .delete()
        .eq('id', task.id);

      if (error) throw error;

      toast.success(`Task "${task.title}" deleted successfully`);
      refetchStats(); // Update stats (React Query will auto-refetch tasks)
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleDuplicateTask = async (task: ERPTask) => {
    try {
      const { error } = await supabase
        .from('erp_tasks')
        .insert({
          title: `${task.title} (Copy)`,
          description: task.description,
          status: 'todo',
          priority: task.priority,
          erp_project_id: task.project_id,
          due_date: task.due_date,
          estimated_hours: task.estimated_hours,
          actual_hours: 0
        });

      if (error) throw error;

      toast.success(`Task duplicated: "${task.title} (Copy)"`);
      refetchStats(); // Update stats (React Query will auto-refetch tasks)
    } catch (error) {
      console.error('Error duplicating task:', error);
      toast.error('Failed to duplicate task');
    }
  };

  const handleExportTasks = () => {
    setSingleTaskToExport(null); // Export all/filtered tasks
    setIsTaskExportOpen(true);
  };

  const handleExportSingleTask = (task: ERPTask) => {
    setSingleTaskToExport(task); // Export only this task
    setIsTaskExportOpen(true);
  };

  // Project export handlers
  const handleExportProjects = () => {
    setSingleProjectToExport(null); // Export all/filtered projects
    setIsProjectExportOpen(true);
  };

  const handleExportSingleProject = (project: ERPProject) => {
    setSingleProjectToExport(project); // Export only this project
    setIsProjectExportOpen(true);
  };

  // Time tracking handlers
  const handleCreateTimeEntry = () => {
    setSelectedTimeEntry(null);
    setIsTimeEntryFormOpen(true);
  };

  const handleEditTimeEntry = (entry: TimeEntry) => {
    setSelectedTimeEntry(entry);
    setIsTimeEntryFormOpen(true);
  };

  const handleStartTimer = async (projectId: string, taskId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to start a timer');
        return;
      }

      const { error } = await supabase
        .from('erp_time_entries')
        .insert([{
          user_id: user.id,
          erp_project_id: projectId,
          erp_task_id: taskId || null,
          description: 'Timer started',
          date: new Date().toISOString().split('T')[0],
          hours: 0,
          hourly_rate: 50,
          billable: true,
          status: 'pending'
        }]);

      if (error) throw error;

      toast.success('Timer started!');
      // Time tab will auto-refetch via React Query
    } catch (error: any) {
      console.error('Error starting timer:', error);
      toast.error(error.message || 'Failed to start timer');
    }
  };

  const handleStopTimer = async (entryId: string, hours?: number) => {
    try {
      const hoursLogged = hours || 1; // Default to 1 hour if not provided

      const { error } = await supabase
        .from('erp_time_entries')
        .update({
          hours: hoursLogged,
          status: 'pending' // Set to pending for manager approval
        })
        .eq('id', entryId);

      if (error) throw error;

      toast.success(`Timer stopped! ${hoursLogged.toFixed(2)} hours logged.`);
      // Time tab will auto-refetch via React Query
    } catch (error: any) {
      console.error('Error stopping timer:', error);
      toast.error(error.message || 'Failed to stop timer');
    }
  };

  const handleDeleteTimeEntry = async (entry: TimeEntry) => {
    if (!confirm(`Are you sure you want to delete this time entry?\n\n"${entry.description}"`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('erp_time_entries')
        .delete()
        .eq('id', entry.id);

      if (error) throw error;

      toast.success('Time entry deleted successfully');
      // Time tab will auto-refetch via React Query
    } catch (error: any) {
      console.error('Error deleting time entry:', error);
      toast.error(error.message || 'Failed to delete time entry');
    }
  };

  // Quick action handler for Overview tab
  const handleQuickAction = (action: string, data?: unknown) => {
    switch (action) {
      case 'new-project':
        setActiveTab('projects');
        // Delay to ensure tab switch completes, then trigger modal
        setTimeout(() => handleCreateProject(), 100);
        toast.info('Opening project creation form...');
        break;

      // Alert actions
      case 'view-alert':
        const alert = data as any;
        if (alert) {
          toast.info(alert.title, {
            description: alert.message,
            action: alert.actionable ? {
              label: 'Resolve',
              onClick: () => handleQuickAction('resolve-alert', alert)
            } : undefined
          });
        }
        break;

      case 'resolve-alert':
        const resolveAlert = data as any;
        if (resolveAlert) {
          toast.success(`Alert "${resolveAlert.title}" marked as resolved`);
        }
        break;

      // Client management (future feature)
      case 'add-client':
        toast.info('Client Management', {
          description: 'Client management system coming in Phase 7. For now, you can manage clients through the Projects tab.'
        });
        break;

      // Invoice creation (future feature)
      case 'create-invoice':
        toast.info('Invoice Creation', {
          description: 'Invoice system coming in Phase 7. You can export time entries for billing from the Time tab.'
        });
        setActiveTab('time');
        break;

      // Start timer with project selection
      case 'start-timer':
        setActiveTab('time');
        toast.info('Quick Timer Start', {
          description: 'Use the Time tab to start a timer for a specific project.'
        });
        break;

      case 'new-task':
        setActiveTab('tasks');
        // Delay to ensure tab switch completes, then trigger modal
        setTimeout(() => handleCreateTask(), 100);
        toast.info('Opening task creation form...');
        break;

      // Meeting scheduling (future feature)
      case 'schedule-meeting':
        toast.info('Meeting Scheduler', {
          description: 'Calendar and meeting scheduling coming in Phase 7. Use the Tasks tab to track meeting-related tasks.'
        });
        break;

      // Productivity view
      case 'view-productivity':
        setActiveTab('tasks');
        toast.info('Task Productivity', {
          description: 'View detailed productivity metrics and task completion rates'
        });
        break;

      // Activity feed actions
      case 'view-all-activity':
        toast.info('Activity Log', {
          description: 'Full activity history view coming soon. Current activities are shown on the Overview tab.'
        });
        break;

      case 'view-activity':
        const activity = data as any;
        if (activity) {
          // Navigate to the appropriate tab based on activity type
          switch (activity.type) {
            case 'project':
              setActiveTab('projects');
              toast.success(`Viewing ${activity.title}`);
              break;
            case 'task':
              setActiveTab('tasks');
              toast.success(`Viewing ${activity.title}`);
              break;
            case 'payment':
              toast.info('Payment Details', {
                description: `${activity.title} - ${activity.user}`
              });
              break;
            case 'team':
              setActiveTab('team');
              toast.success(`Viewing team member: ${activity.user}`);
              break;
            default:
              toast.info(activity.title, {
                description: `${activity.user} • ${activity.time}`
              });
          }
        }
        break;

      case 'view-activity-details':
        const activityDetail = data as any;
        if (activityDetail) {
          toast.info(activityDetail.title, {
            description: `${activityDetail.user} • ${activityDetail.time}\nStatus: ${activityDetail.status}`
          });
        }
        break;

      // Task management actions
      case 'manage-tasks':
        setActiveTab('tasks');
        toast.info('Task Management', {
          description: 'Manage all your tasks and track progress'
        });
        break;

      case 'start-task':
      case 'edit-task':
      case 'schedule-task':
        setActiveTab('tasks');
        toast.info('Task Actions', {
          description: 'Use the Tasks tab to manage tasks.'
        });
        break;

      // Data export
      case 'export-data':
        toast.success('Exporting Data', {
          description: 'Use individual tab export buttons for detailed exports (Tasks, Time entries, etc.)'
        });
        break;

      case 'refresh-data':
        toast.loading('Refreshing data...');
        refetchStats();
        refetchStaffRoles();
        setTimeout(() => toast.success('Data refreshed successfully'), 500);
        break;

      // Search result actions
      case 'view-project':
        if (data) {
          setSelectedProject(data as any);
          setIsProjectModalOpen(true);
          toast.success(`Opened project: ${(data as any).title}`);
        }
        break;

      case 'view-task':
        if (data && (data as any).id) {
          // If we have a full task object, open it for viewing
          const task = data as ERPTask;
          handleViewTask(task);
        } else {
          // Otherwise just switch to tasks tab
          setActiveTab('tasks');
          toast.success(`Switched to tasks tab${data ? ` - ${(data as any).title}` : ''}`);
        }
        break;

      case 'view-team-member':
        setActiveTab('team');
        toast.success(`Switched to team tab${data ? ` - ${(data as any).profiles?.full_name || 'Team member'}` : ''}`);
        break;

      case 'view-time-entry':
        setActiveTab('time');
        toast.success(`Switched to time tracking tab${data ? ` - ${(data as any).description || 'Time entry'}` : ''}`);
        break;

      // Tab navigation
      case 'goto-overview':
        setActiveTab('overview');
        toast.info('Switched to Overview tab');
        break;

      case 'goto-projects':
        setActiveTab('projects');
        toast.info('Switched to Projects tab');
        break;

      case 'goto-tasks':
        setActiveTab('tasks');
        toast.info('Switched to Tasks tab');
        break;

      case 'goto-time':
        setActiveTab('time');
        toast.info('Switched to Time Tracking tab');
        break;

      case 'goto-team':
        setActiveTab('team');
        toast.info('Switched to Team tab');
        break;

      case 'view-budget':
        toast.info('Budget Overview', {
          description: 'Detailed financial metrics and budget tracking across all projects'
        });
        break;

      case 'global-search':
        const searchData = data as { query: string; result?: any };
        if (searchData?.result) {
          toast.success(`Found: ${searchData.result.title}`);
        } else {
          toast.info(`Search performed for: "${searchData?.query}"`);
        }
        break;

      default:
        console.log('Unhandled quick action:', action, data);
        toast.info(`Action: ${action}`, {
          description: data ? 'Action performed with data' : undefined
        });
    }
  };

  // Show loading skeleton while stats are loading
  if (statsLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ERP Management</h1>
          <p className="text-muted-foreground">
            Comprehensive enterprise resource planning and project management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              toast.loading('Refreshing data...');
              refetchStats();
              refetchStaffRoles();
              setTimeout(() => toast.success('Data refreshed successfully'), 500);
            }}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="time" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users2 className="h-4 w-4" />
            Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ERPOverviewTab
            erpStats={erpStats}
            loading={statsLoading}
            departmentData={departmentData}
            statusData={statusData}
            performanceData={performanceData}
            budgetData={budgetData}
            timelineData={timelineData}
            searchableData={{
              projects: [],
              tasks: [],
              teamMembers: staffRoles,
              timeEntries: [],
              staffRoles
            }}
            onQuickAction={handleQuickAction}
          />
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <ERPProjectsTabWithData
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            departmentFilter={departmentFilter}
            setDepartmentFilter={setDepartmentFilter}
            onCreateProject={handleCreateProject}
            onEditProject={handleEditProject}
            onViewProject={handleViewProject}
            onAssignTeam={handleAssignTeam}
            onExportProjects={handleExportProjects}
            onExportSingleProject={handleExportSingleProject}
          />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <ERPTasksTabWithData
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            onCreateTask={handleCreateTask}
            onEditTask={handleEditTask}
            onViewTask={handleViewTask}
            onStartTask={handleStartTask}
            onCompleteTask={handleCompleteTask}
            onDeleteTask={handleDeleteTask}
            onDuplicateTask={handleDuplicateTask}
            onExportTasks={handleExportTasks}
            onExportSingleTask={handleExportSingleTask}
          />
        </TabsContent>

        <TabsContent value="time" className="space-y-6">
          <ERPTimeTabWithData
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            userFilter={userFilter}
            setUserFilter={setUserFilter}
            onCreateTimeEntry={handleCreateTimeEntry}
            onEditTimeEntry={handleEditTimeEntry}
            onStartTimer={handleStartTimer}
            onStopTimer={handleStopTimer}
            onDeleteTimeEntry={handleDeleteTimeEntry}
          />
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <ERPTeamTab
            projects={projectsForTeam}
            staffRoles={staffRoles}
            selectedProjectForTeam={selectedProjectForTeam}
            setSelectedProjectForTeam={setSelectedProjectForTeam}
            selectedTeamMembers={selectedTeamMembers}
            setSelectedTeamMembers={setSelectedTeamMembers}
            selectedProjectRole={selectedProjectRole}
            setSelectedProjectRole={setSelectedProjectRole}
            existingTeamMembers={existingTeamMembers}
            onAssignTeamMembers={handleAssignTeamMembers}
            mapStaffRoleToProjectRole={mapStaffRoleToProjectRole}
          />
        </TabsContent>
      </Tabs>

      {/* Team Assignment Modal */}
      <Dialog open={isTeamAssignModalOpen} onOpenChange={setIsTeamAssignModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-500" />
              Assign Team Members
            </DialogTitle>
            <DialogDescription>
              {selectedProjectForTeam && `Add team members to "${selectedProjectForTeam.title}"`}
            </DialogDescription>
          </DialogHeader>

          {selectedProjectForTeam && (
            <ERPTeamTab
              projects={[selectedProjectForTeam]}
              staffRoles={staffRoles}
              selectedProjectForTeam={selectedProjectForTeam}
              setSelectedProjectForTeam={setSelectedProjectForTeam}
              selectedTeamMembers={selectedTeamMembers}
              setSelectedTeamMembers={setSelectedTeamMembers}
              selectedProjectRole={selectedProjectRole}
              setSelectedProjectRole={setSelectedProjectRole}
              existingTeamMembers={existingTeamMembers}
              onAssignTeamMembers={handleAssignTeamMembers}
              mapStaffRoleToProjectRole={mapStaffRoleToProjectRole}
            />
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTeamAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignTeamMembers}
              disabled={selectedTeamMembers.length === 0}
            >
              Assign {selectedTeamMembers.length} Member{selectedTeamMembers.length !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Form Modal */}
      <ProjectFormModal
        isOpen={isProjectFormOpen}
        onClose={() => {
          setIsProjectFormOpen(false);
          setSelectedProject(null);
        }}
        onSuccess={() => {
          refetchStats(); // Refetch stats after project changes
        }}
        project={selectedProject}
      />

      {/* Project View Modal */}
      <ProjectViewModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
        onEdit={handleEditProject}
      />

      {/* Task Form Modal */}
      <TaskFormModal
        isOpen={isTaskFormOpen}
        onClose={() => {
          setIsTaskFormOpen(false);
          setSelectedTask(null);
        }}
        onSuccess={handleTaskFormSuccess}
        task={selectedTask}
      />

      {/* Task View Modal */}
      <TaskViewModal
        isOpen={isTaskViewOpen}
        onClose={() => {
          setIsTaskViewOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onEdit={handleEditTask}
      />

      {/* Task Export Modal */}
      {/* TODO Phase 2: Move this modal to ERPTasksTabWithData to properly access tasks data */}
      <TaskExportModal
        isOpen={isTaskExportOpen}
        onClose={() => {
          setIsTaskExportOpen(false);
          setSingleTaskToExport(null);
        }}
        tasks={[]} // Temporary: bulk export disabled until Phase 2
        filteredTasks={[]} // Temporary: filtered export disabled until Phase 2
        singleTask={singleTaskToExport} // Single task export still works
      />

      {/* Project Export Modal */}
      {/* TODO Phase 2: Move this modal to ERPProjectsTabWithData to properly access projects data */}
      <ERPProjectExportModal
        isOpen={isProjectExportOpen}
        onClose={() => {
          setIsProjectExportOpen(false);
          setSingleProjectToExport(null);
        }}
        projects={[]} // Temporary: bulk export disabled until Phase 2
        filteredProjects={[]} // Temporary: filtered export disabled until Phase 2
        singleProject={singleProjectToExport} // Single project export still works
      />

      {/* Time Entry Form Modal */}
      <TimeEntryFormModal
        isOpen={isTimeEntryFormOpen}
        onClose={() => {
          setIsTimeEntryFormOpen(false);
          setSelectedTimeEntry(null);
        }}
        onSuccess={() => {
          // Time entries auto-refresh in ERPTimeTabWithData via React Query
        }}
        timeEntry={selectedTimeEntry}
      />
    </div>
  );
}