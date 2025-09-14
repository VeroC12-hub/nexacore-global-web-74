// ERP System Type Definitions

// Tenant Management
export interface Tenant {
  id: string;
  name: string;
  domain: string;
  settings: {
    theme?: string;
    timezone?: string;
    business_hours?: string;
    currency?: string;
    logo_url?: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Enhanced User Roles
export type UserRole = 'admin' | 'project_manager' | 'operations_manager' | 'developer' | 'support' | 'client';

export interface UserRoleData {
  id: string;
  tenant_id: string;
  user_id: string;
  role: UserRole;
  permissions: string[];
  department?: string;
  position?: string;
  hourly_rate?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Enhanced User Interface
export interface EnhancedUser {
  id: string;
  email: string;
  tenant_id: string;
  role: UserRole;
  permissions: string[];
  department?: string;
  position?: string;
  hourly_rate?: number;
  profile?: {
    full_name?: string;
    avatar_url?: string;
    phone?: string;
    bio?: string;
  };
}

// Task Management
export type TaskStatus = 'pending' | 'in_progress' | 'review' | 'completed' | 'blocked' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  tenant_id: string;
  project_id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  created_by?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  estimated_hours?: number;
  actual_hours: number;
  completion_percentage: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  
  // Joined data
  assignee?: {
    id: string;
    email: string;
    profile?: { full_name?: string; avatar_url?: string; };
  };
  creator?: {
    id: string;
    email: string;
    profile?: { full_name?: string; avatar_url?: string; };
  };
  project?: {
    id: string;
    title: string;
    status: string;
  };
}

// Time Tracking
export interface TimeEntry {
  id: string;
  tenant_id: string;
  user_id: string;
  project_id: string;
  task_id?: string;
  description?: string;
  hours: number;
  billable: boolean;
  hourly_rate?: number;
  total_amount?: number;
  date: string;
  start_time?: string;
  end_time?: string;
  is_approved: boolean;
  approved_by?: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  user?: {
    id: string;
    email: string;
    profile?: { full_name?: string; };
  };
  project?: {
    id: string;
    title: string;
  };
  task?: {
    id: string;
    title: string;
  };
  approver?: {
    id: string;
    email: string;
    profile?: { full_name?: string; };
  };
}

// Team Communication
export type MessageType = 'general' | 'update' | 'announcement' | 'question' | 'alert';

export interface TeamMessage {
  id: string;
  tenant_id: string;
  sender_id: string;
  project_id: string;
  task_id?: string;
  message: string;
  message_type: MessageType;
  parent_id?: string;
  is_read: boolean;
  mentioned_users: string[];
  attachments: MessageAttachment[];
  created_at: string;
  updated_at: string;
  
  // Joined data
  sender?: {
    id: string;
    email: string;
    profile?: { full_name?: string; avatar_url?: string; };
  };
  project?: {
    id: string;
    title: string;
  };
  task?: {
    id: string;
    title: string;
  };
  replies?: TeamMessage[];
}

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

// File Management
export interface ProjectFile {
  id: string;
  tenant_id: string;
  project_id: string;
  task_id?: string;
  uploaded_by?: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  is_public: boolean;
  version: number;
  description?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  
  // Joined data
  uploader?: {
    id: string;
    email: string;
    profile?: { full_name?: string; };
  };
  project?: {
    id: string;
    title: string;
  };
  task?: {
    id: string;
    title: string;
  };
}

// Notifications
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type EntityType = 'project' | 'task' | 'message' | 'time_entry' | 'file' | 'user';

export interface Notification {
  id: string;
  tenant_id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  entity_type?: EntityType;
  entity_id?: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

// Dashboard Analytics
export interface ProjectAnalytics {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  overdue_projects: number;
  projects_by_status: Record<string, number>;
  recent_activity: ActivityItem[];
}

export interface TaskAnalytics {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  tasks_by_priority: Record<TaskPriority, number>;
  tasks_by_status: Record<TaskStatus, number>;
  completion_rate: number;
}

export interface TimeAnalytics {
  total_hours_logged: number;
  billable_hours: number;
  total_earnings: number;
  hours_by_project: Record<string, number>;
  daily_hours: Array<{
    date: string;
    hours: number;
    billable_hours: number;
  }>;
  team_utilization: Array<{
    user_id: string;
    user_name: string;
    hours: number;
    target_hours: number;
    utilization_rate: number;
  }>;
}

export interface TeamAnalytics {
  total_team_members: number;
  active_members: number;
  members_by_role: Record<UserRole, number>;
  performance_metrics: Array<{
    user_id: string;
    user_name: string;
    completed_tasks: number;
    hours_logged: number;
    productivity_score: number;
  }>;
}

// Activity Feed
export interface ActivityItem {
  id: string;
  type: 'task_created' | 'task_completed' | 'time_logged' | 'message_sent' | 'file_uploaded' | 'project_updated';
  title: string;
  description: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  entity_type?: EntityType;
  entity_id?: string;
  entity_name?: string;
  timestamp: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Form Types
export interface TaskFormData {
  title: string;
  description?: string;
  assigned_to?: string;
  priority: TaskPriority;
  due_date?: string;
  estimated_hours?: number;
  tags: string[];
}

export interface TimeEntryFormData {
  project_id: string;
  task_id?: string;
  description?: string;
  hours: number;
  billable: boolean;
  date: string;
  start_time?: string;
  end_time?: string;
}

export interface MessageFormData {
  project_id: string;
  task_id?: string;
  message: string;
  message_type: MessageType;
  mentioned_users: string[];
}

// Filter Types
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigned_to?: string[];
  project_id?: string;
  due_date_from?: string;
  due_date_to?: string;
  search?: string;
}

export interface TimeEntryFilters {
  user_id?: string[];
  project_id?: string[];
  date_from?: string;
  date_to?: string;
  billable?: boolean;
  is_approved?: boolean;
}

export interface ProjectFilters {
  status?: string[];
  client_id?: string;
  team_member?: string[];
  date_from?: string;
  date_to?: string;
  search?: string;
}

// Permission Types
export type Permission = 
  | 'view_all_projects'
  | 'edit_all_projects'
  | 'delete_projects'
  | 'assign_tasks'
  | 'view_all_time_entries'
  | 'approve_time_entries'
  | 'manage_team'
  | 'view_reports'
  | 'manage_settings'
  | 'view_financials'
  | 'manage_clients'
  | 'view_all_portfolio'
  | 'edit_all_portfolio'
  | 'edit_own_portfolio'
  | 'approve_portfolio'
  | 'delete_portfolio';

// Role Permission Mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'view_all_projects',
    'edit_all_projects',
    'delete_projects',
    'assign_tasks',
    'view_all_time_entries',
    'approve_time_entries',
    'manage_team',
    'view_reports',
    'manage_settings',
    'view_financials',
    'manage_clients',
    'view_all_portfolio',
    'edit_all_portfolio',
    'approve_portfolio',
    'delete_portfolio'
  ],
  project_manager: [
    'view_all_projects',
    'edit_all_projects',
    'assign_tasks',
    'view_all_time_entries',
    'approve_time_entries',
    'view_reports',
    'view_financials',
    'view_all_portfolio',
    'edit_all_portfolio',
    'approve_portfolio'
  ],
  operations_manager: [
    'view_all_projects',
    'edit_all_projects',
    'assign_tasks',
    'view_all_time_entries',
    'approve_time_entries',
    'manage_team',
    'view_reports',
    'view_financials',
    'view_all_portfolio',
    'edit_all_portfolio',
    'approve_portfolio'
  ],
  developer: [
    'view_all_projects',
    'view_all_portfolio',
    'edit_own_portfolio'
  ],
  support: [
    'view_all_projects',
    'view_all_portfolio',
    'edit_own_portfolio'
  ],
  client: []
};

// Dashboard Layout Types
export interface DashboardWidget {
  id: string;
  title: string;
  type: 'chart' | 'metric' | 'list' | 'table' | 'activity';
  size: 'small' | 'medium' | 'large';
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config: Record<string, any>;
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  is_default: boolean;
  user_id?: string;
  role?: UserRole;
}