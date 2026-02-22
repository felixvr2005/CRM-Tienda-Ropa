-- Tabla de facturas persistentes
-- Se crea un registro al completar cada pago (webhook Stripe)
-- Numeración secuencial fiscal: FAC-YYYY-NNNNN

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  subtotal INTEGER NOT NULL DEFAULT 0,       -- céntimos
  shipping_cost INTEGER NOT NULL DEFAULT 0,  -- céntimos
  discount_amount INTEGER NOT NULL DEFAULT 0,-- céntimos
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 21.00,
  tax_amount INTEGER NOT NULL DEFAULT 0,     -- céntimos (IVA)
  total_amount INTEGER NOT NULL DEFAULT 0,   -- céntimos
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'paid', 'cancelled')),
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON public.invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON public.invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON public.invoices(invoice_number);

-- Trigger para updated_at
CREATE OR REPLACE TRIGGER set_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_public_read_own" ON public.invoices
  FOR SELECT USING (
    customer_id IN (
      SELECT id FROM public.customers WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "invoices_admin_all" ON public.invoices
  FOR ALL USING (
    auth.uid() IN (SELECT auth_user_id FROM public.admin_users WHERE is_active = true)
  );

-- Función para generar el siguiente número de factura secuencial
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  current_year TEXT;
  next_seq INTEGER;
BEGIN
  current_year := to_char(now(), 'YYYY');
  SELECT COALESCE(MAX(
    CAST(split_part(invoice_number, '-', 3) AS INTEGER)
  ), 0) + 1
  INTO next_seq
  FROM public.invoices
  WHERE invoice_number LIKE 'FAC-' || current_year || '-%';

  RETURN 'FAC-' || current_year || '-' || lpad(next_seq::TEXT, 5, '0');
END;
$$;
