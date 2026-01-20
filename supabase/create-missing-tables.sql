-- ============================================
-- CREATE NEWSLETTER SUBSCRIBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  discount_code VARCHAR(50),
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_code ON public.newsletter_subscribers(discount_code);

-- ============================================
-- CREATE RETURN REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.return_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'label_sent', 'in_return', 'received', 'refunded', 'rejected')),
  reason TEXT,
  return_label_url TEXT,
  return_tracking_number VARCHAR(100),
  received_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  refund_amount DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_return_requests_order ON public.return_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_customer ON public.return_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_status ON public.return_requests(status);

-- ============================================
-- RLS POLICIES FOR NEWSLETTER SUBSCRIBERS
-- ============================================
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede insertar (para suscribirse)
DROP POLICY IF EXISTS "Allow public to subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Allow public to subscribe to newsletter"
  ON public.newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

-- Solo autenticados pueden leer sus propias suscripciones
DROP POLICY IF EXISTS "Users can read their own newsletter subscription" ON public.newsletter_subscribers;
CREATE POLICY "Users can read their own newsletter subscription"
  ON public.newsletter_subscribers
  FOR SELECT
  USING (auth.email() = email);

-- ============================================
-- RLS POLICIES FOR RETURN REQUESTS
-- ============================================
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;

-- Clientes pueden crear solicitudes de devolución
DROP POLICY IF EXISTS "Customers can create return requests" ON public.return_requests;
CREATE POLICY "Customers can create return requests"
  ON public.return_requests
  FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Clientes pueden ver sus propias solicitudes
DROP POLICY IF EXISTS "Customers can read their own return requests" ON public.return_requests;
CREATE POLICY "Customers can read their own return requests"
  ON public.return_requests
  FOR SELECT
  USING (auth.uid() = customer_id);

-- Admins pueden ver todas las solicitudes (si existiera tabla admin)
DROP POLICY IF EXISTS "Admins can read all return requests" ON public.return_requests;
CREATE POLICY "Admins can read all return requests"
  ON public.return_requests
  FOR SELECT
  USING (auth.role() = 'authenticated');
