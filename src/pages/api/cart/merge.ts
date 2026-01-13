/**
 * API Cart Merge - Fusionar carrito de invitado con usuario
 */
import type { APIRoute } from 'astro';
import { supabase } from '@lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { sessionId, customerId, items } = body;

  if (!customerId) {
    return new Response(JSON.stringify({ error: 'Missing customerId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Si hay items del cliente local, insertarlos
    if (items && items.length > 0) {
      for (const item of items) {
        // Verificar si ya existe este variant en el carrito del usuario
        const { data: existing } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('customer_id', customerId)
          .eq('variant_id', item.variantId)
          .single();

        if (existing) {
          // Actualizar cantidad
          await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity + item.quantity })
            .eq('id', existing.id);
        } else {
          // Insertar nuevo
          await supabase
            .from('cart_items')
            .insert({
              customer_id: customerId,
              product_id: item.productId,
              variant_id: item.variantId,
              quantity: item.quantity
            });
        }
      }
    }

    // Si hay sessionId, transferir items de la sesión de invitado
    if (sessionId) {
      const { data: guestItems } = await supabase
        .from('cart_items')
        .select('*')
        .eq('session_id', sessionId);

      if (guestItems && guestItems.length > 0) {
        for (const guestItem of guestItems) {
          // Verificar si ya existe
          const { data: existing } = await supabase
            .from('cart_items')
            .select('id, quantity')
            .eq('customer_id', customerId)
            .eq('variant_id', guestItem.variant_id)
            .single();

          if (existing) {
            // Actualizar cantidad
            await supabase
              .from('cart_items')
              .update({ quantity: existing.quantity + guestItem.quantity })
              .eq('id', existing.id);
          } else {
            // Insertar nuevo con customer_id
            await supabase
              .from('cart_items')
              .insert({
                customer_id: customerId,
                product_id: guestItem.product_id,
                variant_id: guestItem.variant_id,
                quantity: guestItem.quantity
              });
          }
        }

        // Eliminar items de la sesión de invitado
        await supabase
          .from('cart_items')
          .delete()
          .eq('session_id', sessionId);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
