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

  // Obtener token de la cookie
  const token = context.cookies.get('sb-access-token')?.value;

  if (!token) {
    // Si es API, devolver 401 JSON
    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'No autenticado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    // Si es página, redirigir a login
    return context.redirect('/admin/login');
  }

  // Verificar el token con Supabase
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (!user || authError) {
    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Token inválido' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return context.redirect('/admin/login');
  }

  // Verificar que el usuario es admin activo
  const { data: adminUser } = await supabaseAdmin
    .from('admin_users')
    .select('id, is_active')
    .eq('auth_user_id', user.id)
    .eq('is_active', true)
    .single();

  if (!adminUser) {
    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Acceso denegado — no es admin' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return context.redirect('/cuenta/login?error=unauthorized');
  }

  // Admin verificado — continuar
  return next();
});
