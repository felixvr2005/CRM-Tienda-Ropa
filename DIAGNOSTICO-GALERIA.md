# 🔧 DIAGNOSTICO Y PRUEBA - GALERÍA DE COLORES

## 📋 PASOS PARA VERIFICAR QUE FUNCIONA

### 1. ABRE LOS DEVTOOLS (F12)
- Presiona **F12** en el navegador
- Ve a la pestaña **Console**
- Deberías ver mensajes como:
  ```
  🔍 ProductImageGallery Debug:
  Variants: Array(13) [...]
  VariantImages object: {...}
  Colors found: Array(5) [...]
  ```

### 2. COPIA Y PEGA ESTO EN LA CONSOLA:
```javascript
// Ver todos los colores disponibles
console.log('COLORES DISPONIBLES:', JSON.stringify(
  Object.values(variantImages || {})
    .map(arr => arr?.[0]?.variant_id)
));
```

### 3. BUSCA ESTOS MENSAJES EN CONSOLE:

✅ **Cuando cargas la página:**
```
🔍 ProductImageGallery Debug:
Variants: Array(13)
VariantImages object: {uuid1: Array(3), uuid2: Array(3), ...}
Colors found: Array(5) [{name: 'Rojo', ...}, ...]
Auto-selecting first color: Rojo
```

✅ **Cuando haces click en un color:**
```
Click en color: Azul
🎨 Color seleccionado: Azul
Found variant: {id: 'uuid', color: 'Azul', ...}
📸 Buscando imágenes para variant.id: uuid
Imágenes encontradas: Array(3)
✅ Imágenes ordenadas: ['http://...', 'http://...', 'http://...']
```

---

## ❌ SI VES ESTOS ERRORES:

### Error 1: "Sin imágenes para esta variante"
```
❌ Variante no encontrada para color: Azul
Available colors in variants: ['Rojo', 'Azul', 'Negro', ...]
```

**Solución:** Las imágenes están en `variant_images` pero con variant_id incorrecto.

### Error 2: "Imágenes encontradas: undefined"
```
📸 Buscando imágenes para variant.id: xxx
Imágenes encontradas: undefined
```

**Solución:** `variantImages` no tiene datos. Ejecuta en terminal:
```bash
node scripts/seed-variant-images.mjs
```

### Error 3: "Colors found: Array(0)"
```
Colors found: Array(0)
```

**Solución:** Las variantes no tienen colores. Ejecuta:
```bash
node update-colors.mjs
```

---

## 🧪 PRUEBA MANUAL PASO A PASO

### 1. Abre en navegador:
```
http://localhost:4322/productos
```

### 2. Selecciona un producto

### 3. Verifica que ves:
```
[Imagen grande del producto]
[◀️ ▶️] [Contador 1/3]
[Miniatura] [Miniatura] [Miniatura]

SELECCIONA COLOR: [Rojo]
[🔴] [🔵] [⚫] [⚪] [🟢]
Rojo  Azul Negro Blanco Verde
```

### 4. Haz click en un circulito diferente (ej: AZUL)
- ✅ El circulito debe agrandarse
- ✅ Las imágenes deben cambiar
- ✅ Las miniaturas deben ser diferentes

### 5. Si NO cambian las imágenes:
- Abre Console (F12)
- Haz click en un color
- Busca si aparecen estos mensajes:
  ```
  Click en color: [nombre]
  🎨 Color seleccionado: [nombre]
  Found variant: {...}
  Imágenes encontradas: Array(3)
  ✅ Imágenes ordenadas: [...]
  ```

---

## 🔍 QUERIES PARA VERIFICAR DATOS EN SUPABASE

Ejecuta estas en la SQL editor de Supabase:

### Ver variantes y sus colores:
```sql
SELECT id, color, color_hex, stock 
FROM product_variants 
LIMIT 15;
```

Debería mostrar:
```
id                                  color   color_hex   stock
5694dccb-...                       Rojo    #DC2626     10
a76e2aff-...                       Azul    #2563EB     10
471ba97f-...                       Negro   #000000     10
```

### Ver imágenes por variante:
```sql
SELECT variant_id, COUNT(*) as img_count, 
       array_agg(image_url) as urls
FROM variant_images
GROUP BY variant_id
LIMIT 5;
```

Debería mostrar:
```
variant_id              img_count   urls
5694dccb-...           3           [url1, url2, url3]
a76e2aff-...           3           [url1, url2, url3]
```

### Ver todas las imágenes de un color:
```sql
SELECT v.color, COUNT(vi.id) as imagen_count
FROM product_variants v
LEFT JOIN variant_images vi ON v.id = vi.variant_id
GROUP BY v.color;
```

Debería mostrar:
```
color       imagen_count
Rojo        3
Azul        3
Negro       3
Blanco      3
Verde       3
```

---

## 📱 QUÉ DEBERÍA VER EN EL NAVEGADOR

### Antes (Ahora arreglado):
```
❌ Un circulito gris
❌ Mismo color para todos
❌ Las imágenes no cambian
```

### Después (Implementado):
```
✅ Circulitos con colores reales:
   🔴 Rojo (#DC2626)
   🔵 Azul (#2563EB)
   ⚫ Negro (#000000)
   ⚪ Blanco (#FFFFFF)
   🟢 Verde (#16A34A)

✅ Al hacer click:
   - El circulito se agranda
   - Las imágenes cambian
   - Las miniaturas se actualizan
   - Dice "SELECCIONA COLOR: [Nombre]"
```

---

## 🛠️ SI SIGUE SIN FUNCIONAR

### Paso 1: Reinicia el servidor
```bash
# Presiona Ctrl+C en la terminal
# Luego:
npm run dev
```

### Paso 2: Limpia el cache del navegador
- **Chrome/Edge:** Ctrl + Shift + Del → Cache/Cookies
- **Firefox:** Ctrl + Shift + Del → Cache
- O simplemente: F5 + Ctrl (hard refresh)

### Paso 3: Verifica la BD directamente
```bash
# Desde terminal (se necesitan herramientas Supabase)
node check-colors.mjs
# Debería mostrar colores reales, no vacíos
```

### Paso 4: Repuebla los datos
```bash
node update-colors.mjs
node scripts/seed-variant-images.mjs
```

---

## 📊 CHECKLIST FINAL

- [ ] Console muestra: "🔍 ProductImageGallery Debug:"
- [ ] Console muestra: "Colors found: Array(5)"
- [ ] Ves 5 círculos de colores en la página
- [ ] Haces click en un color y se agranda
- [ ] Las imágenes cambiam al hacer click
- [ ] Las miniaturas se actualizan
- [ ] No hay errores rojos en console
- [ ] El navegador NO muestra "Failed to fetch"

Si todo esto es ✅, ¡el sistema funciona!

---

**Si aún tiene problemas, abre DevTools (F12) y copia los mensajes rojos de Console para que pueda ayudarte.**
