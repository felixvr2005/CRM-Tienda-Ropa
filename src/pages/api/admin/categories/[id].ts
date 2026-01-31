/**
 * API: Actualizar categoría
 * PATCH /api/admin/categories/:id
 */
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@lib/supabase';

export const PATCH: APIRoute = async ({ request, params }) => {
  try {
    const { id } = params;
    const data = await request.json();

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID requerido' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const { name, slug, description, image_url, sort_order, is_active } = data;

    if (!name || !slug) {
      return new Response(JSON.stringify({ error: 'Nombre y slug son requeridos' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const { error } = await supabaseAdmin
      .from('categories')
      .update({
        name,
        slug,
        description,
        image_url,
        sort_order: sort_order || 0,
        is_active: is_active ?? true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Categoría actualizada' 
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Error interno' }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
};
