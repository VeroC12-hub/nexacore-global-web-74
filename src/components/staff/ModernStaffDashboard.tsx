import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Users,
  Calendar,
  Clock,
  TrendingUp,
  Search,
  Plus,
  Eye,
  Edit,
  MessageSquare,
  Phone,
  FolderOpen,
  Activity,
  CheckCircle,
  AlertCircle,
  Bell,
  Mail,
  Send,
  UserCheck,
  Target,
  BarChart3,
  Settings,
  FileText,
  Workflow,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Types
interface StaffProject {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  budget: number;
  progress: number;
  client_name: string;
  client_email: string;
  created_at: string;
  deadline?: string;
  assigned_staff: string[];
}

interface TeamMessage {
  id: string;
  sender_name: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  unreadMessages: number;
  upcomingDeadlines: number;
}

export const ModernStaffDashboard: React.FC = () => {
  const { user, role, isAdmin, isProjectManager, isOperationsManager, isDeveloper, isSupport } = useEnhancedAuth();
  const navigate = useNavigate();
  
  // State
  const [activeView, setActiveView] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<StaffProject[]>([]);
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalRevenue: 0,
    unreadMessages: 0,
    upcomingDeadlines: 0,
  });

  // Navigation items based on role
  const getNavigationItems = () => {
    const baseItems = [
      { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-5 w-5" />, count: null },
      { id: 'projects', label: 'My Projects', icon: <FolderOpen className="h-5 w-5" />, count: stats.activeProjects },
      { id: 'messages', label: 'Messages', icon: <MessageSquare className="h-5 w-5" />, count: stats.unreadMessages },
      { id: 'calendar', label: 'Calendar', icon: <Calendar className="h-5 w-5" />, count: stats.upcomingDeadlines },
    ];

    // Add role-specific items
    if (isAdmin || isProjectManager || isOperationsManager) {
      baseItems.push(
        { id: 'team', label: 'Team', icon: <Users className="h-5 w-5" />, count: null },
        { id: 'reports', label: 'Reports', icon: <FileText className="h-5 w-5" />, count: null }
      );
    }

    if (isAdmin || isOperationsManager) {
      baseItems.push(
        { id: 'workflows', label: 'Workflows', icon: <Workflow className="h-5 w-5" />, count: null }
      );
    }

    if (isAdmin) {
      baseItems.push(
        { id: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" />, count: null }
      );
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  // Load dashboard data
  const loadStaffData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          id, title, description, status, priority, budget, progress, created_at, deadline, client_id,
          profiles!projects_client_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (projectsError) {
        console.error('Error loading projects:', projectsError);
        // Create sample data for UI demonstration
        const sampleProjects: StaffProject[] = [
          {
            id: '1',
            title: 'E-commerce Platform Development',
            description: 'Building a modern e-commerce solution with React and Node.js',
            status: 'in_progress',
            priority: 'high',
            budget: 25000,
            progress: 65,
            client_name: 'Tech Solutions Inc.',
            client_email: 'contact@techsolutions.com',
            created_at: new Date().toISOString(),
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            assigned_staff: ['developer', 'designer']
          },
          {
            id: '2',
            title: 'Mobile App UI/UX Redesign',
            description: 'Complete redesign of mobile application interface',
            status: 'pending',
            priority: 'medium',
            budget: 15000,
            progress: 20,
            client_name: 'StartupX',
            client_email: 'team@startupx.com',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
            assigned_staff: ['designer']
          }
        ];
        setProjects(sampleProjects);
        
        // Calculate stats from sample data
        setStats({
          totalProjects: sampleProjects.length,
          activeProjects: sampleProjects.filter(p => p.status === 'in_progress').length,
          completedProjects: sampleProjects.filter(p => p.status === 'completed').length,
          totalRevenue: sampleProjects.reduce((sum, p) => sum + p.budget, 0),
          unreadMessages: 3,
          upcomingDeadlines: sampleProjects.filter(p => p.deadline && new Date(p.deadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length
        });
      } else {
        const processedProjects = projectsData?.map(project => ({
          ...project,
          client_name: project.profiles?.full_name || 'Unknown Client',
          client_email: project.profiles?.email || 'no-email@example.com',
          assigned_staff: [] // This would come from a junction table in real implementation
        })) || [];
        
        setProjects(processedProjects);
        
        // Calculate real stats
        setStats({
          totalProjects: processedProjects.length,
          activeProjects: processedProjects.filter((p: any) => p.status === 'in_progress').length,
          completedProjects: processedProjects.filter((p: any) => p.status === 'completed').length,
          totalRevenue: processedProjects.reduce((sum: number, p: any) => sum + (p.budget || 0), 0),
          unreadMessages: 0, // This would come from messages table
          upcomingDeadlines: processedProjects.filter((p: any) => p.deadline && new Date(p.deadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length
        });
      }

      // Load messages (sample data)
      setMessages([
        {
          id: '1',
          sender_name: 'Project Manager',
          content: 'Please review the latest project requirements for the e-commerce platform.',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          is_read: false
        },
        {
          id: '2',
          sender_name: 'Client - Tech Solutions',
          content: 'Thank you for the progress update. Looking forward to the next milestone.',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          is_read: true
        }
      ]);

    } catch (error) {
      console.error('Error loading staff data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaffData();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.email?.split('@')[0]}!
        </h1>
        <p className="opacity-90">
          {role === 'admin' && "You have full system access as an administrator."}
          {role === 'project_manager' && "Manage your projects and team effectively."}
          {role === 'operations_manager' && "Oversee operations and ensure smooth workflow."}
          {role === 'developer' && "Focus on your development tasks and deliverables."}
          {role === 'support' && "Provide excellent support to clients and team members."}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-blue-600">{stats.activeProjects}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FolderOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+12%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalProjects}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Activity className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-gray-500">All time</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold text-orange-600">{stats.unreadMessages}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <MessageSquare className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Bell className="h-4 w-4 text-orange-500 mr-1" />
              <span className="text-orange-500">Needs attention</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Deadlines</p>
                <p className="text-2xl font-bold text-red-600">{stats.upcomingDeadlines}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-red-500">This week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Projects</CardTitle>
              <CardDescription>Your latest project assignments</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setActiveView('projects')}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.slice(0, 3).map((project) => (
              <div key={project.id} className="flex items-center space-x-4 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900 truncate">{project.title}</h4>
                    <Badge className={`ml-2 ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{project.client_name}</p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Messages</CardTitle>
              <CardDescription>Latest team communications</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setActiveView('messages')}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {messages.slice(0, 3).map((message) => (
              <div key={message.id} className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${message.is_read ? 'border-gray-100 bg-white' : 'border-blue-100 bg-blue-50'}`}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {message.sender_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm text-gray-900">{message.sender_name}</p>
                    <span className="text-xs text-gray-500">
                      {new Date(message.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{message.content}</p>
                  {!message.is_read && (
                    <Badge variant="secondary" className="mt-1 text-xs">New</Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderActiveView = () => {
    switch (activeView) {
      case 'projects':
        return (
          <Card>
            <CardHeader>
              <CardTitle>My Projects</CardTitle>
              <CardDescription>Manage and track your assigned projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{project.title}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(project.priority)}>
                          {project.priority} priority
                        </Badge>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">{project.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Client:</span>
                        <p className="text-gray-600">{project.client_name}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Budget:</span>
                        <p className="text-gray-600">${project.budget.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Deadline:</span>
                        <p className="text-gray-600">
                          {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Not set'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'messages':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Team Messages</CardTitle>
              <CardDescription>Communications and updates from your team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`border rounded-lg p-4 transition-colors ${message.is_read ? 'border-gray-200 bg-white' : 'border-blue-200 bg-blue-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {message.sender_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-gray-900">{message.sender_name}</span>
                        {!message.is_read && <Badge variant="secondary" className="text-xs">New</Badge>}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(message.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{message.content}</p>
                    <div className="mt-3 flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex pt-20">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Staff Dashboard</h2>
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                    activeView === item.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.count !== null && item.count > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {item.count}
                    </Badge>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="p-6">
            {renderActiveView()}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ModernStaffDashboard;