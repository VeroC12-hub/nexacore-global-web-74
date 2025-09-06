import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  FolderOpen,
  Clock,
  BarChart3,
  Settings,
  Shield,
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  UserCheck,
  UserX,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Activity,
  Calendar,
  Target,
  Briefcase,
  Timer,
  FileText,
  MessageSquare,
  Download,
  Upload,
  RefreshCw,
  Building
} from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
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
  AreaChart,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart
} from 'recharts';

interface ERPProject {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  budget: number;
  actual_cost: number;
  start_date: string;
  end_date: string;
  project_type: string;
  department: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ERPTask {
  id: string;
  erp_project_id: string;
  title: string;
  description: string;
  assigned_to: string;
  status: string;
  priority: string;
  due_date: string;
  estimated_hours: number;
  actual_hours: number;
  completion_percentage: number;
  created_at: string;
  erp_project?: {
    title: string;
    status: string;
  };
  assignee?: {
    full_name: string;
    email: string;
  };
}

interface ERPTimeEntry {
  id: string;
  user_id: string;
  erp_project_id: string;
  erp_task_id: string;
  description: string;
  hours: number;
  billable: boolean;
  date: string;
  is_approved: boolean;
  created_at: string;
  erp_project?: {
    title: string;
  };
  erp_task?: {
    title: string;
  };
  user?: {
    full_name: string;
    email: string;
  };
}

interface ERPStaffRole {
  id: string;
  user_id: string;
  role: string;
  department: string;
  position: string;
  hourly_rate: number;
  can_approve_timesheets: boolean;
  can_create_projects: boolean;
  can_manage_users: boolean;
  can_view_all_projects: boolean;
  is_active: boolean;
  created_at: string;
  user?: {
    email: string;
    full_name: string;
  };
}

interface ERPStats {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalStaff: number;
  activeStaff: number;
  totalHours: number;
  billableHours: number;
  averageProjectCompletion: number;
  totalBudget: number;
  totalSpent: number;
  budgetUtilization: number;
}

export function AdminERPTab() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  
  // Data states
  const [erpStats, setERPStats] = useState<ERPStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalStaff: 0,
    activeStaff: 0,
    totalHours: 0,
    billableHours: 0,
    averageProjectCompletion: 0,
    totalBudget: 0,
    totalSpent: 0,
    budgetUtilization: 0
  });
  
  const [projects, setProjects] = useState<ERPProject[]>([]);
  const [tasks, setTasks] = useState<ERPTask[]>([]);
  const [timeEntries, setTimeEntries] = useState<ERPTimeEntry[]>([]);
  const [staffRoles, setStaffRoles] = useState<ERPStaffRole[]>([]);
  
  // Modal states
  const [selectedProject, setSelectedProject] = useState<ERPProject | null>(null);
  const [selectedTask, setSelectedTask] = useState<ERPTask | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  
  // Export states
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'html'>('csv');
  const [exportType, setExportType] = useState<'overview' | 'projects' | 'tasks' | 'time' | 'staff'>('overview');
  const [isExporting, setIsExporting] = useState(false);
  
  // Drill-down states
  const [isDrillDownOpen, setIsDrillDownOpen] = useState(false);
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [drillDownType, setDrillDownType] = useState<'department' | 'status' | 'performance'>('department');

  useEffect(() => {
    const initializeERPData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          loadERPStats(),
          loadProjects(),
          loadTasks(),
          loadTimeEntries(),
          loadStaffRoles()
        ]);
      } catch (error) {
        console.error('Error loading ERP data:', error);
        toast.error('Failed to load ERP data');
      } finally {
        setLoading(false);
      }
    };
    
    initializeERPData();
  }, []);

  const loadERPData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadERPStats(),
        loadProjects(),
        loadTasks(),
        loadTimeEntries(),
        loadStaffRoles()
      ]);
    } catch (error) {
      console.error('Error loading ERP data:', error);
      toast.error('Failed to load ERP data');
    } finally {
      setLoading(false);
    }
  };

  const loadERPStats = async () => {
    try {
      // Initialize with fallback data in case tables don't exist
      const fallbackStats: ERPStats = {
        totalProjects: 0,
        activeProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        totalStaff: 0,
        activeStaff: 0,
        totalHours: 0,
        billableHours: 0,
        averageProjectCompletion: 0,
        totalBudget: 0,
        totalSpent: 0,
        budgetUtilization: 0
      };

      // Load projects stats
      const { data: projectsData, error: projectsError } = await supabase
        .from('erp_projects')
        .select('*');
      
      if (projectsError) {
        console.error('ERP projects table error:', projectsError);
        setErpStats(fallbackStats);
        return;
      }

      // Load tasks stats
      const { data: tasksData, error: tasksError } = await supabase
        .from('erp_tasks')
        .select('*');
      
      if (tasksError) throw tasksError;

      // Load time entries stats
      const { data: timeData, error: timeError } = await supabase
        .from('erp_time_entries')
        .select('*');
      
      if (timeError) throw timeError;

      // Load staff stats
      const { data: staffData, error: staffError } = await supabase
        .from('erp_staff_roles')
        .select('*');
      
      if (staffError) throw staffError;

      // Calculate stats
      const totalProjects = projectsData?.length || 0;
      const activeProjects = projectsData?.filter(p => p.is_active)?.length || 0;
      const totalTasks = tasksData?.length || 0;
      const completedTasks = tasksData?.filter(t => t.status === 'completed')?.length || 0;
      const totalStaff = staffData?.length || 0;
      const activeStaff = staffData?.filter(s => s.is_active)?.length || 0;
      const totalHours = timeData?.reduce((acc, entry) => acc + (entry.hours || 0), 0) || 0;
      const billableHours = timeData?.filter(entry => entry.billable)?.reduce((acc, entry) => acc + (entry.hours || 0), 0) || 0;
      const averageProjectCompletion = projectsData?.reduce((acc, p) => acc + (p.progress || 0), 0) / (totalProjects || 1);
      const totalBudget = projectsData?.reduce((acc, p) => acc + (p.budget || 0), 0) || 0;
      const totalSpent = projectsData?.reduce((acc, p) => acc + (p.actual_cost || 0), 0) || 0;
      const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

      setERPStats({
        totalProjects,
        activeProjects,
        totalTasks,
        completedTasks,
        totalStaff,
        activeStaff,
        totalHours,
        billableHours,
        averageProjectCompletion,
        totalBudget,
        totalSpent,
        budgetUtilization
      });
    } catch (error) {
      console.error('Error loading ERP stats:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('erp_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading projects:', error);
        setProjects([]);
        return;
      }
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    }
  };

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('erp_tasks')
        .select(`
          *,
          erp_project:erp_project_id (title, status),
          assignee:assigned_to (full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading tasks:', error);
        setTasks([]);
        return;
      }
      setTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasks([]);
    }
  };

  const loadTimeEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('erp_time_entries')
        .select(`
          *,
          erp_project:erp_project_id (title),
          erp_task:erp_task_id (title),
          user:user_id (full_name, email)
        `)
        .order('date', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading time entries:', error);
        setTimeEntries([]);
        return;
      }
      setTimeEntries(data || []);
    } catch (error) {
      console.error('Error loading time entries:', error);
      setTimeEntries([]);
    }
  };

  const loadStaffRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('erp_staff_roles')
        .select(`
          *,
          user:user_id (email, full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading staff roles:', error);
        setStaffRoles([]);
        return;
      }
      setStaffRoles(data || []);
    } catch (error) {
      console.error('Error loading staff roles:', error);
      setStaffRoles([]);
    }
  };

  const updateProjectStatus = async (projectId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('erp_projects')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', projectId);

      if (error) throw error;

      await loadProjects();
      await loadERPStats();
      toast.success('Project status updated successfully');
    } catch (error) {
      console.error('Error updating project status:', error);
      toast.error('Failed to update project status');
    }
  };

  const approveTimeEntry = async (entryId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('erp_time_entries')
        .update({ is_approved: approved })
        .eq('id', entryId);

      if (error) throw error;

      await loadTimeEntries();
      toast.success(`Time entry ${approved ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error updating time entry:', error);
      toast.error('Failed to update time entry');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'active': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'in_progress': 'bg-green-500/20 text-green-400 border-green-500/30',
      'on_hold': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'completed': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'cancelled': 'bg-red-500/20 text-red-400 border-red-500/30',
      'review': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      'blocked': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'low': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      'medium': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'high': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'urgent': 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  // Export functionality
  const generateReportData = () => {
    const timestamp = new Date().toISOString();
    const reportDate = new Date().toLocaleDateString();
    
    const departmentBreakdown = Array.from(new Set(projects.map(p => p.department).filter(Boolean))).map(dept => ({
      department: dept,
      totalProjects: projects.filter(p => p.department === dept).length,
      activeProjects: projects.filter(p => p.department === dept && p.status === 'active').length,
      completedProjects: projects.filter(p => p.department === dept && p.status === 'completed').length,
      totalBudget: projects.filter(p => p.department === dept).reduce((sum, p) => sum + (p.budget || 0), 0),
      avgProgress: projects.filter(p => p.department === dept).reduce((sum, p) => sum + (p.progress || 0), 0) / Math.max(projects.filter(p => p.department === dept).length, 1)
    }));

    const teamPerformance = staffRoles.filter(staff => staff.is_active).map(staff => {
      const staffTimeEntries = timeEntries.filter(entry => entry.user_id === staff.user_id);
      const totalHours = staffTimeEntries.reduce((sum, entry) => sum + entry.hours, 0);
      const billableHours = staffTimeEntries.filter(entry => entry.billable).reduce((sum, entry) => sum + entry.hours, 0);
      const completedTasks = tasks.filter(task => task.assigned_to === staff.user_id && task.status === 'completed').length;
      const totalTasks = tasks.filter(task => task.assigned_to === staff.user_id).length;
      
      return {
        name: staff.user?.full_name || 'Unknown',
        role: staff.role,
        department: staff.department,
        position: staff.position,
        totalHours: parseFloat(totalHours.toFixed(2)),
        billableHours: parseFloat(billableHours.toFixed(2)),
        billableRatio: totalHours > 0 ? parseFloat(((billableHours / totalHours) * 100).toFixed(1)) : 0,
        completedTasks,
        totalTasks,
        taskCompletionRate: totalTasks > 0 ? parseFloat(((completedTasks / totalTasks) * 100).toFixed(1)) : 0,
        hourlyRate: staff.hourly_rate || 0
      };
    });

    return {
      metadata: {
        reportTitle: 'NexaCore ERP System Analytics Report',
        generatedAt: timestamp,
        generatedDate: reportDate,
        reportType: exportType,
        format: exportFormat,
        totalRecords: {
          projects: projects.length,
          tasks: tasks.length,
          timeEntries: timeEntries.length,
          staffMembers: staffRoles.length
        }
      },
      overview: {
        kpis: {
          productivityScore: parseFloat(((erpStats.completedTasks / Math.max(erpStats.totalTasks, 1)) * 100).toFixed(1)),
          budgetEfficiency: parseFloat(erpStats.budgetUtilization.toFixed(1)),
          teamUtilization: parseFloat(((erpStats.activeStaff / Math.max(erpStats.totalStaff, 1)) * 100).toFixed(1)),
          billableRatio: parseFloat(((erpStats.billableHours / Math.max(erpStats.totalHours, 1)) * 100).toFixed(1))
        },
        statistics: {
          ...erpStats,
          totalHours: parseFloat(erpStats.totalHours.toFixed(2)),
          billableHours: parseFloat(erpStats.billableHours.toFixed(2)),
          averageProjectCompletion: parseFloat(erpStats.averageProjectCompletion.toFixed(1)),
          budgetUtilization: parseFloat(erpStats.budgetUtilization.toFixed(1))
        },
        departmentBreakdown,
        teamPerformance: teamPerformance.slice(0, 10) // Top 10 performers
      },
      detailedData: {
        projects: exportType === 'projects' || exportType === 'overview' ? projects.map(project => ({
          id: project.id,
          title: project.title,
          description: project.description,
          status: project.status,
          priority: project.priority,
          progress: project.progress,
          budget: project.budget,
          spent: project.spent,
          department: project.department,
          manager: project.manager,
          startDate: project.start_date,
          endDate: project.end_date,
          isActive: project.is_active,
          createdAt: project.created_at
        })) : [],
        tasks: exportType === 'tasks' || exportType === 'overview' ? tasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          projectTitle: task.erp_project?.title,
          assigneeName: task.assignee?.full_name,
          assigneeEmail: task.assignee?.email,
          estimatedHours: task.estimated_hours,
          actualHours: task.actual_hours,
          completionPercentage: task.completion_percentage,
          dueDate: task.due_date,
          createdAt: task.created_at
        })) : [],
        timeEntries: exportType === 'time' || exportType === 'overview' ? timeEntries.map(entry => ({
          id: entry.id,
          userName: entry.user?.full_name,
          userEmail: entry.user?.email,
          projectTitle: entry.erp_project?.title,
          description: entry.description,
          hours: entry.hours,
          billable: entry.billable,
          hourlyRate: entry.hourly_rate,
          totalAmount: entry.total_amount,
          date: entry.date,
          isApproved: entry.is_approved,
          approvedBy: entry.approved_by,
          createdAt: entry.created_at
        })) : [],
        staff: exportType === 'staff' || exportType === 'overview' ? teamPerformance : []
      }
    };
  };

  const exportToCSV = (data: any) => {
    let csvContent = '';
    
    if (exportType === 'overview' || exportType === 'projects') {
      csvContent += 'PROJECT REPORT\\n';
      csvContent += 'ID,Title,Status,Priority,Progress,Budget,Spent,Department,Manager,Start Date,End Date,Active,Created\\n';
      data.detailedData.projects.forEach((project: any) => {
        csvContent += `"${project.id}","${project.title}","${project.status}","${project.priority}",${project.progress},"${project.budget}","${project.spent}","${project.department}","${project.manager}","${project.startDate}","${project.endDate}",${project.isActive},"${project.createdAt}"\\n`;
      });
      csvContent += '\\n';
    }

    if (exportType === 'overview' || exportType === 'tasks') {
      csvContent += 'TASK REPORT\\n';
      csvContent += 'ID,Title,Status,Priority,Project,Assignee,Estimated Hours,Actual Hours,Completion,Due Date,Created\\n';
      data.detailedData.tasks.forEach((task: any) => {
        csvContent += `"${task.id}","${task.title}","${task.status}","${task.priority}","${task.projectTitle}","${task.assigneeName}",${task.estimatedHours},${task.actualHours},${task.completionPercentage},"${task.dueDate}","${task.createdAt}"\\n`;
      });
      csvContent += '\\n';
    }

    if (exportType === 'overview' || exportType === 'time') {
      csvContent += 'TIME ENTRY REPORT\\n';
      csvContent += 'ID,User,Email,Project,Description,Hours,Billable,Rate,Amount,Date,Approved,Created\\n';
      data.detailedData.timeEntries.forEach((entry: any) => {
        csvContent += `"${entry.id}","${entry.userName}","${entry.userEmail}","${entry.projectTitle}","${entry.description}",${entry.hours},${entry.billable},"${entry.hourlyRate}","${entry.totalAmount}","${entry.date}",${entry.isApproved},"${entry.createdAt}"\\n`;
      });
      csvContent += '\\n';
    }

    if (exportType === 'overview' || exportType === 'staff') {
      csvContent += 'TEAM PERFORMANCE REPORT\\n';
      csvContent += 'Name,Role,Department,Position,Total Hours,Billable Hours,Billable Ratio,Completed Tasks,Total Tasks,Task Completion Rate,Hourly Rate\\n';
      data.detailedData.staff.forEach((member: any) => {
        csvContent += `"${member.name}","${member.role}","${member.department}","${member.position}",${member.totalHours},${member.billableHours},${member.billableRatio},${member.completedTasks},${member.totalTasks},${member.taskCompletionRate},"${member.hourlyRate}"\\n`;
      });
    }

    return csvContent;
  };

  const exportToHTML = (data: any) => {
    const { metadata, overview } = data;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${metadata.reportTitle}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f8fafc;
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 30px; 
            border-radius: 10px; 
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .kpi-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 20px; 
            margin: 30px 0; 
        }
        .kpi-card { 
            background: white; 
            padding: 25px; 
            border-radius: 10px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-left: 4px solid;
        }
        .kpi-card.productivity { border-left-color: #10b981; }
        .kpi-card.budget { border-left-color: #3b82f6; }
        .kpi-card.team { border-left-color: #8b5cf6; }
        .kpi-card.billable { border-left-color: #f59e0b; }
        .kpi-value { 
            font-size: 2.5rem; 
            font-weight: bold; 
            margin: 10px 0;
        }
        .kpi-card.productivity .kpi-value { color: #10b981; }
        .kpi-card.budget .kpi-value { color: #3b82f6; }
        .kpi-card.team .kpi-value { color: #8b5cf6; }
        .kpi-card.billable .kpi-value { color: #f59e0b; }
        .section { 
            background: white; 
            margin: 30px 0; 
            padding: 25px; 
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section h2 { 
            color: #1f2937; 
            border-bottom: 2px solid #e5e7eb; 
            padding-bottom: 10px;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
        }
        th, td { 
            padding: 12px; 
            text-align: left; 
            border-bottom: 1px solid #e5e7eb; 
        }
        th { 
            background: #f9fafb; 
            font-weight: 600; 
            color: #374151;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .stat-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #f3f4f6;
        }
        .stat-label { color: #6b7280; }
        .stat-value { font-weight: 600; color: #1f2937; }
        .footer {
            text-align: center;
            color: #6b7280;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${metadata.reportTitle}</h1>
        <p>Generated on ${metadata.generatedDate} • Report Type: ${metadata.reportType.toUpperCase()}</p>
        <p>Total Records: ${metadata.totalRecords.projects} Projects, ${metadata.totalRecords.tasks} Tasks, ${metadata.totalRecords.timeEntries} Time Entries, ${metadata.totalRecords.staffMembers} Staff Members</p>
    </div>

    <div class="kpi-grid">
        <div class="kpi-card productivity">
            <h3>Productivity Score</h3>
            <div class="kpi-value">${overview.kpis.productivityScore}%</div>
            <p>${overview.statistics.completedTasks} of ${overview.statistics.totalTasks} tasks completed</p>
        </div>
        <div class="kpi-card budget">
            <h3>Budget Efficiency</h3>
            <div class="kpi-value">${overview.kpis.budgetEfficiency}%</div>
            <p>$${overview.statistics.totalSpent.toLocaleString()} of $${overview.statistics.totalBudget.toLocaleString()} utilized</p>
        </div>
        <div class="kpi-card team">
            <h3>Team Utilization</h3>
            <div class="kpi-value">${overview.kpis.teamUtilization}%</div>
            <p>${overview.statistics.activeStaff} of ${overview.statistics.totalStaff} staff active</p>
        </div>
        <div class="kpi-card billable">
            <h3>Billable Ratio</h3>
            <div class="kpi-value">${overview.kpis.billableRatio}%</div>
            <p>${overview.statistics.billableHours}h of ${overview.statistics.totalHours}h billable</p>
        </div>
    </div>

    <div class="section">
        <h2>Department Performance</h2>
        <table>
            <thead>
                <tr>
                    <th>Department</th>
                    <th>Total Projects</th>
                    <th>Active</th>
                    <th>Completed</th>
                    <th>Budget</th>
                    <th>Avg Progress</th>
                </tr>
            </thead>
            <tbody>
                ${overview.departmentBreakdown.map(dept => `
                    <tr>
                        <td><strong>${dept.department}</strong></td>
                        <td>${dept.totalProjects}</td>
                        <td>${dept.activeProjects}</td>
                        <td>${dept.completedProjects}</td>
                        <td>$${dept.totalBudget.toLocaleString()}</td>
                        <td>${dept.avgProgress.toFixed(1)}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Top Team Performance</h2>
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Total Hours</th>
                    <th>Billable Hours</th>
                    <th>Tasks Completed</th>
                    <th>Completion Rate</th>
                </tr>
            </thead>
            <tbody>
                ${overview.teamPerformance.map(member => `
                    <tr>
                        <td><strong>${member.name}</strong></td>
                        <td>${member.role}</td>
                        <td>${member.department}</td>
                        <td>${member.totalHours}h</td>
                        <td>${member.billableHours}h (${member.billableRatio}%)</td>
                        <td>${member.completedTasks}/${member.totalTasks}</td>
                        <td>${member.taskCompletionRate}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="footer">
        <p>🤖 Generated with NexaCore ERP System • ${new Date().getFullYear()} NexaCore Innovations</p>
        <p>Report ID: ${metadata.generatedAt}</p>
    </div>
</body>
</html>
    `;
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      const reportData = generateReportData();
      let content = '';
      let filename = '';
      let mimeType = '';

      switch (exportFormat) {
        case 'csv':
          content = exportToCSV(reportData);
          filename = `nexacore-erp-${exportType}-${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv;charset=utf-8;';
          break;
          
        case 'json':
          content = JSON.stringify(reportData, null, 2);
          filename = `nexacore-erp-${exportType}-${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json;charset=utf-8;';
          break;
          
        case 'html':
          content = exportToHTML(reportData);
          filename = `nexacore-erp-${exportType}-${new Date().toISOString().split('T')[0]}.html`;
          mimeType = 'text/html;charset=utf-8;';
          break;
      }

      // Create and trigger download
      const blob = new Blob([content], { type: mimeType });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast.success(`Report exported successfully as ${exportFormat.toUpperCase()}`);
      setIsExportModalOpen(false);
      
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  // Drill-down functionality
  const handleDrillDown = (type: 'department' | 'status' | 'performance', data: any) => {
    setDrillDownType(type);
    
    switch (type) {
      case 'department': {
        const deptData = {
          title: `${data.department} Department Analysis`,
          projects: projects.filter(p => p.department === data.department),
          tasks: tasks.filter(t => projects.find(p => p.id === t.erp_project_id && p.department === data.department)),
          timeEntries: timeEntries.filter(entry => 
            projects.find(p => p.id === entry.project_id && p.department === data.department)
          ),
          staff: staffRoles.filter(s => s.department === data.department && s.is_active)
        };
        setDrillDownData(deptData);
        break;
      }
        
      case 'status': {
        const statusData = {
          title: `${data.status.charAt(0).toUpperCase() + data.status.slice(1)} Projects Analysis`,
          projects: projects.filter(p => p.status === data.status),
          tasks: tasks.filter(t => projects.find(p => p.id === t.erp_project_id && p.status === data.status)),
          metrics: {
            totalBudget: projects.filter(p => p.status === data.status).reduce((sum, p) => sum + (p.budget || 0), 0),
            avgProgress: projects.filter(p => p.status === data.status).reduce((sum, p) => sum + (p.progress || 0), 0) / Math.max(projects.filter(p => p.status === data.status).length, 1)
          }
        };
        setDrillDownData(statusData);
        break;
      }
        
      case 'performance': {
        const performanceData = {
          title: `${data.name} Performance Analysis`,
          staff: data,
          tasks: tasks.filter(t => t.assigned_to === data.user_id),
          timeEntries: timeEntries.filter(e => e.user_id === data.user_id),
          projects: Array.from(new Set(
            tasks.filter(t => t.assigned_to === data.user_id).map(t => t.erp_project_id)
          )).map(id => projects.find(p => p.id === id)).filter(Boolean)
        };
        setDrillDownData(performanceData);
        break;
      }
    }
    
    setIsDrillDownOpen(true);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || project.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading ERP system...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">ERP System Management</h2>
          <p className="text-muted-foreground">
            Comprehensive oversight and control of the internal ERP system
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadERPData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button variant="outline" onClick={() => setIsExportModalOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FolderOpen className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{erpStats.totalProjects}</p>
                <p className="text-xs text-green-400">{erpStats.activeProjects} active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{erpStats.totalTasks}</p>
                <p className="text-xs text-green-400">{erpStats.completedTasks} completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Staff</p>
                <p className="text-2xl font-bold">{erpStats.activeStaff}</p>
                <p className="text-xs text-muted-foreground">{erpStats.totalStaff} total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{erpStats.totalHours.toFixed(1)}</p>
                <p className="text-xs text-green-400">{erpStats.billableHours.toFixed(1)} billable</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-indigo-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">${erpStats.totalBudget.toLocaleString()}</p>
                <p className="text-xs text-red-400">${erpStats.totalSpent.toLocaleString()} spent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-pink-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Avg. Completion</p>
                <p className="text-2xl font-bold">{erpStats.averageProjectCompletion.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">project progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="time" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time Tracking
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
        </TabsList>

        {/* Enhanced Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Performance Indicators Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="relative overflow-hidden">
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
                  </div>
                  <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress 
                    value={(erpStats.completedTasks / Math.max(erpStats.totalTasks, 1)) * 100} 
                    className="h-2"
                  />
                </div>
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
                    <p className="text-sm font-medium text-muted-foreground">Team Utilization</p>
                    <p className="text-3xl font-bold text-purple-500">
                      {((erpStats.activeStaff / Math.max(erpStats.totalStaff, 1)) * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {erpStats.activeStaff} of {erpStats.totalStaff} staff active
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress 
                    value={(erpStats.activeStaff / Math.max(erpStats.totalStaff, 1)) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Billable Ratio</p>
                    <p className="text-3xl font-bold text-orange-500">
                      {((erpStats.billableHours / Math.max(erpStats.totalHours, 1)) * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {erpStats.billableHours.toFixed(1)}h of {erpStats.totalHours.toFixed(1)}h
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress 
                    value={(erpStats.billableHours / Math.max(erpStats.totalHours, 1)) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Business Intelligence Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Real-Time Forecasting */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  Predictive Analytics & Forecasting
                </CardTitle>
                <CardDescription>AI-powered business forecasting and trend analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Revenue Forecast */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        Revenue Forecast (Next 3 Months)
                      </h4>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                          <span className="text-green-600 font-medium">+18% projected growth</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ width: '100%', height: '200px' }}>
                      <ResponsiveContainer>
                        <AreaChart
                          data={[
                            { month: 'Current', actual: erpStats.totalBudget, forecast: erpStats.totalBudget },
                            { month: 'Month +1', actual: null, forecast: erpStats.totalBudget * 1.06 },
                            { month: 'Month +2', actual: null, forecast: erpStats.totalBudget * 1.12 },
                            { month: 'Month +3', actual: null, forecast: erpStats.totalBudget * 1.18 }
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                          <Tooltip 
                            formatter={(value: any) => [`$${value?.toLocaleString()}`, 'Revenue']}
                            labelFormatter={(label) => `${label}`}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="actual" 
                            stroke="#10b981" 
                            fill="#10b981" 
                            fillOpacity={0.3}
                            strokeWidth={2}
                            name="Actual Revenue"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="forecast" 
                            stroke="#3b82f6" 
                            fill="#3b82f6" 
                            fillOpacity={0.2}
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            name="Forecasted Revenue"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Productivity Trends */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        Team Productivity Trend
                      </h4>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        7-Day Moving Average
                      </Badge>
                    </div>
                    <div style={{ width: '100%', height: '180px' }}>
                      <ResponsiveContainer>
                        <LineChart
                          data={[
                            { day: 'Mon', productivity: 78, efficiency: 85 },
                            { day: 'Tue', productivity: 82, efficiency: 88 },
                            { day: 'Wed', productivity: 79, efficiency: 82 },
                            { day: 'Thu', productivity: 85, efficiency: 91 },
                            { day: 'Fri', productivity: 88, efficiency: 89 },
                            { day: 'Sat', productivity: 76, efficiency: 80 },
                            { day: 'Sun', productivity: 72, efficiency: 75 }
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis domain={[60, 100]} tickFormatter={(value) => `${value}%`} />
                          <Tooltip formatter={(value: any) => [`${value}%`]} />
                          <Line 
                            type="monotone" 
                            dataKey="productivity" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                            name="Productivity Score"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="efficiency" 
                            stroke="#10b981" 
                            strokeWidth={3}
                            dot={{ fill: '#10b981', strokeWidth: 2 }}
                            name="Task Efficiency"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Smart Alerts & Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  Smart Insights & Alerts
                </CardTitle>
                <CardDescription>AI-powered business intelligence alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Critical Alert */}
                  <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-red-900 mb-1">Budget Overrun Risk</h5>
                        <p className="text-sm text-red-800 mb-2">
                          3 projects are approaching budget limits. Immediate action required.
                        </p>
                        <Button size="sm" variant="outline" className="text-red-700 border-red-300 hover:bg-red-100">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Opportunity Alert */}
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-green-900 mb-1">Efficiency Opportunity</h5>
                        <p className="text-sm text-green-800 mb-2">
                          Team capacity available. Consider accelerating Project Alpha.
                        </p>
                        <Button size="sm" variant="outline" className="text-green-700 border-green-300 hover:bg-green-100">
                          Optimize Now
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Performance Insights */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Activity className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-blue-900 mb-1">Performance Insight</h5>
                        <p className="text-sm text-blue-800 mb-2">
                          Development team is 23% above average productivity this week.
                        </p>
                        <Button size="sm" variant="outline" className="text-blue-700 border-blue-300 hover:bg-blue-100">
                          Analyze Factors
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Financial Insight */}
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <DollarSign className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-purple-900 mb-1">Revenue Optimization</h5>
                        <p className="text-sm text-purple-800 mb-2">
                          Increase billable hours by 12% with strategic task reallocation.
                        </p>
                        <Button size="sm" variant="outline" className="text-purple-700 border-purple-300 hover:bg-purple-100">
                          View Strategy
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Financial Intelligence */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* ROI Metrics */}
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ROI This Quarter</p>
                    <p className="text-3xl font-bold text-emerald-500">
                      {((erpStats.totalBudget - erpStats.totalSpent) / Math.max(erpStats.totalSpent, 1) * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ${(erpStats.totalBudget - erpStats.totalSpent).toLocaleString()} profit
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-emerald-600">+8.3% vs last quarter</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cash Flow Velocity */}
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cash Flow Velocity</p>
                    <p className="text-3xl font-bold text-blue-500">
                      {(erpStats.totalBudget / 30).toFixed(1)}K
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">per day average</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">75% of target velocity</p>
                </div>
              </CardContent>
            </Card>

            {/* Resource Utilization */}
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Resource Efficiency</p>
                    <p className="text-3xl font-bold text-purple-500">
                      {((erpStats.billableHours / Math.max(erpStats.totalHours, 1)) * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {erpStats.totalHours.toFixed(1)}h total capacity
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-purple-600">Optimizing allocation</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Velocity */}
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Delivery Velocity</p>
                    <p className="text-3xl font-bold text-orange-500">
                      {(erpStats.completedTasks / Math.max(erpStats.activeProjects, 1)).toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">tasks per active project</p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Target className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                      <span className="text-orange-600">Above industry avg</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Status Distribution - Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Project Status Distribution
                </CardTitle>
                <CardDescription>Visual breakdown of all project statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Active', value: projects.filter(p => p.status === 'active').length, fill: '#10b981' },
                          { name: 'In Progress', value: projects.filter(p => p.status === 'in_progress').length, fill: '#3b82f6' },
                          { name: 'Pending', value: projects.filter(p => p.status === 'pending').length, fill: '#f59e0b' },
                          { name: 'Completed', value: projects.filter(p => p.status === 'completed').length, fill: '#8b5cf6' },
                          { name: 'On Hold', value: projects.filter(p => p.status === 'on_hold').length, fill: '#ef4444' }
                        ].filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {[
                          { name: 'Active', value: projects.filter(p => p.status === 'active').length, fill: '#10b981' },
                          { name: 'In Progress', value: projects.filter(p => p.status === 'in_progress').length, fill: '#3b82f6' },
                          { name: 'Pending', value: projects.filter(p => p.status === 'pending').length, fill: '#f59e0b' },
                          { name: 'Completed', value: projects.filter(p => p.status === 'completed').length, fill: '#8b5cf6' },
                          { name: 'On Hold', value: projects.filter(p => p.status === 'on_hold').length, fill: '#ef4444' }
                        ].filter(item => item.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Department Workload - Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-green-500" />
                  Department Workload Analysis
                </CardTitle>
                <CardDescription>Project distribution across departments</CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={Array.from(new Set(projects.map(p => p.department).filter(Boolean))).map(dept => ({
                        department: dept,
                        total: projects.filter(p => p.department === dept).length,
                        active: projects.filter(p => p.department === dept && p.status === 'active').length,
                        completed: projects.filter(p => p.department === dept && p.status === 'completed').length
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" fill="#3b82f6" name="Total Projects" />
                      <Bar dataKey="active" fill="#10b981" name="Active Projects" />
                      <Bar dataKey="completed" fill="#8b5cf6" name="Completed Projects" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Performance and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Team Performance Metrics */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  Team Performance Overview
                </CardTitle>
                <CardDescription>Individual team member statistics and contributions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {staffRoles.filter(staff => staff.is_active).slice(0, 6).map((staff) => {
                    const staffTimeEntries = timeEntries.filter(entry => entry.user_id === staff.user_id);
                    const totalHours = staffTimeEntries.reduce((sum, entry) => sum + entry.hours, 0);
                    const billableHours = staffTimeEntries.filter(entry => entry.billable).reduce((sum, entry) => sum + entry.hours, 0);
                    const completedTasks = tasks.filter(task => task.assigned_to === staff.user_id && task.status === 'completed').length;
                    
                    return (
                      <div key={staff.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/20 to-muted/5 rounded-lg border">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {staff.user?.full_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold">{staff.user?.full_name || 'Unknown User'}</p>
                            <p className="text-sm text-muted-foreground">{staff.position} • {staff.department}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-8 text-right">
                          <div>
                            <p className="text-2xl font-bold text-blue-600">{totalHours.toFixed(1)}</p>
                            <p className="text-xs text-muted-foreground">Total Hours</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-green-600">{billableHours.toFixed(1)}</p>
                            <p className="text-xs text-muted-foreground">Billable</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-purple-600">{completedTasks}</p>
                            <p className="text-xs text-muted-foreground">Tasks Done</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions and System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-500" />
                  System Health & Actions
                </CardTitle>
                <CardDescription>Real-time system status and quick actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* System Health Indicators */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Database</span>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">API Services</span>
                    </div>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium">Pending Reviews</span>
                    </div>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      {timeEntries.filter(entry => !entry.is_approved).length}
                    </Badge>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="pt-4 space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={loadERPData}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh All Data
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setIsExportModalOpen(true)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Analytics
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    System Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Stream */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-indigo-500" />
                Live Activity Stream
              </CardTitle>
              <CardDescription>Real-time updates and recent actions across the ERP system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {timeEntries.slice(0, 8).map((entry, index) => (
                  <div key={entry.id} className={`flex items-center gap-4 p-4 rounded-lg border-l-4 ${
                    index === 0 ? 'border-l-emerald-500 bg-emerald-50/50' : 
                    entry.is_approved ? 'border-l-blue-500 bg-blue-50/50' : 
                    'border-l-yellow-500 bg-yellow-50/50'
                  }`}>
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      entry.is_approved ? 'bg-blue-100' : 'bg-yellow-100'
                    }`}>
                      {entry.is_approved ? (
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">{entry.user?.full_name || 'Unknown User'}</p>
                        <Badge variant={entry.is_approved ? 'default' : 'secondary'} className="text-xs">
                          {entry.is_approved ? 'Approved' : 'Pending'}
                        </Badge>
                        {entry.billable && (
                          <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                            Billable
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Logged <span className="font-medium text-blue-600">{entry.hours}h</span> on 
                        <span className="font-medium"> "{entry.erp_project?.title}"</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{entry.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(entry.date).toLocaleDateString()} • 
                        {new Date(entry.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    {!entry.is_approved && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => approveTimeEntry(entry.id, true)}>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => approveTimeEntry(entry.id, false)}>
                          <XCircle className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          {/* AI-Powered Project Intelligence Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-purple-600" />
                  AI-Powered Project Intelligence Dashboard
                </CardTitle>
                <CardDescription>
                  Advanced analytics with risk assessment, predictive insights, and smart recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {/* Risk Assessment Cards */}
                  <Card className="border-l-4 border-l-red-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-red-600">3</div>
                          <div className="text-sm text-muted-foreground">High Risk Projects</div>
                        </div>
                        <AlertCircle className="h-8 w-8 text-red-500" />
                      </div>
                      <div className="mt-2 text-xs">
                        <div className="flex justify-between">
                          <span>Budget overrun risk</span>
                          <span className="font-medium">67%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Timeline risk</span>
                          <span className="font-medium">45%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-yellow-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-yellow-600">5</div>
                          <div className="text-sm text-muted-foreground">Medium Risk Projects</div>
                        </div>
                        <AlertCircle className="h-8 w-8 text-yellow-500" />
                      </div>
                      <div className="mt-2 text-xs">
                        <div className="flex justify-between">
                          <span>Resource risk</span>
                          <span className="font-medium">32%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quality risk</span>
                          <span className="font-medium">28%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">15</div>
                          <div className="text-sm text-muted-foreground">AI Recommendations</div>
                        </div>
                        <Activity className="h-8 w-8 text-blue-500" />
                      </div>
                      <div className="mt-2 text-xs">
                        <div className="flex justify-between">
                          <span>Optimization tips</span>
                          <span className="font-medium">8</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Resource reallocation</span>
                          <span className="font-medium">7</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-green-600">94%</div>
                          <div className="text-sm text-muted-foreground">Success Prediction</div>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-500" />
                      </div>
                      <div className="mt-2 text-xs">
                        <div className="flex justify-between">
                          <span>On-time delivery</span>
                          <span className="font-medium">91%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Budget compliance</span>
                          <span className="font-medium">89%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* AI Insights and Recommendations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="h-5 w-5 text-purple-600" />
                        AI Risk Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          {
                            project: "Mobile App Redesign",
                            risk: "High",
                            factor: "Resource Shortage",
                            confidence: 87,
                            recommendation: "Reallocate 2 developers from Project X"
                          },
                          {
                            project: "API Integration",
                            risk: "Medium",
                            factor: "Timeline Pressure",
                            confidence: 73,
                            recommendation: "Consider parallel development streams"
                          },
                          {
                            project: "Database Migration",
                            risk: "High",
                            factor: "Technical Complexity",
                            confidence: 91,
                            recommendation: "Bring in external database specialist"
                          }
                        ].map((risk, index) => (
                          <div key={index} className="p-3 bg-white rounded-lg border">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-sm">{risk.project}</div>
                              <Badge variant={risk.risk === 'High' ? 'destructive' : 'secondary'}>
                                {risk.risk} Risk
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mb-1">
                              Primary Factor: {risk.factor}
                            </div>
                            <div className="text-xs text-muted-foreground mb-2">
                              AI Confidence: {risk.confidence}%
                            </div>
                            <div className="text-xs bg-blue-50 p-2 rounded border-l-2 border-blue-400">
                              💡 {risk.recommendation}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        Smart Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          {
                            type: "Resource Optimization",
                            impact: "High",
                            savings: "$45K",
                            action: "Cross-train 3 team members on React Native to reduce external contractor dependency"
                          },
                          {
                            type: "Timeline Acceleration",
                            impact: "Medium",
                            savings: "2 weeks",
                            action: "Implement automated testing pipeline to reduce QA bottlenecks by 40%"
                          },
                          {
                            type: "Cost Reduction",
                            impact: "High",
                            savings: "$28K",
                            action: "Consolidate cloud services across 4 projects to leverage volume discounts"
                          },
                          {
                            type: "Quality Improvement",
                            impact: "Medium",
                            savings: "15% defects",
                            action: "Introduce peer code review process for all critical components"
                          }
                        ].map((rec, index) => (
                          <div key={index} className="p-3 bg-white rounded-lg border">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-sm">{rec.type}</div>
                              <div className="flex items-center gap-2">
                                <Badge variant={rec.impact === 'High' ? 'default' : 'secondary'}>
                                  {rec.impact} Impact
                                </Badge>
                                <div className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                                  Save {rec.savings}
                                </div>
                              </div>
                            </div>
                            <div className="text-xs bg-green-50 p-2 rounded border-l-2 border-green-400">
                              🎯 {rec.action}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Filters and Controls */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="search">Search Projects</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by title or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="department-filter">Department</Label>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {Array.from(new Set(projects.map(p => p.department).filter(Boolean))).map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="risk-filter">AI Risk Level</Label>
                  <Select value="all">
                    <SelectTrigger>
                      <SelectValue placeholder="All Risk Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risk Levels</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="low">Low Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="view-mode">View Mode</Label>
                  <Select value="table">
                    <SelectTrigger>
                      <SelectValue placeholder="Select View" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="table">Table View</SelectItem>
                      <SelectItem value="kanban">Kanban Board</SelectItem>
                      <SelectItem value="gantt">Gantt Chart</SelectItem>
                      <SelectItem value="calendar">Calendar View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects Table */}
          <Card>
            <CardHeader>
              <CardTitle>ERP Projects ({filteredProjects.length})</CardTitle>
              <CardDescription>Manage and monitor all internal projects</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{project.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {project.description}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(project.start_date).toLocaleDateString()} - {' '}
                            {new Date(project.end_date).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={project.status} 
                          onValueChange={(newStatus) => updateProjectStatus(project.id, newStatus)}
                        >
                          <SelectTrigger className="w-32">
                            <Badge className={getStatusColor(project.status)}>
                              {project.status.replace('_', ' ')}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="on_hold">On Hold</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-sm">{project.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">${project.budget?.toLocaleString()}</div>
                          <div className="text-muted-foreground">
                            ${project.actual_cost?.toLocaleString()} spent
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{project.department}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedProject(project);
                              setIsProjectModalOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ERP Tasks ({tasks.length})</CardTitle>
              <CardDescription>Monitor and manage all project tasks</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.slice(0, 20).map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {task.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{task.erp_project?.title}</div>
                          <Badge className={getStatusColor(task.erp_project?.status || '')}>
                            {task.erp_project?.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{task.assignee?.full_name || 'Unassigned'}</div>
                          <div className="text-muted-foreground">{task.assignee?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${task.completion_percentage}%` }}
                            />
                          </div>
                          <span className="text-sm">{task.completion_percentage}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time Tracking Tab */}
        <TabsContent value="time" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Time Entries ({timeEntries.length})</CardTitle>
                  <CardDescription>Review and approve time tracking entries</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve All Pending
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{entry.user?.full_name || 'Unknown'}</div>
                          <div className="text-muted-foreground">{entry.user?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{entry.erp_project?.title}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{entry.erp_task?.title || 'General'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm max-w-xs truncate">{entry.description}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{entry.hours}h</span>
                          {entry.billable && (
                            <Badge variant="outline" className="text-xs">Billable</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{new Date(entry.date).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={entry.is_approved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                          {entry.is_approved ? 'Approved' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {!entry.is_approved && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => approveTimeEntry(entry.id, true)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => approveTimeEntry(entry.id, false)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ERP Team Members ({staffRoles.length})</CardTitle>
              <CardDescription>Monitor staff roles and permissions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hourly Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{role.user?.full_name || 'No name'}</div>
                          <div className="text-sm text-muted-foreground">{role.user?.email}</div>
                          {role.position && (
                            <div className="text-xs text-muted-foreground">{role.position}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`bg-blue-500/20 text-blue-400 border-blue-500/30`}>
                          {role.role.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{role.department || 'No department'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {role.can_create_projects && (
                            <Badge variant="outline" className="text-xs">Create Projects</Badge>
                          )}
                          {role.can_approve_timesheets && (
                            <Badge variant="outline" className="text-xs">Approve Time</Badge>
                          )}
                          {role.can_manage_users && (
                            <Badge variant="outline" className="text-xs">Manage Users</Badge>
                          )}
                          {role.can_view_all_projects && (
                            <Badge variant="outline" className="text-xs">View All</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={role.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                          {role.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {role.hourly_rate ? `$${role.hourly_rate}/hr` : 'Not set'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Project Detail Modal */}
      <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Details: {selectedProject?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedProject && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Project Information</h4>
                  <div className="space-y-2">
                    <div><strong>Status:</strong> <Badge className={getStatusColor(selectedProject.status)}>{selectedProject.status}</Badge></div>
                    <div><strong>Priority:</strong> <Badge className={getPriorityColor(selectedProject.priority)}>{selectedProject.priority}</Badge></div>
                    <div><strong>Progress:</strong> {selectedProject.progress}%</div>
                    <div><strong>Department:</strong> {selectedProject.department}</div>
                    <div><strong>Type:</strong> {selectedProject.project_type}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Financial Information</h4>
                  <div className="space-y-2">
                    <div><strong>Budget:</strong> ${selectedProject.budget?.toLocaleString()}</div>
                    <div><strong>Actual Cost:</strong> ${selectedProject.actual_cost?.toLocaleString()}</div>
                    <div><strong>Remaining:</strong> ${(selectedProject.budget - selectedProject.actual_cost)?.toLocaleString()}</div>
                    <div><strong>Utilization:</strong> {((selectedProject.actual_cost / selectedProject.budget) * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Description</h4>
                <p className="text-muted-foreground">{selectedProject.description}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Timeline</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><strong>Start Date:</strong> {new Date(selectedProject.start_date).toLocaleDateString()}</div>
                  <div><strong>End Date:</strong> {new Date(selectedProject.end_date).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProjectModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Modal */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-500" />
              Export ERP Analytics Report
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Generate comprehensive reports with real-time analytics and data insights
            </p>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Export Type Selection */}
            <div>
              <Label className="text-sm font-medium">Report Type</Label>
              <Select value={exportType} onValueChange={(value: any) => setExportType(value)}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Complete Overview</div>
                        <div className="text-xs text-muted-foreground">All modules with KPIs and analytics</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="projects">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Projects Report</div>
                        <div className="text-xs text-muted-foreground">Detailed project data and status</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="tasks">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Tasks Report</div>
                        <div className="text-xs text-muted-foreground">Task assignments and completion data</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="time">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Time Tracking Report</div>
                        <div className="text-xs text-muted-foreground">Hours logged and billing information</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="staff">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Team Performance</div>
                        <div className="text-xs text-muted-foreground">Staff productivity and metrics</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Export Format Selection */}
            <div>
              <Label className="text-sm font-medium">Export Format</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <Card 
                  className={`p-4 cursor-pointer transition-all border-2 ${
                    exportFormat === 'csv' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setExportFormat('csv')}
                >
                  <div className="text-center">
                    <FileText className={`h-8 w-8 mx-auto mb-2 ${exportFormat === 'csv' ? 'text-blue-500' : 'text-gray-500'}`} />
                    <div className="font-medium text-sm">CSV</div>
                    <div className="text-xs text-muted-foreground">Spreadsheet Data</div>
                  </div>
                </Card>

                <Card 
                  className={`p-4 cursor-pointer transition-all border-2 ${
                    exportFormat === 'json' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setExportFormat('json')}
                >
                  <div className="text-center">
                    <Activity className={`h-8 w-8 mx-auto mb-2 ${exportFormat === 'json' ? 'text-blue-500' : 'text-gray-500'}`} />
                    <div className="font-medium text-sm">JSON</div>
                    <div className="text-xs text-muted-foreground">Structured Data</div>
                  </div>
                </Card>

                <Card 
                  className={`p-4 cursor-pointer transition-all border-2 ${
                    exportFormat === 'html' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setExportFormat('html')}
                >
                  <div className="text-center">
                    <FileText className={`h-8 w-8 mx-auto mb-2 ${exportFormat === 'html' ? 'text-blue-500' : 'text-gray-500'}`} />
                    <div className="font-medium text-sm">HTML</div>
                    <div className="text-xs text-muted-foreground">Visual Report</div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Report Preview Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Report Preview</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <div>• <strong>Type:</strong> {exportType.charAt(0).toUpperCase() + exportType.slice(1)} Report</div>
                    <div>• <strong>Format:</strong> {exportFormat.toUpperCase()}</div>
                    <div>• <strong>Records:</strong> {
                      exportType === 'overview' ? 'All data categories' :
                      exportType === 'projects' ? `${projects.length} projects` :
                      exportType === 'tasks' ? `${tasks.length} tasks` :
                      exportType === 'time' ? `${timeEntries.length} time entries` :
                      exportType === 'staff' ? `${staffRoles.length} staff members` : 'N/A'
                    }</div>
                    <div>• <strong>Generated:</strong> {new Date().toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsExportModalOpen(false)} disabled={isExporting}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="min-w-[120px]"
            >
              {isExporting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Exporting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Report
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Interactive Drill-Down Modal */}
      <Dialog open={isDrillDownOpen} onOpenChange={setIsDrillDownOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              Interactive Data Analysis - {drillDownType.charAt(0).toUpperCase() + drillDownType.slice(1)} Deep Dive
            </DialogTitle>
            <DialogDescription className="text-base">
              Advanced analytics and insights for detailed data exploration
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col h-[70vh] overflow-hidden">
            {/* Drill-down Type Selector */}
            <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
              <Button
                size="sm"
                variant={drillDownType === 'department' ? 'default' : 'ghost'}
                onClick={() => setDrillDownType('department')}
                className="flex-1"
              >
                <Building className="h-4 w-4 mr-1" />
                Department Analysis
              </Button>
              <Button
                size="sm"
                variant={drillDownType === 'status' ? 'default' : 'ghost'}
                onClick={() => setDrillDownType('status')}
                className="flex-1"
              >
                <Activity className="h-4 w-4 mr-1" />
                Status Overview
              </Button>
              <Button
                size="sm"
                variant={drillDownType === 'performance' ? 'default' : 'ghost'}
                onClick={() => setDrillDownType('performance')}
                className="flex-1"
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                Performance Metrics
              </Button>
            </div>

            <div className="flex-1 overflow-auto">
              {/* Department Analysis */}
              {drillDownType === 'department' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Department Resource Allocation */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Resource Allocation by Department</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Engineering', value: 45, color: '#3b82f6' },
                                { name: 'Design', value: 25, color: '#10b981' },
                                { name: 'Marketing', value: 15, color: '#f59e0b' },
                                { name: 'Operations', value: 15, color: '#ef4444' }
                              ]}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, value }) => `${name}: ${value}%`}
                            >
                              {[
                                { name: 'Engineering', value: 45, color: '#3b82f6' },
                                { name: 'Design', value: 25, color: '#10b981' },
                                { name: 'Marketing', value: 15, color: '#f59e0b' },
                                { name: 'Operations', value: 15, color: '#ef4444' }
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Department Performance Trends */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Department Performance Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={[
                            { month: 'Jan', Engineering: 85, Design: 78, Marketing: 72, Operations: 88 },
                            { month: 'Feb', Engineering: 88, Design: 82, Marketing: 75, Operations: 85 },
                            { month: 'Mar', Engineering: 92, Design: 85, Marketing: 78, Operations: 90 },
                            { month: 'Apr', Engineering: 89, Design: 88, Marketing: 82, Operations: 87 },
                            { month: 'May', Engineering: 94, Design: 91, Marketing: 85, Operations: 92 },
                            { month: 'Jun', Engineering: 96, Design: 89, Marketing: 88, Operations: 94 }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="Engineering" stroke="#3b82f6" strokeWidth={2} />
                            <Line type="monotone" dataKey="Design" stroke="#10b981" strokeWidth={2} />
                            <Line type="monotone" dataKey="Marketing" stroke="#f59e0b" strokeWidth={2} />
                            <Line type="monotone" dataKey="Operations" stroke="#ef4444" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Department Detailed Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { dept: 'Engineering', projects: 12, staff: 8, efficiency: 94, budget: 850000 },
                      { dept: 'Design', projects: 8, staff: 5, efficiency: 89, budget: 420000 },
                      { dept: 'Marketing', projects: 6, staff: 4, efficiency: 88, budget: 320000 },
                      { dept: 'Operations', projects: 5, staff: 3, efficiency: 94, budget: 280000 }
                    ].map((dept) => (
                      <Card key={dept.dept} className="hover:shadow-md transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                            <h3 className="font-semibold">{dept.dept}</h3>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Active Projects:</span>
                              <span className="font-medium">{dept.projects}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Team Size:</span>
                              <span className="font-medium">{dept.staff}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Efficiency:</span>
                              <span className="font-medium text-green-600">{dept.efficiency}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Budget:</span>
                              <span className="font-medium">${(dept.budget / 1000).toFixed(0)}K</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Overview */}
              {drillDownType === 'status' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Status Distribution */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Project Status Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={[
                            { status: 'Active', count: 15, percentage: 45 },
                            { status: 'In Progress', count: 8, percentage: 24 },
                            { status: 'Completed', count: 6, percentage: 18 },
                            { status: 'On Hold', count: 3, percentage: 9 },
                            { status: 'Cancelled', count: 1, percentage: 3 }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="status" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Status Timeline */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Status Change Timeline</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <AreaChart data={[
                            { month: 'Jan', completed: 2, active: 12, onHold: 1 },
                            { month: 'Feb', completed: 3, active: 14, onHold: 2 },
                            { month: 'Mar', completed: 4, active: 15, onHold: 1 },
                            { month: 'Apr', completed: 5, active: 13, onHold: 3 },
                            { month: 'May', completed: 6, active: 15, onHold: 2 },
                            { month: 'Jun', completed: 6, active: 15, onHold: 3 }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="completed" stackId="1" stroke="#10b981" fill="#10b981" />
                            <Area type="monotone" dataKey="active" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                            <Area type="monotone" dataKey="onHold" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Status Details Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Detailed Status Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Count</TableHead>
                            <TableHead>Avg Duration</TableHead>
                            <TableHead>Budget Impact</TableHead>
                            <TableHead>Next Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[
                            { status: 'Active', count: 15, duration: '2.3 months', budget: '+$45K', action: 'Monitor progress' },
                            { status: 'In Progress', count: 8, duration: '1.8 months', budget: '+$32K', action: 'Review milestones' },
                            { status: 'Completed', count: 6, duration: '3.5 months', budget: '-$8K', action: 'Post-project review' },
                            { status: 'On Hold', count: 3, duration: '0.8 months', budget: '-$15K', action: 'Resume planning' },
                            { status: 'Cancelled', count: 1, duration: '0.2 months', budget: '-$25K', action: 'Document lessons' }
                          ].map((item) => (
                            <TableRow key={item.status}>
                              <TableCell>
                                <Badge 
                                  variant={
                                    item.status === 'Active' ? 'default' :
                                    item.status === 'Completed' ? 'secondary' :
                                    item.status === 'On Hold' ? 'destructive' : 'outline'
                                  }
                                >
                                  {item.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">{item.count}</TableCell>
                              <TableCell>{item.duration}</TableCell>
                              <TableCell className={item.budget.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                                {item.budget}
                              </TableCell>
                              <TableCell className="text-muted-foreground">{item.action}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Performance Metrics */}
              {drillDownType === 'performance' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Performance Radar Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Multi-Dimensional Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <RadarChart data={[
                            { metric: 'Quality', current: 92, target: 95, industry: 85 },
                            { metric: 'Speed', current: 88, target: 90, industry: 82 },
                            { metric: 'Cost Efficiency', current: 85, target: 88, industry: 80 },
                            { metric: 'Innovation', current: 78, target: 85, industry: 75 },
                            { metric: 'Team Satisfaction', current: 94, target: 92, industry: 78 },
                            { metric: 'Client Satisfaction', current: 96, target: 95, industry: 88 }
                          ]}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="metric" />
                            <PolarRadiusAxis angle={60} domain={[0, 100]} />
                            <Radar name="Current" dataKey="current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                            <Radar name="Target" dataKey="target" stroke="#10b981" fill="transparent" strokeDasharray="5 5" />
                            <Radar name="Industry Avg" dataKey="industry" stroke="#f59e0b" fill="transparent" strokeDasharray="3 3" />
                            <Legend />
                          </RadarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Performance Trends */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Performance Improvement Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <ComposedChart data={[
                            { month: 'Jan', performance: 82, improvement: 2, baseline: 80 },
                            { month: 'Feb', performance: 85, improvement: 3, baseline: 80 },
                            { month: 'Mar', performance: 88, improvement: 3, baseline: 80 },
                            { month: 'Apr', performance: 86, improvement: -2, baseline: 80 },
                            { month: 'May', performance: 92, improvement: 6, baseline: 80 },
                            { month: 'Jun', performance: 94, improvement: 2, baseline: 80 }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="improvement" fill="#10b981" name="Monthly Improvement" />
                            <Line type="monotone" dataKey="performance" stroke="#3b82f6" strokeWidth={3} name="Overall Performance" />
                            <Line type="monotone" dataKey="baseline" stroke="#9ca3af" strokeDasharray="5 5" name="Baseline" />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Performance KPI Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { 
                        title: 'Delivery Performance', 
                        value: '94%', 
                        change: '+3%', 
                        trend: 'up',
                        description: 'On-time project delivery rate'
                      },
                      { 
                        title: 'Budget Efficiency', 
                        value: '87%', 
                        change: '+2%', 
                        trend: 'up',
                        description: 'Projects within budget'
                      },
                      { 
                        title: 'Quality Score', 
                        value: '9.2/10', 
                        change: '+0.3', 
                        trend: 'up',
                        description: 'Average client satisfaction'
                      },
                      { 
                        title: 'Team Velocity', 
                        value: '73', 
                        change: '+8', 
                        trend: 'up',
                        description: 'Story points per sprint'
                      }
                    ].map((kpi, index) => (
                      <Card key={index} className="hover:shadow-lg transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <TrendingUp className={`h-5 w-5 ${kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                              <h3 className="font-medium text-sm">{kpi.title}</h3>
                            </div>
                            <Badge variant={kpi.trend === 'up' ? 'default' : 'destructive'} className="text-xs">
                              {kpi.change}
                            </Badge>
                          </div>
                          <div className="text-2xl font-bold text-gray-900 mb-2">{kpi.value}</div>
                          <div className="text-xs text-muted-foreground">{kpi.description}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Advanced Performance Analytics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Advanced Performance Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Target className="h-4 w-4 text-blue-500" />
                            Efficiency Metrics
                          </h4>
                          <div className="space-y-3">
                            {[
                              { metric: 'Resource Utilization', value: '89%', status: 'excellent' },
                              { metric: 'Process Efficiency', value: '82%', status: 'good' },
                              { metric: 'Automation Rate', value: '76%', status: 'improving' }
                            ].map((item) => (
                              <div key={item.metric} className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">{item.metric}</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{item.value}</span>
                                  <div className={`w-2 h-2 rounded-full ${
                                    item.status === 'excellent' ? 'bg-green-500' :
                                    item.status === 'good' ? 'bg-blue-500' : 'bg-yellow-500'
                                  }`}></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Users className="h-4 w-4 text-green-500" />
                            Team Performance
                          </h4>
                          <div className="space-y-3">
                            {[
                              { metric: 'Collaboration Index', value: '92', status: 'excellent' },
                              { metric: 'Skill Development', value: '85', status: 'good' },
                              { metric: 'Retention Rate', value: '96%', status: 'excellent' }
                            ].map((item) => (
                              <div key={item.metric} className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">{item.metric}</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{item.value}</span>
                                  <div className={`w-2 h-2 rounded-full ${
                                    item.status === 'excellent' ? 'bg-green-500' :
                                    item.status === 'good' ? 'bg-blue-500' : 'bg-yellow-500'
                                  }`}></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-purple-500" />
                            Financial Impact
                          </h4>
                          <div className="space-y-3">
                            {[
                              { metric: 'ROI Improvement', value: '+23%', status: 'excellent' },
                              { metric: 'Cost Reduction', value: '15%', status: 'good' },
                              { metric: 'Revenue Impact', value: '+$2.1M', status: 'excellent' }
                            ].map((item) => (
                              <div key={item.metric} className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">{item.metric}</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{item.value}</span>
                                  <div className={`w-2 h-2 rounded-full ${
                                    item.status === 'excellent' ? 'bg-green-500' :
                                    item.status === 'good' ? 'bg-blue-500' : 'bg-yellow-500'
                                  }`}></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDrillDownOpen(false)}>
              Close Analysis
            </Button>
            <Button onClick={() => setIsExportModalOpen(true)}>
              <Download className="h-4 w-4 mr-2" />
              Export Analysis
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}