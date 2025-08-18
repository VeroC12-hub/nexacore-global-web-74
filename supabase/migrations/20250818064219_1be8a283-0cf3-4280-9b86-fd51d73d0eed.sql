-- Create payment_methods table for easy extension
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'stripe', 'paypal', 'bank_transfer', etc.
  is_active BOOLEAN NOT NULL DEFAULT true,
  configuration JSONB NOT NULL DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Admin can manage payment methods
CREATE POLICY "Admin can manage payment methods" ON public.payment_methods
FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Everyone can view active payment methods
CREATE POLICY "Active payment methods viewable" ON public.payment_methods
FOR SELECT
USING (is_active = true);

-- Update invoices table to support different payment methods
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS payment_method_id UUID REFERENCES public.payment_methods(id);

-- Insert default payment methods
INSERT INTO public.payment_methods (name, type, configuration) VALUES 
('Stripe', 'stripe', '{"supports_cards": true, "supports_subscriptions": true}'),
('PayPal', 'paypal', '{"supports_cards": true, "supports_subscriptions": false}'),
('Bank Transfer', 'bank_transfer', '{"manual_verification": true}');

-- Create admin_settings table for dashboard configuration
CREATE TABLE public.admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Admin can manage settings
CREATE POLICY "Admin can manage settings" ON public.admin_settings
FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Insert default admin settings
INSERT INTO public.admin_settings (setting_key, setting_value, description) VALUES 
('dashboard_config', '{"theme": "default", "default_currency": "USD", "invoice_prefix": "INV"}', 'Dashboard configuration'),
('notification_settings', '{"email_on_new_request": true, "email_on_payment": true}', 'Notification preferences'),
('payment_config', '{"default_method": "stripe", "auto_invoice": true}', 'Payment configuration');