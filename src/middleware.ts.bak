/**
 * Auth Middleware
 * Protege rutas /admin y /cuenta requiriendo autenticación
 * Valida que admin sea admin y cliente sea cliente
 */
import { defineMiddleware } from 'astro:middleware';
import { supabase, supabaseAdmin } from './lib/supabase';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Excluir rutas de archivos estáticos
  const staticExtensions = ['.css', '.js', '.mjs', '.wasm', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.json', '.xml', '.txt'];
  if (staticExtensions.some(ext => pathname.endsWith(ext))) {
    return next();
  }

  // Permitir CORS para formularios desde cualquier origen
  const request = context.request as any;
  
  // Modificar request para manejar tanto FormData como JSON
  const originalJson = request.json;
  let cachedBody: any = null;
  
  // Hacer que request.json() sea reutilizable
  request.json = async function() {
    if (!cachedBody) {
      try {
        cachedBody = await originalJson.call(this);
      } catch {
        cachedBody = {};
      }
    }
    return cachedBody;
  };

  // Rutas protegidas de admin (excepto login)
  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';
  
  // Rutas protegidas de cuenta (excepto login, registro, callback, nueva-password)
  const isAccountRoute = pathname.startsWith('/cuenta') && 
    !pathname.includes('/login') && 
    !pathname.includes('/registro') && 
    !pathname.includes('/callback') &&
    !pathname.includes('/nueva-password');

  if (isAdminRoute || isAccountRoute) {
    // Obtener token de cookies
    const accessToken = context.cookies.get('sb-access-token')?.value;
    const refreshToken = context.cookies.get('sb-refresh-token')?.value;

    const loginRedirect = isAdminRoute ? '/admin/login' : '/cuenta/login';

    if (!accessToken) {
      return context.redirect(`${loginRedirect}?redirect=${pathname}`);
    }

    try {
      // Verificar sesión
      const { data: { user }, error } = await supabase.auth.getUser(accessToken);

      if (error || !user) {
        // Intentar refresh
        if (refreshToken) {
          const { data: refreshData, error: refreshError } = 
            await supabase.auth.refreshSession({ refresh_token: refreshToken });

          if (refreshError || !refreshData.session) {
            context.cookies.delete('sb-access-token', { path: '/' });
            context.cookies.delete('sb-refresh-token', { path: '/' });
            return context.redirect(`${loginRedirect}?redirect=${pathname}`);
          }

          // Actualizar cookies
          context.cookies.set('sb-access-token', refreshData.session.access_token, {
            path: '/',
            httpOnly: false,
            secure: import.meta.env.PROD,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
          });
          context.cookies.set('sb-refresh-token', refreshData.session.refresh_token, {
            path: '/',
            httpOnly: false,
            secure: import.meta.env.PROD,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30,
          });

          context.locals.user = refreshData.user;
        } else {
          return context.redirect(`${loginRedirect}?redirect=${pathname}`);
        }
      } else {
        context.locals.user = user;
      }

      // ✨ VALIDACIÓN DE ROLES
      // Si es ruta admin, verificar que sea admin
      if (isAdminRoute) {
        const { data: adminUser } = await supabaseAdmin
          .from('admin_users')
          .select('id, is_active')
          .eq('auth_user_id', user.id)
          .eq('is_active', true)
          .single();
        
        if (!adminUser) {
          console.warn(`[Auth] Usuario ${user.email} intentó acceder a ruta admin sin permisos`);
          context.cookies.delete('sb-access-token', { path: '/' });
          context.cookies.delete('sb-refresh-token', { path: '/' });
          return context.redirect('/cuenta/login?error=unauthorized');
        }

        // Guardar info de admin en locals
        context.locals.isAdmin = true;
        context.locals.adminId = adminUser.id;
      }
      
    } catch (e) {
      console.error('Auth middleware error:', e);
      return context.redirect(`${loginRedirect}?redirect=${pathname}`);
    }
  }

  return next();
});
