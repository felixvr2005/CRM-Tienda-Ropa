/**
 * API: Login
 * Usa un cliente Supabase efímero para no contaminar el singleton del servidor
 */
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

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
    
    // IMPORTANTE: Crear un cliente efímero para signIn
    // NUNCA usar el singleton del servidor para auth mutations
    const ephemeralClient = createClient(
      import.meta.env.PUBLIC_SUPABASE_URL || '',
      import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '',
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    
    const { data, error } = await ephemeralClient.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 401 }
      );
    }
    
    // Set auth cookies (nombre correcto: sb-access-token)
    if (data.session) {
      cookies.set('sb-access-token', data.session.access_token, {
        path: '/',
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      cookies.set('sb-refresh-token', data.session.refresh_token, {
        path: '/',
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }
    
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
