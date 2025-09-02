import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  DollarSign, 
  ArrowLeft, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Building,
  CreditCard,
  Smartphone,
  Zap
} from 'lucide-react';
import { PaymentModal } from '@/components/payments/PaymentModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Invoice {
  id: string;
  invoice_number: string;
  title: string;
  description: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  status: string;
  due_date: string;
  paid_date?: string;
  payment_method?: string;
  created_at: string;
  project_id?: string;
  client_id: string;
  profiles?: {
    full_name: string;
    email: string;
  };
  projects?: {
    title: string;
  };
}

const PayInvoice: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (invoiceId) {
      loadInvoice();
    }
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          profiles (full_name, email),
          projects (title)
        `)
        .eq('id', invoiceId)
        .single();

      if (error) throw error;
      
      if (!data) {
        toast.error('Invoice not found');
        navigate('/');
        return;
      }

      setInvoice(data);
    } catch (error) {
      console.error('Error loading invoice:', error);
      toast.error('Failed to load invoice');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getDaysUntilDue = () => {
    if (!invoice) return 0;
    const dueDate = new Date(invoice.due_date);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isOverdue = () => {
    if (!invoice || invoice.status === 'paid') return false;
    return getDaysUntilDue() < 0;
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    loadInvoice(); // Reload to show updated status
    toast.success('Payment successful! Thank you for your payment.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="text-center p-8">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Invoice Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The requested invoice could not be found or you don't have access to it.
            </p>
            <Button onClick={() => navigate('/')}>
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Mobile-First Header */}
      <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/client-portal')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="text-center">
              <h1 className="font-semibold">Payment</h1>
              <p className="text-xs text-muted-foreground">{invoice.invoice_number}</p>
            </div>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Payment Status Banner */}
        {invoice.status === 'paid' ? (
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200">
                    Payment Completed
                  </h3>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    {invoice.paid_date && `Paid on ${new Date(invoice.paid_date).toLocaleDateString()}`}
                    {invoice.payment_method && ` via ${invoice.payment_method}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : isOverdue() ? (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-200">
                    Payment Overdue
                  </h3>
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    This invoice was due {Math.abs(getDaysUntilDue())} days ago
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : getDaysUntilDue() <= 3 ? (
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-orange-800 dark:text-orange-200">
                    Payment Due Soon
                  </h3>
                  <p className="text-orange-700 dark:text-orange-300 text-sm">
                    Due in {getDaysUntilDue()} day{getDaysUntilDue() !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{invoice.invoice_number}</CardTitle>
                <p className="text-muted-foreground text-sm mt-1">{invoice.title}</p>
              </div>
              <Badge 
                className={
                  invoice.status === 'paid' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : isOverdue() 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                }
              >
                {invoice.status === 'paid' ? 'Paid' : isOverdue() ? 'Overdue' : 'Due'}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Client and Project Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Bill To</p>
                <p className="font-medium">{invoice.profiles?.full_name}</p>
                <p className="text-muted-foreground">{invoice.profiles?.email}</p>
              </div>
              {invoice.projects && (
                <div>
                  <p className="text-muted-foreground">Project</p>
                  <p className="font-medium">{invoice.projects.title}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Amount Breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Amount</span>
                <span className="font-medium">{formatCurrency(invoice.amount)}</span>
              </div>
              
              {invoice.tax_amount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(invoice.tax_amount)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Due</span>
                <span className="text-primary">{formatCurrency(invoice.total_amount)}</span>
              </div>
            </div>

            {/* Due Date */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span>Due Date</span>
                <span className="font-medium">
                  {new Date(invoice.due_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Description */}
            {invoice.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Description</p>
                <p className="text-sm">{invoice.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Action */}
        {invoice.status !== 'paid' && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-primary mb-4">
                  <CreditCard className="w-6 h-6" />
                  <h3 className="text-lg font-semibold">Ready to Pay?</h3>
                </div>
                
                <p className="text-muted-foreground text-sm mb-6">
                  Choose from multiple secure payment options including cards, PayPal, bank transfer, and mobile money.
                </p>

                <Button 
                  onClick={() => setShowPaymentModal(true)}
                  size="lg"
                  className="w-full text-lg py-6"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Pay {formatCurrency(invoice.total_amount)} Now
                </Button>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
                  <Shield className="w-4 h-4" />
                  <span>Secured with 256-bit SSL encryption</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mobile Payment Options Preview */}
        {invoice.status !== 'paid' && (
          <Card className="lg:hidden">
            <CardContent className="p-6">
              <h4 className="font-medium mb-4 text-center">Payment Methods Available</h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <CreditCard className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-xs font-medium">Cards</p>
                  <p className="text-xs text-muted-foreground">Instant</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <Smartphone className="w-6 h-6 mx-auto mb-2 text-green-600" />
                  <p className="text-xs font-medium">Mobile Money</p>
                  <p className="text-xs text-muted-foreground">Instant</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <Building className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <p className="text-xs font-medium">PayPal</p>
                  <p className="text-xs text-muted-foreground">Instant</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <Building className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <p className="text-xs font-medium">Bank Transfer</p>
                  <p className="text-xs text-muted-foreground">1-3 days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        invoice={invoice}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default PayInvoice;