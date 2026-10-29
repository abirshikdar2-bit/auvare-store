'use client';

import React, { useState, useMemo } from 'react';
import { ShoppingBag, MessageCircle, X, ChevronRight, Check, Copy, Zap, ArrowRight, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import type { Product, ProductVariant, GarmentSize } from '@/types';
import { formatBDT, getCleanWaNumber } from '@/lib/utils';
import { HeroReelsSlider } from './HeroReelsSlider';
import { ProductDetailModal } from './ProductDetailModal';
import { MediasoftWidget } from './MediasoftWidget';

interface StorefrontClientProps {
  initialProducts: Product[];
  siteSettings: Record<string, string>;
}

export function StorefrontClient({ initialProducts, siteSettings }: StorefrontClientProps) {
  // Navigation & Category Filter
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active Product Modal (Sailor style zoom screen)
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);

  // Bag / Cart State
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [bag, setBag] = useState<Array<Product & {
    cartItemId: string;
    selectedSize: GarmentSize;
    selectedVariantName?: string;
    quantity: number;
  }>>([]);
  const [deliveryZone, setDeliveryZone] = useState<'inside' | 'outside'>('inside');

  // Checkout State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [directCheckoutItem, setDirectCheckoutItem] = useState<{
    product: Product;
    selectedSize: GarmentSize;
    selectedVariant?: ProductVariant;
  } | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad' | 'rocket'>('cod');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ orderId: string; total: number; waText: string } | null>(null);

  // Dynamic Categories from Supabase products
  const categories = useMemo(() => {
    const set = new Set<string>();
    initialProducts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [initialProducts]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((p) => {
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

  const waNumber = getCleanWaNumber(siteSettings.whatsapp_number || '01734018155');

  // Add to Bag handler
  const handleAddToBag = (product: Product, size: GarmentSize, variant?: ProductVariant) => {
    if (product.sold) return;

    const chosenSize = size || (product.sizes?.[0] as GarmentSize) || 'M';
    const effectivePrice = variant?.price || product.price;
    const variantName = variant?.name;
    const cartItemId = variantName ? `${product.id}-${chosenSize}-${variantName}` : `${product.id}-${chosenSize}`;

    setBag((prev) => {
      const existing = prev.find((i) => i.cartItemId === cartItemId);
      if (existing) {
        return prev.map((i) => (i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [
        ...prev,
        {
          ...product,
          price: effectivePrice,
          cartItemId,
          selectedSize: chosenSize,
          selectedVariantName: variantName,
          quantity: 1,
        },
      ];
    });

    setIsBagOpen(true);
  };

  // Direct Buy Now handler (bypasses bag)
  const handleBuyNow = (product: Product, size: GarmentSize, variant?: ProductVariant) => {
    if (product.sold) return;
    setDirectCheckoutItem({ product, selectedSize: size, selectedVariant: variant });
    setIsCheckoutOpen(true);
  };

  // Calculations
  const checkoutItems = directCheckoutItem
    ? [
        {
          ...directCheckoutItem.product,
          price: directCheckoutItem.selectedVariant?.price || directCheckoutItem.product.price,
          selectedSize: directCheckoutItem.selectedSize,
          selectedVariantName: directCheckoutItem.selectedVariant?.name,
          quantity: 1,
        },
      ]
    : bag;

  const bagSubtotal = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = deliveryZone === 'inside' ? 70 : 130;
  const bagTotal = bagSubtotal + deliveryCharge;

  // Checkout submission
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkoutItems.length === 0) return;

    setIsSubmitting(true);
    const orderId = `AUV-${Math.floor(100000 + Math.random() * 900000)}`;

    const itemListText = checkoutItems
      .map(
        (c) =>
          `• ${c.title}${c.selectedVariantName ? ` [${c.selectedVariantName}]` : ''} (Size: ${c.selectedSize}, ৳${c.price} x${c.quantity})`
      )
      .join('\n');

    const waText = encodeURIComponent(
      `*NEW ORDER CONFIRMED!* [Order #${orderId}]\n\n` +
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
          items: checkoutItems.map((item) => ({
            productId: item.id,
            size: item.selectedSize,
            variantId: item.variants?.find((v) => v.name === item.selectedVariantName)?.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to place order');
      }

      setOrderSuccess({ orderId, total: bagTotal, waText });
      if (!directCheckoutItem) {
        setBag([]);
      }
      setDirectCheckoutItem(null);
      setIsCheckoutOpen(false);
    } catch (err: any) {
      alert(err.message || 'Error creating order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero Section with Reels Slider */}
      <section className="bg-gradient-to-b from-stone-100 via-stone-50 to-white py-12 md:py-16 px-4 border-b border-stone-200 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Hero Copy */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <span className="inline-block bg-stone-200/80 text-stone-800 text-[11px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-widest mb-4">
              New Lot Drop Just Landed
            </span>
            <h1 className="text-4xl sm:text-6xl font-serif font-bold text-[#0b1a13] tracking-tight leading-[1.15] mb-5">
              Curated Stuff, <span className="italic font-normal text-emerald-800">Personal Taste.</span>
            </h1>
            <p className="text-sm sm:text-base text-stone-600 max-w-xl leading-relaxed mb-8">
              Hand-picked vintage &amp; pre-loved imported garments. Every piece in our store is an authentic 1-of-1 item—once it's claimed, it's gone forever.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#catalog"
                className="px-6 py-3.5 rounded-xl bg-[#0b1a13] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#152e22] transition shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <span>Explore Latest Drop</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${waNumber}?text=Hi%20AUVARE,%20I%20am%20interested%20in%20your%20curated%20vintage%20collection.`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* Fast Value Props Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-stone-200/80 w-full text-left">
              <div>
                <p className="text-xs font-bold text-stone-800">1/2 Days Delivery</p>
                <p className="text-[11px] text-stone-500">Fastest courier</p>
              </div>
              <div>
                <p className="text-xs font-bold text-stone-800">100% Authentic</p>
                <p className="text-[11px] text-stone-500">Curated pieces</p>
              </div>
              <div>
                <p className="text-xs font-bold text-stone-800">Hotline &amp; Chat</p>
                <p className="text-[11px] text-stone-500">9am to 11pm</p>
              </div>
              <div>
                <p className="text-xs font-bold text-stone-800">Flexible Payment</p>
                <p className="text-[11px] text-stone-500">COD, bKash, Nagad</p>
              </div>
            </div>
          </div>

          {/* Right Hero: Reels-Style Auto-Swipe Slider */}
          <div className="lg:col-span-5 flex justify-center">
            <HeroReelsSlider
              products={initialProducts}
              onSelectProduct={(prod) => setActiveModalProduct(prod)}
            />
          </div>
        </div>
      </section>

      {/* Category Bar & Bag Trigger */}
      <div className="bg-white border-y border-stone-200 sticky top-16 z-20 py-3 shadow-xs" id="catalog">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-[#0b1a13] text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search vintage drops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs px-3.5 py-1.5 border border-stone-300 rounded-full w-full md:w-56 focus:outline-none focus:border-emerald-600 bg-stone-50"
            />
            <button
              type="button"
              onClick={() => {
                setDirectCheckoutItem(null);
                setIsBagOpen(true);
              }}
              className="relative p-2.5 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-800 transition"
              aria-label="Open Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              {bag.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {bag.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Product Catalog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-serif text-slate-900">
            {activeCategory === 'All' ? 'Latest Curated Drops' : `${activeCategory} Drop`}
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {filteredProducts.length} authentic piece{filteredProducts.length === 1 ? '' : 's'}
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-stone-300">
            <h3 className="text-lg font-bold text-stone-800">No pieces found in this category</h3>
            <p className="text-xs text-stone-500 mt-1">Check back soon for upcoming lot drops or explore other categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const displayImage = product.image || product.images?.[0] || '/assets/images/logo.jpg';
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Card Image Area (Click opens Sailor zoom modal) */}
                  <div
                    className="relative aspect-[4/5] bg-stone-100 overflow-hidden cursor-pointer"
                    onClick={() => setActiveModalProduct(product)}
                  >
                    <img
                      src={displayImage}
                      alt={product.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Badge */}
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#0b1a13]/90 text-white backdrop-blur-xs">
                        {product.category || 'Drop'}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/90 text-stone-800 backdrop-blur-xs">
                        {product.condition || '9.5/10'}
                      </span>
                    </div>

                    {/* Quick view hover pill */}
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white/95 text-stone-900 text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                        Inspect Piece
                      </span>
                    </div>
                  </div>

                  {/* Card Content Area */}
                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <h3
                        className="font-serif font-bold text-sm text-stone-900 leading-snug line-clamp-1 cursor-pointer hover:text-emerald-800 transition"
                        onClick={() => setActiveModalProduct(product)}
                      >
                        {product.title}
                      </h3>
                      {(product.chest || product.length) && (
                        <p className="text-[11px] text-stone-500 font-mono mt-1">
                          {product.chest ? `Chest: ${product.chest}"` : ''}
                          {product.chest && product.length ? ' • ' : ''}
                          {product.length ? `L: ${product.length}"` : ''}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      <span className="text-base font-extrabold text-[#0b1a13]">
                        ৳ {formatBDT(product.price)}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {/* Direct Buy Now */}
                        <button
                          type="button"
                          onClick={() => handleBuyNow(product, (product.sizes?.[0] as GarmentSize) || 'M')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition flex items-center gap-1"
                          title="Buy Now"
                        >
                          <Zap className="w-3 h-3 fill-current" />
                          <span>Buy Now</span>
                        </button>

                        {/* Add to Bag */}
                        <button
                          type="button"
                          onClick={() => handleAddToBag(product, (product.sizes?.[0] as GarmentSize) || 'M')}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 transition"
                          title="Add to Bag"
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Sailor-Style Full Product Detail Modal with Zoom */}
      {activeModalProduct && (
        <ProductDetailModal
          product={activeModalProduct}
          onClose={() => setActiveModalProduct(null)}
          onAddToBag={(prod, size, variant) => {
            handleAddToBag(prod, size, variant);
            setActiveModalProduct(null);
          }}
          onBuyNow={(prod, size, variant) => {
            handleBuyNow(prod, size, variant);
            setActiveModalProduct(null);
          }}
        />
      )}

      {/* Sliding Bag Drawer */}
      {isBagOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Head */}
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-800" />
                <h3 className="font-serif font-bold text-base text-stone-900">Your Bag</h3>
                <span className="text-xs bg-stone-200 text-stone-700 font-bold px-2 py-0.5 rounded-full">
                  {bag.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsBagOpen(false)}
                className="p-1 rounded-lg text-stone-500 hover:text-stone-900 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {bag.length === 0 ? (
                <div className="text-center py-20 text-stone-400">
                  <ShoppingBag className="w-12 h-12 mx-auto stroke-1 text-stone-300 mb-3" />
                  <p className="text-sm font-semibold text-stone-600">Your bag is empty</p>
                  <p className="text-xs text-stone-400 mt-1">Explore our vintage drops and claim your piece.</p>
                </div>
              ) : (
                bag.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="flex items-center gap-3.5 p-3 rounded-xl border border-stone-200 bg-stone-50/50"
                  >
                    <img
                      src={item.image || item.images?.[0] || '/assets/images/logo.jpg'}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-lg border border-stone-200 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-bold text-xs text-stone-900 truncate">{item.title}</h4>
                      <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                        Size: {item.selectedSize}
                        {item.selectedVariantName ? ` • ${item.selectedVariantName}` : ''}
                      </p>
                      <p className="text-xs font-extrabold text-[#0b1a13] mt-1">
                        ৳ {formatBDT(item.price)} {item.quantity > 1 ? `x ${item.quantity}` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBag((prev) => prev.filter((i) => i.cartItemId !== item.cartItemId))}
                      className="text-stone-400 hover:text-red-600 p-1 transition"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer */}
            {bag.length > 0 && (
              <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3">
                {/* Delivery Zone Toggle */}
                <div className="flex items-center justify-between text-xs font-semibold text-stone-700 bg-white p-2.5 rounded-xl border border-stone-200">
                  <span>Delivery Location</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDeliveryZone('inside')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                        deliveryZone === 'inside' ? 'bg-[#0b1a13] text-white' : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      Dhaka (৳70)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryZone('outside')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                        deliveryZone === 'outside' ? 'bg-[#0b1a13] text-white' : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      Outside (৳130)
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
                  <span>Subtotal</span>
                  <span>৳ {formatBDT(bagSubtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
                  <span>Delivery Charge</span>
                  <span>৳ {formatBDT(deliveryCharge)}</span>
                </div>
                <div className="flex items-center justify-between text-base font-extrabold text-[#0b1a13] pt-2 border-t border-stone-200">
                  <span>Total Amount</span>
                  <span>৳ {formatBDT(bagTotal)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsBagOpen(false);
                    setDirectCheckoutItem(null);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-3.5 rounded-xl bg-[#0b1a13] hover:bg-[#12281e] text-white text-xs font-bold uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0b1a13] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base">Complete Your Drop Order</h3>
                <p className="text-[11px] text-emerald-300">Fast checkout with nationwide Cash on Delivery</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="text-stone-300 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="p-6 space-y-4">
              {/* Order Summary Pill */}
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs flex items-center justify-between">
                <span className="text-stone-600 font-medium">
                  {checkoutItems.length} item{checkoutItems.length === 1 ? '' : 's'} • Total (with delivery):
                </span>
                <span className="text-sm font-extrabold text-[#0b1a13]">৳ {formatBDT(bagTotal)}</span>
              </div>

              {/* Delivery Info */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Ahmed"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600 bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Mobile Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 017XXXXXXXX"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600 bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Delivery Address *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="House #, Road #, Sector/Area, City"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600 bg-stone-50"
                />
              </div>

              {/* Delivery Zone */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Delivery Region</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryZone('inside')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      deliveryZone === 'inside'
                        ? 'bg-[#0b1a13] text-white border-[#0b1a13]'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    Inside Dhaka (৳70)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryZone('outside')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      deliveryZone === 'outside'
                        ? 'bg-[#0b1a13] text-white border-[#0b1a13]'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    Outside Dhaka (৳130)
                  </button>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Payment Method</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['cod', 'bkash', 'nagad', 'rocket'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition ${
                        paymentMethod === method
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* bKash / Nagad / Rocket Instructions */}
              {paymentMethod !== 'cod' && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-2">
                  <p className="text-emerald-900 font-bold">
                    Send ৳{formatBDT(bagTotal)} to our verified {paymentMethod.toUpperCase()} Personal Account:
                  </p>
                  <p className="font-mono font-bold text-emerald-800 text-sm">
                    {siteSettings[`${paymentMethod}_number`] || '01734018155'}
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Sender Phone Number *"
                      required
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-emerald-300 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Transaction ID (TrxID) *"
                      required
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-emerald-300 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Order Notes */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Special Delivery Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Call before delivery, deliver after 4 PM"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600 bg-stone-50"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#0b1a13] hover:bg-[#12281e] text-white text-xs font-bold uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Processing Order...</span>
                ) : (
                  <>
                    <span>Confirm &amp; Place Order (৳ {formatBDT(bagTotal)})</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Order Success Modal */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 text-center border border-stone-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>

            <h3 className="font-serif font-bold text-xl text-stone-900">Order Placed Successfully!</h3>
            <p className="text-xs text-stone-600 font-mono">
              Order ID: <span className="font-bold text-emerald-700">{orderSuccess.orderId}</span>
            </p>
            <p className="text-xs text-stone-500">
              Total bill: ৳{formatBDT(orderSuccess.total)}. Our team is preparing your drop for dispatch.
            </p>

            <div className="pt-2 space-y-2">
              <a
                href={`https://wa.me/${waNumber}?text=${orderSuccess.waText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition shadow flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Confirm on WhatsApp Instantly</span>
              </a>

              <button
                type="button"
                onClick={() => setOrderSuccess(null)}
                className="w-full py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-50 transition"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mediasoft BD Multichannel Help Widget (Bottom-Left) */}
      <MediasoftWidget
        phone={siteSettings.whatsapp_number || '+8801734018155'}
        email="auvare.official@gmail.com"
        whatsappNumber={waNumber}
      />
    </>
  );
}
