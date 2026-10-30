'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Home, ShoppingCart, Tag, Users, Folder, Plus, RefreshCw, 
  Trash2, Edit, ExternalLink, Image as ImageIcon, X, Check, Search, 
  Menu, Upload, Copy, CheckCircle, ArrowLeft, MessageCircle
} from 'lucide-react';
import type { Product, Order, ProductVariant, GarmentSize } from '@/types';
import { formatBDT, getCleanWaNumber } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { parseSupabaseProduct, parseSupabaseOrder } from '@/lib/supabase/products';

const DEFAULT_PRESETS = [
  'Washed Black', 'Vintage Olive', 'Oatmeal Beige', 'Faded Navy', 
  'Acid Wash', 'Distressed White', 'Earth Brown'
];

export function AdminPortal() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Navigation tab order: Home -> Orders -> Products -> Users -> Categories
  const [activeTab, setActiveTab] = useState<'home' | 'orders' | 'products' | 'users' | 'categories'>('orders');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Selected Order for Details Modal
  const [activeOrderModal, setActiveOrderModal] = useState<Order | null>(null);
  const [modalStatus, setModalStatus] = useState<string>('pending');
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Product Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editorImages, setEditorImages] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [editorVariants, setEditorVariants] = useState<ProductVariant[]>([]);
  
  // Variants Manager State
  const [variantPresets, setVariantPresets] = useState<string[]>(DEFAULT_PRESETS);
  const [newPresetName, setNewPresetName] = useState('');
  const [isVariantFormOpen, setIsVariantFormOpen] = useState(false);
  const [variantFormName, setVariantFormName] = useState('');
  const [variantFormPrice, setVariantFormPrice] = useState<string>('');
  const [variantFormSizes, setVariantFormSizes] = useState<GarmentSize[]>(['S', 'M', 'L', 'XL', 'XXL']);
  const [variantFormStatus, setVariantFormStatus] = useState<'available' | 'sold'>('available');

  // Load live data from Supabase
  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const ts = Date.now();
      const [prodRes, ordRes] = await Promise.all([
        fetch(`/api/admin/products?t=${ts}`, { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
        fetch(`/api/admin/orders?t=${ts}`, { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
      ]);

      if (prodRes && prodRes.success && Array.isArray(prodRes.products)) {
        setProducts(prodRes.products);
      } else {
        const { data: pData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (pData) {
          setProducts(pData.map(parseSupabaseProduct));
        }
      }

      if (ordRes && ordRes.success && Array.isArray(ordRes.orders)) {
        setOrders(ordRes.orders);
      } else {
        const { data: oData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (oData) {
          setOrders(oData.map(parseSupabaseOrder));
        }
      }
    } catch (e) {
      console.warn('Error loading Supabase data:', e);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    try {
      const saved = localStorage.getItem('auvare_variant_presets_v2');
      if (saved) setVariantPresets(JSON.parse(saved));
    } catch {}

    // Auto-polling interval: check for new incoming storefront orders every 7 seconds
    const interval = setInterval(() => {
      loadData(true);
    }, 7000);

    // Also reload fresh data immediately when admin tab gets focused
    const handleFocus = () => {
      loadData(true);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const savePresets = (list: string[]) => {
    setVariantPresets(list);
    try { localStorage.setItem('auvare_variant_presets_v2', JSON.stringify(list)); } catch {}
  };

  const handleResetPresets = () => {
    savePresets(DEFAULT_PRESETS);
  };

  const handleAddPreset = () => {
    const val = newPresetName.trim();
    if (!val) return;
    if (variantPresets.some(p => p.toLowerCase() === val.toLowerCase())) {
      setVariantFormName(val);
      setNewPresetName('');
      return;
    }
    const updated = [...variantPresets, val];
    savePresets(updated);
    setVariantFormName(val);
    setNewPresetName('');
  };

  const handleDeletePreset = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = variantPresets.filter((_, i) => i !== idx);
    savePresets(updated);
  };

  // Open Product Editor
  const handleOpenEditor = (prod?: Product) => {
    if (prod) {
      setEditingProduct(prod);
      setEditorImages(prod.images && prod.images.length > 0 ? prod.images : (prod.image ? [prod.image] : []));
      setEditorVariants(prod.variants || []);
    } else {
      setEditingProduct({
        title: '',
        description: '',
        category: 'T-Shirts',
        price: 990,
        condition: '9.5/10 (Mint Condition)',
        chest: '38"-46"',
        length: '26"-30"',
        status: 'available',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      });
      setEditorImages([]);
      setEditorVariants([]);
    }
    setIsEditorOpen(true);
    setIsVariantFormOpen(false);
  };

  // Handle Image Upload (Multi-Photo)
  const handleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url) newUrls.push(data.url);
        } else {
          // Local fallback preview if storage bucket is still provisioning
          const objectUrl = URL.createObjectURL(file);
          newUrls.push(objectUrl);
        }
      } catch (err) {
        const objectUrl = URL.createObjectURL(file);
        newUrls.push(objectUrl);
      }
    }

    setEditorImages(prev => [...prev, ...newUrls]);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddImageUrl = () => {
    const trimmed = customImageUrl.trim();
    if (!trimmed) return;
    setEditorImages(prev => [...prev, trimmed]);
    setCustomImageUrl('');
  };

  // Save Product to Backend API & Supabase
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const payload = {
      ...editingProduct,
      image: editorImages[0] || '/assets/images/logo.jpg',
      images: editorImages,
      variants: editorVariants,
    };

    try {
      let res: Response;
      if (editingProduct.id) {
        res = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to save product drop');
      }

      setIsEditorOpen(false);
      await loadData();
    } catch (err: any) {
      alert(`Save Error: ${err.message || 'Failed to save product drop'}`);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this garment drop?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Delete failed');
      }
      await loadData();
    } catch (err: any) {
      alert(`Delete Error: ${err.message || 'Failed to delete product drop'}`);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Status update failed');
      }
      setActiveOrderModal(null);
      await loadData();
    } catch (err: any) {
      alert(`Status Error: ${err.message || 'Failed to update order status'}`);
    }
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/70 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar: Home -> Orders -> Products -> Users -> Categories */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-brand-dark text-white flex flex-col shrink-0 border-r border-slate-800 transition-transform duration-300 md:static md:translate-x-0
        ${isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/images/logo.jpg" alt="Logo" className="w-8 h-8 rounded-full border border-white/20" />
            <div>
              <h1 className="font-serif font-bold text-base tracking-wider leading-none text-brand-light">AUVARE</h1>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Store Manager</span>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => setIsMobileSidebarOpen(false)} 
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          <button
            type="button"
            onClick={() => { setActiveTab('home'); setIsEditorOpen(false); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'home' && !isEditorOpen ? 'bg-brand-primary text-white shadow' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('orders'); setIsEditorOpen(false); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'orders' && !isEditorOpen ? 'bg-brand-primary text-white shadow' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingCart className="w-4 h-4" />
              <span>Orders</span>
            </div>
            {orders.length > 0 && (
              <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                {orders.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('products'); setIsEditorOpen(false); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'products' && !isEditorOpen ? 'bg-brand-primary text-white shadow' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Tag className="w-4 h-4" />
              <span>Products</span>
            </div>
            {products.length > 0 && (
              <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                {products.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('users'); setIsEditorOpen(false); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'users' && !isEditorOpen ? 'bg-brand-primary text-white shadow' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4" />
              <span>Users</span>
            </div>
            <span className="bg-amber-500/30 text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-bold">1</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('categories'); setIsEditorOpen(false); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'categories' && !isEditorOpen ? 'bg-brand-primary text-white shadow' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Folder className="w-4 h-4" />
              <span>Categories</span>
            </div>
            <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">4</span>
          </button>
        </nav>

        <div className="p-4 border-t border-white/10 flex flex-col gap-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area (Unified single-scroll container without nested mouse-trap scrollbars) */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {/* Mobile Top Header (Matches Image 3) */}
        <header className="md:hidden bg-brand-dark text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
          <button 
            type="button" 
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-white/10 transition"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <img src="/assets/images/logo.jpg" alt="Logo" className="w-6 h-6 rounded-full border border-white/20" />
            <span className="font-serif font-bold text-sm tracking-wider text-brand-light">AUVARE</span>
          </div>

          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-primary/40 border border-brand-primary text-emerald-300">
            {activeTab}
          </span>
        </header>

        {/* Desktop Topbar */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200 px-8 items-center justify-between sticky top-0 z-20">
          <div>
            <h2 className="text-base font-bold text-slate-900 capitalize font-serif">
              {isEditorOpen ? 'Product Drop Editor' : activeTab}
            </h2>
            <p className="text-xs text-slate-500">AUVARE Store Management System</p>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'products' && !isEditorOpen && (
              <button
                type="button"
                onClick={() => handleOpenEditor()}
                className="bg-brand-primary hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Product</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => loadData()}
              disabled={isLoading}
              className="p-2 border rounded-lg text-slate-600 hover:bg-slate-100 transition"
              title="Refresh live data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Tab 1: Home Dashboard */}
        {activeTab === 'home' && !isEditorOpen && (
          <div className="p-4 sm:p-8 space-y-6 max-w-6xl w-full mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sales</span>
                <p className="text-2xl font-extrabold text-brand-dark mt-2">{formatBDT(totalSales)}</p>
                <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">Online Store &amp; COD</span>
              </div>

              <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
                <p className="text-2xl font-extrabold text-brand-dark mt-2">{orders.length}</p>
                <span className="text-xs text-amber-600 font-semibold mt-1 inline-block">{pendingOrders} Pending Fulfillment</span>
              </div>

              <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Drops</span>
                <p className="text-2xl font-extrabold text-brand-dark mt-2">{products.filter(p => !p.sold).length}</p>
                <span className="text-xs text-slate-500 font-semibold mt-1 inline-block">{products.length} Total Curated</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-slate-900">Recent Activity &amp; Live Drops</h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-brand-primary hover:underline"
                >
                  View All Orders →
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Connected live to Supabase PostgreSQL database. All front-end drops and orders synchronize in real time.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Orders (Comes before Products) */}
        {activeTab === 'orders' && !isEditorOpen && (
          <div className="p-4 sm:p-8 space-y-4 max-w-7xl w-full mx-auto">
            {/* Header / Subtitle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold font-serif text-slate-900">Orders</h2>
                <p className="text-xs text-slate-500">
                  Track and process customer orders, delivery status, and payment confirmations.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => loadData()}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh Orders</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEditor()}
                  className="px-3 py-1.5 bg-brand-primary hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Product</span>
                </button>
              </div>
            </div>

            {/* Mobile swipe notice (Matches Image 1) */}
            <div className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-[11px] text-slate-600 flex items-center gap-2">
              <span>»</span>
              <span>Swipe table horizontally to view customer address, trx, size &amp; order status</span>
            </div>

            {/* Orders Table Container */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Customer Orders ({orders.length})</h3>
                  <p className="text-[11px] text-slate-500">
                    Real-time customer checkout requests with chosen size (S/M/L/XL/XXL) &amp; payment info.
                  </p>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  <ShoppingCart className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-bold text-slate-700 text-sm">No orders recorded yet</p>
                  <p className="text-xs text-slate-400 mt-1">Orders placed on the storefront will appear here immediately.</p>
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse text-xs whitespace-nowrap sm:whitespace-normal">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                        <th className="p-3 font-bold min-w-[110px]">Order ID</th>
                        <th className="p-3 font-bold min-w-[140px]">Customer</th>
                        <th className="p-3 font-bold min-w-[180px]">Delivery Address</th>
                        <th className="p-3 font-bold min-w-[180px]">Items &amp; Sizes</th>
                        <th className="p-3 font-bold min-w-[90px]">Total</th>
                        <th className="p-3 font-bold min-w-[90px]">Status</th>
                        <th className="p-3 font-bold min-w-[90px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map(o => (
                        <tr key={o.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-3 font-mono font-bold text-brand-dark">
                            #{o.id}
                            <div className="text-[10px] text-slate-400 font-sans font-normal">
                              {new Date(o.createdAt || Date.now()).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{o.customerName}</div>
                            <div className="text-slate-500 font-mono text-[11px]">{o.customerPhone}</div>
                          </td>
                          <td className="p-3 max-w-xs truncate text-slate-600" title={o.deliveryAddress}>
                            {o.deliveryAddress}
                          </td>
                          <td className="p-3">
                            {o.items?.map((item, idx) => (
                              <div key={idx} className="text-[11px] text-slate-700">
                                <strong>{item.title}</strong> [Size: {item.size}] x{item.quantity}
                              </div>
                            ))}
                          </td>
                          <td className="p-3 font-bold text-brand-dark">{formatBDT(o.totalAmount)}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                              o.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                              o.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                              o.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => { setActiveOrderModal(o); setModalStatus(o.status); }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-brand-primary hover:text-white text-slate-800 font-bold rounded text-[11px] transition shadow-2xs"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Products */}
        {activeTab === 'products' && !isEditorOpen && (
          <div className="p-4 sm:p-8 space-y-4 max-w-7xl w-full mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold font-serif text-slate-900">Products</h2>
                <p className="text-xs text-slate-500">
                  Full control over clothing drops, sizes (S, M, L, XL, XXL), variants, and catalog pricing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenEditor()}
                className="bg-brand-primary hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Product</span>
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">Garment Catalog ({products.length})</h3>
                <span className="text-xs text-slate-500">Zero mock data — Live Supabase synchronization</span>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  <Tag className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-bold text-slate-700 text-sm">No products in database</p>
                  <p className="text-xs text-slate-400 mt-1">Click "+ Add Product" to publish your first drop.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                  {products.map(p => (
                    <div key={p.id} className="border border-slate-200 rounded-lg p-3 bg-white flex flex-col justify-between hover:shadow-sm transition">
                      <div>
                        <div className="relative aspect-[3/4] bg-slate-100 rounded mb-2 overflow-hidden">
                          <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                          {p.images && p.images.length > 1 && (
                            <span className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                              {p.images.length} Photos
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-[10px] font-bold uppercase text-brand-primary bg-brand-soft px-1.5 py-0.5 rounded">
                            {p.category}
                          </span>
                          <span className="font-bold text-slate-900">{formatBDT(p.price)}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{p.title}</h4>
                        {p.variants && p.variants.length > 0 && (
                          <div className="text-[10px] text-slate-500 mt-1">
                            {p.variants.length} variant{p.variants.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-3 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleOpenEditor(p)}
                          className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded flex items-center justify-center gap-1 transition"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingProduct(p)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded transition"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Users */}
        {activeTab === 'users' && !isEditorOpen && (
          <div className="p-4 sm:p-8 space-y-4 max-w-4xl w-full mx-auto">
            <h2 className="text-lg font-bold font-serif text-slate-900">Admin Users</h2>
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex items-center gap-4">
              <img src="/assets/images/logo.jpg" alt="Admin" className="w-14 h-14 rounded-full border border-slate-200" />
              <div>
                <h3 className="font-bold text-sm text-slate-900">Md Abir Shikdar</h3>
                <span className="text-xs text-brand-primary font-bold bg-brand-soft px-2 py-0.5 rounded-full inline-block mt-0.5">
                  Super Admin
                </span>
                <p className="text-xs text-slate-500 mt-1">Direct authority over catalog, orders, and pricing.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Categories */}
        {activeTab === 'categories' && !isEditorOpen && (
          <div className="p-4 sm:p-8 space-y-4 max-w-4xl w-full mx-auto">
            <h2 className="text-lg font-bold font-serif text-slate-900">Product Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {['T-Shirts', 'Shirts', 'Jackets', 'Pants'].map(cat => (
                <div key={cat} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <h3 className="font-bold text-sm text-slate-900">{cat}</h3>
                  <span className="text-xs text-slate-500">
                    {products.filter(p => p.category === cat).length} active drops
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            PRODUCT DROP EDITOR (Full Polaris-Style Layout matching Image 4 & Image 5)
           ========================================================================= */}
        {isEditorOpen && editingProduct && (
          <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full">
            <form onSubmit={handleSaveProduct} className="space-y-6">
              {/* Back Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h3 className="font-serif font-bold text-lg text-slate-900">
                    {editingProduct.id ? `Edit: ${editingProduct.title}` : 'New Product Drop'}
                  </h3>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-brand-primary hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
                  >
                    Save Product
                  </button>
                </div>
              </div>

              {/* Grid 2-Column: Main Details & Sidebar */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Columns: Media, Details, Variants */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Card 1: Title & Description */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 90s Vintage Outdoor Mountain Parka Jacket"
                        value={editingProduct.title || ''}
                        onChange={e => setEditingProduct(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:border-brand-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                      <textarea
                        rows={3}
                        placeholder="Two-tone retro mountain parka with storm flap, adjustable peaked hood, and dual cargo pockets."
                        value={editingProduct.description || ''}
                        onChange={e => setEditingProduct(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                  </div>

                  {/* Card 2: Media Gallery (Multi-Photo Drop Uploader matching Image 4 & User Request 4) */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Media Gallery</label>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {editorImages.length} photo{editorImages.length === 1 ? '' : 's'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">Multiple high-resolution drop photos (front, back, details)</span>
                    </div>

                    {/* Hidden multi-file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      multiple
                      onChange={handleFilesUpload}
                      className="hidden"
                    />

                    {/* Default State: Box-Box Checkerboard Background Theme when 0 images */}
                    {editorImages.length === 0 ? (
                      <div 
                        className="w-full rounded-xl border-2 border-dashed border-slate-300 p-8 text-center flex flex-col items-center justify-center relative overflow-hidden"
                        style={{
                          backgroundColor: '#f8fafc',
                          backgroundImage: 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
                          backgroundSize: '16px 16px',
                          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                        }}
                      >
                        <div className="bg-white/95 backdrop-blur-xs p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col items-center max-w-sm text-center">
                          <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                          <strong className="text-xs text-slate-800">No photos uploaded yet</strong>
                          <span className="text-[11px] text-slate-500 mt-1 mb-3">
                            Add multiple images (front, back, details) for this drop edition.
                          </span>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="px-4 py-2 bg-brand-primary hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{isUploading ? 'Uploading...' : '+ Select Multiple Photos'}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Thumbnails Grid */
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {editorImages.map((img, idx) => (
                          <div 
                            key={idx} 
                            className={`relative aspect-square rounded-lg border overflow-hidden group bg-slate-100 ${
                              idx === 0 ? 'border-brand-primary ring-2 ring-brand-primary/30' : 'border-slate-200'
                            }`}
                          >
                            <img src={img} alt={`Drop photo ${idx + 1}`} className="w-full h-full object-cover" />
                            {idx === 0 ? (
                              <span className="absolute top-1.5 left-1.5 bg-brand-primary text-white text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded shadow z-10">
                                ★ COVER
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  const newImgs = [img, ...editorImages.filter((_, i) => i !== idx)];
                                  setEditorImages(newImgs);
                                }}
                                className="absolute bottom-1.5 right-1.5 bg-white/90 hover:bg-brand-primary hover:text-white text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-300 shadow opacity-0 group-hover:opacity-100 transition z-10"
                              >
                                ★ Make Cover
                              </button>
                            )}
                            <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                              #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => setEditorImages(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xs font-bold shadow transition z-10"
                              title="Delete photo"
                            >
                              ×
                            </button>
                          </div>
                        ))}

                        {/* Add image button tile */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="aspect-square border-2 border-dashed border-slate-300 hover:border-brand-primary hover:bg-emerald-50/40 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:text-brand-primary transition p-2 text-center"
                        >
                          <Plus className="w-5 h-5 mb-1" />
                          <span className="text-[11px] font-bold">{isUploading ? 'Uploading...' : 'Add image'}</span>
                        </button>
                      </div>
                    )}

                    {/* Or enter Image URL */}
                    <div className="pt-2">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Or enter Image URL / Path (Unsplash, Supabase, Cloudinary or local paths):
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="https://images.unsplash.com/... or assets/images/item.jpg"
                          value={customImageUrl}
                          onChange={e => setCustomImageUrl(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddImageUrl(); } }}
                          className="flex-1 text-xs p-2 border rounded-lg focus:outline-none focus:border-brand-primary"
                        />
                        <button
                          type="button"
                          onClick={handleAddImageUrl}
                          className="px-3 py-2 bg-brand-primary hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition"
                        >
                          + Add Image
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        <em>Tip: You can add 2, 3, 4, 5+ photos. The photo marked with the green <strong>COVER</strong> badge is the main photo shown on the storefront. Click "Make Cover" on any photo to set it as main.</em>
                      </p>
                    </div>
                  </div>

                  {/* Card 3: Product Variants Sector (Matching Image 5 & User Request 6) */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">Product Variants</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {editorVariants.length} variants
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Add colorways, washes, special editions, or styles (যেমন: Washed Black, Vintage Olive, Acid Wash ইত্যাদি)।
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsVariantFormOpen(!isVariantFormOpen)}
                        className="text-xs font-bold px-3 py-1.5 border border-brand-primary text-brand-primary bg-white rounded-lg hover:bg-brand-soft transition flex items-center gap-1"
                      >
                        <span>{isVariantFormOpen ? '− Close' : '+ Add Variant'}</span>
                      </button>
                    </div>

                    {/* Inline Variant Form Card */}
                    {isVariantFormOpen && (
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-300 space-y-4 shadow-2xs">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                          <span className="font-bold text-xs text-slate-900">New Product Variant</span>
                          <button
                            type="button"
                            onClick={() => setIsVariantFormOpen(false)}
                            className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                          >
                            ×
                          </button>
                        </div>

                        {/* Quick Presets with Hover Cross Delete System */}
                        <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2.5">
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                              QUICK PRESETS (CLICK TO AUTO-FILL):
                            </span>
                            <button
                              type="button"
                              onClick={handleResetPresets}
                              className="text-[10px] text-slate-400 hover:text-slate-600 underline"
                              title="Restore default preset tags"
                            >
                              ↺ Reset Defaults
                            </button>
                          </div>

                          {/* Dynamic Preset Pills with hover red cross on top-right corner */}
                          <div className="flex gap-2 flex-wrap items-center">
                            {variantPresets.map((preset, idx) => {
                              const isSelected = variantFormName.toLowerCase() === preset.toLowerCase();
                              return (
                                <div key={idx} className="relative group inline-flex">
                                  <button
                                    type="button"
                                    onClick={() => setVariantFormName(preset)}
                                    className={`text-xs px-3 py-1 rounded-full border transition-all ${
                                      isSelected
                                        ? 'border-brand-primary bg-brand-soft text-brand-primary font-bold shadow-2xs'
                                        : 'border-slate-300 bg-white hover:border-brand-primary hover:text-brand-primary text-slate-700'
                                    }`}
                                  >
                                    {preset}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={e => handleDeletePreset(idx, e)}
                                    title={`Delete preset ${preset}`}
                                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition shadow z-10"
                                  >
                                    ×
                                  </button>
                                </div>
                              );
                            })}
                          </div>

                          {/* Add Custom Preset Input Sector */}
                          <div className="flex gap-2 pt-2 border-t border-slate-100">
                            <input
                              type="text"
                              placeholder="+ Type new variant name to add to presets..."
                              value={newPresetName}
                              onChange={e => setNewPresetName(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddPreset(); } }}
                              className="text-xs p-1.5 border border-dashed rounded flex-1 focus:outline-none focus:border-brand-primary"
                            />
                            <button
                              type="button"
                              onClick={handleAddPreset}
                              className="text-xs font-bold px-3 py-1 bg-brand-primary hover:bg-emerald-700 text-white rounded transition"
                            >
                              + Add Preset
                            </button>
                          </div>
                        </div>

                        {/* Variant Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Variant Name *</label>
                            <input
                              type="text"
                              required
                              value={variantFormName}
                              onChange={e => setVariantFormName(e.target.value)}
                              placeholder="e.g. Washed Black or Acid Wash"
                              className="w-full text-xs p-2 border rounded focus:outline-none focus:border-brand-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Custom Price (TK BDT – Optional)
                            </label>
                            <input
                              type="number"
                              value={variantFormPrice}
                              onChange={e => setVariantFormPrice(e.target.value)}
                              placeholder="Leave blank to use main price"
                              className="w-full text-xs p-2 border rounded focus:outline-none focus:border-brand-primary"
                            />
                          </div>
                        </div>

                        {/* Available Sizes for this Variant & Stock Status */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Available Sizes for this Variant
                            </label>
                            <div className="flex gap-1.5 flex-wrap">
                              {(['S', 'M', 'L', 'XL', 'XXL'] as GarmentSize[]).map(sz => {
                                const checked = variantFormSizes.includes(sz);
                                return (
                                  <button
                                    key={sz}
                                    type="button"
                                    onClick={() => {
                                      setVariantFormSizes(prev => 
                                        prev.includes(sz) ? prev.filter(s => s !== sz) : [...prev, sz]
                                      );
                                    }}
                                    className={`text-xs px-2.5 py-1 rounded border font-semibold transition ${
                                      checked
                                        ? 'bg-brand-primary text-white border-brand-primary'
                                        : 'bg-white text-slate-600 border-slate-300'
                                    }`}
                                  >
                                    {checked ? `✓ ${sz}` : sz}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Stock Status</label>
                            <select
                              value={variantFormStatus}
                              onChange={e => setVariantFormStatus(e.target.value as any)}
                              className="w-full text-xs p-2 border rounded bg-white"
                            >
                              <option value="available">In Stock (Available)</option>
                              <option value="sold">Sold Out</option>
                            </select>
                          </div>
                        </div>

                        {/* Save / Cancel buttons */}
                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                          <button
                            type="button"
                            onClick={() => setIsVariantFormOpen(false)}
                            className="text-xs px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!variantFormName.trim()) return;
                              setEditorVariants(prev => [
                                ...prev,
                                {
                                  id: `var-${Date.now()}`,
                                  name: variantFormName.trim(),
                                  price: variantFormPrice ? parseInt(variantFormPrice, 10) : null,
                                  sizes: variantFormSizes,
                                  status: variantFormStatus,
                                },
                              ]);
                              setVariantFormName('');
                              setVariantFormPrice('');
                              setIsVariantFormOpen(false);
                            }}
                            className="text-xs font-bold px-4 py-1.5 bg-brand-primary hover:bg-emerald-700 text-white rounded transition shadow-xs"
                          >
                            Save Variant
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Empty State when 0 variants added (Matches Image 5) */}
                    {editorVariants.length === 0 ? (
                      <div className="text-center py-6 px-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-slate-500">
                        <p className="font-bold text-xs text-slate-700 mb-1">No extra variants added yet.</p>
                        <p className="text-[11px] text-slate-400">
                          By default, this item is sold as a single drop edition. Click "+ Add Variant" above to add colorways, washes, or style variations.
                        </p>
                      </div>
                    ) : (
                      /* Variants List */
                      <div className="space-y-2">
                        {editorVariants.map((v, i) => (
                          <div 
                            key={i} 
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 text-xs shadow-2xs"
                          >
                            <div>
                              <strong className="text-slate-900">{v.name}</strong>
                              <span className="text-slate-500 ml-2">
                                {v.price ? formatBDT(v.price) : 'Main Price'}
                              </span>
                              <div className="flex gap-1 mt-1">
                                {v.sizes?.map(s => (
                                  <span key={s} className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.2 rounded font-medium">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditorVariants(prev => prev.filter((_, idx) => idx !== i))}
                              className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 rounded hover:bg-red-50 transition"
                            >
                              ✕ Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Pricing, Publishing, Sizing Specs */}
                <div className="space-y-6">
                  {/* Status Card */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
                    <label className="block text-xs font-bold text-slate-800 mb-1">Status</label>
                    <select
                      value={editingProduct.status || 'available'}
                      onChange={e => setEditingProduct(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full text-xs p-2.5 border rounded-lg bg-white"
                    >
                      <option value="available">Available (In Stock)</option>
                      <option value="sold">Sold Out</option>
                    </select>
                  </div>

                  {/* Pricing Card */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
                    <label className="block text-xs font-bold text-slate-800 mb-1">Pricing *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">TK</span>
                      <input
                        type="number"
                        required
                        value={editingProduct.price || ''}
                        onChange={e => setEditingProduct(prev => ({ ...prev, price: parseInt(e.target.value || '0', 10) }))}
                        className="w-full text-sm font-bold pl-9 p-2.5 border rounded-lg focus:outline-none focus:border-brand-primary"
                        placeholder="850"
                      />
                    </div>
                  </div>

                  {/* Publishing Card */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Publishing</h4>
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Online Store &amp; WhatsApp</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Visible to public storefront catalog instantly upon saving.
                    </p>
                  </div>

                  {/* Category & Organization */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Product Organization</h4>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                      <select
                        value={editingProduct.category || 'T-Shirts'}
                        onChange={e => setEditingProduct(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full text-xs p-2.5 border rounded-lg bg-white"
                      >
                        <option value="T-Shirts">T-Shirts</option>
                        <option value="Shirts">Shirts</option>
                        <option value="Jackets">Jackets</option>
                        <option value="Pants">Pants</option>
                        <option value="Accessories">Accessories</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Condition Grade</label>
                      <input
                        type="text"
                        value={editingProduct.condition || '9.5/10 (Mint Condition)'}
                        onChange={e => setEditingProduct(prev => ({ ...prev, condition: e.target.value }))}
                        className="w-full text-xs p-2.5 border rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Chest (Inches)</label>
                        <input
                          type="text"
                          value={editingProduct.chest || '38"-46"'}
                          onChange={e => setEditingProduct(prev => ({ ...prev, chest: e.target.value }))}
                          className="w-full text-xs p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Length (Inches)</label>
                        <input
                          type="text"
                          value={editingProduct.length || '26"-30"'}
                          onChange={e => setEditingProduct(prev => ({ ...prev, length: e.target.value }))}
                          className="w-full text-xs p-2 border rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save CTA */}
                  <button
                    type="submit"
                    className="w-full py-3 bg-brand-primary hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                  >
                    Save Product
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* =========================================================================
          ORDER DETAILS MODAL (Responsive 1-Column on Mobile, Solves Image 2 squishing!)
         ========================================================================= */}
      {activeOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity" 
            onClick={() => setActiveOrderModal(null)} 
          />
          <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl p-5 sm:p-6 z-10 max-h-[92vh] overflow-y-auto space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-brand-soft rounded-lg text-brand-primary">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 font-mono">
                    #{activeOrderModal.id}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {new Date(activeOrderModal.createdAt || Date.now()).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                  activeOrderModal.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                  activeOrderModal.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                  activeOrderModal.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {activeOrderModal.status}
                </span>
                <button 
                  onClick={() => setActiveOrderModal(null)} 
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content: 1-Column on Mobile, 2-Column on Desktop (Solves Image 2!) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Info Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <strong className="text-slate-800 uppercase tracking-wider text-[10px] block font-extrabold border-b pb-1">
                  Customer Information
                </strong>
                <div>
                  <span className="text-slate-500 block text-[10px]">Name:</span>
                  <span className="font-bold text-slate-900 text-sm">{activeOrderModal.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Phone Number:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono font-bold text-slate-900">{activeOrderModal.customerPhone}</span>
                    <a
                      href={`https://wa.me/${getCleanWaNumber(activeOrderModal.customerPhone)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded text-[10px] flex items-center gap-1"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Delivery Address:</span>
                  <p className="text-slate-700 leading-relaxed font-medium">{activeOrderModal.deliveryAddress}</p>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Zone &amp; Notes:</span>
                  <span className="font-semibold text-brand-dark">
                    {activeOrderModal.deliveryZone === 'inside' ? 'Inside Dhaka (TK 70)' : 'Outside Dhaka (TK 130)'}
                  </span>
                  {activeOrderModal.notes && (
                    <p className="text-slate-500 italic mt-0.5">"{activeOrderModal.notes}"</p>
                  )}
                </div>
              </div>

              {/* Payment Verification Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <strong className="text-slate-800 uppercase tracking-wider text-[10px] block font-extrabold border-b pb-1">
                  Payment Verification
                </strong>
                <div>
                  <span className="text-slate-500 block text-[10px]">Method:</span>
                  <span className="font-bold uppercase px-2 py-0.5 bg-amber-100 text-amber-800 rounded inline-block text-[11px]">
                    {activeOrderModal.paymentMethod}
                  </span>
                </div>
                {activeOrderModal.paymentSenderNumber && (
                  <div>
                    <span className="text-slate-500 block text-[10px]">Sender Number:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{activeOrderModal.paymentSenderNumber}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(activeOrderModal.paymentSenderNumber!, 'sender')}
                        className="text-[10px] px-1.5 py-0.5 bg-slate-200 hover:bg-slate-300 rounded font-bold text-slate-700 flex items-center gap-1"
                      >
                        {copiedField === 'sender' ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                        <span>{copiedField === 'sender' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                )}
                {activeOrderModal.transactionId && (
                  <div>
                    <span className="text-slate-500 block text-[10px]">Transaction ID (TrxID):</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{activeOrderModal.transactionId}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(activeOrderModal.transactionId!, 'trx')}
                        className="text-[10px] px-1.5 py-0.5 bg-slate-200 hover:bg-slate-300 rounded font-bold text-slate-700 flex items-center gap-1"
                      >
                        {copiedField === 'trx' ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                        <span>{copiedField === 'trx' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Subtotal:</span>
                    <span>{formatBDT(activeOrderModal.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Delivery:</span>
                    <span>{formatBDT(activeOrderModal.deliveryCharge)}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-1 border-t border-slate-200">
                    <span>Total Amount:</span>
                    <span className="text-brand-dark">{formatBDT(activeOrderModal.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ordered Items Full-Width Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <strong className="text-slate-800 uppercase tracking-wider text-[10px] block font-extrabold border-b pb-1">
                Ordered Items &amp; Sizing Variations
              </strong>
              {activeOrderModal.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-1.5 border-b border-slate-200 last:border-b-0">
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{item.title}</div>
                    <div className="flex gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                        Size: {item.size}
                      </span>
                      {item.variantName && (
                        <span className="bg-slate-200 text-slate-700 font-semibold px-1.5 py-0.2 rounded">
                          {item.variantName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">{formatBDT((item.unitPrice || item.price || 0) * item.quantity)}</span>
                    <span className="text-slate-400 text-[11px] block">x{item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-700">Fulfillment Status:</label>
                <select
                  value={modalStatus}
                  onChange={e => setModalStatus(e.target.value)}
                  className="text-xs p-2 border rounded-lg bg-white font-bold"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveOrderModal(null)}
                  className="px-4 py-2 border rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateOrderStatus(activeOrderModal.id, modalStatus)}
                  className="px-4 py-2 bg-brand-primary hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                >
                  Save Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* AUVARE Branded Delete Confirmation Modal (Replaces browser confirm) */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity" 
            onClick={() => setDeletingProduct(null)} 
          />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-10 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 bg-brand-dark text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <img src="/assets/images/logo.jpg" alt="Logo" className="w-8 h-8 rounded-full border border-amber-400/40" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif font-bold text-sm tracking-wide text-brand-light">AUVARE</span>
                    <span className="text-[9px] bg-red-950/80 text-red-300 border border-red-500/30 px-1.5 py-0.2 rounded-full font-bold">
                      CONFIRMATION
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Inventory Control &bull; Catalog Authority</span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setDeletingProduct(null)} 
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3.5">
              <span className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider block">
                INVENTORY CONTROL &bull; PERMANENT REMOVAL
              </span>
              <h3 className="font-serif font-bold text-base text-slate-900 leading-snug">
                Delete Garment Drop?
              </h3>

              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <img 
                  src={deletingProduct.image || (deletingProduct.images && deletingProduct.images[0]) || '/assets/images/logo.jpg'} 
                  alt={deletingProduct.title} 
                  className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0" 
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-slate-900 truncate">{deletingProduct.title}</h4>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {deletingProduct.category} &bull; {formatBDT(deletingProduct.price)} &bull; Size: {deletingProduct.sizes?.[0] || 'M'}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to permanently delete this piece from the inventory? This will remove the piece from the AUVARE catalog and database. This action cannot be undone.
              </p>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 transition"
              >
                Cancel / Keep Drop
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = deletingProduct.id;
                  setDeletingProduct(null);
                  await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
                  loadData();
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Drop</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
