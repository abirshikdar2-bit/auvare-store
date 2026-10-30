import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { parseSupabaseProduct, formatProductForSupabase } from '@/lib/supabase/products';

const createProductSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, 'Title is required'),
  description: z.string().default(''),
  category: z.string().default('T-Shirts'),
  price: z.number().int().positive('Price must be greater than 0'),
  chest: z.string().optional(),
  length: z.string().optional(),
  condition: z.string().default('9.5/10 (Mint Condition)'),
  status: z.enum(['available', 'sold', 'archived']).default('available'),
  image: z.string().min(1, 'Primary image required'),
  images: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default(['S', 'M', 'L', 'XL', 'XXL']),
  variants: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      price: z.number().nullable().optional(),
      sizes: z.array(z.string()),
      status: z.string().default('available'),
    })
  ).default([]),
  instagramUrl: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const products = (data || []).map(parseSupabaseProduct);
    return NextResponse.json({ success: true, products });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createProductSchema.parse(body);

    const supabase = await createClient();

    // Format strictly for Supabase PostgreSQL schema
    const payload = formatProductForSupabase({
      id: validated.id,
      title: validated.title,
      description: validated.description,
      category: validated.category,
      price: validated.price,
      chest: validated.chest,
      length: validated.length,
      condition: validated.condition,
      status: validated.status,
      sold: validated.status === 'sold',
      image: validated.image,
      images: validated.images,
      sizes: validated.sizes as any,
      variants: validated.variants as any,
      instagramUrl: validated.instagramUrl || undefined,
    });

    const { data, error } = await supabase
      .from('products')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('[Admin Products POST Error]:', error);
      throw error;
    }

    const createdProduct = parseSupabaseProduct(data);

    // Instantly invalidate caches so public storefront and admin show the drop immediately
    try {
      revalidatePath('/');
      revalidatePath('/admin');
    } catch {}

    return NextResponse.json({ success: true, product: createdProduct }, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 422 });
    }
    console.error('[Admin Products POST Exception]:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
