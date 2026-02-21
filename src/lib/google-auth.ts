/**
 * Google Identity Services (GIS) + Supabase signInWithIdToken
 * 
 * Bypass completo del callback OAuth de Supabase.
 * En vez de redirigir al usuario a través de:
 *   App → Supabase → Google → Supabase/callback (500 error) → App
 * 
 * Usamos:
 *   App → Google popup (GIS) → ID Token → Supabase signInWithIdToken → Sesión
 * 
 * Esto evita por completo el endpoint /auth/v1/callback de Supabase.
 */
import { supabase } from './supabase';

// Google Client ID — público, seguro de exponer en frontend
const GOOGLE_CLIENT_ID = '144455121113-o9mjihcje3d397mu4pn9n0mf4i1up5i9.apps.googleusercontent.com';

// Declarar tipos globales para GIS
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

/**
 * Carga el script de Google Identity Services de forma dinámica.
 * Retorna una promesa que se resuelve cuando el script está cargado.
 */
function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Si ya está cargado, resolver inmediatamente
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    // Verificar si el script ya está en el DOM
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      // Si ya está cargado pero google no está definido, esperar un poco
      if (window.google?.accounts?.id) {
        resolve();
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Pequeño delay para asegurar que google.accounts.id esté disponible
      const check = () => {
        if (window.google?.accounts?.id) {
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    };
    script.onerror = () => reject(new Error('No se pudo cargar Google Identity Services'));
    document.head.appendChild(script);
  });
}

interface GoogleAuthCallbacks {
  onSuccess: (data: { user: any; session: any }) => void | Promise<void>;
  onError: (error: Error) => void;
}

/**
 * Procesa el credential de Google: crea sesión en Supabase + cookies + perfil.
 */
async function handleGoogleCredential(
  credential: string,
  callbacks: GoogleAuthCallbacks
): Promise<void> {
  try {
    // Intercambiar ID token de Google por sesión de Supabase
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: credential,
    });

    if (error) throw error;
    if (!data.session || !data.user) throw new Error('No se recibió sesión de Supabase');

    // Guardar cookies para SSR
    document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;

    // Crear perfil de cliente si no existe
    try {
      const fullName = data.user.user_metadata?.full_name || data.user.user_metadata?.name || '';
      const nameParts = fullName.split(' ');
      await fetch('/api/auth/ensure-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: data.user.id,
          email: data.user.email,
          firstName: nameParts[0] || 'Cliente',
          lastName: nameParts.slice(1).join(' ') || '',
        }),
      });
    } catch (e) {
      console.warn('No se pudo crear/verificar perfil de cliente:', e);
    }

    await callbacks.onSuccess({ user: data.user, session: data.session });
  } catch (err: any) {
    console.error('Error en Google Sign-In:', err);
    callbacks.onError(err instanceof Error ? err : new Error(err.message || 'Error desconocido'));
  }
}

/**
 * Inicializa el botón de Google Sign-In en un contenedor específico.
 * Renderiza el botón oficial de Google usando GIS renderButton.
 * 
 * @param containerId - ID del elemento HTML donde renderizar el botón
 * @param callbacks - Funciones de éxito y error
 * @param buttonText - Texto del botón ('continue_with' | 'signup_with' | 'signin_with')
 */
export async function initGoogleSignIn(
  containerId: string,
  callbacks: GoogleAuthCallbacks,
  buttonText: 'continue_with' | 'signup_with' | 'signin_with' = 'continue_with'
): Promise<void> {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Contenedor #${containerId} no encontrado`);
    return;
  }

  try {
    await loadGoogleScript();

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: { credential: string }) => {
        handleGoogleCredential(response.credential, callbacks);
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    // Renderizar el botón oficial de Google
    window.google.accounts.id.renderButton(container, {
      theme: 'outline',
      size: 'large',
      text: buttonText,
      shape: 'rectangular',
      logo_alignment: 'left',
      width: Math.min(container.offsetWidth || 380, 400),
    });
  } catch (err) {
    console.error('Error cargando Google Sign-In:', err);
    // Mostrar fallback: un botón deshabilitado con mensaje de error
    container.innerHTML = `
      <button type="button" disabled
        class="w-full border border-red-200 bg-red-50 py-3 text-sm flex items-center justify-center gap-3 rounded text-red-500 cursor-not-allowed">
        <svg class="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google no disponible — usa email
      </button>
    `;
  }
}
