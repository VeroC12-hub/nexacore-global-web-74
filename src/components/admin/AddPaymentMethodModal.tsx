import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Wallet, Building, Smartphone, Globe, AlertCircle, Info, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddPaymentMethodModal({ isOpen, onClose, onSuccess }: AddPaymentMethodModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    api_key: '',
    webhook_secret: '',
    configuration: '',
    fees: '',
    processing_time: '',
    description: '',
    is_enabled: true,
    // Bank transfer fields
    bank_name: '',
    account_number: '',
    routing_number: '',
    account_holder: '',
    // Mobile money fields
    mpesa_paybill: '',
    mtn_merchant_code: '',
    airtel_merchant_code: '',
    // Crypto fields
    bitcoin_address: '',
    ethereum_address: '',
    usdc_address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let configuration = {};
      if (formData.configuration) {
        try {
          configuration = JSON.parse(formData.configuration);
        } catch (error) {
          throw new Error('Invalid JSON configuration');
        }
      }

      // Build simple configuration based on payment type
      if (formData.type === 'bank_transfer') {
        configuration = {
          bank_name: formData.bank_name,
          account_number: formData.account_number,
          routing_number: formData.routing_number,
          account_holder: formData.account_holder,
          fees: formData.fees,
          processing_time: formData.processing_time,
          description: formData.description
        };
      } else if (formData.type === 'mobile_money') {
        configuration = {
          mpesa_paybill: formData.mpesa_paybill,
          mtn_merchant_code: formData.mtn_merchant_code,
          airtel_merchant_code: formData.airtel_merchant_code,
          fees: formData.fees,
          processing_time: formData.processing_time,
          description: formData.description
        };
      } else if (formData.type === 'crypto') {
        configuration = {
          bitcoin_address: formData.bitcoin_address,
          ethereum_address: formData.ethereum_address,
          usdc_address: formData.usdc_address,
          fees: formData.fees,
          processing_time: formData.processing_time,
          description: formData.description
        };
      } else {
        // For other methods, add basic configuration
        if (formData.fees) {
          configuration = { ...configuration, fees: formData.fees };
        }
        if (formData.processing_time) {
          configuration = { ...configuration, processing_time: formData.processing_time };
        }
        if (formData.description) {
          configuration = { ...configuration, description: formData.description };
        }
      }

      const { error } = await supabase
        .from('payment_methods')
        .insert({
          name: formData.name,
          type: formData.type,
          api_key: formData.api_key || null,
          webhook_secret: formData.webhook_secret || null,
          configuration,
          is_active: formData.is_enabled
        });

      if (error) throw error;

      toast.success('Payment method added successfully');
      onSuccess();
      setFormData({
        name: '',
        type: '',
        api_key: '',
        webhook_secret: '',
        configuration: '',
        fees: '',
        processing_time: '',
        description: '',
        is_enabled: true,
        // Bank transfer fields
        bank_name: '',
        account_number: '',
        routing_number: '',
        account_holder: '',
        // Mobile money fields
        mpesa_paybill: '',
        mtn_merchant_code: '',
        airtel_merchant_code: '',
        // Crypto fields
        bitcoin_address: '',
        ethereum_address: '',
        usdc_address: ''
      });
    } catch (error: any) {
      console.error('Error adding payment method:', error);
      toast.error(error.message || 'Failed to add payment method');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'card':
      case 'stripe':
      case 'square':
        return <CreditCard className="h-5 w-5" />;
      case 'paypal':
        return <Wallet className="h-5 w-5" />;
      case 'bank_transfer':
        return <Building className="h-5 w-5" />;
      case 'mobile_money':
        return <Smartphone className="h-5 w-5" />;
      case 'crypto':
        return <Globe className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getDefaultValues = (type: string) => {
    switch (type) {
      case 'card':
        return {
          fees: '2.9% + $0.30',
          processing_time: 'Instant',
          description: 'Visa, Mastercard, American Express'
        };
      case 'paypal':
        return {
          fees: '3.49% + $0.49',
          processing_time: 'Instant',
          description: 'Pay with your PayPal account'
        };
      case 'bank_transfer':
        return {
          fees: 'No fees',
          processing_time: '1-3 business days',
          description: 'Direct bank transfer (ACH/Wire)'
        };
      case 'mobile_money':
        return {
          fees: '1.5%',
          processing_time: 'Instant',
          description: 'M-Pesa, MTN Mobile Money, etc.'
        };
      case 'crypto':
        return {
          fees: 'Network fees apply',
          processing_time: '10-30 minutes',
          description: 'Bitcoin, Ethereum, USDC'
        };
      default:
        return {
          fees: 'Contact for rates',
          processing_time: 'Instant',
          description: 'Custom payment method'
        };
    }
  };

  const fillDefaultValues = () => {
    const defaults = getDefaultValues(formData.type);
    setFormData(prev => ({
      ...prev,
      fees: prev.fees || defaults.fees,
      processing_time: prev.processing_time || defaults.processing_time,
      description: prev.description || defaults.description,
      name: prev.name || formData.type.charAt(0).toUpperCase() + formData.type.slice(1).replace('_', ' ')
    }));
  };

  const getConfigurationPlaceholder = () => {
    switch (formData.type) {
      case 'card':
        return '{\n  "processor": "stripe",\n  "publishable_key": "pk_...",\n  "webhook_endpoint": "https://...",\n  "supported_cards": ["visa", "mastercard", "amex"]\n}';
      case 'stripe':
        return '{\n  "publishable_key": "pk_...",\n  "webhook_endpoint": "https://..."\n}';
      case 'paypal':
        return '{\n  "client_id": "...",\n  "sandbox": false,\n  "webhook_id": "..."\n}';
      case 'square':
        return '{\n  "application_id": "...",\n  "location_id": "...",\n  "environment": "production"\n}';
      case 'bank_transfer':
        return '{\n  "bank_name": "Your Bank Name",\n  "account_number": "****1234",\n  "routing_number": "021000021",\n  "account_holder": "NexaCore Innovations"\n}';
      case 'mobile_money':
        return '{\n  "providers": ["mpesa", "mtn", "airtel"],\n  "merchant_code": "...",\n  "callback_url": "https://..."\n}';
      case 'crypto':
        return '{\n  "supported_currencies": ["BTC", "ETH", "USDC"],\n  "wallet_addresses": {\n    "BTC": "bc1...",\n    "ETH": "0x...",\n    "USDC": "0x..."\n  }\n}';
      default:
        return '{\n  "custom_field": "value"\n}';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-600" />
            Add Payment Method
          </DialogTitle>
          <DialogDescription>
            Configure a new payment method for your clients. All API keys are encrypted and securely stored.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {formData.type && getPaymentIcon(formData.type)}
                Basic Configuration
              </CardTitle>
              <CardDescription>
                Set up the basic information for your payment method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Payment Method Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => {
                      handleInputChange('type', value);
                      // Auto-fill defaults when type changes
                      setTimeout(() => fillDefaultValues(), 100);
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Credit/Debit Card
                        </div>
                      </SelectItem>
                      <SelectItem value="paypal">
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4" />
                          PayPal
                        </div>
                      </SelectItem>
                      <SelectItem value="bank_transfer">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Bank Transfer
                        </div>
                      </SelectItem>
                      <SelectItem value="mobile_money">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          Mobile Money
                        </div>
                      </SelectItem>
                      <SelectItem value="crypto">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Cryptocurrency
                        </div>
                      </SelectItem>
                      <SelectItem value="stripe">Stripe (Legacy)</SelectItem>
                      <SelectItem value="square">Square (Legacy)</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Credit Card, PayPal, Bank Transfer"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description for clients"
                />
                <p className="text-xs text-muted-foreground">
                  This will be shown to clients when selecting payment methods
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fees">Fees</Label>
                  <Input
                    id="fees"
                    value={formData.fees}
                    onChange={(e) => handleInputChange('fees', e.target.value)}
                    placeholder="e.g., 2.9% + $0.30, No fees"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="processing_time">Processing Time</Label>
                  <Input
                    id="processing_time"
                    value={formData.processing_time}
                    onChange={(e) => handleInputChange('processing_time', e.target.value)}
                    placeholder="e.g., Instant, 1-3 business days"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Enable Payment Method</Label>
                  <p className="text-xs text-muted-foreground">
                    Clients will be able to use this payment method when enabled
                  </p>
                </div>
                <Switch
                  checked={formData.is_enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_enabled: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Specific Fields */}
          {formData.type && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {getPaymentIcon(formData.type)}
                  {formData.type === 'bank_transfer' && 'Your Bank Details'}
                  {formData.type === 'mobile_money' && 'Your Mobile Money Details'}
                  {formData.type === 'crypto' && 'Your Crypto Wallet Addresses'}
                  {!['bank_transfer', 'mobile_money', 'crypto'].includes(formData.type) && 'API Configuration'}
                </CardTitle>
                <CardDescription>
                  {formData.type === 'bank_transfer' && 'Enter your business bank account details that clients will pay to'}
                  {formData.type === 'mobile_money' && 'Enter your registered merchant/paybill numbers'}
                  {formData.type === 'crypto' && 'Enter your cryptocurrency wallet addresses'}
                  {!['bank_transfer', 'mobile_money', 'crypto'].includes(formData.type) && 'Configure API keys and settings'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Bank Transfer Fields */}
                {formData.type === 'bank_transfer' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank_name">Bank Name</Label>
                      <Input
                        id="bank_name"
                        value={formData.bank_name}
                        onChange={(e) => handleInputChange('bank_name', e.target.value)}
                        placeholder="e.g., Wells Fargo"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account_holder">Account Holder Name</Label>
                      <Input
                        id="account_holder"
                        value={formData.account_holder}
                        onChange={(e) => handleInputChange('account_holder', e.target.value)}
                        placeholder="e.g., NexaCore Innovations LLC"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account_number">Account Number</Label>
                      <Input
                        id="account_number"
                        value={formData.account_number}
                        onChange={(e) => handleInputChange('account_number', e.target.value)}
                        placeholder="1234567890"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="routing_number">Routing Number</Label>
                      <Input
                        id="routing_number"
                        value={formData.routing_number}
                        onChange={(e) => handleInputChange('routing_number', e.target.value)}
                        placeholder="021000021"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Mobile Money Fields */}
                {formData.type === 'mobile_money' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mpesa_paybill">M-Pesa Paybill Number</Label>
                      <Input
                        id="mpesa_paybill"
                        value={formData.mpesa_paybill}
                        onChange={(e) => handleInputChange('mpesa_paybill', e.target.value)}
                        placeholder="174379"
                      />
                      <p className="text-xs text-muted-foreground">Leave empty if not using M-Pesa</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mtn_merchant_code">MTN Mobile Money</Label>
                      <Input
                        id="mtn_merchant_code"
                        value={formData.mtn_merchant_code}
                        onChange={(e) => handleInputChange('mtn_merchant_code', e.target.value)}
                        placeholder="987654"
                      />
                      <p className="text-xs text-muted-foreground">Leave empty if not using MTN</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="airtel_merchant_code">Airtel Money</Label>
                      <Input
                        id="airtel_merchant_code"
                        value={formData.airtel_merchant_code}
                        onChange={(e) => handleInputChange('airtel_merchant_code', e.target.value)}
                        placeholder="456123"
                      />
                      <p className="text-xs text-muted-foreground">Leave empty if not using Airtel</p>
                    </div>
                  </div>
                )}

                {/* Crypto Fields */}
                {formData.type === 'crypto' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bitcoin_address">Bitcoin (BTC) Address</Label>
                      <Input
                        id="bitcoin_address"
                        value={formData.bitcoin_address}
                        onChange={(e) => handleInputChange('bitcoin_address', e.target.value)}
                        placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ethereum_address">Ethereum (ETH) Address</Label>
                      <Input
                        id="ethereum_address"
                        value={formData.ethereum_address}
                        onChange={(e) => handleInputChange('ethereum_address', e.target.value)}
                        placeholder="0x742E5B3e9c6Ad70f42A8F5EcE79B43c0A1BfaE1f"
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="usdc_address">USDC Address</Label>
                      <Input
                        id="usdc_address"
                        value={formData.usdc_address}
                        onChange={(e) => handleInputChange('usdc_address', e.target.value)}
                        placeholder="0x742E5B3e9c6Ad70f42A8F5EcE79B43c0A1BfaE1f"
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">Usually same as ETH address</p>
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          )}

          {/* Advanced Configuration - Only for API methods */}
          {formData.type && ['card', 'stripe', 'paypal', 'square'].includes(formData.type) && (
            <Card>
            <CardHeader className="cursor-pointer" onClick={() => setShowAdvanced(!showAdvanced)}>
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-orange-600" />
                  Advanced Configuration
                  <Badge variant="secondary">Optional</Badge>
                </div>
                <Button variant="ghost" type="button" size="sm">
                  {showAdvanced ? 'Hide' : 'Show'} Advanced
                </Button>
              </CardTitle>
              <CardDescription>
                API keys, webhooks, and detailed settings for payment processors
              </CardDescription>
            </CardHeader>
            {showAdvanced && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="api_key" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      API Key
                    </Label>
                    <Input
                      id="api_key"
                      type="password"
                      value={formData.api_key}
                      onChange={(e) => handleInputChange('api_key', e.target.value)}
                      placeholder="Enter your payment processor API key"
                    />
                    <p className="text-xs text-muted-foreground">
                      Encrypted and securely stored. Required for automated processing.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhook_secret" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Webhook Secret
                    </Label>
                    <Input
                      id="webhook_secret"
                      type="password"
                      value={formData.webhook_secret}
                      onChange={(e) => handleInputChange('webhook_secret', e.target.value)}
                      placeholder="Webhook verification secret"
                    />
                    <p className="text-xs text-muted-foreground">
                      Used to verify webhook authenticity from payment processor.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="configuration" className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    JSON Configuration
                  </Label>
                  <Textarea
                    id="configuration"
                    value={formData.configuration}
                    onChange={(e) => handleInputChange('configuration', e.target.value)}
                    placeholder={getConfigurationPlaceholder()}
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-800 dark:text-blue-300">
                      <p className="font-medium mb-1">Configuration Examples:</p>
                      <p>• Include processor-specific settings like environment (sandbox/production)</p>
                      <p>• Add supported currencies, wallet addresses, or merchant codes</p>
                      <p>• Configure callback URLs and confirmation requirements</p>
                      <p>• All fields are optional and depend on your payment processor</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Lock className="h-3 w-3" />
              All sensitive data is encrypted
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Adding...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {formData.type && getPaymentIcon(formData.type)}
                    Add Payment Method
                  </div>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}