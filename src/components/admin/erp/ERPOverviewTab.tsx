import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { searchERP, SearchResult, SearchableData } from '@/utils/erpSearch';
import { advancedSearchERP } from '@/utils/advancedSearch';
import { parseSearchQuery } from '@/utils/searchOperators';
import { addSearchToHistory, getSearchSuggestions } from '@/utils/searchHistory';
import { trackSearch, trackResultClick } from '@/utils/searchAnalytics';
import { ERPSearchResults } from './ERPSearchResults';
import { SearchOperatorHelp } from './SearchOperatorHelp';
import { SearchHistoryDropdown } from './SearchHistoryDropdown';
import { SearchAnalyticsDashboard } from './SearchAnalyticsDashboard';
import { VoiceSearchButtonMini } from './VoiceSearchButton';
import { EnhancedSearchBar } from './EnhancedSearchBar';
import { 
  TrendingUp,
  DollarSign,
  Activity,
  Users,
  BarChart3,
  Calendar,
  Target,
  Clock,
  Plus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Timer,
  FileText,
  UserPlus,
  Settings,
  Bell,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Edit,
  Play,
  Pause,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Zap,
  TrendingDown,
  AlertCircle,
  Star,
  Bookmark,
  MessageSquare,
  Mail,
  Phone,
  Globe,
  Building,
  MapPin,
  Briefcase,
  Gauge,
  Layers,
  Database,
  HelpCircle,
  History,
  Mic
} from 'lucide-react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  Legend
} from 'recharts';

interface ERPStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalBudget: number;
  totalSpent: number;
  budgetUtilization: number;
  teamMembers: number;
  avgProjectDuration: number;
}

interface ERPOverviewTabProps {
  erpStats: ERPStats;
  loading: boolean;
  departmentData: any[];
  statusData: any[];
  performanceData: any[];
  budgetData: any[];
  timelineData: any[];
  searchableData: SearchableData;
  onQuickAction: (action: string, data?: any) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Function to get time-based greeting
const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return "Good Morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  } else if (hour >= 17 && hour < 22) {
    return "Good Evening";
  } else {
    return "Good Night";
  }
};

export function ERPOverviewTab({ 
  erpStats, 
  loading, 
  departmentData, 
  statusData, 
  performanceData, 
  budgetData, 
  timelineData,
  searchableData,
  onQuickAction
}: ERPOverviewTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [timeFilter, setTimeFilter] = useState('today');
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);
  const [notificationCount, setNotificationCount] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Search functionality state
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchHelp, setShowSearchHelp] = useState(false);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [searchInputFocused, setSearchInputFocused] = useState(false);
  const [currentGreeting, setCurrentGreeting] = useState(getTimeBasedGreeting());
  const [showSearchAnalytics, setShowSearchAnalytics] = useState(false);
  const [currentSearchId, setCurrentSearchId] = useState<string | null>(null);
  const [voiceSearchError, setVoiceSearchError] = useState<string | null>(null);
  // Voice search handlers
  const handleVoiceTranscript = useCallback((transcript: string, isFinal: boolean) => {
    if (isFinal) {
      // Set the search term and perform search with voice analytics
      const trimmedTranscript = transcript.trim();
      setSearchTerm(trimmedTranscript);
      if (trimmedTranscript) {
        // Perform voice search with special tracking
        performVoiceSearch(trimmedTranscript);
      }
      setVoiceSearchError(null);
    } else {
      // Show interim transcript in the input
      setSearchTerm(transcript);
    }
  }, []);

  const handleVoiceError = useCallback((error: string) => {
    setVoiceSearchError(error);
    // Clear error after 5 seconds
    setTimeout(() => setVoiceSearchError(null), 5000);
  }, []);

  // Voice search function with specific analytics tracking
  const performVoiceSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    const searchStartTime = performance.now();
    
    // Simulate a small delay for better UX (optional)
    setTimeout(() => {
      // Check if query contains operators
      const parsedQuery = parseSearchQuery(query);
      const hasOperators = parsedQuery.operators.length > 0 || 
                          parsedQuery.dateRanges.length > 0 || 
                          parsedQuery.tags.length > 0 || 
                          parsedQuery.excludes.length > 0;
      
      // Use advanced search if operators are present, otherwise use regular search
      const results = hasOperators ? 
        advancedSearchERP(query, searchableData) : 
        searchERP(query, searchableData);
        
      const searchEndTime = performance.now();
      const executionTime = searchEndTime - searchStartTime;
      
      setSearchResults(results);
      setShowSearchResults(true);
      setSearchLoading(false);
      
      // Track voice search analytics with special 'voice' type
      const searchId = trackSearch(
        query,
        results.length,
        executionTime,
        {
          tab: 'overview',
          page: 'erp-dashboard',
          filters: hasOperators ? parsedQuery.operators : undefined,
          operators: hasOperators ? parsedQuery.operators.map(op => `${op.field}:${op.operator}`) : undefined
        },
        'voice' // Special voice search type
      );
      
      setCurrentSearchId(searchId);
      
      // Add to search history
      addSearchToHistory(query, results.length > 0, 'voice');
    }, 100);
  }, [searchableData]);

  // Debounced search function
  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    const searchStartTime = performance.now();
    
    // Simulate a small delay for better UX (optional)
    setTimeout(() => {
      // Check if query contains operators
      const parsedQuery = parseSearchQuery(query);
      const hasOperators = parsedQuery.operators.length > 0 || 
                          parsedQuery.dateRanges.length > 0 || 
                          parsedQuery.tags.length > 0 || 
                          parsedQuery.excludes.length > 0;
      
      // Determine search type
      const searchType = hasOperators ? 'operator' : 
                        parsedQuery.freeText ? 'advanced' : 'basic';
      
      // Use advanced search if operators are present, otherwise use regular search
      const results = hasOperators ? 
        advancedSearchERP(query, searchableData) : 
        searchERP(query, searchableData);
        
      const searchEndTime = performance.now();
      const executionTime = searchEndTime - searchStartTime;
      
      setSearchResults(results);
      setShowSearchResults(true);
      setSearchLoading(false);
      
      // Track search analytics
      const searchId = trackSearch(
        query,
        results.length,
        executionTime,
        {
          tab: 'overview',
          page: 'erp-dashboard',
          filters: hasOperators ? parsedQuery.operators : undefined,
          operators: hasOperators ? parsedQuery.operators.map(op => `${op.field}:${op.operator}`) : undefined
        },
        searchType
      );
      setCurrentSearchId(searchId);
      
      // Add to search history
      addSearchToHistory(query, results.length, {
        tab: 'overview',
        resultTypes: [...new Set(results.map(r => r.type))]
      });
    }, 150);
  }, [searchableData]);

  // Handler functions for interactive elements
  const handleSearch = (searchValue: string) => {
    setSearchTerm(searchValue);
    performSearch(searchValue);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() && searchResults.length > 0) {
      // Select the first result if available
      handleSelectSearchResult(searchResults[0]);
    }
  };

  const handleSelectSearchResult = (result: SearchResult) => {
    setShowSearchResults(false);
    setSearchTerm('');
    
    // Track result click analytics
    if (currentSearchId) {
      trackResultClick(currentSearchId, result.id, result.type, 'result_click');
    }
    
    // Handle different result types
    switch (result.type) {
      case 'project':
        onQuickAction('view-project', result.data);
        break;
      case 'task':
        onQuickAction('view-task', result.data);
        break;
      case 'team_member':
        onQuickAction('view-team-member', result.data);
        break;
      case 'time_entry':
        onQuickAction('view-time-entry', result.data);
        break;
      case 'activity':
        // Handle system commands
        if (result.metadata?.isCommand) {
          onQuickAction(result.data.action);
        } else {
          onQuickAction('view-activity', result.data);
        }
        break;
      default:
        onQuickAction('global-search', { query: result.title, result });
    }
  };

  const handleCloseSearch = () => {
    setShowSearchResults(false);
  };

  const handleShowHelp = () => {
    setShowSearchHelp(true);
    setShowSearchResults(false);
    setShowNotifications(false);
  };

  const handleCloseHelp = () => {
    setShowSearchHelp(false);
  };

  const handleExampleClick = (example: string) => {
    setSearchTerm(example);
    performSearch(example);
    setShowSearchHelp(false);
  };

  const handleShowHistory = () => {
    setShowSearchHistory(true);
    setShowSearchResults(false);
    setShowSearchHelp(false);
    setShowNotifications(false);
  };

  const handleCloseHistory = () => {
    setShowSearchHistory(false);
  };

  const handleSelectFromHistory = (query: string) => {
    setSearchTerm(query);
    performSearch(query);
    setShowSearchHistory(false);
  };

  const handleShowAnalytics = () => {
    setShowSearchAnalytics(true);
    setShowSearchResults(false);
    setShowSearchHistory(false);
    setShowSearchHelp(false);
    setShowNotifications(false);
  };

  const handleCloseAnalytics = () => {
    setShowSearchAnalytics(false);
  };

  const handleSearchFocus = () => {
    setSearchInputFocused(true);
    if (!searchTerm.trim()) {
      setShowSearchHistory(true);
      setShowSearchResults(false);
      setShowSearchHelp(false);
    }
  };

  const handleSearchBlur = () => {
    setSearchInputFocused(false);
    // Delay closing to allow clicking on dropdown items
    setTimeout(() => {
      if (!searchInputFocused) {
        setShowSearchHistory(false);
      }
    }, 150);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSearchResults(false);
      setShowSearchHelp(false);
      setShowSearchHistory(false);
      setShowSearchAnalytics(false);
    };

    if (showSearchResults || showSearchHelp || showSearchHistory || showSearchAnalytics) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSearchResults, showSearchHelp, showSearchHistory, showSearchAnalytics]);

  // Update greeting every minute
  useEffect(() => {
    const greetingInterval = setInterval(() => {
      setCurrentGreeting(getTimeBasedGreeting());
    }, 60000); // Update every minute

    return () => clearInterval(greetingInterval);
  }, []);

  const handleDismissAlert = (alertId: number) => {
    setDismissedAlerts(prev => [...prev, alertId]);
    setNotificationCount(prev => Math.max(0, prev - 1));
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading ERP Overview...</div>;
  }

  // Real-time data and alerts (now interactive)
  const alerts = [
    { id: 1, type: 'urgent', title: 'Budget Alert', message: 'Civil Engineering project 67% over budget', time: '2 min ago', actionable: true },
    { id: 2, type: 'warning', title: 'Deadline Risk', message: '3 projects due this week', time: '5 min ago', actionable: true },
    { id: 3, type: 'success', title: 'Goal Achievement', message: 'Q3 revenue target reached!', time: '1 hour ago', actionable: false },
    { id: 4, type: 'info', title: 'New Assignment', message: '2 new team members added', time: '2 hours ago', actionable: false }
  ].filter(alert => !dismissedAlerts.includes(alert.id));

  const quickActions = [
    { id: 'new-project', label: 'New Project', icon: Plus, color: 'bg-blue-500 hover:bg-blue-600' },
    { id: 'add-client', label: 'Add Client', icon: UserPlus, color: 'bg-green-500 hover:bg-green-600' },
    { id: 'create-invoice', label: 'Create Invoice', icon: FileText, color: 'bg-purple-500 hover:bg-purple-600' },
    { id: 'start-timer', label: 'Start Timer', icon: Play, color: 'bg-orange-500 hover:bg-orange-600' },
    { id: 'new-task', label: 'Quick Task', icon: Target, color: 'bg-pink-500 hover:bg-pink-600' },
    { id: 'schedule-meeting', label: 'Meeting', icon: Calendar, color: 'bg-indigo-500 hover:bg-indigo-600' }
  ];

  const recentActivity = [
    { id: 1, type: 'project', title: 'Residential Building Design project updated', user: 'John Doe', time: '5 min ago', status: 'completed' },
    { id: 2, type: 'task', title: 'Structural calculations task assigned', user: 'Jane Smith', time: '12 min ago', status: 'active' },
    { id: 3, type: 'payment', title: 'Invoice #1234 paid', user: 'Client Corp', time: '1 hour ago', status: 'success' },
    { id: 4, type: 'team', title: 'New team member joined', user: 'Mike Wilson', time: '2 hours ago', status: 'info' }
  ];

  const upcomingTasks = [
    { id: 1, title: 'Complete CAD Drawing Review', project: 'Office Complex', due: '2 hours', priority: 'high' },
    { id: 2, title: 'Client Presentation', project: 'Bridge Design', due: '4 hours', priority: 'urgent' },
    { id: 3, title: 'Site Survey Analysis', project: 'Highway Project', due: '1 day', priority: 'medium' },
    { id: 4, title: 'Budget Planning Meeting', project: 'Q4 Strategy', due: '2 days', priority: 'low' }
  ];

  return (
    <div className="space-y-6">
      {/* Command Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{currentGreeting}, Admin! 👋</h2>
            <p className="text-blue-100">Here's what's happening with your business today</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Enhanced Search Bar */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <EnhancedSearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                onSubmit={(query) => {
                  handleSearch(query);
                  handleSearchSubmit(new Event('submit') as any);
                }}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                onVoiceTranscript={handleVoiceTranscript}
                onVoiceError={handleVoiceError}
                loading={searchLoading}
                showSuggestions={searchInputFocused}
                className="w-[500px]"
              />
              
              {/* Search Results */}
              {(showSearchResults || searchLoading) && (
                <ERPSearchResults
                  results={searchResults}
                  query={searchTerm}
                  onSelectResult={handleSelectSearchResult}
                  onClose={handleCloseSearch}
                  loading={searchLoading}
                />
              )}

              {/* Search Help */}
              {showSearchHelp && (
                <SearchOperatorHelp
                  isVisible={showSearchHelp}
                  onClose={handleCloseHelp}
                  onExampleClick={handleExampleClick}
                />
              )}

              {/* Search History */}
              {showSearchHistory && (
                <SearchHistoryDropdown
                  isVisible={showSearchHistory}
                  searchInput={searchTerm}
                  onSelectSearch={handleSelectFromHistory}
                  onClose={handleCloseHistory}
                />
              )}

              {/* Search Analytics Dashboard */}
              {showSearchAnalytics && (
                <SearchAnalyticsDashboard
                  isVisible={showSearchAnalytics}
                  onClose={handleCloseAnalytics}
                />
              )}

              {/* Voice Search Error Toast */}
              {voiceSearchError && (
                <div className="absolute top-full left-0 mt-2 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg shadow-lg max-w-[300px] z-50">
                  <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{voiceSearchError}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Search Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleShowHistory}
                className="text-blue-200 hover:text-white hover:bg-white/10"
                title="Search history"
              >
                <History className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleShowHelp}
                className="text-blue-200 hover:text-white hover:bg-white/10"
                title="Search help and operators"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleShowAnalytics}
                className="text-blue-200 hover:text-white hover:bg-white/10"
                title="Search analytics"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Notification Button */}
            <div className="relative">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={toggleNotifications}
                className="relative"
              >
                <Bell className="h-4 w-4 mr-2" />
                {notificationCount} Alert{notificationCount !== 1 ? 's' : ''}
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </Button>
              
              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold text-gray-900">Recent Notifications</h3>
                  </div>
                  <div className="p-2">
                    {alerts.slice(0, 5).map((alert) => (
                      <div key={alert.id} className="p-3 hover:bg-gray-50 rounded-lg border-b last:border-b-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                            <p className="text-xs text-gray-500 mt-2">{alert.time}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDismissAlert(alert.id)}
                            className="text-gray-400 hover:text-gray-600 p-1"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {alerts.length === 0 && (
                      <div className="p-4 text-center text-gray-500">
                        <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p>No new notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {alerts.map((alert) => (
          <Card 
            key={alert.id} 
            className={`border-l-4 cursor-pointer hover:shadow-md transition-shadow ${
              alert.type === 'urgent' ? 'border-l-red-500 bg-red-50 hover:bg-red-100' :
              alert.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50 hover:bg-yellow-100' :
              alert.type === 'success' ? 'border-l-green-500 bg-green-50 hover:bg-green-100' :
              'border-l-blue-500 bg-blue-50 hover:bg-blue-100'
            }`}
            onClick={() => onQuickAction('view-alert', alert)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-1 rounded-full ${
                  alert.type === 'urgent' ? 'bg-red-500' :
                  alert.type === 'warning' ? 'bg-yellow-500' :
                  alert.type === 'success' ? 'bg-green-500' :
                  'bg-blue-500'
                }`}>
                  {alert.type === 'urgent' ? <AlertTriangle className="h-3 w-3 text-white" /> :
                   alert.type === 'warning' ? <AlertCircle className="h-3 w-3 text-white" /> :
                   alert.type === 'success' ? <CheckCircle className="h-3 w-3 text-white" /> :
                   <Bell className="h-3 w-3 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-600 truncate">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {alert.actionable && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickAction('resolve-alert', alert);
                          }}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-green-600"
                          title="Mark as resolved"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDismissAlert(alert.id);
                        }}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                        title="Dismiss alert"
                      >
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {alerts.length === 0 && (
          <div className="col-span-full flex items-center justify-center py-12 text-gray-500">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">All caught up!</h3>
              <p className="text-sm">No alerts at the moment</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Quick Actions
          </CardTitle>
          <CardDescription>Frequently used actions at your fingertips</CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickActions.map((action) => (
                <UITooltip key={action.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className={`${action.color} text-white border-0 h-20 flex-col gap-2 hover:scale-105 transition-transform`}
                      onClick={() => onQuickAction(action.id)}
                    >
                      <action.icon className="h-6 w-6" />
                      <span className="text-xs font-medium">{action.label}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </TooltipContent>
                </UITooltip>
              ))}
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Enhanced KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Productivity Score</p>
                <p className="text-3xl font-bold text-emerald-500">
                  {((erpStats.completedTasks / Math.max(erpStats.totalTasks, 1)) * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {erpStats.completedTasks} of {erpStats.totalTasks} tasks completed
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    +12% vs last week
                  </Badge>
                </div>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Gauge className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress 
                value={(erpStats.completedTasks / Math.max(erpStats.totalTasks, 1)) * 100} 
                className="h-2"
              />
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-3 text-emerald-600 hover:text-emerald-700"
              onClick={() => onQuickAction('view-productivity')}
            >
              View Details <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Budget Efficiency</p>
                <p className="text-3xl font-bold text-blue-500">
                  {erpStats.budgetUtilization.toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ${erpStats.totalSpent.toLocaleString()} of ${erpStats.totalBudget.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress 
                value={erpStats.budgetUtilization} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Project Health</p>
                <p className="text-3xl font-bold text-orange-500">
                  {((erpStats.completedProjects / Math.max(erpStats.totalProjects, 1)) * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {erpStats.completedProjects} of {erpStats.totalProjects} completed
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress 
                value={(erpStats.completedProjects / Math.max(erpStats.totalProjects, 1)) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team Utilization</p>
                <p className="text-3xl font-bold text-purple-500">
                  {erpStats.teamMembers}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Active team members
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress 
                value={85} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-500" />
                Recent Activity
              </span>
              <Button variant="outline" size="sm" onClick={() => onQuickAction('view-all-activity')}>
                View All
              </Button>
            </CardTitle>
            <CardDescription>Latest updates across your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onQuickAction('view-activity', activity)}
                >
                  <div className={`p-2 rounded-full ${
                    activity.status === 'completed' ? 'bg-green-100' :
                    activity.status === 'active' ? 'bg-blue-100' :
                    activity.status === 'success' ? 'bg-emerald-100' :
                    'bg-purple-100'
                  }`}>
                    {activity.type === 'project' ? <Briefcase className="h-4 w-4 text-green-600" /> :
                     activity.type === 'task' ? <Target className="h-4 w-4 text-blue-600" /> :
                     activity.type === 'payment' ? <DollarSign className="h-4 w-4 text-emerald-600" /> :
                     <Users className="h-4 w-4 text-purple-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">{activity.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500">{activity.user}</p>
                      <span className="text-xs text-gray-300">•</span>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                      <Badge 
                        variant={activity.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs ml-auto"
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickAction('view-activity-details', activity);
                    }}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-red-500" />
                Upcoming Tasks
              </span>
              <Button variant="outline" size="sm" onClick={() => onQuickAction('manage-tasks')}>
                Manage
              </Button>
            </CardTitle>
            <CardDescription>Tasks requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer group"
                  onClick={() => onQuickAction('view-task', task)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">{task.title}</p>
                      <Badge 
                        variant={task.priority === 'urgent' ? 'destructive' : 
                                task.priority === 'high' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{task.project}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <p className="text-xs text-gray-500">Due in {task.due}</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        task.priority === 'urgent' ? 'bg-red-500' :
                        task.priority === 'high' ? 'bg-orange-500' :
                        task.priority === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickAction('start-task', task);
                      }}
                      title="Start task"
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickAction('edit-task', task);
                      }}
                      title="Edit task"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-purple-100 hover:text-purple-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickAction('schedule-task', task);
                      }}
                      title="Schedule"
                    >
                      <Calendar className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              Advanced Analytics
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onQuickAction('export-data')}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => onQuickAction('refresh-data')}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="performance" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Department Performance Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Department Performance</CardTitle>
                    <CardDescription>Project completion rates by department</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsBarChart data={departmentData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="completed" fill="#22C55E" name="Completed" />
                        <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
                        <Bar dataKey="total" fill="#E5E7EB" name="Total" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Performance Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Performance Trend</CardTitle>
                    <CardDescription>Monthly performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsLineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="productivity" 
                          stroke="#22C55E" 
                          strokeWidth={3}
                          name="Productivity %"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="quality" 
                          stroke="#3B82F6" 
                          strokeWidth={3}
                          name="Quality Score"
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Budget Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Budget Timeline</CardTitle>
                    <CardDescription>Budget allocation and spending over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="allocated" 
                          stackId="1" 
                          stroke="#3B82F6" 
                          fill="#3B82F6"
                          name="Allocated Budget"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="spent" 
                          stackId="1" 
                          stroke="#F59E0B" 
                          fill="#F59E0B"
                          name="Spent Amount"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Budget Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Budget Distribution</CardTitle>
                    <CardDescription>Current budget allocation by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={budgetData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {budgetData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Project Status Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Project Status Distribution</CardTitle>
                    <CardDescription>Current status of all projects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Team Workload */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Team Workload Distribution</CardTitle>
                    <CardDescription>Current workload across team members</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">CAD Engineering Team</span>
                        <span className="text-sm text-gray-500">85% capacity</span>
                      </div>
                      <Progress value={85} className="h-2" />

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Civil Engineering Team</span>
                        <span className="text-sm text-gray-500">92% capacity</span>
                      </div>
                      <Progress value={92} className="h-2" />

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Architecture Team</span>
                        <span className="text-sm text-gray-500">78% capacity</span>
                      </div>
                      <Progress value={78} className="h-2" />

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Software Development Team</span>
                        <span className="text-sm text-gray-500">67% capacity</span>
                      </div>
                      <Progress value={67} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">AI-Powered Insights</CardTitle>
                    <CardDescription>Smart recommendations based on your data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Performance Boost</span>
                        </div>
                        <p className="text-xs text-blue-700">Your CAD engineering team's productivity increased 23% this month. Consider applying their workflow to other teams.</p>
                      </div>
                      
                      <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-900">Budget Warning</span>
                        </div>
                        <p className="text-xs text-yellow-700">3 projects are approaching their budget limits. Review allocations for Q4 planning.</p>
                      </div>
                      
                      <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-900">Goal Achievement</span>
                        </div>
                        <p className="text-xs text-green-700">You're on track to exceed quarterly targets by 15%. Great job maintaining quality standards!</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Metrics Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Executive Summary</CardTitle>
                    <CardDescription>Key metrics at a glance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">94%</p>
                        <p className="text-sm text-gray-500">Client Satisfaction</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{erpStats.avgProjectDuration}</p>
                        <p className="text-sm text-gray-500">Avg. Project Duration</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">89%</p>
                        <p className="text-sm text-gray-500">On-time Delivery</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">12%</p>
                        <p className="text-sm text-gray-500">ROI Growth</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}