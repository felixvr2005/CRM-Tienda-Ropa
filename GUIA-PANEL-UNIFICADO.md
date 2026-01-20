# 🎨 Guía: Panel Unificado de Personalización de Variantes

## ✨ Características Principales

El nuevo panel unificado permite personalizar cada variante de tus productos de manera **fácil, rápida e intuitiva**:

- **Color RGB personalizado** → Elige el color exacto que quieres
- **Gestor de imágenes** → Sube imágenes drag & drop
- **Imagen principal** → Marca cuál es la imagen que se ve primero
- **Eliminar imágenes** → Gestiona tu galería fácilmente
- **Vista previa en tienda** → Ve los cambios en tiempo real
- **Acordeón expandible** → Un producto a la vez, menos distracciones

---

## 🚀 Cómo Acceder

1. Ve a **Admin Panel** `/admin/productos`
2. Haz clic en **"✎ Editar Variantes"** en el producto que quieras personalizar
3. Se abrirá el **Panel Unificado de Variantes** 📋

---

## 📝 Paso a Paso: Personalizar una Variante

### Paso 1: Expandir la Variante
```
┌─────────────────────────────────────┐
│  ● Azul • M • 3 imágenes • Stock: 5 │  ← Haz clic aquí
│                                 ▼   │
└─────────────────────────────────────┘
```

El panel se expandirá mostrando:
- 🎨 Selector de color RGB
- 📸 Área para cargar imágenes
- 🖼️ Galería de imágenes actuales

---

### Paso 2: Cambiar el Color

#### Opción A: Usar el Selector de Color
```
Color
├─ Selector RGB          (cuadrado con color)
└─ Nombre               (Ej: "Azul Marino")
```

1. Haz clic en el **cuadrado de color** para abrir el selector RGB
2. Elige el color que deseas
3. El cambio se guarda **automáticamente** ✓

#### Opción B: Escribir el Nombre del Color
```
Nombre: Azul Marino
```

1. Escribe el nombre en el campo
2. Presiona Enter o sale del campo
3. Se guarda automáticamente

---

### Paso 3: Gestionar Imágenes

#### Cargar Imágenes

**Opción A: Drag & Drop (Recomendado)**
```
┌────────────────────────────────┐
│  📸 Arrastra imágenes aquí    │  ← Arrastra tus fotos
│     o haz clic                │     desde tu PC
└────────────────────────────────┘
```

**Opción B: Hacer Clic**
```
1. Haz clic en el área punteada
2. Selecciona una o varias imágenes
3. Se suben automáticamente
```

---

#### Ver Imágenes Cargadas

Abajo verás la galería:
```
[Img 1]  [Img 2]  [Img 3]  [Img 4]  [Img 5]
```

**Acciones disponibles (pasa el mouse):**

- **⭐ (Amarillo)** → Marcar como imagen principal
- **✕ (Rojo)** → Eliminar imagen

---

#### Marcar Imagen Principal

La imagen principal es la que se ve primero en la tienda.

```
1. Pasa el mouse sobre la imagen
2. Haz clic en el botón ⭐ amarillo
3. La imagen tendrá un badge "Principal" arriba
```

---

#### Eliminar Imagen

```
1. Pasa el mouse sobre la imagen
2. Haz clic en el botón ✕ rojo
3. La imagen se elimina al instante
```

---

## 🎯 Flujo Completo: Ejemplo

### Escenario: Personalizar un Vestido

**Vestido: S (Small)**

```
1️⃣ Expandir la variante
   → Hago clic en "S • 0 imágenes • Stock: 10"
   
2️⃣ Cambiar color a Rojo Brillante
   → Abro el selector RGB
   → Elijo rojo: #FF0000
   → El nombre se actualiza a "Rojo"
   
3️⃣ Cargar 3 fotos del vestido rojo
   → Arrastro 3 imágenes JPG al área punteada
   → Se cargan automáticamente
   
4️⃣ Marcar una como principal
   → Paso el mouse sobre la segunda foto
   → Hago clic en ⭐
   
5️⃣ Ver en tienda
   → Hago clic en "👁️ Ver en tienda"
   → Se abre en una nueva pestaña
   → Veo el vestido rojo con la galería correcta
```

---

## ✅ Mensajes de Estado

### ✓ Verde (Éxito)
```
✓ Color actualizado
✓ 3 imagen(es) agregada(s)
✓ Imagen principal actualizada
✓ Imagen eliminada
```

### ✕ Rojo (Error)
```
✕ Error al guardar color
✕ Error al cargar imágenes
✕ Error al eliminar imagen
```

---

## 💡 Tips y Trucos

### Tip 1: Cambios Automáticos
Todos los cambios se guardan **automáticamente** en la base de datos. No hay botón "Guardar".

### Tip 2: Ver en Tiempo Real
Haz clic en "👁️ Ver en tienda" para ver los cambios instantáneamente en la página del producto.

### Tip 3: Múltiples Variantes
Si el producto tiene varias variantes, verás un acordeón para cada una:
```
├─ [○] Rojo (pequeño)
├─ [○] Azul (pequeño)
├─ [○] Rojo (grande)
└─ [○] Azul (grande)
```

Expande la que quieras personalizar.

### Tip 4: Organizar Imágenes
- Primera imagen cargada = primera en la galería
- Pero puedes cambiar cuál es la "Principal" (se verá primero)
- El resto mantienen el orden de carga

---

## 🎨 Colores Recomendados (RGB)

```
Rojo Brillante        #FF0000
Azul Marino          #1E3A8A
Negro                #000000
Blanco               #FFFFFF
Verde Militar        #355E3B
Rosa Pastel          #FFB6D9
Naranja Cálido       #FF8C00
Gris Oscuro          #3F3F3F
```

---

## 🚨 Solución de Problemas

### No se carga la imagen
- ✓ Verifica que el archivo sea PNG, JPG o GIF
- ✓ Verifica que pese menos de 5MB
- ✓ Intenta subir de nuevo

### El color no cambia
- ✓ Usa el selector RGB (más confiable)
- ✓ Presiona Enter después de cambiar el nombre

### "Ver en tienda" no funciona
- ✓ Asegúrate de que el servidor esté corriendo
- ✓ Verifica que el producto exista en la tienda
- ✓ Recarga la página

---

## 📋 Resumen Rápido

| Acción | Cómo | Resultado |
|--------|------|----------|
| **Cambiar color** | Usa selector RGB o escribe nombre | Se guarda automáticamente |
| **Cargar imágenes** | Arrastra o haz clic en el área | Se suben al instante |
| **Marcar principal** | Pasa mouse + haz clic en ⭐ | Se marca con badge |
| **Eliminar imagen** | Pasa mouse + haz clic en ✕ | Se elimina al instante |
| **Ver cambios** | Haz clic en "Ver en tienda" | Abre en nueva pestaña |

---

## 🎓 Preguntas Frecuentes

**P: ¿Dónde se guardan mis cambios?**
R: En la base de datos Supabase, automáticamente cuando haces cambios.

**P: ¿Puedo deshacer cambios?**
R: Por ahora no hay un botón "Deshacer". Puedes cambiar los valores manualmente.

**P: ¿Cuántas imágenes puedo cargar?**
R: Sin límite. Pero recomienda 3-5 fotos para una buena experiencia.

**P: ¿Las imágenes se sincronizarán con la tienda?**
R: Sí, automáticamente cuando hagas clic en "Ver en tienda".

---

**¡Listo! Ahora puedes personalizar tus variantes de manera fácil y rápida.** 🎉

Para soporte o mejoras, contacta al equipo de desarrollo.
