import { supabaseAdmin } from '@lib/supabase';
export const prerender = false;

export async function GET({ request }: any) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email') || undefined;
    const code = url.searchParams.get('code') || undefined;

    if (!email || !code) {
      return new Response(JSON.stringify({ message: 'Faltan parámetros' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Buscar suscriptor por email y código
    const { data: subscriber, error: findError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', email)
      .eq('discount_code', code)
      .maybeSingle();

    if (findError) {
      console.error('Error buscando suscriptor:', findError);
      return new Response(JSON.stringify({ message: 'Error interno' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    if (!subscriber) {
      return new Response(JSON.stringify({ message: 'Suscriptor no encontrado' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    // Marcar como no suscrito
    const { error: updateError } = await supabaseAdmin
      .from('newsletter_subscribers')
      // @ts-ignore - table typings not present in workspace; runtime payload is valid
      .update({ subscribed: false, unsubscribed_at: new Date().toISOString() })
      .eq('email', email);

    if (updateError) {
      console.error('Error actualizando suscripción:', updateError);
      return new Response(JSON.stringify({ message: 'No se pudo dar de baja' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // Redirigir a página de confirmación (frontend)
    const redirectTo = `${process.env.PUBLIC_APP_URL || ''}/unsubscribe?status=success&email=${encodeURIComponent(email)}`;
    return Response.redirect(redirectTo, 302);
  } catch (err: any) {
    console.error('Error en newsletter/unsubscribe GET:', err);
    return new Response(JSON.stringify({ message: 'Error interno' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function POST({ request }: any) {
  try {
    const { email, code } = await request.json();
    if (!email || !code) {
      return new Response(JSON.stringify({ message: 'Email y código requeridos' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const { data: subscriber } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('email')
      .eq('email', email)
      .eq('discount_code', code)
      .maybeSingle();

    if (!subscriber) {
      return new Response(JSON.stringify({ message: 'Suscriptor no encontrado' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      // @ts-ignore - table typings not present in workspace; runtime payload is valid
      .update({ subscribed: false, unsubscribed_at: new Date().toISOString() })
      .eq('email', email);

    if (error) {
      console.error('Error al actualizar suscripción:', error);
      return new Response(JSON.stringify({ message: 'Error interno' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ message: 'Dado de baja correctamente' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('Error en newsletter/unsubscribe POST:', err);
    return new Response(JSON.stringify({ message: 'Error interno' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
