// =====================================================
// Admin Proposals Tab - Full Implementation
// =====================================================

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Send,
  MoreVertical,
  AlertCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useProposals } from '@/hooks/useProposals';
import { useSendProposal, useDeleteProposal } from '@/hooks/useProposalActions';
import type { Proposal, ProposalStatus } from '@/types/proposal';
import { PROPOSAL_STATUS_LABELS, PROPOSAL_STATUS_COLORS } from '@/types/proposal';
import { ProposalCreationModal } from './proposals/ProposalCreationModal';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const AdminProposalsTab: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | 'all'>('all');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  // Fetch proposals
  const {
    data: proposalsResponse,
    isLoading,
    refetch,
  } = useProposals({
    filters: {
      status: statusFilter !== 'all' ? statusFilter : undefined,
      search: searchQuery || undefined,
    },
    sort_by: 'created_at',
    sort_order: 'desc',
    page: 1,
    page_size: 50,
  });

  const sendProposalMutation = useSendProposal();
  const deleteProposalMutation = useDeleteProposal();

  const proposals = proposalsResponse?.data || [];

  // Calculate stats
  const stats = useMemo(() => {
    const total = proposals.length;
    const drafts = proposals.filter((p) => p.status === 'draft').length;
    const sent = proposals.filter((p) => p.status === 'sent' || p.status === 'viewed').length;
    const accepted = proposals.filter((p) => p.status === 'accepted').length;
    const rejected = proposals.filter((p) => p.status === 'rejected').length;
    const conversionRate = total > 0 ? Math.round((accepted / total) * 100) : 0;

    return { total, drafts, sent, accepted, rejected, conversionRate };
  }, [proposals]);

  const handleSendProposal = async (proposalId: string) => {
    try {
      await sendProposalMutation.mutateAsync(proposalId);
      refetch();
    } catch (error) {
      console.error('Error sending proposal:', error);
    }
  };

  const handleDeleteProposal = async (proposalId: string) => {
    if (confirm('Are you sure you want to delete this proposal? This will mark it as expired.')) {
      try {
        await deleteProposalMutation.mutateAsync({ proposalId, permanent: false });
        refetch();
      } catch (error) {
        console.error('Error deleting proposal:', error);
      }
    }
  };

  const handleViewProposal = (proposal: Proposal) => {
    // TODO: Navigate to proposal detail page in Phase 5
    toast.info('Proposal detail view coming in Phase 5!');
  };

  const handleDownloadPDF = (proposal: Proposal) => {
    // TODO: PDF generation in Phase 3
    toast.info('PDF generation coming in Phase 3!');
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return '-';
    }
  };

  const getStatusBadge = (status: ProposalStatus) => {
    const colors = PROPOSAL_STATUS_COLORS[status];
    return (
      <Badge className={`${colors.bg} ${colors.text} ${colors.border} border`}>
        {PROPOSAL_STATUS_LABELS[status]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Project Proposals</h2>
          <p className="text-muted-foreground mt-2">
            Create, manage, and send professional proposals to clients
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Proposal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-3xl font-bold text-blue-600">{stats.drafts}</p>
              </div>
              <Edit className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Sent</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.sent}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-3xl font-bold text-green-600">{stats.accepted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Win Rate</p>
                <p className="text-3xl font-bold text-purple-600">{stats.conversionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search proposals by title, client, or number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="viewed">Viewed</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="revision_requested">Revision Requested</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first proposal'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Proposal
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proposal #</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proposals.map((proposal) => (
                    <TableRow key={proposal.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{proposal.proposal_number}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{proposal.title}</p>
                          <p className="text-sm text-gray-500">{proposal.service_type}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{proposal.client_name}</p>
                          <p className="text-sm text-gray-500">{proposal.client_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {proposal.currency} {proposal.total_price.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(proposal.status)}</TableCell>
                      <TableCell className="text-gray-600">
                        {formatDate(proposal.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewProposal(proposal)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadPDF(proposal)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </DropdownMenuItem>
                            {proposal.status === 'draft' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleSendProposal(proposal.id)}
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  Send to Client
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteProposal(proposal.id)}
                              className="text-red-600"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phase Progress Info */}
      <Card className="border-2 border-dashed border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Phase 2: PM Interface Complete ✓
          </CardTitle>
          <CardDescription className="text-blue-700">
            You can now create proposals with the 8-step wizard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>✓ Create proposals from scratch or quote requests</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>✓ 8-step guided wizard</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>✓ Save as draft or create immediately</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>✓ View, filter, and search proposals</span>
            </div>
            <div className="flex items-center gap-2 text-yellow-600">
              <Clock className="h-4 w-4" />
              <span>Phase 3: PDF Generation (Next)</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Phases 4-7: Version control, client portal, emails, testing</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Proposal Modal */}
      <ProposalCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(proposalId) => {
          setShowCreateModal(false);
          refetch();
          toast.success('Proposal created successfully!');
        }}
      />
    </div>
  );
};

export default AdminProposalsTab;
