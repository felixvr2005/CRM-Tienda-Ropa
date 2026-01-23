# Feature: Add product variants during product creation

Resumen:
- Se añade UI en `/admin/productos/nuevo` para permitir añadir variantes (color, talla, precio, stock) antes de guardar.
- El endpoint `POST /api/admin/products/save` acepta ahora la propiedad `variants` y, al crear un producto nuevo, inserta las variantes proporcionadas.
- Tras la creación se redirige al editor `/admin/productos/{id}` donde se pueden subir las imágenes por variante.

Cómo probar:
1. Abrir `/admin/productos/nuevo` como admin.
2. Rellenar datos del producto y usar **Añadir Variante** para crear 1-3 variantes (color, talla, precio, stock).
3. Hacer clic en **Crear Producto**.
4. Comprobar que se redirige a `/admin/productos/{id}` y en la sección de variantes aparecen las variantes creadas en la BD (`product_variants`).
5. Ir a cada variante y subir imágenes (se usan `VariantImagesUploader`).

Notas técnicas:
- No se suben imágenes hasta que el producto y la variante existen (necesitan `productId` y `variantId` para la ruta en storage).
- Branch: `feature/variants-on-create` (ya subida).

Posibles mejoras futuras:
- Soportar subida de imágenes temporales antes de crear el producto.
- Crear variantes + imágenes en una sola acción atómica (transactional).

Autor: GitHub Copilot (Raptor mini - Preview)