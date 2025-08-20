// src/components/admin/AdminProjectsTab.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  Download,
  Upload,
  FileText,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  start_date: string;
  end_date: string;
  deadline: string;
  client_id: string;
  client_name?: string;
  client_email?: string;
  budget: number;
  spent_amount: number;
  service_type: string;
  team_members: string[];
  progress: number;
  created_at: string;
  updated_at: string;
  completion_percentage: number;
  estimated_hours: number;
  actual_hours: number;
  deliverables: string[];
  milestones: ProjectMilestone[];
  risks: ProjectRisk[];
  documents: ProjectDocument[];
}

interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completion_date?: string;
}

interface ProjectRisk {
  id: string;
  title: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  status: 'identified' | 'mitigating' | 'resolved' | 'occurred';
  mitigation_plan: string;
}

interface ProjectDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploaded_at: string;
  size: number;
}

interface AdminProjectsTabProps {
  onStatsUpdate: () => void;
}

export function AdminProjectsTab({ onStatsUpdate }: AdminProjectsTabProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'planning' as Project['status'],
    priority: 'medium' as Project['priority'],
    start_date: '',
    end_date: '',
    deadline: '',
    client_id: '',
    client_name: '',
    client_email: '',
    budget: 0,
    service_type: '',
    estimated_hours: 0,
    deliverables: [] as string[],
    team_members: [] as string[]
  });

  const [newDeliverable, setNewDeliverable] = useState('');
  const [newTeamMember, setNewTeamMember] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles!projects_client_id_fkey (
            full_name,
            email
          )
        `)
        .order(sortBy, { ascending: sortOrder === 'asc' });

      if (error) throw error;

      // Enhance projects with calculated fields
      const enhancedProjects = (data || []).map(project => ({
        ...project,
        client_name: project.profiles?.full_name || 'Unknown Client',
        client_email: project.profiles?.email || '',
        spent_amount: project.budget * (project.progress || 0) / 100,
        completion_percentage: project.progress || 0,
        actual_hours: project.estimated_hours * (project.progress || 0) / 100,
        milestones: [],
        risks: [],
        documents: []
      }));

      setProjects(enhancedProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.service_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    const matchesService = serviceFilter === 'all' || project.service_type === serviceFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesService;
  });

  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const handleCreateProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          ...formData,
          progress: 0,
          deliverables: formData.deliverables,
          team_members: formData.team_members
        }])
        .select()
        .single();

      if (error) throw error;

      await loadProjects();
      onStatsUpdate();
      setIsCreateModalOpen(false);
      resetForm();
      toast.success('Project created successfully');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };

  const handleUpdateProject = async () => {
    if (!selectedProject) return;

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          ...formData,
          deliverables: formData.deliverables,
          team_members: formData.team_members,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedProject.id);

      if (error) throw error;

      await loadProjects();
      onStatsUpdate();
      setIsEditModalOpen(false);
      setSelectedProject(null);
      resetForm();
      toast.success('Project updated successfully');
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      setProjects(projects.filter(p => p.id !== projectId));
      onStatsUpdate();
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const handleUpdateProgress = async (projectId: string, newProgress: number) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          progress: newProgress,
          status: newProgress === 100 ? 'completed' : 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) throw error;

      await loadProjects();
      onStatsUpdate();
      toast.success('Project progress updated');
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'planning',
      priority: 'medium',
      start_date: '',
      end_date: '',
      deadline: '',
      client_id: '',
      client_name: '',
      client_email: '',
      budget: 0,
      service_type: '',
      estimated_hours: 0,
      deliverables: [],
      team_members: []
    });
    setNewDeliverable('');
    setNewTeamMember('');
  };

  const openEditModal = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      status: project.status,
      priority: project.priority,
      start_date: project.start_date.split('T')[0],
      end_date: project.end_date.split('T')[0],
      deadline: project.deadline?.split('T')[0] || '',
      client_id: project.client_id,
      client_name: project.client_name || '',
      client_email: project.client_email || '',
      budget: project.budget,
      service_type: project.service_type,
      estimated_hours: project.estimated_hours || 0,
      deliverables: project.deliverables || [],
      team_members: project.team_members || []
    });
    setIsEditModalOpen(true);
  };

  const openViewModal = (project: Project) => {
    setSelectedProject(project);
    setIsViewModalOpen(true);
  };

  const addDeliverable = () => {
    if (newDeliverable.trim()) {
      setFormData(prev => ({
        ...prev,
        deliverables: [...prev.deliverables, newDeliverable.trim()]
      }));
      setNewDeliverable('');
    }
  };

  const removeDeliverable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index)
    }));
  };

  const addTeamMember = () => {
    if (newTeamMember.trim()) {
      setFormData(prev => ({
        ...prev,
        team_members: [...prev.team_members, newTeamMember.trim()]
      }));
      setNewTeamMember('');
    }
  };

  const removeTeamMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      team_members: prev.team_members.filter((_, i) => i !== index)
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'on_hold': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'planning': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-400';
    if (progress >= 50) return 'text-yellow-400';
    if (progress >= 20) return 'text-orange-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading projects...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Projects Management</h2>
          <p className="text-muted-foreground">Manage and track all client projects</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Search Projects</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by title, client, or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority-filter">Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger id="priority-filter">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sort-by">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort-by">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Created Date</SelectItem>
                  <SelectItem value="updated_at">Updated Date</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="budget">Budget</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sort-order">Order</Label>
              <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                <SelectTrigger id="sort-order">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardContent className="p-0">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search filters.' : 'Create your first project to get started.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{project.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {project.description}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {project.service_type}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{project.client_name}</div>
                          <div className="text-sm text-muted-foreground">{project.client_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className={getProgressColor(project.completion_percentage)}>
                              {project.completion_percentage}%
                            </span>
                          </div>
                          <Progress 
                            value={project.completion_percentage} 
                            className="w-16 h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">${project.budget.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">
                            Spent: ${project.spent_amount.toLocaleString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
                        </div>
                        {project.deadline && new Date(project.deadline) < new Date() && project.status !== 'completed' && (
                          <Badge className="bg-red-500/20 text-red-400 text-xs">Overdue</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewModal(project)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(project)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProject(project.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredProjects.length)} of{' '}
                    {filteredProjects.length} projects
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Project Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="team">Team & Deliverables</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter project title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="service_type">Service Type *</Label>
                  <Select 
                    value={formData.service_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, service_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web_development">Web Development</SelectItem>
                      <SelectItem value="mobile_development">Mobile Development</SelectItem>
                      <SelectItem value="ui_ux_design">UI/UX Design</SelectItem>
                      <SelectItem value="digital_marketing">Digital Marketing</SelectItem>
                      <SelectItem value="branding">Branding</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="client_name">Client Name *</Label>
                  <Input
                    id="client_name"
                    value={formData.client_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                    placeholder="Enter client name"
                  />
                </div>

                <div>
                  <Label htmlFor="client_email">Client Email *</Label>
                  <Input
                    id="client_email"
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
                    placeholder="Enter client email"
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status}
                    onValueChange={(value: Project['status']) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={formData.priority}
                    onValueChange={(value: Project['priority']) => setFormData(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the project scope and objectives"
                  rows={4}
                />
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="estimated_hours">Estimated Hours</Label>
                  <Input
                    id="estimated_hours"
                    type="number"
                    value={formData.estimated_hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimated_hours: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="budget">Budget ($)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="team" className="space-y-4">
              <div>
                <Label>Team Members</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTeamMember}
                    onChange={(e) => setNewTeamMember(e.target.value)}
                    placeholder="Enter team member email or name"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTeamMember();
                      }
                    }}
                  />
                  <Button type="button" onClick={addTeamMember}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.team_members.map((member, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {member}
                      <button
                        type="button"
                        onClick={() => removeTeamMember(index)}
                        className="ml-1 text-xs hover:text-red-400"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Deliverables</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newDeliverable}
                    onChange={(e) => setNewDeliverable(e.target.value)}
                    placeholder="Enter project deliverable"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addDeliverable();
                      }
                    }}
                  />
                  <Button type="button" onClick={addDeliverable}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.deliverables.map((deliverable, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <span className="flex-1">{deliverable}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDeliverable(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject}>
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="team">Team & Deliverables</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-title">Project Title *</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter project title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-service_type">Service Type *</Label>
                  <Select 
                    value={formData.service_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, service_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web_development">Web Development</SelectItem>
                      <SelectItem value="mobile_development">Mobile Development</SelectItem>
                      <SelectItem value="ui_ux_design">UI/UX Design</SelectItem>
                      <SelectItem value="digital_marketing">Digital Marketing</SelectItem>
                      <SelectItem value="branding">Branding</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-client_name">Client Name *</Label>
                  <Input
                    id="edit-client_name"
                    value={formData.client_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                    placeholder="Enter client name"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-client_email">Client Email *</Label>
                  <Input
                    id="edit-client_email"
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
                    placeholder="Enter client email"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select 
                    value={formData.status}
                    onValueChange={(value: Project['status']) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select 
                    value={formData.priority}
                    onValueChange={(value: Project['priority']) => setFormData(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the project scope and objectives"
                  rows={4}
                />
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-start_date">Start Date</Label>
                  <Input
                    id="edit-start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-end_date">End Date</Label>
                  <Input
                    id="edit-end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-deadline">Deadline</Label>
                  <Input
                    id="edit-deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-estimated_hours">Estimated Hours</Label>
                  <Input
                    id="edit-estimated_hours"
                    type="number"
                    value={formData.estimated_hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimated_hours: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="edit-budget">Budget ($)</Label>
                  <Input
                    id="edit-budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="team" className="space-y-4">
              <div>
                <Label>Team Members</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTeamMember}
                    onChange={(e) => setNewTeamMember(e.target.value)}
                    placeholder="Enter team member email or name"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTeamMember();
                      }
                    }}
                  />
                  <Button type="button" onClick={addTeamMember}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.team_members.map((member, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {member}
                      <button
                        type="button"
                        onClick={() => removeTeamMember(index)}
                        className="ml-1 text-xs hover:text-red-400"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Deliverables</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newDeliverable}
                    onChange={(e) => setNewDeliverable(e.target.value)}
                    placeholder="Enter project deliverable"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addDeliverable();
                      }
                    }}
                  />
                  <Button type="button" onClick={addDeliverable}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.deliverables.map((deliverable, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <span className="flex-1">{deliverable}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDeliverable(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProject}>
              Update Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Project Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
          </DialogHeader>
          
          {selectedProject && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Project Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Title</Label>
                        <p className="text-sm text-muted-foreground">{selectedProject.title}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Service Type</Label>
                        <p className="text-sm text-muted-foreground">{selectedProject.service_type}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <Badge className={getStatusColor(selectedProject.status)}>
                          {selectedProject.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Priority</Label>
                        <Badge className={getPriorityColor(selectedProject.priority)}>
                          {selectedProject.priority}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Description</Label>
                        <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Client Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Client Name</Label>
                        <p className="text-sm text-muted-foreground">{selectedProject.client_name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <p className="text-sm text-muted-foreground">{selectedProject.client_email}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Timeline</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Start Date</Label>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedProject.start_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">End Date</Label>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedProject.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      {selectedProject.deadline && (
                        <div>
                          <Label className="text-sm font-medium">Deadline</Label>
                          <p className="text-sm text-muted-foreground">
                            {new Date(selectedProject.deadline).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Budget & Hours</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Total Budget</Label>
                        <p className="text-sm text-muted-foreground">${selectedProject.budget.toLocaleString()}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Amount Spent</Label>
                        <p className="text-sm text-muted-foreground">${selectedProject.spent_amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Estimated Hours</Label>
                        <p className="text-sm text-muted-foreground">{selectedProject.estimated_hours} hours</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Actual Hours</Label>
                        <p className="text-sm text-muted-foreground">{selectedProject.actual_hours} hours</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="progress" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Progress Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Overall Progress</Label>
                        <span className={`font-medium ${getProgressColor(selectedProject.completion_percentage)}`}>
                          {selectedProject.completion_percentage}%
                        </span>
                      </div>
                      <Progress value={selectedProject.completion_percentage} className="h-3" />
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-3 block">Update Progress</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="range"
                          min="0"
                          max="100"
                          defaultValue={selectedProject.completion_percentage}
                          onChange={(e) => {
                            const progress = parseInt(e.target.value);
                            handleUpdateProgress(selectedProject.id, progress);
                          }}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {selectedProject.deliverables && selectedProject.deliverables.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium mb-3 block">Deliverables</Label>
                        <div className="space-y-2">
                          {selectedProject.deliverables.map((deliverable, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                              <CheckCircle className="h-4 w-4 text-green-400" />
                              <span className="text-sm">{deliverable}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="financial" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Budget Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total Budget</span>
                        <span className="text-sm">${selectedProject.budget.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Amount Spent</span>
                        <span className="text-sm text-red-400">${selectedProject.spent_amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Remaining</span>
                        <span className="text-sm text-green-400">
                          ${(selectedProject.budget - selectedProject.spent_amount).toLocaleString()}
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Budget Utilization</span>
                          <span className="text-sm">
                            {((selectedProject.spent_amount / selectedProject.budget) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={(selectedProject.spent_amount / selectedProject.budget) * 100} 
                          className="h-2 mt-2"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Time Tracking</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Estimated Hours</span>
                        <span className="text-sm">{selectedProject.estimated_hours} hrs</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Actual Hours</span>
                        <span className="text-sm">{selectedProject.actual_hours} hrs</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Remaining Hours</span>
                        <span className="text-sm">
                          {Math.max(0, selectedProject.estimated_hours - selectedProject.actual_hours)} hrs
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Time Utilization</span>
                          <span className="text-sm">
                            {((selectedProject.actual_hours / selectedProject.estimated_hours) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={(selectedProject.actual_hours / selectedProject.estimated_hours) * 100} 
                          className="h-2 mt-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="team" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Team Members</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedProject.team_members && selectedProject.team_members.length > 0 ? (
                      <div className="space-y-3">
                        {selectedProject.team_members.map((member, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded">
                            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                              <Users className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{member}</p>
                              <p className="text-sm text-muted-foreground">Team Member</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No team members assigned</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsViewModalOpen(false);
              openEditModal(selectedProject!);
            }}>
              Edit Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
