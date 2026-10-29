import React from 'react';
import Link from 'next/link';
import { Instagram } from 'lucide-react';
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
    <div className="flex flex-col min-h-screen">
      {/* Top Notice Bar */}
      <div className="bg-[#0b1a13] text-white text-[11px] py-1.5 px-4 text-center font-medium tracking-wide border-b border-white/10 flex items-center justify-center gap-2">
        <span>Authentic Curated Vintage &amp; Preloved Drops • Nationwide Cash on Delivery &amp; bKash</span>
      </div>

      {/* Main Navigation Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/assets/images/logo.jpg" alt="AUVARE Crest" className="w-8 h-8 rounded-full border border-stone-200" />
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg tracking-wider text-[#0b1a13] leading-none">AUVARE</span>
              <span className="text-[9px] uppercase tracking-widest text-stone-400 font-semibold mt-0.5">Curated Archive</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <a
              href={siteSettings.instagram_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1 font-semibold transition"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{siteSettings.instagram_handle}</span>
            </a>

            <Link
              href="/admin"
              className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-800 px-3.5 py-1.5 rounded-lg font-semibold transition border border-stone-200"
            >
              Admin Portal ↗
            </Link>
          </div>
        </div>
      </header>

      {/* Dynamic Interactive Catalog Client Component (Including Hero & Mediasoft Widget) */}
      <StorefrontClient initialProducts={products} siteSettings={siteSettings} />

      {/* Footer */}
      <footer className="mt-auto bg-[#0b1a13] text-white border-t border-stone-800 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-white text-sm">AUVARE</span>
            <span>• Curated Vintage Drops in Bangladesh</span>
          </div>
          <div>
            © {new Date().getFullYear()} AUVARE. Built with Next.js 15, Tailwind CSS, TypeScript &amp; Supabase.
          </div>
        </div>
      </footer>
    </div>
  );
}
