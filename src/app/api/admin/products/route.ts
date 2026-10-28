import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const createProductSchema = z.object({
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
    return NextResponse.json({ success: true, products: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createProductSchema.parse(body);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .insert([{
        title: validated.title,
        description: validated.description,
        category: validated.category,
        price: validated.price,
        chest: validated.chest || null,
        length: validated.length || null,
        condition: validated.condition,
        status: validated.status,
        sold: validated.status === 'sold',
        image: validated.image,
        images: validated.images,
        sizes: validated.sizes,
        variants: validated.variants,
        instagram_url: validated.instagramUrl || null,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, product: data }, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 422 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
