import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  FolderOpen,
  Edit,
  Calendar,
  DollarSign,
  Users,
  Target,
  Building,
  TrendingUp,
  Clock
} from 'lucide-react';

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

interface ProjectViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ERPProject | null;
  onEdit: (project: ERPProject) => void;
}

export function ProjectViewModal({ isOpen, onClose, project, onEdit }: ProjectViewModalProps) {
  if (!project) return null;

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

  const getProjectTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'client': 'Client Project',
      'internal': 'Internal Project',
      'research': 'Research & Development',
      'training': 'Training/Certification',
      'maintenance': 'Maintenance & Support'
    };
    return labels[type] || (type || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
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
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const budgetUtilization = project.budget > 0 ? (project.actual_cost / project.budget) * 100 : 0;
  const isOverBudget = budgetUtilization > 100;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = () => {
    const today = new Date();
    const endDate = new Date(project.end_date);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-blue-500" />
              {project.title}
            </span>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(project.status)}>
                {(project.status || 'unknown').replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge className={getPriorityColor(project.priority)}>
                {(project.priority || 'medium').toUpperCase()}
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription className="text-base">
            {project.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{project.progress}%</p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
              <Progress value={project.progress} className="mt-2 h-2" />
            </div>

            <div className="p-4 border rounded-lg bg-green-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="text-2xl font-bold text-green-600">${project.budget.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ${project.actual_cost.toLocaleString()} spent ({budgetUtilization.toFixed(1)}%)
              </p>
            </div>

            <div className={`p-4 border rounded-lg ${daysRemaining < 0 ? 'bg-red-50' : daysRemaining < 7 ? 'bg-yellow-50' : 'bg-purple-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Timeline</p>
                  <p className={`text-2xl font-bold ${daysRemaining < 0 ? 'text-red-600' : daysRemaining < 7 ? 'text-yellow-600' : 'text-purple-600'}`}>
                    {Math.abs(daysRemaining)} days
                  </p>
                </div>
                <Clock className={`h-8 w-8 ${daysRemaining < 0 ? 'text-red-500' : daysRemaining < 7 ? 'text-yellow-500' : 'text-purple-500'}`} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {daysRemaining < 0 ? 'Overdue' : daysRemaining === 0 ? 'Due today' : 'Remaining'}
              </p>
            </div>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Service Department
                </h3>
                <p className="text-base font-medium">{getDepartmentLabel(project.department)}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Project Type
                </h3>
                <p className="text-base font-medium">{getProjectTypeLabel(project.project_type)}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Start Date
                </h3>
                <p className="text-base font-medium">{formatDate(project.start_date)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Active Status</h3>
                <Badge variant={project.is_active ? "default" : "secondary"}>
                  {project.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Actual Cost
                </h3>
                <p className="text-base font-medium">${project.actual_cost.toLocaleString()}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  End Date
                </h3>
                <p className="text-base font-medium">{formatDate(project.end_date)}</p>
              </div>
            </div>
          </div>

          {/* Budget Analysis */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Budget Analysis
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Allocated Budget:</span>
                <span className="font-medium">${project.budget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Spent:</span>
                <span className="font-medium">${project.actual_cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Remaining:</span>
                <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                  ${Math.abs(project.budget - project.actual_cost).toLocaleString()}
                  {isOverBudget && ' (Over Budget)'}
                </span>
              </div>
              <Progress
                value={Math.min(budgetUtilization, 100)}
                className={`h-2 mt-2 ${isOverBudget ? '[&>div]:bg-red-500' : ''}`}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {budgetUtilization.toFixed(1)}% of budget utilized
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="border-t pt-4 text-xs text-muted-foreground">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium">Created:</span> {formatDate(project.created_at)}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span> {formatDate(project.updated_at)}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => { onEdit(project); onClose(); }}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
