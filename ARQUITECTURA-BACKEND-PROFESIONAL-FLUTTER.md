# 🏗️ ARQUITECTURA BACKEND PROFESIONAL PARA FLUTTER
## Sistema E-Commerce Completo Ready-To-Deploy

**Versión:** 2.0  
**Fecha:** 3 de febrero de 2026  
**Nivel:** Senior Full-Stack  
**Estado:** Documentación técnica lista para implementar  

---

## 📑 ÍNDICE COMPLETO

1. [Visión Arquitectónica](#visión-arquitectónica)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estructura de Carpetas](#estructura-de-carpetas)
4. [Base de Datos Completa](#base-de-datos-completa)
5. [Sistema de Autenticación](#sistema-de-autenticación)
6. [API REST Completa](#api-rest-completa)
7. [Sistema de Correos](#sistema-de-correos)
8. [Ejemplos de Código](#ejemplos-de-código)
9. [Flujos Completos](#flujos-completos)
10. [Seguridad](#seguridad)
11. [Escalabilidad](#escalabilidad)

---

## 🎯 VISIÓN ARQUITECTÓNICA

### Diagrama de Capas

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE FLUTTER                          │
│  (Presentación, lógica de UI, gestión de estado)            │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTP/REST (HTTPS)
                 │ Headers: Authorization: Bearer {JWT}
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                  API REST (Node.js/Express)                 │
│  ├─ Routes: Rutas de endpoints                              │
│  ├─ Controllers: Lógica de negocio                          │
│  ├─ Middleware: Auth, validación, logging                   │
│  └─ Services: Lógica de dominio                             │
└────────────────┬────────────────────────────────────────────┘
                 │ SQL (conexión pooled)
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              BASE DE DATOS (PostgreSQL)                     │
│  ├─ Usuarios y autenticación                                │
│  ├─ Productos y categorías                                  │
│  ├─ Pedidos y carrito                                       │
│  ├─ Direcciones de envío                                    │
│  ├─ Soporte y tickets                                       │
│  └─ Logs y auditoría                                        │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│           SERVICIOS EXTERNOS                                │
│  ├─ SendGrid/Nodemailer: Envío de correos                  │
│  ├─ Stripe/PayPal: Pagos                                    │
│  ├─ AWS S3/Cloudinary: Almacenamiento de imágenes          │
│  └─ Redis: Cache y sesiones                                │
└─────────────────────────────────────────────────────────────┘
```

### Principios Arquitectónicos

✅ **REST puro** - No GraphQL, endpoints claros y predecibles  
✅ **Stateless** - Cada request contiene toda la información  
✅ **JWT** - Autenticación sin sesiones servidor  
✅ **Seguridad** - Validación, sanitización, rate limiting  
✅ **Escalable** - Preparado para crecer horizontalmente  
✅ **Documentado** - Cada endpoint con ejemplos  

---

## 🛠️ STACK TECNOLÓGICO

### Backend

```json
{
  "runtime": "Node.js 18+",
  "framework": "Express.js 4.x",
  "database": "PostgreSQL 14+",
  "orm": "Sequelize 6.x o Knex.js",
  "authentication": "JWT (jsonwebtoken)",
  "password_hashing": "bcryptjs",
  "email": "Nodemailer + SendGrid",
  "file_upload": "multer",
  "validation": "joi / express-validator",
  "logging": "winston + morgan",
  "cache": "redis",
  "cors": "cors middleware",
  "rate_limiting": "express-rate-limit",
  "uuid": "uuid/v4"
}
```

### Dependencias Package.json

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.35.0",
    "pg": "^8.11.0",
    "pg-hstore": "^2.3.4",
    "jsonwebtoken": "^9.1.0",
    "bcryptjs": "^2.4.3",
    "joi": "^17.11.0",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.7",
    "sendgrid": "^7.7.0",
    "stripe": "^14.5.0",
    "redis": "^4.6.11",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "dotenv": "^16.3.1",
    "winston": "^3.11.0",
    "morgan": "^1.10.0",
    "uuid": "^9.0.1",
    "moment": "^2.29.4",
    "luxon": "^3.4.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  }
}
```

---

## 📁 ESTRUCTURA DE CARPETAS

```
proyecto-backend/
├── src/
│   ├── config/
│   │   ├── database.js           # Configuración PostgreSQL
│   │   ├── sequelize.js          # ORM setup
│   │   ├── redis.js              # Cache setup
│   │   ├── email.js              # Transporte email
│   │   ├── stripe.js             # Pasarela de pagos
│   │   └── environment.js        # Variables de entorno
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js    # Verificación JWT
│   │   ├── roleCheck.js          # Control de roles
│   │   ├── errorHandler.js       # Manejo de errores global
│   │   ├── requestLogger.js      # Logging de peticiones
│   │   ├── validation.js         # Validación de datos
│   │   └── rateLimiter.js        # Rate limiting
│   │
│   ├── models/
│   │   ├── User.js               # Modelo usuario
│   │   ├── Role.js               # Modelo roles
│   │   ├── Product.js            # Modelo producto
│   │   ├── Category.js           # Modelo categoría
│   │   ├── Order.js              # Modelo pedido
│   │   ├── OrderItem.js          # Modelo ítem pedido
│   │   ├── Cart.js               # Modelo carrito
│   │   ├── CartItem.js           # Modelo ítem carrito
│   │   ├── Address.js            # Modelo dirección
│   │   ├── Support.js            # Modelo ticket soporte
│   │   ├── Message.js            # Modelo mensaje contacto
│   │   ├── PasswordReset.js      # Modelo recuperación contraseña
│   │   ├── UserLog.js            # Modelo log usuario
│   │   ├── ProductImage.js       # Modelo imágenes producto
│   │   └── Sequelize.js          # Configuración relaciones
│   │
│   ├── routes/
│   │   ├── index.js              # Agregador de rutas
│   │   ├── auth.routes.js        # Autenticación
│   │   ├── user.routes.js        # Gestión usuario
│   │   ├── product.routes.js     # Productos
│   │   ├── category.routes.js    # Categorías
│   │   ├── cart.routes.js        # Carrito
│   │   ├── order.routes.js       # Pedidos
│   │   ├── address.routes.js     # Direcciones
│   │   ├── support.routes.js     # Soporte
│   │   ├── admin.routes.js       # Panel admin
│   │   └── public.routes.js      # Endpoints públicos
│   │
│   ├── controllers/
│   │   ├── authController.js     # Lógica autenticación
│   │   ├── userController.js     # Lógica usuario
│   │   ├── productController.js  # Lógica productos
│   │   ├── cartController.js     # Lógica carrito
│   │   ├── orderController.js    # Lógica pedidos
│   │   ├── addressController.js  # Lógica direcciones
│   │   ├── supportController.js  # Lógica soporte
│   │   └── adminController.js    # Lógica admin
│   │
│   ├── services/
│   │   ├── AuthService.js        # Servicio autenticación
│   │   ├── UserService.js        # Servicio usuario
│   │   ├── ProductService.js     # Servicio productos
│   │   ├── OrderService.js       # Servicio pedidos
│   │   ├── EmailService.js       # Servicio correos
│   │   ├── PaymentService.js     # Servicio pagos
│   │   ├── StorageService.js     # Servicio almacenamiento
│   │   └── NotificationService.js # Servicio notificaciones
│   │
│   ├── utils/
│   │   ├── jwt.js                # Funciones JWT
│   │   ├── crypto.js             # Encriptación
│   │   ├── validators.js         # Validadores custom
│   │   ├── formatters.js         # Formateadores
│   │   ├── logger.js             # Logger configurado
│   │   ├── errorMessages.js      # Mensajes de error
│   │   └── constants.js          # Constantes
│   │
│   ├── templates/
│   │   ├── emails/
│   │   │   ├── welcome.html      # Email bienvenida
│   │   │   ├── orderConfirm.html # Email confirmación orden
│   │   │   ├── shipping.html     # Email envío
│   │   │   ├── password-reset.html
│   │   │   ├── support-reply.html
│   │   │   └── invoice.html
│   │   │
│   │   └── sms/
│   │       └── templates.js
│   │
│   ├── migrations/
│   │   ├── 001-create-users.js
│   │   ├── 002-create-products.js
│   │   ├── 003-create-orders.js
│   │   └── ...
│   │
│   ├── seeders/
│   │   ├── user-seeder.js
│   │   ├── category-seeder.js
│   │   └── product-seeder.js
│   │
│   ├── public/
│   │   └── uploads/              # Archivos subidos
│   │
│   └── app.js                    # Aplicación principal

├── tests/
│   ├── auth.test.js
│   ├── product.test.js
│   ├── order.test.js
│   └── integration.test.js

├── docs/
│   ├── API.md                    # Documentación API
│   ├── DATABASE.md               # Diagrama BD
│   └── SECURITY.md               # Guía seguridad

├── .env.example
├── .env.local                    # Variables locales
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

## 🗄️ BASE DE DATOS COMPLETA

### SQL Schema Completo

```sql
-- ========================================
-- USUARIOS Y AUTENTICACIÓN
-- ========================================

CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL, -- admin, vendor, customer, support
  description TEXT,
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL, -- bcrypt hash
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  avatar_url TEXT,
  role_id INTEGER REFERENCES roles(id) DEFAULT 3, -- customer
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  last_login TIMESTAMP,
  last_ip VARCHAR(45),
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_active ON users(is_active);

CREATE TABLE password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_resets_user ON password_resets(user_id);
CREATE INDEX idx_password_resets_token ON password_resets(token_hash);

CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);

-- ========================================
-- PRODUCTOS Y CATEGORÍAS
-- ========================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  cost_price DECIMAL(10, 2),
  compare_at_price DECIMAL(10, 2),
  discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage BETWEEN 0 AND 100),
  stock INTEGER NOT NULL DEFAULT 0,
  stock_reserved INTEGER DEFAULT 0,
  category_id UUID NOT NULL REFERENCES categories(id),
  brand VARCHAR(100),
  weight_kg DECIMAL(10, 2),
  dimensions_cm VARCHAR(50),
  color VARCHAR(50),
  size VARCHAR(50),
  material VARCHAR(100),
  care_instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_flash_sale BOOLEAN DEFAULT false,
  flash_sale_ends TIMESTAMP,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);

CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  display_order INTEGER,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- ========================================
-- CARRITO
-- ========================================

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_add DECIMAL(10, 2), -- Snapshot de precio
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cart_items_user ON cart_items(user_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);

-- ========================================
-- PEDIDOS
-- ========================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL, -- ORD-2026020301
  user_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, processing, shipped, delivered, cancelled, refunded
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
  payment_method VARCHAR(50), -- stripe, paypal, credit_card, bank_transfer
  payment_id VARCHAR(255), -- ID externo de la pasarela
  
  -- Información cliente
  customer_email VARCHAR(255),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  
  -- Direcciones
  shipping_address_id UUID REFERENCES addresses(id),
  billing_address_id UUID REFERENCES addresses(id),
  same_billing_address BOOLEAN DEFAULT true,
  
  -- Montos
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  coupon_code VARCHAR(50),
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Tracking
  tracking_number VARCHAR(100),
  shipping_carrier VARCHAR(50),
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP,
  return_deadline TIMESTAMP,
  
  -- Notas
  customer_notes TEXT,
  admin_notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_per_unit DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  line_total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ========================================
-- DIRECCIONES
-- ========================================

CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20), -- shipping, billing
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  street_address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(2), -- ISO 3166-1
  phone VARCHAR(20),
  company VARCHAR(100),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_addresses_type ON addresses(type);

-- ========================================
-- SOPORTE Y CONTACTO
-- ========================================

CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- billing, shipping, product, account, other
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  status VARCHAR(50) DEFAULT 'open', -- open, in_progress, waiting, closed, reopened
  assigned_to UUID REFERENCES users(id),
  order_id UUID REFERENCES orders(id),
  resolution TEXT,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_support_user ON support_tickets(user_id);
CREATE INDEX idx_support_status ON support_tickets(status);

CREATE TABLE support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  attachment_url TEXT,
  is_from_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_support_messages_ticket ON support_messages(ticket_id);

CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  email VARCHAR(255),
  subject VARCHAR(255),
  message TEXT,
  phone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'new', -- new, read, replied
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  replied_at TIMESTAMP
);

-- ========================================
-- LOGS Y AUDITORÍA
-- ========================================

CREATE TABLE user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100), -- login, logout, purchase, profile_update
  resource_type VARCHAR(50), -- user, product, order
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_user ON user_activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON user_activity_logs(action);

CREATE TABLE api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  method VARCHAR(10),
  endpoint VARCHAR(255),
  status_code INTEGER,
  response_time_ms INTEGER,
  request_body JSONB,
  error_message TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_logs_user ON api_logs(user_id);
CREATE INDEX idx_api_logs_endpoint ON api_logs(endpoint);

-- ========================================
-- CONFIGURACIÓN Y VARIABLES
-- ========================================

CREATE TABLE app_config (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  type VARCHAR(20), -- string, number, boolean, json
  description TEXT,
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear roles iniciales
INSERT INTO roles (name, description, permissions) VALUES
  ('admin', 'Administrador del sistema', '{}'),
  ('vendor', 'Vendedor/Proveedor', '{}'),
  ('customer', 'Cliente', '{}'),
  ('support', 'Personal de soporte', '{}');
```

---

## 🔐 SISTEMA DE AUTENTICACIÓN

### Flujo JWT

```
1. REGISTRO
   ├─ User POST /auth/register
   ├─ Validar email único
   ├─ Hashear contraseña con bcrypt
   ├─ Crear registro en BD
   ├─ Enviar email de verificación
   └─ Retornar JWT + refresh token

2. LOGIN
   ├─ User POST /auth/login
   ├─ Validar email existe
   ├─ Comparar contraseña con bcrypt
   ├─ Crear JWT (15 min) + Refresh Token (7 días)
   ├─ Guardar sesión en BD
   └─ Retornar tokens

3. REQUEST AUTENTICADO
   ├─ Flutter envía: Authorization: Bearer {JWT}
   ├─ Middleware verifica JWT
   ├─ Si válido: continúa
   ├─ Si expirado: intenta renovar con refresh
   └─ Si rechazado: retorna 401

4. RENOVACIÓN
   ├─ User POST /auth/refresh
   ├─ Validar refresh token
   ├─ Crear nuevo JWT
   └─ Retornar nuevo JWT
```

### Implementación JWT

```javascript
// config/jwt.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

function generateTokens(userId, email, roleId) {
  const payload = {
    id: userId,
    email: email,
    roleId: roleId,
    type: 'access'
  };
  
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: 'HS256'
  });
  
  const refreshToken = jwt.sign({
    id: userId,
    type: 'refresh'
  }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN
  });
  
  return { accessToken, refreshToken };
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expirado');
    }
    throw new Error('Token inválido');
  }
}

module.exports = {
  generateTokens,
  verifyToken,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN
};
```

### Middleware Autenticación

```javascript
// middleware/auth.middleware.js
const { verifyToken } = require('../config/jwt');

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token requerido',
        code: 'NO_TOKEN'
      });
    }
    
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: error.message,
      code: 'INVALID_TOKEN'
    });
  }
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }
    
    if (roles.length && !roles.includes(req.user.roleId)) {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    
    next();
  };
};

module.exports = {
  authenticateToken,
  authorize
};
```

---

## 🔌 API REST COMPLETA

### 1. ENDPOINTS DE AUTENTICACIÓN

#### POST /api/auth/register
```
Registrar nuevo usuario

REQUEST:
{
  "email": "usuario@example.com",
  "password": "SecurePass123!",
  "first_name": "Juan",
  "last_name": "García",
  "phone": "+34 600 123 456"
}

RESPONSE (201):
{
  "success": true,
  "message": "Usuario registrado. Verifica tu email.",
  "user": {
    "id": "uuid",
    "email": "usuario@example.com",
    "first_name": "Juan",
    "role": "customer"
  },
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}

ERRORS:
{
  "success": false,
  "error": "El email ya existe",
  "code": "EMAIL_EXISTS"
}
```

#### POST /api/auth/login
```
Iniciar sesión

REQUEST:
{
  "email": "usuario@example.com",
  "password": "SecurePass123!"
}

RESPONSE (200):
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "usuario@example.com",
    "first_name": "Juan",
    "avatar_url": "https://..."
  },
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 900 // segundos
  }
}
```

#### POST /api/auth/refresh
```
Renovar token de acceso

REQUEST:
{
  "refreshToken": "eyJhbGc..."
}

RESPONSE (200):
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "expiresIn": 900
}
```

#### POST /api/auth/logout
```
Cerrar sesión

HEADERS:
Authorization: Bearer {accessToken}

RESPONSE (200):
{
  "success": true,
  "message": "Sesión cerrada"
}
```

#### POST /api/auth/password-reset/request
```
Solicitar recuperación de contraseña

REQUEST:
{
  "email": "usuario@example.com"
}

RESPONSE (200):
{
  "success": true,
  "message": "Revisa tu email para resetear tu contraseña"
}
```

#### POST /api/auth/password-reset/confirm
```
Confirmar recuperación de contraseña

REQUEST:
{
  "token": "reset-token-from-email",
  "new_password": "NewSecurePass123!"
}

RESPONSE (200):
{
  "success": true,
  "message": "Contraseña actualizada"
}
```

---

### 2. ENDPOINTS DE PRODUCTOS

#### GET /api/products
```
Listar productos con filtros

QUERY PARAMS:
- page=1 (default)
- limit=20 (default, max 100)
- category=uuid
- min_price=0
- max_price=1000
- search=camiseta
- sort=price_asc|price_desc|newest|popular
- is_featured=true
- in_stock=true

RESPONSE (200):
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "sku": "CAMI-001",
        "name": "Camiseta Básica",
        "slug": "camiseta-basica",
        "description": "...",
        "price": 29.99,
        "cost_price": 10.00,
        "compare_at_price": 49.99,
        "discount_percentage": 40,
        "stock": 100,
        "stock_reserved": 5,
        "category": {
          "id": "uuid",
          "name": "Camisetas",
          "slug": "camisetas"
        },
        "images": [
          {
            "id": "uuid",
            "url": "https://cdn.example.com/...",
            "alt_text": "Camiseta roja",
            "is_primary": true
          }
        ],
        "rating": 4.5,
        "review_count": 24,
        "is_new": false,
        "is_featured": true,
        "is_flash_sale": false
      }
    ],
    "pagination": {
      "total": 245,
      "page": 1,
      "limit": 20,
      "pages": 13
    }
  }
}
```

#### GET /api/products/:id
```
Obtener detalle producto

RESPONSE (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "sku": "CAMI-001",
    "name": "Camiseta Básica",
    "description": "Camiseta 100% algodón...",
    "long_description": "HTML con descripción completa",
    "price": 29.99,
    "compare_at_price": 49.99,
    "discount_percentage": 40,
    "stock": 100,
    "stock_reserved": 5,
    "available_stock": 95,
    "category": {...},
    "images": [...],
    "brand": "BrandName",
    "material": "100% Algodón",
    "weight_kg": 0.3,
    "dimensions_cm": "50x70x2",
    "care_instructions": "Lavar a 30°C...",
    "related_products": [...]
  }
}
```

#### GET /api/products/search
```
Búsqueda avanzada

QUERY PARAMS:
- q=palabra
- filters={"color":"rojo","size":"M"}
- sort=relevance

RESPONSE (200):
Similar a GET /api/products
```

#### POST /api/products (Admin)
```
Crear producto

HEADERS:
Authorization: Bearer {admin-token}
Content-Type: application/json

REQUEST:
{
  "sku": "CAMI-002",
  "name": "Camiseta Premium",
  "slug": "camiseta-premium",
  "description": "Descripción corta",
  "long_description": "Descripción larga HTML",
  "price": 39.99,
  "cost_price": 15.00,
  "compare_at_price": 59.99,
  "stock": 50,
  "category_id": "uuid",
  "brand": "BrandName",
  "material": "100% Algodón",
  "is_active": true
}

RESPONSE (201):
{
  "success": true,
  "message": "Producto creado",
  "data": { producto creado }
}
```

#### PUT /api/products/:id (Admin)
```
Actualizar producto

RESPONSE (200):
{
  "success": true,
  "message": "Producto actualizado",
  "data": { producto actualizado }
}
```

#### DELETE /api/products/:id (Admin)
```
Eliminar producto (soft delete)

RESPONSE (200):
{
  "success": true,
  "message": "Producto eliminado"
}
```

---

### 3. ENDPOINTS DE CARRITO

#### GET /api/cart
```
Obtener carrito del usuario

HEADERS:
Authorization: Bearer {token}

RESPONSE (200):
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "product": {
          "id": "uuid",
          "name": "Camiseta",
          "image": "https://..."
        },
        "quantity": 2,
        "price_per_unit": 29.99,
        "line_total": 59.98,
        "added_at": "2026-02-03T10:00:00Z"
      }
    ],
    "summary": {
      "subtotal": 89.97,
      "tax": 18.89,
      "shipping": 5.99,
      "discount": 0,
      "total": 114.85,
      "item_count": 3
    }
  }
}
```

#### POST /api/cart
```
Añadir producto al carrito

REQUEST:
{
  "product_id": "uuid",
  "quantity": 2
}

RESPONSE (201):
{
  "success": true,
  "message": "Producto añadido al carrito",
  "data": { item }
}
```

#### PATCH /api/cart/:item_id
```
Actualizar cantidad en carrito

REQUEST:
{
  "quantity": 3
}

RESPONSE (200):
{
  "success": true,
  "data": { item actualizado }
}
```

#### DELETE /api/cart/:item_id
```
Remover producto del carrito

RESPONSE (200):
{
  "success": true,
  "message": "Producto removido del carrito"
}
```

#### DELETE /api/cart
```
Vaciar carrito

RESPONSE (200):
{
  "success": true,
  "message": "Carrito vaciado"
}
```

---

### 4. ENDPOINTS DE ÓRDENES

#### POST /api/orders
```
Crear orden

REQUEST:
{
  "shipping_address_id": "uuid",
  "billing_address_id": "uuid",
  "same_billing_address": true,
  "coupon_code": "VERANO2024",
  "customer_notes": "Dejar en portería"
}

RESPONSE (201):
{
  "success": true,
  "message": "Orden creada",
  "data": {
    "id": "uuid",
    "order_number": "ORD-2026020301",
    "status": "pending",
    "payment_status": "pending",
    "items": [...],
    "subtotal": 89.97,
    "tax": 18.89,
    "shipping": 5.99,
    "discount": 5.00,
    "total": 109.85,
    "payment_intent_id": "pi_...", // Para Stripe
    "payment_url": "https://checkout.stripe.com/...",
    "created_at": "2026-02-03T10:00:00Z"
  }
}
```

#### GET /api/orders
```
Listar órdenes del usuario

QUERY PARAMS:
- status=pending|confirmed|shipped|delivered|cancelled
- page=1
- limit=20

RESPONSE (200):
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "uuid",
        "order_number": "ORD-2026020301",
        "status": "shipped",
        "total": 109.85,
        "item_count": 3,
        "created_at": "2026-02-03T10:00:00Z",
        "estimated_delivery": "2026-02-10T00:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

#### GET /api/orders/:id
```
Obtener detalle de orden

RESPONSE (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "order_number": "ORD-2026020301",
    "status": "shipped",
    "payment_status": "completed",
    "items": [
      {
        "product_name": "Camiseta",
        "quantity": 2,
        "price": 29.99,
        "line_total": 59.98
      }
    ],
    "shipping_address": {...},
    "billing_address": {...},
    "tracking": {
      "number": "1Z999AA10123456784",
      "carrier": "UPS",
      "status": "in_transit",
      "tracking_url": "https://..."
    },
    "timeline": [
      {
        "status": "pending",
        "timestamp": "2026-02-03T10:00:00Z"
      },
      {
        "status": "confirmed",
        "timestamp": "2026-02-03T11:00:00Z"
      }
    ]
  }
}
```

#### PUT /api/orders/:id/cancel
```
Cancelar orden

RESPONSE (200):
{
  "success": true,
  "message": "Orden cancelada",
  "data": { orden actualizada }
}
```

---

### 5. ENDPOINTS DE PERFIL

#### GET /api/user/profile
```
Obtener perfil del usuario

HEADERS:
Authorization: Bearer {token}

RESPONSE (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "usuario@example.com",
    "first_name": "Juan",
    "last_name": "García",
    "phone": "+34 600 123 456",
    "avatar_url": "https://...",
    "created_at": "2025-10-15T00:00:00Z"
  }
}
```

#### PUT /api/user/profile
```
Actualizar perfil

REQUEST:
{
  "first_name": "Juan",
  "last_name": "García",
  "phone": "+34 600 654 321",
  "avatar_url": "https://..."
}

RESPONSE (200):
{
  "success": true,
  "message": "Perfil actualizado",
  "data": { usuario }
}
```

#### PUT /api/user/password
```
Cambiar contraseña

REQUEST:
{
  "current_password": "OldPass123!",
  "new_password": "NewPass123!"
}

RESPONSE (200):
{
  "success": true,
  "message": "Contraseña actualizada"
}
```

#### GET /api/user/addresses
```
Obtener direcciones del usuario

RESPONSE (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "shipping",
      "first_name": "Juan",
      "last_name": "García",
      "street_address": "Calle Principal 123",
      "city": "Madrid",
      "state": "Madrid",
      "postal_code": "28001",
      "country": "ES",
      "phone": "+34 600 123 456",
      "is_default": true
    }
  ]
}
```

#### POST /api/user/addresses
```
Crear dirección

REQUEST:
{
  "type": "shipping",
  "first_name": "Juan",
  "last_name": "García",
  "street_address": "Calle Principal 123",
  "city": "Madrid",
  "state": "Madrid",
  "postal_code": "28001",
  "country": "ES",
  "phone": "+34 600 123 456",
  "is_default": true
}

RESPONSE (201):
{
  "success": true,
  "data": { dirección }
}
```

#### PUT /api/user/addresses/:id
```
Actualizar dirección

RESPONSE (200):
Similar a POST
```

#### DELETE /api/user/addresses/:id
```
Eliminar dirección

RESPONSE (200):
{
  "success": true,
  "message": "Dirección eliminada"
}
```

---

### 6. ENDPOINTS DE SOPORTE

#### POST /api/support/tickets
```
Crear ticket de soporte

REQUEST:
{
  "subject": "Producto dañado",
  "description": "Recibí el producto dañado",
  "category": "product",
  "priority": "high",
  "order_id": "uuid"
}

RESPONSE (201):
{
  "success": true,
  "data": {
    "id": "uuid",
    "ticket_number": "TKT-2026020301",
    "status": "open",
    "created_at": "2026-02-03T10:00:00Z"
  }
}
```

#### GET /api/support/tickets
```
Listar tickets del usuario

RESPONSE (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "ticket_number": "TKT-2026020301",
      "subject": "Producto dañado",
      "status": "open",
      "priority": "high",
      "created_at": "2026-02-03T10:00:00Z",
      "updated_at": "2026-02-03T12:00:00Z"
    }
  ]
}
```

#### GET /api/support/tickets/:id
```
Obtener detalle ticket

RESPONSE (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "ticket_number": "TKT-2026020301",
    "subject": "Producto dañado",
    "description": "...",
    "status": "open",
    "priority": "high",
    "messages": [
      {
        "id": "uuid",
        "user_name": "Juan García",
        "message": "El producto llegó dañado",
        "is_from_admin": false,
        "created_at": "2026-02-03T10:00:00Z"
      }
    ]
  }
}
```

#### POST /api/support/tickets/:id/messages
```
Responder en ticket

REQUEST:
{
  "message": "Ya revisamos tu caso",
  "attachment_url": "https://..."
}

RESPONSE (201):
{
  "success": true,
  "data": { mensaje }
}
```

#### POST /api/contact
```
Formulario de contacto (público)

REQUEST:
{
  "name": "Juan García",
  "email": "juan@example.com",
  "subject": "Consulta general",
  "message": "Quisiera saber...",
  "phone": "+34 600 123 456"
}

RESPONSE (201):
{
  "success": true,
  "message": "Mensaje enviado. Nos contactaremos pronto."
}
```

---

### 7. ENDPOINTS ADMIN

#### GET /api/admin/dashboard
```
Obtener estadísticas dashboard

HEADERS:
Authorization: Bearer {admin-token}

RESPONSE (200):
{
  "success": true,
  "data": {
    "stats": {
      "total_users": 1245,
      "new_users_today": 12,
      "total_orders": 5678,
      "orders_pending": 23,
      "total_revenue": 234567.89,
      "revenue_today": 1234.56,
      "average_order_value": 41.32
    },
    "recent_orders": [...],
    "top_products": [...],
    "sales_chart": {...}
  }
}
```

#### GET /api/admin/users
```
Listar usuarios (paginado, filtrado)

QUERY PARAMS:
- page=1
- limit=20
- role=customer|admin|vendor
- search=email
- status=active|inactive|banned

RESPONSE (200):
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "first_name": "Juan",
        "role": "customer",
        "is_active": true,
        "last_login": "2026-02-03T10:00:00Z",
        "created_at": "2025-10-15T00:00:00Z",
        "orders_count": 5,
        "total_spent": 567.89
      }
    ],
    "pagination": {...}
  }
}
```

#### PUT /api/admin/users/:id
```
Actualizar usuario

REQUEST:
{
  "role": "vendor",
  "is_active": false
}

RESPONSE (200):
{
  "success": true,
  "data": { usuario actualizado }
}
```

#### GET /api/admin/orders
```
Listar todas las órdenes

QUERY PARAMS:
- page=1
- status=pending|confirmed|shipped
- date_from=2026-02-01
- date_to=2026-02-28

RESPONSE (200):
Similar a GET /api/orders pero admin
```

#### PUT /api/admin/orders/:id/status
```
Actualizar estado de orden

REQUEST:
{
  "status": "shipped",
  "tracking_number": "1Z999AA...",
  "shipping_carrier": "UPS",
  "admin_notes": "Enviado con urgencia"
}

RESPONSE (200):
{
  "success": true,
  "message": "Orden actualizada. Email enviado al cliente."
}
```

#### GET /api/admin/support
```
Listar todos los tickets

RESPONSE (200):
Similar a GET /api/support/tickets pero admin
```

#### PUT /api/admin/support/:id/assign
```
Asignar ticket a soporte

REQUEST:
{
  "assigned_to": "uuid"
}

RESPONSE (200):
{
  "success": true,
  "message": "Ticket asignado"
}
```

---

## 📧 SISTEMA DE CORREOS AUTOMÁTICOS

### Configuración SendGrid/Nodemailer

```javascript
// config/email.js
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(
  sgTransport({
    service: 'SendGrid',
    auth: {
      api_key: process.env.SENDGRID_API_KEY
    }
  })
);

// O alternativa con Mailgun
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD
  }
});

module.exports = transporter;
```

### Servicio de Email

```javascript
// services/EmailService.js
const transporter = require('../config/email');
const { renderTemplate } = require('../utils/templateRenderer');

class EmailService {
  
  // Email de bienvenida
  async sendWelcomeEmail(user) {
    const html = await renderTemplate('welcome', {
      firstName: user.first_name,
      verificationLink: `${process.env.APP_URL}/verify/${user.verification_token}`
    });
    
    return this.send({
      to: user.email,
      subject: '¡Bienvenido a Tienda Ropa!',
      html: html,
      template: 'welcome'
    });
  }
  
  // Confirmación de pedido
  async sendOrderConfirmation(order) {
    const html = await renderTemplate('orderConfirm', {
      orderNumber: order.order_number,
      items: order.items,
      total: order.total_amount,
      estimatedDelivery: this.calculateDelivery(order)
    });
    
    return this.send({
      to: order.customer_email,
      subject: `Orden confirmada #${order.order_number}`,
      html: html
    });
  }
  
  // Notificación de envío
  async sendShippingNotification(order) {
    const html = await renderTemplate('shipping', {
      orderNumber: order.order_number,
      trackingNumber: order.tracking_number,
      carrier: order.shipping_carrier,
      trackingUrl: `https://track.example.com/${order.tracking_number}`,
      estimatedDelivery: order.estimated_delivery
    });
    
    return this.send({
      to: order.customer_email,
      subject: `Tu pedido ha sido enviado #${order.order_number}`,
      html: html
    });
  }
  
  // Recuperación de contraseña
  async sendPasswordReset(user, resetToken) {
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
    const html = await renderTemplate('passwordReset', {
      firstName: user.first_name,
      resetLink: resetUrl,
      expiresIn: '24 horas'
    });
    
    return this.send({
      to: user.email,
      subject: 'Recupera tu contraseña',
      html: html
    });
  }
  
  // Respuesta de ticket
  async sendSupportReply(ticket, message) {
    const html = await renderTemplate('supportReply', {
      ticketNumber: ticket.ticket_number,
      message: message.message,
      ticketUrl: `${process.env.APP_URL}/support/${ticket.id}`
    });
    
    return this.send({
      to: ticket.user.email,
      subject: `Respuesta a tu ticket #${ticket.ticket_number}`,
      html: html
    });
  }
  
  // Email de contacto para admin
  async sendContactFormToAdmin(contact) {
    const html = await renderTemplate('contactNotification', {
      name: contact.name,
      email: contact.email,
      subject: contact.subject,
      message: contact.message,
      phone: contact.phone
    });
    
    return this.send({
      to: process.env.ADMIN_EMAIL,
      subject: `Nuevo mensaje de contacto: ${contact.subject}`,
      html: html
    });
  }
  
  // Método genérico de envío
  async send(options) {
    try {
      const result = await transporter.sendMail({
        from: process.env.MAIL_FROM || 'noreply@tiendaropa.com',
        ...options
      });
      
      console.log(`Email enviado: ${options.to}`);
      return result;
    } catch (error) {
      console.error(`Error enviando email: ${error.message}`);
      throw error;
    }
  }
  
  calculateDelivery(order) {
    const deliveryDays = order.shipping_cost === 0 ? 5 : 2;
    const delivery = new Date();
    delivery.setDate(delivery.getDate() + deliveryDays);
    return delivery.toISOString();
  }
}

module.exports = new EmailService();
```

### Plantillas HTML

```html
<!-- templates/emails/orderConfirm.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: #333; color: #fff; padding: 20px; }
    .content { padding: 20px; }
    .order-items { border: 1px solid #ddd; margin: 20px 0; }
    .item { padding: 10px; border-bottom: 1px solid #eee; }
    .total { font-size: 18px; font-weight: bold; color: #d32f2f; }
    .button { 
      background: #333;
      color: #fff;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 4px;
      display: inline-block;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Orden Confirmada</h1>
    </div>
    
    <div class="content">
      <p>Hola {firstName},</p>
      
      <p>Tu pedido ha sido confirmado. Aquí están los detalles:</p>
      
      <p><strong>Número de orden:</strong> {orderNumber}</p>
      
      <div class="order-items">
        {{#each items}}
          <div class="item">
            <strong>{{product_name}}</strong> x {{quantity}}<br>
            €{{price}} = €{{line_total}}
          </div>
        {{/each}}
      </div>
      
      <p><strong>Total:</strong> <span class="total">€{{total}}</span></p>
      
      <p>Tu pedido será entregado aproximadamente el <strong>{{estimatedDelivery}}</strong></p>
      
      <a href="{orderUrl}" class="button">Ver Orden</a>
      
      <p>¿Preguntas? <a href="mailto:soporte@tiendaropa.com">Contacta con nosotros</a></p>
    </div>
  </div>
</body>
</html>
```

### Disparadores de Email

```javascript
// En authController.js - Después de registrar usuario
async register(req, res) {
  try {
    // ... crear usuario ...
    
    // Enviar email de bienvenida
    await EmailService.sendWelcomeEmail(user);
    
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    // ...
  }
}

// En orderController.js - Después de crear orden
async createOrder(req, res) {
  try {
    // ... crear orden ...
    
    // Enviar confirmación
    await EmailService.sendOrderConfirmation(order);
    
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    // ...
  }
}

// En webhook de Stripe - Cuando pago es confirmado
async handlePaymentSuccess(event) {
  const order = await Order.findByPaymentId(event.data.object.id);
  
  // Actualizar estado
  order.payment_status = 'completed';
  await order.save();
  
  // Enviar email
  await EmailService.sendOrderConfirmation(order);
}

// En orderController.js - Al actualizar estado a shipped
async updateStatus(req, res) {
  const { status } = req.body;
  const order = await Order.findByPk(req.params.id);
  
  order.status = status;
  
  if (status === 'shipped') {
    order.shipped_at = new Date();
    await order.save();
    
    // Enviar notificación
    await EmailService.sendShippingNotification(order);
  }
  
  res.json({ success: true, data: order });
}
```

---

## 💻 EJEMPLOS DE CÓDIGO FUNCIONAL

### Modelo Usuario (Sequelize)

```javascript
// models/User.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    avatar_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    role_id: {
      type: DataTypes.INTEGER,
      defaultValue: 3, // customer
      references: {
        model: 'Roles',
        key: 'id'
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    failed_login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    locked_until: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    timestamps: true,
    underscored: true,
    paranoid: true // Soft delete
  });
  
  // Métodos de instancia
  User.prototype.setPassword = async function(password) {
    const salt = await bcrypt.genSalt(10);
    this.password_hash = await bcrypt.hash(password, salt);
  };
  
  User.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password_hash);
  };
  
  User.prototype.toJSON = function() {
    const user = this.get();
    delete user.password_hash;
    delete user.failed_login_attempts;
    return user;
  };
  
  return User;
};
```

### Controlador de Autenticación

```javascript
// controllers/authController.js
const { User, Role } = require('../models');
const { generateTokens } = require('../config/jwt');
const EmailService = require('../services/EmailService');
const crypto = require('crypto');

class AuthController {
  
  async register(req, res, next) {
    try {
      const { email, password, first_name, last_name, phone } = req.body;
      
      // Validar si email existe
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'El email ya existe',
          code: 'EMAIL_EXISTS'
        });
      }
      
      // Crear usuario
      const user = await User.create({
        email,
        first_name,
        last_name,
        phone
      });
      
      // Hash contraseña
      await user.setPassword(password);
      await user.save();
      
      // Generar tokens
      const { accessToken, refreshToken } = generateTokens(
        user.id,
        user.email,
        user.role_id
      );
      
      // Guardar sesión
      await sequelize.models.UserSession.create({
        user_id: user.id,
        token_hash: crypto.createHash('sha256').update(accessToken).digest('hex'),
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
        expires_at: new Date(Date.now() + 15 * 60 * 1000) // 15 min
      });
      
      // Enviar email de bienvenida
      await EmailService.sendWelcomeEmail(user);
      
      // Log de actividad
      await sequelize.models.UserActivityLog.create({
        user_id: user.id,
        action: 'register',
        ip_address: req.ip
      });
      
      res.status(201).json({
        success: true,
        message: 'Usuario registrado correctamente',
        user: user.toJSON(),
        tokens: {
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      // Validar usuario existe
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Email o contraseña incorrectos',
          code: 'INVALID_CREDENTIALS'
        });
      }
      
      // Validar si cuenta está bloqueada
      if (user.locked_until && user.locked_until > new Date()) {
        return res.status(403).json({
          success: false,
          error: 'Cuenta bloqueada temporalmente. Intenta más tarde.',
          code: 'ACCOUNT_LOCKED'
        });
      }
      
      // Validar contraseña
      const validPassword = await user.validatePassword(password);
      if (!validPassword) {
        user.failed_login_attempts += 1;
        
        // Bloquear después de 5 intentos
        if (user.failed_login_attempts >= 5) {
          user.locked_until = new Date(Date.now() + 30 * 60 * 1000); // 30 min
        }
        
        await user.save();
        
        return res.status(401).json({
          success: false,
          error: 'Email o contraseña incorrectos',
          code: 'INVALID_CREDENTIALS'
        });
      }
      
      // Reset intentos fallidos
      user.failed_login_attempts = 0;
      user.last_login = new Date();
      await user.save();
      
      // Generar tokens
      const { accessToken, refreshToken } = generateTokens(
        user.id,
        user.email,
        user.role_id
      );
      
      // Guardar sesión
      await sequelize.models.UserSession.create({
        user_id: user.id,
        token_hash: crypto.createHash('sha256').update(accessToken).digest('hex'),
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
      });
      
      // Log de actividad
      await sequelize.models.UserActivityLog.create({
        user_id: user.id,
        action: 'login',
        ip_address: req.ip
      });
      
      res.json({
        success: true,
        user: user.toJSON(),
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 900 // 15 minutos en segundos
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  async passwordResetRequest(req, res, next) {
    try {
      const { email } = req.body;
      
      const user = await User.findOne({ where: { email } });
      if (!user) {
        // No revelar si email existe
        return res.json({
          success: true,
          message: 'Si el email existe, recibirás instrucciones'
        });
      }
      
      // Generar token único
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      
      // Guardar en BD con expiración
      await sequelize.models.PasswordReset.create({
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
        ip_address: req.ip
      });
      
      // Enviar email
      await EmailService.sendPasswordReset(user, resetToken);
      
      res.json({
        success: true,
        message: 'Revisa tu email para resetear tu contraseña'
      });
    } catch (error) {
      next(error);
    }
  }
  
  async passwordResetConfirm(req, res, next) {
    try {
      const { token, new_password } = req.body;
      
      // Hash el token recibido
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      
      // Buscar registro válido
      const resetRecord = await sequelize.models.PasswordReset.findOne({
        where: {
          token_hash: tokenHash,
          used_at: null,
          expires_at: { [sequelize.Sequelize.Op.gt]: new Date() }
        }
      });
      
      if (!resetRecord) {
        return res.status(400).json({
          success: false,
          error: 'Token inválido o expirado',
          code: 'INVALID_RESET_TOKEN'
        });
      }
      
      // Obtener usuario
      const user = await User.findByPk(resetRecord.user_id);
      
      // Cambiar contraseña
      await user.setPassword(new_password);
      await user.save();
      
      // Marcar token como usado
      resetRecord.used_at = new Date();
      await resetRecord.save();
      
      // Enviar email de confirmación
      await EmailService.sendPasswordResetConfirmed(user);
      
      res.json({
        success: true,
        message: 'Contraseña actualizada correctamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
```

### Rutas

```javascript
// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate, Joi } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth.middleware');

// Validadores
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  phone: Joi.string().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Rutas públicas
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/password-reset/request', authController.passwordResetRequest);
router.post('/password-reset/confirm', authController.passwordResetConfirm);

// Rutas protegidas
router.post('/logout', authenticateToken, authController.logout);
router.post('/refresh', authController.refresh);

module.exports = router;
```

---

## 🔄 FLUJOS COMPLETOS

### 1. Flujo de Registro

```
┌─────────────────────────────────────────────────────────┐
│ 1. FLUTTER: Usuario rellena formulario de registro      │
│    ├─ email: usuario@example.com                        │
│    ├─ password: SecurePass123!                          │
│    ├─ first_name: Juan                                  │
│    └─ last_name: García                                 │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│ 2. VALIDACIÓN CLIENTE                                   │
│    ├─ Email válido                                      │
│    ├─ Password >= 8 caracteres                          │
│    └─ Campos requeridos presentes                       │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│ 3. POST /api/auth/register                              │
│    ├─ Headers: Content-Type: application/json           │
│    └─ Body: { email, password, first_name, last_name }  │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│ 4. SERVIDOR: authController.register()                  │
│    ├─ Validar email no existe                           │
│    ├─ Crear usuario en BD                               │
│    ├─ Hash contraseña con bcrypt                        │
│    ├─ Generar JWT + Refresh Token                       │
│    ├─ Guardar sesión en BD                              │
│    └─ Enviar email de bienvenida                        │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│ 5. EMAIL SERVICE                                        │
│    ├─ Cargar template welcome.html                      │
│    ├─ Reemplazar variables {{firstName}}                │
│    └─ Enviar con Nodemailer/SendGrid                    │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│ 6. RESPUESTA 201                                        │
│    {                                                     │
│      "success": true,                                    │
│      "user": { id, email, first_name, ... },            │
│      "tokens": {                                         │
│        "accessToken": "eyJhbGc...",                      │
│        "refreshToken": "eyJhbGc..."                      │
│      }                                                   │
│    }                                                     │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│ 7. FLUTTER: Guardar tokens en storage                   │
│    ├─ Guardar accessToken en SharedPreferences          │
│    ├─ Guardar refreshToken de forma segura              │
│    ├─ Navegar a home                                    │
│    └─ Mostrar splash de bienvenida                      │
└─────────────────────────────────────────────────────────┘
```

### 2. Flujo de Compra Completo

```
┌─────────────────────────────────────────────────────────┐
│ 1. EXPLORACIÓN                                          │
│    ├─ GET /api/products (listar)                        │
│    ├─ GET /api/products/:id (detalle)                   │
│    └─ Filtros: categoria, precio, búsqueda              │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│ 2. CARRITO                                              │
│    ├─ POST /api/cart (añadir producto)                  │
│    ├─ GET /api/cart (ver carrito)                       │
│    ├─ PATCH /api/cart/:id (actualizar cantidad)         │
│    └─ DELETE /api/cart/:id (remover)                    │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│ 3. CHECKOUT                                             │
│    ├─ GET /api/user/addresses (listar direcciones)      │
│    ├─ Seleccionar dirección de envío                    │
│    ├─ Seleccionar dirección de facturación (opcional)   │
│    └─ Aplicar cupón si existe                           │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│ 4. CREAR ORDEN                                          │
│    ├─ POST /api/orders                                  │
│    │  {                                                  │
│    │    "shipping_address_id": "uuid",                  │
│    │    "billing_address_id": "uuid",                   │
│    │    "coupon_code": "VERANO2024"                     │
│    │  }                                                  │
│    └─ Server retorna: order con payment_intent_id       │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│ 5. PAGO STRIPE                                          │
│    ├─ Flutter abre Stripe Checkout                      │
│    ├─ Usuario ingresa tarjeta                           │
│    ├─ Stripe procesa pago                               │
│    └─ Stripe envía webhook a servidor                   │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│ 6. WEBHOOK STRIPE                                       │
│    ├─ POST /api/webhooks/stripe                         │
│    ├─ Verificar firma del webhook                       │
│    ├─ Actualizar order.payment_status = 'completed'     │
│    ├─ Actualizar order.status = 'confirmed'             │
│    ├─ Restar stock de products                          │
│    └─ Guardar log de transacción                        │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│ 7. EMAIL DE CONFIRMACIÓN                                │
│    ├─ EmailService.sendOrderConfirmation()              │
│    ├─ Template: orderConfirm.html                       │
│    ├─ Datos: orden, items, total, tracking              │
│    └─ Enviado a customer_email                          │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│ 8. ADMIN NOTIFICATION                                   │
│    ├─ Crear notificación en dashboard                   │
│    ├─ Email a admin: nueva_orden@...                    │
│    └─ Orden disponible en panel admin                   │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│ 9. FLUTTER: Poll orden                                  │
│    ├─ GET /api/orders/{order_id} cada 10 seg            │
│    ├─ Mostrar estado: "confirmada", "en proceso"        │
│    └─ Cuando status=shipped, enviar notificación push   │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│ 10. ENVÍO                                               │
│    ├─ Admin actualiza: PUT /api/admin/orders/:id/status │
│    ├─ Genera etiqueta de envío                          │
│    ├─ Actualiza tracking_number                         │
│    └─ Servidor envía email con tracking                 │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│ 11. ENTREGA                                             │
│    ├─ Carrier actualiza tracking                        │
│    ├─ Admin marca como entregado                        │
│    ├─ Servidor envía email final                        │
│    └─ Flutter muestra orden completada                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔒 SEGURIDAD

### 1. Autenticación y Autorización

```javascript
// Validar JWT en cada request
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'No autorizado' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Validar roles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.roleId)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
  };
};

// Uso en rutas
router.put('/admin/users/:id',
  authenticateToken,
  requireRole(['admin']),
  adminController.updateUser
);
```

### 2. Hash de Contraseñas

```javascript
// Antes de guardar
const bcrypt = require('bcryptjs');

user.password = await bcrypt.hash(password, 10);

// Al verificar
const isValid = await bcrypt.compare(inputPassword, user.password);
```

### 3. Validación y Sanitización

```javascript
const { validationResult } = require('express-validator');
const { body } = require('express-validator');

const validateRegister = [
  body('email').isEmail().trim().toLowerCase(),
  body('password').isLength({ min: 8 }),
  body('first_name').trim().notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

router.post('/register', validateRegister, authController.register);
```

### 4. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

// Límite para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: 'Demasiados intentos de login',
  skip: (req) => req.user // No limitar si autenticado
});

router.post('/login', loginLimiter, authController.login);

// Límite general para API
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100
});

app.use('/api/', apiLimiter);
```

### 5. CORS

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.FLUTTER_APP_URLS.split(','),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 6. Headers de Seguridad

```javascript
const helmet = require('helmet');

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"]
  }
}));
```

### 7. Protección contra inyecciones

```javascript
// SQL Injection: Usar ORM (Sequelize)
// NUNCA: User.findAll({ where: `email = '${email}'` })
// SÍ:    User.findOne({ where: { email } })

// NoSQL Injection: Sanitizar entrada
const mongoSanitize = require('mongo-sanitize');
app.use(mongoSanitize());

// XSS: Usar expresiones validadas
const xss = require('xss-clean');
app.use(xss());
```

---

## 📱 INTEGRACIÓN CON FLUTTER

### Clase HTTP Client en Flutter

```dart
// lib/services/api_client.dart
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class ApiClient {
  static const String BASE_URL = 'https://api.tiendaropa.com/api';
  
  final http.Client _httpClient = http.Client();
  late SharedPreferences _prefs;
  
  String? _accessToken;
  String? _refreshToken;
  
  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    _accessToken = _prefs.getString('accessToken');
    _refreshToken = _prefs.getString('refreshToken');
  }
  
  // GET request
  Future<Map<String, dynamic>> get(String endpoint) async {
    return _request('GET', endpoint);
  }
  
  // POST request
  Future<Map<String, dynamic>> post(
    String endpoint, {
    required Map<String, dynamic> body,
  }) async {
    return _request('POST', endpoint, body: body);
  }
  
  // PUT request
  Future<Map<String, dynamic>> put(
    String endpoint, {
    required Map<String, dynamic> body,
  }) async {
    return _request('PUT', endpoint, body: body);
  }
  
  // DELETE request
  Future<Map<String, dynamic>> delete(String endpoint) async {
    return _request('DELETE', endpoint);
  }
  
  // Request genérico
  Future<Map<String, dynamic>> _request(
    String method,
    String endpoint, {
    Map<String, dynamic>? body,
  }) async {
    try {
      final url = Uri.parse('$BASE_URL$endpoint');
      
      // Headers por defecto
      final headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      // Añadir token si existe
      if (_accessToken != null) {
        headers['Authorization'] = 'Bearer $_accessToken';
      }
      
      // Realizar request
      http.Response response;
      switch (method) {
        case 'GET':
          response = await _httpClient.get(url, headers: headers);
          break;
        case 'POST':
          response = await _httpClient.post(
            url,
            headers: headers,
            body: jsonEncode(body),
          );
          break;
        case 'PUT':
          response = await _httpClient.put(
            url,
            headers: headers,
            body: jsonEncode(body),
          );
          break;
        case 'DELETE':
          response = await _httpClient.delete(url, headers: headers);
          break;
        default:
          throw Exception('Método HTTP no soportado');
      }
      
      // Manejar respuesta
      if (response.statusCode == 401) {
        // Token expirado, intentar renovar
        await _refreshAccessToken();
        // Reintentar request
        return _request(method, endpoint, body: body);
      }
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return jsonDecode(response.body);
      } else {
        throw ApiException(
          statusCode: response.statusCode,
          message: jsonDecode(response.body)['error'] ?? 'Error desconocido',
        );
      }
    } catch (e) {
      rethrow;
    }
  }
  
  // Renovar token
  Future<void> _refreshAccessToken() async {
    if (_refreshToken == null) {
      throw Exception('No refresh token available');
    }
    
    try {
      final response = await _httpClient.post(
        Uri.parse('$BASE_URL/auth/refresh'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'refreshToken': _refreshToken}),
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _accessToken = data['accessToken'];
        
        // Guardar nuevo token
        await _prefs.setString('accessToken', _accessToken!);
      } else {
        throw Exception('No se pudo renovar token');
      }
    } catch (e) {
      // Logout si falla
      await logout();
      rethrow;
    }
  }
  
  // Guardar tokens tras login
  Future<void> saveTokens(String accessToken, String refreshToken) async {
    _accessToken = accessToken;
    _refreshToken = refreshToken;
    
    await _prefs.setString('accessToken', accessToken);
    await _prefs.setString('refreshToken', refreshToken);
  }
  
  // Logout
  Future<void> logout() async {
    _accessToken = null;
    _refreshToken = null;
    
    await _prefs.remove('accessToken');
    await _prefs.remove('refreshToken');
  }
}

class ApiException implements Exception {
  final int statusCode;
  final String message;
  
  ApiException({
    required this.statusCode,
    required this.message,
  });
  
  @override
  String toString() => 'ApiException($statusCode): $message';
}
```

### Servicio de Autenticación en Flutter

```dart
// lib/services/auth_service.dart
import 'package:flutter/foundation.dart';
import 'api_client.dart';

class AuthService extends ChangeNotifier {
  final ApiClient _apiClient;
  
  String? _userId;
  String? _email;
  String? _userName;
  bool _isAuthenticated = false;
  
  AuthService(this._apiClient);
  
  bool get isAuthenticated => _isAuthenticated;
  String? get userId => _userId;
  String? get email => _email;
  
  // Registrarse
  Future<void> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
  }) async {
    try {
      final response = await _apiClient.post(
        '/auth/register',
        body: {
          'email': email,
          'password': password,
          'first_name': firstName,
          'last_name': lastName,
        },
      );
      
      if (response['success']) {
        final tokens = response['tokens'];
        await _apiClient.saveTokens(
          tokens['accessToken'],
          tokens['refreshToken'],
        );
        
        _userId = response['user']['id'];
        _email = response['user']['email'];
        _userName = response['user']['first_name'];
        _isAuthenticated = true;
        notifyListeners();
      }
    } catch (e) {
      rethrow;
    }
  }
  
  // Login
  Future<void> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _apiClient.post(
        '/auth/login',
        body: {
          'email': email,
          'password': password,
        },
      );
      
      if (response['success']) {
        final tokens = response['tokens'];
        await _apiClient.saveTokens(
          tokens['accessToken'],
          tokens['refreshToken'],
        );
        
        _userId = response['user']['id'];
        _email = response['user']['email'];
        _userName = response['user']['first_name'];
        _isAuthenticated = true;
        notifyListeners();
      }
    } catch (e) {
      rethrow;
    }
  }
  
  // Logout
  Future<void> logout() async {
    await _apiClient.logout();
    _userId = null;
    _email = null;
    _userName = null;
    _isAuthenticated = false;
    notifyListeners();
  }
}
```

### Ejemplo de llamada HTTP

```dart
// lib/screens/products_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_client.dart';

class ProductsScreen extends StatefulWidget {
  @override
  _ProductsScreenState createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  late ApiClient _apiClient;
  List<dynamic> products = [];
  bool loading = true;
  String? error;
  
  @override
  void initState() {
    super.initState();
    _apiClient = context.read<ApiClient>();
    _loadProducts();
  }
  
  Future<void> _loadProducts() async {
    try {
      setState(() {
        loading = true;
        error = null;
      });
      
      final response = await _apiClient.get(
        '/products?page=1&limit=20&category=camisetas'
      );
      
      setState(() {
        products = response['data']['products'];
        loading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        loading = false;
      });
    }
  }
  
  @override
  Widget build(BuildContext context) {
    if (loading) {
      return Scaffold(
        appBar: AppBar(title: Text('Productos')),
        body: Center(child: CircularProgressIndicator()),
      );
    }
    
    if (error != null) {
      return Scaffold(
        appBar: AppBar(title: Text('Productos')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('Error: $error'),
              SizedBox(height: 16),
              ElevatedButton(
                onPressed: _loadProducts,
                child: Text('Reintentar'),
              ),
            ],
          ),
        ),
      );
    }
    
    return Scaffold(
      appBar: AppBar(title: Text('Productos')),
      body: ListView.builder(
        itemCount: products.length,
        itemBuilder: (context, index) {
          final product = products[index];
          return ListTile(
            title: Text(product['name']),
            subtitle: Text('€${product['price']}'),
            leading: Image.network(product['image_url']),
          );
        },
      ),
    );
  }
}
```

---

## 📊 ESCALABILIDAD

### Caché con Redis

```javascript
// config/redis.js
const redis = require('redis');

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
});

// Caché de productos
async function getCachedProduct(productId) {
  const cached = await client.get(`product:${productId}`);
  if (cached) return JSON.parse(cached);
  
  const product = await Product.findByPk(productId);
  await client.setex(`product:${productId}`, 3600, JSON.stringify(product)); // 1 hora
  return product;
}

// Invalidar caché
async function invalidateProductCache(productId) {
  await client.del(`product:${productId}`);
  await client.del(`products:list`);
}
```

### Base de datos: Índices

```sql
-- Índices críticos
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_cart_items_user ON cart_items(user_id);

-- Índices de búsqueda
CREATE FULLTEXT INDEX ft_products_search ON products(name, description);
```

### CDN para imágenes

```javascript
// En productController.js
const imageUrl = `https://cdn.cloudinary.com/.../${product.image_key}`;

// En Flutter
Image.network(
  imageUrl,
  cacheHeight: 300,
  cacheWidth: 300,
  fit: BoxFit.cover,
)
```

### Paginación eficiente

```javascript
// Usar cursor-based pagination
GET /api/products?cursor=abc123&limit=20

const products = await Product.findAll({
  where: { id: { [Op.gt]: cursor } },
  limit: 21,
  order: [['id', 'ASC']]
});
```

---

## 🚀 CONSIDERACIONES FUTURAS

### Notificaciones Push

```javascript
// Usar Firebase Cloud Messaging
const admin = require('firebase-admin');

async function sendPushNotification(userId, title, body) {
  const token = await getUserFCMToken(userId);
  
  await admin.messaging().send({
    token: token,
    notification: { title, body },
    data: { orderId: orderId }
  });
}
```

### Pasarela de Pagos

```javascript
// Integración Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createPaymentIntent(amount) {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'eur'
  });
}
```

### Analytics

```javascript
// Mixpanel o Segment
const analytics = require('analytics');

analytics.track({
  userId: user.id,
  event: 'purchase_completed',
  properties: {
    orderId: order.id,
    total: order.total_amount
  }
});
```

---

## ✅ CHECKLIST DE DEPLOYMENT

- [ ] Variables de entorno configuradas (.env)
- [ ] Base de datos migrada y seeded
- [ ] Tests unitarios e integración pasando
- [ ] Documentación API completa (Swagger/OpenAPI)
- [ ] SSL/TLS configurado (HTTPS)
- [ ] CORS configurado para dominio Flutter
- [ ] Rate limiting y validación activos
- [ ] Logs y monitoreo en lugar
- [ ] Backup automático de BD
- [ ] CDN configurado para imágenes
- [ ] Emails transaccionales funcionando
- [ ] Pagos en modo producción
- [ ] Alertas de errores configuradas
- [ ] Health check endpoint implementado

---

**Documento completo para arquitectura profesional de backend.**  
**Próximas actualizaciones: GraphQL, WebSockets, Machine Learning**
