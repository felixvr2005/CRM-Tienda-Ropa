/**
 * API: Logout
 * Cierra sesión y redirige al login correspondiente (admin o cliente)
 * NOTA: NO llamar signOut() en el singleton del servidor — solo limpiar cookies
 */
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ cookies, url }) => {
  const userType = url.searchParams.get('type') || 'customer';
  
  try {
    // Eliminar TODAS las cookies de sesión (no llamar signOut en el singleton)
    cookies.delete('sb-auth-token', { path: '/' });
    cookies.delete('sb-access-token', { path: '/' });
    cookies.delete('sb-refresh-token', { path: '/' });
    
    // Determinar URL de redirección según el tipo de usuario
    const redirectUrl = userType === 'admin' ? '/admin/login' : '/cuenta/login';
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl,
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Clear-Site-Data': '"cookies", "storage"',
      }
    });
  } catch (error) {
    // En caso de error, redirigir al login de cliente por defecto
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/cuenta/login'
      }
    });
  }
};

export const POST: APIRoute = async ({ cookies, request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const userType = body.type || 'customer';
    
    // Solo limpiar cookies, NO llamar signOut() en el singleton
    cookies.delete('sb-auth-token', { path: '/' });
    cookies.delete('sb-access-token', { path: '/' });
    cookies.delete('sb-refresh-token', { path: '/' });
    
    // Determinar URL de redirección según el tipo de usuario
    const redirectUrl = userType === 'admin' ? '/admin/login' : '/cuenta/login';
    
    return new Response(
      JSON.stringify({ success: true, redirectUrl }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Error del servidor', redirectUrl: '/cuenta/login' }),
      { status: 500 }
    );
  }
};
