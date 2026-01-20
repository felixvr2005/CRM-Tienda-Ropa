# 🎯 VariantsPanel - Panel Unificado de Personalización

## 📋 Descripción General

**VariantsPanel** es un componente React que proporciona una interfaz completa y unificada para personalizar variantes de productos. Combina la selección de colores, la carga de imágenes y la gestión de galerías en un solo componente intuitivo.

**Ubicación:** `/src/components/islands/VariantsPanel.tsx`

---

## 🏗️ Estructura del Componente

### Props

```typescript
interface Props {
  productId: string;        // ID del producto
  productName: string;      // Nombre del producto (para el título)
  variants: Variant[];      // Array de variantes con imágenes
}
```

### Tipos

```typescript
interface VariantImage {
  id: string;
  variant_id: string;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

type Variant = ProductVariant & {
  images: VariantImage[];
};
```

---

## 🎨 Interfaz de Usuario

### Layout Principal

```
┌─────────────────────────────────────────────────┐
│  Título: {productName}                          │
│  Subtítulo: Personaliza colores e imágenes      │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Variante 1 (Acordeón)                      ▼   │
├─────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────┐   │
│ │ Color                                    │   │
│ │ ├─ Selector RGB [▮]                     │   │
│ │ └─ Nombre [Texto]                       │   │
│ ├──────────────────────────────────────────┤   │
│ │ Imágenes                                 │   │
│ │ ├─ Área Drag&Drop                       │   │
│ │ └─ Galería [Img][Img][Img][Img][Img]   │   │
│ └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Variante 2 (Acordeón)                      ►   │
└─────────────────────────────────────────────────┘
```

### Estados del Acordeón

- **Colapsado:** Solo muestra preview de color, nombre, cantidad de imágenes y stock
- **Expandido:** Muestra todos los controles de edición

### Overlay de Imágenes

Cuando pasas el mouse sobre una imagen:

```
┌─────────────┐
│    Foto     │
│  (hover)    │  → Aparecen botones superpuestos:
│             │     [⭐] Marcar principal
└─────────────┘     [✕] Eliminar
```

---

## 🔧 Estados Internos

### useState Hooks

```typescript
const [variantsList, setVariantsList] = useState<Variant[]>(variants);
// Array de variantes (se actualiza localmente)

const [saving, setSaving] = useState<{ [key: string]: boolean }>({});
// Track de cuál variante está siendo guardada (para deshabilitar botones)

const [message, setMessage] = useState<{ [key: string]: { type: 'success' | 'error'; text: string } }>({});
// Mensajes de estado por variante (se auto-limpian después de 2.5s)

const [expandedVariant, setExpandedVariant] = useState<string | null>(
  variants.length > 0 ? variants[0].id : null
);
// ID de la variante actualmente expandida
```

---

## 🔌 Funciones Principales

### `showMessage(variantId, type, text)`

Muestra un mensaje temporal que desaparece después de 2.5 segundos.

```typescript
showMessage('variant-123', 'success', 'Color actualizado ✓');
// Resultado: Muestra banner verde con el mensaje
// Después de 2.5s: Se limpia automáticamente
```

---

### `handleColorChange(variantId, newColor)`

1. Valida que el color sea válido (hex o nombre)
2. Hace PATCH a `/api/admin/variants/{variantId}`
3. Actualiza el estado local si es exitoso
4. Muestra mensaje de confirmación

**Llamada API:**
```typescript
PATCH /api/admin/variants/{variantId}
Body: {
  color: string,        // Nombre del color
  color_hex: string     // Valor hex (#RRGGBB)
}
```

---

### `handleImageUpload(variantId, files)`

1. Convierte archivos a ObjectURLs (para preview)
2. Crea objetos VariantImage con metadata
3. Hace POST a `/api/admin/variant-images`
4. Actualiza el estado con las nuevas imágenes
5. Muestra confirmación

**Llamada API:**
```typescript
POST /api/admin/variant-images
Body: {
  variant_id: string,
  images: Array<{
    image_url: string,
    alt_text: string,
    is_primary: boolean,
    sort_order: number
  }>
}
```

---

### `handleDeleteImage(variantId, imageId)`

1. Hace DELETE a `/api/admin/variant-images/{imageId}`
2. Remueve la imagen del estado local
3. Muestra confirmación

**Llamada API:**
```typescript
DELETE /api/admin/variant-images/{imageId}
```

---

### `handleSetPrimary(variantId, imageId)`

1. Hace PATCH a `/api/admin/variant-images/{imageId}`
2. Establece `is_primary: true` para esa imagen
3. Automáticamente pone `is_primary: false` para las demás (backend)
4. Actualiza el estado local
5. Muestra confirmación

**Llamada API:**
```typescript
PATCH /api/admin/variant-images/{imageId}
Body: {
  is_primary: true
}
```

---

## 🎯 Flujo de Datos

```
Usuario interactúa
        ↓
    Handle Function (handleColorChange, etc.)
        ↓
    setSaving[variantId] = true
    (deshabilita interfaz)
        ↓
    Llama API (/api/admin/...)
        ↓
    ¿Exitoso?
    ├─ Sí: setVariantsList() + showMessage('success')
    └─ No: showMessage('error')
        ↓
    setSaving[variantId] = false
    (re-habilita interfaz)
        ↓
    Mensaje desaparece en 2.5s automáticamente
```

---

## 🎨 Clases CSS/Tailwind Usadas

### Colores

```
Éxito:  bg-green-50, text-green-700, border-green-200
Error:  bg-red-50, text-red-700, border-red-200
Info:   bg-blue-50, text-blue-700, border-blue-200
```

### Layout

```
Acordeones:      space-y-4
Acordeón:        border border-slate-200 rounded-lg
Header botón:    px-6 py-4 (expandible)
Contenido:       px-6 py-6 space-y-6
Galería:         grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3
```

### Estados

```
Hover:      hover:shadow-md hover:bg-slate-50
Disabled:   opacity-50 cursor-not-allowed
Focus:      focus:ring-2 focus:ring-blue-500
```

---

## 🚀 Cómo Usar en una Página Astro

### Importar

```astro
---
import VariantsPanel from '@components/islands/VariantsPanel';
import { supabase } from '@lib/supabase';

// Obtener datos...
const { data: variants } = await supabase.from('product_variants').select('*');
---

<VariantsPanel 
  client:load
  productId={productId}
  productName={productName}
  variants={variantsWithImages}
/>
```

**Importante:** Usar `client:load` para hidratar el componente en el cliente.

---

## 📡 Endpoints API Requeridos

El componente espera que existan estos endpoints:

### 1. Actualizar Variante
```
PATCH /api/admin/variants/[variantId]
Actualiza color y color_hex de una variante
```

### 2. Cargar Imágenes
```
POST /api/admin/variant-images
Inserta múltiples imágenes para una variante
```

### 3. Eliminar Imagen
```
DELETE /api/admin/variant-images/[imageId]
Elimina una imagen del sistema
```

### 4. Marcar Principal
```
PATCH /api/admin/variant-images/[imageId]
Actualiza is_primary para marcar imagen como principal
```

---

## 🔍 Debugging

### Logs Disponibles

El componente registra errores en la consola:

```typescript
console.error('Error en handleColorChange:', error);
console.error('Error en handleImageUpload:', error);
console.error('Error en handleDeleteImage:', error);
console.error('Error en handleSetPrimary:', error);
```

### Verificar Estado

Abre la consola (F12) y escribe:
```javascript
// Ver variantes cargadas
console.log('VariantsList:', variantsList);

// Ver qué variante está expandida
console.log('ExpandedVariant:', expandedVariant);

// Ver mensajes
console.log('Messages:', message);
```

---

## ⚡ Performance

### Optimizaciones

1. **Acordeón**: Solo una variante expandida a la vez → menos DOM renderizado
2. **useRef para inputs**: Evita re-renders innecesarios
3. **showMessage auto-cleanup**: Evita memory leaks de timeouts

### Mejoras Futuras

- [ ] Lazy load de imágenes
- [ ] Drag & drop reordering de imágenes
- [ ] Bulk operations (copiar colores entre variantes)
- [ ] Validación de imágenes antes de upload
- [ ] Preview en tiempo real del producto

---

## 🧪 Testing

### Casos de Uso a Probar

1. **Cambiar color**
   - [ ] Cambiar usando selector RGB
   - [ ] Cambiar escribiendo nombre
   - [ ] Verificar que se guarde en BD

2. **Cargar imágenes**
   - [ ] Drag & drop de 1 imagen
   - [ ] Drag & drop de múltiples imágenes
   - [ ] Upload mediante click

3. **Gestionar imágenes**
   - [ ] Marcar como principal
   - [ ] Eliminar imagen
   - [ ] Verificar que se actualice galería

4. **Mensajes**
   - [ ] Aparecen correctamente
   - [ ] Desaparecen en 2.5s
   - [ ] Muestran el tipo correcto (éxito/error)

5. **Responsividad**
   - [ ] Mobile (1 columna)
   - [ ] Tablet (2 columnas)
   - [ ] Desktop (3+ columnas)

---

## 📝 Notas

- El componente es **Island** (client-side) para interactividad fluida
- Los cambios se guardan **automáticamente** sin botón "Guardar"
- Los mensajes de estado se **auto-limpian** después de 2.5 segundos
- El acordeón permite **una variante expandida a la vez**
- Las imágenes se pueden **reordenar marcando una como principal**

---

## 🔗 Archivos Relacionados

- **Página de uso:** `/src/pages/admin/variantes/[productId].astro`
- **Endpoints API:**
  - `/src/pages/api/admin/variants/[variantId].ts`
  - `/src/pages/api/admin/variant-images/index.ts`
  - `/src/pages/api/admin/variant-images/[imageId].ts`
- **Documentación de usuario:** `GUIA-PANEL-UNIFICADO.md`

---

**Componente actualizado:** 2024
**Estado:** ✅ Producción
**Mantenedor:** Equipo de desarrollo
