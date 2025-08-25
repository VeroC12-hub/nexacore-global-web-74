import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, Mail, Phone, MapPin, Building2, Calendar, DollarSign, 
  FileText, Clock, Save, Send, Plus, Trash2, AlertTriangle,
  CheckCircle, ArrowLeft, Eye, Download
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getQuotePDFUrl } from '@/utils/urlHelpers';

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

interface QuoteData {
  scope: string;
  price: number;
  currency: string;
  timeline: string;
  deliverables: string[];
  terms: string;
  expires_in_days: number;
}

const ProjectManagerQuoteCreation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quoteRequest, setQuoteRequest] = useState<QuoteRequest | null>(null);
  const [savedQuoteId, setSavedQuoteId] = useState<string | null>(null);
  
  const [quoteData, setQuoteData] = useState<QuoteData>({
    scope: '',
    price: 0,
    currency: 'USD',
    timeline: '',
    deliverables: [''],
    terms: 'Payment terms: 50% deposit required to begin work, 50% upon project completion. All deliverables will be provided as outlined in the scope. Project timeline begins after deposit receipt and final approval of requirements.',
    expires_in_days: 14
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    loadQuoteRequest();
  }, [user, location.search]);

  // FIXED: Proper date validation and calculation
  const calculateExpirationDate = (daysFromNow: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    
    // Ensure we have a valid future date
    if (isNaN(date.getTime()) || date <= new Date()) {
      console.warn('Invalid expiration date calculated, using default 14 days');
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 14);
      return defaultDate;
    }
    
    return date;
  };

  // FIXED: Safe date parsing with fallback
  const safeDateCalculation = (expiresAt: string | null): number => {
    if (!expiresAt) return 14;
    
    try {
      const expireDate = new Date(expiresAt);
      
      // Check if date is valid and not in the past
      if (isNaN(expireDate.getTime()) || expireDate <= new Date()) {
        console.warn('Invalid expires_at date:', expiresAt);
        return 14;
      }
      
      const daysRemaining = Math.ceil((expireDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
      return Math.max(1, daysRemaining);
    } catch (error) {
      console.error('Error parsing expires_at:', error);
      return 14;
    }
  };

  const loadQuoteRequest = async () => {
    try {
      const params = new URLSearchParams(location.search);
      const requestId = params.get('request_id');
      
      if (!requestId) {
        toast.error('Quote request ID is required');
        navigate('/admin');
        return;
      }

      const { data, error } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (error) throw error;
      
      if (!data) {
        toast.error('Quote request not found');
        navigate('/admin');
        return;
      }

      setQuoteRequest(data);
      
      // Check if there's already a quote for this request
      const { data: existingQuote } = await supabase
        .from('quotes')
        .select('*')
        .eq('quote_request_id', requestId)
        .single();

      if (existingQuote) {
        setSavedQuoteId(existingQuote.id);
        
        // FIXED: Safe date calculation with proper validation
        const expirationDays = safeDateCalculation(existingQuote.expires_at);
        
        console.log('Loading existing quote:', {
          id: existingQuote.id,
          expires_at: existingQuote.expires_at,
          calculated_days: expirationDays
        });
        
        // Pre-populate with existing quote data
        setQuoteData({
          scope: existingQuote.scope || '',
          price: existingQuote.price || 0,
          currency: existingQuote.currency || 'USD',
          timeline: existingQuote.timeline || '',
          deliverables: Array.isArray(existingQuote.deliverables) ? existingQuote.deliverables : [''],
          terms: existingQuote.terms || quoteData.terms,
          expires_in_days: expirationDays
        });
      } else {
        // Pre-populate quote data based on request
        setQuoteData(prev => ({
          ...prev,
          timeline: data.timeline || '',
          scope: `${data.service_type} project as described: ${data.description}`
        }));
      }

    } catch (error) {
      console.error('Error loading quote request:', error);
      toast.error('Failed to load quote request');
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  // NEW: Delete old/expired quotes function
  const deleteOldQuotes = async () => {
    if (!confirm('Are you sure you want to delete all expired quotes? This action cannot be undone.')) {
      return;
    }

    setSubmitting(true);
    try {
      // Delete quotes that are expired or have invalid dates
      const { error } = await supabase
        .from('quotes')
        .delete()
        .or(`expires_at.is.null,expires_at.lt.${new Date().toISOString()}`);

      if (error) throw error;

      toast.success('Old and expired quotes have been deleted');
      
      // Refresh the page to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error('Error deleting old quotes:', error);
      toast.error('Failed to delete old quotes');
    } finally {
      setSubmitting(false);
    }
  };

  const addDeliverable = () => {
    setQuoteData(prev => ({
      ...prev,
      deliverables: [...prev.deliverables, '']
    }));
  };

  const updateDeliverable = (index: number, value: string) => {
    setQuoteData(prev => ({
      ...prev,
      deliverables: prev.deliverables.map((d, i) => i === index ? value : d)
    }));
  };

  const removeDeliverable = (index: number) => {
    if (quoteData.deliverables.length > 1) {
      setQuoteData(prev => ({
        ...prev,
        deliverables: prev.deliverables.filter((_, i) => i !== index)
      }));
    }
  };

  const saveDraft = async () => {
    if (!quoteRequest || !user) return;

    setSubmitting(true);
    try {
      // FIXED: Use proper date calculation with validation
      const expiresAt = calculateExpirationDate(quoteData.expires_in_days);
      
      console.log('Saving quote with validated expires_at:', {
        expires_in_days: quoteData.expires_in_days,
        calculated_date: expiresAt.toISOString(),
        timestamp: expiresAt.getTime()
      });

      const quotePayload = {
        quote_request_id: quoteRequest.id,
        client_email: quoteRequest.email,
        service_type: quoteRequest.service_type,
        scope: quoteData.scope,
        price: quoteData.price,
        currency: quoteData.currency,
        timeline: quoteData.timeline,
        deliverables: quoteData.deliverables.filter(d => d.trim() !== ''),
        terms: quoteData.terms,
        status: 'draft',
        created_by: user.id,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      };

      let data, error;

      if (savedQuoteId) {
        const result = await supabase
          .from('quotes')
          .update(quotePayload)
          .eq('id', savedQuoteId)
          .select()
          .single();
        data = result.data;
        error = result.error;
      } else {
        const result = await supabase
          .from('quotes')
          .insert(quotePayload)
          .select()
          .single();
        data = result.data;
        error = result.error;
        if (data) setSavedQuoteId(data.id);
      }

      if (error) throw error;

      toast.success('Quote saved as draft');
      return data;

    } catch (error) {
      console.error('Error saving quote:', error);
      toast.error('Failed to save quote');
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const sendQuoteToClient = async () => {
    if (!quoteRequest || !user) return;

    if (!quoteData.scope.trim() || !quoteData.price || !quoteData.timeline.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      // FIXED: Use proper date calculation with validation
      const expiresAt = calculateExpirationDate(quoteData.expires_in_days);
      
      console.log('Creating quote with validated expires_at:', {
        expires_in_days: quoteData.expires_in_days,
        calculated_date: expiresAt.toISOString(),
        timestamp: expiresAt.getTime()
      });

      const quotePayload = {
        quote_request_id: quoteRequest.id,
        client_email: quoteRequest.email,
        service_type: quoteRequest.service_type,
        scope: quoteData.scope,
        price: quoteData.price,
        currency: quoteData.currency,
        timeline: quoteData.timeline,
        deliverables: quoteData.deliverables.filter(d => d.trim() !== ''),
        terms: quoteData.terms,
        status: 'sent',
        created_by: user.id,
        expires_at: expiresAt.toISOString(),
        sent_at: new Date().toISOString()
      };

      let quote, quoteError;

      if (savedQuoteId) {
        const result = await supabase
          .from('quotes')
          .update(quotePayload)
          .eq('id', savedQuoteId)
          .select()
          .single();
        quote = result.data;
        quoteError = result.error;
      } else {
        const result = await supabase
          .from('quotes')
          .insert(quotePayload)
          .select()
          .single();
        quote = result.data;
        quoteError = result.error;
      }

      if (quoteError) throw quoteError;

      console.log('Quote created/updated successfully:', quote);

      // Send email to client with quote
      const { error: emailError } = await supabase.functions.invoke('send-enhanced-quote-emails', {
        body: {
          type: 'quote_to_client',
          data: {
            quote_id: quote.id,
            client_name: quoteRequest.full_name,
            client_email: quoteRequest.email,
            service_type: quoteRequest.service_type,
            price: quoteData.price,
            currency: quoteData.currency,
            timeline: quoteData.timeline,
            scope: quoteData.scope,
            deliverables: quoteData.deliverables.filter(d => d.trim() !== ''),
            terms: quoteData.terms,
            expires_at: expiresAt.toISOString()
          }
        }
      });

      if (emailError) {
        console.warn('Email sending failed:', emailError);
        toast.warning('Quote saved but email notification failed. Please send manually.');
      } else {
        toast.success('Quote sent to client successfully!');
      }

      await supabase
        .from('quote_requests')
        .update({ status: 'quoted' })
        .eq('id', quoteRequest.id);

      setSavedQuoteId(quote.id);

      setTimeout(() => {
        navigate('/admin');
      }, 2000);

    } catch (error) {
      console.error('Error sending quote:', error);
      toast.error('Failed to send quote');
    } finally {
      setSubmitting(false);
    }
  };

  const previewQuote = async () => {
    if (!quoteRequest) return;

    try {
      if (!savedQuoteId) {
        const savedQuote = await saveDraft();
        if (!savedQuote) {
          toast.error('Please save the quote first');
          return;
        }
      }

      const pdfUrl = getQuotePDFUrl(savedQuoteId!);
      console.log('Opening PDF preview:', pdfUrl);
      
      window.open(pdfUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
      
      toast.success('PDF preview opened in new window');
    } catch (error) {
      console.error('Error opening PDF preview:', error);
      toast.error('Failed to generate preview. Please save the quote first.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!quoteRequest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <Card className="p-8 text-center max-w-md">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Quote Request Not Found</h2>
            <p className="text-gray-600 mb-4">The requested quote could not be loaded.</p>
            <Button onClick={() => navigate('/admin')}>Return to Dashboard</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50">
      <Navbar />
      
      {/* Header Section */}
      <section className="pt-24 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/admin')}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              
              {/* NEW: Delete Old Quotes Button */}
              <Button 
                variant="destructive" 
                onClick={deleteOldQuotes}
                disabled={submitting}
                className="ml-4"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clean Up Old Quotes
              </Button>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                {savedQuoteId ? 'Edit Quote' : 'Create Quote'}
              </span>
            </h1>
            <p className="text-lg text-gray-600">
              Review the client request and create a detailed quote
            </p>
            {savedQuoteId && (
              <p className="text-sm text-gray-500 mt-2">
                Quote ID: {savedQuoteId}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Client Request Information */}
          <Card className="p-6 h-fit">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Client Request Details
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Client Name</Label>
                  <div className="flex items-center mt-1">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="font-medium">{quoteRequest.full_name}</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <div className="flex items-center mt-1">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="font-medium">{quoteRequest.email}</span>
                  </div>
                </div>
              </div>

              {(quoteRequest.phone || quoteRequest.company) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {quoteRequest.phone && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Phone</Label>
                      <div className="flex items-center mt-1">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-medium">{quoteRequest.phone}</span>
                      </div>
                    </div>
                  )}
                  
                  {quoteRequest.company && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Company</Label>
                      <div className="flex items-center mt-1">
                        <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-medium">{quoteRequest.company}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {quoteRequest.country && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Country</Label>
                  <div className="flex items-center mt-1">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="font-medium">{quoteRequest.country}</span>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-gray-600">Service Type</Label>
                <Badge variant="secondary" className="mt-1">{quoteRequest.service_type}</Badge>
              </div>

              {quoteRequest.budget_estimate && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Client Budget Estimate</Label>
                  <div className="flex items-center mt-1">
                    <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="font-medium">${quoteRequest.budget_estimate.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {quoteRequest.timeline && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Requested Timeline</Label>
                  <div className="flex items-center mt-1">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="font-medium">{quoteRequest.timeline}</span>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-gray-600">Project Description</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{quoteRequest.description}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Request Date</Label>
                <p className="text-sm text-gray-500">
                  {new Date(quoteRequest.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>

          {/* Quote Creation Form */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              {savedQuoteId ? 'Edit Quote' : 'Create Quote'}
            </h3>

            <div className="space-y-6">
              {/* Pricing Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={quoteData.price || ''}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    placeholder="5000"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={quoteData.currency} onValueChange={(value) => setQuoteData(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <Label htmlFor="timeline">Timeline *</Label>
                <Input
                  id="timeline"
                  value={quoteData.timeline}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, timeline: e.target.value }))}
                  placeholder="6-8 weeks"
                  className="mt-1"
                />
              </div>

              {/* Expiration - FIXED with better validation */}
              <div>
                <Label htmlFor="expires_in_days">Quote Valid For (Days)</Label>
                <Input
                  id="expires_in_days"
                  type="number"
                  value={quoteData.expires_in_days}
                  onChange={(e) => {
                    const days = Math.max(1, Math.min(90, Number(e.target.value) || 14));
                    setQuoteData(prev => ({ ...prev, expires_in_days: days }));
                  }}
                  placeholder="14"
                  className="mt-1"
                  min="1"
                  max="90"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Quote will expire on: {calculateExpirationDate(quoteData.expires_in_days).toLocaleDateString()}
                </p>
              </div>

              {/* Project Scope */}
              <div>
                <Label htmlFor="scope">Project Scope *</Label>
                <Textarea
                  id="scope"
                  value={quoteData.scope}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, scope: e.target.value }))}
                  placeholder="Detailed description of the project scope, what will be delivered, and any limitations..."
                  className="mt-1 min-h-[120px]"
                />
              </div>

              {/* Deliverables */}
              <div>
                <Label>Deliverables</Label>
                <div className="space-y-2 mt-2">
                  {quoteData.deliverables.map((deliverable, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={deliverable}
                        onChange={(e) => updateDeliverable(index, e.target.value)}
                        placeholder={`Deliverable ${index + 1}`}
                        className="flex-1"
                      />
                      {quoteData.deliverables.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeDeliverable(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addDeliverable}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Deliverable
                  </Button>
                </div>
              </div>

              {/* Terms */}
              <div>
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  value={quoteData.terms}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, terms: e.target.value }))}
                  className="mt-1 min-h-[100px]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={previewQuote}
                  variant="outline"
                  className="flex-1"
                  disabled={!quoteData.scope.trim() || !quoteData.price}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview PDF
                </Button>
                
                <Button
                  onClick={saveDraft}
                  disabled={submitting}
                  variant="outline"
                  className="flex-1"
                >
                  {submitting ? (
                    <div className="animate-spin w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Draft
                </Button>
                
                <Button
                  onClick={sendQuoteToClient}
                  disabled={submitting || !quoteData.scope.trim() || !quoteData.price || !quoteData.timeline.trim()}
                  className="flex-1"
                >
                  {submitting ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send to Client
                </Button>
              </div>

              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-500">
                  <CheckCircle className="w-4 h-4 inline mr-1 text-green-500" />
                  Quote will be sent via email with secure review link
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProjectManagerQuoteCreation;
