/**
 * Auth Middleware
 * Protege rutas /admin y /cuenta requiriendo autenticación
 */
import { defineMiddleware } from 'astro:middleware';
import { supabase } from './lib/supabase';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

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
    } catch (e) {
      console.error('Auth middleware error:', e);
      return context.redirect(`${loginRedirect}?redirect=${pathname}`);
    }
  }

  return next();
});
