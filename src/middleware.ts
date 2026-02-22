/**
 * Middleware de autenticación para rutas admin
 * Protege /admin/* y /api/admin/* verificando cookie + rol admin en BD
 */
import { defineMiddleware } from 'astro:middleware';
import { supabase, supabaseAdmin } from '@lib/supabase';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Solo proteger rutas admin (excepto login y check-auth que deben ser públicas)
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isExcluded = pathname === '/admin/login' || pathname === '/api/admin/check-auth';

  if (!isAdminRoute || isExcluded) {
    return next();
  }

  // Helper para responder según tipo de ruta
  const denyAccess = (message: string, status = 401) => {
    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return context.redirect('/admin/login');
  };

  try {
    // Obtener token de la cookie
    const token = context.cookies.get('sb-access-token')?.value;

    if (!token) {
      return denyAccess('No autenticado');
    }

    // Verificar el token con Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (!user || authError) {
      return denyAccess('Token inválido');
    }

    // Verificar que el usuario es admin activo
    const { data: adminUser } = await supabaseAdmin
      .from('admin_users')
      .select('id, is_active')
      .eq('auth_user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!adminUser) {
      return denyAccess('Acceso denegado — no es admin', 403);
    }

    // Admin verificado — continuar
    return next();
  } catch (err) {
    // Si hay cualquier error inesperado, NUNCA dejar pasar — redirigir a login
    console.error('[middleware] Error verificando auth admin:', err);
    return denyAccess('Error de autenticación', 500);
  }
});
