import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, MessageSquare, Download } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
  sent_at?: string;
  approved_at?: string;
  expires_at?: string;
}

const QuoteReview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchQuote();
    }
  }, [id]);

  const fetchQuote = async () => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setQuote(data);
    } catch (error) {
      console.error('Error fetching quote:', error);
      toast.error('Failed to load quote');
    } finally {
      setLoading(false);
    }
  };

  const approveQuote = async () => {
    if (!quote) return;

    setApproving(true);
    try {
      // Update quote status
      const { error: quoteError } = await supabase
        .from('quotes')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', quote.id);

      if (quoteError) throw quoteError;

      // Create project
      const { error: projectError } = await supabase
        .from('projects')
        .insert({
          title: `${quote.service_type} Project`,
          description: quote.scope,
          service_type: quote.service_type,
          budget: quote.price,
          status: 'planning',
          start_date: new Date().toISOString().split('T')[0],
          client_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (projectError) throw projectError;

      toast.success('Quote approved! Your project has been created.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error approving quote:', error);
      toast.error('Failed to approve quote');
    } finally {
      setApproving(false);
    }
  };

  const requestRevision = () => {
    toast.info('Revision request feature coming soon! Please contact us directly for now.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading quote...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-8">
              <h1 className="text-2xl font-bold mb-4">Quote Not Found</h1>
              <p className="text-muted-foreground mb-4">
                The quote you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate('/')}>Return Home</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">Project Quote</h1>
              <Badge className={getStatusColor(quote.status)}>
                {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Quote created on {new Date(quote.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Quote Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Quote Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Service Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Service</h3>
                  <p className="text-muted-foreground">{quote.service_type}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Total Investment</h3>
                  <p className="text-2xl font-bold text-primary">
                    {quote.currency} {quote.price.toLocaleString()}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Timeline</h3>
                  <p className="text-muted-foreground">{quote.timeline}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Client</h3>
                  <p className="text-muted-foreground">{quote.client_email}</p>
                </div>
              </div>

              <Separator />

              {/* Project Scope */}
              <div>
                <h3 className="font-semibold mb-3">Project Scope</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{quote.scope}</p>
                </div>
              </div>

              {/* Deliverables */}
              {quote.deliverables && quote.deliverables.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Deliverables</h3>
                  <ul className="space-y-2">
                    {quote.deliverables.map((deliverable, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{deliverable}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Terms & Conditions */}
              {quote.terms && (
                <div>
                  <h3 className="font-semibold mb-3">Terms & Conditions</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="whitespace-pre-wrap text-sm">{quote.terms}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {quote.status === 'sent' && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-semibold">Ready to get started?</h3>
                  <p className="text-muted-foreground">
                    Review the quote details above and choose your next step.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={approveQuote} 
                      size="lg"
                      disabled={approving}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      {approving ? 'Approving...' : 'Approve Quote'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={requestRevision}
                    >
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Request Revision
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    By approving this quote, you agree to the terms and conditions outlined above.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {quote.status === 'approved' && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="text-green-600">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-600">Quote Approved!</h3>
                  <p className="text-muted-foreground">
                    Your project has been created and our team will begin work soon.
                  </p>
                  <Button onClick={() => navigate('/dashboard')}>
                    Go to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default QuoteReview;