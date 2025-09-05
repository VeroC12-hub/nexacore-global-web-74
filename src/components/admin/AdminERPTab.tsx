import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

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
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ERPTask {
  id: string;
  erp_project_id: string;
  title: string;
  description: string;
  assigned_to: string;
  status: string;
  priority: string;
  due_date: string;
  estimated_hours: number;
  actual_hours: number;
  completion_percentage: number;
  created_at: string;
  erp_project?: {
    title: string;
    status: string;
  };
  assignee?: {
    full_name: string;
    email: string;
  };
}

interface ERPTimeEntry {
  id: string;
  user_id: string;
  erp_project_id: string;
  erp_task_id: string;
  description: string;
  hours: number;
  billable: boolean;
  date: string;
  is_approved: boolean;
  created_at: string;
  erp_project?: {
    title: string;
  };
  erp_task?: {
    title: string;
  };
  user?: {
    full_name: string;
    email: string;
  };
}

interface ERPStaffRole {
  id: string;
  user_id: string;
  role: string;
  department: string;
  position: string;
  hourly_rate: number;
  can_approve_timesheets: boolean;
  can_create_projects: boolean;
  can_manage_users: boolean;
  can_view_all_projects: boolean;
  is_active: boolean;
  created_at: string;
  user?: {
    email: string;
    full_name: string;
  };
}

interface ERPStats {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalStaff: number;
  activeStaff: number;
  totalHours: number;
  billableHours: number;
  averageProjectCompletion: number;
  totalBudget: number;
  totalSpent: number;
  budgetUtilization: number;
}

export function AdminERPTab() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  
  // Data states
  const [erpStats, setERPStats] = useState<ERPStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalStaff: 0,
    activeStaff: 0,
    totalHours: 0,
    billableHours: 0,
    averageProjectCompletion: 0,
    totalBudget: 0,
    totalSpent: 0,
    budgetUtilization: 0
  });
  
  const [projects, setProjects] = useState<ERPProject[]>([]);
  const [tasks, setTasks] = useState<ERPTask[]>([]);
  const [timeEntries, setTimeEntries] = useState<ERPTimeEntry[]>([]);
  const [staffRoles, setStaffRoles] = useState<ERPStaffRole[]>([]);
  
  // Modal states
  const [selectedProject, setSelectedProject] = useState<ERPProject | null>(null);
  const [selectedTask, setSelectedTask] = useState<ERPTask | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  useEffect(() => {
    loadERPData();
  }, []);

  const loadERPData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadERPStats(),
        loadProjects(),
        loadTasks(),
        loadTimeEntries(),
        loadStaffRoles()
      ]);
    } catch (error) {
      console.error('Error loading ERP data:', error);
      toast.error('Failed to load ERP data');
    } finally {
      setLoading(false);
    }
  };

  const loadERPStats = async () => {
    try {
      // Load projects stats
      const { data: projectsData, error: projectsError } = await supabase
        .from('erp_projects')
        .select('*');
      
      if (projectsError) throw projectsError;

      // Load tasks stats
      const { data: tasksData, error: tasksError } = await supabase
        .from('erp_tasks')
        .select('*');
      
      if (tasksError) throw tasksError;

      // Load time entries stats
      const { data: timeData, error: timeError } = await supabase
        .from('erp_time_entries')
        .select('*');
      
      if (timeError) throw timeError;

      // Load staff stats
      const { data: staffData, error: staffError } = await supabase
        .from('erp_staff_roles')
        .select('*');
      
      if (staffError) throw staffError;

      // Calculate stats
      const totalProjects = projectsData?.length || 0;
      const activeProjects = projectsData?.filter(p => p.is_active)?.length || 0;
      const totalTasks = tasksData?.length || 0;
      const completedTasks = tasksData?.filter(t => t.status === 'completed')?.length || 0;
      const totalStaff = staffData?.length || 0;
      const activeStaff = staffData?.filter(s => s.is_active)?.length || 0;
      const totalHours = timeData?.reduce((acc, entry) => acc + (entry.hours || 0), 0) || 0;
      const billableHours = timeData?.filter(entry => entry.billable)?.reduce((acc, entry) => acc + (entry.hours || 0), 0) || 0;
      const averageProjectCompletion = projectsData?.reduce((acc, p) => acc + (p.progress || 0), 0) / (totalProjects || 1);
      const totalBudget = projectsData?.reduce((acc, p) => acc + (p.budget || 0), 0) || 0;
      const totalSpent = projectsData?.reduce((acc, p) => acc + (p.actual_cost || 0), 0) || 0;
      const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

      setERPStats({
        totalProjects,
        activeProjects,
        totalTasks,
        completedTasks,
        totalStaff,
        activeStaff,
        totalHours,
        billableHours,
        averageProjectCompletion,
        totalBudget,
        totalSpent,
        budgetUtilization
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
    }
  };

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('erp_tasks')
        .select(`
          *,
          erp_project:erp_project_id (title, status),
          assignee:assigned_to (full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const loadTimeEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('erp_time_entries')
        .select(`
          *,
          erp_project:erp_project_id (title),
          erp_task:erp_task_id (title),
          user:user_id (full_name, email)
        `)
        .order('date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTimeEntries(data || []);
    } catch (error) {
      console.error('Error loading time entries:', error);
    }
  };

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
      setStaffRoles(data || []);
    } catch (error) {
      console.error('Error loading staff roles:', error);
    }
  };

  const updateProjectStatus = async (projectId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('erp_projects')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', projectId);

      if (error) throw error;

      await loadProjects();
      await loadERPStats();
      toast.success('Project status updated successfully');
    } catch (error) {
      console.error('Error updating project status:', error);
      toast.error('Failed to update project status');
    }
  };

  const approveTimeEntry = async (entryId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('erp_time_entries')
        .update({ is_approved: approved })
        .eq('id', entryId);

      if (error) throw error;

      await loadTimeEntries();
      toast.success(`Time entry ${approved ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error updating time entry:', error);
      toast.error('Failed to update time entry');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'active': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'in_progress': 'bg-green-500/20 text-green-400 border-green-500/30',
      'on_hold': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'completed': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'cancelled': 'bg-red-500/20 text-red-400 border-red-500/30',
      'review': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      'blocked': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'low': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      'medium': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'high': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'urgent': 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || project.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading ERP system...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">ERP System Management</h2>
          <p className="text-muted-foreground">
            Comprehensive oversight and control of the internal ERP system
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadERPData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FolderOpen className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{erpStats.totalProjects}</p>
                <p className="text-xs text-green-400">{erpStats.activeProjects} active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{erpStats.totalTasks}</p>
                <p className="text-xs text-green-400">{erpStats.completedTasks} completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Staff</p>
                <p className="text-2xl font-bold">{erpStats.activeStaff}</p>
                <p className="text-xs text-muted-foreground">{erpStats.totalStaff} total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{erpStats.totalHours.toFixed(1)}</p>
                <p className="text-xs text-green-400">{erpStats.billableHours.toFixed(1)} billable</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-indigo-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">${erpStats.totalBudget.toLocaleString()}</p>
                <p className="text-xs text-red-400">${erpStats.totalSpent.toLocaleString()} spent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-pink-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Avg. Completion</p>
                <p className="text-2xl font-bold">{erpStats.averageProjectCompletion.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">project progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
            <Target className="h-4 w-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="time" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time Tracking
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Status Distribution</CardTitle>
                <CardDescription>Current status of all ERP projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['active', 'in_progress', 'pending', 'completed', 'on_hold'].map(status => {
                    const count = projects.filter(p => p.status === status).length;
                    const percentage = projects.length > 0 ? (count / projects.length) * 100 : 0;
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(status)}>
                            {status.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm">{count} projects</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department Workload</CardTitle>
                <CardDescription>Projects by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from(new Set(projects.map(p => p.department).filter(Boolean))).map(dept => {
                    const deptProjects = projects.filter(p => p.department === dept);
                    const activeCount = deptProjects.filter(p => p.is_active).length;
                    return (
                      <div key={dept} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{dept}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{deptProjects.length} projects</div>
                          <div className="text-xs text-green-400">{activeCount} active</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates across the ERP system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeEntries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                    <Timer className="h-5 w-5 text-blue-500" />
                    <div className="flex-1">
                      <p className="font-medium">{entry.user?.full_name || 'Unknown User'}</p>
                      <p className="text-sm text-muted-foreground">
                        Logged {entry.hours} hours on "{entry.erp_project?.title}" - {entry.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString()} • 
                        {entry.billable ? ' Billable' : ' Non-billable'} • 
                        {entry.is_approved ? ' Approved' : ' Pending approval'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!entry.is_approved && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => approveTimeEntry(entry.id, true)}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => approveTimeEntry(entry.id, false)}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search Projects</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by title or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="department-filter">Department</Label>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {Array.from(new Set(projects.map(p => p.department).filter(Boolean))).map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects Table */}
          <Card>
            <CardHeader>
              <CardTitle>ERP Projects ({filteredProjects.length})</CardTitle>
              <CardDescription>Manage and monitor all internal projects</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{project.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {project.description}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(project.start_date).toLocaleDateString()} - {' '}
                            {new Date(project.end_date).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={project.status} 
                          onValueChange={(newStatus) => updateProjectStatus(project.id, newStatus)}
                        >
                          <SelectTrigger className="w-32">
                            <Badge className={getStatusColor(project.status)}>
                              {project.status.replace('_', ' ')}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="on_hold">On Hold</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-sm">{project.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">${project.budget?.toLocaleString()}</div>
                          <div className="text-muted-foreground">
                            ${project.actual_cost?.toLocaleString()} spent
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{project.department}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedProject(project);
                              setIsProjectModalOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ERP Tasks ({tasks.length})</CardTitle>
              <CardDescription>Monitor and manage all project tasks</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.slice(0, 20).map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {task.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{task.erp_project?.title}</div>
                          <Badge className={getStatusColor(task.erp_project?.status || '')}>
                            {task.erp_project?.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{task.assignee?.full_name || 'Unassigned'}</div>
                          <div className="text-muted-foreground">{task.assignee?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${task.completion_percentage}%` }}
                            />
                          </div>
                          <span className="text-sm">{task.completion_percentage}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time Tracking Tab */}
        <TabsContent value="time" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Time Entries ({timeEntries.length})</CardTitle>
                  <CardDescription>Review and approve time tracking entries</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve All Pending
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{entry.user?.full_name || 'Unknown'}</div>
                          <div className="text-muted-foreground">{entry.user?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{entry.erp_project?.title}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{entry.erp_task?.title || 'General'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm max-w-xs truncate">{entry.description}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{entry.hours}h</span>
                          {entry.billable && (
                            <Badge variant="outline" className="text-xs">Billable</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{new Date(entry.date).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={entry.is_approved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                          {entry.is_approved ? 'Approved' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {!entry.is_approved && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => approveTimeEntry(entry.id, true)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => approveTimeEntry(entry.id, false)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ERP Team Members ({staffRoles.length})</CardTitle>
              <CardDescription>Monitor staff roles and permissions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hourly Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffRoles.map((role) => (
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
                        <Badge className={`bg-blue-500/20 text-blue-400 border-blue-500/30`}>
                          {role.role.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{role.department || 'No department'}</Badge>
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
                        <Badge className={role.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                          {role.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {role.hourly_rate ? `$${role.hourly_rate}/hr` : 'Not set'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Project Detail Modal */}
      <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Details: {selectedProject?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedProject && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Project Information</h4>
                  <div className="space-y-2">
                    <div><strong>Status:</strong> <Badge className={getStatusColor(selectedProject.status)}>{selectedProject.status}</Badge></div>
                    <div><strong>Priority:</strong> <Badge className={getPriorityColor(selectedProject.priority)}>{selectedProject.priority}</Badge></div>
                    <div><strong>Progress:</strong> {selectedProject.progress}%</div>
                    <div><strong>Department:</strong> {selectedProject.department}</div>
                    <div><strong>Type:</strong> {selectedProject.project_type}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Financial Information</h4>
                  <div className="space-y-2">
                    <div><strong>Budget:</strong> ${selectedProject.budget?.toLocaleString()}</div>
                    <div><strong>Actual Cost:</strong> ${selectedProject.actual_cost?.toLocaleString()}</div>
                    <div><strong>Remaining:</strong> ${(selectedProject.budget - selectedProject.actual_cost)?.toLocaleString()}</div>
                    <div><strong>Utilization:</strong> {((selectedProject.actual_cost / selectedProject.budget) * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Description</h4>
                <p className="text-muted-foreground">{selectedProject.description}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Timeline</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><strong>Start Date:</strong> {new Date(selectedProject.start_date).toLocaleDateString()}</div>
                  <div><strong>End Date:</strong> {new Date(selectedProject.end_date).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProjectModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}