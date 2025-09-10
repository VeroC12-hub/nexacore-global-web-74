export { ERPOverviewTab } from './ERPOverviewTab';
export { ERPProjectsTab } from './ERPProjectsTab';
export { ERPTasksTab } from './ERPTasksTab';
export { ERPTimeTab } from './ERPTimeTab';
export { ERPTeamTab } from './ERPTeamTab';
export { ERPSearchResults } from './ERPSearchResults';
export { EnhancedSearchBar } from './EnhancedSearchBar';

// Types that are shared across ERP components
export interface ERPProject {
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

export interface ERPStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalBudget: number;
  totalSpent: number;
  budgetUtilization: number;
  teamMembers: number;
  avgProjectDuration: number;
}

export interface StaffRole {
  id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  profiles: {
    id: string;
    email: string;
    full_name: string;
  };
}