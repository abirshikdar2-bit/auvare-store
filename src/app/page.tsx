import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Instagram, Phone, ShieldCheck } from 'lucide-react';
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
      <div className="bg-brand-dark text-white text-[11px] py-1.5 px-4 text-center font-medium tracking-wide border-b border-white/10 flex items-center justify-center gap-2">
        <span>🇧🇩 Authentic Curated Vintage &amp; Preloved Drops • Nationwide Cash on Delivery &amp; bKash</span>
      </div>

      {/* Main Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/assets/images/logo.jpg" alt="AUVARE Crest" className="w-8 h-8 rounded-full border border-slate-200" />
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg tracking-wider text-brand-dark leading-none">AUVARE</span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold mt-0.5">Curated Archive</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <a
              href={siteSettings.instagram_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-600 hover:text-brand-dark flex items-center gap-1 font-semibold transition"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{siteSettings.instagram_handle}</span>
            </a>

            <Link
              href="/admin"
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-semibold transition"
            >
              Admin Portal ↗
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-slate-100 to-white py-12 px-4 border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-brand-soft text-brand-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3">
            1-of-1 Archival Vintage Drops
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-brand-dark tracking-tight leading-tight">
            Curated Vintage &amp; Pre-Loved Clothing
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mt-3">
            Hand-selected archival tees, heavy-weight outerwear, and washed denim. Available across sizes S, M, L, XL, and XXL with zero fast-fashion compromises.
          </p>

          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Authenticity Verified</span>
            <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-emerald-600" /> WhatsApp Direct Concierge</span>
          </div>
        </div>
      </section>

      {/* Dynamic Interactive Catalog Client Component */}
      <StorefrontClient initialProducts={products} siteSettings={siteSettings} />

      {/* Footer */}
      <footer className="mt-auto bg-brand-dark text-white border-t border-slate-800 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
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
