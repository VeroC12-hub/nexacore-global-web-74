import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Users,
  Calendar,
  Clock,
  TrendingUp,
  Search,
  Plus,
  Eye,
  Edit,
  MessageSquare,
  Phone,
  FolderOpen,
  Activity,
  CheckCircle,
  AlertCircle,
  Bell,
  Mail,
  Send,
  UserCheck,
  Target,
  BarChart3,
  Settings,
  FileText,
  Workflow,
  DollarSign,
  ArrowRight,
  CheckSquare,
  Zap,
  LayoutDashboard,
  Building2,
  Package,
  ShoppingCart,
  TrendingDown,
  Calendar as CalendarIcon,
  ClipboardList,
  Database,
  PieChart,
  LineChart,
  Filter,
  Download,
  Upload,
  Printer,
  RefreshCw,
  Home
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Task, TimeEntry, ProjectAnalytics, TaskAnalytics, ActivityItem } from '@/types/erp';

export const ModernStaffDashboard: React.FC = () => {
  const { user, role, isAdmin, isProjectManager, isOperationsManager, isDeveloper, isSupport, hasPermission, loading: authLoading } = useEnhancedAuth();
  const navigate = useNavigate();
  
  // State
  const [activeView, setActiveView] = useState('overview');
  const [dataLoading, setDataLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [analytics, setAnalytics] = useState<{
    projects: ProjectAnalytics;
    tasks: TaskAnalytics;
    activities: ActivityItem[];
  } | null>(null);

  // Navigation items based on role - SAP/Odoo style modules
  const getNavigationItems = () => {
    const baseItems = [
      { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, count: null },
      { id: 'projects', label: 'Project Management', icon: <FolderOpen className="h-5 w-5" />, count: null },
      { id: 'tasks', label: 'Task Management', icon: <CheckSquare className="h-5 w-5" />, count: null },
      { id: 'timesheet', label: 'Timesheet', icon: <Clock className="h-5 w-5" />, count: null },
      { id: 'calendar', label: 'Calendar', icon: <CalendarIcon className="h-5 w-5" />, count: null },
      { id: 'documents', label: 'Documents', icon: <FileText className="h-5 w-5" />, count: null },
      { id: 'contacts', label: 'Contacts', icon: <Users className="h-5 w-5" />, count: null },
      { id: 'communication', label: 'Communication', icon: <MessageSquare className="h-5 w-5" />, count: null },
    ];

    // Add role-specific ERP modules
    if (isAdmin || isProjectManager || isOperationsManager) {
      baseItems.push(
        { id: 'crm', label: 'CRM', icon: <Building2 className="h-5 w-5" />, count: null },
        { id: 'sales', label: 'Sales', icon: <ShoppingCart className="h-5 w-5" />, count: null },
        { id: 'inventory', label: 'Inventory', icon: <Package className="h-5 w-5" />, count: null },
        { id: 'accounting', label: 'Accounting', icon: <DollarSign className="h-5 w-5" />, count: null },
        { id: 'hr', label: 'Human Resources', icon: <Users className="h-5 w-5" />, count: null },
        { id: 'reporting', label: 'Reporting', icon: <PieChart className="h-5 w-5" />, count: null }
      );
    }

    if (isAdmin || isOperationsManager) {
      baseItems.push(
        { id: 'workflow', label: 'Workflow Management', icon: <Workflow className="h-5 w-5" />, count: null },
        { id: 'analytics', label: 'Business Intelligence', icon: <LineChart className="h-5 w-5" />, count: null }
      );
    }

    if (isAdmin) {
      baseItems.push(
        { id: 'administration', label: 'Administration', icon: <Settings className="h-5 w-5" />, count: null },
        { id: 'system', label: 'System Configuration', icon: <Database className="h-5 w-5" />, count: null }
      );
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  // Load real data from database only
  const loadDashboardData = async () => {
    if (!user) return;
    
    setDataLoading(true);
    try {
      // Load real projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`*`)
        .limit(50);

      if (!projectsError && projectsData) {
        setProjects(projectsData);
        console.log('Projects loaded:', projectsData.length);
      } else if (projectsError?.code === 'PGRST116' || projectsError?.message?.includes('relation "projects" does not exist')) {
        console.log('Projects table does not exist yet. ERP tables need to be set up.');
        setProjects([]);
      } else {
        console.log('Projects query error:', projectsError);
        setProjects([]);
      }

      // Load real tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .limit(50);

      if (!tasksError && tasksData) {
        setTasks(tasksData);
        console.log('Tasks loaded:', tasksData.length);
      } else if (tasksError?.code === 'PGRST116' || tasksError?.message?.includes('relation "tasks" does not exist')) {
        console.log('Tasks table does not exist yet. ERP tables need to be set up.');
        setTasks([]);
      } else {
        console.log('Tasks query error:', tasksError);
        setTasks([]);
      }

      // Load real time entries
      const { data: timeData, error: timeError } = await supabase
        .from('time_entries')
        .select('*')
        .limit(50);

      if (!timeError && timeData) {
        setTimeEntries(timeData);
        console.log('Time entries loaded:', timeData.length);
      } else if (timeError?.code === 'PGRST116' || timeError?.message?.includes('relation "time_entries" does not exist')) {
        console.log('Time entries table does not exist yet. ERP tables need to be set up.');
        setTimeEntries([]);
      } else {
        console.log('Time entries query error:', timeError);
        setTimeEntries([]);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadDashboardData();
    }
  }, [user?.id, authLoading]);

  // ERP-style render functions
  const renderOverview = () => (
    <div className="space-y-6">
      {/* ERP Dashboard Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">NexaCore ERP Dashboard</h1>
            <p className="text-gray-600">Welcome, {user?.email?.split('@')[0]} ({role?.replace('_', ' ')})</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={loadDashboardData} disabled={dataLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${dataLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* KPI Cards - SAP/Odoo Style */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Active Projects</p>
                <p className="text-2xl font-bold text-blue-900">{projects.filter(p => p.status === 'in_progress').length}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">Pending Tasks</p>
                <p className="text-2xl font-bold text-orange-900">{tasks.filter(t => t.status === 'pending').length}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Time Logged</p>
                <p className="text-2xl font-bold text-green-900">{timeEntries.reduce((sum, entry) => sum + entry.hours, 0)}h</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">Total Projects</p>
                <p className="text-2xl font-bold text-purple-900">{projects.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
        {projects.length === 0 && tasks.length === 0 && timeEntries.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-blue-50 rounded-lg p-6 mb-4">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-blue-100 rounded-full p-3">
                  <Database className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">ERP System Setup Required</h3>
              <p className="text-blue-700 mb-4">
                The ERP database tables need to be set up to start using the staff dashboard.
                Please contact your administrator to run the database migration.
              </p>
              <div className="text-sm text-blue-600 bg-blue-100 rounded p-3">
                <p className="font-medium mb-1">For administrators:</p>
                <p>Run the migration file: <code className="bg-white px-2 py-1 rounded">20241204_create_erp_foundation.sql</code></p>
              </div>
            </div>
            <p className="text-gray-500">Once set up, you'll be able to manage projects, tasks, and time entries.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.slice(0, 5).map((project, index) => (
              <div key={project.id || index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                <FolderOpen className="h-5 w-5 text-blue-500" />
                <span className="flex-1">Project: {project.title || 'Untitled Project'}</span>
                <Badge variant="outline">{project.status || 'No Status'}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Project Management</h1>
            <p className="text-sm text-gray-600">Manage all your projects in one place</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Found</h3>
            <p className="text-gray-500 mb-4">Create your first project to get started with the ERP system.</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.map((project, index) => (
                  <tr key={project.id || index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{project.title || 'Untitled'}</div>
                      <div className="text-sm text-gray-500">{project.description || 'No description'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {project.client?.full_name || 'No client assigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline">{project.status || 'No status'}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${project.progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{project.progress || 0}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button variant="outline" size="sm" className="mr-2">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Task Management</h1>
            <p className="text-sm text-gray-600">Track and manage all tasks</p>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>
      
      <div className="p-6">
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Tasks Found</h3>
            <p className="text-gray-500 mb-4">Create tasks to track work and progress.</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <div key={task.id || index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{task.title}</h3>
                  <Badge variant="outline">{task.status}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</span>
                  <span>{task.estimated_hours}h estimated</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderTimesheet = () => (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Timesheet</h1>
            <p className="text-sm text-gray-600">Track your work hours</p>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Log Time
          </Button>
        </div>
      </div>
      
      <div className="p-6">
        {timeEntries.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Time Entries Found</h3>
            <p className="text-gray-500 mb-4">Start logging your work hours to track productivity.</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Log Time
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {timeEntries.map((entry, index) => (
              <div key={entry.id || index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{entry.hours}h</span>
                  </div>
                  <span className="text-sm text-gray-500">{new Date(entry.date).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-600">{entry.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderComingSoon = (moduleName: string) => (
    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
      <div className="mb-4">
        <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
          <Settings className="h-8 w-8 text-gray-400" />
        </div>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{moduleName}</h2>
      <p className="text-gray-500 mb-4">This ERP module is coming soon. Full enterprise functionality will be available.</p>
      <Badge variant="secondary">Under Development</Badge>
    </div>
  );

  const renderActiveView = () => {
    switch (activeView) {
      case 'projects':
        return renderProjects();
      case 'tasks':
        return renderTasks();
      case 'timesheet':
        return renderTimesheet();
      case 'crm':
        return renderComingSoon('Customer Relationship Management');
      case 'sales':
        return renderComingSoon('Sales Management');
      case 'inventory':
        return renderComingSoon('Inventory Management');
      case 'accounting':
        return renderComingSoon('Accounting & Finance');
      case 'hr':
        return renderComingSoon('Human Resources');
      case 'reporting':
        return renderComingSoon('Advanced Reporting');
      case 'workflow':
        return renderComingSoon('Workflow Management');
      case 'analytics':
        return renderComingSoon('Business Intelligence');
      case 'administration':
        return renderComingSoon('System Administration');
      case 'system':
        return renderComingSoon('System Configuration');
      default:
        return renderOverview();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ERP Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to access the staff dashboard.</p>
          <button 
            onClick={() => navigate('/auth')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex pt-20">
        {/* SAP/Odoo Style Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <div className="bg-blue-600 rounded p-1">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">NexaCore ERP</h2>
                <p className="text-xs text-gray-500">Enterprise Resource Planning</p>
              </div>
            </div>
            
            <nav className="space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                    activeView === item.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.count !== null && item.count > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {item.count}
                    </Badge>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden relative">
          {dataLoading && (
            <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-lg p-6 flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-700">Loading data...</span>
              </div>
            </div>
          )}
          <div className="p-6">
            {renderActiveView()}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ModernStaffDashboard;