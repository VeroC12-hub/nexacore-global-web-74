import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  Circle,
  PlayCircle,
  PauseCircle,
  XCircle,
  Plus,
  MoreHorizontal,
  MessageSquare,
  Paperclip
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled' | 'review';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  budget: number;
  actual_cost: number;
  start_date: string;
  end_date: string;
  client_name?: string;
  assigned_manager?: string;
  team_members: TeamMember[];
  tasks_count: number;
  completed_tasks: number;
  messages_count: number;
  files_count: number;
}

interface TeamMember {
  id: string;
  name: string;
  avatar_url?: string;
  role: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  color: string;
  icon: React.ComponentType<any>;
  projects: Project[];
}

const ProjectKanbanBoard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [draggedProject, setDraggedProject] = useState<Project | null>(null);

  const columns: KanbanColumn[] = [
    {
      id: 'planning',
      title: 'Planning',
      status: 'planning',
      color: 'bg-blue-500',
      icon: Circle,
      projects: projects.filter(p => p.status === 'planning')
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      status: 'in_progress',
      color: 'bg-yellow-500',
      icon: PlayCircle,
      projects: projects.filter(p => p.status === 'in_progress')
    },
    {
      id: 'review',
      title: 'Review',
      status: 'review',
      color: 'bg-purple-500',
      icon: PauseCircle,
      projects: projects.filter(p => p.status === 'review')
    },
    {
      id: 'on_hold',
      title: 'On Hold',
      status: 'on_hold',
      color: 'bg-orange-500',
      icon: PauseCircle,
      projects: projects.filter(p => p.status === 'on_hold')
    },
    {
      id: 'completed',
      title: 'Completed',
      status: 'completed',
      color: 'bg-green-500',
      icon: CheckCircle,
      projects: projects.filter(p => p.status === 'completed')
    },
    {
      id: 'cancelled',
      title: 'Cancelled',
      status: 'cancelled',
      color: 'bg-red-500',
      icon: XCircle,
      projects: projects.filter(p => p.status === 'cancelled')
    }
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Look up client names via profiles
      const clientIds = [...new Set((data || []).map((p: any) => p.client_id).filter(Boolean))];
      const profilesMap: Record<string, string> = {};
      if (clientIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', clientIds);
        (profilesData || []).forEach((p: any) => {
          profilesMap[p.id] = p.full_name || p.email || 'Unknown';
        });
      }

      const mapped: Project[] = (data || []).map((p: any) => ({
        id: p.id,
        title: p.title || 'Untitled Project',
        description: p.description || '',
        status: p.status || 'planning',
        priority: p.priority || 'medium',
        progress: p.progress || 0,
        budget: p.budget || 0,
        actual_cost: p.actual_cost || 0,
        start_date: p.start_date || '',
        end_date: p.end_date || '',
        client_name: profilesMap[p.client_id] || null,
        assigned_manager: p.metadata?.assigned_manager || null,
        team_members: [],
        tasks_count: p.metadata?.tasks_count || 0,
        completed_tasks: p.metadata?.completed_tasks || 0,
        messages_count: 0,
        files_count: 0,
      }));

      setProjects(mapped);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to fetch projects');
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, project: Project) => {
    setDraggedProject(project);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (!draggedProject) return;

    try {
      // Update project status in database
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', draggedProject.id);

      if (error) throw error;

      // Update local state
      setProjects(prev =>
        prev.map(p =>
          p.id === draggedProject.id
            ? { ...p, status: newStatus as any }
            : p
        )
      );

      toast.success(`Project moved to ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      console.error('Error updating project status:', error);
      toast.error('Failed to update project status');
    } finally {
      setDraggedProject(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
    <Card
      className="mb-3 cursor-move hover:shadow-md transition-shadow"
      draggable
      onDragStart={(e) => handleDragStart(e, project)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-medium line-clamp-2">
            {project.title}
          </CardTitle>
          <Badge variant="outline" className={`text-xs ${getPriorityColor(project.priority)}`}>
            {project.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {project.description}
        </p>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span>Progress</span>
            <span>{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>

        {/* Stats */}
        <div className="flex justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>{project.completed_tasks}/{project.tasks_count}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            <span>{project.messages_count}</span>
          </div>
          <div className="flex items-center gap-1">
            <Paperclip className="w-3 h-3" />
            <span>{project.files_count}</span>
          </div>
        </div>

        {/* Budget */}
        <div className="flex justify-between text-xs mb-3">
          <span className="text-muted-foreground">Budget</span>
          <span className="font-medium">
            ${project.actual_cost.toLocaleString()} / ${project.budget.toLocaleString()}
          </span>
        </div>

        {/* Team members */}
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {project.team_members.slice(0, 3).map((member) => (
              <Avatar key={member.id} className="w-6 h-6 border-2 border-background">
                <AvatarImage src={member.avatar_url} />
                <AvatarFallback className="text-xs">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
            {project.team_members.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                <span className="text-xs">+{project.team_members.length - 3}</span>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedProject(project)}
            className="h-6 px-2"
          >
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        </div>

        {/* Deadline warning */}
        {new Date(project.end_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
          <div className="flex items-center gap-1 mt-2 text-xs text-orange-600">
            <AlertTriangle className="w-3 h-3" />
            <span>Due {new Date(project.end_date).toLocaleDateString()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="flex justify-center p-8">Loading projects...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Project Kanban Board</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {columns.map((column) => {
          const Icon = column.icon;
          return (
            <div
              key={column.id}
              className="bg-muted/50 rounded-lg p-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.status)}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                <h3 className="font-semibold text-sm">{column.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {column.projects.length}
                </Badge>
              </div>

              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {column.projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </div>

      {/* Project Detail Dialog */}
      {selectedProject && (
        <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedProject.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">{selectedProject.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Progress</h4>
                  <Progress value={selectedProject.progress} className="mb-2" />
                  <span className="text-sm text-muted-foreground">
                    {selectedProject.completed_tasks} of {selectedProject.tasks_count} tasks completed
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Budget</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Allocated:</span>
                      <span>${selectedProject.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Spent:</span>
                      <span>${selectedProject.actual_cost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Remaining:</span>
                      <span>${(selectedProject.budget - selectedProject.actual_cost).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Team Members</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.team_members.map((member) => (
                    <div key={member.id} className="flex items-center gap-2 bg-muted p-2 rounded">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={member.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{member.name}</div>
                        <div className="text-xs text-muted-foreground">{member.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProjectKanbanBoard;