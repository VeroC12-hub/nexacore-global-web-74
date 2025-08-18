import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, Users, FileText, Quote } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];

interface QuoteRequest {
  id: string;
  status: string;
  service_type: string;
  budget_estimate: number;
  created_at: string;
}

interface Quote {
  id: string;
  status: string;
  price: number;
  created_at: string;
}

interface Project {
  id: string;
  status: string;
  service_type: string;
  budget: number;
  created_at: string;
}

const AdminAnalytics = () => {
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch quote requests
      const { data: quoteRequestData, error: qrError } = await supabase
        .from('quote_requests')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch quotes
      const { data: quoteData, error: qError } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch projects
      const { data: projectData, error: pError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (qrError) throw qrError;
      if (qError) throw qError;
      if (pError) throw pError;

      setQuoteRequests(quoteRequestData || []);
      setQuotes(quoteData || []);
      setProjects(projectData || []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Quote funnel data
  const quoteFunnelData = [
    { 
      stage: 'Requests', 
      count: quoteRequests.length,
      color: '#0088FE'
    },
    { 
      stage: 'Quotes Sent', 
      count: quotes.filter(q => q.status === 'sent').length,
      color: '#00C49F'
    },
    { 
      stage: 'Approved', 
      count: quotes.filter(q => q.status === 'approved').length,
      color: '#FFBB28'
    },
    { 
      stage: 'Projects', 
      count: projects.length,
      color: '#FF8042'
    }
  ];

  // Revenue trends (last 6 months)
  const revenueData = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      const revenue = quotes
        .filter(quote => {
          const quoteDate = new Date(quote.created_at);
          return quoteDate.getMonth() === date.getMonth() && 
                 quoteDate.getFullYear() === date.getFullYear() &&
                 quote.status === 'approved';
        })
        .reduce((sum, quote) => sum + quote.price, 0);

      months.push({
        month: monthName,
        revenue: revenue
      });
    }
    
    return months;
  };

  // Project status distribution
  const projectStatusData = projects.reduce((acc, project) => {
    const status = project.status;
    const existing = acc.find(item => item.name === status);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: status, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Popular services
  const serviceData = quoteRequests.reduce((acc, request) => {
    const service = request.service_type;
    const existing = acc.find(item => item.name === service);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: service, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  if (loading) {
    return <div className="p-6">Loading analytics...</div>;
  }

  const totalRevenue = quotes
    .filter(q => q.status === 'approved')
    .reduce((sum, q) => sum + q.price, 0);

  const conversionRate = quoteRequests.length > 0 
    ? ((quotes.filter(q => q.status === 'approved').length / quoteRequests.length) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Quote className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quote Requests</p>
                <p className="text-2xl font-bold">{quoteRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quotes Sent</p>
                <p className="text-2xl font-bold">{quotes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">{projects.filter(p => p.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{conversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quote Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Quote Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={quoteFunnelData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Line type="monotone" dataKey="revenue" stroke="#00C49F" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Status */}
        <Card>
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Popular Services */}
        <Card>
          <CardHeader>
            <CardTitle>Most Requested Services</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={serviceData.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;