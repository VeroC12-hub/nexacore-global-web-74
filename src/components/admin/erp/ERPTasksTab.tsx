import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  CheckCircle,
  Clock,
  Users,
  Calendar,
  AlertCircle,
  Target,
  PlayCircle,
  PauseCircle,
  CheckSquare,
  Trash2,
  Copy,
  FileDown
} from 'lucide-react';

interface ERPTask {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  project_id: string;
  project_title?: string;
  due_date: string;
  estimated_hours: number;
  actual_hours: number;
  created_at: string;
  updated_at: string;
}

interface ERPTasksTabProps {
  tasks: ERPTask[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
  onCreateTask: () => void;
  onEditTask: (task: ERPTask) => void;
  onViewTask: (task: ERPTask) => void;
  onStartTask: (task: ERPTask) => void;
  onCompleteTask: (task: ERPTask) => void;
  onDeleteTask: (task: ERPTask) => void;
  onDuplicateTask: (task: ERPTask) => void;
  onExportTasks: () => void;
}

export function ERPTasksTab({
  tasks,
  loading,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  onCreateTask,
  onEditTask,
  onViewTask,
  onStartTask,
  onCompleteTask,
  onDeleteTask,
  onDuplicateTask,
  onExportTasks
}: ERPTasksTabProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'review': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'todo': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case 'review': return <Eye className="h-4 w-4 text-purple-500" />;
      case 'todo': return <Clock className="h-4 w-4 text-gray-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    todo: tasks.filter(t => t.status === 'todo').length,
    overdue: tasks.filter(t => new Date(t.due_date) < new Date() && t.status !== 'completed').length
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading Tasks...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Task Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <p className="text-3xl font-bold">{taskStats.total}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-3xl font-bold text-blue-600">{taskStats.inProgress}</p>
              </div>
              <PlayCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-green-600">{taskStats.completed}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-3xl font-bold text-red-600">{taskStats.overdue}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Task Management
            </span>
            <TooltipProvider>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={onExportTasks} variant="outline" className="flex items-center gap-2">
                      <FileDown className="h-4 w-4" />
                      Export
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">Export Tasks Report</p>
                    <p className="text-xs text-muted-foreground">Generate CSV, Excel, or PDF report</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={onCreateTask} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      New Task
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">Create New Task</p>
                    <p className="text-xs text-muted-foreground">Add a new task to a project</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
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
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="review">In Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by priority" />
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

          {/* Tasks Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => {
                  const isOverdue = new Date(task.due_date) < new Date() && task.status !== 'completed';
                  const progressPercent = task.estimated_hours > 0 ? 
                    Math.min((task.actual_hours / task.estimated_hours) * 100, 100) : 0;

                  return (
                    <TableRow key={task.id} className={isOverdue ? 'bg-red-50' : ''}>
                      <TableCell>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {getStatusIcon(task.status)}
                            {task.title}
                          </p>
                          <p className="text-sm text-muted-foreground">{task.project_title}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {task.assignee}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-full">
                          <div className="flex justify-between text-sm mb-1">
                            <span>{task.actual_hours}h / {task.estimated_hours}h</span>
                            <span>{progressPercent.toFixed(0)}%</span>
                          </div>
                          <Progress 
                            value={progressPercent} 
                            className={`h-2 ${progressPercent > 100 ? 'bg-red-100' : ''}`}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`text-sm flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                          <Calendar className="h-4 w-4" />
                          {new Date(task.due_date).toLocaleDateString()}
                          {isOverdue && <AlertCircle className="h-4 w-4 text-red-500" />}
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
                                  onClick={() => onViewTask(task)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-medium">View Task</p>
                                <p className="text-xs text-muted-foreground">See full task details</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onEditTask(task)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-medium">Edit Task</p>
                                <p className="text-xs text-muted-foreground">Modify task details and assignment</p>
                              </TooltipContent>
                            </Tooltip>

                            {task.status === 'todo' && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onStartTask(task)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <PlayCircle className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-medium">Start Task</p>
                                  <p className="text-xs text-muted-foreground">Change status to In Progress</p>
                                </TooltipContent>
                              </Tooltip>
                            )}

                            {task.status !== 'completed' && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onCompleteTask(task)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-medium">Complete Task</p>
                                  <p className="text-xs text-muted-foreground">Mark task as completed</p>
                                </TooltipContent>
                              </Tooltip>
                            )}

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onDuplicateTask(task)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-medium">Duplicate Task</p>
                                <p className="text-xs text-muted-foreground">Create a copy of this task</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onDeleteTask(task)}
                                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-medium text-red-600">Delete Task</p>
                                <p className="text-xs text-muted-foreground">Permanently remove this task</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No tasks found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first task"}
              </p>
              {(!searchTerm && statusFilter === 'all' && priorityFilter === 'all') && (
                <Button onClick={onCreateTask} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Task
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}