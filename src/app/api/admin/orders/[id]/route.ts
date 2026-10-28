import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    const supabase = await createClient();

    // Supabase table may use order_id or id or orderStatus
    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        order_status: status,
        orderStatus: status,
        updated_at: new Date().toISOString(),
      })
      .or(`id.eq.${id},order_id.eq.${id},orderId.eq.${id}`)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, order: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
