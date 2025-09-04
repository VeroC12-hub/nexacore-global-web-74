-- Payments System Migration
-- Create comprehensive payment tracking tables

-- Payments table for tracking all payment transactions
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
  transaction_id TEXT UNIQUE,
  payment_processor TEXT, -- stripe, paypal, etc.
  processor_payment_id TEXT,
  payment_details JSONB DEFAULT '{}',
  fees DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2),
  failure_reason TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Methods configuration table
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('stripe', 'paypal', 'square', 'manual', 'bank_transfer', 'mobile_money', 'crypto', 'other')),
  is_active BOOLEAN DEFAULT true,
  api_key TEXT, -- encrypted
  webhook_secret TEXT, -- encrypted
  configuration JSONB DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Webhooks table for tracking webhook events
CREATE TABLE IF NOT EXISTS public.payment_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE,
  webhook_source TEXT NOT NULL, -- stripe, paypal, etc.
  event_type TEXT NOT NULL,
  event_id TEXT,
  raw_payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Refunds table for tracking payment refunds
CREATE TABLE IF NOT EXISTS public.payment_refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT,
  refund_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processed_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON public.payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON public.payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_payment_id ON public.payment_webhooks(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_event_id ON public.payment_webhooks(event_id);
CREATE INDEX IF NOT EXISTS idx_payment_refunds_payment_id ON public.payment_refunds(payment_id);

-- Enable RLS on payment tables
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_refunds ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments
CREATE POLICY "Clients can view their own payments" 
ON public.payments 
FOR SELECT 
USING (client_id = auth.uid());

CREATE POLICY "Admins can manage all payments" 
ON public.payments 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  )
);

-- RLS Policies for payment_methods
CREATE POLICY "Payment methods viewable by authenticated users" 
ON public.payment_methods 
FOR SELECT 
USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Admins can manage payment methods" 
ON public.payment_methods 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for webhooks (admin only)
CREATE POLICY "Admins can manage payment webhooks" 
ON public.payment_webhooks 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for refunds
CREATE POLICY "Clients can view their payment refunds" 
ON public.payment_refunds 
FOR SELECT 
USING (
  payment_id IN (
    SELECT id FROM public.payments WHERE client_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage payment refunds" 
ON public.payment_refunds 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  )
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payments_updated_at 
BEFORE UPDATE ON public.payments 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at 
BEFORE UPDATE ON public.payment_methods 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate net amount after fees
CREATE OR REPLACE FUNCTION calculate_payment_net_amount()
RETURNS TRIGGER AS $$
BEGIN
  NEW.net_amount = NEW.amount - COALESCE(NEW.fees, 0);
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_net_amount_trigger 
BEFORE INSERT OR UPDATE ON public.payments 
FOR EACH ROW EXECUTE FUNCTION calculate_payment_net_amount();

-- Insert default payment methods
INSERT INTO public.payment_methods (name, type, is_active, display_order, configuration) VALUES
('Credit/Debit Card', 'stripe', true, 1, '{"description": "Visa, Mastercard, American Express", "processing_time": "Instant", "fees": "2.9% + $0.30"}'),
('PayPal', 'paypal', true, 2, '{"description": "Pay with your PayPal account", "processing_time": "Instant", "fees": "3.49% + $0.49"}'),
('Bank Transfer', 'bank_transfer', true, 3, '{"description": "Direct bank transfer (ACH/Wire)", "processing_time": "1-3 business days", "fees": "No fees"}'),
('Mobile Money', 'mobile_money', true, 4, '{"description": "M-Pesa, MTN Mobile Money, etc.", "processing_time": "Instant", "fees": "1.5%"}'),
('Cryptocurrency', 'crypto', false, 5, '{"description": "Bitcoin, Ethereum, USDC", "processing_time": "10-30 minutes", "fees": "Network fees apply"}')
ON CONFLICT DO NOTHING;