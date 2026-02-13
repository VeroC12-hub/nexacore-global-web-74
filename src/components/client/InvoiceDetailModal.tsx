// src/components/client/InvoiceDetailModal.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  FileText,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Printer,
  Mail,
  CreditCard,
  Package,
  Receipt,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { generateInvoicePDF } from '@/utils/invoicePDFGenerator';

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

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Project {
  id: string;
  title: string;
  service_type: string;
}

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (invoiceId: string) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onDownload,
}) => {
  const [loading, setLoading] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [project, setProject] = useState<Project | null>(null);

  // Load additional invoice data when invoice changes
  useEffect(() => {
    if (invoice) {
      loadInvoiceDetails();
    }
  }, [invoice]);

  const loadInvoiceDetails = async () => {
    if (!invoice) return;

    setLoading(true);
    try {
      // Load line items if they exist in a separate table
      // For now, we'll parse from description or generate from amount
      // In a real scenario, you'd have an invoice_line_items table
      const items = parseLineItemsFromDescription(invoice.description);
      setLineItems(items);

      // Load related project if project_id exists
      if (invoice.project_id) {
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('id, title, service_type')
          .eq('id', invoice.project_id)
          .single();

        if (!projectError && projectData) {
          setProject(projectData);
        }
      }
    } catch (error) {
      console.error('Error loading invoice details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to parse line items from description
  // In a real app, line items would be in a separate table
  const parseLineItemsFromDescription = (description: string): LineItem[] => {
    // For now, create a single line item from the invoice amount
    // In production, you'd fetch from invoice_line_items table
    return [
      {
        id: '1',
        description: description || invoice?.title || 'Service',
        quantity: 1,
        unit_price: invoice?.amount || 0,
        total: invoice?.amount || 0,
      }
    ];
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'overdue':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'overdue':
        return AlertCircle;
      default:
        return FileText;
    }
  };

  const handlePrint = async () => {
    if (!invoice) return;
    try {
      toast.info('Preparing print document...');
      const url = await generateInvoicePDF(
        {
          ...invoice,
          project_title: project?.title,
          service_type: project?.service_type,
        },
        lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
        })),
        'print'
      );

      if (url && typeof url === 'string') {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error generating print document:', error);
      toast.error('Failed to prepare document for printing');
    }
  };

  const handleEmail = () => {
    toast.info('Email functionality coming soon!');
    // TODO: Implement email invoice functionality
  };

  const handleDownload = async () => {
    if (!invoice) return;
    try {
      toast.info('Generating PDF...');
      await generateInvoicePDF(
        {
          ...invoice,
          project_title: project?.title,
          service_type: project?.service_type,
        },
        lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
        })),
      );
      toast.success('Invoice PDF downloaded!');
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  if (!invoice) return null;

  const StatusIcon = getStatusIcon(invoice.status);
  const subtotal = invoice.amount;
  const tax = invoice.tax_amount;
  const total = invoice.total_amount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">Invoice Details</DialogTitle>
              <DialogDescription className="mt-1">
                #{invoice.invoice_number}
              </DialogDescription>
            </div>
            <Badge className={cn('ml-4', getStatusColor(invoice.status))}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {invoice.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invoice Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Issue Date</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(invoice.created_at), 'PPP')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Due Date</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(invoice.due_date), 'PPP')}
                    </p>
                  </div>
                </div>

                {invoice.paid_date && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Paid Date</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(invoice.paid_date), 'PPP')}
                      </p>
                    </div>
                  </div>
                )}

                {invoice.payment_method && (
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Payment Method</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {invoice.payment_method}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {project && (
                <div className="pt-4 border-t">
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Related Project</p>
                      <p className="text-sm text-muted-foreground">{project.title}</p>
                      <Badge variant="outline" className="mt-1">
                        {project.service_type}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} × {invoice.currency}{item.unit_price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {invoice.currency}{item.total.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{invoice.currency}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{invoice.currency}{tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{invoice.currency}{total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          {invoice.status === 'paid' && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900">Payment Received</p>
                    <p className="text-sm text-green-700">
                      Thank you for your payment! This invoice has been fully paid.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {invoice.status === 'overdue' && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-900">Payment Overdue</p>
                    <p className="text-sm text-red-700">
                      This invoice is past its due date. Please make payment as soon as possible.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4">
            <Button onClick={handleDownload} className="flex-1 sm:flex-initial">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={handlePrint} variant="outline" className="flex-1 sm:flex-initial">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleEmail} variant="outline" className="flex-1 sm:flex-initial">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            {invoice.status !== 'paid' && (
              <Button variant="default" className="flex-1 sm:flex-initial">
                <CreditCard className="w-4 h-4 mr-2" />
                Pay Now
              </Button>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
