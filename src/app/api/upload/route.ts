import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `drop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;

    // Upload to Supabase Storage bucket 'product-images'
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, buffer, {
        contentType: file.type || 'image/jpeg',
        cacheControl: '31536000',
        upsert: false,
      });

    if (error) {
      console.warn('[Upload API] Supabase storage error:', error);
      // If bucket is not public or created yet, inform with clean error
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err: any) {
    console.error('[Upload API Exception]:', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
