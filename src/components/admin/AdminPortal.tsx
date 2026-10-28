'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Home, ShoppingCart, Tag, Users, Folder, Plus, RefreshCw, 
  Trash2, Edit, ExternalLink, Image as ImageIcon, X, Check, Search, Eye
} from 'lucide-react';
import type { Product, Order, ProductVariant, GarmentSize } from '@/types';
import { formatBDT } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export function AdminPortal() {
  const supabase = createClient();

  // Navigation tab order: Home -> Orders -> Products -> Users -> Categories
  const [activeTab, setActiveTab] = useState<'home' | 'orders' | 'products' | 'users' | 'categories'>('home');
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected Order for Details Modal
  const [activeOrderModal, setActiveOrderModal] = useState<Order | null>(null);
  const [modalStatus, setModalStatus] = useState<string>('pending');

  // Product Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editorImages, setEditorImages] = useState<string[]>([]);
  const [editorVariants, setEditorVariants] = useState<ProductVariant[]>([]);
  const [newPresetName, setNewPresetName] = useState('');
  const [variantPresets, setVariantPresets] = useState<string[]>([
    'Washed Black', 'Vintage Olive', 'Oatmeal Beige', 'Faded Navy', 'Acid Wash', 'Distressed White', 'Earth Brown'
  ]);
  const [isVariantFormOpen, setIsVariantFormOpen] = useState(false);
  const [variantFormName, setVariantFormName] = useState('');
  const [variantFormPrice, setVariantFormPrice] = useState<string>('');
  const [variantFormSizes, setVariantFormSizes] = useState<GarmentSize[]>(['S', 'M', 'L', 'XL', 'XXL']);
  const [variantFormStatus, setVariantFormStatus] = useState<'available' | 'sold'>('available');

  // Load live data from Supabase
  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data: pData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (pData) {
        setProducts(pData.map((row: any) => ({
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
          image: row.image || (Array.isArray(row.images) ? row.images[0] : null) || '/assets/images/logo.jpg',
          images: Array.isArray(row.images) ? row.images : [],
          sizes: Array.isArray(row.sizes) ? row.sizes : ['S', 'M', 'L', 'XL', 'XXL'],
          variants: Array.isArray(row.variants) ? row.variants : [],
        })));
      }

      const { data: oData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (oData) {
        setOrders(oData.map((row: any) => ({
          id: row.order_id || row.id || row.orderId || 'AUV-000',
          customerName: row.name || row.customer_name || 'Customer',
          customerPhone: row.phone || row.customer_phone || '',
          deliveryAddress: row.address || row.delivery_address || '',
          deliveryZone: row.delivery_zone || row.deliveryZone || 'inside',
          notes: row.notes,
          items: Array.isArray(row.items) ? row.items : [],
          subtotal: row.subtotal || 0,
          deliveryCharge: row.shipping || row.delivery_charge || 70,
          totalAmount: row.total || row.total_amount || 0,
          paymentMethod: row.payment_method || row.paymentMethod || 'cod',
          paymentSenderNumber: row.payment_number || row.payment_sender_number || null,
          transactionId: row.trx_id || row.trxId || null,
          status: row.status || row.order_status || 'pending',
          createdAt: row.date || row.created_at || new Date().toISOString(),
          updatedAt: row.updated_at,
        })));
      }
    } catch (e) {
      console.warn('Error loading Supabase data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    try {
      const saved = localStorage.getItem('auvare_variant_presets_v1');
      if (saved) setVariantPresets(JSON.parse(saved));
    } catch {}
  }, []);

  // Save presets
  const savePresets = (list: string[]) => {
    setVariantPresets(list);
    try { localStorage.setItem('auvare_variant_presets_v1', JSON.stringify(list)); } catch {}
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
      setEditorImages(prod.images || [prod.image]);
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
  };

  // Save Product
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
      if (editingProduct.id) {
        await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      setIsEditorOpen(false);
      loadData();
    } catch (err) {
      alert('Failed to save product');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this garment drop?')) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    loadData();
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setActiveOrderModal(null);
    loadData();
  };

  // Metrics
  const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar: Home -> Orders -> Products -> Users -> Categories */}
      <aside className="w-64 bg-brand-dark text-white flex flex-col shrink-0 border-r border-slate-800">
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <img src="/assets/images/logo.jpg" alt="Logo" className="w-8 h-8 rounded-full border border-white/20" />
          <div>
            <h1 className="font-serif font-bold text-base tracking-wider leading-none">AUVARE</h1>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Store Manager</span>
          </div>
        </div>

        <nav className="p-3 space-y-1 flex-1">
          <button
            type="button"
            onClick={() => { setActiveTab('home'); setIsEditorOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'home' ? 'bg-brand-primary text-white shadow' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('orders'); setIsEditorOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'orders' ? 'bg-brand-primary text-white shadow' : 'text-slate-300 hover:bg-white/5'
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
            onClick={() => { setActiveTab('products'); setIsEditorOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'products' ? 'bg-brand-primary text-white shadow' : 'text-slate-300 hover:bg-white/5'
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
            onClick={() => { setActiveTab('users'); setIsEditorOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'users' ? 'bg-brand-primary text-white shadow' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4" />
              <span>Users</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('categories'); setIsEditorOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'categories' ? 'bg-brand-primary text-white shadow' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Folder className="w-4 h-4" />
              <span>Categories</span>
            </div>
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
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
              onClick={loadData}
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
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
          </div>
        )}

        {/* Tab 2: Orders */}
        {activeTab === 'orders' && !isEditorOpen && (
          <div className="p-8">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">Customer Orders ({orders.length})</h3>
              </div>

              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                    <th className="p-3 font-bold">Order ID</th>
                    <th className="p-3 font-bold">Customer</th>
                    <th className="p-3 font-bold">Delivery Address</th>
                    <th className="p-3 font-bold">Items &amp; Sizes</th>
                    <th className="p-3 font-bold">Total</th>
                    <th className="p-3 font-bold">Status</th>
                    <th className="p-3 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3 font-mono font-bold text-brand-dark">#{o.id}</td>
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
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => { setActiveOrderModal(o); setModalStatus(o.status); }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded text-[11px] transition"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Products */}
        {activeTab === 'products' && !isEditorOpen && (
          <div className="p-8">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">Garment Catalog ({products.length})</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                {products.map(p => (
                  <div key={p.id} className="border border-slate-200 rounded-lg p-3 bg-white flex flex-col justify-between">
                    <div>
                      <img src={p.image} alt={p.title} className="w-full aspect-[3/4] object-cover rounded mb-2 bg-slate-100" />
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[10px] font-bold uppercase text-brand-primary bg-brand-soft px-1.5 py-0.5 rounded">
                          {p.category}
                        </span>
                        <span className="font-bold text-slate-900">{formatBDT(p.price)}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{p.title}</h4>
                      {p.variants && p.variants.length > 0 && (
                        <div className="text-[10px] text-slate-500 mt-1">
                          🎨 {p.variants.length} variant{p.variants.length > 1 ? 's' : ''}
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
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Product Editor Full Page */}
        {isEditorOpen && editingProduct && (
          <div className="p-8 max-w-4xl mx-auto w-full">
            <form onSubmit={handleSaveProduct} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b">
                <h3 className="font-serif font-bold text-lg text-slate-900">
                  {editingProduct.id ? `Edit: ${editingProduct.title}` : 'New Product Drop'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-3 py-1.5 border rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.title || ''}
                    onChange={e => setEditingProduct(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full text-xs p-2.5 border rounded-lg"
                  />
                </div>
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
              </div>

              {/* Price & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (৳ BDT) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || ''}
                    onChange={e => setEditingProduct(prev => ({ ...prev, price: parseInt(e.target.value || '0', 10) }))}
                    className="w-full text-xs p-2.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stock Status</label>
                  <select
                    value={editingProduct.status || 'available'}
                    onChange={e => setEditingProduct(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full text-xs p-2.5 border rounded-lg bg-white"
                  >
                    <option value="available">In Stock (Available)</option>
                    <option value="sold">Sold Out</option>
                  </select>
                </div>
              </div>

              {/* Product Variants Sector with Hover Cross Delete & Custom Add Input */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">Product Variants</h4>
                    <p className="text-[11px] text-slate-500">Colorways, washes, special editions (e.g. Washed Black, Vintage Olive).</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsVariantFormOpen(!isVariantFormOpen)}
                    className="text-xs font-bold px-3 py-1 border border-brand-primary text-brand-primary bg-white rounded hover:bg-brand-soft"
                  >
                    {isVariantFormOpen ? '− Close' : '+ Add Variant'}
                  </button>
                </div>

                {/* Quick Presets with Hover Cross Delete */}
                <div className="bg-white p-3 rounded border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Quick Presets (Click to Auto-Fill • Hover Cross to Delete):
                  </span>
                  <div className="flex gap-2 flex-wrap items-center">
                    {variantPresets.map((preset, idx) => (
                      <div key={idx} className="relative group inline-flex">
                        <button
                          type="button"
                          onClick={() => setVariantFormName(preset)}
                          className="text-xs px-3 py-1 rounded-full border border-slate-300 bg-white hover:border-brand-primary hover:text-brand-primary font-medium transition"
                        >
                          {preset}
                        </button>
                        <button
                          type="button"
                          onClick={e => handleDeletePreset(idx, e)}
                          title={`Delete preset ${preset}`}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition shadow"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Custom Preset Input */}
                  <div className="flex gap-2 mt-2 pt-2 border-t border-slate-100">
                    <input
                      type="text"
                      placeholder="+ Type custom preset name..."
                      value={newPresetName}
                      onChange={e => setNewPresetName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddPreset(); } }}
                      className="text-xs p-1.5 border border-dashed rounded flex-1 focus:outline-none focus:border-brand-primary"
                    />
                    <button
                      type="button"
                      onClick={handleAddPreset}
                      className="text-xs font-bold px-3 py-1 bg-brand-primary text-white rounded"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Inline Variant Form */}
                {isVariantFormOpen && (
                  <div className="p-3 bg-white rounded border border-slate-300 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Variant Name *</label>
                        <input
                          type="text"
                          value={variantFormName}
                          onChange={e => setVariantFormName(e.target.value)}
                          placeholder="e.g. Acid Wash Edition"
                          className="w-full text-xs p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Custom Price (৳ - Optional)</label>
                        <input
                          type="number"
                          value={variantFormPrice}
                          onChange={e => setVariantFormPrice(e.target.value)}
                          placeholder="Leave blank for base price"
                          className="w-full text-xs p-2 border rounded"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsVariantFormOpen(false)}
                        className="text-xs px-3 py-1 text-slate-500 hover:underline"
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
                        className="text-xs font-bold px-3 py-1 bg-brand-dark text-white rounded"
                      >
                        Save Variant
                      </button>
                    </div>
                  </div>
                )}

                {/* Saved Variants List */}
                {editorVariants.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    {editorVariants.map((v, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-white rounded border border-slate-200 text-xs">
                        <div>
                          <strong>{v.name}</strong>
                          <span className="text-slate-500 ml-2">
                            {v.price ? formatBDT(v.price) : 'Default Price'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditorVariants(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-red-500 text-xs hover:underline"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-primary hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Save Product Drop
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Order Details Modal (Responsive 1-Column Mobile Sheet) */}
      {activeOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setActiveOrderModal(null)} />
          <div className="relative bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Order #{activeOrderModal.id}</h3>
                <span className="text-[10px] text-slate-400">{activeOrderModal.createdAt}</span>
              </div>
              <button onClick={() => setActiveOrderModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
              <strong className="text-slate-800 uppercase tracking-wider text-[10px] block mb-1">Customer Info</strong>
              <div><strong>Name:</strong> {activeOrderModal.customerName}</div>
              <div><strong>Phone:</strong> {activeOrderModal.customerPhone}</div>
              <div><strong>Address:</strong> {activeOrderModal.deliveryAddress} ({activeOrderModal.deliveryZone})</div>
              {activeOrderModal.notes && <div><strong>Notes:</strong> {activeOrderModal.notes}</div>}
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
              <strong className="text-slate-800 uppercase tracking-wider text-[10px] block mb-1">Payment Verification</strong>
              <div><strong>Method:</strong> {activeOrderModal.paymentMethod.toUpperCase()}</div>
              {activeOrderModal.paymentSenderNumber && <div><strong>Sender Number:</strong> {activeOrderModal.paymentSenderNumber}</div>}
              {activeOrderModal.transactionId && <div><strong>TrxID:</strong> {activeOrderModal.transactionId}</div>}
              <div><strong>Total Amount:</strong> {formatBDT(activeOrderModal.totalAmount)}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-2">
              <strong className="text-slate-800 uppercase tracking-wider text-[10px] block">Items Ordered</strong>
              {activeOrderModal.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between border-b pb-1 last:border-b-0">
                  <div>
                    <strong>{item.title}</strong> [Size: {item.size}]
                    {item.variantName && <span className="ml-1 text-slate-500">({item.variantName})</span>}
                  </div>
                  <div>x{item.quantity}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-700">Status:</label>
                <select
                  value={modalStatus}
                  onChange={e => setModalStatus(e.target.value)}
                  className="text-xs p-1.5 border rounded bg-white"
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
                  onClick={() => handleUpdateOrderStatus(activeOrderModal.id, modalStatus)}
                  className="px-3 py-1.5 bg-brand-primary text-white text-xs font-bold rounded"
                >
                  Save Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
