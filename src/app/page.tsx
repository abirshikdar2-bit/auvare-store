import React from 'react';
import { createPublicClient } from '@/lib/supabase/public';
import { StorefrontClient } from '@/components/storefront/StorefrontClient';
import { parseSupabaseProduct } from '@/lib/supabase/products';
import type { Product } from '@/types';

// Incremental Static Regeneration: Cache pre-rendered static HTML on Vercel CDN, revalidating every 60s
export const revalidate = 60;

export default async function HomePage() {
  const supabase = createPublicClient();

  // Fetch live products and store contact info concurrently in parallel
  const [prodRes, contactRes] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('store_contact_info')
      .select('*')
      .eq('id', 'main')
      .maybeSingle(),
  ]);

  const rawProducts = prodRes.data || [];
  if (prodRes.error) {
    console.warn('[HomePage] Supabase products error:', prodRes.error);
  }

  const contactData = (contactRes.data || {}) as Record<string, any>;

  const siteSettings: Record<string, string> = {
    whatsapp_number: contactData.whatsapp_number ? contactData.whatsapp_number.trim() : '01734018155',
    bkash_number: contactData.bkash_number ? contactData.bkash_number.trim() : '01734018155',
    nagad_number: contactData.nagad_number ? contactData.nagad_number.trim() : '01734018155',
    instagram_handle: contactData.instagram_handle || '@auvare_official',
    instagram_url: contactData.instagram_url || 'https://www.instagram.com/auvare_official/',
    email: contactData.email || 'abirshikdar2@gmail.com',
    call_number: contactData.call_number || contactData.phone || '01734018155',
    facebook_url: contactData.facebook_url || contactData.messenger_url || 'https://www.facebook.com/share/1JoPNYsMNz/?mibextid=wwXIfr',
  };

  // Authoritative parsing with embedded variants & multi-image support
  const products: Product[] = rawProducts.map(parseSupabaseProduct);

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <StorefrontClient initialProducts={products} siteSettings={siteSettings} />
    </main>
  );
}
