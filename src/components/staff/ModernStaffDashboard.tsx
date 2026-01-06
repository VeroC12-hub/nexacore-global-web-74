import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import PortfolioSubmissionModal from './PortfolioSubmissionModal';
import SimplePortfolioSubmission from './SimplePortfolioSubmission';
import PortfolioHelp from './PortfolioHelp';
import ProjectHelp from './ProjectHelp';
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
  Portfolio,
  Camera,
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
  Printer,
  RefreshCw,
  Home,
  Menu,
  X
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [showSimplePortfolioForm, setShowSimplePortfolioForm] = useState(false);
  const [showPortfolioHelp, setShowPortfolioHelp] = useState(false);
  const [showProjectHelp, setShowProjectHelp] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showPortfolioView, setShowPortfolioView] = useState(false);
  const [showPortfolioEdit, setShowPortfolioEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    service: '',
    client: '',
    description: '',
    status: ''
  });
  // Project management states
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState(null);
  const [showProjectView, setShowProjectView] = useState(false);
  const [showProjectEdit, setShowProjectEdit] = useState(false);
  const [projectEditForm, setProjectEditForm] = useState({
    title: '',
    description: '',
    status: '',
    progress: 0,
    budget: '',
    deadline: ''
  });
  // Sample project data for testing
  const sampleProjects = [
    {
      id: 1,
      title: 'E-commerce Website Redesign',
      description: 'Complete overhaul of the existing e-commerce platform with modern UI/UX design',
      status: 'in_progress',
      progress: 65,
      budget: '15000',
      deadline: '2024-12-15',
      client: { full_name: 'TechCorp Solutions' }
    },
    {
      id: 2,
      title: 'Mobile App Development',
      description: 'Native iOS and Android app development for customer engagement',
      status: 'planning',
      progress: 25,
      budget: '25000',
      deadline: '2024-11-30',
      client: { full_name: 'StartupXYZ' }
    },
    {
      id: 3,
      title: 'Database Migration',
      description: 'Migration from legacy database to modern cloud infrastructure',
      status: 'completed',
      progress: 100,
      budget: '8000',
      deadline: '2024-10-01',
      client: { full_name: 'Enterprise Ltd' }
    }
  ];
  
  const [projects, setProjects] = useState<any[]>(sampleProjects);
  const [portfolioProjects, setPortfolioProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [analytics, setAnalytics] = useState<{
    projects: ProjectAnalytics;
    tasks: TaskAnalytics;
    activities: ActivityItem[];
  } | null>(null);

  // Load portfolio data from Supabase
  useEffect(() => {
    if (user) {
      loadPortfolioData();
      loadProjectData();
    }
  }, [user]);

  const getServiceLabel = (serviceId: string) => {
    const serviceMap: Record<string, string> = {
      'cad-design': 'CAD Design',
      'ai-ml': 'AI/ML',
      'blockchain': 'Blockchain',
      '3d-animation': '3D Animation',
      'ecommerce-tech': 'E-Commerce',
      'mobile-dev': 'Mobile Development',
      'web-development': 'Web Development',
      'ui-ux-design': 'UI/UX Design',
      'data-analytics': 'Data Analytics',
      'cybersecurity': 'Cybersecurity'
    };
    return serviceMap[serviceId] || serviceId;
  };

  const loadPortfolioData = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*, portfolio_files(*)')
        .eq('submitted_by', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProjects = data?.map(project => ({
        id: project.id,
        title: project.title,
        service: getServiceLabel(project.service_id),
        service_id: project.service_id, // Keep original for editing
        status: project.submission_status,
        date: new Date(project.created_at).toLocaleDateString(),
        client: project.client_name,
        description: project.description || project.short_description,
        portfolio_files: project.portfolio_files || []
      })) || [];

      setPortfolioProjects(formattedProjects);
    } catch (error) {
      console.error('Error loading portfolio projects:', error);
    }
  };

  const loadProjectData = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          client:profiles!projects_client_id_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProjects = data?.map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        status: project.status,
        progress: project.progress || 0,
        client: project.client,
        created_at: project.created_at,
        updated_at: project.updated_at,
        budget: project.budget,
        deadline: project.deadline
      })) || [];

      setProjects(formattedProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const savePortfolioChanges = async () => {
    try {
      const { error } = await supabase
        .from('portfolio_projects')
        .update({
          title: editForm.title,
          service_id: editForm.service,
          client_name: editForm.client,
          description: editForm.description,
          submission_status: editForm.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedProject?.id);

      if (error) throw error;

      toast.success('Portfolio updated successfully!');
      setShowPortfolioEdit(false);
      // Reload portfolio data to show changes
      loadPortfolioData();
    } catch (error) {
      console.error('Error updating portfolio:', error);
      toast.error('Failed to update portfolio');
    }
  };

  const saveProjectChanges = async () => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          title: projectEditForm.title,
          description: projectEditForm.description,
          status: projectEditForm.status,
          progress: parseInt(projectEditForm.progress.toString()),
          budget: projectEditForm.budget ? parseFloat(projectEditForm.budget) : null,
          deadline: projectEditForm.deadline || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedProjectForEdit?.id);

      if (error) throw error;

      toast.success('Project updated successfully!');
      setShowProjectEdit(false);
      // Reload project data to show changes
      loadProjectData();
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  };

  // Navigation items based on role - SAP/Odoo style modules
  const getNavigationItems = () => {
    const baseItems = [
      { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, count: null },
      { id: 'projects', label: 'Project Management', icon: <FolderOpen className="h-5 w-5" />, count: null },
      { id: 'portfolio', label: 'Portfolio Management', icon: <Camera className="h-5 w-5" />, count: null },
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

  // Load real data from ERP database tables
  const loadDashboardData = async () => {
    if (!user) return;
    
    setDataLoading(true);
    try {
      // Load ERP projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('erp_projects')
        .select(`*`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!projectsError && projectsData) {
        setProjects(projectsData);
        console.log('ERP Projects loaded:', projectsData.length);
      } else if (projectsError?.code === 'PGRST116' || projectsError?.message?.includes('relation "erp_projects" does not exist')) {
        console.log('ERP projects table does not exist yet. Please run the ERP setup SQL.');
        setProjects([]);
      } else {
        console.log('ERP projects query error:', projectsError);
        setProjects([]);
      }

      // Load ERP tasks with basic query (foreign key relationships need proper setup)
      const { data: tasksData, error: tasksError } = await supabase
        .from('erp_tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!tasksError && tasksData) {
        setTasks(tasksData);
        console.log('ERP Tasks loaded:', tasksData.length);
      } else if (tasksError?.code === 'PGRST116' || tasksError?.message?.includes('relation "erp_tasks" does not exist')) {
        console.log('ERP tasks table does not exist yet. Please run the ERP setup SQL.');
        setTasks([]);
      } else {
        console.log('ERP tasks query error:', tasksError);
        setTasks([]);
      }

      // Load ERP time entries with basic query (foreign key relationships need proper setup)
      const { data: timeData, error: timeError } = await supabase
        .from('erp_time_entries')
        .select('*')
        .order('date', { ascending: false })
        .limit(50);

      if (!timeError && timeData) {
        setTimeEntries(timeData);
        console.log('ERP Time entries loaded:', timeData.length);
      } else if (timeError?.code === 'PGRST116' || timeError?.message?.includes('relation "erp_time_entries" does not exist')) {
        console.log('ERP time entries table does not exist yet. Please run the ERP setup SQL.');
        setTimeEntries([]);
      } else {
        console.log('ERP time entries query error:', timeError);
        setTimeEntries([]);
      }

    } catch (error) {
      console.error('Error loading ERP dashboard data:', error);
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
  // Render function for active view
  const renderActiveView = () => {
    if (activeView === 'overview') return renderOverview();
    if (activeView === 'projects') return renderProjects();
    if (activeView === 'portfolio') return renderPortfolio();
    if (activeView === 'tasks') return renderTasks();
    if (activeView === 'timesheet') return renderTimesheet();
    
    // For other ERP modules, show coming soon
    return renderComingSoon(
      navigationItems.find(item => item.id === activeView)?.label || 'Module'
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* ERP Dashboard Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">NexaCore ERP Dashboard</h1>
            <p className="text-sm md:text-base text-gray-600">Welcome, {user?.email?.split('@')[0]} ({role?.replace('_', ' ')})</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Project Management</h2>
            <p className="text-sm text-gray-600">Manage and track all your projects in one centralized dashboard</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Button 
              variant="outline"
              onClick={() => setShowProjectHelp(true)}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <FileText className="h-4 w-4 mr-2" />
              Help & Tutorials
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setProjectEditForm({
                  title: '',
                  description: '',
                  status: 'planning',
                  progress: 0,
                  budget: '',
                  deadline: ''
                });
                setSelectedProjectForEdit(null);
                setShowProjectEdit(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  👋 Welcome to Project Management!
                </h3>
                <p className="text-gray-700 mb-4">
                  Organize, track, and deliver projects efficiently. Manage timelines, budgets, and team collaboration in one place.
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                    Track project progress
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                    Manage budgets & deadlines
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                    Collaborate with team
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                    Client management
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  Quick Start Guide
                </Button>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create First Project
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FolderOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.length > 0 ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Your Projects</h3>
              <p className="text-sm text-gray-500">Manage and track project progress</p>
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
                      {hasPermission('view_all_projects') ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mr-2"
                          onClick={() => {
                            setSelectedProjectForEdit(project);
                            setShowProjectView(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="mr-2" disabled title="You don't have permission to view project details">
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {hasPermission('edit_all_projects') && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedProjectForEdit(project);
                            setProjectEditForm({
                              title: project.title,
                              description: project.description,
                              status: project.status,
                              progress: project.progress || 0,
                              budget: project.budget || '',
                              deadline: project.deadline || ''
                            });
                            setShowProjectEdit(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      </div>
    </div>
  );

  const renderPortfolio = () => (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Portfolio Management</h2>
            <p className="text-sm text-gray-600">Submit and manage portfolio projects for client showcase</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline"
              onClick={() => setShowPortfolioHelp(true)}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <FileText className="h-4 w-4 mr-2" />
              Help & Tutorials
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              onClick={() => setShowSimplePortfolioForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="flex items-center">
                Add Project
                <Zap className="h-3 w-3 ml-1 text-yellow-300" />
              </span>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Getting Started Banner for New Users */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Camera className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  👋 Welcome to Portfolio Management!
                </h3>
                <p className="text-gray-600 mb-4">
                  Share your amazing projects with the world! Our simple 4-step wizard makes it easy to submit portfolio projects.
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    Easy 4-step wizard
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    Built-in help system
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    Auto-save progress
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    Admin review process
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPortfolioHelp(true)}
                className="text-blue-600 border-blue-300"
              >
                <FileText className="h-4 w-4 mr-2" />
                Quick Start Guide
              </Button>
              <Button
                size="sm"
                onClick={() => setShowSimplePortfolioForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Submit First Project
              </Button>
            </div>
          </div>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">Published</p>
                <p className="text-2xl font-bold text-green-900">3</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-900">2</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Edit className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">Draft</p>
                <p className="text-2xl font-bold text-blue-900">1</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-800">Total Projects</p>
                <p className="text-2xl font-bold text-purple-900">6</p>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Projects List */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Your Portfolio Submissions</h3>
          
          {/* Portfolio Projects from Database */}
          {portfolioProjects.map((project, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-lg font-medium text-gray-900">{project.title}</h4>
                    <Badge 
                      variant={
                        project.status === 'published' ? 'default' :
                        project.status === 'pending_review' ? 'secondary' : 'outline'
                      }
                      className={
                        project.status === 'published' ? 'bg-green-100 text-green-800' :
                        project.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }
                    >
                      {project.status === 'published' ? '✓ Published' :
                       project.status === 'pending_review' ? '⏳ Pending Review' : '📝 Draft'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>Service: {project.service}</span>
                    <span>Client: {project.client}</span>
                    <span>Submitted: {project.date}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Only allow viewing if user has portfolio view permissions */}
                  {hasPermission('view_all_portfolio') ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedProject(project);
                        setShowPortfolioView(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled title="You don't have permission to view portfolio details">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  )}
                  {/* Only allow editing if user has portfolio edit permissions */}
                  {(hasPermission('edit_all_portfolio') || hasPermission('edit_own_portfolio')) && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedProject(project);
                        setEditForm({
                          title: project.title,
                          service: project.service_id || project.service,
                          client: project.client,
                          description: project.description,
                          status: project.status
                        });
                        setShowPortfolioEdit(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {portfolioProjects.length === 0 && (
          <div className="text-center py-12">
            <Camera className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No portfolio projects</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by submitting your first project for portfolio showcase.</p>
            <div className="mt-6">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setShowPortfolioForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Project
              </Button>
            </div>
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

      {/* Mobile Menu Button - Like Navbar */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className={`lg:hidden fixed top-20 left-4 z-[60] flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-full shadow-2xl border-2 border-white hover:scale-105 transition-all active:scale-95 ${!mobileMenuOpen ? 'animate-pulse' : ''}`}
        aria-label="Toggle Menu"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        <span className="text-sm font-medium">{mobileMenuOpen ? 'Close' : 'Menu'}</span>
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-[45] backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex pt-16 min-h-screen">
        {/* SAP/Odoo Style Sidebar */}
        <div className={`
          fixed lg:static top-16 lg:top-0 bottom-0 left-0 z-[50]
          w-64 sm:w-64 lg:w-64
          bg-white shadow-sm border-r border-gray-200
          flex flex-col overflow-y-auto overflow-x-hidden
          transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 rounded p-1">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">NexaCore ERP</h2>
                  <p className="text-xs text-gray-500">Enterprise Resource Planning</p>
                </div>
              </div>
              {/* Close button for mobile */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <nav className="space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 min-h-[52px] rounded-lg text-left text-sm transition-colors active:scale-98 ${
                    activeView === item.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200 font-medium'
                      : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
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
        <div className="flex-1 w-full overflow-hidden relative">
          {dataLoading && (
            <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-lg p-6 flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-700">Loading data...</span>
              </div>
            </div>
          )}
          <div className="p-4 md:p-6 overflow-x-hidden overflow-y-auto h-full w-full max-w-full">
            {renderActiveView()}
          </div>
        </div>
      </div>

      <Footer />

      {/* Portfolio Submission Modals */}
      <PortfolioSubmissionModal
        isOpen={showPortfolioForm}
        onClose={() => setShowPortfolioForm(false)}
        onSuccess={() => {
          toast.success('Portfolio submitted successfully!');
          // TODO: Refresh portfolio data
        }}
      />

      {/* Simple Portfolio Submission */}
      {showSimplePortfolioForm && (
        <SimplePortfolioSubmission
          onClose={() => setShowSimplePortfolioForm(false)}
          onSuccess={() => {
            setShowSimplePortfolioForm(false);
            toast.success('🎉 Portfolio submitted successfully! It will be reviewed by admin.');
            // TODO: Refresh portfolio data
          }}
        />
      )}

      {/* Portfolio Help System */}
      {showPortfolioHelp && (
        <PortfolioHelp
          onClose={() => setShowPortfolioHelp(false)}
        />
      )}

      {/* Project Help System */}
      {showProjectHelp && (
        <ProjectHelp
          onClose={() => setShowProjectHelp(false)}
        />
      )}

      {/* Portfolio View Modal */}
      <Dialog open={showPortfolioView} onOpenChange={setShowPortfolioView}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Portfolio Project Details</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Project Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Title:</strong> {selectedProject.title}</div>
                    <div><strong>Service:</strong> {selectedProject.service}</div>
                    <div><strong>Status:</strong> 
                      <Badge className="ml-2" variant={
                        selectedProject.status === 'published' ? 'default' :
                        selectedProject.status === 'pending_review' ? 'secondary' : 'outline'
                      }>
                        {selectedProject.status === 'published' ? '✅ Published' :
                         selectedProject.status === 'pending_review' ? '⏳ Pending Review' : '📝 Draft'}
                      </Badge>
                    </div>
                    <div><strong>Submitted:</strong> {selectedProject.date}</div>
                    <div><strong>Client:</strong> {selectedProject.client}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-gray-600">{selectedProject.description}</p>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPortfolioView(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Portfolio Edit Modal */}
      <Dialog open={showPortfolioEdit} onOpenChange={setShowPortfolioEdit}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Portfolio Project</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-title">Project Title</Label>
                    <Input
                      id="edit-title"
                      value={editForm.title}
                      onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                      placeholder="Enter project title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-service">Service Category</Label>
                    <Select value={editForm.service} onValueChange={(value) => setEditForm({...editForm, service: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cad-design">CAD Design</SelectItem>
                        <SelectItem value="ai-ml">AI/ML</SelectItem>
                        <SelectItem value="web-development">Web Development</SelectItem>
                        <SelectItem value="mobile-dev">Mobile Development</SelectItem>
                        <SelectItem value="ui-ux-design">UI/UX Design</SelectItem>
                        <SelectItem value="data-analytics">Data Analytics</SelectItem>
                        <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                        <SelectItem value="blockchain">Blockchain</SelectItem>
                        <SelectItem value="3d-animation">3D Animation</SelectItem>
                        <SelectItem value="ecommerce-tech">E-Commerce</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-client">Client Name</Label>
                    <Input
                      id="edit-client"
                      value={editForm.client}
                      onChange={(e) => setEditForm({...editForm, client: e.target.value})}
                      placeholder="Enter client name"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-status">Project Status</Label>
                    <Select value={editForm.status} onValueChange={(value) => setEditForm({...editForm, status: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">📝 Draft</SelectItem>
                        <SelectItem value="pending_review">⏳ Pending Review</SelectItem>
                        <SelectItem value="published">✅ Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      placeholder="Enter project description"
                      rows={6}
                    />
                  </div>
                </div>
              </div>

              {/* Project Files Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Project Files</h3>
                {selectedProject?.portfolio_files?.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {selectedProject.portfolio_files.map((file: any, index: number) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.filename || `${file.file_type} file`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {file.file_type?.toUpperCase() || 'Unknown'}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex space-x-2">
                          <Button variant="outline" size="sm" className="text-xs">
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="text-xs text-red-600">
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <FileText className="h-12 w-12 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No files uploaded</p>
                    <p className="text-xs text-gray-400">Files can be added through the submission form</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPortfolioEdit(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={savePortfolioChanges}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Project View Modal */}
      <Dialog open={showProjectView} onOpenChange={setShowProjectView}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
          </DialogHeader>
          {selectedProjectForEdit && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Project Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Title:</strong> {selectedProjectForEdit.title}</div>
                    <div><strong>Status:</strong> 
                      <Badge className="ml-2" variant="outline">{selectedProjectForEdit.status}</Badge>
                    </div>
                    <div><strong>Progress:</strong> {selectedProjectForEdit.progress || 0}%</div>
                    <div><strong>Budget:</strong> {selectedProjectForEdit.budget ? `$${selectedProjectForEdit.budget}` : 'Not set'}</div>
                    <div><strong>Deadline:</strong> {selectedProjectForEdit.deadline ? new Date(selectedProjectForEdit.deadline).toLocaleDateString() : 'Not set'}</div>
                    <div><strong>Client:</strong> {selectedProjectForEdit.client?.full_name || 'No client assigned'}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-gray-600">{selectedProjectForEdit.description || 'No description provided'}</p>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowProjectView(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Project Edit Modal */}
      <Dialog open={showProjectEdit} onOpenChange={setShowProjectEdit}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          {selectedProjectForEdit && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="project-title">Project Title</Label>
                    <Input
                      id="project-title"
                      value={projectEditForm.title}
                      onChange={(e) => setProjectEditForm({...projectEditForm, title: e.target.value})}
                      placeholder="Enter project title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="project-status">Project Status</Label>
                    <Select value={projectEditForm.status} onValueChange={(value) => setProjectEditForm({...projectEditForm, status: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">📋 Planning</SelectItem>
                        <SelectItem value="in_progress">🔄 In Progress</SelectItem>
                        <SelectItem value="review">👀 Review</SelectItem>
                        <SelectItem value="completed">✅ Completed</SelectItem>
                        <SelectItem value="on_hold">⏸️ On Hold</SelectItem>
                        <SelectItem value="cancelled">❌ Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="project-progress">Progress (%)</Label>
                    <Input
                      id="project-progress"
                      type="number"
                      min="0"
                      max="100"
                      value={projectEditForm.progress}
                      onChange={(e) => setProjectEditForm({...projectEditForm, progress: parseInt(e.target.value) || 0})}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="project-budget">Budget ($)</Label>
                    <Input
                      id="project-budget"
                      type="number"
                      value={projectEditForm.budget}
                      onChange={(e) => setProjectEditForm({...projectEditForm, budget: e.target.value})}
                      placeholder="Enter budget amount"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="project-deadline">Deadline</Label>
                    <Input
                      id="project-deadline"
                      type="date"
                      value={projectEditForm.deadline}
                      onChange={(e) => setProjectEditForm({...projectEditForm, deadline: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="project-description">Description</Label>
                    <Textarea
                      id="project-description"
                      value={projectEditForm.description}
                      onChange={(e) => setProjectEditForm({...projectEditForm, description: e.target.value})}
                      placeholder="Enter project description"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowProjectEdit(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={saveProjectChanges}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModernStaffDashboard;