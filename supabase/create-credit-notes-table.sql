-- Tabla para registrar notas de crédito/abonos
CREATE TABLE IF NOT EXISTS public.credit_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_request_id UUID NOT NULL REFERENCES public.return_requests(id) ON DELETE CASCADE,
  original_order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  refund_amount INTEGER NOT NULL, -- en centavos
  status TEXT DEFAULT 'pending', -- pending, processed, completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_notes_return ON public.credit_notes(return_request_id);
CREATE INDEX IF NOT EXISTS idx_credit_notes_order ON public.credit_notes(original_order_id);
CREATE INDEX IF NOT EXISTS idx_credit_notes_status ON public.credit_notes(status);

-- Habilitar RLS
ALTER TABLE public.credit_notes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Customers can read their own credit notes" ON public.credit_notes;
CREATE POLICY "Customers can read their own credit notes"
  ON public.credit_notes
  FOR SELECT
  USING (
    original_order_id IN (
      SELECT id FROM public.orders WHERE customer_id = (
        SELECT id FROM public.customers WHERE auth_user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Admins can read all credit notes" ON public.credit_notes;
CREATE POLICY "Admins can read all credit notes"
  ON public.credit_notes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid() AND is_active = true
    )
  );
