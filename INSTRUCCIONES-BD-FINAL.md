# 🔧 INSTRUCCIONES - QUÉ EJECUTAR EN SUPABASE

## 📋 SQL a EJECUTAR

### Paso 1: Abre Supabase
```
https://app.supabase.com
- Selecciona tu proyecto: CRM Tienda Ropa
- Ve a SQL Editor
```

### Paso 2: Copia TODO esto y PEGA en SQL Editor

```sql
-- =====================================================
-- TABLA: credit_notes (Notas de Crédito/Abonos)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.credit_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_request_id UUID NOT NULL REFERENCES public.return_requests(id) ON DELETE CASCADE,
  original_order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  refund_amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_credit_notes_return ON public.credit_notes(return_request_id);
CREATE INDEX IF NOT EXISTS idx_credit_notes_order ON public.credit_notes(original_order_id);
CREATE INDEX IF NOT EXISTS idx_credit_notes_status ON public.credit_notes(status);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.credit_notes ENABLE ROW LEVEL SECURITY;

-- POLÍTICA 1: Clientes ven solo sus propias notas
DROP POLICY IF EXISTS "Customers can read their own credit notes" ON public.credit_notes;
CREATE POLICY "Customers can read their own credit notes"
  ON public.credit_notes
  FOR SELECT
  USING (
    original_order_id IN (
      SELECT id FROM public.orders 
      WHERE customer_id = (
        SELECT id FROM public.customers 
        WHERE auth_user_id = auth.uid()
      )
    )
  );

-- POLÍTICA 2: Admins ven todas las notas
DROP POLICY IF EXISTS "Admins can read all credit notes" ON public.credit_notes;
CREATE POLICY "Admins can read all credit notes"
  ON public.credit_notes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE auth_user_id = auth.uid() 
      AND is_active = true
    )
  );
```

### Paso 3: EJECUTA (Cmd + Enter o Ctrl + Enter)
```
Click en botón "RUN" o presiona Ctrl+Enter
```

### Paso 4: Verifica que se creó correctamente
```sql
-- Ejecuta esto para verificar
SELECT * FROM public.credit_notes LIMIT 1;
```

**Resultado esperado**: Tabla creada sin errores ✅

---

## ✅ VERIFICACIÓN

Después de ejecutar, deberías ver:
```
✅ public.credit_notes created
✅ 3 indexes created
✅ RLS enabled
✅ 2 policies created
```

---

## 🚀 DESPUÉS DE EJECUTAR SQL

### 1. Testing Manual
```bash
cd "c:\Users\Felix\Desktop\CRM-Tienda Ropa"
npm run dev
```

Luego abre: `http://localhost:3000`

### 2. Verifica Cada Feature

#### Feature 1: Live Search
```
1. Ve a header
2. Busca "camiseta"
3. Deberías ver resultados
✅ Si funciona: PASS
```

#### Feature 2: Size Recommender
```
1. Abre cualquier producto
2. Click "¿Qué talla me queda?"
3. Ingresa: Altura 175, Peso 70
4. Deberías ver: "M - Mediano"
✅ Si funciona: PASS
```

#### Feature 3: Coupon Input
```
1. Agrega producto al carrito
2. Ve a /carrito
3. Ingresa código de cupón
✅ Si funciona: PASS (si tienes cupones en BD)
```

#### Feature 4: Invoice Download
```
1. Ve a /cuenta/pedidos
2. Abre un pedido
3. Click "Descargar Factura"
4. Se descarga PDF
✅ Si funciona: PASS
```

#### Feature 5: Credit Note Download
```
1. Ve a /cuenta/devoluciones
2. Abre una devolución (si hay)
3. Click "Descargar Nota de Crédito"
4. Se descarga PDF
✅ Si funciona: PASS
```

---

## 📊 CHECKLIST FINAL

- [ ] SQL ejecutado en Supabase
- [ ] Tabla credit_notes creada
- [ ] Índices creados
- [ ] RLS habilitado
- [ ] Políticas creadas
- [ ] npm run dev funciona
- [ ] Live Search funciona
- [ ] Size Recommender funciona
- [ ] Coupon Input funciona
- [ ] Invoice PDF funciona
- [ ] Credit Note PDF funciona

---

## ⚠️ POSIBLES PROBLEMAS

### Problema: "Error en SQL - Foreign key"
```
Solución: Verifica que existan estas tablas:
- public.return_requests
- public.orders
- public.customers
- public.admin_users

Ejecuta:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Problema: "Credit Note no descarga"
```
Solución:
1. Verifica que la tabla fue creada: SELECT * FROM credit_notes;
2. Crea una devolución de prueba
3. Intenta descargar nuevamente
```

### Problema: "RLS error - acceso denegado"
```
Solución:
1. Verifica tu usuario sea customer o admin
2. Revisa que las políticas estén correctas
3. Ve a Supabase → Table Editor → credit_notes → RLS
```

---

## 🎯 QUÉ MÁS FALTA

Después de SQL, solo falta:
1. ✅ Testing manual de cada feature
2. ✅ Verificar que PDFs se descargan correctamente
3. ✅ Confirmar que live search busca bien
4. ✅ Validar que cupones se aplican

**TODO lo demás ya está hecho y compilado** ✅

---

## 📞 RESUMEN QUICK

| Paso | Qué Hacer | Status |
|------|-----------|--------|
| 1 | Copiar SQL | ⬇️ Arriba |
| 2 | Pegar en Supabase | Manual |
| 3 | Ejecutar (Ctrl+Enter) | Manual |
| 4 | npm run dev | Terminal |
| 5 | Testear features | Manual |

---

**Después de hacer esto, el proyecto estará 100% COMPLETO y FUNCIONAL** 🎉
