/**
 * Middleware de autenticación para rutas admin
 * Protege /admin/* y /api/admin/* con múltiples capas de verificación:
 *  1. Validación local del JWT (formato + expiración)
 *  2. Verificación remota con Supabase Auth
 *  3. Comprobación de rol admin en tabla admin_users
 *  4. Headers anti-cache y de seguridad en todas las respuestas admin
 */
import { defineMiddleware } from 'astro:middleware';
import { supabase, supabaseAdmin } from '@lib/supabase';

/** Cabeceras de seguridad aplicadas a TODA respuesta admin */
const SECURITY_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

/**
 * Decodifica un JWT y devuelve el payload sin verificar firma
 * (la firma la verifica Supabase). Útil para comprobar expiración local.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/** Normaliza pathname para comparación (sin trailing slash, salvo '/') */
function normalizePath(p: string): string {
  if (p === '/') return p;
  return p.endsWith('/') ? p.slice(0, -1) : p;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const rawPathname = context.url.pathname;
  const pathname = normalizePath(rawPathname);

  // ── Determinar si la ruta es admin ─────────────────────────────────
  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi  = pathname.startsWith('/api/admin');
  const isAdminRoute = isAdminPage || isAdminApi;

  // Rutas públicas dentro del área admin
  const EXCLUDED_PATHS = ['/admin/login', '/api/admin/check-auth'];
  const isExcluded = EXCLUDED_PATHS.includes(pathname);

  // Si no es ruta admin, pasar directamente
  if (!isAdminRoute) {
    return next();
  }

  // Si es una ruta excluida (login, check-auth), dejar pasar pero añadir headers
  if (isExcluded) {
    const response = await next();
    if (isAdminPage) {
      Object.entries(SECURITY_HEADERS).forEach(([k, v]) =>
        response.headers.set(k, v)
      );
    }
    return response;
  }

  // ── Helpers ────────────────────────────────────────────────────────
  /** Limpia cookies de sesión inválidas */
  const clearAuthCookies = () => {
    context.cookies.delete('sb-access-token', { path: '/' });
    context.cookies.delete('sb-refresh-token', { path: '/' });
  };

  /** Deniega el acceso (API → JSON, Página → redirect) */
  const denyAccess = (message: string, status = 401): Response => {
    if (isAdminApi) {
      return new Response(JSON.stringify({ error: message }), {
        status,
        headers: {
          'Content-Type': 'application/json',
          ...SECURITY_HEADERS,
        },
      });
    }
    // Limpiar cookies inválidas para evitar loops
    if (status === 401) clearAuthCookies();
    return context.redirect('/admin/login');
  };

  try {
    // ── 1. Obtener token de la cookie ──────────────────────────────
    const token = context.cookies.get('sb-access-token')?.value;

    if (!token || token.trim() === '') {
      console.warn('[middleware] Acceso admin sin token:', pathname);
      return denyAccess('No autenticado');
    }

    // ── 2. Validación local del JWT (formato + expiración) ─────────
    const payload = decodeJwtPayload(token);
    if (!payload) {
      console.warn('[middleware] JWT con formato inválido:', pathname);
      return denyAccess('Token con formato inválido');
    }

    const exp = payload.exp as number | undefined;
    if (exp && exp < Math.floor(Date.now() / 1000)) {
      console.warn('[middleware] JWT expirado:', pathname);
      return denyAccess('Token expirado');
    }

    // ── 3. Verificación remota del token con Supabase Auth ─────────
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.warn('[middleware] Token rechazado por Supabase:', pathname, authError?.message);
      return denyAccess('Token inválido');
    }

    // ── 4. Verificar que el usuario es admin activo en BD ──────────
    const { data: adminUser, error: dbError } = await supabaseAdmin
      .from('admin_users')
      .select('id, is_active')
      .eq('auth_user_id', user.id)
      .eq('is_active', true)
      .single();

    if (dbError || !adminUser) {
      console.warn(`[middleware] Usuario ${user.email} NO es admin activo:`, pathname);
      return denyAccess('Acceso denegado — no es admin', 403);
    }

    // ── Admin verificado ✓ — Ejecutar la ruta y añadir headers ─────
    const response = await next();

    // Añadir headers de seguridad y anti-cache a TODA respuesta admin
    Object.entries(SECURITY_HEADERS).forEach(([k, v]) =>
      response.headers.set(k, v)
    );

    return response;
  } catch (err) {
    // Si hay CUALQUIER error inesperado, JAMÁS dejar pasar
    console.error('[middleware] Error inesperado verificando auth admin:', err);
    clearAuthCookies();
    return denyAccess('Error de autenticación', 500);
  }
});
