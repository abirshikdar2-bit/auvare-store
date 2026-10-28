'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { ShoppingBag, MessageCircle, X, ChevronRight, Check, Copy } from 'lucide-react';
import type { Product, ProductVariant, GarmentSize, OrderItem } from '@/types';
import { formatBDT, getCleanWaNumber } from '@/lib/utils';

interface StorefrontClientProps {
  initialProducts: Product[];
  siteSettings: Record<string, string>;
}

export function StorefrontClient({ initialProducts, siteSettings }: StorefrontClientProps) {
  // Filters & State
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeSize, setActiveSize] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Per-product selections
  const [selectedSizes, setSelectedSizes] = useState<Record<string, GarmentSize>>({});
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [activeImageIndexes, setActiveImageIndexes] = useState<Record<string, number>>({});

  // Bag / Cart Drawer State
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [bag, setBag] = useState<Array<Product & { cartItemId: string; selectedSize: GarmentSize; selectedVariantName?: string; quantity: number }>>([]);
  const [deliveryZone, setDeliveryZone] = useState<'inside' | 'outside'>('inside');

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad' | 'rocket'>('cod');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ orderId: string; total: number; waText: string } | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    initialProducts.forEach(p => { if (p.category) set.add(p.category); });
    return ['All', ...Array.from(set)];
  }, [initialProducts]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return initialProducts.filter(p => {
      if (activeCategory !== 'All' && p.category !== activeCategory) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCat) return false;
      }
      return true;
    });
  }, [initialProducts, activeCategory, searchQuery]);

  // WhatsApp Concierge Number
  const waNumber = getCleanWaNumber(siteSettings.whatsapp_number || '01734018155');

  // Handle Add to Bag
  const handleAddToBag = (product: Product) => {
    if (product.sold) return;

    const chosenSize = selectedSizes[product.id] || (product.sizes?.[0] as GarmentSize) || 'M';
    const variants = product.variants || [];
    const chosenVariantId = selectedVariants[product.id] || (variants[0]?.id || null);
    const activeVar = variants.find(v => v.id === chosenVariantId);
    const effectivePrice = activeVar?.price || product.price;
    const variantName = activeVar?.name;

    const cartItemId = variantName ? `${product.id}-${chosenSize}-${variantName}` : `${product.id}-${chosenSize}`;

    setBag(prev => {
      const existing = prev.find(i => i.cartItemId === cartItemId);
      if (existing) {
        return prev.map(i => i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        ...product,
        price: effectivePrice,
        cartItemId,
        selectedSize: chosenSize,
        selectedVariantName: variantName,
        quantity: 1,
      }];
    });

    setIsBagOpen(true);
  };

  // Direct WhatsApp Order
  const handleWhatsAppDirect = (product: Product) => {
    const chosenSize = selectedSizes[product.id] || (product.sizes?.[0] as GarmentSize) || 'M';
    const variants = product.variants || [];
    const chosenVariantId = selectedVariants[product.id] || (variants[0]?.id || null);
    const activeVar = variants.find(v => v.id === chosenVariantId);
    const effectivePrice = activeVar?.price || product.price;

    const msg = encodeURIComponent(
      `Hello AUVARE! 🇧🇩 I want to order this 1-of-1 piece:\n\n` +
      `• Product: ${product.title}\n` +
      (activeVar ? `• Variant: ${activeVar.name}\n` : '') +
      `• Size: ${chosenSize}\n` +
      `• Price: ৳${effectivePrice}\n\n` +
      `Please confirm my drop order!`
    );

    window.open(`https://wa.me/${waNumber}?text=${msg}`, '_blank');
  };

  // Calculations
  const bagSubtotal = bag.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryCharge = deliveryZone === 'inside' ? 70 : 130;
  const bagTotal = bagSubtotal + deliveryCharge;

  // Checkout Submission
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bag.length === 0) return;

    setIsSubmitting(true);
    const orderId = `AUV-${Math.floor(100000 + Math.random() * 900000)}`;

    const itemListText = bag.map(c => 
      `• ${c.title}${c.selectedVariantName ? ` [${c.selectedVariantName}]` : ''} (Size: ${c.selectedSize}, ৳${c.price} x${c.quantity})`
    ).join('\n');

    const waText = encodeURIComponent(
      `🛍️ *NEW ORDER CONFIRMED!* [Order #${orderId}]\n\n` +
      `*Customer Details:*\n` +
      `• Name: ${customerName}\n` +
      `• Phone: ${customerPhone}\n` +
      `• Address: ${customerAddress}\n` +
      `• Zone: ${deliveryZone === 'inside' ? 'Inside Dhaka (৳70)' : 'Outside Dhaka (৳130)'}\n\n` +
      `*Ordered Items:*\n${itemListText}\n\n` +
      `*Payment Method:* ${paymentMethod.toUpperCase()}\n` +
      (senderPhone ? `*Sender Phone:* ${senderPhone}\n` : '') +
      (trxId ? `*Transaction ID:* ${trxId}\n` : '') +
      `*Total Bill:* ৳${bagTotal}\n\n` +
      `Please confirm drop dispatch!`
    );

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          deliveryAddress: customerAddress,
          deliveryZone,
          notes: customerNotes,
          paymentMethod,
          paymentSenderNumber: senderPhone || null,
          transactionId: trxId || null,
          items: bag.map(item => ({
            productId: item.id,
            size: item.selectedSize,
            variantId: item.variants?.find(v => v.name === item.selectedVariantName)?.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to place order');
      }

      setOrderSuccess({ orderId, total: bagTotal, waText });
      setBag([]);
      setIsCheckoutOpen(false);
    } catch (err: any) {
      alert(err.message || 'Error creating order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Category Filter & Search Bar */}
      <div className="bg-white border-y border-slate-200 sticky top-16 z-20 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-brand-dark text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search vintage pieces..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="text-xs px-3.5 py-1.5 border border-slate-300 rounded-full w-full md:w-56 focus:outline-none focus:border-brand-primary"
            />
            <button
              type="button"
              onClick={() => setIsBagOpen(true)}
              className="relative p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-800 transition"
              aria-label="Open Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              {bag.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {bag.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="catalog">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-serif text-slate-900">
            {activeCategory === 'All' ? 'Latest Curated Drops' : `${activeCategory} Drop`}
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {filteredProducts.length} authentic piece{filteredProducts.length === 1 ? '' : 's'}
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-4xl mb-3">🧥</p>
            <h3 className="text-lg font-bold text-slate-800">No pieces found</h3>
            <p className="text-sm text-slate-500 mt-1">Try selecting another category or clear your search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => {
              const images = product.images && product.images.length > 0 ? product.images : [product.image];
              const curImgIdx = activeImageIndexes[product.id] || 0;
              const currentImg = images[curImgIdx] || product.image;
              const hasMultiple = images.length > 1;

              const variants = product.variants || [];
              const hasVariants = variants.length > 0;
              const curVarId = selectedVariants[product.id] || (variants[0]?.id || null);
              const activeVar = variants.find(v => v.id === curVarId);
              const effectivePrice = activeVar?.price || product.price;

              const availableSizes = activeVar?.sizes && activeVar.sizes.length > 0
                ? activeVar.sizes
                : (product.sizes || ['S', 'M', 'L', 'XL', 'XXL']);
              const currentSize = selectedSizes[product.id] || availableSizes[0] || 'M';

              return (
                <article
                  key={product.id}
                  className={`bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col ${
                    product.sold ? 'opacity-75' : ''
                  }`}
                >
                  {/* Image Frame */}
                  <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden group">
                    <img
                      src={currentImg}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Badge */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                      {product.sold ? (
                        <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Sold Out
                        </span>
                      ) : (
                        <span className="bg-brand-dark/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
                          {product.category}
                        </span>
                      )}
                    </div>

                    {/* Multi-Image Dots */}
                    {hasMultiple && (
                      <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5 z-10">
                        {images.map((_, dotIdx) => (
                          <button
                            key={dotIdx}
                            type="button"
                            onClick={() => setActiveImageIndexes(prev => ({ ...prev, [product.id]: dotIdx }))}
                            className={`w-2 h-2 rounded-full transition-all ${
                              dotIdx === curImgIdx ? 'bg-brand-light w-4' : 'bg-white/70'
                            }`}
                            aria-label={`Show image ${dotIdx + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-1 mb-1" title={product.title}>
                      {product.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                      {product.description}
                    </p>

                    {/* Variants Chips */}
                    {hasVariants && (
                      <div className="mb-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Variant:
                        </span>
                        <div className="flex gap-1.5 flex-wrap">
                          {variants.map(v => (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => setSelectedVariants(prev => ({ ...prev, [product.id]: v.id }))}
                              className={`text-[11px] px-2.5 py-0.5 rounded border transition-all ${
                                curVarId === v.id
                                  ? 'bg-brand-soft border-brand-primary text-brand-primary font-bold'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {v.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sizing Chips */}
                    <div className="mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Select Size:
                      </span>
                      <div className="flex gap-1 flex-wrap">
                        {availableSizes.map(sz => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setSelectedSizes(prev => ({ ...prev, [product.id]: sz }))}
                            className={`text-[11px] font-bold w-8 h-7 rounded border flex items-center justify-center transition-all ${
                              currentSize === sz
                                ? 'bg-brand-dark border-brand-dark text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Row */}
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 mb-3">
                      <span className="text-base font-extrabold text-brand-dark">
                        {formatBDT(effectivePrice)}
                      </span>
                      <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                        Size: {currentSize}
                      </span>
                    </div>

                    {/* CTA Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={product.sold}
                        onClick={() => handleAddToBag(product)}
                        className={`text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition ${
                          product.sold
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-brand-dark hover:bg-brand-primary text-white'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Bag</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleWhatsAppDirect(product)}
                        className="text-xs font-bold py-2 px-3 rounded-lg border border-emerald-600 text-emerald-700 hover:bg-emerald-50 flex items-center justify-center gap-1 transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Bag / Cart Drawer */}
      {isBagOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsBagOpen(false)}
          />

          <aside className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-brand-dark text-white">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                <h3 className="font-bold text-base">Your Bag</h3>
                <span className="bg-brand-primary text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {bag.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsBagOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {bag.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  <p className="text-4xl mb-2">🛍️</p>
                  <p className="font-bold text-slate-700">Your bag is empty</p>
                  <p className="text-xs text-slate-400 mt-1">Explore our vintage drops and pick your size!</p>
                </div>
              ) : (
                bag.map(item => (
                  <div key={item.cartItemId} className="flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <img src={item.image} alt={item.title} className="w-16 h-20 object-cover rounded bg-slate-200" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                        <div className="flex gap-2 items-center text-[11px] text-slate-500 mt-0.5">
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                            Size: {item.selectedSize}
                          </span>
                          {item.selectedVariantName && (
                            <span className="bg-slate-200 text-slate-700 font-semibold px-1.5 py-0.2 rounded">
                              {item.selectedVariantName}
                            </span>
                          )}
                          <span>x{item.quantity}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-xs text-brand-dark">
                          {formatBDT(item.price * item.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setBag(prev => prev.filter(i => i.cartItemId !== item.cartItemId))}
                          className="text-[11px] text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {bag.length > 0 && (
              <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
                {/* Delivery Zone Toggle */}
                <div className="flex gap-2 p-1 bg-slate-200 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setDeliveryZone('inside')}
                    className={`flex-1 py-1.5 rounded-md transition ${
                      deliveryZone === 'inside' ? 'bg-white shadow text-brand-dark font-bold' : 'text-slate-600'
                    }`}
                  >
                    Inside Dhaka (৳70)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryZone('outside')}
                    className={`flex-1 py-1.5 rounded-md transition ${
                      deliveryZone === 'outside' ? 'bg-white shadow text-brand-dark font-bold' : 'text-slate-600'
                    }`}
                  >
                    Outside Dhaka (৳130)
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>{formatBDT(bagSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery:</span>
                    <span>{formatBDT(deliveryCharge)}</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-brand-dark pt-1 border-t border-slate-200">
                    <span>Total:</span>
                    <span>{formatBDT(bagTotal)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => { setIsBagOpen(false); setIsCheckoutOpen(true); }}
                  className="w-full bg-brand-primary hover:bg-emerald-700 text-white font-bold py-3 rounded-lg text-xs uppercase tracking-wider transition"
                >
                  Proceed to Checkout ({formatBDT(bagTotal)})
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCheckoutOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="font-bold text-base text-brand-dark">Complete Your Order</h3>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="e.g. Md Abir Shikdar"
                  className="w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="01700-000000"
                  className="w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Delivery Address *</label>
                <textarea
                  required
                  rows={2}
                  value={customerAddress}
                  onChange={e => setCustomerAddress(e.target.value)}
                  placeholder="House, Road, Area, Thana, District"
                  className="w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Payment Method *</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['cod', 'bkash', 'nagad', 'rocket'] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`py-2 text-xs font-bold rounded-lg border uppercase transition ${
                        paymentMethod === m
                          ? 'bg-brand-soft border-brand-primary text-brand-primary'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* bKash / Nagad payment number guidance */}
              {paymentMethod !== 'cod' && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs space-y-2">
                  <p className="font-semibold text-amber-900">
                    Send Money to AUVARE {paymentMethod.toUpperCase()}:{' '}
                    <strong className="font-mono text-sm">{siteSettings[`${paymentMethod}_number`] || '01734018155'}</strong>
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Your payment number *"
                      value={senderPhone}
                      onChange={e => setSenderPhone(e.target.value)}
                      className="text-xs p-2 border rounded bg-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="TrxID (Transaction ID) *"
                      value={trxId}
                      onChange={e => setTrxId(e.target.value)}
                      className="text-xs p-2 border rounded bg-white"
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-dark hover:bg-brand-primary text-white font-bold py-3 rounded-lg text-xs uppercase tracking-wider transition"
              >
                {isSubmitting ? 'Processing Order...' : `Confirm Order (${formatBDT(bagTotal)})`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" />
          <div className="relative bg-white w-full max-w-md rounded-xl p-6 text-center z-10 shadow-2xl">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 font-serif">Order Placed Successfully!</h3>
            <p className="text-xs text-slate-500 mt-1">Order #{orderSuccess.orderId}</p>
            <p className="text-sm font-extrabold text-brand-dark mt-2">{formatBDT(orderSuccess.total)}</p>

            <div className="mt-5 space-y-2">
              <a
                href={`https://wa.me/${waNumber}?text=${orderSuccess.waText}`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send Order Copy to AUVARE WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => setOrderSuccess(null)}
                className="w-full py-2 text-xs text-slate-600 hover:underline"
              >
                Close & Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
