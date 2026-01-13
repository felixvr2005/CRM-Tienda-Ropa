/**
 * API: Login
 */
import type { APIRoute } from 'astro';
import { supabase } from '@lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email y contraseña son requeridos' }),
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 401 }
      );
    }
    
    // Set auth cookie
    cookies.set('sb-auth-token', data.session?.access_token || '', {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Error del servidor' }),
      { status: 500 }
    );
  }
};
