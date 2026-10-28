/**
 * AUVARE - Admin Dashboard Logic
 * Full A-to-Z Inventory Management, Multi-Size (S, M, L, XL, XXL) Control,
 * and Supabase Cloud Database Integration.
 */

// Default Box-Box Checkerboard Pattern SVG Placeholder (No Photo Fallback)
const DEFAULT_BOX_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='750' viewBox='0 0 600 750'><defs><pattern id='boxgrid' width='24' height='24' patternUnits='userSpaceOnUse'><rect width='24' height='24' fill='%23f8fafc'/><rect width='12' height='12' fill='%23e2e8f0'/><rect x='12' y='12' width='12' height='12' fill='%23e2e8f0'/></pattern></defs><rect width='600' height='750' fill='url(%23boxgrid)'/><rect x='120' y='260' width='360' height='230' rx='16' fill='%23ffffff' fill-opacity='0.95' stroke='%23cbd5e1' stroke-width='1.5'/><g transform='translate(265, 290)' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='3' width='64' height='50' rx='8'/><circle cx='23' cy='20' r='6'/><path d='M67 43l-18-18-30 30'/><path d='M40 37l6-6 10 10'/></g><text x='300' y='395' font-family='Playfair Display, serif, -apple-system' font-size='20' font-weight='700' letter-spacing='0.08em' fill='%230f172a' text-anchor='middle'>AUVARE</text><text x='300' y='425' font-family='Plus Jakarta Sans, sans-serif' font-size='12' font-weight='600' letter-spacing='0.05em' fill='%2364748b' text-anchor='middle'>VINTAGE &amp; PRELOVED</text><text x='300' y='452' font-family='Plus Jakarta Sans, sans-serif' font-size='11' font-weight='500' fill='%2394a3b8' text-anchor='middle'>No Photo Uploaded</text></svg>";
window.DEFAULT_BOX_PLACEHOLDER = DEFAULT_BOX_PLACEHOLDER;

// BDT Currency Formatter Helper (Global Authority)
function formatBDT(amount) {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return num.toLocaleString('en-BD');
}
window.formatBDT = formatBDT;

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
  editorImages: [],
  editorVariants: [],
  isAuthenticated: false,
  currentUser: null,
  currentUserProfile: null
};

// Role Check: Check if current logged-in user is Super Admin
function isSuperAdmin() {
  if (!adminState.isAuthenticated) return false;
  if (!adminState.currentUser) return false;
  if (adminState.currentUserProfile?.status === 'rejected' || adminState.currentUserProfile?.status === 'blocked') {
    return false;
  }

  const activeEmail = (
    adminState.currentUser?.email ||
    adminState.currentUserProfile?.email ||
    ''
  ).toLowerCase().trim();

  if (activeEmail === 'abirshikdar2@gmail.com') {
    return true;
  }

  if (adminState.currentUserProfile?.role === 'super_admin' && adminState.currentUserProfile?.status === 'approved') {
    return true;
  }

  return false;
}

// Initialize Admin
async function initAdmin() {
  await checkAuth();

  // STRICT SECURITY: Only load and render dashboard data if authenticated and approved!
  if (adminState.isAuthenticated) {
    await loadData();
    renderStats();
    renderInventoryTable();
    renderHomeDashboard();
    renderCategoriesView();
    updateSidebarBadges();
    setupAdminListeners();
    switchTab('home');
    loadAuthUsersTable();
  }

  // 1. Real-time listener for incoming orders from public storefront
  if (window.SupabaseService) {
    const client = window.SupabaseService.getClient();
    if (client) {
      try {
        client.channel('admin_live_orders').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async () => {
          if (!adminState.isAuthenticated) return;
          console.log('Realtime change in orders table detected! Fetching latest orders...');
          const fresh = await window.SupabaseService.getOrders();
          if (fresh) {
            adminState.orders = fresh;
            if (adminState.activeTab === 'orders') renderOrdersTable();
            if (adminState.activeTab === 'home') renderHomeDashboard();
            updateSidebarBadges();
            showAdminToast('New order received from storefront!', 'success');
          }
        }).subscribe();
      } catch (err) {
        console.warn('Realtime channel subscription error:', err);
      }
    }
  }

  // 2. High-reliability polling fallback for orders (checks every 5 seconds)
  setInterval(async () => {
    if (!adminState.isAuthenticated) return;
    if (!window.SupabaseService) return;
    try {
      const fresh = await window.SupabaseService.getOrders();
      if (fresh && Array.isArray(fresh)) {
        const currentIds = (adminState.orders || []).map(o => o.orderId + ':' + (o.status || o.orderStatus)).join('|');
        const freshIds = fresh.map(o => o.orderId + ':' + (o.status || o.orderStatus)).join('|');
        if (currentIds !== freshIds) {
          const wasNewOrder = fresh.length > (adminState.orders ? adminState.orders.length : 0);
          adminState.orders = fresh;
          if (adminState.activeTab === 'orders') renderOrdersTable();
          if (adminState.activeTab === 'home') renderHomeDashboard();
          updateSidebarBadges();
          if (wasNewOrder && adminState.orders.length > 1) {
            showAdminToast('New customer order received!', 'success');
          }
        }
      }
    } catch (e) {
      // Polling fail silent
    }
  }, 5000);

  // 3. Live Active User Session & Status Enforcement (Checks every 3 seconds)
  // If Super Admin approves, rejects, or blocks any active user in real-time,
  // immediately update their access or kick them out to the appropriate modal!
  setInterval(async () => {
    if (!adminState.currentUser?.email) return;
    const currentEmail = adminState.currentUser.email.toLowerCase().trim();
    if (currentEmail === 'abirshikdar2@gmail.com') return; // Master owner immune

    if (window.SupabaseService) {
      try {
        const freshProfile = await window.SupabaseService.getUserProfile(currentEmail);
        if (freshProfile) {
          if (freshProfile.status === 'rejected' || freshProfile.status === 'blocked') {
            if (adminState.isAuthenticated) {
              adminState.isAuthenticated = false;
              adminState.currentUserProfile = freshProfile;
              // Instantly clear table content to protect customer privacy
              const invTable = document.getElementById('adminInventoryTable');
              if (invTable) invTable.innerHTML = '';
              const ordTable = document.getElementById('adminOrdersTable');
              if (ordTable) ordTable.innerHTML = '';
              renderUserProfile(null);
              showAuthModalView(freshProfile.status, adminState.currentUser, freshProfile);
              openAdminModal('adminAuthGate');
              showAdminToast('Your access status has been updated by Super Admin.', 'error');
            }
          } else if (freshProfile.status === 'approved' && (freshProfile.role === 'admin' || freshProfile.role === 'super_admin')) {
            if (!adminState.isAuthenticated) {
              adminState.isAuthenticated = true;
              adminState.currentUserProfile = freshProfile;
              closeAdminModal('adminAuthGate');
              renderUserProfile(adminState.currentUser, freshProfile);
              showAdminToast('Your admin request has been approved by Super Admin!', 'success');
              await loadData();
              renderStats();
              renderInventoryTable();
              renderHomeDashboard();
              renderCategoriesView();
              updateSidebarBadges();
              setupAdminListeners();
              switchTab('home');
              loadAuthUsersTable();
            }
          }
        }
      } catch (e) {
        // silent
      }
    }
  }, 3000);

  // 4. Real-time Supabase Auth Users table listener
  if (window.SupabaseService) {
    const client = window.SupabaseService.getClient();
    if (client) {
      try {
        client.channel('admin_auth_users_live').on('postgres_changes', { event: '*', schema: 'public', table: 'auth_users' }, async (payload) => {
          if (adminState.isAuthenticated && isSuperAdmin()) {
            loadAuthUsersTable();
          }
          const activeEmail = adminState.currentUser?.email?.toLowerCase().trim();
          if (activeEmail && activeEmail !== 'abirshikdar2@gmail.com' && payload.new && payload.new.email?.toLowerCase().trim() === activeEmail) {
            const newStatus = payload.new.status;
            if (newStatus === 'rejected' || newStatus === 'blocked') {
              adminState.isAuthenticated = false;
              adminState.currentUserProfile = payload.new;
              const invTable = document.getElementById('adminInventoryTable');
              if (invTable) invTable.innerHTML = '';
              const ordTable = document.getElementById('adminOrdersTable');
              if (ordTable) ordTable.innerHTML = '';
              renderUserProfile(null);
              showAuthModalView(newStatus, adminState.currentUser, payload.new);
              openAdminModal('adminAuthGate');
            } else if (newStatus === 'approved' && !adminState.isAuthenticated) {
              adminState.isAuthenticated = true;
              adminState.currentUserProfile = payload.new;
              closeAdminModal('adminAuthGate');
              renderUserProfile(adminState.currentUser, payload.new);
              await loadData();
              renderStats();
              renderInventoryTable();
              renderHomeDashboard();
              renderCategoriesView();
              updateSidebarBadges();
              setupAdminListeners();
              switchTab('home');
              loadAuthUsersTable();
            }
          }
        }).subscribe();
      } catch (err) {
        console.warn('Realtime auth_users channel error:', err);
      }
    }
  }
}

// Authentication Check with Google OAuth & Supabase RBAC
async function checkAuth() {
  const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);

  // In production, strictly strip ?preview from URL so it can NEVER linger or bypass security
  if (!isLocal && window.location.search.includes('preview')) {
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }

  // Ensure solid green auth gate is open with verifying state
  showAuthModalView('loading');
  openAdminModal('adminAuthGate');

  const client = window.SupabaseService?.getClient();

  // Register real-time auth state listener immediately so no auth events are missed
  if (client) {
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

  // 1. Check if an active Google/Supabase OAuth session exists
  if (client) {
    try {
      const { data: { session }, error } = await client.auth.getSession();
      if (session && session.user) {
        await verifyUserAccess(session.user);
        return;
      }
    } catch (err) {
      console.warn('Session check error:', err);
    }
  }

  // 2. Only allow mock preview mode on localhost for offline local development (NEVER in production!)
  if (isLocal && window.location.search.includes('preview=1')) {
    adminState.isAuthenticated = true;
    adminState.currentUser = { email: 'abirshikdar2@gmail.com', user_metadata: { full_name: 'Md Abir Shikdar' } };
    adminState.currentUserProfile = {
      id: '81c10ad2-3813-4b91-b515-626a5f223588',
      email: 'abirshikdar2@gmail.com',
      role: 'super_admin',
      status: 'approved',
      display_name: 'Md Abir Shikdar'
    };
    closeAdminModal('adminAuthGate');
    renderUserProfile(adminState.currentUser, adminState.currentUserProfile);
    loadAuthUsersTable();
    return;
  }

  // 3. No active session: lock gate and show Google sign-in
  adminState.isAuthenticated = false;
  showAuthModalView('default');
  openAdminModal('adminAuthGate');
}

// Verify User Role & Approval Status
async function verifyUserAccess(user) {
  if (!user || !user.email) {
    adminState.isAuthenticated = false;
    showAuthModalView('default');
    openAdminModal('adminAuthGate');
    return;
  }

  adminState.currentUser = user;
  const normalizedEmail = (user.email || '').toLowerCase().trim();

  // 1. Master Owner Email: strictly guaranteed Super Admin
  if (normalizedEmail === 'abirshikdar2@gmail.com') {
    let profile = null;
    if (window.SupabaseService) {
      profile = await window.SupabaseService.getUserProfile(normalizedEmail);
    }
    if (!profile) {
      profile = {
        id: '81c10ad2-3813-4b91-b515-626a5f223588',
        email: user.email,
        role: 'super_admin',
        status: 'approved',
        display_name: user.user_metadata?.full_name || 'Md Abir Shikdar'
      };
    } else {
      profile.role = 'super_admin';
      profile.status = 'approved';
    }

    adminState.currentUserProfile = profile;
    adminState.isAuthenticated = true;
    closeAdminModal('adminAuthGate');
    renderUserProfile(user, profile);
    showAdminToast(`Welcome, ${profile.display_name || user.email}! Super Admin dashboard active.`, 'success');
    return;
  }

  // 2. All secondary accounts: register or query actual profile from Supabase database
  let profile = null;
  if (window.SupabaseService) {
    profile = await window.SupabaseService.registerOrRequestAdmin(user);
    if (!profile) {
      profile = await window.SupabaseService.getUserProfile(normalizedEmail);
    }
  }

  adminState.currentUserProfile = profile;

  // Blocked Access Check (Spam Prevention)
  if (profile && profile.status === 'blocked') {
    adminState.isAuthenticated = false;
    showAuthModalView('blocked', user, profile);
    openAdminModal('adminAuthGate');
    return;
  }

  // Rejected Access Check
  if (profile && profile.status === 'rejected') {
    adminState.isAuthenticated = false;
    showAuthModalView('rejected', user, profile);
    openAdminModal('adminAuthGate');
    return;
  }

  // Approved Admin Check
  if (profile && profile.status === 'approved' && (profile.role === 'admin' || profile.role === 'super_admin')) {
    adminState.isAuthenticated = true;
    closeAdminModal('adminAuthGate');
    renderUserProfile(user, profile);
    const roleTitle = profile.role === 'super_admin' ? 'Super Admin' : 'Admin';
    showAdminToast(`Welcome, ${profile.display_name || user.email}! ${roleTitle} dashboard active.`, 'success');
    return;
  }

  // Default: Pending Approval (Awaiting Super Admin review)
  adminState.isAuthenticated = false;
  showAuthModalView('pending', user, profile);
  openAdminModal('adminAuthGate');
}

// Switch between Loading, Default, Pending, Rejected, and Blocked Modal Views
function showAuthModalView(viewType, user = null, profile = null) {
  const loadingView = document.getElementById('authGateLoadingView');
  const defaultView = document.getElementById('authGateDefaultView');
  const pendingView = document.getElementById('authGatePendingView');
  const rejectedView = document.getElementById('authGateRejectedView');
  const blockedView = document.getElementById('authGateBlockedView');

  if (loadingView) loadingView.style.display = viewType === 'loading' ? 'block' : 'none';
  if (defaultView) defaultView.style.display = viewType === 'default' ? 'block' : 'none';
  if (pendingView) pendingView.style.display = viewType === 'pending' ? 'block' : 'none';
  if (rejectedView) rejectedView.style.display = viewType === 'rejected' ? 'block' : 'none';
  if (blockedView) blockedView.style.display = viewType === 'blocked' ? 'block' : 'none';

  if (viewType === 'blocked') {
    const notice = document.getElementById('blockedUserNotice');
    if (notice) {
      notice.textContent = 'Your access has been permanently restricted by the administrator. Applications from this account are permanently closed.';
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
          showAdminToast('Your account is permanently restricted by the administrator.', 'error');
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
  sessionStorage.clear();
  localStorage.removeItem('auvare_admin_user_email');
  adminState.currentUser = null;
  adminState.currentUserProfile = null;
  adminState.isAuthenticated = false;

  // Clean URL if preview parameter was present
  if (window.location.search.includes('preview')) {
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }

  // Clear tables from DOM to protect sensitive customer records
  const invTable = document.getElementById('adminInventoryTable');
  if (invTable) invTable.innerHTML = '';
  const ordTable = document.getElementById('adminOrdersTable');
  if (ordTable) ordTable.innerHTML = '';

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
            <div style="position: relative; display: inline-block;">
              <img src="${item.image || DEFAULT_BOX_PLACEHOLDER}" alt="${item.title}" class="table-product-thumb" />
              ${(item.images && item.images.length > 1) ? `<span class="photo-count-pill" style="position: absolute; bottom: 2px; right: 2px; font-size: 0.6rem; padding: 0.08rem 0.3rem; background: rgba(15,23,42,0.85); color: #fff; border: none;">📸 ${item.images.length}</span>` : ''}
            </div>
            <div>
              <div class="table-product-title">${item.title}</div>
              <div class="table-product-cat">
                ${item.condition || 'Pre-loved'}
                ${(item.variants && item.variants.length > 0) ? `<span class="photo-count-pill" style="font-size:0.6rem; padding:0.08rem 0.35rem; margin-left:0.35rem; background:#ecfdf5; color:#15803d; border-color:#86efac;">🎨 ${item.variants.length} vars</span>` : ''}
              </div>
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

  // Render Mobile Products Card List for mobile screens
  const mobileContainer = document.getElementById('inventoryMobileCardList');
  if (mobileContainer) {
    if (filtered.length === 0) {
      mobileContainer.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; background: #ffffff; border-radius: var(--radius-md); border: 1px solid var(--admin-border); color: var(--admin-text-muted);">
          No clothing items found matching your filters.
        </div>
      `;
    } else {
      mobileContainer.innerHTML = filtered.map(item => {
        const itemSizes = item.sizes || allSizes;
        return `
          <div class="mobile-product-card">
            <div class="mobile-product-card-top">
              <div style="position: relative; display: inline-block; flex-shrink: 0;">
                <img src="${item.image || DEFAULT_BOX_PLACEHOLDER}" alt="${item.title}" class="mobile-product-thumb" />
                ${(item.images && item.images.length > 1) ? `<span class="photo-count-pill" style="position: absolute; bottom: 3px; right: 3px; font-size: 0.62rem; padding: 0.1rem 0.35rem; background: rgba(15,23,42,0.85); color: #fff; border: none;">📸 ${item.images.length}</span>` : ''}
              </div>
              <div class="mobile-product-info">
                <div class="mobile-product-title">${item.title}</div>
                <div class="mobile-product-meta">
                  ${item.category} • ${item.condition || 'Pre-loved'}
                  ${(item.variants && item.variants.length > 0) ? `<span class="photo-count-pill" style="font-size:0.6rem; padding:0.08rem 0.35rem; margin-left:0.25rem; background:#ecfdf5; color:#15803d; border-color:#86efac;">🎨 ${item.variants.length} vars</span>` : ''}
                </div>
                <div class="mobile-product-specs">Chest: <strong>${item.chest}</strong> | L: <strong>${item.length}</strong></div>
                <div class="mobile-product-price-row">
                  <span class="mobile-product-price">৳ ${item.price.toLocaleString()}</span>
                  <span class="badge-status ${item.sold ? 'sold' : 'available'}">${item.sold ? '● SOLD OUT' : '● AVAILABLE'}</span>
                </div>
              </div>
            </div>
            <div class="mobile-product-sizes">
              ${itemSizes.map(sz => `<span style="font-size: 0.72rem; font-weight: 700; background: #e2e8f0; color: #1e293b; padding: 0.15rem 0.45rem; border-radius: 3px;">${sz}</span>`).join('')}
            </div>
            <div class="mobile-product-actions">
              <button type="button" class="btn-admin-primary" onclick="adminOpenEditModal('${item.id}')">✏️ Edit</button>
              <button type="button" class="btn-admin-outline" onclick="adminToggleSold('${item.id}')">${item.sold ? '✓ Available' : '✕ Mark Sold'}</button>
              <button type="button" class="btn-admin-outline delete-btn" onclick="adminDeleteProduct('${item.id}')" title="Delete">🗑</button>
            </div>
          </div>
        `;
      }).join('');
    }
  }
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

// ==========================================================================
// AUVARE Branded Confirmation Modal System (Replaces native browser confirm)
// ==========================================================================
let pendingConfirmCallback = null;

function showBrandedConfirm(options) {
  try {
    const {
      title = 'Delete Garment Drop?',
      metaSub = 'INVENTORY CONTROL • PERMANENT REMOVAL',
      badgeText = 'CONFIRMATION',
      itemName = '',
      itemImage = '',
      itemMeta = '',
      warningText = 'Are you sure you want to permanently delete this piece from the inventory? This cannot be undone.',
      confirmBtnText = 'Delete Drop',
      cancelBtnText = 'Cancel / Keep Drop',
      isDestructive = true,
      onConfirm = null
    } = options || {};

    pendingConfirmCallback = onConfirm;

    const modal = document.getElementById('brandedConfirmModal');
    if (!modal) {
      console.warn('brandedConfirmModal element not found in DOM');
      if (confirm(`${title}\n\n${itemName ? `Item: "${itemName}"\n` : ''}${warningText}`)) {
        if (typeof onConfirm === 'function') onConfirm();
      }
      return;
    }

    // Populate dynamic text fields
    const titleEl = document.getElementById('brandedConfirmTitle');
    if (titleEl) titleEl.textContent = title;

    const metaSubEl = document.getElementById('brandedConfirmMetaSub');
    if (metaSubEl) metaSubEl.textContent = metaSub;

    const badgeEl = document.getElementById('brandedConfirmHeaderBadge');
    if (badgeEl) badgeEl.textContent = badgeText;

    const warnEl = document.getElementById('brandedConfirmWarning');
    if (warnEl) warnEl.textContent = warningText;

    const btnTextEl = document.getElementById('brandedConfirmActionBtnText');
    if (btnTextEl) btnTextEl.textContent = confirmBtnText;

    const cancelBtnEl = document.getElementById('brandedConfirmCancelBtn');
    if (cancelBtnEl) cancelBtnEl.textContent = cancelBtnText;

    // Item highlight card
    const itemCard = document.getElementById('brandedConfirmItemCard');
    if (itemName && itemCard) {
      itemCard.style.display = 'flex';
      const nameEl = document.getElementById('brandedConfirmItemName');
      if (nameEl) nameEl.textContent = itemName;

      const itemMetaEl = document.getElementById('brandedConfirmItemMeta');
      if (itemMetaEl) itemMetaEl.textContent = itemMeta || 'Curated Garment Piece';

      const imgEl = document.getElementById('brandedConfirmItemImg');
      if (imgEl) {
        imgEl.src = itemImage || 'assets/images/logo.jpg';
        imgEl.onerror = () => { imgEl.src = 'assets/images/logo.jpg'; };
      }
    } else if (itemCard) {
      itemCard.style.display = 'none';
    }

    // Action button styling
    const actionBtn = document.getElementById('brandedConfirmActionBtn');
    if (actionBtn) {
      if (isDestructive) {
        actionBtn.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
        actionBtn.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.35)';
      } else {
        actionBtn.style.background = 'linear-gradient(135deg, #15803d 0%, #166534 100%)';
        actionBtn.style.boxShadow = '0 4px 12px rgba(22, 101, 52, 0.35)';
      }

      actionBtn.onclick = async (e) => {
        if (e) e.preventDefault();
        const cb = pendingConfirmCallback;
        closeBrandedConfirm();
        if (typeof cb === 'function') {
          await cb();
        }
      };
    }

    // Direct open execution
    modal.classList.add('open');
    document.body.classList.add('modal-open');
    const toast = document.getElementById('adminToast');
    if (toast) toast.remove();
  } catch (err) {
    console.error('showBrandedConfirm error:', err);
    if (typeof onConfirm === 'function') onConfirm();
  }
}

function closeBrandedConfirm() {
  pendingConfirmCallback = null;
  const modal = document.getElementById('brandedConfirmModal');
  if (modal) modal.classList.remove('open');
  if (!document.querySelector('.admin-modal-overlay.open')) {
    document.body.classList.remove('modal-open');
  }
}
window.showBrandedConfirm = showBrandedConfirm;
window.closeBrandedConfirm = closeBrandedConfirm;

// Delete Product with AUVARE Branded Modal (Replaces browser confirm)
function adminDeleteProduct(productId) {
  try {
    const item = (adminState.products || []).find(p => String(p.id) === String(productId));
    const title = item ? item.title : 'Selected Garment Drop';
    const itemImg = (item && (item.image || (Array.isArray(item.images) && item.images[0]))) || 'assets/images/logo.jpg';
    const numPrice = item ? (typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0) : 0;
    const priceDisplay = `৳ ${numPrice.toLocaleString()}`;
    const sizeDisplay = (item && (item.size || (Array.isArray(item.sizes) ? item.sizes.join(', ') : 'All Sizes'))) || 'M';
    const itemMeta = item ? `${item.category || 'Clothing'} • ${priceDisplay} • Size: ${sizeDisplay}` : 'Curated Garment Piece';

    showBrandedConfirm({
      title: 'Delete Garment Drop?',
      metaSub: 'INVENTORY CONTROL • PERMANENT REMOVAL',
      badgeText: 'DELETE DROP',
      itemName: title,
      itemImage: itemImg,
      itemMeta: itemMeta,
      warningText: `Are you sure you want to permanently delete "${title}" from the inventory? This will remove the piece from the AUVARE catalog and Supabase database. This action cannot be undone.`,
      confirmBtnText: 'Delete Drop',
      cancelBtnText: 'Cancel / Keep Drop',
      isDestructive: true,
      onConfirm: async () => {
        adminState.products = (adminState.products || []).filter(p => String(p.id) !== String(productId));
        saveProducts();
        renderInventoryTable();
        updateSidebarBadges();

        if (window.SupabaseService) {
          try {
            await window.SupabaseService.deleteProduct(productId);
          } catch (err) {
            console.warn('Supabase delete product error:', err);
          }
        }

        showAdminToast(`Deleted "${title}".`, 'info');
      }
    });
  } catch (err) {
    console.error('Error in adminDeleteProduct:', err);
  }
}
window.adminDeleteProduct = adminDeleteProduct;

// Reset Inventory to Default Seed Drops (AUVARE Branded Modal)
function adminResetDefaults() {
  showBrandedConfirm({
    title: 'Reset Store Inventory?',
    metaSub: 'INVENTORY CONTROL • DATABASE RESEED',
    badgeText: 'RESEED SAMPLE DROPS',
    itemName: 'Reset All Drops to Default Seed',
    itemImage: 'assets/images/logo.jpg',
    itemMeta: 'Restores initial catalog sample garments (S, M, L, XL, XXL)',
    warningText: 'Are you sure you want to reset all current inventory back to the default sample drops? Custom added products will be replaced.',
    confirmBtnText: 'Reset Inventory',
    cancelBtnText: 'Cancel / Keep Inventory',
    isDestructive: true,
    onConfirm: () => {
      adminState.products = [...DEFAULT_SEED];
      saveProducts();
      renderInventoryTable();
      updateSidebarBadges();
      showAdminToast('Inventory reset to original sample drops (S, M, L, XL, XXL).', 'info');
    }
  });
}
window.adminResetDefaults = adminResetDefaults;

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
                ${i.variant ? `<span class="variant-size-chip" style="font-size:0.7rem;">${i.variant}</span>` : ''}
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

  // Render Mobile Orders Card List for mobile screens
  const mobileContainer = document.getElementById('ordersMobileCardList');
  if (mobileContainer) {
    if (!adminState.orders || adminState.orders.length === 0) {
      mobileContainer.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; background: #ffffff; border-radius: var(--radius-md); border: 1px solid var(--admin-border); color: var(--admin-text-muted);">
          No customer orders recorded yet. Place an order on the storefront to test!
        </div>
      `;
    } else {
      mobileContainer.innerHTML = adminState.orders.map(order => {
        const status = (order.status || order.orderStatus || 'pending').toLowerCase();
        const payMethod = (order.paymentMethod || 'cod').toLowerCase();
        const senderNumber = order.paymentNumber || order.paymentSenderNumber || order.senderPhone || null;
        const trxId = order.trxId || null;

        return `
          <div class="mobile-order-card" onclick="openOrderDetailsModal('${order.orderId}')">
            <div class="mobile-order-card-header">
              <div class="mobile-order-id-group">
                <span class="mobile-order-id">#${order.orderId || 'AUV-000'}</span>
                <span class="mobile-order-date">${order.date ? order.date.split(',')[0] : ''}</span>
              </div>
              <span class="order-status-pill status-${status}">${status.toUpperCase()}</span>
            </div>

            <div class="mobile-order-card-body">
              <div class="mobile-order-row">
                <span class="mobile-order-label">Customer</span>
                <span class="mobile-order-val"><strong>${order.name}</strong> • ${order.phone}</span>
              </div>
              <div class="mobile-order-row">
                <span class="mobile-order-label">Delivery Address</span>
                <span class="mobile-order-val">${order.address} (${order.deliveryZone === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
              </div>
              <div class="mobile-order-row">
                <span class="mobile-order-label">Items Ordered</span>
                <div class="mobile-order-items">
                  ${(order.items || []).map(i => `
                    <div class="mobile-item-chip">
                      <span style="font-weight: 600;">${i.title}</span>
                      <span><span class="item-size-badge">${i.size || 'M'}</span> ${i.variant ? `<span class="variant-size-chip" style="font-size:0.7rem;">${i.variant}</span>` : ''} <span style="color: var(--admin-text-muted); font-size: 0.78rem;">x${i.quantity || 1}</span></span>
                    </div>
                  `).join('')}
                </div>
              </div>
              <div class="mobile-order-row" style="flex-direction: row; justify-content: space-between; align-items: center; border-top: 1px dashed var(--admin-border); padding-top: 0.65rem; margin-top: 0.2rem;">
                <div>
                  <span class="pay-badge-${payMethod}">${payMethod.toUpperCase()}</span>
                  ${senderNumber ? `<span style="font-size: 0.72rem; color: #64748b; font-family: monospace; margin-left: 0.35rem;">(${senderNumber})</span>` : ''}
                </div>
                <div>
                  <strong style="color: var(--admin-primary); font-size: 1.05rem;">৳ ${(order.total || 0).toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <div class="mobile-order-card-actions" onclick="event.stopPropagation();">
              <button type="button" class="btn-admin-primary" style="flex: 1; justify-content: center; font-size: 0.82rem; padding: 0.6rem;" onclick="openOrderDetailsModal('${order.orderId}')">
                View Details &amp; Update Status →
              </button>
              <a href="https://wa.me/88${order.phone}?text=Hello%20${encodeURIComponent(order.name)},%20AUVARE%20here%20regarding%20your%20Order%20%23${order.orderId}." target="_blank" class="btn-admin-outline" style="padding: 0.6rem 0.75rem; font-size: 0.82rem; color: #16a34a; border-color: #bbf7d0; display: flex; align-items: center; gap: 0.35rem;">
                WhatsApp
              </a>
            </div>
          </div>
        `;
      }).join('');
    }
  }
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
            ${item.variant ? `<span class="variant-size-chip" style="margin-left:0.35rem; font-size:0.75rem;">${item.variant}</span>` : ''}
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
async function handleUpdateOrderStatusFromModal(btn) {
  const orderId = adminState.activeModalOrderId;
  const statusSelect = document.getElementById('modalStatusSelect');
  if (!orderId || !statusSelect) return;

  const newStatus = statusSelect.value;
  const order = adminState.orders.find(o => o.orderId === orderId);

  if (order) {
    order.status = newStatus;
    order.orderStatus = newStatus;
  }

  let origHtml = '';
  if (btn) {
    origHtml = btn.innerHTML;
    btn.innerHTML = 'Saving...';
    btn.disabled = true;
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

  // Update table & dashboard immediately
  renderStats();
  renderHomeDashboard();
  renderOrdersTable();
  updateSidebarBadges();

  if (btn) {
    btn.innerHTML = 'Saved ✓';
    btn.style.background = '#16a34a';
    btn.style.borderColor = '#16a34a';
    setTimeout(() => {
      btn.innerHTML = origHtml || 'Save Status';
      btn.style.background = '';
      btn.style.borderColor = '';
      btn.disabled = false;
    }, 1500);
  }

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
// Mobile Sidebar Drawer Controls
// ==========================================
function toggleAdminMobileSidebar() {
  const sidebar = document.getElementById('adminSidebar') || document.querySelector('.admin-sidebar');
  const backdrop = document.getElementById('adminSidebarBackdrop');
  if (sidebar && backdrop) {
    const isOpen = sidebar.classList.toggle('mobile-open');
    backdrop.classList.toggle('active', isOpen);
  }
}

function closeAdminMobileSidebar() {
  const sidebar = document.getElementById('adminSidebar') || document.querySelector('.admin-sidebar');
  const backdrop = document.getElementById('adminSidebarBackdrop');
  if (sidebar && backdrop) {
    sidebar.classList.remove('mobile-open');
    backdrop.classList.remove('active');
  }
}

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

  // Update mobile topbar tab label & close drawer
  const mobileTabLabel = document.getElementById('adminMobileActiveTab');
  if (mobileTabLabel) {
    mobileTabLabel.textContent = tabName.charAt(0).toUpperCase() + tabName.slice(1);
  }
  closeAdminMobileSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });

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
    if (tabName === 'products') {
      invActions.style.setProperty('display', 'flex', 'important');
    } else {
      invActions.style.setProperty('display', 'none', 'important');
    }
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

    // Multiple Images populate
    if (Array.isArray(item.images) && item.images.length > 0) {
      adminState.editorImages = item.images.filter(img => img && img !== DEFAULT_BOX_PLACEHOLDER);
    } else if (item.image && item.image !== DEFAULT_BOX_PLACEHOLDER) {
      adminState.editorImages = [item.image];
    } else {
      adminState.editorImages = [];
    }

    const urlInput = document.getElementById('editorImageUrl');
    if (urlInput) urlInput.value = '';

    const itemSizes = item.sizes || ['S', 'M', 'L', 'XL', 'XXL'];
    document.querySelectorAll('.editor-size-checkbox').forEach(cb => {
      cb.checked = itemSizes.includes(cb.value);
    });

    renderEditorMediaGrid();

    // Product Variants populate
    adminState.editorVariants = Array.isArray(item.variants)
      ? JSON.parse(JSON.stringify(item.variants))
      : [];
    cancelVariantForm();
    renderEditorVariantsList();
    renderVariantPresets();

  } else {
    // Add mode - DEFAULT STATE: NO PRODUCT PHOTO! Shows Box-Box Theme Canvas
    adminState.editingProductId = null;
    adminState.editorImages = []; // Absolutely NO images by default as requested!
    adminState.editorVariants = [];
    
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

    const urlInput = document.getElementById('editorImageUrl');
    if (urlInput) urlInput.value = '';

    document.querySelectorAll('.editor-size-checkbox').forEach(cb => {
      cb.checked = true;
    });

    renderEditorMediaGrid();
    cancelVariantForm();
    renderEditorVariantsList();
    renderVariantPresets();
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

// ==========================================
// Multi-Image Gallery Handlers for Product Editor
// ==========================================

function renderEditorMediaGrid() {
  const grid = document.getElementById('editorMediaGrid');
  const badge = document.getElementById('editorImageCountBadge');
  if (!grid) return;

  const images = adminState.editorImages || [];
  const count = images.length;

  if (badge) {
    badge.textContent = `${count} ${count === 1 ? 'photo' : 'photos'}`;
    badge.style.background = count > 0 ? '#ecfdf5' : '#f1f5f9';
    badge.style.color = count > 0 ? '#15803d' : '#475569';
    badge.style.borderColor = count > 0 ? '#86efac' : '#cbd5e1';
  }

  if (count === 0) {
    // Default: Box-box pattern theme empty canvas + Add Tile
    grid.innerHTML = `
      <div class="media-empty-placeholder-box">
        <div class="empty-box-inner">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="3" ry="3"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <strong>No Product Photo (Default Theme Canvas)</strong>
          <span>Add 2, 3, 4+ photos using "+ Add Photos" or the Image URL box below</span>
        </div>
      </div>
      <label class="media-add-tile" for="editorFileInput" title="Select multiple photos">
        <span style="font-size: 1.5rem; font-weight: 300;">+</span>
        <span>Add photos</span>
      </label>
    `;
    return;
  }

  // Render thumbnails
  let html = images.map((imgUrl, idx) => {
    const isPrimary = idx === 0;
    return `
      <div class="media-thumbnail-card ${isPrimary ? 'is-primary' : ''}">
        <img src="${imgUrl}" alt="Product Photo #${idx + 1}" />
        ${isPrimary ? '<span class="media-primary-badge">COVER</span>' : ''}
        <span class="media-order-badge">#${idx + 1}</span>
        <button type="button" class="media-delete-btn" onclick="removeEditorImage(${idx})" title="Remove photo">✕</button>
        ${!isPrimary ? `<button type="button" class="media-cover-btn" onclick="setEditorPrimaryImage(${idx})" title="Set as primary cover photo">★ Make Cover</button>` : ''}
      </div>
    `;
  }).join('');

  // Add more button at end
  html += `
    <label class="media-add-tile" for="editorFileInput" title="Add more photos">
      <span style="font-size: 1.5rem; font-weight: 300;">+</span>
      <span>Add more</span>
    </label>
  `;

  grid.innerHTML = html;
}
window.renderEditorMediaGrid = renderEditorMediaGrid;

function removeEditorImage(idx) {
  if (!adminState.editorImages) return;
  if (idx >= 0 && idx < adminState.editorImages.length) {
    adminState.editorImages.splice(idx, 1);
    renderEditorMediaGrid();
  }
}
window.removeEditorImage = removeEditorImage;

function setEditorPrimaryImage(idx) {
  if (!adminState.editorImages) return;
  if (idx > 0 && idx < adminState.editorImages.length) {
    const [chosen] = adminState.editorImages.splice(idx, 1);
    adminState.editorImages.unshift(chosen);
    renderEditorMediaGrid();
    showAdminToast('Set as main cover photo!', 'success');
  }
}
window.setEditorPrimaryImage = setEditorPrimaryImage;

function addEditorImageUrl() {
  const input = document.getElementById('editorImageUrl');
  if (!input) return;
  const url = input.value.trim();
  if (!url) {
    alert('Please enter an image URL or file path.');
    input.focus();
    return;
  }
  if (!adminState.editorImages) adminState.editorImages = [];
  adminState.editorImages.push(url);
  input.value = '';
  renderEditorMediaGrid();
  showAdminToast(`Added photo #${adminState.editorImages.length}!`, 'success');
}
window.addEditorImageUrl = addEditorImageUrl;

function handleEditorFilesSelect(e) {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;

  if (!adminState.editorImages) adminState.editorImages = [];

  let loaded = 0;
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      adminState.editorImages.push(evt.target.result);
      loaded++;
      if (loaded === files.length) {
        renderEditorMediaGrid();
        showAdminToast(`Added ${files.length} photo(s) to gallery!`, 'success');
      }
    };
    reader.readAsDataURL(file);
  });
  // Clear input so user can choose same files again if needed
  e.target.value = '';
}
window.handleEditorFilesSelect = handleEditorFilesSelect;

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

// ==========================================
// Product Variants Sector (Colors, Washes, Custom Prices)
// ==========================================

function toggleVariantForm(forceOpen = null) {
  const box = document.getElementById('variantFormBox');
  const btnIcon = document.getElementById('toggleVariantFormIcon');
  if (!box) return;

  const shouldOpen = forceOpen !== null ? forceOpen : box.style.display === 'none';
  box.style.display = shouldOpen ? 'block' : 'none';
  if (btnIcon) btnIcon.textContent = shouldOpen ? '−' : '+';

  if (shouldOpen) {
    renderVariantPresets();
    document.getElementById('variantInputName')?.focus();
  }
}
window.toggleVariantForm = toggleVariantForm;

function cancelVariantForm() {
  const box = document.getElementById('variantFormBox');
  const btnIcon = document.getElementById('toggleVariantFormIcon');
  if (box) box.style.display = 'none';
  if (btnIcon) btnIcon.textContent = '+';
  const idxInput = document.getElementById('variantEditIndex');
  if (idxInput) idxInput.value = '-1';
  const heading = document.getElementById('variantFormHeading');
  if (heading) heading.textContent = 'New Product Variant';
  const nameInput = document.getElementById('variantInputName');
  if (nameInput) nameInput.value = '';
  const priceInput = document.getElementById('variantInputPrice');
  if (priceInput) priceInput.value = '';
  const statusSel = document.getElementById('variantInputStatus');
  if (statusSel) statusSel.value = 'available';
  document.querySelectorAll('.var-size-cb').forEach(cb => { cb.checked = true; });
  syncActivePresetHighlight('');
}
window.cancelVariantForm = cancelVariantForm;

// ==========================================
// Dynamic Variant Presets Manager (Add & Delete)
// ==========================================

const DEFAULT_VARIANT_PRESETS = [
  'Washed Black',
  'Vintage Olive',
  'Oatmeal Beige',
  'Faded Navy',
  'Acid Wash',
  'Distressed White',
  'Earth Brown'
];

function getVariantPresets() {
  try {
    const saved = localStorage.getItem('auvare_variant_presets_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error reading variant presets', e);
  }
  return [...DEFAULT_VARIANT_PRESETS];
}

function saveVariantPresets(presets) {
  try {
    localStorage.setItem('auvare_variant_presets_v1', JSON.stringify(presets));
  } catch (e) {
    console.warn('Error saving variant presets', e);
  }
}

function syncActivePresetHighlight(activeName = '') {
  const norm = (activeName || '').trim().toLowerCase();
  document.querySelectorAll('.preset-pill-wrap').forEach(wrap => {
    const btn = wrap.querySelector('.preset-pill');
    if (btn) {
      const pName = btn.getAttribute('data-preset-name') || btn.textContent.trim();
      btn.classList.toggle('active', norm !== '' && pName.toLowerCase() === norm);
    }
  });
}

function renderVariantPresets() {
  const container = document.getElementById('variantPresetsContainer');
  if (!container) return;

  const presets = getVariantPresets();
  const activeInputVal = document.getElementById('variantInputName')?.value?.trim() || '';

  if (presets.length === 0) {
    container.innerHTML = `
      <span style="font-size:0.75rem; color:#94a3b8; font-style:italic;">
        No presets saved. Type in the box below to add your own, or click "Reset Defaults".
      </span>
    `;
    return;
  }

  container.innerHTML = presets.map((preset, idx) => {
    const isSelected = activeInputVal.toLowerCase() === preset.toLowerCase();
    // Escape single quotes for inline JS string
    const safeEscaped = preset.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const safeDisplay = preset.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    return `
      <div class="preset-pill-wrap" title="Click to auto-fill: ${safeDisplay}">
        <button 
          type="button" 
          class="preset-pill ${isSelected ? 'active' : ''}" 
          data-preset-name="${safeDisplay}"
          onclick="applyVariantPreset('${safeEscaped}')"
        >
          <span>${safeDisplay}</span>
        </button>
        <button 
          type="button" 
          class="preset-pill-del" 
          onclick="deleteVariantPreset(${idx}, event)" 
          title="Remove '${safeDisplay}' from presets"
          aria-label="Delete preset ${safeDisplay}"
        >
          &times;
        </button>
      </div>
    `;
  }).join('');
}
window.renderVariantPresets = renderVariantPresets;
window.syncActivePresetHighlight = syncActivePresetHighlight;

function applyVariantPreset(name) {
  const input = document.getElementById('variantInputName');
  if (input) {
    input.value = name;
    input.focus();
  }
  syncActivePresetHighlight(name);
}
window.applyVariantPreset = applyVariantPreset;

function addCustomPreset() {
  const input = document.getElementById('newPresetInput');
  if (!input) return;
  const val = input.value.trim();
  if (!val) {
    input.focus();
    return;
  }

  const presets = getVariantPresets();
  const exists = presets.some(p => p.toLowerCase() === val.toLowerCase());
  if (exists) {
    showAdminToast(`"${val}" preset already exists!`, 'info');
    applyVariantPreset(val);
    input.value = '';
    return;
  }

  presets.push(val);
  saveVariantPresets(presets);
  renderVariantPresets();
  applyVariantPreset(val);
  input.value = '';
  showAdminToast(`Added "${val}" to quick presets!`, 'success');
}
window.addCustomPreset = addCustomPreset;

function deleteVariantPreset(idx, e) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }
  const presets = getVariantPresets();
  if (idx < 0 || idx >= presets.length) return;
  const removed = presets.splice(idx, 1)[0];
  saveVariantPresets(presets);
  renderVariantPresets();
  showAdminToast(`Removed "${removed}" preset`, 'info');
}
window.deleteVariantPreset = deleteVariantPreset;

function resetVariantPresets() {
  saveVariantPresets([...DEFAULT_VARIANT_PRESETS]);
  renderVariantPresets();
  showAdminToast('Restored default presets!', 'success');
}
window.resetVariantPresets = resetVariantPresets;

function renderEditorVariantsList() {
  const container = document.getElementById('editorVariantsList');
  const badge = document.getElementById('editorVariantCountBadge');
  if (!container) return;

  const variants = adminState.editorVariants || [];
  const count = variants.length;

  if (badge) {
    badge.textContent = `${count} ${count === 1 ? 'variant' : 'variants'}`;
    badge.style.background = count > 0 ? '#ecfdf5' : '#f1f5f9';
    badge.style.color = count > 0 ? '#15803d' : '#475569';
    badge.style.borderColor = count > 0 ? '#86efac' : '#cbd5e1';
  }

  if (count === 0) {
    container.innerHTML = `
      <div class="variants-empty-state">
        <p style="margin:0 0 0.35rem 0; font-weight:700; color:#334155;">No extra variants added yet.</p>
        <p style="margin:0;">By default, this item is sold as a single drop edition. Click <strong>"+ Add Variant"</strong> above to add colorways, washes, or style variations.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = variants.map((v, idx) => {
    const isAvail = (v.status || 'available') === 'available';
    const displayPrice = v.price ? `৳ ${parseInt(v.price, 10).toLocaleString()}` : 'Default Price';
    const sizes = Array.isArray(v.sizes) && v.sizes.length > 0 ? v.sizes : ['All'];

    return `
      <div class="variant-row-card">
        <div class="variant-row-info">
          <span class="variant-badge-dot"></span>
          <div>
            <div class="variant-name-title">${v.name}</div>
            <div style="font-size:0.75rem; color:#64748b; margin-top:0.15rem;">
              Sizes: ${sizes.join(', ')}
            </div>
          </div>
          <span class="variant-price-tag">${displayPrice}</span>
          <span class="variant-status-chip ${isAvail ? 'available' : 'sold'}">
            ${isAvail ? 'In Stock' : 'Sold Out'}
          </span>
        </div>
        <div class="variant-actions">
          <button type="button" class="variant-btn-edit" onclick="editVariant(${idx})">✏️ Edit</button>
          <button type="button" class="variant-btn-del" onclick="deleteVariant(${idx})" title="Remove">✕</button>
        </div>
      </div>
    `;
  }).join('');
}
window.renderEditorVariantsList = renderEditorVariantsList;

function editVariant(idx) {
  const variants = adminState.editorVariants || [];
  const v = variants[idx];
  if (!v) return;

  document.getElementById('variantEditIndex').value = idx;
  document.getElementById('variantFormHeading').textContent = `Edit Variant: ${v.name}`;
  document.getElementById('variantInputName').value = v.name;
  document.getElementById('variantInputPrice').value = v.price || '';
  document.getElementById('variantInputStatus').value = v.status || 'available';

  const vSizes = v.sizes || ['S', 'M', 'L', 'XL', 'XXL'];
  document.querySelectorAll('.var-size-cb').forEach(cb => {
    cb.checked = vSizes.includes(cb.value);
  });

  toggleVariantForm(true);
}
window.editVariant = editVariant;

function deleteVariant(idx) {
  if (!adminState.editorVariants) return;
  const v = adminState.editorVariants[idx];
  adminState.editorVariants.splice(idx, 1);
  renderEditorVariantsList();
  showAdminToast(`Removed variant "${v?.name || ''}"`, 'info');
}
window.deleteVariant = deleteVariant;

function saveVariantFromForm() {
  const nameInput = document.getElementById('variantInputName');
  const priceInput = document.getElementById('variantInputPrice');
  const statusSelect = document.getElementById('variantInputStatus');
  const editIndex = parseInt(document.getElementById('variantEditIndex')?.value || '-1', 10);

  const name = nameInput?.value.trim();
  if (!name) {
    alert('Please enter a variant name (e.g. Washed Black).');
    nameInput?.focus();
    return;
  }

  const selectedSizes = [];
  document.querySelectorAll('.var-size-cb:checked').forEach(cb => selectedSizes.push(cb.value));
  if (selectedSizes.length === 0) selectedSizes.push('M');

  const customPrice = priceInput?.value ? parseInt(priceInput.value, 10) : null;
  const status = statusSelect?.value || 'available';

  if (!adminState.editorVariants) adminState.editorVariants = [];

  if (editIndex >= 0 && editIndex < adminState.editorVariants.length) {
    adminState.editorVariants[editIndex] = {
      ...adminState.editorVariants[editIndex],
      name,
      price: customPrice,
      sizes: selectedSizes,
      status
    };
    showAdminToast(`Updated variant "${name}"!`, 'success');
  } else {
    const newVariant = {
      id: 'var_' + Date.now(),
      name,
      price: customPrice,
      sizes: selectedSizes,
      status
    };
    adminState.editorVariants.push(newVariant);
    showAdminToast(`Added variant "${name}"!`, 'success');
  }

  cancelVariantForm();
  renderEditorVariantsList();
}
window.saveVariantFromForm = saveVariantFromForm;

// Save / Publish from Shopify Editor with Multi-Image & Multi-Variant Support
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

  // Resolve multiple images
  const images = [...(adminState.editorImages || [])];
  const pendingUrl = document.getElementById('editorImageUrl')?.value.trim();
  if (pendingUrl && !images.includes(pendingUrl)) {
    images.push(pendingUrl);
  }

  // Cover image: 1st image from array or default box-box pattern SVG
  const primaryImage = images.length > 0 ? images[0] : DEFAULT_BOX_PLACEHOLDER;
  const finalImages = images.length > 0 ? images : [primaryImage];

  // Resolve variants
  const variants = [...(adminState.editorVariants || [])];

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
      item.image = primaryImage;
      item.images = finalImages;
      item.variants = variants;
      item.description = description;

      saveProducts();
      renderInventoryTable();
      renderStats();
      renderCategoriesView();
      renderHomeDashboard();
      closeProductEditor();

      if (window.SupabaseService) {
        await window.SupabaseService.updateProduct(editId, {
          title, category, price, chest, length, condition, sold, sizes: selectedSizes, image: primaryImage, images: finalImages, variants, description
        });
      }
      showAdminToast(`Updated "${title}" successfully! (${finalImages.length} photos, ${variants.length} variants)`, 'success');
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
      image: primaryImage,
      images: finalImages,
      variants,
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
      try {
        const saver = window.SupabaseService.saveProduct || window.SupabaseService.insertProduct;
        if (saver) {
          await saver(newProduct);
        }
      } catch (err) {
        console.warn('Supabase product cloud insert error:', err);
      }
    }
    showAdminToast(`Published "${title}" to online catalog! (${finalImages.length} photos, ${variants.length} variants)`, 'success');
  }
}
window.handleSaveProductEditor = handleSaveProductEditor;
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

  // Render Mobile Users Card List for mobile screens
  const mobileContainer = document.getElementById('usersMobileCardList');
  if (mobileContainer) {
    if (activeUsers.length === 0) {
      mobileContainer.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; background: #ffffff; border-radius: var(--radius-md); border: 1px solid var(--admin-border); color: var(--admin-text-muted);">
          No users registered yet.
        </div>
      `;
    } else {
      mobileContainer.innerHTML = activeUsers.map(u => {
        const isUserSuperAdmin = u.role === 'super_admin';
        return `
          <div class="mobile-user-card">
            <div class="mobile-user-card-header">
              <div>
                <div class="mobile-user-email">
                  ${u.display_name || u.email}
                  ${isUserSuperAdmin ? '<span class="owner-pill-tag" style="margin-left:0.25rem;">Owner</span>' : ''}
                </div>
                <div class="mobile-user-date">${u.email} • Joined ${formatJoinedDate(u.created_at)}</div>
              </div>
              <div class="mobile-user-badges">
                <span class="badge-role ${u.role}">${u.role === 'super_admin' ? 'Super Admin' : (u.role === 'admin' ? 'Admin' : 'Customer')}</span>
                <span class="premium-status-pill ${u.status}">${u.status === 'approved' ? 'Approved' : (u.status === 'blocked' ? 'Blocked' : 'Pending Review')}</span>
              </div>
            </div>
            ${userIsSuper && !isUserSuperAdmin ? `
              <div class="mobile-user-actions">
                ${u.status === 'blocked' ? `
                  <button class="btn-premium-unblock" style="background:#2563eb; color:white; border:none; border-radius:4px; font-weight:700; cursor:pointer;" onclick="unblockUser('${u.id}', '${u.display_name}')">Unblock</button>
                ` : u.status === 'pending' ? `
                  <button class="btn-premium-approve" onclick="approveUser('${u.id}', '${u.display_name}')">Approve</button>
                  <button class="btn-premium-reject" onclick="openRejectModal('${u.id}', '${u.display_name}', '${u.email}')">Reject</button>
                ` : `
                  <button class="btn-premium-reject" onclick="openRejectModal('${u.id}', '${u.display_name}', '${u.email}')">Reject</button>
                `}
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
    }
  }
}

// Approve User Admin Request (AUVARE Branded Modal)
function approveUser(userId, name) {
  if (!isSuperAdmin()) {
    showAdminToast('Access Denied: Super Admin authority is required.', 'error');
    return;
  }

  showBrandedConfirm({
    title: 'Authorize Admin Access?',
    metaSub: 'STAFF CONTROL • PRIVILEGE ELEVATION',
    badgeText: 'AUTHORIZE ADMIN',
    itemName: name,
    itemImage: 'assets/images/logo.jpg',
    itemMeta: 'Super Admin Authority • Full Catalog & Orders Access',
    warningText: `Are you sure you want to approve "${name}" as an Admin? They will have full access to manage stock and view orders.`,
    confirmBtnText: 'Approve Admin',
    cancelBtnText: 'Cancel',
    isDestructive: false,
    onConfirm: async () => {
      if (window.SupabaseService) {
        const updated = await window.SupabaseService.updateUserStatus(userId, 'approved', 'admin');
        if (updated) {
          showAdminToast(`"${name}" approved as Admin successfully!`, 'success');
          loadAuthUsersTable();
        }
      }
    }
  });
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

// Unblock User (AUVARE Branded Modal)
function unblockUser(userId, name) {
  if (!isSuperAdmin()) {
    showAdminToast('Access Denied: Super Admin authority is required.', 'error');
    return;
  }

  showBrandedConfirm({
    title: 'Unblock User Account?',
    metaSub: 'STAFF CONTROL • RESTORE ACCESS',
    badgeText: 'UNBLOCK USER',
    itemName: name,
    itemImage: 'assets/images/logo.jpg',
    itemMeta: 'Restores ability to submit access requests',
    warningText: `Are you sure you want to unblock "${name}"? They will be allowed to submit access requests again.`,
    confirmBtnText: 'Unblock Account',
    cancelBtnText: 'Cancel',
    isDestructive: false,
    onConfirm: async () => {
      if (window.SupabaseService) {
        const updated = await window.SupabaseService.unblockUser(userId);
        if (updated) {
          showAdminToast(`"${name}" has been unblocked.`, 'success');
          loadAuthUsersTable();
        }
      }
    }
  });
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
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('open');
    document.body.classList.add('modal-open');
    const toast = document.getElementById('adminToast');
    if (toast) toast.remove();
  }
  if (id === 'adminAuthGate') {
    document.body.classList.add('auth-gate-active');
  }
}

function closeAdminModal(id) {
  document.getElementById(id)?.classList.remove('open');
  if (!document.querySelector('.admin-modal-overlay.open')) {
    document.body.classList.remove('modal-open');
  }
  if (id === 'adminAuthGate') {
    document.body.classList.remove('auth-gate-active');
  }
}

// Toast
function showAdminToast(message, type = 'info') {
  if (document.body.classList.contains('modal-open') || document.querySelector('.admin-modal-overlay.open')) {
    return; // Do not display toast over active modals
  }
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
    padding: 0.85rem 1.25rem;
    border-radius: var(--radius-sm);
    font-size: 0.85rem;
    font-weight: 500;
    box-shadow: 0 10px 25px rgba(0,0,0,0.25);
    z-index: 95;
    opacity: 0;
    transition: all 0.25s ease;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    border-left: 4px solid var(--admin-primary);
    pointer-events: none;
  `;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : 'ℹ'}</span> <span>${message}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => { toast.style.opacity = '1'; }, 10);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 250);
  }, 2400);
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


// Global Escape Key Listener for Modals
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const openModals = document.querySelectorAll('.admin-modal-overlay.open');
    openModals.forEach(m => {
      if (m.id !== 'adminAuthGate') {
        closeAdminModal(m.id);
      }
    });
  }
});
