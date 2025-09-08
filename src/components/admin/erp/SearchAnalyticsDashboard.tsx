import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Search,
  TrendingUp,
  Clock,
  Target,
  Users,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Download,
  RefreshCw,
  Eye,
  MousePointer,
  Filter
} from 'lucide-react';
import { 
  getSearchAnalytics, 
  getSearchInsights, 
  getRealTimeSearchStats,
  searchAnalyticsManager,
  SearchAnalyticsSummary,
  SearchInsights
} from '@/utils/searchAnalytics';

interface SearchAnalyticsDashboardProps {
  isVisible: boolean;
  onClose: () => void;
}

export function SearchAnalyticsDashboard({ isVisible, onClose }: SearchAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<SearchAnalyticsSummary | null>(null);
  const [insights, setInsights] = useState<SearchInsights | null>(null);
  const [realTimeStats, setRealTimeStats] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('24h');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isVisible) {
      loadAnalytics();
      const interval = setInterval(loadRealTimeStats, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isVisible, timeRange]);

  const loadAnalytics = () => {
    setLoading(true);
    try {
      const now = Date.now();
      let timeRangeFilter;

      switch (timeRange) {
        case '24h':
          timeRangeFilter = { start: now - 24 * 60 * 60 * 1000, end: now };
          break;
        case '7d':
          timeRangeFilter = { start: now - 7 * 24 * 60 * 60 * 1000, end: now };
          break;
        case '30d':
          timeRangeFilter = { start: now - 30 * 24 * 60 * 60 * 1000, end: now };
          break;
        default:
          timeRangeFilter = undefined;
      }

      const analyticsData = getSearchAnalytics(timeRangeFilter);
      const insightsData = getSearchInsights(timeRangeFilter);
      
      setAnalytics(analyticsData);
      setInsights(insightsData);
      loadRealTimeStats();
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRealTimeStats = () => {
    try {
      const stats = getRealTimeSearchStats();
      setRealTimeStats(stats);
    } catch (error) {
      console.error('Failed to load real-time stats:', error);
    }
  };

  const handleExportAnalytics = () => {
    try {
      const data = searchAnalyticsManager.exportAnalytics();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `search-analytics-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export analytics:', error);
    }
  };

  const handleClearAnalytics = () => {
    if (confirm('Are you sure you want to clear all search analytics data? This action cannot be undone.')) {
      searchAnalyticsManager.clearAnalytics();
      loadAnalytics();
    }
  };

  if (!isVisible) return null;

  if (loading || !analytics || !insights) {
    return (
      <Card className="absolute top-16 left-0 right-0 z-50 shadow-xl border max-h-[80vh] overflow-y-auto">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Loading search analytics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="absolute top-16 left-0 right-0 z-50 shadow-xl border max-h-[85vh] overflow-y-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Search Analytics Dashboard
            </CardTitle>
            <CardDescription>
              Insights into user search behavior and performance metrics
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
            <Button variant="ghost" size="sm" onClick={handleExportAnalytics}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Real-time Stats */}
        {realTimeStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Last Hour</p>
                    <p className="text-2xl font-bold">{realTimeStats.searchesLastHour}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Today</p>
                    <p className="text-2xl font-bold">{realTimeStats.searchesToday}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold">{Math.round(analytics.successRate)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-600">Avg Time</p>
                    <p className="text-2xl font-bold">{Math.round(analytics.averageExecutionTime)}ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="queries">Top Queries</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalSearches}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {analytics.uniqueQueries} unique queries
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Search Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Basic</span>
                      <span>{analytics.searchPatterns.basicSearches}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Advanced</span>
                      <span>{analytics.searchPatterns.advancedSearches}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Operators</span>
                      <span>{analytics.searchPatterns.operatorSearches}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">User Behavior</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        Successful
                      </span>
                      <span>{analytics.behaviorMetrics.successfulSearches}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-yellow-500" />
                        No Results
                      </span>
                      <span>{analytics.behaviorMetrics.noResultsSearches}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <MousePointer className="h-3 w-3 text-blue-500" />
                        Refined
                      </span>
                      <span>{analytics.behaviorMetrics.refinedSearches}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search Context */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Searches by Tab</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(analytics.searchesByTab).map(([tab, count]) => (
                      <div key={tab} className="flex justify-between text-sm">
                        <span className="capitalize">{tab}</span>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Trending Queries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.trendingQueries.slice(0, 5).map((query, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="truncate flex-1">{query.query}</span>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          <span className="text-green-600">+{Math.round(query.growthRate)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="queries" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Search Queries</CardTitle>
                <CardDescription>Most frequently searched terms and their performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topQueries.map((query, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm bg-white px-2 py-1 rounded border">
                            {query.query}
                          </span>
                          <Badge variant="secondary">{query.count} searches</Badge>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span>Success Rate: </span>
                            <span className={query.successRate > 80 ? 'text-green-600' : 
                                           query.successRate > 50 ? 'text-yellow-600' : 'text-red-600'}>
                              {Math.round(query.successRate)}%
                            </span>
                          </div>
                          <div>
                            <span>Avg Results: </span>
                            <span>{Math.round(query.avgResultCount)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Last: {new Date(query.lastSearched).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Fast (&lt;100ms)</span>
                        <span>{analytics.performanceMetrics.fastSearches}</span>
                      </div>
                      <Progress 
                        value={(analytics.performanceMetrics.fastSearches / analytics.totalSearches) * 100} 
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Normal (100-500ms)</span>
                        <span>{analytics.performanceMetrics.normalSearches}</span>
                      </div>
                      <Progress 
                        value={(analytics.performanceMetrics.normalSearches / analytics.totalSearches) * 100} 
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Slow (&gt;500ms)</span>
                        <span>{analytics.performanceMetrics.slowSearches}</span>
                      </div>
                      <Progress 
                        value={(analytics.performanceMetrics.slowSearches / analytics.totalSearches) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Problem Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights.slowQueries.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-red-600 mb-2">Slow Queries</h4>
                        <div className="space-y-1">
                          {insights.slowQueries.slice(0, 3).map((query, index) => (
                            <div key={index} className="text-sm bg-red-50 px-2 py-1 rounded">
                              {query}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {insights.emptyResultQueries.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-yellow-600 mb-2">No Results</h4>
                        <div className="space-y-1">
                          {insights.emptyResultQueries.slice(0, 3).map((query, index) => (
                            <div key={index} className="text-sm bg-yellow-50 px-2 py-1 rounded">
                              {query}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {insights.abandonedQueries.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-orange-600 mb-2">Abandoned</h4>
                        <div className="space-y-1">
                          {insights.abandonedQueries.slice(0, 3).map((query, index) => (
                            <div key={index} className="text-sm bg-orange-50 px-2 py-1 rounded">
                              {query}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actionable Insights</CardTitle>
                <CardDescription>AI-powered recommendations to improve search experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.recommendations.map((rec, index) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 ${
                      rec.priority === 'high' ? 'border-red-500 bg-red-50' :
                      rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                      'border-blue-500 bg-blue-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={rec.priority === 'high' ? 'destructive' : 
                                          rec.priority === 'medium' ? 'default' : 'secondary'}>
                              {rec.priority.toUpperCase()}
                            </Badge>
                            <span className="text-sm font-medium capitalize">
                              {rec.type.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm">{rec.description}</p>
                          {rec.query && (
                            <p className="text-xs text-gray-500 mt-1">
                              Query: "{rec.query}"
                            </p>
                          )}
                        </div>
                        {rec.metric && (
                          <div className="text-right">
                            <div className="text-lg font-bold">{rec.metric}</div>
                            <div className="text-xs text-gray-500">affected</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          
          <div className="flex gap-2">
            <Button variant="destructive" onClick={handleClearAnalytics}>
              Clear Analytics
            </Button>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}