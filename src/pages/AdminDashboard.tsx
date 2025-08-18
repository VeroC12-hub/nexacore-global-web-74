import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, CreditCard, Settings, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { AdminProjectsTab } from '@/components/admin/AdminProjectsTab';
import { AdminInvoicesTab } from '@/components/admin/AdminInvoicesTab';
import { AdminServiceRequestsTab } from '@/components/admin/AdminServiceRequestsTab';
import { AdminUsersTab } from '@/components/admin/AdminUsersTab';
import { AdminSettingsTab } from '@/components/admin/AdminSettingsTab';
import { AdminTeamTab } from '@/components/admin/AdminTeamTab';
import { AdminFileRepositoryTab } from '@/components/admin/AdminFileRepositoryTab';
import { AdminMessagingTab } from '@/components/admin/AdminMessagingTab';
import AdminQuoteRequestsTab from '@/components/admin/AdminQuoteRequestsTab';
import AdminAnalytics from '@/components/analytics/AdminAnalytics';
import { CreateInvoiceModal } from '@/components/admin/CreateInvoiceModal';
import { toast } from 'sonner';

interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  totalInvoices: number;
  pendingRequests: number;
  totalRevenue: number;
  pendingPayments: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProjects: 0,
    totalInvoices: 0,
    pendingRequests: 0,
    totalRevenue: 0,
    pendingPayments: 0
  });
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      loadDashboardStats();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      setIsAdmin(profile?.role === 'admin');
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      // Get total users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total projects
      const { count: projectsCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

      // Get total invoices
      const { count: invoicesCount } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true });

      // Get pending service requests
      const { count: pendingRequestsCount } = await supabase
        .from('service_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get total revenue and pending payments
      const { data: invoiceData } = await supabase
        .from('invoices')
        .select('amount, status');

      const totalRevenue = invoiceData
        ?.filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;

      const pendingPayments = invoiceData
        ?.filter(inv => inv.status === 'pending')
        .reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;

      setStats({
        totalUsers: usersCount || 0,
        totalProjects: projectsCount || 0,
        totalInvoices: invoicesCount || 0,
        pendingRequests: pendingRequestsCount || 0,
        totalRevenue,
        pendingPayments
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage all aspects of your business</p>
          </div>
          <Button onClick={() => setIsCreateInvoiceOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Badge variant="secondary">{stats.pendingRequests}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRequests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.pendingPayments.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInvoices}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="mt-6">
            <AdminAnalytics />
          </TabsContent>

          <TabsContent value="quotes" className="mt-6">
            <AdminQuoteRequestsTab />
          </TabsContent>

          <TabsContent value="projects" className="mt-6">
            <AdminProjectsTab onStatsUpdate={loadDashboardStats} />
          </TabsContent>

          <TabsContent value="invoices" className="mt-6">
            <AdminInvoicesTab onStatsUpdate={loadDashboardStats} />
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            <AdminServiceRequestsTab onStatsUpdate={loadDashboardStats} />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <AdminUsersTab onStatsUpdate={loadDashboardStats} />
          </TabsContent>

          <TabsContent value="team" className="mt-6">
            <AdminTeamTab onStatsUpdate={loadDashboardStats} />
          </TabsContent>

          <TabsContent value="files" className="mt-6">
            <AdminFileRepositoryTab onStatsUpdate={loadDashboardStats} />
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            <AdminMessagingTab onStatsUpdate={loadDashboardStats} />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <AdminSettingsTab />
          </TabsContent>
        </Tabs>

        <CreateInvoiceModal
          isOpen={isCreateInvoiceOpen}
          onClose={() => setIsCreateInvoiceOpen(false)}
          onSuccess={() => {
            loadDashboardStats();
            toast.success('Invoice created successfully');
          }}
        />
      </div>
    </div>
  );
}