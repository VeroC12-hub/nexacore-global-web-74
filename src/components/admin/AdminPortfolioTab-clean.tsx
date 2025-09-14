import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Download,
  User,
  Calendar,
  Tag,
  FileText,
  Camera,
  TrendingUp,
  AlertTriangle,
  Search,
  Filter,
  MoreHorizontal,
  BarChart3,
  Activity
} from 'lucide-react';
import PortfolioAnalyticsDashboard from './PortfolioAnalyticsDashboard';

interface AdminPortfolioTabProps {
  onStatsUpdate?: () => void;
}

interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  short_description: string;
  service_id: string;
  client_name: string;
  show_client_name: boolean;
  is_featured: boolean;
  is_published: boolean;
  submission_status: 'pending_review' | 'approved' | 'rejected' | 'revision_needed';
  submitted_by: string;
  created_at: string;
  challenge?: string;
  solution?: string;
  results?: string;
  project_metrics?: Record<string, any>;
  tags?: string[];
  portfolio_files?: any[];
}

export default function AdminPortfolioTab({ onStatsUpdate }: AdminPortfolioTabProps) {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'management' | 'analytics'>('management');

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    featured: 0
  });

  useEffect(() => {
    loadProjects();
  }, [filter]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('portfolio_projects')
        .select('*, portfolio_files(*)')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        if (filter === 'pending') {
          query = query.eq('submission_status', 'pending_review');
        } else if (filter === 'approved') {
          query = query.in('submission_status', ['approved']);
        } else if (filter === 'rejected') {
          query = query.in('submission_status', ['rejected', 'revision_needed']);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      setProjects(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const pending = data?.filter(p => p.submission_status === 'pending_review').length || 0;
      const approved = data?.filter(p => p.submission_status === 'approved').length || 0;
      const rejected = data?.filter(p => ['rejected', 'revision_needed'].includes(p.submission_status)).length || 0;
      const featured = data?.filter(p => p.is_featured).length || 0;

      setStats({ total, pending, approved, rejected, featured });
      
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load portfolio projects');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (project: PortfolioProject, makePublic: boolean = true) => {
    try {
      const { error } = await supabase
        .from('portfolio_projects')
        .update({
          submission_status: 'approved',
          is_published: makePublic
        })
        .eq('id', project.id);

      if (error) throw error;

      // Also update any files to be public if making public
      if (makePublic && project.portfolio_files) {
        await supabase
          .from('portfolio_files')
          .update({ is_public: makePublic })
          .eq('portfolio_project_id', project.id);
      }

      toast.success(`Portfolio project approved${makePublic ? ' and published' : ''}`);
      loadProjects();
      onStatsUpdate?.();
    } catch (error) {
      console.error('Error approving project:', error);
      toast.error('Failed to approve project');
    }
  };

  const handleReject = async (project: PortfolioProject) => {
    try {
      const { error } = await supabase
        .from('portfolio_projects')
        .update({
          submission_status: 'rejected',
          is_published: false,
          admin_notes: reviewNotes
        })
        .eq('id', project.id);

      if (error) throw error;
      
      toast.success('Portfolio project rejected');
      setShowReviewModal(false);
      setReviewNotes('');
      loadProjects();
      onStatsUpdate?.();
    } catch (error) {
      console.error('Error rejecting project:', error);
      toast.error('Failed to reject project');
    }
  };

  const handleRequestRevision = async (project: PortfolioProject) => {
    try {
      const { error } = await supabase
        .from('portfolio_projects')
        .update({
          submission_status: 'revision_needed',
          is_published: false,
          admin_notes: reviewNotes
        })
        .eq('id', project.id);

      if (error) throw error;
      
      toast.success('Revision requested');
      setShowReviewModal(false);
      setReviewNotes('');
      loadProjects();
      onStatsUpdate?.();
    } catch (error) {
      console.error('Error requesting revision:', error);
      toast.error('Failed to request revision');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_review':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">⏳ Pending Review</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">✅ Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">❌ Rejected</Badge>;
      case 'revision_needed':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800">🔄 Needs Revision</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getServiceLabel = (serviceId: string) => {
    const serviceMap: Record<string, string> = {
      'cad-design': 'CAD Design',
      'ai-ml': 'AI/ML',
      'blockchain': 'Blockchain',
      '3d-animation': '3D Animation',
      'ecommerce-tech': 'E-Commerce',
      'mobile-dev': 'Mobile Dev',
      'web-development': 'Web Dev',
      'ui-ux-design': 'UI/UX',
      'data-analytics': 'Data Analytics',
      'cybersecurity': 'Cybersecurity'
    };
    return serviceMap[serviceId] || serviceId;
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.service_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Portfolio Management</h2>
            <p className="text-gray-600">Review and manage portfolio project submissions</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={activeTab === 'management' ? 'default' : 'outline'}
              onClick={() => setActiveTab('management')}
              className="flex items-center"
            >
              <FileText className="h-4 w-4 mr-2" />
              Management
            </Button>
            <Button
              variant={activeTab === 'analytics' ? 'default' : 'outline'}
              onClick={() => setActiveTab('analytics')}
              className="flex items-center"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'management' ? (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Review</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rejected</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Projects</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex space-x-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All ({stats.total})
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('pending')}
              >
                Pending ({stats.pending})
              </Button>
              <Button
                variant={filter === 'approved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('approved')}
              >
                Approved ({stats.approved})
              </Button>
              <Button
                variant={filter === 'rejected' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('rejected')}
              >
                Rejected ({stats.rejected})
              </Button>
            </div>

            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Projects List */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading projects...</p>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-600">No portfolio projects found.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredProjects.map((project) => (
                    <div key={project.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                            {project.is_featured && (
                              <Badge className="bg-yellow-100 text-yellow-800">⭐ Featured</Badge>
                            )}
                            {getStatusBadge(project.submission_status)}
                          </div>

                          <p className="text-gray-600 mb-3">{project.short_description}</p>

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {project.show_client_name ? project.client_name : 'Confidential'}
                            </div>
                            <div className="flex items-center">
                              <Tag className="h-4 w-4 mr-1" />
                              {getServiceLabel(project.service_id)}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(project.created_at).toLocaleDateString()}
                            </div>
                            {project.portfolio_files && (
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-1" />
                                {project.portfolio_files.length} files
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedProject(project);
                              setShowReviewModal(true);
                            }}
                          >
                            Review
                          </Button>

                          {project.submission_status === 'pending_review' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(project)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <PortfolioAnalyticsDashboard />
      )}

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Portfolio Project</DialogTitle>
          </DialogHeader>

          {selectedProject && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Project Details</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Title:</strong> {selectedProject.title}</div>
                    <div><strong>Service:</strong> {getServiceLabel(selectedProject.service_id)}</div>
                    <div><strong>Client:</strong> {selectedProject.show_client_name ? selectedProject.client_name : 'Confidential'}</div>
                    <div><strong>Status:</strong> {getStatusBadge(selectedProject.submission_status)}</div>
                    <div><strong>Submitted:</strong> {new Date(selectedProject.created_at).toLocaleString()}</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-gray-600">{selectedProject.description}</p>
                </div>
              </div>

              {selectedProject.challenge && (
                <div>
                  <h3 className="font-semibold mb-2">Challenge</h3>
                  <p className="text-sm text-gray-600">{selectedProject.challenge}</p>
                </div>
              )}

              {selectedProject.solution && (
                <div>
                  <h3 className="font-semibold mb-2">Solution</h3>
                  <p className="text-sm text-gray-600">{selectedProject.solution}</p>
                </div>
              )}

              {selectedProject.results && (
                <div>
                  <h3 className="font-semibold mb-2">Results</h3>
                  <p className="text-sm text-gray-600">{selectedProject.results}</p>
                </div>
              )}

              {selectedProject.portfolio_files && selectedProject.portfolio_files.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Files ({selectedProject.portfolio_files.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {selectedProject.portfolio_files.map((file, index) => (
                      <div key={index} className="p-2 border rounded text-sm">
                        <div className="font-medium">{file.file_type}</div>
                        <div className="text-gray-600 truncate">{file.filename}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Admin Notes</h3>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes for the submitter..."
                  rows={3}
                />
              </div>

              <div className="flex justify-between pt-4">
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleApprove(selectedProject)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve & Publish
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleRequestRevision(selectedProject)}
                  >
                    Request Revision
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(selectedProject)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setShowReviewModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}