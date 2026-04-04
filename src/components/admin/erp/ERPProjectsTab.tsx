import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  UserPlus,
  FolderOpen,
  Calendar,
  DollarSign,
  Users,
  Target,
  Clock,
  FileDown
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

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

interface ERPProjectsTabProps {
  projects: ERPProject[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (department: string) => void;
  onCreateProject: () => void;
  onEditProject: (project: ERPProject) => void;
  onViewProject: (project: ERPProject) => void;
  onAssignTeam: (project: ERPProject) => void;
  onExportProjects: () => void;
  onExportSingleProject: (project: ERPProject) => void;
}

export function ERPProjectsTab({
  projects,
  loading,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  departmentFilter,
  setDepartmentFilter,
  onCreateProject,
  onEditProject,
  onViewProject,
  onAssignTeam,
  onExportProjects,
  onExportSingleProject
}: ERPProjectsTabProps) {
  const getDepartmentLabel = (department: string) => {
    const labels: Record<string, string> = {
      'cad_engineering': 'CAD Design & Engineering',
      'civil_engineering': 'Civil Engineering',
      'architecture': 'Architecture',
      'software_development': 'Software Development',
      'ai_ml': 'AI/ML Solutions',
      'digital_services': 'Digital Services',
      'consulting': 'Professional Consulting',
      'operations': 'Operations',
      'finance': 'Finance',
      'hr': 'Human Resources',
      'marketing': 'Marketing & Sales'
    };
    return labels[department] || (department || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'on_hold': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || project.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading Projects...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Project Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                <p className="text-3xl font-bold">{projects.length}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                <p className="text-3xl font-bold text-green-600">
                  {projects.filter(p => p.status === 'in_progress').length}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-blue-600">
                  {projects.filter(p => p.status === 'completed').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                <p className="text-3xl font-bold text-purple-600">
                  ${projects.reduce((sum, p) => sum + (p.budget || 0), 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-blue-500" />
              Project Management
            </span>
            <TooltipProvider>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={onExportProjects} className="flex items-center gap-2">
                      <FileDown className="h-4 w-4" />
                      Export
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">Export Projects</p>
                    <p className="text-xs text-muted-foreground">Download project reports</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={onCreateProject} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      New Project
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">Create New Project</p>
                    <p className="text-xs text-muted-foreground">Start a new ERP project</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-[240px]">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="cad_engineering">CAD Design & Engineering</SelectItem>
                <SelectItem value="civil_engineering">Civil Engineering</SelectItem>
                <SelectItem value="architecture">Architecture</SelectItem>
                <SelectItem value="software_development">Software Development</SelectItem>
                <SelectItem value="ai_ml">AI/ML Solutions</SelectItem>
                <SelectItem value="digital_services">Digital Services</SelectItem>
                <SelectItem value="consulting">Professional Consulting</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="hr">Human Resources</SelectItem>
                <SelectItem value="marketing">Marketing & Sales</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Projects Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{project.title}</p>
                        <p className="text-sm text-muted-foreground">{getDepartmentLabel(project.department)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(project.status)}>
                        {(project.status || 'unknown').replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(project.priority)}>
                        {(project.priority || 'medium').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="w-full">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">${project.budget.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          ${project.actual_cost.toLocaleString()} spent
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(project.end_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onViewProject(project)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-medium">View Project</p>
                              <p className="text-xs text-muted-foreground">See full project details</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEditProject(project)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-medium">Edit Project</p>
                              <p className="text-xs text-muted-foreground">Modify project details</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onExportSingleProject(project)}
                                className="h-8 w-8 p-0"
                              >
                                <FileDown className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-medium">Export Project</p>
                              <p className="text-xs text-muted-foreground">Download this project</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onAssignTeam(project)}
                                className="h-8 w-8 p-0"
                              >
                                <UserPlus className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-medium">Assign Team</p>
                              <p className="text-xs text-muted-foreground">Add team members to project</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No projects found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all' 
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first project"}
              </p>
              {(!searchTerm && statusFilter === 'all' && departmentFilter === 'all') && (
                <Button onClick={onCreateProject} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Project
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}