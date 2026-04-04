import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Target,
  Calendar,
  User,
  FolderOpen,
  Clock,
  Edit,
  X,
  AlertCircle,
  CheckCircle,
  PlayCircle,
  Eye
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

interface TaskViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: ERPTask | null;
  onEdit?: (task: ERPTask) => void;
}

export function TaskViewModal({ isOpen, onClose, task, onEdit }: TaskViewModalProps) {
  if (!task) return null;

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
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress': return <PlayCircle className="h-5 w-5 text-blue-500" />;
      case 'review': return <Eye className="h-5 w-5 text-purple-500" />;
      case 'todo': return <Clock className="h-5 w-5 text-gray-500" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const progressPercent = task.estimated_hours > 0 ?
    Math.min((task.actual_hours / task.estimated_hours) * 100, 100) : 0;

  const isOverdue = new Date(task.due_date) < new Date() && task.status !== 'completed';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Task Details
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onEdit(task);
                    onClose();
                  }}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Header */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {getStatusIcon(task.status)}
                {task.title}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(task.status)}>
                {(task.status || 'unknown').replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge className={getPriorityColor(task.priority)}>
                {(task.priority || 'medium').toUpperCase()} PRIORITY
              </Badge>
              {isOverdue && (
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  OVERDUE
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{task.description}</p>
          </div>

          {/* Task Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FolderOpen className="h-4 w-4" />
                <span className="font-medium">Project</span>
              </div>
              <p className="text-sm font-medium pl-6">{task.project_title || 'Unknown Project'}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="font-medium">Assignee</span>
              </div>
              <p className="text-sm font-medium pl-6">{task.assignee || 'Unassigned'}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Due Date</span>
              </div>
              <p className={`text-sm font-medium pl-6 ${isOverdue ? 'text-red-600' : ''}`}>
                {new Date(task.due_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Time Estimate</span>
              </div>
              <p className="text-sm font-medium pl-6">{task.estimated_hours}h estimated</p>
            </div>
          </div>

          {/* Progress Section */}
          <div>
            <h3 className="font-semibold mb-3">Progress</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time Spent: {task.actual_hours}h / {task.estimated_hours}h</span>
                <span className="font-medium">{progressPercent.toFixed(0)}%</span>
              </div>
              <Progress
                value={progressPercent}
                className={`h-3 ${progressPercent > 100 ? 'bg-red-100' : ''}`}
              />
              {progressPercent > 100 && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Over estimated hours by {(task.actual_hours - task.estimated_hours).toFixed(1)}h
                </p>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Created:</span>{' '}
                {new Date(task.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>{' '}
                {new Date(task.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
