import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  X,
  Edit,
  Plus,
  Save,
  FileText,
  DollarSign,
  User,
  Mail,
  Building2,
  Phone,
  MapPin,
  Calendar,
  Download,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { parseContent, ParsedBlock } from '@/utils/pdfContentRenderer';
import { generateQuotePDF, getQuotePDFDataUrl } from '@/utils/quotePDFGenerator';

// ── Inline markdown → safe HTML (bold / italic only) ──────────────────────────
function inlineHtml(text: string): string {
  // Escape HTML entities first
  let s = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  // **bold** / __bold__
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/__(.+?)__/g, '<strong>$1</strong>');
  // *italic* / _italic_
  s = s.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  s = s.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>');
  return s;
}

// ── React renderer for parsed content blocks ──────────────────────────────────
function RichContent({ raw }: { raw: string }) {
  if (!raw?.trim()) return null;
  const blocks = parseContent(raw);
  return (
    <div className="space-y-2 text-sm text-gray-700">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading': {
            const Tag = block.level === 1 ? 'h3' : block.level === 2 ? 'h4' : 'h5';
            const cls =
              block.level === 1
                ? 'font-bold text-[#1E3A5F] text-base mt-3 mb-1 border-b border-[#0098A6] pb-0.5'
                : block.level === 2
                ? 'font-semibold text-[#0098A6] text-sm mt-2 mb-0.5'
                : 'font-semibold text-gray-600 text-sm mt-1';
            return <Tag key={i} className={cls}>{block.content}</Tag>;
          }
          case 'paragraph':
            return (
              <p
                key={i}
                className="leading-relaxed"
                dangerouslySetInnerHTML={{ __html: inlineHtml(block.content) }}
              />
            );
          case 'table':
            if (!block.rows || block.rows.length === 0) return null;
            return (
              <div key={i} className="overflow-x-auto my-2">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      {block.rows[0].map((cell, ci) => (
                        <th
                          key={ci}
                          className="bg-[#0098A6] text-white font-semibold px-3 py-2 text-left border border-[#0098A6]"
                        >
                          {cell}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.slice(1).map((row, ri) => (
                      <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            className="px-3 py-2 border border-gray-200"
                            dangerouslySetInnerHTML={{ __html: inlineHtml(cell) }}
                          />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case 'list': {
            const Tag = block.listType === 'ordered' ? 'ol' : 'ul';
            return (
              <Tag
                key={i}
                className={`pl-5 space-y-1 ${block.listType === 'ordered' ? 'list-decimal' : 'list-disc'} marker:text-[#0098A6] marker:font-bold`}
              >
                {block.items?.map((item, ii) => (
                  <li
                    key={ii}
                    dangerouslySetInnerHTML={{ __html: inlineHtml(item) }}
                  />
                ))}
              </Tag>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}

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
  const navigate = useNavigate();
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [cleaningUp, setCleaningUp] = useState(false);
  const [deletingSelected, setDeletingSelected] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [previewingQuote, setPreviewingQuote] = useState<Quote | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [selectedQuoteIds, setSelectedQuoteIds] = useState<Set<string>>(new Set());
  const [showProblematicOnly, setShowProblematicOnly] = useState(false);
  
  // Create quote form state
  const [quoteForm, setQuoteForm] = useState({
    scope: '',
    price: '',
    currency: 'USD',
    timeline: '',
    deliverables: '',
    terms: '',
    expires_in_days: 14
  });

  // Edit quote form state
  const [editForm, setEditForm] = useState({
    scope: '',
    price: '',
    currency: 'USD',
    timeline: '',
    deliverables: '',
    terms: '',
    expires_in_days: 14,
    status: 'draft'
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
    
    if (!quote.expires_at) return true;
    if (isDateInvalid(quote.expires_at)) return true;
    
    try {
      const expireDate = new Date(quote.expires_at);
      if (expireDate < now) return true;
    } catch {
      return true;
    }
    
    if (quote.status === 'draft') {
      const createdDate = new Date(quote.created_at);
      if (createdDate < thirtyDaysAgo) return true;
    }
    
    if (!quote.quote_request_id) return true;
    
    return false;
  };

  // Get problematic quotes
  const getProblematicQuotes = () => {
    return quotes.filter(isQuoteProblematic);
  };

  // Handle checkbox selection for ANY quote
  const handleQuoteSelection = (quoteId: string, checked: boolean) => {
    const newSelected = new Set(selectedQuoteIds);
    if (checked) {
      newSelected.add(quoteId);
    } else {
      newSelected.delete(quoteId);
    }
    setSelectedQuoteIds(newSelected);
  };

  // Select all quotes (not just problematic)
  const selectAllQuotes = () => {
    const allQuoteIds = quotes.map(q => q.id);
    setSelectedQuoteIds(new Set(allQuoteIds));
    toast.success(`Selected all ${allQuoteIds.length} quotes`);
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

  // Open quote editor
  const openQuoteEditor = (quote: Quote) => {
    setEditingQuote(quote);
    
    // Calculate days until expiration
    let daysUntilExpiry = 14;
    if (quote.expires_at && !isDateInvalid(quote.expires_at)) {
      try {
        const expireDate = new Date(quote.expires_at);
        const now = new Date();
        daysUntilExpiry = Math.max(1, Math.ceil((expireDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
      } catch {
        daysUntilExpiry = 14;
      }
    }

    setEditForm({
      scope: quote.scope || '',
      price: quote.price.toString(),
      currency: quote.currency || 'USD',
      timeline: quote.timeline || '',
      deliverables: Array.isArray(quote.deliverables) 
        ? quote.deliverables.join('\n') 
        : quote.deliverables || '',
      terms: quote.terms || '',
      expires_in_days: daysUntilExpiry,
      status: quote.status || 'draft'
    });
  };

  // Update quote
  const updateQuote = async () => {
    if (!editingQuote) return;

    try {
      const deliverables = editForm.deliverables.split('\n').filter(d => d.trim());
      
      // Calculate new expiration date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + editForm.expires_in_days);

      const updateData = {
        scope: editForm.scope,
        price: parseFloat(editForm.price),
        currency: editForm.currency,
        timeline: editForm.timeline,
        deliverables: deliverables,
        terms: editForm.terms,
        expires_at: expiresAt.toISOString(),
        status: editForm.status,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('quotes')
        .update(updateData)
        .eq('id', editingQuote.id);

      if (error) throw error;

      toast.success('Quote updated successfully');
      setEditingQuote(null);
      await fetchQuotes();
    } catch (error) {
      console.error('Error updating quote:', error);
      toast.error('Failed to update quote');
    }
  };

  // Delete selected quotes (ANY quotes, not just problematic)
  const deleteSelectedQuotes = async () => {
    if (selectedQuoteIds.size === 0) {
      toast.error('Please select quotes to delete');
      return;
    }

    const selectedArray = Array.from(selectedQuoteIds);
    const selectedQuotes = quotes.filter(q => selectedArray.includes(q.id));
    
    // Show detailed confirmation
    let breakdown = {
      expired: 0,
      invalid_dates: 0,
      null_dates: 0,
      old_drafts: 0,
      orphaned: 0,
      active: 0,
      approved: 0,
      sent: 0
    };

    selectedQuotes.forEach(quote => {
      // Count by status
      if (quote.status === 'approved') breakdown.approved++;
      else if (quote.status === 'sent') breakdown.sent++;
      else if (quote.status === 'draft') breakdown.old_drafts++;

      // Count by problems
      if (!quote.expires_at) {
        breakdown.null_dates++;
      } else if (isDateInvalid(quote.expires_at)) {
        breakdown.invalid_dates++;
      } else {
        try {
          const expireDate = new Date(quote.expires_at);
          if (expireDate < new Date()) {
            breakdown.expired++;
          } else {
            breakdown.active++;
          }
        } catch {
          breakdown.invalid_dates++;
        }
      }
      
      if (!quote.quote_request_id) {
        breakdown.orphaned++;
      }
    });

    const confirmMessage = `DELETE SELECTED QUOTES

You are about to delete ${selectedQuoteIds.size} quotes:

BY STATUS:
• ${breakdown.approved} approved quotes
• ${breakdown.sent} sent quotes  
• ${breakdown.old_drafts} draft quotes

BY CONDITION:
• ${breakdown.active} active/valid quotes
• ${breakdown.expired} expired quotes
• ${breakdown.invalid_dates} with invalid dates
• ${breakdown.null_dates} with no expiration date
• ${breakdown.orphaned} orphaned quotes

⚠️ THIS WILL AFFECT CLIENT ACCESS ⚠️
Clients will lose access to these quotes in their portal.

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

BY STATUS: ${breakdown.approved} approved, ${breakdown.sent} sent, ${breakdown.old_drafts} drafts
BY CONDITION: ${breakdown.active} active, ${breakdown.expired} expired, ${breakdown.invalid_dates} invalid dates`,
        { duration: 8000 }
      );
      
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
      expiresAt.setDate(expiresAt.getDate() + quoteForm.expires_in_days);
      
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
        terms: '',
        expires_in_days: 14
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
            <h2 className="text-2xl font-bold">Quote Requests & Management</h2>
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
        
        {/* Enhanced selection controls */}
        {quotes.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 p-4 bg-gray-50 rounded-lg border">
            <span className="text-sm font-medium">Quote Selection:</span>
            
            <Button
              onClick={selectAllQuotes}
              variant="outline"
              size="sm"
              disabled={cleaningUp || deletingSelected}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Select All Quotes ({quotes.length})
            </Button>
            
            <Button
              onClick={selectAllProblematic}
              variant="outline"
              size="sm"
              disabled={cleaningUp || deletingSelected}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Select Problematic ({problematicQuotes.length})
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

      {/* Edit Quote Dialog */}
      <Dialog open={editingQuote !== null} onOpenChange={(open) => !open && setEditingQuote(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Quote</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_price">Price</Label>
                <Input
                  id="edit_price"
                  type="number"
                  placeholder="Enter price"
                  value={editForm.price}
                  onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_currency">Currency</Label>
                <Select value={editForm.currency} onValueChange={(value) => setEditForm({...editForm, currency: value})}>
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

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_timeline">Timeline</Label>
                <Input
                  id="edit_timeline"
                  placeholder="e.g., 6-8 weeks"
                  value={editForm.timeline}
                  onChange={(e) => setEditForm({...editForm, timeline: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_expires">Expires In (Days)</Label>
                <Input
                  id="edit_expires"
                  type="number"
                  min="1"
                  max="90"
                  value={editForm.expires_in_days}
                  onChange={(e) => setEditForm({...editForm, expires_in_days: parseInt(e.target.value) || 14})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_status">Status</Label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm({...editForm, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="revision_requested">Revision Requested</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit_scope">Project Scope</Label>
              <Textarea
                id="edit_scope"
                placeholder="Detailed project scope and requirements..."
                value={editForm.scope}
                onChange={(e) => setEditForm({...editForm, scope: e.target.value})}
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="edit_deliverables">Deliverables (one per line)</Label>
              <Textarea
                id="edit_deliverables"
                placeholder="List deliverables, one per line..."
                value={editForm.deliverables}
                onChange={(e) => setEditForm({...editForm, deliverables: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="edit_terms">Terms & Conditions</Label>
              <Textarea
                id="edit_terms"
                placeholder="Payment terms, conditions, etc..."
                value={editForm.terms}
                onChange={(e) => setEditForm({...editForm, terms: e.target.value})}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={updateQuote} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setEditingQuote(null)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
                    {/* Selection checkbox for ALL quotes (not just problematic) */}
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

                              <div className="grid md:grid-cols-2 gap-4">
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
                                  <Label htmlFor="expires_days">Expires In (Days)</Label>
                                  <Input
                                    id="expires_days"
                                    type="number"
                                    min="1"
                                    max="90"
                                    value={quoteForm.expires_in_days}
                                    onChange={(e) => setQuoteForm({...quoteForm, expires_in_days: parseInt(e.target.value) || 14})}
                                  />
                                </div>
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
                                <Plus className="w-4 h-4 mr-2" />
                                Create Quote
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Edit Quote Button */}
                  {relatedQuote && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openQuoteEditor(relatedQuote)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Quote
                    </Button>
                  )}

                  {/* Preview Quote Button — opens in-page dialog */}
                  {relatedQuote && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewingQuote(relatedQuote)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Quote
                    </Button>
                  )}

                  {/* Create Proposal Button - for any quote request with a quote */}
                  {relatedQuote && (
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-teal-600 hover:bg-teal-700"
                      onClick={() => {
                        // Store quote request data in sessionStorage for proposal pre-fill
                        sessionStorage.setItem('proposalPrefillData', JSON.stringify({
                          quote_request_id: request.id,
                          quote_id: relatedQuote.id,
                          client_name: request.full_name,
                          client_email: request.email,
                          client_company: request.company,
                          client_phone: request.phone,
                          service_type: request.service_type,
                          description: request.description,
                          total_price: relatedQuote.price,
                          currency: relatedQuote.currency,
                          timeline: relatedQuote.timeline,
                        }));
                        // Navigate to proposals tab
                        navigate('/admin?tab=proposals&action=create');
                        toast.info('Opening proposal creation with pre-filled data...');
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Create Proposal
                    </Button>
                  )}

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

      {/* ── Quote Preview Dialog ── */}
      {(() => {
        const pq = previewingQuote;
        if (!pq) return null;
        const pr = quoteRequests.find(r => r.id === pq.quote_request_id) ?? null;
        const deliverables: string[] = Array.isArray(pq.deliverables)
          ? pq.deliverables
          : typeof pq.deliverables === 'string' && pq.deliverables
            ? (pq.deliverables as string).split('\n').filter(Boolean)
            : [];
        const statusColors: Record<string, string> = {
          sent: 'bg-blue-100 text-blue-800 border-blue-200',
          approved: 'bg-green-100 text-green-800 border-green-200',
          declined: 'bg-red-100 text-red-800 border-red-200',
          revision_requested: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          draft: 'bg-gray-100 text-gray-800 border-gray-200',
        };
        const statusColor = statusColors[pq.status] ?? 'bg-gray-100 text-gray-800 border-gray-200';

        return (
          <Dialog open={true} onOpenChange={(open) => { if (!open) { setPreviewingQuote(null); setPdfPreviewUrl(null); } }}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
              {/* Header bar */}
              <div className="bg-gradient-to-r from-[#1E3A5F] to-[#0098A6] text-white px-6 py-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-teal-200 mb-0.5">Admin Preview</p>
                    <h2 className="text-2xl font-bold tracking-tight">QUOTATION</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`${statusColor} border text-sm font-semibold px-3 py-1`}>
                      {pq.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    {/* PDF preview / download buttons */}
                    {!pdfPreviewUrl ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                        disabled={generatingPdf}
                        onClick={async () => {
                          setGeneratingPdf(true);
                          try {
                            const url = await getQuotePDFDataUrl(
                              { id: pq.id, price: pq.price, currency: pq.currency, scope: pq.scope, timeline: pq.timeline, deliverables: Array.isArray(pq.deliverables) ? pq.deliverables : [], terms: pq.terms || '', status: pq.status, created_at: pq.created_at, expires_at: pq.expires_at || null, service_type: pq.service_type },
                              pr ? { full_name: pr.full_name, email: pr.email, phone: pr.phone, company: pr.company, country: pr.country, service_type: pr.service_type, description: pr.description, tier: pr.tier } : null
                            );
                            setPdfPreviewUrl(url);
                          } catch { toast.error('Failed to generate PDF preview'); }
                          finally { setGeneratingPdf(false); }
                        }}
                      >
                        {generatingPdf ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                        {generatingPdf ? 'Generating…' : 'PDF Preview'}
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                          onClick={() => setPdfPreviewUrl(null)}>
                          <ArrowLeft className="h-4 w-4 mr-1" /> Details
                        </Button>
                        <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                          onClick={async () => {
                            try {
                              await generateQuotePDF(
                                { id: pq.id, price: pq.price, currency: pq.currency, scope: pq.scope, timeline: pq.timeline, deliverables: Array.isArray(pq.deliverables) ? pq.deliverables : [], terms: pq.terms || '', status: pq.status, created_at: pq.created_at, expires_at: pq.expires_at || null, service_type: pq.service_type },
                                pr ? { full_name: pr.full_name, email: pr.email, phone: pr.phone, company: pr.company, country: pr.country, service_type: pr.service_type, description: pr.description, tier: pr.tier } : null
                              );
                            } catch { toast.error('Download failed'); }
                          }}>
                          <Download className="h-4 w-4 mr-1" /> Download
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* PDF iframe preview */}
              {pdfPreviewUrl && (
                <iframe
                  src={pdfPreviewUrl}
                  className="w-full border-0 rounded-b-lg"
                  style={{ height: '75vh' }}
                  title="Quote PDF Preview"
                />
              )}

              {/* Detail view — hidden when PDF preview is shown */}
              <div className={`px-6 py-5 space-y-5 ${pdfPreviewUrl ? 'hidden' : ''}`}>
                {/* Client info + price side by side */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Client info */}
                  <div className="md:col-span-2 rounded-lg border bg-gray-50 p-4 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#0098A6] mb-2">Prepared For</p>
                    {pr ? (
                      <>
                        <div className="flex items-center gap-2 font-semibold text-[#1E3A5F] text-base">
                          <User className="h-4 w-4 text-[#0098A6]" />
                          {pr.full_name}
                        </div>
                        {pr.company && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building2 className="h-3.5 w-3.5 text-gray-400" />
                            {pr.company}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                          {pr.email}
                        </div>
                        {pr.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                            {pr.phone}
                          </div>
                        )}
                        {pr.country && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                            {pr.country}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">{pq.client_email}</p>
                    )}
                  </div>

                  {/* Price summary */}
                  <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-teal-50 border-blue-200 p-4 flex flex-col items-center justify-center text-center">
                    <DollarSign className="h-6 w-6 text-[#0098A6] mb-1" />
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Investment</p>
                    <p className="text-3xl font-bold text-[#1E3A5F] mt-1">
                      {pq.currency}{pq.price.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{pq.service_type || pr?.service_type}</p>
                    {pq.expires_at && (
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Valid until {new Date(pq.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quote meta row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {[
                    { label: 'Service', value: pq.service_type || pr?.service_type || '—' },
                    { label: 'Timeline', value: pq.timeline || '—' },
                    { label: 'Issued', value: new Date(pq.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                    { label: 'Status', value: pq.status.replace('_', ' ') },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded border bg-white p-3">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
                      <p className="font-semibold text-gray-800 capitalize">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Scope */}
                {pq.scope && (
                  <div>
                    <h3 className="font-bold text-[#1E3A5F] text-sm uppercase tracking-wide border-b border-[#0098A6] pb-1 mb-3">Project Scope</h3>
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <RichContent raw={pq.scope} />
                    </div>
                  </div>
                )}

                {/* Deliverables */}
                {deliverables.length > 0 && (
                  <div>
                    <h3 className="font-bold text-[#1E3A5F] text-sm uppercase tracking-wide border-b border-[#0098A6] pb-1 mb-3">Deliverables</h3>
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <RichContent raw={deliverables.map(d => `- ${d}`).join('\n')} />
                    </div>
                  </div>
                )}

                {/* Terms */}
                {pq.terms && (
                  <div>
                    <h3 className="font-bold text-[#1E3A5F] text-sm uppercase tracking-wide border-b border-[#0098A6] pb-1 mb-3">Terms & Conditions</h3>
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <RichContent raw={pq.terms} />
                    </div>
                  </div>
                )}

                <p className="text-center text-xs text-gray-400 pt-2 italic">
                  This is an admin preview — the client sees this exact layout at their quote link.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
};

export default AdminQuoteRequestsTab;
