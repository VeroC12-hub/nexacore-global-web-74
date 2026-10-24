import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  request_type: string;
  priority: string;
  status: string;
  budget_estimate: number;
  requested_completion: string;
  created_at: string;
  client_id: string;
  client_name?: string;
}

interface AdminServiceRequestsTabProps {
  onStatsUpdate: () => void;
}

export function AdminServiceRequestsTab({ onStatsUpdate }: AdminServiceRequestsTabProps) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingRequest, setViewingRequest] = useState<ServiceRequest | null>(null);

  useEffect(() => {
    loadServiceRequests();
  }, []);

  const loadServiceRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // client_id references auth.users — look up display names via profiles separately
      const clientIds = [...new Set((data || []).map((req: any) => req.client_id).filter(Boolean))];
      const profilesMap: Record<string, any> = {};
      if (clientIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', clientIds);
        (profilesData || []).forEach((p: any) => { profilesMap[p.id] = p; });
      }

      const requests = (data || []).map((req: any) => ({
        ...req,
        client_name: profilesMap[req.client_id]?.full_name || profilesMap[req.client_id]?.email || null,
      }));
      setRequests(requests);
    } catch (error) {
      console.error('Error loading service requests:', error);
      toast.error('Failed to load service requests');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;

      setRequests(requests.map(req => 
        req.id === requestId ? { ...req, status } : req
      ));
      onStatsUpdate();
      toast.success(`Request ${status} successfully`);
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request status');
    }
  };

  const deleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this service request?')) return;

    try {
      const { error } = await supabase
        .from('service_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      setRequests(requests.filter(req => req.id !== requestId));
      onStatsUpdate();
      toast.success('Service request deleted successfully');
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Failed to delete service request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'submitted': return 'bg-yellow-500';
      case 'reviewing': return 'bg-orange-500';
      case 'rejected': return 'bg-red-500';
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading service requests...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Requests Management</CardTitle>
        <CardDescription>Review and manage all client service requests</CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No service requests found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{request.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {request.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {request.client_name || (
                        <span className="text-muted-foreground italic">Unknown client</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {request.request_type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(request.priority)}>
                      {request.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {request.budget_estimate ? `$${request.budget_estimate.toLocaleString()}` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {request.requested_completion ? 
                      new Date(request.requested_completion).toLocaleDateString() : 
                      'Not specified'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setViewingRequest(request)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {/* New client requests arrive as 'submitted' (see service_requests check constraint) */}
                      {(request.status === 'submitted' || request.status === 'reviewing') && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateRequestStatus(request.id, 'approved')}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateRequestStatus(request.id, 'rejected')}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {request.status === 'approved' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateRequestStatus(request.id, 'in_progress')}
                        >
                          Start
                        </Button>
                      )}
                      {request.status === 'in_progress' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateRequestStatus(request.id, 'completed')}
                        >
                          Complete
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteRequest(request.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={!!viewingRequest} onOpenChange={(open) => !open && setViewingRequest(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewingRequest?.title}</DialogTitle>
            <DialogDescription>
              {viewingRequest?.client_name || 'Unknown client'} ·{' '}
              {viewingRequest && new Date(viewingRequest.created_at).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          {viewingRequest && (
            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{viewingRequest.request_type.replace('_', ' ')}</Badge>
                <Badge className={getPriorityColor(viewingRequest.priority)}>{viewingRequest.priority}</Badge>
                <Badge className={getStatusColor(viewingRequest.status)}>{viewingRequest.status.replace('_', ' ')}</Badge>
              </div>
              <p className="whitespace-pre-wrap">{viewingRequest.description}</p>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <span>Budget: {viewingRequest.budget_estimate ? `$${viewingRequest.budget_estimate.toLocaleString()}` : 'Not given'}</span>
                <span>
                  Wanted by:{' '}
                  {viewingRequest.requested_completion
                    ? new Date(viewingRequest.requested_completion).toLocaleDateString()
                    : 'Not specified'}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}