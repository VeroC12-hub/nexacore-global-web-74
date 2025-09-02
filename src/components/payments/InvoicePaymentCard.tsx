import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  DollarSign, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileText,
  CreditCard,
  Download,
  Eye,
  ArrowRight
} from 'lucide-react';
import { PaymentModal } from './PaymentModal';

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
}

interface InvoicePaymentCardProps {
  invoice: Invoice;
  onPaymentSuccess: () => void;
  className?: string;
}

export function InvoicePaymentCard({ invoice, onPaymentSuccess, className = '' }: InvoicePaymentCardProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'sent':
        return <Clock className="w-4 h-4" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const isOverdue = () => {
    if (invoice.status === 'paid') return false;
    return new Date(invoice.due_date) < new Date();
  };

  const getDaysUntilDue = () => {
    const dueDate = new Date(invoice.due_date);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderPaymentStatus = () => {
    if (invoice.status === 'paid') {
      return (
        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
          <CheckCircle className="w-4 h-4" />
          <span className="font-medium">Paid</span>
          {invoice.paid_date && (
            <span className="text-sm text-muted-foreground">
              on {new Date(invoice.paid_date).toLocaleDateString()}
            </span>
          )}
        </div>
      );
    }

    if (isOverdue()) {
      const daysOverdue = Math.abs(getDaysUntilDue());
      return (
        <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-medium">
            Overdue by {daysOverdue} day{daysOverdue !== 1 ? 's' : ''}
          </span>
        </div>
      );
    }

    const daysUntilDue = getDaysUntilDue();
    if (daysUntilDue <= 3) {
      return (
        <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
          <Clock className="w-4 h-4" />
          <span className="font-medium">
            Due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''}
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
        <Calendar className="w-4 h-4" />
        <span className="font-medium">
          Due {new Date(invoice.due_date).toLocaleDateString()}
        </span>
      </div>
    );
  };

  return (
    <>
      <Card className={`hover:shadow-lg transition-all duration-200 ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {invoice.invoice_number}
              </CardTitle>
              <p className="text-muted-foreground text-sm mt-1">{invoice.title}</p>
            </div>
            <Badge className={getStatusColor(invoice.status)}>
              <div className="flex items-center gap-1">
                {getStatusIcon(invoice.status)}
                {invoice.status}
              </div>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Amount Details */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">{formatCurrency(invoice.amount)}</span>
            </div>
            
            {invoice.tax_amount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">{formatCurrency(invoice.tax_amount)}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-xl text-primary">
                {formatCurrency(invoice.total_amount)}
              </span>
            </div>
          </div>

          {/* Payment Status */}
          <div className="p-3 rounded-lg bg-muted/30">
            {renderPaymentStatus()}
          </div>

          {/* Description */}
          {invoice.description && (
            <div>
              <p className="text-sm text-muted-foreground">{invoice.description}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            {invoice.status !== 'paid' && (
              <Button 
                onClick={() => setShowPaymentModal(true)}
                className="flex-1 flex items-center justify-center gap-2"
                size="lg"
              >
                <CreditCard className="w-4 h-4" />
                Pay Now
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            
            <Button variant="outline" size="lg" className="flex items-center justify-center gap-2">
              <Eye className="w-4 h-4" />
              View Details
            </Button>
            
            <Button variant="outline" size="lg" className="flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>

          {/* Mobile-friendly urgency indicators */}
          {isOverdue() && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <AlertTriangle className="w-5 h-5" />
                <div>
                  <p className="font-medium">Payment Overdue</p>
                  <p className="text-sm">Please pay immediately to avoid late fees</p>
                </div>
              </div>
            </div>
          )}
          
          {getDaysUntilDue() <= 3 && getDaysUntilDue() > 0 && (
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                <Clock className="w-5 h-5" />
                <div>
                  <p className="font-medium">Payment Due Soon</p>
                  <p className="text-sm">Due in {getDaysUntilDue()} day{getDaysUntilDue() !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        invoice={invoice}
        onPaymentSuccess={() => {
          setShowPaymentModal(false);
          onPaymentSuccess();
        }}
      />
    </>
  );
}