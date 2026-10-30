'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ShopifyCheckoutScreen } from '../checkout/ShopifyCheckoutScreen';
import type { Product, GarmentSize, ProductVariant, CartItem } from '@/types';
import { formatBDT } from '@/lib/utils';
import { HeroReelsSlider } from './HeroReelsSlider';
import { ProductDetailModal } from './ProductDetailModal';
import { MediasoftWidget } from './MediasoftWidget';
import Link from 'next/link';
import { createPublicClient } from '@/lib/supabase/public';

interface StorefrontClientProps {
  initialProducts: Product[];
  siteSettings: Record<string, string>;
}

export function StorefrontClient({ initialProducts, siteSettings }: StorefrontClientProps) {
  // Live dynamic settings synchronized with Supabase
  const [currentSettings, setCurrentSettings] = useState<Record<string, string>>(siteSettings);

  useEffect(() => {
    const supabase = createPublicClient();
    async function fetchLiveContactInfo() {
      try {
        const { data, error } = await supabase
          .from('store_contact_info')
          .select('*')
          .eq('id', 'main')
          .maybeSingle();

        if (data && !error) {
          const row = data as Record<string, any>;
          setCurrentSettings((prev) => ({
            ...prev,
            whatsapp_number: row.whatsapp_number ? row.whatsapp_number.trim() : prev.whatsapp_number,
            bkash_number: row.bkash_number ? row.bkash_number.trim() : prev.bkash_number,
            nagad_number: row.nagad_number ? row.nagad_number.trim() : prev.nagad_number,
            instagram_handle: row.instagram_handle || prev.instagram_handle,
            instagram_url: row.instagram_url || prev.instagram_url,
            email: row.email || prev.email || 'abirshikdar2@gmail.com',
            call_number: row.call_number || row.phone || prev.call_number || '01734018155',
            facebook_url: row.facebook_url || row.messenger_url || prev.facebook_url || 'https://www.facebook.com/share/1JoPNYsMNz/?mibextid=wwXIfr',
          }));
        }
      } catch (e) {
        console.warn('Realtime contact info fetch error:', e);
      }
    }

    fetchLiveContactInfo();

    // Supabase Realtime channel for instant storefront updates on DB change
    const channel = supabase
      .channel('realtime_store_contact_info')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store_contact_info' },
        (payload) => {
          if (payload.new) {
            const row = payload.new as Record<string, any>;
            setCurrentSettings((prev) => ({
              ...prev,
              whatsapp_number: row.whatsapp_number ? row.whatsapp_number.trim() : prev.whatsapp_number,
              bkash_number: row.bkash_number ? row.bkash_number.trim() : prev.bkash_number,
              nagad_number: row.nagad_number ? row.nagad_number.trim() : prev.nagad_number,
              instagram_handle: row.instagram_handle || prev.instagram_handle,
              instagram_url: row.instagram_url || prev.instagram_url,
              email: row.email || prev.email || 'abirshikdar2@gmail.com',
              call_number: row.call_number || row.phone || prev.call_number || '01734018155',
              facebook_url: row.facebook_url || row.messenger_url || prev.facebook_url || 'https://www.facebook.com/share/1JoPNYsMNz/?mibextid=wwXIfr',
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Catalog filtering states
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [activeSize, setActiveSize] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSizes, setSelectedSizes] = useState<Record<string, GarmentSize>>({});
  const [cardImageIndices, setCardImageIndices] = useState<Record<string, number>>({});

  // Mobile nav state
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Modal & Drawer states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [directCheckoutItem, setDirectCheckoutItem] = useState<{
    product: Product;
    selectedSize: GarmentSize;
    selectedVariant?: ProductVariant;
  } | null>(null);

  // Bag / Cart state
  const [bag, setBag] = useState<CartItem[]>([]);

  // Sync bag with localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('auvare_cart_bag');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBag(parsed);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('auvare_cart_bag', JSON.stringify(bag));
    } catch {}
  }, [bag]);

  // Handle browser back button when checkout screen is open
  useEffect(() => {
    const handlePopState = () => {
      if (isCheckoutOpen) {
        setIsCheckoutOpen(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isCheckoutOpen]);


  // Checkout form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [deliveryZone, setDeliveryZone] = useState<'inside' | 'outside'>('inside');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad' | 'rocket'>('cod');
  const [senderPhone, setSenderPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{
    orderId: string;
    total: number;
    waText: string;
  } | null>(null);
  const [copiedMfs, setCopiedMfs] = useState(false);

  const handleCopyMfs = (num: string) => {
    if (!num) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(num);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = num;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedMfs(true);
      setTimeout(() => setCopiedMfs(false), 2200);
    } catch {
      // Fallback
    }
  };

  const waNumber = currentSettings.whatsapp_number || '01734018155';
  const cleanWa = waNumber.replace(/[^0-9]/g, '');

  // Filtered catalog
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((item) => {
      if (activeCategory !== 'All' && item.category !== activeCategory) return false;
      if (activeStatus === 'available' && item.sold) return false;
      if (activeStatus === 'sold' && !item.sold) return false;
      if (activeSize !== 'all') {
        const availableSizes = item.sizes || ['S', 'M', 'L', 'XL', 'XXL'];
        if (!availableSizes.includes(activeSize as any)) return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchCat = (item.category || '').toLowerCase().includes(q);
        if (!matchTitle && !matchCat) return false;
      }
      return true;
    });
  }, [initialProducts, activeCategory, activeStatus, activeSize, searchQuery]);

  // Handle adding to bag
  const handleAddToBag = (product: Product, size: GarmentSize, variant?: ProductVariant) => {
    setBag((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.id === product.id && i.selectedSize === size && i.selectedVariantName === variant?.name
      );
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += 1;
        return next;
      }
      return [
        ...prev,
        {
          ...product,
          price: variant?.price || product.price,
          selectedSize: size,
          selectedVariantName: variant?.name,
          quantity: 1,
        },
      ];
    });
    setIsBagOpen(true);
  };

  // Direct Buy Now bypass
  const handleBuyNow = (product: Product, size: GarmentSize, variant?: ProductVariant) => {
    setDirectCheckoutItem({ product, selectedSize: size, selectedVariant: variant });
    setIsCheckoutOpen(true);
  };

  // Cart operations
  const updateQuantity = (idx: number, delta: number) => {
    setBag((prev) => {
      const next = [...prev];
      const newQty = next[idx].quantity + delta;
      if (newQty <= 0) {
        return next.filter((_, i) => i !== idx);
      }
      next[idx].quantity = newQty;
      return next;
    });
  };

  const removeFromBag = (idx: number) => {
    setBag((prev) => prev.filter((_, i) => i !== idx));
  };

  const bagCount = bag.reduce((sum, item) => sum + item.quantity, 0);

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
          `• ${c.title}${c.selectedVariantName ? ` [${c.selectedVariantName}]` : ''} (Size: ${c.selectedSize}, TK ${c.price} x${c.quantity})`
      )
      .join('\n');

    const waText = encodeURIComponent(
      `*NEW ORDER CONFIRMED!* [Order #${orderId}]\n\n` +
        `*Customer Details:*\n` +
        `• Name: ${customerName}\n` +
        `• Phone: ${customerPhone}\n` +
        `• Address: ${customerAddress}\n` +
        `• Zone: ${deliveryZone === 'inside' ? 'Inside Dhaka (TK 70)' : 'Outside Dhaka (TK 130)'}\n\n` +
        `*Ordered Items:*\n${itemListText}\n\n` +
        `*Payment Method:* ${paymentMethod.toUpperCase()}\n` +
        (senderPhone ? `*Sender Phone:* ${senderPhone}\n` : '') +
        (trxId ? `*Transaction ID:* ${trxId}\n` : '') +
        `*Total Bill:* TK ${bagTotal}\n\n` +
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
      setSelectedProduct(null);
      setIsCheckoutOpen(false);
    } catch (err: any) {
      alert(err.message || 'Error creating order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* 1. Authentic Sticky Header */}
      <header className="site-header">
        <div className="container nav-wrapper">
          {/* Brand Logo */}
          <Link href="/" className="brand-link" id="brandHomeLink">
            <img src="/assets/images/logo.jpg" alt="AUVARE Crest" className="brand-crest" />
            <div className="brand-text-group">
              <span className="brand-title">AUVARE</span>
              <span className="brand-sub">Curated • Vintage</span>
            </div>
          </Link>

          {/* Navigation Links with Active Gliding Highlighting */}
          <nav>
            <ul className="nav-links" id="mainNavLinks">
              <li>
                <a
                  href="#hero"
                  className={`nav-link ${activeCategory === 'All' ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveCategory('All');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  title="Home"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <span>Home</span>
                </a>
              </li>
              <li>
                <a
                  href="#catalog"
                  className={`nav-link ${activeCategory === 'All' ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveCategory('All');
                    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  All Drops
                </a>
              </li>
              <li>
                <a
                  href="#catalog"
                  className={`nav-link ${activeCategory === 'T-Shirts' ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveCategory('T-Shirts');
                    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  T-Shirts
                </a>
              </li>
              <li>
                <a
                  href="#catalog"
                  className={`nav-link ${activeCategory === 'Shirts' ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveCategory('Shirts');
                    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Shirts &amp; Polos
                </a>
              </li>
              <li>
                <a
                  href="#catalog"
                  className={`nav-link ${activeCategory === 'Jackets' ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveCategory('Jackets');
                    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Jackets
                </a>
              </li>
              <li>
                <a
                  href="#catalog"
                  className={`nav-link ${activeCategory === 'Pants' ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveCategory('Pants');
                    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Pants
                </a>
              </li>
              <li>
                <a
                  href={currentSettings.instagram_url || 'https://www.instagram.com/auvare_official/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-link"
                >
                  Instagram Feed ↗
                </a>
              </li>
            </ul>
          </nav>

          {/* Action Buttons: Shopping Bag & Mobile Hamburger */}
          <div className="nav-actions">
            <button
              className="btn-icon"
              onClick={() => setIsBagOpen(true)}
              title="View Shopping Bag"
              aria-label="View Shopping Bag"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span id="cartBadge" className="cart-badge">{bagCount}</span>
            </button>

            <button
              className="btn-icon mobile-menu-toggle"
              onClick={() => setIsMobileNavOpen(true)}
              title="Menu"
              aria-label="Open Navigation"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Mobile Navigation Drawer */}
      {isMobileNavOpen && (
        <>
          <div className="mobile-nav-overlay active" onClick={() => setIsMobileNavOpen(false)} />
          <aside className="mobile-nav-drawer active" aria-label="Mobile Navigation">
            <div className="mobile-nav-header">
              <div className="mobile-nav-brand">
                <img src="/assets/images/logo.jpg" alt="AUVARE Logo" className="brand-crest" style={{ width: 36, height: 36 }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', letterSpacing: '0.05em' }}>
                    AUVARE
                  </div>
                  <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8' }}>
                    Curated • Vintage
                  </div>
                </div>
              </div>
              <button className="mobile-nav-close" onClick={() => setIsMobileNavOpen(false)} aria-label="Close Navigation">
                ✕
              </button>
            </div>

            <div className="mobile-nav-body">
              <div className="mobile-nav-group-title">Browse Drops</div>
              <ul className="mobile-nav-list">
                <li>
                  <a
                    href="#hero"
                    className="mobile-nav-item active"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsMobileNavOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <span>Home</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#catalog"
                    className="mobile-nav-item"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveCategory('All');
                      setIsMobileNavOpen(false);
                      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <span>All Drops</span>
                    <span className="mobile-nav-badge">{initialProducts.length}</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#catalog"
                    className="mobile-nav-item"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveCategory('T-Shirts');
                      setIsMobileNavOpen(false);
                      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <span>T-Shirts</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#catalog"
                    className="mobile-nav-item"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveCategory('Shirts');
                      setIsMobileNavOpen(false);
                      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <span>Shirts &amp; Polos</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#catalog"
                    className="mobile-nav-item"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveCategory('Jackets');
                      setIsMobileNavOpen(false);
                      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <span>Jackets</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#catalog"
                    className="mobile-nav-item"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveCategory('Pants');
                      setIsMobileNavOpen(false);
                      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <span>Pants</span>
                  </a>
                </li>
                <li>
                  <a
                    href={currentSettings.instagram_url || 'https://www.instagram.com/auvare_official/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mobile-nav-item"
                    onClick={() => setIsMobileNavOpen(false)}
                  >
                    <span>Instagram Feed ↗</span>
                  </a>
                </li>
              </ul>

              <div className="mobile-nav-divider" />

              <div className="mobile-nav-group-title">Direct Concierge</div>
              <a
                href={`https://wa.me/${cleanWa}?text=Hello%20AUVARE,%20I%20want%20to%20inquire%20about%20your%20drops!`}
                target="_blank"
                rel="noopener noreferrer"
                className="mobile-nav-wa-btn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                </svg>
                <span>WhatsApp Concierge</span>
              </a>

              <Link
                href="/admin"
                className="mobile-nav-admin-link"
                onClick={() => setIsMobileNavOpen(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M7 7h.01" />
                  <path d="M17 7h.01" />
                  <path d="M7 17h.01" />
                  <path d="M17 17h.01" />
                </svg>
                <span>Admin Management Portal ↗</span>
              </Link>
            </div>
          </aside>
        </>
      )}

      {/* 3. Authentic Hero Section */}
      <section className="hero-section" id="hero">
        <div className="container hero-grid">
          {/* Left Hero Content */}
          <div className="hero-content">
            <div className="hero-tag">
              <span className="hero-tag-dot" aria-hidden="true" />
              <span>New Lot Drop Just Landed</span>
            </div>

            <h1 className="hero-title">
              Curated Stuff, <span>Personal Taste.</span>
            </h1>

            <p className="hero-desc">
              Hand-picked vintage &amp; pre-loved imported garments. Every piece in our store is an authentic 1-of-1 item—once it’s claimed, it’s gone forever.
            </p>

            <div className="hero-actions">
              <a
                href="#catalog"
                className="btn-primary"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Explore Latest Drop ↓
              </a>
              <a
                href={`https://wa.me/${cleanWa}?text=Hello%20AUVARE,%20I%20want%20to%20inquire%20about%20your%20drops!`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-wa-cta"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                </svg>
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Right Hero Visual Card: 5s Reels Slider (Image 3: Clean, Full-View, No Progress Line, No Bottom Card) */}
          <div className="hero-visual">
            <HeroReelsSlider
              products={initialProducts}
              onSelectProduct={(prod) => setSelectedProduct(prod)}
            />
          </div>
        </div>
      </section>

      {/* 4. Value Pillars / Service Guarantees */}
      <section className="features-bar">
        <div className="container features-grid">
          {/* Card 1: 1/2 Days Delivery */}
          <div className="feature-item">
            <div className="feature-icon-circle">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m7.5 4.27 9 5.15" />
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
            </div>
            <div className="feature-text">
              <h4>1/2 Days Delivery</h4>
              <p>fastest delivery</p>
            </div>
          </div>

          {/* Card 2: Authorized Product */}
          <div className="feature-item">
            <div className="feature-icon-circle">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6" />
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
              </svg>
            </div>
            <div className="feature-text">
              <h4>Authorized Product</h4>
              <p>within 30 days for an exchange</p>
            </div>
          </div>

          {/* Card 3: Customer Service Support */}
          <div className="feature-item">
            <div className="feature-icon-circle">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <path d="M8 10h.01" />
                <path d="M12 10h.01" />
                <path d="M16 10h.01" />
              </svg>
            </div>
            <div className="feature-text">
              <h4>Customer Service Support</h4>
              <p>8am to 10pm</p>
            </div>
          </div>

          {/* Card 4: Flexible Payments */}
          <div className="feature-item">
            <div className="feature-icon-circle">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
                <path d="m14 15 2 2 4-4" />
              </svg>
            </div>
            <div className="feature-text">
              <h4>Flexible Payments</h4>
              <p>pay with multiple credit cards</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Main Drops Catalog Section */}
      <main className="catalog-section" id="catalog">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="section-title">Curated Drops &amp; Inventory</h2>
              <p className="section-subtitle">
                {filteredProducts.length} authentic piece{filteredProducts.length === 1 ? '' : 's'} available
              </p>
            </div>
          </div>

          {/* Category Pills & Secondary Filters Toolbar */}
          <div className="filter-bar">
            <div className="filter-categories">
              {['All', 'T-Shirts', 'Shirts', 'Jackets', 'Pants'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`filter-pill ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat === 'All' ? 'All Drops' : cat === 'Shirts' ? 'Shirts & Polos' : cat}
                </button>
              ))}
            </div>

            <div className="filter-secondary">
              <select
                value={activeStatus}
                onChange={(e) => setActiveStatus(e.target.value)}
                className="filter-select"
                aria-label="Filter by availability status"
              >
                <option value="all">All Status</option>
                <option value="available">In Stock (Available)</option>
                <option value="sold">Sold Out Drops</option>
              </select>

              <select
                value={activeSize}
                onChange={(e) => setActiveSize(e.target.value)}
                className="filter-select"
                aria-label="Filter by size"
              >
                <option value="all">All Sizes</option>
                <option value="S">Size S</option>
                <option value="M">Size M</option>
                <option value="L">Size L</option>
                <option value="XL">Size XL</option>
                <option value="XXL">Size XXL</option>
              </select>

              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, size..."
                  className="form-input"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', width: '180px' }}
                />
              </div>
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="products-grid">
            {filteredProducts.length === 0 ? (
              <div
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '4rem 1rem',
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px dashed var(--color-border)',
                }}
              >
                <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
                  No drops match your filter
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                  Try selecting a different category, availability status, or size.
                </p>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setActiveCategory('All');
                    setActiveStatus('all');
                    setActiveSize('all');
                    setSearchQuery('');
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredProducts.map((item) => {
                const itemSizes: GarmentSize[] = (item.sizes && item.sizes.length > 0)
                  ? (item.sizes as GarmentSize[])
                  : ['S', 'M', 'L', 'XL', 'XXL'];
                const selectedSize = selectedSizes[item.id] || itemSizes[0] || 'M';
                const images = item.images && item.images.length > 0 ? item.images : [item.image || '/assets/images/logo.jpg'];
                const currentImgIdx = cardImageIndices[item.id] || 0;
                const primaryImg = images[currentImgIdx] || images[0];
                const hasMultiple = images.length > 1;

                return (
                  <article
                    key={item.id}
                    className={`product-card ${item.sold ? 'sold-out' : ''}`}
                    onClick={() => setSelectedProduct(item)}
                  >
                    <div
                      className="product-image-box"
                      title="Click to view full product details"
                    >
                      <img
                        className="product-card-img"
                        src={primaryImg}
                        alt={item.title}
                        loading="lazy"
                      />

                      <div className="product-badge-group">
                        <span className="badge-tag unique">Curated Drop</span>
                        {item.sold ? (
                          <span className="badge-tag sold">SOLD OUT</span>
                        ) : (
                          <span className="badge-tag condition">
                            {item.condition ? item.condition.split('(')[0].trim() : 'Mint'}
                          </span>
                        )}
                      </div>

                      {hasMultiple && (
                        <>
                          <span className="multi-photo-badge">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                              <circle cx="12" cy="13" r="4" />
                            </svg>
                            {images.length}
                          </span>
                          <div
                            className="product-card-gallery-dots"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {images.map((_, idx) => (
                              <button
                                key={idx}
                                type="button"
                                className={`gallery-dot ${idx === currentImgIdx ? 'active' : ''}`}
                                onClick={() =>
                                  setCardImageIndices((prev) => ({ ...prev, [item.id]: idx }))
                                }
                                title={`Photo ${idx + 1}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="product-info" style={{ padding: '0.85rem 1rem 1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <h3
                        className="product-title"
                        style={{
                          fontSize: '0.92rem',
                          fontWeight: 600,
                          color: '#18181b',
                          lineHeight: 1.35,
                          marginBottom: '0.35rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: '2.4rem',
                          cursor: 'pointer',
                        }}
                        title={item.title}
                        onClick={() => setSelectedProduct(item)}
                      >
                        {item.title}
                      </h3>

                      <div style={{ borderBottom: '1px solid #e7e4dc', margin: '0.2rem 0 0.55rem' }} />

                      <div
                        className="product-price-row"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          marginBottom: '0.85rem',
                          padding: 0,
                          border: 'none',
                        }}
                      >
                        <span
                          className="product-price"
                          style={{
                            fontSize: '1.05rem',
                            fontWeight: 700,
                            color: 'var(--color-primary, #105036)',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          TK {formatBDT(item.price)}
                        </span>
                      </div>

                      <div
                        className="product-card-actions"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '0.5rem',
                          marginTop: 'auto',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="btn-primary"
                          style={{
                            padding: '0.65rem 0.5rem',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            borderRadius: '6px',
                            textAlign: 'center',
                            justifyContent: 'center',
                            whiteSpace: 'nowrap',
                          }}
                          disabled={item.sold}
                          onClick={() => handleAddToBag(item, selectedSize)}
                        >
                          {item.sold ? 'Drop Claimed' : 'Add to Bag'}
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{
                            padding: '0.65rem 0.5rem',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            borderRadius: '6px',
                            textAlign: 'center',
                            justifyContent: 'center',
                            background: '#ffffff',
                            border: '1px solid #d1d5db',
                            color: '#18181b',
                          }}
                          onClick={() => setSelectedProduct(item)}
                          title="Inspect Product Details"
                        >
                          Inspect
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* 6. Instagram Showcase Section */}
      <section className="instagram-section" id="instagram">
        <div className="container">
          <div className="ig-profile-card">
            <div className="ig-profile-left">
              <img src="/assets/images/logo.jpg" alt="AUVARE Profile" className="ig-avatar" />
              <div className="ig-names">
                <h3>AUVARE</h3>
                <a
                  href={currentSettings.instagram_url || 'https://www.instagram.com/auvare_official/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ig-handle"
                >
                  {currentSettings.instagram_handle || '@auvare_official'}
                </a>
                <div className="ig-stats-row">
                  <span><strong>959</strong> posts</span>
                  <span><strong>1,616</strong> followers</span>
                  <span><strong>Curated Vintage</strong> • Bangladesh</span>
                </div>
              </div>
            </div>

            <a
              href={currentSettings.instagram_url || 'https://www.instagram.com/auvare_official/'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              Follow on Instagram ↗
            </a>
          </div>
        </div>
      </section>

      {/* 7. Authentic Rich Site Footer */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link
                href="/"
                className="brand-link footer-brand-link"
                style={{ marginBottom: '1.15rem', display: 'inline-flex', alignItems: 'center', gap: '0.85rem', textDecoration: 'none' }}
              >
                <img
                  src="/assets/images/logo.jpg"
                  alt="AUVARE Crest"
                  className="brand-crest"
                  style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(255, 255, 255, 0.2)' }}
                />
                <div className="brand-text-group">
                  <span className="brand-title" style={{ color: '#ffffff', fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700, letterSpacing: '0.12em', lineHeight: 1, display: 'block' }}>
                    AUVARE
                  </span>
                  <span className="brand-sub" style={{ color: '#94a3b8', fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, display: 'block', marginTop: '0.25rem' }}>
                    Curated • Vintage
                  </span>
                </div>
              </Link>
              <p>
                We sell curated stuff, personal taste. Worldwide shipping, proudly based in Bangladesh. Every piece is an authentic vintage &amp; pre-loved treasure.
              </p>
            </div>

            <div className="footer-col">
              <h4>Explore Drops</h4>
              <ul className="footer-links">
                <li><a href="#catalog" onClick={() => setActiveCategory('Shirts')}>T-Shirts &amp; Polos</a></li>
                <li><a href="#catalog" onClick={() => setActiveCategory('Jackets')}>Vintage Jackets</a></li>
                <li><a href="#catalog" onClick={() => setActiveCategory('Pants')}>Pants &amp; Trousers</a></li>
                <li><a href="#catalog" onClick={() => setActiveCategory('All')}>New Arrivals</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Customer Care</h4>
              <ul className="footer-links">
                <li><a href="#catalog">Size &amp; Measurement Guide</a></li>
                <li><a href="#catalog">Condition Grading (8/10 to 10/10)</a></li>
                <li><a href="#catalog">Delivery Policies</a></li>
                <li><a href="#catalog">1-of-1 Pre-loved Return Rules</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Stay Connected</h4>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1rem' }}>
                Follow our Instagram for flash stories and drop notifications before they hit the site.
              </p>
              <a
                href={currentSettings.instagram_url || 'https://www.instagram.com/auvare_official/'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
              >
                {currentSettings.instagram_handle || '@auvare_official'} on IG ↗
              </a>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} AUVARE. All rights reserved. Curated Vintage &amp; Pre-loved Fashion.</p>
            <p>Payment Supported: Cash on Delivery • bKash • Nagad • Rocket • Bank Transfer</p>
            <p style={{ width: '100%', textAlign: 'center', marginTop: '0.65rem', fontSize: '0.8125rem' }}>
              <a
                href="https://wa.me/8801734018155"
                target="_blank"
                rel="noopener noreferrer"
                title="Connect with Developer on WhatsApp"
                style={{
                  color: '#6b7280',
                  textDecoration: 'none',
                  transition: 'color 0.25s ease',
                  cursor: 'pointer',
                  display: 'inline-block',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#25D366';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                Developed by <span style={{ fontWeight: 600, borderBottom: '1px dotted rgba(156,163,175,0.6)' }}>Abir Shikdar</span>
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* 8. Full-Screen In-Details Studio (Sailor Zoom, Suggested Pieces & Recently Viewed) */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          allProducts={initialProducts}
          onClose={() => setSelectedProduct(null)}
          onSelectProduct={(prod) => setSelectedProduct(prod)}
          onAddToBag={(prod, sz, variant) => {
            handleAddToBag(prod, sz, variant);
          }}
          onBuyNow={handleBuyNow}
        />
      )}

      {/* 9. Shopping Bag Drawer */}
      <div
        className={`drawer-overlay cart-drawer-overlay ${isBagOpen ? 'open active' : ''}`}
        onClick={() => setIsBagOpen(false)}
      />
      <div className={`cart-drawer ${isBagOpen ? 'open active' : ''}`}>
        <div className="drawer-header">
          <h3>Your Bag ({bagCount})</h3>
          <button
            type="button"
            className="drawer-close"
            onClick={() => setIsBagOpen(false)}
            aria-label="Close Bag"
          >
            ✕
          </button>
        </div>

        <div className="drawer-body">
          {bag.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
              <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
                Your bag is empty
              </p>
              <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Explore our curated drops and claim your 1-of-1 vintage garment!
              </p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setIsBagOpen(false)}
              >
                Start Browsing
              </button>
            </div>
          ) : (
            bag.map((item, idx) => (
              <div
                key={`${item.id}_${item.selectedSize}_${item.selectedVariantName || ''}_${idx}`}
                className="cart-item"
                style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '0.85rem',
                  marginBottom: '0.85rem',
                  background: '#ffffff',
                  border: '1px solid #f1f5f9',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  alignItems: 'center',
                }}
              >
                <img
                  src={item.image || item.images?.[0] || '/assets/images/logo.jpg'}
                  alt={item.title}
                  className="cart-item-img"
                  style={{
                    width: '72px',
                    height: '92px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    flexShrink: 0,
                  }}
                />
                <div className="cart-item-info" style={{ flexGrow: 1, minWidth: 0 }}>
                  <div
                    className="cart-item-title"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      lineHeight: 1.3,
                      marginBottom: '0.25rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={item.title}
                  >
                    {item.title}
                  </div>
                  <div className="cart-item-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: '#475569',
                        background: '#f1f5f9',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      Size: {item.selectedSize}
                    </span>
                    {item.selectedVariantName && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: '#64748b',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.selectedVariantName}
                      </span>
                    )}
                  </div>
                  <div className="cart-item-price" style={{ fontWeight: 800, color: 'var(--color-primary, #105036)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                    TK {formatBDT(item.price)}
                  </div>
                  <div className="cart-item-controls" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        background: '#f8fafc',
                        overflow: 'hidden',
                        height: '28px',
                      }}
                    >
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => updateQuantity(idx, -1)}
                        style={{
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          color: '#334155',
                          transition: 'background 0.15s',
                        }}
                      >
                        -
                      </button>
                      <span
                        style={{
                          minWidth: '24px',
                          textAlign: 'center',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: '#0f172a',
                        }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => updateQuantity(idx, 1)}
                        style={{
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          color: '#334155',
                          transition: 'background 0.15s',
                        }}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeFromBag(idx)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: '#ef4444',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        transition: 'background 0.15s',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {bag.length > 0 && (
          <div className="drawer-footer">
            {/* Delivery Zone Selector */}
            <div style={{ marginBottom: '1.1rem' }}>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '0.45rem' }}>
                Delivery Destination:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setDeliveryZone('inside')}
                  style={{
                    padding: '0.65rem 0.5rem',
                    fontSize: '0.78rem',
                    fontWeight: deliveryZone === 'inside' ? 700 : 600,
                    borderRadius: '8px',
                    border: `1.5px solid ${deliveryZone === 'inside' ? 'var(--color-primary, #105036)' : '#e2e8f0'}`,
                    background: deliveryZone === 'inside' ? '#f0fdf4' : '#ffffff',
                    color: deliveryZone === 'inside' ? 'var(--color-primary, #105036)' : '#334155',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: deliveryZone === 'inside' ? '0 1px 2px rgba(16,80,54,0.08)' : 'none',
                  }}
                >
                  Inside Dhaka (TK 70)
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryZone('outside')}
                  style={{
                    padding: '0.65rem 0.5rem',
                    fontSize: '0.78rem',
                    fontWeight: deliveryZone === 'outside' ? 700 : 600,
                    borderRadius: '8px',
                    border: `1.5px solid ${deliveryZone === 'outside' ? 'var(--color-primary, #105036)' : '#e2e8f0'}`,
                    background: deliveryZone === 'outside' ? '#f0fdf4' : '#ffffff',
                    color: deliveryZone === 'outside' ? 'var(--color-primary, #105036)' : '#334155',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: deliveryZone === 'outside' ? '0 1px 2px rgba(16,80,54,0.08)' : 'none',
                  }}
                >
                  Outside Dhaka (TK 130)
                </button>
              </div>
            </div>

            {/* Financial Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              <div className="cart-total-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', color: '#64748b' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>TK {formatBDT(bagSubtotal)}</span>
              </div>
              <div className="cart-total-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', color: '#64748b' }}>
                <span>Delivery Charge</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>TK {formatBDT(deliveryCharge)}</span>
              </div>
              <div
                className="cart-total-row final"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px dashed #cbd5e1',
                  paddingTop: '0.75rem',
                  marginTop: '0.35rem',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: 'var(--color-primary, #105036)',
                }}
              >
                <span>Total Bill</span>
                <span>TK {formatBDT(bagTotal)}</span>
              </div>
            </div>

            <button
              type="button"
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.95rem 1rem',
                fontSize: '0.92rem',
                fontWeight: 700,
                borderRadius: '10px',
                boxShadow: '0 4px 14px rgba(16,80,54,0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
              }}
              onClick={() => {
                setDirectCheckoutItem(null);
                setIsBagOpen(false);
                setIsCheckoutOpen(true);
              }}
            >
              Proceed to Instant Checkout →
            </button>
          </div>
        )}
      </div>

      {/* 10. Standalone Shopify-Style Checkout Screen (Top Ten 90% Match) */}
      {isCheckoutOpen && (
        <ShopifyCheckoutScreen
          items={checkoutItems}
          deliveryZone={deliveryZone}
          setDeliveryZone={setDeliveryZone}
          onClose={() => {
            setIsCheckoutOpen(false);
            setDirectCheckoutItem(null);
            setIsBagOpen(true);
            try {
              if (window.location.hash === '#checkout') {
                window.history.pushState(null, '', window.location.pathname);
              }
            } catch {}
          }}
          onOrderSuccess={(orderData) => {
            setOrderSuccess(orderData);
            if (!directCheckoutItem) {
              setBag([]);
              try {
                localStorage.removeItem('auvare_cart_bag');
              } catch {}
            }
            setDirectCheckoutItem(null);
            setSelectedProduct(null);
            setIsCheckoutOpen(false);
            try {
              if (window.location.hash === '#checkout') {
                window.history.pushState(null, '', window.location.pathname);
              }
            } catch {}
          }}
        />
      )}

      {/* 11. Order Success Modal */}
      {orderSuccess && (
        <div className="modal-overlay open active">
          <div className="modal-content" style={{ maxWidth: '460px', textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-primary-soft)', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
              Order Placed Successfully!
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
              Order ID: <strong style={{ color: 'var(--color-text-main)' }}>#{orderSuccess.orderId}</strong>
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              Total Payable: <strong style={{ color: 'var(--color-primary)' }}>TK {formatBDT(orderSuccess.total)}</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a
                href={`https://wa.me/${cleanWa}?text=${orderSuccess.waText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ background: '#25D366', borderColor: '#25D366' }}
              >
                Send Confirmation on WhatsApp ↗
              </a>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setOrderSuccess(null)}
              >
                Continue Browsing AUVARE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 12. Mediasoft BD Multichannel Help Widget at Bottom-Left Corner */}
      <MediasoftWidget 
        phone={currentSettings.call_number || currentSettings.whatsapp_number || '01734018155'}
        whatsappNumber={cleanWa}
        email={currentSettings.email || 'abirshikdar2@gmail.com'}
        facebookUrl={currentSettings.facebook_url || 'https://www.facebook.com/share/1JoPNYsMNz/?mibextid=wwXIfr'}
      />
    </>
  );
}
