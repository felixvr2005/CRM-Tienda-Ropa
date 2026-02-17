# 📘 DOCUMENTACIÓN TÉCNICA OFICIAL
## SISTEMA E-COMMERCE MÓVIL - TIENDA ROPA
### Documento Interno de Ingeniería v3.0

---

**Empresa:** FashionStore Tech S.L.  
**Proyecto:** Sistema E-Commerce Móvil  
**Versión del documento:** 3.0.0  
**Fecha de creación:** 15 de octubre de 2025  
**Última actualización:** 3 de febrero de 2026  
**Clasificación:** INTERNO - CONFIDENCIAL  
**Autores:** Equipo de Ingeniería  

---

# ÍNDICE MAESTRO

| Sección | Contenido | Página |
|---------|-----------|--------|
| 1 | Arquitectura General del Sistema | 1 |
| 2 | Stack Tecnológico y Justificación | 2 |
| 3 | Estructura de Carpetas Completa | 3 |
| 4 | Base de Datos - Schema Completo | 4 |
| 5 | Sistema de Autenticación JWT | 5 |
| 6 | Claves y Secretos del Sistema | 6 |
| 7 | API REST - Endpoints Completos | 7 |
| 8 | Sistema de Correos Electrónicos | 8 |
| 9 | Flujos de Datos Completos | 9 |
| 10 | App Cliente - Pantalla por Pantalla | 10 |
| 11 | Panel Administrador Completo | 11 |
| 12 | Middleware, Roles y Permisos | 12 |
| 13 | Estructura del Código Base | 13 |
| 14 | Consultas SQL y Logs | 14 |
| 15 | Escalabilidad y Futuro | 15 |

---

# ═══════════════════════════════════════════════════════════════
# SECCIÓN 1: ARQUITECTURA GENERAL DEL SISTEMA
# ═══════════════════════════════════════════════════════════════

## 1.1 DIAGRAMA DE ARQUITECTURA COMPLETO

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS (TLS 1.3)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CLOUDFLARE CDN                                       │
│  ├─ WAF (Web Application Firewall)                                          │
│  ├─ DDoS Protection                                                          │
│  ├─ SSL/TLS Termination                                                      │
│  └─ Edge Caching (imágenes, assets)                                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│      APP FLUTTER (CLIENTE)    │   │      WEB ADMIN (REACT)        │
│  ├─ Android APK               │   │  ├─ Panel Administrador       │
│  ├─ iOS IPA                   │   │  ├─ Dashboard                 │
│  ├─ Provider (State)          │   │  └─ Gestión completa          │
│  ├─ HTTP Client (Dio)         │   │                               │
│  └─ Secure Storage            │   │                               │
└───────────────────────────────┘   └───────────────────────────────┘
                    │                               │
                    └───────────────┬───────────────┘
                                    │
                                    │ REST API (HTTPS)
                                    │ Headers: Authorization, Content-Type
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LOAD BALANCER (NGINX)                              │
│  ├─ Round Robin Distribution                                                │
│  ├─ Health Checks                                                           │
│  ├─ SSL Passthrough                                                         │
│  └─ Rate Limiting (10000 req/min)                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            │                       │                       │
            ▼                       ▼                       ▼
┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
│   API SERVER 1    │   │   API SERVER 2    │   │   API SERVER 3    │
│   (Node.js)       │   │   (Node.js)       │   │   (Node.js)       │
│   Port: 3001      │   │   Port: 3002      │   │   Port: 3003      │
└───────────────────┘   └───────────────────┘   └───────────────────┘
            │                       │                       │
            └───────────────────────┼───────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│  POSTGRESQL   │         │    REDIS      │         │  SUPABASE     │
│  (Primary DB) │         │   (Cache)     │         │  (Storage)    │
│  Port: 5432   │         │  Port: 6379   │         │  (Bucket)     │
│  ├─ Datos     │         │  ├─ Sessions  │         │  ├─ Imágenes  │
│  ├─ Usuarios  │         │  ├─ Cache     │         │  ├─ Docs      │
│  └─ Pedidos   │         │  └─ Tokens    │         │  └─ Backups   │
└───────────────┘         └───────────────┘         └───────────────┘
        │
        ▼
┌───────────────┐
│  POSTGRESQL   │
│  (Replica)    │
│  Read-Only    │
└───────────────┘

                    SERVICIOS EXTERNOS CONECTADOS
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   STRIPE    │  │  SENDGRID   │  │  FIREBASE   │  │ CLOUDINARY  │        │
│  │   (Pagos)   │  │  (Emails)   │  │   (Push)    │  │ (Imágenes)  │        │
│  │             │  │             │  │             │  │             │        │
│  │ Webhooks    │  │ SMTP API    │  │ FCM API     │  │ Transform   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 1.2 FLUJO DE COMUNICACIÓN DETALLADO

```
CLIENTE (Flutter/Web)                    SERVIDOR                         BASE DE DATOS
        │                                    │                                   │
        │  1. HTTP Request                   │                                   │
        │  POST /api/auth/login              │                                   │
        │  Headers:                          │                                   │
        │    Content-Type: application/json  │                                   │
        │  Body:                             │                                   │
        │    {"email":"x","password":"y"}    │                                   │
        │ ─────────────────────────────────► │                                   │
        │                                    │                                   │
        │                                    │  2. Middleware Chain              │
        │                                    │  ├─ CORS Check                    │
        │                                    │  ├─ Rate Limit Check              │
        │                                    │  ├─ Request Logger                │
        │                                    │  └─ Body Parser                   │
        │                                    │                                   │
        │                                    │  3. SQL Query                     │
        │                                    │  SELECT * FROM users              │
        │                                    │  WHERE email = $1                 │
        │                                    │ ─────────────────────────────────►│
        │                                    │                                   │
        │                                    │  4. Result                        │
        │                                    │ ◄─────────────────────────────────│
        │                                    │                                   │
        │                                    │  5. Bcrypt Compare                │
        │                                    │  6. Generate JWT                  │
        │                                    │  7. Create Session                │
        │                                    │                                   │
        │  8. HTTP Response                  │                                   │
        │  Status: 200 OK                    │                                   │
        │  Body:                             │                                   │
        │    {"success":true,                │                                   │
        │     "tokens":{...},                │                                   │
        │     "user":{...}}                  │                                   │
        │ ◄───────────────────────────────── │                                   │
        │                                    │                                   │
        │  9. Store in Secure Storage        │                                   │
        │  10. Navigate to Home              │                                   │
        │                                    │                                   │
```

## 1.3 COMPONENTES DEL SISTEMA

### CAPA DE PRESENTACIÓN (Frontend)
```
┌─────────────────────────────────────────────────────────────┐
│                    APP FLUTTER                               │
├─────────────────────────────────────────────────────────────┤
│ Framework: Flutter 3.19+                                    │
│ Lenguaje: Dart 3.3+                                         │
│ State Management: Provider + Riverpod                       │
│ HTTP Client: Dio 5.x                                        │
│ Storage: flutter_secure_storage                             │
│ Push: firebase_messaging                                    │
│ Pagos: stripe_flutter                                       │
│ Cache: hive                                                 │
│ Imágenes: cached_network_image                              │
├─────────────────────────────────────────────────────────────┤
│ Plataformas:                                                │
│ ├─ Android: SDK 21+ (Lollipop)                             │
│ ├─ iOS: 12.0+                                               │
│ └─ Web: Chrome, Safari, Firefox                             │
└─────────────────────────────────────────────────────────────┘
```

### CAPA DE NEGOCIO (Backend)
```
┌─────────────────────────────────────────────────────────────┐
│                    API SERVER                                │
├─────────────────────────────────────────────────────────────┤
│ Runtime: Node.js 20 LTS                                     │
│ Framework: Express.js 4.18                                  │
│ ORM: Sequelize 6.35 / Knex.js 3.1                          │
│ Validación: Joi 17.x                                        │
│ Auth: jsonwebtoken 9.x                                      │
│ Hash: bcryptjs 2.4                                          │
│ Email: Nodemailer 6.9                                       │
│ Logging: Winston 3.11 + Morgan 1.10                         │
│ Testing: Jest 29 + Supertest 6                              │
├─────────────────────────────────────────────────────────────┤
│ Proceso:                                                    │
│ ├─ PM2 (Process Manager)                                    │
│ ├─ Cluster Mode (4 workers)                                 │
│ └─ Auto-restart on failure                                  │
└─────────────────────────────────────────────────────────────┘
```

### CAPA DE DATOS (Database)
```
┌─────────────────────────────────────────────────────────────┐
│                    POSTGRESQL 15                             │
├─────────────────────────────────────────────────────────────┤
│ Versión: 15.4                                               │
│ Extensiones:                                                │
│ ├─ uuid-ossp (UUIDs)                                        │
│ ├─ pg_trgm (búsqueda fuzzy)                                │
│ ├─ btree_gin (índices)                                      │
│ └─ pgcrypto (encriptación)                                  │
├─────────────────────────────────────────────────────────────┤
│ Configuración:                                              │
│ ├─ max_connections: 200                                     │
│ ├─ shared_buffers: 256MB                                    │
│ ├─ work_mem: 64MB                                           │
│ └─ maintenance_work_mem: 128MB                              │
├─────────────────────────────────────────────────────────────┤
│ Backup:                                                     │
│ ├─ pg_dump diario a las 03:00 UTC                          │
│ ├─ Retención: 30 días                                       │
│ └─ Storage: Supabase Bucket (encrypted)                     │
└─────────────────────────────────────────────────────────────┘
```

---

# ═══════════════════════════════════════════════════════════════
# SECCIÓN 2: STACK TECNOLÓGICO Y JUSTIFICACIÓN
# ═══════════════════════════════════════════════════════════════

## 2.1 TABLA DE TECNOLOGÍAS

| Componente | Tecnología | Versión | Justificación |
|------------|------------|---------|---------------|
| App Móvil | Flutter | 3.19.0 | Cross-platform, rendimiento nativo, hot reload |
| Lenguaje App | Dart | 3.3.0 | Tipado fuerte, null safety, async/await |
| Backend | Node.js | 20.11.0 | Event-driven, ecosistema NPM, escalable |
| Framework API | Express.js | 4.18.2 | Minimalista, middleware, estándar industria |
| Base de Datos | PostgreSQL | 15.4 | ACID, JSON support, extensiones, fiabilidad |
| Cache | Redis | 7.2 | In-memory, pub/sub, sessions, rate limiting |
| ORM | Sequelize | 6.35.2 | Migrations, models, relations, transactions |
| Autenticación | JWT | 9.0.2 | Stateless, escalable, estándar |
| Hash | bcryptjs | 2.4.3 | Seguro, salt automático, estándar |
| Email | SendGrid | API v3 | Deliverability, templates, analytics |
| Pagos | Stripe | 14.5.0 | PCI compliant, webhooks, SDK Flutter |
| Storage | Supabase | 2.39.0 | S3 compatible, CDN, transformaciones |
| Push | Firebase | 11.x | FCM, analytics, cross-platform |
| CDN | Cloudflare | N/A | Cache, WAF, DDoS, global edge |
| Logs | Winston | 3.11.0 | Transports, levels, formatters |
| Monitoreo | Sentry | 7.x | Error tracking, performance, alerts |
| CI/CD | GitHub Actions | N/A | Workflows, secrets, deployments |
| Container | Docker | 24.x | Portable, reproducible, orchestration |
| Orquestación | Docker Compose | 2.x | Multi-container, dev environment |

## 2.2 DEPENDENCIAS BACKEND (package.json)

```json
{
  "name": "fashionstore-api",
  "version": "3.0.0",
  "description": "API Backend para FashionStore E-Commerce",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "migrate": "sequelize db:migrate",
    "migrate:undo": "sequelize db:migrate:undo",
    "seed": "sequelize db:seed:all",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.35.2",
    "pg": "^8.11.3",
    "pg-hstore": "^2.3.4",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "joi": "^17.11.0",
    "express-validator": "^7.0.1",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.7",
    "@sendgrid/mail": "^7.7.0",
    "stripe": "^14.5.0",
    "redis": "^4.6.11",
    "ioredis": "^5.3.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "rate-limit-redis": "^4.2.0",
    "dotenv": "^16.3.1",
    "winston": "^3.11.0",
    "morgan": "^1.10.0",
    "uuid": "^9.0.1",
    "moment": "^2.29.4",
    "luxon": "^3.4.4",
    "slugify": "^1.6.6",
    "sharp": "^0.33.1",
    "compression": "^1.7.4",
    "cookie-parser": "^1.4.6",
    "express-session": "^1.17.3",
    "connect-redis": "^7.1.0",
    "firebase-admin": "^12.0.0",
    "@supabase/supabase-js": "^2.39.0",
    "cloudinary": "^1.41.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "eslint": "^8.56.0",
    "eslint-config-prettier": "^9.1.0",
    "prettier": "^3.1.1",
    "sequelize-cli": "^6.6.2"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

## 2.3 DEPENDENCIAS FLUTTER (pubspec.yaml)

```yaml
name: fashionstore_app
description: FashionStore E-Commerce Mobile Application
publish_to: 'none'
version: 3.0.0+1

environment:
  sdk: '>=3.3.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  
  # Core
  cupertino_icons: ^1.0.6
  
  # State Management
  provider: ^6.1.1
  flutter_riverpod: ^2.4.9
  
  # HTTP & API
  dio: ^5.4.0
  retrofit: ^4.0.3
  json_annotation: ^4.8.1
  
  # Storage
  flutter_secure_storage: ^9.0.0
  shared_preferences: ^2.2.2
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  
  # Authentication
  local_auth: ^2.1.7
  
  # Firebase
  firebase_core: ^2.24.2
  firebase_messaging: ^14.7.10
  firebase_analytics: ^10.7.4
  
  # Payments
  flutter_stripe: ^10.0.0
  
  # Images
  cached_network_image: ^3.3.1
  image_picker: ^1.0.7
  photo_view: ^0.14.0
  
  # UI Components
  flutter_svg: ^2.0.9
  shimmer: ^3.0.0
  flutter_spinkit: ^5.2.0
  badges: ^3.1.2
  flutter_rating_bar: ^4.0.1
  carousel_slider: ^4.2.1
  
  # Navigation
  go_router: ^13.0.1
  
  # Forms
  flutter_form_builder: ^9.1.1
  form_builder_validators: ^9.1.0
  
  # Utils
  intl: ^0.18.1
  url_launcher: ^6.2.2
  share_plus: ^7.2.1
  package_info_plus: ^5.0.1
  device_info_plus: ^9.1.1
  connectivity_plus: ^5.0.2
  
  # Permissions
  permission_handler: ^11.1.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.1
  build_runner: ^2.4.8
  json_serializable: ^6.7.1
  retrofit_generator: ^8.0.6
  hive_generator: ^2.0.1
  mockito: ^5.4.4
  bloc_test: ^9.1.5

flutter:
  uses-material-design: true
  
  assets:
    - assets/images/
    - assets/icons/
    - assets/fonts/
    - assets/animations/
  
  fonts:
    - family: Poppins
      fonts:
        - asset: assets/fonts/Poppins-Regular.ttf
        - asset: assets/fonts/Poppins-Medium.ttf
          weight: 500
        - asset: assets/fonts/Poppins-SemiBold.ttf
          weight: 600
        - asset: assets/fonts/Poppins-Bold.ttf
          weight: 700
```

---

# ═══════════════════════════════════════════════════════════════
# SECCIÓN 3: ESTRUCTURA DE CARPETAS COMPLETA
# ═══════════════════════════════════════════════════════════════

## 3.1 ESTRUCTURA BACKEND

```
fashionstore-api/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Tests automáticos
│       ├── deploy-staging.yml        # Deploy a staging
│       └── deploy-production.yml     # Deploy a producción
│
├── src/
│   ├── config/
│   │   ├── index.js                  # Exporta toda la config
│   │   ├── database.js               # Config PostgreSQL
│   │   ├── redis.js                  # Config Redis
│   │   ├── jwt.js                    # Config JWT
│   │   ├── email.js                  # Config Nodemailer/SendGrid
│   │   ├── stripe.js                 # Config Stripe
│   │   ├── firebase.js               # Config Firebase Admin
│   │   ├── cloudinary.js             # Config Cloudinary
│   │   ├── supabase.js               # Config Supabase Storage
│   │   └── constants.js              # Constantes globales
│   │
│   ├── middleware/
│   │   ├── index.js                  # Exporta middlewares
│   │   ├── auth.middleware.js        # Verificación JWT
│   │   ├── admin.middleware.js       # Verificación rol admin
│   │   ├── roleCheck.middleware.js   # Control de roles
│   │   ├── validate.middleware.js    # Validación Joi
│   │   ├── rateLimiter.middleware.js # Rate limiting
│   │   ├── upload.middleware.js      # Multer upload
│   │   ├── cors.middleware.js        # CORS config
│   │   ├── logger.middleware.js      # Request logging
│   │   ├── errorHandler.middleware.js# Manejo errores global
│   │   └── notFound.middleware.js    # 404 handler
│   │
│   ├── models/
│   │   ├── index.js                  # Sequelize init + associations
│   │   ├── User.model.js             # Modelo Usuario
│   │   ├── Role.model.js             # Modelo Rol
│   │   ├── Permission.model.js       # Modelo Permiso
│   │   ├── Product.model.js          # Modelo Producto
│   │   ├── ProductVariant.model.js   # Modelo Variante
│   │   ├── ProductImage.model.js     # Modelo Imagen Producto
│   │   ├── Category.model.js         # Modelo Categoría
│   │   ├── Cart.model.js             # Modelo Carrito
│   │   ├── CartItem.model.js         # Modelo Item Carrito
│   │   ├── Order.model.js            # Modelo Pedido
│   │   ├── OrderItem.model.js        # Modelo Item Pedido
│   │   ├── Payment.model.js          # Modelo Pago
│   │   ├── Address.model.js          # Modelo Dirección
│   │   ├── SupportTicket.model.js    # Modelo Ticket Soporte
│   │   ├── SupportMessage.model.js   # Modelo Mensaje Soporte
│   │   ├── Notification.model.js     # Modelo Notificación
│   │   ├── Coupon.model.js           # Modelo Cupón
│   │   ├── Review.model.js           # Modelo Reseña
│   │   ├── Wishlist.model.js         # Modelo Lista Deseos
│   │   ├── PasswordReset.model.js    # Modelo Reset Password
│   │   ├── UserSession.model.js      # Modelo Sesión
│   │   ├── ActivityLog.model.js      # Modelo Log Actividad
│   │   ├── ApiLog.model.js           # Modelo Log API
│   │   └── AppConfig.model.js        # Modelo Configuración
│   │
│   ├── routes/
│   │   ├── index.js                  # Router principal
│   │   ├── auth.routes.js            # /api/auth/*
│   │   ├── user.routes.js            # /api/user/*
│   │   ├── product.routes.js         # /api/products/*
│   │   ├── category.routes.js        # /api/categories/*
│   │   ├── cart.routes.js            # /api/cart/*
│   │   ├── order.routes.js           # /api/orders/*
│   │   ├── payment.routes.js         # /api/payments/*
│   │   ├── address.routes.js         # /api/addresses/*
│   │   ├── support.routes.js         # /api/support/*
│   │   ├── notification.routes.js    # /api/notifications/*
│   │   ├── review.routes.js          # /api/reviews/*
│   │   ├── wishlist.routes.js        # /api/wishlist/*
│   │   ├── coupon.routes.js          # /api/coupons/*
│   │   ├── upload.routes.js          # /api/upload/*
│   │   ├── webhook.routes.js         # /api/webhooks/*
│   │   └── admin/
│   │       ├── index.js              # Router admin
│   │       ├── dashboard.routes.js   # /api/admin/dashboard/*
│   │       ├── users.routes.js       # /api/admin/users/*
│   │       ├── products.routes.js    # /api/admin/products/*
│   │       ├── orders.routes.js      # /api/admin/orders/*
│   │       ├── support.routes.js     # /api/admin/support/*
│   │       ├── reports.routes.js     # /api/admin/reports/*
│   │       └── settings.routes.js    # /api/admin/settings/*
│   │
│   ├── controllers/
│   │   ├── auth.controller.js        # Lógica autenticación
│   │   ├── user.controller.js        # Lógica usuario
│   │   ├── product.controller.js     # Lógica productos
│   │   ├── category.controller.js    # Lógica categorías
│   │   ├── cart.controller.js        # Lógica carrito
│   │   ├── order.controller.js       # Lógica pedidos
│   │   ├── payment.controller.js     # Lógica pagos
│   │   ├── address.controller.js     # Lógica direcciones
│   │   ├── support.controller.js     # Lógica soporte
│   │   ├── notification.controller.js# Lógica notificaciones
│   │   ├── review.controller.js      # Lógica reseñas
│   │   ├── wishlist.controller.js    # Lógica wishlist
│   │   ├── coupon.controller.js      # Lógica cupones
│   │   ├── upload.controller.js      # Lógica uploads
│   │   ├── webhook.controller.js     # Lógica webhooks
│   │   └── admin/
│   │       ├── dashboard.controller.js
│   │       ├── users.controller.js
│   │       ├── products.controller.js
│   │       ├── orders.controller.js
│   │       ├── support.controller.js
│   │       ├── reports.controller.js
│   │       └── settings.controller.js
│   │
│   ├── services/
│   │   ├── auth.service.js           # Servicio autenticación
│   │   ├── user.service.js           # Servicio usuario
│   │   ├── product.service.js        # Servicio productos
│   │   ├── order.service.js          # Servicio pedidos
│   │   ├── email.service.js          # Servicio emails
│   │   ├── payment.service.js        # Servicio pagos Stripe
│   │   ├── notification.service.js   # Servicio push
│   │   ├── storage.service.js        # Servicio storage
│   │   ├── cache.service.js          # Servicio Redis cache
│   │   └── stock.service.js          # Servicio stock
│   │
│   ├── validators/
│   │   ├── auth.validator.js         # Validaciones auth
│   │   ├── user.validator.js         # Validaciones user
│   │   ├── product.validator.js      # Validaciones product
│   │   ├── order.validator.js        # Validaciones order
│   │   └── common.validator.js       # Validaciones comunes
│   │
│   ├── utils/
│   │   ├── jwt.utils.js              # Funciones JWT
│   │   ├── crypto.utils.js           # Funciones crypto
│   │   ├── date.utils.js             # Funciones fechas
│   │   ├── string.utils.js           # Funciones strings
│   │   ├── file.utils.js             # Funciones archivos
│   │   ├── pagination.utils.js       # Funciones paginación
│   │   ├── response.utils.js         # Helpers response
│   │   ├── error.utils.js            # Clases error custom
│   │   └── logger.utils.js           # Logger configurado
│   │
│   ├── templates/
│   │   ├── emails/
│   │   │   ├── welcome.html          # Email bienvenida
│   │   │   ├── verify-email.html     # Email verificación
│   │   │   ├── password-reset.html   # Email reset password
│   │   │   ├── order-confirmation.html
│   │   │   ├── order-shipped.html
│   │   │   ├── order-delivered.html
│   │   │   ├── order-cancelled.html
│   │   │   ├── support-ticket.html
│   │   │   ├── support-reply.html
│   │   │   ├── invoice.html
│   │   │   └── promotional.html
│   │   └── pdf/
│   │       ├── invoice.hbs
│   │       └── shipping-label.hbs
│   │
│   ├── jobs/
│   │   ├── cleanupExpiredTokens.job.js
│   │   ├── cleanupExpiredCarts.job.js
│   │   ├── sendScheduledEmails.job.js
│   │   └── generateReports.job.js
│   │
│   └── app.js                        # Entry point
│
├── migrations/
│   ├── 20250101000001-create-roles.js
│   ├── 20250101000002-create-permissions.js
│   ├── 20250101000003-create-users.js
│   ├── 20250101000004-create-categories.js
│   ├── 20250101000005-create-products.js
│   ├── 20250101000006-create-product-variants.js
│   ├── 20250101000007-create-product-images.js
│   ├── 20250101000008-create-addresses.js
│   ├── 20250101000009-create-carts.js
│   ├── 20250101000010-create-cart-items.js
│   ├── 20250101000011-create-orders.js
│   ├── 20250101000012-create-order-items.js
│   ├── 20250101000013-create-payments.js
│   ├── 20250101000014-create-coupons.js
│   ├── 20250101000015-create-reviews.js
│   ├── 20250101000016-create-wishlists.js
│   ├── 20250101000017-create-support-tickets.js
│   ├── 20250101000018-create-support-messages.js
│   ├── 20250101000019-create-notifications.js
│   ├── 20250101000020-create-password-resets.js
│   ├── 20250101000021-create-user-sessions.js
│   ├── 20250101000022-create-activity-logs.js
│   ├── 20250101000023-create-api-logs.js
│   └── 20250101000024-create-app-config.js
│
├── seeders/
│   ├── 20250101000001-seed-roles.js
│   ├── 20250101000002-seed-permissions.js
│   ├── 20250101000003-seed-admin-user.js
│   ├── 20250101000004-seed-categories.js
│   ├── 20250101000005-seed-products.js
│   └── 20250101000006-seed-app-config.js
│
├── tests/
│   ├── unit/
│   │   ├── auth.test.js
│   │   ├── user.test.js
│   │   ├── product.test.js
│   │   └── order.test.js
│   ├── integration/
│   │   ├── auth.integration.test.js
│   │   ├── order.integration.test.js
│   │   └── payment.integration.test.js
│   └── setup.js
│
├── docs/
│   ├── API.md
│   ├── DATABASE.md
│   ├── DEPLOYMENT.md
│   └── SECURITY.md
│
├── scripts/
│   ├── backup-db.sh
│   ├── restore-db.sh
│   └── generate-keys.sh
│
├── .env.example
├── .env.development
├── .env.staging
├── .env.production
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── docker-compose.yml
├── docker-compose.prod.yml
├── Dockerfile
├── jest.config.js
├── nodemon.json
├── package.json
├── package-lock.json
└── README.md
```

## 3.2 ESTRUCTURA FLUTTER

```
fashionstore_app/
├── android/
│   ├── app/
│   │   ├── src/
│   │   │   └── main/
│   │   │       ├── AndroidManifest.xml
│   │   │       ├── kotlin/
│   │   │       │   └── com/fashionstore/app/
│   │   │       │       └── MainActivity.kt
│   │   │       └── res/
│   │   │           ├── drawable/
│   │   │           ├── mipmap-*/
│   │   │           └── values/
│   │   └── build.gradle
│   ├── build.gradle
│   └── gradle.properties
│
├── ios/
│   ├── Runner/
│   │   ├── AppDelegate.swift
│   │   ├── Info.plist
│   │   └── Assets.xcassets/
│   ├── Runner.xcodeproj/
│   └── Podfile
│
├── lib/
│   ├── main.dart                     # Entry point
│   ├── app.dart                      # App widget principal
│   │
│   ├── config/
│   │   ├── app_config.dart           # Configuración app
│   │   ├── api_config.dart           # URLs API
│   │   ├── theme_config.dart         # Tema visual
│   │   ├── routes_config.dart        # Rutas GoRouter
│   │   └── constants.dart            # Constantes
│   │
│   ├── core/
│   │   ├── network/
│   │   │   ├── api_client.dart       # Cliente Dio
│   │   │   ├── api_interceptor.dart  # Interceptores
│   │   │   ├── api_endpoints.dart    # Endpoints
│   │   │   └── api_exceptions.dart   # Excepciones
│   │   │
│   │   ├── storage/
│   │   │   ├── secure_storage.dart   # Storage seguro
│   │   │   ├── local_storage.dart    # SharedPreferences
│   │   │   └── hive_storage.dart     # Hive cache
│   │   │
│   │   ├── utils/
│   │   │   ├── validators.dart       # Validadores
│   │   │   ├── formatters.dart       # Formateadores
│   │   │   ├── helpers.dart          # Helpers
│   │   │   ├── extensions.dart       # Extensions Dart
│   │   │   └── logger.dart           # Logger
│   │   │
│   │   └── errors/
│   │       ├── failures.dart         # Failures
│   │       └── exceptions.dart       # Exceptions
│   │
│   ├── data/
│   │   ├── models/
│   │   │   ├── user_model.dart
│   │   │   ├── product_model.dart
│   │   │   ├── category_model.dart
│   │   │   ├── cart_model.dart
│   │   │   ├── cart_item_model.dart
│   │   │   ├── order_model.dart
│   │   │   ├── order_item_model.dart
│   │   │   ├── address_model.dart
│   │   │   ├── payment_model.dart
│   │   │   ├── notification_model.dart
│   │   │   ├── review_model.dart
│   │   │   ├── coupon_model.dart
│   │   │   ├── support_ticket_model.dart
│   │   │   └── api_response_model.dart
│   │   │
│   │   ├── repositories/
│   │   │   ├── auth_repository.dart
│   │   │   ├── user_repository.dart
│   │   │   ├── product_repository.dart
│   │   │   ├── cart_repository.dart
│   │   │   ├── order_repository.dart
│   │   │   ├── address_repository.dart
│   │   │   ├── payment_repository.dart
│   │   │   ├── notification_repository.dart
│   │   │   └── support_repository.dart
│   │   │
│   │   └── datasources/
│   │       ├── remote/
│   │       │   ├── auth_remote_datasource.dart
│   │       │   ├── product_remote_datasource.dart
│   │       │   └── order_remote_datasource.dart
│   │       └── local/
│   │           ├── auth_local_datasource.dart
│   │           └── cart_local_datasource.dart
│   │
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── user_entity.dart
│   │   │   ├── product_entity.dart
│   │   │   └── order_entity.dart
│   │   │
│   │   ├── repositories/
│   │   │   ├── i_auth_repository.dart
│   │   │   ├── i_product_repository.dart
│   │   │   └── i_order_repository.dart
│   │   │
│   │   └── usecases/
│   │       ├── auth/
│   │       │   ├── login_usecase.dart
│   │       │   ├── register_usecase.dart
│   │       │   └── logout_usecase.dart
│   │       ├── product/
│   │       │   ├── get_products_usecase.dart
│   │       │   └── get_product_detail_usecase.dart
│   │       └── order/
│   │           ├── create_order_usecase.dart
│   │           └── get_orders_usecase.dart
│   │
│   ├── presentation/
│   │   ├── providers/
│   │   │   ├── auth_provider.dart
│   │   │   ├── user_provider.dart
│   │   │   ├── product_provider.dart
│   │   │   ├── cart_provider.dart
│   │   │   ├── order_provider.dart
│   │   │   ├── address_provider.dart
│   │   │   ├── notification_provider.dart
│   │   │   └── theme_provider.dart
│   │   │
│   │   ├── screens/
│   │   │   ├── splash/
│   │   │   │   └── splash_screen.dart
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── login_screen.dart
│   │   │   │   ├── register_screen.dart
│   │   │   │   ├── forgot_password_screen.dart
│   │   │   │   └── verify_email_screen.dart
│   │   │   │
│   │   │   ├── home/
│   │   │   │   ├── home_screen.dart
│   │   │   │   └── widgets/
│   │   │   │       ├── banner_carousel.dart
│   │   │   │       ├── category_grid.dart
│   │   │   │       ├── featured_products.dart
│   │   │   │       └── new_arrivals.dart
│   │   │   │
│   │   │   ├── products/
│   │   │   │   ├── products_screen.dart
│   │   │   │   ├── product_detail_screen.dart
│   │   │   │   ├── product_search_screen.dart
│   │   │   │   └── widgets/
│   │   │   │       ├── product_card.dart
│   │   │   │       ├── product_grid.dart
│   │   │   │       ├── filter_sheet.dart
│   │   │   │       └── size_selector.dart
│   │   │   │
│   │   │   ├── cart/
│   │   │   │   ├── cart_screen.dart
│   │   │   │   └── widgets/
│   │   │   │       ├── cart_item_card.dart
│   │   │   │       ├── cart_summary.dart
│   │   │   │       └── coupon_input.dart
│   │   │   │
│   │   │   ├── checkout/
│   │   │   │   ├── checkout_screen.dart
│   │   │   │   ├── address_selection_screen.dart
│   │   │   │   ├── payment_screen.dart
│   │   │   │   └── order_success_screen.dart
│   │   │   │
│   │   │   ├── orders/
│   │   │   │   ├── orders_screen.dart
│   │   │   │   ├── order_detail_screen.dart
│   │   │   │   └── order_tracking_screen.dart
│   │   │   │
│   │   │   ├── profile/
│   │   │   │   ├── profile_screen.dart
│   │   │   │   ├── edit_profile_screen.dart
│   │   │   │   ├── addresses_screen.dart
│   │   │   │   ├── add_address_screen.dart
│   │   │   │   └── change_password_screen.dart
│   │   │   │
│   │   │   ├── wishlist/
│   │   │   │   └── wishlist_screen.dart
│   │   │   │
│   │   │   ├── notifications/
│   │   │   │   └── notifications_screen.dart
│   │   │   │
│   │   │   ├── support/
│   │   │   │   ├── support_screen.dart
│   │   │   │   ├── create_ticket_screen.dart
│   │   │   │   ├── ticket_detail_screen.dart
│   │   │   │   └── faq_screen.dart
│   │   │   │
│   │   │   └── settings/
│   │   │       └── settings_screen.dart
│   │   │
│   │   └── widgets/
│   │       ├── common/
│   │       │   ├── app_bar.dart
│   │       │   ├── bottom_nav.dart
│   │       │   ├── drawer.dart
│   │       │   ├── loading.dart
│   │       │   ├── error_widget.dart
│   │       │   ├── empty_state.dart
│   │       │   └── custom_button.dart
│   │       │
│   │       ├── dialogs/
│   │       │   ├── confirm_dialog.dart
│   │       │   ├── loading_dialog.dart
│   │       │   └── error_dialog.dart
│   │       │
│   │       └── inputs/
│   │           ├── text_field.dart
│   │           ├── password_field.dart
│   │           ├── dropdown_field.dart
│   │           └── search_field.dart
│   │
│   └── injection_container.dart      # Dependency injection
│
├── assets/
│   ├── images/
│   │   ├── logo.png
│   │   ├── placeholder.png
│   │   └── empty_*.png
│   │
│   ├── icons/
│   │   └── *.svg
│   │
│   ├── fonts/
│   │   └── Poppins-*.ttf
│   │
│   └── animations/
│       └── *.json                    # Lottie animations
│
├── test/
│   ├── unit/
│   ├── widget/
│   └── integration/
│
├── .env.development
├── .env.staging
├── .env.production
├── .gitignore
├── analysis_options.yaml
├── pubspec.yaml
├── pubspec.lock
└── README.md
```

---

# ═══════════════════════════════════════════════════════════════
# SECCIÓN 4: BASE DE DATOS - SCHEMA COMPLETO
# ═══════════════════════════════════════════════════════════════

## 4.1 DIAGRAMA ENTIDAD-RELACIÓN

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    ROLES    │     │ PERMISSIONS │     │ROLE_PERMISS │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (PK)     │◄────│ id (PK)     │     │ role_id(FK) │
│ name        │     │ name        │     │ perm_id(FK) │
│ description │     │ resource    │     └─────────────┘
└─────────────┘     │ action      │
       │            └─────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│                          USERS                               │
├─────────────────────────────────────────────────────────────┤
│ id (PK) │ email │ password_hash │ role_id (FK) │ ...        │
└─────────────────────────────────────────────────────────────┘
       │
       ├──────────────────┬──────────────────┬─────────────────┐
       │                  │                  │                 │
       ▼                  ▼                  ▼                 ▼
┌─────────────┐    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  ADDRESSES  │    │   ORDERS    │   │    CART     │   │  WISHLIST   │
├─────────────┤    ├─────────────┤   ├─────────────┤   ├─────────────┤
│ id (PK)     │    │ id (PK)     │   │ id (PK)     │   │ id (PK)     │
│ user_id(FK) │    │ user_id(FK) │   │ user_id(FK) │   │ user_id(FK) │
└─────────────┘    └─────────────┘   └─────────────┘   │ product(FK) │
                          │                │           └─────────────┘
                          │                │
                          ▼                ▼
                   ┌─────────────┐  ┌─────────────┐
                   │ ORDER_ITEMS │  │ CART_ITEMS  │
                   ├─────────────┤  ├─────────────┤
                   │ order_id(FK)│  │ cart_id(FK) │
                   │product_id(FK) │variant_id(FK)│
                   └─────────────┘  └─────────────┘
                          │                │
                          └────────┬───────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────┐
│                        PRODUCTS                              │
├─────────────────────────────────────────────────────────────┤
│ id (PK) │ name │ price │ category_id (FK) │ ...             │
└─────────────────────────────────────────────────────────────┘
       │
       ├──────────────────┬──────────────────┐
       │                  │                  │
       ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  VARIANTS   │    │   IMAGES    │    │   REVIEWS   │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ product(FK) │    │ product(FK) │    │ product(FK) │
│ size, color │    │ url, order  │    │ user_id(FK) │
│ stock       │    └─────────────┘    │ rating      │
└─────────────┘                       └─────────────┘
```

## 4.2 TABLAS SQL COMPLETAS

```sql
-- ============================================================
-- EXTENSIONES REQUERIDAS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLA: roles
-- Descripción: Define los roles del sistema
-- ============================================================
CREATE TABLE roles (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(50) UNIQUE NOT NULL,
    display_name    VARCHAR(100) NOT NULL,
    description     TEXT,
    is_system       BOOLEAN DEFAULT false,      -- Roles del sistema no eliminables
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Datos iniciales
INSERT INTO roles (name, display_name, description, is_system) VALUES
    ('super_admin', 'Super Administrador', 'Acceso total al sistema', true),
    ('admin', 'Administrador', 'Gestión general', true),
    ('support', 'Soporte', 'Atención al cliente', true),
    ('vendor', 'Vendedor', 'Gestión de productos', false),
    ('customer', 'Cliente', 'Usuario final', true);

-- ============================================================
-- TABLA: permissions
-- Descripción: Define permisos granulares
-- ============================================================
CREATE TABLE permissions (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) UNIQUE NOT NULL,
    display_name    VARCHAR(150) NOT NULL,
    resource        VARCHAR(50) NOT NULL,       -- users, products, orders, etc.
    action          VARCHAR(50) NOT NULL,       -- create, read, update, delete
    description     TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Permisos por recurso
INSERT INTO permissions (name, display_name, resource, action) VALUES
    -- Users
    ('users.create', 'Crear usuarios', 'users', 'create'),
    ('users.read', 'Ver usuarios', 'users', 'read'),
    ('users.update', 'Editar usuarios', 'users', 'update'),
    ('users.delete', 'Eliminar usuarios', 'users', 'delete'),
    -- Products
    ('products.create', 'Crear productos', 'products', 'create'),
    ('products.read', 'Ver productos', 'products', 'read'),
    ('products.update', 'Editar productos', 'products', 'update'),
    ('products.delete', 'Eliminar productos', 'products', 'delete'),
    -- Orders
    ('orders.create', 'Crear pedidos', 'orders', 'create'),
    ('orders.read', 'Ver pedidos', 'orders', 'read'),
    ('orders.update', 'Actualizar pedidos', 'orders', 'update'),
    ('orders.delete', 'Cancelar pedidos', 'orders', 'delete'),
    -- Support
    ('support.create', 'Crear tickets', 'support', 'create'),
    ('support.read', 'Ver tickets', 'support', 'read'),
    ('support.update', 'Responder tickets', 'support', 'update'),
    ('support.close', 'Cerrar tickets', 'support', 'close'),
    -- Reports
    ('reports.view', 'Ver reportes', 'reports', 'read'),
    ('reports.export', 'Exportar reportes', 'reports', 'export'),
    -- Settings
    ('settings.read', 'Ver configuración', 'settings', 'read'),
    ('settings.update', 'Modificar configuración', 'settings', 'update');

-- ============================================================
-- TABLA: role_permissions (Tabla pivote)
-- ============================================================
CREATE TABLE role_permissions (
    role_id         INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id   INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);

-- Asignar todos los permisos a super_admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- ============================================================
-- TABLA: users
-- Descripción: Usuarios del sistema (clientes y admins)
-- ============================================================
CREATE TABLE users (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email                   VARCHAR(255) UNIQUE NOT NULL,
    password_hash           VARCHAR(255) NOT NULL,
    
    -- Información personal
    first_name              VARCHAR(100),
    last_name               VARCHAR(100),
    phone                   VARCHAR(20),
    avatar_url              TEXT,
    date_of_birth           DATE,
    gender                  VARCHAR(20),                -- male, female, other, prefer_not_say
    
    -- Rol y permisos
    role_id                 INTEGER NOT NULL REFERENCES roles(id) DEFAULT 5,
    
    -- Estado de cuenta
    is_active               BOOLEAN DEFAULT true,
    is_verified             BOOLEAN DEFAULT false,
    verification_token      VARCHAR(255),
    verification_expires    TIMESTAMP WITH TIME ZONE,
    
    -- Seguridad
    last_login              TIMESTAMP WITH TIME ZONE,
    last_login_ip           VARCHAR(45),
    failed_login_attempts   INTEGER DEFAULT 0,
    locked_until            TIMESTAMP WITH TIME ZONE,
    password_changed_at     TIMESTAMP WITH TIME ZONE,
    
    -- 2FA
    two_factor_enabled      BOOLEAN DEFAULT false,
    two_factor_secret       VARCHAR(255),
    
    -- Push notifications
    fcm_token               TEXT,
    push_enabled            BOOLEAN DEFAULT true,
    
    -- Preferencias
    language                VARCHAR(10) DEFAULT 'es',
    currency                VARCHAR(3) DEFAULT 'EUR',
    newsletter_subscribed   BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at              TIMESTAMP WITH TIME ZONE        -- Soft delete
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX idx_users_deleted ON users(deleted_at) WHERE deleted_at IS NULL;

-- ============================================================
-- TABLA: user_sessions
-- Descripción: Sesiones activas de usuarios
-- ============================================================
CREATE TABLE user_sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      VARCHAR(255) UNIQUE NOT NULL,
    refresh_token   VARCHAR(255),
    device_info     JSONB,                      -- {device, os, browser, app_version}
    ip_address      VARCHAR(45),
    user_agent      TEXT,
    is_active       BOOLEAN DEFAULT true,
    last_activity   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(token_hash);
CREATE INDEX idx_sessions_active ON user_sessions(is_active) WHERE is_active = true;

-- ============================================================
-- TABLA: password_resets
-- Descripción: Tokens de recuperación de contraseña
-- ============================================================
CREATE TABLE password_resets (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      VARCHAR(255) UNIQUE NOT NULL,
    ip_address      VARCHAR(45),
    user_agent      TEXT,
    used_at         TIMESTAMP WITH TIME ZONE,
    expires_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_resets_user ON password_resets(user_id);
CREATE INDEX idx_password_resets_token ON password_resets(token_hash);

-- ============================================================
-- TABLA: categories
-- Descripción: Categorías de productos (jerárquicas)
-- ============================================================
CREATE TABLE categories (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id       UUID REFERENCES categories(id) ON DELETE SET NULL,
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(100) UNIQUE NOT NULL,
    description     TEXT,
    image_url       TEXT,
    icon            VARCHAR(50),
    color           VARCHAR(7),                 -- Hex color
    display_order   INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT true,
    is_featured     BOOLEAN DEFAULT false,
    seo_title       VARCHAR(255),
    seo_description TEXT,
    product_count   INTEGER DEFAULT 0,          -- Cache de conteo
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active) WHERE is_active = true;

-- ============================================================
-- TABLA: products
-- Descripción: Productos del catálogo
-- ============================================================
CREATE TABLE products (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku                 VARCHAR(100) UNIQUE NOT NULL,
    name                VARCHAR(255) NOT NULL,
    slug                VARCHAR(255) UNIQUE NOT NULL,
    description         TEXT,
    long_description    TEXT,
    
    -- Precios
    price               DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    cost_price          DECIMAL(10, 2),                 -- Solo admin
    compare_at_price    DECIMAL(10, 2),                 -- Precio tachado
    discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage BETWEEN 0 AND 100),
    
    -- Stock global
    stock               INTEGER DEFAULT 0,
    stock_reserved      INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    track_inventory     BOOLEAN DEFAULT true,
    allow_backorder     BOOLEAN DEFAULT false,
    
    -- Categorización
    category_id         UUID NOT NULL REFERENCES categories(id),
    brand               VARCHAR(100),
    
    -- Características físicas
    weight_kg           DECIMAL(10, 3),
    dimensions_cm       VARCHAR(50),                    -- "LxWxH"
    
    -- Atributos
    material            VARCHAR(255),
    care_instructions   TEXT,
    
    -- SEO
    seo_title           VARCHAR(255),
    seo_description     TEXT,
    tags                TEXT[],
    
    -- Estado
    is_active           BOOLEAN DEFAULT true,
    is_featured         BOOLEAN DEFAULT false,
    is_new              BOOLEAN DEFAULT false,
    is_bestseller       BOOLEAN DEFAULT false,
    
    -- Ofertas flash
    is_flash_sale       BOOLEAN DEFAULT false,
    flash_sale_price    DECIMAL(10, 2),
    flash_sale_starts   TIMESTAMP WITH TIME ZONE,
    flash_sale_ends     TIMESTAMP WITH TIME ZONE,
    
    -- Métricas
    view_count          INTEGER DEFAULT 0,
    sales_count         INTEGER DEFAULT 0,
    rating_average      DECIMAL(3, 2) DEFAULT 0,
    rating_count        INTEGER DEFAULT 0,
    
    -- Auditoría
    created_by          UUID REFERENCES users(id),
    updated_by          UUID REFERENCES users(id),
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at          TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('spanish', name || ' ' || COALESCE(description, '')));

-- ============================================================
-- TABLA: product_variants
-- Descripción: Variantes de producto (talla/color)
-- ============================================================
CREATE TABLE product_variants (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku             VARCHAR(100),
    barcode         VARCHAR(100),
    
    -- Atributos
    size            VARCHAR(20),
    color           VARCHAR(50),
    color_hex       VARCHAR(7),
    color_image_url TEXT,                       -- Swatch image
    
    -- Precio y stock
    price_modifier  DECIMAL(10, 2) DEFAULT 0,   -- +/- al precio base
    stock           INTEGER DEFAULT 0,
    stock_reserved  INTEGER DEFAULT 0,
    
    -- Físico
    weight_kg       DECIMAL(10, 3),
    
    is_active       BOOLEAN DEFAULT true,
    display_order   INTEGER DEFAULT 0,
    
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(product_id, size, color)
);

CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_sku ON product_variants(sku);
CREATE INDEX idx_variants_stock ON product_variants(stock);

-- ============================================================
-- TABLA: product_images
-- Descripción: Imágenes de productos
-- ============================================================
CREATE TABLE product_images (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id      UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    url             TEXT NOT NULL,
    thumbnail_url   TEXT,
    alt_text        VARCHAR(255),
    display_order   INTEGER DEFAULT 0,
    is_primary      BOOLEAN DEFAULT false,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_images_product ON product_images(product_id);
CREATE INDEX idx_images_variant ON product_images(variant_id);

-- ============================================================
-- TABLA: addresses
-- Descripción: Direcciones de usuarios
-- ============================================================
CREATE TABLE addresses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Tipo
    type            VARCHAR(20) DEFAULT 'shipping',     -- shipping, billing
    label           VARCHAR(50),                        -- Casa, Trabajo, etc.
    
    -- Contacto
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    company         VARCHAR(100),
    phone           VARCHAR(20),
    
    -- Dirección
    street_line_1   VARCHAR(255) NOT NULL,
    street_line_2   VARCHAR(255),
    city            VARCHAR(100) NOT NULL,
    state           VARCHAR(100),
    postal_code     VARCHAR(20) NOT NULL,
    country         VARCHAR(2) NOT NULL,                -- ISO 3166-1 alpha-2
    
    -- Coordenadas (opcional)
    latitude        DECIMAL(10, 8),
    longitude       DECIMAL(11, 8),
    
    -- Estado
    is_default      BOOLEAN DEFAULT false,
    is_verified     BOOLEAN DEFAULT false,
    
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_addresses_type ON addresses(type);

-- ============================================================
-- TABLA: carts (Carrito persistente)
-- ============================================================
CREATE TABLE carts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id      VARCHAR(255),                       -- Para usuarios no autenticados
    
    -- Cupón aplicado
    coupon_id       UUID REFERENCES coupons(id),
    coupon_code     VARCHAR(50),
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    
    -- Totales (cache)
    subtotal        DECIMAL(10, 2) DEFAULT 0,
    tax_amount      DECIMAL(10, 2) DEFAULT 0,
    shipping_amount DECIMAL(10, 2) DEFAULT 0,
    total           DECIMAL(10, 2) DEFAULT 0,
    
    item_count      INTEGER DEFAULT 0,
    
    -- Timestamps
    expires_at      TIMESTAMP WITH TIME ZONE,           -- Para guest carts
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_carts_user ON carts(user_id);
CREATE INDEX idx_carts_session ON carts(session_id);

-- ============================================================
-- TABLA: cart_items
-- ============================================================
CREATE TABLE cart_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id         UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id),
    variant_id      UUID REFERENCES product_variants(id),
    
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    
    -- Precio snapshot (al momento de agregar)
    price_at_add    DECIMAL(10, 2) NOT NULL,
    
    -- Personalización (si aplica)
    custom_options  JSONB,
    
    added_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(cart_id, variant_id)
);

CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);

-- ============================================================
-- TABLA: coupons
-- ============================================================
CREATE TABLE coupons (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code                    VARCHAR(50) UNIQUE NOT NULL,
    description             TEXT,
    
    -- Tipo de descuento
    discount_type           VARCHAR(20) NOT NULL,       -- percentage, fixed, free_shipping
    discount_value          DECIMAL(10, 2) NOT NULL,
    
    -- Restricciones
    min_purchase_amount     DECIMAL(10, 2) DEFAULT 0,
    max_discount_amount     DECIMAL(10, 2),             -- Tope para porcentajes
    
    -- Uso
    max_uses                INTEGER,                    -- NULL = ilimitado
    max_uses_per_user       INTEGER DEFAULT 1,
    used_count              INTEGER DEFAULT 0,
    
    -- Aplicabilidad
    applicable_products     UUID[],                     -- NULL = todos
    applicable_categories   UUID[],                     -- NULL = todas
    excluded_products       UUID[],
    excluded_categories     UUID[],
    
    -- Solo para ciertos usuarios
    user_restrictions       UUID[],                     -- NULL = todos
    first_order_only        BOOLEAN DEFAULT false,
    
    -- Validez
    starts_at               TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at              TIMESTAMP WITH TIME ZONE,
    
    is_active               BOOLEAN DEFAULT true,
    
    created_by              UUID REFERENCES users(id),
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active) WHERE is_active = true;

-- ============================================================
-- TABLA: coupon_uses (Registro de usos)
-- ============================================================
CREATE TABLE coupon_uses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id       UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    order_id        UUID REFERENCES orders(id) ON DELETE SET NULL,
    discount_applied DECIMAL(10, 2) NOT NULL,
    used_at         TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_coupon_uses_coupon ON coupon_uses(coupon_id);
CREATE INDEX idx_coupon_uses_user ON coupon_uses(user_id);

-- ============================================================
-- TABLA: orders
-- ============================================================
CREATE TABLE orders (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number            VARCHAR(50) UNIQUE NOT NULL,
    user_id                 UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Estado
    status                  VARCHAR(50) DEFAULT 'pending',
    -- pending, confirmed, processing, packed, shipped, out_for_delivery, 
    -- delivered, cancelled, refunded, returned
    
    -- Pago
    payment_status          VARCHAR(50) DEFAULT 'pending',
    -- pending, processing, completed, failed, refunded, partially_refunded
    payment_method          VARCHAR(50),
    payment_intent_id       VARCHAR(255),
    
    -- Cliente
    customer_email          VARCHAR(255) NOT NULL,
    customer_name           VARCHAR(255),
    customer_phone          VARCHAR(20),
    
    -- Direcciones (snapshot JSON)
    shipping_address        JSONB NOT NULL,
    billing_address         JSONB,
    same_billing_address    BOOLEAN DEFAULT true,
    
    -- Montos
    subtotal                DECIMAL(10, 2) NOT NULL,
    tax_amount              DECIMAL(10, 2) DEFAULT 0,
    tax_rate                DECIMAL(5, 2) DEFAULT 21.00,
    shipping_cost           DECIMAL(10, 2) DEFAULT 0,
    discount_amount         DECIMAL(10, 2) DEFAULT 0,
    total_amount            DECIMAL(10, 2) NOT NULL,
    
    -- Cupón
    coupon_id               UUID REFERENCES coupons(id),
    coupon_code             VARCHAR(50),
    
    -- Envío
    shipping_method         VARCHAR(50),
    shipping_carrier        VARCHAR(50),
    tracking_number         VARCHAR(100),
    tracking_url            TEXT,
    estimated_delivery      DATE,
    
    -- Peso total
    total_weight_kg         DECIMAL(10, 3),
    
    -- Notas
    customer_notes          TEXT,
    admin_notes             TEXT,
    
    -- Timestamps
    confirmed_at            TIMESTAMP WITH TIME ZONE,
    shipped_at              TIMESTAMP WITH TIME ZONE,
    delivered_at            TIMESTAMP WITH TIME ZONE,
    cancelled_at            TIMESTAMP WITH TIME ZONE,
    cancellation_reason     TEXT,
    
    return_requested_at     TIMESTAMP WITH TIME ZONE,
    return_reason           TEXT,
    returned_at             TIMESTAMP WITH TIME ZONE,
    
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- ============================================================
-- TABLA: order_items
-- ============================================================
CREATE TABLE order_items (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id          UUID NOT NULL REFERENCES products(id),
    variant_id          UUID REFERENCES product_variants(id),
    
    -- Snapshot del producto al momento de compra
    product_snapshot    JSONB NOT NULL,         -- {name, sku, image, size, color}
    
    quantity            INTEGER NOT NULL CHECK (quantity > 0),
    price_per_unit      DECIMAL(10, 2) NOT NULL,
    discount_per_unit   DECIMAL(10, 2) DEFAULT 0,
    tax_amount          DECIMAL(10, 2) DEFAULT 0,
    line_total          DECIMAL(10, 2) NOT NULL,
    
    -- Estado del item
    status              VARCHAR(50) DEFAULT 'pending',
    -- pending, confirmed, shipped, delivered, returned, refunded
    
    -- Devolución
    returned_quantity   INTEGER DEFAULT 0,
    refunded_amount     DECIMAL(10, 2) DEFAULT 0,
    
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ============================================================
-- TABLA: payments
-- ============================================================
CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Stripe/Pasarela
    provider            VARCHAR(50) NOT NULL,           -- stripe, paypal, bank_transfer
    payment_intent_id   VARCHAR(255),
    charge_id           VARCHAR(255),
    
    -- Montos
    amount              DECIMAL(10, 2) NOT NULL,
    currency            VARCHAR(3) DEFAULT 'EUR',
    fee_amount          DECIMAL(10, 2),                 -- Comisión del procesador
    net_amount          DECIMAL(10, 2),
    
    -- Estado
    status              VARCHAR(50) DEFAULT 'pending',
    -- pending, processing, succeeded, failed, cancelled, refunded
    
    -- Método
    payment_method_type VARCHAR(50),                    -- card, bank_transfer, wallet
    card_brand          VARCHAR(20),                    -- visa, mastercard, amex
    card_last_four      VARCHAR(4),
    
    -- Respuesta del procesador
    provider_response   JSONB,
    failure_reason      TEXT,
    
    -- Reembolsos
    refunded_amount     DECIMAL(10, 2) DEFAULT 0,
    refunded_at         TIMESTAMP WITH TIME ZONE,
    refund_reason       TEXT,
    
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_intent ON payments(payment_intent_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================================
-- TABLA: reviews
-- ============================================================
CREATE TABLE reviews (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id        UUID REFERENCES orders(id),
    
    rating          INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title           VARCHAR(255),
    comment         TEXT,
    
    -- Pros y contras (opcional)
    pros            TEXT[],
    cons            TEXT[],
    
    -- Imágenes de la reseña
    images          TEXT[],
    
    -- Estado
    status          VARCHAR(20) DEFAULT 'pending',      -- pending, approved, rejected
    is_verified     BOOLEAN DEFAULT false,              -- Compra verificada
    
    -- Utilidad
    helpful_count   INTEGER DEFAULT 0,
    reported_count  INTEGER DEFAULT 0,
    
    -- Respuesta del vendedor
    seller_response TEXT,
    responded_at    TIMESTAMP WITH TIME ZONE,
    
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(product_id, user_id)
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- ============================================================
-- TABLA: wishlists
-- ============================================================
CREATE TABLE wishlists (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id      UUID REFERENCES product_variants(id),
    
    -- Notificaciones
    notify_price_drop   BOOLEAN DEFAULT false,
    notify_back_in_stock BOOLEAN DEFAULT false,
    
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, product_id, variant_id)
);

CREATE INDEX idx_wishlists_user ON wishlists(user_id);
CREATE INDEX idx_wishlists_product ON wishlists(product_id);

-- ============================================================
-- TABLA: support_tickets
-- ============================================================
CREATE TABLE support_tickets (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number   VARCHAR(50) UNIQUE NOT NULL,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Relacionado
    order_id        UUID REFERENCES orders(id),
    product_id      UUID REFERENCES products(id),
    
    -- Contenido
    subject         VARCHAR(255) NOT NULL,
    description     TEXT NOT NULL,
    
    -- Clasificación
    category        VARCHAR(50) NOT NULL,               -- order, product, shipping, payment, account, other
    priority        VARCHAR(20) DEFAULT 'normal',       -- low, normal, high, urgent
    
    -- Estado
    status          VARCHAR(50) DEFAULT 'open',         -- open, in_progress, waiting_customer, resolved, closed
    
    -- Asignación
    assigned_to     UUID REFERENCES users(id),
    department      VARCHAR(50),
    
    -- Resolución
    resolution      TEXT,
    resolved_at     TIMESTAMP WITH TIME ZONE,
    resolved_by     UUID REFERENCES users(id),
    
    -- Métricas
    first_response_at   TIMESTAMP WITH TIME ZONE,
    response_time_hours DECIMAL(10, 2),
    
    -- Satisfacción
    satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
    satisfaction_comment TEXT,
    
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at       TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_tickets_number ON support_tickets(ticket_number);
CREATE INDEX idx_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_tickets_status ON support_tickets(status);
CREATE INDEX idx_tickets_assigned ON support_tickets(assigned_to);

-- ============================================================
-- TABLA: support_messages
-- ============================================================
CREATE TABLE support_messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id       UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id),
    
    message         TEXT NOT NULL,
    
    -- Adjuntos
    attachments     JSONB,                              -- [{url, name, type, size}]
    
    -- Tipo
    is_internal     BOOLEAN DEFAULT false,              -- Nota interna (no visible al cliente)
    is_automated    BOOLEAN DEFAULT false,              -- Respuesta automática
    
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_support_messages_ticket ON support_messages(ticket_id);

-- ============================================================
-- TABLA: notifications
-- ============================================================
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Contenido
    type            VARCHAR(50) NOT NULL,               -- order, promotion, system, support
    title           VARCHAR(255) NOT NULL,
    body            TEXT,
    image_url       TEXT,
    
    -- Acción
    action_type     VARCHAR(50),                        -- navigate, url, none
    action_data     JSONB,                              -- {screen, params} o {url}
    
    -- Estado
    is_read         BOOLEAN DEFAULT false,
    read_at         TIMESTAMP WITH TIME ZONE,
    
    -- Push
    push_sent       BOOLEAN DEFAULT false,
    push_sent_at    TIMESTAMP WITH TIME ZONE,
    push_failed     BOOLEAN DEFAULT false,
    push_error      TEXT,
    
    -- Programación
    scheduled_for   TIMESTAMP WITH TIME ZONE,
    
    expires_at      TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);

-- ============================================================
-- TABLA: activity_logs (Auditoría de usuarios)
-- ============================================================
CREATE TABLE activity_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Acción
    action          VARCHAR(100) NOT NULL,              -- login, logout, order_created, etc.
    resource_type   VARCHAR(50),                        -- user, product, order
    resource_id     UUID,
    
    -- Detalles
    description     TEXT,
    old_values      JSONB,
    new_values      JSONB,
    
    -- Contexto
    ip_address      VARCHAR(45),
    user_agent      TEXT,
    request_id      VARCHAR(100),
    
    -- Resultado
    status          VARCHAR(20) DEFAULT 'success',      -- success, failure, error
    error_message   TEXT,
    
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_user ON activity_logs(user_id);
CREATE INDEX idx_activity_action ON activity_logs(action);
CREATE INDEX idx_activity_resource ON activity_logs(resource_type, resource_id);
CREATE INDEX idx_activity_created ON activity_logs(created_at DESC);

-- ============================================================
-- TABLA: api_logs (Logs de peticiones API)
-- ============================================================
CREATE TABLE api_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Request
    method          VARCHAR(10) NOT NULL,
    endpoint        VARCHAR(255) NOT NULL,
    query_params    JSONB,
    request_body    JSONB,
    request_headers JSONB,
    
    -- Response
    status_code     INTEGER,
    response_body   JSONB,
    response_time_ms INTEGER,
    
    -- Contexto
    ip_address      VARCHAR(45),
    user_agent      TEXT,
    request_id      VARCHAR(100),
    
    -- Error
    error_message   TEXT,
    error_stack     TEXT,
    
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_logs_user ON api_logs(user_id);
CREATE INDEX idx_api_logs_endpoint ON api_logs(endpoint);
CREATE INDEX idx_api_logs_status ON api_logs(status_code);
CREATE INDEX idx_api_logs_created ON api_logs(created_at DESC);

-- Particionado por fecha (para volumen alto)
-- CREATE TABLE api_logs_2026_02 PARTITION OF api_logs
--     FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- ============================================================
-- TABLA: app_config (Configuración dinámica)
-- ============================================================
CREATE TABLE app_config (
    id              SERIAL PRIMARY KEY,
    key             VARCHAR(100) UNIQUE NOT NULL,
    value           TEXT,
    type            VARCHAR(20) DEFAULT 'string',       -- string, number, boolean, json
    description     TEXT,
    is_public       BOOLEAN DEFAULT false,              -- Visible en app
    
    updated_by      UUID REFERENCES users(id),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Configuraciones iniciales
INSERT INTO app_config (key, value, type, description, is_public) VALUES
    ('app_name', 'FashionStore', 'string', 'Nombre de la aplicación', true),
    ('app_version', '3.0.0', 'string', 'Versión actual', true),
    ('min_app_version', '2.5.0', 'string', 'Versión mínima requerida', true),
    ('maintenance_mode', 'false', 'boolean', 'Modo mantenimiento', true),
    ('maintenance_message', '', 'string', 'Mensaje de mantenimiento', true),
    ('currency', 'EUR', 'string', 'Moneda principal', true),
    ('tax_rate', '21', 'number', 'Porcentaje de IVA', true),
    ('free_shipping_threshold', '50', 'number', 'Mínimo para envío gratis', true),
    ('default_shipping_cost', '4.99', 'number', 'Costo de envío por defecto', true),
    ('max_cart_items', '50', 'number', 'Máximo items en carrito', true),
    ('support_email', 'soporte@fashionstore.com', 'string', 'Email de soporte', true),
    ('support_phone', '+34 900 123 456', 'string', 'Teléfono de soporte', true),
    ('terms_url', 'https://fashionstore.com/terms', 'string', 'URL términos', true),
    ('privacy_url', 'https://fashionstore.com/privacy', 'string', 'URL privacidad', true),
    
    -- Configuraciones privadas (solo admin)
    ('smtp_host', 'smtp.sendgrid.net', 'string', 'Host SMTP', false),
    ('smtp_port', '587', 'number', 'Puerto SMTP', false),
    ('stripe_webhook_secret', 'whsec_...', 'string', 'Secret webhook Stripe', false),
    ('daily_report_time', '08:00', 'string', 'Hora de reporte diario', false),
    ('low_stock_alert_threshold', '5', 'number', 'Umbral alerta stock bajo', false);

-- ============================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- (Repetir para otras tablas...)

-- Función para generar número de orden
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || 
                       LPAD(NEXTVAL('order_number_seq')::TEXT, 5, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE SEQUENCE order_number_seq;
CREATE TRIGGER set_order_number BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Función para generar número de ticket
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ticket_number = 'TKT-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || 
                        LPAD(NEXTVAL('ticket_number_seq')::TEXT, 5, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE SEQUENCE ticket_number_seq;
CREATE TRIGGER set_ticket_number BEFORE INSERT ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION generate_ticket_number();

-- Función para actualizar rating promedio de producto
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET rating_average = (
        SELECT COALESCE(AVG(rating), 0)
        FROM reviews
        WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND status = 'approved'
    ),
    rating_count = (
        SELECT COUNT(*)
        FROM reviews
        WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND status = 'approved'
    )
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rating_on_review AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Función para control de stock atómico
CREATE OR REPLACE FUNCTION decrease_stock(
    p_variant_id UUID,
    p_quantity INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_stock INTEGER;
BEGIN
    -- Obtener stock con bloqueo
    SELECT stock INTO v_current_stock
    FROM product_variants
    WHERE id = p_variant_id
    FOR UPDATE;
    
    IF v_current_stock IS NULL THEN
        RAISE EXCEPTION 'Variante no encontrada: %', p_variant_id;
    END IF;
    
    IF v_current_stock < p_quantity THEN
        RAISE EXCEPTION 'Stock insuficiente. Disponible: %, Solicitado: %', 
            v_current_stock, p_quantity;
    END IF;
    
    UPDATE product_variants
    SET stock = stock - p_quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_variant_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Función para restaurar stock
CREATE OR REPLACE FUNCTION increase_stock(
    p_variant_id UUID,
    p_quantity INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE product_variants
    SET stock = stock + p_quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_variant_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Variante no encontrada: %', p_variant_id;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

---

# ═══════════════════════════════════════════════════════════════
# SECCIÓN 5: SISTEMA DE AUTENTICACIÓN JWT
# ═══════════════════════════════════════════════════════════════

## 5.1 FLUJO DE AUTENTICACIÓN COMPLETO

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE AUTENTICACIÓN JWT                            │
└──────────────────────────────────────────────────────────────────────────┘

                              REGISTRO
┌─────────────┐                                        ┌─────────────────┐
│   FLUTTER   │  1. POST /api/auth/register            │    SERVIDOR     │
│     APP     │  {email, password, firstName}          │                 │
│             │ ───────────────────────────────────►   │                 │
│             │                                        │  2. Validar     │
│             │                                        │  3. Hash pass   │
│             │                                        │  4. Crear user  │
│             │                                        │  5. Generar     │
│             │                                        │     tokens      │
│             │  6. {tokens, user}                     │                 │
│             │ ◄───────────────────────────────────   │                 │
│             │                                        │                 │
│  7. Guardar │                                        │  8. Enviar      │
│     tokens  │                                        │     email       │
│     en      │                                        │     verificación│
│  SecureStore│                                        │                 │
└─────────────┘                                        └─────────────────┘


                               LOGIN
┌─────────────┐                                        ┌─────────────────┐
│   FLUTTER   │  1. POST /api/auth/login               │    SERVIDOR     │
│     APP     │  {email, password}                     │                 │
│             │ ───────────────────────────────────►   │                 │
│             │                                        │  2. Buscar user │
│             │                                        │  3. Verificar   │
│             │                                        │     password    │
│             │                                        │  4. Verificar   │
│             │                                        │     cuenta      │
│             │                                        │  5. Generar     │
│             │                                        │     tokens      │
│             │                                        │  6. Crear       │
│             │                                        │     sesión      │
│             │  7. {tokens, user}                     │                 │
│             │ ◄───────────────────────────────────   │                 │
│             │                                        │                 │
│  8. Guardar │                                        │  9. Log         │
│     tokens  │                                        │     actividad   │
└─────────────┘                                        └─────────────────┘


                         PETICIÓN AUTENTICADA
┌─────────────┐                                        ┌─────────────────┐
│   FLUTTER   │  1. GET /api/user/profile              │    SERVIDOR     │
│     APP     │  Headers:                              │                 │
│             │    Authorization: Bearer eyJ...        │                 │
│             │ ───────────────────────────────────►   │                 │
│             │                                        │ 2. Extraer JWT  │
│             │                                        │ 3. Verificar    │
│             │                                        │    firma        │
│             │                                        │ 4. Verificar    │
│             │                                        │    expiración   │
│             │                                        │ 5. Decodificar  │
│             │                                        │    payload      │
│             │                                        │ 6. Cargar user  │
│             │                                        │ 7. Procesar     │
│             │                                        │    petición     │
│             │  8. Response 200 OK                    │                 │
│             │ ◄───────────────────────────────────   │                 │
└─────────────┘                                        └─────────────────┘


                         REFRESH TOKEN
┌─────────────┐                                        ┌─────────────────┐
│   FLUTTER   │  1. POST /api/auth/refresh             │    SERVIDOR     │
│     APP     │  {refreshToken: "..."}                 │                 │
│             │ ───────────────────────────────────►   │                 │
│             │                                        │ 2. Validar      │
│             │                                        │    refresh      │
│             │                                        │ 3. Verificar    │
│             │                                        │    sesión       │
│             │                                        │ 4. Generar      │
│             │                                        │    nuevos       │
│             │                                        │    tokens       │
│             │  5. {accessToken, refreshToken}        │                 │
│             │ ◄───────────────────────────────────   │                 │
│             │                                        │                 │
│  6. Guardar │                                        │                 │
│     nuevos  │                                        │                 │
│     tokens  │                                        │                 │
└─────────────┘                                        └─────────────────┘
```

## 5.2 ESTRUCTURA DEL TOKEN JWT

```javascript
// ═══════════════════════════════════════════════════════════════
// ACCESS TOKEN
// Duración: 15 minutos
// Uso: Autenticar peticiones a la API
// ═══════════════════════════════════════════════════════════════

// Header
{
  "alg": "HS256",                    // Algoritmo de firma
  "typ": "JWT"                       // Tipo de token
}

// Payload
{
  "sub": "f47ac10b-58cc-4372-a567-0e02b2c3d479",  // User ID
  "email": "usuario@ejemplo.com",
  "role": "customer",
  "roleId": 5,
  "permissions": ["orders.create", "orders.read"],
  "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "type": "access",
  "iat": 1738540800,                 // Issued At (Unix timestamp)
  "exp": 1738541700,                 // Expires (15 min después)
  "iss": "fashionstore-api",         // Issuer
  "aud": "fashionstore-app"          // Audience
}

// Signature
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)

// Token completo (ejemplo)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiJmNDdhYzEwYi01OGNjLTQzNzItYTU2Ny0wZTAyYjJjM2Q0NzkiLCJlbWFpbCI6InVzdWFyaW9AZWplbXBsby5jb20iLCJyb2xlIjoiY3VzdG9tZXIiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzM4NTQwODAwLCJleHAiOjE3Mzg1NDE3MDB9.
HnB4qQHg6N8YxVD3O1hKL0fVrI5bDwXjS3Uz9mYkP7k


// ═══════════════════════════════════════════════════════════════
// REFRESH TOKEN
// Duración: 7 días
// Uso: Obtener nuevo access token sin re-autenticar
// ═══════════════════════════════════════════════════════════════

{
  "sub": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "type": "refresh",
  "iat": 1738540800,
  "exp": 1739145600,                 // 7 días después
  "iss": "fashionstore-api"
}
```

## 5.3 IMPLEMENTACIÓN BACKEND

```javascript
// src/config/jwt.js
// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN JWT
// ═══════════════════════════════════════════════════════════════

module.exports = {
  // Secretos (en producción desde .env)
  accessTokenSecret: process.env.JWT_ACCESS_SECRET,
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET,
  
  // Duración de tokens
  accessTokenExpiry: '15m',          // 15 minutos
  refreshTokenExpiry: '7d',          // 7 días
  
  // Opciones de firma
  signOptions: {
    algorithm: 'HS256',
    issuer: 'fashionstore-api',
    audience: 'fashionstore-app'
  },
  
  // Opciones de verificación
  verifyOptions: {
    algorithms: ['HS256'],
    issuer: 'fashionstore-api',
    audience: 'fashionstore-app'
  }
};


// src/utils/jwt.utils.js
// ═══════════════════════════════════════════════════════════════
// UTILIDADES JWT
// ═══════════════════════════════════════════════════════════════

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/jwt');

/**
 * Genera un par de tokens (access + refresh)
 * @param {Object} user - Usuario autenticado
 * @param {string} sessionId - ID de la sesión
 * @returns {Object} { accessToken, refreshToken, expiresIn }
 */
function generateTokenPair(user, sessionId) {
  const accessPayload = {
    sub: user.id,
    email: user.email,
    role: user.role.name,
    roleId: user.role_id,
    permissions: user.permissions || [],
    sessionId: sessionId,
    type: 'access'
  };
  
  const refreshPayload = {
    sub: user.id,
    sessionId: sessionId,
    type: 'refresh'
  };
  
  const accessToken = jwt.sign(
    accessPayload,
    config.accessTokenSecret,
    {
      expiresIn: config.accessTokenExpiry,
      ...config.signOptions
    }
  );
  
  const refreshToken = jwt.sign(
    refreshPayload,
    config.refreshTokenSecret,
    {
      expiresIn: config.refreshTokenExpiry,
      ...config.signOptions
    }
  );
  
  // Calcular timestamp de expiración
  const decoded = jwt.decode(accessToken);
  const expiresIn = decoded.exp - decoded.iat;
  const expiresAt = new Date(decoded.exp * 1000).toISOString();
  
  return {
    accessToken,
    refreshToken,
    expiresIn,          // Segundos (900 = 15 min)
    expiresAt,          // ISO timestamp
    tokenType: 'Bearer'
  };
}

/**
 * Verifica un access token
 * @param {string} token - Token a verificar
 * @returns {Object} Payload decodificado
 * @throws {Error} Si el token es inválido
 */
function verifyAccessToken(token) {
  try {
    const payload = jwt.verify(
      token,
      config.accessTokenSecret,
      config.verifyOptions
    );
    
    if (payload.type !== 'access') {
      throw new Error('Invalid token type');
    }
    
    return payload;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      const err = new Error('Token expired');
      err.code = 'TOKEN_EXPIRED';
      throw err;
    }
    if (error.name === 'JsonWebTokenError') {
      const err = new Error('Invalid token');
      err.code = 'INVALID_TOKEN';
      throw err;
    }
    throw error;
  }
}

/**
 * Verifica un refresh token
 * @param {string} token - Refresh token
 * @returns {Object} Payload decodificado
 */
function verifyRefreshToken(token) {
  try {
    const payload = jwt.verify(
      token,
      config.refreshTokenSecret,
      config.verifyOptions
    );
    
    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return payload;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      const err = new Error('Refresh token expired');
      err.code = 'REFRESH_EXPIRED';
      throw err;
    }
    throw error;
  }
}

/**
 * Extrae el token del header Authorization
 * @param {string} authHeader - Header completo "Bearer eyJ..."
 * @returns {string|null} Token sin "Bearer "
 */
function extractTokenFromHeader(authHeader) {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

/**
 * Genera un token hash para almacenar en DB (seguridad adicional)
 * @param {string} token - Token original
 * @returns {string} Hash SHA256
 */
function hashToken(token) {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}

module.exports = {
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  extractTokenFromHeader,
  hashToken
};


// src/middleware/auth.middleware.js
// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE DE AUTENTICACIÓN
// ═══════════════════════════════════════════════════════════════

const { verifyAccessToken, extractTokenFromHeader } = require('../utils/jwt.utils');
const { User, Role, UserSession } = require('../models');
const { createResponse } = require('../utils/response.utils');

/**
 * Middleware para verificar JWT y cargar usuario
 * Uso: router.get('/profile', authenticate, controller.getProfile)
 */
async function authenticate(req, res, next) {
  try {
    // 1. Extraer token del header
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json(
        createResponse(false, null, 'Token no proporcionado', 'NO_TOKEN')
      );
    }
    
    // 2. Verificar y decodificar token
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (error) {
      if (error.code === 'TOKEN_EXPIRED') {
        return res.status(401).json(
          createResponse(false, null, 'Token expirado', 'TOKEN_EXPIRED')
        );
      }
      return res.status(401).json(
        createResponse(false, null, 'Token inválido', 'INVALID_TOKEN')
      );
    }
    
    // 3. Verificar que la sesión sigue activa
    const session = await UserSession.findOne({
      where: {
        id: payload.sessionId,
        user_id: payload.sub,
        is_active: true
      }
    });
    
    if (!session) {
      return res.status(401).json(
        createResponse(false, null, 'Sesión inválida o expirada', 'INVALID_SESSION')
      );
    }
    
    // 4. Cargar usuario con rol
    const user = await User.findOne({
      where: {
        id: payload.sub,
        is_active: true,
        deleted_at: null
      },
      include: [{
        model: Role,
        as: 'role'
      }],
      attributes: {
        exclude: ['password_hash', 'two_factor_secret']
      }
    });
    
    if (!user) {
      return res.status(401).json(
        createResponse(false, null, 'Usuario no encontrado o inactivo', 'USER_NOT_FOUND')
      );
    }
    
    // 5. Verificar si la cuenta está bloqueada
    if (user.locked_until && user.locked_until > new Date()) {
      return res.status(403).json(
        createResponse(false, null, 'Cuenta bloqueada temporalmente', 'ACCOUNT_LOCKED')
      );
    }
    
    // 6. Actualizar última actividad de sesión
    await session.update({
      last_activity: new Date()
    });
    
    // 7. Adjuntar datos al request
    req.user = user;
    req.userId = user.id;
    req.userRole = user.role.name;
    req.session = session;
    req.tokenPayload = payload;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json(
      createResponse(false, null, 'Error de autenticación', 'AUTH_ERROR')
    );
  }
}

/**
 * Middleware opcional - No falla si no hay token
 * Útil para rutas públicas que cambian comportamiento si hay usuario
 */
async function authenticateOptional(req, res, next) {
  const token = extractTokenFromHeader(req.headers.authorization);
  
  if (!token) {
    req.user = null;
    return next();
  }
  
  try {
    const payload = verifyAccessToken(token);
    const user = await User.findByPk(payload.sub, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password_hash'] }
    });
    
    req.user = user;
    req.userId = user?.id;
  } catch (error) {
    req.user = null;
  }
  
  next();
}

module.exports = {
  authenticate,
  authenticateOptional
};


// src/middleware/admin.middleware.js
// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE DE ADMINISTRADOR
// ═══════════════════════════════════════════════════════════════

const { createResponse } = require('../utils/response.utils');

const ADMIN_ROLES = ['super_admin', 'admin'];

/**
 * Verificar que el usuario es administrador
 * Uso: router.get('/admin/users', authenticate, requireAdmin, controller)
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json(
      createResponse(false, null, 'No autenticado', 'NOT_AUTHENTICATED')
    );
  }
  
  if (!ADMIN_ROLES.includes(req.userRole)) {
    return res.status(403).json(
      createResponse(false, null, 'Acceso denegado. Se requiere rol de administrador', 'FORBIDDEN')
    );
  }
  
  next();
}

/**
 * Verificar permisos específicos
 * Uso: router.post('/products', authenticate, requirePermission('products.create'), controller)
 */
function requirePermission(...permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(
        createResponse(false, null, 'No autenticado', 'NOT_AUTHENTICATED')
      );
    }
    
    // Super admin tiene todos los permisos
    if (req.userRole === 'super_admin') {
      return next();
    }
    
    const userPermissions = req.tokenPayload.permissions || [];
    const hasPermission = permissions.some(p => userPermissions.includes(p));
    
    if (!hasPermission) {
      return res.status(403).json(
        createResponse(
          false, 
          null, 
          `Permiso requerido: ${permissions.join(' o ')}`, 
          'INSUFFICIENT_PERMISSIONS'
        )
      );
    }
    
    next();
  };
}

/**
 * Verificar rol específico
 * Uso: router.get('/support', authenticate, requireRole('support', 'admin'), controller)
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(
        createResponse(false, null, 'No autenticado', 'NOT_AUTHENTICATED')
      );
    }
    
    if (!roles.includes(req.userRole)) {
      return res.status(403).json(
        createResponse(
          false, 
          null, 
          `Rol requerido: ${roles.join(' o ')}`, 
          'INSUFFICIENT_ROLE'
        )
      );
    }
    
    next();
  };
}

module.exports = {
  requireAdmin,
  requirePermission,
  requireRole,
  ADMIN_ROLES
};
```

## 5.4 IMPLEMENTACIÓN FLUTTER

```dart
// lib/core/storage/secure_storage.dart
// ═══════════════════════════════════════════════════════════════
// ALMACENAMIENTO SEGURO DE TOKENS
// ═══════════════════════════════════════════════════════════════

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock_this_device,
    ),
  );
  
  // Keys
  static const _accessTokenKey = 'access_token';
  static const _refreshTokenKey = 'refresh_token';
  static const _userIdKey = 'user_id';
  static const _userDataKey = 'user_data';
  static const _tokenExpiryKey = 'token_expiry';
  
  // ═══════════════════════════════════════════════════════════════
  // TOKENS
  // ═══════════════════════════════════════════════════════════════
  
  static Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
    required String expiresAt,
  }) async {
    await Future.wait([
      _storage.write(key: _accessTokenKey, value: accessToken),
      _storage.write(key: _refreshTokenKey, value: refreshToken),
      _storage.write(key: _tokenExpiryKey, value: expiresAt),
    ]);
  }
  
  static Future<String?> getAccessToken() async {
    return await _storage.read(key: _accessTokenKey);
  }
  
  static Future<String?> getRefreshToken() async {
    return await _storage.read(key: _refreshTokenKey);
  }
  
  static Future<DateTime?> getTokenExpiry() async {
    final expiry = await _storage.read(key: _tokenExpiryKey);
    if (expiry == null) return null;
    return DateTime.tryParse(expiry);
  }
  
  static Future<bool> isTokenExpired() async {
    final expiry = await getTokenExpiry();
    if (expiry == null) return true;
    // Considerar expirado 1 minuto antes para dar margen
    return DateTime.now().isAfter(expiry.subtract(const Duration(minutes: 1)));
  }
  
  // ═══════════════════════════════════════════════════════════════
  // USUARIO
  // ═══════════════════════════════════════════════════════════════
  
  static Future<void> saveUserId(String userId) async {
    await _storage.write(key: _userIdKey, value: userId);
  }
  
  static Future<String?> getUserId() async {
    return await _storage.read(key: _userIdKey);
  }
  
  static Future<void> saveUserData(String userData) async {
    await _storage.write(key: _userDataKey, value: userData);
  }
  
  static Future<String?> getUserData() async {
    return await _storage.read(key: _userDataKey);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // LOGOUT
  // ═══════════════════════════════════════════════════════════════
  
  static Future<void> clearAll() async {
    await _storage.deleteAll();
  }
  
  static Future<void> clearTokens() async {
    await Future.wait([
      _storage.delete(key: _accessTokenKey),
      _storage.delete(key: _refreshTokenKey),
      _storage.delete(key: _tokenExpiryKey),
    ]);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // VERIFICAR AUTENTICACIÓN
  // ═══════════════════════════════════════════════════════════════
  
  static Future<bool> isAuthenticated() async {
    final accessToken = await getAccessToken();
    final refreshToken = await getRefreshToken();
    return accessToken != null && refreshToken != null;
  }
}


// lib/core/network/api_interceptor.dart
// ═══════════════════════════════════════════════════════════════
// INTERCEPTOR DIO PARA JWT AUTOMÁTICO
// ═══════════════════════════════════════════════════════════════

import 'package:dio/dio.dart';
import '../storage/secure_storage.dart';
import '../../config/api_config.dart';

class AuthInterceptor extends Interceptor {
  final Dio _dio;
  bool _isRefreshing = false;
  
  AuthInterceptor(this._dio);
  
  @override
  void onRequest(
    RequestOptions options, 
    RequestInterceptorHandler handler
  ) async {
    // Rutas que no necesitan auth
    final publicPaths = [
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/products',
      '/categories',
    ];
    
    final isPublic = publicPaths.any((path) => 
      options.path.contains(path) && options.method == 'GET'
    );
    
    if (!isPublic) {
      // Verificar si token está por expirar
      final isExpired = await SecureStorageService.isTokenExpired();
      
      if (isExpired && !_isRefreshing) {
        // Intentar refresh
        final refreshed = await _refreshToken();
        if (!refreshed) {
          // No se pudo refrescar, enviar al login
          handler.reject(
            DioException(
              requestOptions: options,
              error: 'Session expired',
              type: DioExceptionType.cancel,
            ),
          );
          return;
        }
      }
      
      // Agregar token al header
      final token = await SecureStorageService.getAccessToken();
      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }
    }
    
    handler.next(options);
  }
  
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      final errorCode = err.response?.data['code'];
      
      if (errorCode == 'TOKEN_EXPIRED' && !_isRefreshing) {
        // Intentar refresh y reintentar request
        final refreshed = await _refreshToken();
        
        if (refreshed) {
          // Reintentar la petición original
          final token = await SecureStorageService.getAccessToken();
          final options = err.requestOptions;
          options.headers['Authorization'] = 'Bearer $token';
          
          try {
            final response = await _dio.fetch(options);
            handler.resolve(response);
            return;
          } catch (e) {
            handler.reject(err);
            return;
          }
        }
      }
      
      // No se pudo recuperar, limpiar sesión
      await SecureStorageService.clearAll();
      // Navegar al login (usar GlobalKey de navigator o event bus)
    }
    
    handler.next(err);
  }
  
  Future<bool> _refreshToken() async {
    _isRefreshing = true;
    
    try {
      final refreshToken = await SecureStorageService.getRefreshToken();
      
      if (refreshToken == null) {
        return false;
      }
      
      // Crear dio sin interceptor para evitar loop
      final refreshDio = Dio(BaseOptions(
        baseUrl: ApiConfig.baseUrl,
        headers: {'Content-Type': 'application/json'},
      ));
      
      final response = await refreshDio.post(
        '/auth/refresh',
        data: {'refreshToken': refreshToken},
      );
      
      if (response.statusCode == 200 && response.data['success']) {
        final tokens = response.data['data']['tokens'];
        
        await SecureStorageService.saveTokens(
          accessToken: tokens['accessToken'],
          refreshToken: tokens['refreshToken'],
          expiresAt: tokens['expiresAt'],
        );
        
        return true;
      }
      
      return false;
    } catch (e) {
      print('Refresh token error: $e');
      return false;
    } finally {
      _isRefreshing = false;
    }
  }
}
```

---

# ═══════════════════════════════════════════════════════════════
# SECCIÓN 6: CLAVES Y SECRETOS DEL SISTEMA (.ENV)
# ═══════════════════════════════════════════════════════════════

## 6.1 ARCHIVO .ENV COMPLETO CON EXPLICACIONES

```bash
# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║                    ARCHIVO DE CONFIGURACIÓN (.env)                         ║
# ║                    FashionStore API - v3.0.0                              ║
# ║                                                                            ║
# ║    IMPORTANTE: Este archivo contiene credenciales sensibles.              ║
# ║    - NUNCA subir a control de versiones                                   ║
# ║    - Añadir a .gitignore                                                  ║
# ║    - En producción usar secrets manager (AWS Secrets, Vault, etc.)       ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

# ═══════════════════════════════════════════════════════════════
# ENTORNO
# ═══════════════════════════════════════════════════════════════
# Determina el modo de ejecución de la aplicación
# Valores: development | staging | production
NODE_ENV=development

# Puerto donde escucha el servidor Express
# En producción generalmente es 80/443 (manejado por nginx/load balancer)
PORT=3001

# Nombre de la aplicación (usado en logs, emails, etc.)
APP_NAME=FashionStore

# URL base del API (para generar links en emails)
API_URL=https://api.fashionstore.com

# URL del frontend/app (para CORS y redirects)
CLIENT_URL=https://fashionstore.com
ADMIN_URL=https://admin.fashionstore.com

# Versión de la API
API_VERSION=v1


# ═══════════════════════════════════════════════════════════════
# BASE DE DATOS - POSTGRESQL
# ═══════════════════════════════════════════════════════════════
# Conexión principal a PostgreSQL
# Formato: postgresql://usuario:contraseña@host:puerto/base_de_datos

# Desarrollo local
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fashionstore_dev
DB_USER=fashionstore_user
DB_PASSWORD=F@sh10nSt0r3_D3v_2024!

# URL completa (alternativa)
DATABASE_URL=postgresql://fashionstore_user:F@sh10nSt0r3_D3v_2024!@localhost:5432/fashionstore_dev

# Pool de conexiones
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000

# SSL (activar en producción)
DB_SSL=false

# Logging de queries (solo desarrollo)
DB_LOGGING=true


# ═══════════════════════════════════════════════════════════════
# REDIS - CACHE Y SESIONES
# ═══════════════════════════════════════════════════════════════
# Redis para caché, rate limiting y sesiones

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=R3d1s_F@sh10n_S3cr3t_K3y!
REDIS_DB=0

# URL completa (alternativa)
REDIS_URL=redis://:R3d1s_F@sh10n_S3cr3t_K3y!@localhost:6379/0

# TTL por defecto para cache (segundos)
REDIS_DEFAULT_TTL=3600


# ═══════════════════════════════════════════════════════════════
# JWT - AUTENTICACIÓN
# ═══════════════════════════════════════════════════════════════
# Secretos para firmar tokens JWT
# IMPORTANTE: Deben ser strings largos y aleatorios (mínimo 64 caracteres)
# Generar con: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Secret para access tokens (vida corta: 15 min)
JWT_ACCESS_SECRET=a8f3b7c2d1e9f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1

# Secret para refresh tokens (vida larga: 7 días)
JWT_REFRESH_SECRET=1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1

# Duración de tokens
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Issuer y Audience para tokens
JWT_ISSUER=fashionstore-api
JWT_AUDIENCE=fashionstore-app


# ═══════════════════════════════════════════════════════════════
# HASH - CONTRASEÑAS
# ═══════════════════════════════════════════════════════════════
# Número de rondas de salt para bcrypt
# Mayor = más seguro pero más lento
# 10-12 es el estándar para producción
BCRYPT_SALT_ROUNDS=12


# ═══════════════════════════════════════════════════════════════
# STRIPE - PAGOS
# ═══════════════════════════════════════════════════════════════
# Credenciales de Stripe
# Obtener en: https://dashboard.stripe.com/apikeys

# API Keys
# TEST keys (empiezan con sk_test_ y pk_test_)
STRIPE_SECRET_KEY=sk_test_51N0ExampleStripeSecretKey1234567890ABCDEFGHIJKLMNOPqrstuvwxyz
STRIPE_PUBLISHABLE_KEY=pk_test_51N0ExampleStripePublishableKey1234567890ABCDEFGHIJKLMNOPqrstuvwxyz

# LIVE keys (empiezan con sk_live_ y pk_live_) - SOLO PRODUCCIÓN
# STRIPE_SECRET_KEY=sk_live_...
# STRIPE_PUBLISHABLE_KEY=pk_live_...

# Webhook secret (para verificar eventos de Stripe)
# Obtener en: https://dashboard.stripe.com/webhooks
STRIPE_WEBHOOK_SECRET=whsec_ExampleWebhookSecret1234567890ABCDEFGHIJKLMNOPqrstuvwxyz

# URL del webhook (tu endpoint)
STRIPE_WEBHOOK_URL=https://api.fashionstore.com/api/webhooks/stripe

# Moneda por defecto
STRIPE_CURRENCY=eur


# ═══════════════════════════════════════════════════════════════
# EMAIL - SENDGRID
# ═══════════════════════════════════════════════════════════════
# Configuración de SendGrid para envío de emails
# Obtener en: https://app.sendgrid.com/settings/api_keys

# API Key de SendGrid
SENDGRID_API_KEY=SG.ExampleSendGridApiKey1234567890.ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnop

# Email remitente (debe estar verificado en SendGrid)
EMAIL_FROM_ADDRESS=noreply@fashionstore.com
EMAIL_FROM_NAME=FashionStore

# Email de soporte
EMAIL_SUPPORT=soporte@fashionstore.com

# Email para notificaciones del sistema (nuevos pedidos, etc.)
EMAIL_ADMIN=admin@fashionstore.com

# Templates IDs de SendGrid (opcional, si usas templates dinámicos)
SENDGRID_TEMPLATE_WELCOME=d-abc123examplewelcometemplate
SENDGRID_TEMPLATE_VERIFY=d-abc123exampleverifytemplate
SENDGRID_TEMPLATE_RESET=d-abc123exampleresettemplate
SENDGRID_TEMPLATE_ORDER=d-abc123exampleordertemplate


# ═══════════════════════════════════════════════════════════════
# EMAIL - SMTP (Alternativa a SendGrid)
# ═══════════════════════════════════════════════════════════════
# Configuración SMTP directa (Nodemailer)
# Usar si prefieres SMTP tradicional en lugar de SendGrid

SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=SG.ExampleSendGridApiKey1234567890.ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnop


# ═══════════════════════════════════════════════════════════════
# FIREBASE - PUSH NOTIFICATIONS
# ═══════════════════════════════════════════════════════════════
# Credenciales de Firebase Admin SDK
# Descargar de: Firebase Console > Project Settings > Service Accounts

# Ruta al archivo de credenciales JSON
FIREBASE_CREDENTIALS_PATH=./config/firebase-service-account.json

# O credenciales directas (alternativa)
FIREBASE_PROJECT_ID=fashionstore-app-12345
FIREBASE_PRIVATE_KEY_ID=abc123exampleprivatekeyid
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhki...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@fashionstore-app-12345.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789012345678901


# ═══════════════════════════════════════════════════════════════
# SUPABASE - STORAGE Y REALTIME
# ═══════════════════════════════════════════════════════════════
# Credenciales de Supabase
# Obtener en: Supabase Dashboard > Settings > API

SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.exampleanonkey123456789
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.exampleservicekey123456789

# Bucket para imágenes
SUPABASE_BUCKET_NAME=product-images


# ═══════════════════════════════════════════════════════════════
# CLOUDINARY - IMÁGENES (Alternativa a Supabase Storage)
# ═══════════════════════════════════════════════════════════════
# Credenciales de Cloudinary
# Obtener en: https://cloudinary.com/console

CLOUDINARY_CLOUD_NAME=fashionstore
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=ABCDEfghijKLMNopqRSTUvwxYZ12

# Carpeta base para uploads
CLOUDINARY_FOLDER=fashionstore/products


# ═══════════════════════════════════════════════════════════════
# RATE LIMITING
# ═══════════════════════════════════════════════════════════════
# Configuración de límite de peticiones

# Ventana de tiempo en minutos
RATE_LIMIT_WINDOW_MINUTES=15

# Máximo de peticiones por ventana (general)
RATE_LIMIT_MAX_REQUESTS=100

# Límite para login (más restrictivo)
RATE_LIMIT_LOGIN_MAX=5

# Límite para registro
RATE_LIMIT_REGISTER_MAX=3


# ═══════════════════════════════════════════════════════════════
# CORS - ORÍGENES PERMITIDOS
# ═══════════════════════════════════════════════════════════════
# Lista de orígenes permitidos (separados por coma)
CORS_ORIGINS=http://localhost:3000,http://localhost:8080,https://fashionstore.com,https://admin.fashionstore.com,https://app.fashionstore.com

# Métodos permitidos
CORS_METHODS=GET,POST,PUT,PATCH,DELETE,OPTIONS

# Headers permitidos
CORS_HEADERS=Content-Type,Authorization,X-Requested-With,X-Request-ID


# ═══════════════════════════════════════════════════════════════
# LOGS
# ═══════════════════════════════════════════════════════════════
# Configuración de logging

# Nivel de log: error, warn, info, http, verbose, debug, silly
LOG_LEVEL=info

# Directorio de logs
LOG_DIR=./logs

# Tamaño máximo de archivo de log
LOG_MAX_SIZE=10m

# Días de retención
LOG_MAX_DAYS=30

# Log de requests HTTP
LOG_HTTP_REQUESTS=true


# ═══════════════════════════════════════════════════════════════
# SEGURIDAD
# ═══════════════════════════════════════════════════════════════
# Configuraciones de seguridad adicionales

# Número máximo de intentos de login fallidos antes de bloqueo
MAX_LOGIN_ATTEMPTS=5

# Duración del bloqueo en minutos
ACCOUNT_LOCK_DURATION=30

# Tiempo de expiración de token de verificación email (horas)
EMAIL_VERIFICATION_EXPIRY=24

# Tiempo de expiración de token de reset password (horas)
PASSWORD_RESET_EXPIRY=1


# ═══════════════════════════════════════════════════════════════
# UPLOADS
# ═══════════════════════════════════════════════════════════════
# Configuración de subida de archivos

# Tamaño máximo de archivo (bytes)
UPLOAD_MAX_SIZE=5242880

# Tipos MIME permitidos para imágenes
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/webp,image/gif

# Directorio temporal de uploads
UPLOAD_TEMP_DIR=./uploads/temp


# ═══════════════════════════════════════════════════════════════
# SENTRY - MONITOREO DE ERRORES
# ═══════════════════════════════════════════════════════════════
# Opcional: Sentry para tracking de errores
# Obtener en: https://sentry.io

SENTRY_DSN=https://examplekey@o123456.ingest.sentry.io/1234567
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=0.1


# ═══════════════════════════════════════════════════════════════
# NEGOCIO
# ═══════════════════════════════════════════════════════════════
# Configuraciones de negocio

# Porcentaje de IVA
TAX_RATE=21

# Mínimo para envío gratis (EUR)
FREE_SHIPPING_THRESHOLD=50

# Costo de envío estándar (EUR)
DEFAULT_SHIPPING_COST=4.99

# Máximo de items en carrito
MAX_CART_ITEMS=50

# Tiempo de reserva de stock (minutos)
STOCK_RESERVATION_MINUTES=15
```

## 6.2 ARCHIVO .ENV PARA FLUTTER

```bash
# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║                    .env.development - Flutter App                          ║
# ║                    FashionStore Mobile - v3.0.0                           ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

# ═══════════════════════════════════════════════════════════════
# API
# ═══════════════════════════════════════════════════════════════
# URL base del API backend
API_BASE_URL=http://10.0.2.2:3001/api
# Para iOS simulator: http://localhost:3001/api
# Para dispositivo físico: http://192.168.1.xxx:3001/api
# Para producción: https://api.fashionstore.com/api

# Versión de la API
API_VERSION=v1

# Timeout de peticiones (milisegundos)
API_TIMEOUT=30000

# ═══════════════════════════════════════════════════════════════
# STRIPE
# ═══════════════════════════════════════════════════════════════
STRIPE_PUBLISHABLE_KEY=pk_test_51N0ExampleStripePublishableKey1234567890

# Merchant ID para Apple Pay
STRIPE_MERCHANT_ID=merchant.com.fashionstore.app

# ═══════════════════════════════════════════════════════════════
# FIREBASE
# ═══════════════════════════════════════════════════════════════
# Estas credenciales se configuran en google-services.json (Android)
# y GoogleService-Info.plist (iOS)

# ═══════════════════════════════════════════════════════════════
# APP
# ═══════════════════════════════════════════════════════════════
APP_NAME=FashionStore
APP_ENV=development

# Términos y privacidad
TERMS_URL=https://fashionstore.com/terms
PRIVACY_URL=https://fashionstore.com/privacy

# Soporte
SUPPORT_EMAIL=soporte@fashionstore.com
SUPPORT_PHONE=+34900123456
```

---

# ═══════════════════════════════════════════════════════════════
# SECCIÓN 7: API REST - ENDPOINTS COMPLETOS
# ═══════════════════════════════════════════════════════════════

## 7.1 TABLA DE ENDPOINTS

### AUTENTICACIÓN (/api/auth)

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| POST | /auth/register | Registro de usuario | ❌ | - |
| POST | /auth/login | Iniciar sesión | ❌ | - |
| POST | /auth/logout | Cerrar sesión | ✅ | * |
| POST | /auth/refresh | Renovar token | ❌ | - |
| POST | /auth/forgot-password | Solicitar reset | ❌ | - |
| POST | /auth/reset-password | Cambiar password | ❌ | - |
| POST | /auth/verify-email | Verificar email | ❌ | - |
| POST | /auth/resend-verification | Reenviar código | ❌ | - |
| GET | /auth/me | Usuario actual | ✅ | * |
| GET | /auth/sessions | Sesiones activas | ✅ | * |
| DELETE | /auth/sessions/:id | Cerrar sesión específica | ✅ | * |

### USUARIO (/api/user)

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | /user/profile | Obtener perfil | ✅ | * |
| PUT | /user/profile | Actualizar perfil | ✅ | * |
| PUT | /user/password | Cambiar contraseña | ✅ | * |
| PUT | /user/avatar | Actualizar avatar | ✅ | * |
| DELETE | /user/avatar | Eliminar avatar | ✅ | * |
| PUT | /user/fcm-token | Actualizar FCM token | ✅ | * |
| PUT | /user/preferences | Actualizar preferencias | ✅ | * |
| DELETE | /user/account | Eliminar cuenta (soft) | ✅ | * |

### PRODUCTOS (/api/products)

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | /products | Listar productos | ❌ | - |
| GET | /products/:slug | Detalle producto | ❌ | - |
| GET | /products/:id/variants | Variantes de producto | ❌ | - |
| GET | /products/:id/reviews | Reseñas de producto | ❌ | - |
| GET | /products/featured | Productos destacados | ❌ | - |
| GET | /products/new | Nuevos productos | ❌ | - |
| GET | /products/bestsellers | Más vendidos | ❌ | - |
| GET | /products/flash-sale | Ofertas flash | ❌ | - |
| GET | /products/search | Buscar productos | ❌ | - |

### CATEGORÍAS (/api/categories)

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | /categories | Listar categorías | ❌ | - |
| GET | /categories/:slug | Detalle categoría | ❌ | - |
| GET | /categories/:id/products | Productos de categoría | ❌ | - |
| GET | /categories/tree | Árbol de categorías | ❌ | - |

### CARRITO (/api/cart)

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | /cart | Obtener carrito | ✅ | * |
| POST | /cart/items | Añadir item | ✅ | * |
| PUT | /cart/items/:id | Actualizar cantidad | ✅ | * |
| DELETE | /cart/items/:id | Eliminar item | ✅ | * |
| DELETE | /cart/clear | Vaciar carrito | ✅ | * |
| POST | /cart/coupon | Aplicar cupón | ✅ | * |
| DELETE | /cart/coupon | Quitar cupón | ✅ | * |
| GET | /cart/summary | Resumen del carrito | ✅ | * |

### PEDIDOS (/api/orders)

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | /orders | Mis pedidos | ✅ | * |
| GET | /orders/:id | Detalle de pedido | ✅ | * |
| POST | /orders | Crear pedido | ✅ | * |
| POST | /orders/:id/cancel | Cancelar pedido | ✅ | * |
| POST | /orders/:id/return | Solicitar devolución | ✅ | * |
| GET | /orders/:id/invoice | Descargar factura | ✅ | * |
| GET | /orders/:id/tracking | Estado de envío | ✅ | * |

### PAGOS (/api/payments)

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| POST | /payments/intent | Crear payment intent | ✅ | * |
| POST | /payments/confirm | Confirmar pago | ✅ | * |
| GET | /payments/methods | Métodos guardados | ✅ | * |
| DELETE | /payments/methods/:id | Eliminar método | ✅ | * |

### DIRECCIONES (/api/addresses)

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | /addresses | Listar direcciones | ✅ | * |
| GET | /addresses/:id | Detalle dirección | ✅ | * |
| POST | /addresses | Crear dirección | ✅ | * |
| PUT | /addresses/:id | Actualizar dirección | ✅ | * |
| DELETE | /addresses/:id | Eliminar dirección | ✅ | * |
| PUT | /addresses/:id/default | Establecer por defecto | ✅ | * |

### SOPORTE (/api/support)

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | /support/tickets | Mis tickets | ✅ | * |
| GET | /support/tickets/:id | Detalle ticket | ✅ | * |
| POST | /support/tickets | Crear ticket | ✅ | * |
| POST | /support/tickets/:id/messages | Añadir mensaje | ✅ | * |
| POST | /support/tickets/:id/close | Cerrar ticket | ✅ | * |
| POST | /support/tickets/:id/rate | Calificar atención | ✅ | * |
| GET | /support/faq | Preguntas frecuentes | ❌ | - |

### NOTIFICACIONES (/api/notifications)

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | /notifications | Mis notificaciones | ✅ | * |
| GET | /notifications/unread-count | Contador no leídas | ✅ | * |
| PUT | /notifications/:id/read | Marcar como leída | ✅ | * |
| PUT | /notifications/read-all | Marcar todas leídas | ✅ | * |
| DELETE | /notifications/:id | Eliminar notificación | ✅ | * |

### RESEÑAS (/api/reviews)

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| POST | /reviews | Crear reseña | ✅ | * |
| PUT | /reviews/:id | Actualizar reseña | ✅ | * |
| DELETE | /reviews/:id | Eliminar reseña | ✅ | * |
| POST | /reviews/:id/helpful | Marcar útil | ✅ | * |
| POST | /reviews/:id/report | Reportar reseña | ✅ | * |

### WISHLIST (/api/wishlist)

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | /wishlist | Mi lista de deseos | ✅ | * |
| POST | /wishlist | Añadir a wishlist | ✅ | * |
| DELETE | /wishlist/:productId | Quitar de wishlist | ✅ | * |
| POST | /wishlist/:id/notify | Activar notificación | ✅ | * |
| POST | /wishlist/move-to-cart | Mover al carrito | ✅ | * |

### CUPONES (/api/coupons)

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| POST | /coupons/validate | Validar cupón | ✅ | * |

### CONFIGURACIÓN (/api/config)

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | /config | Configuración pública | ❌ | - |
| GET | /config/app-version | Versión mínima app | ❌ | - |

---

## 7.2 ENDPOINTS DE ADMINISTRADOR (/api/admin)

### DASHBOARD (/api/admin/dashboard)

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | /admin/dashboard/stats | Estadísticas generales | ✅ | admin |
| GET | /admin/dashboard/sales | Ventas del día/semana/mes | ✅ | admin |
| GET | /admin/dashboard/orders | Pedidos recientes | ✅ | admin |
| GET | /admin/dashboard/low-stock | Productos bajo stock | ✅ | admin |
| GET | /admin/dashboard/top-products | Productos más vendidos | ✅ | admin |

### GESTIÓN DE USUARIOS (/api/admin/users)

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | /admin/users | Listar usuarios | ✅ | admin |
| GET | /admin/users/:id | Detalle usuario | ✅ | admin |
| POST | /admin/users | Crear usuario | ✅ | admin |
| PUT | /admin/users/:id | Editar usuario | ✅ | admin |
| DELETE | /admin/users/:id | Eliminar usuario | ✅ | super_admin |
| PUT | /admin/users/:id/status | Activar/Desactivar | ✅ | admin |
| PUT | /admin/users/:id/role | Cambiar rol | ✅ | super_admin |
| POST | /admin/users/:id/reset-password | Reset password | ✅ | admin |
| GET | /admin/users/:id/orders | Pedidos del usuario | ✅ | admin |
| GET | /admin/users/:id/activity | Actividad del usuario | ✅ | admin |

### GESTIÓN DE PRODUCTOS (/api/admin/products)

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | /admin/products | Listar productos | ✅ | admin |
| GET | /admin/products/:id | Detalle producto | ✅ | admin |
| POST | /admin/products | Crear producto | ✅ | admin |
| PUT | /admin/products/:id | Actualizar producto | ✅ | admin |
| DELETE | /admin/products/:id | Eliminar producto | ✅ | admin |
| PUT | /admin/products/:id/status | Activar/Desactivar | ✅ | admin |
| PUT | /admin/products/:id/featured | Toggle destacado | ✅ | admin |
| POST | /admin/products/:id/variants | Añadir variante | ✅ | admin |
| PUT | /admin/products/:id/variants/:vid | Editar variante | ✅ | admin |
| DELETE | /admin/products/:id/variants/:vid | Eliminar variante | ✅ | admin |
| PUT | /admin/products/:id/stock | Actualizar stock | ✅ | admin |
| POST | /admin/products/:id/images | Subir imágenes | ✅ | admin |
| DELETE | /admin/products/:id/images/:iid | Eliminar imagen | ✅ | admin |
| PUT | /admin/products/:id/images/order | Reordenar imágenes | ✅ | admin |
| POST | /admin/products/import | Importar CSV | ✅ | admin |
| GET | /admin/products/export | Exportar CSV | ✅ | admin |

### GESTIÓN DE CATEGORÍAS (/api/admin/categories)

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | /admin/categories | Listar categorías | ✅ | admin |
| POST | /admin/categories | Crear categoría | ✅ | admin |
| PUT | /admin/categories/:id | Editar categoría | ✅ | admin |
| DELETE | /admin/categories/:id | Eliminar categoría | ✅ | admin |
| PUT | /admin/categories/:id/order | Cambiar orden | ✅ | admin |

### GESTIÓN DE PEDIDOS (/api/admin/orders)

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | /admin/orders | Listar pedidos | ✅ | admin |
| GET | /admin/orders/:id | Detalle pedido | ✅ | admin |
| PUT | /admin/orders/:id/status | Cambiar estado | ✅ | admin |
| PUT | /admin/orders/:id/payment-status | Estado pago | ✅ | admin |
| POST | /admin/orders/:id/ship | Marcar enviado | ✅ | admin |
| POST | /admin/orders/:id/deliver | Marcar entregado | ✅ | admin |
| POST | /admin/orders/:id/cancel | Cancelar pedido | ✅ | admin |
| POST | /admin/orders/:id/refund | Procesar reembolso | ✅ | admin |
| PUT | /admin/orders/:id/tracking | Actualizar tracking | ✅ | admin |
| PUT | /admin/orders/:id/notes | Añadir notas | ✅ | admin |
| GET | /admin/orders/:id/timeline | Timeline del pedido | ✅ | admin |

### GESTIÓN DE SOPORTE (/api/admin/support)

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | /admin/support/tickets | Listar tickets | ✅ | support |
| GET | /admin/support/tickets/:id | Detalle ticket | ✅ | support |
| PUT | /admin/support/tickets/:id/assign | Asignar ticket | ✅ | support |
| PUT | /admin/support/tickets/:id/status | Cambiar estado | ✅ | support |
| PUT | /admin/support/tickets/:id/priority | Cambiar prioridad | ✅ | support |
| POST | /admin/support/tickets/:id/reply | Responder ticket | ✅ | support |
| POST | /admin/support/tickets/:id/note | Nota interna | ✅ | support |
| GET | /admin/support/stats | Estadísticas soporte | ✅ | admin |

### GESTIÓN DE CUPONES (/api/admin/coupons)

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | /admin/coupons | Listar cupones | ✅ | admin |
| GET | /admin/coupons/:id | Detalle cupón | ✅ | admin |
| POST | /admin/coupons | Crear cupón | ✅ | admin |
| PUT | /admin/coupons/:id | Editar cupón | ✅ | admin |
| DELETE | /admin/coupons/:id | Eliminar cupón | ✅ | admin |
| PUT | /admin/coupons/:id/status | Activar/Desactivar | ✅ | admin |
| GET | /admin/coupons/:id/uses | Historial de usos | ✅ | admin |

### REPORTES (/api/admin/reports)

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | /admin/reports/sales | Reporte de ventas | ✅ | admin |
| GET | /admin/reports/products | Reporte de productos | ✅ | admin |
| GET | /admin/reports/customers | Reporte de clientes | ✅ | admin |
| GET | /admin/reports/inventory | Reporte de inventario | ✅ | admin |
| GET | /admin/reports/export/:type | Exportar reporte | ✅ | admin |

### CONFIGURACIÓN (/api/admin/settings)

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | /admin/settings | Obtener configuración | ✅ | admin |
| PUT | /admin/settings | Actualizar config | ✅ | super_admin |
| GET | /admin/settings/emails | Config de emails | ✅ | admin |
| PUT | /admin/settings/emails | Actualizar emails | ✅ | super_admin |
| GET | /admin/settings/payments | Config de pagos | ✅ | admin |
| PUT | /admin/settings/payments | Actualizar pagos | ✅ | super_admin |
| GET | /admin/logs | Ver logs del sistema | ✅ | super_admin |
| GET | /admin/activity | Ver actividad | ✅ | admin |

---

## 7.3 EJEMPLOS DE PETICIONES Y RESPUESTAS

### REGISTRO DE USUARIO

```http
POST /api/auth/register HTTP/1.1
Host: api.fashionstore.com
Content-Type: application/json

{
  "email": "cliente@ejemplo.com",
  "password": "MiPassword123!",
  "firstName": "Juan",
  "lastName": "García",
  "phone": "+34612345678",
  "acceptTerms": true,
  "newsletterSubscribed": true
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Usuario registrado correctamente. Por favor verifica tu email.",
  "data": {
    "user": {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "email": "cliente@ejemplo.com",
      "firstName": "Juan",
      "lastName": "García",
      "phone": "+34612345678",
      "isVerified": false,
      "role": "customer",
      "createdAt": "2026-02-03T10:30:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900,
      "expiresAt": "2026-02-03T10:45:00.000Z",
      "tokenType": "Bearer"
    }
  }
}
```

**Error - Email duplicado (409):**
```json
{
  "success": false,
  "message": "El email ya está registrado",
  "code": "EMAIL_EXISTS",
  "data": null
}
```

---

### LOGIN

```http
POST /api/auth/login HTTP/1.1
Host: api.fashionstore.com
Content-Type: application/json

{
  "email": "cliente@ejemplo.com",
  "password": "MiPassword123!",
  "deviceInfo": {
    "device": "Samsung Galaxy S21",
    "os": "Android 14",
    "appVersion": "3.0.0"
  }
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Sesión iniciada correctamente",
  "data": {
    "user": {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "email": "cliente@ejemplo.com",
      "firstName": "Juan",
      "lastName": "García",
      "phone": "+34612345678",
      "avatarUrl": "https://storage.fashionstore.com/avatars/f47ac10b.jpg",
      "isVerified": true,
      "role": "customer",
      "language": "es",
      "currency": "EUR",
      "lastLogin": "2026-02-03T10:30:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900,
      "expiresAt": "2026-02-03T10:45:00.000Z",
      "tokenType": "Bearer"
    }
  }
}
```

---

### LISTAR PRODUCTOS CON FILTROS

```http
GET /api/products?category=vestidos&minPrice=20&maxPrice=100&size=M&color=negro&sort=price_asc&page=1&limit=20 HTTP/1.1
Host: api.fashionstore.com
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "sku": "VES-NEG-001",
        "name": "Vestido Elegante Negro",
        "slug": "vestido-elegante-negro",
        "description": "Vestido elegante ideal para ocasiones especiales",
        "price": 59.99,
        "compareAtPrice": 79.99,
        "discountPercentage": 25,
        "category": {
          "id": "cat-123",
          "name": "Vestidos",
          "slug": "vestidos"
        },
        "images": [
          {
            "url": "https://cdn.fashionstore.com/products/ves-neg-001-1.jpg",
            "thumbnailUrl": "https://cdn.fashionstore.com/products/ves-neg-001-1-thumb.jpg",
            "isPrimary": true
          }
        ],
        "variants": [
          {
            "id": "var-123",
            "size": "M",
            "color": "Negro",
            "colorHex": "#000000",
            "stock": 15,
            "priceModifier": 0
          }
        ],
        "stock": 45,
        "isActive": true,
        "isFeatured": true,
        "isNew": false,
        "ratingAverage": 4.5,
        "ratingCount": 23
      }
      // ... más productos
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 87,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "filters": {
      "availableSizes": ["XS", "S", "M", "L", "XL"],
      "availableColors": [
        {"name": "Negro", "hex": "#000000", "count": 45},
        {"name": "Rojo", "hex": "#FF0000", "count": 23}
      ],
      "priceRange": {"min": 19.99, "max": 299.99}
    }
  }
}
```

---

### CREAR PEDIDO

```http
POST /api/orders HTTP/1.1
Host: api.fashionstore.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "shippingAddressId": "addr-123-456",
  "billingAddressId": null,
  "sameBillingAddress": true,
  "shippingMethod": "standard",
  "paymentIntentId": "pi_3N0ExamplePaymentIntent123",
  "couponCode": "SUMMER20",
  "customerNotes": "Por favor, dejar en la portería"
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Pedido creado correctamente",
  "data": {
    "order": {
      "id": "ord-a1b2c3d4-e5f6-7890",
      "orderNumber": "ORD-20260203-00042",
      "status": "confirmed",
      "paymentStatus": "completed",
      
      "items": [
        {
          "id": "item-123",
          "productSnapshot": {
            "name": "Vestido Elegante Negro",
            "sku": "VES-NEG-001",
            "image": "https://cdn.fashionstore.com/products/ves-neg-001-1.jpg",
            "size": "M",
            "color": "Negro"
          },
          "quantity": 2,
          "pricePerUnit": 59.99,
          "discountPerUnit": 12.00,
          "lineTotal": 95.98
        }
      ],
      
      "shippingAddress": {
        "firstName": "Juan",
        "lastName": "García",
        "streetLine1": "Calle Gran Vía 123",
        "streetLine2": "4º B",
        "city": "Madrid",
        "postalCode": "28013",
        "country": "ES",
        "phone": "+34612345678"
      },
      
      "subtotal": 119.98,
      "discountAmount": 24.00,
      "taxAmount": 20.16,
      "shippingCost": 0.00,
      "totalAmount": 116.14,
      
      "couponCode": "SUMMER20",
      "shippingMethod": "standard",
      "estimatedDelivery": "2026-02-07",
      
      "customerNotes": "Por favor, dejar en la portería",
      
      "createdAt": "2026-02-03T10:30:00.000Z"
    },
    "payment": {
      "id": "pay-123",
      "status": "succeeded",
      "cardBrand": "visa",
      "cardLastFour": "4242"
    }
  }
}
```

---

# ═══════════════════════════════════════════════════════════════
# SECCIÓN 8: SISTEMA DE CORREOS ELECTRÓNICOS
# ═══════════════════════════════════════════════════════════════

## 8.1 SERVICIO DE EMAIL COMPLETO

```javascript
// src/services/email.service.js
// ═══════════════════════════════════════════════════════════════
// SERVICIO DE ENVÍO DE EMAILS
// ═══════════════════════════════════════════════════════════════

const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const fs = require('fs').promises;
const path = require('path');
const handlebars = require('handlebars');
const config = require('../config');

// Configurar SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Configurar Nodemailer (backup/desarrollo)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

class EmailService {
  
  // ═══════════════════════════════════════════════════════════════
  // MÉTODOS PRINCIPALES
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Envía un email usando SendGrid (producción) o Nodemailer (desarrollo)
   */
  static async send(to, subject, template, data) {
    try {
      // Cargar y compilar template
      const html = await this._renderTemplate(template, data);
      
      const msg = {
        to,
        from: {
          email: process.env.EMAIL_FROM_ADDRESS,
          name: process.env.EMAIL_FROM_NAME
        },
        subject,
        html,
        text: this._htmlToText(html) // Versión texto plano
      };
      
      if (process.env.NODE_ENV === 'production') {
        await sgMail.send(msg);
      } else {
        await transporter.sendMail(msg);
      }
      
      console.log(`✉️ Email enviado a ${to}: ${subject}`);
      return true;
    } catch (error) {
      console.error('Error enviando email:', error);
      throw error;
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // EMAILS DE AUTENTICACIÓN
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Email de bienvenida tras registro
   */
  static async sendWelcome(user) {
    return this.send(
      user.email,
      '¡Bienvenido/a a FashionStore!',
      'welcome',
      {
        userName: user.first_name || 'Usuario',
        email: user.email,
        loginUrl: `${process.env.CLIENT_URL}/login`,
        shopUrl: `${process.env.CLIENT_URL}/productos`,
        supportEmail: process.env.EMAIL_SUPPORT,
        year: new Date().getFullYear()
      }
    );
  }
  
  /**
   * Email de verificación de cuenta
   */
  static async sendVerificationEmail(user, token) {
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    
    return this.send(
      user.email,
      'Verifica tu cuenta de FashionStore',
      'verify-email',
      {
        userName: user.first_name || 'Usuario',
        verifyUrl,
        expiresIn: '24 horas',
        supportEmail: process.env.EMAIL_SUPPORT,
        year: new Date().getFullYear()
      }
    );
  }
  
  /**
   * Email de recuperación de contraseña
   */
  static async sendPasswordReset(user, token) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    
    return this.send(
      user.email,
      'Restablecer tu contraseña - FashionStore',
      'password-reset',
      {
        userName: user.first_name || 'Usuario',
        resetUrl,
        expiresIn: '1 hora',
        ipAddress: user.lastRequestIp || 'Desconocida',
        supportEmail: process.env.EMAIL_SUPPORT,
        year: new Date().getFullYear()
      }
    );
  }
  
  /**
   * Email de confirmación de cambio de contraseña
   */
  static async sendPasswordChanged(user) {
    return this.send(
      user.email,
      'Tu contraseña ha sido cambiada - FashionStore',
      'password-changed',
      {
        userName: user.first_name || 'Usuario',
        changedAt: new Date().toLocaleString('es-ES'),
        supportEmail: process.env.EMAIL_SUPPORT,
        year: new Date().getFullYear()
      }
    );
  }
  
  // ═══════════════════════════════════════════════════════════════
  // EMAILS DE PEDIDOS
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Email de confirmación de pedido
   */
  static async sendOrderConfirmation(order, user) {
    return this.send(
      user.email,
      `Pedido confirmado #${order.order_number}`,
      'order-confirmation',
      {
        userName: user.first_name || 'Cliente',
        orderNumber: order.order_number,
        orderDate: new Date(order.created_at).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        items: order.items.map(item => ({
          name: item.product_snapshot.name,
          size: item.product_snapshot.size,
          color: item.product_snapshot.color,
          quantity: item.quantity,
          price: this._formatCurrency(item.price_per_unit),
          total: this._formatCurrency(item.line_total),
          image: item.product_snapshot.image
        })),
        subtotal: this._formatCurrency(order.subtotal),
        discount: order.discount_amount > 0 ? this._formatCurrency(order.discount_amount) : null,
        shipping: order.shipping_cost > 0 ? this._formatCurrency(order.shipping_cost) : 'GRATIS',
        tax: this._formatCurrency(order.tax_amount),
        total: this._formatCurrency(order.total_amount),
        shippingAddress: this._formatAddress(order.shipping_address),
        estimatedDelivery: order.estimated_delivery,
        trackingUrl: `${process.env.CLIENT_URL}/pedidos/${order.id}`,
        supportEmail: process.env.EMAIL_SUPPORT,
        year: new Date().getFullYear()
      }
    );
  }
  
  /**
   * Email de pedido enviado
   */
  static async sendOrderShipped(order, user) {
    return this.send(
      user.email,
      `Tu pedido #${order.order_number} ha sido enviado`,
      'order-shipped',
      {
        userName: user.first_name || 'Cliente',
        orderNumber: order.order_number,
        carrier: order.shipping_carrier || 'Servicio de mensajería',
        trackingNumber: order.tracking_number,
        trackingUrl: order.tracking_url || `${process.env.CLIENT_URL}/pedidos/${order.id}`,
        estimatedDelivery: order.estimated_delivery,
        shippingAddress: this._formatAddress(order.shipping_address),
        supportEmail: process.env.EMAIL_SUPPORT,
        year: new Date().getFullYear()
      }
    );
  }
  
  /**
   * Email de pedido entregado
   */
  static async sendOrderDelivered(order, user) {
    return this.send(
      user.email,
      `Tu pedido #${order.order_number} ha sido entregado`,
      'order-delivered',
      {
        userName: user.first_name || 'Cliente',
        orderNumber: order.order_number,
        deliveredAt: new Date(order.delivered_at).toLocaleDateString('es-ES'),
        reviewUrl: `${process.env.CLIENT_URL}/pedidos/${order.id}/review`,
        supportEmail: process.env.EMAIL_SUPPORT,
        year: new Date().getFullYear()
      }
    );
  }
  
  /**
   * Email de pedido cancelado
   */
  static async sendOrderCancelled(order, user) {
    return this.send(
      user.email,
      `Tu pedido #${order.order_number} ha sido cancelado`,
      'order-cancelled',
      {
        userName: user.first_name || 'Cliente',
        orderNumber: order.order_number,
        cancellationReason: order.cancellation_reason || 'Solicitud del cliente',
        refundAmount: this._formatCurrency(order.total_amount),
        refundDays: '5-10 días hábiles',
        supportEmail: process.env.EMAIL_SUPPORT,
        year: new Date().getFullYear()
      }
    );
  }
  
  // ═══════════════════════════════════════════════════════════════
  // EMAILS DE SOPORTE
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Email de ticket creado
   */
  static async sendTicketCreated(ticket, user) {
    return this.send(
      user.email,
      `Ticket de soporte creado #${ticket.ticket_number}`,
      'support-ticket-created',
      {
        userName: user.first_name || 'Cliente',
        ticketNumber: ticket.ticket_number,
        subject: ticket.subject,
        category: this._translateCategory(ticket.category),
        ticketUrl: `${process.env.CLIENT_URL}/soporte/tickets/${ticket.id}`,
        supportEmail: process.env.EMAIL_SUPPORT,
        year: new Date().getFullYear()
      }
    );
  }
  
  /**
   * Email de respuesta a ticket
   */
  static async sendTicketReply(ticket, message, user) {
    return this.send(
      user.email,
      `Nueva respuesta en tu ticket #${ticket.ticket_number}`,
      'support-ticket-reply',
      {
        userName: user.first_name || 'Cliente',
        ticketNumber: ticket.ticket_number,
        subject: ticket.subject,
        replyMessage: message.message,
        ticketUrl: `${process.env.CLIENT_URL}/soporte/tickets/${ticket.id}`,
        supportEmail: process.env.EMAIL_SUPPORT,
        year: new Date().getFullYear()
      }
    );
  }
  
  // ═══════════════════════════════════════════════════════════════
  // EMAILS ADMINISTRATIVOS
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Email de nuevo pedido (para admin)
   */
  static async sendNewOrderNotification(order) {
    return this.send(
      process.env.EMAIL_ADMIN,
      `🛒 Nuevo pedido #${order.order_number}`,
      'admin-new-order',
      {
        orderNumber: order.order_number,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        total: this._formatCurrency(order.total_amount),
        itemCount: order.items.length,
        adminUrl: `${process.env.ADMIN_URL}/orders/${order.id}`,
        year: new Date().getFullYear()
      }
    );
  }
  
  /**
   * Email de alerta de stock bajo
   */
  static async sendLowStockAlert(products) {
    return this.send(
      process.env.EMAIL_ADMIN,
      `⚠️ Alerta de stock bajo - ${products.length} productos`,
      'admin-low-stock',
      {
        products: products.map(p => ({
          name: p.name,
          sku: p.sku,
          variant: `${p.size || ''} ${p.color || ''}`.trim(),
          currentStock: p.stock,
          threshold: p.low_stock_threshold
        })),
        adminUrl: `${process.env.ADMIN_URL}/products?filter=low-stock`,
        year: new Date().getFullYear()
      }
    );
  }
  
  // ═══════════════════════════════════════════════════════════════
  // MÉTODOS AUXILIARES
  // ═══════════════════════════════════════════════════════════════
  
  static async _renderTemplate(templateName, data) {
    const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);
    const templateSource = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(templateSource);
    return template(data);
  }
  
  static _htmlToText(html) {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  static _formatCurrency(amount) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }
  
  static _formatAddress(address) {
    return [
      `${address.first_name} ${address.last_name}`,
      address.street_line_1,
      address.street_line_2,
      `${address.postal_code} ${address.city}`,
      address.country
    ].filter(Boolean).join('<br>');
  }
  
  static _translateCategory(category) {
    const categories = {
      'order': 'Pedido',
      'product': 'Producto',
      'shipping': 'Envío',
      'payment': 'Pago',
      'account': 'Cuenta',
      'other': 'Otros'
    };
    return categories[category] || category;
  }
}

module.exports = EmailService;
```

## 8.2 TEMPLATES DE EMAIL

### Template: Confirmación de Pedido

```html
<!-- src/templates/emails/order-confirmation.html -->
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pedido Confirmado</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e0e0e0;
    }
    .success-icon {
      font-size: 48px;
      text-align: center;
      margin-bottom: 20px;
    }
    h1 {
      color: #333;
      margin-bottom: 10px;
    }
    .order-number {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      font-size: 18px;
      margin: 20px 0;
    }
    .order-number strong {
      color: #667eea;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .items-table th {
      background: #f5f5f5;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    .items-table td {
      padding: 12px;
      border-bottom: 1px solid #eee;
    }
    .item-image {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 8px;
    }
    .totals {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
    }
    .total-row.final {
      border-top: 2px solid #333;
      margin-top: 10px;
      padding-top: 15px;
      font-size: 18px;
      font-weight: bold;
    }
    .address-box {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .btn {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 25px;
      font-weight: 600;
      margin: 20px 0;
    }
    .btn:hover {
      background: #5a67d8;
    }
    .footer {
      background: #f5f5f5;
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #666;
      border-radius: 0 0 10px 10px;
    }
    .footer a {
      color: #667eea;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">FashionStore</div>
    <p>Tu tienda de moda online</p>
  </div>
  
  <div class="content">
    <div class="success-icon">✅</div>
    
    <h1>¡Gracias por tu pedido, {{userName}}!</h1>
    <p>Hemos recibido tu pedido y lo estamos preparando. Te enviaremos un email cuando sea enviado.</p>
    
    <div class="order-number">
      Número de pedido: <strong>{{orderNumber}}</strong><br>
      <small>Fecha: {{orderDate}}</small>
    </div>
    
    <h2>Resumen del pedido</h2>
    
    <table class="items-table">
      <thead>
        <tr>
          <th colspan="2">Producto</th>
          <th>Cant.</th>
          <th>Precio</th>
        </tr>
      </thead>
      <tbody>
        {{#each items}}
        <tr>
          <td>
            <img src="{{image}}" alt="{{name}}" class="item-image">
          </td>
          <td>
            <strong>{{name}}</strong><br>
            <small>Talla: {{size}} | Color: {{color}}</small>
          </td>
          <td>{{quantity}}</td>
          <td>{{total}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>
    
    <div class="totals">
      <div class="total-row">
        <span>Subtotal:</span>
        <span>{{subtotal}}</span>
      </div>
      {{#if discount}}
      <div class="total-row" style="color: #22c55e;">
        <span>Descuento:</span>
        <span>-{{discount}}</span>
      </div>
      {{/if}}
      <div class="total-row">
        <span>Envío:</span>
        <span>{{shipping}}</span>
      </div>
      <div class="total-row">
        <span>IVA (21%):</span>
        <span>{{tax}}</span>
      </div>
      <div class="total-row final">
        <span>Total:</span>
        <span>{{total}}</span>
      </div>
    </div>
    
    <h3>Dirección de envío</h3>
    <div class="address-box">
      {{{shippingAddress}}}
    </div>
    
    <p><strong>Entrega estimada:</strong> {{estimatedDelivery}}</p>
    
    <center>
      <a href="{{trackingUrl}}" class="btn">Ver estado del pedido</a>
    </center>
    
    <p>Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos en <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
  </div>
  
  <div class="footer">
    <p>© {{year}} FashionStore. Todos los derechos reservados.</p>
    <p>
      <a href="https://fashionstore.com/privacy">Privacidad</a> | 
      <a href="https://fashionstore.com/terms">Términos</a> |
      <a href="https://fashionstore.com/contact">Contacto</a>
    </p>
  </div>
</body>
</html>
```

---

# ═══════════════════════════════════════════════════════════════
# SECCIÓN 9: FLUJOS DE DATOS COMPLETOS
# ═══════════════════════════════════════════════════════════════

## 9.1 FLUJO COMPLETO DE COMPRA

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLUJO COMPLETO DE COMPRA (11 PASOS)                      │
└─────────────────────────────────────────────────────────────────────────────┘

PASO 1: AÑADIR AL CARRITO
─────────────────────────
Flutter App                        API                         Base de Datos
    │                               │                               │
    │  POST /api/cart/items         │                               │
    │  {variantId, quantity}        │                               │
    │ ─────────────────────────────►│                               │
    │                               │  Verificar stock              │
    │                               │ ─────────────────────────────►│
    │                               │                               │
    │                               │  Stock disponible             │
    │                               │ ◄─────────────────────────────│
    │                               │                               │
    │                               │  INSERT cart_items            │
    │                               │ ─────────────────────────────►│
    │                               │                               │
    │  {cart actualizado}           │                               │
    │ ◄─────────────────────────────│                               │


PASO 2: VER CARRITO
───────────────────
    │  GET /api/cart                │                               │
    │ ─────────────────────────────►│                               │
    │                               │  SELECT cart + items          │
    │                               │  + product info               │
    │                               │ ─────────────────────────────►│
    │                               │                               │
    │  {items, subtotal, total}     │◄─────────────────────────────│
    │ ◄─────────────────────────────│                               │


PASO 3: APLICAR CUPÓN (OPCIONAL)
────────────────────────────────
    │  POST /api/cart/coupon        │                               │
    │  {code: "SUMMER20"}           │                               │
    │ ─────────────────────────────►│                               │
    │                               │  Validar cupón                │
    │                               │  - Existe y activo            │
    │                               │  - No expirado                │
    │                               │  - Mínimo compra              │
    │                               │  - Usos restantes             │
    │                               │ ─────────────────────────────►│
    │                               │                               │
    │  {cart con descuento}         │                               │
    │ ◄─────────────────────────────│                               │


PASO 4: SELECCIONAR DIRECCIÓN
─────────────────────────────
    │  GET /api/addresses           │                               │
    │ ─────────────────────────────►│                               │
    │                               │  SELECT addresses             │
    │                               │  WHERE user_id = ?            │
    │  {lista direcciones}          │ ─────────────────────────────►│
    │ ◄─────────────────────────────│                               │
    │                               │                               │
    │  (Usuario selecciona una)     │                               │


PASO 5: CALCULAR ENVÍO
──────────────────────
    │  POST /api/cart/shipping      │                               │
    │  {addressId}                  │                               │
    │ ─────────────────────────────►│                               │
    │                               │  Calcular según:              │
    │                               │  - Ubicación                  │
    │                               │  - Peso total                 │
    │                               │  - Umbral envío gratis        │
    │                               │                               │
    │  {shippingOptions: [...]}     │                               │
    │ ◄─────────────────────────────│                               │


PASO 6: CREAR PAYMENT INTENT (STRIPE)
─────────────────────────────────────
Flutter App                        API                          Stripe
    │                               │                               │
    │  POST /api/payments/intent    │                               │
    │  {amount, currency}           │                               │
    │ ─────────────────────────────►│                               │
    │                               │  stripe.paymentIntents        │
    │                               │  .create({...})               │
    │                               │ ─────────────────────────────►│
    │                               │                               │
    │                               │  {clientSecret, id}           │
    │                               │ ◄─────────────────────────────│
    │                               │                               │
    │  {clientSecret}               │                               │
    │ ◄─────────────────────────────│                               │


PASO 7: CONFIRMAR PAGO (FLUTTER)
────────────────────────────────
Flutter App                        Stripe SDK
    │                               │
    │  Stripe.confirmPayment(       │
    │    clientSecret,              │
    │    cardDetails                │
    │  )                            │
    │ ─────────────────────────────►│
    │                               │
    │                               │  Procesar pago con
    │                               │  banco del cliente
    │                               │
    │  {paymentIntent: succeeded}   │
    │ ◄─────────────────────────────│


PASO 8: CREAR PEDIDO
────────────────────
Flutter App                        API                         Base de Datos
    │                               │                               │
    │  POST /api/orders             │                               │
    │  {addressId, paymentId,       │                               │
    │   couponCode, notes}          │                               │
    │ ─────────────────────────────►│                               │
    │                               │                               │
    │                               │  BEGIN TRANSACTION            │
    │                               │ ─────────────────────────────►│
    │                               │                               │
    │                               │  1. Verificar pago            │
    │                               │  2. Reservar stock            │
    │                               │  3. INSERT orders             │
    │                               │  4. INSERT order_items        │
    │                               │  5. INSERT payments           │
    │                               │  6. UPDATE coupon_uses        │
    │                               │  7. DELETE cart_items         │
    │                               │                               │
    │                               │  COMMIT                       │
    │                               │ ─────────────────────────────►│
    │                               │                               │
    │  {order completo}             │                               │
    │ ◄─────────────────────────────│                               │


PASO 9: ENVIAR CONFIRMACIÓN
───────────────────────────
                   API                         Email Service
                    │                               │
                    │  EmailService.sendOrder       │
                    │  Confirmation(order, user)    │
                    │ ─────────────────────────────►│
                    │                               │
                    │                               │  SendGrid API
                    │                               │ ──────────────►
                    │                               │
                    │  Email enviado ✓              │
                    │ ◄─────────────────────────────│


PASO 10: NOTIFICAR ADMIN
────────────────────────
                   API                         Email Service
                    │                               │
                    │  EmailService.sendNewOrder    │
                    │  Notification(order)          │
                    │ ─────────────────────────────►│
                    │                               │  Email a admin@
                    │                               │ ──────────────►


PASO 11: WEBHOOK DE STRIPE (BACKUP)
───────────────────────────────────
Stripe                             API                         Base de Datos
    │                               │                               │
    │  POST /api/webhooks/stripe    │                               │
    │  Event: payment_intent.       │                               │
    │  succeeded                    │                               │
    │ ─────────────────────────────►│                               │
    │                               │  Verificar firma              │
    │                               │  webhook secret               │
    │                               │                               │
    │                               │  UPDATE orders                │
    │                               │  SET payment_status =         │
    │                               │  'completed'                  │
    │                               │ ─────────────────────────────►│
    │                               │                               │
    │  200 OK                       │                               │
    │ ◄─────────────────────────────│                               │
```

## 9.2 FLUJO DE AUTENTICACIÓN COMPLETO

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE LOGIN CON REFRESH                               │
└─────────────────────────────────────────────────────────────────────────────┘

INICIO DE APP
─────────────
Flutter App                        SecureStorage
    │                               │
    │  Splash Screen                │
    │  Verificar tokens guardados   │
    │ ─────────────────────────────►│
    │                               │
    │  {accessToken, refreshToken}  │
    │  o null                       │
    │ ◄─────────────────────────────│
    │                               │
    ▼                               │
┌─────────────────┐                 │
│ ¿Hay tokens?    │                 │
└────────┬────────┘                 │
         │                          │
    ┌────┴────┐                     │
    │ NO      │ SÍ                  │
    ▼         ▼                     │
Login     Verificar                 │
Screen    Expiración                │


VERIFICAR EXPIRACIÓN
────────────────────
Flutter App                        API
    │                               │
    │  ¿Token expirado?             │
    │  (exp < now - 1min)           │
    │                               │
    │  SÍ: POST /api/auth/refresh   │
    │  {refreshToken}               │
    │ ─────────────────────────────►│
    │                               │
    │  {newAccessToken,             │
    │   newRefreshToken}            │
    │ ◄─────────────────────────────│
    │                               │
    │  Guardar nuevos tokens        │
    │                               │
    │  NO: Usar token existente     │
    │                               │
    ▼                               │
Home Screen                         │


PETICIÓN CON TOKEN EXPIRADO (AUTO-REFRESH)
──────────────────────────────────────────
Flutter App                        API
    │                               │
    │  GET /api/user/profile        │
    │  Authorization: Bearer expired│
    │ ─────────────────────────────►│
    │                               │
    │  401 {code: "TOKEN_EXPIRED"}  │
    │ ◄─────────────────────────────│
    │                               │
    │  [Interceptor detecta 401]    │
    │                               │
    │  POST /api/auth/refresh       │
    │ ─────────────────────────────►│
    │                               │
    │  {newTokens}                  │
    │ ◄─────────────────────────────│
    │                               │
    │  [Reintentar petición]        │
    │  GET /api/user/profile        │
    │  Authorization: Bearer new    │
    │ ─────────────────────────────►│
    │                               │
    │  200 {user data}              │
    │ ◄─────────────────────────────│
```

---

# ═══════════════════════════════════════════════════════════════
# SECCIÓN 10: APP CLIENTE - PANTALLA POR PANTALLA
# ═══════════════════════════════════════════════════════════════

## 10.1 MAPA DE NAVEGACIÓN

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MAPA DE PANTALLAS                                    │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌────────────┐
                              │   SPLASH   │
                              │  (2 seg)   │
                              └─────┬──────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
              ¿Autenticado?                   ¿Autenticado?
                  NO                              SÍ
                    │                               │
                    ▼                               ▼
              ┌──────────┐                    ┌──────────┐
              │  LOGIN   │                    │   HOME   │
              └────┬─────┘                    └────┬─────┘
                   │                               │
      ┌────────────┼────────────┐                  │
      │            │            │                  │
      ▼            ▼            ▼                  │
┌──────────┐ ┌──────────┐ ┌──────────┐            │
│ REGISTER │ │ FORGOT   │ │ VERIFY   │            │
│          │ │ PASSWORD │ │ EMAIL    │            │
└──────────┘ └──────────┘ └──────────┘            │
                                                   │
                    ┌──────────────────────────────┘
                    │
                    ▼
    ┌─────────────────────────────────────────────────────────┐
    │                    BOTTOM NAVIGATION                     │
    │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐│
    │  │  HOME  │ │CATALOG │ │  CART  │ │ ORDERS │ │PROFILE ││
    │  │   🏠   │ │   🛍️   │ │   🛒   │ │   📦   │ │   👤   ││
    │  └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘│
    └──────┼──────────┼──────────┼──────────┼──────────┼──────┘
           │          │          │          │          │
           ▼          │          │          │          │
    ┌──────────┐      │          │          │          │
    │Categories│      │          │          │          │
    │Banners   │      │          │          │          │
    │Featured  │      │          │          │          │
    │NewArrivals      │          │          │          │
    └──────────┘      │          │          │          │
                      ▼          │          │          │
               ┌──────────┐      │          │          │
               │ Products │      │          │          │
               │ + Filter │      │          │          │
               │ + Search │      │          │          │
               └────┬─────┘      │          │          │
                    │            │          │          │
                    ▼            │          │          │
               ┌──────────┐      │          │          │
               │ Product  │      │          │          │
               │ Detail   │──────┤          │          │
               └──────────┘      │          │          │
                                 ▼          │          │
                          ┌──────────┐      │          │
                          │  Cart    │      │          │
                          │ Summary  │      │          │
                          └────┬─────┘      │          │
                               │            │          │
                               ▼            │          │
                          ┌──────────┐      │          │
                          │ Checkout │      │          │
                          │ Address  │      │          │
                          │ Payment  │      │          │
                          └────┬─────┘      │          │
                               │            │          │
                               ▼            ▼          │
                          ┌──────────┐ ┌──────────┐    │
                          │ Order    │ │ Orders   │    │
                          │ Success  │ │ History  │    │
                          └──────────┘ └────┬─────┘    │
                                            │          │
                                            ▼          │
                                       ┌──────────┐    │
                                       │ Order    │    │
                                       │ Detail   │    │
                                       └──────────┘    │
                                                       │
                                                       ▼
    ┌─────────────────────────────────────────────────────────┐
    │                      PROFILE SECTION                     │
    │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
    │  │Edit      │ │Addresses │ │Wishlist  │ │Support   │   │
    │  │Profile   │ │          │ │          │ │          │   │
    │  └──────────┘ └──────────┘ └──────────┘ └────┬─────┘   │
    │  ┌──────────┐ ┌──────────┐ ┌──────────┐      │         │
    │  │Notifica- │ │Settings  │ │Change    │      ▼         │
    │  │tions     │ │          │ │Password  │ ┌──────────┐   │
    │  └──────────┘ └──────────┘ └──────────┘ │Tickets   │   │
    │                                          │Detail    │   │
    │                                          └──────────┘   │
    └─────────────────────────────────────────────────────────┘
```

## 10.2 DESCRIPCIÓN DETALLADA DE CADA PANTALLA

### 🚀 SPLASH SCREEN
```
┌─────────────────────────────────────────┐
│              SPLASH SCREEN               │
├─────────────────────────────────────────┤
│                                         │
│           [Logo FashionStore]           │
│                                         │
│              ⟳ Loading...               │
│                                         │
├─────────────────────────────────────────┤
│ ACCIONES AUTOMÁTICAS:                   │
│ 1. Mostrar logo animado (Lottie)        │
│ 2. Verificar conexión a internet        │
│ 3. Cargar tokens de SecureStorage       │
│ 4. Verificar versión mínima de app      │
│ 5. Decidir navegación (Login/Home)      │
├─────────────────────────────────────────┤
│ ENDPOINTS LLAMADOS:                     │
│ • GET /api/config/app-version           │
│ • GET /api/auth/me (si hay token)       │
├─────────────────────────────────────────┤
│ DURACIÓN: 2-3 segundos                  │
└─────────────────────────────────────────┘
```

---

### 🔐 LOGIN SCREEN
```
┌─────────────────────────────────────────┐
│              LOGIN SCREEN                │
├─────────────────────────────────────────┤
│                                         │
│           [Logo]                        │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 📧 Email                        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🔒 Contraseña         [👁️]     │   │
│  └─────────────────────────────────┘   │
│                                         │
│         [¿Olvidaste contraseña?]        │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │       INICIAR SESIÓN            │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ─────────── o continuar con ───────── │
│                                         │
│     [Google]    [Apple]    [Facebook]   │
│                                         │
│     ¿No tienes cuenta? [Regístrate]     │
│                                         │
├─────────────────────────────────────────┤
│ CAMPOS:                                 │
│ • Email (validación formato)            │
│ • Password (mín 8 caracteres)           │
├─────────────────────────────────────────┤
│ BOTONES Y ACCIONES:                     │
│                                         │
│ [Iniciar Sesión]                        │
│   → POST /api/auth/login                │
│   → Guardar tokens en SecureStorage     │
│   → Navegar a HomeScreen                │
│                                         │
│ [¿Olvidaste contraseña?]                │
│   → Navegar a ForgotPasswordScreen      │
│                                         │
│ [Regístrate]                            │
│   → Navegar a RegisterScreen            │
│                                         │
│ [Google/Apple/Facebook]                 │
│   → OAuth flow con Firebase Auth        │
│   → POST /api/auth/social               │
├─────────────────────────────────────────┤
│ ERRORES MANEJADOS:                      │
│ • "Email o contraseña incorrectos"      │
│ • "Cuenta no verificada"                │
│ • "Cuenta bloqueada temporalmente"      │
│ • "Sin conexión a internet"             │
└─────────────────────────────────────────┘
```

---

### 📝 REGISTER SCREEN
```
┌─────────────────────────────────────────┐
│             REGISTER SCREEN              │
├─────────────────────────────────────────┤
│  [← Volver]           Crear Cuenta      │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 👤 Nombre                       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 👤 Apellidos                    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 📧 Email                        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 📱 Teléfono (opcional)          │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🔒 Contraseña         [👁️]     │   │
│  └─────────────────────────────────┘   │
│  Requisitos: 8+ chars, mayús, número    │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🔒 Confirmar contraseña         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [✓] Acepto términos y condiciones      │
│  [✓] Suscribirme al newsletter          │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         CREAR CUENTA            │   │
│  └─────────────────────────────────┘   │
│                                         │
│        ¿Ya tienes cuenta? [Inicia]      │
│                                         │
├─────────────────────────────────────────┤
│ ENDPOINT:                               │
│ POST /api/auth/register                 │
│ Body: {email, password, firstName,      │
│        lastName, phone, acceptTerms,    │
│        newsletterSubscribed}            │
├─────────────────────────────────────────┤
│ FLUJO POST-REGISTRO:                    │
│ 1. Crear cuenta                         │
│ 2. Guardar tokens                       │
│ 3. Navegar a VerifyEmailScreen          │
│ 4. Email de verificación enviado        │
└─────────────────────────────────────────┘
```

---

### 🏠 HOME SCREEN
```
┌─────────────────────────────────────────┐
│               HOME SCREEN                │
├─────────────────────────────────────────┤
│  [≡]    FashionStore    [🔔] [🛒 (3)]  │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  🔍 Buscar productos...         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │     [BANNER CAROUSEL]           │   │
│  │  ◀  Oferta de Temporada  ▶     │   │
│  │     -30% en toda la tienda      │   │
│  │         [VER OFERTAS]           │   │
│  │         ○ ● ○ ○                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  CATEGORÍAS                     [Ver +] │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│  │👗   │ │👕   │ │👖   │ │👟   │      │
│  │Vest.│ │Cami.│ │Pant.│ │Zapat│      │
│  └─────┘ └─────┘ └─────┘ └─────┘      │
│                                         │
│  DESTACADOS                     [Ver +] │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │[Imagen] │ │[Imagen] │ │[Imagen] │  │
│  │Vestido  │ │Camisa   │ │Bolso    │  │
│  │€59.99   │ │€29.99   │ │€45.00   │  │
│  │⭐ 4.5   │ │⭐ 4.8   │ │⭐ 4.2   │  │
│  └─────────┘ └─────────┘ └─────────┘  │
│                                         │
│  NUEVOS PRODUCTOS              [Ver +]  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │[Imagen] │ │[Imagen] │ │[Imagen] │  │
│  │Abrigo   │ │Falda    │ │Bufanda  │  │
│  │€89.99   │ │€35.00   │ │€19.99   │  │
│  │🆕 NUEVO │ │🆕 NUEVO │ │🆕 NUEVO │  │
│  └─────────┘ └─────────┘ └─────────┘  │
│                                         │
├─────────────────────────────────────────┤
│ ENDPOINTS CARGADOS:                     │
│ • GET /api/config (banners, config)     │
│ • GET /api/categories (top 8)           │
│ • GET /api/products/featured?limit=6    │
│ • GET /api/products/new?limit=6         │
│ • GET /api/notifications/unread-count   │
│ • GET /api/cart (badge count)           │
├─────────────────────────────────────────┤
│ ACCIONES:                               │
│ • Tap banner → Navegar a promoción      │
│ • Tap categoría → ProductsScreen        │
│ • Tap producto → ProductDetailScreen    │
│ • Tap búsqueda → SearchScreen           │
│ • Tap carrito → CartScreen              │
│ • Tap notificaciones → Notifications    │
└─────────────────────────────────────────┘
```

---

### 🛍️ PRODUCTS SCREEN (Catálogo)
```
┌─────────────────────────────────────────┐
│             PRODUCTS SCREEN              │
├─────────────────────────────────────────┤
│  [←]    Vestidos (87)        [🔍] [⚙️] │
├─────────────────────────────────────────┤
│                                         │
│  Filtros activos:                       │
│  [Talla: M ✕] [Color: Negro ✕] [Limpiar]│
│                                         │
│  Ordenar: [Más recientes ▼]             │
│                                         │
│  ┌─────────────┐  ┌─────────────┐      │
│  │  [Imagen]   │  │  [Imagen]   │      │
│  │  [♡]        │  │  [♥]        │      │
│  │             │  │             │      │
│  │ Vestido A   │  │ Vestido B   │      │
│  │ €59.99      │  │ €79.99      │      │
│  │ ⭐ 4.5 (23) │  │ ⭐ 4.8 (45) │      │
│  └─────────────┘  └─────────────┘      │
│                                         │
│  ┌─────────────┐  ┌─────────────┐      │
│  │  [Imagen]   │  │  [Imagen]   │      │
│  │  [♡]        │  │  [♡]        │      │
│  │  -20%       │  │  NUEVO      │      │
│  │ Vestido C   │  │ Vestido D   │      │
│  │ €47.99      │  │ €65.00      │      │
│  │ €59.99      │  │             │      │
│  └─────────────┘  └─────────────┘      │
│                                         │
│           [Cargar más...]               │
│                                         │
├─────────────────────────────────────────┤
│ ENDPOINT:                               │
│ GET /api/products?category=vestidos&    │
│     size=M&color=negro&sort=newest&     │
│     page=1&limit=20                     │
├─────────────────────────────────────────┤
│ MODAL DE FILTROS (tap ⚙️):              │
│ ┌─────────────────────────────────┐    │
│ │ FILTROS                    [✕]  │    │
│ │                                 │    │
│ │ Precio                          │    │
│ │ [====●========] €20 - €100      │    │
│ │                                 │    │
│ │ Talla                           │    │
│ │ [XS] [S] [●M] [L] [XL]         │    │
│ │                                 │    │
│ │ Color                           │    │
│ │ ⚫ ⚪ 🔴 🔵 🟢 🟡              │    │
│ │                                 │    │
│ │ Disponibilidad                  │    │
│ │ [✓] Solo con stock              │    │
│ │                                 │    │
│ │ [APLICAR FILTROS]               │    │
│ └─────────────────────────────────┘    │
├─────────────────────────────────────────┤
│ ACCIONES:                               │
│ • Tap producto → ProductDetailScreen    │
│ • Tap ♡ → POST /api/wishlist            │
│ • Tap filtro → Abrir modal              │
│ • Scroll → Paginación infinita          │
└─────────────────────────────────────────┘
```

---

### 📱 PRODUCT DETAIL SCREEN
```
┌─────────────────────────────────────────┐
│           PRODUCT DETAIL SCREEN          │
├─────────────────────────────────────────┤
│  [←]                    [♡] [📤]        │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │         [IMAGEN GRANDE]        │   │
│  │                                 │   │
│  │   ◀                      ▶    │   │
│  │                                 │   │
│  │         1/5                     │   │
│  └─────────────────────────────────┘   │
│  [img1] [img2] [img3] [img4] [img5]    │
│                                         │
│  Vestido Elegante Negro                 │
│  ⭐ 4.5 (23 reseñas)                    │
│                                         │
│  €59.99  €79.99  -25%                   │
│                                         │
│  Color: Negro                           │
│  ⚫ ⚪ 🔴 🔵                            │
│                                         │
│  Talla: Selecciona                      │
│  [XS] [S] [M ✓] [L] [XL]               │
│  📏 Guía de tallas                      │
│                                         │
│  Stock: 15 unidades disponibles ✓       │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  DESCRIPCIÓN                            │
│  Vestido elegante ideal para ocasiones  │
│  especiales. Confeccionado en tela de   │
│  alta calidad con acabados premium...   │
│  [Ver más]                              │
│                                         │
│  DETALLES                               │
│  • Material: Poliéster 95%, Elastano 5% │
│  • Cuidados: Lavar a máquina 30°        │
│  • SKU: VES-NEG-001                     │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  RESEÑAS (23)                   [Ver +] │
│  ┌─────────────────────────────────┐   │
│  │ ⭐⭐⭐⭐⭐  María G.            │   │
│  │ "Excelente calidad, tal como    │   │
│  │ en las fotos. Muy cómodo."      │   │
│  │ 15 ene 2026 | ✓ Compra verif.   │   │
│  └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │  [-]    1    [+]     AÑADIR 🛒 │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│ ENDPOINTS:                              │
│ • GET /api/products/:slug               │
│ • GET /api/products/:id/variants        │
│ • GET /api/products/:id/reviews?limit=3 │
├─────────────────────────────────────────┤
│ ACCIONES:                               │
│                                         │
│ [AÑADIR 🛒]                             │
│   Validar: talla seleccionada           │
│   → POST /api/cart/items                │
│   → Mostrar toast "Añadido al carrito"  │
│   → Animar badge del carrito            │
│                                         │
│ [♡ Wishlist]                            │
│   → POST /api/wishlist                  │
│   → Toggle icono ♡/♥                    │
│                                         │
│ [📤 Compartir]                          │
│   → Share.share(productUrl)             │
│                                         │
│ [Guía de tallas]                        │
│   → Mostrar modal con tabla de medidas  │
│                                         │
│ [Ver reseñas]                           │
│   → Navegar a ReviewsScreen             │
└─────────────────────────────────────────┘
```

---

### 🛒 CART SCREEN
```
┌─────────────────────────────────────────┐
│               CART SCREEN                │
├─────────────────────────────────────────┤
│  [←]        Mi Carrito (3)              │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ [img] Vestido Elegante          │   │
│  │       Talla: M | Color: Negro   │   │
│  │       €59.99                    │   │
│  │       [-]  2  [+]     [🗑️]     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ [img] Camisa Casual             │   │
│  │       Talla: L | Color: Blanco  │   │
│  │       €29.99                    │   │
│  │       [-]  1  [+]     [🗑️]     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ [img] Bolso de Cuero            │   │
│  │       Color: Marrón             │   │
│  │       €45.00                    │   │
│  │       [-]  1  [+]     [🗑️]     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🏷️ Código de descuento          │   │
│  │ [SUMMER20        ] [APLICAR]    │   │
│  └─────────────────────────────────┘   │
│  ✓ Cupón aplicado: -20% (€38.99)       │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Subtotal:              €194.97         │
│  Descuento:             -€38.99         │
│  Envío:          GRATIS (>€50)          │
│  ─────────────────────────────────────  │
│  Total:                 €155.98         │
│  (IVA incluido)                         │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      CONTINUAR COMPRA →         │   │
│  └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│ ENDPOINTS:                              │
│ • GET /api/cart                         │
│ • PUT /api/cart/items/:id (cantidad)    │
│ • DELETE /api/cart/items/:id            │
│ • POST /api/cart/coupon                 │
│ • DELETE /api/cart/coupon               │
├─────────────────────────────────────────┤
│ ACCIONES:                               │
│ [+/-] → PUT /api/cart/items/:id         │
│ [🗑️]  → DELETE /api/cart/items/:id      │
│ [APLICAR] → POST /api/cart/coupon       │
│ [CONTINUAR] → CheckoutScreen            │
├─────────────────────────────────────────┤
│ VALIDACIONES:                           │
│ • Verificar stock al cambiar cantidad   │
│ • Mostrar error si producto sin stock   │
│ • Recalcular totales en cada cambio     │
└─────────────────────────────────────────┘
```

---

### 💳 CHECKOUT SCREEN
```
┌─────────────────────────────────────────┐
│             CHECKOUT SCREEN              │
├─────────────────────────────────────────┤
│  [←]         Finalizar Compra           │
├─────────────────────────────────────────┤
│                                         │
│  PASO 1 DE 3: DIRECCIÓN                 │
│  ════════════════════════               │
│                                         │
│  Dirección de envío                     │
│  ┌─────────────────────────────────┐   │
│  │ ● Casa                          │   │
│  │   Juan García                   │   │
│  │   Calle Gran Vía 123, 4º B     │   │
│  │   28013 Madrid, España          │   │
│  │   +34 612 345 678               │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ ○ Trabajo                       │   │
│  │   Av. Diagonal 456...           │   │
│  └─────────────────────────────────┘   │
│  [+ Añadir nueva dirección]             │
│                                         │
│  [✓] Usar misma dirección para factura  │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  PASO 2 DE 3: ENVÍO                     │
│  ════════════════════                   │
│                                         │
│  Método de envío                        │
│  ┌─────────────────────────────────┐   │
│  │ ● Estándar (3-5 días)   GRATIS  │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ ○ Express (1-2 días)    €6.99   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Entrega estimada: 7 Feb 2026           │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  PASO 3 DE 3: PAGO                      │
│  ═════════════════                      │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │     STRIPE PAYMENT SHEET        │   │
│  │                                 │   │
│  │  Número de tarjeta              │   │
│  │  [4242 4242 4242 4242]          │   │
│  │                                 │   │
│  │  [MM/AA]        [CVC]           │   │
│  │                                 │   │
│  │  [✓] Guardar tarjeta            │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Notas para el pedido (opcional)        │
│  ┌─────────────────────────────────┐   │
│  │ Dejar en portería si no estoy   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ─────────────────────────────────────  │
│  Subtotal:              €155.98         │
│  Envío:                 GRATIS          │
│  IVA (21%):             €27.05          │
│  ─────────────────────────────────────  │
│  TOTAL:                 €155.98         │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      💳 PAGAR €155.98           │   │
│  └─────────────────────────────────┘   │
│                                         │
│  🔒 Pago seguro con Stripe              │
│                                         │
├─────────────────────────────────────────┤
│ FLUJO DE PAGO:                          │
│ 1. POST /api/payments/intent            │
│ 2. Stripe.confirmPayment(clientSecret)  │
│ 3. POST /api/orders                     │
│ 4. Navegar a OrderSuccessScreen         │
├─────────────────────────────────────────┤
│ ERRORES MANEJADOS:                      │
│ • Pago rechazado                        │
│ • Stock agotado durante checkout        │
│ • Cupón expirado                        │
│ • Error de conexión                     │
└─────────────────────────────────────────┘
```

---

### ✅ ORDER SUCCESS SCREEN
```
┌─────────────────────────────────────────┐
│           ORDER SUCCESS SCREEN           │
├─────────────────────────────────────────┤
│                                         │
│                                         │
│              ✅                         │
│                                         │
│         ¡Pedido Confirmado!             │
│                                         │
│        Pedido #ORD-20260203-00042       │
│                                         │
│  Gracias por tu compra, Juan.           │
│  Recibirás un email de confirmación     │
│  en cliente@ejemplo.com                 │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Resumen:                               │
│  • 3 productos                          │
│  • Total: €155.98                       │
│  • Entrega estimada: 7 Feb 2026         │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │       VER DETALLE PEDIDO        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │       SEGUIR COMPRANDO          │   │
│  └─────────────────────────────────┘   │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│ ACCIONES:                               │
│ [Ver detalle] → OrderDetailScreen       │
│ [Seguir comprando] → HomeScreen         │
├─────────────────────────────────────────┤
│ ANIMACIÓN:                              │
│ Confetti animation (Lottie)             │
└─────────────────────────────────────────┘
```

---

### 📦 ORDERS SCREEN (Historial)
```
┌─────────────────────────────────────────┐
│              ORDERS SCREEN               │
├─────────────────────────────────────────┤
│  [←]          Mis Pedidos               │
├─────────────────────────────────────────┤
│                                         │
│  [Todos ▼] [En curso ▼] [Completados]   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Pedido #ORD-20260203-00042      │   │
│  │ 3 feb 2026 | 3 productos        │   │
│  │                                 │   │
│  │ [img][img][img]    €155.98      │   │
│  │                                 │   │
│  │ Estado: 🚚 EN CAMINO            │   │
│  │ Entrega: 7 feb 2026             │   │
│  │                                 │   │
│  │        [VER DETALLE →]          │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Pedido #ORD-20260128-00038      │   │
│  │ 28 ene 2026 | 2 productos       │   │
│  │                                 │   │
│  │ [img][img]         €89.99       │   │
│  │                                 │   │
│  │ Estado: ✅ ENTREGADO            │   │
│  │ Entregado: 2 feb 2026           │   │
│  │                                 │   │
│  │ [DEJAR RESEÑA] [VOLVER A PEDIR] │   │
│  └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│ ENDPOINT:                               │
│ GET /api/orders?status=all&page=1       │
├─────────────────────────────────────────┤
│ ESTADOS POSIBLES:                       │
│ 🕐 PENDIENTE (pending)                  │
│ ✅ CONFIRMADO (confirmed)               │
│ 📦 PREPARANDO (processing)              │
│ 🚚 EN CAMINO (shipped)                  │
│ ✅ ENTREGADO (delivered)                │
│ ❌ CANCELADO (cancelled)                │
└─────────────────────────────────────────┘
```

---

### 📋 ORDER DETAIL SCREEN
```
┌─────────────────────────────────────────┐
│           ORDER DETAIL SCREEN            │
├─────────────────────────────────────────┤
│  [←]    Pedido #ORD-20260203-00042      │
├─────────────────────────────────────────┤
│                                         │
│  Estado actual                          │
│  ┌─────────────────────────────────┐   │
│  │    🚚 EN CAMINO                 │   │
│  │    Tu pedido está de camino     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Timeline                               │
│  ● Pedido realizado      3 feb 10:30   │
│  │                                      │
│  ● Pago confirmado       3 feb 10:31   │
│  │                                      │
│  ● Preparando pedido     3 feb 14:00   │
│  │                                      │
│  ● Enviado               4 feb 09:15   │
│  │  Tracking: SEUR123456789            │
│  │  [VER SEGUIMIENTO →]                │
│  │                                      │
│  ○ Entrega estimada      7 feb         │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Productos                              │
│  ┌─────────────────────────────────┐   │
│  │ [img] Vestido Elegante Negro    │   │
│  │       Talla M | Cantidad: 2     │   │
│  │       €119.98                   │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ [img] Camisa Casual Blanca      │   │
│  │       Talla L | Cantidad: 1     │   │
│  │       €29.99                    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Dirección de envío                     │
│  Juan García                            │
│  Calle Gran Vía 123, 4º B              │
│  28013 Madrid, España                   │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Resumen de pago                        │
│  Subtotal:         €149.97              │
│  Descuento:        -€30.00              │
│  Envío:            GRATIS               │
│  IVA:              €25.19               │
│  ─────────────────────────────────────  │
│  Total:            €155.98              │
│  Pagado con: VISA ****4242              │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  [📄 DESCARGAR FACTURA]                 │
│                                         │
│  ¿Necesitas ayuda?                      │
│  [📞 CONTACTAR SOPORTE]                 │
│                                         │
├─────────────────────────────────────────┤
│ ENDPOINT:                               │
│ GET /api/orders/:id                     │
├─────────────────────────────────────────┤
│ ACCIONES:                               │
│ [Ver seguimiento] → Abrir tracking_url  │
│ [Descargar factura] → GET invoice PDF   │
│ [Contactar soporte] → CreateTicket      │
└─────────────────────────────────────────┘
```

---

### 👤 PROFILE SCREEN
```
┌─────────────────────────────────────────┐
│              PROFILE SCREEN              │
├─────────────────────────────────────────┤
│                                         │
│           [Avatar circular]             │
│            Juan García                  │
│         cliente@ejemplo.com             │
│         [Editar perfil →]               │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  MI CUENTA                              │
│  ┌─────────────────────────────────┐   │
│  │ 📦 Mis Pedidos              →  │   │
│  ├─────────────────────────────────┤   │
│  │ 📍 Mis Direcciones          →  │   │
│  ├─────────────────────────────────┤   │
│  │ ❤️ Lista de Deseos          →  │   │
│  ├─────────────────────────────────┤   │
│  │ 🔔 Notificaciones           →  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  SOPORTE                                │
│  ┌─────────────────────────────────┐   │
│  │ 💬 Centro de Ayuda          →  │   │
│  ├─────────────────────────────────┤   │
│  │ 📝 Mis Tickets              →  │   │
│  ├─────────────────────────────────┤   │
│  │ ❓ Preguntas Frecuentes     →  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  CONFIGURACIÓN                          │
│  ┌─────────────────────────────────┐   │
│  │ ⚙️ Ajustes                  →  │   │
│  ├─────────────────────────────────┤   │
│  │ 🔐 Cambiar Contraseña       →  │   │
│  ├─────────────────────────────────┤   │
│  │ 📄 Términos y Condiciones   →  │   │
│  ├─────────────────────────────────┤   │
│  │ 🔒 Política de Privacidad   →  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │       🚪 CERRAR SESIÓN          │   │
│  └─────────────────────────────────┘   │
│                                         │
│           Versión 3.0.0                 │
│                                         │
├─────────────────────────────────────────┤
│ NAVEGACIONES:                           │
│ • Editar perfil → EditProfileScreen     │
│ • Mis Pedidos → OrdersScreen            │
│ • Direcciones → AddressesScreen         │
│ • Lista Deseos → WishlistScreen         │
│ • Notificaciones → NotificationsScreen  │
│ • Mis Tickets → SupportScreen           │
│ • Ajustes → SettingsScreen              │
│ • Cambiar Contraseña → ChangePassword   │
│ • Cerrar Sesión → POST /api/auth/logout │
└─────────────────────────────────────────┘
```

---

### 💬 SUPPORT / TICKETS SCREEN
```
┌─────────────────────────────────────────┐
│             SUPPORT SCREEN               │
├─────────────────────────────────────────┤
│  [←]          Mis Tickets               │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         [+ NUEVO TICKET]        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Tickets abiertos                       │
│  ┌─────────────────────────────────┐   │
│  │ #TKT-20260202-00015             │   │
│  │ Problema con envío              │   │
│  │ Estado: 🟡 En progreso          │   │
│  │ Última actualización: hace 2h   │   │
│  │                            →    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Tickets cerrados                       │
│  ┌─────────────────────────────────┐   │
│  │ #TKT-20260115-00008             │   │
│  │ Solicitud de reembolso          │   │
│  │ Estado: ✅ Resuelto             │   │
│  │ Cerrado: 20 ene 2026            │   │
│  │                            →    │   │
│  └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│ ENDPOINT:                               │
│ GET /api/support/tickets                │
├─────────────────────────────────────────┤
│ [+ NUEVO TICKET]:                       │
│ → CreateTicketScreen                    │
│   POST /api/support/tickets             │
└─────────────────────────────────────────┘


CREATE TICKET SCREEN:
┌─────────────────────────────────────────┐
│          CREAR NUEVO TICKET              │
├─────────────────────────────────────────┤
│  [←]                                    │
├─────────────────────────────────────────┤
│                                         │
│  Categoría                              │
│  [Selecciona una categoría ▼]           │
│  • Pedido                               │
│  • Producto                             │
│  • Envío                                │
│  • Pago/Facturación                     │
│  • Mi cuenta                            │
│  • Otro                                 │
│                                         │
│  Pedido relacionado (opcional)          │
│  [Selecciona un pedido ▼]               │
│                                         │
│  Asunto                                 │
│  ┌─────────────────────────────────┐   │
│  │ Mi pedido no ha llegado         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Descripción                            │
│  ┌─────────────────────────────────┐   │
│  │ Realicé un pedido hace 10 días  │   │
│  │ y todavía no me ha llegado.     │   │
│  │ El tracking dice que fue        │   │
│  │ entregado pero no lo recibí...  │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Adjuntar archivos (opcional)           │
│  [📎 Añadir archivos]                   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         ENVIAR TICKET           │   │
│  └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│ ENDPOINT:                               │
│ POST /api/support/tickets               │
│ Body: {category, orderId, subject,      │
│        description, attachments}        │
└─────────────────────────────────────────┘
```

---

# ═══════════════════════════════════════════════════════════════
# SECCIÓN 11: PANEL ADMINISTRADOR COMPLETO
# ═══════════════════════════════════════════════════════════════

## 11.1 ESTRUCTURA DEL PANEL ADMIN

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PANEL DE ADMINISTRACIÓN                              │
│                         https://admin.fashionstore.com                       │
└─────────────────────────────────────────────────────────────────────────────┘

TECNOLOGÍAS:
• Framework: React 18 + TypeScript
• UI Library: Tailwind CSS + Shadcn/ui
• State: Zustand / React Query
• Router: React Router v6
• Charts: Recharts
• Tables: TanStack Table
• Forms: React Hook Form + Zod
```

## 11.2 MAPA DE PANTALLAS ADMIN

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NAVEGACIÓN ADMIN                                   │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌────────────┐
                              │   LOGIN    │
                              │   ADMIN    │
                              └─────┬──────┘
                                    │
                                    ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │                         SIDEBAR NAVIGATION                           │
    │                                                                      │
    │  ┌──────────────────┐                                               │
    │  │ 📊 Dashboard     │ ────► Estadísticas, KPIs, Gráficos            │
    │  ├──────────────────┤                                               │
    │  │ 📦 Pedidos       │ ────► Lista, Detalle, Estados                 │
    │  ├──────────────────┤                                               │
    │  │ 🛍️ Productos     │ ────► Catálogo, Crear, Editar, Stock         │
    │  ├──────────────────┤                                               │
    │  │ 📁 Categorías    │ ────► Árbol, Crear, Editar                    │
    │  ├──────────────────┤                                               │
    │  │ 👥 Clientes      │ ────► Lista, Detalle, Historial               │
    │  ├──────────────────┤                                               │
    │  │ 💬 Soporte       │ ────► Tickets, Respuestas                     │
    │  ├──────────────────┤                                               │
    │  │ 🏷️ Cupones       │ ────► Crear, Gestionar                        │
    │  ├──────────────────┤                                               │
    │  │ 📈 Reportes      │ ────► Ventas, Productos, Clientes             │
    │  ├──────────────────┤                                               │
    │  │ ⚙️ Configuración │ ────► General, Emails, Pagos                  │
    │  └──────────────────┘                                               │
    │                                                                      │
    └─────────────────────────────────────────────────────────────────────┘
```

## 11.3 PANTALLAS DEL PANEL ADMIN

### 🔐 LOGIN ADMIN
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              LOGIN ADMIN                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                         [Logo FashionStore]                                 │
│                          Panel de Administración                            │
│                                                                              │
│                    ┌────────────────────────────┐                           │
│                    │ 📧 Email                   │                           │
│                    │ admin@fashionstore.com     │                           │
│                    └────────────────────────────┘                           │
│                                                                              │
│                    ┌────────────────────────────┐                           │
│                    │ 🔒 Contraseña              │                           │
│                    │ ••••••••••                 │                           │
│                    └────────────────────────────┘                           │
│                                                                              │
│                    ┌────────────────────────────┐                           │
│                    │       INICIAR SESIÓN       │                           │
│                    └────────────────────────────┘                           │
│                                                                              │
│                         [¿Olvidaste contraseña?]                            │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ ENDPOINT: POST /api/auth/login                                              │
│ VALIDACIÓN: Solo roles admin, super_admin, support                          │
│ SEGURIDAD: Rate limit 5 intentos, bloqueo 30 min                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 📊 DASHBOARD
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [≡]  FashionStore Admin                    🔔 (3)  👤 Admin ▼             │
├────────────┬────────────────────────────────────────────────────────────────┤
│            │                                                                │
│ MENÚ       │   DASHBOARD                              Hoy: 3 Feb 2026      │
│            │                                                                │
│ 📊 Dashboard│   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│ 📦 Pedidos │   │ VENTAS  │ │ PEDIDOS │ │CLIENTES │ │PRODUCTOS│           │
│ 🛍️ Productos│   │  HOY    │ │  HOY    │ │ NUEVOS  │ │SIN STOCK│           │
│ 📁 Categorías│  │         │ │         │ │         │ │         │           │
│ 👥 Clientes│   │ €2,345  │ │   23    │ │    8    │ │   12    │           │
│ 💬 Soporte │   │ ↑ 12%   │ │ ↑ 5%    │ │ ↑ 15%   │ │ ⚠️      │           │
│ 🏷️ Cupones │   └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│ 📈 Reportes│                                                                │
│ ⚙️ Config  │   VENTAS ÚLTIMOS 30 DÍAS                                      │
│            │   ┌────────────────────────────────────────────────────┐      │
│            │   │                    📈                              │      │
│            │   │         ╱╲      ╱╲                                │      │
│            │   │    ╱╲  ╱  ╲    ╱  ╲   ╱╲                         │      │
│            │   │   ╱  ╲╱    ╲╱╱    ╲ ╱  ╲                         │      │
│            │   │  ╱                     ╲                          │      │
│            │   │ Ene 5    Ene 15    Ene 25    Feb 3                │      │
│            │   └────────────────────────────────────────────────────┘      │
│            │                                                                │
│            │   PEDIDOS RECIENTES                          [Ver todos →]    │
│            │   ┌────────────────────────────────────────────────────┐      │
│            │   │ # Pedido      Cliente      Total    Estado        │      │
│            │   ├────────────────────────────────────────────────────┤      │
│            │   │ ORD-042       Juan G.      €155     🟡 Pendiente  │      │
│            │   │ ORD-041       María L.     €89      🟢 Enviado    │      │
│            │   │ ORD-040       Pedro R.     €210     🟢 Entregado  │      │
│            │   └────────────────────────────────────────────────────┘      │
│            │                                                                │
│            │   PRODUCTOS BAJO STOCK                      [Ver todos →]    │
│            │   ┌────────────────────────────────────────────────────┐      │
│            │   │ Producto              Variante    Stock   Umbral  │      │
│            │   ├────────────────────────────────────────────────────┤      │
│            │   │ Vestido Elegante      M/Negro      3        5     │      │
│            │   │ Camisa Casual         L/Blanco     2        5     │      │
│            │   │ Pantalón Chino        S/Azul       0        5     │      │
│            │   └────────────────────────────────────────────────────┘      │
│            │                                                                │
├────────────┴────────────────────────────────────────────────────────────────┤
│ ENDPOINTS:                                                                  │
│ • GET /api/admin/dashboard/stats                                           │
│ • GET /api/admin/dashboard/sales?period=30d                                │
│ • GET /api/admin/dashboard/orders?limit=5                                  │
│ • GET /api/admin/dashboard/low-stock?limit=5                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 📦 PEDIDOS - LISTA
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [≡]  FashionStore Admin                    🔔 (3)  👤 Admin ▼             │
├────────────┬────────────────────────────────────────────────────────────────┤
│            │                                                                │
│ MENÚ       │   PEDIDOS                                                      │
│            │                                                                │
│ 📊 Dashboard│   [Todos ▼] [Estado ▼] [Fecha ▼] [🔍 Buscar...]  [Exportar]  │
│ 📦 Pedidos │                                                                │
│   └ Todos  │   ┌────────────────────────────────────────────────────────┐  │
│   └ Pendientes│ │ □  # Pedido      Fecha       Cliente    Total   Estado │  │
│   └ Enviados│  ├────────────────────────────────────────────────────────┤  │
│ 🛍️ Productos│  │ □  ORD-042      3 Feb 10:30  Juan G.    €155    🟡     │  │
│ ...        │   │ □  ORD-041      3 Feb 09:15  María L.   €89     🟢     │  │
│            │   │ □  ORD-040      2 Feb 18:45  Pedro R.   €210    🟢     │  │
│            │   │ □  ORD-039      2 Feb 14:20  Ana S.     €67     🔴     │  │
│            │   │ □  ORD-038      1 Feb 11:00  Luis M.    €145    🟢     │  │
│            │   └────────────────────────────────────────────────────────┘  │
│            │                                                                │
│            │   Mostrando 1-20 de 245 pedidos    [← 1 2 3 4 5 ... 13 →]    │
│            │                                                                │
│            │   ACCIONES EN LOTE:                                           │
│            │   [Marcar enviados] [Imprimir etiquetas] [Exportar selección] │
│            │                                                                │
├────────────┴────────────────────────────────────────────────────────────────┤
│ ENDPOINT: GET /api/admin/orders?page=1&status=all&search=                  │
│                                                                             │
│ FILTROS DISPONIBLES:                                                        │
│ • Estado: todos, pending, confirmed, shipped, delivered, cancelled         │
│ • Fecha: hoy, ayer, última semana, último mes, rango personalizado        │
│ • Pago: pagado, pendiente, fallido                                         │
│ • Búsqueda: número pedido, email cliente, nombre cliente                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 📦 PEDIDOS - DETALLE
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [←]  Pedido #ORD-20260203-00042                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ESTADO: 🟡 PENDIENTE                    PAGO: ✅ COMPLETADO               │
│                                                                              │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐          │
│  │ CAMBIAR ESTADO              │  │ ACCIONES                    │          │
│  │ [Confirmar pedido    ▼]     │  │ [📧 Email] [📄 Factura]    │          │
│  │ [GUARDAR]                   │  │ [❌ Cancelar] [💰 Reembolso]│          │
│  └─────────────────────────────┘  └─────────────────────────────┘          │
│                                                                              │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                              │
│  INFORMACIÓN DEL CLIENTE                                                    │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │ 👤 Juan García                                               │           │
│  │ 📧 cliente@ejemplo.com                                       │           │
│  │ 📱 +34 612 345 678                                           │           │
│  │ [Ver perfil del cliente →]                                   │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                                                              │
│  PRODUCTOS                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │ [img]  Vestido Elegante Negro                                │           │
│  │        SKU: VES-NEG-001 | Talla: M | Color: Negro           │           │
│  │        Cantidad: 2 × €59.99 = €119.98                       │           │
│  ├─────────────────────────────────────────────────────────────┤           │
│  │ [img]  Camisa Casual Blanca                                  │           │
│  │        SKU: CAM-BLA-002 | Talla: L | Color: Blanco          │           │
│  │        Cantidad: 1 × €29.99 = €29.99                        │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                                                              │
│  DIRECCIÓN DE ENVÍO                      INFORMACIÓN DE ENVÍO              │
│  ┌─────────────────────────┐             ┌─────────────────────────┐       │
│  │ Juan García             │             │ Método: Estándar        │       │
│  │ Calle Gran Vía 123      │             │ Transportista: SEUR     │       │
│  │ 4º B                    │             │ Tracking:               │       │
│  │ 28013 Madrid            │             │ [                    ]  │       │
│  │ España                  │             │ [ACTUALIZAR TRACKING]   │       │
│  │ +34 612 345 678         │             │                         │       │
│  └─────────────────────────┘             └─────────────────────────┘       │
│                                                                              │
│  RESUMEN FINANCIERO                      NOTAS                             │
│  ┌─────────────────────────┐             ┌─────────────────────────┐       │
│  │ Subtotal:    €149.97    │             │ NOTA CLIENTE:           │       │
│  │ Descuento:   -€30.00    │             │ Dejar en portería       │       │
│  │ Cupón:       SUMMER20   │             ├─────────────────────────┤       │
│  │ Envío:       GRATIS     │             │ NOTAS ADMIN:            │       │
│  │ IVA (21%):   €25.19     │             │ [Añadir nota interna]   │       │
│  │ ─────────────────────── │             │                         │       │
│  │ TOTAL:       €155.98    │             │ • 3 Feb: Pedido creado  │       │
│  │                         │             │ • 3 Feb: Pago recibido  │       │
│  │ Método: VISA ****4242   │             │                         │       │
│  └─────────────────────────┘             └─────────────────────────┘       │
│                                                                              │
│  TIMELINE DEL PEDIDO                                                        │
│  ● 3 Feb 10:30 - Pedido creado                                             │
│  ● 3 Feb 10:31 - Pago completado (Stripe)                                  │
│  ○ Pendiente - Confirmar pedido                                            │
│  ○ Pendiente - Enviar pedido                                               │
│  ○ Pendiente - Entrega                                                     │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ ENDPOINTS:                                                                  │
│ • GET /api/admin/orders/:id                                                │
│ • PUT /api/admin/orders/:id/status                                         │
│ • PUT /api/admin/orders/:id/tracking                                       │
│ • PUT /api/admin/orders/:id/notes                                          │
│ • POST /api/admin/orders/:id/refund                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 🛍️ PRODUCTOS - LISTA
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [≡]  FashionStore Admin                    🔔 (3)  👤 Admin ▼             │
├────────────┬────────────────────────────────────────────────────────────────┤
│            │                                                                │
│ MENÚ       │   PRODUCTOS                              [+ NUEVO PRODUCTO]   │
│            │                                                                │
│            │   [Todos ▼] [Categoría ▼] [Stock ▼] [🔍 Buscar...]           │
│            │                                                                │
│            │   ┌────────────────────────────────────────────────────────┐  │
│            │   │ □  Imagen   Producto        SKU      Precio  Stock  📊 │  │
│            │   ├────────────────────────────────────────────────────────┤  │
│            │   │ □  [img]   Vestido Elegante VES-001  €59.99   45   ✅  │  │
│            │   │ □  [img]   Camisa Casual    CAM-002  €29.99   23   ✅  │  │
│            │   │ □  [img]   Pantalón Chino   PAN-003  €45.00    3   ⚠️  │  │
│            │   │ □  [img]   Bolso Cuero      BOL-004  €89.99    0   ❌  │  │
│            │   │ □  [img]   Bufanda Lana     BUF-005  €19.99   50   ✅  │  │
│            │   └────────────────────────────────────────────────────────┘  │
│            │                                                                │
│            │   Mostrando 1-20 de 156 productos    [← 1 2 3 ... 8 →]       │
│            │                                                                │
│            │   ACCIONES: [Editar] [Duplicar] [Desactivar] [Eliminar]      │
│            │                                                                │
├────────────┴────────────────────────────────────────────────────────────────┤
│ ENDPOINT: GET /api/admin/products?page=1&category=all&stock=all            │
│                                                                             │
│ ACCIONES DISPONIBLES:                                                       │
│ • Click en producto → ProductEditScreen                                     │
│ • Editar stock inline                                                       │
│ • Toggle activo/inactivo                                                    │
│ • Importar/Exportar CSV                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 🛍️ PRODUCTOS - CREAR/EDITAR
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [←]  Editar Producto                      [VISTA PREVIA] [GUARDAR]        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [Información] [Precios] [Variantes] [Imágenes] [SEO]                       │
│                                                                              │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                              │
│  INFORMACIÓN BÁSICA                                                         │
│                                                                              │
│  Nombre del producto *                                                      │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │ Vestido Elegante Negro                                       │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                                                              │
│  SKU *                              Categoría *                             │
│  ┌────────────────────┐             ┌────────────────────┐                 │
│  │ VES-NEG-001        │             │ Vestidos         ▼ │                 │
│  └────────────────────┘             └────────────────────┘                 │
│                                                                              │
│  Descripción corta *                                                        │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │ Vestido elegante ideal para ocasiones especiales            │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                                                              │
│  Descripción larga                                                          │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │ [Editor de texto enriquecido]                                │           │
│  │                                                               │           │
│  │ Vestido elegante confeccionado en tela de alta calidad...   │           │
│  │                                                               │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                                                              │
│  Marca                               Tags                                   │
│  ┌────────────────────┐             ┌────────────────────┐                 │
│  │ FashionBrand       │             │ elegante, fiesta   │                 │
│  └────────────────────┘             └────────────────────┘                 │
│                                                                              │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                              │
│  PESTAÑA: PRECIOS                                                           │
│                                                                              │
│  Precio base *                       Precio comparación                     │
│  ┌────────────────────┐             ┌────────────────────┐                 │
│  │ € 59.99            │             │ € 79.99 (tachado)  │                 │
│  └────────────────────┘             └────────────────────┘                 │
│                                                                              │
│  Costo (privado)                     % Descuento                           │
│  ┌────────────────────┐             ┌────────────────────┐                 │
│  │ € 25.00            │             │ 25%                │                 │
│  └────────────────────┘             └────────────────────┘                 │
│                                                                              │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                              │
│  PESTAÑA: VARIANTES                                                         │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │ Variante       SKU           Precio +/-   Stock   Activa   │           │
│  ├─────────────────────────────────────────────────────────────┤           │
│  │ XS / Negro     VES-NEG-XS    +€0.00        12      [✓]     │           │
│  │ S / Negro      VES-NEG-S     +€0.00        18      [✓]     │           │
│  │ M / Negro      VES-NEG-M     +€0.00        15      [✓]     │           │
│  │ L / Negro      VES-NEG-L     +€5.00        10      [✓]     │           │
│  │ XL / Negro     VES-NEG-XL    +€5.00         5      [✓]     │           │
│  │                                                             │           │
│  │ [+ AÑADIR VARIANTE]                                        │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                                                              │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                              │
│  PESTAÑA: IMÁGENES                                                          │
│                                                                              │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌─────────────┐                   │
│  │[img1] │ │[img2] │ │[img3] │ │[img4] │ │     +       │                   │
│  │  ⭐   │ │       │ │       │ │       │ │   AÑADIR    │                   │
│  │ [🗑️]  │ │ [🗑️]  │ │ [🗑️]  │ │ [🗑️]  │ │   IMAGEN    │                   │
│  └───────┘ └───────┘ └───────┘ └───────┘ └─────────────┘                   │
│                                                                              │
│  Arrastra para reordenar. ⭐ = Imagen principal                            │
│                                                                              │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                              │
│  OPCIONES ADICIONALES                                                       │
│                                                                              │
│  [✓] Producto activo               [ ] Destacado                           │
│  [ ] Nuevo                         [ ] Bestseller                          │
│  [✓] Seguir inventario             [ ] Permitir backorder                  │
│                                                                              │
│                              [CANCELAR]  [GUARDAR PRODUCTO]                │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ ENDPOINTS:                                                                  │
│ • GET /api/admin/products/:id                                              │
│ • POST /api/admin/products (crear)                                         │
│ • PUT /api/admin/products/:id (actualizar)                                 │
│ • POST /api/admin/products/:id/images (subir imágenes)                     │
│ • POST /api/admin/products/:id/variants (añadir variante)                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 💬 SOPORTE - TICKETS
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [≡]  FashionStore Admin                    🔔 (3)  👤 Admin ▼             │
├────────────┬────────────────────────────────────────────────────────────────┤
│            │                                                                │
│ MENÚ       │   TICKETS DE SOPORTE                                          │
│            │                                                                │
│            │   [Abiertos (12)] [En progreso (5)] [Resueltos] [Todos]       │
│            │                                                                │
│            │   ┌────────────────────────────────────────────────────────┐  │
│            │   │ #Ticket   Asunto              Cliente   Prioridad  Hora│  │
│            │   ├────────────────────────────────────────────────────────┤  │
│            │   │ TKT-015   Pedido no llegó     Juan G.   🔴 Alta    2h  │  │
│            │   │ TKT-014   Solicitar reembolso María L.  🟡 Media   4h  │  │
│            │   │ TKT-013   Talla incorrecta    Pedro R.  🟡 Media   1d  │  │
│            │   │ TKT-012   Producto dañado     Ana S.    🔴 Alta    1d  │  │
│            │   └────────────────────────────────────────────────────────┘  │
│            │                                                                │
│            │   ESTADÍSTICAS                                                │
│            │   ┌────────────┐ ┌────────────┐ ┌────────────┐               │
│            │   │ Tiempo     │ │ Satisfacc. │ │ Resueltos  │               │
│            │   │ respuesta  │ │ cliente    │ │ hoy        │               │
│            │   │   2.5h     │ │   4.5/5    │ │    8       │               │
│            │   └────────────┘ └────────────┘ └────────────┘               │
│            │                                                                │
├────────────┴────────────────────────────────────────────────────────────────┤
│ ENDPOINT: GET /api/admin/support/tickets?status=open                       │
└─────────────────────────────────────────────────────────────────────────────┘


DETALLE TICKET:
┌─────────────────────────────────────────────────────────────────────────────┐
│  [←]  Ticket #TKT-20260203-00015                    [CERRAR TICKET]        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Estado: [En progreso ▼]    Prioridad: [Alta ▼]    Asignado: [Admin ▼]     │
│                                                                              │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                              │
│  INFORMACIÓN                                                                │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │ Asunto: Mi pedido no ha llegado                              │           │
│  │ Categoría: Envío                                             │           │
│  │ Pedido relacionado: #ORD-20260128-00038 [Ver →]             │           │
│  │ Creado: 3 Feb 2026, 10:30                                    │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                                                              │
│  CONVERSACIÓN                                                               │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  👤 Juan García                                    3 Feb 10:30             │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │ Realicé un pedido hace una semana y el tracking dice que    │           │
│  │ fue entregado pero yo no lo he recibido. ¿Pueden ayudarme? │           │
│  │                                                               │           │
│  │ Número de pedido: ORD-20260128-00038                         │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                                                              │
│  👤 Soporte (Admin)                                3 Feb 12:45             │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │ Hola Juan,                                                   │           │
│  │                                                               │           │
│  │ Lamentamos los inconvenientes. Hemos contactado con el      │           │
│  │ transportista para investigar qué ha ocurrido con tu        │           │
│  │ envío. Te mantendremos informado.                           │           │
│  │                                                               │           │
│  │ Saludos, Equipo de Soporte                                  │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  RESPONDER                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │                                                               │           │
│  │ Escribe tu respuesta aquí...                                 │           │
│  │                                                               │           │
│  └─────────────────────────────────────────────────────────────┘           │
│  [📎 Adjuntar]           [✓ Nota interna]           [ENVIAR RESPUESTA]     │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ ENDPOINTS:                                                                  │
│ • GET /api/admin/support/tickets/:id                                       │
│ • PUT /api/admin/support/tickets/:id/status                                │
│ • POST /api/admin/support/tickets/:id/reply                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### ⚙️ CONFIGURACIÓN
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [≡]  FashionStore Admin                    🔔 (3)  👤 Admin ▼             │
├────────────┬────────────────────────────────────────────────────────────────┤
│            │                                                                │
│ MENÚ       │   CONFIGURACIÓN                                               │
│            │                                                                │
│            │   [General] [Tienda] [Emails] [Pagos] [Envío] [Impuestos]     │
│            │                                                                │
│            │   ═══════════════════════════════════════════════════════════ │
│            │                                                                │
│            │   CONFIGURACIÓN GENERAL                                       │
│            │                                                                │
│            │   Nombre de la tienda                                         │
│            │   ┌─────────────────────────────────────┐                     │
│            │   │ FashionStore                        │                     │
│            │   └─────────────────────────────────────┘                     │
│            │                                                                │
│            │   Email de contacto                                           │
│            │   ┌─────────────────────────────────────┐                     │
│            │   │ contacto@fashionstore.com           │                     │
│            │   └─────────────────────────────────────┘                     │
│            │                                                                │
│            │   Teléfono                                                    │
│            │   ┌─────────────────────────────────────┐                     │
│            │   │ +34 900 123 456                     │                     │
│            │   └─────────────────────────────────────┘                     │
│            │                                                                │
│            │   ═══════════════════════════════════════════════════════════ │
│            │                                                                │
│            │   CONFIGURACIÓN DE TIENDA                                     │
│            │                                                                │
│            │   Moneda                          IVA (%)                     │
│            │   ┌──────────────┐                ┌──────────────┐            │
│            │   │ EUR (€)    ▼ │                │ 21           │            │
│            │   └──────────────┘                └──────────────┘            │
│            │                                                                │
│            │   Umbral envío gratis             Costo envío estándar       │
│            │   ┌──────────────┐                ┌──────────────┐            │
│            │   │ € 50.00      │                │ € 4.99       │            │
│            │   └──────────────┘                └──────────────┘            │
│            │                                                                │
│            │   [✓] Modo mantenimiento                                      │
│            │   Mensaje: ┌─────────────────────────────────────┐            │
│            │            │ Estamos mejorando la tienda...      │            │
│            │            └─────────────────────────────────────┘            │
│            │                                                                │
│            │                                    [GUARDAR CAMBIOS]          │
│            │                                                                │
├────────────┴────────────────────────────────────────────────────────────────┤
│ ENDPOINTS:                                                                  │
│ • GET /api/admin/settings                                                  │
│ • PUT /api/admin/settings                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# ═══════════════════════════════════════════════════════════════
# SECCIÓN 12: MIDDLEWARE, ROLES Y PERMISOS
# ═══════════════════════════════════════════════════════════════

## 12.1 MATRIZ DE PERMISOS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MATRIZ DE PERMISOS                                   │
└─────────────────────────────────────────────────────────────────────────────┘

Roles disponibles:
• super_admin : Acceso total, puede eliminar datos y cambiar configuración
• admin       : Gestión general, no puede eliminar usuarios ni cambiar roles
• support     : Solo acceso a tickets de soporte y ver pedidos
• vendor      : Solo gestión de productos (futuro multivendor)
• customer    : Usuario final, solo acceso a sus propios datos

┌────────────────────┬───────────┬─────────┬─────────┬────────┬──────────┐
│ RECURSO / ACCIÓN   │SUPER_ADMIN│ ADMIN   │ SUPPORT │ VENDOR │ CUSTOMER │
├────────────────────┼───────────┼─────────┼─────────┼────────┼──────────┤
│ USUARIOS           │           │         │         │        │          │
│  - Listar          │    ✅     │   ✅    │   ❌    │   ❌   │    ❌    │
│  - Ver detalle     │    ✅     │   ✅    │   ✅*   │   ❌   │   ✅**   │
│  - Crear           │    ✅     │   ✅    │   ❌    │   ❌   │    ❌    │
│  - Editar          │    ✅     │   ✅    │   ❌    │   ❌   │   ✅**   │
│  - Eliminar        │    ✅     │   ❌    │   ❌    │   ❌   │    ❌    │
│  - Cambiar rol     │    ✅     │   ❌    │   ❌    │   ❌   │    ❌    │
├────────────────────┼───────────┼─────────┼─────────┼────────┼──────────┤
│ PRODUCTOS          │           │         │         │        │          │
│  - Listar          │    ✅     │   ✅    │   ✅    │   ✅   │    ✅    │
│  - Ver detalle     │    ✅     │   ✅    │   ✅    │   ✅   │    ✅    │
│  - Crear           │    ✅     │   ✅    │   ❌    │  ✅*** │    ❌    │
│  - Editar          │    ✅     │   ✅    │   ❌    │  ✅*** │    ❌    │
│  - Eliminar        │    ✅     │   ✅    │   ❌    │   ❌   │    ❌    │
│  - Gestionar stock │    ✅     │   ✅    │   ❌    │  ✅*** │    ❌    │
├────────────────────┼───────────┼─────────┼─────────┼────────┼──────────┤
│ PEDIDOS            │           │         │         │        │          │
│  - Listar todos    │    ✅     │   ✅    │   ✅    │   ❌   │    ❌    │
│  - Listar propios  │    ✅     │   ✅    │   ✅    │   ❌   │    ✅    │
│  - Ver detalle     │    ✅     │   ✅    │   ✅    │   ❌   │   ✅**   │
│  - Crear           │    ✅     │   ✅    │   ❌    │   ❌   │    ✅    │
│  - Cambiar estado  │    ✅     │   ✅    │   ❌    │   ❌   │    ❌    │
│  - Cancelar        │    ✅     │   ✅    │   ❌    │   ❌   │   ✅**   │
│  - Reembolsar      │    ✅     │   ✅    │   ❌    │   ❌   │    ❌    │
├────────────────────┼───────────┼─────────┼─────────┼────────┼──────────┤
│ SOPORTE            │           │         │         │        │          │
│  - Listar tickets  │    ✅     │   ✅    │   ✅    │   ❌   │    ❌    │
│  - Listar propios  │    ✅     │   ✅    │   ✅    │   ❌   │    ✅    │
│  - Crear ticket    │    ✅     │   ✅    │   ✅    │   ❌   │    ✅    │
│  - Responder       │    ✅     │   ✅    │   ✅    │   ❌   │   ✅**   │
│  - Cerrar          │    ✅     │   ✅    │   ✅    │   ❌   │   ✅**   │
│  - Asignar         │    ✅     │   ✅    │   ✅    │   ❌   │    ❌    │
├────────────────────┼───────────┼─────────┼─────────┼────────┼──────────┤
│ CUPONES            │           │         │         │        │          │
│  - Listar          │    ✅     │   ✅    │   ❌    │   ❌   │    ❌    │
│  - Crear           │    ✅     │   ✅    │   ❌    │   ❌   │    ❌    │
│  - Editar          │    ✅     │   ✅    │   ❌    │   ❌   │    ❌    │
│  - Eliminar        │    ✅     │   ✅    │   ❌    │   ❌   │    ❌    │
│  - Validar/Usar    │    ✅     │   ✅    │   ✅    │   ✅   │    ✅    │
├────────────────────┼───────────┼─────────┼─────────┼────────┼──────────┤
│ REPORTES           │           │         │         │        │          │
│  - Ver reportes    │    ✅     │   ✅    │   ❌    │   ❌   │    ❌    │
│  - Exportar        │    ✅     │   ✅    │   ❌    │   ❌   │    ❌    │
├────────────────────┼───────────┼─────────┼─────────┼────────┼──────────┤
│ CONFIGURACIÓN      │           │         │         │        │          │
│  - Ver             │    ✅     │   ✅    │   ❌    │   ❌   │    ❌    │
│  - Editar          │    ✅     │   ❌    │   ❌    │   ❌   │    ❌    │
├────────────────────┼───────────┼─────────┼─────────┼────────┼──────────┤
│ LOGS / AUDITORÍA   │           │         │         │        │          │
│  - Ver logs        │    ✅     │   ✅    │   ❌    │   ❌   │    ❌    │
│  - Exportar        │    ✅     │   ❌    │   ❌    │   ❌   │    ❌    │
└────────────────────┴───────────┴─────────┴─────────┴────────┴──────────┘

Notas:
*   Solo usuarios relacionados con tickets asignados
**  Solo sus propios recursos
*** Solo sus propios productos (multivendor)
```

## 12.2 IMPLEMENTACIÓN DE MIDDLEWARE

```javascript
// src/middleware/roleCheck.middleware.js
// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE AVANZADO DE CONTROL DE ACCESO
// ═══════════════════════════════════════════════════════════════

const { createResponse } = require('../utils/response.utils');

// Definición de permisos por recurso
const PERMISSIONS = {
  users: {
    create: ['super_admin', 'admin'],
    read: ['super_admin', 'admin'],
    update: ['super_admin', 'admin'],
    delete: ['super_admin'],
    changeRole: ['super_admin']
  },
  products: {
    create: ['super_admin', 'admin', 'vendor'],
    read: ['*'], // Todos
    update: ['super_admin', 'admin', 'vendor'],
    delete: ['super_admin', 'admin'],
    manageStock: ['super_admin', 'admin', 'vendor']
  },
  orders: {
    create: ['*'],
    readAll: ['super_admin', 'admin', 'support'],
    readOwn: ['*'],
    update: ['super_admin', 'admin'],
    cancel: ['super_admin', 'admin'],
    refund: ['super_admin', 'admin']
  },
  support: {
    readAll: ['super_admin', 'admin', 'support'],
    readOwn: ['*'],
    create: ['*'],
    respond: ['super_admin', 'admin', 'support'],
    close: ['super_admin', 'admin', 'support'],
    assign: ['super_admin', 'admin', 'support']
  },
  coupons: {
    create: ['super_admin', 'admin'],
    read: ['super_admin', 'admin'],
    update: ['super_admin', 'admin'],
    delete: ['super_admin', 'admin'],
    validate: ['*']
  },
  reports: {
    read: ['super_admin', 'admin'],
    export: ['super_admin', 'admin']
  },
  settings: {
    read: ['super_admin', 'admin'],
    update: ['super_admin']
  },
  logs: {
    read: ['super_admin', 'admin'],
    export: ['super_admin']
  }
};

/**
 * Verificar si el rol tiene permiso para la acción en el recurso
 */
function hasPermission(role, resource, action) {
  const resourcePerms = PERMISSIONS[resource];
  if (!resourcePerms) return false;
  
  const allowedRoles = resourcePerms[action];
  if (!allowedRoles) return false;
  
  // '*' significa todos los roles autenticados
  if (allowedRoles.includes('*')) return true;
  
  return allowedRoles.includes(role);
}

/**
 * Middleware factory para verificar permisos
 * @param {string} resource - Recurso (users, products, orders, etc.)
 * @param {string} action - Acción (create, read, update, delete, etc.)
 * @param {Object} options - Opciones adicionales
 */
function checkPermission(resource, action, options = {}) {
  return async (req, res, next) => {
    // Verificar que el usuario está autenticado
    if (!req.user) {
      return res.status(401).json(
        createResponse(false, null, 'Autenticación requerida', 'NOT_AUTHENTICATED')
      );
    }
    
    const userRole = req.userRole;
    
    // Verificar permiso básico
    if (!hasPermission(userRole, resource, action)) {
      return res.status(403).json(
        createResponse(
          false, 
          null, 
          `No tienes permiso para ${action} en ${resource}`, 
          'FORBIDDEN'
        )
      );
    }
    
    // Verificaciones adicionales según opciones
    
    // Verificar propiedad del recurso (ej: solo editar tus propios datos)
    if (options.ownerOnly) {
      const resourceOwnerId = await getResourceOwnerId(req, resource, options);
      
      if (resourceOwnerId && resourceOwnerId !== req.userId) {
        // Admin y super_admin pueden acceder a recursos de otros
        if (!['super_admin', 'admin'].includes(userRole)) {
          return res.status(403).json(
            createResponse(
              false, 
              null, 
              'Solo puedes acceder a tus propios recursos', 
              'NOT_OWNER'
            )
          );
        }
      }
    }
    
    // Verificar que vendor solo accede a sus productos
    if (options.vendorProducts && userRole === 'vendor') {
      const productOwnerId = await getProductOwnerId(req);
      if (productOwnerId && productOwnerId !== req.userId) {
        return res.status(403).json(
          createResponse(
            false, 
            null, 
            'Solo puedes gestionar tus propios productos', 
            'NOT_PRODUCT_OWNER'
          )
        );
      }
    }
    
    next();
  };
}

/**
 * Obtener el ID del propietario de un recurso
 */
async function getResourceOwnerId(req, resource, options) {
  const { Order, SupportTicket, Address, Review } = require('../models');
  
  const resourceId = req.params.id || req.params.orderId || req.params.ticketId;
  if (!resourceId) return null;
  
  switch (resource) {
    case 'orders':
      const order = await Order.findByPk(resourceId, { attributes: ['user_id'] });
      return order?.user_id;
      
    case 'support':
      const ticket = await SupportTicket.findByPk(resourceId, { attributes: ['user_id'] });
      return ticket?.user_id;
      
    case 'addresses':
      const address = await Address.findByPk(resourceId, { attributes: ['user_id'] });
      return address?.user_id;
      
    case 'reviews':
      const review = await Review.findByPk(resourceId, { attributes: ['user_id'] });
      return review?.user_id;
      
    default:
      return null;
  }
}

/**
 * Obtener el propietario de un producto (para multivendor)
 */
async function getProductOwnerId(req) {
  const { Product } = require('../models');
  const productId = req.params.id || req.params.productId;
  
  if (!productId) return null;
  
  const product = await Product.findByPk(productId, { attributes: ['created_by'] });
  return product?.created_by;
}

module.exports = {
  checkPermission,
  hasPermission,
  PERMISSIONS
};


// ═══════════════════════════════════════════════════════════════
// USO EN RUTAS
// ═══════════════════════════════════════════════════════════════

// src/routes/admin/orders.routes.js
const router = require('express').Router();
const { authenticate } = require('../../middleware/auth.middleware');
const { checkPermission } = require('../../middleware/roleCheck.middleware');
const ordersController = require('../../controllers/admin/orders.controller');

// Listar todos los pedidos (solo admin, super_admin, support)
router.get(
  '/',
  authenticate,
  checkPermission('orders', 'readAll'),
  ordersController.list
);

// Ver detalle de pedido
router.get(
  '/:id',
  authenticate,
  checkPermission('orders', 'readAll'),
  ordersController.getById
);

// Cambiar estado de pedido
router.put(
  '/:id/status',
  authenticate,
  checkPermission('orders', 'update'),
  ordersController.updateStatus
);

// Cancelar pedido
router.post(
  '/:id/cancel',
  authenticate,
  checkPermission('orders', 'cancel'),
  ordersController.cancel
);

// Procesar reembolso
router.post(
  '/:id/refund',
  authenticate,
  checkPermission('orders', 'refund'),
  ordersController.refund
);

module.exports = router;
```

---

# ═══════════════════════════════════════════════════════════════
# SECCIÓN 13: CONSULTAS SQL Y LOGS
# ═══════════════════════════════════════════════════════════════

## 13.1 CONSULTAS COMUNES

```sql
-- ═══════════════════════════════════════════════════════════════
-- CONSULTAS DE DASHBOARD
-- ═══════════════════════════════════════════════════════════════

-- Ventas del día
SELECT 
  COALESCE(SUM(total_amount), 0) as total_ventas,
  COUNT(*) as num_pedidos
FROM orders
WHERE 
  payment_status = 'completed'
  AND DATE(created_at) = CURRENT_DATE;

-- Ventas por período (últimos 30 días con desglose diario)
SELECT 
  DATE(created_at) as fecha,
  SUM(total_amount) as total,
  COUNT(*) as pedidos
FROM orders
WHERE 
  payment_status = 'completed'
  AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY fecha;

-- Productos más vendidos
SELECT 
  p.id,
  p.name,
  p.slug,
  SUM(oi.quantity) as unidades_vendidas,
  SUM(oi.line_total) as ingresos
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
WHERE 
  o.payment_status = 'completed'
  AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.id, p.name, p.slug
ORDER BY unidades_vendidas DESC
LIMIT 10;

-- Productos con bajo stock
SELECT 
  p.id,
  p.name,
  p.sku,
  pv.size,
  pv.color,
  pv.stock,
  p.low_stock_threshold
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
WHERE 
  pv.stock <= p.low_stock_threshold
  AND p.is_active = true
  AND p.track_inventory = true
ORDER BY pv.stock ASC;

-- Nuevos clientes hoy
SELECT COUNT(*) as nuevos_clientes
FROM users
WHERE 
  role_id = 5  -- customer
  AND DATE(created_at) = CURRENT_DATE;


-- ═══════════════════════════════════════════════════════════════
-- CONSULTAS DE PRODUCTOS
-- ═══════════════════════════════════════════════════════════════

-- Obtener producto con variantes e imágenes
SELECT 
  p.*,
  json_agg(DISTINCT jsonb_build_object(
    'id', pv.id,
    'size', pv.size,
    'color', pv.color,
    'colorHex', pv.color_hex,
    'stock', pv.stock,
    'priceModifier', pv.price_modifier
  )) as variants,
  json_agg(DISTINCT jsonb_build_object(
    'id', pi.id,
    'url', pi.url,
    'thumbnailUrl', pi.thumbnail_url,
    'isPrimary', pi.is_primary,
    'displayOrder', pi.display_order
  )) as images
FROM products p
LEFT JOIN product_variants pv ON pv.product_id = p.id
LEFT JOIN product_images pi ON pi.product_id = p.id
WHERE p.slug = $1 AND p.is_active = true
GROUP BY p.id;

-- Búsqueda de productos con filtros
SELECT 
  p.id,
  p.name,
  p.slug,
  p.price,
  p.compare_at_price,
  p.discount_percentage,
  p.rating_average,
  p.rating_count,
  (
    SELECT json_agg(jsonb_build_object('url', pi.url, 'isPrimary', pi.is_primary))
    FROM product_images pi 
    WHERE pi.product_id = p.id
    ORDER BY pi.display_order
    LIMIT 2
  ) as images,
  (
    SELECT SUM(pv.stock) 
    FROM product_variants pv 
    WHERE pv.product_id = p.id
  ) as total_stock
FROM products p
JOIN categories c ON c.id = p.category_id
WHERE 
  p.is_active = true
  AND ($1::uuid IS NULL OR c.id = $1)  -- Filtro categoría
  AND ($2::decimal IS NULL OR p.price >= $2)  -- Precio mínimo
  AND ($3::decimal IS NULL OR p.price <= $3)  -- Precio máximo
  AND (
    $4::text[] IS NULL 
    OR EXISTS (
      SELECT 1 FROM product_variants pv 
      WHERE pv.product_id = p.id 
      AND pv.size = ANY($4)
      AND pv.stock > 0
    )
  )  -- Filtro tallas
  AND (
    $5::text IS NULL 
    OR p.name ILIKE '%' || $5 || '%'
    OR p.description ILIKE '%' || $5 || '%'
  )  -- Búsqueda texto
ORDER BY 
  CASE WHEN $6 = 'price_asc' THEN p.price END ASC,
  CASE WHEN $6 = 'price_desc' THEN p.price END DESC,
  CASE WHEN $6 = 'newest' THEN p.created_at END DESC,
  CASE WHEN $6 = 'popular' THEN p.sales_count END DESC,
  p.created_at DESC
LIMIT $7 OFFSET $8;


-- ═══════════════════════════════════════════════════════════════
-- CONSULTAS DE PEDIDOS
-- ═══════════════════════════════════════════════════════════════

-- Obtener pedido completo con items
SELECT 
  o.*,
  json_agg(jsonb_build_object(
    'id', oi.id,
    'productId', oi.product_id,
    'variantId', oi.variant_id,
    'productSnapshot', oi.product_snapshot,
    'quantity', oi.quantity,
    'pricePerUnit', oi.price_per_unit,
    'discountPerUnit', oi.discount_per_unit,
    'lineTotal', oi.line_total
  )) as items,
  (
    SELECT jsonb_build_object(
      'id', pay.id,
      'status', pay.status,
      'cardBrand', pay.card_brand,
      'cardLastFour', pay.card_last_four
    )
    FROM payments pay
    WHERE pay.order_id = o.id
    LIMIT 1
  ) as payment
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE o.id = $1
GROUP BY o.id;

-- Historial de pedidos del usuario con paginación
SELECT 
  o.id,
  o.order_number,
  o.status,
  o.total_amount,
  o.created_at,
  (
    SELECT json_agg(jsonb_build_object(
      'image', (oi.product_snapshot->>'image'),
      'name', (oi.product_snapshot->>'name')
    ))
    FROM order_items oi
    WHERE oi.order_id = o.id
    LIMIT 3
  ) as preview_items,
  (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
FROM orders o
WHERE o.user_id = $1
ORDER BY o.created_at DESC
LIMIT $2 OFFSET $3;


-- ═══════════════════════════════════════════════════════════════
-- CONSULTAS DE STOCK
-- ═══════════════════════════════════════════════════════════════

-- Verificar stock de múltiples variantes (para checkout)
SELECT 
  pv.id,
  pv.stock,
  pv.stock - pv.stock_reserved as available_stock
FROM product_variants pv
WHERE pv.id = ANY($1::uuid[])
FOR UPDATE;  -- Bloqueo para evitar race conditions

-- Reservar stock (dentro de transacción)
UPDATE product_variants
SET 
  stock_reserved = stock_reserved + $2,
  updated_at = CURRENT_TIMESTAMP
WHERE id = $1
AND stock - stock_reserved >= $2
RETURNING id, stock, stock_reserved;

-- Liberar stock reservado (si falla pago)
UPDATE product_variants
SET 
  stock_reserved = GREATEST(0, stock_reserved - $2),
  updated_at = CURRENT_TIMESTAMP
WHERE id = $1;
```

## 13.2 SISTEMA DE LOGS

```javascript
// src/utils/logger.utils.js
// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE WINSTON LOGGER
// ═══════════════════════════════════════════════════════════════

const winston = require('winston');
const path = require('path');

const logDir = process.env.LOG_DIR || './logs';

// Formato personalizado
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

// Crear logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: { service: 'fashionstore-api' },
  transports: [
    // Errores a archivo separado
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5
    }),
    // Todos los logs
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 10
    }),
    // Logs de acceso HTTP
    new winston.transports.File({
      filename: path.join(logDir, 'access.log'),
      level: 'http',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5
    })
  ]
});

// En desarrollo, también mostrar en consola
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      customFormat
    )
  }));
}

// Funciones helper
logger.logRequest = (req, res, responseTime) => {
  logger.http('HTTP Request', {
    method: req.method,
    url: req.originalUrl,
    status: res.statusCode,
    responseTime: `${responseTime}ms`,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.userId || 'anonymous'
  });
};

logger.logError = (error, req = null) => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    code: error.code
  };
  
  if (req) {
    errorData.request = {
      method: req.method,
      url: req.originalUrl,
      userId: req.userId,
      body: req.body
    };
  }
  
  logger.error('Application Error', errorData);
};

logger.logActivity = (userId, action, details = {}) => {
  logger.info('User Activity', {
    userId,
    action,
    ...details
  });
};

module.exports = logger;
```

---

# ═══════════════════════════════════════════════════════════════
# SECCIÓN 14: ESCALABILIDAD Y FUTURO
# ═══════════════════════════════════════════════════════════════

## 14.1 ARQUITECTURA PARA ESCALAR

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA DE ALTA DISPONIBILIDAD                       │
└─────────────────────────────────────────────────────────────────────────────┘

                              Internet
                                  │
                    ┌─────────────┴─────────────┐
                    │      CLOUDFLARE CDN       │
                    │   (WAF, DDoS, Caching)    │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │    AWS APPLICATION        │
                    │    LOAD BALANCER          │
                    └─────────────┬─────────────┘
                                  │
            ┌─────────────────────┼─────────────────────┐
            │                     │                     │
            ▼                     ▼                     ▼
    ┌───────────────┐     ┌───────────────┐     ┌───────────────┐
    │   ECS Task    │     │   ECS Task    │     │   ECS Task    │
    │   (API)       │     │   (API)       │     │   (API)       │
    │   Instance 1  │     │   Instance 2  │     │   Instance 3  │
    └───────┬───────┘     └───────┬───────┘     └───────┬───────┘
            │                     │                     │
            └─────────────────────┼─────────────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│ RDS PostgreSQL│         │ ElastiCache   │         │     S3        │
│   Primary     │         │   Redis       │         │   Bucket      │
│   (Multi-AZ)  │         │   Cluster     │         │   (Images)    │
└───────┬───────┘         └───────────────┘         └───────────────┘
        │
        ▼
┌───────────────┐
│ RDS PostgreSQL│
│   Read Replica│
└───────────────┘
```

## 14.2 PREPARACIÓN PARA PUSH NOTIFICATIONS

```javascript
// src/services/notification.service.js
// ═══════════════════════════════════════════════════════════════
// SERVICIO DE NOTIFICACIONES PUSH (FIREBASE)
// ═══════════════════════════════════════════════════════════════

const admin = require('firebase-admin');
const { Notification, User } = require('../models');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    })
  });
}

class NotificationService {
  
  /**
   * Enviar push notification a un usuario
   */
  static async sendToUser(userId, title, body, data = {}) {
    try {
      // Obtener FCM token del usuario
      const user = await User.findByPk(userId, {
        attributes: ['fcm_token', 'push_enabled']
      });
      
      if (!user || !user.fcm_token || !user.push_enabled) {
        return { success: false, reason: 'No FCM token or push disabled' };
      }
      
      // Guardar notificación en DB
      const notification = await Notification.create({
        user_id: userId,
        type: data.type || 'general',
        title,
        body,
        action_type: data.actionType || 'none',
        action_data: data.actionData || null
      });
      
      // Enviar push
      const message = {
        token: user.fcm_token,
        notification: {
          title,
          body
        },
        data: {
          notificationId: notification.id,
          ...data
        },
        android: {
          priority: 'high',
          notification: {
            channelId: 'default',
            icon: 'ic_notification'
          }
        },
        apns: {
          payload: {
            aps: {
              badge: await this.getUnreadCount(userId),
              sound: 'default'
            }
          }
        }
      };
      
      const response = await admin.messaging().send(message);
      
      // Actualizar estado de envío
      await notification.update({
        push_sent: true,
        push_sent_at: new Date()
      });
      
      return { success: true, messageId: response };
      
    } catch (error) {
      console.error('Push notification error:', error);
      
      // Si el token es inválido, limpiarlo
      if (error.code === 'messaging/invalid-registration-token') {
        await User.update(
          { fcm_token: null },
          { where: { id: userId } }
        );
      }
      
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Enviar push a múltiples usuarios
   */
  static async sendToMultiple(userIds, title, body, data = {}) {
    const results = await Promise.allSettled(
      userIds.map(userId => this.sendToUser(userId, title, body, data))
    );
    
    return {
      total: userIds.length,
      success: results.filter(r => r.status === 'fulfilled' && r.value.success).length,
      failed: results.filter(r => r.status === 'rejected' || !r.value.success).length
    };
  }
  
  /**
   * Notificaciones predefinidas
   */
  static async notifyOrderConfirmed(userId, orderNumber) {
    return this.sendToUser(
      userId,
      '¡Pedido confirmado!',
      `Tu pedido #${orderNumber} ha sido confirmado`,
      {
        type: 'order',
        actionType: 'navigate',
        actionData: JSON.stringify({ screen: 'OrderDetail', params: { orderNumber } })
      }
    );
  }
  
  static async notifyOrderShipped(userId, orderNumber, trackingNumber) {
    return this.sendToUser(
      userId,
      '¡Tu pedido está en camino!',
      `Pedido #${orderNumber} ha sido enviado. Tracking: ${trackingNumber}`,
      {
        type: 'order',
        actionType: 'navigate',
        actionData: JSON.stringify({ screen: 'OrderTracking', params: { orderNumber } })
      }
    );
  }
  
  static async notifyOrderDelivered(userId, orderNumber) {
    return this.sendToUser(
      userId,
      '¡Pedido entregado!',
      `Tu pedido #${orderNumber} ha sido entregado. ¿Qué te pareció?`,
      {
        type: 'order',
        actionType: 'navigate',
        actionData: JSON.stringify({ screen: 'OrderReview', params: { orderNumber } })
      }
    );
  }
  
  static async notifyPriceDropWishlist(userId, productName, newPrice) {
    return this.sendToUser(
      userId,
      '¡Bajó de precio!',
      `${productName} ahora está a €${newPrice}`,
      {
        type: 'promotion',
        actionType: 'navigate',
        actionData: JSON.stringify({ screen: 'Wishlist' })
      }
    );
  }
  
  static async notifyBackInStock(userId, productName) {
    return this.sendToUser(
      userId,
      '¡Volvió el stock!',
      `${productName} está disponible de nuevo`,
      {
        type: 'stock',
        actionType: 'navigate',
        actionData: JSON.stringify({ screen: 'Wishlist' })
      }
    );
  }
  
  static async notifyNewSupportReply(userId, ticketNumber) {
    return this.sendToUser(
      userId,
      'Nueva respuesta de soporte',
      `Hay una nueva respuesta en tu ticket #${ticketNumber}`,
      {
        type: 'support',
        actionType: 'navigate',
        actionData: JSON.stringify({ screen: 'TicketDetail', params: { ticketNumber } })
      }
    );
  }
  
  /**
   * Obtener contador de notificaciones no leídas
   */
  static async getUnreadCount(userId) {
    return Notification.count({
      where: {
        user_id: userId,
        is_read: false
      }
    });
  }
}

module.exports = NotificationService;
```

---

# ═══════════════════════════════════════════════════════════════
# SECCIÓN 15: RESUMEN FINAL
# ═══════════════════════════════════════════════════════════════

## 15.1 CHECKLIST DE INTEGRACIÓN FLUTTER

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CHECKLIST INTEGRACIÓN FLUTTER                             │
└─────────────────────────────────────────────────────────────────────────────┘

CONFIGURACIÓN INICIAL
□ Crear proyecto Flutter con nombre correcto
□ Configurar pubspec.yaml con todas las dependencias
□ Configurar archivos .env para cada entorno
□ Configurar Firebase (google-services.json / GoogleService-Info.plist)
□ Configurar Stripe SDK (merchant ID, publishable key)
□ Implementar SecureStorage para tokens

AUTENTICACIÓN
□ Implementar pantalla de Login
□ Implementar pantalla de Registro
□ Implementar Forgot Password
□ Implementar verificación de email
□ Configurar interceptor Dio con JWT
□ Implementar refresh token automático
□ Manejar logout y limpieza de tokens

PRODUCTOS
□ Implementar listado con paginación infinita
□ Implementar filtros y búsqueda
□ Implementar detalle de producto
□ Implementar galería de imágenes con zoom
□ Implementar selector de variantes (talla/color)

CARRITO
□ Implementar persistencia local del carrito
□ Sincronizar con servidor al autenticar
□ Implementar añadir/quitar/actualizar items
□ Implementar validación de stock
□ Implementar aplicación de cupones

CHECKOUT
□ Implementar selección de dirección
□ Implementar métodos de envío
□ Integrar Stripe Payment Sheet
□ Manejar estados de pago
□ Implementar pantalla de éxito

PEDIDOS
□ Implementar historial de pedidos
□ Implementar detalle de pedido
□ Implementar seguimiento de envío
□ Implementar cancelación/devolución

PERFIL
□ Implementar edición de perfil
□ Implementar gestión de direcciones
□ Implementar cambio de contraseña
□ Implementar preferencias

SOPORTE
□ Implementar listado de tickets
□ Implementar creación de ticket
□ Implementar chat de ticket

NOTIFICACIONES
□ Configurar Firebase Messaging
□ Manejar notificaciones en foreground
□ Manejar deep links desde notificaciones
□ Implementar pantalla de notificaciones

PRUEBAS
□ Test unitarios de servicios
□ Test de integración de API
□ Test de widgets principales
□ Test de flujos completos
```

## 15.2 COMANDOS ÚTILES

```bash
# ═══════════════════════════════════════════════════════════════
# BACKEND
# ═══════════════════════════════════════════════════════════════

# Iniciar en desarrollo
npm run dev

# Ejecutar migraciones
npm run migrate

# Ejecutar seeders
npm run seed

# Ejecutar tests
npm test

# Lint
npm run lint


# ═══════════════════════════════════════════════════════════════
# FLUTTER
# ═══════════════════════════════════════════════════════════════

# Obtener dependencias
flutter pub get

# Generar código (json_serializable, etc.)
flutter pub run build_runner build --delete-conflicting-outputs

# Ejecutar en desarrollo
flutter run --dart-define=ENV=development

# Build Android
flutter build apk --release

# Build iOS
flutter build ios --release


# ═══════════════════════════════════════════════════════════════
# DOCKER
# ═══════════════════════════════════════════════════════════════

# Levantar entorno completo
docker-compose up -d

# Ver logs
docker-compose logs -f api

# Reconstruir
docker-compose up -d --build
```

---

# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║                                                                            ║
# ║                    FIN DE LA DOCUMENTACIÓN TÉCNICA                         ║
# ║                                                                            ║
# ║    Este documento contiene toda la información necesaria para             ║
# ║    desarrollar e integrar una aplicación Flutter con el backend           ║
# ║    de FashionStore E-Commerce.                                            ║
# ║                                                                            ║
# ║    Versión: 3.0.0                                                         ║
# ║    Última actualización: 3 de febrero de 2026                             ║
# ║                                                                            ║
# ║    Para dudas: soporte@fashionstore.com                                   ║
# ║                                                                            ║
# ╚═══════════════════════════════════════════════════════════════════════════╝
