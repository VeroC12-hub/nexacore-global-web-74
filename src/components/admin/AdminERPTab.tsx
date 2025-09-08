import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

// Import the new modular components and types
import { ERPOverviewTab, ERPProjectsTab, ERPTasksTab, ERPTimeTab, ERPTeamTab, ERPProject, ERPStats, StaffRole } from './erp';

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

  // Helper function to map staff roles to suggested project roles
  const mapStaffRoleToProjectRole = (staffRole: string): string => {
    const roleMapping: Record<string, string> = {
      'admin': 'manager',
      'developer': 'developer',
      'designer': 'designer',
      'manager': 'manager',
      'analyst': 'analyst',
      'tester': 'tester',
      'qa': 'tester',
      'lead': 'manager',
      'senior': 'developer',
      'junior': 'contributor',
      'intern': 'contributor',
      'consultant': 'analyst',
      'architect': 'developer',
      'owner': 'manager',
      'staff': 'contributor'
    };

    const normalizedRole = staffRole.toLowerCase().trim();
    
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
          erp_projects (
            id,
            title
          ),
          profiles (
            id,
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading tasks:', error);
        setTasks([]);
        return;
      }

      // Transform data to match component interface
      const transformedTasks = data?.map(task => ({
        ...task,
        project_title: task.erp_projects?.title || 'Unknown Project',
        assignee: task.profiles?.full_name || task.profiles?.email || 'Unassigned'
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
          erp_projects (
            id,
            title
          ),
          erp_tasks (
            id,
            title
          ),
          profiles (
            id,
            full_name,
            email
          )
        `)
        .order('start_time', { ascending: false });

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
        user_name: entry.profiles?.full_name || entry.profiles?.email || 'Unknown User',
        hours: entry.end_time 
          ? (new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()) / (1000 * 60 * 60) 
          : 0,
        status: entry.end_time ? 'completed' : 'active'
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
    toast.info('Task creation functionality would be implemented here');
  };

  const handleEditTask = (task: ERPTask) => {
    toast.info(`Edit task: ${task.title}`);
  };

  const handleViewTask = (task: ERPTask) => {
    toast.info(`View task: ${task.title}`);
  };

  const handleStartTask = (task: ERPTask) => {
    toast.success(`Started task: ${task.title}`);
  };

  const handleCompleteTask = (task: ERPTask) => {
    toast.success(`Completed task: ${task.title}`);
  };

  // Time tracking handlers
  const handleCreateTimeEntry = () => {
    toast.info('Time entry creation functionality would be implemented here');
  };

  const handleEditTimeEntry = (entry: TimeEntry) => {
    toast.info(`Edit time entry: ${entry.description}`);
  };

  const handleStartTimer = (projectId: string, taskId?: string) => {
    toast.success('Timer started!');
  };

  const handleStopTimer = (entryId: string) => {
    toast.success('Timer stopped!');
  };

  // Quick action handler for Overview tab
  const handleQuickAction = (action: string, data?: unknown) => {
    switch (action) {
      case 'new-project':
        handleCreateProject();
        break;
      case 'add-client':
        toast.info('Client management functionality would be implemented here');
        break;
      case 'create-invoice':
        toast.info('Invoice creation functionality would be implemented here');
        break;
      case 'start-timer':
        toast.success('Quick timer started!');
        break;
      case 'new-task':
        handleCreateTask();
        break;
      case 'schedule-meeting':
        toast.info('Meeting scheduling functionality would be implemented here');
        break;
      case 'view-productivity':
        setActiveTab('tasks');
        toast.info('Switched to Tasks tab for productivity details');
        break;
      case 'view-all-activity':
        toast.info('Activity log functionality would be implemented here');
        break;
      case 'manage-tasks':
        setActiveTab('tasks');
        toast.info('Switched to Tasks tab');
        break;
      case 'export-data':
        toast.success('Data export functionality would be implemented here');
        break;
      case 'refresh-data':
        window.location.reload();
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
        setActiveTab('tasks');
        toast.success(`Switched to tasks tab${data ? ` - ${(data as any).title}` : ''}`);
        break;
      case 'view-team-member':
        setActiveTab('team');
        toast.success(`Switched to team tab${data ? ` - ${(data as any).profiles?.full_name || 'Team member'}` : ''}`);
        break;
      case 'view-time-entry':
        setActiveTab('time');
        toast.success(`Switched to time tracking tab${data ? ` - ${(data as any).description || 'Time entry'}` : ''}`);
        break;
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
        toast.info('Budget overview - would show detailed financial metrics');
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
        toast.info(`Quick action: ${action}${data ? ` with data` : ''}`);
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
            onClick={() => window.location.reload()}
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
    </div>
  );
}