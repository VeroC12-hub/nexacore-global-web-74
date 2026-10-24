import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info, Mail, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Shown instead of a payment form until a real payment provider is connected.
// The earlier forms either faked a successful card payment or showed
// placeholder bank details, so clients could believe they had paid, or send
// money to the wrong account. This one only tells the truth and lets the
// client ask the team for payment details.

const BILLING_EMAIL = 'projects@nexacore-innovations.com';

interface PaymentInstructionsInvoice {
  id: string;
  invoice_number: string;
  title?: string;
  total_amount: number;
  currency?: string;
  project_id?: string | null;
}

interface PaymentInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: PaymentInstructionsInvoice | null;
  /** Kept for drop-in compatibility with the old payment modals; never called */
  onPaymentSuccess?: () => void;
}

export function PaymentInstructionsModal({ isOpen, onClose, invoice }: PaymentInstructionsModalProps) {
  const [sending, setSending] = useState(false);

  if (!invoice) return null;

  const amount = `${invoice.currency || 'USD'} ${Number(invoice.total_amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  const request = `Please send me payment details for invoice ${invoice.invoice_number} (${amount}).`;
  const mailto = `mailto:${BILLING_EMAIL}?subject=${encodeURIComponent(
    `Payment for invoice ${invoice.invoice_number}`
  )}&body=${encodeURIComponent(request)}`;

  const askTeam = async () => {
    if (!invoice.project_id) {
      window.location.href = mailto;
      return;
    }
    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('project_messages').insert([{
        project_id: invoice.project_id,
        sender_id: user?.id,
        message: request,
        message_type: 'general',
        is_internal: false,
      }]);
      if (error) throw error;
      toast.success('Request sent. The team will reply with payment details.');
      onClose();
    } catch (error) {
      console.error('Error requesting payment details:', error);
      toast.error('Could not send the request. Please email us instead.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pay invoice {invoice.invoice_number}</DialogTitle>
          <DialogDescription>{invoice.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border p-4 text-center">
            <p className="text-sm text-muted-foreground">Amount due</p>
            <p className="text-2xl font-bold">{amount}</p>
          </div>

          <div className="flex gap-3 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
            <Info className="h-5 w-5 flex-shrink-0" />
            <p>
              Online payment is not available yet. Ask our team for payment details and quote
              invoice number <strong>{invoice.invoice_number}</strong> when you pay. Your invoice
              is marked paid once we confirm receipt.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="flex-1" onClick={askTeam} disabled={sending}>
              <MessageSquare className="mr-2 h-4 w-4" />
              {sending ? 'Sending...' : 'Ask for payment details'}
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <a href={mailto}>
                <Mail className="mr-2 h-4 w-4" />
                Email us
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
