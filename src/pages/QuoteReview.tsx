// src/pages/QuoteReview.tsx - ENHANCED WITH COMPREHENSIVE CONTENT & PDF DOWNLOAD
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
  RefreshCw
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
  expires_at: string;
  sent_at?: string;
  approved_at?: string;
  declined_at?: string;
  service_type?: string;
  quote_request_id?: string;
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

  useEffect(() => {
    loadQuoteData();
  }, [id]);

  const loadQuoteData = async () => {
    if (!id) {
      toast.error('No quote ID provided');
      navigate('/');
      return;
    }

    try {
      // Load quote data
      const { data: quoteData, error: quoteError } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', id)
        .single();

      if (quoteError) {
        console.error('Quote fetch error:', quoteError);
        if (quoteError.code === 'PGRST116') {
          toast.error('Quote not found');
          navigate('/');
          return;
        }
        throw quoteError;
      }

      if (!quoteData) {
        toast.error('Quote not found');
        navigate('/');
        return;
      }

      // Check if quote is expired
      if (quoteData.expires_at && new Date(quoteData.expires_at) < new Date()) {
        toast.warning('This quote has expired');
      }

      setQuote(quoteData);

      // Load related quote request
      if (quoteData.quote_request_id) {
        const { data: requestData, error: requestError } = await supabase
          .from('quote_requests')
          .select('*')
          .eq('id', quoteData.quote_request_id)
          .single();

        if (!requestError && requestData) {
          setQuoteRequest(requestData);
        }
      }

    } catch (error) {
      console.error('Error loading quote:', error);
      toast.error('Failed to load quote');
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

    setSubmitting(true);

    try {
      const updateData: any = {
        status: action,
        client_message: message.trim() || null,
      };

      if (action === 'approved') {
        updateData.approved_at = new Date().toISOString();
      } else if (action === 'declined') {
        updateData.declined_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('quotes')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Send notification email
      try {
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'quote_response',
            to: 'projects@nexacore-innovations.com',
            data: {
              quote_id: id,
              action,
              client_name: quoteRequest?.full_name || 'Client',
              client_email: quoteRequest?.email || '',
              message: message.trim() || null,
              service_type: quote?.service_type || quoteRequest?.service_type
            }
          }
        });
      } catch (emailError) {
        console.warn('Email notification failed:', emailError);
      }

      toast.success(
        action === 'approved' 
          ? 'Quote approved successfully!' 
          : action === 'declined' 
          ? 'Quote declined successfully' 
          : 'Revision request sent successfully!'
      );

      // Refresh quote data
      await loadQuoteData();

    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error('Failed to submit response');
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
      
      // Open PDF in new tab for download/print
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
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
            <Button onClick={() => navigate('/')}>Return Home</Button>
          </Card>
        </div>
      </div>
    );
  }

  const isExpired = quote.expires_at && new Date(quote.expires_at) < new Date();
  const canRespond = quote.status === 'sent' && !isExpired;
  const totalPrice = quote.price?.toLocaleString() || '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50">
      <Navbar />
      
      <section className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
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

          {/* Quote Content */}
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

                {quote.expires_at && (
                  <div className="text-sm">
                    <span className={isExpired ? 'text-red-600 font-medium' : 'text-gray-600'}>
                      {isExpired ? 'Expired on' : 'Valid until'}: {formatDate(quote.expires_at)}
                    </span>
                  </div>
                )}
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
                      {isExpired ? 'This quote has expired' : 'Quote response already submitted'}
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
