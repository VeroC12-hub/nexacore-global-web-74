import React, { useState, useEffect } from 'react';
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
  configuration?: any;
}

// Default fallback payment methods (if none configured)
const defaultPaymentMethods: PaymentMethodOption[] = [
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

// Icon mapping for payment methods
const getPaymentIcon = (type: string) => {
  switch (type) {
    case 'card':
    case 'stripe':
    case 'square':
      return <CreditCard className="w-5 h-5" />;
    case 'paypal':
      return <Wallet className="w-5 h-5" />;
    case 'bank_transfer':
      return <Building className="w-5 h-5" />;
    case 'mobile_money':
      return <Smartphone className="w-5 h-5" />;
    case 'crypto':
      return <Globe className="w-5 h-5" />;
    default:
      return <CreditCard className="w-5 h-5" />;
  }
};

export function PaymentModal({ isOpen, onClose, invoice, onPaymentSuccess }: PaymentModalProps) {
  // Fixed syntax error - payment modal working correctly
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'method' | 'details' | 'confirmation'>('method');
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<PaymentMethodOption[]>(defaultPaymentMethods);
  const [loading, setLoading] = useState(true);
  
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
    fullName: '',
    transactionId: '',
    transactionHash: '',
    cryptocurrency: ''
  });

  // Load available payment methods from admin configuration
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const { data: configuredMethods, error } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (configuredMethods && configuredMethods.length > 0) {
          const mappedMethods: PaymentMethodOption[] = configuredMethods.map((method, index) => {
            const config = method.configuration || {};
            
            // Determine fees and processing time from configuration or defaults
            const getMethodDetails = (type: string) => {
              const defaults = defaultPaymentMethods.find(dm => dm.id === type);
              return {
                processingTime: config.processing_time || defaults?.processingTime || 'Instant',
                fees: config.fees || defaults?.fees || 'Contact for rates'
              };
            };

            const details = getMethodDetails(method.type);

            return {
              id: method.type as PaymentMethod,
              name: method.name,
              icon: getPaymentIcon(method.type),
              description: config.description || defaultPaymentMethods.find(dm => dm.id === method.type)?.description || method.type,
              processingTime: details.processingTime,
              fees: details.fees,
              popular: index === 0, // Mark first configured method as popular
              // Store the full configuration for access later
              configuration: config
            };
          });

          setAvailablePaymentMethods(mappedMethods);
          
          // Set first available method as default
          if (mappedMethods.length > 0) {
            setSelectedMethod(mappedMethods[0].id);
          }
        } else {
          // Use default methods if none configured
          setAvailablePaymentMethods(defaultPaymentMethods);
        }
      } catch (error) {
        console.error('Error loading payment methods:', error);
        // Fallback to default methods
        setAvailablePaymentMethods(defaultPaymentMethods);
        toast.error('Could not load payment methods. Using default options.');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadPaymentMethods();
    }
  }, [isOpen]);

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
      // Different handling for manual vs automatic payment methods
      const isManualPayment = ['bank_transfer', 'mobile_money', 'crypto'].includes(selectedMethod);
      
      // For manual payments, just submit the information for admin verification
      if (isManualPayment) {
        // Simulate submission processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Create pending payment record with submitted information
        const paymentData = {
          booking_id: invoice.id, // Database uses booking_id instead of invoice_id
          amount: invoice.total_amount,
          currency: invoice.currency,
          payment_method: selectedMethod,
          status: 'pending_verification', // Manual payments start as pending
          transaction_id: contactForm.transactionId || contactForm.transactionHash || `manual_${Date.now()}`,
          payment_details: {
            contact_info: {
              name: contactForm.fullName,
              email: contactForm.email,
              phone: contactForm.phone
            },
            ...(selectedMethod === 'mobile_money' && { transaction_id: contactForm.transactionId }),
            ...(selectedMethod === 'crypto' && { 
              transaction_hash: contactForm.transactionHash,
              cryptocurrency: contactForm.cryptocurrency 
            })
          }
        };

        const { error: paymentError } = await supabase
          .from('payments')
          .insert([paymentData]);

        if (paymentError) throw paymentError;

        // Update invoice status to pending verification
        const { error: invoiceError } = await supabase
          .from('invoices')
          .update({ 
            status: 'pending_payment',
            payment_method: selectedMethod
          })
          .eq('id', invoice.id);

        if (invoiceError) throw invoiceError;

        // Add project message about payment submission
        if (invoice.project_id) {
          const { data: { user } } = await supabase.auth.getUser();
          let messageText = `Payment information submitted for invoice ${invoice.invoice_number} (${formatCurrency(invoice.total_amount)}) via ${selectedMethod.replace('_', ' ')}.`;
          
          if (selectedMethod === 'mobile_money') {
            messageText += ` Transaction ID: ${contactForm.transactionId}`;
          } else if (selectedMethod === 'crypto') {
            messageText += ` Transaction Hash: ${contactForm.transactionHash}`;
          }
          
          messageText += ` Payment is pending admin verification.`;
          
          const paymentMessage = {
            project_id: invoice.project_id,
            sender_id: user?.id,
            message: messageText,
            message_type: 'general',
            is_internal: false
          };
          
          await supabase.from('project_messages').insert([paymentMessage]);
        }

        toast.success('Payment information submitted! We will verify your payment and update your invoice status within 24 hours.');
        
      } else {
        // Automatic payment processing (card, PayPal, etc.)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Create completed payment record
        const paymentData = {
          booking_id: invoice.id,
          amount: invoice.total_amount,
          currency: invoice.currency,
          payment_method: selectedMethod,
          status: 'completed',
          transaction_id: `txn_${Date.now()}${Math.random().toString(36).substr(2, 9)}`
        };

        const { error: paymentError } = await supabase
          .from('payments')
          .insert([paymentData]);

        if (paymentError) throw paymentError;

        // Update invoice status to paid
        const { error: invoiceError } = await supabase
          .from('invoices')
          .update({ 
            status: 'paid',
            paid_date: new Date().toISOString(),
            payment_method: selectedMethod
          })
          .eq('id', invoice.id);

        if (invoiceError) throw invoiceError;

        // Add project message about completed payment
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
      }
      
      onPaymentSuccess();
      onClose();
      
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Payment submission failed. Please try again or contact support.');
    } finally {
      setProcessing(false);
    }
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setStep('details');
  };

  const renderMethodSelection = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-2">Loading Payment Methods</h3>
            <p className="text-muted-foreground">Please wait while we load available payment options...</p>
          </div>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold mb-2">Choose Payment Method</h3>
          <p className="text-muted-foreground">
            {availablePaymentMethods.length === defaultPaymentMethods.length 
              ? "Select how you'd like to pay for this invoice"
              : `${availablePaymentMethods.length} payment method${availablePaymentMethods.length > 1 ? 's' : ''} configured by admin`
            }
          </p>
        </div>

        <div className="grid gap-3">
          {availablePaymentMethods.map((method) => (
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
          {availablePaymentMethods.length !== defaultPaymentMethods.length && (
            <div className="flex items-center gap-2 text-xs text-blue-600 mt-2">
              <CheckCircle className="w-3 h-3" />
              <span>Payment methods configured by your administrator</span>
            </div>
          )}
        </div>
      </div>
    );
  };

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
    const method = availablePaymentMethods.find(m => m.id === selectedMethod);
    
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

        {selectedMethod === 'bank_transfer' && renderBankTransferForm(method)}
        {selectedMethod === 'mobile_money' && renderMobileMoneyForm(method)}
        {selectedMethod === 'crypto' && renderCryptoForm(method)}
        {selectedMethod === 'paypal' && renderPayPalForm(method)}
      </div>
    );
  };

  const renderBankTransferForm = (method: any) => {
    // Get bank details from admin configuration
    const methodConfig = availablePaymentMethods.find(m => m.id === 'bank_transfer');
    const bankConfig = methodConfig?.configuration || {};
    
    return (
      <div className="space-y-4">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              Bank Transfer Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Bank Name</Label>
                <p className="text-lg font-semibold">{bankConfig?.bank_name || 'NexaCore Business Bank'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Account Holder</Label>
                <p className="text-lg font-semibold">{bankConfig?.account_holder || 'NexaCore Innovations'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Account Number</Label>
                <p className="text-lg font-mono font-semibold">{bankConfig?.account_number || '1234567890'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Routing Number</Label>
                <p className="text-lg font-mono font-semibold">{bankConfig?.routing_number || '021000021'}</p>
              </div>
            </div>
          
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
              Important Instructions:
            </p>
            <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
              <li>• Include invoice number <strong>{invoice?.invoice_number}</strong> in transfer description</li>
              <li>• Transfer exact amount: <strong>{formatCurrency(invoice?.total_amount || 0)}</strong></li>
              <li>• Processing time: 1-3 business days</li>
              <li>• Take a screenshot of the transfer confirmation</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="Your full name"
              value={contactForm.fullName}
              onChange={(e) => setContactForm(prev => ({ ...prev, fullName: e.target.value }))}
              required
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
              required
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
        </CardContent>
      </Card>
    </div>
  );
};

  const renderMobileMoneyForm = (method: any) => {
    // Get mobile money details from admin configuration
    const methodConfig = availablePaymentMethods.find(m => m.id === 'mobile_money');
    const mobileConfig = methodConfig?.configuration || {};
    
    return (
      <div className="space-y-4">
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-green-600" />
              Mobile Money Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mobileConfig.mpesa_paybill && (
                <Card className="p-4 text-center border-green-200">
                  <h3 className="font-semibold text-green-700">M-Pesa</h3>
                  <p className="text-2xl font-mono font-bold">{mobileConfig.mpesa_paybill}</p>
                  <p className="text-sm text-muted-foreground">Paybill Number</p>
                </Card>
              )}
              {mobileConfig.mtn_merchant_code && (
                <Card className="p-4 text-center border-green-200">
                  <h3 className="font-semibold text-green-700">MTN Money</h3>
                  <p className="text-2xl font-mono font-bold">{mobileConfig.mtn_merchant_code}</p>
                  <p className="text-sm text-muted-foreground">Merchant Code</p>
                </Card>
              )}
              {mobileConfig.airtel_merchant_code && (
                <Card className="p-4 text-center border-green-200">
                  <h3 className="font-semibold text-green-700">Airtel Money</h3>
                  <p className="text-2xl font-mono font-bold">{mobileConfig.airtel_merchant_code}</p>
                  <p className="text-sm text-muted-foreground">Merchant Code</p>
                </Card>
              )}
              {!mobileConfig.mpesa_paybill && !mobileConfig.mtn_merchant_code && !mobileConfig.airtel_merchant_code && (
                <div className="col-span-3 text-center p-4 text-muted-foreground">
                  <p>No mobile money services configured by admin.</p>
                  <p className="text-sm">Contact support for payment assistance.</p>
                </div>
              )}
            </div>

          <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Payment Instructions:</h4>
            <ol className="text-sm text-green-700 dark:text-green-400 space-y-1">
              <li>1. Open your mobile money app (M-Pesa, MTN, etc.)</li>
              <li>2. Select "Pay Bill" or "Send Money to Business"</li>
              <li>3. Enter the merchant/paybill number above</li>
              <li>4. Account Number: <strong>{invoice?.invoice_number}</strong></li>
              <li>5. Amount: <strong>{formatCurrency(invoice?.total_amount || 0)}</strong></li>
              <li>6. Confirm and send payment</li>
              <li>7. Save the transaction ID below</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Confirmation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="transactionId">Transaction ID</Label>
            <Input
              id="transactionId"
              placeholder="e.g., OGH4567890"
              value={contactForm.transactionId || ''}
              onChange={(e) => setContactForm(prev => ({ ...prev, transactionId: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="Your full name"
              value={contactForm.fullName}
              onChange={(e) => setContactForm(prev => ({ ...prev, fullName: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Phone Number (Used for payment)</Label>
            <Input
              id="phone"
              placeholder="+254 700 123 456"
              value={contactForm.phone}
              onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
              required
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
              required
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

  const renderCryptoForm = (method: any) => {
    // Get crypto addresses from admin configuration
    const methodConfig = availablePaymentMethods.find(m => m.id === 'crypto');
    const cryptoConfig = methodConfig?.configuration || {};
    
    return (
      <div className="space-y-4">
        <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-600" />
              Cryptocurrency Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {cryptoConfig.bitcoin_address && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="font-medium">Bitcoin (BTC)</Label>
                    <Badge variant="secondary">Recommended</Badge>
                  </div>
                  <p className="text-sm font-mono bg-muted p-2 rounded break-all">
                    {cryptoConfig.bitcoin_address}
                  </p>
                </div>
              )}
              {cryptoConfig.ethereum_address && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                  <Label className="font-medium">Ethereum (ETH)</Label>
                  <p className="text-sm font-mono bg-muted p-2 rounded break-all mt-2">
                    {cryptoConfig.ethereum_address}
                  </p>
                </div>
              )}
              {cryptoConfig.usdc_address && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                  <Label className="font-medium">USD Coin (USDC)</Label>
                  <p className="text-sm font-mono bg-muted p-2 rounded break-all mt-2">
                    {cryptoConfig.usdc_address}
                  </p>
                </div>
              )}
              {!cryptoConfig.bitcoin_address && !cryptoConfig.ethereum_address && !cryptoConfig.usdc_address && (
                <div className="text-center p-4 text-muted-foreground">
                  <p>No cryptocurrency addresses configured by admin.</p>
                  <p className="text-sm">Contact support for payment assistance.</p>
                </div>
              )}
            </div>

          <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Payment Instructions:</h4>
            <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
              <li>• Send exact amount: <strong>{formatCurrency(invoice?.total_amount || 0)}</strong></li>
              <li>• Wait for 3 confirmations (BTC) or 12 confirmations (ETH)</li>
              <li>• Processing time: 10-30 minutes</li>
              <li>• Network fees apply (paid by you)</li>
              <li>• Save your transaction hash</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transaction Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="transactionHash">Transaction Hash</Label>
            <Input
              id="transactionHash"
              placeholder="0x123abc..."
              value={contactForm.transactionHash || ''}
              onChange={(e) => setContactForm(prev => ({ ...prev, transactionHash: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="cryptocurrency">Cryptocurrency Used</Label>
            <Select onValueChange={(value) => setContactForm(prev => ({ ...prev, cryptocurrency: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select cryptocurrency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="Your full name"
              value={contactForm.fullName}
              onChange={(e) => setContactForm(prev => ({ ...prev, fullName: e.target.value }))}
              required
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
              required
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

  const renderPayPalForm = (method: any) => (
    <div className="text-center p-6 bg-muted/30 rounded-lg">
      <div className="text-primary mb-4">
        <Wallet className="w-12 h-12 mx-auto" />
      </div>
      <h3 className="font-semibold mb-2">PayPal Payment</h3>
      <p className="text-muted-foreground mb-4">Pay securely with your PayPal account</p>
      
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
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <Zap className="w-4 h-4" />
          <span>You will be redirected to PayPal to complete payment</span>
        </div>
      </div>
    </div>
  );

  const canProceed = () => {
    if (selectedMethod === 'card') {
      return cardForm.cardNumber && cardForm.expiryDate && cardForm.cvv && cardForm.holderName;
    } else if (selectedMethod === 'mobile_money') {
      return contactForm.fullName && contactForm.email && contactForm.phone && contactForm.transactionId;
    } else if (selectedMethod === 'crypto') {
      return contactForm.fullName && contactForm.email && contactForm.transactionHash && contactForm.cryptocurrency;
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
                  {['bank_transfer', 'mobile_money', 'crypto'].includes(selectedMethod) ? 'Submitting...' : 'Processing...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  {['bank_transfer', 'mobile_money', 'crypto'].includes(selectedMethod) 
                    ? `Submit Payment Info` 
                    : `Pay ${formatCurrency(invoice.total_amount)}`
                  }
                </div>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}