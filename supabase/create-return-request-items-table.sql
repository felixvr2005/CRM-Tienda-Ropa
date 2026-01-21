-- Crear tabla return_request_items si no existe
CREATE TABLE IF NOT EXISTS public.return_request_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_request_id UUID NOT NULL REFERENCES public.return_requests(id) ON DELETE CASCADE,
  product_id UUID,
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(100),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  reason VARCHAR(255),
  condition VARCHAR(50), -- 'new', 'like_new', 'good', 'fair', 'poor'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_return_request_items_return ON public.return_request_items(return_request_id);
CREATE INDEX IF NOT EXISTS idx_return_request_items_product ON public.return_request_items(product_id);

-- Habilitar RLS
ALTER TABLE public.return_request_items ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Customers can read own return items" ON public.return_request_items;
DROP POLICY IF EXISTS "Admins can read all return items" ON public.return_request_items;
DROP POLICY IF EXISTS "Admins can manage return items" ON public.return_request_items;

-- Clientes pueden ver sus propios items de devolución
CREATE POLICY "Customers can read own return items"
  ON public.return_request_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.return_requests rr
      WHERE rr.id = return_request_id
      AND rr.customer_id = auth.uid()
    )
  );

-- Admins pueden ver todos los items de devolución
CREATE POLICY "Admins can read all return items"
  ON public.return_request_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE auth_user_id = auth.uid() 
      AND is_active = true
    )
  );

-- Admins pueden gestionar todos los items de devolución
CREATE POLICY "Admins can manage return items"
  ON public.return_request_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE auth_user_id = auth.uid() 
      AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE auth_user_id = auth.uid() 
      AND is_active = true
    )
  );

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_return_request_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_return_request_items_updated_at ON public.return_request_items;
CREATE TRIGGER update_return_request_items_updated_at
  BEFORE UPDATE ON public.return_request_items
  FOR EACH ROW
  EXECUTE FUNCTION update_return_request_items_updated_at();
