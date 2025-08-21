import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  ArrowRight, 
  DollarSign, 
  FileText, 
  CheckCircle,
  User,
  Mail,
  Phone,
  Globe,
  Calendar,
  Package,
  AlertCircle,
  Send,
  Save,
  Eye,
  Clock,
  Building
} from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
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

interface QuoteData {
  scope: string;
  price: number;
  currency: string;
  timeline: string;
  deliverables: string[];
  terms: string;
  expires_in_days: number;
}

const ProjectManagerQuoteCreation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quoteRequest, setQuoteRequest] = useState<QuoteRequest | null>(null);
  const [user, setUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Quote form state
  const [quoteData, setQuoteData] = useState<QuoteData>({
    scope: '',
    price: 0,
    currency: 'USD',
    timeline: '',
    deliverables: [''],
    terms: `Payment Terms:
- 50% upfront deposit required to begin work
- Remaining 50% due upon project completion
- Payment accepted via bank transfer, PayPal, or Stripe
- Net 15 payment terms for approved corporate clients

Scope & Revisions:
- Up to 3 rounds of revisions included in quoted price
- Additional revisions available at $150/hour
- Scope changes may result in timeline and cost adjustments

Delivery & Timeline:
- Project timeline begins after deposit is received
- All deliverables provided digitally unless otherwise specified
- 30-day support period included for bug fixes and minor adjustments

Legal:
- Client retains full rights to final deliverables upon final payment
- NexaCore retains rights to use project in portfolio (with client approval)
- Confidentiality agreement available upon request

Cancellation:
- Project may be cancelled with 48-hour notice
- Completed work will be billed at hourly rate
- Refunds calculated based on work completed`,
    expires_in_days: 30
  });

  // Get quote request ID from URL
  const quoteRequestId = searchParams.get('request_id');

  useEffect(() => {
    checkAuthAndLoadData();
  }, [quoteRequestId]);

  const checkAuthAndLoadData = async () => {
    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast.error('Please sign in to access this page');
        navigate('/auth?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
        return;
      }

      setUser(user);

      // Check if user has permission (admin, staff, or project_manager)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile || !['admin', 'staff', 'project_manager'].includes(profile.role)) {
        toast.error('You do not have permission to access this page');
        navigate('/');
        return;
      }

      setIsAuthorized(true);

      // Load quote request data
      if (quoteRequestId) {
        await loadQuoteRequest(quoteRequestId);
      } else {
        toast.error('No quote request specified');
        navigate('/admin');
      }

    } catch (error) {
      console.error('Error checking auth:', error);
      toast.error('Authentication error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadQuoteRequest = async (requestId: string) => {
    try {
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

      // Pre-populate quote data based on request
      setQuoteData(prev => ({
        ...prev,
        scope: `${data.service_type} - ${data.tier || 'Custom'} Package\n\nProject Overview:\n${data.description}\n\nDeliverables will include:\n- `,
        price: data.budget_estimate || 0,
        timeline: data.timeline || '2-4 weeks'
      }));

    } catch (error) {
      console.error('Error loading quote request:', error);
      toast.error('Failed to load quote request');
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
      deliverables: prev.deliverables.map((item, i) => i === index ? value : item)
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

  const saveQuoteDraft = async () => {
    if (!quoteRequest || !user) return;

    setSubmitting(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + quoteData.expires_in_days);

      const { data, error } = await supabase
        .from('quotes')
        .insert({
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
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

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
      // First save/update the quote
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + quoteData.expires_in_days);

      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
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
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

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

      // Update quote request status
      await supabase
        .from('quote_requests')
        .update({ status: 'quoted' })
        .eq('id', quoteRequest.id);

      // Redirect to admin dashboard after success
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

  if (!isAuthorized || !quoteRequest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <Card className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-600">You do not have permission to access this page.</p>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-gradient-to-r from-blue-100 to-teal-100 text-blue-700 border border-blue-200">
              <FileText className="w-4 h-4 mr-2" />
              Quote Creation
            </Badge>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                Create Quote
              </span>
            </h1>
            <p className="text-lg text-gray-600">
              Review the client request and create a detailed quote
            </p>
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
                        <Building className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-medium">{quoteRequest.company}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Service Type</Label>
                  <div className="mt-1">
                    <Badge variant="secondary">{quoteRequest.service_type}</Badge>
                  </div>
                </div>
                
                {quoteRequest.tier && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Tier</Label>
                    <div className="mt-1">
                      <Badge variant="outline">{quoteRequest.tier}</Badge>
                    </div>
                  </div>
                )}
              </div>

              {(quoteRequest.budget_estimate || quoteRequest.country) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {quoteRequest.budget_estimate && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Budget Estimate</Label>
                      <div className="flex items-center mt-1">
                        <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-medium">${quoteRequest.budget_estimate.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                  
                  {quoteRequest.country && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Country</Label>
                      <div className="flex items-center mt-1">
                        <Globe className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-medium">{quoteRequest.country}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-gray-600">Project Description</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{quoteRequest.description}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Request Date</Label>
                <div className="flex items-center mt-1">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="font-medium">
                    {new Date(quoteRequest.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Quote Creation Form */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Create Quote
            </h3>

            <div className="space-y-6">
              {/* Scope */}
              <div>
                <Label htmlFor="scope">Project Scope *</Label>
                <Textarea
                  id="scope"
                  value={quoteData.scope}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, scope: e.target.value }))}
                  className="mt-2 min-h-[200px]"
                  placeholder="Detailed description of what will be delivered..."
                />
              </div>

              {/* Price and Currency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={quoteData.price}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="mt-2"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={quoteData.currency} onValueChange={(value) => setQuoteData(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                      <SelectItem value="AUD">AUD (A$)</SelectItem>
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
                  className="mt-2"
                  placeholder="e.g., 2-3 weeks, 1 month, etc."
                />
              </div>

              {/* Deliverables */}
              <div>
                <Label>Deliverables</Label>
                <div className="space-y-3 mt-2">
                  {quoteData.deliverables.map((deliverable, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={deliverable}
                        onChange={(e) => updateDeliverable(index, e.target.value)}
                        placeholder="Enter deliverable item..."
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeDeliverable(index)}
                        disabled={quoteData.deliverables.length === 1}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addDeliverable}
                    className="w-full"
                  >
                    Add Deliverable
                  </Button>
                </div>
              </div>

              {/* Quote Expiration */}
              <div>
                <Label htmlFor="expires">Quote Expires In (Days)</Label>
                <Input
                  id="expires"
                  type="number"
                  value={quoteData.expires_in_days}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, expires_in_days: parseInt(e.target.value) || 30 }))}
                  className="mt-2"
                  min="1"
                  max="90"
                />
              </div>

              {/* Terms and Conditions */}
              <div>
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  value={quoteData.terms}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, terms: e.target.value }))}
                  className="mt-2 min-h-[200px]"
                  placeholder="Payment terms, deliverables, revisions, etc."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <Button
                variant="outline"
                onClick={saveQuoteDraft}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </>
                )}
              </Button>
              
              <Button
                onClick={sendQuoteToClient}
                disabled={submitting || !quoteData.scope.trim() || !quoteData.price || !quoteData.timeline.trim()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send to Client
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProjectManagerQuoteCreation;
