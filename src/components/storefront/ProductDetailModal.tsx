'use client';

import React, { useState, useEffect, useRef, MouseEvent } from 'react';
import type { Product, GarmentSize, ProductVariant } from '@/types';
import { formatBDT } from '@/lib/utils';
import { ArrowLeft, X, ChevronDown } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product;
  allProducts: Product[];
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onAddToBag: (product: Product, size: GarmentSize, variant?: ProductVariant) => void;
  onBuyNow: (product: Product, size: GarmentSize, variant?: ProductVariant) => void;
}

export function ProductDetailModal({
  product,
  allProducts,
  onClose,
  onSelectProduct,
  onAddToBag,
  onBuyNow,
}: ProductDetailModalProps) {
  const images = (product.images && product.images.length > 0)
    ? product.images
    : [product.image || '/assets/images/logo.jpg'];
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  const availableSizes: GarmentSize[] = (product.sizes && product.sizes.length > 0)
    ? (product.sizes as GarmentSize[])
    : ['S', 'M', 'L', 'XL', 'XXL'];
  const [selectedSize, setSelectedSize] = useState<GarmentSize>(availableSizes[0] || 'M');

  const variants = product.variants || [];
  const [selectedVariantId, setSelectedVariantId] = useState<string>(variants[0]?.id || variants[0]?.name || '');

  // Sizing and Garment accordion states
  const [isDescOpen, setIsDescOpen] = useState(true);
  const [isSizingOpen, setIsSizingOpen] = useState(true);
  const [isShippingOpen, setIsShippingOpen] = useState(false);

  // Studio Zoom state (Sailor coordinate-based mouse hover zoom)
  const [zoomStyle, setZoomStyle] = useState<{ transformOrigin: string; transform: string }>({
    transformOrigin: 'center center',
    transform: 'scale(1)',
  });
  const [isZooming, setIsZooming] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Recently viewed products tracking via localStorage
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  useEffect(() => {
    // Record recently viewed
    try {
      const stored = localStorage.getItem('auvare_recent_views_v2');
      let ids: string[] = stored ? JSON.parse(stored) : [];
      ids = [String(product.id), ...ids.filter((id) => String(id) !== String(product.id))].slice(0, 8);
      localStorage.setItem('auvare_recent_views_v2', JSON.stringify(ids));

      const recentItems = ids
        .filter((id) => String(id) !== String(product.id))
        .map((id) => allProducts.find((p) => String(p.id) === String(id)))
        .filter(Boolean) as Product[];

      setRecentlyViewed(recentItems.slice(0, 4));
    } catch {
      // Storage unavailable fallback
    }
    // Reset selected image when product changes
    setSelectedImageIdx(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id, allProducts]);

  // Lock background body scroll
  useEffect(() => {
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = origOverflow;
    };
  }, []);

  // Keyboard navigation (Escape key to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    setIsZooming(true);
    setZoomStyle({
      transformOrigin: `${x.toFixed(2)}% ${y.toFixed(2)}%`,
      transform: 'scale(2.2)',
    });
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
    setZoomStyle({
      transformOrigin: 'center center',
      transform: 'scale(1)',
    });
  };

  // Clean description: strip any hidden HTML comments
  const cleanDescription = (product.description || '')
    .replace(/<!--AUVARE_VARIANTS:[\s\S]*?-->/g, '')
    .replace(/<!--AUVARE_IMAGES:[\s\S]*?-->/g, '')
    .replace(/<!--AUVARE_FABRIC:[\s\S]*?-->/g, '')
    .trim();

  const selectedVariant = variants.find((v) => (v.id || v.name) === selectedVariantId);
  const effectivePrice = selectedVariant?.price || product.price;
  const currentImage = images[selectedImageIdx] || images[0];

  // Suggested products: same category, excluding current product
  const suggestedProducts = allProducts
    .filter((p) => p.category === product.category && String(p.id) !== String(product.id))
    .slice(0, 4);

  return (
    <div
      className="product-detail-screen open"
      id="productDetailScreen"
      aria-hidden="false"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        background: '#ffffff',
        zIndex: 99999,
        overflowY: 'auto',
        overflowX: 'hidden',
        opacity: 1,
        visibility: 'visible',
      }}
    >
      {/* 1. Top Sticky Navigation Bar */}
      <header className="detail-screen-header">
        <div className="container detail-screen-header-inner">
          <button
            type="button"
            className="btn-detail-back"
            onClick={onClose}
            aria-label="Back to Collection"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Collection</span>
          </button>

          <div className="detail-screen-brand">
            <span className="brand-title">AUVARE</span>
            <span className="brand-sub">Product Details</span>
          </div>

          <button
            type="button"
            className="btn-detail-close"
            onClick={onClose}
            aria-label="Close Screen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Full Screen Product Main Content */}
      <div className="container detail-screen-main" style={{ padding: '2rem 1.5rem 5rem' }}>
        {/* Breadcrumb Navigation */}
        <nav className="screen-breadcrumb" aria-label="Breadcrumb">
          <a onClick={onClose} style={{ cursor: 'pointer' }}>Collection</a>
          <span className="crumb-sep">/</span>
          <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{product.category || 'Clothing'}</span>
          <span className="crumb-sep">/</span>
          <span className="crumb-current">{product.title}</span>
        </nav>

        {/* Main Product Two-Column Hero Grid */}
        <div className="screen-detail-grid">
          {/* Left Column: Studio Gallery (Vertical Thumbs + Main Sailor Zoom Canvas) */}
          <div className="screen-gallery-col">
            {images.length > 1 && (
              <div className="screen-vertical-thumbs">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`screen-thumb-btn ${idx === selectedImageIdx ? 'active' : ''}`}
                    onClick={() => setSelectedImageIdx(idx)}
                    title={`View Photo ${idx + 1}`}
                  >
                    <img src={img} alt={`${product.title} thumbnail ${idx + 1}`} loading="lazy" />
                  </button>
                ))}
              </div>
            )}

            <div
              ref={imageContainerRef}
              className="screen-main-img-box"
              id="screenZoomBox"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                position: 'relative',
                aspectRatio: '4/5',
                background: '#f8fafc',
                borderRadius: 'var(--radius-lg, 12px)',
                overflow: 'hidden',
                border: '1px solid var(--color-border, #e8e4dc)',
                cursor: 'crosshair',
              }}
            >
              <img
                id="screenMainImg"
                src={currentImage}
                alt={product.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center',
                  transform: zoomStyle.transform,
                  transformOrigin: zoomStyle.transformOrigin,
                  transition: isZooming ? 'none' : 'transform 0.2s ease-out',
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              />

              <div className="screen-gallery-badges" style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
                <span className="badge-tag unique">Curated Drop</span>
                {product.sold ? (
                  <span className="badge-tag sold">Sold Out</span>
                ) : (
                  <span className="badge-tag condition">
                    {product.condition ? product.condition.split('(')[0].trim() : 'Mint 9.5/10'}
                  </span>
                )}
              </div>


            </div>
          </div>

          {/* Right Column: Purchasing & Specifications */}
          <div className="screen-info-col">
            <div className="screen-sku-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="screen-sku-code" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                SKU : {product.id.toUpperCase()}
              </span>
              <span className="badge-tag condition">{product.category}</span>
            </div>

            <h1 className="screen-product-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, color: '#0b1a13', lineHeight: 1.2, marginBottom: '0.75rem' }}>
              {product.title}
            </h1>

            <div className="screen-price-row" style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)', marginBottom: '1.25rem' }}>
              <span className="screen-price-val" style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                TK {formatBDT(effectivePrice)}
              </span>
              <span className="screen-price-note" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                All Import &amp; VAT Included
              </span>
            </div>

            {/* Available Colorways / Editions (Names Only on Pills) */}
            {variants.length > 0 && (
              <div className="screen-selector-group" style={{ marginBottom: '1.25rem' }}>
                <span className="screen-selector-title" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                  Available Colorways / Editions:
                </span>
                <div className="variant-chips-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {variants.map((v) => {
                    const vKey = v.id || v.name;
                    const isSel = selectedVariantId === vKey;
                    return (
                      <button
                        key={vKey}
                        type="button"
                        className={`variant-chip ${isSel ? 'active' : ''}`}
                        onClick={() => setSelectedVariantId(vKey)}
                        title={v.name}
                        style={{
                          padding: '0.45rem 1rem',
                          borderRadius: '999px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          border: `1.5px solid ${isSel ? 'var(--color-primary-dark, #0b1a13)' : 'var(--color-border, #e8e4dc)'}`,
                          background: isSel ? 'var(--color-primary-dark, #0b1a13)' : '#ffffff',
                          color: isSel ? '#ffffff' : 'var(--color-text-main, #18181b)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {v.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div className="screen-selector-group" style={{ marginBottom: '1.5rem' }}>
              <span className="screen-selector-title" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                Select Size:
              </span>
              <div className="size-chips-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {availableSizes.map((sz) => {
                  const isSel = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      className={`size-chip ${isSel ? 'active' : ''}`}
                      onClick={() => setSelectedSize(sz)}
                      title={`Size ${sz}`}
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: 'var(--radius-md, 8px)',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1.5px solid ${isSel ? 'var(--color-primary-dark, #0b1a13)' : 'var(--color-border, #e8e4dc)'}`,
                        background: isSel ? 'var(--color-primary-dark, #0b1a13)' : '#ffffff',
                        color: isSel ? '#ffffff' : 'var(--color-text-main, #18181b)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dual Action CTAs: Add to Bag (no price, no icon) & Buy Now (Instant Checkout, no icon) */}
            <div className="screen-actions-bar" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <button
                type="button"
                className="btn-screen-add-bag"
                disabled={product.sold}
                onClick={() => onAddToBag(product, selectedSize, selectedVariant)}
                style={{
                  padding: '0.9rem 1.25rem',
                  borderRadius: 'var(--radius-md, 8px)',
                  background: '#0b1a13',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  cursor: product.sold ? 'not-allowed' : 'pointer',
                  opacity: product.sold ? 0.6 : 1,
                  boxShadow: 'var(--shadow-md)',
                  border: 'none',
                }}
              >
                <span>{product.sold ? 'Drop Claimed' : 'Add to Bag'}</span>
              </button>

              <button
                type="button"
                className="btn-screen-buy-now"
                disabled={product.sold}
                onClick={() => onBuyNow(product, selectedSize, selectedVariant)}
                style={{
                  padding: '0.9rem 1.25rem',
                  borderRadius: 'var(--radius-md, 8px)',
                  background: 'var(--color-primary, #105036)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  cursor: product.sold ? 'not-allowed' : 'pointer',
                  opacity: product.sold ? 0.6 : 1,
                  boxShadow: 'var(--shadow-md)',
                  border: 'none',
                }}
              >
                <span>{product.sold ? 'Drop Claimed' : 'Buy Now'}</span>
              </button>
            </div>

            {/* Trust Badges Strip */}
            <div className="screen-trust-badges" style={{ background: 'var(--color-surface, #f5f1e8)', borderRadius: 'var(--radius-md, 8px)', padding: '0.85rem 1rem', marginBottom: '1.5rem', border: '1px solid var(--color-border)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              <div className="trust-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg className="trust-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-primary)' }}>
                  <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                <div>
                  <div className="trust-text" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Fast Delivery</div>
                  <span className="trust-sub" style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Dhaka 24-48h</span>
                </div>
              </div>

              <div className="trust-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg className="trust-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-primary)' }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <div>
                  <div className="trust-text" style={{ fontSize: '0.75rem', fontWeight: 700 }}>1-of-1 Verified</div>
                  <span className="trust-sub" style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Curated Piece</span>
                </div>
              </div>

              <div className="trust-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg className="trust-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-primary)' }}>
                  <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                <div>
                  <div className="trust-text" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Concierge Care</div>
                  <span className="trust-sub" style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>WhatsApp Helpline</span>
                </div>
              </div>
            </div>

            {/* Collapsible Accordions (Sailor Structure) */}
            <div className="screen-accordion-group" style={{ borderTop: '1px solid var(--color-border)' }}>
              {/* Accordion 1: Garment Details & Description */}
              <div style={{ borderBottom: '1px solid var(--color-border)', padding: '0.85rem 0' }}>
                <button
                  type="button"
                  onClick={() => setIsDescOpen(!isDescOpen)}
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, color: '#0b1a13', fontFamily: 'var(--font-mono)' }}
                >
                  <span>GARMENT DETAILS &amp; DESCRIPTION</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDescOpen ? 'rotate-180' : ''}`} />
                </button>
                {isDescOpen && (
                  <div style={{ marginTop: '0.6rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    {cleanDescription || 'Authentic curated vintage streetwear piece. Verified condition, premium textile weave, and signature boxy silhouette.'}
                  </div>
                )}
              </div>

              {/* Accordion 2: Measurements & Sizing Guide */}
              <div style={{ borderBottom: '1px solid var(--color-border)', padding: '0.85rem 0' }}>
                <button
                  type="button"
                  onClick={() => setIsSizingOpen(!isSizingOpen)}
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, color: '#0b1a13', fontFamily: 'var(--font-mono)' }}
                >
                  <span>MEASUREMENTS &amp; SIZING GUIDE</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSizingOpen ? 'rotate-180' : ''}`} />
                </button>
                {isSizingOpen && (
                  <div style={{ marginTop: '0.6rem' }}>
                    <table className="screen-spec-table" style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr style={{ borderBottom: '1px dashed var(--color-border)' }}>
                          <td style={{ padding: '0.4rem 0', color: 'var(--color-text-muted)' }}>Chest (Pit-to-Pit)</td>
                          <td style={{ padding: '0.4rem 0', textAlign: 'right', fontWeight: 700, color: '#0b1a13' }}>{product.chest ? `${product.chest}"` : '40"-48" (Relaxed width)'}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px dashed var(--color-border)' }}>
                          <td style={{ padding: '0.4rem 0', color: 'var(--color-text-muted)' }}>Length (Collar-to-Hem)</td>
                          <td style={{ padding: '0.4rem 0', textAlign: 'right', fontWeight: 700, color: '#0b1a13' }}>{product.length ? `${product.length}"` : '26"-30" (Vintage Boxy Drop)'}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px dashed var(--color-border)' }}>
                          <td style={{ padding: '0.4rem 0', color: 'var(--color-text-muted)' }}>Condition Grade</td>
                          <td style={{ padding: '0.4rem 0', textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)' }}>{product.condition || '9.5/10 Mint'}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '0.4rem 0', color: 'var(--color-text-muted)' }}>Category</td>
                          <td style={{ padding: '0.4rem 0', textAlign: 'right', fontWeight: 700, color: '#0b1a13' }}>{product.category}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Accordion 3: Shipping & Care Guide */}
              <div style={{ padding: '0.85rem 0' }}>
                <button
                  type="button"
                  onClick={() => setIsShippingOpen(!isShippingOpen)}
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, color: '#0b1a13', fontFamily: 'var(--font-mono)' }}
                >
                  <span>SHIPPING &amp; CARE GUIDE</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isShippingOpen ? 'rotate-180' : ''}`} />
                </button>
                {isShippingOpen && (
                  <div style={{ marginTop: '0.6rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    <p style={{ marginBottom: '0.5rem' }}>
                      <strong>Shipping:</strong> Standard delivery within Dhaka takes 24 to 48 hours. Nationwide express delivery takes 2 to 4 business days. Cash on delivery is available with parcel checking.
                    </p>
                    <p>
                      <strong>Care:</strong> Machine wash cold (30°C) inside out on gentle cycle. Line dry in shade to preserve cotton fibres. Do not iron directly on vintage graphics or prints.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Suggested Pieces Section */}
        {suggestedProducts.length > 0 && (
          <section className="screen-section-container" style={{ marginTop: '4rem', paddingTop: '2.5rem', borderTop: '1px solid var(--color-border)' }}>
            <div className="screen-section-header" style={{ marginBottom: '1.5rem' }}>
              <h3 className="screen-section-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700, color: '#0b1a13' }}>
                Suggested Pieces
              </h3>
              <span className="screen-section-sub" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                More from {product.category}
              </span>
            </div>

            <div className="screen-product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
              {suggestedProducts.map((item) => {
                const itemImg = (item.images && item.images[0]) || item.image || '/assets/images/logo.jpg';
                return (
                  <div
                    key={item.id}
                    className="screen-card-item"
                    onClick={() => onSelectProduct(item)}
                    style={{
                      background: '#ffffff',
                      borderRadius: 'var(--radius-md, 8px)',
                      border: '1px solid var(--color-border, #e8e4dc)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div className="screen-card-img-wrap" style={{ aspectRatio: '4/5', overflow: 'hidden', background: '#f8fafc' }}>
                      <img src={itemImg} alt={item.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div className="screen-card-body" style={{ padding: '0.85rem' }}>
                      <span className="screen-card-cat" style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                        {item.category}
                      </span>
                      <h4 className="screen-card-title" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0b1a13', margin: '0.25rem 0 0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.title}
                      </h4>
                      <div className="screen-card-price-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="screen-card-price" style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.95rem' }}>
                          TK {formatBDT(item.price)}
                        </span>
                        <span className={`screen-card-badge ${item.sold ? 'sold' : ''}`} style={{ fontSize: '0.7rem', fontWeight: 700, color: item.sold ? '#b91c1c' : '#15803d' }}>
                          {item.sold ? 'Sold Out' : 'Available'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 4. Customer Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
          <section className="screen-section-container" style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1px solid var(--color-border)' }}>
            <div className="screen-section-header" style={{ marginBottom: '1.5rem' }}>
              <h3 className="screen-section-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700, color: '#0b1a13' }}>
                Customer Recently Viewed
              </h3>
              <span className="screen-section-sub" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Your session browsing history
              </span>
            </div>

            <div className="screen-product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
              {recentlyViewed.map((item) => {
                const itemImg = (item.images && item.images[0]) || item.image || '/assets/images/logo.jpg';
                return (
                  <div
                    key={item.id}
                    className="screen-card-item"
                    onClick={() => onSelectProduct(item)}
                    style={{
                      background: '#ffffff',
                      borderRadius: 'var(--radius-md, 8px)',
                      border: '1px solid var(--color-border, #e8e4dc)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div className="screen-card-img-wrap" style={{ aspectRatio: '4/5', overflow: 'hidden', background: '#f8fafc' }}>
                      <img src={itemImg} alt={item.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div className="screen-card-body" style={{ padding: '0.85rem' }}>
                      <span className="screen-card-cat" style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                        {item.category}
                      </span>
                      <h4 className="screen-card-title" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0b1a13', margin: '0.25rem 0 0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.title}
                      </h4>
                      <div className="screen-card-price-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="screen-card-price" style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.95rem' }}>
                          TK {formatBDT(item.price)}
                        </span>
                        <span className={`screen-card-badge ${item.sold ? 'sold' : ''}`} style={{ fontSize: '0.7rem', fontWeight: 700, color: item.sold ? '#b91c1c' : '#15803d' }}>
                          {item.sold ? 'Sold Out' : 'Available'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
