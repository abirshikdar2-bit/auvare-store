/**
 * AUVARE - Vintage & Pre-loved Clothing Store
 * Core Interactive Application Logic
 * Supports Multi-Size Selection (S, M, L, XL, XXL) & Supabase Cloud Sync
 */

// Default Box-Box Checkerboard Pattern SVG Placeholder (No Photo Fallback)
const DEFAULT_BOX_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='750' viewBox='0 0 600 750'><defs><pattern id='boxgrid' width='24' height='24' patternUnits='userSpaceOnUse'><rect width='24' height='24' fill='%23f8fafc'/><rect width='12' height='12' fill='%23e2e8f0'/><rect x='12' y='12' width='12' height='12' fill='%23e2e8f0'/></pattern></defs><rect width='600' height='750' fill='url(%23boxgrid)'/><rect x='120' y='260' width='360' height='230' rx='16' fill='%23ffffff' fill-opacity='0.95' stroke='%23cbd5e1' stroke-width='1.5'/><g transform='translate(265, 290)' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='3' width='64' height='50' rx='8'/><circle cx='23' cy='20' r='6'/><path d='M67 43l-18-18-30 30'/><path d='M40 37l6-6 10 10'/></g><text x='300' y='395' font-family='Playfair Display, serif, -apple-system' font-size='20' font-weight='700' letter-spacing='0.08em' fill='%230f172a' text-anchor='middle'>AUVARE</text><text x='300' y='425' font-family='Plus Jakarta Sans, sans-serif' font-size='12' font-weight='600' letter-spacing='0.05em' fill='%2364748b' text-anchor='middle'>VINTAGE &amp; PRELOVED</text><text x='300' y='452' font-family='Plus Jakarta Sans, sans-serif' font-size='11' font-weight='500' fill='%2394a3b8' text-anchor='middle'>No Photo Uploaded</text></svg>";
window.DEFAULT_BOX_PLACEHOLDER = DEFAULT_BOX_PLACEHOLDER;

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
  selectedVariants: {}, // Maps productId -> selected variant id
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
  const initialProductHash = window.location.hash.startsWith('#product-') ? window.location.hash.replace('#product-', '') : null;
  if (!initialProductHash && window.location.hash) {
    history.replaceState(null, null, window.location.pathname + window.location.search);
  }
  window.scrollTo(0, 0);

  await loadStoreContacts();
  await loadProducts();
  loadCart();
  renderProducts();
  setupEventListeners();
  updateCartUI();

  if (initialProductHash) {
    setTimeout(() => {
      openProductDetailScreen(initialProductHash);
    }, 100);
  }

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

// Handle variant chip selection
function selectCardVariant(productId, variantId) {
  if (!state.selectedVariants) state.selectedVariants = {};
  state.selectedVariants[productId] = variantId;

  // Auto-align selected size if current size isn't in variant's sizes
  const product = state.products.find(p => p.id === productId);
  if (product && Array.isArray(product.variants)) {
    const variant = product.variants.find(v => v.id === variantId);
    if (variant && Array.isArray(variant.sizes) && variant.sizes.length > 0) {
      const curSize = state.selectedSizes[productId];
      if (!variant.sizes.includes(curSize)) {
        state.selectedSizes[productId] = variant.sizes[0];
      }
    }
  }

  renderProducts();
}
window.selectCardVariant = selectCardVariant;

// Render Products Grid
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const countLabel = document.getElementById('itemCount');
  
  if (!grid) return;

  // Dynamically sync Hero Featured Card with live product data
  // Select the top active/available product from the catalog
  const heroFeatured = (state.products && state.products.length > 0)
    ? (state.products.find(p => !p.sold) || state.products[0])
    : null;

  if (heroFeatured) {
    const heroImgEl = document.getElementById('heroFeaturedImg');
    const heroPriceEl = document.getElementById('heroFeaturedPrice');
    const heroTitleEl = document.getElementById('heroFeaturedTitle');
    const heroSubEl = document.getElementById('heroFeaturedSub');
    const heroCardStack = document.querySelector('.hero-card-stack');

    if (heroImgEl && heroFeatured.image) {
      if (heroImgEl.getAttribute('src') !== heroFeatured.image) {
        heroImgEl.src = heroFeatured.image;
      }
      heroImgEl.alt = heroFeatured.title || 'AUVARE Featured Drop';
    }
    if (heroPriceEl && heroFeatured.price !== undefined) {
      heroPriceEl.textContent = `৳ ${Number(heroFeatured.price).toLocaleString()}`;
    }
    if (heroTitleEl && heroFeatured.title) {
      heroTitleEl.textContent = heroFeatured.title;
    }
    if (heroSubEl) {
      const parts = [];
      if (heroFeatured.chest) parts.push(`Chest: ${heroFeatured.chest}`);
      if (heroFeatured.length) parts.push(`L: ${heroFeatured.length}`);
      if (heroFeatured.condition) parts.push(heroFeatured.condition.split('(')[0].trim());
      heroSubEl.textContent = parts.length > 0 ? parts.join(' • ') : '1-of-1 Curated Drop • Mint';
    }
    if (heroCardStack) {
      heroCardStack.style.cursor = 'pointer';
      heroCardStack.title = `View ${heroFeatured.title} In-Details`;
      heroCardStack.onclick = () => {
        openProductDetailScreen(heroFeatured.id);
      };
    }
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

  const mobileDropCountEl = document.getElementById('mobileDropCount');
  if (mobileDropCountEl) {
    mobileDropCountEl.textContent = state.products.length;
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
    const images = (Array.isArray(item.images) && item.images.length > 0)
      ? item.images
      : [item.image || DEFAULT_BOX_PLACEHOLDER];
    const primaryImg = images[0] || DEFAULT_BOX_PLACEHOLDER;
    const hasMultiple = images.length > 1;

    // Variant calculation
    const hasVariants = Array.isArray(item.variants) && item.variants.length > 0;
    const selectedVariantId = state.selectedVariants?.[item.id] || (hasVariants ? item.variants[0].id : null);
    const activeVariant = hasVariants ? item.variants.find(v => v.id === selectedVariantId) : null;
    const effectivePrice = (activeVariant && activeVariant.price) ? activeVariant.price : item.price;
    const effectiveSizes = (activeVariant && Array.isArray(activeVariant.sizes) && activeVariant.sizes.length > 0)
      ? activeVariant.sizes
      : itemSizes;

    return `
      <article class="product-card ${item.sold ? 'sold-out' : ''}" data-id="${item.id}" onclick="openProductDetailScreen('${item.id}')">
        <div class="product-image-box" onclick="openProductDetailScreen('${item.id}')" title="Click to view full product details">
          <img class="product-card-img" id="cardImg_${item.id}" src="${primaryImg}" alt="${item.title}" loading="lazy" />
          
          <div class="product-badge-group">
            <span class="badge-tag unique">Curated Drop</span>
            ${item.sold ? '<span class="badge-tag sold">SOLD OUT</span>' : '<span class="badge-tag condition">' + (item.condition ? item.condition.split('(')[0].trim() : 'Mint') + '</span>'}
          </div>

          ${hasMultiple ? `
            <span class="multi-photo-badge">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              ${images.length}
            </span>
            <div class="product-card-gallery-dots" onclick="event.stopPropagation();">
              ${images.map((img, idx) => `
                <button type="button" class="gallery-dot ${idx === 0 ? 'active' : ''}" onclick="switchCardImage('${item.id}', ${idx}, this)" title="Photo ${idx + 1}"></button>
              `).join('')}
            </div>
          ` : ''}

          ${state.isAdmin ? `
            <div class="admin-card-bar" onclick="event.stopPropagation();">
              <button class="btn-admin-action" onclick="toggleSoldState('${item.id}')" title="Toggle Sold Status">
                ${item.sold ? 'Mark Available' : 'Mark Sold'}
              </button>
              <button class="btn-admin-action btn-admin-delete" onclick="deleteProduct('${item.id}')" title="Delete Product">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          ` : ''}
        </div>

        <div class="product-info">
          <div class="product-meta-row">
            <span>${item.category}</span>
            <span class="product-measurements">${item.chest ? 'Chest: ' + item.chest : 'All Sizes Available'}</span>
          </div>

          <h3 class="product-title" onclick="openProductDetailScreen('${item.id}')" title="Click to view full product details">${item.title}</h3>

          <!-- Variant Selector (Colorways / Editions) -->
          ${hasVariants ? `
            <div class="product-variants-selector">
              <span class="sizes-label">Variant:</span>
              <div class="variant-chips-group">
                ${item.variants.map(v => {
                  const vKey = String(v.id || v.name);
                  const isSel = String(selectedVariantId) === vKey;
                  return `
                    <button 
                      type="button" 
                      class="variant-chip ${isSel ? 'active' : ''}" 
                      onclick="event.stopPropagation(); selectCardVariant('${item.id}', '${vKey}')"
                      title="${v.name}"
                    >
                      ${v.name}
                    </button>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}

          <!-- S, M, L, XL, XXL Size Selector -->
          <div class="product-sizes-selector">
            <span class="sizes-label">Select Size:</span>
            <div class="size-chips-group">
              ${effectiveSizes.map(sz => `
                <button 
                  type="button" 
                  class="size-chip ${currentSelectedSize === sz ? 'active' : ''}" 
                  data-size="${sz}"
                  onclick="event.stopPropagation(); selectCardSize('${item.id}', '${sz}')"
                  title="Size ${sz}"
                >
                  ${sz}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="product-price-row">
            <span class="price-current">৳ ${effectivePrice.toLocaleString()}</span>
            <span class="size-pill selected-size-text">Size: ${currentSelectedSize}${activeVariant ? ` • ${activeVariant.name}` : ''}</span>
          </div>

          <div class="product-actions-grid">
            <button 
              class="btn-add-bag" 
              onclick="event.stopPropagation(); addToCart('${item.id}')" 
              ${item.sold ? 'disabled' : ''}
            >
              ${item.sold ? 'Sold Out' : 'Add to Bag'}
            </button>
            
            <button 
              class="btn-wa-card" 
              onclick="event.stopPropagation(); orderOnWhatsApp('${item.id}')" 
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

// Multi-Image Gallery Card Swapper
function switchCardImage(productId, index, btn) {
  const item = state.products.find(p => p.id === productId);
  if (!item) return;
  const images = (Array.isArray(item.images) && item.images.length > 0)
    ? item.images
    : [item.image || DEFAULT_BOX_PLACEHOLDER];
  const targetImg = images[index];
  if (!targetImg) return;

  const imgEl = document.getElementById(`cardImg_${productId}`);
  if (imgEl) {
    imgEl.style.transition = 'opacity 0.15s ease';
    imgEl.style.opacity = '0.4';
    setTimeout(() => {
      imgEl.src = targetImg;
      imgEl.style.opacity = '1';
    }, 120);
  }

  // Update dots
  const parent = btn.parentElement;
  if (parent) {
    parent.querySelectorAll('.gallery-dot').forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });
  }
}
window.switchCardImage = switchCardImage;

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
  
  // Variant calculation
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
  const selectedVariantId = state.selectedVariants?.[productId] || (hasVariants ? product.variants[0].id : null);
  const activeVariant = hasVariants ? product.variants.find(v => v.id === selectedVariantId) : null;
  const effectivePrice = (activeVariant && activeVariant.price) ? activeVariant.price : product.price;
  const variantName = activeVariant ? activeVariant.name : null;

  const cartItemId = variantName ? `${productId}-${chosenSize}-${variantName}` : `${productId}-${chosenSize}`;

  const existing = state.cart.find(item => item.cartItemId === cartItemId);
  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
    saveCart();
    updateCartUI();
    openCart();
    showToast(`Updated quantity for "${product.title}" (${chosenSize}${variantName ? ` • ${variantName}` : ''})!`, 'info');
    return;
  }

  state.cart.push({
    ...product,
    cartItemId,
    price: effectivePrice,
    selectedSize: chosenSize,
    selectedVariant: variantName,
    quantity: 1
  });
  saveCart();
  updateCartUI();
  openCart();
  showToast(`Added "${product.title}" [${chosenSize}${variantName ? ` • ${variantName}` : ''}] to bag!`, 'success');
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
        <div style="margin-bottom: 0.75rem; color: var(--color-primary);">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        </div>
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
          ${item.selectedVariant ? `<span style="font-size:0.75rem; background:#e2e8f0; padding:0.1rem 0.4rem; border-radius:3px; color:#334155; font-weight:600;">${item.selectedVariant}</span>` : ''}
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
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
  const selectedVariantId = state.selectedVariants?.[productId] || (hasVariants ? product.variants[0].id : null);
  const activeVariant = hasVariants ? product.variants.find(v => v.id === selectedVariantId) : null;
  const effectivePrice = (activeVariant && activeVariant.price) ? activeVariant.price : product.price;
  const variantText = activeVariant ? `• Variant: ${activeVariant.name}\n` : '';

  const msg = encodeURIComponent(
    `Hello AUVARE! I want to order this piece:\n\n` +
    `• Product: ${product.title}\n` +
    variantText +
    `• Selected Size: ${chosenSize} (Available: S, M, L, XL, XXL)\n` +
    `• Price: ৳${effectivePrice}\n\n` +
    `Please confirm my order for Size ${chosenSize}${activeVariant ? ` (${activeVariant.name})` : ''}!`
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
  
  selectPaymentMethod(state.selectedPayment || 'cod');
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
  
  // 1. Explicitly check the selected radio and uncheck all others
  document.querySelectorAll('input[name="payMethod"]').forEach(r => {
    r.checked = (r.value === method);
  });

  // 2. Clear .selected on all cards and highlight ONLY the active card
  document.querySelectorAll('.payment-method-card').forEach(c => c.classList.remove('selected'));
  document.getElementById(`payCard_${method}`)?.classList.add('selected');

  const instructionsBox = document.getElementById('paymentInstructions');
  if (!instructionsBox) return;

  switch (method) {
    case 'cod':
      instructionsBox.innerHTML = `
        <h5 style="font-weight:700; color:var(--color-primary); margin-bottom:0.35rem;">Cash on Delivery (ক্যাশ অন ডেলিভারি)</h5>
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
    items: state.cart.map(c => ({ 
      title: c.title, 
      size: c.selectedSize || c.size || 'M', 
      variant: c.selectedVariant || null, 
      price: c.price, 
      quantity: c.quantity || 1 
    })),
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
  const itemListText = state.cart.map(c => `• ${c.title}${c.selectedVariant ? ` [${c.selectedVariant}]` : ''} (Size: ${c.selectedSize || c.size || 'M'}, ৳${c.price}${c.quantity > 1 ? ` x${c.quantity}` : ''})`).join('\n');
  const waReceipt = encodeURIComponent(
    `*NEW ORDER CONFIRMED!* [Order #${orderId}]\n\n` +
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
      <div style="text-align: center; margin-bottom: 1.25rem;">
        <div style="width:54px; height:54px; background:#eaf3ee; color:var(--color-primary); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.5rem; margin:0 auto 0.75rem;">
          ✓
        </div>
        <h3 style="font-family:var(--font-serif); font-size:1.55rem; color:var(--color-primary); margin-bottom:0.25rem; font-weight:700;">Order Placed Successfully!</h3>
        <p style="font-size:0.875rem; color:var(--color-text-muted); margin:0;">Order Reference: <strong style="color:var(--color-primary); letter-spacing:0.04em;">#${orderId}</strong></p>
      </div>

      <!-- Personalized Appreciation & Warm Welcome Note -->
      <div style="background: linear-gradient(135deg, rgba(234, 243, 238, 0.75) 0%, rgba(250, 248, 245, 0.95) 100%); border: 1px solid rgba(16, 80, 54, 0.16); border-radius: var(--radius-md); padding: 1.2rem 1.35rem; margin-bottom: 1.25rem; text-align: center;">
        <span style="display:inline-block; font-size:0.72rem; letter-spacing:0.12em; text-transform:uppercase; font-weight:700; color:var(--color-primary); opacity:0.85; margin-bottom:0.35rem;">
          A Personal Note of Appreciation
        </span>
        <h4 style="font-family:var(--font-serif); font-size:1.3rem; color:var(--color-primary); margin:0 0 0.45rem 0; font-weight:600; line-height:1.3;">
          Thank You, ${name}!
        </h4>
        <p style="font-size:0.875rem; line-height:1.6; color:var(--color-text-muted); margin:0;">
          We are genuinely delighted to welcome you to the <strong>AUVARE</strong> collective. Your selected piece is an authentic <strong>1-of-1 curated drop</strong>, and our team is already preparing it with utmost care to ensure it reaches your doorstep in pristine archival condition. Thank you for championing timeless, conscious fashion with us!
        </p>
      </div>

      <!-- Delivery Summary Card -->
      <div style="background:var(--color-surface); border:1px solid var(--color-border); border-radius:var(--radius-md); padding:1.25rem; margin-bottom:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; border-bottom:1px solid var(--color-border); padding-bottom:0.5rem;">
          <h4 style="font-size:0.9rem; font-weight:700; margin:0; text-transform:uppercase; letter-spacing:0.06em; color:var(--color-text-main);">Delivery Summary</h4>
          <span style="font-size:0.75rem; font-weight:600; color:var(--color-primary); background:#eaf3ee; padding:0.2rem 0.55rem; border-radius:999px;">Verified & Reserved</span>
        </div>
        <div style="display:grid; gap:0.4rem; font-size:0.875rem;">
          <div><strong style="color:var(--color-text-muted);">Recipient:</strong> <span style="font-weight:600; color:var(--color-text-main);">${name}</span> <span style="color:var(--color-text-muted);">(${phone})</span></div>
          <div><strong style="color:var(--color-text-muted);">Address:</strong> <span style="color:var(--color-text-main);">${address}</span></div>
          <div><strong style="color:var(--color-text-muted);">Payment Method:</strong> <span style="font-weight:600; color:var(--color-primary);">${state.selectedPayment.toUpperCase()}</span></div>
          ${senderPhone ? `<div><strong style="color:var(--color-text-muted);">Payment From (Sender No):</strong> <span style="font-weight:600; color:var(--color-text-main);">${senderPhone}</span></div>` : ''}
          ${trxId ? `<div><strong style="color:var(--color-text-muted);">Transaction ID (TrxID):</strong> <span style="font-weight:600; font-family:monospace; color:var(--color-text-main);">${trxId}</span></div>` : ''}
          <div style="margin-top:0.4rem; padding-top:0.5rem; border-top:1px dashed var(--color-border); display:flex; justify-content:space-between; align-items:center;">
            <strong style="font-size:0.92rem; color:var(--color-text-main);">Total Payable:</strong>
            <span style="font-size:1.15rem; font-weight:800; color:var(--color-primary);">৳${total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:0.75rem;">
        <a 
          href="https://wa.me/${getCleanWaNumber(storeContactInfo.whatsapp_number)}?text=${waReceipt}" 
          target="_blank" 
          class="btn-wa-cta" 
          style="justify-content:center; width:100%; text-decoration:none; display:flex; align-items:center; gap:0.5rem;"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          <span>Send Order Copy to AUVARE WhatsApp</span>
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

// ==========================================
// Sailor-Inspired Luxury Product Experience
// ==========================================

function trackRecentlyViewed(productId) {
  if (!productId) return;
  try {
    let recent = JSON.parse(sessionStorage.getItem('auvare_recently_viewed') || '[]');
    recent = recent.filter(id => String(id) !== String(productId));
    recent.unshift(String(productId));
    if (recent.length > 8) recent = recent.slice(0, 8);
    sessionStorage.setItem('auvare_recently_viewed', JSON.stringify(recent));
  } catch (e) {}
}

function getRecentlyViewed(currentProductId) {
  try {
    const recent = JSON.parse(sessionStorage.getItem('auvare_recently_viewed') || '[]');
    return recent
      .filter(id => String(id) !== String(currentProductId))
      .map(id => state.products.find(p => String(p.id) === String(id)))
      .filter(Boolean);
  } catch (e) {
    return [];
  }
}

function getSuggestedProducts(currentProduct) {
  if (!currentProduct) return [];
  const sameCat = state.products.filter(p => 
    String(p.id) !== String(currentProduct.id) && 
    p.category === currentProduct.category
  );
  if (sameCat.length >= 4) {
    return sameCat.slice(0, 4);
  }
  const others = state.products.filter(p => 
    String(p.id) !== String(currentProduct.id) && 
    p.category !== currentProduct.category
  );
  return sameCat.concat(others).slice(0, 4);
}

function openProductDetailScreen(productId) {
  const product = state.products.find(p => String(p.id) === String(productId));
  if (!product) return;

  state.activeDetailProductId = String(productId);
  trackRecentlyViewed(productId);
  renderProductDetailScreen(product);

  const screenEl = document.getElementById('productDetailScreen');
  if (screenEl) {
    screenEl.classList.add('open');
    screenEl.setAttribute('aria-hidden', 'false');
    screenEl.scrollTop = 0;
  }
  document.body.style.overflow = 'hidden';

  // Deep linking and browser history navigation
  if (window.location.hash !== `#product-${productId}`) {
    history.pushState({ screen: 'product-detail', productId: String(productId) }, '', `#product-${productId}`);
  }
}
window.openProductDetailScreen = openProductDetailScreen;
window.openProductDetailModal = openProductDetailScreen; // alias

function closeProductDetailScreen(updateHistory = true) {
  const screenEl = document.getElementById('productDetailScreen');
  if (screenEl) {
    screenEl.classList.remove('open');
    screenEl.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';
  state.activeDetailProductId = null;

  if (updateHistory && window.location.hash.startsWith('#product-')) {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }
}
window.closeProductDetailScreen = closeProductDetailScreen;
window.closeProductDetailModal = closeProductDetailScreen; // alias

// Handle Browser Back / Forward buttons
window.addEventListener('popstate', () => {
  const screenEl = document.getElementById('productDetailScreen');
  if (screenEl && screenEl.classList.contains('open')) {
    closeProductDetailScreen(false);
  } else if (window.location.hash.startsWith('#product-')) {
    const pId = window.location.hash.replace('#product-', '');
    if (pId) {
      openProductDetailScreen(pId);
    }
  }
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const screenEl = document.getElementById('productDetailScreen');
    if (screenEl && screenEl.classList.contains('open')) {
      closeProductDetailScreen();
    }
  }
});

function switchDetailScreenImage(imgSrc, btnEl) {
  const mainImg = document.getElementById('screenMainImg');
  if (mainImg) {
    mainImg.style.transition = 'opacity 0.15s ease';
    mainImg.style.opacity = '0.4';
    setTimeout(() => {
      mainImg.src = imgSrc;
      mainImg.style.opacity = '1';
    }, 120);
  }
  document.querySelectorAll('.screen-thumb-btn').forEach(btn => btn.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
}
window.switchDetailScreenImage = switchDetailScreenImage;
window.switchDetailModalImage = switchDetailScreenImage; // alias

function selectScreenVariant(productId, variantId) {
  selectCardVariant(productId, variantId);
  const product = state.products.find(p => String(p.id) === String(productId));
  if (product) {
    renderProductDetailScreen(product);
  }
}
window.selectScreenVariant = selectScreenVariant;
window.selectModalVariant = selectScreenVariant; // alias

function selectScreenSize(productId, size) {
  selectCardSize(productId, size);
  const product = state.products.find(p => String(p.id) === String(productId));
  if (product) {
    renderProductDetailScreen(product);
  }
}
window.selectScreenSize = selectScreenSize;
window.selectModalSize = selectScreenSize; // alias

function addScreenProductToBag(productId) {
  addToCart(productId);
  closeProductDetailScreen();
  if (typeof toggleCart === 'function') {
    toggleCart();
  }
}
window.addScreenProductToBag = addScreenProductToBag;
window.addModalProductToBag = addScreenProductToBag; // alias

function renderProductDetailScreen(product) {
  const container = document.getElementById('productDetailScreenContent');
  if (!container) return;

  const images = (Array.isArray(product.images) && product.images.length > 0)
    ? product.images
    : [product.image || DEFAULT_BOX_PLACEHOLDER];
  const primaryImg = images[0];
  const hasMultipleImages = images.length > 1;

  // Variant calculation
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
  const selectedVariantId = state.selectedVariants?.[product.id] || (hasVariants ? (product.variants[0].id || product.variants[0].name) : null);
  const activeVariant = hasVariants ? product.variants.find(v => String(v.id || v.name) === String(selectedVariantId)) : null;
  const effectivePrice = (activeVariant && activeVariant.price) ? activeVariant.price : product.price;

  // Size calculation
  const itemSizes = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL', 'XXL'];
  const effectiveSizes = (activeVariant && Array.isArray(activeVariant.sizes) && activeVariant.sizes.length > 0)
    ? activeVariant.sizes
    : itemSizes;
  const currentSelectedSize = state.selectedSizes?.[product.id] || effectiveSizes[0] || 'M';

  // Description cleanup
  const cleanDescription = (product.description || '')
    .replace(/<!--AUVARE_VARIANTS:.*?-->/g, '')
    .replace(/<!--AUVARE_IMAGES:.*?-->/g, '')
    .replace(/<!--AUVARE_FABRIC:.*?-->/g, '')
    .trim();

  // Dynamic recommendations & browsing history
  const suggestedProducts = getSuggestedProducts(product);
  const recentViewedProducts = getRecentlyViewed(product.id);

  container.innerHTML = `
    <!-- Breadcrumb Bar -->
    <nav class="screen-breadcrumb" aria-label="Breadcrumb">
      <a onclick="closeProductDetailScreen()">Collection</a>
      <span class="crumb-sep">/</span>
      <a onclick="closeProductDetailScreen(); setCategoryFilter('${product.category}')">${product.category}</a>
      <span class="crumb-sep">/</span>
      <span class="crumb-current">${product.title}</span>
    </nav>

    <!-- Main Product Two-Column Hero -->
    <div class="screen-detail-grid">
      <!-- Left Column: Studio Gallery (Vertical Thumbs + Main Image) -->
      <div class="screen-gallery-col">
        ${hasMultipleImages ? `
          <div class="screen-vertical-thumbs">
            ${images.map((img, idx) => `
              <button 
                type="button" 
                class="screen-thumb-btn ${idx === 0 ? 'active' : ''}" 
                onclick="switchDetailScreenImage('${img}', this)"
                title="View Photo ${idx + 1}"
              >
                <img src="${img}" alt="Thumbnail ${idx + 1}" loading="lazy" />
              </button>
            `).join('')}
          </div>
        ` : ''}

        <div class="screen-main-img-box">
          <img id="screenMainImg" src="${primaryImg}" alt="${product.title}" />
          
          <div class="screen-gallery-badges">
            <span class="badge-tag unique">Curated Drop</span>
            ${product.sold ? '<span class="badge-tag sold">Sold Out</span>' : '<span class="badge-tag condition">' + (product.condition ? product.condition.split('(')[0].trim() : 'Mint') + '</span>'}
          </div>
        </div>
      </div>

      <!-- Right Column: Purchasing & Specifications -->
      <div class="screen-info-col">
        <div class="screen-sku-row">
          <span class="screen-sku-code">SKU : ${String(product.id).toUpperCase()}</span>
          <span class="badge-tag condition">${product.category}</span>
        </div>

        <h1 class="screen-product-title">${product.title}</h1>

        <div class="screen-price-row">
          <span class="screen-price-val">৳ ${effectivePrice.toLocaleString()}</span>
          <span class="screen-price-note">All Import & VAT Included</span>
        </div>

        <!-- Available Colorways / Variants -->
        ${hasVariants ? `
          <div class="screen-selector-group">
            <span class="screen-selector-title">Available Colorways / Editions:</span>
            <div class="variant-chips-group">
              ${product.variants.map(v => {
                const vKey = String(v.id || v.name);
                const isSel = String(selectedVariantId) === vKey;
                return `
                  <button 
                    type="button" 
                    class="variant-chip ${isSel ? 'active' : ''}" 
                    onclick="selectScreenVariant('${product.id}', '${vKey}')"
                    title="${v.name}"
                  >
                    ${v.name}
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Available Sizes -->
        <div class="screen-selector-group">
          <span class="screen-selector-title">Select Size:</span>
          <div class="size-chips-group">
            ${effectiveSizes.map(sz => `
              <button 
                type="button" 
                class="size-chip ${currentSelectedSize === sz ? 'active' : ''}" 
                onclick="selectScreenSize('${product.id}', '${sz}')"
                title="Size ${sz}"
              >
                ${sz}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Dual Action Buttons -->
        <div class="screen-actions-bar">
          <button 
            type="button" 
            class="btn-screen-add-bag" 
            onclick="addScreenProductToBag('${product.id}')"
            ${product.sold ? 'disabled' : ''}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <span>${product.sold ? 'Sold Out' : `Add to Bag (৳ ${effectivePrice.toLocaleString()})`}</span>
          </button>

          <button 
            type="button" 
            class="btn-screen-wa" 
            onclick="orderOnWhatsApp('${product.id}')"
            title="Direct WhatsApp Order"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            <span>Order via WhatsApp</span>
          </button>
        </div>

        <!-- Trust Badges Strip (Clean Professional SVGs) -->
        <div class="screen-trust-badges">
          <div class="trust-item">
            <svg class="trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            <div>
              <div class="trust-text">Fast Delivery</div>
              <span class="trust-sub">Dhaka 24-48h • All BD 2-4d</span>
            </div>
          </div>

          <div class="trust-item">
            <svg class="trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <div>
              <div class="trust-text">Curated Authentic</div>
              <span class="trust-sub">1-of-1 verified piece</span>
            </div>
          </div>

          <div class="trust-item">
            <svg class="trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            <div>
              <div class="trust-text">Hassle-Free Support</div>
              <span class="trust-sub">Hotline & WhatsApp</span>
            </div>
          </div>
        </div>

        <!-- Clean Collapsible Accordions (Sailor Structure) -->
        <div class="screen-accordion-group">
          <details class="screen-accordion" open>
            <summary class="screen-accordion-summary">
              <span>Garment Details & Description</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </summary>
            <div class="screen-accordion-content">
              ${cleanDescription || 'Authentic curated vintage streetwear piece. Verified condition, premium textile weave, and signature boxy silhouette.'}
            </div>
          </details>

          <details class="screen-accordion" open>
            <summary class="screen-accordion-summary">
              <span>Measurements & Sizing Guide</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </summary>
            <div class="screen-accordion-content">
              <table class="screen-spec-table">
                <tbody>
                  <tr>
                    <td class="spec-name">Chest (Pit-to-Pit)</td>
                    <td class="spec-val"><strong>${product.chest || '40"-48"'}</strong> (Relaxed width)</td>
                  </tr>
                  <tr>
                    <td class="spec-name">Length (Collar-to-Hem)</td>
                    <td class="spec-val"><strong>${product.length || '26"-30"'}</strong> (Vintage Boxy Drop)</td>
                  </tr>
                  <tr>
                    <td class="spec-name">Condition Grade</td>
                    <td class="spec-val"><strong>${product.condition || '9.5/10 Mint'}</strong></td>
                  </tr>
                  <tr>
                    <td class="spec-name">Category</td>
                    <td class="spec-val">${product.category}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </details>

          <details class="screen-accordion">
            <summary class="screen-accordion-summary">
              <span>Shipping & Care Guide</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </summary>
            <div class="screen-accordion-content">
              <p style="margin-bottom:0.5rem;"><strong>Shipping:</strong> Standard delivery within Dhaka takes 24 to 48 hours. Nationwide express delivery takes 2 to 4 business days. Cash on delivery is available with parcel checking.</p>
              <p><strong>Care:</strong> Machine wash cold (30°C) inside out on gentle cycle. Line dry in shade to preserve cotton fibres. Do not iron directly on vintage graphics or prints.</p>
            </div>
          </details>
        </div>
      </div>
    </div>

    <!-- Suggested Pieces (Suggested Category) Section -->
    ${suggestedProducts.length > 0 ? `
      <section class="screen-section-container">
        <div class="screen-section-header">
          <h3 class="screen-section-title">Suggested Pieces</h3>
          <span class="screen-section-sub">More from ${product.category}</span>
        </div>
        <div class="screen-product-grid">
          ${suggestedProducts.map(item => `
            <div class="screen-card-item" onclick="openProductDetailScreen('${item.id}')">
              <div class="screen-card-img-wrap">
                <img src="${(item.images && item.images[0]) || item.image || DEFAULT_BOX_PLACEHOLDER}" alt="${item.title}" loading="lazy" />
              </div>
              <div class="screen-card-body">
                <span class="screen-card-cat">${item.category}</span>
                <h4 class="screen-card-title">${item.title}</h4>
                <div class="screen-card-price-row">
                  <span class="screen-card-price">৳ ${item.price.toLocaleString()}</span>
                  <span class="screen-card-badge ${item.sold ? 'sold' : ''}">${item.sold ? 'Sold Out' : 'Available'}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    ` : ''}

    <!-- Customer Recently Viewed Section -->
    ${recentViewedProducts.length > 0 ? `
      <section class="screen-section-container">
        <div class="screen-section-header">
          <h3 class="screen-section-title">Customer Recently Viewed</h3>
          <span class="screen-section-sub">Your session browsing history</span>
        </div>
        <div class="screen-product-grid">
          ${recentViewedProducts.map(item => `
            <div class="screen-card-item" onclick="openProductDetailScreen('${item.id}')">
              <div class="screen-card-img-wrap">
                <img src="${(item.images && item.images[0]) || item.image || DEFAULT_BOX_PLACEHOLDER}" alt="${item.title}" loading="lazy" />
              </div>
              <div class="screen-card-body">
                <span class="screen-card-cat">${item.category}</span>
                <h4 class="screen-card-title">${item.title}</h4>
                <div class="screen-card-price-row">
                  <span class="screen-card-price">৳ ${item.price.toLocaleString()}</span>
                  <span class="screen-card-badge ${item.sold ? 'sold' : ''}">${item.sold ? 'Sold Out' : 'Available'}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    ` : ''}
  `;
}
window.renderProductDetailScreen = renderProductDetailScreen;
window.renderProductDetailModal = renderProductDetailScreen; // alias

// Handle Adding New Product from Storefront Admin Modal
async function handleAddNewProduct(event) {
  event.preventDefault();
  const title = document.getElementById('newTitle')?.value.trim();
  const category = document.getElementById('newCategory')?.value || 'Shirts';
  const size = document.getElementById('newSize')?.value || 'M';
  const chestVal = document.getElementById('newChest')?.value.trim() || '40';
  const lengthVal = document.getElementById('newLength')?.value.trim() || '28';
  const condition = document.getElementById('newCondition')?.value.trim() || '9.5/10 (Mint Condition)';
  const price = parseInt(document.getElementById('newPrice')?.value || '0', 10);
  const image = document.getElementById('newImageUrl')?.value.trim() || 'assets/images/item1.jpg';

  if (!title || !price) {
    showToast('Please enter both title and price.', 'error');
    return;
  }

  const newProduct = {
    id: 'auv-' + Date.now(),
    title,
    category,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    size,
    chest: chestVal.includes('"') ? chestVal : `${chestVal}"`,
    length: lengthVal.includes('"') ? lengthVal : `${lengthVal}"`,
    condition,
    price,
    image,
    sold: false,
    instagram_url: 'https://www.instagram.com/auvare_official/',
    description: `Curated 1-of-1 ${category} drop.`
  };

  state.products.unshift(newProduct);
  saveProducts();
  renderProducts();
  closeModal('adminAddModal');

  if (window.SupabaseService) {
    try {
      const saver = window.SupabaseService.saveProduct || window.SupabaseService.insertProduct;
      if (saver) await saver(newProduct);
    } catch (e) {
      console.warn('Could not save product to Supabase cloud:', e);
    }
  }

  showToast(`Published "${title}" to online catalog!`);
}
window.handleAddNewProduct = handleAddNewProduct;

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

  // Supabase Real-time Cloud Synchronization
  if (window.SupabaseService) {
    const client = window.SupabaseService.getClient();
    if (client) {
      try {
        client.channel('public_products_live').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, async () => {
          console.log('Realtime product change detected! Syncing storefront...');
          await loadProducts();
          renderProducts();
        }).subscribe();
      } catch (err) {
        console.warn('Realtime channel subscription error:', err);
      }
    }
  }

  // 5-second background polling fallback to ensure storefront is always 100% in sync with admin changes
  setInterval(async () => {
    if (window.SupabaseService && window.SupabaseService.isConfigured()) {
      try {
        const cloudProducts = await window.SupabaseService.getProducts();
        if (cloudProducts && Array.isArray(cloudProducts) && cloudProducts.length > 0) {
          const currentSignature = (state.products || []).map(p => `${p.id}:${p.price}:${p.sold}:${p.title}:${p.image}`).join('|');
          const newSignature = cloudProducts.map(p => `${p.id}:${p.price}:${p.sold}:${p.title}:${p.image}`).join('|');
          if (currentSignature !== newSignature) {
            state.products = cloudProducts;
            renderProducts();
          }
        }
      } catch (e) {}
    }
  }, 5000);
}

// Mobile Navigation Drawer Toggle and Navigation Handlers
function toggleMobileNav() {
  const drawer = document.getElementById('mobileNavDrawer');
  const overlay = document.getElementById('mobileNavOverlay');
  if (drawer && overlay) {
    drawer.classList.toggle('open');
    overlay.classList.toggle('open');
    if (drawer.classList.contains('open')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
}

function handleMobileNavClick(targetId) {
  toggleMobileNav();
  const el = document.getElementById(targetId);
  if (el) {
    setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  }
}

function handleMobileCategoryClick(cat) {
  toggleMobileNav();
  filterCategory(cat);
  const catalog = document.getElementById('catalog');
  if (catalog) {
    setTimeout(() => {
      catalog.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  }
}

// Run on page load
document.addEventListener('DOMContentLoaded', initApp);
