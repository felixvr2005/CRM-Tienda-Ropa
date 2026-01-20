# 🔧 FIX RLS POLÍTICAS - variant_images

## ⚠️ PROBLEMA IDENTIFICADO

Error: `permission denied for table users`

Las tablas `variant_images` no tiene políticas RLS configuradas correctamente.

---

## ✅ SOLUCIÓN

He creado el archivo: `supabase/fix-variant-images-rls.sql`

### Pasos para ejecutar:

1. **Abre Supabase Dashboard:**
   - Ve a: https://supabase.com/dashboard
   - Selecciona tu proyecto

2. **Abre SQL Editor:**
   - Click en "SQL Editor" (izquierda)
   - Click en "New Query"

3. **Copia y pega TODO este código:**

```sql
-- =====================
-- TABLA: variant_images
-- =====================
ALTER TABLE variant_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Variant images are viewable by everyone" ON variant_images;
DROP POLICY IF EXISTS "Variant images can be inserted" ON variant_images;
DROP POLICY IF EXISTS "Variant images can be updated" ON variant_images;
DROP POLICY IF EXISTS "Variant images can be deleted" ON variant_images;

CREATE POLICY "Variant images are viewable by everyone" 
ON variant_images FOR SELECT USING (true);

CREATE POLICY "Variant images can be inserted" 
ON variant_images FOR INSERT WITH CHECK (true);

CREATE POLICY "Variant images can be updated" 
ON variant_images FOR UPDATE USING (true);

CREATE POLICY "Variant images can be deleted" 
ON variant_images FOR DELETE USING (true);
```

4. **Ejecuta la query:**
   - Click en el botón ▶️ "Run" (o Ctrl+Enter)

5. **Verifica que se ejecutó sin errores:**
   - Deberías ver "Success" en verde

---

## 🚀 Después de ejecutar:

Vuelve al navegador y prueba:
- ✅ Cargar imágenes
- ✅ Eliminar imágenes
- ✅ Marcar como principal

**Debería funcionar ahora.**

---

## 📝 ¿Qué hace este código?

1. Activa RLS en `variant_images`
2. Crea 4 políticas:
   - SELECT: Cualquiera puede verlas
   - INSERT: Cualquiera puede insertar
   - UPDATE: Cualquiera puede actualizar
   - DELETE: Cualquiera puede eliminar

Esto permite que el panel funcione correctamente.

---

**Estado:** ⏳ Esperando que ejecutes el SQL en Supabase
