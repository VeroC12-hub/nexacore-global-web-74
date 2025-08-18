import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { CreditCard, Lock } from 'lucide-react';

interface VisaPaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: {
    id: string;
    invoice_number: string;
    total_amount: number;
    title: string;
  };
  onPaymentComplete: () => void;
}

const VisaPaymentForm: React.FC<VisaPaymentFormProps> = ({
  isOpen,
  onClose,
  invoice,
  onPaymentComplete
}) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: {
      street: '',
      city: '',
      zipCode: '',
      country: ''
    }
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'cardNumber') {
      value = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      value = formatExpiryDate(value);
    } else if (field === 'cvv') {
      value = value.replace(/[^0-9]/g, '').substring(0, 4);
    }

    if (field.startsWith('billingAddress.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateForm = () => {
    const { cardNumber, expiryDate, cvv, cardholderName } = formData;
    
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) {
      toast.error('Please enter a valid card number');
      return false;
    }
    
    if (!expiryDate || expiryDate.length < 5) {
      toast.error('Please enter a valid expiry date');
      return false;
    }
    
    if (!cvv || cvv.length < 3) {
      toast.error('Please enter a valid CVV');
      return false;
    }
    
    if (!cardholderName.trim()) {
      toast.error('Please enter the cardholder name');
      return false;
    }

    // Check if card starts with 4 (Visa)
    if (!cardNumber.startsWith('4')) {
      toast.error('Only Visa cards are accepted at this time');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would normally send the payment data to your backend
      // For now, we'll just simulate a successful payment
      toast.success('Payment processed successfully!');
      onPaymentComplete();
      onClose();
      
      // Reset form
      setFormData({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
        billingAddress: {
          street: '',
          city: '',
          zipCode: '',
          country: ''
        }
      });
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Pay with Visa
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Invoice Details */}
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Invoice #{invoice.invoice_number}</div>
              <div className="font-medium">{invoice.title}</div>
              <div className="text-2xl font-bold text-primary">${invoice.total_amount.toFixed(2)}</div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Card Number */}
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                type="text"
                placeholder="4111 1111 1111 1111"
                value={formData.cardNumber}
                onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                maxLength={19}
                className="font-mono"
                required
              />
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="text"
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  maxLength={5}
                  className="font-mono"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="text"
                  placeholder="123"
                  value={formData.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value)}
                  maxLength={4}
                  className="font-mono"
                  required
                />
              </div>
            </div>

            {/* Cardholder Name */}
            <div className="space-y-2">
              <Label htmlFor="cardholderName">Cardholder Name</Label>
              <Input
                id="cardholderName"
                type="text"
                placeholder="John Doe"
                value={formData.cardholderName}
                onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                required
              />
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Lock className="w-4 h-4 text-green-600" />
              <span className="text-sm text-muted-foreground">
                Your payment information is encrypted and secure
              </span>
            </div>

            {/* Submit Button */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? 'Processing...' : `Pay $${invoice.total_amount.toFixed(2)}`}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VisaPaymentForm;