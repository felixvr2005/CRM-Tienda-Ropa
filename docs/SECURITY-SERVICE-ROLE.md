# Security: Service Role Usage & Protection Guide

**Location:** `DOCS/SECURITY-SERVICE-ROLE.md`  
**Last Updated:** 2024  
**Risk Level:** 🔴 CRITICAL - Service role bypasses all RLS policies

---

## Table of Contents

1. [Overview](#overview)
2. [When to Use Service Role](#when-to-use-service-role)
3. [When NOT to Use](#when-not-to-use)
4. [Safe Patterns](#safe-patterns)
5. [Audit & Monitoring](#audit--monitoring)
6. [Endpoints Inventory](#endpoints-inventory)

---

## Overview

### What is Service Role?

- **Supabase Service Role Key** = full database access (bypasses RLS entirely)
- Used only on **backend/server** (Node.js API routes, scheduled functions)
- NEVER expose in frontend/browser/Flutter app
- **Equivalent to:** Database `postgres` user

### Why It's Dangerous

```sql
-- Service role CAN do this:
UPDATE products SET price = 0.01 WHERE id = ANY(...);  -- RLS BYPASSED!

-- Authenticated user tries same thing:
UPDATE products SET price = 0.01 WHERE id = ANY(...);
-- Result: 403 Forbidden (RLS blocks it)
```

### When You Need It

✅ Stock operations (descontar_stock, restaurar_stock)  
✅ Order processing (create orders, deduct inventory atomically)  
✅ Scheduled jobs (daily reports, cleanup, email sending)  
✅ Admin data imports/migrations  
✅ Batch operations with validation

---

## When to Use Service Role

### 1. Stock Management (Order Processing)

**File:** `src/pages/api/checkout/confirm.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

// ✅ CORRECT: Service role for server operation
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // 1. Validate cart exists (can use user token)
    const userAuth = req.headers.get('Authorization');
    const userClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: userAuth! } }
    });

    const { data: cartItems } = await userClient.from('cart_items').select();

    // 2. Process payment (service role for atomicity)
    await supabaseAdmin.rpc('descontar_stock', {
      p_product_id: product.id,
      p_cantidad: quantity
    });

    // 3. Create order (service role to bypass RLS)
    const { data: order } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_id: userId,
        status: 'processing',
        total_amount: total
      })
      .select()
      .single();

    return Response.json({ orderId: order.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

### 2. Order Status Updates (Webhook Handler)

**File:** `src/pages/api/webhooks/stripe.ts`

```typescript
// ✅ CORRECT: Service role for webhook processing
async function handlePaymentSuccess(paymentIntentId: string) {
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .update({ status: 'completed' })
    .eq('stripe_payment_intent_id', paymentIntentId)
    .select()
    .single();

  if (error) throw error;

  // Now send confirmation email
  await sendOrderConfirmationEmail(order.customer_id, order.id);
}
```

### 3. Stock Restoration on Return

**File:** `src/pages/api/returns/approve.ts`

```typescript
export async function POST(req: Request) {
  const { returnId } = await req.json();

  // Service role to restore stock and update status atomically
  const { data: result } = await supabaseAdmin.rpc('restaurar_stock', {
    p_product_id: returnItem.product_id,
    p_cantidad: returnItem.quantity
  });

  // Update return status (service role bypasses RLS)
  await supabaseAdmin
    .from('returns')
    .update({ status: 'approved' })
    .eq('id', returnId);

  return Response.json({ success: true });
}
```

### 4. Scheduled Jobs (Cron Functions)

**File:** `supabase/functions/daily-analytics/index.ts`

```typescript
// ✅ CORRECT: Service role for scheduled functions
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  // Generate daily sales report (service role to see all orders)
  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('status', 'completed')
    .gte('created_at', today);

  // Aggregate data
  const report = aggregateReport(orders);

  // Store report (service role to write)
  await supabaseAdmin.from('daily_reports').insert(report);

  return new Response(JSON.stringify({ processed: true }));
});
```

---

## When NOT to Use

### ❌ INCORRECT: Exposing Service Role to Frontend

```typescript
// ❌ WRONG - Never do this!
export const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_KEY  // EXPOSED!
);

// Frontend code
const { data } = await supabaseAdmin.from('orders').select(); // Can bypass RLS!
```

### ❌ INCORRECT: Service Role in React Component

```typescript
// ❌ WRONG - This gets compiled into frontend JavaScript!
async function checkAdminStatus() {
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_SERVICE_KEY // Leaked!
  );
  // ...
}
```

### ❌ INCORRECT: Service Role for User Input Validation

```typescript
// ❌ WRONG - Use authenticated client for user operations
const supabaseAdmin = createClient(url, serviceKey);

export async function POST(req: Request) {
  const { productId, quantity } = await req.json();

  // WRONG: Service role bypasses RLS check
  const { data } = await supabaseAdmin
    .from('cart_items')
    .insert({
      product_id: productId,
      quantity,
      user_id: userId // User can fake this!
    });
}

// ✅ CORRECT: Validate with user token first
const userClient = createClient(url, anonKey, { headers: { Authorization } });
const { data: cart } = await userClient.from('cart_items').insert(...);
// RLS automatically enforces user_id = auth.uid()
```

---

## Safe Patterns

### Pattern 1: Validate Then Operate

```typescript
export async function approveReturn(returnId: string, adminUserId: string) {
  // Step 1: Verify admin is actually admin
  const { data: adminUser, error: adminError } = await supabaseAdmin
    .from('admin_users')
    .select()
    .eq('auth_user_id', adminUserId)
    .single();

  if (adminError || !adminUser?.is_active) {
    throw new Error('Not authorized');
  }

  // Step 2: Fetch return with service role
  const { data: returnRequest } = await supabaseAdmin
    .from('returns')
    .select('*')
    .eq('id', returnId)
    .single();

  // Step 3: Perform operation
  await supabaseAdmin
    .from('returns')
    .update({ status: 'approved' })
    .eq('id', returnId);
}
```

### Pattern 2: Transactional Operations

```typescript
// Process order atomically with service role
const { data: result } = await supabaseAdmin.rpc('process_order', {
  p_order_id: orderId,
  p_payment_intent_id: paymentIntentId
});

// The function `process_order` (SQL):
-- UPDATE orders SET status='completed', stripe_payment_intent_id=...
-- UPDATE products SET stock = stock - ordered_quantity
-- INSERT INTO coupon_uses ...
-- All in one transaction (atomic)
```

### Pattern 3: Audit Logging

```typescript
// Log all sensitive operations
async function logServiceRoleOperation(
  operationType: string,
  affectedResource: string,
  details: any
) {
  await supabaseAdmin.from('audit_logs').insert({
    operation: operationType,
    resource: affectedResource,
    details,
    timestamp: new Date(),
    performed_by: 'service_role' // Transparent
  });
}

// Usage
await logServiceRoleOperation('stock_decrement', productId, {
  original_stock: 100,
  decremented_by: 5,
  reason: 'order_123'
});
```

---

## Audit & Monitoring

### Check Active Service Role Usage

```sql
-- Find all API endpoints using service role
SELECT
  table_name,
  COUNT(*) as operation_count,
  array_agg(DISTINCT op) as operations
FROM pg_stat_statements
WHERE query LIKE '%supabaseAdmin%'
GROUP BY table_name
ORDER BY operation_count DESC;
```

### Environment Variable Checklist

✅ `SUPABASE_SERVICE_ROLE_KEY` - Set in **server/.env** only  
✅ Never in `.env.public`, `.env.client`, or version control  
✅ Rotate service key quarterly  
✅ Use different keys for staging/prod  

### Monitoring Service Role Activity

```typescript
// Add to every service role operation
async function withServiceRoleLogging(operation: () => Promise<any>) {
  const startTime = Date.now();
  
  try {
    const result = await operation();
    
    // Log success
    console.log(`[SERVICE_ROLE] Operation completed in ${Date.now() - startTime}ms`);
    
    return result;
  } catch (error) {
    // Log failure IMMEDIATELY
    console.error(`[SERVICE_ROLE_ERROR] ${error.message}`, {
      stack: error.stack,
      timestamp: new Date()
    });
    throw error;
  }
}
```

---

## Endpoints Inventory

### Current Service Role Usage

| Endpoint | File | Purpose | Risk |
|----------|------|---------|------|
| `POST /api/checkout/confirm` | `src/pages/api/checkout/confirm.ts` | Stock reservation | 🟡 Medium |
| `POST /api/webhooks/stripe` | `src/pages/api/webhooks/stripe.ts` | Payment status update | 🔴 High |
| `POST /api/returns/approve` | `src/pages/api/returns/approve.ts` | Stock restore | 🟡 Medium |
| `POST /api/admin/import` | `src/pages/api/admin/import.ts` | Bulk data import | 🔴 High |
| `POST /api/cron/daily-report` | `supabase/functions/daily-report/index.ts` | Analytics | 🟢 Low |

### Remediation Tasks

| Status | Task | File |
|--------|------|------|
| ⏳ TODO | Add auth verification to approve endpoint | `src/pages/api/returns/approve.ts` |
| ⏳ TODO | Add request signature validation to webhooks | `src/pages/api/webhooks/stripe.ts` |
| ⏳ TODO | Implement operation logging middleware | `src/lib/supabase-logger.ts` |
| ⏳ TODO | Add rate limiting to service role endpoints | `src/middleware/rate-limit.ts` |

---

## Deployment Checklist

- [ ] Service key stored in `.env.local` (never committed)
- [ ] Service key rotated before deployment
- [ ] Audit logging enabled for all operations
- [ ] Rate limiting active on endpoints
- [ ] Admin verification implemented
- [ ] Request signature validation (for webhooks)
- [ ] Monitoring alerts configured
- [ ] Incident response plan documented

---

## Related Files

- [RLS Policies](../DOCS/SECURITY-RLS-POLICIES.md)
- [Authentication](../src/lib/auth.ts)
- [Database Schema](../database-schema-complete.sql)
- [Migrations](../supabase/migrations/)

---

**Last Audit:** 2024  
**Next Review:** Quarterly or after each deployment
