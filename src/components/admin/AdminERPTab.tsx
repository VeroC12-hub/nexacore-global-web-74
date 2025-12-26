import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

// Import the new modular components and types
import { ERPOverviewTab, ERPProjectsTab, ERPTasksTab, ERPTimeTab, ERPTeamTab, ERPProject, ERPStats, StaffRole, ProjectFormModal, ProjectViewModal, TaskFormModal, TaskViewModal, TaskExportModal, TimeEntryFormModal } from './erp';

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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [userFilter, setUserFilter] = useState('all');

  // Data states
  const [erpStats, setErpStats] = useState<ERPStats>({
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
    avgProjectDuration: 0
  });

  const [projects, setProjects] = useState<ERPProject[]>([]);
  const [staffRoles, setStaffRoles] = useState<StaffRole[]>([]);
  const [tasks, setTasks] = useState<ERPTask[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);

  // Chart data
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

  // Data loading functions
  const loadERPStats = async () => {
    try {
      const { data: projectsData } = await supabase
        .from('erp_projects')
        .select('*');

      const totalProjects = projectsData?.length || 0;
      const completedProjects = projectsData?.filter(p => p.status === 'completed').length || 0;
      const activeProjects = projectsData?.filter(p => p.status === 'in_progress').length || 0;
      const totalBudget = projectsData?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0;
      const totalSpent = projectsData?.reduce((sum, p) => sum + (p.actual_cost || 0), 0) || 0;

      setErpStats({
        totalProjects,
        activeProjects,
        completedProjects,
        totalTasks: 150, // Mock data
        completedTasks: 95, // Mock data
        pendingTasks: 55, // Mock data
        totalBudget,
        totalSpent,
        budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
        teamMembers: 12, // Mock data
        avgProjectDuration: 45 // Mock data
      });
    } catch (error) {
      console.error('Error loading ERP stats:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('erp_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    }
  };

  const loadStaffRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, email, full_name, phone, role, status, created_at
        `)
        .order('created_at', { ascending: false });
      
      const transformedData = data?.map(profile => ({
        id: profile.id,
        user_id: profile.id,
        role: profile.role,
        is_active: true,
        profiles: {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name
        }
      })) || [];
      
      setStaffRoles(transformedData);
    } catch (error) {
      console.error('Error loading staff roles:', error);
      setStaffRoles([]);
    }
  };

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('erp_tasks')
        .select(`
          *,
          erp_projects!erp_project_id (
            id,
            title
          ),
          assignee:profiles!assigned_to (
            id,
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false});

      if (error) {
        console.error('Error loading tasks:', error);
        setTasks([]);
        return;
      }

      console.log('Loaded tasks with relationships:', data);

      // Transform data to match component interface
      const transformedTasks = data?.map(task => ({
        ...task,
        project_title: task.erp_projects?.title || 'Unknown Project',
        assignee: task.assignee?.full_name || task.assignee?.email || 'Unassigned'
      })) || [];

      setTasks(transformedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasks([]);
    }
  };

  const loadTimeEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('erp_time_entries')
        .select(`
          *,
          erp_projects!erp_project_id (
            id,
            title
          ),
          erp_tasks!erp_task_id (
            id,
            title
          ),
          profiles!user_id (
            id,
            full_name,
            email
          )
        `)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error loading time entries:', error);
        setTimeEntries([]);
        return;
      }

      // Transform data to match component interface
      const transformedEntries = data?.map(entry => ({
        ...entry,
        project_title: entry.erp_projects?.title || 'Unknown Project',
        task_title: entry.erp_tasks?.title || null,
        user_name: entry.profiles?.full_name || entry.profiles?.email || 'Unknown User'
      })) || [];

      setTimeEntries(transformedEntries);
    } catch (error) {
      console.error('Error loading time entries:', error);
      setTimeEntries([]);
    }
  };

  const loadChartData = async () => {
    try {
      // Load department data from projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('erp_projects')
        .select('department, status, is_active');

      if (projectsError) {
        console.error('Error loading department data:', projectsError);
      } else {
        const deptStats = (projectsData || []).reduce((acc: Record<string, ChartDataPoint>, project) => {
          const dept = project.department || 'Other';
          if (!acc[dept]) {
            acc[dept] = { name: dept, completed: 0, pending: 0, total: 0 };
          }
          acc[dept].total += 1;
          if (project.status === 'completed') {
            acc[dept].completed += 1;
          } else if (project.is_active) {
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

        const performanceChartData = Object.values(monthlyStats).slice(-6).map((stats) => ({
          month: stats.month,
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
        const monthlyBudget = (budgetProjectsData || []).reduce((acc: Record<string, { month: string; allocated: number; spent: number }>, project) => {
          const month = new Date(project.created_at).toLocaleDateString('en-US', { month: 'short' });
          if (!acc[month]) {
            acc[month] = { month, allocated: 0, spent: 0 };
          }
          acc[month].allocated += project.budget || 0;
          acc[month].spent += project.actual_cost || 0;
          return acc;
        }, {});

        setTimelineData(Object.values(monthlyBudget).slice(-6));
      }

      // Load budget distribution data
      const { data: budgetDistData, error: budgetDistError } = await supabase
        .from('erp_projects')
        .select('department, budget')
        .eq('is_active', true);

      if (budgetDistError) {
        console.error('Error loading budget distribution:', budgetDistError);
      } else {
        const budgetByDept = (budgetDistData || []).reduce((acc: Record<string, number>, project) => {
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
        { name: 'Development', completed: 12, pending: 8, total: 20 },
        { name: 'Design', completed: 8, pending: 4, total: 12 },
        { name: 'Marketing', completed: 6, pending: 3, total: 9 },
        { name: 'Sales', completed: 4, pending: 2, total: 6 }
      ]);

      setStatusData([
        { name: 'Completed', value: 35 },
        { name: 'In Progress', value: 45 },
        { name: 'Pending', value: 15 },
        { name: 'On Hold', value: 5 }
      ]);

      setPerformanceData([
        { month: 'Jan', productivity: 78, quality: 85 },
        { month: 'Feb', productivity: 82, quality: 88 },
        { month: 'Mar', productivity: 79, quality: 86 },
        { month: 'Apr', productivity: 85, quality: 90 },
        { month: 'May', productivity: 88, quality: 92 },
        { month: 'Jun', productivity: 91, quality: 94 }
      ]);

      setTimelineData([
        { month: 'Jan', allocated: 50000, spent: 45000 },
        { month: 'Feb', allocated: 60000, spent: 55000 },
        { month: 'Mar', allocated: 70000, spent: 65000 },
        { month: 'Apr', allocated: 65000, spent: 60000 },
        { month: 'May', allocated: 75000, spent: 70000 },
        { month: 'Jun', allocated: 80000, spent: 75000 }
      ]);

      setBudgetData([
        { name: 'Development', value: 150000 },
        { name: 'Design', value: 80000 },
        { name: 'Marketing', value: 120000 },
        { name: 'Operations', value: 100000 }
      ]);
    }
  };

  useEffect(() => {
    const initializeERPData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          loadERPStats(),
          loadProjects(),
          loadStaffRoles(),
          loadTasks(),
          loadTimeEntries(),
          loadChartData()
        ]);
      } catch (error) {
        console.error('Error initializing ERP data:', error);
        toast.error('Failed to load ERP data');
      } finally {
        setLoading(false);
      }
    };

    initializeERPData();
  }, []);

  // Wrapper functions for refreshing data
  const fetchTimeEntries = () => {
    loadTimeEntries();
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
      await loadTasks(); // Reload tasks to reflect changes
      await loadERPStats(); // Update stats
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
      await loadTasks(); // Reload tasks to reflect changes
      await loadERPStats(); // Update stats
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    }
  };

  const handleTaskFormSuccess = async () => {
    setIsTaskFormOpen(false);
    setSelectedTask(null);
    await loadTasks(); // Reload tasks after create/update
    await loadERPStats(); // Update stats
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
      await loadTasks(); // Reload tasks
      await loadERPStats(); // Update stats
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleDuplicateTask = async (task: ERPTask) => {
    try {
      const { error} = await supabase
        .from('erp_tasks')
        .insert({
          title: `${task.title} (Copy)`,
          description: task.description,
          status: 'new',
          priority: task.priority,
          erp_project_id: task.erp_project_id,
          assigned_to: task.assigned_to,
          due_date: task.due_date,
          estimated_hours: task.estimated_hours,
          actual_hours: 0
        });

      if (error) throw error;

      toast.success(`Task duplicated: "${task.title} (Copy)"`);
      await loadTasks(); // Reload tasks
      await loadERPStats(); // Update stats
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
      fetchTimeEntries();
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
      fetchTimeEntries();
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
      fetchTimeEntries();
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
        if (projects.length === 0) {
          toast.error('No projects available. Create a project first.');
          return;
        }
        // Start timer for the first active project
        const activeProject = projects.find(p => p.is_active) || projects[0];
        handleStartTimer(activeProject.id);
        // Switch to Time tab to see the active timer
        setTimeout(() => setActiveTab('time'), 1000);
        toast.success(`Timer started for: ${activeProject.title}`, {
          description: 'Switching to Time tab...'
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
        const taskToStart = data as any;
        if (taskToStart) {
          // Find the task in the tasks array by matching properties
          const actualTask = tasks.find(t => t.title === taskToStart.title);
          if (actualTask) {
            handleStartTask(actualTask);
          } else {
            toast.info(`Starting task: ${taskToStart.title}`, {
              description: `Project: ${taskToStart.project}`
            });
          }
        }
        break;

      case 'edit-task':
        const taskToEdit = data as any;
        if (taskToEdit) {
          // Find the task in the tasks array
          const actualTask = tasks.find(t => t.title === taskToEdit.title);
          if (actualTask) {
            handleEditTask(actualTask);
          } else {
            setActiveTab('tasks');
            toast.info('Edit Task', {
              description: 'Switch to Tasks tab to edit this task'
            });
          }
        }
        break;

      case 'schedule-task':
        const taskToSchedule = data as any;
        if (taskToSchedule) {
          toast.info('Schedule Task', {
            description: `Use the Tasks tab to set a due date for: ${taskToSchedule.title}`
          });
          setActiveTab('tasks');
        }
        break;

      // Data export
      case 'export-data':
        toast.success('Exporting Data', {
          description: 'Use individual tab export buttons for detailed exports (Tasks, Time entries, etc.)'
        });
        break;

      case 'refresh-data':
        setLoading(true);
        toast.loading('Refreshing all data...');
        Promise.all([
          loadERPStats(),
          loadProjects(),
          loadStaffRoles(),
          loadTasks(),
          loadTimeEntries(),
          loadChartData()
        ]).then(() => {
          toast.success('Data refreshed successfully');
          setLoading(false);
        }).catch(() => {
          toast.error('Failed to refresh data');
          setLoading(false);
        });
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
            onClick={async () => {
              setLoading(true);
              toast.loading('Refreshing data...');
              try {
                await Promise.all([
                  loadERPStats(),
                  loadProjects(),
                  loadStaffRoles(),
                  loadTasks(),
                  loadTimeEntries(),
                  loadChartData()
                ]);
                toast.success('Data refreshed successfully');
              } catch (error) {
                toast.error('Failed to refresh data');
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
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
            loading={loading}
            departmentData={departmentData}
            statusData={statusData}
            performanceData={performanceData}
            budgetData={budgetData}
            timelineData={timelineData}
            searchableData={{
              projects,
              tasks,
              teamMembers: staffRoles,
              timeEntries,
              staffRoles
            }}
            onQuickAction={handleQuickAction}
          />
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <ERPProjectsTab
            projects={projects}
            loading={loading}
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
          />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <ERPTasksTab
            tasks={tasks}
            loading={loading}
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
          <ERPTimeTab
            timeEntries={timeEntries}
            loading={loading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            userFilter={userFilter}
            setUserFilter={setUserFilter}
            onCreateTimeEntry={handleCreateTimeEntry}
            onEditTimeEntry={handleEditTimeEntry}
            onStartTimer={handleStartTimer}
            onStopTimer={handleStopTimer}
            onDeleteTimeEntry={handleDeleteTimeEntry}
            onRefresh={loadTimeEntries}
            projects={projects.map(p => ({ id: p.id, title: p.title }))}
          />
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <ERPTeamTab
            projects={projects}
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
          loadProjects();
          loadERPStats();
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
      <TaskExportModal
        isOpen={isTaskExportOpen}
        onClose={() => {
          setIsTaskExportOpen(false);
          setSingleTaskToExport(null);
        }}
        tasks={tasks}
        filteredTasks={tasks.filter(task => {
          const matchesSearch = !searchTerm ||
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.assignee?.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
          const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
          return matchesSearch && matchesStatus && matchesPriority;
        })}
        singleTask={singleTaskToExport}
      />

      {/* Time Entry Form Modal */}
      <TimeEntryFormModal
        isOpen={isTimeEntryFormOpen}
        onClose={() => {
          setIsTimeEntryFormOpen(false);
          setSelectedTimeEntry(null);
        }}
        onSuccess={() => {
          fetchTimeEntries();
        }}
        timeEntry={selectedTimeEntry}
      />
    </div>
  );
}