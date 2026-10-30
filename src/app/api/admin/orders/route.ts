import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseSupabaseOrder } from '@/lib/supabase/products';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Global server in-memory status overrides for instant sync across admin sessions
declare global {
  var __auvare_order_statuses: Record<string, string> | undefined;
}
globalThis.__auvare_order_statuses = globalThis.__auvare_order_statuses || {};

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Admin Orders GET] Supabase error:', error);
      throw error;
    }

    const statuses = globalThis.__auvare_order_statuses || {};
    const orders = (data || []).map((row) => {
      const parsed = parseSupabaseOrder(row);
      const override = statuses[parsed.id] || statuses[parsed.orderId || ''];
      if (override) {
        parsed.status = override as any;
        parsed.orderStatus = override as any;
      }
      return parsed;
    });

    return NextResponse.json(
      { success: true, orders },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
