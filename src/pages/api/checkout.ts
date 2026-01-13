/**
 * API: Checkout - Crear sesión de Stripe
 */
import type { APIRoute } from 'astro';
import { createCheckoutSession } from '@lib/stripe';
import type { CartItem } from '@stores/cart';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { items } = await request.json() as { items: CartItem[] };
    
    console.log('Checkout items recibidos:', JSON.stringify(items, null, 2));
    
    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'El carrito está vacío' }),
        { status: 400 }
      );
    }
    
    // item.price ya tiene el descuento aplicado (en euros)
    const lineItems = items.map(item => {
      console.log(`Item: ${item.name}, precio: ${item.price}€, cantidad: ${item.quantity}`);
      return {
        name: item.name,
        description: `Talla: ${item.size} | Color: ${item.color}`,
        price: Math.round(item.price * 100), // Convert to cents
        quantity: item.quantity,
        image: item.image,
      };
    });
    
    console.log('Line items para Stripe:', JSON.stringify(lineItems, null, 2));
    
    const session = await createCheckoutSession(
      lineItems,
      `${new URL(request.url).origin}/checkout/success`,
      `${new URL(request.url).origin}/carrito`
    );
    
    console.log('Stripe session creada:', session.id, session.url);
    
    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Checkout error:', error);
    console.error('Error message:', error.message);
    console.error('Error type:', error.type);
    return new Response(
      JSON.stringify({ error: error.message || 'Error al procesar el pago' }),
      { status: 500 }
    );
  }
};
