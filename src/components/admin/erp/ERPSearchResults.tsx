import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search,
  FolderOpen,
  Target,
  Users,
  Timer,
  Zap,
  ArrowRight,
  Clock,
  Calendar,
  DollarSign,
  User,
  Building,
  Briefcase,
  FileText,
  Activity
} from 'lucide-react';
import { SearchResult } from '@/utils/erpSearch';

interface ERPSearchResultsProps {
  results: SearchResult[];
  query: string;
  onSelectResult: (result: SearchResult) => void;
  onClose: () => void;
  loading?: boolean;
}

export function ERPSearchResults({ 
  results, 
  query, 
  onSelectResult, 
  onClose, 
  loading = false 
}: ERPSearchResultsProps) {
  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'project':
        return <FolderOpen className="h-4 w-4 text-blue-500" />;
      case 'task':
        return <Target className="h-4 w-4 text-green-500" />;
      case 'team_member':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'time_entry':
        return <Timer className="h-4 w-4 text-orange-500" />;
      case 'activity':
        return <Zap className="h-4 w-4 text-yellow-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
      case 'todo':
        return 'bg-yellow-100 text-yellow-800';
      case 'on_hold':
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatMetadata = (result: SearchResult) => {
    const metadata = [];
    
    if (result.metadata?.budget) {
      metadata.push(
        <div key="budget" className="flex items-center gap-1 text-xs text-gray-500">
          <DollarSign className="h-3 w-3" />
          ${result.metadata.budget.toLocaleString()}
        </div>
      );
    }
    
    if (result.metadata?.hours) {
      metadata.push(
        <div key="hours" className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          {result.metadata.hours}h
        </div>
      );
    }
    
    if (result.metadata?.due_date) {
      metadata.push(
        <div key="due_date" className="flex items-center gap-1 text-xs text-gray-500">
          <Calendar className="h-3 w-3" />
          {new Date(result.metadata.due_date).toLocaleDateString()}
        </div>
      );
    }
    
    if (result.assignee) {
      metadata.push(
        <div key="assignee" className="flex items-center gap-1 text-xs text-gray-500">
          <User className="h-3 w-3" />
          {result.assignee}
        </div>
      );
    }
    
    if (result.department) {
      metadata.push(
        <div key="department" className="flex items-center gap-1 text-xs text-gray-500">
          <Building className="h-3 w-3" />
          {result.department}
        </div>
      );
    }

    return metadata;
  };

  if (loading) {
    return (
      <Card className="absolute top-16 left-0 right-0 z-50 shadow-lg border max-h-96 overflow-y-auto">
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Searching...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0 && query.length > 0) {
    return (
      <Card className="absolute top-16 left-0 right-0 z-50 shadow-lg border max-h-96 overflow-y-auto">
        <CardContent className="p-4">
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-xs text-gray-500">
              No matches for "{query}". Try different keywords or check spelling.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return null;
  }

  // Group results by category
  const groupedResults = results.reduce((acc, result) => {
    const category = result.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <Card className="absolute top-16 left-0 right-0 z-50 shadow-lg border max-h-96 overflow-y-auto">
      <CardContent className="p-2">
        {/* Search Summary */}
        <div className="px-2 py-2 border-b border-gray-100">
          <p className="text-xs text-gray-600">
            Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
          </p>
        </div>

        {/* Results by Category */}
        {Object.entries(groupedResults).map(([category, categoryResults]) => (
          <div key={category} className="py-1">
            <h4 className="text-xs font-semibold text-gray-700 px-2 py-1 bg-gray-50 rounded">
              {category} ({categoryResults.length})
            </h4>
            <div className="space-y-1 mt-1">
              {categoryResults.slice(0, 8).map((result, index) => (
                <div
                  key={`${result.id}-${index}`}
                  className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group"
                  onClick={() => onSelectResult(result)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getResultIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {result.title}
                          </p>
                          <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                            {result.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="h-3 w-3 text-gray-400" />
                        </div>
                      </div>

                      {/* Badges and Metadata */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {result.status && (
                          <Badge variant="outline" className={`text-xs ${getStatusColor(result.status)}`}>
                            {result.status.replace('_', ' ')}
                          </Badge>
                        )}
                        {result.priority && (
                          <Badge variant="outline" className={`text-xs ${getPriorityColor(result.priority)}`}>
                            {result.priority}
                          </Badge>
                        )}
                        {result.project && result.type !== 'project' && (
                          <Badge variant="outline" className="text-xs bg-indigo-100 text-indigo-800">
                            <Briefcase className="h-2 w-2 mr-1" />
                            {result.project}
                          </Badge>
                        )}
                      </div>

                      {/* Additional Metadata */}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {formatMetadata(result)}
                      </div>

                      {/* Relevance Score (for debugging - can be removed in production) */}
                      {process.env.NODE_ENV === 'development' && (
                        <div className="mt-1">
                          <span className="text-xs text-gray-400">
                            Score: {(result.relevanceScore * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {categoryResults.length > 8 && (
                <div className="px-3 py-2 text-center">
                  <span className="text-xs text-gray-500">
                    +{categoryResults.length - 8} more results in {category}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Quick Actions Footer */}
        <div className="border-t border-gray-100 p-2 mt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Press</span>
              <Badge variant="outline" className="text-xs">↵</Badge>
              <span className="text-xs text-gray-500">to select</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs h-6"
            >
              Close
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}