/**
 * Comprehensive ERP Search System with Fuzzy Matching
 * Searches across all ERP entities: projects, tasks, team members, time entries, etc.
 */

// Types for search results
export interface SearchResult {
  id: string;
  type: 'project' | 'task' | 'team_member' | 'time_entry' | 'client' | 'invoice' | 'document' | 'activity';
  title: string;
  description: string;
  relevanceScore: number;
  data: any;
  category: string;
  status?: string;
  priority?: string;
  assignee?: string;
  project?: string;
  department?: string;
  metadata?: Record<string, any>;
}

export interface SearchableData {
  projects: any[];
  tasks: any[];
  teamMembers: any[];
  timeEntries: any[];
  staffRoles: any[];
  // We can extend this with more data types
}

/**
 * Calculate Levenshtein distance for fuzzy matching
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i += 1) {
    matrix[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j += 1) {
    matrix[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator, // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Calculate fuzzy match score (0-1, higher is better)
 */
function calculateFuzzyScore(query: string, target: string): number {
  const queryLower = query.toLowerCase().trim();
  const targetLower = target.toLowerCase().trim();
  
  // Exact match gets highest score
  if (targetLower === queryLower) return 1.0;
  
  // Contains match gets high score
  if (targetLower.includes(queryLower)) {
    const containsScore = queryLower.length / targetLower.length;
    return Math.max(containsScore, 0.8);
  }
  
  // Word boundary matches
  const queryWords = queryLower.split(/\s+/);
  const targetWords = targetLower.split(/\s+/);
  
  let wordMatchCount = 0;
  for (const queryWord of queryWords) {
    for (const targetWord of targetWords) {
      if (targetWord.startsWith(queryWord) || targetWord.includes(queryWord)) {
        wordMatchCount++;
        break;
      }
    }
  }
  
  const wordScore = wordMatchCount / queryWords.length;
  if (wordScore > 0.5) return wordScore * 0.7;
  
  // Fuzzy string matching using Levenshtein distance
  const maxLength = Math.max(queryLower.length, targetLower.length);
  const distance = levenshteinDistance(queryLower, targetLower);
  const fuzzyScore = (maxLength - distance) / maxLength;
  
  // Only return fuzzy matches above threshold
  return fuzzyScore > 0.6 ? fuzzyScore * 0.5 : 0;
}

/**
 * Search projects
 */
function searchProjects(projects: any[], query: string): SearchResult[] {
  return projects.map(project => {
    const titleScore = calculateFuzzyScore(query, project.title || '');
    const descScore = calculateFuzzyScore(query, project.description || '');
    const statusScore = calculateFuzzyScore(query, project.status || '');
    const typeScore = calculateFuzzyScore(query, project.project_type || '');
    const deptScore = calculateFuzzyScore(query, project.department || '');
    
    const relevanceScore = Math.max(titleScore, descScore * 0.8, statusScore * 0.6, typeScore * 0.7, deptScore * 0.5);
    
    return {
      id: project.id,
      type: 'project' as const,
      title: project.title || 'Untitled Project',
      description: project.description || 'No description available',
      relevanceScore,
      data: project,
      category: 'Projects',
      status: project.status,
      priority: project.priority,
      department: project.department,
      metadata: {
        budget: project.budget,
        progress: project.progress,
        start_date: project.start_date,
        end_date: project.end_date
      }
    };
  }).filter(result => result.relevanceScore > 0);
}

/**
 * Search tasks
 */
function searchTasks(tasks: any[], query: string): SearchResult[] {
  return tasks.map(task => {
    const titleScore = calculateFuzzyScore(query, task.title || '');
    const descScore = calculateFuzzyScore(query, task.description || '');
    const statusScore = calculateFuzzyScore(query, task.status || '');
    const priorityScore = calculateFuzzyScore(query, task.priority || '');
    const assigneeScore = calculateFuzzyScore(query, task.assignee || '');
    const projectScore = calculateFuzzyScore(query, task.project_title || '');
    
    const relevanceScore = Math.max(
      titleScore, 
      descScore * 0.8, 
      statusScore * 0.6, 
      priorityScore * 0.5, 
      assigneeScore * 0.7,
      projectScore * 0.6
    );
    
    return {
      id: task.id,
      type: 'task' as const,
      title: task.title || 'Untitled Task',
      description: task.description || 'No description available',
      relevanceScore,
      data: task,
      category: 'Tasks',
      status: task.status,
      priority: task.priority,
      assignee: task.assignee,
      project: task.project_title,
      metadata: {
        due_date: task.due_date,
        estimated_hours: task.estimated_hours,
        actual_hours: task.actual_hours
      }
    };
  }).filter(result => result.relevanceScore > 0);
}

/**
 * Search team members
 */
function searchTeamMembers(staffRoles: any[], query: string): SearchResult[] {
  return staffRoles.map(staff => {
    const profile = staff.profiles;
    const nameScore = calculateFuzzyScore(query, profile?.full_name || '');
    const emailScore = calculateFuzzyScore(query, profile?.email || '');
    const roleScore = calculateFuzzyScore(query, staff.role || '');
    
    const relevanceScore = Math.max(nameScore, emailScore * 0.9, roleScore * 0.7);
    
    return {
      id: staff.id,
      type: 'team_member' as const,
      title: profile?.full_name || 'Unknown User',
      description: `${staff.role} - ${profile?.email || 'No email'}`,
      relevanceScore,
      data: staff,
      category: 'Team',
      status: staff.is_active ? 'active' : 'inactive',
      department: staff.role,
      metadata: {
        email: profile?.email,
        role: staff.role,
        user_id: staff.user_id
      }
    };
  }).filter(result => result.relevanceScore > 0);
}

/**
 * Search time entries
 */
function searchTimeEntries(timeEntries: any[], query: string): SearchResult[] {
  return timeEntries.map(entry => {
    const descScore = calculateFuzzyScore(query, entry.description || '');
    const projectScore = calculateFuzzyScore(query, entry.project_title || '');
    const taskScore = calculateFuzzyScore(query, entry.task_title || '');
    const userScore = calculateFuzzyScore(query, entry.user_name || '');
    
    const relevanceScore = Math.max(descScore, projectScore * 0.8, taskScore * 0.7, userScore * 0.6);
    
    return {
      id: entry.id,
      type: 'time_entry' as const,
      title: `${entry.hours}h - ${entry.description || 'Time Entry'}`,
      description: `${entry.project_title} ${entry.task_title ? `(${entry.task_title})` : ''} by ${entry.user_name}`,
      relevanceScore,
      data: entry,
      category: 'Time Tracking',
      status: entry.status,
      assignee: entry.user_name,
      project: entry.project_title,
      metadata: {
        hours: entry.hours,
        rate: entry.rate,
        billable: entry.billable,
        start_time: entry.start_time
      }
    };
  }).filter(result => result.relevanceScore > 0);
}

/**
 * Search special system terms and commands
 */
function searchSystemCommands(query: string): SearchResult[] {
  const commands = [
    { keyword: 'dashboard', title: 'Dashboard Overview', description: 'Main dashboard with KPIs and metrics', action: 'goto-overview' },
    { keyword: 'project', title: 'Projects', description: 'Manage all projects', action: 'goto-projects' },
    { keyword: 'task', title: 'Tasks', description: 'View and manage tasks', action: 'goto-tasks' },
    { keyword: 'time', title: 'Time Tracking', description: 'Track time and manage timesheets', action: 'goto-time' },
    { keyword: 'team', title: 'Team Management', description: 'Manage team members and roles', action: 'goto-team' },
    { keyword: 'create project', title: 'New Project', description: 'Create a new project', action: 'new-project' },
    { keyword: 'new task', title: 'New Task', description: 'Create a new task', action: 'new-task' },
    { keyword: 'start timer', title: 'Start Timer', description: 'Start time tracking', action: 'start-timer' },
    { keyword: 'add client', title: 'Add Client', description: 'Add a new client', action: 'add-client' },
    { keyword: 'invoice', title: 'Create Invoice', description: 'Generate new invoice', action: 'create-invoice' },
    { keyword: 'meeting', title: 'Schedule Meeting', description: 'Schedule a new meeting', action: 'schedule-meeting' },
    { keyword: 'report', title: 'Generate Report', description: 'Export data and reports', action: 'export-data' },
    { keyword: 'refresh', title: 'Refresh Data', description: 'Reload all data', action: 'refresh-data' },
    { keyword: 'budget', title: 'Budget Overview', description: 'View budget and financial metrics', action: 'view-budget' },
    { keyword: 'productivity', title: 'Productivity Metrics', description: 'View productivity insights', action: 'view-productivity' }
  ];

  return commands.map(cmd => {
    const score = calculateFuzzyScore(query, cmd.keyword);
    const titleScore = calculateFuzzyScore(query, cmd.title);
    const relevanceScore = Math.max(score, titleScore * 0.8);

    return {
      id: `cmd-${cmd.action}`,
      type: 'activity' as const,
      title: cmd.title,
      description: cmd.description,
      relevanceScore,
      data: { action: cmd.action },
      category: 'Quick Actions',
      metadata: { isCommand: true }
    };
  }).filter(result => result.relevanceScore > 0);
}

/**
 * Main search function
 */
export function searchERP(query: string, data: SearchableData): SearchResult[] {
  if (!query || query.trim().length < 1) {
    return [];
  }

  const trimmedQuery = query.trim();
  
  // Search across all data types
  const projectResults = searchProjects(data.projects || [], trimmedQuery);
  const taskResults = searchTasks(data.tasks || [], trimmedQuery);
  const teamResults = searchTeamMembers(data.staffRoles || [], trimmedQuery);
  const timeResults = searchTimeEntries(data.timeEntries || [], trimmedQuery);
  const commandResults = searchSystemCommands(trimmedQuery);

  // Combine all results
  const allResults = [
    ...projectResults,
    ...taskResults,
    ...teamResults,
    ...timeResults,
    ...commandResults
  ];

  // Sort by relevance score (highest first) and limit results
  return allResults
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 50); // Limit to top 50 results
}

/**
 * Get search suggestions based on partial input
 */
export function getSearchSuggestions(query: string, data: SearchableData): string[] {
  if (!query || query.length < 2) return [];
  
  const suggestions = new Set<string>();
  
  // Add project titles
  data.projects?.forEach(project => {
    if (project.title && project.title.toLowerCase().includes(query.toLowerCase())) {
      suggestions.add(project.title);
    }
  });
  
  // Add task titles
  data.tasks?.forEach(task => {
    if (task.title && task.title.toLowerCase().includes(query.toLowerCase())) {
      suggestions.add(task.title);
    }
  });
  
  // Add team member names
  data.staffRoles?.forEach(staff => {
    if (staff.profiles?.full_name && staff.profiles.full_name.toLowerCase().includes(query.toLowerCase())) {
      suggestions.add(staff.profiles.full_name);
    }
  });
  
  return Array.from(suggestions).slice(0, 8);
}