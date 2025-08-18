-- Create quote_requests table
CREATE TABLE public.quote_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  country TEXT,
  service_type TEXT NOT NULL,
  tier TEXT,
  description TEXT NOT NULL,
  budget_estimate NUMERIC,
  timeline TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quotes table
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_request_id UUID REFERENCES public.quote_requests(id),
  client_email TEXT NOT NULL,
  service_type TEXT NOT NULL,
  scope TEXT NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  timeline TEXT NOT NULL,
  deliverables JSONB DEFAULT '[]',
  terms TEXT,
  status TEXT DEFAULT 'draft',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id),
  recipient_id UUID REFERENCES public.profiles(id),
  project_id UUID REFERENCES public.projects(id),
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  message_type TEXT DEFAULT 'general',
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Quote requests policies
CREATE POLICY "Anyone can create quote requests" 
ON public.quote_requests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Staff can manage all quote requests" 
ON public.quote_requests 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY(ARRAY['admin', 'staff', 'project_manager'])
));

CREATE POLICY "Users can view their own quote requests" 
ON public.quote_requests 
FOR SELECT 
USING (email = (SELECT email FROM profiles WHERE id = auth.uid()));

-- Quotes policies
CREATE POLICY "Staff can manage all quotes" 
ON public.quotes 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY(ARRAY['admin', 'staff', 'project_manager'])
));

CREATE POLICY "Clients can view their quotes" 
ON public.quotes 
FOR SELECT 
USING (client_email = (SELECT email FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Clients can update quote status" 
ON public.quotes 
FOR UPDATE 
USING (client_email = (SELECT email FROM profiles WHERE id = auth.uid()))
WITH CHECK (client_email = (SELECT email FROM profiles WHERE id = auth.uid()));

-- Messages policies
CREATE POLICY "Users can view their messages" 
ON public.messages 
FOR SELECT 
USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their messages" 
ON public.messages 
FOR UPDATE 
USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Add triggers for updated_at
CREATE TRIGGER update_quote_requests_updated_at
  BEFORE UPDATE ON public.quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();