# 🎨 PANEL DE ADMIN - PERSONALIZAR VARIANTES

## ✨ NUEVA FUNCIONALIDAD

Ahora puedes personalizar completamente cada variante de color de tus productos:

### 📋 Lo que puedes hacer:

1. **Seleccionar Color RGB/HEX** para cada variante
2. **Subir múltiples fotos** para cada color
3. **Marcar imagen principal** (la que aparece primero)
4. **Ver cambios en tiempo real** en la tienda

---

## 🚀 CÓMO USAR

### PASO 1: Acceder al Panel

1. Abre: `http://localhost:4322/admin/productos`
2. Haz click en un producto
3. Verás botón **"✎ Editar Variantes"** en la esquina superior derecha
4. Haz click en él

### PASO 2: Seleccionar Variante

En la izquierda verás una lista de todas las variantes:

```
[Variantes]
├─ 🔵 Azul (Talla M)
├─ ⚫ Negro (Talla M)
├─ 🔴 Rojo (Talla L)
└─ 🟢 Verde (Talla L)
```

**Haz click en una para seleccionarla**

### PASO 3: Cambiar Color

Cuando selecciones una variante verás:

```
┌─────────────────────────────┐
│ EDITAR COLOR - TALLA M      │
│                             │
│ Color HEX:                  │
│ [Color Picker] [#2563EB]    │
│                             │
│ Nombre del Color:           │
│ [_____________]             │
│ (Ej: Azul Marino)           │
│                             │
│ [Vista Previa]              │
│ [🟦] Azul Marino            │
│      #2563EB                │
│                             │
│     [Guardar Color]         │
└─────────────────────────────┘
```

**Cómo cambiar el color:**
1. Haz click en el cuadrado de color (color picker)
2. Selecciona el color que quieras
3. Ingresa un nombre para el color (Ej: "Azul Oscuro")
4. Haz click en "Guardar Color"

### PASO 4: Subir Imágenes

Debajo verás:

```
┌─────────────────────────────┐
│ IMÁGENES DEL COLOR [Nombre] │
│                             │
│ [+ Haz click para subir]    │
│ O arrastra fotos aquí       │
└─────────────────────────────┘
```

**Cómo subir fotos:**
1. Haz click en el área de upload
2. Selecciona 3-5 fotos de ese color
3. Espera a que se suban (barra de progreso)
4. ¡Listo! Las fotos aparecerán abajo

### PASO 5: Gestionar Imágenes

Cuando subes fotos verás una galería:

```
[Foto 1]  [Foto 2]  [Foto 3]
 1/3       2/3       3/3

[★ Principal] [Eliminar]
```

**Acciones con las fotos:**
- **Hover en foto**: Aparecen botones
- **★ Principal**: Marca cuál es la imagen principal (la que se ve primero)
- **Eliminar**: Borra la foto

**La primera foto que subes es automáticamente principal**

---

## 📱 FLUJO COMPLETO EJEMPLO

Vamos a personalizar "Vestidos Negro" con colores reales:

### 1. Abrimos el producto

```
Editar Producto: Vestidos Negro
[✎ Editar Variantes]
```

### 2. Hemos creado 3 variantes con tallas:

```
[Variantes]
├─ Azul (Talla M)
├─ Azul (Talla L)
└─ Negro (Talla M)
```

### 3. Seleccionamos "Azul (Talla M)"

```
Color HEX: [🔵] [#2563EB]
Nombre: [Azul Marino____]

[Guardar Color]

IMÁGENES DEL COLOR "Azul Marino":
[Foto 1] [Foto 2] [Foto 3]
```

### 4. Subimos 3 fotos del vestido azul

```
[✓] Subida 3 imágenes

[Foto 1]  [Foto 2]  [Foto 3]
★ Prin.   Eliminar  Eliminar
```

### 5. Seleccionamos "Negro (Talla M)"

```
Color HEX: [⚫] [#000000]
Nombre: [Negro Puro_____]

[Guardar Color]

IMÁGENES DEL COLOR "Negro Puro":
[Vacío - Sube fotos aquí]
```

### 6. Subimos 3 fotos del vestido negro

```
[✓] Subida 3 imágenes

[Foto 1]  [Foto 2]  [Foto 3]
★ Prin.   Eliminar  Eliminar
```

### 7. ¡LISTO! 

Ahora en la tienda en `http://localhost:4322/productos/vestidos-negro`:

```
Usuario abre producto
        ↓
Ve 2 colores:
  🔵 Azul Marino
  ⚫ Negro Puro
        ↓
Click en Azul Marino
  → Ve 3 fotos del vestido azul
        ↓
Click en Negro Puro
  → Ve 3 fotos del vestido negro
```

---

## 🎨 PALETA DE COLORES ÚTILES

Aquí hay algunos colores HEX comunes que puedes usar:

```
Rojos:
- Rojo Oscuro: #DC2626
- Rojo Claro: #EF4444
- Vino: #7F1D1D

Azules:
- Azul Marino: #1E40AF
- Azul Cielo: #2563EB
- Azul Claro: #93C5FD

Neutrales:
- Negro: #000000
- Blanco: #FFFFFF
- Gris Oscuro: #374151
- Gris Claro: #D1D5DB

Verdes:
- Verde Oscuro: #15803D
- Verde Medio: #16A34A
- Verde Claro: #86EFAC

Morados:
- Púrpura: #6B21A8
- Morado: #A855F7
- Lavanda: #DDD6FE

Naranjas:
- Naranja: #EA580C
- Coral: #FB7185
```

---

## ⚠️ COSAS IMPORTANTES

### ✅ Hacer:
- ✓ Sube mínimo 3 fotos por color
- ✓ La primera foto es la principal (se ve en listado)
- ✓ Usa nombres descriptivos ("Rojo Oscuro", "Azul Marino")
- ✓ Guarda después de cambiar cada cosa
- ✓ Prueba en la tienda después de guardar

### ❌ No hacer:
- ✗ No subas fotos de otro color (confunde al cliente)
- ✗ No dejes variantes sin fotos
- ✗ No uses colores muy parecidos (confunden)
- ✗ No olvides poner nombre al color

---

## 🔄 CÓMO SE VE EN LA TIENDA

### Vista de Cliente:

```
PÁGINA DEL PRODUCTO
┌─────────────────────────────┐
│   [Imagen Grande]           │
│                             │
│  ◀️  Contador: 1/3  ▶️       │
│                             │
│ [Mini1] [Mini2] [Mini3]    │
│                             │
│ SELECCIONA COLOR: [Azul]    │
│ [🔴] [🔵] [⚫] [🟢]         │
│ Rojo Azul Negro Verde       │
│                             │
│ SELECCIONA TALLA:           │
│ [S] [M] [L] [XL]           │
│                             │
│     [Añadir al carrito]     │
└─────────────────────────────┘
```

---

## 🛠️ SOLUCIÓN DE PROBLEMAS

### Problema: "Subida 3 imágenes" pero no las veo
**Solución**: 
- Espera a que se procesen
- Recarga la página (F5)
- Verifica que las fotos sean .jpg, .png, .webp

### Problema: El color no cambia en la tienda
**Solución**:
- Asegúrate de hacer click en "Guardar Color"
- Espera 5 segundos
- Recarga la página en la tienda (Ctrl+F5)

### Problema: Las fotos no aparecen
**Solución**:
- Verifica que has hecho click en upload
- Las fotos deben ser menores a 5MB
- Intenta con otra foto diferente

### Problema: No veo el botón "Editar Variantes"
**Solución**:
- Estás en el producto correcto?
- Recarga `/admin/productos/[id]`
- Si aún no ves, verifica que sea SSR

---

## 📱 WORKFLOW RECOMENDADO

### Para cada producto:

1. **Crea variantes en BD** (si no las tienes)
   - Colores + Tallas

2. **Abre admin → Editar Variantes**

3. **Para cada variante:**
   - Selecciona
   - Elige color (color picker)
   - Sube 3-5 fotos
   - Marca una como principal
   - Guarda

4. **Prueba en tienda**
   - Verifica colores
   - Verifica fotos cambien
   - Verifica orden de imágenes

5. **¡Listo!**

---

**¡Ahora tu tienda es totalmente personalizable! 🎉**

Los clientes verán exactamente el color y fotos que asignaste para cada variante.
