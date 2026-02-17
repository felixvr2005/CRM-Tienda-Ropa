# 🎯 PROMPT COMPLEMENTARIO - CARACTERÍSTICAS RESTANTES
## Todo lo que FALTA para que la app sea 100% COMPLETA

**Fecha:** 1 de febrero de 2026  
**Destinatario:** Claude Opus 4.5  
**Propósito:** Implementar 10 características finales para completitud total  
**Timeline:** 2-3 semanas adicionales (después de las 12 semanas principales)

---

## 📋 TABLA DE CONTENIDOS

1. [ContactScreen - Formulario de Contacto](#contact-screen)
2. [Static Pages - Páginas de Información](#static-pages)
3. [Restock Notifications - Notificaciones de Stock](#restock-notifications)
4. [Breadcrumb Navigation - Migas de Pan](#breadcrumb)
5. [Product Recommendations - Motor de Recomendaciones](#recommendations)
6. [Wishlist Sharing - Compartir Deseos](#wishlist-sharing)
7. [Referral Program - Programa de Referidos](#referral)
8. [Product Comparison - Comparar Productos](#comparison)
9. [Regional Availability - Disponibilidad Regional](#regional)
10. [Advanced Email Notifications - Emails Automáticos](#advanced-emails)
11. [Lista de Tareas](#task-list)
12. [Integración con Fase 1-12](#integration)

---

## 🔗 CONTACT SCREEN - FORMULARIO DE CONTACTO

### Ubicación y Acceso
```dart
// En: AccountScreen (tab Contacto)
// O: BottomNav shortcut
// O: Settings > Contact Support
// O: Help icon en AppBar
```

### ContactScreen UI
```dart
// Secciones:

1. HEADER:
   ├─ Título: "Contacta con nosotros"
   ├─ Subtítulo: "Estaremos en contacto en 24h"
   └─ Icono: mensaje o soporte

2. FORM (8 campos):
   ├─ Nombre completo* (TextFormField)
   │  ├─ Validación: no vacío, 3+ chars
   │  ├─ Si logueado: pre-fill automático
   │  └─ Editable
   │
   ├─ Email* (TextFormField)
   │  ├─ Validación: email format
   │  ├─ Si logueado: pre-fill automático
   │  └─ Editable
   │
   ├─ Teléfono (TextFormField opcional)
   │  ├─ Formato: +34 XXX XXX XXX (auto-format)
   │  └─ Para llamada de seguimiento
   │
   ├─ Asunto* (DropdownButtonFormField)
   │  ├─ Options:
   │  │  ├─ "Problema con mi pedido"
   │  │  ├─ "Pregunta sobre producto"
   │  │  ├─ "Problema de envío"
   │  │  ├─ "Problema de pago"
   │  │  ├─ "Solicitud de cambio/devolución"
   │  │  ├─ "Sugerencia o comentario"
   │  │  └─ "Otro"
   │  └─ Validación: requerido
   │
   ├─ Order Number (TextFormField opcional)
   │  ├─ Si asunto = "Problema con mi pedido"
   │  ├─ Mostrar/ocultar según asunto
   │  ├─ Validación: si requerido, debe existir en BD
   │  └─ Dropdown con órdenes si logueado
   │
   ├─ Mensaje* (TextFormField multiline)
   │  ├─ Min: 10 chars, Max: 2000 chars
   │  ├─ Contador visible
   │  ├─ Altura: 6 líneas iniciales
   │  └─ Hint: "Describe tu problema detalladamente..."
   │
   ├─ Attachments (opcional)
   │  ├─ "Adjuntar imágenes" button
   │  ├─ Max 3 imágenes, max 5MB cada
   │  ├─ Upload a Supabase Storage
   │  ├─ Preview thumbnails
   │  └─ Remove individual
   │
   └─ Checkbox: "Deseo respuesta por teléfono"
      └─ Si checked + teléfono vacío: validación error

3. INFOS CARDS (bottom):
   ├─ "Respuesta típicamente en 24h"
   ├─ "Email de confirmación enviado"
   └─ "Puedes ver estado del ticket en tu cuenta"

4. BUTTONS:
   ├─ "Enviar mensaje" (primary, full width)
   ├─ "Cancelar" (tertiary)
   └─ Loading state durante envío

5. SUCCESS SCREEN (después envío):
   ├─ Icono checkmark (animado)
   ├─ "¡Mensaje enviado!"
   ├─ "Ticket #12345"
   ├─ "Revisa tu email para confirmación"
   ├─ "Verás respuesta en tu cuenta → Soporte"
   └─ Botones:
      ├─ "Ir a mis tickets" (link)
      └─ "Volver al inicio" (link)

6. ERROR HANDLING:
   ├─ Si falla envío: mostrar error toast
   ├─ Opción "Reintentar"
   ├─ Si error persiste: botón "Contactar por email directamente"
   └─ Mostrar email de fallback
```

### ContactService (Backend)
```typescript
// Endpoint: POST /api/contact/send
// Auth: No requerida (open)
// Rate limit: 5 por IP por hora

{
  name: string*
  email: string*
  phone?: string
  subject: string* (enum)
  order_id?: UUID
  message: string* (10-2000 chars)
  attachments?: string[] (URLs en Storage)
  want_phone_response?: boolean
  user_id?: UUID (si logueado)
  created_at: timestamp
}

Acciones backend:
├─ Validar todos campos
├─ Crear ticket en BD (tabla: support_tickets)
├─ Enviar email confirmación al cliente
├─ Enviar notificación a admins (email + Slack)
├─ Guardar attachment URLs
└─ Retornar ticket_id

Response (201):
{
  ticket_id: "SUP-12345",
  message: "Hemos recibido tu mensaje",
  confirmation_sent_to: "user@email.com"
}
```

### Admin Dashboard - Support Tickets
```dart
// AdminSupportTicketsScreen:

Tabla:
├─ Ticket ID (copiable)
├─ Cliente (nombre)
├─ Asunto (badge colored)
├─ Estado:
│  ├─ Nuevo (rojo)
│  ├─ En progreso (naranja)
│  ├─ Respondido (azul)
│  ├─ Cerrado (verde)
│  └─ Spam (gris)
├─ Fecha
├─ Prioridad (Alta/Normal/Baja)
└─ Acciones (Ver, Responder, Cerrar, Mark spam)

Filtros:
├─ Estado (multi-select)
├─ Asunto (multi-select)
├─ Prioridad
├─ Sin responder (toggle)
└─ Rango fechas

TicketDetailScreen:
├─ Información cliente
├─ Mensaje original (full)
├─ Adjuntos (galería si existen)
├─ Historial (timeline):
│  ├─ Mensaje cliente
│  ├─ Respuesta admin
│  ├─ Estado changes
│  └─ Timestamps
├─ Area respuesta (rich editor):
│  ├─ Formato texto
│  ├─ Preview
│  └─ Botón enviar
├─ Cambiar estado (dropdown)
├─ Asignar a admin (si múltiples)
├─ Marcar prioridad
└─ Cerrar ticket

Stats:
├─ Total tickets
├─ Promedio respuesta (horas)
├─ Satisfacción cliente (rating)
└─ Trending issues
```

---

## 📄 STATIC PAGES - PÁGINAS DE INFORMACIÓN

### Ubicación
```
Footer menu:
├─ Sobre Nosotros
├─ Política de Privacidad
├─ Términos y Condiciones
├─ Información de Envíos
├─ Política de Devoluciones
└─ Preguntas Frecuentes

Header menu (Settings):
├─ Help
├─ Legal docs
└─ Company info
```

### Pages Requeridas

#### 1. SOBRE NOSOTROS (AboutScreen)
```dart
Contenido:
├─ Hero image (foto empresa)
├─ Intro text (quiénes somos)
├─ Misión statement
├─ Valores (3-4 bullets):
│  ├─ Calidad
│  ├─ Sostenibilidad
│  ├─ Servicio al cliente
│  └─ Innovación
├─ Ubicación/Contacto
├─ Team (opcional, fotos + nombres)
├─ Redes sociales links
└─ "Contacta con nosotros" botón

Backend:
├─ Almacenar en DB (tabla: static_pages)
├─ Admin puede editar (rich editor)
├─ Versionado (history)
└─ Published/Draft states
```

#### 2. POLÍTICA DE PRIVACIDAD (PrivacyPolicyScreen)
```dart
Secciones LEGALES requeridas:
├─ Información que recopilamos
├─ Cómo usamos tu información
├─ Protección de datos
├─ GDPR compliance (si EU)
├─ Cookies policy
├─ Derechos del usuario
│  ├─ Right to access
│  ├─ Right to delete
│  ├─ Right to export
│  └─ Right to object
├─ Retención de datos
├─ Cambios a esta política
├─ Contacto Privacy Officer
└─ Fecha última actualización

Features:
├─ Rich formatted text
├─ Exportable a PDF
├─ Accept checkbox (on signup)
└─ Version control
```

#### 3. TÉRMINOS Y CONDICIONES (TermsScreen)
```dart
Secciones requeridas:
├─ Aceptación de términos
├─ Limitación de responsabilidad
├─ Exclusión de garantías
├─ Derechos propiedad intelectual
├─ Prohibición de uso abusivo
├─ Cancelación de cuenta
├─ Disputas/Jurisdicción
├─ Cambios a términos
├─ Contacto legal
└─ Fecha efectiva

Features:
├─ Accept checkbox (on signup)
├─ PDF exportable
└─ Versionado
```

#### 4. INFORMACIÓN DE ENVÍOS (ShippingInfoScreen)
```dart
Secciones:
├─ Opciones de envío:
│  ├─ Estándar (4-7 días)
│  ├─ Express (2-3 días)
│  └─ Overnight (1 día)
├─ Costos por región
├─ Envío gratis desde €150
├─ Tracking información
├─ Empaquetado sostenible
├─ Internacionales (si aplica)
│  ├─ Países cubiertos
│  ├─ Aranceles/impuestos
│  └─ Tiempos
├─ Estado pedidos:
│  ├─ Cómo ver status
│  ├─ Rastreo número
│  └─ Contactar si problema
└─ FAQs mini

Features:
├─ Estimador tiempo entrega
├─ Calculator costo por país
├─ Link a transportistas
└─ Live tracking link
```

#### 5. POLÍTICA DE DEVOLUCIONES (ReturnsInfoScreen)
```dart
Secciones:
├─ Plazo devolución (30 días)
├─ Condiciones:
│  ├─ Producto sin usar/etiquetar
│  ├─ Original packaging
│  └─ Prueba compra (factura)
├─ Proceso paso a paso:
│  ├─ 1. Solicitar devolución (link)
│  ├─ 2. Recibir etiqueta envío
│  ├─ 3. Enviar producto
│  ├─ 4. Inspección (3-5 días)
│  └─ 5. Reembolso procesado
├─ Excepciones (no retornable):
│  ├─ Custom/personalizado
│  ├─ Clearance items
│  └─ Dañado por cliente
├─ Costo devolución:
│  ├─ Gratis si defecto
│  └─ Cliente paga sino
├─ Tiempo reembolso (5-10 días)
├─ Intercambio disponible
└─ Contactar si problemas

Features:
├─ "Solicitar devolución" botón (link)
├─ Tracking devoluciones
├─ Preguntas frecuentes
└─ Contact support si problema
```

#### 6. PREGUNTAS FRECUENTES (FAQScreen)
```dart
Expandable accordion style:

SECCIONES:
├─ Compras
│  ├─ ¿Qué formas de pago aceptan?
│  ├─ ¿Cuál es el proceso de compra?
│  ├─ ¿Necesito crear una cuenta?
│  ├─ ¿Puedo comprar como invitado?
│  └─ ¿Puedo cambiar mi pedido?
│
├─ Envíos
│  ├─ ¿Cuánto tarda el envío?
│  ├─ ¿Cómo rastrear mi pedido?
│  ├─ ¿Envían internacionalmente?
│  ├─ ¿Cuál es el costo de envío?
│  └─ ¿Ofrecen envío gratis?
│
├─ Productos
│  ├─ ¿Cuál es la guía de tallas?
│  ├─ ¿Tienen muestras de color?
│  ├─ ¿Ofrecen cambios de talla?
│  ├─ ¿Qué significa "última talla"?
│  └─ ¿Cuál es la garantía de los productos?
│
├─ Devoluciones
│  ├─ ¿Cuál es la política de devoluciones?
│  ├─ ¿Cómo solicitar una devolución?
│  ├─ ¿Cuánto tarda el reembolso?
│  ├─ ¿Puedo intercambiar en lugar de devolver?
│  └─ ¿Qué pasa si devuelvo fuera del plazo?
│
├─ Cuenta
│  ├─ ¿Cómo crear una cuenta?
│  ├─ ¿Olvidé mi contraseña?
│  ├─ ¿Cómo actualizar mis datos?
│  ├─ ¿Cómo cancelar mi cuenta?
│  └─ ¿Cómo desuscribirme de emails?
│
├─ Pago
│  ├─ ¿Es seguro mi pago?
│  ├─ ¿Qué tarjetas aceptan?
│  ├─ ¿Por qué fue rechazado mi pago?
│  ├─ ¿Puedo pagar después?
│  └─ ¿Mi pago es protegido?
│
└─ Otro
   ├─ ¿Cuál es la política de privacidad?
   ├─ ¿Cómo reportar un problema?
   ├─ ¿Venden en tienda física?
   └─ ¿Puedo trabajar con ustedes?

Features:
├─ Search FAQ (filtrar mientras escribes)
├─ Expandible accordion
├─ Mostrar respuesta completa
├─ Link a artículos si respuesta muy larga
├─ Rating "¿Fue útil?" (thumbs up/down)
├─ Trending questions (top 5)
├─ "¿No encontraste respuesta?" → ContactScreen
└─ Editable por admin (rich editor)
```

### StaticPageService
```dart
// Obtener página
GET /api/pages/{slug} (public, cached 24h)
Response:
{
  id: UUID,
  slug: "privacy-policy",
  title: "Política de Privacidad",
  content: "<html>...",
  excerpt: "Protegemos tus datos...",
  updated_at: timestamp,
  version: 3
}

// Listado páginas
GET /api/pages?type=info (public)
Response: List<Page>

// Admin: Crear/editar
POST /api/admin/pages
PUT /api/admin/pages/{id}
Requiere: admin role
```

### Navigation Setup
```dart
// En layout footer o menu:

Footer Widget:
├─ COMPANY
│  ├─ About Us (link → /about)
│  ├─ Blog (link → /blog)
│  └─ Careers (link → /careers)
├─ SUPPORT
│  ├─ Contact (link → /contact)
│  ├─ FAQ (link → /faq)
│  └─ Chat support (widget)
├─ LEGAL
│  ├─ Privacy (link → /privacy)
│  ├─ Terms (link → /terms)
│  └─ Cookies (link → /cookies)
├─ SHIPPING
│  ├─ Shipping Info (link → /shipping)
│  ├─ Returns (link → /returns)
│  └─ Track Order (link → /track)
└─ FOLLOW
   ├─ Instagram
   ├─ Facebook
   └─ Twitter
```

---

## 🔔 RESTOCK NOTIFICATIONS - NOTIFICACIONES DE STOCK

### Ubicación & UX
```dart
// ProductDetailScreen:
// Si sin stock (stock == 0):

ALERT CARD (amarillo):
├─ Icono: 📦 "Sin stock"
├─ Botón rojo: "Notificarme cuando haya stock"
└─ Subtext: "Te avisaremos por email"

// Al click:
Dialog / BottomSheet:
├─ "¿Deseas recibir notificación?"
├─ "Te enviaremos un email cuando vuelva a estar disponible"
├─ Email pre-filled (si logueado)
├─ Checkbox: "Notificar por SMS también" (opcional)
├─ Botón: "Sí, notificarme"
└─ Success message: "¡Listo! Te notificaremos"
```

### RestockNotificationService
```dart
// Crear notificación
POST /api/restock/notify
{
  product_id: UUID*
  customer_email: string*
  customer_id?: UUID (si logueado)
  size?: string (si aplicable)
  color?: string (si aplicable)
  notify_sms?: boolean
  phone?: string
}

Response (201):
{
  id: UUID,
  message: "Notificación creada",
  status: "active"
}

// Backend:
├─ Guardar en tabla: restock_notifications
├─ Validar email
├─ Validar phone si SMS enabled
├─ Enviar email confirmación: "Te notificaremos cuando haya stock"
└─ Setup trigger en BD (cuando stock > 0)

// Trigger cuando product stock regresa a > 0:
├─ Obtener todas notificaciones para ese producto
├─ Enviar email a cada: "¡[PRODUCTO] está disponible nuevamente!"
├─ Incluir link directo a producto
├─ SMS si fue solicitado
├─ Marcar notificación como "sent"
├─ Option "Dejar de recibir notificaciones"
└─ Auto-delete después 30 días o click link unsubscribe
```

### Admin Dashboard
```dart
// AdminRestockScreen:

Tabla:
├─ Producto
├─ Email suscriptor
├─ Fecha creación
├─ Notificaciones enviadas (contador)
├─ Estado (Activo/Enviado/Cancelado)
└─ Acciones (Ver historial, Cancelar)

Stats:
├─ Total suscriptores activos
├─ Total notificaciones enviadas
├─ Click-through rate
└─ Trending products (más notificaciones)

Filtros:
├─ Por producto
├─ Por email
├─ Por estado
└─ Por fecha rango
```

---

## 🍞 BREADCRUMB NAVIGATION - MIGAS DE PAN

### Ubicación
```dart
// ProductDetailScreen:
// Encima del producto

AppBar style:
Home > Categoría > Subcategoría > Nombre Producto

Componente BreadcrumbNav:
├─ Home (icono + clickable)
├─ > separator
├─ Categoría (clickable → products filtered)
├─ > separator
├─ Subcategoría (clickable → products filtered) [si existe]
├─ > separator
└─ Producto (text, no clickable)

Styling:
├─ Colores: Azul marino para links, gris para último
├─ Tamaño: 12px pequeño
├─ Interactivo: click abre filtered list
└─ Mobile: colapsable si espacio limitado (mostrar "...> Producto")
```

### Implementation
```dart
// BreadcrumbNav widget:

class BreadcrumbNav extends StatelessWidget {
  final List<BreadcrumbItem> items;
  
  // items:
  // [
  //   BreadcrumbItem(label: "Home", onTap: () => navigate),
  //   BreadcrumbItem(label: "Camisas", onTap: () => navigate),
  //   BreadcrumbItem(label: "Casual", onTap: () => navigate),
  //   BreadcrumbItem(label: "Camisa Azul", onTap: null)
  // ]
}

// Generar desde:
├─ Product.category → Category name
├─ Product.parent_category_id → Subcategory name
└─ Product.name
```

---

## 💡 PRODUCT RECOMMENDATIONS - MOTOR DE RECOMENDACIONES

### Tipos de Recomendaciones

#### 1. RELATED PRODUCTS (Ya existe, mejorar)
```dart
ProductDetailScreen:
├─ "Productos relacionados"
├─ Grid horizontal scrollable (5 items)
├─ Misma categoría + talla compatible
└─ Si click: ir a ese producto
```

#### 2. YOU MIGHT ALSO LIKE (AI-based)
```dart
// Basado en:
├─ Historial visualización usuario
├─ Productos similar en:
│  ├─ Material
│  ├─ Color (similar hex)
│  ├─ Rango precio (±20%)
│  └─ Temporada
├─ Trending (más vendidos)
└─ Ratings altos

// Ubicación:
├─ Abajo de CartScreen (antes checkout)
├─ En HomeScreen (sección)
├─ Bottom sheet en ProductDetailScreen
└─ AccountScreen > Recommendations tab

// UI:
├─ Carousel horizontal
├─ 4-6 productos
├─ ProductCard style
└─ "Ver todos" → filtered list
```

#### 3. TRENDING NOW
```dart
// Más vendidos últimas 2 semanas

// Ubicación:
├─ HomeScreen (después ofertas)
├─ ProductsListScreen (filter aplicable)
└─ Header con badge "TRENDING 🔥"

// Cálculo:
└─ Top 20 por cantidad vendida en últimos 14 días
```

#### 4. SEASONAL / COLECCIONES
```dart
// Ej: Colección Verano, Primavera, etc

// En ProductsListScreen:
├─ Collection filter (dropdown)
├─ Current season auto-selected
└─ Mostrar productos con season_tag

// En HomeScreen:
├─ Sección "Nueva Colección Verano"
├─ Grid 4 items
└─ "Ver colección completa" botón
```

#### 5. PERSONALIZED (Para usuarios logueados)
```dart
// Basado en:
├─ Historial compras (preferencias color, talla, marca)
├─ Wishlist (similaridad)
├─ Browse history (productos visitados)
└─ Ratings dados (si dio 5⭐ a similar)

// ML backend (opcional, básico primero):
├─ Collaborative filtering
├─ Content-based filtering
└─ Hybrid approach
```

### RecommendationService
```dart
// Obtener recomendaciones
GET /api/products/recommendations?type=related&product_id={id}
├─ type: "related" | "trending" | "personalized" | "seasonal"
├─ limit: 10 (default)
└─ exclude_ids: [productIds]

Response:
{
  type: "related",
  products: [Product...],
  reason: "Customers who viewed this also viewed..."
}

// Para trending/seasonal:
GET /api/products/trending?season=summer&limit=10

// Para personalized:
GET /api/products/recommendations/personalized (autenticado)
├─ Incluye user_id en JWT
└─ Backend calcula recomendaciones
```

### Tracking
```dart
// Analytics event:
event: "recommendation_viewed"
├─ recommendation_type: "related"
├─ product_id: UUID
├─ position: 1
└─ timestamp

event: "recommendation_clicked"
├─ recommendation_type: "related"
├─ from_product_id: UUID
├─ to_product_id: UUID
└─ timestamp
```

---

## 🎁 WISHLIST SHARING - COMPARTIR LISTA DE DESEOS

### Ubicación
```dart
// WishlistScreen:

Top bar:
├─ "Mis Favoritos"
├─ Botón compartir (link icon) → abre sharing options
└─ Botón más (···) → otras opciones
```

### Sharing Dialog
```dart
Dialog options:

├─ 1. COPY LINK
│  ├─ "Copiar enlace a wishlist"
│  ├─ fashionstore.com/wishlist/sk-12345-abc
│  ├─ Botón "Copiar"
│  └─ Toast "Copiado al clipboard"
│
├─ 2. QR CODE
│  ├─ Generar QR con link
│  ├─ Mostrar preview
│  ├─ Botón "Descargar QR"
│  └─ Botón "Compartir QR"
│
├─ 3. SOCIAL MEDIA
│  ├─ WhatsApp
│  │  └─ "Mira los productos que me gustan: [link]"
│  ├─ Instagram (DM)
│  ├─ Facebook
│  ├─ Twitter/X
│  └─ Email
│
├─ 4. MAKE PUBLIC
│  ├─ "Hacer pública mi lista"
│  ├─ Toggle: Privada ↔ Pública
│  ├─ Si público: generar URL pública
│  ├─ URL público: fashionstore.com/p/user-name/wishlist
│  └─ Otros pueden ver sin login
│
└─ 5. GIFT REGISTRY (Bonus)
   ├─ "Crear registro de regalos"
   ├─ Eventos (Cumpleaños, Boda, etc)
   ├─ Compartir con amigos
   └─ Tracking quién compró qué
```

### Public Wishlist View
```dart
// Visitante abre link público

Screen:
├─ Nombre usuario: "[Name]'s Wishlist"
├─ Evento (si gift registry)
├─ Grid productos favoritos
├─ Para cada producto:
│  ├─ ProductCard
│  ├─ Button "Comprar"
│  ├─ Button "Agregar a mi wishlist" (si diferente usuario)
│  └─ Mostrar si "Comprado por [friend]" (si gift registry)
├─ "Compra desde esta lista" CTA prominente
└─ Share button (invitar otros amigos)
```

### Backend
```dart
// Crear/obtener wishlist público
POST /api/wishlists/make-public
{
  wishlist_id: UUID
}

Response:
{
  public_token: "sk-12345-abc",
  public_url: "https://fashionstore.com/p/username/wishlist",
  qr_code: "data:image/png;base64,..."
}

// Obtener wishlist público
GET /api/wishlists/public/{public_token}
Response: { wishlist_items: [Product...] }

// Gift registry
POST /api/gift-registry
{
  wishlist_id: UUID,
  event_type: "birthday" | "wedding" | "anniversary",
  event_date: date,
  event_name: string
}
```

---

## 👥 REFERRAL PROGRAM - PROGRAMA DE REFERIDOS

### Concepto
```
Invita amigos → Ambos ganan descuento

Usuario A: invita amigo con código "ANAME123"
  → A gana €10 descuento
  → Amigo gana €10 descuento en primera compra

Límite: Máximo 10 referidos por usuario
```

### ReferralScreen (AccountScreen tab)
```dart
Secciones:

1. MI CÓDIGO REFERRAL:
   ├─ Grande y destacado: "MYNAME123"
   ├─ Botón "Copiar código"
   ├─ Botón "Copiar enlace"
   │  └─ fashionstore.com?ref=MYNAME123
   ├─ QR con link (descargar/compartir)
   └─ "Comparte con amigos"

2. STATS:
   ├─ Total referidos
   ├─ Compras realizadas (by referidos)
   ├─ Dinero ahorrado (total de descuentos)
   └─ Pendiente de activación

3. HISTORIAL REFERIDOS:
   Tabla:
   ├─ Nombre/Email amigo
   ├─ Fecha referencia
   ├─ Estado (Pendiente/Compró/Activo)
   ├─ Descuento ganado
   └─ Recompensa obtenida

4. SHARE BUTTONS:
   ├─ WhatsApp
   ├─ Instagram
   ├─ Email
   └─ Copy link
```

### ReferralService
```dart
// Crear código referral (automático en signup)
POST /api/referrals/generate
Response:
{
  code: "MYNAME123",
  share_url: "https://fashionstore.com?ref=MYNAME123"
}

// Aplicar código referral (en checkout)
POST /api/referrals/apply
{
  referral_code: "MYNAME123"
}
Response:
{
  discount: 10, // €10
  referrer: "Friend Name"
}

// Obtener estadísticas referral
GET /api/referrals/stats (autenticado)
Response:
{
  code: "MYNAME123",
  total_referrals: 5,
  completed_purchases: 3,
  total_discount_earned: 30,
  pending: 2,
  referrals: [
    { email, status, date, discount }
  ]
}

// Listar referidos
GET /api/referrals/list (autenticado)
```

### Admin Dashboard - Referrals
```dart
// AdminReferralsScreen:

Stats:
├─ Total referrals en sistema
├─ Active referrers
├─ Total discounts issued
├─ Conversion rate (referidos que compraron)

Tabla referrers:
├─ Usuario
├─ Código
├─ Referrals count
├─ Compras conversión
├─ Discount total
└─ Acciones (Ver detalle, Desactivar)

Tabla referrals:
├─ Referrer
├─ Referred user
├─ Status
├─ Date
├─ Discount offered
└─ Acciones
```

---

## 🔄 PRODUCT COMPARISON - COMPARAR PRODUCTOS

### Ubicación
```dart
// ProductsListScreen:

En ProductCard (top right):
├─ Checkbox pequeño (para seleccionar)
├─ "Comparar" botón (flotante, bottom)
│  └─ Si <2 seleccionados: disabled
│  └─ Si 2-4 seleccionados: enabled con contador
│
// ProductDetailScreen:
├─ "Comparar con similar" botón
└─ Abre search con filtro (misma categoría)
```

### ComparisonScreen
```dart
Layout:

1. TOP:
   ├─ Productos seleccionados (scroll horizontal)
   ├─ Para cada: ProductCard + X botón
   ├─ "Agregar más" botón (max 4)
   └─ Botón "Limpiar comparación"

2. COMPARISON TABLE:
   Filas (propiedades):
   ├─ Imagen
   ├─ Nombre
   ├─ Precio
   ├─ Descuento (%)
   ├─ Rating
   ├─ Stock
   ├─ Material
   ├─ Tallas
   ├─ Colores
   ├─ Garantía
   ├─ Envío
   └─ "Comprar" botón

   Layout:
   ├─ Primera columna: Nombre propiedad
   ├─ Siguientes columnas: Cada producto
   ├─ Scroll horizontal si muchas props
   ├─ Highlighting: Mejor valor highlighted (ej. price)
   └─ Responsive: Stack en mobile

3. BOTTOM:
   ├─ Botones "Comprar" para cada producto
   ├─ Link "Agregar todos al carrito"
   └─ Share comparison (link)
```

### Backend
```dart
// Guardar comparación
POST /api/comparisons
{
  product_ids: [UUID, UUID, UUID]
}
Response:
{
  comparison_id: UUID,
  share_token: "cmp-12345",
  url: "fashionstore.com/compare/cmp-12345"
}

// Compartir comparación pública
GET /api/comparisons/{share_token}
Response: { products: [Product...] }
```

---

## 🌍 REGIONAL AVAILABILITY - DISPONIBILIDAD REGIONAL

### ProductDetailScreen Enhancement
```dart
Agregar sección:

AVAILABILITY BY REGION:
├─ "¿En dónde puedo recibirlo?"
├─ Selector país (dropdown o mapa):
│  ├─ Selecciona tu país
│  ├─ Muestra:
│  │  ├─ ¿Stock disponible? (Sí/No badge)
│  │  ├─ Costo envío
│  │  ├─ Estimación entrega (días)
│  │  ├─ Impuestos/aranceles (si existe)
│  │  └─ Disponibilidad en tienda física (si existe)
│  └─ Link cambiar país (wallet icon si guest)
│
└─ "Cambiar región" botón (en checkout también)

Mapa mundial (bonus):
├─ Mostrar regiones donde envían
├─ Click país → detalles
└─ Visual: Países verdes (disponible), grises (no)
```

### Implementation
```dart
// Regionalization service

GET /api/regions (public, cached)
Response:
[
  {
    id: "ES",
    name: "España",
    shipping_cost: 499,
    estimated_days: 5,
    free_shipping_threshold: 15000,
    taxes: "21%",
    supported: true
  },
  {
    id: "FR",
    name: "Francia",
    shipping_cost: 799,
    estimated_days: 7,
    free_shipping_threshold: 20000,
    taxes: "20%",
    supported: true
  }
]

// Checkouts multiregion:
├─ Almacenar región seleccionada
├─ Recalcular envío según región
├─ Agregar aranceles si existe
├─ Validar dirección según región
└─ Adaptar métodos pago disponibles
```

---

## 📧 ADVANCED EMAIL NOTIFICATIONS - EMAILS AUTOMÁTICOS

### Email Triggers

#### 1. WELCOME EMAIL
```
Triggered: Cuando usuario se registra
Destinatario: Email usuario
Contenido:
├─ "¡Bienvenido a FashionStore!"
├─ Introducción tienda
├─ Primeras acciones (explorar, wishlist)
├─ Oferta especial: "10% en tu primer pedido"
│  └─ Código: WELCOME10
├─ Links sociales
└─ CTA: "Explorar ahora"

Template variables:
├─ {{name}}
├─ {{discount_code}}
├─ {{discount_percent}}
└─ {{expiry_date}}
```

#### 2. ABANDONED CART EMAIL
```
Triggered: 1 hora después de agregar al carrito (sin comprar)
Destinatario: Email usuario
Contenido:
├─ "Olvidaste algo..."
├─ Mostrar productos en carrito:
│  └─ Imagen small, nombre, precio
├─ Carrito total
├─ Botón: "Completar compra"
├─ Incentivo: "5% descuento si compras en 24h"
└─ "No estoy interesado" link (unsubscribe)

Template variables:
├─ {{cart_items}}
├─ {{cart_total}}
├─ {{discount_code}}
└─ {{expiry_time}}
```

#### 3. ORDER CONFIRMATION EMAIL
```
Triggered: Inmediatamente después de pagar
Destinatario: Email usuario + admin
Contenido:
├─ Número orden (copiable)
├─ Items detallados (tabla)
├─ Desglose precios (subtotal, IVA, envío)
├─ Total
├─ Dirección envío
├─ "Rastrear orden" botón
├─ "Ver factura" botón (PDF)
├─ Tiempo entrega estimado
└─ "Cualquier pregunta: contactanos"

Template variables:
├─ {{order_number}}
├─ {{order_items}}
├─ {{order_total}}
├─ {{tracking_url}}
└─ {{estimated_delivery}}
```

#### 4. SHIPPING NOTIFICATION EMAIL
```
Triggered: Cuando orden es enviada (status → shipped)
Destinatario: Email usuario
Contenido:
├─ "¡Tu pedido está en camino!"
├─ Número orden
├─ Número seguimiento (clickable)
├─ Transportista (link)
├─ Items enviados
├─ Dirección entrega
├─ Estimación entrega
├─ Map con ruta (si disponible)
├─ "Rastrear en tiempo real" botón
└─ "Problemas con envío: contactanos"

Template variables:
├─ {{order_number}}
├─ {{tracking_number}}
├─ {{carrier_name}}
├─ {{carrier_url}}
├─ {{estimated_delivery}}
└─ {{items_count}}
```

#### 5. DELIVERY CONFIRMATION EMAIL
```
Triggered: Cuando orden marca como entregada
Destinatario: Email usuario
Contenido:
├─ "¡Tu pedido fue entregado!"
├─ Fecha/hora entrega
├─ Firma confirmación (si disponible)
├─ Items entregados (lista breve)
├─ "¿Cómo fue tu experiencia?"
├─ CTA: Dejar review (1-5 estrellas)
├─ "¿Hay algún problema?" → ContactScreen
└─ Recomendaciones productos relacionados

Template variables:
├─ {{delivery_date}}
├─ {{delivery_time}}
├─ {{items_delivered}}
└─ {{review_link}}
```

#### 6. RETURN APPROVED EMAIL
```
Triggered: Cuando devolución es aprobada
Destinatario: Email usuario
Contenido:
├─ "¡Tu devolución fue aprobada!"
├─ Número orden original
├─ Productos a devolver (lista)
├─ Instrucciones paso a paso:
│  ├─ 1. Descargar etiqueta envío (link PDF)
│  ├─ 2. Preparar paquete
│  ├─ 3. Llevar transportista
│  └─ 4. Proporcionar número seguimiento
├─ "Descargar etiqueta" botón (PDF)
├─ Tiempo proceso reembolso (5-10 días)
├─ Número seguimiento devolución (después trackeado)
└─ Questions: ContactScreen link

Template variables:
├─ {{return_number}}
├─ {{return_items}}
├─ {{label_url}}
├─ {{tracking_number}}
└─ {{refund_timeline}}
```

#### 7. REFUND PROCESSED EMAIL
```
Triggered: Cuando reembolso es procesado
Destinatario: Email usuario
Contenido:
├─ "¡Tu reembolso fue procesado!"
├─ Número orden original
├─ Monto reembolsado
├─ "El dinero llegará a tu cuenta en 3-5 días"
├─ Número autorización devolución
├─ Items reembolsados (lista)
├─ "Valoración de tu experiencia" → Rating form
└─ "¿Hay algo que podamos mejorar?"

Template variables:
├─ {{order_number}}
├─ {{refund_amount}}
├─ {{return_number}}
├─ {{items_count}}
└─ {{refund_date}}
```

#### 8. RESTOCK NOTIFICATION EMAIL
```
Triggered: Cuando producto en notificación vuelve a stock
Destinatario: Email usuario (si suscrito)
Contenido:
├─ "¡[PRODUCTO] está disponible nuevamente!"
├─ Imagen producto (pequeña)
├─ Nombre y precio
├─ Botón "Comprar ahora"
├─ Link directo a producto
├─ "Solo quedan pocas unidades"
├─ "Dejar de recibir notificaciones" link
└─ Otras recomendaciones similares (si stock disponible)

Template variables:
├─ {{product_name}}
├─ {{product_image}}
├─ {{product_price}}
├─ {{product_url}}
└─ {{stock_available}}
```

#### 9. REVIEW REQUEST EMAIL
```
Triggered: 5 días después de entrega
Destinatario: Email usuario
Contenido:
├─ "¿Qué te pareció tu compra?"
├─ Productos entregados (imagenes pequeñas)
├─ "Déjanos tu opinión" → ReviewScreen link
├─ Star rating (clickable directo: 1-5⭐)
│  └─ Si click: abre form review
├─ Botón "Escribir reseña"
├─ "Tu opinión nos ayuda"
└─ "No, gracias" link

Template variables:
├─ {{order_number}}
├─ {{product_names}}
├─ {{review_url}}
└─ {{unsubscribe_url}}
```

#### 10. ANNIVERSARY/BIRTHDAY EMAIL
```
Triggered: Día cumpleaños / Aniversario compra
Destinatario: Email usuario (si opt-in)
Contenido:
├─ "¡Feliz cumpleaños [Name]!"
├─ "Especial para ti: 15% descuento"
├─ Código único: BIRTHDAY15-12345
├─ Válido 7 días
├─ Recomendaciones productos populares
├─ Botón "Comprar ahora"
└─ "¡Que lo disfrutes!"

Template variables:
├─ {{name}}
├─ {{discount_code}}
├─ {{discount_percent}}
├─ {{expiry_date}}
└─ {{recommended_products}}
```

### EmailService Implementation
```dart
// Backend (Node.js example)

const emailQueue = new Queue('emails');

// Trigger email
emailQueue.add({
  type: 'order_confirmation',
  user_id: userId,
  order_id: orderId,
  template_vars: {
    order_number: '12345',
    order_items: [...],
    order_total: '€159.90'
  }
}, {
  delay: 0, // immediate
  attempts: 3 // retry 3 times
});

// Worker
emailQueue.process(async (job) => {
  const { type, template_vars } = job.data;
  
  // Compilar template
  const template = loadTemplate(type);
  const html = template.render(template_vars);
  
  // Enviar con SendGrid/Mailgun
  await sendEmail({
    to: template_vars.customer_email,
    subject: template.subject,
    html,
    from: 'noreply@fashionstore.com'
  });
  
  // Log envío en BD
  await logEmailSent(type, job.data);
});

// Admin: Ver historiales de emails
GET /api/admin/emails/log?user_id={id}
Response: [
  {
    type: 'order_confirmation',
    sent_at: timestamp,
    opened_at: timestamp,
    clicked_at: timestamp,
    bounced: false
  }
]
```

---

## 📋 LISTA MAESTRA DE TAREAS - CARACTERÍSTICAS RESTANTES

### FASE 13: STATIC PAGES & CONTACT (5 tareas)
- [ ] Crear ContactScreen con form
- [ ] Implementar ContactService (backend endpoint)
- [ ] Admin support tickets dashboard
- [ ] Crear static pages (About, Privacy, Terms, Shipping, Returns, FAQ)
- [ ] Setup page management admin (CRUD)

### FASE 14: NOTIFICATIONS & SHARING (8 tareas)
- [ ] Implementar RestockNotificationService
- [ ] Crear restock notification UI
- [ ] Admin restock notifications dashboard
- [ ] Wishlist sharing (link, QR, social)
- [ ] Public wishlist view
- [ ] Gift registry (bonus)
- [ ] Referral program screens
- [ ] Admin referrals dashboard

### FASE 15: UX IMPROVEMENTS (6 tareas)
- [ ] Breadcrumb navigation component
- [ ] Product recommendations engine
- [ ] Product comparison feature
- [ ] Regional availability selector
- [ ] Advanced email notifications setup
- [ ] Email template management (admin)

### FASE 16: TESTING THESE FEATURES (4 tareas)
- [ ] Tests for contact form (validation, submission)
- [ ] Tests for restock notifications
- [ ] Tests for wishlist sharing
- [ ] Tests for product recommendations

### FASE 17: DEPLOYMENT (3 tareas)
- [ ] Deploy new features to staging
- [ ] QA testing todas las características
- [ ] Deploy to production

---

## 🔗 INTEGRACIÓN CON FASE 1-12

### Cambios a pubspec.yaml (Agregar)
```yaml
dependencies:
  # Para email templates
  handlebars: ^1.0.0
  
  # Para comparación de productos
  collection: ^1.18.0
  
  # Para QR codes
  qr_flutter: ^4.1.0
  
  # Para maps (regional availability)
  google_maps_flutter: ^2.3.0
  
  # Para social sharing mejorado
  share_plus: ^7.0.0
  
  # Para referral tracking
  share: ^2.0.0
```

### Cambios a Admin Dashboard (Agregar al sidebar)
```dart
AdminLayout:
├─ Dashboard
├─ Productos
├─ Pedidos
├─ Órdenes
├─ Devoluciones
├─ + NUEVO: Soporte (Support Tickets)
├─ + NUEVO: Contacto (Contact Messages)
├─ + NUEVO: Restock (Restock Notifications)
├─ + NUEVO: Referrals (Referral Program)
├─ Categorías
├─ Configuración
│  ├─ Email templates (NEW)
│  ├─ Static pages (NEW)
│  └─ ...resto
└─ Analytics
```

### Base de Datos - Nuevas Tablas
```sql
-- Support tickets
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY,
  ticket_id VARCHAR UNIQUE,
  customer_id UUID NOT NULL FK,
  subject VARCHAR NOT NULL,
  message TEXT NOT NULL,
  attachments JSON,
  status VARCHAR (new, in_progress, responded, closed, spam),
  priority VARCHAR (high, normal, low),
  created_at TIMESTAMP,
  responded_at TIMESTAMP,
  resolved_at TIMESTAMP
);

-- Restock notifications
CREATE TABLE restock_notifications (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL FK,
  customer_email VARCHAR NOT NULL,
  customer_id UUID FK,
  size VARCHAR,
  color VARCHAR,
  notify_sms BOOLEAN,
  phone VARCHAR,
  status VARCHAR (active, sent, cancelled),
  created_at TIMESTAMP,
  sent_at TIMESTAMP
);

-- Wishlists (mejorado con sharing)
CREATE TABLE wishlists (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL FK,
  product_id UUID NOT NULL FK,
  is_public BOOLEAN DEFAULT false,
  public_token VARCHAR UNIQUE,
  created_at TIMESTAMP
);

-- Gift registries
CREATE TABLE gift_registries (
  id UUID PRIMARY KEY,
  wishlist_id UUID NOT NULL FK,
  event_type VARCHAR (birthday, wedding, anniversary),
  event_date DATE,
  event_name VARCHAR,
  created_at TIMESTAMP
);

-- Referral program
CREATE TABLE referral_codes (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL FK,
  code VARCHAR UNIQUE,
  created_at TIMESTAMP
);

CREATE TABLE referrals (
  id UUID PRIMARY KEY,
  referrer_id UUID NOT NULL FK,
  referred_email VARCHAR,
  referred_id UUID FK,
  status VARCHAR (pending, completed, purchased),
  discount_amount INTEGER,
  created_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Product comparisons (sharedable)
CREATE TABLE product_comparisons (
  id UUID PRIMARY KEY,
  comparison_token VARCHAR UNIQUE,
  product_ids UUID[],
  created_at TIMESTAMP
);

-- Email logs
CREATE TABLE email_logs (
  id UUID PRIMARY KEY,
  user_id UUID FK,
  email_type VARCHAR,
  recipient VARCHAR,
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  bounced BOOLEAN DEFAULT false
);

-- Static pages
CREATE TABLE static_pages (
  id UUID PRIMARY KEY,
  slug VARCHAR UNIQUE,
  title VARCHAR,
  content TEXT (rich HTML),
  version INTEGER,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  updated_by UUID FK (admin)
);
```

### Endpoints Backend a Agregar
```
POST /api/contact/send (público)
GET /api/pages/{slug} (público, cached)
GET /api/pages (público, list)
POST /api/admin/pages (admin)
PUT /api/admin/pages/{id} (admin)
DELETE /api/admin/pages/{id} (admin)

POST /api/restock/notify (público)
GET /api/restock/notifications (autenticado)
DELETE /api/restock/notifications/{id} (autenticado)

GET /api/wishlists/public/{token} (público)
POST /api/wishlists/make-public (autenticado)
POST /api/wishlists/share (autenticado)

POST /api/gift-registry (autenticado)
GET /api/gift-registry/{id} (público)

POST /api/referrals/apply (checkout)
GET /api/referrals/stats (autenticado)
GET /api/referrals/list (autenticado)

POST /api/comparisons (público)
GET /api/comparisons/{token} (público)

GET /api/regions (público)
GET /api/products/recommendations (público)
GET /api/products/trending (público)

POST /api/admin/emails/send-test (admin)
GET /api/admin/emails/templates (admin)
PUT /api/admin/emails/templates/{id} (admin)
GET /api/admin/emails/log (admin)
```

---

## ✅ INDICADORES DE ÉXITO (CARACTERÍSTICAS RESTANTES)

**FASE 13 Completada:**
✅ Contacto form funciona y envía email
✅ Static pages visibles (Privacy, Terms, etc)
✅ Admin puede editar páginas

**FASE 14 Completada:**
✅ Restock notifications se guardan
✅ Email se envía cuando stock regresa
✅ Wishlist puede compartirse (link + QR)
✅ Referral program calcula discounts

**FASE 15 Completada:**
✅ Breadcrumbs visible y navegables
✅ Recommendations muestran en producto
✅ Comparison table funciona
✅ Regional availability selector filtra

**FASE 16 Completada:**
✅ Tests para contact form pasan
✅ Tests para restock notifications pasan
✅ Tests para wishlist sharing pasan
✅ Tests para recommendations pasan

**FASE 17 Completada:**
✅ Todas características en staging OK
✅ QA team certifica
✅ Deploy a production exitoso

---

## 🎯 CÓMO USAR ESTE ARCHIVO

### Opción 1: Agregar al final del prompt principal
```
1. Copia ESTE archivo completo
2. Pégalo en Claude DESPUÉS de terminar Fase 12
3. Claude continúa con Fase 13-17
```

### Opción 2: Usarlo como referencia
```
1. Mantén este archivo abierto
2. Mientras Claude implementa Fases 1-12
3. Al terminar Fase 12, pasa este documento
4. Claude implementa Fases 13-17
```

### Opción 3: Integrar al principal
```
1. Abre PROMPT_FLUTTER_COMPLETO_FINAL.md
2. En la sección "12. DEPLOYMENT", agrega Fases 13-17
3. Pasa documento COMPLETO a Claude
4. Claude implementa TODO de una vez (recomendado)
```

---

## 📞 RESUMEN RÁPIDO

| Característica | Tareas | Tiempo | Prioridad |
|---|---|---|---|
| Contact Screen | 2 | 4h | CRÍTICO |
| Static Pages | 2 | 3h | CRÍTICO |
| Restock Notifications | 3 | 4h | ALTA |
| Breadcrumb Navigation | 1 | 1h | MEDIA |
| Product Recommendations | 2 | 5h | MEDIA |
| Wishlist Sharing | 2 | 3h | MEDIA |
| Referral Program | 2 | 4h | BAJA |
| Product Comparison | 2 | 3h | BAJA |
| Regional Availability | 1 | 2h | BAJA |
| Advanced Emails | 2 | 6h | ALTA |
| **TOTAL** | **19** | **35h** | **2-3 semanas** |

---

**VERSIÓN:** 1.0 - Características Restantes  
**FECHA:** 1 de febrero de 2026  
**ESTADO:** ✅ LISTO PARA USAR  
**PRÓXIMA FASE:** Pasar a Claude después Fase 12  

**¡USA ESTE ARCHIVO DESPUÉS DE TERMINAR LAS 12 FASES PRINCIPALES!** 🚀
