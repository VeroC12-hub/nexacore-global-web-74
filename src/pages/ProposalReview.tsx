// =====================================================
// Public Proposal Review Page
// Token-based authentication for clients to view and respond to proposals
// =====================================================

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle,
  XCircle,
  FileText,
  Download,
  AlertCircle,
  Clock,
  DollarSign,
  Calendar,
  ArrowLeft,
} from 'lucide-react';
import type { Proposal } from '@/types/proposal';
import { PROPOSAL_STATUS_LABELS, PROPOSAL_STATUS_COLORS } from '@/types/proposal';
import { ProposalView } from '@/components/client/ProposalView';
import { ProposalAcceptReject } from '@/components/client/ProposalAcceptReject';
import { generateProposalPDF } from '@/services/proposalPDFService';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const ProposalReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [showAcceptReject, setShowAcceptReject] = useState(false);

  // Mark proposal as viewed on load
  useEffect(() => {
    if (id && token) {
      markProposalViewed(id);
    }
  }, [id, token]);

  const markProposalViewed = async (proposalId: string) => {
    try {
      const { data: proposal } = await supabase
        .from('proposals')
        .select('viewed_at')
        .eq('id', proposalId)
        .single();

      // Only update if not yet viewed
      if (proposal && !proposal.viewed_at) {
        await supabase
          .from('proposals')
          .update({
            status: 'viewed',
            viewed_at: new Date().toISOString(),
          })
          .eq('id', proposalId);

        // Log activity
        await supabase.from('proposal_activities').insert({
          proposal_id: proposalId,
          activity_type: 'viewed',
          description: 'Proposal viewed by client',
        });
      }
    } catch (error) {
      console.error('Error marking proposal as viewed:', error);
    }
  };

  // Fetch proposal
  const {
    data: proposal,
    isLoading,
    error,
    refetch,
  } = useQuery<Proposal>({
    queryKey: ['proposal-public', id],
    queryFn: async () => {
      if (!id) throw new Error('No proposal ID');

      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!token,
  });

  const handleDownloadPDF = async () => {
    if (!proposal) return;
    try {
      toast.info('Generating PDF...');
      await generateProposalPDF(proposal);
      toast.success('PDF downloaded successfully!');

      // Log activity
      await supabase.from('proposal_activities').insert({
        proposal_id: proposal.id,
        activity_type: 'pdf_downloaded',
        description: 'PDF downloaded by client',
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not set';
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = PROPOSAL_STATUS_COLORS[status as keyof typeof PROPOSAL_STATUS_COLORS];
    const label = PROPOSAL_STATUS_LABELS[status as keyof typeof PROPOSAL_STATUS_LABELS];
    return (
      <Badge className={`${colors?.bg} ${colors?.text} ${colors?.border} border`}>
        {label}
      </Badge>
    );
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">Invalid Link</h3>
                <p className="text-sm mt-1">This proposal link is invalid or has expired.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <div className="max-w-5xl mx-auto space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">Proposal Not Found</h3>
                <p className="text-sm mt-1">Unable to load this proposal.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = proposal.valid_until && new Date(proposal.valid_until) < new Date();
  const canRespond =
    proposal.status !== 'accepted' &&
    proposal.status !== 'rejected' &&
    proposal.status !== 'expired' &&
    !isExpired;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Project Proposal</h1>
              </div>
              <p className="text-gray-600">From NexaCore Innovations</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Proposal Number</p>
              <p className="text-lg font-semibold text-gray-900">{proposal.proposal_number}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto p-4 space-y-6 py-8">
        {/* Overview Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{proposal.title}</CardTitle>
                <p className="text-gray-600 mt-1">{proposal.service_type}</p>
              </div>
              {getStatusBadge(proposal.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Investment</p>
                  <p className="text-lg font-semibold">
                    {proposal.currency} {proposal.total_price.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Timeline</p>
                  <p className="text-lg font-semibold">{proposal.timeline || 'TBD'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Valid Until</p>
                  <p className="text-lg font-semibold">{formatDate(proposal.valid_until)}</p>
                </div>
              </div>
            </div>

            {/* Expiration Warning */}
            {isExpired && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  This proposal has expired. Please contact us to request an updated proposal.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button onClick={handleDownloadPDF} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              {canRespond && (
                <Button
                  onClick={() => setShowAcceptReject(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Respond to Proposal
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Proposal Content */}
        <ProposalView proposal={proposal} />

        {/* Accept/Reject Modal */}
        {showAcceptReject && (
          <ProposalAcceptReject
            proposal={proposal}
            isOpen={showAcceptReject}
            onClose={() => setShowAcceptReject(false)}
            onSuccess={() => {
              setShowAcceptReject(false);
              refetch();
            }}
          />
        )}
      </div>
    </div>
  );
};
