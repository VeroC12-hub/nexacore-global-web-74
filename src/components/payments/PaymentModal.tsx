import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  CreditCard, 
  DollarSign, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Smartphone,
  Wallet,
  Lock,
  Calendar,
  User,
  Building,
  Phone,
  Mail,
  Globe,
  ArrowLeft,
  ExternalLink,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Invoice {
  id: string;
  invoice_number: string;
  title: string;
  description: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  due_date: string;
  project_id?: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onPaymentSuccess: () => void;
}

type PaymentMethod = 'card' | 'paypal' | 'bank_transfer' | 'mobile_money' | 'crypto';

interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  icon: React.ReactNode;
  description: string;
  processingTime: string;
  fees: string;
  popular?: boolean;
}

const paymentMethods: PaymentMethodOption[] = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: <CreditCard className="w-5 h-5" />,
    description: 'Visa, Mastercard, American Express',
    processingTime: 'Instant',
    fees: '2.9% + $0.30',
    popular: true
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: <Wallet className="w-5 h-5" />,
    description: 'Pay with your PayPal account',
    processingTime: 'Instant',
    fees: '3.49% + $0.49'
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    icon: <Building className="w-5 h-5" />,
    description: 'Direct bank transfer (ACH/Wire)',
    processingTime: '1-3 business days',
    fees: 'No fees'
  },
  {
    id: 'mobile_money',
    name: 'Mobile Money',
    icon: <Smartphone className="w-5 h-5" />,
    description: 'M-Pesa, MTN Mobile Money, etc.',
    processingTime: 'Instant',
    fees: '1.5%'
  },
  {
    id: 'crypto',
    name: 'Cryptocurrency',
    icon: <Globe className="w-5 h-5" />,
    description: 'Bitcoin, Ethereum, USDC',
    processingTime: '10-30 minutes',
    fees: 'Network fees apply'
  }
];

export function PaymentModal({ isOpen, onClose, invoice, onPaymentSuccess }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'method' | 'details' | 'confirmation'>('method');
  
  // Card payment form
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    holderName: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    }
  });

  // Contact form for other payment methods
  const [contactForm, setContactForm] = useState({
    email: '',
    phone: '',
    fullName: ''
  });

  if (!invoice) return null;

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const handlePaymentSubmit = async () => {
    setProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create payment record
      const paymentData = {
        invoice_id: invoice.id,
        amount: invoice.total_amount,
        currency: invoice.currency,
        payment_method: selectedMethod,
        status: 'completed',
        transaction_id: `txn_${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
        payment_details: {
          method: selectedMethod,
          last_four: selectedMethod === 'card' ? cardForm.cardNumber.slice(-4) : null,
          contact_info: selectedMethod !== 'card' ? contactForm : null
        },
        created_at: new Date().toISOString()
      };

      const { error: paymentError } = await supabase
        .from('payments')
        .insert([paymentData]);

      if (paymentError) throw paymentError;

      // Update invoice status
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({ 
          status: 'paid',
          paid_date: new Date().toISOString(),
          payment_method: selectedMethod
        })
        .eq('id', invoice.id);

      if (invoiceError) throw invoiceError;

      // Add project message about payment
      if (invoice.project_id) {
        const { data: { user } } = await supabase.auth.getUser();
        const paymentMessage = {
          project_id: invoice.project_id,
          sender_id: user?.id,
          message: `Payment received! Invoice ${invoice.invoice_number} has been paid (${formatCurrency(invoice.total_amount)}). Thank you for your payment. Project work will now continue as scheduled.`,
          message_type: 'general',
          is_internal: false
        };
        
        await supabase.from('project_messages').insert([paymentMessage]);
      }

      toast.success('Payment successful! Thank you for your payment.');
      onPaymentSuccess();
      onClose();
      
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again or contact support.');
    } finally {
      setProcessing(false);
    }
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setStep('details');
  };

  const renderMethodSelection = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Choose Payment Method</h3>
        <p className="text-muted-foreground">Select how you'd like to pay for this invoice</p>
      </div>

      <div className="grid gap-3">
        {paymentMethods.map((method) => (
          <Card 
            key={method.id}
            className="cursor-pointer hover:shadow-md transition-all duration-200 border-2 hover:border-primary/20"
            onClick={() => handleMethodSelect(method.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-primary">{method.icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{method.name}</p>
                      {method.popular && (
                        <Badge variant="secondary" className="text-xs">Popular</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p className="text-muted-foreground">{method.processingTime}</p>
                  <p className="text-xs text-muted-foreground">{method.fees}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>All payments are secured with 256-bit SSL encryption</span>
        </div>
      </div>
    </div>
  );

  const renderCardForm = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setStep('method')}
          className="p-0 h-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to payment methods
        </Button>
        <Badge variant="outline" className="flex items-center gap-1">
          <CreditCard className="w-3 h-3" />
          Credit/Debit Card
        </Badge>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="cardNumber">Card Number</Label>
          <Input
            id="cardNumber"
            placeholder="1234 5678 9012 3456"
            value={cardForm.cardNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
              setCardForm(prev => ({ ...prev, cardNumber: value }));
            }}
            maxLength={19}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expiry">Expiry Date</Label>
            <Input
              id="expiry"
              placeholder="MM/YY"
              value={cardForm.expiryDate}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/, '$1/');
                setCardForm(prev => ({ ...prev, expiryDate: value }));
              }}
              maxLength={5}
            />
          </div>
          <div>
            <Label htmlFor="cvv">CVV</Label>
            <Input
              id="cvv"
              placeholder="123"
              value={cardForm.cvv}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setCardForm(prev => ({ ...prev, cvv: value }));
              }}
              maxLength={4}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="holderName">Cardholder Name</Label>
          <Input
            id="holderName"
            placeholder="John Doe"
            value={cardForm.holderName}
            onChange={(e) => setCardForm(prev => ({ ...prev, holderName: e.target.value }))}
          />
        </div>

        <Separator />
        
        <div className="space-y-3">
          <h4 className="font-medium">Billing Address</h4>
          
          <div>
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              placeholder="123 Main Street"
              value={cardForm.billingAddress.street}
              onChange={(e) => setCardForm(prev => ({ 
                ...prev, 
                billingAddress: { ...prev.billingAddress, street: e.target.value }
              }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="New York"
                value={cardForm.billingAddress.city}
                onChange={(e) => setCardForm(prev => ({ 
                  ...prev, 
                  billingAddress: { ...prev.billingAddress, city: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="NY"
                value={cardForm.billingAddress.state}
                onChange={(e) => setCardForm(prev => ({ 
                  ...prev, 
                  billingAddress: { ...prev.billingAddress, state: e.target.value }
                }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                placeholder="10001"
                value={cardForm.billingAddress.zipCode}
                onChange={(e) => setCardForm(prev => ({ 
                  ...prev, 
                  billingAddress: { ...prev.billingAddress, zipCode: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Select 
                value={cardForm.billingAddress.country} 
                onValueChange={(value) => setCardForm(prev => ({ 
                  ...prev, 
                  billingAddress: { ...prev.billingAddress, country: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="GB">United Kingdom</SelectItem>
                  <SelectItem value="GH">Ghana</SelectItem>
                  <SelectItem value="NG">Nigeria</SelectItem>
                  <SelectItem value="KE">Kenya</SelectItem>
                  <SelectItem value="ZA">South Africa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAlternativePaymentForm = () => {
    const method = paymentMethods.find(m => m.id === selectedMethod);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep('method')}
            className="p-0 h-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to payment methods
          </Button>
          <Badge variant="outline" className="flex items-center gap-1">
            {method?.icon}
            {method?.name}
          </Badge>
        </div>

        <div className="text-center p-6 bg-muted/30 rounded-lg">
          <div className="text-primary mb-4">
            {method?.icon}
          </div>
          <h3 className="font-semibold mb-2">{method?.name} Payment</h3>
          <p className="text-muted-foreground mb-4">{method?.description}</p>
          
          <div className="space-y-3 max-w-sm mx-auto">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Your full name"
                value={contactForm.fullName}
                onChange={(e) => setContactForm(prev => ({ ...prev, fullName: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={contactForm.email}
                onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+1 (555) 123-4567"
                value={contactForm.phone}
                onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Zap className="w-4 h-4" />
              <span>
                {selectedMethod === 'paypal' && 'You will be redirected to PayPal to complete payment'}
                {selectedMethod === 'bank_transfer' && 'Bank transfer details will be sent to your email'}
                {selectedMethod === 'mobile_money' && 'Mobile money payment instructions will be sent via SMS'}
                {selectedMethod === 'crypto' && 'Cryptocurrency wallet address will be provided'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const canProceed = () => {
    if (selectedMethod === 'card') {
      return cardForm.cardNumber && cardForm.expiryDate && cardForm.cvv && cardForm.holderName;
    } else {
      return contactForm.fullName && contactForm.email;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Make Payment
          </DialogTitle>
          <DialogDescription>
            Complete payment for invoice {invoice.invoice_number}
          </DialogDescription>
        </DialogHeader>

        {/* Invoice Summary */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{invoice.title}</span>
                <span className="font-bold">{formatCurrency(invoice.amount)}</span>
              </div>
              {invoice.tax_amount > 0 && (
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Tax</span>
                  <span>{formatCurrency(invoice.tax_amount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between items-center font-semibold">
                <span>Total Amount</span>
                <span className="text-lg">{formatCurrency(invoice.total_amount)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Due: {new Date(invoice.due_date).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <div className="min-h-[400px]">
          {step === 'method' && renderMethodSelection()}
          {step === 'details' && selectedMethod === 'card' && renderCardForm()}
          {step === 'details' && selectedMethod !== 'card' && renderAlternativePaymentForm()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={processing}>
            Cancel
          </Button>
          {step === 'details' && (
            <Button
              onClick={handlePaymentSubmit}
              disabled={!canProceed() || processing}
              className="min-w-[120px]"
            >
              {processing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Pay {formatCurrency(invoice.total_amount)}
                </div>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}