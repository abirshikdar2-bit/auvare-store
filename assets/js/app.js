/**
 * AUVARE - Vintage & Pre-loved Clothing Store
 * Core Interactive Application Logic
 * Supports Multi-Size Selection (S, M, L, XL, XXL) & Supabase Cloud Sync
 */

// Default Seed Products with S, M, L, XL, XXL Sizes
const DEFAULT_PRODUCTS = [
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

// App State
const state = {
  products: [],
  cart: [],
  selectedSizes: {}, // Maps productId -> selected size (default 'M')
  activeCategory: 'All',
  activeStatus: 'all',
  activeSize: 'all',
  searchQuery: '',
  isAdmin: false,
  deliveryZone: 'inside', // 'inside' = 70, 'outside' = 130
  selectedPayment: 'cod'
};

// Dynamic Store Contacts with Supabase Sync
let storeContactInfo = {
  whatsapp_number: '01734018155',
  bkash_number: '01734018155',
  nagad_number: '01734018155',
  instagram_handle: '@auvare_official',
  instagram_url: 'https://www.instagram.com/auvare_official/'
};

function getCleanWaNumber(numStr) {
  if (!numStr) return '8801734018155';
  let cleaned = numStr.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('01')) cleaned = '88' + cleaned;
  else if (!cleaned.startsWith('88') && cleaned.length === 10) cleaned = '880' + cleaned;
  return cleaned || '8801734018155';
}

// Load Store Contacts from Supabase
async function loadStoreContacts() {
  if (window.SupabaseService) {
    try {
      const data = await window.SupabaseService.getStoreContactInfo();
      if (data) {
        storeContactInfo = { ...storeContactInfo, ...data };
      }
    } catch (e) {
      console.warn('loadStoreContacts fallback:', e);
    }
  }

  const cleanWa = getCleanWaNumber(storeContactInfo.whatsapp_number);

  // Update floating WhatsApp link
  const floatWa = document.querySelector('.floating-wa-btn');
  if (floatWa) {
    floatWa.href = `https://wa.me/${cleanWa}?text=Hi%20AUVARE,%20I%20am%20browsing%20your%20website%20and%20want%20to%20know%20more%20about%20your%20clothes.`;
  }

  // Update Hero "Chat on WhatsApp" CTA button
  const heroWa = document.querySelector('.btn-wa-cta');
  if (heroWa) {
    heroWa.href = `https://wa.me/${cleanWa}?text=Hello%20AUVARE,%20I%20want%20to%20inquire%20about%20your%20drops!`;
  }

  // Update ANY other wa.me links on the entire page
  document.querySelectorAll('a[href*="wa.me"]').forEach(a => {
    if (a !== floatWa && a !== heroWa) {
      a.href = a.href.replace(/wa\.me\/[0-9]+/, `wa.me/${cleanWa}`);
    }
  });

  // Update Hero & Instagram links
  const igHandles = document.querySelectorAll('.ig-handle');
  igHandles.forEach(el => { el.textContent = storeContactInfo.instagram_handle; });

  const igLinks = document.querySelectorAll('a[href*="instagram.com"]');
  igLinks.forEach(el => {
    if (storeContactInfo.instagram_url) el.href = storeContactInfo.instagram_url;
  });
}

// Initialize App
async function initApp() {
  // Force manual scroll restoration so browser refresh always returns to homepage top
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  if (window.location.hash) {
    history.replaceState(null, null, window.location.pathname + window.location.search);
  }
  window.scrollTo(0, 0);

  await loadStoreContacts();
  await loadProducts();
  loadCart();
  renderProducts();
  setupEventListeners();
  updateCartUI();

  // Ensure Home is default active
  const homeLink = document.querySelector('#mainNavLinks .nav-link[data-target="hero"]');
  if (homeLink) {
    document.querySelectorAll('#mainNavLinks .nav-link').forEach(l => l.classList.remove('active'));
    homeLink.classList.add('active');
  }

  // Initialize nav underline indicator position
  setTimeout(() => {
    updateNavIndicator(null, true);
  }, 60);

  if (document.fonts) {
    document.fonts.ready.then(() => {
      updateNavIndicator(null, true);
    });
  }
}

// Storage helpers with Supabase cloud sync
async function loadProducts() {
  // Check Supabase first
  if (window.SupabaseService && window.SupabaseService.isConfigured()) {
    try {
      const cloudProducts = await window.SupabaseService.getProducts();
      if (cloudProducts && cloudProducts.length > 0) {
        state.products = cloudProducts;
        return;
      }
    } catch (err) {
      console.warn('Supabase product fetch failed, fallback to local storage:', err);
    }
  }

  // Fallback to LocalStorage
  const saved = localStorage.getItem('auvare_inventory_v1');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Ensure sizes array exists
      state.products = parsed.map(p => ({
        ...p,
        sizes: p.sizes || ['S', 'M', 'L', 'XL', 'XXL']
      }));
    } catch (e) {
      state.products = [...DEFAULT_PRODUCTS];
    }
  } else {
    state.products = [...DEFAULT_PRODUCTS];
    saveProducts();
  }
}

function saveProducts() {
  localStorage.setItem('auvare_inventory_v1', JSON.stringify(state.products));
}

function loadCart() {
  const saved = localStorage.getItem('auvare_cart_v1');
  if (saved) {
    try {
      state.cart = JSON.parse(saved);
    } catch (e) {
      state.cart = [];
    }
  }
}

function saveCart() {
  localStorage.setItem('auvare_cart_v1', JSON.stringify(state.cart));
}

// Handle size chip selection
function selectCardSize(productId, size) {
  state.selectedSizes[productId] = size;
  
  // Re-highlight clicked chip immediately in DOM
  const card = document.querySelector(`.product-card[data-id="${productId}"]`);
  if (card) {
    card.querySelectorAll('.size-chip').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.size === size);
    });
    const sizePill = card.querySelector('.selected-size-text');
    if (sizePill) sizePill.textContent = `Size: ${size}`;
  }
}

// Render Products Grid
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const countLabel = document.getElementById('itemCount');
  
  if (!grid) return;

  // Dynamically sync Hero Featured Card with live product data
  const heroFeatured = state.products.find(p => p.id === 'auv-1') || state.products[0];
  if (heroFeatured) {
    const heroPriceEl = document.getElementById('heroFeaturedPrice');
    const heroTitleEl = document.getElementById('heroFeaturedTitle');
    const heroSubEl = document.getElementById('heroFeaturedSub');
    if (heroPriceEl && heroFeatured.price) heroPriceEl.textContent = `৳ ${heroFeatured.price.toLocaleString()}`;
    if (heroTitleEl && heroFeatured.title) heroTitleEl.textContent = heroFeatured.title;
    if (heroSubEl) heroSubEl.textContent = `Chest: ${heroFeatured.chest || '38"'} • L: ${heroFeatured.length || '24"'} • ${heroFeatured.condition || '9.5/10 Mint'}`;
  }

  const filtered = state.products.filter(item => {
    // Category Filter
    if (state.activeCategory !== 'All' && item.category !== state.activeCategory) {
      return false;
    }
    // Status Filter
    if (state.activeStatus === 'available' && item.sold) return false;
    if (state.activeStatus === 'sold' && !item.sold) return false;
    
    // Size Filter
    if (state.activeSize !== 'all') {
      const availableSizes = item.sizes || ['S', 'M', 'L', 'XL', 'XXL'];
      if (!availableSizes.includes(state.activeSize)) return false;
    }

    // Search Query
    if (state.searchQuery.trim() !== '') {
      const q = state.searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      if (!matchTitle && !matchCat) return false;
    }

    return true;
  });

  if (countLabel) {
    countLabel.textContent = `${filtered.length} piece${filtered.length === 1 ? '' : 's'} available in this drop`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: var(--color-surface); border-radius: var(--radius-lg); border: 1px dashed var(--color-border);">
        <p style="font-size: 1.25rem; font-weight: 600; color: var(--color-text-main); margin-bottom: 0.5rem;">No drops match your filter</p>
        <p style="font-size: 0.9rem; color: var(--color-text-muted); margin-bottom: 1.5rem;">Try resetting your filters or select a different size.</p>
        <button class="btn-secondary" onclick="resetFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  const allSizes = ['S', 'M', 'L', 'XL', 'XXL'];

  grid.innerHTML = filtered.map(item => {
    const itemSizes = item.sizes || allSizes;
    const currentSelectedSize = state.selectedSizes[item.id] || itemSizes[0] || 'M';

    return `
      <article class="product-card ${item.sold ? 'sold-out' : ''}" data-id="${item.id}">
        <div class="product-image-box">
          <img class="product-card-img" src="${item.image}" alt="${item.title}" loading="lazy" />
          
          <div class="product-badge-group">
            <span class="badge-tag unique">Curated Drop</span>
            ${item.sold ? '<span class="badge-tag sold">SOLD OUT</span>' : '<span class="badge-tag condition">' + (item.condition ? item.condition.split('(')[0].trim() : 'Mint') + '</span>'}
          </div>

          ${state.isAdmin ? `
            <div class="admin-card-bar">
              <button class="btn-admin-action" onclick="toggleSoldState('${item.id}')" title="Toggle Sold Status">
                ${item.sold ? '✓ Mark Available' : '✕ Mark Sold'}
              </button>
              <button class="btn-admin-action btn-admin-delete" onclick="deleteProduct('${item.id}')" title="Delete Product">
                🗑
              </button>
            </div>
          ` : ''}
        </div>

        <div class="product-info">
          <div class="product-meta-row">
            <span>${item.category}</span>
            <span class="product-measurements">${item.chest ? 'Chest: ' + item.chest : 'All Sizes Available'}</span>
          </div>

          <h3 class="product-title">${item.title}</h3>

          <!-- S, M, L, XL, XXL Size Selector -->
          <div class="product-sizes-selector">
            <span class="sizes-label">Select Size:</span>
            <div class="size-chips-group">
              ${itemSizes.map(sz => `
                <button 
                  type="button" 
                  class="size-chip ${currentSelectedSize === sz ? 'active' : ''}" 
                  data-size="${sz}"
                  onclick="selectCardSize('${item.id}', '${sz}')"
                  title="Size ${sz}"
                >
                  ${sz}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="product-price-row">
            <span class="price-current">৳ ${item.price.toLocaleString()}</span>
            <span class="size-pill selected-size-text">Size: ${currentSelectedSize}</span>
          </div>

          <div class="product-actions-grid">
            <button 
              class="btn-add-bag" 
              onclick="addToCart('${item.id}')" 
              ${item.sold ? 'disabled' : ''}
            >
              ${item.sold ? 'Sold Out' : 'Add to Bag'}
            </button>
            
            <button 
              class="btn-wa-card" 
              onclick="orderOnWhatsApp('${item.id}')" 
              title="Order directly on WhatsApp"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// ==========================================================================
// STOREFRONT HEADER NAVIGATION INDICATOR & CATEGORY FILTERING
// ==========================================================================

function updateNavIndicator(targetElement, immediate = false) {
  const navContainer = document.getElementById('mainNavLinks');
  const indicator = document.getElementById('navSliderIndicator');
  if (!navContainer || !indicator) return;

  const target = targetElement || navContainer.querySelector('.nav-link.active');
  if (!target) {
    indicator.style.opacity = '0';
    return;
  }

  const containerRect = navContainer.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  if (containerRect.width === 0 || targetRect.width === 0) {
    indicator.style.opacity = '0';
    return;
  }

  const left = targetRect.left - containerRect.left;
  const width = targetRect.width;

  if (immediate) {
    indicator.style.transition = 'none';
    indicator.style.left = `${left}px`;
    indicator.style.width = `${width}px`;
    indicator.style.opacity = '1';
    void indicator.offsetWidth;
    indicator.style.transition = '';
  } else {
    indicator.style.left = `${left}px`;
    indicator.style.width = `${width}px`;
    indicator.style.opacity = '1';
  }
}
window.updateNavIndicator = updateNavIndicator;

function setCategoryFilter(category) {
  state.activeCategory = category;

  // 1. Sync catalog filter pills
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.category === category);
  });

  // 2. Sync header nav links
  const navLinks = document.querySelectorAll('#mainNavLinks .nav-link');
  navLinks.forEach(link => {
    const isMatch = link.dataset.category === category;
    link.classList.toggle('active', isMatch);
  });

  // 3. Move sliding indicator to active category
  updateNavIndicator();

  // 4. Render filtered catalog
  renderProducts();
}
window.setCategoryFilter = setCategoryFilter;

// Reset Filters
function resetFilters() {
  state.activeCategory = 'All';
  state.activeStatus = 'all';
  state.activeSize = 'all';
  state.searchQuery = '';
  
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  document.querySelector('.filter-pill[data-category="All"]')?.classList.add('active');
  
  const navLinks = document.querySelectorAll('#mainNavLinks .nav-link');
  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.category === 'All');
  });
  updateNavIndicator();

  const statusSel = document.getElementById('statusFilter');
  if (statusSel) statusSel.value = 'all';
  
  const sizeSel = document.getElementById('sizeFilter');
  if (sizeSel) sizeSel.value = 'all';

  const searchInp = document.getElementById('searchInput');
  if (searchInp) searchInp.value = '';

  renderProducts();
}

// Cart Logic
function addToCart(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product || product.sold) return;

  const chosenSize = state.selectedSizes[productId] || (product.sizes ? product.sizes[0] : 'M');
  const cartItemId = `${productId}-${chosenSize}`;

  const existing = state.cart.find(item => item.cartItemId === cartItemId);
  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
    saveCart();
    updateCartUI();
    openCart();
    showToast(`Updated quantity for "${product.title}" (${chosenSize})!`, 'info');
    return;
  }

  state.cart.push({
    ...product,
    cartItemId,
    selectedSize: chosenSize,
    quantity: 1
  });
  saveCart();
  updateCartUI();
  openCart();
  showToast(`Added "${product.title}" [Size: ${chosenSize}] to bag!`, 'success');
}

function removeFromCart(cartItemId) {
  state.cart = state.cart.filter(item => item.cartItemId !== cartItemId && item.id !== cartItemId);
  saveCart();
  updateCartUI();
}

function updateCartUI() {
  const badge = document.getElementById('cartBadge');
  const itemsContainer = document.getElementById('cartItems');
  const subtotalEl = document.getElementById('cartSubtotal');
  const shippingEl = document.getElementById('cartShipping');
  const totalEl = document.getElementById('cartTotal');

  if (badge) badge.textContent = state.cart.length;

  if (!itemsContainer) return;

  if (state.cart.length === 0) {
    itemsContainer.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; color: var(--color-text-muted);">
        <p style="font-size: 2.5rem; margin-bottom: 0.5rem;">🛍️</p>
        <p style="font-size: 1.1rem; font-weight: 600; color: var(--color-text-main); margin-bottom: 0.25rem;">Your bag is empty</p>
        <p style="font-size: 0.85rem;">Discover our latest S, M, L, XL, XXL drops and select your size!</p>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = '৳ 0';
    if (shippingEl) shippingEl.textContent = '৳ 0';
    if (totalEl) totalEl.textContent = '৳ 0';
    return;
  }

  itemsContainer.innerHTML = state.cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.title}" class="cart-item-img" />
      <div class="cart-item-info">
        <h4 class="cart-item-title">${item.title}</h4>
        <div class="cart-item-meta">
          <strong style="color:var(--color-primary); background:var(--color-primary-soft); padding:0.1rem 0.4rem; border-radius:3px;">
            Size: ${item.selectedSize || item.size || 'M'}
          </strong>
          ${item.quantity > 1 ? ` • Qty: ${item.quantity}` : ''}
        </div>
        <div class="cart-item-price">৳ ${(item.price * (item.quantity || 1)).toLocaleString()}</div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.cartItemId || item.id}')">Remove item</button>
      </div>
    </div>
  `).join('');

  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const shipping = state.deliveryZone === 'inside' ? 70 : 130;
  const total = subtotal + shipping;

  if (subtotalEl) subtotalEl.textContent = `৳ ${subtotal.toLocaleString()}`;
  if (shippingEl) shippingEl.textContent = `৳ ${shipping.toLocaleString()}`;
  if (totalEl) totalEl.textContent = `৳ ${total.toLocaleString()}`;
}

function openCart() {
  document.getElementById('cartOverlay')?.classList.add('open');
  document.getElementById('cartDrawer')?.classList.add('open');
}

function closeCart() {
  document.getElementById('cartOverlay')?.classList.remove('open');
  document.getElementById('cartDrawer')?.classList.remove('open');
}

// WhatsApp Direct Order Action
function orderOnWhatsApp(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const chosenSize = state.selectedSizes[productId] || (product.sizes ? product.sizes[0] : 'M');

  const msg = encodeURIComponent(
    `Hello AUVARE! 🇧🇩 I want to order this piece:\n\n` +
    `• Product: ${product.title}\n` +
    `• Selected Size: ${chosenSize} (Available: S, M, L, XL, XXL)\n` +
    `• Price: ৳${product.price}\n\n` +
    `Please confirm my order for Size ${chosenSize}!`
  );

  const waNum = getCleanWaNumber(storeContactInfo.whatsapp_number);
  window.open(`https://wa.me/${waNum}?text=${msg}`, '_blank');
}

// Checkout Modal & Processing
function openCheckoutModal() {
  if (state.cart.length === 0) {
    showToast('Your bag is empty! Add an item before checking out.', 'info');
    return;
  }
  closeCart();
  
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const shipping = state.deliveryZone === 'inside' ? 70 : 130;
  const total = subtotal + shipping;

  document.getElementById('checkoutSummaryText').textContent = 
    `${state.cart.length} item(s) • Total: ৳${total.toLocaleString()}`;
  
  openModal('checkoutModal');
}

function handleDeliveryZoneChange(zone) {
  state.deliveryZone = zone;
  updateCartUI();
  
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const shipping = zone === 'inside' ? 70 : 130;
  const total = subtotal + shipping;

  document.getElementById('checkoutSummaryText').textContent = 
    `${state.cart.length} item(s) • Total: ৳${total.toLocaleString()}`;
}

function selectPaymentMethod(method) {
  state.selectedPayment = method;
  
  document.querySelectorAll('.payment-method-card').forEach(c => c.classList.remove('selected'));
  document.getElementById(`payCard_${method}`)?.classList.add('selected');

  const instructionsBox = document.getElementById('paymentInstructions');
  if (!instructionsBox) return;

  switch (method) {
    case 'cod':
      instructionsBox.innerHTML = `
        <h5 style="font-weight:700; color:var(--color-primary); margin-bottom:0.35rem;">💵 Cash on Delivery (ক্যাশ অন ডেলিভারি)</h5>
        <p style="font-size:0.85rem; color:var(--color-text-muted);">
          পণ্য ডেলিভারিম্যানের কাছ থেকে বুঝে পেয়ে সম্পূর্ণ টাকা নগদ পরিশোধ করুন। ডেলিভারির সময় পার্সেল চেক করার সুযোগ থাকবে।
        </p>
      `;
      break;

    case 'bkash': {
      const bkashNum = storeContactInfo.bkash_number || '01700-000000';
      instructionsBox.innerHTML = `
        <h5 style="font-weight:700; color:#e2136e; margin-bottom:0.35rem;">bKash Personal / Merchant Send Money</h5>
        <div style="font-size:0.85rem; color:var(--color-text-muted); margin-bottom:0.75rem;">
          বিকাশ নম্বর:
          <div style="display:inline-flex; align-items:center; gap:0.5rem; background:rgba(226, 19, 110, 0.08); padding:0.25rem 0.65rem; border-radius:6px; border:1px solid rgba(226, 19, 110, 0.2); margin:0.35rem 0;">
            <strong style="color:#e2136e; font-size:1.05rem; letter-spacing:0.04em;">${bkashNum}</strong>
            <button type="button" class="btn-copy-number" onclick="copyPaymentNumber('${bkashNum}', this)" title="Copy bKash Number" style="display:inline-flex; align-items:center; gap:0.25rem; font-size:0.75rem; font-weight:700; background:#e2136e; color:white; border:none; padding:0.25rem 0.55rem; border-radius:4px; cursor:pointer; transition:all 0.2s ease;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              <span>Copy</span>
            </button>
          </div>
          <br>
          টাকা সেন্ড মানি করে নিচের বক্সে আপনার প্রেরক বিকাশ নম্বর ও Transaction ID (TrxID) প্রদান করুন।
        </div>
        <div class="form-row">
          <input type="text" class="form-input" id="trxIdInput" placeholder="bKash TrxID (যেমন: 9J3K8LM2)" required />
          <input type="text" class="form-input" id="senderPhoneInput" placeholder="যে বিকাশ নম্বর থেকে টাকা পাঠিয়েছেন *" required />
        </div>
      `;
      break;
    }

    case 'nagad': {
      const nagadNum = storeContactInfo.nagad_number || '01700-000000';
      instructionsBox.innerHTML = `
        <h5 style="font-weight:700; color:#f7941d; margin-bottom:0.35rem;">Nagad Send Money</h5>
        <div style="font-size:0.85rem; color:var(--color-text-muted); margin-bottom:0.75rem;">
          নগদ নম্বর:
          <div style="display:inline-flex; align-items:center; gap:0.5rem; background:rgba(247, 148, 29, 0.08); padding:0.25rem 0.65rem; border-radius:6px; border:1px solid rgba(247, 148, 29, 0.2); margin:0.35rem 0;">
            <strong style="color:#d97706; font-size:1.05rem; letter-spacing:0.04em;">${nagadNum}</strong>
            <button type="button" class="btn-copy-number" onclick="copyPaymentNumber('${nagadNum}', this)" title="Copy Nagad Number" style="display:inline-flex; align-items:center; gap:0.25rem; font-size:0.75rem; font-weight:700; background:#d97706; color:white; border:none; padding:0.25rem 0.55rem; border-radius:4px; cursor:pointer; transition:all 0.2s ease;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              <span>Copy</span>
            </button>
          </div>
          <br>
          টাকা পাঠিয়ে নিচের বক্সে আপনার প্রেরক নগদ নম্বর ও Transaction ID লিখুন।
        </div>
        <div class="form-row">
          <input type="text" class="form-input" id="trxIdInput" placeholder="Nagad TrxID" required />
          <input type="text" class="form-input" id="senderPhoneInput" placeholder="যে নগদ নম্বর থেকে টাকা পাঠিয়েছেন *" required />
        </div>
      `;
      break;
    }

    case 'rocket': {
      const rocketNum = storeContactInfo.bkash_number ? `${storeContactInfo.bkash_number}-8` : '01700-000000-8';
      instructionsBox.innerHTML = `
        <h5 style="font-weight:700; color:#8c3494; margin-bottom:0.35rem;">Dutch-Bangla Rocket</h5>
        <div style="font-size:0.85rem; color:var(--color-text-muted); margin-bottom:0.75rem;">
          রকেট নম্বর:
          <div style="display:inline-flex; align-items:center; gap:0.5rem; background:rgba(140, 52, 148, 0.08); padding:0.25rem 0.65rem; border-radius:6px; border:1px solid rgba(140, 52, 148, 0.2); margin:0.35rem 0;">
            <strong style="color:#8c3494; font-size:1.05rem; letter-spacing:0.04em;">${rocketNum}</strong>
            <button type="button" class="btn-copy-number" onclick="copyPaymentNumber('${rocketNum}', this)" title="Copy Rocket Number" style="display:inline-flex; align-items:center; gap:0.25rem; font-size:0.75rem; font-weight:700; background:#8c3494; color:white; border:none; padding:0.25rem 0.55rem; border-radius:4px; cursor:pointer; transition:all 0.2s ease;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              <span>Copy</span>
            </button>
          </div>
          <br>
          টাকা পাঠিয়ে Transaction ID ও প্রেরক নম্বর নিচে লিখুন।
        </div>
        <div class="form-row">
          <input type="text" class="form-input" id="trxIdInput" placeholder="Rocket TrxID" required />
          <input type="text" class="form-input" id="senderPhoneInput" placeholder="যে রকেট নম্বর থেকে টাকা পাঠিয়েছেন *" required />
        </div>
      `;
      break;
    }

    case 'bank': {
      const bankAcc = '1102938475001';
      instructionsBox.innerHTML = `
        <h5 style="font-weight:700; color:#1e40af; margin-bottom:0.35rem;">Bank Transfer (সরাসরি ব্যাংক ডিপোজিট)</h5>
        <div style="font-size:0.85rem; color:var(--color-text-muted); margin-bottom:0.75rem;">
          Bank Name: <strong>City Bank PLC / BRAC Bank</strong><br>
          Account Name: <strong>AUVARE VINTAGE STORE</strong><br>
          Account No: 
          <div style="display:inline-flex; align-items:center; gap:0.5rem; background:rgba(30, 64, 175, 0.08); padding:0.2rem 0.55rem; border-radius:6px; border:1px solid rgba(30, 64, 175, 0.2); margin:0.2rem 0;">
            <strong style="color:#1e40af; font-size:1rem; letter-spacing:0.04em;">${bankAcc}</strong>
            <button type="button" class="btn-copy-number" onclick="copyPaymentNumber('${bankAcc}', this)" title="Copy Account No" style="display:inline-flex; align-items:center; gap:0.25rem; font-size:0.72rem; font-weight:700; background:#1e40af; color:white; border:none; padding:0.2rem 0.45rem; border-radius:4px; cursor:pointer;">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              <span>Copy</span>
            </button>
          </div>
          | Branch: <strong>Gulshan / Khulna</strong>
        </div>
        <div class="form-row">
          <input type="text" class="form-input" id="trxIdInput" placeholder="Deposit Slip Ref / TrxID" required />
          <input type="text" class="form-input" id="senderPhoneInput" placeholder="প্রেরকের নাম অথবা ফোন নম্বর *" required />
        </div>
      `;
      break;
    }
  }
}

// 1-Click Copy Payment Number with feedback
function copyPaymentNumber(text, btn) {
  if (!text) return;
  const cleanNumber = text.replace(/[^0-9+-]/g, '') || text;

  const showSuccess = () => {
    if (btn) {
      const originalHTML = btn.innerHTML;
      btn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <span>Copied! ✓</span>
      `;
      btn.style.background = '#16a34a';
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = '';
      }, 2000);
    }
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(cleanNumber).then(showSuccess).catch(() => {
      fallbackCopy(cleanNumber);
      showSuccess();
    });
  } else {
    fallbackCopy(cleanNumber);
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
window.copyPaymentNumber = copyPaymentNumber;

async function handleCheckoutSubmit(e) {
  e.preventDefault();
  
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  const notes = document.getElementById('custNotes').value.trim();
  const trxId = document.getElementById('trxIdInput')?.value.trim() || null;
  const senderPhone = document.getElementById('senderPhoneInput')?.value.trim() || null;
  
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const shipping = state.deliveryZone === 'inside' ? 70 : 130;
  const total = subtotal + shipping;
  const orderId = 'AUV-' + Math.floor(100000 + Math.random() * 900000);

  const orderedSizes = state.cart.map(c => c.selectedSize || c.size || 'M').join(', ') || 'M';

  const orderData = {
    orderId,
    name,
    phone,
    address,
    notes,
    items: state.cart.map(c => ({ title: c.title, size: c.selectedSize || c.size || 'M', price: c.price, quantity: c.quantity || 1 })),
    deliveryZone: state.deliveryZone,
    paymentMethod: state.selectedPayment,
    paymentNumber: senderPhone,
    paymentSenderNumber: senderPhone,
    trxId,
    size: orderedSizes,
    subtotal,
    shipping,
    total,
    orderStatus: 'pending',
    date: new Date().toLocaleString()
  };

  // 1. Save to Supabase Cloud if configured
  if (window.SupabaseService) {
    try {
      await window.SupabaseService.insertOrder(orderData);
    } catch (err) {
      console.warn('Supabase insertOrder error:', err);
    }
  }

  // 2. Save locally for instantaneous fallback
  try {
    const existingOrders = JSON.parse(localStorage.getItem('auvare_orders_v1') || '[]');
    existingOrders.unshift(orderData);
    localStorage.setItem('auvare_orders_v1', JSON.stringify(existingOrders));
  } catch (err) {
    console.error('Failed to save order to localStorage', err);
  }

  // Create WhatsApp message string for easy brother dispatch
  const itemListText = state.cart.map(c => `• ${c.title} (Size: ${c.selectedSize || c.size || 'M'}, ৳${c.price})`).join('\n');
  const waReceipt = encodeURIComponent(
    `🛍️ *NEW ORDER CONFIRMED!* [Order #${orderId}]\n\n` +
    `*Customer Details:*\n` +
    `• Name: ${name}\n` +
    `• Phone: ${phone}\n` +
    `• Address: ${address}\n` +
    `• Zone: ${state.deliveryZone === 'inside' ? 'Inside Dhaka (৳70)' : 'Outside Dhaka (৳130)'}\n\n` +
    `*Ordered Items (Sizes S, M, L, XL, XXL):*\n${itemListText}\n\n` +
    `*Payment Method:* ${state.selectedPayment.toUpperCase()}\n` +
    (senderPhone ? `*Payment Sender Number:* ${senderPhone}\n` : '') +
    (trxId ? `*Transaction ID:* ${trxId}\n` : '') +
    `*Total Bill:* ৳${total}\n\n` +
    `Please process this drop delivery!`
  );

  closeModal('checkoutModal');

  // Show Success Receipt Modal
  const successModalBody = document.getElementById('orderSuccessBody');
  if (successModalBody) {
    successModalBody.innerHTML = `
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <div style="width:60px; height:60px; background:#eaf3ee; color:var(--color-primary); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.75rem; margin:0 auto 1rem;">
          ✓
        </div>
        <h3 style="font-family:var(--font-serif); font-size:1.6rem; color:var(--color-primary); margin-bottom:0.25rem;">Order Placed Successfully!</h3>
        <p style="font-size:0.9rem; color:var(--color-text-muted);">Order ID: <strong>#${orderId}</strong></p>
      </div>

      <div style="background:var(--color-surface); border:1px solid var(--color-border); border-radius:var(--radius-md); padding:1.25rem; margin-bottom:1.5rem;">
        <h4 style="font-size:0.95rem; font-weight:700; margin-bottom:0.75rem; border-bottom:1px solid var(--color-border); padding-bottom:0.5rem;">Delivery Summary</h4>
        <p style="font-size:0.875rem;"><strong>Recipient:</strong> ${name} (${phone})</p>
        <p style="font-size:0.875rem;"><strong>Address:</strong> ${address}</p>
        <p style="font-size:0.875rem;"><strong>Payment Method:</strong> ${state.selectedPayment.toUpperCase()}</p>
        ${senderPhone ? `<p style="font-size:0.875rem;"><strong>Payment From (Sender No):</strong> ${senderPhone}</p>` : ''}
        ${trxId ? `<p style="font-size:0.875rem;"><strong>Transaction ID (TrxID):</strong> ${trxId}</p>` : ''}
        <p style="font-size:0.875rem; margin-top:0.5rem; color:var(--color-primary); font-weight:700;"><strong>Total Payable:</strong> ৳${total.toLocaleString()}</p>
      </div>

      <div style="display:flex; flex-direction:column; gap:0.75rem;">
        <a 
          href="https://wa.me/${getCleanWaNumber(storeContactInfo.whatsapp_number)}?text=${waReceipt}" 
          target="_blank" 
          class="btn-wa-cta" 
          style="justify-content:center; width:100%; text-decoration:none;"
        >
          💬 Send Order Copy to AUVARE WhatsApp
        </a>
        <button class="btn-secondary" onclick="closeModal('orderSuccessModal')" style="width:100%; justify-content:center;">
          Close & Continue Shopping
        </button>
      </div>
    `;
    openModal('orderSuccessModal');
  }

  // Clear cart
  state.cart = [];
  saveCart();
  updateCartUI();
}

// Modal Helpers
function openModal(modalId) {
  document.getElementById(modalId)?.classList.add('open');
}

function closeModal(modalId) {
  document.getElementById(modalId)?.classList.remove('open');
}

// Simple Toast Notification
function showToast(message, type = 'info') {
  const existing = document.getElementById('appToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'appToast';
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: #18181b;
    color: #f7f5ee;
    padding: 0.85rem 1.5rem;
    border-radius: var(--radius-full);
    font-size: 0.875rem;
    font-weight: 500;
    box-shadow: 0 10px 25px rgba(0,0,0,0.25);
    z-index: 200;
    opacity: 0;
    transition: all 0.3s ease;
    border: 1px solid rgba(255,255,255,0.15);
    display: flex;
    align-items: center;
    gap: 0.6rem;
  `;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : 'ℹ'}</span> <span>${message}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  }, 10);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Setup Event Listeners
function setupEventListeners() {
  // Category filter pills in Catalog section
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      setCategoryFilter(pill.dataset.category);
    });
  });

  // Storefront Header Nav Links
  const navContainer = document.getElementById('mainNavLinks');
  if (navContainer) {
    const navLinks = navContainer.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
      // Hover slide preview
      link.addEventListener('mouseenter', () => {
        updateNavIndicator(link);
      });

      // Click handler
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = link.dataset.category;
        const target = link.dataset.target;

        if (target === 'hero') {
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
          updateNavIndicator(link);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          if (window.location.hash) {
            history.replaceState(null, null, window.location.pathname + window.location.search);
          }
        } else if (cat) {
          setCategoryFilter(cat);
          document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
        } else if (target === 'instagram') {
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
          updateNavIndicator(link);
          document.getElementById('instagram')?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // When cursor leaves the nav list, glide back to currently active link
    navContainer.addEventListener('mouseleave', () => {
      updateNavIndicator();
    });

    // Brand logo click activates Home
    document.getElementById('brandHomeLink')?.addEventListener('click', (e) => {
      e.preventDefault();
      const homeLink = navContainer.querySelector('.nav-link[data-target="hero"]');
      if (homeLink) {
        navLinks.forEach(l => l.classList.remove('active'));
        homeLink.classList.add('active');
        updateNavIndicator(homeLink);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.location.hash) {
        history.replaceState(null, null, window.location.pathname + window.location.search);
      }
    });

    // Explore Latest Drop in Hero activates All Drops
    document.querySelector('.hero-actions .btn-primary')?.addEventListener('click', (e) => {
      e.preventDefault();
      setCategoryFilter('All');
      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
    });

    // Scroll listener: if user scrolls back to Hero top, activate Home
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (window.scrollY < 250) {
          const homeLink = navContainer.querySelector('.nav-link[data-target="hero"]');
          if (homeLink && !homeLink.classList.contains('active')) {
            navLinks.forEach(l => l.classList.remove('active'));
            homeLink.classList.add('active');
            updateNavIndicator();
          }
        }
      }, 60);
    }, { passive: true });
  }

  // Window resize & orientation change
  window.addEventListener('resize', () => {
    updateNavIndicator();
  });

  // Status Filter Select
  document.getElementById('statusFilter')?.addEventListener('change', (e) => {
    state.activeStatus = e.target.value;
    renderProducts();
  });

  // Size Filter Select
  document.getElementById('sizeFilter')?.addEventListener('change', (e) => {
    state.activeSize = e.target.value;
    renderProducts();
  });

  // Search input
  document.getElementById('searchInput')?.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderProducts();
  });

  // Delivery zone radio buttons
  document.querySelectorAll('input[name="deliveryZone"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      handleDeliveryZoneChange(e.target.value);
    });
  });

  // Real-time synchronization when admin panel modifies products
  window.addEventListener('storage', (e) => {
    if (e.key === 'auvare_inventory_v1') {
      loadProducts().then(() => renderProducts());
    }
  });

  window.addEventListener('focus', () => {
    loadProducts().then(() => renderProducts());
  });
}

// Run on page load
document.addEventListener('DOMContentLoaded', initApp);
