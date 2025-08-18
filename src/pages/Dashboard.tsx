import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
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
  LogOut,
  CheckCircle,
  AlertCircle,
  Download,
  ExternalLink,
  CreditCard,
  Bell,
  Filter,
  Search,
  Upload,
  BarChart3,
  TrendingUp,
  Users
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServiceRequestModal from '@/components/ServiceRequestModal';
import VisaPaymentForm from '@/components/VisaPaymentForm';
import ClientSettings from '@/components/ClientSettings';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  budget: number;
  spent_amount: number;
  service_type: string;
  created_at: string;
  estimated_completion: string;
  start_date: string;
  end_date: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  title: string;
  amount: number;
  total_amount: number;
  status: string;
  due_date: string;
  created_at: string;
}

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  request_type: string;
  status: string;
  priority: string;
  created_at: string;
}

interface ProjectFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
  project_id: string;
  category: string;
}

interface DashboardStats {
  activeProjects: number;
  completedProjects: number;
  totalSpent: number;
  pendingInvoices: number;
  unreadMessages: number;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    activeProjects: 0,
    completedProjects: 0,
    totalSpent: 0,
    pendingInvoices: 0,
    unreadMessages: 0
  });
  const [loading, setLoading] = useState(true);
  const [isServiceRequestModalOpen, setIsServiceRequestModalOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const [projectsRes, invoicesRes, requestsRes, filesRes] = await Promise.all([
        supabase.from('projects').select('*').eq('client_id', user?.id),
        supabase.from('invoices').select('*').eq('client_id', user?.id),
        supabase.from('service_requests').select('*').eq('client_id', user?.id),
        supabase.from('project_files').select('*').in('project_id', 
          projects.map(p => p.id)
        )
      ]);

      if (projectsRes.data) setProjects(projectsRes.data);
      if (invoicesRes.data) setInvoices(invoicesRes.data);
      if (requestsRes.data) setServiceRequests(requestsRes.data);
      if (filesRes.data) setProjectFiles(filesRes.data);

      // Calculate stats
      if (projectsRes.data && invoicesRes.data) {
        const activeProjects = projectsRes.data.filter(p => p.status !== 'completed').length;
        const completedProjects = projectsRes.data.filter(p => p.status === 'completed').length;
        const totalSpent = projectsRes.data.reduce((sum, p) => sum + (p.spent_amount || 0), 0);
        const pendingInvoices = invoicesRes.data.filter(i => i.status !== 'paid').length;
        
        setStats({
          activeProjects,
          completedProjects,
          totalSpent,
          pendingInvoices,
          unreadMessages: 3 // Placeholder
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handlePayInvoice = (invoice: Invoice) => {
    setSelectedInvoiceForPayment(invoice);
  };

  const handlePaymentComplete = () => {
    loadDashboardData();
    setSelectedInvoiceForPayment(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-500 text-white';
      case 'in_progress': return 'bg-blue-500 text-white';
      case 'review': return 'bg-yellow-500 text-white';
      case 'planning': return 'bg-gray-500 text-white';
      case 'paid': return 'bg-green-500 text-white';
      case 'sent': return 'bg-blue-500 text-white';
      case 'overdue': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesService = serviceFilter === 'all' || project.service_type === serviceFilter;
    
    return matchesSearch && matchesStatus && matchesService;
  });

  const serviceTypes = [...new Set(projects.map(p => p.service_type))];

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user.user_metadata?.full_name || user.email}</h1>
            <p className="text-muted-foreground">Comprehensive project and service management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Active Projects</p>
                  <p className="text-3xl font-bold">{stats.activeProjects}</p>
                </div>
                <FolderOpen className="h-8 w-8 text-blue-200" />
              </div>
              <div className="mt-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm text-blue-100">+12% from last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Completed</p>
                  <p className="text-3xl font-bold">{stats.completedProjects}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-200" />
              </div>
              <div className="mt-2 flex items-center">
                <BarChart3 className="h-4 w-4 mr-1" />
                <span className="text-sm text-green-100">Success rate: 98%</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Total Invested</p>
                  <p className="text-3xl font-bold">${stats.totalSpent.toFixed(0)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-200" />
              </div>
              <div className="mt-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm text-purple-100">ROI: +45%</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Pending Bills</p>
                  <p className="text-3xl font-bold">{stats.pendingInvoices}</p>
                </div>
                <FileText className="h-8 w-8 text-orange-200" />
              </div>
              <div className="mt-2 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-sm text-orange-100">2 due this week</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100">Messages</p>
                  <p className="text-3xl font-bold">{stats.unreadMessages}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-teal-200" />
              </div>
              <div className="mt-2 flex items-center">
                <Bell className="h-4 w-4 mr-1" />
                <span className="text-sm text-teal-100">3 unread</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="home" className="space-y-6">
          <TabsList className="grid grid-cols-7 w-full">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="services">My Services</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="settings">Account</TabsTrigger>
          </TabsList>

          {/* Dashboard Home */}
          <TabsContent value="home" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Project "Website Redesign" completed</span>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">New file uploaded to "Mobile App"</span>
                    <span className="text-xs text-muted-foreground">1 day ago</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Invoice #INV-001 payment pending</span>
                    <span className="text-xs text-muted-foreground">2 days ago</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" onClick={() => navigate('/get-started')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Request New Service
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Files
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projects
                    .filter(p => p.estimated_completion && new Date(p.estimated_completion) > new Date())
                    .slice(0, 3)
                    .map(project => (
                    <div key={project.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{project.title}</p>
                        <p className="text-sm text-muted-foreground">{project.service_type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {new Date(project.estimated_completion).toLocaleDateString()}
                        </p>
                        <Badge variant={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Services */}
          <TabsContent value="services" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Services</h2>
              <Button onClick={() => navigate('/get-started')}>
                <Plus className="w-4 h-4 mr-2" />
                Request New Service
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {serviceTypes.map(serviceType => {
                const serviceProjects = projects.filter(p => p.service_type === serviceType);
                const activeCount = serviceProjects.filter(p => p.status !== 'completed').length;
                const completedCount = serviceProjects.filter(p => p.status === 'completed').length;
                
                return (
                  <Card key={serviceType}>
                    <CardHeader>
                      <CardTitle className="text-lg">{serviceType}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Active Projects</span>
                          <span className="font-medium">{activeCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Completed</span>
                          <span className="font-medium">{completedCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Investment</span>
                          <span className="font-medium">
                            ${serviceProjects.reduce((sum, p) => sum + (p.budget || 0), 0).toFixed(0)}
                          </span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Enhanced Projects */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Project Management</h2>
              <Button onClick={() => navigate('/get-started')}>
                <Plus className="w-4 h-4 mr-2" />
                New Project Request
              </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {serviceTypes.map(service => (
                    <SelectItem key={service} value={service}>{service}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-6">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{project.title}</CardTitle>
                        <p className="text-muted-foreground mt-1">{project.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Service Type</p>
                        <p className="font-medium">{project.service_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Budget</p>
                        <p className="font-medium">${project.budget?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Start Date</p>
                        <p className="font-medium">
                          {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'TBD'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Estimated Completion</p>
                        <p className="font-medium">
                          {project.estimated_completion ? new Date(project.estimated_completion).toLocaleDateString() : 'TBD'}
                        </p>
                      </div>
                    </div>
                    
                    {project.budget && (
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span>Budget Used</span>
                          <span>${project.spent_amount?.toFixed(2)} / ${project.budget.toFixed(2)}</span>
                        </div>
                        <Progress 
                          value={((project.spent_amount || 0) / project.budget) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        Timeline
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Messages
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        Files
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Files & Deliverables */}
          <TabsContent value="files" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Files & Deliverables</h2>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </div>

            <div className="grid gap-6">
              {projects.map(project => {
                const projectFilesList = projectFiles.filter(f => f.project_id === project.id);
                
                return (
                  <Card key={project.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <p className="text-muted-foreground">{projectFilesList.length} files</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {projectFilesList.slice(0, 3).map(file => (
                          <div key={file.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-4 h-4" />
                              <span className="text-sm">{file.file_name}</span>
                              <Badge variant="outline">{file.category}</Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground">
                                {(file.file_size / 1024 / 1024).toFixed(1)} MB
                              </span>
                              <Button size="sm" variant="ghost">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {projectFilesList.length > 3 && (
                          <Button variant="outline" size="sm" className="w-full">
                            View all {projectFilesList.length} files
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Enhanced Invoices */}
          <TabsContent value="invoices" className="space-y-6">
            <h2 className="text-2xl font-bold">Invoices & Payments</h2>
            
            <div className="grid gap-4">
              {invoices.map((invoice) => (
                <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium">{invoice.title}</h3>
                        <p className="text-muted-foreground">Invoice #{invoice.invoice_number}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Created: {new Date(invoice.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">${invoice.total_amount.toFixed(2)}</p>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                        {invoice.due_date && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Due: {new Date(invoice.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                      {invoice.status !== 'paid' && (
                        <Button size="sm" onClick={() => handlePayInvoice(invoice)} className="bg-blue-600 hover:bg-blue-700">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Messages & Support */}
          <TabsContent value="messages" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Messages & Support</h2>
              <Button onClick={() => setIsServiceRequestModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Support Request
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Project Conversations */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Conversations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {projects.slice(0, 5).map(project => (
                      <div key={project.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{project.title}</p>
                          <p className="text-sm text-muted-foreground">Last message 2 hours ago</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">3</Badge>
                          <Button size="sm" variant="ghost">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Support Tickets */}
              <Card>
                <CardHeader>
                  <CardTitle>Support Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {serviceRequests.slice(0, 5).map(request => (
                      <div key={request.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{request.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                          <Button size="sm" variant="ghost">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold">Account Settings</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <Input value={user.user_metadata?.full_name || ''} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input value={user.email || ''} disabled />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Company</label>
                    <Input placeholder="Your company name" />
                  </div>
                  <Button>Update Profile</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Time Zone</label>
                    <Select defaultValue="utc">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="est">Eastern Time</SelectItem>
                        <SelectItem value="pst">Pacific Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Language</label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button>Save Preferences</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <ServiceRequestModal
          isOpen={isServiceRequestModalOpen}
          onClose={() => setIsServiceRequestModalOpen(false)}
          onSuccess={() => {
            loadDashboardData();
            setIsServiceRequestModalOpen(false);
            toast.success('Service request submitted successfully');
          }}
        />

        {selectedInvoiceForPayment && (
          <VisaPaymentForm
            invoice={selectedInvoiceForPayment}
            onClose={() => setSelectedInvoiceForPayment(null)}
          />
        )}

        <ClientSettings
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;