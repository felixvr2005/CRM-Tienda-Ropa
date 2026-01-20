import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../lib/supabase';

export const prerender = false;

/**
 * API para enviar mensajes de contacto
 * POST /api/contact
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, phone, subject, orderNumber, message } = body;

    // Validaciones
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'Campos requeridos: name, email, subject, message' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validar email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Email inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Insertar mensaje de contacto
    const { data: contact, error: insertError } = await supabaseAdmin
      .from('contact_messages')
      .insert({
        name,
        email,
        phone: phone || null,
        subject,
        order_number: orderNumber || null,
        message,
        status: 'new',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting contact message:', insertError);
      return new Response(
        JSON.stringify({ error: 'Error al guardar el mensaje' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Aquí se podría enviar un email de confirmación
    // await sendConfirmationEmail(email, name);

    console.log('[Contact] Message received from:', email, '- Subject:', subject);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Tu mensaje ha sido enviado correctamente',
        id: contact.id
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[Contact API] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * GET - Listar mensajes (solo admin)
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    // Verificar que es admin (no implementado en este ejemplo)
    // Por ahora solo retornar 403
    
    return new Response(
      JSON.stringify({ error: 'No autorizado' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[Contact API GET] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
