import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { parseSupabaseProduct, formatProductForSupabase } from '@/lib/supabase/products';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: parseSupabaseProduct(data) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const supabase = await createClient();

    // Format strictly for Supabase PostgreSQL schema
    const formatted = formatProductForSupabase({
      ...body,
      id,
    });

    // Exclude 'id' and 'created_at' from update payload
    const { id: _id, created_at: _cat, ...updateFields } = formatted;

    const { data, error } = await supabase
      .from('products')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Admin Products PUT Error]:', error);
      throw error;
    }

    try {
      revalidatePath('/');
      revalidatePath('/admin');
    } catch {}

    return NextResponse.json({ success: true, product: parseSupabaseProduct(data) });
  } catch (err: any) {
    console.error('[Admin Products PUT Exception]:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Admin Products DELETE Error]:', error);
      throw error;
    }

    try {
      revalidatePath('/');
      revalidatePath('/admin');
    } catch {}

    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (err: any) {
    console.error('[Admin Products DELETE Exception]:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
