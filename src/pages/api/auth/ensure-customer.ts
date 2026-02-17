/**
 * API: Ensure Customer - Crear o verificar registro de cliente
 * POST /api/auth/ensure-customer
 * Body: { userId, email, firstName?, lastName? }
 */
import type { APIRoute } from 'astro';
import { supabase, supabaseAdmin } from '@lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Verificar autenticación
    const accessToken = cookies.get('sb-access-token')?.value;
    const body = await request.json();
    const { userId, email, firstName, lastName } = body;

    // Validar que el usuario autenticado corresponde al userId
    if (accessToken) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
      if (authError || !user || user.id !== userId) {
        return new Response(
          JSON.stringify({ error: 'No autorizado' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: 'userId y email son requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar si el cliente ya existe
    const { data: existing } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('auth_user_id', userId)
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({ success: true, customerId: existing.id, created: false }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Crear nuevo cliente
    const { data: newCustomer, error: insertError } = await supabaseAdmin
      .from('customers')
      .insert({
        auth_user_id: userId,
        email: email,
        first_name: firstName || 'Cliente',
        last_name: lastName || '',
      })
      .select('id')
      .single();

    if (insertError) {
      // Si es un error de duplicado, intentar obtener el existente
      if (insertError.code === '23505') {
        const { data: existingByEmail } = await supabaseAdmin
          .from('customers')
          .select('id')
          .eq('email', email)
          .single();
        
        if (existingByEmail) {
          // Actualizar auth_user_id si no tiene
          await supabaseAdmin
            .from('customers')
            .update({ auth_user_id: userId })
            .eq('id', existingByEmail.id);
          
          return new Response(
            JSON.stringify({ success: true, customerId: existingByEmail.id, created: false }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
      throw insertError;
    }

    return new Response(
      JSON.stringify({ success: true, customerId: newCustomer?.id, created: true }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error en ensure-customer:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error interno' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
