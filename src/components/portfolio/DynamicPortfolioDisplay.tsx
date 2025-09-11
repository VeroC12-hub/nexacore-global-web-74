import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Users, 
  Calendar, 
  FileText, 
  Play, 
  ExternalLink,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProjectFile {
  id: string;
  filename: string;
  file_type: string;
  file_url: string;
  file_size_bytes: number;
  software_used?: string;
}

interface PortfolioProject {
  id: string;
  project_code: string;
  title: string;
  description: string;
  department: string;
  service_category: string;
  client_name?: string;
  completion_date?: string;
  budget?: number;
  files: ProjectFile[];
  team_members: Array<{name: string; role: string}>;
  tags: string[];
  thumbnail_url?: string;
  metrics?: {[key: string]: string};
}

interface DynamicPortfolioDisplayProps {
  serviceId: string; // 'cad-design', '3d-animation', etc.
  maxProjects?: number;
  showLoadingState?: boolean;
}

// Service Category Mapping - Handles ALL services automatically
const SERVICE_MAPPING = {
  'cad-design': {
    departments: ['Engineering', 'CAD', 'Design'],
    fileTypes: ['dwg', 'pdf', 'step', 'iges', 'sldprt'],
    defaultIcon: '🔧',
    color: 'blue'
  },
  '3d-animation': {
    departments: ['Animation', '3D', 'Graphics', 'VFX'],
    fileTypes: ['mp4', 'avi', 'mov', 'blend', 'ma', 'max'],
    defaultIcon: '🎬',
    color: 'purple'
  },
  'ai-ml': {
    departments: ['AI', 'ML', 'Data Science', 'Analytics'],
    fileTypes: ['py', 'ipynb', 'h5', 'pkl', 'csv'],
    defaultIcon: '🤖',
    color: 'green'
  },
  'blockchain': {
    departments: ['Blockchain', 'Web3', 'Crypto', 'DeFi'],
    fileTypes: ['sol', 'js', 'json', 'md'],
    defaultIcon: '⛓️',
    color: 'yellow'
  },
  'ecommerce-tech': {
    departments: ['E-Commerce', 'Web Dev', 'Frontend', 'Backend'],
    fileTypes: ['html', 'css', 'js', 'php', 'json'],
    defaultIcon: '🛒',
    color: 'red'
  },
  'mobile-dev': {
    departments: ['Mobile', 'iOS', 'Android', 'React Native'],
    fileTypes: ['apk', 'ipa', 'js', 'swift', 'kotlin'],
    defaultIcon: '📱',
    color: 'cyan'
  },
  'web-development': {
    departments: ['Web Dev', 'Frontend', 'Backend', 'Full Stack'],
    fileTypes: ['html', 'css', 'js', 'ts', 'php', 'py'],
    defaultIcon: '🌐',
    color: 'indigo'
  },
  'ui-ux-design': {
    departments: ['Design', 'UI/UX', 'Graphics', 'Creative'],
    fileTypes: ['fig', 'sketch', 'psd', 'ai', 'xd'],
    defaultIcon: '🎨',
    color: 'pink'
  },
  'data-analytics': {
    departments: ['Data Analytics', 'BI', 'Data Science'],
    fileTypes: ['xlsx', 'csv', 'pbix', 'py', 'r'],
    defaultIcon: '📊',
    color: 'teal'
  },
  'cybersecurity': {
    departments: ['Security', 'Cybersecurity', 'InfoSec'],
    fileTypes: ['pdf', 'doc', 'py', 'sh'],
    defaultIcon: '🔒',
    color: 'slate'
  },
  'cloud-infrastructure': {
    departments: ['DevOps', 'Cloud', 'Infrastructure', 'SRE'],
    fileTypes: ['yml', 'yaml', 'tf', 'json', 'sh'],
    defaultIcon: '☁️',
    color: 'sky'
  },
  'iot-embedded': {
    departments: ['IoT', 'Embedded', 'Hardware', 'Electronics'],
    fileTypes: ['c', 'cpp', 'ino', 'hex', 'bin'],
    defaultIcon: '📡',
    color: 'orange'
  },
  'game-development': {
    departments: ['Game Dev', 'Unity', 'Unreal', 'Gaming'],
    fileTypes: ['unity', 'cs', 'cpp', 'lua', 'blend'],
    defaultIcon: '🎮',
    color: 'violet'
  },
  'digital-marketing': {
    departments: ['Marketing', 'Digital Marketing', 'SEO', 'SEM'],
    fileTypes: ['pdf', 'psd', 'mp4', 'jpg', 'png'],
    defaultIcon: '📈',
    color: 'rose'
  },
  'consulting': {
    departments: ['Consulting', 'Strategy', 'Business Analysis'],
    fileTypes: ['pdf', 'ppt', 'doc', 'xlsx'],
    defaultIcon: '💼',
    color: 'gray'
  }
};

export default function DynamicPortfolioDisplay({ 
  serviceId, 
  maxProjects = 6, 
  showLoadingState = true 
}: DynamicPortfolioDisplayProps) {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const serviceConfig = SERVICE_MAPPING[serviceId] || SERVICE_MAPPING['cad-design'];

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      // Query ERP projects - automatically finds projects from relevant departments
      const { data: erpProjects, error: projectError } = await supabase
        .from('erp_projects')
        .select(`
          *,
          erp_clients (name, client_code),
          erp_project_team_members (
            role,
            erp_employees (first_name, last_name, job_title)
          )
        `)
        .in('department', serviceConfig.departments)
        .eq('status', 'completed')
        .eq('project_type', 'client')
        .eq('is_active', true)
        .order('actual_end_date', { ascending: false })
        .limit(maxProjects);

      if (projectError) throw new Error(`ERP Query Error: ${projectError.message}`);

      if (!erpProjects || erpProjects.length === 0) {
        setProjects([]);
        setLoading(false);
        return;
      }

      // Transform ERP data to portfolio format
      const portfolioProjects: PortfolioProject[] = erpProjects.map(project => ({
        id: project.id,
        project_code: project.project_code,
        title: project.title,
        description: project.description || 'Completed project with excellent results',
        department: project.department,
        service_category: serviceId,
        client_name: project.erp_clients?.name || 'Confidential Client',
        completion_date: project.actual_end_date,
        budget: project.budget,
        team_members: project.erp_project_team_members?.map((member: any) => ({
          name: `${member.erp_employees?.first_name} ${member.erp_employees?.last_name}`,
          role: member.role
        })) || [],
        tags: project.tags || [],
        files: generateProjectFiles(project, serviceConfig),
        thumbnail_url: `/images/portfolio/${serviceId}/${project.project_code}-thumb.jpg`,
        metrics: extractMetrics(project)
      }));

      setProjects(portfolioProjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
      console.error('Portfolio fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [serviceId, maxProjects]);

  if (loading && showLoadingState) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
          <RefreshCw className="w-5 h-5 animate-spin text-primary" />
          <div>
            <p className="font-medium text-foreground">Loading {serviceConfig.defaultIcon} Projects</p>
            <p className="text-sm text-muted-foreground">
              Fetching from departments: {serviceConfig.departments.join(', ')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-destructive mb-1">Failed to Load Projects</h4>
            <p className="text-sm text-destructive/80 mb-3">{error}</p>
            <Button size="sm" variant="outline" onClick={fetchProjects}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="p-6 bg-muted/20 border border-dashed border-muted-foreground/20 rounded-lg text-center">
        <div className="text-4xl mb-3">{serviceConfig.defaultIcon}</div>
        <h4 className="font-medium text-foreground mb-2">No Projects Found</h4>
        <p className="text-sm text-muted-foreground mb-4">
          No completed {serviceId.replace('-', ' ')} projects found in the following departments:
          <br />
          <span className="font-medium">{serviceConfig.departments.join(', ')}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Projects will automatically appear here when marked as completed in the ERP system.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h5 className="font-semibold text-foreground flex items-center gap-2">
            <span className="text-xl">{serviceConfig.defaultIcon}</span>
            Recent {serviceId.replace('-', ' ')} Projects
          </h5>
          <p className="text-sm text-muted-foreground">
            {projects.length} completed projects • Live from ERP System
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <CheckCircle className="w-3 h-3 mr-1" />
            Live ERP Data
          </Badge>
          <Button size="sm" variant="ghost" onClick={fetchProjects}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
            {/* Project Thumbnail */}
            <div 
              className="aspect-video bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden"
              style={{
                backgroundImage: `url('${project.thumbnail_url}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute top-3 left-3">
                <Badge variant="secondary" className="text-xs">
                  {project.project_code}
                </Badge>
              </div>
              <div className="absolute top-3 right-3">
                <Badge variant="outline" className="text-xs bg-white/90">
                  {project.department}
                </Badge>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-3 left-3 text-white">
                  <p className="text-sm font-medium">{project.client_name}</p>
                  {project.completion_date && (
                    <p className="text-xs opacity-90">
                      {new Date(project.completion_date).getFullYear()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Project Content */}
            <div className="p-4 space-y-3">
              <div>
                <h6 className="font-semibold text-foreground mb-1 line-clamp-1">
                  {project.title}
                </h6>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>
              </div>

              {/* Team & Stats */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{project.team_members.length} team members</span>
                </div>
                {project.completion_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(project.completion_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Files */}
              {project.files.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {project.files.slice(0, 4).map((file, idx) => (
                    <button
                      key={idx}
                      onClick={() => window.open(file.file_url, '_blank')}
                      className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      {file.file_type.toUpperCase()}
                    </button>
                  ))}
                  {project.files.length > 4 && (
                    <span className="px-2 py-1 text-xs text-muted-foreground">
                      +{project.files.length - 4} more
                    </span>
                  )}
                </div>
              )}

              {/* Tags */}
              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {project.tags.slice(0, 3).map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* View More */}
      <div className="text-center">
        <Button variant="outline">
          View All {serviceId.replace('-', ' ')} Projects
          <ExternalLink className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// Helper Functions
function generateProjectFiles(project: any, serviceConfig: any): ProjectFile[] {
  // Generate expected files based on service type and project code
  const files: ProjectFile[] = [];
  const baseUrl = `/downloads/${project.department.toLowerCase()}/${project.project_code}`;

  serviceConfig.fileTypes.forEach((type: string, index: number) => {
    files.push({
      id: `${project.id}-${type}`,
      filename: `${project.project_code}-${index + 1}.${type}`,
      file_type: type,
      file_url: `${baseUrl}.${type}`,
      file_size_bytes: Math.floor(Math.random() * 10000000), // Mock size
      software_used: getSoftwareForFileType(type)
    });
  });

  return files.slice(0, 3); // Limit to 3 files per project
}

function getSoftwareForFileType(fileType: string): string {
  const softwareMap: {[key: string]: string} = {
    'dwg': 'AutoCAD 2024',
    'step': 'SolidWorks 2024', 
    'pdf': 'Adobe Acrobat',
    'mp4': 'Blender 4.0',
    'py': 'Python 3.11',
    'js': 'Node.js 18',
    'html': 'VS Code',
    'fig': 'Figma'
  };
  return softwareMap[fileType] || 'Professional Software';
}

function extractMetrics(project: any): {[key: string]: string} {
  const metrics: {[key: string]: string} = {};
  
  if (project.budget && project.actual_cost) {
    const savings = project.budget - project.actual_cost;
    if (savings > 0) {
      metrics['Cost Savings'] = `$${savings.toLocaleString()}`;
    }
  }

  if (project.estimated_hours && project.actual_hours) {
    const timeSaved = project.estimated_hours - project.actual_hours;
    if (timeSaved > 0) {
      metrics['Time Saved'] = `${timeSaved}h`;
    }
  }

  return metrics;
}