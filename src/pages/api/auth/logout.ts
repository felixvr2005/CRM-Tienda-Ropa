/**
 * API: Logout
 * Cierra sesión y redirige al login correspondiente (admin o cliente)
 */
import type { APIRoute } from 'astro';
import { supabase } from '@lib/supabase';

export const prerender = false;

export const GET: APIRoute = async ({ cookies, url }) => {
  const userType = url.searchParams.get('type') || 'customer';
  
  try {
    await supabase.auth.signOut();
    
    // Eliminar todas las cookies de sesión
    cookies.delete('sb-auth-token', { path: '/' });
    cookies.delete('sb-access-token', { path: '/' });
    cookies.delete('sb-refresh-token', { path: '/' });
    
    // Determinar URL de redirección según el tipo de usuario
    const redirectUrl = userType === 'admin' ? '/admin/login' : '/cuenta/login';
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl
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
    
    await supabase.auth.signOut();
    
    // Eliminar todas las cookies de sesión
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
