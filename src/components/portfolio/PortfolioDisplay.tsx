import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Users, 
  Calendar, 
  FileText, 
  ExternalLink,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { usePortfolioData, formatFileSize, getServiceIcon } from '@/hooks/usePortfolioData';

interface PortfolioDisplayProps {
  serviceId?: string;
  maxProjects?: number;
  showLoadingState?: boolean;
  showFeaturedOnly?: boolean;
  className?: string;
}

export default function PortfolioDisplay({ 
  serviceId, 
  maxProjects = 6, 
  showLoadingState = true,
  showFeaturedOnly = false,
  className = "" 
}: PortfolioDisplayProps) {
  const { projects, loading, error, refetch } = usePortfolioData(serviceId, maxProjects);

  // Filter featured projects if requested
  const displayProjects = showFeaturedOnly 
    ? projects.filter(p => p.is_featured)
    : projects;

  if (loading && showLoadingState) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
          <RefreshCw className="w-5 h-5 animate-spin text-primary" />
          <div>
            <p className="font-medium text-foreground">Loading Portfolio Projects</p>
            <p className="text-sm text-muted-foreground">
              {serviceId ? `Fetching ${serviceId.replace('-', ' ')} projects...` : 'Fetching all projects...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-destructive mb-1">Failed to Load Portfolio</h4>
              <p className="text-sm text-destructive/80 mb-3">{error}</p>
              <Button size="sm" variant="outline" onClick={refetch}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (displayProjects.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="p-6 bg-muted/20 border border-dashed border-muted-foreground/20 rounded-lg text-center">
          <div className="text-4xl mb-3">{serviceId ? getServiceIcon(serviceId) : '📁'}</div>
          <h4 className="font-medium text-foreground mb-2">No Projects Found</h4>
          <p className="text-sm text-muted-foreground mb-4">
            {serviceId 
              ? `No ${serviceId.replace('-', ' ')} projects are currently available for showcase.`
              : 'No portfolio projects are currently available for showcase.'
            }
          </p>
          <p className="text-xs text-muted-foreground">
            Projects will appear here once they are marked as published in the system.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            {serviceId && <span className="text-xl">{getServiceIcon(serviceId)}</span>}
            {serviceId 
              ? `${serviceId.replace('-', ' ')} Projects` 
              : 'Portfolio Projects'
            }
          </h3>
          <p className="text-sm text-muted-foreground">
            {displayProjects.length} project{displayProjects.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <CheckCircle className="w-3 h-3 mr-1" />
            Live Data
          </Badge>
          <Button size="sm" variant="ghost" onClick={refetch}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {/* Show More Button */}
      {projects.length >= maxProjects && (
        <div className="text-center">
          <Button variant="outline">
            View All {serviceId?.replace('-', ' ')} Projects
            <ExternalLink className="ml-2 w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// Individual Project Card Component
function ProjectCard({ project }: { project: any }) {
  const hasFiles = project.portfolio_files && project.portfolio_files.length > 0;
  const downloadableFiles = project.portfolio_files?.filter((f: any) => f.is_downloadable) || [];

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      {/* Project Thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
        {/* Service Icon Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl opacity-10">
            {getServiceIcon(project.service_id)}
          </div>
        </div>

        {/* Project badges */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="text-xs">
            {project.service_id.replace('-', ' ')}
          </Badge>
        </div>
        
        {project.is_featured && (
          <div className="absolute top-3 right-3">
            <Badge className="text-xs bg-yellow-500 text-white">
              ⭐ Featured
            </Badge>
          </div>
        )}

        {/* Client visibility indicator */}
        <div className="absolute bottom-3 right-3">
          {project.show_client_name ? (
            <Eye className="w-4 h-4 text-white/70" />
          ) : (
            <EyeOff className="w-4 h-4 text-white/70" />
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-3 left-3 text-white">
            <p className="text-sm font-medium">
              {project.show_client_name ? project.client_name : 'Confidential Project'}
            </p>
          </div>
        </div>
      </div>

      {/* Project Content */}
      <div className="p-4 space-y-3">
        <div>
          <h4 className="font-semibold text-foreground mb-1 line-clamp-1">
            {project.title}
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.short_description || project.description}
          </p>
        </div>

        {/* Project Metrics */}
        {project.project_metrics && Object.keys(project.project_metrics).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(project.project_metrics).slice(0, 2).map(([key, value]) => (
              <Badge key={key} variant="outline" className="text-xs">
                {value as string}
              </Badge>
            ))}
          </div>
        )}

        {/* Files Section */}
        {hasFiles && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Available Downloads
            </p>
            <div className="flex flex-wrap gap-2">
              {downloadableFiles.slice(0, 4).map((file: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => window.open(file.file_url, '_blank')}
                  className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded flex items-center gap-1 transition-colors"
                  title={`${file.filename} (${formatFileSize(file.file_size_bytes || 0)})`}
                >
                  <Download className="w-3 h-3" />
                  {file.file_type.toUpperCase()}
                </button>
              ))}
              {downloadableFiles.length > 4 && (
                <span className="px-2 py-1 text-xs text-muted-foreground">
                  +{downloadableFiles.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.tags.slice(0, 3).map((tag: string, idx: number) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{project.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <Button variant="outline" size="sm" className="w-full">
            View Project Details
            <ExternalLink className="ml-2 w-3 h-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}