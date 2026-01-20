-- ============================================
-- CAMPAIGNS/OFFERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  popup_title VARCHAR(255),
  popup_message TEXT,
  popup_image_url TEXT,
  discount_code VARCHAR(50),
  discount_percentage INT,
  discount_amount DECIMAL(10,2),
  active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  target_audience VARCHAR(50) CHECK (target_audience IN ('new_customers', 'all_users', 'returning_customers', 'newsletter_subscribers')),
  show_popup BOOLEAN DEFAULT true,
  popup_delay_ms INT DEFAULT 2000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_active ON public.campaigns(active);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON public.campaigns(start_date, end_date);

-- RLS POLICIES
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer campañas activas
DROP POLICY IF EXISTS "Anyone can read active campaigns" ON public.campaigns;
CREATE POLICY "Anyone can read active campaigns" ON public.campaigns FOR SELECT USING (active = true AND (end_date IS NULL OR end_date > NOW()));

-- Solo admins pueden crear/actualizar (para después, cuando se sincronice con auth)
-- DROP POLICY IF EXISTS "Only admins can manage campaigns" ON public.campaigns;
-- CREATE POLICY "Only admins can manage campaigns" ON public.campaigns FOR ALL USING (auth.uid() IS NOT NULL);
