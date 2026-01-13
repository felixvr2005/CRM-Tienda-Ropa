/**
 * API Cart - Obtener y gestionar carrito del servidor
 */
import type { APIRoute } from 'astro';
import { supabase } from '@lib/supabase';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const customerId = url.searchParams.get('customerId');
  const sessionId = url.searchParams.get('sessionId');

  if (!customerId && !sessionId) {
    return new Response(JSON.stringify({ error: 'Missing customerId or sessionId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let query = supabase
    .from('cart_items')
    .select(`
      id,
      quantity,
      product:products(id, name, slug, price, discount_percentage, image_url),
      variant:product_variants(id, size, color, color_hex, stock)
    `);

  if (customerId) {
    query = query.eq('customer_id', customerId);
  } else {
    query = query.eq('session_id', sessionId);
  }

  const { data, error } = await query;

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Formatear items para el frontend
  const items = (data || []).map(item => {
    const product = item.product as any;
    const variant = item.variant as any;
    const discountedPrice = product.price * (1 - (product.discount_percentage || 0) / 100);
    
    return {
      id: item.id,
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      slug: product.slug,
      price: discountedPrice,
      originalPrice: product.price,
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
  const { customerId, sessionId, productId, variantId, quantity } = body;

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

  if (customerId) {
    insertData.customer_id = customerId;
  } else if (sessionId) {
    insertData.session_id = sessionId;
  } else {
    return new Response(JSON.stringify({ error: 'Missing customerId or sessionId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { data, error } = await supabase
    .from('cart_items')
    .upsert(insertData, {
      onConflict: customerId ? 'customer_id,variant_id' : 'session_id,variant_id'
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

  const { error } = await supabase
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
