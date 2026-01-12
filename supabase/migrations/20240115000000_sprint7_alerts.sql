-- Create alerts table
CREATE TABLE public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
    wish_id UUID REFERENCES public.wishes(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('price', 'freight', 'delivery')),
    target_value NUMERIC NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create alert_events table
CREATE TABLE public.alert_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL REFERENCES public.alerts(id) ON DELETE CASCADE,
    offer_id UUID REFERENCES public.offers(id) ON DELETE SET NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_events ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_alerts_household_id ON public.alerts(household_id);
CREATE INDEX idx_alerts_is_active ON public.alerts(is_active);
CREATE INDEX idx_alert_events_alert_id ON public.alert_events(alert_id);

-- RLS Policies

-- Alerts: Users can manage their own household's alerts
CREATE POLICY "Users can manage alerts of their households" ON public.alerts
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.household_members hm
            WHERE hm.household_id = alerts.household_id
            AND hm.user_id = auth.uid()
        )
    );

-- Alert Events: Users can see events for their alerts
CREATE POLICY "Users can see events for their alerts" ON public.alert_events
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.alerts a
            JOIN public.household_members hm ON hm.household_id = a.household_id
            WHERE a.id = alert_events.alert_id
            AND hm.user_id = auth.uid()
        )
    );

-- Alert Events: Only Service Role/Admin can insert (Conceptual)
-- For Supabase, service role always bypasses RLS. 
-- So we just need to ensure regular users CANNOT insert.
-- We do this by NOT creating a FOR INSERT policy for authenticated users.

-- Triggers for updated_at
CREATE TRIGGER update_alerts_updated_at
    BEFORE UPDATE ON public.alerts
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
