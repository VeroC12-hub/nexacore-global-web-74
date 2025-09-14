import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AdvancedPortfolioSearch, { PortfolioFilters } from '@/components/portfolio/AdvancedPortfolioSearch';
import PortfolioDisplay from '@/components/portfolio/PortfolioDisplay';
import PortfolioExport from '@/components/portfolio/PortfolioExport';
import { 
  Grid3X3, 
  List, 
  Share2, 
  Download,
  Filter,
  TrendingUp,
  BarChart3,
  Eye
} from 'lucide-react';

interface PortfolioPageProps {
  className?: string;
}

export default function PortfolioPage({ className = "" }: PortfolioPageProps) {
  const [filters, setFilters] = useState<PortfolioFilters>({
    searchTerm: '',
    services: [],
    tags: [],
    dateRange: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
    featuredOnly: false,
    showClientName: false,
    fileTypes: []
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [projectCount, setProjectCount] = useState(0);

  const handleFiltersChange = (newFilters: PortfolioFilters) => {
    setFilters(newFilters);
  };

  const exportPortfolio = () => {
    setShowExportModal(true);
  };

  const sharePortfolio = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('filters', JSON.stringify(filters));
    navigator.clipboard.writeText(url.toString()).then(() => {
      // You could show a toast notification here
      console.log('Portfolio URL copied to clipboard');
    });
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
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-white ${className}`}>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Our Portfolio Showcase
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Explore our comprehensive collection of successful projects across multiple industries and technologies
            </p>
            
            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">150+</div>
                <div className="text-blue-200 text-sm">Projects Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">10</div>
                <div className="text-blue-200 text-sm">Service Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">98%</div>
                <div className="text-blue-200 text-sm">Client Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">24/7</div>
                <div className="text-blue-200 text-sm">Support Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Controls */}
        <div className="mb-8 space-y-6">
          {/* Advanced Search */}
          <AdvancedPortfolioSearch 
            onFiltersChange={handleFiltersChange}
            className="mb-6"
          />

          {/* View Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="px-3"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="px-3"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {getActiveFilterCount() > 0 && (
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-blue-600" />
                  <Badge variant="secondary" className="text-xs">
                    {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} active
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={sharePortfolio}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={exportPortfolio}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Portfolio Display */}
        <PortfolioDisplay
          filters={filters}
          showAdvancedSearch={true}
          maxProjects={50}
          showLoadingState={true}
          className="mb-8"
        />

        {/* Service Categories Overview */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Service Categories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We specialize in cutting-edge technologies and innovative solutions across multiple industries
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { id: 'cad-design', name: 'CAD Design', icon: '🔧', count: 23 },
              { id: 'ai-ml', name: 'AI & ML', icon: '🤖', count: 18 },
              { id: 'blockchain', name: 'Blockchain', icon: '⛓️', count: 15 },
              { id: '3d-animation', name: '3D Animation', icon: '🎬', count: 12 },
              { id: 'ecommerce-tech', name: 'E-Commerce', icon: '🛒', count: 20 },
              { id: 'mobile-dev', name: 'Mobile Dev', icon: '📱', count: 16 },
              { id: 'web-development', name: 'Web Dev', icon: '🌐', count: 25 },
              { id: 'ui-ux-design', name: 'UI/UX', icon: '🎨', count: 14 },
              { id: 'data-analytics', name: 'Analytics', icon: '📊', count: 11 },
              { id: 'cybersecurity', name: 'Security', icon: '🔒', count: 8 }
            ].map((service) => (
              <Card key={service.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{service.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{service.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {service.count} projects
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Portfolio Insights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Portfolio Growth</p>
                  <p className="text-2xl font-bold text-green-600">+24%</p>
                  <p className="text-sm text-gray-500">This quarter</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-blue-600">94.5%</p>
                  <p className="text-sm text-gray-500">Project approval</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Portfolio Views</p>
                  <p className="text-2xl font-bold text-purple-600">12.8K</p>
                  <p className="text-sm text-gray-500">This month</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Modal */}
        {showExportModal && (
          <PortfolioExport
            filters={filters}
            projectCount={projectCount}
            onClose={() => setShowExportModal(false)}
          />
        )}
      </div>
    </div>
  );
}