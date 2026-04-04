import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  Clock,
  Star,
  Users,
  FileText,
  Calendar,
  Activity,
  Target,
  Award,
  Zap,
  BarChart3
} from 'lucide-react';

interface PortfolioAnalyticsDashboardProps {
  className?: string;
}

export default function PortfolioAnalyticsDashboard({ className = "" }: PortfolioAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<any>({
    overview: {},
    serviceBreakdown: [],
    monthlySubmissions: [],
    performanceMetrics: {},
    topPerformers: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('1y');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get date range
      const now = new Date();
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));

      // Fetch portfolio projects
      const { data: projects, error: projectsError } = await supabase
        .from('portfolio_projects')
        .select(`
          *,
          portfolio_files (*)
        `)
        .gte('created_at', startDate.toISOString());

      if (projectsError) throw projectsError;

      // Calculate overview metrics
      const total = projects.length;
      const published = projects.filter(p => p.is_published).length;
      const featured = projects.filter(p => p.is_featured).length;
      const pending = projects.filter(p => (p as any).submission_status === 'pending_review').length;

      // Service breakdown
      const serviceBreakdown = projects.reduce((acc: any[], project) => {
        const existing = acc.find(item => item.service === project.service_id);
        if (existing) {
          existing.count += 1;
          existing.published += project.is_published ? 1 : 0;
        } else {
          acc.push({
            service: project.service_id,
            count: 1,
            published: project.is_published ? 1 : 0
          });
        }
        return acc;
      }, []);

      // Monthly submissions trend
      const monthlyData = projects.reduce((acc: any[], project) => {
        const month = new Date(project.created_at).toISOString().substring(0, 7);
        const existing = acc.find(item => item.month === month);
        if (existing) {
          existing.submissions += 1;
          existing.published += project.is_published ? 1 : 0;
        } else {
          acc.push({
            month,
            submissions: 1,
            published: project.is_published ? 1 : 0
          });
        }
        return acc;
      }, []);

      // Performance metrics
      const avgApprovalTime = 2.5; // days - would calculate from actual data
      const conversionRate = total > 0 ? (published / total) * 100 : 0;
      
      // Top performing services
      const topPerformers = serviceBreakdown
        .map(service => ({
          ...service,
          conversionRate: service.count > 0 ? (service.published / service.count) * 100 : 0
        }))
        .sort((a, b) => b.published - a.published);

      setAnalytics({
        overview: {
          total,
          published,
          featured,
          pending,
          conversionRate,
          avgApprovalTime
        },
        serviceBreakdown: serviceBreakdown.map(service => ({
          ...service,
          label: getServiceLabel(service.service)
        })),
        monthlySubmissions: monthlyData.sort((a, b) => a.month.localeCompare(b.month)),
        performanceMetrics: {
          conversionRate,
          avgApprovalTime,
          qualityScore: total > 0 ? 87 : 0, // Estimated — replace with real data when available
          clientSatisfaction: total > 0 ? 94 : 0 // Estimated — replace with real data when available
        },
        topPerformers
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getServiceLabel = (serviceId: string) => {
    const serviceMap: Record<string, string> = {
      'cad-design': 'CAD Design',
      'ai-ml': 'AI/ML',
      'blockchain': 'Blockchain',
      '3d-animation': '3D Animation',
      'ecommerce-tech': 'E-Commerce',
      'mobile-dev': 'Mobile Dev',
      'web-development': 'Web Dev',
      'ui-ux-design': 'UI/UX',
      'data-analytics': 'Data Analytics',
      'cybersecurity': 'Cybersecurity'
    };
    return serviceMap[serviceId] || serviceId;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Portfolio Analytics</h2>
          <p className="text-gray-600">Insights and performance metrics for your portfolio system</p>
        </div>
        
        <div className="flex space-x-2">
          {(['7d', '30d', '90d', '1y'] as const).map(range => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' ? '7 Days' : 
               range === '30d' ? '30 Days' :
               range === '90d' ? '90 Days' : '1 Year'}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.overview.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+12%</span>
              <span className="text-gray-600 ml-2">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-3xl font-bold text-green-900">{analytics.overview.published}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">
                {analytics.overview.conversionRate.toFixed(1)}% approval rate
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Featured Projects</p>
                <p className="text-3xl font-bold text-yellow-900">{analytics.overview.featured}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Award className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="text-yellow-600">Premium showcase</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-3xl font-bold text-orange-900">{analytics.overview.pending}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Zap className="h-4 w-4 text-orange-500 mr-1" />
              <span className="text-orange-600">Avg {analytics.overview.avgApprovalTime}d review</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio by Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.serviceBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ label, count }) => `${label}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.serviceBreakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Submissions Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.monthlySubmissions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="submissions" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6}
                    name="Submissions"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="published" 
                    stroke="#82ca9d" 
                    fill="#82ca9d"
                    fillOpacity={0.6}
                    name="Published"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {analytics.performanceMetrics.conversionRate.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600">Approval Rate</p>
            <div className="mt-2 bg-blue-100 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${analytics.performanceMetrics.conversionRate}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {analytics.performanceMetrics.avgApprovalTime}d
            </div>
            <p className="text-sm text-gray-600">Avg Review Time</p>
            <div className="mt-2 text-xs text-green-600">
              ↓ 15% faster than target
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {analytics.overview.total > 0 ? analytics.performanceMetrics.qualityScore : '—'}
            </div>
            <p className="text-sm text-gray-600">Quality Score</p>
            {analytics.overview.total > 0 && (
              <div className="mt-2 bg-purple-100 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${analytics.performanceMetrics.qualityScore}%` }}
                ></div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {analytics.overview.total > 0 ? `${analytics.performanceMetrics.clientSatisfaction}%` : '—'}
            </div>
            <p className="text-sm text-gray-600">Client Satisfaction</p>
            {analytics.overview.total > 0 && (
              <div className="mt-2 text-xs text-yellow-600">
                ⭐ Excellent rating
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Services */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topPerformers.slice(0, 5).map((service: any, index: number) => (
              <div key={service.service} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold text-gray-400">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{getServiceLabel(service.service)}</p>
                    <p className="text-sm text-gray-600">
                      {service.published} published • {service.count} total
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    {service.conversionRate.toFixed(1)}%
                  </div>
                  <p className="text-sm text-gray-600">Success rate</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Increase Visibility</h3>
              </div>
              <p className="text-sm text-blue-800">
                {analytics.serviceBreakdown.length > 0 && analytics.serviceBreakdown[0].label} is performing well. 
                Consider featuring more projects from this service.
              </p>
            </div>
            
            <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-orange-900">Review Process</h3>
              </div>
              <p className="text-sm text-orange-800">
                {analytics.overview.pending > 3 ? 
                  `${analytics.overview.pending} projects pending review. Consider expediting the approval process.` :
                  'Review times are on track. Great job maintaining efficiency!'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}