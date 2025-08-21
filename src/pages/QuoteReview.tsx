import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  DollarSign, 
  Calendar, 
  FileText, 
  Package, 
  AlertCircle,
  User,
  Mail,
  Clock,
  Shield,
  ArrowLeft
} from "lucide-react";
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Quote {
  id: string;
  client_email: string;
  service_type: string;
  scope: string;
  price: number;
  currency: string;
  timeline: string;
  deliverables: string[];
  terms: string;
  status: string;
  created_at: string;
  expires_at: string;
  quote_request_id: string;
}

interface QuoteRequest {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  service_type: string;
  description: string;
}

const QuoteReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteRequest, setQuoteRequest] = useState<QuoteRequest | null>(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [action, setAction] = useState<'approved' | 'revision_requested' | 'declined' | null>(null);

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

      if (quoteError) throw quoteError;

      if (!quoteData) {
        toast.error('Quote not found');
        navigate('/');
        return;
      }

      // Check if quote is expired
      if (new Date(quoteData.expires_at) < new Date()) {
        toast.error('This quote has expired');
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
      toast.error('Failed to load quote data');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const checkAuthAndRedirect = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      // Redirect to auth with return URL
      const returnUrl = encodeURIComponent(window.location.pathname);
      navigate(`/auth?redirect=${returnUrl}`);
      return false;
    }

    // Check if user email matches quote client email
    if (quote && user.email !== quote.client_email) {
      toast.error('You can only view quotes sent to your email address');
      navigate('/client-portal');
      return false;
    }

    setUser(user);
    return true;
  };

  const handleQuoteAction = async (actionType: 'approved' | 'revision_requested' | 'declined') => {
    // Check authentication first
    const isAuthenticated = await checkAuthAndRedirect();
    if (!isAuthenticated) return;

    if (actionType === 'revision_requested' && !message.trim()) {
      toast.error('Please provide details about the changes you would like');
      return;
    }

    if (actionType === 'declined' && !message.trim()) {
      toast.error('Please provide a reason for declining the quote');
      return;
    }

    setSubmitting(true);
    try {
      // Update quote status
      const { error: updateError } = await supabase
        .from('quotes')
        .update({ 
          status: actionType,
          [actionType === 'approved' ? 'approved_at' : 'updated_at']: new Date().toISOString()
        })
        .eq('id', quote!.id);

      if (updateError) throw updateError;

      // Send notification email to project manager
      const { error: emailError } = await supabase.functions.invoke('send-enhanced-quote-emails', {
        body: {
          type: 'quote_response_to_pm',
          data: {
            action: actionType,
            quote_id: quote!.id,
            client_name: quoteRequest?.full_name || user?.email || 'Client',
            client_email: quote!.client_email,
            service_type: quote!.service_type,
            price: quote!.price,
            currency: quote!.currency,
            message: message.trim() || null
          }
        }
      });

      if (emailError) {
        console.warn('Email notification failed:', emailError);
      }

      // Show success message
      const actionMessages = {
        approved: 'Quote approved! We will begin work soon and send you project details.',
        revision_requested: 'Revision request sent! We will review your feedback and send an updated quote.',
        declined: 'Quote declined. Thank you for considering our services.'
      };

      toast.success(actionMessages[actionType]);
      
      // Update local state
      setQuote(prev => prev ? { ...prev, status: actionType } : null);
      setAction(actionType);

      // Redirect to client portal after a delay
      setTimeout(() => {
        navigate('/client-portal');
      }, 3000);

    } catch (error) {
      console.error('Error updating quote:', error);
      toast.error('Failed to update quote. Please try again.');
    } finally {
      setSubmitting(false);
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
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Quote Not Found</h2>
            <p className="text-gray-600 mb-4">The quote you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/')}>Return Home</Button>
          </Card>
        </div>
      </div>
    );
  }

  const isExpired = new Date(quote.expires_at) < new Date();
  const isResponsed = ['approved', 'revision_requested', 'declined'].includes(quote.status);

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
                onClick={() => navigate('/client-portal')}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Portal
              </Button>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                Project Quote
              </span>
            </h1>
            <p className="text-lg text-gray-600">
              Review the details and respond to your quote
            </p>
            
            <div className="flex items-center justify-center mt-4 space-x-4">
              <Badge 
                variant={quote.status === 'sent' ? 'default' : 
                        quote.status === 'approved' ? 'default' : 
                        quote.status === 'revision_requested' ? 'secondary' : 'outline'}
                className={quote.status === 'approved' ? 'bg-green-500' : 
                          quote.status === 'revision_requested' ? 'bg-yellow-500' : 
                          quote.status === 'declined' ? 'bg-red-500' : ''}
              >
                {quote.status === 'sent' ? 'Awaiting Response' :
                 quote.status === 'approved' ? 'Approved' :
                 quote.status === 'revision_requested' ? 'Revision Requested' :
                 quote.status === 'declined' ? 'Declined' : quote.status}
              </Badge>
              
              {isExpired && (
                <Badge variant="destructive">
                  <Clock className="w-3 h-3 mr-1" />
                  Expired
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {isResponsed && (
          <Card className="p-6 mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">
                  {action === 'approved' ? 'Quote Approved!' :
                   action === 'revision_requested' ? 'Revision Requested' :
                   'Response Recorded'}
                </h3>
                <p className="text-green-700">
                  {action === 'approved' ? 'We will begin work on your project soon and send you the project details.' :
                   action === 'revision_requested' ? 'We will review your feedback and send an updated quote.' :
                   'Your response has been recorded.'}
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-8">
          {/* Quote Overview */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center">
                <FileText className="w-6 h-6 mr-2 text-blue-600" />
                Quote Details
              </h2>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {quote.currency} {quote.price.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  Expires: {new Date(quote.expires_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Service Type</h3>
                <Badge variant="secondary">{quote.service_type}</Badge>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Timeline</h3>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <span>{quote.timeline}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3">Project Scope</h3>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="whitespace-pre-wrap text-gray-700">{quote.scope}</p>
              </div>
            </div>

            {quote.deliverables && quote.deliverables.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  Deliverables
                </h3>
                <ul className="space-y-2">
                  {quote.deliverables.map((item, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Terms & Conditions</h3>
              <div className="bg-gray-50 p-4 rounded-lg border text-sm">
                <pre className="whitespace-pre-wrap text-gray-600 font-sans">{quote.terms}</pre>
              </div>
            </div>
          </Card>

          {/* Original Request */}
          {quoteRequest && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Your Original Request
              </h2>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="font-medium text-blue-800">Name:</span>
                    <span className="ml-2 text-blue-700">{quoteRequest.full_name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Email:</span>
                    <span className="ml-2 text-blue-700">{quoteRequest.email}</span>
                  </div>
                </div>
                
                <div className="mb-3">
                  <span className="font-medium text-blue-800">Service Requested:</span>
                  <span className="ml-2 text-blue-700">{quoteRequest.service_type}</span>
                </div>
                
                <div>
                  <span className="font-medium text-blue-800">Description:</span>
                  <p className="mt-2 text-blue-700">{quoteRequest.description}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          {quote.status === 'sent' && !isExpired && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Respond to Quote</h2>
              
              <div className="space-y-4 mb-6">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a message (required for revisions or declining)..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => handleQuoteAction('approved')}
                  disabled={submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {submitting ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Accept Quote
                </Button>
                
                <Button
                  onClick={() => handleQuoteAction('revision_requested')}
                  disabled={submitting || !message.trim()}
                  variant="outline"
                  className="flex-1"
                >
                  {submitting ? (
                    <div className="animate-spin w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full mr-2" />
                  ) : (
                    <MessageSquare className="w-4 h-4 mr-2" />
                  )}
                  Request Changes
                </Button>
                
                <Button
                  onClick={() => handleQuoteAction('declined')}
                  disabled={submitting || !message.trim()}
                  variant="destructive"
                  className="flex-1"
                >
                  {submitting ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  Decline Quote
                </Button>
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Your response is secure and will be sent directly to our project manager.</p>
                    <p>You'll receive email confirmation and project details once you accept the quote.</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {isExpired && quote.status === 'sent' && (
            <Card className="p-6 bg-red-50 border-red-200">
              <div className="flex items-center">
                <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Quote Expired</h3>
                  <p className="text-red-700">
                    This quote expired on {new Date(quote.expires_at).toLocaleDateString()}. 
                    Please contact us for a new quote.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default QuoteReview;
