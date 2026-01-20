# ✅ CHECKLIST: Sistema de Tipos de Producto

**Último actualizado**: 2024
**Progreso**: 85% (Archivos creados, SQL pendiente)

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### FASE 1: Setup de Base de Datos ⏳

- [ ] **1.1 Ejecutar SQL Migration**
  - [ ] Abrir `supabase/product-types-migration.sql`
  - [ ] Copiar contenido completo
  - [ ] Ir a Supabase Dashboard → SQL Editor
  - [ ] Pegar y ejecutar
  - [ ] Verificar sin errores
  - **Time**: 5 min
  - **Docs**: `supabase/product-types-migration.sql`

- [ ] **1.2 Verificar Tablas Creadas**
  ```sql
  SELECT * FROM product_types LIMIT 1;
  SELECT * FROM variant_images LIMIT 1;
  ```
  - [ ] `product_types` existe con 9 registros
  - [ ] `variant_images` existe y vacía
  - [ ] Columna `product_type_id` en `products`
  - **Time**: 2 min

### FASE 2: Asignación de Tipos a Productos Existentes ⏳

- [ ] **2.1 Hacer Inventario**
  ```sql
  SELECT COUNT(*) as total, 
         COUNT(CASE WHEN product_type_id IS NULL THEN 1 END) as sin_tipo
  FROM products;
  ```
  - [ ] Anotar cuántos productos necesitan tipo
  - **Time**: 2 min

- [ ] **2.2 Asignación Manual (si hay pocos)**
  - [ ] Identificar qué tipo es cada producto
  - [ ] Ejecutar UPDATEs específicos por nombre
  ```sql
  UPDATE products SET product_type_id = (
    SELECT id FROM product_types WHERE slug = 'camiseta'
  ) WHERE name ILIKE '%camiseta%' AND product_type_id IS NULL;
  ```
  - [ ] Verificar actualizaciones
  - **Time**: 10-30 min (depende cantidad)

- [ ] **2.3 Asignación Por Default (si hay muchos)**
  - [ ] Ejecutar:
  ```sql
  UPDATE products SET product_type_id = (
    SELECT id FROM product_types WHERE slug = 'accesorios'
  ) WHERE product_type_id IS NULL;
  ```
  - [ ] Verificar: `SELECT COUNT(*) FROM products WHERE product_type_id IS NULL;`
  - [ ] Debería ser 0
  - **Time**: 2 min

### FASE 3: Archivos Nuevos en Proyecto ✅

- [x] **3.1 SQL Migration**
  - [x] Crear: `supabase/product-types-migration.sql` ✅
  - [x] Contiene: Tablas, funciones, datos iniciales
  - [x] Status: Listo para ejecutar

- [x] **3.2 Componente React**
  - [x] Crear: `src/components/islands/VariantImagesUploader.tsx` ✅
  - [x] Features: Upload, reorder, primary, delete
  - [x] Status: Listo para integrar

- [x] **3.3 Formulario Admin**
  - [x] Crear: `src/pages/admin/productos/create-edit.astro` ✅
  - [x] Features: Selector tipo, variantes, imágenes
  - [x] Status: Listo para usar

- [x] **3.4 APIs**
  - [x] Crear: `src/pages/api/admin/products/save.ts` ✅
  - [x] Crear: `src/pages/api/admin/products/variants.ts` ✅
  - [x] Crear: `src/pages/api/admin/product-types/sizes.ts` ✅
  - [x] Status: Todos listos

- [x] **3.5 Documentación**
  - [x] Crear: `GUIA-TIPOS-PRODUCTO.md` ✅
  - [x] Crear: `ESTADO-PROYECTO-FINAL.md` ✅
  - [x] Status: Documentado

### FASE 4: Integración Admin ⏳

- [ ] **4.1 Reemplazar Página de Nuevo Producto**
  - [ ] Backup: Renombrar `src/pages/admin/productos/nuevo.astro` a `nuevo.astro.bak`
  - [ ] Reemplazar con `src/pages/admin/productos/create-edit.astro`
  - [ ] O importar VariantImagesUploader en página existente
  - [ ] Probar en: `/admin/productos/nuevo`
  - **Time**: 5 min

- [ ] **4.2 Actualizar Página de Editar**
  - [ ] Abrir: `src/pages/admin/productos/[id].astro`
  - [ ] Agregar campo `product_type_id`
  - [ ] Agregar `<VariantImagesUploader />` para cada variante
  - [ ] Probar en: `/admin/productos/[id]`
  - **Time**: 10 min

- [ ] **4.3 Probar Funcionalidad Básica**
  - [ ] Ir a Admin → Productos → Nuevo
  - [ ] Llenar: Nombre, Tipo (Camiseta), Precio
  - [ ] Guardar
  - [ ] ✅ Debería mostrar listado de variantes
  - **Time**: 5 min

### FASE 5: Integración Frontend ⏳

- [ ] **5.1 Actualizar Página de Producto**
  - [ ] Abrir: `src/pages/productos/[slug].astro`
  - [ ] Cambiar query de imágenes:
  ```astro
  // De:
  const colorImage = variant.color_image;
  
  // A:
  const variantImages = await supabase
    .from('variant_images')
    .select('*')
    .eq('variant_id', variant.id)
    .order('sort_order');
  ```
  - [ ] Actualizar galería para mostrar múltiples imágenes
  - [ ] Probar en: `/productos/[producto]`
  - **Time**: 15 min

- [ ] **5.2 Actualizar ProductGallery.astro**
  - [ ] Abrir: `src/components/product/ProductGallery.astro`
  - [ ] Recibir `images` en lugar de `mainImage`
  - [ ] Mostrar primera como principal
  - [ ] Rest en galería lateral
  - **Time**: 10 min

### FASE 6: Testing Manual ✅

- [ ] **6.1 Test: Crear Producto Nuevo**
  - [ ] Admin → Productos → Nuevo
  - [ ] Nombre: "Test Camiseta"
  - [ ] Tipo: "Camiseta"
  - [ ] Precio: €25
  - [ ] Guardar
  - [ ] ✅ Debe mostrar producto creado
  - **Time**: 5 min

- [ ] **6.2 Test: Cambiar Tipo**
  - [ ] Editar el producto anterior
  - [ ] Cambiar Tipo a "Zapato"
  - [ ] ✅ Tallas disponibles deben cambiar
  - **Time**: 2 min

- [ ] **6.3 Test: Crear Variante**
  - [ ] En edición del producto
  - [ ] Crear variante: Rojo - M
  - [ ] Stock: 10
  - [ ] Guardar
  - [ ] ✅ Debe aparecer en listado
  - **Time**: 3 min

- [ ] **6.4 Test: Subir Imágenes**
  - [ ] Hacer click en variante
  - [ ] Arrastra 3 imágenes
  - [ ] ✅ Deben aparecer en grid
  - **Time**: 5 min

- [ ] **6.5 Test: Reordenar Imágenes**
  - [ ] Drag una imagen sobre otra
  - [ ] ✅ Posiciones deben cambiar
  - [ ] Verificar en BD: `SELECT * FROM variant_images ORDER BY sort_order`
  - **Time**: 3 min

- [ ] **6.6 Test: Marcar Principal**
  - [ ] Click en estrella de una imagen
  - [ ] ✅ Solo esa debe tener estrella dorada
  - [ ] Otra imagen no debe tener estrella
  - **Time**: 2 min

- [ ] **6.7 Test: Ver en Frontend**
  - [ ] Ir a `/productos/test-camiseta`
  - [ ] ✅ Galería debe mostrar todas las imágenes
  - [ ] Primera debe ser la marcada como principal
  - **Time**: 3 min

### FASE 7: Migración de Datos Históricos (Opcional) 🟡

- [ ] **7.1 Migrar Imágenes Existentes**
  - [ ] Si tienes `color_image` en variantes antiguas
  - [ ] Ejecutar:
  ```sql
  INSERT INTO variant_images (variant_id, image_url, is_primary, alt_text)
  SELECT id, color_image, TRUE, CONCAT(color, ' - ', size)
  FROM product_variants
  WHERE color_image IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM variant_images WHERE variant_id = product_variants.id);
  ```
  - [ ] Verificar resultados
  - **Time**: 5 min

- [ ] **7.2 Verificar Integridad**
  ```sql
  SELECT pv.id, pv.color, COUNT(vi.id) as imagen_count
  FROM product_variants pv
  LEFT JOIN variant_images vi ON pv.id = vi.variant_id
  GROUP BY pv.id
  ORDER BY imagen_count DESC;
  ```
  - **Time**: 2 min

### FASE 8: Verificación Final ✅

- [ ] **8.1 Check: Todas las tablas existentes**
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' 
  ORDER BY table_name;
  ```
  - [ ] `product_types` ✓
  - [ ] `variant_images` ✓
  - [ ] `products` (con `product_type_id`) ✓
  - **Time**: 2 min

- [ ] **8.2 Check: RLS Policies**
  ```sql
  SELECT schemaname, tablename, policyname FROM pg_policies 
  WHERE schemaname = 'public';
  ```
  - [ ] `product_types` tiene policies ✓
  - [ ] `variant_images` tiene policies ✓
  - **Time**: 2 min

- [ ] **8.3 Check: Funciones SQL**
  ```sql
  SELECT routine_name FROM information_schema.routines 
  WHERE routine_schema = 'public' 
  ORDER BY routine_name;
  ```
  - [ ] `get_sizes_by_product_type` ✓
  - [ ] `get_variant_images` ✓
  - [ ] `set_primary_variant_image` ✓
  - **Time**: 2 min

- [ ] **8.4 Check: Storage**
  - [ ] Supabase Dashboard → Storage
  - [ ] [ ] Bucket `product-images` existe
  - [ ] [ ] Es públicamente accesible
  - **Time**: 2 min

- [ ] **8.5 Check: APIs Respondiendo**
  - [ ] `GET /api/admin/product-types/sizes?type_id=xxx`
  - [ ] `POST /api/admin/products/save`
  - [ ] `POST /api/admin/products/variants`
  - [ ] Probar en DevTools o Postman
  - **Time**: 5 min

---

## 📊 RESUMEN DE PROGRESO

```
TOTAL: 44 items

Completado: ✅ 12 items (27%)
├─ SQL Migration (creado)
├─ React Component (creado)
├─ Admin Form (creado)
├─ APIs (3x creado)
├─ Documentación (2x creado)
└─ ...

Pendiente: ⏳ 32 items (73%)
├─ Ejecutar SQL en Supabase
├─ Asignar tipos a productos
├─ Integrar en Admin
├─ Testing manual
└─ ...
```

---

## ⏱️ TIEMPO TOTAL ESTIMADO

| Fase | Time | Dificultad |
|------|------|-----------|
| 1. SQL | 7 min | 🟢 Fácil |
| 2. Asignación | 5-30 min | 🟡 Media |
| 3. Archivos | ✅ 0 min | 🟢 Hecho |
| 4. Admin | 20 min | 🟡 Media |
| 5. Frontend | 25 min | 🟡 Media |
| 6. Testing | 25 min | 🟢 Fácil |
| 7. Migración | 7 min | 🟡 Media |
| 8. Verificación | 13 min | 🟢 Fácil |
| **TOTAL** | **~2-2.5 horas** | |

---

## 🆘 SI ALGO FALLA

| Síntoma | Causa Probable | Solución |
|---------|---|---|
| Error al ejecutar SQL | Sintaxis incorrecta | Copiar exactamente del archivo |
| Tabla no existe | SQL no se ejecutó | Ejecutar nuevamente |
| Tipos no aparecen | Sin datos | Verificar INSERT en script |
| Storage error | Bucket no existe | Crear `product-images` en Storage |
| API 401 | Sin auth | Verificar token en cookies |
| Imágenes no se suben | Permisos | Verificar RLS policy |

---

## 📞 CONTACTO

¿Preguntas?
1. Revisar `GUIA-TIPOS-PRODUCTO.md`
2. Revisar logs en `/api/admin/...`
3. Revisar SQL en Supabase
4. Check en ESTADO-PROYECTO-FINAL.md

---

**¡Listo para implementar!** 🚀
