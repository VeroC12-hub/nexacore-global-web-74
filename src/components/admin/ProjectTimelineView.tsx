import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  Filter,
  ZoomIn,
  ZoomOut,
  Download,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  project_id: string;
  start_date: string;
  end_date: string;
  progress: number;
  assigned_to?: string;
  dependencies: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
}

interface Project {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  progress: number;
  status: string;
  priority: string;
  tasks: Task[];
  milestones: Milestone[];
}

interface Milestone {
  id: string;
  title: string;
  date: string;
  status: 'pending' | 'completed';
  project_id: string;
}

type ViewMode = 'days' | 'weeks' | 'months' | 'quarters';

const ProjectTimelineView: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('weeks');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [timelineStart, setTimelineStart] = useState<Date>(new Date());
  const [timelineEnd, setTimelineEnd] = useState<Date>(new Date());

  useEffect(() => {
    fetchProjects();
    calculateTimelineRange();
  }, [projects]);

  const calculateTimelineRange = () => {
    if (projects.length === 0) return;

    const allDates = projects.flatMap(project => [
      new Date(project.start_date),
      new Date(project.end_date),
      ...project.tasks.flatMap(task => [new Date(task.start_date), new Date(task.end_date)])
    ]);

    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

    // Add padding
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);

    setTimelineStart(minDate);
    setTimelineEnd(maxDate);
  };

  const fetchProjects = async () => {
    try {
      // Mock data for demonstration
      const mockProjects: Project[] = [
        {
          id: '1',
          title: 'E-commerce Platform Redesign',
          start_date: '2024-09-01',
          end_date: '2024-12-31',
          progress: 65,
          status: 'in_progress',
          priority: 'high',
          milestones: [
            { id: 'm1', title: 'Design Phase Complete', date: '2024-10-15', status: 'completed', project_id: '1' },
            { id: 'm2', title: 'Frontend Development Complete', date: '2024-11-30', status: 'pending', project_id: '1' },
            { id: 'm3', title: 'Testing Phase Complete', date: '2024-12-15', status: 'pending', project_id: '1' }
          ],
          tasks: [
            {
              id: 't1',
              title: 'User Research & Analysis',
              project_id: '1',
              start_date: '2024-09-01',
              end_date: '2024-09-15',
              progress: 100,
              assigned_to: 'Alice Smith',
              dependencies: [],
              priority: 'high',
              status: 'completed'
            },
            {
              id: 't2',
              title: 'UI/UX Design',
              project_id: '1',
              start_date: '2024-09-16',
              end_date: '2024-10-15',
              progress: 100,
              assigned_to: 'Carol White',
              dependencies: ['t1'],
              priority: 'high',
              status: 'completed'
            },
            {
              id: 't3',
              title: 'Frontend Development',
              project_id: '1',
              start_date: '2024-10-01',
              end_date: '2024-11-30',
              progress: 70,
              assigned_to: 'Alice Smith',
              dependencies: ['t2'],
              priority: 'high',
              status: 'in_progress'
            },
            {
              id: 't4',
              title: 'Backend API Development',
              project_id: '1',
              start_date: '2024-10-15',
              end_date: '2024-11-15',
              progress: 45,
              assigned_to: 'Bob Johnson',
              dependencies: ['t2'],
              priority: 'medium',
              status: 'in_progress'
            }
          ]
        },
        {
          id: '2',
          title: 'Mobile App Development',
          start_date: '2024-10-01',
          end_date: '2025-03-31',
          progress: 25,
          status: 'planning',
          priority: 'medium',
          milestones: [
            { id: 'm4', title: 'App Store Approval', date: '2025-03-15', status: 'pending', project_id: '2' }
          ],
          tasks: [
            {
              id: 't5',
              title: 'Requirements Gathering',
              project_id: '2',
              start_date: '2024-10-01',
              end_date: '2024-10-15',
              progress: 80,
              assigned_to: 'Jane Smith',
              dependencies: [],
              priority: 'high',
              status: 'in_progress'
            },
            {
              id: 't6',
              title: 'iOS Development',
              project_id: '2',
              start_date: '2024-11-01',
              end_date: '2025-02-15',
              progress: 0,
              assigned_to: 'David Brown',
              dependencies: ['t5'],
              priority: 'medium',
              status: 'not_started'
            }
          ]
        }
      ];

      setProjects(mockProjects);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to fetch projects');
      setLoading(false);
    }
  };

  const getTimelineColumns = () => {
    const columns: string[] = [];
    const current = new Date(timelineStart);

    while (current <= timelineEnd) {
      switch (viewMode) {
        case 'days':
          columns.push(current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
          current.setDate(current.getDate() + 1);
          break;
        case 'weeks':
          columns.push(`Week ${Math.ceil((current.getDate()) / 7)}, ${current.toLocaleDateString('en-US', { month: 'short' })}`);
          current.setDate(current.getDate() + 7);
          break;
        case 'months':
          columns.push(current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
          current.setMonth(current.getMonth() + 1);
          break;
        case 'quarters':
          const quarter = Math.floor(current.getMonth() / 3) + 1;
          columns.push(`Q${quarter} ${current.getFullYear()}`);
          current.setMonth(current.getMonth() + 3);
          break;
      }
    }

    return columns;
  };

  const calculateBarPosition = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const startOffset = Math.ceil((start.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    const left = (startOffset / totalDays) * 100;
    const width = (duration / totalDays) * 100;

    return { left: `${Math.max(0, left)}%`, width: `${Math.max(1, width)}%` };
  };

  const getStatusColor = (status: string, progress: number) => {
    if (progress === 100) return 'bg-green-500';
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'on_hold': return 'bg-yellow-500';
      case 'not_started': return 'bg-gray-400';
      default: return 'bg-blue-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const filteredProjects = selectedProject === 'all'
    ? projects
    : projects.filter(p => p.id === selectedProject);

  const columns = getTimelineColumns();

  if (loading) {
    return <div className="flex justify-center p-8">Loading timeline...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Project Timeline</h2>
        <div className="flex items-center gap-4">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="days">Days</SelectItem>
              <SelectItem value="weeks">Weeks</SelectItem>
              <SelectItem value="months">Months</SelectItem>
              <SelectItem value="quarters">Quarters</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Gantt Chart View
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {/* Timeline Header */}
            <div className="flex border-b">
              <div className="w-80 p-4 bg-muted/50 font-semibold border-r">
                Project / Task
              </div>
              <div className="flex-1 flex">
                {columns.map((column, index) => (
                  <div
                    key={index}
                    className="flex-1 p-2 text-center text-xs border-r last:border-r-0 bg-muted/30"
                  >
                    {column}
                  </div>
                ))}
              </div>
            </div>

            <ScrollArea className="h-[600px]">
              {filteredProjects.map((project) => (
                <div key={project.id} className="border-b">
                  {/* Project Row */}
                  <div className="flex items-center">
                    <div className="w-80 p-4 border-r">
                      <div className="flex items-center gap-3">
                        <div className="font-semibold">{project.title}</div>
                        <Badge variant="outline" className={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={project.progress} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground">
                          {project.progress}%
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 relative h-16 bg-gray-50">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`absolute top-2 h-6 ${getStatusColor(project.status, project.progress)} rounded opacity-80`}
                              style={calculateBarPosition(project.start_date, project.end_date)}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs">
                              <div className="font-semibold">{project.title}</div>
                              <div>
                                {new Date(project.start_date).toLocaleDateString()} -
                                {new Date(project.end_date).toLocaleDateString()}
                              </div>
                              <div>Progress: {project.progress}%</div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* Milestones */}
                      {project.milestones.map((milestone) => {
                        const position = calculateBarPosition(milestone.date, milestone.date);
                        return (
                          <TooltipProvider key={milestone.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`absolute top-10 w-3 h-3 rotate-45 ${
                                    milestone.status === 'completed' ? 'bg-green-600' : 'bg-orange-500'
                                  }`}
                                  style={{ left: position.left }}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-xs">
                                  <div className="font-semibold">{milestone.title}</div>
                                  <div>{new Date(milestone.date).toLocaleDateString()}</div>
                                  <div>Status: {milestone.status}</div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                    </div>
                  </div>

                  {/* Task Rows */}
                  {project.tasks.map((task) => (
                    <div key={task.id} className="flex items-center bg-muted/20">
                      <div className="w-80 p-4 border-r pl-8">
                        <div className="flex items-center gap-2">
                          <div className="text-sm">{task.title}</div>
                          <Badge variant="outline" size="sm" className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={task.progress} className="h-1 flex-1" />
                          <span className="text-xs text-muted-foreground">
                            {task.progress}%
                          </span>
                        </div>
                        {task.assigned_to && (
                          <div className="text-xs text-muted-foreground mt-1">
                            <Users className="w-3 h-3 inline mr-1" />
                            {task.assigned_to}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 relative h-12 bg-white">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={`absolute top-2 h-4 ${getStatusColor(task.status, task.progress)} rounded`}
                                style={calculateBarPosition(task.start_date, task.end_date)}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs">
                                <div className="font-semibold">{task.title}</div>
                                <div>
                                  {new Date(task.start_date).toLocaleDateString()} -
                                  {new Date(task.end_date).toLocaleDateString()}
                                </div>
                                <div>Progress: {task.progress}%</div>
                                <div>Assigned: {task.assigned_to}</div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Dependency lines could be added here */}
                        {task.dependencies.length > 0 && (
                          <div className="absolute top-6 left-0 text-xs text-muted-foreground">
                            <AlertTriangle className="w-3 h-3 inline" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded" />
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded" />
              <span>On Hold</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded" />
              <span>Not Started</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rotate-45" />
              <span>Milestone</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectTimelineView;