-- Fix RLS para return_requests - permitir a admins ver todas las devoluciones
-- Problema: La política actual solo valida auth.role() = 'authenticated' que es cualquier usuario

-- Desabilitar RLS temporalmente para la tabla
ALTER TABLE public.return_requests DISABLE ROW LEVEL SECURITY;

-- Limpiar todas las políticas existentes
DROP POLICY IF EXISTS "Customers can create return requests" ON public.return_requests;
DROP POLICY IF EXISTS "Customers can read their own return requests" ON public.return_requests;
DROP POLICY IF EXISTS "Customers can update their own return requests" ON public.return_requests;
DROP POLICY IF EXISTS "Admins can read all return requests" ON public.return_requests;
DROP POLICY IF EXISTS "Admins can update all return requests" ON public.return_requests;
DROP POLICY IF EXISTS "Admins can delete return requests" ON public.return_requests;

-- Volver a habilitar RLS
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;

-- 1. Clientes pueden crear solicitudes de devolución
CREATE POLICY "Customers can create return requests"
  ON public.return_requests
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = customer_id
      AND c.auth_user_id = auth.uid()
    )
  );

-- 2. Clientes pueden ver sus propias solicitudes
CREATE POLICY "Customers can read their own return requests"
  ON public.return_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = customer_id
      AND c.auth_user_id = auth.uid()
    )
  );

-- 3. Clientes pueden actualizar sus solicitudes (no cambiar estado críticos)
CREATE POLICY "Customers can update their own return requests"
  ON public.return_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = customer_id
      AND c.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = customer_id
      AND c.auth_user_id = auth.uid()
    )
  );

-- 4. Admins pueden LEER todas las solicitudes
CREATE POLICY "Admins can read all return requests"
  ON public.return_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE auth_user_id = auth.uid() 
      AND is_active = true
    )
  );

-- 5. Admins pueden ACTUALIZAR todas las solicitudes (cambiar estado, agregar notas, etc)
CREATE POLICY "Admins can update all return requests"
  ON public.return_requests
  FOR UPDATE
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

-- 6. Admins pueden ELIMINAR solicitudes
CREATE POLICY "Admins can delete return requests"
  ON public.return_requests
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE auth_user_id = auth.uid() 
      AND is_active = true
    )
  );

-- Igual para return_request_items (solo si la tabla existe)
-- Nota: La tabla debe ser creada primero con create-return-request-items-table.sql

-- Solo ejecutar esto si ya existe la tabla
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'return_request_items') THEN
    
    ALTER TABLE public.return_request_items DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Customers can read own return items" ON public.return_request_items;
    DROP POLICY IF EXISTS "Admins can manage return items" ON public.return_request_items;
    DROP POLICY IF EXISTS "Admins can read all return items" ON public.return_request_items;

    ALTER TABLE public.return_request_items ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Customers can read own return items"
      ON public.return_request_items
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.return_requests rr
          JOIN public.customers c ON c.id = rr.customer_id
          WHERE rr.id = return_request_id
          AND c.auth_user_id = auth.uid()
        )
      );

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
  END IF;
END $$;
