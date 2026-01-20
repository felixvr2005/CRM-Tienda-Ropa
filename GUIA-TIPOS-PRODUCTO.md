# 🎯 GUÍA: Sistema de Tipos de Producto + Variantes con Imágenes

## ¿Qué se ha creado?

Un sistema completo que permite:
- **Asignar un tipo a cada producto** (Camiseta, Pantalón, Zapato, etc.)
- **Cada tipo define sus propias tallas** (Camiseta: S,M,L / Zapato: 35-46)
- **Múltiples imágenes por variante de color** (3-10 fotos de la camiseta roja)
- **Reordenar imágenes** con drag-and-drop
- **Marcar una como principal** (estrella)
- **Gestionar toda la galería** en el admin

## Archivos Creados/Modificados

```
✅ supabase/product-types-migration.sql      [SQL - 150+ líneas]
   └─ Define tablas product_types, variant_images, funciones

✅ src/components/islands/VariantImagesUploader.tsx  [React - 350+ líneas]
   └─ Componente de carga y gestión de imágenes por variante

✅ src/pages/admin/productos/create-edit.astro  [Astro - 300+ líneas]
   └─ Formulario mejorado con selector de tipo de producto

✅ src/pages/api/admin/products/save.ts        [API - 50 líneas]
   └─ Endpoint para crear/editar productos

✅ src/pages/api/admin/products/variants.ts    [API - 60 líneas]
   └─ Endpoint para CRUD de variantes

✅ src/pages/api/admin/product-types/sizes.ts [API - 40 líneas]
   └─ Endpoint que devuelve tallas del tipo seleccionado
```

## 📋 PASOS DE IMPLEMENTACIÓN

### PASO 1: Ejecutar SQL en Supabase (5 min)

1. Abre Supabase Dashboard → SQL Editor
2. Copia todo el contenido de `supabase/product-types-migration.sql`
3. Pégalo en el editor
4. **Ejecuta el script completo**

**Resultado esperado:**
- ✅ Tabla `product_types` creada con 9 tipos predefinidos
- ✅ Tabla `variant_images` creada
- ✅ Columna `product_type_id` agregada a `products`
- ✅ 3 funciones SQL lisas

### PASO 2: Verificar productos existentes (2 min)

Ejecuta en SQL Editor:
```sql
-- Ver productos sin tipo asignado
SELECT id, name FROM products WHERE product_type_id IS NULL;

-- Contar cuántos productos necesitan tipo
SELECT COUNT(*) FROM products WHERE product_type_id IS NULL;
```

### PASO 3: Asignar tipos a productos existentes (Variable)

**OPCIÓN A - Manual (Recomendado si pocos productos):**
```sql
UPDATE products SET product_type_id = (
  SELECT id FROM product_types WHERE slug = 'camiseta'
) WHERE name ILIKE '%camiseta%' AND product_type_id IS NULL;

UPDATE products SET product_type_id = (
  SELECT id FROM product_types WHERE slug = 'zapato'  
) WHERE name ILIKE '%zapato%' AND product_type_id IS NULL;

-- Repetir para cada tipo...
```

**OPCIÓN B - Global (Si no sabes qué es cada producto):**
```sql
-- Asignar 'Accesorios' como tipo default
UPDATE products SET product_type_id = (
  SELECT id FROM product_types WHERE slug = 'accesorios'
) WHERE product_type_id IS NULL;
```

### PASO 4: Migrar imágenes existentes (Opcional pero recomendado)

Si tienes imágenes en `color_image` de variantes, insértalas en `variant_images`:

```sql
INSERT INTO variant_images (variant_id, image_url, is_primary, alt_text)
SELECT 
  id, 
  color_image, 
  TRUE,
  CONCAT(color, ' - ', size)
FROM product_variants
WHERE color_image IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM variant_images WHERE variant_id = product_variants.id
  );
```

### PASO 5: Actualizar interfaces en Admin

**Opción A - Usar archivo completo (Recomendado):**
1. Reemplaza `src/pages/admin/productos/nuevo.astro` con `src/pages/admin/productos/create-edit.astro`
2. Actualiza rutas en la interfaz admin si es necesario

**Opción B - Integración manual:**
Si tienes customizaciones, agrega esto a tu formulario:

```astro
<!-- En el formulario de nuevo.astro -->
<div>
  <label for="product_type_id">Tipo de Producto *</label>
  <select id="product_type_id" name="product_type_id" required>
    <option value="">Selecciona un tipo...</option>
    <!-- Los tipos se cargan con JavaScript desde el API -->
  </select>
</div>

<!-- En la sección de variantes, agrega el componente -->
<VariantImagesUploader 
  variantId={variant.id}
  productId={product.id}
  color={variant.color}
  size={variant.size}
/>
```

### PASO 6: Actualizar página pública de productos

En `src/pages/productos/[slug].astro`, modifica la sección de galería:

```astro
---
// Obtener imágenes de la variante seleccionada
const { data: variantImages } = await supabase
  .from('variant_images')
  .select('*')
  .eq('variant_id', selectedVariant.id)
  .order('sort_order');
---

<!-- Mostrar galería con todas las imágenes -->
{variantImages?.map((img, idx) => (
  <img 
    src={img.image_url} 
    alt={img.alt_text}
    class={idx === 0 || img.is_primary ? 'main-image' : ''}
  />
))}
```

## 🧪 PRUEBAS

### Test 1: Crear producto nuevo
1. Admin → Productos → Nuevo
2. Completa: Nombre, Tipo (selecciona "Camiseta")
3. Guarda
4. ✅ Debería redirigir a página de edición

### Test 2: Ver tallas dinámicas
1. En edición de producto, cambia el tipo de "Camiseta" a "Zapato"
2. ✅ Las tallas disponibles deberían cambiar automáticamente

### Test 3: Subir múltiples imágenes
1. En edición, scroll hasta "Variantes"
2. Crea una nueva variante (Rojo - M)
3. En la sección de imágenes, arrastra 3-5 imágenes
4. ✅ Deberían aparecer en el grid con numeración

### Test 4: Reordenar imágenes
1. En el grid de imágenes, arrastra una imagen sobre otra
2. ✅ Las posiciones deberían reordenarse

### Test 5: Marcar como principal
1. Haz click en la estrella (★) de una imagen
2. ✅ Solo esa deberá mostrar la estrella dorada
3. ✅ En la página pública, esa debería ser la primera en la galería

### Test 6: Ver en página pública
1. Navega a `/productos/[producto]`
2. Selecciona una variante que tenga múltiples imágenes
3. ✅ Galería debería mostrar todas las imágenes en orden

## 🔧 TROUBLESHOOTING

### "No me sale el selector de tipo de producto"
- Verificar que el SQL se ejecutó sin errores en Supabase
- Ejecutar: `SELECT * FROM product_types;` para ver si hay datos

### "Las tallas no cambian cuando cambio el tipo"
- Verificar que hay un evento `onchange` en el select de tipo
- Debe llamar a `/api/admin/product-types/sizes?type_id=xxx`

### "No puedo subir imágenes"
- Verificar que Supabase Storage está configurado
- Bucket `product-images` debe existir
- Verificar permisos de acceso al bucket

### "Las imágenes se ven pero no se reordenan"
- Verificar que `sort_order` se actualiza en la BD
- Ejecutar: `SELECT * FROM variant_images WHERE variant_id = 'xxx' ORDER BY sort_order;`

## 📊 ESTRUCTURA DE DATOS

```
Ejemplo: Camiseta Roja - Talla M

products
├─ id: abc-123
├─ name: "Camiseta Basic"
├─ product_type_id: xyz-999 (→ Type: Camiseta)
└─ price: €19.99

product_types (xyz-999)
├─ id: xyz-999
├─ name: "Camiseta"
├─ size_type: "standard"
└─ available_sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']

product_variants
├─ id: var-001
├─ product_id: abc-123
├─ color: "Rojo"
├─ size: "M" (← viene del product_type)
└─ stock: 25

variant_images (for var-001)
├─ id: img-001
│  ├─ image_url: "https://...rojo-frontal.jpg"
│  ├─ is_primary: true
│  └─ sort_order: 0
├─ id: img-002
│  ├─ image_url: "https://...rojo-back.jpg"
│  ├─ is_primary: false
│  └─ sort_order: 1
└─ id: img-003
   ├─ image_url: "https://...rojo-detalle.jpg"
   ├─ is_primary: false
   └─ sort_order: 2
```

## 📱 APIS DISPONIBLES

### GET `/api/admin/product-types/sizes?type_id=xyz-999`
```json
{
  "success": true,
  "sizeType": "standard",
  "availableSizes": ["XS", "S", "M", "L", "XL", "XXL"]
}
```

### POST `/api/admin/products/save`
```json
{
  "name": "Camiseta",
  "product_type_id": "xyz-999",
  "price": 19.99,
  ...
}
// Response: { success: true, productId: "abc-123" }
```

### POST `/api/admin/products/variants`
```json
{
  "action": "upsert-multiple",
  "productId": "abc-123",
  "variants": [
    { "color": "Rojo", "size": "M", "stock": 25, "sku": "CAMI-ROJO-M" }
  ]
}
```

## ✨ PRÓXIMOS PASOS (Opcional)

1. **Reporte de productos sin tipo**: Crear dashboard mostrando qué productos necesitan tipo
2. **Importación en lote**: CSV upload para asignar tipos masivamente
3. **Edición de tipos**: Admin para crear nuevos tipos con tallas custom
4. **Preview de tallas**: Vista previa en frontend mostrando tallas disponibles
5. **Filtrado por talla**: Agregar filtro de tallas en página de categoría

---

**¿Preguntas?** Revisa los archivos de código o la documentación anterior.
