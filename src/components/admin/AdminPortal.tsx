'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Home, ShoppingCart, Tag, Users, Folder, Plus, RefreshCw, 
  Trash2, Edit, ExternalLink, Image as ImageIcon, X, Check, Search, 
  Menu, Upload, Copy, CheckCircle, ArrowLeft, MessageCircle,
  LogOut, ShieldAlert, CheckCircle2, XCircle, Clock, Ban
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

  // Auth & RBAC State
  const [authStatus, setAuthStatus] = useState<'loading' | 'unauthenticated' | 'pending' | 'rejected' | 'blocked' | 'approved'>('loading');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [authUsers, setAuthUsers] = useState<any[]>([]);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // User Management State (Edit & Reject Modals)
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'super_admin' | 'customer'>('admin');
  const [editStatus, setEditStatus] = useState<'approved' | 'pending' | 'rejected' | 'blocked'>('approved');
  const [isSavingUser, setIsSavingUser] = useState(false);

  const [rejectingUser, setRejectingUser] = useState<any | null>(null);
  const [rejectAction, setRejectAction] = useState<'reject' | 'block'>('reject');

  // Reusable AUVARE Branded Confirm Dialog State (Zero native browser confirm())
  const [brandedConfirm, setBrandedConfirm] = useState<{
    isOpen: boolean;
    title: string;
    metaSub?: string;
    badgeText?: string;
    itemName?: string;
    itemImage?: string;
    itemMeta?: string;
    warningText: string;
    confirmBtnText: string;
    cancelBtnText?: string;
    isDestructive?: boolean;
    onConfirm: () => Promise<void> | void;
  } | null>(null);

  // Sleek Branded Toast Notification State (Zero native browser alert())
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch Auth Users list for Users Tab
  const loadUsersData = async () => {
    try {
      const res = await fetch(`/api/admin/users?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setAuthUsers(data.users);
      }
    } catch (err) {
      console.warn('Error loading auth users:', err);
    }
  };

  // Verify access for authenticated user with /api/admin/users
  const verifyUserAccess = async (user: any) => {
    setCurrentUser(user);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          displayName: user.user_metadata?.full_name,
          avatarUrl: user.user_metadata?.avatar_url,
        }),
      });

      const resData = await res.json().catch(() => ({}));
      const profile = resData.profile;

      if (!profile) {
        setAuthStatus('unauthenticated');
        return;
      }

      setCurrentUserProfile(profile);

      if (profile.status === 'blocked') {
        setAuthStatus('blocked');
      } else if (profile.status === 'rejected') {
        setAuthStatus('rejected');
      } else if (profile.status === 'approved' && (profile.role === 'admin' || profile.role === 'super_admin')) {
        setAuthStatus('approved');
      } else {
        setAuthStatus('pending');
      }
    } catch (err) {
      console.error('verifyUserAccess error:', err);
      setAuthStatus('unauthenticated');
    }
  };

  // Google OAuth Login
  const handleGoogleSignIn = async () => {
    try {
      setIsAuthLoading(true);
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/admin` : undefined,
        },
      });
    } catch (err: any) {
      showToast(`Google Sign-In Error: ${err.message || 'OAuth initialization failed'}`, 'error');
      setIsAuthLoading(false);
    }
  };

  // Sign out
  const handleAdminLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    setCurrentUser(null);
    setCurrentUserProfile(null);
    setAuthStatus('unauthenticated');
  };

  // Re-apply for access
  const handleReapplyAccess = async () => {
    if (!currentUser?.email) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'BLOCKED_USER') {
          setAuthStatus('blocked');
          return;
        }
        throw new Error(data.error || 'Failed to re-apply');
      }
      setCurrentUserProfile(data.profile);
      setAuthStatus('pending');
      showToast('আপনার অ্যাডমিন রিকোয়েস্ট পুনরায় সুপার অ্যাডমিনের কাছে পাঠানো হয়েছে!', 'success');
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  // Recheck status
  const handleRecheckStatus = async () => {
    if (!currentUser) return;
    setAuthStatus('loading');
    await verifyUserAccess(currentUser);
  };

  // User Actions (Super Admin only - 100% Branded Modals, Zero Browser confirm())
  const handleApproveUser = (user: any) => {
    const name = user.display_name || user.full_name || user.email;
    setBrandedConfirm({
      isOpen: true,
      title: 'Authorize Admin Access?',
      metaSub: 'STAFF CONTROL • PRIVILEGE ELEVATION',
      badgeText: 'AUTHORIZE ADMIN',
      itemName: name,
      itemImage: user.avatar_url || '/assets/images/logo.jpg',
      itemMeta: 'Super Admin Authority • Full Catalog & Orders Access',
      warningText: `Are you sure you want to approve "${name}" as an Admin? They will have full access to manage stock and view customer orders.`,
      confirmBtnText: 'Approve Admin',
      cancelBtnText: 'Cancel',
      isDestructive: false,
      onConfirm: async () => {
        try {
          const res = await fetch('/api/admin/users', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: user.id, status: 'approved', role: 'admin' }),
          });
          if (!res.ok) throw new Error('Failed to approve user');
          showToast(`"${name}" approved as Admin successfully!`, 'success');
          await loadUsersData();
        } catch (err: any) {
          showToast(err.message || 'Approval failed', 'error');
        }
      },
    });
  };

  const handleOpenRejectModal = (user: any) => {
    setRejectingUser(user);
    setRejectAction('reject');
  };

  const handleExecuteReject = async () => {
    if (!rejectingUser) return;
    const name = rejectingUser.display_name || rejectingUser.full_name || rejectingUser.email;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rejectingUser.id, status: rejectAction }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      if (rejectAction === 'block') {
        showToast(`"${name}" permanently blocked from admin access.`, 'info');
      } else {
        showToast(`Request for "${name}" rejected and removed from directory.`, 'info');
      }
      setRejectingUser(null);
      await loadUsersData();
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  const handleOpenEditModal = (user: any) => {
    setEditingUser(user);
    setEditDisplayName(user.display_name || user.full_name || user.email?.split('@')[0] || '');
    setEditRole(user.role || 'admin');
    setEditStatus(user.status || 'approved');
  };

  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSavingUser(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUser.id,
          display_name: editDisplayName.trim(),
          role: editRole,
          status: editStatus,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update user profile');
      }
      showToast(`User details for "${editDisplayName || editingUser.email}" saved successfully!`, 'success');
      setEditingUser(null);
      await loadUsersData();
    } catch (err: any) {
      showToast(err.message || 'Save failed', 'error');
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleUnblockUser = (user: any) => {
    const name = user.display_name || user.full_name || user.email;
    setBrandedConfirm({
      isOpen: true,
      title: 'Unblock User Account?',
      metaSub: 'STAFF CONTROL • SECURITY CLEAR',
      badgeText: 'UNBLOCK USER',
      itemName: name,
      itemImage: user.avatar_url || '/assets/images/logo.jpg',
      itemMeta: 'Clear Security Restriction • Restore Sign-In Access',
      warningText: `Are you sure you want to unblock "${name}"? They will regain permission to sign in and re-request admin dashboard access.`,
      confirmBtnText: 'Unblock User',
      cancelBtnText: 'Cancel',
      isDestructive: false,
      onConfirm: async () => {
        try {
          const res = await fetch('/api/admin/users', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: user.id, status: 'approved' }),
          });
          if (!res.ok) throw new Error('Failed to unblock user');
          showToast(`"${name}" has been unblocked.`, 'success');
          await loadUsersData();
        } catch (err: any) {
          showToast(err.message || 'Failed to unblock', 'error');
        }
      },
    });
  };

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

      // Also refresh auth users
      loadUsersData();
    } catch (e) {
      console.warn('Error loading Supabase data:', e);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    // 1. Check active session
    const checkAuth = async () => {
      try {
        if (typeof window !== 'undefined') {
          const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
          if (isLocal && window.location.search.includes('preview=1')) {
            const mockUser = { email: 'abirshikdar2@gmail.com', user_metadata: { full_name: 'Md Abir Shikdar' } };
            setCurrentUser(mockUser);
            setCurrentUserProfile({
              id: '81c10ad2-3813-4b91-b515-626a5f223588',
              email: 'abirshikdar2@gmail.com',
              role: 'super_admin',
              status: 'approved',
              display_name: 'Md Abir Shikdar',
            });
            setAuthStatus('approved');
            return;
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          await verifyUserAccess(session.user);
        } else {
          setAuthStatus('unauthenticated');
        }
      } catch (err) {
        setAuthStatus('unauthenticated');
      }
    };

    checkAuth();

    // 2. Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        await verifyUserAccess(session.user);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setCurrentUserProfile(null);
        setAuthStatus('unauthenticated');
      }
    });

    try {
      const saved = localStorage.getItem('auvare_variant_presets_v2');
      if (saved) setVariantPresets(JSON.parse(saved));
    } catch {}

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // When authStatus becomes 'approved', trigger initial load & start polling
  useEffect(() => {
    if (authStatus !== 'approved') return;

    loadData();

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
  }, [authStatus]);

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
      showToast('Product drop saved successfully!', 'success');
      await loadData();
    } catch (err: any) {
      showToast(`Save Error: ${err.message || 'Failed to save product drop'}`, 'error');
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setDeletingProduct(product);
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
      showToast('Order status updated successfully!', 'success');
      await loadData();
    } catch (err: any) {
      showToast(`Status Error: ${err.message || 'Failed to update order status'}`, 'error');
    }
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const pendingUsersCount = authUsers.filter(u => u.status === 'pending').length;

  // STRICT AUTH GATE: Lock portal completely until approved
  if (authStatus !== 'approved') {
    return (
      <div className="fixed inset-0 z-[999999] bg-[#0b1a13]/85 backdrop-blur-md flex items-center justify-center p-4 antialiased">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
          <img
            src="/assets/images/logo.jpg"
            alt="AUVARE Crest Logo"
            className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-emerald-700 shadow-md object-contain"
          />
          <h3 className="font-serif text-2xl font-bold text-slate-900 mb-1 tracking-wider">
            AUVARE STORE
          </h3>
          <p className="text-xs text-slate-500 mb-6 font-medium">
            Owner &amp; Admin Management Portal
          </p>

          {/* 1. Loading / Verifying State */}
          {authStatus === 'loading' && (
            <div className="py-8 space-y-4">
              <div className="w-10 h-10 border-3 border-emerald-700/20 border-t-emerald-700 rounded-full animate-spin mx-auto" />
              <h4 className="font-bold text-sm text-slate-800">Verifying Credentials</h4>
              <p className="text-xs text-slate-500">Checking secure authentication status with AUVARE cloud...</p>
            </div>
          )}

          {/* 2. Unauthenticated State (Sign In with Google) */}
          {authStatus === 'unauthenticated' && (
            <div className="space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left">
                <p className="text-xs font-bold text-slate-800 mb-1">Secure Cloud Authentication</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sign in with your verified Google Admin account to manage AUVARE Store inventory, orders, and products.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isAuthLoading}
                className="w-full py-3.5 px-5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-xl border border-slate-300 shadow-sm hover:shadow transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17Z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24Z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"/>
                </svg>
                <span>{isAuthLoading ? 'Connecting...' : 'Continue with Google'}</span>
              </button>

              <p className="text-[11px] text-slate-400">Powered by Supabase Auth (Singapore Server)</p>
            </div>
          )}

          {/* 3. Pending Approval State */}
          {authStatus === 'pending' && (
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
                <div className="text-3xl mb-2">⏳</div>
                <h4 className="text-base font-bold text-amber-900 mb-1">
                  Request Pending Approval
                </h4>
                <p className="text-xs text-amber-800 leading-relaxed">
                  আপনার অ্যাকাউন্ট দিয়ে অ্যাডমিন প্যানেলে প্রবেশের রিকোয়েস্ট সুপার অ্যাডমিনের পর্যালোচনার জন্য জমা হয়েছে। সুপার অ্যাডমিন অনুমোদন (Approve) করলেই আপনি এখানে প্রবেশ করতে পারবেন।
                </p>
                {currentUser?.email && (
                  <div className="mt-3 py-1.5 px-3 bg-white/70 rounded-lg text-xs font-mono text-amber-900 font-semibold inline-block">
                    {currentUser.email}
                  </div>
                )}
              </div>

              <div className="flex gap-2.5 justify-center">
                <button
                  type="button"
                  onClick={handleRecheckStatus}
                  className="flex-1 py-2.5 px-4 bg-brand-primary hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>↻ Check Status</span>
                </button>
                <button
                  type="button"
                  onClick={handleAdminLogout}
                  className="py-2.5 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* 4. Rejected State */}
          {authStatus === 'rejected' && (
            <div className="space-y-5">
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2">
                  <XCircle className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-rose-900 mb-1">
                  Your request is rejected by the super admin.
                </h4>
                <p className="text-xs text-rose-700 leading-relaxed">
                  আপনার অ্যাক্সেস রিকোয়েস্টটি সুপার অ্যাডমিন বাতিল করেছেন। আপনি চাইলে পুনরায় রিকোয়েস্ট পাঠাতে পারেন।
                </p>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleReapplyAccess}
                  className="w-full py-3 px-4 bg-brand-primary hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-apply for Admin Access (পুনরায় রিকোয়েস্ট পাঠান)</span>
                </button>
                <button
                  type="button"
                  onClick={handleAdminLogout}
                  className="w-full py-2.5 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Sign Out / Use Another Account
                </button>
              </div>
            </div>
          )}

          {/* 5. Blocked State */}
          {authStatus === 'blocked' && (
            <div className="space-y-5">
              <div className="bg-red-950 border border-red-800 rounded-xl p-5 text-center text-white">
                <div className="w-12 h-12 rounded-full bg-red-900/60 text-red-400 flex items-center justify-center mx-auto mb-2 border border-red-700">
                  <Ban className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-red-200 mb-1">
                  Access Permanently Blocked
                </h4>
                <p className="text-xs text-red-300 leading-relaxed">
                  Your access has been permanently restricted by the administrator. Applications from this account are permanently closed.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAdminLogout}
                className="w-full py-2.5 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

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
            {pendingUsersCount > 0 ? (
              <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                {pendingUsersCount}
              </span>
            ) : (
              <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                {authUsers.length}
              </span>
            )}
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
        {/* Mobile Top Header */}
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

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-primary/40 border border-brand-primary text-emerald-300">
              {activeTab}
            </span>
            <button
              type="button"
              onClick={handleAdminLogout}
              className="p-1.5 text-rose-300 hover:text-rose-100 rounded hover:bg-white/10 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
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

            {/* User Profile Pill & Sign Out */}
            <div className="h-6 w-px bg-slate-200 mx-1" />
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3">
              {currentUser?.user_metadata?.avatar_url ? (
                <img
                  src={currentUser.user_metadata.avatar_url}
                  alt={currentUser.user_metadata?.full_name || 'Admin'}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-emerald-800 text-white text-xs font-bold flex items-center justify-center">
                  {(currentUserProfile?.full_name || currentUser?.email || 'A')[0].toUpperCase()}
                </div>
              )}
              <div className="text-left hidden lg:block leading-tight">
                <p className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[140px]">
                  {currentUserProfile?.full_name || currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0]}
                </p>
                <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
                  {currentUserProfile?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAdminLogout}
              className="flex items-center gap-1.5 py-1.5 px-3 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
              title="Sign out of AUVARE Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
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

        {/* Tab 4: Users & RBAC Directory (Matching original AUVARE Admin Interface) */}
        {activeTab === 'users' && !isEditorOpen && (
          <div className="p-4 sm:p-8 space-y-6 max-w-6xl w-full mx-auto">
            {/* 4 Summary Stats for Users */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Registered Users</span>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">{authUsers.length}</p>
                <span className="text-[11px] text-slate-500 block mt-0.5">Customers, applicants &amp; staff</span>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Approved Admins</span>
                <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                  {authUsers.filter(u => u.status === 'approved' && (u.role === 'admin' || u.role === 'super_admin')).length}
                </p>
                <span className="text-[11px] text-slate-500 block mt-0.5">Active dashboard &amp; inventory access</span>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pending Approval</span>
                <p className="text-2xl font-extrabold text-amber-600 mt-1">
                  {pendingUsersCount}
                </p>
                <span className="text-[11px] text-slate-500 block mt-0.5">Awaiting review</span>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Role</span>
                <p className="text-xl font-bold text-emerald-700 mt-1 truncate">
                  {currentUserProfile?.role === 'super_admin' ? 'Super Admin' : (currentUserProfile?.role === 'admin' ? 'Admin' : 'Super Admin')}
                </p>
                <span className="text-[11px] text-slate-500 block mt-0.5">Authenticated database authority</span>
              </div>
            </div>

            {/* Regular Admin Restriction Notice (Visible only if current user is not Super Admin) */}
            {!(currentUser?.email === 'abirshikdar2@gmail.com' || currentUserProfile?.role === 'super_admin') && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-3.5 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0" />
                <span><strong>Notice:</strong> Super Admin access is required to modify user permissions or approval status.</span>
              </div>
            )}

            {/* Pending Requests Alert Banner */}
            {pendingUsersCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <p className="font-bold text-amber-950">
                    Action Required: {pendingUsersCount} Access Request{pendingUsersCount > 1 ? 's' : ''} Pending
                  </p>
                  <p className="text-amber-800 mt-0.5">
                    New users who signed in via Google OAuth are held at the security gate. Review their requests below and click <strong>Approve</strong> to grant them admin access, or <strong>Reject</strong> to deny.
                  </p>
                </div>
              </div>
            )}

            {/* Users & Approval Table Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 font-serif">
                    User Directory &amp; Permissions
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    All authenticated accounts and store administrators logged from Supabase Auth.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => loadUsersData()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 shadow-xs transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Refresh Directory</span>
                </button>
              </div>

              {authUsers.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No registered users found in database.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                      <tr>
                        <th className="py-3 px-4">User / Email</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 hidden md:table-cell">Joined Date</th>
                        <th className="py-3 px-4 text-right">Actions &amp; Approval</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {authUsers.map((u) => {
                        const isMaster = u.email?.toLowerCase().trim() === 'abirshikdar2@gmail.com';
                        const isSuperAdminCurrent = currentUser?.email === 'abirshikdar2@gmail.com' || currentUserProfile?.role === 'super_admin';
                        const displayName = u.display_name || u.full_name || u.email?.split('@')[0] || 'User';

                        return (
                          <tr key={u.id} className="hover:bg-slate-50/70 transition">
                            {/* User / Email */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                {u.avatar_url ? (
                                  <img
                                    src={u.avatar_url}
                                    alt={displayName}
                                    className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                                  />
                                ) : (
                                  <div className={`w-8 h-8 rounded-full text-white font-bold flex items-center justify-center text-xs shrink-0 ${
                                    isMaster ? 'bg-amber-600' : (u.role === 'admin' ? 'bg-emerald-800' : 'bg-slate-800')
                                  }`}>
                                    {(displayName[0] || 'U').toUpperCase()}
                                  </div>
                                )}
                                <div className="leading-tight">
                                  <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                                    <span>{displayName}</span>
                                    {isMaster && (
                                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded border border-amber-300">
                                        Owner
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-slate-400 text-[11px] block mt-0.5">{u.email}</span>
                                </div>
                              </div>
                            </td>

                            {/* Role */}
                            <td className="py-3 px-4">
                              <span className={`inline-block font-semibold px-2 py-0.5 rounded text-[11px] ${
                                u.role === 'super_admin'
                                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                  : (u.role === 'admin'
                                      ? 'bg-sky-50 text-sky-800 border border-sky-200'
                                      : 'bg-slate-100 text-slate-700 border border-slate-200')
                              }`}>
                                {u.role === 'super_admin' ? 'Super Admin' : (u.role === 'admin' ? 'Admin' : 'Customer')}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-3 px-4">
                              {u.status === 'approved' && (
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span>Approved</span>
                                </span>
                              )}
                              {u.status === 'pending' && (
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full animate-pulse">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                  <span>Pending Review</span>
                                </span>
                              )}
                              {u.status === 'rejected' && (
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                  <span>Rejected</span>
                                </span>
                              )}
                              {u.status === 'blocked' && (
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-red-800 bg-red-100 border border-red-200 px-2.5 py-0.5 rounded-full">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                  <span>Blocked</span>
                                </span>
                              )}
                            </td>

                            {/* Joined Date */}
                            <td className="py-3 px-4 text-slate-500 text-[11px] hidden md:table-cell">
                              {u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                            </td>

                            {/* Actions & Approval */}
                            <td className="py-3 px-4 text-right">
                              {isMaster ? (
                                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 inline-block">
                                  Super Admin (Master)
                                </span>
                              ) : isSuperAdminCurrent ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  {u.status === 'pending' ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleApproveUser(u)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded transition shadow-xs"
                                        title="Approve Request"
                                      >
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span>Approve</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenRejectModal(u)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded transition shadow-xs"
                                        title="Reject Request"
                                      >
                                        <XCircle className="w-3 h-3" />
                                        <span>Reject</span>
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditModal(u)}
                                      className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded transition shadow-xs"
                                      title="Edit User Details & Permissions"
                                    >
                                      <Edit className="w-3 h-3" />
                                      <span>Edit</span>
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">Super Admin Only</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
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

      {/* ================= MODAL: EDIT USER DETAILS & PERMISSIONS ================= */}
      {editingUser && (
        <div 
          className="fixed inset-0 z-50 bg-[#0b1a13]/80 backdrop-blur-xs flex items-center justify-center p-4 antialiased"
          onClick={(e) => { if (e.target === e.currentTarget) setEditingUser(null); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-brand-dark text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <img src="/assets/images/logo.jpg" alt="Logo" className="w-8 h-8 rounded-full border border-amber-400/40" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif font-bold text-sm tracking-wide text-brand-light">AUVARE</span>
                    <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded-full font-bold">
                      PERMISSIONS
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Staff Control &bull; Role &amp; Access Authority</span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setEditingUser(null)} 
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveUserEdit} className="p-5 space-y-4">
              {/* User Identity Preview Card */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {editingUser.avatar_url ? (
                    <img 
                      src={editingUser.avatar_url} 
                      alt={editingUser.display_name || editingUser.email}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-sm shrink-0">
                      {((editingUser.display_name || editingUser.full_name || editingUser.email || 'U')[0]).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-slate-900 truncate">
                      {editingUser.display_name || editingUser.full_name || editingUser.email.split('@')[0]}
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono block mt-0.5 truncate">
                      {editingUser.email}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                    {editingUser.role === 'super_admin' ? 'Super Admin' : (editingUser.role === 'admin' ? 'Admin' : 'Customer')}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {editingUser.status}
                  </span>
                </div>
              </div>

              {/* Form Input 1: User Email (Read-only) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  User Email <span className="text-[11px] font-normal text-slate-400">(Permanent Google OAuth ID)</span>
                </label>
                <input 
                  type="text" 
                  value={editingUser.email} 
                  readOnly 
                  disabled 
                  className="w-full text-xs bg-slate-100 border border-slate-200 text-slate-500 rounded-lg px-3 py-2 cursor-not-allowed"
                />
              </div>

              {/* Form Input 2: Display Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Display Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={editDisplayName} 
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  placeholder="e.g. Md Abir Shikdar"
                  required
                  className="w-full text-xs bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition"
                />
              </div>

              {/* Form Input 3 & 4: Role and Status Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    System Role
                  </label>
                  <select 
                    value={editRole} 
                    onChange={(e: any) => setEditRole(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-primary transition"
                  >
                    <option value="admin">Admin (অ্যাডমিন)</option>
                    <option value="super_admin">Super Admin (সুপার অ্যাডমিন)</option>
                    <option value="customer">Customer (কাস্টমার)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Approval Status
                  </label>
                  <select 
                    value={editStatus} 
                    onChange={(e: any) => setEditStatus(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-primary transition"
                  >
                    <option value="approved">Approved (অনুমোদিত)</option>
                    <option value="pending">Pending Review (অপেক্ষারত)</option>
                    <option value="rejected">Rejected / Removed (বাতিল)</option>
                    <option value="blocked">Blocked (স্থায়ীভাবে ব্লক)</option>
                  </select>
                </div>
              </div>

              {/* Status Advisory Notice Box */}
              <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                editStatus === 'approved' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : (editStatus === 'pending'
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : (editStatus === 'blocked'
                          ? 'bg-red-50 border-red-200 text-red-800'
                          : 'bg-rose-50 border-rose-200 text-rose-800'))
              }`}>
                <strong>Status Info: </strong>
                {editStatus === 'approved' && 'User will be authorized with full admin management rights over stock and orders.'}
                {editStatus === 'pending' && 'User will be held at the security gate until manually reviewed.'}
                {editStatus === 'rejected' && 'User request is denied. They may sign in and submit a fresh request later.'}
                {editStatus === 'blocked' && 'User is permanently restricted from accessing or re-applying for portal access.'}
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="px-4 py-2 bg-brand-primary hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                >
                  {isSavingUser ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Save User Details</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: REJECT OR BLOCK REQUEST ================= */}
      {rejectingUser && (
        <div 
          className="fixed inset-0 z-50 bg-[#0b1a13]/80 backdrop-blur-xs flex items-center justify-center p-4 antialiased"
          onClick={(e) => { if (e.target === e.currentTarget) setRejectingUser(null); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 bg-brand-dark text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <img src="/assets/images/logo.jpg" alt="Logo" className="w-8 h-8 rounded-full border border-red-500/40" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif font-bold text-sm tracking-wide text-brand-light">AUVARE</span>
                    <span className="text-[9px] bg-red-950 text-red-300 border border-red-500/30 px-1.5 py-0.2 rounded-full font-bold">
                      ACCESS CONTROL
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Staff Authority &bull; Access Decision</span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setRejectingUser(null)} 
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div>
                <span className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider block">
                  STAFF CONTROL &bull; DECISION
                </span>
                <h3 className="font-serif font-bold text-base text-slate-900 mt-0.5">
                  Reject or Block Request
                </h3>
              </div>

              {/* Target User Info Card */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs shrink-0">
                  {((rejectingUser.display_name || rejectingUser.full_name || rejectingUser.email || 'U')[0]).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-slate-900 truncate">
                    {rejectingUser.display_name || rejectingUser.full_name || rejectingUser.email}
                  </h4>
                  <span className="text-[11px] text-slate-500 block truncate">{rejectingUser.email}</span>
                </div>
              </div>

              {/* Choice Cards */}
              <div className="space-y-2.5">
                {/* Option 1: Reject */}
                <div 
                  onClick={() => setRejectAction('reject')}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                    rejectAction === 'reject' 
                      ? 'border-red-500 bg-red-50/50 shadow-xs' 
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                    rejectAction === 'reject' ? 'border-red-600 bg-red-600 text-white' : 'border-slate-300'
                  }`}>
                    {rejectAction === 'reject' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-red-950">Reject Request (বাতিল করুন)</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      User request will be declined. They may sign in again and re-apply in the future.
                    </p>
                  </div>
                </div>

                {/* Option 2: Block */}
                <div 
                  onClick={() => setRejectAction('block')}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                    rejectAction === 'block' 
                      ? 'border-red-700 bg-red-100/60 shadow-xs' 
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                    rejectAction === 'block' ? 'border-red-700 bg-red-700 text-white' : 'border-slate-300'
                  }`}>
                    {rejectAction === 'block' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-red-950">Permanent Block (স্থায়ীভাবে ব্লক)</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Permanently locks user out. They cannot sign in or submit re-applications. Recommended for unauthorized/spam attempts.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRejectingUser(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteReject}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
              >
                {rejectAction === 'block' ? 'Block Account' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: AUVARE BRANDED CONFIRMATION (ZERO BROWSER CONFIRM) ================= */}
      {brandedConfirm && brandedConfirm.isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-[#0b1a13]/80 backdrop-blur-xs flex items-center justify-center p-4 antialiased"
          onClick={(e) => { if (e.target === e.currentTarget) setBrandedConfirm(null); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 bg-brand-dark text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <img src="/assets/images/logo.jpg" alt="Logo" className="w-8 h-8 rounded-full border border-amber-400/40" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif font-bold text-sm tracking-wide text-brand-light">AUVARE</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold border ${
                      brandedConfirm.isDestructive 
                        ? 'bg-red-950/80 text-red-300 border-red-500/30' 
                        : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {brandedConfirm.badgeText || 'CONFIRMATION'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Store Manager &bull; Catalog Authority</span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setBrandedConfirm(null)} 
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3.5">
              {brandedConfirm.metaSub && (
                <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${
                  brandedConfirm.isDestructive ? 'text-red-600' : 'text-emerald-700'
                }`}>
                  {brandedConfirm.metaSub}
                </span>
              )}
              <h3 className="font-serif font-bold text-base text-slate-900 leading-snug">
                {brandedConfirm.title}
              </h3>

              {brandedConfirm.itemName && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  {brandedConfirm.itemImage ? (
                    <img 
                      src={brandedConfirm.itemImage} 
                      alt={brandedConfirm.itemName} 
                      className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0" 
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-emerald-800 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      {brandedConfirm.itemName[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-slate-900 truncate">{brandedConfirm.itemName}</h4>
                    {brandedConfirm.itemMeta && (
                      <span className="text-[11px] text-slate-500 block truncate">{brandedConfirm.itemMeta}</span>
                    )}
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-600 leading-relaxed">
                {brandedConfirm.warningText}
              </p>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setBrandedConfirm(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 transition"
              >
                {brandedConfirm.cancelBtnText || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={async () => {
                  const action = brandedConfirm.onConfirm;
                  setBrandedConfirm(null);
                  if (typeof action === 'function') await action();
                }}
                className={`px-4 py-2 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5 ${
                  brandedConfirm.isDestructive 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-emerald-700 hover:bg-emerald-800'
                }`}
              >
                <span>{brandedConfirm.confirmBtnText}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sleek Branded Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999999] animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className={`px-4 py-2.5 rounded-xl shadow-xl border text-xs font-semibold flex items-center gap-2 ${
            toast.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
              : (toast.type === 'error'
                  ? 'bg-rose-950 text-rose-100 border-rose-800'
                  : 'bg-slate-900 text-slate-100 border-slate-700')
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'error' && <XCircle className="w-4 h-4 text-rose-400" />}
            {toast.type === 'info' && <Clock className="w-4 h-4 text-sky-400" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
