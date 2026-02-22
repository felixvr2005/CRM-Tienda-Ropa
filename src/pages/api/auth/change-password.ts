
export const prerender = false;
import { logger } from '@lib/logger';
import { supabase, supabaseAdmin } from '@lib/supabase';
import { createClient } from '@supabase/supabase-js';

export async function POST({ request, cookies }: any) {
  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return new Response(
        JSON.stringify({ message: 'Faltan parámetros' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Obtener email del usuario autenticado a través de la cookie de sesión
    const accessToken = cookies?.get('sb-access-token')?.value;
    let userEmail = request.headers.get('x-user-email');

    if (accessToken) {
      const { data: { user }, error: tokenError } = await supabase.auth.getUser(accessToken);
      if (!tokenError && user?.email) {
        userEmail = user.email;
      }
    }

    if (!userEmail) {
      return new Response(
        JSON.stringify({ message: 'No se pudo identificar al usuario' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar contraseña actual con un cliente EFÍMERO
    // NUNCA usar el singleton del servidor para signInWithPassword
    const ephemeralClient = createClient(
      import.meta.env.PUBLIC_SUPABASE_URL || '',
      import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '',
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const { data: authData, error: authError } = await ephemeralClient.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword
    });

    if (authError) {
      return new Response(
        JSON.stringify({ message: 'La contraseña actual es incorrecta' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Cambiar contraseña usando supabaseAdmin para asegurar que se actualiza el usuario correcto
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      authData.user.id,
      { password: newPassword }
    );

    if (updateError) {
      return new Response(
        JSON.stringify({ message: 'Error al actualizar contraseña' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Contraseña actualizada correctamente' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    logger.error('Error en change-password:', error);
    return new Response(
      JSON.stringify({ message: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}