/**
 * AUVARE - Admin Dashboard Logic
 * Full A-to-Z Inventory Management, Multi-Size (S, M, L, XL, XXL) Control,
 * and Supabase Cloud Database Integration.
 */

// Default Seed with S, M, L, XL, XXL
const DEFAULT_SEED = [
  {
    id: 'auv-1',
    title: 'Vintage Japanese Minimal Graphic Tee',
    category: 'T-Shirts',
    chest: '38"-46"',
    length: '24"-30"',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    size: 'M',
    condition: '9.5/10 (Mint Condition)',
    price: 999,
    image: 'assets/images/item1.jpg',
    sold: false,
    instagramUrl: 'https://www.instagram.com/auvare_official/p/De4NPJkDzIY/',
    description: 'Authentic imported vintage tee with subtle graphics. Soft washed cotton with single-stitch detailing.'
  },
  {
    id: 'auv-2',
    title: 'Vintage Boxy Heavyweight Polo Tee',
    category: 'Shirts',
    chest: '40"-48"',
    length: '26"-31"',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    size: 'L',
    condition: '9/10 (Like New)',
    price: 799,
    image: 'assets/images/item2.jpg',
    sold: false,
    instagramUrl: 'https://www.instagram.com/auvare_official/p/De4M6Qpj0yl/',
    description: 'Thick structured collar and drop-shoulder vintage boxy silhouette. Extremely comfortable and versatile styling piece.'
  },
  {
    id: 'auv-3',
    title: '90s Oversized Streetwear Graphic Tee',
    category: 'T-Shirts',
    chest: '42"-48"',
    length: '27"-31"',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    size: 'L',
    condition: '9/10 (Vintage Fade)',
    price: 799,
    image: 'assets/images/item3.jpg',
    sold: true,
    instagramUrl: 'https://www.instagram.com/auvare_official/p/De4Mk8rD-zQ/',
    description: 'Classic vintage sun-faded wash with authentic patina. Sold out on last drop.'
  },
  {
    id: 'auv-4',
    title: 'Vintage Washed Everyday Minimalist Tee',
    category: 'T-Shirts',
    chest: '38"-46"',
    length: '25"-30"',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    size: 'M',
    condition: '9.5/10 (Near Deadstock)',
    price: 799,
    image: 'assets/images/item4.jpg',
    sold: false,
    instagramUrl: 'https://www.instagram.com/auvare_official/p/De4MEWvD-4r/',
    description: 'Ultra-breathable premium imported cotton. Relaxed streetwear fit with reinforced crew neck.'
  },
  {
    id: 'auv-5',
    title: 'Vintage Heritage Corduroy Workshirt',
    category: 'Shirts',
    chest: '40"-46"',
    length: '28"-31"',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    size: 'M',
    condition: '9.5/10 (Pristine)',
    price: 1250,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=80',
    sold: false,
    instagramUrl: 'https://www.instagram.com/auvare_official/',
    description: 'Rich ribbed corduroy in earth-toned camel shade. Dual flap utility chest pockets.'
  },
  {
    id: 'auv-6',
    title: 'Vintage British Racing Harrington Jacket',
    category: 'Jackets',
    chest: '42"-48"',
    length: '27"-31"',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    size: 'XL',
    condition: '9/10 (Crisp Shell)',
    price: 1850,
    image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=700&q=80',
    sold: false,
    instagramUrl: 'https://www.instagram.com/auvare_official/',
    description: 'Classic checkered tartan inner lining, YKK brass zip, and weather-resistant shell.'
  },
  {
    id: 'auv-7',
    title: 'Vintage Wide-Leg Washed Denim Trousers',
    category: 'Pants',
    chest: 'Waist: 28"-38"',
    length: '38"-42"',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    size: '32',
    condition: '9/10 (Natural Whisker Fade)',
    price: 1450,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=700&q=80',
    sold: false,
    instagramUrl: 'https://www.instagram.com/auvare_official/',
    description: 'Heavyweight selvedge denim with natural vintage honeycombs and vintage wash.'
  },
  {
    id: 'auv-8',
    title: '90s Retro Colorblock Sport Windbreaker',
    category: 'Jackets',
    chest: '42"-48"',
    length: '27"-31"',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    size: 'L',
    condition: '9/10 (Vibrant)',
    price: 1650,
    image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=700&q=80',
    sold: false,
    instagramUrl: 'https://www.instagram.com/auvare_official/',
    description: 'Retro lightweight nylon shell with elasticized cuffs and drawstring hem.'
  }
];

// Global State
const adminState = {
  products: [],
  orders: [],
  authUsers: [],
  activeTab: 'inventory',
  searchQuery: '',
  categoryFilter: 'all',
  statusFilter: 'all',
  editingProductId: null,
  uploadedImageBase64: null,
  isAuthenticated: false,
  currentUser: null,
  currentUserProfile: null
};

// Permanent Super Admin Email
const PERMANENT_SUPER_ADMIN_EMAIL = 'abirshikdar2@gmail.com';

// Helper: Check if current logged-in user is Super Admin (Md Abir Shikdar)
function isSuperAdmin() {
  const user = adminState.currentUser;
  const profile = adminState.currentUserProfile;
  if (!user && !profile) return false;
  const email = (user?.email || profile?.email || '').toLowerCase().trim();
  return email === PERMANENT_SUPER_ADMIN_EMAIL || profile?.role === 'super_admin';
}

// Initialize Admin
async function initAdmin() {
  await checkAuth();
  await loadData();
  await loadStoreSettings();
  renderStats();
  renderInventoryTable();
  setupAdminListeners();
  updateSupabaseStatusBadge();
  if (adminState.isAuthenticated) {
    loadAuthUsersTable();
  }
}

// Authentication Check with Google OAuth & Supabase RBAC
async function checkAuth() {
  const client = window.SupabaseService?.getClient();
  
  if (!client) {
    adminState.isAuthenticated = false;
    showAuthModalView('default');
    openAdminModal('adminAuthGate');
    return;
  }

  // 1. Check existing session
  try {
    const { data: { session }, error } = await client.auth.getSession();
    if (session && session.user) {
      await verifyUserAccess(session.user);
    } else {
      adminState.isAuthenticated = false;
      showAuthModalView('default');
      openAdminModal('adminAuthGate');
    }
  } catch (err) {
    console.warn('Auth check error:', err);
    adminState.isAuthenticated = false;
    showAuthModalView('default');
    openAdminModal('adminAuthGate');
  }

  // 2. Real-time auth state listener
  client.auth.onAuthStateChange(async (event, session) => {
    if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
      await verifyUserAccess(session.user);
    } else if (event === 'SIGNED_OUT') {
      adminState.isAuthenticated = false;
      adminState.currentUser = null;
      adminState.currentUserProfile = null;
      renderUserProfile(null);
      showAuthModalView('default');
      openAdminModal('adminAuthGate');
    }
  });
}

// Verify User Role & Approval Status
async function verifyUserAccess(user) {
  adminState.currentUser = user;
  const email = (user.email || '').toLowerCase().trim();
  const isPermanentSuperAdmin = email === PERMANENT_SUPER_ADMIN_EMAIL;

  // Sync user record into Supabase auth_users
  let profile = null;
  if (window.SupabaseService) {
    profile = await window.SupabaseService.registerOrRequestAdmin(user);
  }
  adminState.currentUserProfile = profile;

  // 1. Permanent Super Admin Check (Md Abir Shikdar)
  if (isPermanentSuperAdmin) {
    adminState.isAuthenticated = true;
    closeAdminModal('adminAuthGate');
    renderUserProfile(user, { ...profile, role: 'super_admin', status: 'approved' });
    showAdminToast(`👑 Welcome back Super Admin, ${user.user_metadata?.full_name || 'Abir Shikdar'}!`, 'success');
    loadAuthUsersTable();
    return;
  }

  // 2. Approved Admin Check
  if (profile && profile.status === 'approved' && (profile.role === 'admin' || profile.role === 'super_admin')) {
    adminState.isAuthenticated = true;
    closeAdminModal('adminAuthGate');
    renderUserProfile(user, profile);
    showAdminToast(`Welcome, ${profile.display_name}! Admin dashboard unlocked.`, 'success');
    loadAuthUsersTable();
    return;
  }

  // 3. Blocked Access Check (Spam Prevention)
  if (profile && profile.status === 'blocked') {
    adminState.isAuthenticated = false;
    showAuthModalView('blocked', user, profile);
    openAdminModal('adminAuthGate');
    return;
  }

  // 4. Rejected Access Check
  if (profile && profile.status === 'rejected') {
    adminState.isAuthenticated = false;
    showAuthModalView('rejected', user, profile);
    openAdminModal('adminAuthGate');
    return;
  }

  // 5. Default: Pending Approval (Awaiting Abir Shikdar's review)
  adminState.isAuthenticated = false;
  showAuthModalView('pending', user, profile);
  openAdminModal('adminAuthGate');
}

// Switch between Default, Pending, Rejected, and Blocked Modal Views
function showAuthModalView(viewType, user = null, profile = null) {
  const defaultView = document.getElementById('authGateDefaultView');
  const pendingView = document.getElementById('authGatePendingView');
  const rejectedView = document.getElementById('authGateRejectedView');
  const blockedView = document.getElementById('authGateBlockedView');

  if (defaultView) defaultView.style.display = viewType === 'default' ? 'block' : 'none';
  if (pendingView) pendingView.style.display = viewType === 'pending' ? 'block' : 'none';
  if (rejectedView) rejectedView.style.display = viewType === 'rejected' ? 'block' : 'none';
  if (blockedView) blockedView.style.display = viewType === 'blocked' ? 'block' : 'none';

  if (viewType === 'pending' && user) {
    const card = document.getElementById('pendingUserCard');
    const emailNotice = document.getElementById('pendingUserEmailNotice');
    if (card) {
      const avatar = user.user_metadata?.avatar_url;
      const name = user.user_metadata?.full_name || user.email?.split('@')[0];
      card.innerHTML = `
        ${avatar ? `<img src="${avatar}" style="width:22px; height:22px; border-radius:50%;" referrerpolicy="no-referrer" />` : '👤'}
        <span><strong>${name}</strong> (${user.email})</span>
      `;
    }
    if (emailNotice) {
      emailNotice.textContent = `আবেদনকারী: ${user.email}। আপনার রিকোয়েস্টটি Super Admin (Md Abir Shikdar)-এর কাছে জমা হয়েছে।`;
    }
  }

  if (viewType === 'rejected' && user) {
    const notice = document.getElementById('rejectedUserNotice');
    if (notice) {
      notice.textContent = `আবেদনকারী: ${user.email}। সুপার অ্যাডমিন (Md Abir Shikdar) আপনার আগের রিকোয়েস্টটি বাতিল করেছেন।`;
    }
  }

  if (viewType === 'blocked' && user) {
    const notice = document.getElementById('blockedUserNotice');
    if (notice) {
      notice.textContent = `আবেদনকারী: ${user.email}। সুপার অ্যাডমিন কর্তৃক আপনার অ্যাকাউন্টটি ব্লক করা হয়েছে।`;
    }
  }
}

// Re-apply for Admin Access (Applicant can submit new request anytime after rejection)
async function handleReapplyAccess() {
  const btn = document.getElementById('btnReapplyAccess');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>⏳ Sending Request...</span>';
  }

  try {
    const user = adminState.currentUser || (window.SupabaseService ? (await window.SupabaseService.getClient()?.auth.getSession())?.data?.session?.user : null);

    if (!user || !user.email) {
      showAdminToast('Session expired. Please sign in again with Google.', 'error');
      showAuthModalView('default');
      return;
    }

    if (window.SupabaseService) {
      try {
        const updated = await window.SupabaseService.reapplyAdminAccess(user.email);
        if (updated) {
          adminState.currentProfile = updated;
          showAdminToast('✓ আপনার অ্যাডমিন রিকোয়েস্ট পুনরায় সুপার অ্যাডমিনের কাছে পাঠানো হয়েছে!', 'success');
          showAuthModalView('pending', user, updated);
          return;
        }
      } catch (err) {
        if (err.message === 'BLOCKED_USER') {
          showAdminToast('⛔ আপনার অ্যাকাউন্টটি সুপার অ্যাডমিন ব্লক করেছেন। আবেদন পাঠানো যাবে না।', 'error');
          showAuthModalView('blocked', user);
          return;
        }
        throw err;
      }
    }

    showAdminToast('Could not send re-application. Please try again.', 'error');
  } catch (err) {
    console.error('Re-apply error:', err);
    showAdminToast('Error submitting re-application.', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span>🔄 Re-apply for Admin Access (পুনরায় রিকোয়েস্ট পাঠান)</span>';
    }
  }
}
window.handleReapplyAccess = handleReapplyAccess;

// Recheck approval status
async function recheckApprovalStatus() {
  if (!adminState.currentUser) return;
  showAdminToast('Checking approval status...', 'info');
  const profile = await window.SupabaseService?.getUserProfile(adminState.currentUser.email);
  if (profile?.status === 'approved' && (profile.role === 'admin' || profile.role === 'super_admin')) {
    await verifyUserAccess(adminState.currentUser);
  } else if (profile?.status === 'blocked') {
    showAuthModalView('blocked', adminState.currentUser, profile);
  } else if (profile?.status === 'rejected') {
    showAuthModalView('rejected', adminState.currentUser, profile);
  } else {
    showAdminToast('Status is still Pending. Please wait for Super Admin approval.', 'warning');
  }
}

function renderUserProfile(user, profile = null) {
  const container = document.getElementById('adminUserProfile');
  if (!container) return;

  if (!user) {
    container.style.display = 'none';
    container.innerHTML = '';
    return;
  }

  const name = profile?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin';
  const email = user.email || '';
  const avatar = user.user_metadata?.avatar_url || profile?.avatar_url;
  const initial = (name[0] || 'A').toUpperCase();
  const isSuper = email.toLowerCase() === PERMANENT_SUPER_ADMIN_EMAIL || profile?.role === 'super_admin';

  container.style.display = 'flex';
  container.className = 'admin-user-profile';
  container.innerHTML = `
    ${avatar ? `
      <img src="${avatar}" alt="${name}" class="admin-user-avatar" referrerpolicy="no-referrer" />
    ` : `
      <div class="admin-user-avatar">${initial}</div>
    `}
    <div class="admin-user-info">
      <span class="admin-user-name">${isSuper ? '👑 ' : ''}${name}</span>
      <span class="admin-user-email" title="${email}">${email}</span>
    </div>
  `;
}

async function handleGoogleSignIn() {
  const client = window.SupabaseService?.getClient();
  if (!client) {
    alert('Supabase client connection not ready. Please reload the page.');
    return;
  }

  const btn = document.getElementById('btnGoogleSignIn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" style="animation: spin 1s linear infinite;">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.3"></circle>
        <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      <span>Connecting to Google...</span>
    `;
  }

  try {
    const redirectUrl = window.location.origin + window.location.pathname;
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });

    if (error) throw error;
  } catch (err) {
    console.error('Google Sign-In Error:', err);
    alert('Google Sign-In failed: ' + err.message);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17Z"/>
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24Z"/>
          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"/>
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"/>
        </svg>
        <span>Continue with Google</span>
      `;
    }
  }
}

async function handleAdminLogout() {
  const client = window.SupabaseService?.getClient();
  if (client) {
    try {
      await client.auth.signOut();
    } catch (err) {
      console.warn('SignOut error:', err);
    }
  }
  sessionStorage.removeItem('auvare_admin_user');
  sessionStorage.removeItem('auvare_admin_logged_in');
  adminState.currentUser = null;
  adminState.currentUserProfile = null;
  adminState.isAuthenticated = false;
  renderUserProfile(null);
  showAuthModalView('default');
  openAdminModal('adminAuthGate');
  showAdminToast('You have been signed out.', 'info');
}

// Load Data from Supabase / LocalStorage
async function loadData() {
  // 1. Try Supabase cloud
  if (window.SupabaseService && window.SupabaseService.isConfigured()) {
    try {
      const cloudProducts = await window.SupabaseService.getProducts();
      if (cloudProducts && cloudProducts.length > 0) {
        adminState.products = cloudProducts;
      }
      const cloudOrders = await window.SupabaseService.getOrders();
      if (cloudOrders) {
        adminState.orders = cloudOrders;
      }
    } catch (err) {
      console.warn('Supabase load error:', err);
    }
  }

  // 2. Fallback to LocalStorage
  if (!adminState.products || adminState.products.length === 0) {
    const savedProducts = localStorage.getItem('auvare_inventory_v1');
    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts);
        adminState.products = parsed.map(p => ({
          ...p,
          sizes: p.sizes || ['S', 'M', 'L', 'XL', 'XXL']
        }));
      } catch (e) {
        adminState.products = [...DEFAULT_SEED];
      }
    } else {
      adminState.products = [...DEFAULT_SEED];
      saveProducts();
    }
  }

  if (!adminState.orders || adminState.orders.length === 0) {
    const savedOrders = localStorage.getItem('auvare_orders_v1');
    adminState.orders = savedOrders ? JSON.parse(savedOrders) : [];
  }
}

function saveProducts() {
  localStorage.setItem('auvare_inventory_v1', JSON.stringify(adminState.products));
  renderStats();
}

function saveOrders() {
  localStorage.setItem('auvare_orders_v1', JSON.stringify(adminState.orders));
}

// Render Metric Cards
function renderStats() {
  const total = adminState.products.length;
  const available = adminState.products.filter(p => !p.sold).length;
  const sold = adminState.products.filter(p => p.sold).length;
  const totalVal = adminState.products.reduce((acc, p) => acc + (p.price || 0), 0);

  document.getElementById('statTotalItems').textContent = total;
  document.getElementById('statAvailable').textContent = available;
  document.getElementById('statSold').textContent = sold;
  document.getElementById('statTotalValue').textContent = `৳ ${totalVal.toLocaleString()}`;
  
  const badgeEl = document.getElementById('inventoryBadge');
  if (badgeEl) badgeEl.textContent = total;

  const ordersBadge = document.getElementById('ordersBadge');
  if (ordersBadge) ordersBadge.textContent = adminState.orders.length;
}

// Render Inventory Table
function renderInventoryTable() {
  const tbody = document.getElementById('inventoryTableBody');
  if (!tbody) return;

  const filtered = adminState.products.filter(item => {
    // Search
    if (adminState.searchQuery.trim() !== '') {
      const q = adminState.searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      if (!matchTitle && !matchCat) return false;
    }

    // Category
    if (adminState.categoryFilter !== 'all' && item.category !== adminState.categoryFilter) {
      return false;
    }

    // Status
    if (adminState.statusFilter === 'available' && item.sold) return false;
    if (adminState.statusFilter === 'sold' && !item.sold) return false;

    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 3rem 1rem; color: var(--admin-text-muted);">
          No clothing items found matching your filters.
        </td>
      </tr>
    `;
    return;
  }

  const allSizes = ['S', 'M', 'L', 'XL', 'XXL'];

  tbody.innerHTML = filtered.map(item => {
    const itemSizes = item.sizes || allSizes;

    return `
      <tr>
        <td>
          <div class="table-product-cell">
            <img src="${item.image}" alt="${item.title}" class="table-product-thumb" />
            <div>
              <div class="table-product-title">${item.title}</div>
              <div class="table-product-cat">${item.condition || 'Pre-loved'}</div>
            </div>
          </div>
        </td>
        <td><strong>${item.category}</strong></td>
        <td>
          <div style="display: flex; gap: 0.2rem; flex-wrap: wrap;">
            ${itemSizes.map(sz => `
              <span style="font-size: 0.7rem; font-weight: 700; background: #e2e8f0; color: #1e293b; padding: 0.15rem 0.35rem; border-radius: 3px;">
                ${sz}
              </span>
            `).join('')}
          </div>
        </td>
        <td>
          <span style="font-size: 0.8rem; color: var(--admin-text-muted);">
            Chest: <strong>${item.chest}</strong> | L: <strong>${item.length}</strong>
          </span>
        </td>
        <td>
          <span style="font-weight: 800; color: var(--admin-primary); font-size: 1rem;">
            ৳ ${item.price.toLocaleString()}
          </span>
        </td>
        <td>
          <span class="badge-status ${item.sold ? 'sold' : 'available'}">
            ${item.sold ? '● SOLD OUT' : '● AVAILABLE'}
          </span>
        </td>
        <td>
          <div class="action-buttons-group">
            <button 
              class="btn-table-action sold-toggle" 
              onclick="adminToggleSold('${item.id}')" 
              title="Toggle Sold / Available"
            >
              ${item.sold ? '✓ Available' : '✕ Mark Sold'}
            </button>
            
            <button 
              class="btn-table-action edit-btn" 
              onclick="adminOpenEditModal('${item.id}')" 
              title="Edit Price, Sizes & Details"
            >
              ✏️ Edit
            </button>
            
            <button 
              class="btn-table-action delete-btn" 
              onclick="adminDeleteProduct('${item.id}')" 
              title="Delete Item"
            >
              🗑
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Toggle Sold Out / Available
async function adminToggleSold(productId) {
  const item = adminState.products.find(p => p.id === productId);
  if (!item) return;

  item.sold = !item.sold;
  saveProducts();
  renderInventoryTable();

  if (window.SupabaseService) {
    await window.SupabaseService.updateProduct(productId, { sold: item.sold });
  }

  showAdminToast(`"${item.title}" status changed to ${item.sold ? 'SOLD OUT' : 'AVAILABLE'}.`, 'success');
}

// Delete Product
async function adminDeleteProduct(productId) {
  const item = adminState.products.find(p => p.id === productId);
  if (!item) return;

  if (confirm(`Are you sure you want to delete "${item.title}" from the inventory? This cannot be undone.`)) {
    adminState.products = adminState.products.filter(p => p.id !== productId);
    saveProducts();
    renderInventoryTable();

    if (window.SupabaseService) {
      await window.SupabaseService.deleteProduct(productId);
    }

    showAdminToast(`Deleted "${item.title}".`, 'info');
  }
}

// Open Edit Modal & Populate Form
function adminOpenEditModal(productId) {
  const item = adminState.products.find(p => p.id === productId);
  if (!item) return;

  adminState.editingProductId = productId;
  adminState.uploadedImageBase64 = null;

  document.getElementById('editProductId').value = item.id;
  document.getElementById('editTitle').value = item.title;
  document.getElementById('editCategory').value = item.category;
  document.getElementById('editChest').value = item.chest.replace(/["']/g, '');
  document.getElementById('editLength').value = item.length.replace(/["']/g, '');
  document.getElementById('editCondition').value = item.condition || '';
  document.getElementById('editPrice').value = item.price;
  document.getElementById('editImageUrl').value = item.image.startsWith('data:') ? '' : item.image;
  document.getElementById('editDescription').value = item.description || '';
  document.getElementById('editSoldStatus').value = item.sold ? 'true' : 'false';

  // Populate size checkboxes
  const itemSizes = item.sizes || ['S', 'M', 'L', 'XL', 'XXL'];
  document.querySelectorAll('.edit-size-checkbox').forEach(cb => {
    cb.checked = itemSizes.includes(cb.value);
  });

  // Preview current image
  const preview = document.getElementById('editImagePreview');
  preview.innerHTML = `<img src="${item.image}" alt="Preview" />`;

  openAdminModal('editProductModal');
}

// Handle Edit Product Submission
async function handleEditProductSubmit(e) {
  e.preventDefault();
  const id = adminState.editingProductId;
  const item = adminState.products.find(p => p.id === id);
  if (!item) return;

  // Gather selected sizes
  const selectedSizes = [];
  document.querySelectorAll('.edit-size-checkbox:checked').forEach(cb => selectedSizes.push(cb.value));
  if (selectedSizes.length === 0) selectedSizes.push('M'); // default fallback

  item.title = document.getElementById('editTitle').value.trim();
  item.category = document.getElementById('editCategory').value;
  item.sizes = selectedSizes;
  item.chest = document.getElementById('editChest').value.trim() + '"';
  item.length = document.getElementById('editLength').value.trim() + '"';
  item.condition = document.getElementById('editCondition').value.trim();
  item.price = parseInt(document.getElementById('editPrice').value, 10);
  item.sold = document.getElementById('editSoldStatus').value === 'true';
  item.description = document.getElementById('editDescription').value.trim();

  if (adminState.uploadedImageBase64) {
    item.image = adminState.uploadedImageBase64;
  } else {
    const urlInput = document.getElementById('editImageUrl').value.trim();
    if (urlInput) item.image = urlInput;
  }

  saveProducts();
  renderInventoryTable();
  closeAdminModal('editProductModal');

  // Sync to Supabase
  if (window.SupabaseService) {
    await window.SupabaseService.updateProduct(id, {
      title: item.title,
      category: item.category,
      sizes: item.sizes,
      chest: item.chest,
      length: item.length,
      condition: item.condition,
      price: item.price,
      sold: item.sold,
      image: item.image,
      description: item.description
    });
  }

  showAdminToast(`Successfully updated "${item.title}"! Changes are live on the store.`, 'success');
}

// Handle Add Product Submission
async function handleAddProductSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('addTitle').value.trim();
  const category = document.getElementById('addCategory').value;
  const chest = document.getElementById('addChest').value.trim() + '"';
  const length = document.getElementById('addLength').value.trim() + '"';
  const condition = document.getElementById('addCondition').value.trim();
  const price = parseInt(document.getElementById('addPrice').value, 10);
  const description = document.getElementById('addDescription').value.trim();

  // Selected sizes
  const selectedSizes = [];
  document.querySelectorAll('.add-size-checkbox:checked').forEach(cb => selectedSizes.push(cb.value));
  if (selectedSizes.length === 0) selectedSizes.push('S', 'M', 'L', 'XL', 'XXL');

  let image = adminState.uploadedImageBase64;
  if (!image) {
    const urlInput = document.getElementById('addImageUrl').value.trim();
    image = urlInput || 'assets/images/item1.jpg';
  }

  const newProduct = {
    id: 'auv-' + Date.now(),
    title,
    category,
    sizes: selectedSizes,
    size: selectedSizes[0] || 'M',
    chest,
    length,
    condition: condition || '9.5/10 (Mint Condition)',
    price,
    image,
    sold: false,
    instagramUrl: 'https://www.instagram.com/auvare_official/',
    description: description || `Curated 1-of-1 ${category} drop.`
  };

  adminState.products.unshift(newProduct);
  saveProducts();
  renderInventoryTable();
  closeAdminModal('addProductModal');
  e.target.reset();
  adminState.uploadedImageBase64 = null;
  document.getElementById('addImagePreview').innerHTML = '<span>No photo chosen</span>';

  // Sync to Supabase
  if (window.SupabaseService) {
    await window.SupabaseService.insertProduct(newProduct);
  }

  showAdminToast(`🎉 New Drop Added! "${title}" (Sizes: ${selectedSizes.join(', ')}) is now live!`, 'success');
}

// Handle Local Image File Upload
function setupImageUploadListeners() {
  const addFileInput = document.getElementById('addFileInput');
  if (addFileInput) {
    addFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        adminState.uploadedImageBase64 = event.target.result;
        document.getElementById('addImagePreview').innerHTML = `<img src="${event.target.result}" alt="Preview" />`;
      };
      reader.readAsDataURL(file);
    });
  }

  const editFileInput = document.getElementById('editFileInput');
  if (editFileInput) {
    editFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        adminState.uploadedImageBase64 = event.target.result;
        document.getElementById('editImagePreview').innerHTML = `<img src="${event.target.result}" alt="Preview" />`;
      };
      reader.readAsDataURL(file);
    });
  }
}

// Supabase Settings Configuration
function updateSupabaseStatusBadge() {
  const badge = document.getElementById('supabaseStatusBadge');
  if (!badge) return;

  if (window.SupabaseService && window.SupabaseService.isConfigured()) {
    const cfg = window.SupabaseService.getConfig();
    badge.innerHTML = `
      <span style="display:inline-flex; align-items:center; gap:0.4rem; color:#16a34a; font-weight:700;">
        🟢 Supabase Cloud Connected (${cfg.url.replace('https://', '').split('.')[0]})
      </span>
    `;
    const urlInp = document.getElementById('supabaseUrlInput');
    const keyInp = document.getElementById('supabaseKeyInput');
    if (urlInp) urlInp.value = cfg.url;
    if (keyInp) keyInp.value = cfg.anonKey;
  } else {
    badge.innerHTML = `
      <span style="display:inline-flex; align-items:center; gap:0.4rem; color:#d97706; font-weight:700;">
        🟡 Local Storage Active (Ready to connect Supabase)
      </span>
    `;
  }
}

function handleSaveSupabaseConfig(e) {
  e.preventDefault();
  const url = document.getElementById('supabaseUrlInput').value.trim();
  const anonKey = document.getElementById('supabaseKeyInput').value.trim();

  if (window.SupabaseService) {
    window.SupabaseService.setConfig(url, anonKey);
    updateSupabaseStatusBadge();
    showAdminToast('Supabase settings saved & connected!', 'success');
    loadData().then(() => renderInventoryTable());
  }
}

// Store & Contact Settings Cloud Sync (store_contact_info)
async function loadStoreSettings() {
  if (window.SupabaseService) {
    try {
      const contacts = await window.SupabaseService.getStoreContactInfo();
      if (contacts) {
        const waInput = document.getElementById('settingWhatsapp');
        const bkInput = document.getElementById('settingBkash');
        const nagInput = document.getElementById('settingNagad');
        const igInput = document.getElementById('settingInstagram');

        if (waInput && contacts.whatsapp_number) waInput.value = contacts.whatsapp_number;
        if (bkInput && contacts.bkash_number) bkInput.value = contacts.bkash_number;
        if (nagInput && contacts.nagad_number) nagInput.value = contacts.nagad_number;
        if (igInput && contacts.instagram_handle) igInput.value = contacts.instagram_handle;
      }
    } catch (err) {
      console.warn('loadStoreSettings fallback:', err);
    }
  }
}

async function handleSaveStoreSettings(e) {
  e.preventDefault();
  const whatsapp_number = document.getElementById('settingWhatsapp')?.value.trim();
  const bkash_number = document.getElementById('settingBkash')?.value.trim();
  const nagad_number = document.getElementById('settingNagad')?.value.trim();
  const instagram_handle = document.getElementById('settingInstagram')?.value.trim();

  if (window.SupabaseService) {
    const updated = await window.SupabaseService.updateStoreContactInfo({
      whatsapp_number,
      bkash_number,
      nagad_number,
      instagram_handle
    });
    if (updated) {
      showAdminToast('✓ Store & contact info saved in Supabase cloud!', 'success');
    }
  }
}

// Reset Inventory to Default Seed Drops
function adminResetDefaults() {
  if (confirm('Reset store inventory back to initial default items?')) {
    adminState.products = [...DEFAULT_SEED];
    saveProducts();
    renderInventoryTable();
    showAdminToast('Inventory reset to original sample drops (S, M, L, XL, XXL).', 'info');
  }
}

// Orders View
function renderOrdersTable() {
  const tbody = document.getElementById('ordersTableBody');
  if (!tbody) return;

  if (adminState.orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 3rem 1rem; color: var(--admin-text-muted);">
          No customer orders recorded yet. Place an order on the storefront to test!
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = adminState.orders.map(order => `
    <tr>
      <td><strong>#${order.orderId || 'AUV-000'}</strong></td>
      <td>
        <div style="font-weight: 600;">${order.name}</div>
        <div style="font-size: 0.75rem; color: var(--admin-text-muted);">${order.phone}</div>
      </td>
      <td>
        <div style="font-size: 0.8rem; max-width: 200px;">${order.address}</div>
      </td>
      <td>
        <div class="order-item-list">
          ${(order.items || []).map(i => `• ${i.title} (Size: <strong>${i.size}</strong>)`).join('<br>')}
        </div>
      </td>
      <td>
        <span class="pay-badge-${order.paymentMethod ? order.paymentMethod.toLowerCase() : 'cod'}">
          ${(order.paymentMethod || 'COD').toUpperCase()}
        </span>
      </td>
      <td><strong>৳ ${(order.total || 0).toLocaleString()}</strong></td>
      <td>
        <a 
          href="https://wa.me/88${order.phone}?text=Hello%20${encodeURIComponent(order.name)},%20AUVARE%20here%20regarding%20your%20Order%20%23${order.orderId}." 
          target="_blank" 
          class="btn-admin-outline" 
          style="padding: 0.3rem 0.6rem; font-size: 0.75rem;"
        >
          💬 WhatsApp
        </a>
      </td>
    </tr>
  `).join('');
}

// Tab Switching
function switchTab(tabName) {
  adminState.activeTab = tabName;
  document.querySelectorAll('.sidebar-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`tabBtn_${tabName}`)?.classList.add('active');

  const invTab = document.getElementById('inventoryTabContent');
  const ordTab = document.getElementById('ordersTabContent');
  const teamTab = document.getElementById('view_team');
  const setTab = document.getElementById('settingsTabContent');

  if (invTab) invTab.style.display = tabName === 'inventory' ? 'block' : 'none';
  if (ordTab) ordTab.style.display = tabName === 'orders' ? 'block' : 'none';
  if (teamTab) teamTab.style.display = tabName === 'team' ? 'block' : 'none';
  if (setTab) setTab.style.display = tabName === 'settings' ? 'block' : 'none';

  const heading = document.getElementById('adminTopbarHeading');
  const sub = document.getElementById('adminTopbarSub');
  const invActions = document.getElementById('inventoryTopbarActions');

  if (heading && sub) {
    if (tabName === 'inventory') {
      heading.textContent = 'Inventory & Catalog Management';
      sub.textContent = 'Full control over clothing drops, sizes (S, M, L, XL, XXL), prices, and Supabase cloud sync.';
    } else if (tabName === 'orders') {
      heading.textContent = 'Customer Orders';
      sub.textContent = 'Track and process customer orders, delivery status, and payment confirmations.';
    } else if (tabName === 'team') {
      heading.textContent = 'Team & Admin Requests';
      sub.textContent = 'Approve, reject, or block admin access requests and manage team security.';
    } else if (tabName === 'settings') {
      heading.textContent = 'Store & Cloud Settings';
      sub.textContent = 'Configure contact numbers (WhatsApp, bKash, Nagad), hero banners, and Supabase sync.';
    }
  }

  if (invActions) {
    invActions.style.display = tabName === 'inventory' ? 'flex' : 'none';
  }

  if (tabName === 'orders') {
    renderOrdersTable();
  } else if (tabName === 'team') {
    loadAuthUsersTable();
  } else if (tabName === 'settings') {
    updateSupabaseStatusBadge();
  }
}

// ==========================================
// User Directory & Admin Approval System
// ==========================================

async function loadAuthUsersTable() {
  const tbody = document.getElementById('authUsersTableBody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--admin-text-muted);">Loading users from Supabase...</td></tr>`;

  let users = [];
  if (window.SupabaseService) {
    users = await window.SupabaseService.getAllAuthUsers();
  }
  adminState.authUsers = users;

  // Toggle Regular Admin Notice Banner
  const regularNotice = document.getElementById('regularAdminNotice');
  const userIsSuper = isSuperAdmin();
  if (regularNotice) {
    regularNotice.style.display = userIsSuper ? 'none' : 'flex';
  }

  // Filter out rejected requests: they should vanish completely from the admin directory!
  const activeUsers = users.filter(u => u.status !== 'rejected');

  // Calculate Stats
  const total = activeUsers.length;
  const approved = users.filter(u => u.status === 'approved' && (u.role === 'admin' || u.role === 'super_admin')).length;
  const pending = users.filter(u => u.status === 'pending').length;

  // Update Stat Cards
  const elTotal = document.getElementById('statTotalUsers');
  const elApproved = document.getElementById('statApprovedAdmins');
  const elPending = document.getElementById('statPendingRequests');
  const badgePending = document.getElementById('pendingBadge');

  if (elTotal) elTotal.textContent = total;
  if (elApproved) elApproved.textContent = approved;
  if (elPending) elPending.textContent = pending;

  // Sidebar Pending Requests Badge
  if (badgePending) {
    if (pending > 0) {
      badgePending.style.display = 'inline-flex';
      badgePending.textContent = pending;
    } else {
      badgePending.style.display = 'none';
    }
  }

  if (activeUsers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 2.5rem 1rem; color: var(--admin-text-muted);">
          No active users or pending requests.
        </td>
      </tr>
    `;
    return;
  }

  function formatJoinedDate(dateStr) {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return `<span style="color:#64748b; font-size:0.78rem;">${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>`;
    } catch (e) {
      return `<span style="color:#64748b; font-size:0.78rem;">${dateStr}</span>`;
    }
  }

  tbody.innerHTML = activeUsers.map(u => {
    const isUserSuperAdmin = (u.email || '').toLowerCase() === PERMANENT_SUPER_ADMIN_EMAIL || u.role === 'super_admin';
    const avatar = u.avatar_url || '';
    const initial = ((u.display_name || u.email || 'U')[0]).toUpperCase();

    let rowClass = 'row-user';
    if (isUserSuperAdmin) rowClass = 'row-super-admin';
    else if (u.status === 'blocked') rowClass = 'row-blocked';
    else if (u.status === 'pending') rowClass = 'row-pending';
    else if (u.status === 'approved') rowClass = 'row-approved';

    return `
      <tr class="${rowClass}">
        <td>
          <div style="display:flex; align-items:center; gap:0.65rem;">
            <div class="user-avatar-wrap-sm">
              ${avatar ? `
                <img src="${avatar}" alt="${u.display_name}" class="${isUserSuperAdmin ? 'ring-super' : ''}" referrerpolicy="no-referrer" />
              ` : `
                <div class="user-avatar-initial-sm ${isUserSuperAdmin ? 'grad-super' : (u.role === 'admin' ? 'grad-admin' : 'grad-user')}">
                  ${initial}
                </div>
              `}
            </div>
            <div style="line-height:1.2;">
              <span style="font-weight:700; color:#0f172a; font-size:0.83rem;">
                ${u.display_name || 'Anonymous User'}
                ${isUserSuperAdmin ? '<span class="owner-pill-tag" style="margin-left:0.25rem;">👑 Owner</span>' : ''}
              </span>
              <span style="display:block; font-size:0.72rem; color:#64748b;">${u.email}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="badge-role ${u.role}" style="padding:0.2rem 0.6rem; font-size:0.72rem;">
            ${u.role === 'super_admin' ? '👑 Super Admin' : (u.role === 'admin' ? '🛡️ Admin' : '👤 Customer')}
          </span>
        </td>
        <td>
          <span class="premium-status-pill ${u.status}" style="padding:0.2rem 0.6rem; font-size:0.72rem; ${u.status === 'blocked' ? 'background:#fee2e2; color:#991b1b; border:1px solid #fecaca;' : ''}">
            <span class="status-pulse-dot dot-${u.status}" style="${u.status === 'blocked' ? 'background:#dc2626;' : ''}"></span>
            ${u.status === 'approved' ? 'Approved' : (u.status === 'blocked' ? '🚫 Blocked' : 'Pending Review')}
          </span>
        </td>
        <td>
          ${formatJoinedDate(u.created_at)}
        </td>
        <td>
          ${userIsSuper ? `
            ${isUserSuperAdmin ? `
              <span class="badge-master-compact">
                <span>👑</span> <span>Super Admin (Master)</span>
              </span>
            ` : `
              <div class="action-buttons-group">
                ${u.status === 'blocked' ? `
                  <button class="btn-premium-unblock" style="padding:0.25rem 0.65rem; font-size:0.72rem; background:#2563eb; color:white; border:none; border-radius:4px; font-weight:700; cursor:pointer;" onclick="unblockUser('${u.id}', '${u.display_name}')" title="Unblock User">
                    🔓 Unblock
                  </button>
                ` : u.status === 'pending' ? `
                  <button class="btn-premium-approve" style="padding:0.25rem 0.65rem; font-size:0.72rem;" onclick="approveUser('${u.id}', '${u.display_name}')" title="Approve Request">
                    ✓ Approve
                  </button>
                  <button class="btn-premium-reject" style="padding:0.25rem 0.65rem; font-size:0.72rem;" onclick="openRejectModal('${u.id}', '${u.display_name}', '${u.email}')" title="Reject Request">
                    ✕ Reject
                  </button>
                ` : `
                  <button class="btn-premium-reject" style="padding:0.25rem 0.65rem; font-size:0.72rem;" onclick="openRejectModal('${u.id}', '${u.display_name}', '${u.email}')" title="Reject Admin Access">
                    ✕ Reject
                  </button>
                `}
              </div>
            `}
          ` : `
            <span style="display:inline-flex; align-items:center; gap:0.35rem; font-size:0.72rem; font-weight:700; color:#64748b; background:#f1f5f9; padding:0.25rem 0.6rem; border-radius:4px; border:1px solid #e2e8f0;">
              <span>🔒</span> <span>Super Admin Only</span>
            </span>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

// Approve User Admin Request
async function approveUser(userId, name) {
  if (!isSuperAdmin()) {
    alert('⛔ Access Denied: Only Super Admin (Md Abir Shikdar) has authority to approve admin access requests.');
    return;
  }

  if (!confirm(`Are you sure you want to approve "${name}" as an Admin? They will have full access to manage stock and view orders.`)) return;

  if (window.SupabaseService) {
    const updated = await window.SupabaseService.updateUserStatus(userId, 'approved', 'admin');
    if (updated) {
      showAdminToast(`✓ "${name}" approved as Admin successfully!`, 'success');
      loadAuthUsersTable();
    }
  }
}

// Select Reject Option in Modal (Reject vs Block)
function selectRejectOption(action) {
  const inputAction = document.getElementById('selectedRejectAction');
  if (inputAction) inputAction.value = action;

  const cardReject = document.getElementById('cardSelectReject');
  const cardBlock = document.getElementById('cardSelectBlock');
  const radioReject = document.getElementById('radioCircleReject');
  const radioBlock = document.getElementById('radioCircleBlock');
  const btnSave = document.getElementById('btnSaveRejectAction');

  if (action === 'block') {
    // Highlight Block Card
    if (cardBlock) {
      cardBlock.style.borderColor = '#dc2626';
      cardBlock.style.background = '#fff5f5';
      cardBlock.style.boxShadow = '0 2px 8px rgba(220, 38, 38, 0.12)';
    }
    if (radioBlock) {
      radioBlock.style.borderColor = '#dc2626';
      radioBlock.style.background = '#dc2626';
      radioBlock.innerHTML = '✓';
    }

    // De-highlight Reject Card
    if (cardReject) {
      cardReject.style.borderColor = '#e2e8f0';
      cardReject.style.background = '#fff';
      cardReject.style.boxShadow = 'none';
    }
    if (radioReject) {
      radioReject.style.borderColor = '#cbd5e1';
      radioReject.style.background = 'transparent';
      radioReject.innerHTML = '';
    }

    if (btnSave) {
      btnSave.style.background = 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)';
      btnSave.innerHTML = '<span>Block User / ব্লক করুন</span> <span>🚫</span>';
    }
  } else {
    // Highlight Reject Card
    if (cardReject) {
      cardReject.style.borderColor = '#ef4444';
      cardReject.style.background = '#fff';
      cardReject.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.08)';
    }
    if (radioReject) {
      radioReject.style.borderColor = '#dc2626';
      radioReject.style.background = '#dc2626';
      radioReject.innerHTML = '✓';
    }

    // De-highlight Block Card
    if (cardBlock) {
      cardBlock.style.borderColor = '#e2e8f0';
      cardBlock.style.background = '#fff';
      cardBlock.style.boxShadow = 'none';
    }
    if (radioBlock) {
      radioBlock.style.borderColor = '#cbd5e1';
      radioBlock.style.background = 'transparent';
      radioBlock.innerHTML = '';
    }

    if (btnSave) {
      btnSave.style.background = 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)';
      btnSave.innerHTML = '<span>Reject Request / বাতিল করুন</span> <span>✓</span>';
    }
  }
}
window.selectRejectOption = selectRejectOption;

// Open Reject or Block Confirmation Modal
function openRejectModal(userId, name, email) {
  if (!isSuperAdmin()) {
    alert('⛔ Access Denied: Only Super Admin (Md Abir Shikdar) has authority to reject or block access.');
    return;
  }

  document.getElementById('rejectTargetUserId').value = userId;
  document.getElementById('rejectTargetUserName').value = name;
  document.getElementById('rejectTargetDisplayName').textContent = name || 'Anonymous User';
  document.getElementById('rejectTargetDisplayEmail').textContent = email || '';

  // Always reset to Reject option as initial selection
  selectRejectOption('reject');

  openAdminModal('rejectConfirmModal');
}
window.openRejectModal = openRejectModal;

// Execute Selected Action upon clicking Save
async function executeSelectedRejectAction() {
  const userId = document.getElementById('rejectTargetUserId').value;
  const name = document.getElementById('rejectTargetUserName').value;
  const actionType = document.getElementById('selectedRejectAction')?.value || 'reject';

  if (!userId) return;

  closeAdminModal('rejectConfirmModal');

  if (actionType === 'block') {
    if (window.SupabaseService) {
      const updated = await window.SupabaseService.blockUser(userId);
      if (updated) {
        showAdminToast(`🚫 "${name}" has been permanently blocked! They cannot submit requests anymore.`, 'warning');
        loadAuthUsersTable();
      }
    }
  } else {
    // Normal Reject
    if (window.SupabaseService) {
      const updated = await window.SupabaseService.updateUserStatus(userId, 'rejected');
      if (updated) {
        showAdminToast(`✕ Request for "${name}" rejected and removed from directory.`, 'info');
        loadAuthUsersTable();
      }
    }
  }
}
window.executeSelectedRejectAction = executeSelectedRejectAction;

// Unblock User
async function unblockUser(userId, name) {
  if (!isSuperAdmin()) {
    alert('⛔ Access Denied: Only Super Admin (Md Abir Shikdar) has authority to unblock users.');
    return;
  }

  if (!confirm(`Are you sure you want to unblock "${name}"? They will be allowed to submit access requests again.`)) return;

  if (window.SupabaseService) {
    const updated = await window.SupabaseService.unblockUser(userId);
    if (updated) {
      showAdminToast(`🔓 "${name}" has been unblocked!`, 'success');
      loadAuthUsersTable();
    }
  }
}
window.unblockUser = unblockUser;

// Dynamic status advisory inside Edit Modal
function handleModalStatusChange(status) {
  const alertBox = document.getElementById('modalStatusAlertBox');
  const alertText = document.getElementById('modalStatusAlertText');
  if (!alertBox || !alertText) return;

  if (status === 'rejected') {
    alertBox.style.background = '#fef2f2';
    alertBox.style.borderColor = '#fecaca';
    alertBox.style.color = '#991b1b';
    alertText.innerHTML = '<strong>⛔ সতর্কতা (Remove/Reject):</strong> স্ট্যাটাস "Rejected" সিলেক্ট করলে এই অ্যাডমিন <strong>অবিলম্বে তালিকা থেকে রিমুভ</strong> হয়ে যাবে। তার অ্যাডমিন অ্যাক্সেস বাতিল হবে, তবে সে চাইলে পরবর্তীতে আবার আবেদন করতে পারবে।';
  } else if (status === 'approved') {
    alertBox.style.background = '#f0fdf4';
    alertBox.style.borderColor = '#bbf7d0';
    alertBox.style.color = '#166534';
    alertText.innerHTML = '<strong>✓ অনুমোদন (Approved):</strong> এই ইউজার সফলভাবে ড্যাশবোর্ডে প্রবেশ করে ইনভেন্টরি ও কাস্টমার অর্ডার পরিচালনা করতে পারবেন।';
  } else {
    alertBox.style.background = '#fffbeb';
    alertBox.style.borderColor = '#fde68a';
    alertBox.style.color = '#92400e';
    alertText.innerHTML = '<strong>⏳ অপেক্ষারত (Pending Review):</strong> ইউজারের রিকোয়েস্টটি সুপার অ্যাডমিনের রিভিউর অপেক্ষায় থাকবে। অনুমোদন ছাড়া ড্যাশবোর্ডে ঢুকতে পারবে না।';
  }
}
window.handleModalStatusChange = handleModalStatusChange;

// Open Edit User Modal
function openEditUserModal(userId) {
  if (!isSuperAdmin()) {
    alert('⛔ Access Denied: Only Super Admin (Md Abir Shikdar) has authority to edit user profiles and roles.');
    return;
  }

  const user = adminState.authUsers.find(u => u.id === userId);
  if (!user) return;

  document.getElementById('editUserId').value = user.id;
  document.getElementById('editUserEmail').value = user.email || '';
  document.getElementById('editUserDisplayName').value = user.display_name || '';
  document.getElementById('editUserRole').value = user.role || 'customer';
  document.getElementById('editUserStatus').value = user.status || 'pending';

  // Populate preview identity card
  const avatarEl = document.getElementById('editUserAvatarPreview');
  const nameEl = document.getElementById('editUserCardName');
  const emailEl = document.getElementById('editUserCardEmail');
  const badgesEl = document.getElementById('editUserCurrentBadges');

  if (avatarEl) {
    if (user.avatar_url) {
      avatarEl.innerHTML = `<img src="${user.avatar_url}" style="width:100%; height:100%; object-fit:cover;" referrerpolicy="no-referrer" />`;
    } else {
      const initial = ((user.display_name || user.email || 'U')[0]).toUpperCase();
      avatarEl.innerHTML = `<span style="font-size:1rem; font-weight:700;">${initial}</span>`;
    }
  }

  if (nameEl) nameEl.textContent = user.display_name || 'User';
  if (emailEl) emailEl.textContent = user.email || '';

  if (badgesEl) {
    badgesEl.innerHTML = `
      <span class="badge-role ${user.role}" style="padding:0.18rem 0.5rem; font-size:0.7rem;">
        ${user.role === 'super_admin' ? '👑 Super Admin' : (user.role === 'admin' ? '🛡️ Admin' : '👤 Customer')}
      </span>
      <span class="premium-status-pill ${user.status}" style="padding:0.18rem 0.5rem; font-size:0.7rem;">
        ${user.status === 'approved' ? '✓ Approved' : (user.status === 'pending' ? '⏳ Pending' : '⛔ Rejected')}
      </span>
    `;
  }

  handleModalStatusChange(user.status || 'pending');
  openAdminModal('editUserModal');
}

// Handle Save User Edit
async function handleSaveUserEdit(e) {
  e.preventDefault();

  if (!isSuperAdmin()) {
    alert('⛔ Access Denied: Only Super Admin (Md Abir Shikdar) has authority to modify user details.');
    return;
  }

  const userId = document.getElementById('editUserId').value;
  const displayName = document.getElementById('editUserDisplayName').value.trim();
  const role = document.getElementById('editUserRole').value;
  const status = document.getElementById('editUserStatus').value;

  if (window.SupabaseService) {
    const updated = await window.SupabaseService.updateUserProfile(userId, {
      display_name: displayName,
      role,
      status
    });

    if (updated) {
      if (status === 'rejected') {
        showAdminToast(`✕ "${displayName}" বাতিল/রিমুভ করা হয়েছে এবং তালিকা থেকে সরানো হয়েছে।`, 'info');
      } else {
        showAdminToast(`✓ "${displayName}"-এর রোল ও পারমিশন সফলভাবে আপডেট করা হয়েছে!`, 'success');
      }
      closeAdminModal('editUserModal');
      loadAuthUsersTable();
    }
  }
}

// Modal Helpers
function openAdminModal(id) {
  document.getElementById(id)?.classList.add('open');
}

function closeAdminModal(id) {
  document.getElementById(id)?.classList.remove('open');
}

// Toast
function showAdminToast(message, type = 'info') {
  const existing = document.getElementById('adminToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'adminToast';
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: #0f172a;
    color: #ffffff;
    padding: 0.9rem 1.4rem;
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    font-weight: 500;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    z-index: 200;
    opacity: 0;
    transition: all 0.25s ease;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    border-left: 4px solid var(--admin-primary);
  `;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : 'ℹ'}</span> <span>${message}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => { toast.style.opacity = '1'; }, 10);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

// Setup Event Listeners
function setupAdminListeners() {
  setupImageUploadListeners();

  const searchInput = document.getElementById('adminSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      adminState.searchQuery = e.target.value;
      renderInventoryTable();
    });
  }

  const catFilter = document.getElementById('adminCategoryFilter');
  if (catFilter) {
    catFilter.addEventListener('change', (e) => {
      adminState.categoryFilter = e.target.value;
      renderInventoryTable();
    });
  }

  const statusFilter = document.getElementById('adminStatusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      adminState.statusFilter = e.target.value;
      renderInventoryTable();
    });
  }
}

document.addEventListener('DOMContentLoaded', initAdmin);
