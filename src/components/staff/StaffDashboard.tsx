import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Clock,
  Users,
  MessageSquare,
  FileText,
  BarChart3,
  Settings,
  Plus,
  Calendar,
  TrendingUp,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { supabase } from '@/integrations/supabase/client';
import { Task, TimeEntry, ProjectAnalytics, TaskAnalytics, ActivityItem } from '@/types/erp';

interface StaffDashboardProps {
  className?: string;
}

export function StaffDashboard({ className }: StaffDashboardProps) {
  const { user, hasPermission } = useEnhancedAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Dashboard data
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [analytics, setAnalytics] = useState<{
    projects: ProjectAnalytics;
    tasks: TaskAnalytics;
    activities: ActivityItem[];
  } | null>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select(`
          *,
          client:profiles(full_name, email)
        `)
        .eq('tenant_id', user?.tenant_id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Load tasks assigned to current user or all tasks if manager/admin
      let tasksQuery = supabase
        .from('tasks')
        .select(`
          *,
          assignee:assigned_to(email, profile:profiles(full_name, avatar_url)),
          creator:created_by(email, profile:profiles(full_name)),
          project:projects(id, title, status)
        `)
        .eq('tenant_id', user?.tenant_id);

      if (!hasPermission('view_all_projects')) {
        tasksQuery = tasksQuery.eq('assigned_to', user?.id);
      }

      const { data: tasksData } = await tasksQuery
        .order('created_at', { ascending: false })
        .limit(20);

      // Load time entries
      let timeQuery = supabase
        .from('time_entries')
        .select(`
          *,
          user:auth.users(email, profile:profiles(full_name)),
          project:projects(id, title),
          task:tasks(id, title)
        `)
        .eq('tenant_id', user?.tenant_id);

      if (!hasPermission('view_all_time_entries')) {
        timeQuery = timeQuery.eq('user_id', user?.id);
      }

      const { data: timeData } = await timeQuery
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false });

      setProjects(projectsData || []);
      setTasks(tasksData || []);
      setTimeEntries(timeData || []);

      // Calculate analytics
      calculateAnalytics(projectsData || [], tasksData || [], timeData || []);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (projectsData: any[], tasksData: Task[], timeData: TimeEntry[]) => {
    // Project analytics
    const projectAnalytics: ProjectAnalytics = {
      total_projects: projectsData.length,
      active_projects: projectsData.filter(p => p.status === 'in_progress').length,
      completed_projects: projectsData.filter(p => p.status === 'completed').length,
      overdue_projects: projectsData.filter(p => 
        p.due_date && new Date(p.due_date) < new Date() && p.status !== 'completed'
      ).length,
      projects_by_status: projectsData.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {}),
      recent_activity: [] // Will be populated from actual activity log
    };

    // Task analytics
    const taskAnalytics: TaskAnalytics = {
      total_tasks: tasksData.length,
      completed_tasks: tasksData.filter(t => t.status === 'completed').length,
      pending_tasks: tasksData.filter(t => t.status === 'pending').length,
      overdue_tasks: tasksData.filter(t => 
        t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
      ).length,
      tasks_by_priority: tasksData.reduce((acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      tasks_by_status: tasksData.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      completion_rate: tasksData.length > 0 
        ? Math.round((tasksData.filter(t => t.status === 'completed').length / tasksData.length) * 100)
        : 0
    };

    setAnalytics({
      projects: projectAnalytics,
      tasks: taskAnalytics,
      activities: [] // Will be implemented with activity feed
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'blocked': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Staff Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Welcome back, {user?.profile?.full_name || user?.email}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="capitalize">
                {user?.role?.replace('_', ' ')}
              </Badge>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Quick Add
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:grid-cols-none lg:flex">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Projects</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="time" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Time</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Team</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                      <p className="text-2xl font-bold">{analytics?.projects.active_projects || 0}</p>
                    </div>
                    <FolderOpen className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="mt-2 flex items-center text-sm text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>+2 this week</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending Tasks</p>
                      <p className="text-2xl font-bold">{analytics?.tasks.pending_tasks || 0}</p>
                    </div>
                    <CheckSquare className="w-8 h-8 text-yellow-500" />
                  </div>
                  <div className="mt-2 flex items-center text-sm text-red-600">
                    <Target className="w-4 h-4 mr-1" />
                    <span>{analytics?.tasks.overdue_tasks || 0} overdue</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Hours This Week</p>
                      <p className="text-2xl font-bold">
                        {timeEntries.reduce((sum, entry) => sum + entry.hours, 0).toFixed(1)}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="mt-2 flex items-center text-sm text-blue-600">
                    <Activity className="w-4 h-4 mr-1" />
                    <span>Target: 40hrs</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                      <p className="text-2xl font-bold">{analytics?.tasks.completion_rate || 0}%</p>
                    </div>
                    <Zap className="w-8 h-8 text-purple-500" />
                  </div>
                  <div className="mt-2 flex items-center text-sm text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>+5% vs last week</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Projects and Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Projects */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5" />
                    Recent Projects
                  </CardTitle>
                  <CardDescription>Your latest project assignments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {projects.slice(0, 5).map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{project.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {project.client?.full_name || 'Internal Project'}
                          </p>
                        </div>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View All Projects
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5" />
                    My Tasks
                  </CardTitle>
                  <CardDescription>Tasks assigned to you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {task.project?.title}
                          </p>
                          {task.due_date && (
                            <div className="flex items-center mt-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3 mr-1" />
                              Due: {new Date(task.due_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge className={getStatusColor(task.status)}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View All Tasks
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Project Management</CardTitle>
                <CardDescription>Manage and track all projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Projects Module</h3>
                  <p className="text-muted-foreground mb-4">
                    Advanced project management features coming soon
                  </p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Task Management</CardTitle>
                <CardDescription>Create, assign, and track tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CheckSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Task Management</h3>
                  <p className="text-muted-foreground mb-4">
                    Comprehensive task tracking system coming soon
                  </p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Task
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Time Tab */}
          <TabsContent value="time">
            <Card>
              <CardHeader>
                <CardTitle>Time Tracking</CardTitle>
                <CardDescription>Log and manage work hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Time Tracking</h3>
                  <p className="text-muted-foreground mb-4">
                    Advanced time tracking features coming soon
                  </p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Log Time Entry
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Team Collaboration</CardTitle>
                <CardDescription>Team communication and coordination</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Team Collaboration</h3>
                  <p className="text-muted-foreground mb-4">
                    Team management features coming soon
                  </p>
                  <Button>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Start Discussion
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
                <CardDescription>Performance metrics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Reports & Analytics</h3>
                  <p className="text-muted-foreground mb-4">
                    Advanced reporting features coming soon
                  </p>
                  <Button>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}