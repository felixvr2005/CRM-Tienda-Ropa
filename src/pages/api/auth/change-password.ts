import { logger } from '@lib/logger';
import { supabase } from '@lib/supabase';

export async function POST({ request }: any) {
  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return new Response(
        JSON.stringify({ message: 'Faltan parámetros' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar contraseña actual intentando hacer signin
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: request.headers.get('x-user-email'),
      password: currentPassword
    });

    if (authError) {
      return new Response(
        JSON.stringify({ message: 'La contraseña actual es incorrecta' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Cambiar contraseña
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

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
