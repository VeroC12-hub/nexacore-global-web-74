import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Eye, 
  MessageSquare, 
  CheckCircle, 
  Database, 
  RefreshCw, 
  AlertTriangle,
  Trash2,
  Filter,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface QuoteRequest {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  country?: string;
  service_type: string;
  tier?: string;
  description: string;
  budget_estimate?: number;
  timeline?: string;
  status: string;
  created_at: string;
}

interface Quote {
  id: string;
  quote_request_id: string;
  client_email: string;
  service_type: string;
  scope: string;
  price: number;
  currency: string;
  timeline: string;
  deliverables: any;
  terms?: string;
  status: string;
  created_at: string;
  expires_at?: string;
}

const AdminQuoteRequestsTab = () => {
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [cleaningUp, setCleaningUp] = useState(false);
  const [deletingSelected, setDeletingSelected] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [selectedQuoteIds, setSelectedQuoteIds] = useState<Set<string>>(new Set());
  const [showProblematicOnly, setShowProblematicOnly] = useState(false);
  
  // Create quote form state
  const [quoteForm, setQuoteForm] = useState({
    scope: '',
    price: '',
    currency: 'USD',
    timeline: '',
    deliverables: '',
    terms: ''
  });

  useEffect(() => {
    fetchQuoteRequests();
    fetchQuotes();
  }, []);

  const fetchQuoteRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('quote_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuoteRequests(data || []);
    } catch (error) {
      console.error('Error fetching quote requests:', error);
      toast.error('Failed to fetch quote requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    }
  };

  // Helper function to detect invalid dates
  const isDateInvalid = (dateString: string | null | undefined) => {
    if (!dateString) return true;
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) || date.getFullYear() < 2000;
    } catch {
      return true;
    }
  };

  // Helper function to check if quote is problematic
  const isQuoteProblematic = (quote: Quote) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    // No expiration date
    if (!quote.expires_at) return true;
    
    // Invalid date (including 1970)
    if (isDateInvalid(quote.expires_at)) return true;
    
    // Expired
    try {
      const expireDate = new Date(quote.expires_at);
      if (expireDate < now) return true;
    } catch {
      return true;
    }
    
    // Old draft
    if (quote.status === 'draft') {
      const createdDate = new Date(quote.created_at);
      if (createdDate < thirtyDaysAgo) return true;
    }
    
    // Orphaned (no request)
    if (!quote.quote_request_id) return true;
    
    return false;
  };

  // Get problematic quotes
  const getProblematicQuotes = () => {
    return quotes.filter(isQuoteProblematic);
  };

  // Handle checkbox selection
  const handleQuoteSelection = (quoteId: string, checked: boolean) => {
    const newSelected = new Set(selectedQuoteIds);
    if (checked) {
      newSelected.add(quoteId);
    } else {
      newSelected.delete(quoteId);
    }
    setSelectedQuoteIds(newSelected);
  };

  // Select all problematic quotes
  const selectAllProblematic = () => {
    const problematicIds = getProblematicQuotes().map(q => q.id);
    setSelectedQuoteIds(new Set(problematicIds));
    toast.success(`Selected ${problematicIds.length} problematic quotes`);
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedQuoteIds(new Set());
    toast.success('Selection cleared');
  };

  // Delete selected quotes
  const deleteSelectedQuotes = async () => {
    if (selectedQuoteIds.size === 0) {
      toast.error('Please select quotes to delete');
      return;
    }

    const selectedArray = Array.from(selectedQuoteIds);
    const selectedQuotes = quotes.filter(q => selectedArray.includes(q.id));
    
    // Show detailed confirmation
    let problematicBreakdown = {
      expired: 0,
      invalid_dates: 0,
      null_dates: 0,
      old_drafts: 0,
      orphaned: 0,
      other: 0
    };

    selectedQuotes.forEach(quote => {
      if (!quote.expires_at) {
        problematicBreakdown.null_dates++;
      } else if (isDateInvalid(quote.expires_at)) {
        problematicBreakdown.invalid_dates++;
      } else {
        try {
          const expireDate = new Date(quote.expires_at);
          if (expireDate < new Date()) {
            problematicBreakdown.expired++;
          }
        } catch {
          problematicBreakdown.invalid_dates++;
        }
      }
      
      if (quote.status === 'draft') {
        const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
        const createdDate = new Date(quote.created_at);
        if (createdDate < thirtyDaysAgo) {
          problematicBreakdown.old_drafts++;
        }
      }
      
      if (!quote.quote_request_id) {
        problematicBreakdown.orphaned++;
      }
      
      if (!isQuoteProblematic(quote)) {
        problematicBreakdown.other++;
      }
    });

    const confirmMessage = `DELETE SELECTED QUOTES

You are about to delete ${selectedQuoteIds.size} quotes:

BREAKDOWN:
• ${problematicBreakdown.expired} expired quotes
• ${problematicBreakdown.invalid_dates} with invalid dates
• ${problematicBreakdown.null_dates} with no expiration date
• ${problematicBreakdown.old_drafts} old draft quotes
• ${problematicBreakdown.orphaned} orphaned quotes
• ${problematicBreakdown.other} other quotes

THIS ACTION CANNOT BE UNDONE

Continue with deletion?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setDeletingSelected(true);
    try {
      const { error, count } = await supabase
        .from('quotes')
        .delete()
        .in('id', selectedArray);

      if (error) throw error;

      toast.success(
        `Successfully deleted ${count || selectedArray.length} selected quotes!

BREAKDOWN:
• ${problematicBreakdown.expired} expired
• ${problematicBreakdown.invalid_dates} invalid dates  
• ${problematicBreakdown.null_dates} no dates
• ${problematicBreakdown.old_drafts} old drafts
• ${problematicBreakdown.orphaned} orphaned
• ${problematicBreakdown.other} other`,
        { duration: 8000 }
      );
      
      // Clear selections and refresh data
      setSelectedQuoteIds(new Set());
      await fetchQuoteRequests();
      await fetchQuotes();
      
    } catch (error) {
      console.error('Error deleting selected quotes:', error);
      toast.error(`Failed to delete selected quotes: ${error.message}`);
    } finally {
      setDeletingSelected(false);
    }
  };

  // Bulk database cleanup (existing functionality)
  const performDatabaseCleanup = async () => {
    const problematicQuotes = getProblematicQuotes();
    
    if (problematicQuotes.length === 0) {
      toast.success('Database is clean! No problematic quotes found.');
      return;
    }

    const confirmMessage = `BULK DATABASE CLEANUP

This will delete ALL ${problematicQuotes.length} problematic quotes automatically.

For more control, use "Select & Delete" to choose specific quotes.

Continue with bulk cleanup?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setCleaningUp(true);
    try {
      const problematicIds = problematicQuotes.map(q => q.id);
      
      const { error, count } = await supabase
        .from('quotes')
        .delete()
        .in('id', problematicIds);

      if (error) throw error;

      // Update remaining quotes with valid dates
      const { error: updateError } = await supabase
        .from('quotes')
        .update({
          expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        })
        .or('expires_at.is.null,expires_at.lt.2000-01-01');

      if (updateError) {
        console.warn('Some invalid dates could not be updated:', updateError);
      }

      toast.success(
        `Bulk cleanup completed! Deleted ${count || problematicIds.length} problematic quotes.

Database is now optimized!`,
        { duration: 8000 }
      );
      
      await fetchQuoteRequests();
      await fetchQuotes();
      
    } catch (error) {
      console.error('Database cleanup failed:', error);
      toast.error(`Bulk cleanup failed: ${error.message}`);
    } finally {
      setCleaningUp(false);
    }
  };

  // Get quote for a specific request
  const getQuoteForRequest = (requestId: string) => {
    return quotes.find(quote => quote.quote_request_id === requestId);
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('quote_requests')
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;
      
      await fetchQuoteRequests();
      toast.success(`Request marked as ${status}`);
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Failed to update request status');
    }
  };

  const createQuote = async (request: QuoteRequest) => {
    try {
      const deliverables = quoteForm.deliverables.split('\n').filter(d => d.trim());
      
      const { data: userData } = await supabase.auth.getUser();
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 14);
      
      const { data: quote, error } = await supabase
        .from('quotes')
        .insert({
          quote_request_id: request.id,
          client_email: request.email,
          service_type: request.service_type,
          scope: quoteForm.scope,
          price: parseFloat(quoteForm.price),
          currency: quoteForm.currency,
          timeline: quoteForm.timeline,
          deliverables: deliverables,
          terms: quoteForm.terms,
          created_by: userData.user?.id,
          status: 'sent',
          sent_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

      if (!error) {
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'quote_sent',
            to: request.email,
            data: { ...quote, quote_id: quote.id }
          }
        });
      }

      if (error) throw error;

      await updateRequestStatus(request.id, 'quoted');
      
      setQuoteForm({
        scope: '',
        price: '',
        currency: 'USD',
        timeline: '',
        deliverables: '',
        terms: ''
      });
      
      await fetchQuotes();
      toast.success('Quote created successfully');
    } catch (error) {
      console.error('Error creating quote:', error);
      toast.error('Failed to create quote');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'quoted': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-6">Loading quote requests...</div>;
  }

  const problematicQuotes = getProblematicQuotes();
  const hasSelections = selectedQuoteIds.size > 0;

  return (
    <div className="space-y-6">
      {/* Enhanced header with multiple actions */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Quote Requests</h2>
            <div className="text-sm text-muted-foreground">
              {quoteRequests.length} total requests • {quotes.length} quotes created
              {problematicQuotes.length > 0 && (
                <span className="text-red-600 font-medium">
                  • {problematicQuotes.length} problematic quotes
                </span>
              )}
              {hasSelections && (
                <span className="text-blue-600 font-medium">
                  • {selectedQuoteIds.size} selected
                </span>
              )}
            </div>
          </div>
          
          {/* Main action buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => setShowProblematicOnly(!showProblematicOnly)}
              variant="outline"
              className={`flex items-center gap-2 ${showProblematicOnly ? 'bg-red-50 border-red-200' : ''}`}
            >
              <Filter className="w-4 h-4" />
              {showProblematicOnly ? 'Show All' : 'Show Problematic'}
            </Button>
            
            <Button
              variant="destructive"
              onClick={performDatabaseCleanup}
              disabled={cleaningUp || deletingSelected}
              className="flex items-center gap-2"
            >
              {cleaningUp ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Bulk Cleanup...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  Bulk Cleanup ({problematicQuotes.length})
                </>
              )}
            </Button>
            
            <Button
              onClick={() => { fetchQuoteRequests(); fetchQuotes(); }}
              variant="outline"
              disabled={cleaningUp || deletingSelected}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Selection controls */}
        {problematicQuotes.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 p-4 bg-gray-50 rounded-lg border">
            <span className="text-sm font-medium">Selective Deletion:</span>
            
            <Button
              onClick={selectAllProblematic}
              variant="outline"
              size="sm"
              disabled={cleaningUp || deletingSelected}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Select All Problematic ({problematicQuotes.length})
            </Button>
            
            {hasSelections && (
              <>
                <Button
                  onClick={clearSelection}
                  variant="outline"
                  size="sm"
                  disabled={cleaningUp || deletingSelected}
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Selection
                </Button>
                
                <Button
                  onClick={deleteSelectedQuotes}
                  variant="destructive"
                  size="sm"
                  disabled={cleaningUp || deletingSelected}
                  className="ml-2"
                >
                  {deletingSelected ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Selected ({selectedQuoteIds.size})
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Quote Requests Grid */}
      <div className="grid gap-4">
        {quoteRequests.map((request) => {
          const relatedQuote = getQuoteForRequest(request.id);
          
          // Filter logic
          if (showProblematicOnly && (!relatedQuote || !isQuoteProblematic(relatedQuote))) {
            return null;
          }
          
          return (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {/* Selection checkbox for quotes */}
                    {relatedQuote && (
                      <Checkbox
                        checked={selectedQuoteIds.has(relatedQuote.id)}
                        onCheckedChange={(checked) => handleQuoteSelection(relatedQuote.id, !!checked)}
                        disabled={cleaningUp || deletingSelected}
                      />
                    )}
                    <CardTitle className="text-lg">{request.full_name}</CardTitle>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                    
                    {relatedQuote && (
                      <>
                        <Badge className="bg-blue-100 text-blue-800">
                          Quote: {relatedQuote.status}
                        </Badge>
                        {isQuoteProblematic(relatedQuote) && (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Problematic
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {request.email} • {new Date(request.created_at).toLocaleDateString()}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Service:</span> {request.service_type}
                    {request.tier && <span className="text-muted-foreground"> ({request.tier})</span>}
                  </div>
                  <div>
                    <span className="font-medium">Budget:</span> {request.budget_estimate ? `$${request.budget_estimate.toLocaleString()}` : 'Not specified'}
                  </div>
                  <div>
                    <span className="font-medium">Company:</span> {request.company || 'Not specified'}
                  </div>
                  <div>
                    <span className="font-medium">Country:</span> {request.country || 'Not specified'}
                  </div>
                </div>
                
                {/* Quote information with problem indicators */}
                {relatedQuote && (
                  <div className={`p-3 rounded-lg border ${isQuoteProblematic(relatedQuote) ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div><span className="font-medium">Quote Price:</span> {relatedQuote.currency}{relatedQuote.price.toLocaleString()}</div>
                      <div><span className="font-medium">Timeline:</span> {relatedQuote.timeline}</div>
                      <div><span className="font-medium">Created:</span> {new Date(relatedQuote.created_at).toLocaleDateString()}</div>
                      <div>
                        <span className="font-medium">Expires:</span> 
                        <span className={isDateInvalid(relatedQuote.expires_at) ? 'text-red-600 font-semibold' : ''}>
                          {relatedQuote.expires_at ? 
                            (isDateInvalid(relatedQuote.expires_at) ? 
                              ' Invalid Date!' : 
                              ` ${new Date(relatedQuote.expires_at).toLocaleDateString()}`
                            ) : 
                            ' No date set'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <span className="font-medium text-sm">Description:</span>
                  <p className="text-sm text-muted-foreground mt-1">{request.description}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Quote Request Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Full Name</Label>
                            <div className="text-sm">{request.full_name}</div>
                          </div>
                          <div>
                            <Label>Email</Label>
                            <div className="text-sm">{request.email}</div>
                          </div>
                          <div>
                            <Label>Phone</Label>
                            <div className="text-sm">{request.phone || 'Not provided'}</div>
                          </div>
                          <div>
                            <Label>Company</Label>
                            <div className="text-sm">{request.company || 'Not provided'}</div>
                          </div>
                          <div>
                            <Label>Service Type</Label>
                            <div className="text-sm">{request.service_type}</div>
                          </div>
                          <div>
                            <Label>Tier</Label>
                            <div className="text-sm">{request.tier || 'Not specified'}</div>
                          </div>
                        </div>

                        <div>
                          <Label>Project Description</Label>
                          <div className="text-sm bg-muted p-3 rounded-md mt-1">
                            {request.description}
                          </div>
                        </div>

                        {request.status === 'pending' && (
                          <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4">Create Quote</h3>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="scope">Project Scope</Label>
                                <Textarea
                                  id="scope"
                                  placeholder="Detailed project scope and requirements..."
                                  value={quoteForm.scope}
                                  onChange={(e) => setQuoteForm({...quoteForm, scope: e.target.value})}
                                  className="min-h-[100px]"
                                />
                              </div>

                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="price">Price</Label>
                                  <Input
                                    id="price"
                                    type="number"
                                    placeholder="Enter price"
                                    value={quoteForm.price}
                                    onChange={(e) => setQuoteForm({...quoteForm, price: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="currency">Currency</Label>
                                  <Select value={quoteForm.currency} onValueChange={(value) => setQuoteForm({...quoteForm, currency: value})}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="USD">USD</SelectItem>
                                      <SelectItem value="EUR">EUR</SelectItem>
                                      <SelectItem value="GBP">GBP</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div>
                                <Label htmlFor="timeline">Timeline</Label>
                                <Input
                                  id="timeline"
                                  placeholder="e.g., 6-8 weeks"
                                  value={quoteForm.timeline}
                                  onChange={(e) => setQuoteForm({...quoteForm, timeline: e.target.value})}
                                />
                              </div>

                              <div>
                                <Label htmlFor="deliverables">Deliverables (one per line)</Label>
                                <Textarea
                                  id="deliverables"
                                  placeholder="List deliverables, one per line..."
                                  value={quoteForm.deliverables}
                                  onChange={(e) => setQuoteForm({...quoteForm, deliverables: e.target.value})}
                                />
                              </div>

                              <div>
                                <Label htmlFor="terms">Terms & Conditions</Label>
                                <Textarea
                                  id="terms"
                                  placeholder="Payment terms, conditions, etc..."
                                  value={quoteForm.terms}
                                  onChange={(e) => setQuoteForm({...quoteForm, terms: e.target.value})}
                                />
                              </div>

                              <Button onClick={() => createQuote(request)} className="w-full">
                                Create Quote
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {request.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateRequestStatus(request.id, 'reviewed')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Reviewed
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {quoteRequests.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No quote requests found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminQuoteRequestsTab;
