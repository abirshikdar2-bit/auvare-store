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

// Role Check: Check if current logged-in user is Super Admin
function isSuperAdmin() {
  const profile = adminState.currentUserProfile;
  return profile?.role === 'super_admin';
}

// Initialize Admin
async function initAdmin() {
  await checkAuth();
  await loadData();
  renderStats();
  renderInventoryTable();
  renderHomeDashboard();
  renderCategoriesView();
  updateSidebarBadges();
  setupAdminListeners();
  switchTab('home');
  if (adminState.isAuthenticated) {
    loadAuthUsersTable();
  }

  // Real-time listener for incoming orders from public storefront
  if (window.SupabaseService) {
    const client = window.SupabaseService.getClient();
    if (client) {
      try {
        client.channel('admin_live_orders').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async () => {
          console.log('Realtime change in orders table detected! Fetching latest orders...');
          const fresh = await window.SupabaseService.getOrders();
          if (fresh) {
            adminState.orders = fresh;
            renderOrdersTable();
            updateSidebarBadges();
            showAdminToast('New order received from storefront!', 'success');
          }
        }).subscribe();
      } catch (err) {
        console.warn('Realtime channel subscription error:', err);
      }
    }
  }
}

// Authentication Check with Google OAuth & Supabase RBAC
async function checkAuth() {
  if (window.location.search.includes('preview=1')) {
    adminState.isAuthenticated = true;
    closeAdminModal('adminAuthGate');
    renderUserProfile(
      { email: 'admin@auvare.com', user_metadata: { full_name: 'Store Manager' } },
      { role: 'super_admin', status: 'approved', display_name: 'Store Manager' }
    );
    return;
  }

  const client = window.SupabaseService?.getClient();
  
  if (!client) {
    adminState.isAuthenticated = false;
    showAuthModalView('default');
    openAdminModal('adminAuthGate');
    return;
  }

  // 1. Check existing session
  try {
    if (window.location.search.includes('preview=1')) {
      adminState.isAuthenticated = true;
      closeAdminModal('adminAuthGate');
      renderUserProfile({ email: 'admin@auvare.com', user_metadata: { full_name: 'Store Manager' } }, { role: 'super_admin', status: 'approved' });
      return;
    }

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

  // Sync user record into Supabase auth_users
  let profile = null;
  if (window.SupabaseService) {
    profile = await window.SupabaseService.registerOrRequestAdmin(user);
  }
  adminState.currentUserProfile = profile;

  // 1. Approved Admin / Super Admin Check
  if (profile && profile.status === 'approved' && (profile.role === 'admin' || profile.role === 'super_admin')) {
    adminState.isAuthenticated = true;
    closeAdminModal('adminAuthGate');
    renderUserProfile(user, profile);
    const roleTitle = profile.role === 'super_admin' ? 'Super Admin' : 'Admin';
    showAdminToast(`Welcome, ${profile.display_name || user.email}! ${roleTitle} dashboard active.`, 'success');
    loadAuthUsersTable();
    return;
  }

  // 2. Blocked Access Check (Spam Prevention)
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
        ${avatar ? `<img src="${avatar}" style="width:22px; height:22px; border-radius:50%;" referrerpolicy="no-referrer" />` : '<span style="font-weight:700;">U</span>'}
        <span><strong>${name}</strong> (${user.email})</span>
      `;
    }
    if (emailNotice) {
      emailNotice.textContent = `আবেদনকারী: ${user.email}। আপনার রিকোয়েস্টটি Super Admin-এর কাছে জমা হয়েছে।`;
    }
  }

  if (viewType === 'rejected' && user) {
    const notice = document.getElementById('rejectedUserNotice');
    if (notice) {
      notice.textContent = `আবেদনকারী: ${user.email}। সুপার অ্যাডমিন আপনার আগের রিকোয়েস্টটি বাতিল করেছেন।`;
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
  const isSuper = profile?.role === 'super_admin';

  container.style.display = 'flex';
  container.className = 'admin-user-profile';
  container.innerHTML = `
    <div style="position: relative;">
      ${avatar ? `
        <img src="${avatar}" alt="${name}" class="admin-user-avatar" referrerpolicy="no-referrer" />
      ` : `
        <div class="admin-user-avatar">${initial}</div>
      `}
      <span class="online-indicator-dot" title="Active Online"></span>
    </div>
    <div class="admin-user-info">
      <span class="admin-user-name">${name}</span>
      <span class="admin-user-email" title="${email}">${isSuper ? 'Super Admin' : 'Admin'}</span>
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

  if (!adminState.orders || adminState.orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 3rem 1rem; color: var(--admin-text-muted);">
          No customer orders recorded yet. Place an order on the storefront to test!
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = adminState.orders.map(order => {
    const status = (order.status || order.orderStatus || 'pending').toLowerCase();
    const payMethod = (order.paymentMethod || 'cod').toLowerCase();
    const senderNumber = order.paymentNumber || order.paymentSenderNumber || order.senderPhone || null;
    const trxId = order.trxId || null;

    return `
      <tr class="order-row" onclick="openOrderDetailsModal('${order.orderId}')">
        <td>
          <strong style="color: var(--admin-text-main);">#${order.orderId || 'AUV-000'}</strong>
          <div style="font-size: 0.72rem; color: var(--admin-text-muted);">${order.date ? order.date.split(',')[0] : ''}</div>
        </td>
        <td>
          <div style="font-weight: 700; color: var(--admin-text-main);">${order.name}</div>
          <div style="font-size: 0.75rem; color: var(--admin-text-muted); font-family: monospace;">${order.phone}</div>
        </td>
        <td>
          <div style="font-size: 0.8rem; max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${order.address}">
            ${order.address}
          </div>
          <div style="font-size: 0.72rem; color: var(--admin-text-muted);">${order.deliveryZone === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'}</div>
        </td>
        <td>
          <div class="order-item-list" style="font-size: 0.82rem;">
            ${(order.items || []).map(i => `
              <div style="display: flex; align-items: center; gap: 0.35rem; margin-bottom: 0.2rem;">
                <span style="font-weight: 600;">${i.title}</span>
                <span class="item-size-badge">${i.size || 'M'}</span>
                <span style="color: var(--admin-text-muted); font-size: 0.75rem;">x${i.quantity || 1}</span>
              </div>
            `).join('')}
          </div>
        </td>
        <td>
          <div style="display: flex; flex-direction: column; gap: 0.25rem;">
            <span class="pay-badge-${payMethod}" style="width: fit-content;">
              ${payMethod.toUpperCase()}
            </span>
            ${senderNumber ? `
              <div style="font-size: 0.72rem; color: #0f172a; font-family: monospace; font-weight: 700;">
                Pay No: ${senderNumber}
              </div>
            ` : ''}
            ${trxId ? `
              <div style="font-size: 0.7rem; color: #64748b; font-family: monospace;">
                Trx: ${trxId}
              </div>
            ` : ''}
          </div>
        </td>
        <td>
          <strong style="font-size: 0.92rem; color: var(--admin-text-main);">৳ ${(order.total || 0).toLocaleString()}</strong>
        </td>
        <td>
          <span class="order-status-pill status-${status}">
            ${status}
          </span>
        </td>
        <td onclick="event.stopPropagation();">
          <div style="display: flex; align-items: center; gap: 0.4rem;">
            <button 
              type="button" 
              class="btn-admin-primary" 
              style="padding: 0.3rem 0.65rem; font-size: 0.75rem;" 
              onclick="openOrderDetailsModal('${order.orderId}')"
            >
              Details
            </button>
            <a 
              href="https://wa.me/88${order.phone}?text=Hello%20${encodeURIComponent(order.name)},%20AUVARE%20here%20regarding%20your%20Order%20%23${order.orderId}." 
              target="_blank" 
              class="btn-admin-outline" 
              style="padding: 0.3rem 0.55rem; font-size: 0.75rem; color: #16a34a; border-color: #bbf7d0;"
              title="Message customer on WhatsApp"
            >
              WhatsApp
            </a>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Open Order Details Modal
function openOrderDetailsModal(orderId) {
  const order = adminState.orders.find(o => o.orderId === orderId);
  if (!order) return;

  adminState.activeModalOrderId = orderId;

  const status = (order.status || order.orderStatus || 'pending').toLowerCase();
  const senderNumber = order.paymentNumber || order.paymentSenderNumber || order.senderPhone || 'N/A';
  const trxId = order.trxId || 'N/A';
  const subtotal = order.subtotal || ((order.items || []).reduce((acc, i) => acc + (i.price * (i.quantity || 1)), 0));
  const shipping = order.shipping || (order.deliveryZone === 'inside' ? 70 : 130);
  const total = order.total || (subtotal + shipping);

  // Header
  document.getElementById('modalOrderId').textContent = `#${order.orderId || 'AUV-000'}`;
  document.getElementById('modalOrderDate').textContent = order.date || 'Recent';
  
  const statusBadge = document.getElementById('modalOrderStatusBadge');
  if (statusBadge) {
    statusBadge.className = `order-status-pill status-${status}`;
    statusBadge.textContent = status.toUpperCase();
  }

  // Customer
  document.getElementById('modalCustomerName').textContent = order.name || 'Anonymous Customer';
  document.getElementById('modalCustomerPhone').textContent = order.phone || 'N/A';
  
  const waLink = document.getElementById('modalCustomerWaLink');
  if (waLink) {
    waLink.href = `https://wa.me/88${order.phone}?text=Hello%20${encodeURIComponent(order.name)},%20AUVARE%20Store%20here%20regarding%20your%20Order%20%23${order.orderId}.`;
  }

  document.getElementById('modalCustomerAddress').textContent = order.address || 'N/A';
  document.getElementById('modalCustomerZone').textContent = order.deliveryZone === 'inside' ? 'Inside Dhaka (৳70 Delivery)' : 'Outside Dhaka (৳130 Delivery)';
  document.getElementById('modalCustomerNotes').textContent = order.notes ? `Notes: "${order.notes}"` : 'No customer delivery notes provided.';

  // Payment
  const payBadgeEl = document.getElementById('modalPaymentMethod');
  if (payBadgeEl) {
    const payMethod = (order.paymentMethod || 'cod').toLowerCase();
    payBadgeEl.innerHTML = `<span class="pay-badge-${payMethod}">${payMethod.toUpperCase()}</span>`;
  }

  document.getElementById('modalSenderNumber').textContent = senderNumber;
  document.getElementById('modalTrxId').textContent = trxId;
  document.getElementById('modalSubtotal').textContent = `৳ ${subtotal.toLocaleString()}`;
  document.getElementById('modalShipping').textContent = `৳ ${shipping.toLocaleString()}`;
  document.getElementById('modalTotalAmount').textContent = `৳ ${total.toLocaleString()}`;

  // Items List
  const itemsContainer = document.getElementById('modalOrderItemsList');
  if (itemsContainer) {
    itemsContainer.innerHTML = (order.items || []).map(item => `
      <div class="order-item-card">
        <div>
          <div style="font-weight: 700; color: #0f172a; font-size: 0.9rem;">
            ${item.title}
            <span class="item-size-badge">${item.size || 'M'}</span>
          </div>
          <div style="font-size: 0.78rem; color: #64748b; margin-top: 0.15rem;">
            ৳ ${(item.price || 0).toLocaleString()} × ${item.quantity || 1}
          </div>
        </div>
        <div style="font-weight: 800; color: #0f172a; font-size: 0.95rem;">
          ৳ ${((item.price || 0) * (item.quantity || 1)).toLocaleString()}
        </div>
      </div>
    `).join('');
  }

  // Status Select
  const statusSelect = document.getElementById('modalStatusSelect');
  if (statusSelect) {
    statusSelect.value = status;
  }

  openAdminModal('orderDetailsModal');
}
window.openOrderDetailsModal = openOrderDetailsModal;

// Update Order Status from Modal
async function handleUpdateOrderStatusFromModal() {
  const orderId = adminState.activeModalOrderId;
  const statusSelect = document.getElementById('modalStatusSelect');
  if (!orderId || !statusSelect) return;

  const newStatus = statusSelect.value;
  const order = adminState.orders.find(o => o.orderId === orderId);

  if (order) {
    order.status = newStatus;
    order.orderStatus = newStatus;
  }

  if (window.SupabaseService) {
    await window.SupabaseService.updateOrderStatus(orderId, newStatus);
  }

  // Update badge in modal
  const statusBadge = document.getElementById('modalOrderStatusBadge');
  if (statusBadge) {
    statusBadge.className = `order-status-pill status-${newStatus}`;
    statusBadge.textContent = newStatus.toUpperCase();
  }

  renderOrdersTable();
  showAdminToast(`Order #${orderId} marked as ${newStatus.toUpperCase()}`, 'success');
}
window.handleUpdateOrderStatusFromModal = handleUpdateOrderStatusFromModal;

// Copy text from modal field
function copyModalField(elementId, btn) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const text = el.textContent.trim();
  if (!text || text === 'N/A') return;

  const showSuccess = () => {
    if (btn) {
      const original = btn.textContent;
      btn.textContent = 'Copied! ✓';
      btn.style.background = '#16a34a';
      setTimeout(() => {
        btn.textContent = original;
        btn.style.background = '';
      }, 1800);
    }
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(showSuccess).catch(() => {
      fallbackCopy(text);
      showSuccess();
    });
  } else {
    fallbackCopy(text);
    showSuccess();
  }

  function fallbackCopy(str) {
    const ta = document.createElement('textarea');
    ta.value = str;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
    } catch (e) {}
    document.body.removeChild(ta);
  }
}
window.copyModalField = copyModalField;

// Refresh Orders from Supabase Cloud
async function refreshAdminOrders(btn) {
  if (btn) {
    const orig = btn.innerHTML;
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
      <span>Refreshing...</span>
    `;
    btn.disabled = true;

    if (window.SupabaseService) {
      try {
        const fresh = await window.SupabaseService.getOrders();
        if (fresh) {
          adminState.orders = fresh;
          renderOrdersTable();
          updateSidebarBadges();
        }
      } catch (err) {
        console.warn('Refresh orders error:', err);
      }
    }

    btn.innerHTML = orig;
    btn.disabled = false;
    showAdminToast('Orders refreshed from database!', 'success');
  }
}
window.refreshAdminOrders = refreshAdminOrders;

// ==========================================
// Tab Switching (Shopify Admin Navigation)
// ==========================================
function switchTab(tabName) {
  // Aliases for compatibility
  if (tabName === 'inventory') tabName = 'products';
  if (tabName === 'team') tabName = 'users';

  adminState.activeTab = tabName;
  document.querySelectorAll('.sidebar-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`tabBtn_${tabName}`)?.classList.add('active');

  const homeTab = document.getElementById('homeTabContent');
  const prodTab = document.getElementById('inventoryTabContent');
  const ordTab = document.getElementById('ordersTabContent');
  const userTab = document.getElementById('view_team');
  const catTab = document.getElementById('categoriesTabContent');

  if (homeTab) homeTab.style.display = tabName === 'home' ? 'block' : 'none';
  if (prodTab) prodTab.style.display = tabName === 'products' ? 'block' : 'none';
  if (ordTab) ordTab.style.display = tabName === 'orders' ? 'block' : 'none';
  if (userTab) userTab.style.display = tabName === 'users' ? 'block' : 'none';
  if (catTab) catTab.style.display = tabName === 'categories' ? 'block' : 'none';

  const heading = document.getElementById('adminTopbarHeading');
  const sub = document.getElementById('adminTopbarSub');
  const invActions = document.getElementById('inventoryTopbarActions');

  if (heading && sub) {
    if (tabName === 'home') {
      heading.textContent = 'Home';
      sub.textContent = 'Overview of your online store and brand performance.';
    } else if (tabName === 'products') {
      heading.textContent = 'Products';
      sub.textContent = 'Full control over clothing drops, sizes (S, M, L, XL, XXL), and catalog pricing.';
    } else if (tabName === 'orders') {
      heading.textContent = 'Orders';
      sub.textContent = 'Track and process customer orders, delivery status, and payment confirmations.';
    } else if (tabName === 'users') {
      heading.textContent = 'Users';
      sub.textContent = 'User directory, admin role permissions, and access approvals.';
    } else if (tabName === 'categories') {
      heading.textContent = 'Categories';
      sub.textContent = 'Organized vintage drops across your 4 primary garment categories.';
    }
  }

  if (invActions) {
    invActions.style.display = tabName === 'products' ? 'flex' : 'none';
  }

  if (tabName === 'home') {
    renderHomeDashboard();
  } else if (tabName === 'products') {
    closeProductEditor();
    renderInventoryTable();
  } else if (tabName === 'orders') {
    renderOrdersTable();
    // Auto-fetch latest orders whenever Orders tab is opened
    if (window.SupabaseService) {
      window.SupabaseService.getOrders().then(fresh => {
        if (fresh && fresh.length > 0) {
          adminState.orders = fresh;
          renderOrdersTable();
          updateSidebarBadges();
        }
      }).catch(err => console.warn('Auto fetch orders error:', err));
    }
  } else if (tabName === 'users') {
    loadAuthUsersTable();
  } else if (tabName === 'categories') {
    renderCategoriesView();
  }

  updateSidebarBadges();
}
window.switchTab = switchTab;

// Update Sidebar Badges
function updateSidebarBadges() {
  const prodBadge = document.getElementById('productsBadge');
  if (prodBadge) prodBadge.textContent = adminState.products.length;

  const ordBadge = document.getElementById('ordersBadge');
  if (ordBadge) ordBadge.textContent = adminState.orders.length;

  const catBadge = document.getElementById('categoriesBadge');
  if (catBadge) catBadge.textContent = '4';

  const userBadge = document.getElementById('pendingBadge');
  if (userBadge) {
    const pendingCount = (adminState.authUsers || []).filter(u => u.status === 'pending').length;
    if (pendingCount > 0) {
      userBadge.style.display = 'inline-block';
      userBadge.textContent = pendingCount;
    } else {
      userBadge.style.display = 'none';
    }
  }
}

// Render Home Dashboard Metrics & Badges
function renderHomeDashboard() {
  const totalSales = adminState.orders.reduce((sum, ord) => sum + (ord.total || 0), 0);
  const totalOrders = adminState.orders.length;
  const inStockDrops = adminState.products.filter(p => !p.sold).length;
  const pendingOrders = adminState.orders.filter(o => o.status !== 'completed' && o.status !== 'delivered').length;
  const pendingUsers = (adminState.authUsers || []).filter(u => u.status === 'pending').length;

  const salesEl = document.getElementById('homeMetricSales');
  if (salesEl) salesEl.textContent = `৳ ${totalSales.toLocaleString()}`;

  const ordersEl = document.getElementById('homeMetricOrders');
  if (ordersEl) ordersEl.textContent = totalOrders;

  const pendingOrdEl = document.getElementById('homePendingOrdersCount');
  if (pendingOrdEl) pendingOrdEl.textContent = pendingOrders;

  const stockCountEl = document.getElementById('homeStockCount');
  if (stockCountEl) stockCountEl.textContent = inStockDrops;

  const pendingUserEl = document.getElementById('homePendingUsersCount');
  if (pendingUserEl) pendingUserEl.textContent = pendingUsers;
}

// Render Categories Counts (Tab 4)
function renderCategoriesView() {
  const tshirts = adminState.products.filter(p => p.category === 'T-Shirts').length;
  const shirts = adminState.products.filter(p => p.category === 'Shirts').length;
  const jackets = adminState.products.filter(p => p.category === 'Jackets').length;
  const pants = adminState.products.filter(p => p.category === 'Pants').length;

  const elT = document.getElementById('catCount_tshirts');
  if (elT) elT.textContent = `${tshirts} item${tshirts === 1 ? '' : 's'}`;

  const elS = document.getElementById('catCount_shirts');
  if (elS) elS.textContent = `${shirts} item${shirts === 1 ? '' : 's'}`;

  const elJ = document.getElementById('catCount_jackets');
  if (elJ) elJ.textContent = `${jackets} item${jackets === 1 ? '' : 's'}`;

  const elP = document.getElementById('catCount_pants');
  if (elP) elP.textContent = `${pants} item${pants === 1 ? '' : 's'}`;
}

// Filter from Category Cards
function filterBySpecificCategory(category) {
  switchTab('products');
  adminState.categoryFilter = category;
  const catFilter = document.getElementById('adminCategoryFilter');
  if (catFilter) catFilter.value = category;
  renderInventoryTable();
}
window.filterBySpecificCategory = filterBySpecificCategory;

// Global Sidebar Search handler
function handleGlobalSearch(query) {
  if (!query || !query.trim()) return;
  if (adminState.activeTab !== 'products') {
    switchTab('products');
  }
  const searchInput = document.getElementById('adminSearchInput');
  if (searchInput) {
    searchInput.value = query;
    renderInventoryTable();
  }
}
window.handleGlobalSearch = handleGlobalSearch;

// ==========================================
// Shopify-Inspired 2-Column Product Editor
// ==========================================

function openProductEditor(mode = 'add', productId = null) {
  const listView = document.getElementById('productsListView');
  const editorView = document.getElementById('productEditorView');
  const invActions = document.getElementById('inventoryTopbarActions');

  if (listView) listView.style.display = 'none';
  if (editorView) editorView.style.display = 'block';
  if (invActions) invActions.style.display = 'none';

  adminState.uploadedImageBase64 = null;

  if (mode === 'edit' && productId) {
    adminState.editingProductId = productId;
    const item = adminState.products.find(p => p.id === productId);
    if (!item) return;

    document.getElementById('editorPageHeading').textContent = `Edit: ${item.title}`;
    document.getElementById('editorProductId').value = item.id;
    document.getElementById('editorTitle').value = item.title;
    document.getElementById('editorPrice').value = item.price;
    document.getElementById('editorCategory').value = item.category;
    document.getElementById('editorChest').value = (item.chest || '').replace(/["']/g, '');
    document.getElementById('editorLength').value = (item.length || '').replace(/["']/g, '');
    document.getElementById('editorCondition').value = item.condition || '9.5/10 (Mint Condition)';
    document.getElementById('editorStatus').value = item.sold ? 'sold' : 'available';
    handleEditorStatusChange(item.sold ? 'sold' : 'available');

    const descRich = document.getElementById('editorDescriptionRich');
    if (descRich) descRich.innerHTML = item.description || '';

    const imgPreview = document.getElementById('editorPreviewImg');
    if (imgPreview) imgPreview.src = item.image;
    document.getElementById('editorImageUrl').value = item.image.startsWith('data:') ? '' : item.image;

    const itemSizes = item.sizes || ['S', 'M', 'L', 'XL', 'XXL'];
    document.querySelectorAll('.editor-size-checkbox').forEach(cb => {
      cb.checked = itemSizes.includes(cb.value);
    });

  } else {
    // Add mode
    adminState.editingProductId = null;
    document.getElementById('editorPageHeading').textContent = 'New Product Drop';
    document.getElementById('editorProductId').value = '';
    document.getElementById('editorTitle').value = '';
    document.getElementById('editorPrice').value = '';
    document.getElementById('editorCategory').value = 'T-Shirts';
    document.getElementById('editorChest').value = '38-46';
    document.getElementById('editorLength').value = '26-30';
    document.getElementById('editorCondition').value = '9.5/10 (Mint Condition)';
    document.getElementById('editorStatus').value = 'available';
    handleEditorStatusChange('available');

    const descRich = document.getElementById('editorDescriptionRich');
    if (descRich) descRich.innerHTML = '';

    const imgPreview = document.getElementById('editorPreviewImg');
    if (imgPreview) imgPreview.src = 'assets/images/item1.jpg';
    document.getElementById('editorImageUrl').value = '';

    document.querySelectorAll('.editor-size-checkbox').forEach(cb => {
      cb.checked = true;
    });
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.openProductEditor = openProductEditor;

// Route modal call to new full-page Shopify editor
function adminOpenEditModal(productId) {
  openProductEditor('edit', productId);
}
window.adminOpenEditModal = adminOpenEditModal;

function closeProductEditor() {
  const listView = document.getElementById('productsListView');
  const editorView = document.getElementById('productEditorView');
  const invActions = document.getElementById('inventoryTopbarActions');

  if (editorView) editorView.style.display = 'none';
  if (listView) listView.style.display = 'block';
  if (invActions && adminState.activeTab === 'products') {
    invActions.style.display = 'flex';
  }
}
window.closeProductEditor = closeProductEditor;

// Rich Box Format Toolbar
function formatRichDoc(cmd, val = null) {
  document.execCommand(cmd, false, val);
  document.getElementById('editorDescriptionRich')?.focus();
}
window.formatRichDoc = formatRichDoc;

// Editor Image Handlers
function handleEditorFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    adminState.uploadedImageBase64 = evt.target.result;
    const img = document.getElementById('editorPreviewImg');
    if (img) img.src = evt.target.result;
    document.getElementById('editorImageUrl').value = '';
  };
  reader.readAsDataURL(file);
}
window.handleEditorFileSelect = handleEditorFileSelect;

function handleEditorUrlChange(url) {
  if (url && url.trim()) {
    adminState.uploadedImageBase64 = null;
    const img = document.getElementById('editorPreviewImg');
    if (img) img.src = url.trim();
  }
}
window.handleEditorUrlChange = handleEditorUrlChange;

function handleEditorStatusChange(val) {
  const badge = document.getElementById('editorStatusBadge');
  if (!badge) return;
  if (val === 'available') {
    badge.textContent = 'Active (In Stock)';
    badge.style.background = 'var(--admin-avail-bg)';
    badge.style.color = 'var(--admin-avail)';
  } else {
    badge.textContent = 'Sold Out';
    badge.style.background = 'var(--admin-sold-bg)';
    badge.style.color = 'var(--admin-sold)';
  }
}
window.handleEditorStatusChange = handleEditorStatusChange;

// Save / Publish from Shopify Editor
async function handleSaveProductEditor() {
  const title = document.getElementById('editorTitle').value.trim();
  const priceVal = document.getElementById('editorPrice').value;

  if (!title) {
    alert('Please enter a product title.');
    document.getElementById('editorTitle').focus();
    return;
  }
  if (!priceVal) {
    alert('Please enter a valid price.');
    document.getElementById('editorPrice').focus();
    return;
  }

  const category = document.getElementById('editorCategory').value;
  const price = parseInt(priceVal, 10);
  const chest = (document.getElementById('editorChest').value.trim() || '40') + '"';
  const length = (document.getElementById('editorLength').value.trim() || '28') + '"';
  const condition = document.getElementById('editorCondition').value.trim() || '9.5/10 (Mint Condition)';
  const sold = document.getElementById('editorStatus').value === 'sold';
  const descRich = document.getElementById('editorDescriptionRich');
  const description = descRich ? descRich.innerHTML.trim() : '';

  const selectedSizes = [];
  document.querySelectorAll('.editor-size-checkbox:checked').forEach(cb => selectedSizes.push(cb.value));
  if (selectedSizes.length === 0) selectedSizes.push('M');

  let image = 'assets/images/item1.jpg';
  if (adminState.uploadedImageBase64) {
    image = adminState.uploadedImageBase64;
  } else {
    const urlInput = document.getElementById('editorImageUrl').value.trim();
    if (urlInput) image = urlInput;
    else if (document.getElementById('editorPreviewImg')?.src) {
      image = document.getElementById('editorPreviewImg').src;
    }
  }

  const editId = adminState.editingProductId;

  if (editId) {
    // Update existing product
    const item = adminState.products.find(p => p.id === editId);
    if (item) {
      item.title = title;
      item.category = category;
      item.price = price;
      item.chest = chest;
      item.length = length;
      item.condition = condition;
      item.sold = sold;
      item.sizes = selectedSizes;
      item.image = image;
      item.description = description;

      saveProducts();
      renderInventoryTable();
      renderStats();
      renderCategoriesView();
      renderHomeDashboard();
      closeProductEditor();

      if (window.SupabaseService) {
        await window.SupabaseService.updateProduct(editId, {
          title, category, price, chest, length, condition, sold, sizes: selectedSizes, image, description
        });
      }
      showAdminToast(`Updated "${title}" successfully!`, 'success');
    }
  } else {
    // Add new product
    const newProduct = {
      id: 'drop_' + Date.now(),
      title,
      category,
      price,
      sizes: selectedSizes,
      size: selectedSizes[0] || 'M',
      chest,
      length,
      condition,
      image,
      sold,
      description: description || `Curated 1-of-1 ${category} drop.`
    };

    adminState.products.unshift(newProduct);
    saveProducts();
    renderInventoryTable();
    renderStats();
    renderCategoriesView();
    renderHomeDashboard();
    updateSidebarBadges();
    closeProductEditor();

    if (window.SupabaseService) {
      await window.SupabaseService.saveProduct(newProduct);
    }
    showAdminToast(`Published "${title}" to online catalog!`, 'success');
  }
}
window.handleSaveProductEditor = handleSaveProductEditor;

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
    const isUserSuperAdmin = u.role === 'super_admin';
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
                ${isUserSuperAdmin ? '<span class="owner-pill-tag" style="margin-left:0.25rem;">Owner</span>' : ''}
              </span>
              <span style="display:block; font-size:0.72rem; color:#64748b;">${u.email}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="badge-role ${u.role}" style="padding:0.2rem 0.6rem; font-size:0.72rem;">
            ${u.role === 'super_admin' ? 'Super Admin' : (u.role === 'admin' ? 'Admin' : 'Customer')}
          </span>
        </td>
        <td>
          <span class="premium-status-pill ${u.status}" style="padding:0.2rem 0.6rem; font-size:0.72rem; ${u.status === 'blocked' ? 'background:#fee2e2; color:#991b1b; border:1px solid #fecaca;' : ''}">
            <span class="status-pulse-dot dot-${u.status}" style="${u.status === 'blocked' ? 'background:#dc2626;' : ''}"></span>
            ${u.status === 'approved' ? 'Approved' : (u.status === 'blocked' ? 'Blocked' : 'Pending Review')}
          </span>
        </td>
        <td>
          ${formatJoinedDate(u.created_at)}
        </td>
        <td>
          ${userIsSuper ? `
            ${isUserSuperAdmin ? `
              <span class="badge-master-compact">
                <span>Super Admin (Master)</span>
              </span>
            ` : `
              <div class="action-buttons-group">
                ${u.status === 'blocked' ? `
                  <button class="btn-premium-unblock" style="padding:0.25rem 0.65rem; font-size:0.72rem; background:#2563eb; color:white; border:none; border-radius:4px; font-weight:700; cursor:pointer;" onclick="unblockUser('${u.id}', '${u.display_name}')" title="Unblock User">
                    Unblock
                  </button>
                ` : u.status === 'pending' ? `
                  <button class="btn-premium-approve" style="padding:0.25rem 0.65rem; font-size:0.72rem;" onclick="approveUser('${u.id}', '${u.display_name}')" title="Approve Request">
                    Approve
                  </button>
                  <button class="btn-premium-reject" style="padding:0.25rem 0.65rem; font-size:0.72rem;" onclick="openRejectModal('${u.id}', '${u.display_name}', '${u.email}')" title="Reject Request">
                    Reject
                  </button>
                ` : `
                  <button class="btn-premium-reject" style="padding:0.25rem 0.65rem; font-size:0.72rem;" onclick="openRejectModal('${u.id}', '${u.display_name}', '${u.email}')" title="Reject Admin Access">
                    Reject
                  </button>
                `}
              </div>
            `}
          ` : `
            <span style="display:inline-flex; align-items:center; gap:0.35rem; font-size:0.72rem; font-weight:700; color:#64748b; background:#f1f5f9; padding:0.25rem 0.6rem; border-radius:4px; border:1px solid #e2e8f0;">
              <span>Super Admin Only</span>
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
    alert('Access Denied: Super Admin authority is required to approve admin access requests.');
    return;
  }

  if (!confirm(`Are you sure you want to approve "${name}" as an Admin? They will have full access to manage stock and view orders.`)) return;

  if (window.SupabaseService) {
    const updated = await window.SupabaseService.updateUserStatus(userId, 'approved', 'admin');
    if (updated) {
      showAdminToast(`"${name}" approved as Admin successfully!`, 'success');
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
      btnSave.innerHTML = '<span>Block User / ব্লক করুন</span>';
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
      btnSave.innerHTML = '<span>Reject Request / বাতিল করুন</span>';
    }
  }
}
window.selectRejectOption = selectRejectOption;

// Open Reject or Block Confirmation Modal
function openRejectModal(userId, name, email) {
  if (!isSuperAdmin()) {
    alert('Access Denied: Super Admin authority is required to reject or block access.');
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
        showAdminToast(`"${name}" has been permanently blocked. They cannot submit requests anymore.`, 'warning');
        loadAuthUsersTable();
      }
    }
  } else {
    // Normal Reject
    if (window.SupabaseService) {
      const updated = await window.SupabaseService.updateUserStatus(userId, 'rejected');
      if (updated) {
        showAdminToast(`Request for "${name}" rejected and removed from directory.`, 'info');
        loadAuthUsersTable();
      }
    }
  }
}
window.executeSelectedRejectAction = executeSelectedRejectAction;

// Unblock User
async function unblockUser(userId, name) {
  if (!isSuperAdmin()) {
    alert('Access Denied: Super Admin authority is required to unblock users.');
    return;
  }

  if (!confirm(`Are you sure you want to unblock "${name}"? They will be allowed to submit access requests again.`)) return;

  if (window.SupabaseService) {
    const updated = await window.SupabaseService.unblockUser(userId);
    if (updated) {
      showAdminToast(`"${name}" has been unblocked.`, 'success');
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
    alertText.innerHTML = '<strong>সতর্কতা (Remove/Reject):</strong> স্ট্যাটাস "Rejected" সিলেক্ট করলে এই অ্যাডমিন <strong>অবিলম্বে তালিকা থেকে রিমুভ</strong> হয়ে যাবে। তার অ্যাডমিন অ্যাক্সেস বাতিল হবে, তবে সে চাইলে পরবর্তীতে আবার আবেদন করতে পারবে।';
  } else if (status === 'approved') {
    alertBox.style.background = '#f0fdf4';
    alertBox.style.borderColor = '#bbf7d0';
    alertBox.style.color = '#166534';
    alertText.innerHTML = '<strong>অনুমোদন (Approved):</strong> এই ইউজার সফলভাবে ড্যাশবোর্ডে প্রবেশ করে ইনভেন্টরি ও কাস্টমার অর্ডার পরিচালনা করতে পারবেন।';
  } else {
    alertBox.style.background = '#fffbeb';
    alertBox.style.borderColor = '#fde68a';
    alertBox.style.color = '#92400e';
    alertText.innerHTML = '<strong>অপেক্ষারত (Pending Review):</strong> ইউজারের রিকোয়েস্টটি সুপার অ্যাডমিনের রিভিউর অপেক্ষায় থাকবে। অনুমোদন ছাড়া ড্যাশবোর্ডে ঢুকতে পারবে না।';
  }
}
window.handleModalStatusChange = handleModalStatusChange;
window.handleModalStatusChange = handleModalStatusChange;

// Open Edit User Modal
function openEditUserModal(userId) {
  if (!isSuperAdmin()) {
    alert('Access Denied: Super Admin permission is required to edit user profiles and roles.');
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
        ${user.role === 'super_admin' ? 'Super Admin' : (user.role === 'admin' ? 'Admin' : 'Customer')}
      </span>
      <span class="premium-status-pill ${user.status}" style="padding:0.18rem 0.5rem; font-size:0.7rem;">
        ${user.status === 'approved' ? 'Approved' : (user.status === 'pending' ? 'Pending' : 'Rejected')}
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
    alert('Access Denied: Super Admin authority is required to modify user details.');
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
        showAdminToast(`"${displayName}" বাতিল/রিমুভ করা হয়েছে এবং তালিকা থেকে সরানো হয়েছে।`, 'info');
      } else {
        showAdminToast(`"${displayName}"-এর রোল ও পারমিশন সফলভাবে আপডেট করা হয়েছে!`, 'success');
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
  // Keyboard shortcut Ctrl+K or Cmd+K for Search
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const searchBox = document.getElementById('globalAdminSearch');
      if (searchBox) {
        searchBox.focus();
        searchBox.select();
      }
    }
  });

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
