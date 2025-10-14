import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  CreditCard, 
  Settings, 
  BarChart3, 
  MessageSquare, 
  FolderOpen, 
  Workflow,
  Bell,
  Search,
  Plus,
  TrendingUp,
  DollarSign,
  Activity,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle,
  Camera
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Import existing admin components
import { AdminProjectsTab } from '@/components/admin/AdminProjectsTab';
import { AdminInvoicesTab } from '@/components/admin/AdminInvoicesTab';
import EnhancedProjectManagement from '@/components/admin/EnhancedProjectManagement';
import { AdminServiceRequestsTab } from '@/components/admin/AdminServiceRequestsTab';
import { AdminUsersTab } from '@/components/admin/AdminUsersTab';
import AdminPortfolioTab from '@/components/admin/AdminPortfolioTab';
import { AdminTeamTab } from '@/components/admin/AdminTeamTab';
import { AdminFileRepositoryTab } from '@/components/admin/AdminFileRepositoryTab';
import { AdminMessagingTab } from '@/components/admin/AdminMessagingTab';
import { AdminWorkflowTab } from '@/components/admin/AdminWorkflowTab';
import { AdminSettingsTab } from '@/components/admin/AdminSettingsTab';
import AdminQuoteRequestsTab from '@/components/admin/AdminQuoteRequestsTab';
import AdminAnalytics from '@/components/analytics/AdminAnalytics';
import { AdminERPTab } from '@/components/admin/AdminERPTab';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  totalInvoices: number;
  pendingRequests: number;
  totalRevenue: number;
  monthlyGrowth: number;
  activeWorkflows: number;
  unreadMessages: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
}

export const ModernAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { permissions, loading: permissionsLoading } = useRolePermissions();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'overview' | 'analytics' | 'business' | 'quotes' | 'projects' | 'invoices' | 'requests' | 'users' | 'team' | 'files' | 'messages' | 'workflows' | 'settings' | 'erp'>('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProjects: 0,
    totalInvoices: 0,
    pendingRequests: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    activeWorkflows: 0,
    unreadMessages: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    setLoading(true);
    try {
      const [
        usersResult,
        projectsResult,
        invoicesResult,
        workflowsResult,
        messagesResult
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('projects').select('id, budget', { count: 'exact' }),
        supabase.from('invoices').select('id, total_amount', { count: 'exact' }),
        supabase.from('workflow_instances').select('id', { count: 'exact' }),
        supabase.from('project_messages').select('id', { count: 'exact' })
      ]);

      const totalRevenue = invoicesResult.data?.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0) || 0;

      setStats({
        totalUsers: usersResult.count || 0,
        totalProjects: projectsResult.count || 0,
        totalInvoices: invoicesResult.count || 0,
        pendingRequests: 0,
        totalRevenue,
        monthlyGrowth: 12.5,
        activeWorkflows: workflowsResult.count || 0,
        unreadMessages: messagesResult.count || 0
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  // Base quick actions with permission requirements
  const allQuickActions: (QuickAction & { requiresPermission?: string | null })[] = [
    {
      id: 'new-project',
      title: 'New Project',
      description: 'Create a new client project',
      icon: <Plus className="h-5 w-5" />,
      action: () => setActiveView('projects'),
      color: 'bg-blue-500 hover:bg-blue-600',
      requiresPermission: null
    },
    {
      id: 'new-invoice',
      title: 'Create Invoice',
      description: 'Generate client invoice',
      icon: <CreditCard className="h-5 w-5" />,
      action: () => setActiveView('invoices'),
      color: 'bg-green-500 hover:bg-green-600',
      requiresPermission: 'canManageInvoices'
    },
    {
      id: 'new-workflow',
      title: 'New Workflow',
      description: 'Start automated process',
      icon: <Workflow className="h-5 w-5" />,
      action: () => setActiveView('workflows'),
      color: 'bg-purple-500 hover:bg-purple-600',
      requiresPermission: 'canManageWorkflows'
    },
    {
      id: 'send-message',
      title: 'Send Message',
      description: 'Contact clients or team',
      icon: <MessageSquare className="h-5 w-5" />,
      action: () => setActiveView('messages'),
      color: 'bg-orange-500 hover:bg-orange-600',
      requiresPermission: null
    },
    {
      id: 'analytics',
      title: 'Business Analytics',
      description: 'View performance metrics',
      icon: <BarChart3 className="h-5 w-5" />,
      action: () => setActiveView('analytics'),
      color: 'bg-indigo-500 hover:bg-indigo-600',
      requiresPermission: 'canViewReports'
    },
    {
      id: 'quotes',
      title: 'Manage Quotes',
      description: 'Review and create quotes',
      icon: <FileText className="h-5 w-5" />,
      action: () => setActiveView('quotes'),
      color: 'bg-teal-500 hover:bg-teal-600',
      requiresPermission: null
    }
  ];

  // Filter quick actions based on user permissions
  const quickActions = allQuickActions.filter(action => {
    if (!action.requiresPermission) return true;
    return permissions[action.requiresPermission as keyof typeof permissions];
  });

  // Base navigation items with permission requirements
  const allNavigationItems = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-5 w-5" />, count: null, requiresPermission: null },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="h-5 w-5" />, count: null, requiresPermission: 'canViewReports' },
    { id: 'business', label: 'Business', icon: <DollarSign className="h-5 w-5" />, count: null, requiresPermission: 'canViewFinancials' },
    { id: 'quotes', label: 'Quotes', icon: <FileText className="h-5 w-5" />, count: stats.pendingRequests, requiresPermission: null },
    { id: 'projects', label: 'Projects', icon: <FolderOpen className="h-5 w-5" />, count: stats.totalProjects, requiresPermission: null },
    { id: 'portfolio', label: 'Portfolio', icon: <Camera className="h-5 w-5" />, count: null, requiresPermission: null },
    { id: 'invoices', label: 'Invoices', icon: <CreditCard className="h-5 w-5" />, count: stats.totalInvoices, requiresPermission: 'canManageInvoices' },
    { id: 'requests', label: 'Requests', icon: <MessageSquare className="h-5 w-5" />, count: stats.pendingRequests, requiresPermission: null },
    { id: 'users', label: 'Users', icon: <Users className="h-5 w-5" />, count: stats.totalUsers, requiresPermission: 'canManageUsers' },
    { id: 'team', label: 'Team', icon: <Users className="h-5 w-5" />, count: null, requiresPermission: null },
    { id: 'files', label: 'Files', icon: <FolderOpen className="h-5 w-5" />, count: null, requiresPermission: null },
    { id: 'messages', label: 'Messages', icon: <MessageSquare className="h-5 w-5" />, count: stats.unreadMessages, requiresPermission: null },
    { id: 'workflows', label: 'Workflows', icon: <Workflow className="h-5 w-5" />, count: stats.activeWorkflows, requiresPermission: 'canManageWorkflows' },
    { id: 'erp', label: 'ERP', icon: <Activity className="h-5 w-5" />, count: null, requiresPermission: 'canAccessSystemSettings' },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" />, count: null, requiresPermission: 'canAccessSystemSettings' },
  ];

  // Filter navigation items based on user permissions
  const navigationItems = allNavigationItems.filter(item => {
    if (!item.requiresPermission) return true;
    // Temporarily show all items for debugging
    return true;
    // return permissions[item.requiresPermission as keyof typeof permissions];
  });

  const renderActiveView = () => {
    // Temporarily disable permission checks for debugging
    switch (activeView) {
      case 'analytics':
        return <AdminAnalytics />;
      case 'business':
        return renderAnalytics(); // Business intelligence view
      case 'quotes':
        return <AdminQuoteRequestsTab />;
      case 'projects':
        return <EnhancedProjectManagement />;
      case 'portfolio':
        return <AdminPortfolioTab onStatsUpdate={loadDashboardStats} />;
      case 'invoices':
        return <AdminInvoicesTab onStatsUpdate={loadDashboardStats} />;
      case 'requests':
        return <AdminServiceRequestsTab onStatsUpdate={loadDashboardStats} />;
      case 'users':
        return <AdminUsersTab onStatsUpdate={loadDashboardStats} />;
      case 'team':
        return <AdminTeamTab onStatsUpdate={loadDashboardStats} />;
      case 'files':
        return <AdminFileRepositoryTab onStatsUpdate={loadDashboardStats} />;
      case 'messages':
        return <AdminMessagingTab onStatsUpdate={loadDashboardStats} />;
      case 'workflows':
        return <AdminWorkflowTab />;
      case 'settings':
        return <AdminSettingsTab />;
      case 'erp':
        return (
          <ErrorBoundary
            onError={(error, errorInfo) => {
              console.error('🚨 AdminERPTab Error:', error);
              console.error('🚨 Component Stack:', errorInfo.componentStack);
            }}
          >
            <AdminERPTab />
          </ErrorBoundary>
        );
      default:
        return renderOverview();
    }
  };

  const renderAccessDenied = (featureName: string) => (
    <div className="flex flex-col items-center justify-center h-96 space-y-4">
      <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 p-3 rounded-full">
            <Settings className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-red-800 mb-2">Access Restricted</h2>
        <p className="text-red-600 mb-4">
          You don't have permission to access <strong>{featureName}</strong>.
        </p>
        <p className="text-sm text-red-500">
          Contact your system administrator to request access to this feature.
        </p>
        <div className="mt-4 text-xs text-red-400">
          Current Role: <span className="font-medium">{permissions.role || 'Unknown'}</span>
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.email?.split('@')[0]}!</h1>
        <p className="opacity-90">Here's what's happening with your business today.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{stats.monthlyGrowth}%</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold">{stats.totalProjects}</p>
                <p className="text-sm text-gray-500">In progress</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-sm text-gray-500">Registered</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Workflows</p>
                <p className="text-2xl font-bold">{stats.activeWorkflows}</p>
                <p className="text-sm text-gray-500">Active</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks you can perform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                onClick={action.action}
                className={`${action.color} text-white p-4 h-auto flex flex-col items-center space-y-2 hover:scale-105 transition-transform`}
              >
                {action.icon}
                <div className="text-center">
                  <p className="font-medium">{action.title}</p>
                  <p className="text-xs opacity-90">{action.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from your business</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { icon: <CheckCircle className="h-5 w-5 text-green-500" />, text: "New project created", time: "2 hours ago" },
              { icon: <Users className="h-5 w-5 text-blue-500" />, text: "User registered", time: "4 hours ago" },
              { icon: <CreditCard className="h-5 w-5 text-purple-500" />, text: "Invoice generated", time: "1 day ago" },
              { icon: <Workflow className="h-5 w-5 text-orange-500" />, text: "Workflow completed", time: "2 days ago" }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                {activity.icon}
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.text}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex pt-20">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
            <p className="text-sm text-gray-600">NexaCore Innovations</p>
          </div>
          
          {/* Search */}
          <div className="px-6 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-4">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as any)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-colors ${
                    activeView === item.id
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.count !== null && item.count > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {item.count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {loading || permissionsLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              renderActiveView()
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );

  function renderAnalytics() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Analytics</h2>
          <p className="text-gray-600">Performance insights and business intelligence</p>
        </div>

        {/* Revenue Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+{stats.monthlyGrowth}%</span>
                <span className="text-gray-600 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalProjects}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Activity className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-gray-600">Projects in progress</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Client Satisfaction</p>
                  <p className="text-3xl font-bold text-purple-600">98%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-500" />
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-purple-600 font-medium">Excellent</span>
                <span className="text-gray-600 ml-1">rating</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Team Efficiency</p>
                  <p className="text-3xl font-bold text-orange-600">92%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-orange-600 font-medium">High</span>
                <span className="text-gray-600 ml-1">productivity</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Monthly revenue over the past year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Revenue chart visualization</p>
                  <p className="text-sm text-gray-400">Integration with charting library needed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Distribution</CardTitle>
              <CardDescription>Projects by status and type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Project analytics visualization</p>
                  <p className="text-sm text-gray-400">Real-time project insights</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  function renderQuotes() {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quote Management</h2>
            <p className="text-gray-600">Manage client quotes and proposals</p>
          </div>
          <Button onClick={() => navigate('/project-manager-quote-creation')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Quote
          </Button>
        </div>

        {/* Quote Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Pending Quotes</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingRequests}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-3xl font-bold text-green-600">24</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">In Review</p>
                  <p className="text-3xl font-bold text-blue-600">8</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-3xl font-bold text-purple-600">78%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Quotes */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Quote Requests</CardTitle>
            <CardDescription>Latest quotes from potential clients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <h4 className="font-medium">Website Development Project</h4>
                  <p className="text-sm text-gray-600">John Smith • Enterprise Tier</p>
                  <p className="text-xs text-gray-400">2 hours ago</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">$25,000</p>
                  <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                </div>
                <Button variant="outline" size="sm" className="ml-4">
                  Review
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <h4 className="font-medium">Mobile App Development</h4>
                  <p className="text-sm text-gray-600">Sarah Johnson • Professional Tier</p>
                  <p className="text-xs text-gray-400">1 day ago</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">$15,000</p>
                  <Badge className="bg-blue-100 text-blue-800">In Review</Badge>
                </div>
                <Button variant="outline" size="sm" className="ml-4">
                  Review
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <h4 className="font-medium">E-commerce Platform</h4>
                  <p className="text-sm text-gray-600">Tech Corp • Enterprise Tier</p>
                  <p className="text-xs text-gray-400">3 days ago</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">$45,000</p>
                  <Badge className="bg-green-100 text-green-800">Approved</Badge>
                </div>
                <Button variant="outline" size="sm" className="ml-4">
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
};