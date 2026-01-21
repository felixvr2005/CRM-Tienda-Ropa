import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@lib/supabase';

export const PATCH: APIRoute = async ({ request, params }) => {
  try {
    const { id } = params;
    const { status, notes } = await request.json();

    if (!id || !status) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    const validStatuses = ['pending', 'approved', 'shipped', 'received', 'refunded', 'rejected'];
    if (!validStatuses.includes(status)) {
      return new Response(JSON.stringify({ error: 'Invalid status' }), { status: 400 });
    }

    const { data: currentReturn } = await supabaseAdmin
      .from('return_requests')
      .select('*')
      .eq('id', id)
      .single() as any;

    if (!currentReturn) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    }

    await supabaseAdmin
      .from('return_requests')
      .update({
        status,
        admin_notes: notes || currentReturn.admin_notes,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', id);

    // Auto-create credit note on received
    if (status === 'received' && !currentReturn.credit_note_id) {
      const { data: creditNote } = await supabaseAdmin
        .from('credit_notes')
        .insert({
          return_request_id: id,
          original_order_id: currentReturn.order_id,
          refund_amount: Math.round(currentReturn.requested_amount * 100),
          status: 'pending'
        } as any)
        .select()
        .single() as any;

      if (creditNote) {
        await supabaseAdmin
          .from('return_requests')
          .update({ credit_note_id: creditNote.id } as any)
          .eq('id', id);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Estado actualizado a ${status}`
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error updating status' }), { status: 500 });
  }
};
