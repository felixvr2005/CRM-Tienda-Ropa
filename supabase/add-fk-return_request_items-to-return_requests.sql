-- Crear la tabla return_request_items si falta, luego añadir la FK de forma segura
DO $do$
BEGIN
  -- Si no existe la tabla, crearla con esquema mínimo compatible
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'return_request_items'
  ) THEN
    RAISE NOTICE 'La tabla public.return_request_items no existe: creando tabla...';
    CREATE TABLE public.return_request_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      return_request_id UUID NOT NULL,
      product_id UUID,
      product_name VARCHAR(255) NOT NULL,
      product_sku VARCHAR(100),
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price NUMERIC(10,2) NOT NULL,
      reason VARCHAR(255),
      condition VARCHAR(50),
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_return_request_items_return ON public.return_request_items(return_request_id);
    CREATE INDEX IF NOT EXISTS idx_return_request_items_product ON public.return_request_items(product_id);

    -- Habilitar RLS y políticas (sólo si aplica)
    ALTER TABLE public.return_request_items ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Customers can read own return items" ON public.return_request_items;
    DROP POLICY IF EXISTS "Admins can read all return items" ON public.return_request_items;
    DROP POLICY IF EXISTS "Admins can manage return items" ON public.return_request_items;

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

    CREATE POLICY "Admins can read all return items"
      ON public.return_request_items
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_users au
          WHERE au.auth_user_id = auth.uid()
          AND au.is_active = true
        )
      );

    CREATE POLICY "Admins can manage return items"
      ON public.return_request_items
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_users au
          WHERE au.auth_user_id = auth.uid()
          AND au.is_active = true
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.admin_users au
          WHERE au.auth_user_id = auth.uid()
          AND au.is_active = true
        )
      );

    -- Trigger para mantener updated_at
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

  END IF;

  -- Ahora, si ambas tablas existen y no existe la FK, añadirla
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'return_request_items')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'return_requests')
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'return_request_items_return_request_id_fkey') THEN
    ALTER TABLE public.return_request_items
    ADD CONSTRAINT return_request_items_return_request_id_fkey
    FOREIGN KEY (return_request_id)
    REFERENCES public.return_requests (id)
    ON DELETE CASCADE;
  END IF;
END;
$do$;

-- Nota: Ejecutar esta migración en la instancia de producción (Supabase SQL editor o psql).