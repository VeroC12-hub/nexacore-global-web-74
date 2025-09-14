import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import {
  Search,
  Filter,
  X,
  Calendar,
  User,
  Tag,
  Star,
  FileText,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';

interface AdvancedPortfolioSearchProps {
  onFiltersChange: (filters: PortfolioFilters) => void;
  className?: string;
}

export interface PortfolioFilters {
  searchTerm: string;
  services: string[];
  tags: string[];
  dateRange: 'all' | '30d' | '90d' | '1y';
  sortBy: 'date' | 'title' | 'featured' | 'client';
  sortOrder: 'asc' | 'desc';
  featuredOnly: boolean;
  showClientName: boolean;
  fileTypes: string[];
}

const defaultFilters: PortfolioFilters = {
  searchTerm: '',
  services: [],
  tags: [],
  dateRange: 'all',
  sortBy: 'date',
  sortOrder: 'desc',
  featuredOnly: false,
  showClientName: false,
  fileTypes: []
};

export default function AdvancedPortfolioSearch({ 
  onFiltersChange, 
  className = "" 
}: AdvancedPortfolioSearchProps) {
  const [filters, setFilters] = useState<PortfolioFilters>(defaultFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableFileTypes, setAvailableFileTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const services = [
    { id: 'cad-design', name: 'CAD Design & Engineering', icon: '🔧' },
    { id: 'ai-ml', name: 'AI & Machine Learning', icon: '🤖' },
    { id: 'blockchain', name: 'Blockchain & Web3', icon: '⛓️' },
    { id: '3d-animation', name: '3D Animation & VFX', icon: '🎬' },
    { id: 'ecommerce-tech', name: 'E-Commerce Technology', icon: '🛒' },
    { id: 'mobile-dev', name: 'Mobile Development', icon: '📱' },
    { id: 'web-development', name: 'Web Development', icon: '🌐' },
    { id: 'ui-ux-design', name: 'UI/UX Design', icon: '🎨' },
    { id: 'data-analytics', name: 'Data Analytics', icon: '📊' },
    { id: 'cybersecurity', name: 'Cybersecurity', icon: '🔒' }
  ];

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const loadFilterOptions = async () => {
    try {
      setLoading(true);

      // Get all unique tags
      const { data: projects, error: projectsError } = await supabase
        .from('portfolio_projects')
        .select('tags, portfolio_files(file_type)')
        .eq('is_published', true);

      if (projectsError) throw projectsError;

      // Extract unique tags
      const tags = new Set<string>();
      const fileTypes = new Set<string>();

      projects.forEach(project => {
        if (project.tags) {
          project.tags.forEach((tag: string) => tags.add(tag));
        }
        if (project.portfolio_files) {
          project.portfolio_files.forEach((file: any) => {
            if (file.file_type) fileTypes.add(file.file_type.toUpperCase());
          });
        }
      });

      setAvailableTags(Array.from(tags).sort());
      setAvailableFileTypes(Array.from(fileTypes).sort());

    } catch (error) {
      console.error('Error loading filter options:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (key: keyof PortfolioFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleArrayFilter = (key: 'services' | 'tags' | 'fileTypes', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const hasActiveFilters = () => {
    return filters.searchTerm !== '' ||
           filters.services.length > 0 ||
           filters.tags.length > 0 ||
           filters.dateRange !== 'all' ||
           filters.featuredOnly ||
           filters.showClientName ||
           filters.fileTypes.length > 0 ||
           filters.sortBy !== 'date' ||
           filters.sortOrder !== 'desc';
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.services.length) count++;
    if (filters.tags.length) count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.featuredOnly) count++;
    if (filters.showClientName) count++;
    if (filters.fileTypes.length) count++;
    if (filters.sortBy !== 'date' || filters.sortOrder !== 'desc') count++;
    return count;
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        {/* Basic Search */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search projects by title, description, or client..."
              value={filters.searchTerm}
              onChange={(e) => updateFilters('searchTerm', e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Advanced</span>
            {hasActiveFilters() && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>

          {hasActiveFilters() && (
            <Button variant="ghost" onClick={clearFilters} className="text-red-600">
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="border-t pt-4 space-y-6">
            {/* Service Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Service Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {services.map(service => (
                  <button
                    key={service.id}
                    onClick={() => toggleArrayFilter('services', service.id)}
                    className={`px-3 py-2 rounded-full text-sm font-medium border transition-colors ${
                      filters.services.includes(service.id)
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{service.icon}</span>
                    {service.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            {availableTags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleArrayFilter('tags', tag)}
                      className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                        filters.tags.includes(tag)
                          ? 'bg-green-100 text-green-800 border-green-300'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <Tag className="h-3 w-3 inline mr-1" />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date Range & Sort */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <Select value={filters.dateRange} onValueChange={(value: any) => updateFilters('dateRange', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="90d">Last 3 Months</SelectItem>
                    <SelectItem value="1y">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <Select value={filters.sortBy} onValueChange={(value: any) => updateFilters('sortBy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date Created</SelectItem>
                    <SelectItem value="title">Project Title</SelectItem>
                    <SelectItem value="featured">Featured First</SelectItem>
                    <SelectItem value="client">Client Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order
                </label>
                <Select value={filters.sortOrder} onValueChange={(value: any) => updateFilters('sortOrder', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col justify-end">
                <Button
                  variant="outline"
                  onClick={() => updateFilters('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="h-10"
                >
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  {filters.sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                </Button>
              </div>
            </div>

            {/* File Types */}
            {availableFileTypes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Available File Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableFileTypes.map(fileType => (
                    <button
                      key={fileType}
                      onClick={() => toggleArrayFilter('fileTypes', fileType)}
                      className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                        filters.fileTypes.includes(fileType)
                          ? 'bg-purple-100 text-purple-800 border-purple-300'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <FileText className="h-3 w-3 inline mr-1" />
                      {fileType}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Special Filters */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featuredOnly"
                  checked={filters.featuredOnly}
                  onCheckedChange={(checked) => updateFilters('featuredOnly', checked)}
                />
                <label htmlFor="featuredOnly" className="text-sm font-medium text-gray-700">
                  <Star className="h-4 w-4 inline mr-1 text-yellow-500" />
                  Featured projects only
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showClientName"
                  checked={filters.showClientName}
                  onCheckedChange={(checked) => updateFilters('showClientName', checked)}
                />
                <label htmlFor="showClientName" className="text-sm font-medium text-gray-700">
                  <User className="h-4 w-4 inline mr-1" />
                  Show client names only
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters() && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {filters.searchTerm && (
                <Badge variant="outline" className="text-xs">
                  <Search className="h-3 w-3 mr-1" />
                  "{filters.searchTerm}"
                </Badge>
              )}
              {filters.services.map(service => (
                <Badge key={service} variant="outline" className="text-xs">
                  {services.find(s => s.id === service)?.icon} {services.find(s => s.id === service)?.name}
                </Badge>
              ))}
              {filters.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
              {filters.dateRange !== 'all' && (
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {filters.dateRange === '30d' ? 'Last 30 days' :
                   filters.dateRange === '90d' ? 'Last 3 months' :
                   filters.dateRange === '1y' ? 'Last year' : 'All time'}
                </Badge>
              )}
              {filters.featuredOnly && (
                <Badge variant="outline" className="text-xs text-yellow-700">
                  <Star className="h-3 w-3 mr-1" />
                  Featured only
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}