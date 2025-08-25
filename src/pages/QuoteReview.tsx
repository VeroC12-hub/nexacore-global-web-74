// Enhanced QuoteReview.tsx with improved error handling and debugging

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Download, 
  CheckCircle, 
  XCircle, 
  MessageCircle, 
  FileText, 
  DollarSign,
  Clock,
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  AlertTriangle,
  Eye,
  ArrowLeft,
  RefreshCw,
  Info
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Quote {
  id: string;
  price: number;
  currency: string;
  scope: string;
  timeline: string;
  deliverables: string[];
  terms: string;
  status: string;
  created_at: string;
  expires_at: string | null;
  sent_at?: string;
  approved_at?: string;
  declined_at?: string;
  service_type?: string;
  quote_request_id?: string;
  client_email?: string;
}

interface QuoteRequest {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  country?: string;
  service_type: string;
  description: string;
  tier?: string;
  budget_estimate?: number;
}

// Enhanced date validation
const validateAndFormatDate = (dateString: string | null | undefined): { 
  isValid: boolean; 
  formatted: string; 
  date: Date | null;
  isExpired: boolean;
} => {
  if (!dateString) {
    return {
      isValid: false,
      formatted: 'No expiration set',
      date: null,
      isExpired: false
    };
  }

  try {
    const date = new Date(dateString);
    const timestamp = date.getTime();
    const isValidDate = !isNaN(timestamp) && timestamp > 0 && date.getFullYear() > 1990;
    
    if (!isValidDate) {
      console.warn('Invalid date detected:', dateString, 'Timestamp:', timestamp);
      return {
        isValid: false,
        formatted: 'Invalid date',
        date: null,
        isExpired: false
      };
    }

    const now = new Date();
    const isExpired = date < now;
    
    const formatted = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return {
      isValid: true,
      formatted,
      date,
      isExpired
    };
  } catch (error) {
    console.error('Date parsing error:', error, 'Input:', dateString);
    return {
      isValid: false,
      formatted: 'Date format error',
      date: null,
      isExpired: false
    };
  }
};

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Not set';
  const result = validateAndFormatDate(dateString);
  return result.formatted;
};

const QuoteReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteRequest, setQuoteRequest] = useState<QuoteRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [action, setAction] = useState<'approved' | 'revision_requested' | 'declined' | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    loadQuoteData();
  }, [id]);

  const loadQuoteData = async () => {
    if (!id) {
      toast.error('No quote ID provided');
      setDebugInfo('Error: No quote ID in URL');
      navigate('/');
      return;
    }

    setDebugInfo(`Loading quote ID: ${id}`);

    try {
      console.log('🔍 Loading quote data for ID:', id);
      
      // Load quote data with enhanced error handling
      const { data: quoteData, error: quoteError } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', id)
        .single();

      if (quoteError) {
        console.error('❌ Quote fetch error:', quoteError);
        setDebugInfo(`Database error: ${quoteError.message} (Code: ${quoteError.code})`);
        
        if (quoteError.code === 'PGRST116') {
          toast.error('Quote not found - it may have been deleted');
          navigate('/');
          return;
        }
        throw quoteError;
      }

      if (!quoteData) {
        console.error('❌ No quote data returned');
        setDebugInfo('Error: Quote data is null');
        toast.error('Quote not found');
        navigate('/');
        return;
      }

      console.log('✅ Quote loaded successfully:', {
        id: quoteData.id,
        status: quoteData.status,
        client_email: quoteData.client_email,
        expires_at: quoteData.expires_at
      });

      setDebugInfo(`Quote loaded - Status: ${quoteData.status}, Client: ${quoteData.client_email}`);

      // Validate expiration date
      const expirationResult = validateAndFormatDate(quoteData.expires_at);
      if (expirationResult.isExpired && expirationResult.isValid) {
        toast.warning('This quote has expired');
      } else if (!expirationResult.isValid) {
        console.warn('Quote has invalid expiration date:', quoteData.expires_at);
        toast.info('Quote expiration date needs to be updated');
      }

      setQuote(quoteData);

      // Load related quote request
      if (quoteData.quote_request_id) {
        console.log('🔍 Loading quote request:', quoteData.quote_request_id);
        
        const { data: requestData, error: requestError } = await supabase
          .from('quote_requests')
          .select('*')
          .eq('id', quoteData.quote_request_id)
          .single();

        if (!requestError && requestData) {
          console.log('✅ Quote request loaded');
          setQuoteRequest(requestData);
          setDebugInfo(prev => `${prev} | Request loaded for: ${requestData.full_name}`);
        } else {
          console.warn('⚠️ Could not load quote request:', requestError);
          setDebugInfo(prev => `${prev} | Warning: Could not load quote request`);
        }
      }

    } catch (error) {
      console.error('❌ Error loading quote:', error);
      setDebugInfo(`Fatal error: ${error.message}`);
      toast.error('Failed to load quote - check your connection');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteResponse = async () => {
    if (!action) {
      toast.error('Please select an action');
      return;
    }

    if (action === 'revision_requested' && !message.trim()) {
      toast.error('Please provide revision details');
      return;
    }

    if (!id || !quote) {
      toast.error('Quote information is missing');
      setDebugInfo('Error: Missing quote ID or quote data');
      return;
    }

    console.log('🚀 Starting quote response submission...', {
      quote_id: id,
      action,
      has_message: !!message.trim(),
      quote_status: quote.status,
      client_email: quote.client_email
    });

    setSubmitting(true);
    setDebugInfo(`Submitting ${action} response...`);

    try {
      // Check current user/session
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ User auth error:', userError);
        setDebugInfo(`Auth error: ${userError.message}`);
        toast.error('Authentication failed - please refresh the page');
        return;
      }

      console.log('👤 User check:', {
        user_id: user?.id,
        email: user?.email,
        is_authenticated: !!user
      });

      const updateData: any = {
        status: action
        // Removed client_message and updated_at since columns don't exist
      };

      if (action === 'approved') {
        updateData.approved_at = new Date().toISOString();
      } else if (action === 'declined') {
        updateData.declined_at = new Date().toISOString();
      }

      console.log('📝 Updating quote with data:', updateData);
      setDebugInfo(`Updating database with ${action} status...`);

      // Perform the database update
      const { data: updatedData, error: updateError } = await supabase
        .from('quotes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Database update error:', updateError);
        setDebugInfo(`Update failed: ${updateError.message} (Code: ${updateError.code})`);
        
        // Specific error handling
        if (updateError.code === 'PGRST301') {
          toast.error('Permission denied - you may not be authorized to update this quote');
        } else if (updateError.code === 'PGRST116') {
          toast.error('Quote not found - it may have been deleted');
        } else {
          toast.error(`Database error: ${updateError.message}`);
        }
        return;
      }

      console.log('✅ Quote updated successfully:', updatedData);
      setDebugInfo('Database updated successfully!');

      // Email notifications disabled - quote approval works without them
      console.log('📧 Email notifications disabled - quote approved successfully');
      setDebugInfo('Quote approved successfully - email notifications disabled');

      // Success feedback
      toast.success(
        action === 'approved' 
          ? '✅ Quote approved successfully!' 
          : action === 'declined' 
          ? '✅ Quote declined successfully' 
          : '✅ Revision request sent successfully!'
      );

      // Refresh quote data
      await loadQuoteData();

    } catch (error) {
      console.error('❌ Unexpected error during submission:', error);
      setDebugInfo(`Unexpected error: ${error.message}`);
      toast.error(`Submission failed: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const downloadPDF = async () => {
    if (!quote) return;
    
    setDownloadingPdf(true);
    
    try {
      const pdfUrl = `/api/quotes/${quote.id}/pdf`;
      console.log('Opening PDF:', pdfUrl);
      
      window.open(pdfUrl, '_blank', 'width=1000,height=800,scrollbars=yes,resizable=yes');
      toast.success('PDF opened in new tab - use browser print to save as PDF');
      
    } catch (error) {
      console.error('Error opening PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const previewPDF = async () => {
    if (!quote) return;
    
    try {
      const pdfUrl = `/api/quotes/${quote.id}/pdf`;
      window.open(pdfUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    } catch (error) {
      console.error('Error opening PDF preview:', error);
      toast.error('Failed to open preview');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'declined': return 'bg-red-100 text-red-800 border-red-200';
      case 'revision_requested': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'declined': return <XCircle className="w-4 h-4" />;
      case 'revision_requested': return <RefreshCw className="w-4 h-4" />;
      case 'sent': return <FileText className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading quote...</p>
            {debugInfo && (
              <p className="text-xs text-gray-500 mt-2 max-w-md">{debugInfo}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <Card className="p-8 text-center max-w-md">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Quote Not Found</h2>
            <p className="text-gray-600 mb-4">The requested quote could not be loaded.</p>
            {debugInfo && (
              <p className="text-xs text-gray-500 mb-4 p-3 bg-gray-50 rounded">{debugInfo}</p>
            )}
            <Button onClick={() => navigate('/')}>Return Home</Button>
          </Card>
        </div>
      </div>
    );
  }

  const expirationResult = validateAndFormatDate(quote.expires_at);
  const isExpired = expirationResult.isExpired && expirationResult.isValid;
  const canRespond = quote.status === 'sent' && !isExpired && expirationResult.isValid;
  const totalPrice = quote.price?.toLocaleString() || '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50">
      <Navbar />
      
      <section className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Debug Info Panel (only show when there are issues) */}
          {debugInfo && (debugInfo.includes('Error') || debugInfo.includes('Warning') || debugInfo.includes('failed')) && (
            <Card className="mb-6 p-4 bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Debug Information</h4>
                  <p className="text-sm text-yellow-700 mt-1">{debugInfo}</p>
                  <p className="text-xs text-yellow-600 mt-2">
                    If you continue to see this error, please contact support with Quote ID: {id}
                  </p>
                </div>
              </div>
            </Card>
          )}
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
            
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                Quote #{quote.id}
              </span>
            </h1>
            
            <div className="flex items-center justify-center gap-4 mb-6">
              <Badge className={`${getStatusColor(quote.status)} border flex items-center gap-2`}>
                {getStatusIcon(quote.status)}
                {quote.status.replace('_', ' ').toUpperCase()}
              </Badge>
              
              {isExpired && (
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  EXPIRED
                </Badge>
              )}
              
              {!expirationResult.isValid && quote.expires_at && (
                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                  DATE ISSUE
                </Badge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Button 
                onClick={previewPDF}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview Quote
              </Button>
              
              <Button 
                onClick={downloadPDF}
                disabled={downloadingPdf}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
              >
                {downloadingPdf ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Download PDF
              </Button>
            </div>
          </div>

          {/* Quote Content - Your existing content structure */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Quote Details */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Client Information */}
              {quoteRequest && (
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Client Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Full Name</label>
                        <p className="font-semibold">{quoteRequest.full_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {quoteRequest.email}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {quoteRequest.phone && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Phone</label>
                          <p className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {quoteRequest.phone}
                          </p>
                        </div>
                      )}
                      {quoteRequest.company && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Company</label>
                          <p className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            {quoteRequest.company}
                          </p>
                        </div>
                      )}
                      {quoteRequest.country && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Location</label>
                          <p className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {quoteRequest.country}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Project Details */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Project Details
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Service Type</label>
                    <p className="font-semibold text-lg">{quote.service_type || quoteRequest?.service_type}</p>
                  </div>
                  
                  {quoteRequest?.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Project Requirements</label>
                      <p className="mt-1 text-gray-700 leading-relaxed">{quoteRequest.description}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Project Scope</label>
                    <div className="mt-1 bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{quote.scope}</p>
                    </div>
                  </div>
                  
                  {quote.timeline && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Timeline</label>
                      <p className="mt-1 font-medium text-blue-600">{quote.timeline}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Deliverables */}
              {quote.deliverables && quote.deliverables.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">Project Deliverables</h3>
                  <ul className="space-y-2">
                    {quote.deliverables.map((deliverable, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{deliverable}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Terms & Conditions */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Terms & Conditions</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{quote.terms}</p>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Price Summary */}
              <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-teal-50 border-blue-200">
                <div className="mb-4">
                  <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-gray-800">Total Investment</h3>
                </div>
                
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {quote.currency}{totalPrice}
                </div>
                
                <div className="text-sm text-gray-600 mb-4">
                  Service: {quote.service_type || quoteRequest?.service_type}
                </div>

                <div className="text-sm">
                  <span className={
                    isExpired 
                      ? 'text-red-600 font-medium' 
                      : !expirationResult.isValid 
                      ? 'text-orange-600 font-medium'
                      : 'text-gray-600'
                  }>
                    {isExpired 
                      ? `Expired on: ${expirationResult.formatted}`
                      : !expirationResult.isValid
                      ? 'Expiration: Invalid date'
                      : `Valid until: ${expirationResult.formatted}`
                    }
                  </span>
                </div>
              </Card>

              {/* Quote Timeline */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Quote Timeline
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Created</span>
                    <span className="text-sm font-medium">{formatDate(quote.created_at)}</span>
                  </div>
                  
                  {quote.sent_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Sent</span>
                      <span className="text-sm font-medium">{formatDate(quote.sent_at)}</span>
                    </div>
                  )}
                  
                  {quote.approved_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Approved</span>
                      <span className="text-sm font-medium text-green-600">{formatDate(quote.approved_at)}</span>
                    </div>
                  )}
                  
                  {quote.declined_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Declined</span>
                      <span className="text-sm font-medium text-red-600">{formatDate(quote.declined_at)}</span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Response Actions */}
              {canRespond && (
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4">Your Response</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Choose Action:</label>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="action"
                            value="approved"
                            checked={action === 'approved'}
                            onChange={(e) => setAction(e.target.value as any)}
                            className="text-green-600"
                          />
                          <span className="text-green-600 font-medium">Approve Quote</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="action"
                            value="revision_requested"
                            checked={action === 'revision_requested'}
                            onChange={(e) => setAction(e.target.value as any)}
                            className="text-yellow-600"
                          />
                          <span className="text-yellow-600 font-medium">Request Revision</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="action"
                            value="declined"
                            checked={action === 'declined'}
                            onChange={(e) => setAction(e.target.value as any)}
                            className="text-red-600"
                          />
                          <span className="text-red-600 font-medium">Decline Quote</span>
                        </label>
                      </div>
                    </div>

                    {(action === 'revision_requested' || action === 'declined') && (
                      <div>
                        <label className="text-sm font-medium">
                          {action === 'revision_requested' ? 'Revision Details:' : 'Reason (Optional):'}
                        </label>
                        <Textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={
                            action === 'revision_requested' 
                              ? "Please describe the changes you'd like to see..."
                              : "Let us know why you're declining (optional)"
                          }
                          rows={4}
                          className="mt-1"
                        />
                      </div>
                    )}

                    {action === 'approved' && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <p className="text-green-800 text-sm">
                          By approving this quote, you agree to proceed with the project as outlined. 
                          Our team will contact you within 24 hours to discuss next steps and contract details.
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={handleQuoteResponse}
                      disabled={!action || submitting}
                      className="w-full"
                      variant={action === 'approved' ? 'default' : action === 'declined' ? 'destructive' : 'secondary'}
                    >
                      {submitting ? (
                        <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                      ) : (
                        <MessageCircle className="w-4 h-4 mr-2" />
                      )}
                      {submitting ? 'Submitting...' : 
                       action === 'approved' ? 'Approve Quote' :
                       action === 'declined' ? 'Decline Quote' :
                       action === 'revision_requested' ? 'Request Revision' : 'Select Action'}
                    </Button>
                  </div>
                </Card>
              )}

              {!canRespond && quote.status !== 'approved' && quote.status !== 'declined' && (
                <Card className="p-6 bg-gray-50">
                  <div className="text-center">
                    <AlertTriangle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">
                      {isExpired 
                        ? 'This quote has expired' 
                        : !expirationResult.isValid
                        ? 'Quote has invalid expiration date - please contact support'
                        : 'Quote response already submitted'
                      }
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default QuoteReview;
