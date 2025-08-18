import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
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
  CreditCard
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServiceRequestModal from '@/components/ServiceRequestModal';
import VisaPaymentForm from '@/components/VisaPaymentForm';
import ClientSettings from '@/components/ClientSettings';
import { toast } from 'sonner';

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

const ClientPortal = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isServiceRequestModalOpen, setIsServiceRequestModalOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  useEffect(() => {
    // Check for payment status in URL
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      toast.success('Payment completed successfully!');
      // Reload data to reflect payment status
      loadDashboardData();
    } else if (paymentStatus === 'cancelled') {
      toast.error('Payment was cancelled.');
    }
  }, [searchParams]);

  const loadDashboardData = async () => {
    try {
      const [projectsRes, invoicesRes, requestsRes] = await Promise.all([
        supabase.from('projects').select('*').eq('client_id', user?.id),
        supabase.from('invoices').select('*').eq('client_id', user?.id),
        supabase.from('service_requests').select('*').eq('client_id', user?.id)
      ]);

      if (projectsRes.data) setProjects(projectsRes.data);
      if (invoicesRes.data) setInvoices(invoicesRes.data);
      if (requestsRes.data) setServiceRequests(requestsRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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
    // Reload data to reflect payment status
    loadDashboardData();
    setSelectedInvoiceForPayment(null);
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    // Placeholder for invoice download functionality
    toast.info('Invoice download feature coming soon!');
  };

  const handleViewMessages = (projectId: string) => {
    // Navigate to messages view for specific project
    toast.info('Project messaging feature coming soon!');
  };

  const handleViewFiles = (projectId: string) => {
    // Navigate to files view for specific project
    toast.info('Project files feature coming soon!');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'review': return 'bg-yellow-500';
      case 'planning': return 'bg-gray-500';
      case 'paid': return 'bg-green-500';
      case 'sent': return 'bg-blue-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-500';
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
            <p className="text-muted-foreground">Manage your projects and services</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsServiceRequestModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Project
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FolderOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                  <p className="text-2xl font-bold">{projects.filter(p => p.status !== 'completed').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Outstanding Balance</p>
                  <p className="text-2xl font-bold">
                    ${invoices.filter(i => i.status !== 'paid').reduce((sum, inv) => sum + inv.total_amount, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Open Requests</p>
                  <p className="text-2xl font-bold">{serviceRequests.filter(r => r.status !== 'completed').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Completed Projects</p>
                  <p className="text-2xl font-bold">{projects.filter(p => p.status === 'completed').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Projects</h2>
              <Button onClick={() => setIsServiceRequestModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Project Request
              </Button>
            </div>
            
            <div className="grid gap-6">
              {projects.map((project) => (
                <Card key={project.id}>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Service Type</p>
                        <p className="font-medium">{project.service_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Budget</p>
                        <p className="font-medium">${project.budget?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Estimated Completion</p>
                        <p className="font-medium">
                          {project.estimated_completion ? new Date(project.estimated_completion).toLocaleDateString() : 'TBD'}
                        </p>
                      </div>
                    </div>
                    
                    {project.budget && (
                      <div className="space-y-2">
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
                    
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => handleViewMessages(project.id)}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Messages
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleViewFiles(project.id)}>
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
              
              {projects.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Get started by requesting a new project or service
                    </p>
                    <Button onClick={() => setIsServiceRequestModalOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Request New Project
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-6">
            <h2 className="text-2xl font-bold">Invoices & Billing</h2>
            
            <div className="grid gap-4">
              {invoices.map((invoice) => (
                <Card key={invoice.id}>
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
                      <Button variant="outline" size="sm" onClick={() => handleDownloadInvoice(invoice.id)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      {invoice.status !== 'paid' && (
                        <Button size="sm" onClick={() => handlePayInvoice(invoice)} className="bg-blue-600 hover:bg-blue-700">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay with Visa
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {invoices.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No invoices yet</h3>
                    <p className="text-muted-foreground">
                      Your invoices will appear here once projects begin
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Service Requests</h2>
              <Button onClick={() => setIsServiceRequestModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </div>
            
            <div className="grid gap-4">
              {serviceRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium">{request.title}</h3>
                        <p className="text-muted-foreground">{request.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getPriorityColor(request.priority)}>
                          {request.priority}
                        </Badge>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Type: {request.request_type.replace('_', ' ')}</span>
                      <span>Created: {new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {serviceRequests.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No service requests</h3>
                    <p className="text-muted-foreground mb-4">
                      Need help or want to request changes to a project?
                    </p>
                    <Button onClick={() => setIsServiceRequestModalOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Request
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <h2 className="text-2xl font-bold">Project Messages</h2>
            
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                <p className="text-muted-foreground">
                  Messages about your projects will appear here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
      
      <ServiceRequestModal
        isOpen={isServiceRequestModalOpen}
        onClose={() => setIsServiceRequestModalOpen(false)}
        onSuccess={loadDashboardData}
      />
      
      {selectedInvoiceForPayment && (
        <VisaPaymentForm
          isOpen={!!selectedInvoiceForPayment}
          onClose={() => setSelectedInvoiceForPayment(null)}
          invoice={selectedInvoiceForPayment}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
      
      <ClientSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default ClientPortal;