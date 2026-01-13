# FAQ - Preguntas Frecuentes - FashionMarket

## 🛒 Carrito y Compra

### P: ¿Por qué mi carrito se vacía cuando recargo la página?
**R:** El carrito se debería guardar en localStorage automáticamente. Si se vacía:
1. Verificar que localStorage no esté deshabilitado en el navegador
2. Abrir DevTools → Application → Local Storage
3. Buscar la clave `fashionmarket_cart`
4. Si no existe, el carrito se perdió en la sesión anterior (expira en 7 días)

### P: ¿Cómo cambio la duración de la expiración del carrito?
**R:** Editar `src/utils/cart.ts` línea ~13:
```typescript
const CART_EXPIRY_DAYS = 7; // Cambiar a 30, 90, etc
```

### P: ¿El carrito persiste en diferentes navegadores?
**R:** No, localStorage es específico del navegador. Para sincronizar entre dispositivos, necesitarías:
1. Implementar login de usuario
2. Guardar carrito en BD con user_id
3. Cargar carrito al hacer login

---

## 🗄️ Base de Datos

### P: ¿Cómo agrego datos de prueba a mi BD?
**R:** Hay dos opciones:

**Opción 1: SQL Editor (Supabase)**
```sql
INSERT INTO categories (name, slug, description) VALUES
  ('Camisas', 'camisas', 'Descripción aquí');

INSERT INTO products (name, slug, description, price, stock, category_id, images, is_active)
VALUES (
  'Camisa Azul',
  'camisa-azul',
  'Descripción del producto',
  15990,  -- €159.90 en céntimos
  10,
  (SELECT id FROM categories WHERE slug = 'camisas'),
  ARRAY['https://imagen.jpg'],
  true
);
```

**Opción 2: Panel Admin (cuando esté implementado)**
- Acceder a `/admin/products/new`
- Llenar el formulario
- Subir imágenes
- Guardar

### P: ¿Cómo restauro la BD a su estado inicial?
**R:** 
1. En Supabase Dashboard → SQL Editor
2. Eliminar todas las tablas: `DROP TABLE IF EXISTS ...`
3. Ejecutar nuevamente el contenido de `database-schema.sql`

### P: ¿Puedo crear backups automáticos?
**R:** Sí, Supabase lo hace por ti:
1. Dashboard → Settings → Backups
2. Los backups se crean automáticamente cada día
3. Se guardan por 7 días en plan gratuito

---

## 🔐 Autenticación y Seguridad

### P: ¿Cómo hago login de administrador?
**R:** Actualmente no está implementado. Para agregarlo:
1. Crear página `/admin/login.astro`
2. Usar `supabase.auth.signInWithPassword()`
3. Verificar que el usuario tiene role `admin`
4. Redirigir a `/admin` si es válido

### P: ¿Dónde guardo las claves API de forma segura?
**R:** 
- **PUBLIC_SUPABASE_ANON_KEY** → Puede ir en `.env` público (safe)
- **SUPABASE_SERVICE_ROLE_KEY** → NUNCA en cliente, solo servidor
- Ambas van en `.env.local` (nunca en Git)

### P: ¿Qué significa RLS (Row Level Security)?
**R:** Políticas de acceso a nivel de BD:
- Los usuarios públicos ven solo productos activos
- Los admins ven todos los productos
- Cada usuario ve solo sus propias órdenes
- Sin RLS, cualquiera podría hackear la BD

---

## 📸 Imágenes y Storage

### P: ¿Cuál es el tamaño máximo de imagen?
**R:** En `src/utils/validation.ts` está configurado:
```typescript
const maxSize = 5 * 1024 * 1024; // 5MB
```
Puedes cambiarlo si necesitas.

### P: ¿Qué formato de imagen es mejor?
**R:** 
- **WebP** → Mejor compresión (recomendado)
- **PNG** → Sin pérdida, bueno para logos
- **JPEG** → Bueno para fotos
- **GIF** → Solo para animaciones

### P: ¿Dónde se guardan las imágenes?
**R:** En el bucket `products-images` de Supabase Storage:
```
https://xxxxx.supabase.co/storage/v1/object/public/products-images/uuid/timestamp.jpg
```

### P: ¿Puedo optimizar imágenes automáticamente?
**R:** Sí, tienes opciones:
1. **Cloudinary** → Servicio externo (gratis con límites)
2. **ImageKit** → Similar a Cloudinary
3. **Astro Image** → Componente integrado (próxima fase)

---

## 🚀 Desarrollo y Deploy

### P: ¿Cómo inicio el desarrollo local?
**R:**
```bash
npm run dev
# Visitar http://localhost:3000
```

### P: ¿Cómo compilo para producción?
**R:**
```bash
npm run build
npm run preview  # Previsualizar
```

### P: ¿Dónde subo el proyecto?
**R:** Opciones recomendadas:
1. **Vercel** (mejor para Astro) → vercel.com
2. **Netlify** → netlify.com
3. **Cloudflare Pages** → cloudflare.com
4. **AWS Amplify** → aws.amazon.com/amplify

### P: ¿Cómo agrego un dominio personalizado?
**R:** Depende del hosting:
- **Vercel:** Domains → Add Domain
- **Netlify:** Domain settings → Add custom domain
- Ambos requieren cambiar DNS en tu registrador

### P: ¿Cuál es el costo de hosting?
**R:**
- **Vercel:** Gratis hasta 100GB/mes
- **Supabase:** Gratis hasta 500MB base de datos
- **Storage:** Gratis hasta 1GB
- **Escalable según tráfico**

---

## 🎨 Estilo y Diseño

### P: ¿Cómo cambio los colores?
**R:** Editar `tailwind.config.mjs`:
```javascript
colors: {
  navy: {
    900: '#MI_COLOR_AQUI', // Cambiar este
  },
}
```

### P: ¿Cómo cambio la tipografía?
**R:** Editar `src/styles/global.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=MI_FUENTE&display=swap');

h1, h2, h3 {
  font-family: 'MI_FUENTE', serif;
}
```

### P: ¿Puedo usar componentes de UI (Ant Design, Material)?
**R:** Sí, pero recomendado mantener minimalismo. Si necesitas:
```bash
npm install @shadcn/ui
# O
npm install @mui/material
```

---

## ⚡ Performance

### P: ¿Por qué mi sitio es lento?
**R:** Pasos para diagnosticar:
1. Ejecutar en DevTools → Lighthouse
2. Revisar imágenes (muy grandes)
3. Revisar llamadas a BD (muy frecuentes)
4. Usar `npm run build` para detectar problemas

### P: ¿Cómo optimizo imágenes?
**R:** 
1. Usar WebP en lugar de JPEG
2. Comprimir con Tinypng.com
3. Implementar lazy loading (próxima fase)
4. Usar CDN para servir imágenes

### P: ¿Cómo cacho datos?
**R:** Actualmente se cachean automáticamente:
- **Productos SSG:** Cacheados en build time
- **localStorage:** Carrito cacheado localmente
- **CDN:** Vercel/Netlify cachean archivos estáticos

Para cache avanzado:
```typescript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .cache('1h') // Cache por 1 hora (próximo)
```

---

## 🛠️ Troubleshooting

### P: "Error: Cannot find module '@components/shop/AddToCartButton'"
**R:** Verificar:
1. El archivo existe en `src/components/shop/AddToCartButton.tsx`
2. El path alias está en `tsconfig.json`
3. Reiniciar servidor (`npm run dev`)

### P: "CORS error: Access-Control-Allow-Origin"
**R:** En Supabase Dashboard:
1. Settings → API
2. URL Configuration
3. Agregar `http://localhost:3000`

### P: "Error: Supabase key is missing"
**R:** 
1. Crear `.env.local`
2. Copiar de `.env.example`
3. Llenar valores de Supabase
4. Reiniciar servidor

### P: Componentes React no se hidratan
**R:** Asegurar que tienen `client:load`:
```astro
<AddToCartButton client:load ... />
```

Sin `client:load`, los componentes son estáticos.

---

## 📱 Mobile y Responsive

### P: ¿El sitio es responsive?
**R:** Sí, Tailwind incluye breakpoints:
```astro
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <!-- 1 columna mobile, 2 tablet, 3 desktop -->
</div>
```

### P: ¿Cómo pruebo en móvil?
**R:**
```bash
npm run dev
# Visitar desde móvil: http://YOUR_IP:3000
# O usar Chrome DevTools (F12 → Toggle device toolbar)
```

---

## 🔧 Configuración Avanzada

### P: ¿Cómo cambio el puerto de desarrollo?
**R:** En `astro.config.mjs`:
```javascript
server: {
  port: 3001, // Cambiar de 3000 a 3001
}
```

### P: ¿Cómo agrego variables de entorno adicionales?
**R:**
1. Agregar a `.env.local`:
```env
PUBLIC_MI_VARIABLE=valor
MI_VARIABLE_PRIVADA=valor
```

2. Usar en el código:
```typescript
// Pública (accesible desde cliente)
const publicVar = import.meta.env.PUBLIC_MI_VARIABLE;

// Privada (solo en servidor)
const privateVar = import.meta.env.MI_VARIABLE_PRIVADA;
```

### P: ¿Cómo deshabilito SSR para una página?
**R:** En `astro.config.mjs`:
```javascript
export const prerender = true; // Para esa página específica
```

---

## 🎯 Next Steps

### Si quieres implementar pagos:
1. Registrar en Stripe (stripe.com)
2. Instalar: `npm install @stripe/stripe-js`
3. Crear archivo `src/lib/stripe.ts`
4. Ver documentación: stripe.com/docs

### Si quieres agregar email:
1. Registrar en SendGrid (sendgrid.com)
2. Instalar: `npm install @sendgrid/mail`
3. Crear función en `src/lib/email.ts`
4. Llamar al crear orden

### Si quieres agregar análisis:
1. Registrar en Google Analytics
2. Instalar: `npm install gtag.js`
3. Rastrear eventos de compra

---

## 📞 ¿Dónde pido ayuda?

- **Documentación:** Ver archivos README.md, SETUP.md, ENTREGABLES.md
- **Ejemplos:** Ver EJEMPLOS.md
- **Astro:** docs.astro.build
- **Supabase:** supabase.com/docs
- **Tailwind:** tailwindcss.com/docs
- **Stack Overflow:** stackoverflow.com

---

**Última actualización:** 8 de enero de 2026
