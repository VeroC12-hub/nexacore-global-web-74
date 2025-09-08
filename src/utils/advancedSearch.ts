/**
 * Advanced ERP Search Engine with Operator Support
 * Integrates with the existing search system but adds operator-based filtering
 */

import { searchERP, SearchResult, SearchableData } from './erpSearch';
import { parseSearchQuery, ParsedQuery, SearchOperator, DateRangeOperator, getDateRangeBounds } from './searchOperators';

/**
 * Advanced search function that handles both operators and free text
 */
export function advancedSearchERP(query: string, data: SearchableData): SearchResult[] {
  if (!query || query.trim().length < 1) {
    return [];
  }

  // Parse the query into operators and free text
  const parsedQuery = parseSearchQuery(query);
  
  // If no operators, fall back to regular search
  if (parsedQuery.operators.length === 0 && parsedQuery.dateRanges.length === 0 && 
      parsedQuery.tags.length === 0 && parsedQuery.excludes.length === 0) {
    return searchERP(query, data);
  }

  // Start with all possible results from free text search (if any)
  let results: SearchResult[] = [];
  
  if (parsedQuery.freeText) {
    results = searchERP(parsedQuery.freeText, data);
  } else {
    // If no free text, start with all items
    results = getAllItems(data);
  }

  // Apply operator filters
  results = applyOperatorFilters(results, parsedQuery);

  // Apply date range filters
  results = applyDateRangeFilters(results, parsedQuery.dateRanges);

  // Apply tag filters
  results = applyTagFilters(results, parsedQuery.tags);

  // Apply exclusion filters
  results = applyExclusionFilters(results, parsedQuery.excludes);

  // Sort by relevance (if free text was used) or by date/priority
  if (parsedQuery.freeText) {
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  } else {
    results.sort((a, b) => sortByPriorityAndDate(a, b));
  }

  return results.slice(0, 50); // Limit results
}

/**
 * Get all items from searchable data as SearchResults
 */
function getAllItems(data: SearchableData): SearchResult[] {
  const results: SearchResult[] = [];

  // Add all projects
  data.projects?.forEach(project => {
    results.push({
      id: project.id,
      type: 'project',
      title: project.title || 'Untitled Project',
      description: project.description || 'No description',
      relevanceScore: 1.0,
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
    });
  });

  // Add all tasks
  data.tasks?.forEach(task => {
    results.push({
      id: task.id,
      type: 'task',
      title: task.title || 'Untitled Task',
      description: task.description || 'No description',
      relevanceScore: 1.0,
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
    });
  });

  // Add all team members
  data.staffRoles?.forEach(staff => {
    const profile = staff.profiles;
    results.push({
      id: staff.id,
      type: 'team_member',
      title: profile?.full_name || 'Unknown User',
      description: `${staff.role} - ${profile?.email || 'No email'}`,
      relevanceScore: 1.0,
      data: staff,
      category: 'Team',
      status: staff.is_active ? 'active' : 'inactive',
      department: staff.role,
      metadata: {
        email: profile?.email,
        role: staff.role,
        user_id: staff.user_id
      }
    });
  });

  // Add all time entries
  data.timeEntries?.forEach(entry => {
    results.push({
      id: entry.id,
      type: 'time_entry',
      title: `${entry.hours}h - ${entry.description || 'Time Entry'}`,
      description: `${entry.project_title} ${entry.task_title ? `(${entry.task_title})` : ''} by ${entry.user_name}`,
      relevanceScore: 1.0,
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
    });
  });

  return results;
}

/**
 * Apply operator-based filters to results
 */
function applyOperatorFilters(results: SearchResult[], query: ParsedQuery): SearchResult[] {
  return results.filter(result => {
    return query.operators.every(operator => {
      return matchesOperator(result, operator);
    });
  });
}

/**
 * Check if a result matches a specific operator
 */
function matchesOperator(result: SearchResult, operator: SearchOperator): boolean {
  const { field, operator: op, value } = operator;

  // Get the field value from the result
  const fieldValue = getFieldValue(result, field);
  
  if (fieldValue === null || fieldValue === undefined) {
    return false;
  }

  // Apply the operator
  switch (op) {
    case '=':
      return compareValues(fieldValue, value, 'equals');
    case '!=':
      return !compareValues(fieldValue, value, 'equals');
    case '>':
      return compareValues(fieldValue, value, 'greater');
    case '>=':
      return compareValues(fieldValue, value, 'greaterEqual');
    case '<':
      return compareValues(fieldValue, value, 'less');
    case '<=':
      return compareValues(fieldValue, value, 'lessEqual');
    case 'contains':
      return fieldValue.toString().toLowerCase().includes(value.toString().toLowerCase());
    case 'startswith':
      return fieldValue.toString().toLowerCase().startsWith(value.toString().toLowerCase());
    case 'endswith':
      return fieldValue.toString().toLowerCase().endsWith(value.toString().toLowerCase());
    default:
      return true;
  }
}

/**
 * Get field value from a search result
 */
function getFieldValue(result: SearchResult, field: string): any {
  switch (field) {
    case 'type':
      return result.type;
    case 'status':
      return result.status;
    case 'priority':
      return result.priority;
    case 'assignee':
      return result.assignee || result.data.assignee || result.data.user_name;
    case 'project':
      return result.project || result.data.project_title || result.data.project;
    case 'department':
      return result.department || result.data.department || result.data.role;
    case 'budget':
      return result.metadata?.budget || result.data.budget || result.data.amount;
    case 'hours':
      return result.metadata?.hours || result.data.hours || result.data.estimated_hours || result.data.actual_hours;
    case 'due':
      return result.metadata?.due_date || result.data.due_date || result.data.end_date;
    case 'created':
      return result.data.created_at || result.data.created;
    case 'updated':
      return result.data.updated_at || result.data.updated || result.data.modified_at;
    case 'billable':
      return result.metadata?.billable || result.data.billable;
    case 'active':
      return result.data.is_active || result.data.active || (result.status === 'active');
    case 'role':
      return result.data.role || result.metadata?.role;
    case 'email':
      return result.metadata?.email || result.data.email || result.data.profiles?.email;
    case 'id':
      return result.id || result.data.id;
    default:
      // Try to get from data object directly
      return result.data[field] || result.metadata?.[field];
  }
}

/**
 * Compare values with different operators
 */
function compareValues(fieldValue: any, targetValue: any, comparison: string): boolean {
  // Handle string comparisons
  if (typeof fieldValue === 'string' && typeof targetValue === 'string') {
    const field = fieldValue.toLowerCase();
    const target = targetValue.toLowerCase();
    
    switch (comparison) {
      case 'equals':
        return field === target || field.includes(target);
      case 'greater':
        return field > target;
      case 'greaterEqual':
        return field >= target;
      case 'less':
        return field < target;
      case 'lessEqual':
        return field <= target;
    }
  }

  // Handle numeric comparisons
  const fieldNum = parseFloat(fieldValue);
  const targetNum = parseFloat(targetValue);
  
  if (!isNaN(fieldNum) && !isNaN(targetNum)) {
    switch (comparison) {
      case 'equals':
        return fieldNum === targetNum;
      case 'greater':
        return fieldNum > targetNum;
      case 'greaterEqual':
        return fieldNum >= targetNum;
      case 'less':
        return fieldNum < targetNum;
      case 'lessEqual':
        return fieldNum <= targetNum;
    }
  }

  // Handle boolean comparisons
  if (typeof fieldValue === 'boolean' && typeof targetValue === 'boolean') {
    return comparison === 'equals' ? fieldValue === targetValue : fieldValue !== targetValue;
  }

  // Handle date comparisons
  const fieldDate = new Date(fieldValue);
  const targetDate = new Date(targetValue);
  
  if (!isNaN(fieldDate.getTime()) && !isNaN(targetDate.getTime())) {
    switch (comparison) {
      case 'equals':
        return fieldDate.getTime() === targetDate.getTime();
      case 'greater':
        return fieldDate.getTime() > targetDate.getTime();
      case 'greaterEqual':
        return fieldDate.getTime() >= targetDate.getTime();
      case 'less':
        return fieldDate.getTime() < targetDate.getTime();
      case 'lessEqual':
        return fieldDate.getTime() <= targetDate.getTime();
    }
  }

  return false;
}

/**
 * Apply date range filters
 */
function applyDateRangeFilters(results: SearchResult[], dateRanges: DateRangeOperator[]): SearchResult[] {
  if (dateRanges.length === 0) return results;

  return results.filter(result => {
    return dateRanges.every(dateRange => {
      const fieldValue = getFieldValue(result, dateRange.field);
      if (!fieldValue) return false;

      const itemDate = new Date(fieldValue);
      if (isNaN(itemDate.getTime())) return false;

      if (dateRange.range === 'custom' && dateRange.startDate && dateRange.endDate) {
        return itemDate >= dateRange.startDate && itemDate <= dateRange.endDate;
      }

      const { start, end } = getDateRangeBounds(dateRange.range);
      return itemDate >= start && itemDate < end;
    });
  });
}

/**
 * Apply tag filters (for items that have tags or can be tagged)
 */
function applyTagFilters(results: SearchResult[], tags: string[]): SearchResult[] {
  if (tags.length === 0) return results;

  return results.filter(result => {
    return tags.every(tag => {
      // Check if the tag exists in various fields
      const searchableText = [
        result.title,
        result.description,
        result.data.tags?.join(' ') || '',
        result.data.keywords?.join(' ') || '',
        result.priority,
        result.status,
        result.category
      ].join(' ').toLowerCase();

      return searchableText.includes(tag.toLowerCase());
    });
  });
}

/**
 * Apply exclusion filters
 */
function applyExclusionFilters(results: SearchResult[], excludes: string[]): SearchResult[] {
  if (excludes.length === 0) return results;

  return results.filter(result => {
    return !excludes.some(exclude => {
      const searchableText = [
        result.title,
        result.description,
        result.status,
        result.priority,
        result.assignee,
        result.project,
        result.department,
        result.category
      ].join(' ').toLowerCase();

      return searchableText.includes(exclude.toLowerCase());
    });
  });
}

/**
 * Sort results by priority and date when no relevance score is available
 */
function sortByPriorityAndDate(a: SearchResult, b: SearchResult): number {
  // Priority order: urgent > high > medium > low
  const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
  
  const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
  const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
  
  if (aPriority !== bPriority) {
    return bPriority - aPriority; // Higher priority first
  }

  // If same priority, sort by date (most recent first)
  const aDate = new Date(a.data.created_at || a.data.updated_at || 0);
  const bDate = new Date(b.data.created_at || b.data.updated_at || 0);
  
  return bDate.getTime() - aDate.getTime();
}