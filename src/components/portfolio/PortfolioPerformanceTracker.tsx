import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Eye,
  Heart,
  Share2,
  Download,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Award,
  Users,
  FileText,
  Activity,
  Zap,
  Calendar,
  Star,
  ThumbsUp,
  MessageCircle,
  Globe,
  MousePointer,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw
} from 'lucide-react';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  target?: number;
  unit: string;
  icon: React.ComponentType<any>;
  description: string;
}

interface ProjectPerformance {
  id: string;
  title: string;
  views: number;
  likes: number;
  shares: number;
  downloads: number;
  engagement: number;
  conversionRate: number;
  lastUpdated: string;
}

interface PortfolioPerformanceTrackerProps {
  className?: string;
}

export default function PortfolioPerformanceTracker({ 
  className = "" 
}: PortfolioPerformanceTrackerProps) {
  const [performanceData, setPerformanceData] = useState({
    overview: [] as PerformanceMetric[],
    projects: [] as ProjectPerformance[],
    timeSeriesData: [] as any[],
    engagementData: [] as any[],
    trafficSources: [] as any[],
    deviceBreakdown: [] as any[]
  });
  
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('30d');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadPerformanceData();
    
    // Auto-refresh every 5 minutes if enabled
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadPerformanceData, 5 * 60 * 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeRange, autoRefresh]);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      
      // Simulate API call - in real implementation, this would fetch from analytics service
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockOverviewMetrics: PerformanceMetric[] = [
        {
          id: 'total_views',
          name: 'Total Views',
          value: 24567,
          change: 12.5,
          trend: 'up',
          target: 30000,
          unit: '',
          icon: Eye,
          description: 'Total portfolio page views across all projects'
        },
        {
          id: 'engagement_rate',
          name: 'Engagement Rate',
          value: 8.3,
          change: 2.1,
          trend: 'up',
          target: 10,
          unit: '%',
          icon: Heart,
          description: 'Percentage of viewers who interact with portfolio content'
        },
        {
          id: 'conversion_rate',
          name: 'Conversion Rate',
          value: 3.7,
          change: -0.5,
          trend: 'down',
          target: 5,
          unit: '%',
          icon: Target,
          description: 'Visitors who contact us after viewing portfolio'
        },
        {
          id: 'avg_session_time',
          name: 'Avg Session Time',
          value: 4.2,
          change: 0.8,
          trend: 'up',
          unit: 'min',
          icon: Clock,
          description: 'Average time spent viewing portfolio content'
        },
        {
          id: 'shares',
          name: 'Total Shares',
          value: 892,
          change: 15.3,
          trend: 'up',
          unit: '',
          icon: Share2,
          description: 'Number of times portfolio projects were shared'
        },
        {
          id: 'downloads',
          name: 'File Downloads',
          value: 1456,
          change: 8.7,
          trend: 'up',
          unit: '',
          icon: Download,
          description: 'Portfolio files and documents downloaded'
        }
      ];

      const mockProjectPerformance: ProjectPerformance[] = [
        {
          id: '1',
          title: 'NexaCore E-Commerce Platform',
          views: 5432,
          likes: 234,
          shares: 67,
          downloads: 123,
          engagement: 9.2,
          conversionRate: 4.8,
          lastUpdated: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          title: 'Smart City IoT Dashboard',
          views: 3456,
          likes: 189,
          shares: 45,
          downloads: 87,
          engagement: 7.8,
          conversionRate: 3.2,
          lastUpdated: '2024-01-14T15:45:00Z'
        },
        {
          id: '3',
          title: 'AgriTech Mobile Solution',
          views: 2345,
          likes: 156,
          shares: 34,
          downloads: 56,
          engagement: 6.9,
          conversionRate: 2.9,
          lastUpdated: '2024-01-13T09:20:00Z'
        }
      ];

      const mockTimeSeriesData = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        views: Math.floor(Math.random() * 1000 + 500),
        engagement: Math.floor(Math.random() * 100 + 50),
        conversions: Math.floor(Math.random() * 50 + 10),
        shares: Math.floor(Math.random() * 30 + 10)
      }));

      const mockEngagementData = [
        { name: 'Views', value: 24567, color: '#3B82F6' },
        { name: 'Likes', value: 2456, color: '#EF4444' },
        { name: 'Shares', value: 892, color: '#10B981' },
        { name: 'Downloads', value: 1456, color: '#F59E0B' },
        { name: 'Comments', value: 456, color: '#8B5CF6' }
      ];

      const mockTrafficSources = [
        { name: 'Direct', value: 45.2, visitors: 11089 },
        { name: 'Search Engines', value: 28.7, visitors: 7032 },
        { name: 'Social Media', value: 15.8, visitors: 3873 },
        { name: 'Referral Sites', value: 6.9, visitors: 1692 },
        { name: 'Email', value: 3.4, visitors: 834 }
      ];

      const mockDeviceBreakdown = [
        { name: 'Desktop', value: 52.3, visitors: 12810 },
        { name: 'Mobile', value: 38.9, visitors: 9532 },
        { name: 'Tablet', value: 8.8, visitors: 2157 }
      ];

      setPerformanceData({
        overview: mockOverviewMetrics,
        projects: mockProjectPerformance,
        timeSeriesData: mockTimeSeriesData,
        engagementData: mockEngagementData,
        trafficSources: mockTrafficSources,
        deviceBreakdown: mockDeviceBreakdown
      });

    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number, unit: string = '') => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M${unit}`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K${unit}`;
    }
    return `${num}${unit}`;
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (trend === 'down') {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Activity className="h-4 w-4 text-gray-400" />;
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Portfolio Performance</h2>
          <p className="text-gray-600">Real-time analytics and engagement metrics</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white border rounded-lg p-1">
            {(['24h', '7d', '30d', '90d'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="px-3"
              >
                {range}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'text-green-600' : 'text-gray-600'}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Live' : 'Manual'}
          </Button>
          
          <Button variant="outline" size="sm" onClick={loadPerformanceData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {performanceData.overview.map((metric) => {
          const IconComponent = metric.icon;
          const progressValue = metric.target ? (metric.value / metric.target) * 100 : 0;
          
          return (
            <Card key={metric.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <IconComponent className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(metric.trend, metric.change)}
                    <span className={`text-sm font-medium ${
                      metric.trend === 'up' ? 'text-green-600' : 
                      metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                </div>
                
                <div className="mb-2">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {formatNumber(metric.value, metric.unit)}
                  </h3>
                  <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                </div>
                
                {metric.target && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Progress to Target</span>
                      <span>{formatNumber(metric.target, metric.unit)}</span>
                    </div>
                    <Progress value={Math.min(progressValue, 100)} className="h-2" />
                  </div>
                )}
                
                <p className="text-xs text-gray-500">{metric.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Performance Trends ({timeRange})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Views"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="engagement" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Engagement"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="conversions" 
                    stroke="#F59E0B" 
                    strokeWidth={2}
                    name="Conversions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChartIcon className="h-5 w-5 mr-2" />
              Engagement Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={performanceData.engagementData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${formatNumber(value)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {performanceData.engagementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatNumber(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Top Performing Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.projects.map((project, index) => (
              <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold text-gray-400">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{project.title}</h3>
                    <p className="text-sm text-gray-600">
                      Last updated: {new Date(project.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center text-blue-600 mb-1">
                      <Eye className="h-4 w-4 mr-1" />
                      <span className="font-semibold">{formatNumber(project.views)}</span>
                    </div>
                    <div className="text-xs text-gray-600">Views</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-center text-red-600 mb-1">
                      <Heart className="h-4 w-4 mr-1" />
                      <span className="font-semibold">{project.likes}</span>
                    </div>
                    <div className="text-xs text-gray-600">Likes</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-center text-green-600 mb-1">
                      <Share2 className="h-4 w-4 mr-1" />
                      <span className="font-semibold">{project.shares}</span>
                    </div>
                    <div className="text-xs text-gray-600">Shares</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-center text-purple-600 mb-1">
                      <Target className="h-4 w-4 mr-1" />
                      <span className="font-semibold">{project.conversionRate}%</span>
                    </div>
                    <div className="text-xs text-gray-600">Conversion</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Traffic Sources & Device Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Traffic Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceData.trafficSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-gray-900">
                      {source.name}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {formatNumber(source.visitors)} visitors
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${source.value}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 min-w-[3rem]">
                      {source.value}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MousePointer className="h-5 w-5 mr-2" />
              Device Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceData.deviceBreakdown.map((device, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-gray-900">
                      {device.name}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {formatNumber(device.visitors)} visitors
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${device.value}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 min-w-[3rem]">
                      {device.value}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-green-200 rounded-lg bg-green-50">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Strong Performance</h3>
              </div>
              <p className="text-sm text-green-800">
                Portfolio engagement is up 12.5% this month. The E-Commerce Platform project is driving significant traffic and conversions.
              </p>
            </div>
            
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Optimization Opportunity</h3>
              </div>
              <p className="text-sm text-blue-800">
                Mobile traffic accounts for 38.9% of visits. Consider optimizing mobile experience to improve engagement rates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}