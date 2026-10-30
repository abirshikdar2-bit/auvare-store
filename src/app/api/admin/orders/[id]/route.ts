import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

declare global {
  var __auvare_order_statuses: Record<string, string> | undefined;
}
globalThis.__auvare_order_statuses = globalThis.__auvare_order_statuses || {};

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Record in global server status map
    globalThis.__auvare_order_statuses = globalThis.__auvare_order_statuses || {};
    globalThis.__auvare_order_statuses[id] = status;

    const supabase = await createClient();

    // Update in Supabase cloud PostgreSQL
    const isNumeric = /^\d+$/.test(id);
    let query = supabase.from('orders').update({ order_status: status });
    if (isNumeric) {
      query = query.or(`id.eq.${id},order_id.eq.${id}`);
    } else {
      query = query.eq('order_id', id);
    }

    const { data, error } = await query.select();
    if (error) {
      console.warn('[Admin Order Status PATCH] Supabase update warning:', error);
    }

    try {
      revalidatePath('/admin');
    } catch {}

    return NextResponse.json({
      success: true,
      order: data?.[0] || { id, order_status: status },
    });
  } catch (err: any) {
    console.error('[Admin Order Status PATCH Exception]:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
