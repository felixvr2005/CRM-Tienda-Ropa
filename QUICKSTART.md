# ⚡ INICIO RÁPIDO - FASHIONMARKET

## 📋 En 5 Minutos

### 1️⃣ Clonar el Proyecto
```bash
cd "CRM-Tienda Ropa"
```

### 2️⃣ Instalar Dependencias
```bash
npm install
```
⏱️ **Esperar ~2-3 minutos**

### 3️⃣ Crear `.env.local`
```bash
cp .env.example .env.local
```

Editar `.env.local` y pegar:
```
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...xxxxx
```

*(Obtener valores de Supabase Dashboard → Settings → API)*

### 4️⃣ Ejecutar Servidor
```bash
npm run dev
```

### 5️⃣ Abrir en Navegador
👉 **http://localhost:3000**

---

## ✅ Verificar Que Funciona

- [ ] Home page carga (hero section)
- [ ] Puedo ver catálogo en `/shop`
- [ ] Puedo hacer click en carrito (arriba derecha)
- [ ] Panel admin visible en `/admin`

---

## 🗄️ Configurar Base de Datos

### En Supabase Dashboard:

1. **Ir a SQL Editor**
2. **Click "New Query"**
3. **Copiar todo de `database-schema.sql`**
4. **Pegar en el editor**
5. **Click "Run"**
6. **✅ Verificar que no hay errores**

---

## 📸 Crear Bucket de Storage

1. **Ir a Storage en sidebar**
2. **Click "New Bucket"**
3. **Nombre:** `products-images`
4. **Desmarcar "Private bucket"**
5. **Click "Create Bucket"**

---

## 🎨 Ver los Componentes Interactivos

### CartButton (Arriba derecha)
```
1. Hacer click en 🛍️
2. Se abre CartSidebar
3. Hacer click en X para cerrar
```

### AddToCartButton (En producto)
```
1. Ir a /shop
2. Hacer click en producto
3. Selector de talla/color
4. Click "Añadir al Carrito"
5. El badge del carrito se actualiza
```

---

## 📚 Documentación

| Archivo | Para Qué |
|---------|----------|
| `README.md` | Guía técnica completa |
| `SETUP.md` | Pasos detallados de instalación |
| `ENTREGABLES.md` | Resumen de lo que se entregó |
| `EJEMPLOS.md` | Ejemplos de código |
| `FAQ.md` | Preguntas frecuentes |
| `INDEX.md` | Índice de archivos |

---

## 🚨 Si Algo No Funciona

### Error: "SUPABASE_URL is missing"
```
✅ Crear .env.local
✅ Copiar valores de Supabase
✅ Reiniciar npm run dev
```

### Error: "Cannot find module..."
```
✅ npm install
✅ npm run dev (reiniciar)
```

### Carrito no persiste
```
✅ Abrir DevTools (F12)
✅ Application → Local Storage
✅ Buscar fashionmarket_cart
```

---

## 🎯 Próximos Pasos

### Implementar Admin Login
1. Abrir `/src/pages/admin/login.astro`
2. Crear formulario de login
3. Integrar Supabase Auth

### Crear CRUD de Productos
1. Abrir `/src/pages/admin/products/new.astro`
2. Usar `src/lib/supabase/storage.ts`
3. Subir imágenes a Storage

### Integrar Stripe (Fase 2)
1. Registrarse en stripe.com
2. Instalar: `npm install @stripe/stripe-js`
3. Crear checkout page

---

## 🤔 ¿Necesito Ayuda?

### Antes que nada:
1. ✅ Ver FAQ.md
2. ✅ Ver EJEMPLOS.md
3. ✅ Revisar comentarios en código

### Recuros útiles:
- 📖 [Astro Docs](https://docs.astro.build)
- 📖 [Supabase Docs](https://supabase.com/docs)
- 📖 [Tailwind Docs](https://tailwindcss.com)
- 💬 [Stack Overflow](https://stackoverflow.com)

---

## ✨ Stack Tecnológico

```
Frontend:
├─ Astro 5.0 (híbrido SSG/SSR)
├─ React 18 (componentes interactivos)
├─ Tailwind CSS (estilos)
├─ TypeScript (type-safety)
└─ Nano Stores (estado minimalista)

Backend:
├─ Supabase (BaaS)
├─ PostgreSQL (base de datos)
├─ Auth JWT (autenticación)
└─ Storage (archivos)

Despliegue:
├─ Vercel (recomendado)
├─ Netlify (alternativa)
└─ Cloudflare Pages (alternativa)
```

---

## 🎉 ¡Listo!

Tu tienda online FashionMarket está lista para desarrollar.

**Próximo paso:** 
```bash
npm run dev
# Visitar http://localhost:3000
```

---

**Made with ❤️ by Architecture Team**
**Versión 1.0.0 - 8 de enero de 2026**
