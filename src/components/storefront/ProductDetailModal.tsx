'use client';

import React, { useState, useRef, MouseEvent } from 'react';
import type { Product, GarmentSize, ProductVariant } from '@/types';
import { formatBDT } from '@/lib/utils';
import { X, ArrowLeft, ShoppingBag, Zap, Truck, ShieldCheck, RefreshCw, ChevronDown } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToBag: (product: Product, size: GarmentSize, variant?: ProductVariant) => void;
  onBuyNow: (product: Product, size: GarmentSize, variant?: ProductVariant) => void;
}

export function ProductDetailModal({
  product,
  onClose,
  onAddToBag,
  onBuyNow,
}: ProductDetailModalProps) {
  const images = product.images && product.images.length > 0 ? product.images : [product.image || '/assets/images/logo.jpg'];
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  const availableSizes: GarmentSize[] = (product.sizes && product.sizes.length > 0)
    ? (product.sizes as GarmentSize[])
    : ['S', 'M', 'L', 'XL'];
  const [selectedSize, setSelectedSize] = useState<GarmentSize>(availableSizes[0] || 'M');

  const variants = product.variants || [];
  const [selectedVariantId, setSelectedVariantId] = useState<string>(variants[0]?.id || '');

  // Sizing and Garment accordion states
  const [isDescOpen, setIsDescOpen] = useState(true);
  const [isSizingOpen, setIsSizingOpen] = useState(false);

  // Zoom logic (Sailor clothing style mouse coordinate zoom)
  const [zoomStyle, setZoomStyle] = useState<{ transformOrigin: string; transform: string; opacity: number }>({
    transformOrigin: 'center center',
    transform: 'scale(1)',
    opacity: 1,
  });
  const [isZooming, setIsZooming] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPercent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const yPercent = Math.max(0, Math.min(100, (y / rect.height) * 100));

    setIsZooming(true);
    setZoomStyle({
      transformOrigin: `${xPercent}% ${yPercent}%`,
      transform: 'scale(2.1)',
      opacity: 1,
    });
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
    setZoomStyle({
      transformOrigin: 'center center',
      transform: 'scale(1)',
      opacity: 1,
    });
  };

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);
  const effectivePrice = selectedVariant?.price || product.price;
  const currentImage = images[selectedImageIdx] || images[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-md flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="w-full max-w-6xl flex items-center justify-between py-3 px-4 bg-[#0b1a13] text-white rounded-t-2xl shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Collection</span>
        </button>

        <div className="flex flex-col items-center">
          <span className="font-serif font-bold text-sm tracking-wider text-white">AUVARE</span>
          <span className="text-[9px] uppercase tracking-widest text-emerald-300 font-semibold">Product Details</span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content Card */}
      <div className="w-full max-w-6xl bg-white rounded-b-2xl shadow-2xl overflow-hidden p-6 md:p-10">
        {/* Breadcrumb */}
        <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-6">
          COLLECTION / {product.category || 'VINTAGE'} / {product.title}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Image Canvas with Sailor-Style Zoom */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div
              ref={imageContainerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative w-full aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 cursor-crosshair group shadow-inner"
            >
              {/* Badges */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
                <span className="bg-[#0b1a13] text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider shadow">
                  Curated Drop
                </span>
                <span className="bg-emerald-800 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow">
                  {product.condition || '9.5/10'}
                </span>
              </div>

              {/* Main Product Image with coordinate scale */}
              <img
                src={currentImage}
                alt={product.title}
                className="w-full h-full object-contain object-center transition-transform duration-100 ease-out select-none pointer-events-none"
                style={zoomStyle}
              />

              {/* Roll over zoom hint badge */}
              <div
                className={`absolute bottom-3 right-3 z-20 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1 rounded-full pointer-events-none transition-opacity duration-200 ${
                  isZooming ? 'opacity-0' : 'opacity-100'
                }`}
              >
                Roll over to zoom
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition ${
                      selectedImageIdx === idx ? 'border-emerald-600 ring-2 ring-emerald-600/30' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src={img} alt={`${product.title} thumb ${idx}`} className="w-full h-full object-cover object-center" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Garment Information & Purchasing */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            {/* SKU & Category Tag */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400 font-semibold tracking-wider">
                SKU : {product.id.toUpperCase()}
              </span>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide bg-emerald-100 px-2.5 py-0.5 rounded-full">
                {product.category || 'Clothing'}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 leading-tight mb-3">
              {product.title}
            </h1>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 mb-6 pb-4 border-b border-slate-200">
              <span className="text-3xl font-extrabold text-[#0b1a13] tracking-tight">
                ৳ {formatBDT(effectivePrice)}
              </span>
              <span className="text-xs text-slate-500 font-medium">All import &amp; VAT included</span>
            </div>

            {/* Colorways / Editions (ONLY Variant Names on Pills) */}
            {variants.length > 0 && (
              <div className="mb-6">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 font-bold mb-2">
                  Available Colorways / Editions:
                </label>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const isSelected = selectedVariantId === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`text-xs font-semibold px-4 py-1.5 rounded-full border transition-all ${
                          isSelected
                            ? 'bg-[#0b1a13] text-white border-[#0b1a13] shadow-md ring-2 ring-emerald-500/30'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        {v.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div className="mb-8">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 font-bold mb-2">
                Select Size:
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((sz) => {
                  const isSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`w-11 h-11 rounded-lg text-xs font-bold flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-[#0b1a13] text-white border-[#0b1a13] shadow-md ring-2 ring-emerald-500/30'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dual Action CTAs: Add to Bag & Buy Now */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {/* Add to Bag */}
              <button
                type="button"
                onClick={() => onAddToBag(product, selectedSize, selectedVariant)}
                className="w-full py-3.5 px-4 rounded-xl bg-[#0b1a13] hover:bg-[#12281e] text-white font-bold text-sm tracking-wide shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-98"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag</span>
              </button>

              {/* Direct Buy Now */}
              <button
                type="button"
                onClick={() => onBuyNow(product, selectedSize, selectedVariant)}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm tracking-wide shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-98"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Buy Now</span>
              </button>
            </div>

            {/* Trust & Guarantee Badges */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 mb-6 space-y-2.5">
              <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Fast Delivery: Dhaka 24-48h • All BD 2-4d</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Curated Authentic 1-of-1 Verified Piece</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                <RefreshCw className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Hassle-Free Support Hotline &amp; WhatsApp Concierge</span>
              </div>
            </div>

            {/* Collapsible Accordions: Description & Measurements */}
            <div className="border-t border-slate-200 divide-y divide-slate-200">
              {/* Garment Details & Description */}
              <div className="py-3.5">
                <button
                  type="button"
                  onClick={() => setIsDescOpen(!isDescOpen)}
                  className="w-full flex items-center justify-between text-left text-xs font-mono uppercase font-bold text-slate-800 tracking-wide"
                >
                  <span>Garment Details &amp; Description</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDescOpen ? 'rotate-180' : ''}`} />
                </button>
                {isDescOpen && (
                  <div className="mt-2 text-xs text-slate-600 leading-relaxed font-sans">
                    {product.description || 'Authentic imported vintage piece. Hand-inspected with premium fabric composition and preserved original detailing.'}
                  </div>
                )}
              </div>

              {/* Measurements & Sizing Guide */}
              <div className="py-3.5">
                <button
                  type="button"
                  onClick={() => setIsSizingOpen(!isSizingOpen)}
                  className="w-full flex items-center justify-between text-left text-xs font-mono uppercase font-bold text-slate-800 tracking-wide"
                >
                  <span>Measurements &amp; Sizing Guide</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSizingOpen ? 'rotate-180' : ''}`} />
                </button>
                {isSizingOpen && (
                  <div className="mt-2 text-xs text-slate-600 font-mono space-y-1">
                    <p>Chest (Pit-to-Pit): {product.chest || '42-46'}"</p>
                    <p>Length: {product.length || '28'}"</p>
                    <p>Condition: {product.condition || '9.5/10 (Mint Pre-loved)'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

