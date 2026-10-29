import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { StorefrontClient } from '@/components/storefront/StorefrontClient';
import type { Product } from '@/types';

export const revalidate = 60; // Incremental Static Regeneration every 60 seconds

export default async function HomePage() {
  const supabase = await createClient();

  // 1. Fetch live products strictly from Supabase
  const { data: rawProducts, error: prodErr } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (prodErr) {
    console.warn('[HomePage] Supabase fetch error:', prodErr);
  }

  // 2. Fetch live settings strictly from Supabase
  const { data: rawSettings } = await supabase
    .from('site_settings')
    .select('*');

  const siteSettings: Record<string, string> = {
    whatsapp_number: '01734018155',
    bkash_number: '01734018155',
    nagad_number: '01734018155',
    instagram_handle: '@auvare_official',
    instagram_url: 'https://www.instagram.com/auvare_official/',
  };

  if (rawSettings && Array.isArray(rawSettings)) {
    rawSettings.forEach((row: any) => {
      if (row.key && row.value) {
        siteSettings[row.key] = row.value;
      }
    });
  }

  // Format products
  const products: Product[] = (rawProducts || []).map((row: any) => {
    let images: string[] = [];
    if (Array.isArray(row.images)) images = row.images;
    else if (typeof row.images === 'string') {
      try { images = JSON.parse(row.images); } catch { images = []; }
    }

    let variants: any[] = [];
    if (Array.isArray(row.variants)) variants = row.variants;
    else if (typeof row.variants === 'string') {
      try { variants = JSON.parse(row.variants); } catch { variants = []; }
    }

    let sizes: any[] = ['S', 'M', 'L', 'XL', 'XXL'];
    if (Array.isArray(row.sizes)) sizes = row.sizes;
    else if (typeof row.sizes === 'string') {
      try { sizes = JSON.parse(row.sizes); } catch {}
    }

    return {
      id: row.id,
      title: row.title,
      description: row.description || '',
      category: row.category || 'T-Shirts',
      price: typeof row.price === 'number' ? row.price : parseInt(row.price || '0', 10),
      chest: row.chest,
      length: row.length,
      condition: row.condition || '9.5/10 (Mint Condition)',
      status: (row.status || (row.sold ? 'sold' : 'available')) as any,
      sold: !!row.sold,
      image: row.image || images[0] || '/assets/images/logo.jpg',
      images: images.length > 0 ? images : [row.image || '/assets/images/logo.jpg'],
      sizes,
      variants,
      instagramUrl: row.instagramUrl || row.instagram_url,
      createdAt: row.created_at,
    };
  });

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <StorefrontClient initialProducts={products} siteSettings={siteSettings} />
    </main>
  );
}
