# 📊 GUÍA COMPLETA: CONTROL DE PRECIOS Y STOCK PARA FLUTTER

**Versión:** 1.0  
**Fecha:** 3 de febrero de 2026  
**Autor:** CRM Tienda Ropa  
**Objetivo:** Explicar cómo funciona el sistema de precios y stock para integración en app Flutter

---

## 📑 TABLA DE CONTENIDOS

1. [Arquitectura General](#arquitectura-general)
2. [Control de Precios](#control-de-precios)
3. [Control de Stock](#control-de-stock)
4. [Flujo de Compra](#flujo-de-compra)
5. [APIs y Endpoints](#apis-y-endpoints)
6. [Modelo de Datos](#modelo-de-datos)
7. [Ejemplos de Implementación](#ejemplos-de-implementación)
8. [Manejo de Errores](#manejo-de-errores)
9. [Validaciones](#validaciones)
10. [Mejores Prácticas](#mejores-prácticas)

---

## 🏗 ARQUITECTURA GENERAL

### Estructura de Capas

```
┌─────────────────────────────────────────────────────────┐
│                   APP FLUTTER                           │
│  (Presentación: UI, carrito, checkout)                  │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              API REST / SUPABASE                         │
│  (Lógica de negocio, validaciones, cálculos)            │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│          BASE DE DATOS (PostgreSQL)                     │
│  (Almacenamiento de productos, variantes, órdenes)      │
└─────────────────────────────────────────────────────────┘
```

### Componentes Clave

1. **Productos Base** → Información general (nombre, descripción, categoría)
2. **Variantes** → Combinaciones de talla/color con stock individual
3. **Precios** → Control en dos niveles (base + modificador por variante)
4. **Stock** → Gestión atómica para evitar sobreventa
5. **Órdenes** → Registro de compras con snapshots de precios

---

## 💰 CONTROL DE PRECIOS

### 1. Estructura de Precios

El sistema maneja **precios en dos niveles**:

#### a) Nivel Producto Base
```json
{
  "id": "uuid-producto",
  "name": "Camiseta básica",
  "price": 49.99,                    // Precio base en EUR
  "compare_at_price": 79.99,         // Precio original (tachado)
  "discount_percentage": 37,         // Descuento % calculado
  "cost_price": 15.00,               // Costo (solo admin)
  "is_flash_offer": false,           // ¿En oferta flash?
  "flash_offer_ends": "2026-02-28"   // Fin de oferta
}
```

**Fórmula de descuento:**
```
discount_percentage = ((compare_at_price - price) / compare_at_price) * 100
precio_final = price * (1 - discount_percentage/100)
```

#### b) Nivel Variante
```json
{
  "id": "uuid-variante",
  "product_id": "uuid-producto",
  "size": "M",
  "color": "Rojo",
  "color_hex": "#FF0000",
  "price_modifier": 5.00,      // Sumado al precio base (+5€)
  "stock": 15                   // Unidades disponibles
}
```

**Cálculo del precio final:**
```
precio_final = (price_base + price_modifier) * (1 - discount_percentage/100)
Ejemplo:
- precio_base = 49.99
- price_modifier = 5.00
- discount_percentage = 37
- precio_final = (49.99 + 5.00) * (1 - 0.37) = 34.69 EUR
```

### 2. Tipos de Precios

| Tipo | Descripción | Cuándo Usar | Ejemplo |
|------|-------------|------------|---------|
| **price** | Precio actual de venta | Siempre mostrar | 49.99 € |
| **compare_at_price** | Precio original/recomendado | Mostrar tachado | ~~79.99€~~ |
| **price_modifier** | Ajuste por variante | Para tallas/colores especiales | +5€ para talla XL |
| **cost_price** | Precio de compra (admin) | Cálculo de margen | 15.00 € |
| **discount_percentage** | Descuento aplicado | Mostrar ahorro | -37% |

### 3. Cálculo de Descuentos

**Automático basado en compare_at_price:**
```typescript
// En el frontend
function calculateDiscount(price: number, compareAtPrice?: number): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

// Uso
const discount = calculateDiscount(49.99, 79.99); // 37%
const savings = compareAtPrice - price; // 30€ ahorrados
```

### 4. Aplicación de Cupones

Los cupones se aplican **después de todos los descuentos**:

```
Flujo de cálculo:
1. Subtotal = Sum(precio_variante * cantidad)
2. Descuentos por producto = Subtotal * discount_percentage/100
3. Subtotal después descuentos = Subtotal - Descuentos
4. Cupón = Subtotal_descuentos * coupon_discount/100 (si es %)
5. Total impuesto = Subtotal_final + tax
6. Envío = calculado según reglas
7. TOTAL = Subtotal_final + Tax + Envío - Cupón
```

### 5. Reglas de Precios a Implementar

✅ **Validaciones obligatorias:**

```typescript
// Validar rango de precios
if (price < 0 || price > 99999.99) throw Error("Precio fuera de rango");

// Validar compare_at_price
if (compareAtPrice && compareAtPrice < price) {
  console.warn("compare_at_price debe ser mayor a price");
}

// Validar descuento
if (discountPercentage < 0 || discountPercentage > 100) {
  throw Error("Descuento debe estar entre 0-100%");
}

// Validar modificador de variante
if (Math.abs(priceModifier) > 1000) {
  console.warn("Modificador muy alto");
}
```

### 6. Sincronización con Stripe

Los precios se envían a **Stripe en céntimos**:

```typescript
// Convertir a céntimos para Stripe
const stripePriceInCents = Math.round(priceInEuros * 100);

// Ejemplo
const price = 49.99;
const stripeCents = Math.round(49.99 * 100); // 4999 céntimos
```

**Importante:** Stripe mantiene su propia base de datos de precios. Cuando se actualiza un precio en Supabase:
1. Se actualiza el `Stripe Price ID`
2. Se notifica al webhook de Stripe
3. Se sincroniza periódicamente mediante `scripts/sync-stripe-prices.ts`

---

## 📦 CONTROL DE STOCK

### 1. Estructura de Stock

El stock se gestiona a nivel de **variante** (no en producto):

```json
{
  "id": "uuid-variante",
  "product_id": "uuid-producto",
  "size": "M",
  "color": "Rojo",
  "stock": 15,              // Stock disponible para venta
  "reserved_stock": 3,      // Stock reservado en carritos
  "available_stock": 12     // stock - reserved_stock
}
```

**Fórmula de disponibilidad:**
```
available_stock = stock - reserved_stock
```

### 2. Estados del Stock

```
STOCK DISPONIBLE (> 0)
├─ En venta normal
└─ Mostrar número exacto o "Disponible"

STOCK BAJO (> 0 pero < 5)
├─ Mostrar alerta "Solo X unidades disponibles"
└─ Prioridad en admin dashboard

STOCK AGOTADO (= 0)
├─ Botón "Agotar existencias" deshabilitado
├─ Mostrar "Notificarme cuando esté disponible"
└─ No permitir añadir al carrito

STOCK NO RASTREADO (NULL)
└─ Para productos sin control de stock
```

### 3. Funciones de Stock Atómicas

El sistema usa **funciones SQL con bloqueos** para evitar condiciones de carrera:

#### a) `decrease_stock(variant_id, quantity)`
Descuenta stock al procesar un pago exitoso.

```sql
-- Uso: SELECT decrease_stock('uuid-variante', 2);
-- Retorna: TRUE si fue exitoso, ERROR si no hay stock

Pasos internos:
1. Bloquea el registro de variante (FOR UPDATE)
2. Verifica stock disponible >= cantidad solicitada
3. Reduce stock atómicamente
4. Desbloquea el registro
5. Lanza excepción si no hay stock suficiente
```

**Desde Flutter:**
```typescript
// Realizar la compra después del pago
final result = await supabaseClient
    .rpc('decrease_stock', params: {
      'p_variant_id': variantId,
      'p_quantity': quantity
    });

if (result == true) {
  // Stock actualizado exitosamente
  print('Compra procesada');
} else {
  // Manejar error - probablemente stock insuficiente
  print('Error al actualizar stock');
}
```

#### b) `increase_stock(variant_id, quantity)`
Restaura stock en devoluciones o cancelaciones.

```typescript
// Al procesar una devolución
final result = await supabaseClient
    .rpc('increase_stock', params: {
      'p_variant_id': variantId,
      'p_quantity': quantity
    });
```

#### c) `check_stock_availability(variant_id, quantity)`
Verifica si hay stock suficiente **sin modificarlo**.

```typescript
// Validar antes de procesar pago
final isAvailable = await supabaseClient
    .rpc('check_stock_availability', params: {
      'p_variant_id': variantId,
      'p_quantity': quantity
    });

if (!isAvailable) {
  showError('Stock insuficiente. Actualizar carrito.');
}
```

#### d) `reserve_stock(variant_id, quantity, minutes?)`
Reserva stock temporalmente para carrito (válido 15 min).

```typescript
// Al añadir al carrito
final reservationId = await supabaseClient
    .rpc('reserve_stock', params: {
      'p_variant_id': variantId,
      'p_quantity': quantity,
      'p_reservation_minutes': 15  // Opcional, defecto 15
    });

// Cuando se completa la compra, la reserva se convierte en venta
// Cuando se abandona el carrito, la reserva expira
```

### 4. Ciclo de Vida del Stock

```
PRODUCTO AÑADIDO AL CARRITO
        ↓
   reserve_stock()
   (stock no cambia, pero se marca como reservado)
        ↓
USUARIO PROCESA PAGO
        ↓
   Pago exitoso en Stripe (webhook)
        ↓
   decrease_stock() - Decrementa stock real
   release_stock_reservation() - Libera la reserva
        ↓
STOCK ACTUALIZADO EN BD

---

USUARIO CANCELA COMPRA
        ↓
   release_stock_reservation() - Stock vuelve a estar disponible
        ↓
STOCK VUELVE AL ORIGINAL

---

USUARIO DEVUELVE PRODUCTO
        ↓
   increase_stock() - Incrementa stock
        ↓
STOCK RESTAURADO
```

### 5. Sincronización de Stock

El stock se sincroniza en **tiempo real**:

```
┌──────────────────────────────────────────┐
│   Usuario A ve: 5 unidades disponibles   │
└──────────────────┬───────────────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │ Usuario A reserva 2 │
         │  reserved = 2       │
         │ available = 3       │
         └─────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────┐
│ Usuario B ve: 3 unidades disponibles     │
└──────────────────────────────────────────┘
```

### 6. Casos Especiales

#### a) Stock Insuficiente en Carrito
```typescript
// Validación en carrito
final cartItems = await getCartItems();
for (var item in cartItems) {
  final available = item.variant.stock - item.variant.reserved_stock;
  if (item.quantity > available) {
    // Reducir cantidad automáticamente
    await updateCartItemQuantity(item.id, available);
    showWarning('Stock actualizado a ${available} unidades');
  }
}
```

#### b) Producto Agotado Mientras Está en Carrito
```typescript
// Antes de procesar pago
final availability = await checkAllCartItemsAvailability();
if (!availability.allAvailable) {
  showError('Algunos productos se agotaron');
  // Remover productos sin stock del carrito
  await removeOutOfStockItems();
}
```

#### c) Reserva Expirada
```sql
-- Limpieza automática (ejecutada cada 30 minutos)
SELECT cleanup_expired_reservations();

-- Qué hace:
-- 1. Busca reservas con expires_at < NOW()
-- 2. Libera el stock reservado
-- 3. Elimina la reserva expirada
```

### 7. Alertas de Stock Bajo

El dashboard admin muestra:
- Productos con stock < 5 unidades
- Variantes sin stock
- Historial de movimientos de stock

```typescript
// En Flutter - mostrar indicador visual
Widget buildStockIndicator(int stock) {
  if (stock == 0) {
    return Text('Agotado', style: TextStyle(color: Colors.red));
  } else if (stock < 5) {
    return Text('¡Solo $stock disponibles!', 
        style: TextStyle(color: Colors.orange));
  } else {
    return Text('En stock', 
        style: TextStyle(color: Colors.green));
  }
}
```

---

## 🛒 FLUJO DE COMPRA

### Fase 1: Exploración
```
1. Usuario navega productos
   ↓
2. Obtiene lista con:
   - Precio base + descuento
   - Stock disponible por variante
   - Imágenes, descripción
   ↓
3. Filtra por precio: min-max
4. Selecciona color/talla
```

**Endpoint:**
```
GET /api/productos?categoria=camisetas&min_price=20&max_price=100
```

### Fase 2: Carrito
```
1. Usuario añade variante al carrito
   ↓
2. Sistema valida:
   - Variante existe
   - Stock disponible > 0
   - Cantidad < 999
   ↓
3. Llama reserve_stock()
   ↓
4. Muestra en carrito:
   - Nombre variante
   - Precio actual
   - Cantidad
   - Subtotal (precio * cantidad)
```

**Endpoint:**
```
POST /api/carrito
{
  "variant_id": "uuid",
  "quantity": 2
}

Respuesta:
{
  "success": true,
  "item": {
    "id": "uuid",
    "variant": {...},
    "quantity": 2,
    "price": 49.99,
    "subtotal": 99.98
  }
}
```

### Fase 3: Checkout
```
1. Usuario revisa carrito
   ↓
2. Valida stock nuevamente
   CHECK → decrease_stock() fallará si hay problema
   ↓
3. Aplica cupón (si tiene)
   - Valida que cupón sea válido
   - Calcula descuento
   ↓
4. Calcula totales:
   - Subtotal (sum de items)
   - Impuestos (IVA 21%)
   - Envío (según destino)
   - Total = Subtotal + Impuestos + Envío - Cupón
   ↓
5. Procesa pago con Stripe
```

**Endpoint:**
```
POST /api/checkout
{
  "items": [
    {"variant_id": "uuid", "quantity": 2},
    {"variant_id": "uuid2", "quantity": 1}
  ],
  "coupon": "VERANO2024",
  "shipping_address": {...},
  "billing_address": {...}
}

Respuesta:
{
  "order_id": "uuid",
  "stripe_session_id": "sess_...",
  "total": 150.25
}
```

### Fase 4: Pago
```
1. Usuario redirigido a Stripe Checkout
   ↓
2. Realiza pago
   ↓
3. Stripe envía webhook de confirmación
   ↓
4. Servidor ejecuta:
   a) decrease_stock() para cada item
   b) Registra la orden
   c) Envía confirmación por email
   d) Crea notificación en admin
```

**Webhook:**
```
POST /api/webhooks/stripe
{
  "type": "charge.succeeded",
  "data": {
    "object": {
      "amount": 15025,
      "currency": "eur",
      "metadata": {
        "order_id": "uuid",
        "items": [...]
      }
    }
  }
}
```

### Fase 5: Post-Compra
```
1. Cliente recibe email de confirmación
   - Número de orden
   - Items comprados (con precios)
   - Total pagado
   - Link a seguimiento
   ↓
2. Admin ve nueva orden en dashboard
   ↓
3. Usuario puede ver orden en "Mis Compras"
   - Historial de pedidos
   - Estados de envío
   - Opción de devolución
```

---

## 🔌 APIs Y ENDPOINTS

### 1. Obtener Productos

```bash
GET /api/productos
GET /api/productos?categoria=camisetas
GET /api/productos?min_price=20&max_price=100
GET /api/productos?search=rojo&sort=precio
```

**Respuesta:**
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Camiseta básica",
      "slug": "camiseta-basica",
      "description": "...",
      "price": 49.99,
      "compare_at_price": 79.99,
      "discount_percentage": 37,
      "image_url": "...",
      "images": ["url1", "url2"],
      "category": {
        "id": "uuid",
        "name": "Camisetas"
      },
      "variants": [
        {
          "id": "uuid",
          "size": "XS",
          "color": "Rojo",
          "color_hex": "#FF0000",
          "stock": 15,
          "reserved_stock": 2,
          "available_stock": 13,
          "price_modifier": 0
        },
        {
          "id": "uuid",
          "size": "S",
          "color": "Rojo",
          "stock": 8,
          "reserved_stock": 1,
          "available_stock": 7,
          "price_modifier": 0
        }
      ],
      "is_new": true,
      "is_featured": false
    }
  ],
  "total": 245,
  "page": 1,
  "per_page": 20
}
```

### 2. Obtener Variantes de Producto

```bash
GET /api/productos/{product_id}/variantes
```

**Respuesta:**
```json
{
  "product_id": "uuid",
  "product_name": "Camiseta básica",
  "variants": [
    {
      "id": "uuid",
      "size": "M",
      "color": "Rojo",
      "color_hex": "#FF0000",
      "color_image": "url-imagen-rojo",
      "stock": 15,
      "reserved_stock": 2,
      "sku": "CAMI-001-M-RED",
      "barcode": "...",
      "price_modifier": 0
    }
  ]
}
```

### 3. Verificar Disponibilidad

```bash
POST /api/stock/check
{
  "variant_id": "uuid",
  "quantity": 2
}
```

**Respuesta:**
```json
{
  "available": true,
  "stock": 15,
  "reserved": 2,
  "can_purchase": 13,
  "message": "Stock disponible"
}

O en caso de error:

{
  "available": false,
  "stock": 0,
  "message": "Producto agotado"
}
```

### 4. Carrito

#### Añadir al carrito
```bash
POST /api/carrito
{
  "variant_id": "uuid",
  "quantity": 2
}
```

**Respuesta:**
```json
{
  "success": true,
  "item": {
    "id": "uuid",
    "variant_id": "uuid",
    "quantity": 2,
    "price": 49.99,
    "discount": 0.37,
    "final_price": 31.49,
    "subtotal": 62.98,
    "product": {
      "id": "uuid",
      "name": "Camiseta básica",
      "image": "..."
    },
    "variant": {
      "size": "M",
      "color": "Rojo"
    }
  }
}
```

#### Obtener carrito
```bash
GET /api/carrito
```

**Respuesta:**
```json
{
  "items": [
    {
      "id": "uuid",
      "variant_id": "uuid",
      "quantity": 2,
      "price": 49.99,
      "subtotal": 99.98,
      "product": {...},
      "variant": {...}
    }
  ],
  "subtotal": 199.96,
  "tax": 41.99,
  "shipping": 5.99,
  "discount": 0,
  "total": 247.94,
  "item_count": 2
}
```

#### Actualizar cantidad
```bash
PATCH /api/carrito/{item_id}
{
  "quantity": 3
}
```

#### Remover del carrito
```bash
DELETE /api/carrito/{item_id}
```

### 5. Órdenes

#### Crear orden (checkout)
```bash
POST /api/orders
{
  "items": [
    {
      "variant_id": "uuid",
      "quantity": 2,
      "price": 49.99
    }
  ],
  "coupon_code": "VERANO2024",
  "shipping_address": {
    "name": "Juan García",
    "email": "juan@example.com",
    "phone": "+34 600 123 456",
    "street": "Calle Principal 123",
    "city": "Madrid",
    "state": "Madrid",
    "postal_code": "28001",
    "country": "ES"
  },
  "billing_address": null  // O especificar si es diferente
}
```

**Respuesta:**
```json
{
  "order": {
    "id": "uuid",
    "order_number": "ORD-2026020301",
    "status": "pending_payment",
    "customer_email": "juan@example.com",
    "subtotal": 99.98,
    "tax": 20.99,
    "shipping": 5.99,
    "coupon_discount": 10.00,
    "total_amount": 116.96,
    "items": [...]
  },
  "stripe_session_id": "sess_...",
  "payment_url": "https://checkout.stripe.com/pay/sess_..."
}
```

#### Obtener orden
```bash
GET /api/orders/{order_id}
```

---

## 🗄 MODELO DE DATOS

### Tablas Principales

#### PRODUCTS
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  sku VARCHAR(100) UNIQUE,
  price DECIMAL(10,2) NOT NULL,         -- Precio en EUR
  compare_at_price DECIMAL(10,2),        -- Precio tachado
  discount_percentage INTEGER DEFAULT 0, -- Descuento %
  cost_price DECIMAL(10,2),              -- Para cálculo de margen
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  category_id UUID REFERENCES categories(id),
  brand VARCHAR(100),
  material VARCHAR(255),
  care_instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_flash_offer BOOLEAN DEFAULT false,
  flash_offer_ends TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### PRODUCT_VARIANTS
```sql
CREATE TABLE product_variants (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id),
  size VARCHAR(20) NOT NULL,
  color VARCHAR(50) NOT NULL,
  color_hex VARCHAR(7),
  color_image TEXT,
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  reserved_stock INTEGER DEFAULT 0,
  sku VARCHAR(100),
  barcode VARCHAR(100),
  weight DECIMAL(10,2),
  price_modifier DECIMAL(10,2) DEFAULT 0,  -- Sumado al precio base
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, size, color)
);
```

#### ORDERS
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  
  -- Direcciones
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  
  -- Montos
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Cupón
  coupon_id UUID REFERENCES coupons(id),
  coupon_code VARCHAR(50),
  
  -- Estado
  status VARCHAR(50) DEFAULT 'pending_payment',
  payment_method VARCHAR(50),
  stripe_charge_id VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);
```

#### ORDER_ITEMS
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id),
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID NOT NULL REFERENCES product_variants(id),
  quantity INTEGER NOT NULL,
  
  -- Precio al momento de la compra (snapshot)
  price_at_purchase DECIMAL(10,2) NOT NULL,
  discount_at_purchase INTEGER DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Totales
  subtotal DECIMAL(10,2) NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### COUPONS
```sql
CREATE TABLE coupons (
  id UUID PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_purchase DECIMAL(10,2) DEFAULT 0,
  max_discount DECIMAL(10,2),
  max_uses INTEGER,
  max_uses_per_customer INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  applicable_categories UUID[],
  applicable_products UUID[],
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 💻 EJEMPLOS DE IMPLEMENTACIÓN

### Flutter - Obtener Productos con Stock y Precios

```dart
import 'package:supabase_flutter/supabase_flutter.dart';

class ProductService {
  final SupabaseClient supabase;
  
  ProductService(this.supabase);
  
  // Obtener productos con variantes
  Future<List<Product>> getProducts({
    String? category,
    double? minPrice,
    double? maxPrice,
  }) async {
    var query = supabase
        .from('products')
        .select('''
          *,
          category:category_id(*),
          variants:product_variants(*)
        ''')
        .eq('is_active', true);
    
    if (category != null) {
      query = query.eq('category.slug', category);
    }
    
    final data = await query;
    
    // Convertir a modelos
    return (data as List).map((p) => Product.fromJson(p)).toList();
  }
  
  // Obtener variantes de un producto
  Future<List<Variant>> getVariants(String productId) async {
    final data = await supabase
        .from('product_variants')
        .select()
        .eq('product_id', productId)
        .eq('is_active', true);
    
    return (data as List).map((v) => Variant.fromJson(v)).toList();
  }
  
  // Verificar disponibilidad
  Future<bool> checkStock(String variantId, int quantity) async {
    final result = await supabase.rpc(
      'check_stock_availability',
      params: {
        'p_variant_id': variantId,
        'p_quantity': quantity,
      },
    );
    
    return result as bool;
  }
}
```

### Flutter - Carrito

```dart
class CartService {
  final SupabaseClient supabase;
  
  CartService(this.supabase);
  
  // Añadir al carrito
  Future<void> addToCart(String variantId, int quantity) async {
    // 1. Verificar stock
    final available = await checkStock(variantId, quantity);
    if (!available) {
      throw Exception('Stock insuficiente');
    }
    
    // 2. Reservar stock
    final reservationId = await supabase.rpc(
      'reserve_stock',
      params: {
        'p_variant_id': variantId,
        'p_quantity': quantity,
        'p_reservation_minutes': 15,
      },
    );
    
    if (reservationId == null) {
      throw Exception('No se pudo reservar el stock');
    }
    
    // 3. Guardar en carrito local o base de datos
    final cartItem = CartItem(
      variantId: variantId,
      quantity: quantity,
      reservationId: reservationId,
      addedAt: DateTime.now(),
    );
    
    await _saveCartItem(cartItem);
  }
  
  // Obtener carrito
  Future<Cart> getCart() async {
    final items = await _getCartItems();
    
    double subtotal = 0;
    double discount = 0;
    
    // Calcular totales
    for (var item in items) {
      final price = item.variant.price + (item.variant.priceModifier ?? 0);
      final finalPrice = price * (1 - item.product.discountPercentage / 100);
      
      item.price = finalPrice;
      item.subtotal = finalPrice * item.quantity;
      
      subtotal += item.subtotal;
      discount += (price - finalPrice) * item.quantity;
    }
    
    // Calcular impuestos y envío
    final tax = subtotal * 0.21; // 21% IVA
    final shipping = subtotal > 100 ? 0 : 5.99;
    final total = subtotal + tax + shipping - discount;
    
    return Cart(
      items: items,
      subtotal: subtotal,
      discount: discount,
      tax: tax,
      shipping: shipping,
      total: total,
    );
  }
  
  // Procesar checkout
  Future<Order> checkout({
    required String customerName,
    required String customerEmail,
    required String customerPhone,
    required Address shippingAddress,
    Address? billingAddress,
    String? couponCode,
  }) async {
    final cart = await getCart();
    
    // Validar stock nuevamente antes de pago
    for (var item in cart.items) {
      final available = await checkStock(item.variantId, item.quantity);
      if (!available) {
        throw Exception('Stock de ${item.product.name} cambió');
      }
    }
    
    // Crear orden en backend
    final response = await http.post(
      Uri.parse('https://api.tiendaropa.com/orders'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'items': cart.items.map((i) => {
          'variant_id': i.variantId,
          'quantity': i.quantity,
          'price': i.price,
        }).toList(),
        'customer_name': customerName,
        'customer_email': customerEmail,
        'customer_phone': customerPhone,
        'shipping_address': shippingAddress.toJson(),
        'billing_address': billingAddress?.toJson(),
        'coupon_code': couponCode,
      }),
    );
    
    if (response.statusCode != 200) {
      throw Exception('Error al crear orden');
    }
    
    final data = jsonDecode(response.body);
    
    return Order.fromJson(data['order']);
  }
}
```

### Flutter - Mostrar Precios

```dart
class ProductCard extends StatelessWidget {
  final Product product;
  
  const ProductCard({required this.product});
  
  @override
  Widget build(BuildContext context) {
    // Calcular descuento
    final discount = product.discountPercentage;
    final hasDiscount = product.compareAtPrice != null && 
                       product.compareAtPrice! > product.price;
    
    // Calcular precio con variante
    final basePrice = product.price;
    final priceModifier = 0.0; // Implementar selección de variante
    final finalPrice = (basePrice + priceModifier) * 
                      (1 - discount / 100);
    
    return Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Imagen
          Image.network(product.imageUrl),
          
          // Nombre
          Padding(
            padding: EdgeInsets.all(12),
            child: Text(product.name),
          ),
          
          // Precios
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 12),
            child: Row(
              children: [
                // Precio actual
                Text(
                  '€${finalPrice.toStringAsFixed(2)}',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.green,
                  ),
                ),
                SizedBox(width: 8),
                
                // Precio tachado
                if (hasDiscount)
                  Text(
                    '€${product.compareAtPrice!.toStringAsFixed(2)}',
                    style: TextStyle(
                      decoration: TextDecoration.lineThrough,
                      color: Colors.grey,
                    ),
                  ),
                
                Spacer(),
                
                // Descuento %
                if (hasDiscount)
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      '-${discount.toStringAsFixed(0)}%',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
              ],
            ),
          ),
          
          // Stock
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 12),
            child: buildStockIndicator(product.totalStock),
          ),
          
          // Botón añadir al carrito
          Padding(
            padding: EdgeInsets.all(12),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: product.totalStock > 0 
                  ? () => _addToCart(context)
                  : null,
                child: Text(
                  product.totalStock > 0 
                    ? 'Añadir al carrito'
                    : 'Agotado',
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget buildStockIndicator(int stock) {
    if (stock == 0) {
      return Text(
        'Agotado',
        style: TextStyle(color: Colors.red, fontSize: 12),
      );
    } else if (stock < 5) {
      return Text(
        '¡Solo $stock disponibles!',
        style: TextStyle(color: Colors.orange, fontSize: 12),
      );
    } else {
      return Text(
        'En stock',
        style: TextStyle(color: Colors.green, fontSize: 12),
      );
    }
  }
}
```

---

## ⚠️ MANEJO DE ERRORES

### Errores Comunes y Soluciones

#### 1. Stock Insuficiente

```typescript
// Error típico
try {
  await decreaseStock(variantId, 10);
} catch (error) {
  if (error.message.includes('Stock insuficiente')) {
    // Mostrar error al usuario
    showError('No hay suficiente stock. Disponible: 5 unidades');
    
    // Permitir compra de cantidad menor
    suggestMaxQuantity(5);
  }
}
```

#### 2. Variante No Encontrada

```typescript
const variant = await getVariant(variantId);
if (!variant) {
  throw Error('La variante ha sido eliminada');
  // El producto puede seguir existiendo
  // pero esta combinación (talla/color) no
}
```

#### 3. Reserva Expirada

```typescript
// La reserva expire después de 15 minutos
// Al intentar pagar, el stock ya fue liberado

try {
  await processPayment(order);
} catch (error) {
  if (error.code === 'STOCK_UNAVAILABLE') {
    showError('El stock que reservaste expiró. Actualiza tu carrito.');
    // Llevar al usuario al carrito
  }
}
```

#### 4. Carrito Modificado Mientras Paga

```typescript
// Usuario tiene en carrito:
// - Camiseta Rojo M x2 @ 49.99 = 99.98
// Mientras que en BD cambia a 59.99

// Solución: Validar precios en pago
const currentPrice = await getVariantPrice(variantId);
if (currentPrice !== cartItemPrice) {
  showWarning(`Precio actualizado de €${cartItemPrice} a €${currentPrice}`);
  // Permitir proceder o volver a carrito
}
```

#### 5. Cupón No Válido

```typescript
try {
  const discount = await validateCoupon(couponCode);
} catch (error) {
  switch (error.code) {
    case 'COUPON_NOT_FOUND':
      showError('Cupón no existe');
      break;
    case 'COUPON_EXPIRED':
      showError('Cupón ha expirado');
      break;
    case 'COUPON_MAX_USES':
      showError('Cupón agotado');
      break;
    case 'COUPON_MIN_PURCHASE':
      showError(`Mínimo de compra €${error.minPurchase} requerido`);
      break;
    case 'COUPON_ALREADY_USED':
      showError('Ya has usado este cupón');
      break;
  }
}
```

---

## ✅ VALIDACIONES

### Validaciones del Cliente (Flutter)

```dart
class Validators {
  // Validar cantidad
  static String? validateQuantity(String value) {
    final quantity = int.tryParse(value);
    if (quantity == null) return 'Debe ser un número';
    if (quantity < 1) return 'Mínimo 1 unidad';
    if (quantity > 999) return 'Máximo 999 unidades';
    return null;
  }
  
  // Validar precio
  static String? validatePrice(String value) {
    final price = double.tryParse(value);
    if (price == null) return 'Precio inválido';
    if (price < 0) return 'El precio no puede ser negativo';
    if (price > 99999.99) return 'Precio máximo excedido';
    return null;
  }
  
  // Validar descuento
  static String? validateDiscount(String value) {
    final discount = int.tryParse(value);
    if (discount == null) return 'Descuento debe ser un número';
    if (discount < 0 || discount > 100) {
      return 'Descuento debe estar entre 0-100%';
    }
    return null;
  }
  
  // Validar cupón
  static String? validateCoupon(String value) {
    if (value.isEmpty) return null; // Opcional
    if (value.length < 3) return 'Cupón muy corto';
    if (value.length > 50) return 'Cupón muy largo';
    if (!RegExp(r'^[A-Z0-9_-]+$').hasMatch(value)) {
      return 'Cupón solo puede contener letras, números, guiones';
    }
    return null;
  }
}
```

### Validaciones del Servidor

```typescript
// API endpoint - validar antes de procesar
POST /api/orders
{
  "items": [
    {
      "variant_id": "uuid",
      "quantity": 2,
      "price": 49.99  // El cliente envía el precio, validamos
    }
  ]
}

// Validaciones en servidor:
1. ✅ Verificar que variant_id existe
2. ✅ Verificar que quantity > 0 y < 999
3. ✅ Verificar que price coincide con BD (±1% tolerancia)
4. ✅ Verificar que stock >= quantity
5. ✅ Verificar que variante es is_active = true
6. ✅ Verificar que produto es is_active = true
7. ✅ Si hay cupón:
   - Verificar que existe
   - Verificar que is_active = true
   - Verificar que no está expirado
   - Verificar que customer no lo ha usado
   - Verificar que subtotal >= min_purchase
```

---

## 🎯 MEJORES PRÁCTICAS

### 1. Cálculos de Precio

✅ **CORRECTO:**
```typescript
// Siempre redondear a 2 decimales
const price = Math.round(49.99 * 100) / 100; // 49.99

// Usar céntimos internamente cuando sea posible
const priceInCents = Math.round(49.99 * 100); // 4999
const priceInEuros = priceInCents / 100; // 49.99
```

❌ **INCORRECTO:**
```typescript
// NO usar aritmética flotante
const total = 49.99 + 50.01; // 100.00 (puede ser 100.00000001)

// NO truncar decimales
const price = Math.floor(49.99 * 100) / 100; // Pierde precisión
```

### 2. Control de Stock

✅ **CORRECTO:**
```typescript
// Usar funciones atómicas con bloqueos
SELECT decrease_stock('variant-id', quantity);

// Verificar disponibilidad antes de asumir
const available = await checkStockAvailability(variantId, qty);

// Manejar race conditions
try {
  await decreaseStock(variantId, 10);
} catch (error) {
  // Stock cambió entre verificación y actualización
  const available = await checkStockAvailability(variantId, 10);
  showError(`Disponible: ${available} unidades`);
}
```

❌ **INCORRECTO:**
```typescript
// NO hacer SELECT luego UPDATE sin bloqueo
const current = await getStock(variantId); // 10
// ... otro proceso consume 5
await setStock(variantId, current - 10); // ¡Resultado incorrecto!

// NO confiar en cantidad del cliente
const qty = req.body.quantity; // Podría ser alterado
await decreaseStock(variantId, qty); // PELIGRO: Puede ser negativo
```

### 3. Snapshot de Precios

✅ **CORRECTO:**
```typescript
// Guardar precio AL MOMENTO DE COMPRA
order_items.insert({
  order_id: orderId,
  variant_id: variantId,
  quantity: 2,
  price_at_purchase: 49.99,  // Precio actual
  discount_at_purchase: 37,
  subtotal: 62.98 // 49.99 * 2 * (1 - 0.37)
});

// Así el cliente ve exactamente lo que pagó
// incluso si el precio cambió después
```

❌ **INCORRECTO:**
```typescript
// NO guardar solo variant_id y calcular después
// El precio puede haber cambiad
order_items.insert({
  order_id: orderId,
  variant_id: variantId,
  quantity: 2
  // ¿Qué precio uso para reportes?
});
```

### 4. Actualizaciones de Precios

✅ **CORRECTO:**
```typescript
// Si cambias un precio:
// 1. Notificar admin
// 2. Crear log de cambio
// 3. Sincronizar con Stripe
// 4. Invalidar caché de precios

updatePrice(productId, 59.99);
await logPriceChange(productId, oldPrice, newPrice);
await syncWithStripe(productId);
await invalidatePriceCache();
```

❌ **INCORRECTO:**
```typescript
// NO cambiar precios sin notificar
// NO afectar órdenes ya creadas
// El precio es histórico en ORDER_ITEMS
```

### 5. Manejo de Cupones

✅ **CORRECTO:**
```typescript
// Verificar cupón ANTES de pago
const coupon = await validateCoupon(code);
if (!coupon.isActive || coupon.isExpired) {
  throw Error('Cupón no válido');
}

// Aplicar descuento en servidor (no cliente)
const discount = coupon.type === 'percentage'
  ? subtotal * (coupon.value / 100)
  : coupon.value;
```

❌ **INCORRECTO:**
```typescript
// NO calcular descuento en cliente
// Cliente puede falsificar amount

// NO confiar en cupón del cliente
// Validar SIEMPRE en servidor
```

### 6. Caché de Precios

✅ **CORRECTO:**
```typescript
// Caché con TTL corto (5-15 minutos)
const price = await cache.get(`product:${id}:price`, {
  ttl: 600 // 10 minutos
}, async () => {
  return await getProductPrice(id);
});
```

❌ **INCORRECTO:**
```typescript
// NO cachear indefinidamente
// Los precios cambian frecuentemente

// NO usar caché para órdenes en progreso
// Siempre validar precio actual antes de pago
```

---

## 📱 Resumen para Flutter

### Checklist de Implementación

- [ ] Modelos de datos creados (Product, Variant, Order, etc.)
- [ ] Servicio de productos con obtención de variantes
- [ ] Servicio de carrito (añadir, quitar, actualizar)
- [ ] Servicio de stock (verificar, reservar)
- [ ] Servicio de órdenes (crear, obtener, cancelar)
- [ ] UI de catálogo con filtros de precio
- [ ] UI de detalle de producto con selector de variante
- [ ] UI de carrito con totales calculados
- [ ] UI de checkout con validaciones
- [ ] Integración con Stripe payment
- [ ] Manejo de errores y reintentos
- [ ] Notificaciones de stock bajo
- [ ] Historial de compras

### Endpoints Principales a Consumir

```
GET    /api/productos              → Lista de productos
GET    /api/productos/{id}          → Detalle producto
GET    /api/productos/{id}/variantes → Variantes disponibles
POST   /api/stock/check             → Verificar disponibilidad
GET    /api/carrito                 → Obtener carrito
POST   /api/carrito                 → Añadir al carrito
PATCH  /api/carrito/{item}          → Actualizar cantidad
DELETE /api/carrito/{item}          → Remover del carrito
POST   /api/orders                  → Crear orden
GET    /api/orders/{id}             → Obtener orden
POST   /api/coupons/validate        → Validar cupón
```

### Notas Importantes

⚠️ **CRÍTICO:** Nunca confíes en precios enviados desde el cliente. Siempre valida en servidor.

⚠️ **CRÍTICO:** Las funciones de stock deben ser atómicas y usar bloqueos para evitar sobreventa.

⚠️ **IMPORTANTE:** Los precios deben ser snapshots en el momento de la compra, no referencias dinámicas.

⚠️ **IMPORTANTE:** El stock reservado expira después de 15 minutos. Implementa renovación si el usuario está llenando formularios.

---

**Última actualización:** 3 de febrero de 2026  
**Próxima revisión recomendada:** Cuando se implemente facturación electrónica
