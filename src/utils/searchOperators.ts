/**
 * Advanced Search Query Parser with Google-style operators
 * Supports operators like: type:project status:active assignee:john budget:>50000
 */

export interface SearchOperator {
  field: string;
  operator: '=' | '>' | '<' | '>=' | '<=' | '!=' | 'contains' | 'startswith' | 'endswith';
  value: string | number | boolean;
}

export interface ParsedQuery {
  operators: SearchOperator[];
  freeText: string;
  dateRanges: DateRangeOperator[];
  tags: string[];
  excludes: string[];
}

export interface DateRangeOperator {
  field: string;
  range: 'today' | 'yesterday' | 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'this-year' | 'custom';
  startDate?: Date;
  endDate?: Date;
}

/**
 * Supported search operators and their aliases
 */
const FIELD_ALIASES: Record<string, string[]> = {
  'type': ['type', 't', 'category', 'cat'],
  'status': ['status', 'state', 's'],
  'priority': ['priority', 'pri', 'p'],
  'assignee': ['assignee', 'assigned', 'user', 'u', '@'],
  'project': ['project', 'proj', 'in'],
  'department': ['department', 'dept', 'team'],
  'budget': ['budget', 'cost', 'amount'],
  'hours': ['hours', 'time', 'h'],
  'due': ['due', 'deadline', 'due-date'],
  'created': ['created', 'created-date', 'date'],
  'updated': ['updated', 'modified', 'updated-date'],
  'billable': ['billable', 'bill'],
  'active': ['active', 'enabled'],
  'role': ['role', 'position'],
  'email': ['email', 'mail'],
  'id': ['id', 'identifier']
};

/**
 * Date range keywords
 */
const DATE_RANGES: Record<string, DateRangeOperator['range']> = {
  'today': 'today',
  'yesterday': 'yesterday',
  'this-week': 'this-week',
  'thisweek': 'this-week',
  'last-week': 'last-week',
  'lastweek': 'last-week',
  'this-month': 'this-month',
  'thismonth': 'this-month',
  'last-month': 'last-month',
  'lastmonth': 'last-month',
  'this-year': 'this-year',
  'thisyear': 'this-year'
};

/**
 * Parse a search query into structured components
 */
export function parseSearchQuery(query: string): ParsedQuery {
  const result: ParsedQuery = {
    operators: [],
    freeText: '',
    dateRanges: [],
    tags: [],
    excludes: []
  };

  if (!query.trim()) {
    return result;
  }

  // Regular expressions for different operators
  const operatorRegex = /(\w+):((?:[^\s"]+|"[^"]*"))/g;
  const tagRegex = /#([a-zA-Z0-9_-]+)/g;
  const excludeRegex = /-([a-zA-Z0-9_-]+)/g;
  const atMentionRegex = /@([a-zA-Z0-9_.-]+)/g;

  let processedQuery = query;

  // Extract operators (field:value)
  let match;
  while ((match = operatorRegex.exec(query)) !== null) {
    const [fullMatch, field, value] = match;
    const cleanValue = value.replace(/^"(.*)"$/, '$1'); // Remove quotes
    
    const operator = parseOperator(field, cleanValue);
    if (operator) {
      result.operators.push(operator);
    }
    
    // Check if it's a date range
    const dateRange = parseDateRange(field, cleanValue);
    if (dateRange) {
      result.dateRanges.push(dateRange);
    }
    
    // Remove the operator from the query
    processedQuery = processedQuery.replace(fullMatch, ' ').trim();
  }

  // Extract tags (#tag)
  while ((match = tagRegex.exec(query)) !== null) {
    result.tags.push(match[1]);
    processedQuery = processedQuery.replace(match[0], ' ').trim();
  }

  // Extract excludes (-word)
  while ((match = excludeRegex.exec(query)) !== null) {
    result.excludes.push(match[1]);
    processedQuery = processedQuery.replace(match[0], ' ').trim();
  }

  // Extract @ mentions
  while ((match = atMentionRegex.exec(query)) !== null) {
    result.operators.push({
      field: 'assignee',
      operator: 'contains',
      value: match[1]
    });
    processedQuery = processedQuery.replace(match[0], ' ').trim();
  }

  // Remaining text is free text search
  result.freeText = processedQuery.replace(/\s+/g, ' ').trim();

  return result;
}

/**
 * Parse an individual operator
 */
function parseOperator(field: string, value: string): SearchOperator | null {
  // Normalize field name
  const normalizedField = normalizeFieldName(field.toLowerCase());
  if (!normalizedField) {
    return null;
  }

  // Detect comparison operators
  let operator: SearchOperator['operator'] = '=';
  let cleanValue: string | number | boolean = value;

  if (value.startsWith('>=')) {
    operator = '>=';
    cleanValue = value.substring(2);
  } else if (value.startsWith('<=')) {
    operator = '<=';
    cleanValue = value.substring(2);
  } else if (value.startsWith('>')) {
    operator = '>';
    cleanValue = value.substring(1);
  } else if (value.startsWith('<')) {
    operator = '<';
    cleanValue = value.substring(1);
  } else if (value.startsWith('!=') || value.startsWith('!')) {
    operator = '!=';
    cleanValue = value.startsWith('!=') ? value.substring(2) : value.substring(1);
  } else if (value.startsWith('*') && value.endsWith('*')) {
    operator = 'contains';
    cleanValue = value.slice(1, -1);
  } else if (value.endsWith('*')) {
    operator = 'startswith';
    cleanValue = value.slice(0, -1);
  } else if (value.startsWith('*')) {
    operator = 'endswith';
    cleanValue = value.substring(1);
  }

  // Convert value to appropriate type
  cleanValue = convertValue(normalizedField, cleanValue.toString());

  return {
    field: normalizedField,
    operator,
    value: cleanValue
  };
}

/**
 * Parse date range operators
 */
function parseDateRange(field: string, value: string): DateRangeOperator | null {
  const normalizedField = normalizeFieldName(field.toLowerCase());
  if (!normalizedField || !['due', 'created', 'updated'].includes(normalizedField)) {
    return null;
  }

  const lowerValue = value.toLowerCase();
  
  if (DATE_RANGES[lowerValue]) {
    return {
      field: normalizedField,
      range: DATE_RANGES[lowerValue]
    };
  }

  // Try to parse as date
  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    return {
      field: normalizedField,
      range: 'custom',
      startDate: date,
      endDate: date
    };
  }

  return null;
}

/**
 * Normalize field names using aliases
 */
function normalizeFieldName(field: string): string | null {
  for (const [canonical, aliases] of Object.entries(FIELD_ALIASES)) {
    if (aliases.includes(field)) {
      return canonical;
    }
  }
  return null;
}

/**
 * Convert string values to appropriate types
 */
function convertValue(field: string, value: string): string | number | boolean {
  // Boolean fields
  if (['billable', 'active'].includes(field)) {
    const lower = value.toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(lower)) return true;
    if (['false', '0', 'no', 'off'].includes(lower)) return false;
  }

  // Numeric fields
  if (['budget', 'hours', 'id'].includes(field)) {
    const num = parseFloat(value);
    if (!isNaN(num)) return num;
  }

  return value;
}

/**
 * Get date range boundaries
 */
export function getDateRangeBounds(range: DateRangeOperator['range']): { start: Date; end: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (range) {
    case 'today':
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };
    
    case 'yesterday': {
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        start: yesterday,
        end: today
      };
    }
    
    case 'this-week': {
      const dayOfWeek = today.getDay();
      const startOfWeek = new Date(today.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
      const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
      return { start: startOfWeek, end: endOfWeek };
    }
    
    case 'last-week': {
      const dayOfWeek = today.getDay();
      const endOfLastWeek = new Date(today.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
      const startOfLastWeek = new Date(endOfLastWeek.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { start: startOfLastWeek, end: endOfLastWeek };
    }
    
    case 'this-month': {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      return { start: startOfMonth, end: endOfMonth };
    }
    
    case 'last-month': {
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start: startOfLastMonth, end: endOfLastMonth };
    }
    
    case 'this-year': {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const endOfYear = new Date(today.getFullYear() + 1, 0, 1);
      return { start: startOfYear, end: endOfYear };
    }
    
    default:
      return { start: today, end: today };
  }
}

/**
 * Generate help text for search operators
 */
export function getSearchOperatorHelp(): string[] {
  return [
    'Search Operators:',
    '',
    'Basic Operators:',
    '• type:project - Find projects',
    '• status:active - Items with specific status', 
    '• assignee:john - Assigned to specific user',
    '• @john - Same as assignee:john',
    '• priority:high - High priority items',
    '',
    'Comparison Operators:',
    '• budget:>50000 - Budget greater than 50k',
    '• hours:<8 - Less than 8 hours',
    '• budget:>=10000 - Budget 10k or more',
    '',
    'Date Operators:',
    '• due:today - Due today',
    '• created:this-week - Created this week',
    '• updated:last-month - Updated last month',
    '',
    'Text Operators:',
    '• title:*mobile* - Contains "mobile"',
    '• name:john* - Starts with "john"',
    '• email:*@company.com - Ends with domain',
    '',
    'Special Operators:',
    '• #urgent - Tagged items',
    '• -completed - Exclude completed',
    '• billable:true - Only billable items',
    '',
    'Examples:',
    '• type:project status:active @john',
    '• priority:high due:this-week -completed',
    '• budget:>10000 department:marketing',
    '• #urgent assignee:sarah created:today'
  ];
}