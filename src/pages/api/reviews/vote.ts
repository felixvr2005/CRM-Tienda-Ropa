/**
 * API: Votos de reviews (útil/no útil)
 * POST /api/reviews/vote - Votar una review como útil
 */
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@lib/supabase';
import { logger } from '@lib/logger';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { review_id, visitor_id } = await request.json();

    if (!review_id || !visitor_id) {
      return new Response(
        JSON.stringify({ error: 'review_id y visitor_id son requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar si ya votó
    const { data: existing } = await supabaseAdmin
      .from('review_votes')
      .select('id')
      .eq('review_id', review_id)
      .eq('visitor_id', visitor_id)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ error: 'Ya has votado esta reseña', already_voted: true }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Insertar voto
    const { error: voteError } = await supabaseAdmin
      .from('review_votes')
      .insert({ review_id, visitor_id });

    if (voteError) throw voteError;

    // Incrementar helpful_count en la review
    const { data: review } = await supabaseAdmin
      .from('reviews')
      .select('helpful_count')
      .eq('id', review_id)
      .single();

    if (review) {
      await supabaseAdmin
        .from('reviews')
        .update({ helpful_count: (review.helpful_count || 0) + 1 })
        .eq('id', review_id);
    }

    logger.info('[ReviewVotes] Vote recorded', { review_id, visitor_id });
    return new Response(
      JSON.stringify({ success: true }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    logger.error('[ReviewVotes] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
