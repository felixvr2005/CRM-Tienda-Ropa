/**
 * API Cart - Obtener y gestionar carrito del servidor
 */
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@lib/supabase';

export const prerender = false;

/**
 * Resolve auth_user_id → customers.id
 * The client sends the Supabase auth UUID, but cart_items.customer_id references customers.id
 */
async function resolveCustomerId(authUserId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('auth_user_id', authUserId)
    .single();
  return data?.id || null;
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const authUserId = url.searchParams.get('authUserId');
  const sessionId = url.searchParams.get('sessionId');

  if (!authUserId && !sessionId) {
    return new Response(JSON.stringify({ error: 'Missing authUserId or sessionId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let query = supabaseAdmin
    .from('cart_items')
    .select(`
      id,
      quantity,
      product:products(id, name, slug, price, discount_percentage, image_url),
      variant:product_variants(id, size, color, color_hex, stock)
    `);

  if (authUserId) {
    const customerId = await resolveCustomerId(authUserId);
    if (!customerId) {
      // User doesn't have a customer profile yet — return empty cart
      return new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    query = query.eq('customer_id', customerId);
  } else {
    query = query.eq('session_id', sessionId!);
  }

  const { data, error } = await query;

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Formatear items para el frontend
  // product.price viene en céntimos desde la BD - convertir a euros
  const items = (data || []).map(item => {
    const product = item.product as any;
    const variant = item.variant as any;
    const priceEuros = (product.price || 0) / 100;
    const discountedPrice = priceEuros * (1 - (product.discount_percentage || 0) / 100);
    
    return {
      id: item.id,
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      slug: product.slug,
      price: discountedPrice,
      originalPrice: priceEuros,
      discount: product.discount_percentage || 0,
      image: product.image_url,
      size: variant.size,
      color: variant.color,
      quantity: item.quantity,
      maxStock: variant.stock
    };
  });

  return new Response(JSON.stringify({ items }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { authUserId, sessionId, productId, variantId, quantity } = body;

  if (!productId || !variantId || !quantity) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const insertData: any = {
    product_id: productId,
    variant_id: variantId,
    quantity,
  };

  if (authUserId) {
    const customerId = await resolveCustomerId(authUserId);
    if (!customerId) {
      return new Response(JSON.stringify({ error: 'Customer profile not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    insertData.customer_id = customerId;
  } else if (sessionId) {
    insertData.session_id = sessionId;
  } else {
    return new Response(JSON.stringify({ error: 'Missing authUserId or sessionId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { data, error } = await supabaseAdmin
    .from('cart_items')
    .upsert(insertData, {
      onConflict: authUserId ? 'customer_id,variant_id' : 'session_id,variant_id'
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ success: true, item: data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const DELETE: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const itemId = url.searchParams.get('itemId');

  if (!itemId) {
    return new Response(JSON.stringify({ error: 'Missing itemId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { error } = await supabaseAdmin
    .from('cart_items')
    .delete()
    .eq('id', itemId);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
