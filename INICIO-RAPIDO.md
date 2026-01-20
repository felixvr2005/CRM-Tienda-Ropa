# 🚀 INICIO RÁPIDO: Panel de Variantes (2 minutos)

## ⚡ TL;DR (La versión ultra rápida)

```
1. Ve a: /admin/productos
2. Haz clic en: "✎ Editar Variantes"
3. ¡Listo! Personaliza colores e imágenes
```

---

## 🎯 Lo que Puedes Hacer AHORA

### ✅ Cambiar Color
```
1. Expande la variante (clic en la fila)
2. Haz clic en el cuadrado de color
3. Elige un color RGB
4. ¡Listo! Se guarda automáticamente
```

### ✅ Subir Imágenes
```
1. Expande la variante
2. Arrastra fotos al área punteada
   O haz clic para seleccionar
3. ¡Listo! Se cargan al instante
```

### ✅ Marcar Imagen Principal
```
1. Pasa el mouse sobre la foto
2. Haz clic en el botón ⭐ amarillo
3. ¡Listo! Esa foto será la primera que se ve
```

### ✅ Eliminar Imagen
```
1. Pasa el mouse sobre la foto
2. Haz clic en el botón ✕ rojo
3. ¡Listo! La foto se elimina
```

### ✅ Ver Cambios en Tienda
```
1. En cualquier variante
2. Haz clic en "👁️ Ver en tienda"
3. Se abre en una nueva pestaña
4. ¡Listo! Ves los cambios en tiempo real
```

---

## 📍 Ubicaciones Importantes

### URL del Panel
```
http://localhost:4321/admin/variantes/{productId}
```

### Desde Admin Panel
```
/admin/productos 
  → Selecciona un producto
  → Clic en "✎ Editar Variantes"
  → ¡Panel Unificado!
```

---

## 🎨 Ejemplo Práctico: 2 Minutos

### Scenario: Personalizar un Vestido Rojo

**Paso 1: Abrir Panel** (15 segundos)
```
1. Ve a /admin/productos
2. Busca "Vestidos"
3. Clic en "✎ Editar Variantes"
→ Panel abierto ✅
```

**Paso 2: Seleccionar Variante** (10 segundos)
```
4. Haz clic en "M • 0 imágenes"
→ Variante expandida ✅
```

**Paso 3: Cambiar Color** (20 segundos)
```
5. Haz clic en el selector de color [■]
6. Elige rojo (#FF0000)
7. Nombre automático: "Rojo"
→ Color actualizado ✅
```

**Paso 4: Subir Imágenes** (45 segundos)
```
8. Arrastra 3 fotos del vestido rojo
   → Se cargan al instante
9. Aparecen en la galería
→ Imágenes cargadas ✅
```

**Paso 5: Marcar Principal** (10 segundos)
```
10. Pasa mouse sobre la segunda foto
11. Haz clic en ⭐
→ Imagen principal marcada ✅
```

**Paso 6: Ver en Tienda** (20 segundos)
```
12. Haz clic en "Ver en tienda"
13. Se abre la página del producto
→ ¡Cambios visibles! ✅
```

**Total: ~2 minutos** ⏱️

---

## 🎪 Visual Guide (ASCII Art)

### Desktop View
```
┌────────────────────────────────────────────────────┐
│  Variante 1                                      ▼ │  ← Clic para expandir
└────────────────────────────────────────────────────┘

EXPANDIDO:

Color               Imágenes
[■]  [Nombre]      [Arrastra o clic] 
                   [Img1][Img2][Img3]
                    ⭐    ✕    ✕

Ver en tienda [👁️]
```

### Mobile View
```
┌──────────────────┐
│ ● Rojo • M     ▼ │
├──────────────────┤
│                  │
│ [■]  [Nombre]   │
│                  │
│ [Arrastra]      │
│ [Img1][Img2]    │
│ [Img3]          │
│                  │
│ [Ver en tienda] │
└──────────────────┘
```

---

## 💬 Mensajes Que Verás

### ✅ Éxito (Verde)
```
✓ Color actualizado
✓ 3 imagen(es) agregada(s)
✓ Imagen eliminada
✓ Imagen principal actualizada
```

### ✕ Error (Rojo)
```
✕ Error al guardar color
✕ Error al cargar imágenes
✕ Error al eliminar imagen
```

Los mensajes desaparecen automáticamente en 2.5 segundos.

---

## ❓ Preguntas Rápidas

**P: ¿Dónde se guardan mis cambios?**
A: Automáticamente en la base de datos. No hay botón "Guardar".

**P: ¿Puedo cambiar múltiples variantes?**
A: Sí. El panel te deja expandir una a la vez para no confundirse.

**P: ¿Cuántas imágenes puedo subir?**
A: Las que quieras. Pero 3-5 es lo ideal.

**P: ¿Se actualizan en la tienda al instante?**
A: Sí. Haz clic en "Ver en tienda" y verás los cambios.

**P: ¿Puedo deshacer cambios?**
A: Cambia los valores manualmente. No hay botón "Deshacer" aún.

---

## 🔧 Si Algo No Funciona

### Checklist Rápido

- [ ] ¿El servidor está corriendo? → `npm run dev`
- [ ] ¿Tienes internet? → Sí: ✅
- [ ] ¿Las APIs responden? → Abre F12 → Network
- [ ] ¿BD Supabase conectada? → Revisa el servidor

### Ver Errores
```
1. Abre F12 (Developer Tools)
2. Ve a Console
3. Busca mensajes rojos
4. Lee el error
5. Contacta al equipo
```

---

## 🎯 Tips Profesionales

### Tip 1: Ventanas Múltiples
```
1. Abre panel en una ventana
2. "Ver en tienda" en otra
3. Compara cambios en tiempo real
```

### Tip 2: Orden de Imágenes
```
1. Primera imagen = primera en galería
2. ⭐ = imagen que se ve primero
3. El resto mantienen su orden
```

### Tip 3: Subir Varias a la Vez
```
1. Selecciona 3-5 fotos en tu PC
2. Arrastra todas al panel
3. ¡Se cargan en lote!
```

### Tip 4: Cambiar Nombre de Color
```
1. Cambia RGB con el picker
2. Nombre se auto-completa
3. Puedes editarlo manualmente
4. Presiona Enter para guardar
```

---

## 📞 Need Help?

### Guías Disponibles

1. **GUIA-PANEL-UNIFICADO.md** → Explicación completa (10 min)
2. **DOCUMENTACION-VARIANTS-PANEL.md** → Técnica (30 min)
3. **RESUMEN-PANEL-FINAL.md** → Visión general (5 min)

### Contacto

- **Bugs:** Abre F12 → Console → verifica errores
- **Preguntas:** Revisa la guía correspondiente
- **Soporte:** Contacta al equipo

---

## 🎉 ¡Listo!

Ya sabes todo lo básico. **¡Empieza ahora!**

```
1. /admin/productos
2. "✎ Editar Variantes"
3. ¡Personaliza!
```

**Tiempo estimado para ser experto: 5 minutos**

---

**Made with ❤️ for easy product personalization**

*Last updated: 2024*
