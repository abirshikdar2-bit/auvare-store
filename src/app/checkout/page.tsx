'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CartItem } from '@/types';
import { ShopifyCheckoutScreen } from '@/components/checkout/ShopifyCheckoutScreen';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [deliveryZone, setDeliveryZone] = useState<'inside' | 'outside'>('inside');
  const [orderSuccess, setOrderSuccess] = useState<{ orderId: string; total: number; waText: string } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('auvare_cart_bag');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
        }
      }
    } catch {}
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#105036]" />
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 border border-gray-200 shadow-xl text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-xs text-gray-500 mb-4">Order ID: <span className="font-mono font-bold text-gray-800">{orderSuccess.orderId}</span></p>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Thank you for claiming this 1-of-1 curated vintage drop. We are preparing it for express dispatch!
          </p>
          <div className="space-y-3">
            <a
              href={`https://wa.me/8801734018155?text=${orderSuccess.waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition"
            >
              <span>Confirm Order on WhatsApp</span>
            </a>
            <Link
              href="/"
              className="block w-full py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition"
            >
              Continue Browsing Drops
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-gray-900 mb-2">Your Bag is Empty</h1>
        <p className="text-sm text-gray-500 max-w-sm mb-6">
          Explore our latest 1-of-1 vintage and preloved garments drop and claim your piece before someone else does!
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0b1a13] hover:bg-[#105036] text-white font-bold text-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explore Vintage Drops</span>
        </Link>
      </div>
    );
  }

  return (
    <ShopifyCheckoutScreen
      items={items}
      deliveryZone={deliveryZone}
      setDeliveryZone={setDeliveryZone}
      onClose={() => router.push('/')}
      onOrderSuccess={(data) => {
        setOrderSuccess(data);
        localStorage.removeItem('auvare_cart_bag');
      }}
    />
  );
}
