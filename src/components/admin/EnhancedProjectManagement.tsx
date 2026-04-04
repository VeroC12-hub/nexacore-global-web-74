import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  LayoutGrid,
  CalendarDays as Timeline,
  BarChart3,
  Settings,
  Users,
  Calendar,
  MessageSquare,
  FileText,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

// Import the enhanced components we just created
import ProjectKanbanBoard from './ProjectKanbanBoard';
import ProjectTimelineView from './ProjectTimelineView';
import ProjectAnalyticsDashboard from './ProjectAnalyticsDashboard';

interface QuickStats {
  totalProjects: number;
  activeProjects: number;
  completedThisMonth: number;
  overdueProjects: number;
  teamUtilization: number;
  budgetUtilization: number;
}

interface RecentActivity {
  id: string;
  type: 'project_created' | 'project_completed' | 'milestone_reached' | 'task_assigned' | 'budget_alert';
  message: string;
  timestamp: string;
  user: string;
  project: string;
}

const EnhancedProjectManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [quickStats, setQuickStats] = useState<QuickStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedThisMonth: 0,
    overdueProjects: 0,
    teamUtilization: 0,
    budgetUtilization: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, status, end_date');
      if (error || !data) return;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const total = data.length;
      const active = data.filter(p => p.status === 'in_progress').length;
      const completedThisMonth = data.filter(p => {
        return p.status === 'completed' && new Date(p.end_date) >= startOfMonth;
      }).length;
      const overdue = data.filter(p => {
        return p.status !== 'completed' && p.status !== 'cancelled' &&
               p.end_date && new Date(p.end_date) < now;
      }).length;

      // Compute budget utilization from erp_projects
      let budgetUtilization = 0;
      const { data: erpData } = await supabase
        .from('erp_projects')
        .select('budget, actual_cost')
        .eq('is_active', true);
      if (erpData && erpData.length > 0) {
        const totalBudget = erpData.reduce((sum: number, p: any) => sum + (p.budget || 0), 0);
        const totalSpent = erpData.reduce((sum: number, p: any) => sum + (p.actual_cost || 0), 0);
        budgetUtilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
      }

      setQuickStats({
        totalProjects: total,
        activeProjects: active,
        completedThisMonth,
        overdueProjects: overdue,
        teamUtilization: 0,
        budgetUtilization
      });
    };
    fetchStats();
  }, []);

  const recentActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'project_completed',
      message: 'E-commerce Platform Phase 1 completed',
      timestamp: '2 hours ago',
      user: 'Alice Smith',
      project: 'E-commerce Platform'
    },
    {
      id: '2',
      type: 'milestone_reached',
      message: 'UI Design milestone reached',
      timestamp: '4 hours ago',
      user: 'Carol White',
      project: 'Mobile App'
    },
    {
      id: '3',
      type: 'budget_alert',
      message: 'Project budget at 85% utilization',
      timestamp: '6 hours ago',
      user: 'System',
      project: 'API Integration'
    },
    {
      id: '4',
      type: 'task_assigned',
      message: 'Frontend testing task assigned',
      timestamp: '1 day ago',
      user: 'Bob Johnson',
      project: 'E-commerce Platform'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project_completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'milestone_reached': return <Target className="w-4 h-4 text-blue-600" />;
      case 'budget_alert': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'task_assigned': return <Users className="w-4 h-4 text-purple-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'project_completed': return 'border-l-green-500 bg-green-50';
      case 'milestone_reached': return 'border-l-blue-500 bg-blue-50';
      case 'budget_alert': return 'border-l-orange-500 bg-orange-50';
      case 'task_assigned': return 'border-l-purple-500 bg-purple-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Project Management</h1>
          <p className="text-muted-foreground">
            Advanced project management with Kanban boards, timeline views, and analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button>
            <Zap className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="kanban" className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" />
            Kanban Board
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Timeline className="w-4 h-4" />
            Timeline View
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quickStats.totalProjects}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quickStats.activeProjects}</div>
                <p className="text-xs text-muted-foreground">In progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quickStats.completedThisMonth}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{quickStats.overdueProjects}</div>
                <p className="text-xs text-muted-foreground">Needs attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Utilization</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quickStats.teamUtilization}%</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline w-3 h-3 mr-1" />
                  Optimal range
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quickStats.budgetUtilization}%</div>
                <p className="text-xs text-muted-foreground">Of allocated budget</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project Management Features */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Project Management Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                       onClick={() => setActiveTab('kanban')}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <LayoutGrid className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Kanban Board</h4>
                        <p className="text-sm text-muted-foreground">Drag & drop project management</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                       onClick={() => setActiveTab('timeline')}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Timeline className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Gantt Timeline</h4>
                        <p className="text-sm text-muted-foreground">Visual project scheduling</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                       onClick={() => setActiveTab('analytics')}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Analytics Dashboard</h4>
                        <p className="text-sm text-muted-foreground">Performance insights & reports</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Team Collaboration</h4>
                        <p className="text-sm text-muted-foreground">Real-time team coordination</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Risk Management</h4>
                        <p className="text-sm text-muted-foreground">Proactive risk assessment</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Documentation</h4>
                        <p className="text-sm text-muted-foreground">Centralized project docs</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className={`p-3 border-l-4 rounded-r-lg ${getActivityColor(activity.type)}`}
                    >
                      <div className="flex items-start gap-3">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.message}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span>{activity.user}</span>
                            <span>•</span>
                            <span>{activity.project}</span>
                            <span>•</span>
                            <span>{activity.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm">
                  View All Activity
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="h-20 flex-col gap-2">
                  <Target className="w-5 h-5" />
                  New Project
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Users className="w-5 h-5" />
                  Assign Tasks
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Calendar className="w-5 h-5" />
                  Schedule Review
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <FileText className="w-5 h-5" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kanban">
          <ProjectKanbanBoard />
        </TabsContent>

        <TabsContent value="timeline">
          <ProjectTimelineView />
        </TabsContent>

        <TabsContent value="analytics">
          <ProjectAnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedProjectManagement;