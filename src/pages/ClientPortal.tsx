// src/pages/ClientPortal.tsx - PRODUCTION-READY CLIENT PORTAL WITH REAL DATA
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  FolderOpen,
  MessageSquare,
  FileText,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  User,
  Settings,
  Bell,
  Search,
  Filter,
  Plus,
  Eye,
  MoreHorizontal,
  ChevronRight,
  Star,
  TrendingUp,
  BarChart3,
  Activity,
  Zap,
  Shield,
  Globe,
  Phone,
  Mail,
  MapPin,
  Upload,
  ExternalLink,
  LogOut,
  Home,
  CreditCard,
  RefreshCw,
  Send,
  Edit,
  Save,
  AlertTriangle,
  Info,
  Target,
  Award,
  Building2,
  Briefcase,
  Calculator,
  PieChart,
  LineChart,
  Percent,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Share2,
  Copy,
  HelpCircle,
  Users,
  Layers,
  Package,
  Smartphone,
  Tablet,
  Monitor,
  Database,
  Network
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  progress: number;
  start_date: string;
  end_date: string;
  budget: number;
  spent?: number;
  service_type: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  title: string;
  description: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  status: string;
  due_date: string;
  paid_date?: string;
  payment_method?: string;
  created_at: string;
  project_id?: string;
}

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  request_type: string;
  category: string;
  status: string;
  priority: string;
  budget_estimate: number;
  requested_completion: string;
  created_at: string;
  updated_at: string;
}

interface ClientStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalInvoiced: number;
  totalPaid: number;
  pendingPayments: number;
  overdueInvoices: number;
  serviceRequests: number;
  avgProjectValue: number;
  projectSuccessRate: number;
  paymentHistory: number;
  clientSince: string;
}

interface RecentActivity {
  id: string;
  type: 'project' | 'invoice' | 'payment' | 'service_request' | 'message';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
  amount?: number;
  created_at: string;
}

const ClientPortal: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Real Data States
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<ClientStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalInvoiced: 0,
    totalPaid: 0,
    pendingPayments: 0,
    overdueInvoices: 0,
    serviceRequests: 0,
    avgProjectValue: 0,
    projectSuccessRate: 0,
    paymentHistory: 0,
    clientSince: ''
  });

  // Support/Contact Form
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadClientData();
  }, [user, navigate]);

  const loadClientData = async () => {
    try {
      setLoading(true);
      
      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load all client data in parallel
      await Promise.all([
        loadProjects(),
        loadInvoices(),
        loadServiceRequests(),
        loadRecentActivity()
      ]);

    } catch (error) {
      console.error('Error loading client data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
      return data || [];
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  };

  const loadInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
      return data || [];
    } catch (error) {
      console.error('Error loading invoices:', error);
      return [];
    }
  };

  const loadServiceRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServiceRequests(data || []);
      return data || [];
    } catch (error) {
      console.error('Error loading service requests:', error);
      return [];
    }
  };

  const loadRecentActivity = async () => {
    try {
      const activities: RecentActivity[] = [];
      
      // Get recent projects
      const { data: recentProjects } = await supabase
        .from('projects')
        .select('id, title, status, created_at, updated_at')
        .eq('client_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5);

      // Get recent invoices
      const { data: recentInvoices } = await supabase
        .from('invoices')
        .select('id, invoice_number, amount, status, created_at')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent service requests
      const { data: recentRequests } = await supabase
        .from('service_requests')
        .select('id, title, status, created_at')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      // Add project activities
      recentProjects?.forEach(project => {
        activities.push({
          id: `project-${project.id}`,
          type: 'project',
          title: `Project ${project.status === 'completed' ? 'completed' : 'updated'}`,
          description: project.title,
          timestamp: getRelativeTime(project.updated_at),
          status: project.status === 'completed' ? 'success' : 'info',
          created_at: project.updated_at
        });
      });

      // Add invoice activities
      recentInvoices?.forEach(invoice => {
        activities.push({
          id: `invoice-${invoice.id}`,
          type: invoice.status === 'paid' ? 'payment' : 'invoice',
          title: invoice.status === 'paid' ? 'Payment processed' : 'New invoice',
          description: `Invoice ${invoice.invoice_number}`,
          timestamp: getRelativeTime(invoice.created_at),
          status: invoice.status === 'paid' ? 'success' : 'info',
          amount: invoice.amount,
          created_at: invoice.created_at
        });
      });

      // Add service request activities
      recentRequests?.forEach(request => {
        activities.push({
          id: `request-${request.id}`,
          type: 'service_request',
          title: 'Service request updated',
          description: request.title,
          timestamp: getRelativeTime(request.created_at),
          status: request.status === 'approved' ? 'success' : 'info',
          created_at: request.created_at
        });
      });

      // Sort by creation date and take most recent
      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRecentActivity(activities.slice(0, 8));

    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  };

  // Calculate real stats after data loads
  useEffect(() => {
    if (projects.length > 0 || invoices.length > 0 || serviceRequests.length > 0) {
      calculateClientStats();
    }
  }, [projects, invoices, serviceRequests, profile]);

  const calculateClientStats = () => {
    // Project statistics
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'in_progress').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    
    // Invoice statistics
    const totalInvoiced = invoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
    const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
    const pendingPayments = invoices.filter(i => i.status === 'sent').length;
    
    // Overdue invoices
    const now = new Date();
    const overdueInvoices = invoices.filter(i => 
      i.status === 'sent' && new Date(i.due_date) < now
    ).length;
    
    // Service requests
    const serviceRequestsCount = serviceRequests.length;
    
    // Calculated metrics
    const avgProjectValue = totalProjects > 0 ? totalInvoiced / totalProjects : 0;
    const projectSuccessRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;
    const paymentHistory = invoices.length > 0 ? (invoices.filter(i => i.status === 'paid').length / invoices.length) * 100 : 0;
    
    // Client since date
    const clientSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '';

    setStats({
      totalProjects,
      activeProjects,
      completedProjects,
      totalInvoiced,
      totalPaid,
      pendingPayments,
      overdueInvoices,
      serviceRequests: serviceRequestsCount,
      avgProjectValue,
      projectSuccessRate,
      paymentHistory,
      clientSince
    });
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadClientData();
    setRefreshing(false);
    toast.success('Data refreshed successfully');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleContactSubmit = async () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // In a real implementation, you would submit this to your support system
      // For now, we'll create a service request
      const { error } = await supabase
        .from('service_requests')
        .insert({
          client_id: user.id,
          title: contactForm.subject,
          description: contactForm.message,
          request_type: 'support',
          category: 'General Support',
          priority: contactForm.priority,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Support request submitted successfully');
      setShowContactForm(false);
      setContactForm({ subject: '', message: '', priority: 'medium' });
      loadServiceRequests(); // Refresh service requests
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error('Failed to submit support request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-500 text-white';
      case 'in_progress': return 'bg-blue-500 text-white';
      case 'on_hold': return 'bg-yellow-500 text-black';
      case 'planning': return 'bg-gray-500 text-white';
      case 'paid': return 'bg-green-500 text-white';
      case 'sent': return 'bg-blue-500 text-white';
      case 'overdue': return 'bg-red-500 text-white';
      case 'draft': return 'bg-gray-400 text-white';
      case 'approved': return 'bg-green-500 text-white';
      case 'pending': return 'bg-yellow-500 text-black';
      case 'rejected': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project': return <FolderOpen className="w-4 h-4" />;
      case 'payment': return <DollarSign className="w-4 h-4" />;
      case 'invoice': return <FileText className="w-4 h-4" />;
      case 'service_request': return <MessageSquare className="w-4 h-4" />;
      case 'message': return <Mail className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-500 bg-green-500/10';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10';
      case 'error': return 'text-red-500 bg-red-500/10';
      case 'info': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.service_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, {profile?.full_name || user?.email?.split('@')[0]}
              </h1>
              <p className="text-muted-foreground">
                Manage your projects and track your progress with NexaCore Innovations
              </p>
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <User className="w-4 h-4 mr-1" />
                Client since {stats.clientSince}
                <span className="mx-2">•</span>
                <Clock className="w-4 h-4 mr-1" />
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshData}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowContactForm(true)}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/book-consultation')}>
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Real Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-primary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalProjects}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <Activity className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-blue-500">{stats.activeProjects} active</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Invoiced</p>
                  <p className="text-3xl font-bold text-foreground">${stats.totalInvoiced.toLocaleString()}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-500">${stats.totalPaid.toLocaleString()} paid</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-3xl font-bold text-foreground">{stats.projectSuccessRate.toFixed(0)}%</p>
                  <div className="flex items-center mt-2 text-sm">
                    <Award className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-blue-500">{stats.completedProjects} completed</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Service Requests</p>
                  <p className="text-3xl font-bold text-foreground">{stats.serviceRequests}</p>
                  <div className="flex items-center mt-2 text-sm">
                    {stats.overdueInvoices > 0 ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                        <span className="text-red-500">{stats.overdueInvoices} overdue</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-500">All up to date</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Project Value</p>
                  <p className="text-2xl font-bold text-foreground">${stats.avgProjectValue.toLocaleString()}</p>
                </div>
                <Calculator className="w-8 h-8 text-purple-500" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Payment History</p>
                  <p className="text-2xl font-bold text-foreground">{stats.paymentHistory.toFixed(0)}%</p>
                </div>
                <CreditCard className="w-8 h-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Payments</p>
                  <p className="text-2xl font-bold text-foreground">{stats.pendingPayments}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="requests">Requests</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Projects */}
                <Card className="lg:col-span-2 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Recent Projects</h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('projects')}>
                      View All <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {projects.slice(0, 4).map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{project.title}</h4>
                            <Badge className={getStatusColor(project.status)}>
                              {project.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{project.service_type}</p>
                          {project.progress !== undefined && (
                            <div className="flex items-center gap-2">
                              <Progress value={project.progress} className="flex-1 h-2" />
                              <span className="text-sm text-muted-foreground">{project.progress}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {projects.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No projects yet</p>
                        <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/book-consultation')}>
                          Start Your First Project
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Recent Activity */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Recent Activity</h3>
                    <Button variant="ghost" size="sm" onClick={refreshData}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {recentActivity.slice(0, 6).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getActivityColor(activity.status)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.description}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                            {activity.amount && (
                              <span className="text-xs font-medium">${activity.amount.toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {recentActivity.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No recent activity</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Quick Stats & Insights */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Business Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">{stats.projectSuccessRate.toFixed(0)}%</p>
                    <p className="text-sm text-muted-foreground">Project Success Rate</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <DollarSign className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">${stats.avgProjectValue.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Average Project Value</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">{stats.paymentHistory.toFixed(0)}%</p>
                    <p className="text-sm text-muted-foreground">Payment Success Rate</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-orange-600">{stats.activeProjects}</p>
                    <p className="text-sm text-muted-foreground">Active Projects</p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects" className="space-y-6">
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="all">All Status</option>
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                      {project.priority && (
                        <span className={`text-xs font-medium ${getPriorityColor(project.priority)}`}>
                          {project.priority} priority
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                    
                    {project.progress !== undefined && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} />
                      </div>
                    )}
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Service Type:</span>
                        <span>{project.service_type}</span>
                      </div>
                      {project.budget && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Budget:</span>
                          <span>${project.budget.toLocaleString()}</span>
                        </div>
                      )}
                      {project.end_date && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Due:</span>
                          <span>{new Date(project.end_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
                
                {filteredProjects.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || filterStatus !== 'all' ? 'No projects match your filters' : 'No projects yet'}
                    </p>
                    <Button onClick={() => navigate('/book-consultation')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Start a New Project
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Invoices Tab */}
            <TabsContent value="invoices" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mr-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Paid</p>
                      <p className="text-lg font-semibold">
                        {invoices.filter(i => i.status === 'paid').length}
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mr-3">
                      <Clock className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-lg font-semibold">{stats.pendingPayments}</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center mr-3">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Overdue</p>
                      <p className="text-lg font-semibold">{stats.overdueInvoices}</p>
                    </div>
                  </div>
                </Card>
              </div>

              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">All Invoices</h3>
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h4 className="font-medium">{invoice.invoice_number}</h4>
                            <Badge className={getStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{invoice.title || invoice.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>Due: {new Date(invoice.due_date).toLocaleDateString()}</span>
                            {invoice.paid_date && (
                              <span>Paid: {new Date(invoice.paid_date).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">${invoice.amount.toLocaleString()}</p>
                          {invoice.tax_amount > 0 && (
                            <p className="text-sm text-muted-foreground">
                              +${invoice.tax_amount.toLocaleString()} tax
                            </p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" className="ml-4">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    
                    {invoices.length === 0 && (
                      <div className="text-center py-12">
                        <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No invoices yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Service Requests Tab */}
            <TabsContent value="requests" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Service Requests</h3>
                <Button onClick={() => navigate('/book-consultation')}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Request
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {serviceRequests.map((request) => (
                  <Card key={request.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      <span className={`text-xs font-medium ${getPriorityColor(request.priority)}`}>
                        {request.priority} priority
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2">{request.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{request.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <span>{request.category}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span>{request.request_type}</span>
                      </div>
                      {request.budget_estimate && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Budget:</span>
                          <span>${request.budget_estimate.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Submitted:</span>
                        <span>{new Date(request.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {serviceRequests.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No service requests yet</p>
                    <Button onClick={() => navigate('/book-consultation')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Submit Your First Request
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-6">Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <Input 
                      value={profile?.full_name || ''} 
                      placeholder="Enter your full name"
                      readOnly
                      className="bg-muted/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <Input 
                      value={user?.email || ''} 
                      readOnly
                      className="bg-muted/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <Input 
                      value={profile?.phone || ''} 
                      placeholder="Enter your phone number"
                      readOnly
                      className="bg-muted/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Company</label>
                    <Input 
                      value={profile?.company || ''} 
                      placeholder="Enter your company name"
                      readOnly
                      className="bg-muted/50"
                    />
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">Account Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Member Since</p>
                      <p className="font-medium">{stats.clientSince}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Projects</p>
                      <p className="font-medium">{stats.totalProjects}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Invoiced</p>
                      <p className="font-medium">${stats.totalInvoiced.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Success Rate</p>
                      <p className="font-medium">{stats.projectSuccessRate.toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <p className="text-sm text-muted-foreground">
                    To update your profile information, please contact our support team or use the contact form.
                  </p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Contact Support Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Contact Support</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowContactForm(false)}>
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <Input
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    placeholder="Brief description of your request"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    value={contactForm.priority}
                    onChange={(e) => setContactForm({...contactForm, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <Textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    placeholder="Describe your request in detail..."
                    rows={4}
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1" onClick={handleContactSubmit}>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Request
                  </Button>
                  <Button variant="outline" onClick={() => setShowContactForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ClientPortal;
