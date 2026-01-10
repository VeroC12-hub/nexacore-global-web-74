import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  FolderOpen, 
  DollarSign, 
  MessageSquare, 
  FileText, 
  Plus,
  Calendar,
  Clock,
  User,
  Settings,
  CheckCircle,
  AlertCircle,
  Download,
  CreditCard,
  Bell,
  Search,
  BarChart3,
  TrendingUp,
  Users,
  ArrowRight,
  Star,
  Activity,
  Zap,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import ServiceRequestModal from '@/components/ServiceRequestModal';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VisaPaymentForm from '@/components/VisaPaymentForm';
import ClientSettings from '@/components/ClientSettings';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  budget: number;
  spent_amount: number;
  progress: number;
  created_at: string;
  deadline: string | null;
}

interface ClientStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalSpent: number;
  pendingInvoices: number;
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

export const ModernClientPortal: React.FC = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'overview' | 'services' | 'projects' | 'invoices' | 'messages' | 'files' | 'settings'>('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ClientStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalSpent: 0,
    pendingInvoices: 0,
    unreadMessages: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const loadClientData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Load projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Load invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', user.id);

      if (invoicesError) throw invoicesError;

      // Load messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('project_messages')
        .select('*')
        .eq('client_id', user.id);

      if (messagesError) throw messagesError;

      const processedProjects = projectsData?.map(project => ({
        ...project,
        progress: project.spent_amount && project.budget 
          ? Math.round((project.spent_amount / project.budget) * 100)
          : 0
      })) || [];

      const totalSpent = invoicesData?.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0) || 0;
      const pendingInvoices = invoicesData?.filter(invoice => invoice.status === 'pending').length || 0;

      setProjects(processedProjects);
      setStats({
        totalProjects: processedProjects.length,
        activeProjects: processedProjects.filter(p => p.status === 'active').length,
        completedProjects: processedProjects.filter(p => p.status === 'completed').length,
        totalSpent,
        pendingInvoices,
        unreadMessages: messagesData?.length || 0
      });

    } catch (error) {
      console.error('Error loading client data:', error);
      toast.error('Failed to load your dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadClientData();
  }, [loadClientData]);

  const quickActions: QuickAction[] = [
    {
      id: 'new-request',
      title: 'New Service Request',
      description: 'Request new services from our team',
      icon: <Plus className="h-5 w-5" />,
      action: () => setShowServiceModal(true),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'make-payment',
      title: 'Make Payment',
      description: 'Pay outstanding invoices',
      icon: <CreditCard className="h-5 w-5" />,
      action: () => setShowPaymentForm(true),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'view-projects',
      title: 'View Projects',
      description: 'Check project progress',
      icon: <FolderOpen className="h-5 w-5" />,
      action: () => setActiveView('projects'),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'contact-team',
      title: 'Contact Team',
      description: 'Send message to our team',
      icon: <MessageSquare className="h-5 w-5" />,
      action: () => setActiveView('messages'),
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-5 w-5" />, count: null },
    { id: 'services', label: 'Services', icon: <Star className="h-5 w-5" />, count: null },
    { id: 'projects', label: 'Projects', icon: <FolderOpen className="h-5 w-5" />, count: stats.activeProjects },
    { id: 'invoices', label: 'Invoices', icon: <CreditCard className="h-5 w-5" />, count: stats.pendingInvoices },
    { id: 'messages', label: 'Messages', icon: <MessageSquare className="h-5 w-5" />, count: stats.unreadMessages },
    { id: 'files', label: 'Files', icon: <FileText className="h-5 w-5" />, count: null },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" />, count: null },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'services':
        return renderServicesView();
      case 'projects':
        return renderProjectsView();
      case 'invoices':
        return renderInvoicesView();
      case 'messages':
        return renderMessagesView();
      case 'files':
        return renderFilesView();
      case 'settings':
        return <ClientSettings />;
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.email?.split('@')[0]}!</h1>
            <p className="opacity-90">Track your projects and manage your account with ease.</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-75">Total Spent</p>
            <p className="text-2xl font-bold">${stats.totalSpent.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500 cursor-pointer transform hover:scale-105 bg-gradient-to-br from-white to-green-50/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeProjects}</p>
                <div className="flex items-center mt-2 text-sm">
                  <Activity className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">In progress</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 cursor-pointer transform hover:scale-105 bg-gradient-to-br from-white to-blue-50/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-blue-600">{stats.completedProjects}</p>
                <div className="flex items-center mt-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-blue-600">Projects done</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500 cursor-pointer transform hover:scale-105 bg-gradient-to-br from-white to-orange-50/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Invoices</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pendingInvoices}</p>
                <div className="flex items-center mt-2 text-sm">
                  <Clock className="w-4 h-4 text-orange-500 mr-1" />
                  <span className="text-orange-600">Awaiting payment</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500 cursor-pointer transform hover:scale-105 bg-gradient-to-br from-white to-purple-50/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Messages</p>
                <p className="text-3xl font-bold text-purple-600">{stats.unreadMessages}</p>
                <div className="flex items-center mt-2 text-sm">
                  <Bell className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-purple-600">Team updates</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-white to-blue-50/20 border border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Quick Actions
          </CardTitle>
          <CardDescription>Get things done quickly with one click</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Card
                key={action.id}
                className="cursor-pointer group hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-0 bg-gradient-to-br from-white to-primary/5"
                onClick={action.action}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <div className="text-primary">
                      {action.icon}
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Projects */}
      <Card className="bg-gradient-to-r from-white to-purple-50/20 border border-border/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-primary" />
                Recent Projects
              </CardTitle>
              <CardDescription>Your latest project updates and progress</CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setActiveView('projects')}
              className="flex items-center space-x-2 border-primary/20 hover:bg-primary/5"
            >
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.slice(0, 3).map((project) => (
              <div key={project.id} className={`border-l-4 ${getPriorityColor(project.priority)} bg-gradient-to-r from-background/50 to-primary/5 p-4 rounded-lg hover:shadow-md hover:scale-[1.02] transition-all duration-200 border border-border/20`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{project.title}</h3>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="font-semibold">${project.budget?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProjectsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Projects</h2>
        <Button onClick={() => setShowServiceModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </div>
      
      <div className="grid gap-6">
        {projects.map((project) => (
          <Card key={project.id} className={`border-l-4 ${getPriorityColor(project.priority)} hover:shadow-lg transition-shadow`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{project.title}</CardTitle>
                <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
              </div>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Budget</p>
                  <p className="font-semibold text-lg">${project.budget?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Spent</p>
                  <p className="font-semibold text-lg">${project.spent_amount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Priority</p>
                  <Badge variant="outline" className="capitalize">{project.priority}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderInvoicesView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Invoices & Payments</h2>
        <Button onClick={() => setShowPaymentForm(true)} className="bg-green-600 hover:bg-green-700">
          <CreditCard className="mr-2 h-4 w-4" />
          Make Payment
        </Button>
      </div>
      <Card>
        <CardContent className="p-6 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Invoice Management</h3>
          <p className="text-gray-600 mb-4">View and manage your invoices and payments</p>
          <Button onClick={() => setShowPaymentForm(true)}>Access Payment Portal</Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderMessagesView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Messages & Communication</h2>
      <Card>
        <CardContent className="p-6 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Team Communication</h3>
          <p className="text-gray-600 mb-4">Stay in touch with your project team</p>
          <p className="text-sm text-gray-500">{stats.unreadMessages} unread messages</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderFilesView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Project Files</h2>
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">File Repository</h3>
          <p className="text-gray-600 mb-4">Access your project files and documents</p>
          <Button variant="outline">Browse Files</Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <Navbar />
      <div className="flex pt-20">
        {/* Elegant Sidebar */}
        <div className="w-72 bg-gradient-to-b from-white via-blue-50/30 to-purple-50/20 backdrop-blur-xl shadow-2xl border-r border-gradient-to-b from-blue-200/20 to-purple-200/20 min-h-screen relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -translate-y-16 translate-x-16 blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full translate-y-12 -translate-x-12 blur-xl"></div>
          
          {/* Header Section */}
          <div className="relative p-8 border-b border-gradient-to-r from-transparent via-border/20 to-transparent">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Client Portal</h2>
                <p className="text-sm text-muted-foreground font-medium">Premium Access</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-100/50">
              <p className="text-xs font-medium text-gray-700">Welcome back,</p>
              <p className="text-sm font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent capitalize">
                {user?.email?.split('@')[0]}
              </p>
              <div className="flex items-center mt-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Online Now
              </div>
            </div>
          </div>
          
          {/* Premium Search */}
          <div className="px-8 mt-6 mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/70 group-hover:text-primary transition-colors" />
                <Input
                  placeholder="Search everything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 bg-white/70 backdrop-blur-sm border-0 focus:ring-2 focus:ring-primary/20 rounded-xl h-12 shadow-sm group-hover:shadow-md transition-all"
                />
              </div>
            </div>
          </div>

          {/* Premium Navigation */}
          <nav className="px-6">
            <div className="space-y-2">
              {navigationItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as any)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  className={`w-full flex items-center justify-between px-5 py-4 text-left rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 group animate-fade-in-up ${
                    activeView === item.id
                      ? 'bg-gradient-to-r from-primary via-blue-500 to-purple-500 text-white shadow-lg shadow-primary/25 border border-white/20'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-white/60 hover:via-blue-50/60 hover:to-purple-50/60 hover:text-gray-900 hover:shadow-md backdrop-blur-sm border border-transparent hover:border-white/40'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                      activeView === item.id
                        ? 'bg-white/20 shadow-inner'
                        : 'bg-gradient-to-br from-blue-100/50 to-purple-100/50 group-hover:from-blue-100 group-hover:to-purple-100'
                    }`}>
                      {React.cloneElement(item.icon as React.ReactElement, {
                        className: `w-5 h-5 ${activeView === item.id ? 'text-white' : 'text-primary'}`
                      })}
                    </div>
                    <span className="font-semibold">{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.count !== null && item.count > 0 && (
                      <Badge 
                        variant={activeView === item.id ? "secondary" : "default"} 
                        className={`text-xs font-bold ${
                          activeView === item.id 
                            ? 'bg-white/20 text-white border-white/20' 
                            : 'bg-gradient-to-r from-primary to-purple-500 text-white shadow-sm'
                        }`}
                      >
                        {item.count}
                      </Badge>
                    )}
                    {activeView === item.id && (
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </nav>

          {/* Premium Status Panel */}
          <div className="absolute bottom-8 left-6 right-6">
            <div className="bg-gradient-to-r from-white/60 to-blue-50/60 backdrop-blur-sm rounded-xl p-4 border border-white/40 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-700">Account Status</p>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-xs font-bold text-green-700">Premium</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Active Projects</span>
                  <span className="font-bold text-primary">{stats.activeProjects}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Total Spent</span>
                  <span className="font-bold text-green-600">${stats.totalSpent.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30">
          <div className="p-8">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary shadow-lg"></div>
                  <div className="mt-6 text-center">
                    <div className="text-lg font-semibold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Loading your portal...</div>
                    <div className="text-sm text-muted-foreground mt-2">Please wait while we prepare your dashboard</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in">
                {renderActiveView()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showServiceModal && (
        <ServiceRequestModal 
          isOpen={showServiceModal} 
          onClose={() => setShowServiceModal(false)} 
        />
      )}
      
      {showPaymentForm && (
        <VisaPaymentForm 
          isOpen={showPaymentForm} 
          onClose={() => setShowPaymentForm(false)} 
        />
      )}
      <Footer />
    </div>
  );

  function renderServicesView() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Services</h2>
          <p className="text-gray-600">Explore our comprehensive range of digital solutions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Web Development',
              description: 'Custom websites and web applications built with modern technologies',
              icon: <Zap className="h-8 w-8" />,
              color: 'bg-blue-100 text-blue-700',
              features: ['Responsive Design', 'E-commerce Solutions', 'CMS Integration', 'SEO Optimization']
            },
            {
              title: 'Mobile Development', 
              description: 'Native and cross-platform mobile applications for iOS and Android',
              icon: <Star className="h-8 w-8" />,
              color: 'bg-green-100 text-green-700',
              features: ['Native Apps', 'Cross-Platform', 'UI/UX Design', 'App Store Optimization']
            },
            {
              title: 'Software Engineering',
              description: 'Custom software solutions and enterprise applications',
              icon: <Target className="h-8 w-8" />,
              color: 'bg-purple-100 text-purple-700',
              features: ['Enterprise Software', 'API Development', 'Database Design', 'System Integration']
            },
            {
              title: 'Digital Marketing',
              description: 'Comprehensive digital marketing strategies and campaigns',
              icon: <TrendingUp className="h-8 w-8" />,
              color: 'bg-orange-100 text-orange-700',
              features: ['SEO & SEM', 'Social Media Marketing', 'Content Strategy', 'Analytics']
            },
            {
              title: 'Cloud Solutions',
              description: 'Cloud infrastructure and migration services',
              icon: <Activity className="h-8 w-8" />,
              color: 'bg-indigo-100 text-indigo-700',
              features: ['Cloud Migration', 'DevOps', 'Infrastructure Management', 'Security']
            },
            {
              title: 'Consulting',
              description: 'Strategic technology consulting and digital transformation',
              icon: <Users className="h-8 w-8" />,
              color: 'bg-pink-100 text-pink-700',
              features: ['Digital Strategy', 'Technology Assessment', 'Process Optimization', 'Training']
            }
          ].map((service) => (
            <Card key={service.title} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className={`inline-flex p-3 rounded-lg ${service.color} mb-4`}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full"
                  onClick={() => setShowServiceModal(true)}
                >
                  Request Service
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
};