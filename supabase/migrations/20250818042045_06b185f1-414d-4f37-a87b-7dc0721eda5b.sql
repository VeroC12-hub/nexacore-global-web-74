-- Fix RLS issues for existing tables

-- Enable RLS on existing tables that don't have it
ALTER TABLE public.approval_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_drive_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_drive_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_packages ENABLE ROW LEVEL SECURITY;

-- Add basic RLS policies for these tables
-- Categories (public read, admin write)
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin can manage categories" ON public.categories FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Events (public read, organizers write)
CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Organizers can manage events" ON public.events FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'organizer')));

-- Venues (public read, admin write)
CREATE POLICY "Venues are viewable by everyone" ON public.venues FOR SELECT USING (true);
CREATE POLICY "Admin can manage venues" ON public.venues FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- User profiles (users can read all, update their own)
CREATE POLICY "User profiles are viewable by everyone" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admin can manage all profiles" ON public.user_profiles FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Users table (users can read all, update their own)
CREATE POLICY "Users are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update their own data" ON public.users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admin can manage all users" ON public.users FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- User settings (users manage their own)
CREATE POLICY "Users can manage their own settings" ON public.user_settings FOR ALL USING (user_id = auth.uid());

-- Bookings (users see their own, organizers see all)
CREATE POLICY "Users can view their own bookings" ON public.bookings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Organizers can manage all bookings" ON public.bookings FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'organizer')));

-- Payments (users see their own, admin sees all)
CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT USING (booking_id IN (SELECT id FROM public.bookings WHERE user_id = auth.uid()));
CREATE POLICY "Admin can manage all payments" ON public.payments FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Payment transactions (users see their own, admin sees all)
CREATE POLICY "Users can view their own transactions" ON public.payment_transactions FOR SELECT USING (booking_id IN (SELECT id FROM public.bookings WHERE user_id = auth.uid()));
CREATE POLICY "Admin can manage all transactions" ON public.payment_transactions FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Reviews (public read, users can create their own)
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admin can manage all reviews" ON public.reviews FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Notifications (users see their own)
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Event analytics (admin only)
CREATE POLICY "Admin can manage event analytics" ON public.event_analytics FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Event media (public read, organizers write)
CREATE POLICY "Event media is viewable by everyone" ON public.event_media FOR SELECT USING (true);
CREATE POLICY "Organizers can manage event media" ON public.event_media FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'organizer')));

-- VIP packages (public read, organizers write)
CREATE POLICY "VIP packages are viewable by everyone" ON public.vip_packages FOR SELECT USING (true);
CREATE POLICY "Organizers can manage VIP packages" ON public.vip_packages FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'organizer')));

-- Google Drive tokens (users manage their own)
CREATE POLICY "Users can manage their own tokens" ON public.google_drive_tokens FOR ALL USING (user_id = auth.uid());

-- Google Drive folders (organizers only)
CREATE POLICY "Organizers can manage folders" ON public.google_drive_folders FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'organizer')));

-- Approval queue (admin only)
CREATE POLICY "Admin can manage approval queue" ON public.approval_queue FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Storage analytics (admin only)
CREATE POLICY "Admin can view storage analytics" ON public.storage_analytics FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- System settings (admin only)
CREATE POLICY "Admin can manage system settings" ON public.system_settings FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));