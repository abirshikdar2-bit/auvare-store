import type { Product, CartItem, Order, OrderStatus, DeliveryZone, PaymentMethod, GarmentSize } from '@/types';

/**
 * Parses raw product row from Supabase PostgreSQL table into full TypeScript Product model.
 * Extracts embedded variants and images comments from description if stored there.
 */
export function parseSupabaseProduct(row: any): Product {
  const rawDesc: string = row.description || '';

  // 1. Extract variants
  let variants: any[] = [];
  if (Array.isArray(row.variants)) {
    variants = row.variants;
  } else if (typeof row.variants === 'string') {
    try { variants = JSON.parse(row.variants); } catch {}
  }
  if (!variants || variants.length === 0) {
    const varMatch = rawDesc.match(/<!--AUVARE_VARIANTS:(.*?)-->/);
    if (varMatch && varMatch[1]) {
      try {
        const parsed = JSON.parse(varMatch[1]);
        if (Array.isArray(parsed)) variants = parsed;
      } catch {}
    }
  }

  // 2. Extract multi-images
  let images: string[] = [];
  if (Array.isArray(row.images)) {
    images = row.images;
  } else if (typeof row.images === 'string') {
    try { images = JSON.parse(row.images); } catch {}
  }
  if (!images || images.length === 0) {
    const imgMatch = rawDesc.match(/<!--AUVARE_IMAGES:(.*?)-->/);
    if (imgMatch && imgMatch[1]) {
      try {
        const parsed = JSON.parse(imgMatch[1]);
        if (Array.isArray(parsed)) images = parsed;
      } catch {}
    }
  }
  if (!images || images.length === 0) {
    images = [row.image || '/assets/images/logo.jpg'];
  }

  // 3. Clean description
  const cleanDescription = rawDesc
    .replace(/<!--AUVARE_VARIANTS:[\s\S]*?-->/g, '')
    .replace(/<!--AUVARE_IMAGES:[\s\S]*?-->/g, '')
    .replace(/<!--AUVARE_FABRIC:[\s\S]*?-->/g, '')
    .trim();

  // 4. Sizes
  let sizes: GarmentSize[] = ['S', 'M', 'L', 'XL', 'XXL'];
  if (Array.isArray(row.sizes) && row.sizes.length > 0) {
    sizes = row.sizes;
  } else if (typeof row.sizes === 'string') {
    try {
      const parsedSizes = JSON.parse(row.sizes);
      if (Array.isArray(parsedSizes) && parsedSizes.length > 0) sizes = parsedSizes;
    } catch {}
  }

  const isSold = Boolean(row.sold || row.status === 'sold');

  return {
    id: String(row.id),
    title: row.title || 'Untitled Garment',
    description: cleanDescription,
    category: row.category || 'T-Shirts',
    price: typeof row.price === 'number' ? row.price : parseInt(String(row.price || 0), 10),
    chest: row.chest || undefined,
    length: row.length || undefined,
    condition: row.condition || '9.5/10 (Mint Condition)',
    status: isSold ? 'sold' : ((row.status as any) || 'available'),
    sold: isSold,
    image: row.image || images[0] || '/assets/images/logo.jpg',
    images,
    sizes,
    variants,
    instagramUrl: row.instagram_url || row.instagramUrl || 'https://www.instagram.com/auvare_official/',
    createdAt: row.created_at,
  };
}

/**
 * Formats a Product payload strictly to match the Supabase PostgreSQL table columns:
 * ['id', 'title', 'category', 'sizes', 'chest', 'length', 'condition', 'price', 'image', 'sold', 'instagram_url', 'description', 'created_at']
 */
export function formatProductForSupabase(product: Partial<Product>) {
  const productId = product.id && String(product.id).trim()
    ? String(product.id).trim()
    : `auv-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;

  const variants = Array.isArray(product.variants) ? product.variants : [];
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : (product.image ? [product.image] : ['/assets/images/logo.jpg']);

  // Embed variants and images metadata inside description comment for cloud persistence
  let embedDesc = (product.description || '')
    .replace(/<!--AUVARE_VARIANTS:[\s\S]*?-->/g, '')
    .replace(/<!--AUVARE_IMAGES:[\s\S]*?-->/g, '')
    .replace(/<!--AUVARE_FABRIC:[\s\S]*?-->/g, '')
    .trim();

  if (variants.length > 0) {
    embedDesc += `\n<!--AUVARE_VARIANTS:${JSON.stringify(variants)}-->`;
  }
  if (images.length > 1) {
    embedDesc += `\n<!--AUVARE_IMAGES:${JSON.stringify(images)}-->`;
  }

  const sizes = Array.isArray(product.sizes) && product.sizes.length > 0
    ? product.sizes
    : ['S', 'M', 'L', 'XL', 'XXL'];

  const isSold = Boolean(product.sold || product.status === 'sold');
  const priceNum = typeof product.price === 'number'
    ? Math.round(product.price)
    : parseInt(String(product.price || 0), 10);

  return {
    id: productId,
    title: product.title || 'Untitled Garment',
    category: product.category || 'T-Shirts',
    sizes,
    chest: product.chest || '38"-46"',
    length: product.length || '26"-30"',
    condition: product.condition || '9.5/10 (Mint Condition)',
    price: priceNum || 0,
    image: images[0] || product.image || '/assets/images/logo.jpg',
    sold: isSold,
    instagram_url: product.instagramUrl || 'https://www.instagram.com/auvare_official/',
    description: embedDesc,
    created_at: product.createdAt || new Date().toISOString(),
  };
}

/**
 * Formats an order payload strictly to match the Supabase PostgreSQL table columns:
 * ['order_id', 'customer_name', 'customer_phone', 'delivery_address', 'delivery_zone', 'payment_method', 'trx_id', 'items', 'subtotal', 'shipping_cost', 'total_amount', 'notes', 'order_status', 'created_at', 'payment_number', 'size']
 */
export function formatOrderForSupabase(data: {
  orderId?: string;
  order_id?: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryZone: 'inside' | 'outside';
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'rocket';
  paymentSenderNumber?: string | null;
  transactionId?: string | null;
  items: any[];
  subtotal: number;
  shippingCost?: number;
  deliveryCharge?: number;
  totalAmount: number;
  notes?: string | null;
  orderStatus?: string;
}) {
  const orderId = data.orderId || data.order_id || `AUV-${Math.floor(100000 + Math.random() * 900000)}`;
  const shippingCost = Math.round(data.shippingCost ?? data.deliveryCharge ?? (data.deliveryZone === 'inside' ? 70 : 130));

  return {
    order_id: orderId,
    customer_name: data.customerName.trim(),
    customer_phone: data.customerPhone.trim(),
    delivery_address: data.deliveryAddress.trim(),
    delivery_zone: data.deliveryZone,
    payment_method: data.paymentMethod,
    payment_number: data.paymentSenderNumber || null,
    trx_id: data.transactionId || null,
    items: data.items,
    subtotal: Math.round(data.subtotal),
    shipping_cost: shippingCost,
    total_amount: Math.round(data.totalAmount),
    notes: data.notes || null,
    order_status: data.orderStatus || 'pending',
    created_at: new Date().toISOString(),
  };
}

/**
 * Parses raw order row from Supabase PostgreSQL table into full TypeScript Order model.
 */
export function parseSupabaseOrder(row: any): Order {
  const orderId = row.order_id || (row.id ? `AUV-${row.id}` : 'AUV-000000');
  const items = Array.isArray(row.items) ? row.items : [];
  const subtotal = typeof row.subtotal === 'number' ? row.subtotal : parseInt(String(row.subtotal || 0), 10);
  const shipping = typeof row.shipping_cost === 'number' ? row.shipping_cost : parseInt(String(row.shipping_cost || 70), 10);
  const total = typeof row.total_amount === 'number' ? row.total_amount : parseInt(String(row.total_amount || (subtotal + shipping)), 10);

  return {
    id: orderId,
    orderId,
    customerName: row.customer_name || 'Customer',
    name: row.customer_name || 'Customer',
    customerPhone: row.customer_phone || '',
    phone: row.customer_phone || '',
    deliveryAddress: row.delivery_address || '',
    address: row.delivery_address || '',
    deliveryZone: (row.delivery_zone === 'outside' ? 'outside' : 'inside') as DeliveryZone,
    notes: row.notes || undefined,
    items,
    subtotal,
    deliveryCharge: shipping,
    shipping,
    totalAmount: total,
    total,
    paymentMethod: (row.payment_method || 'cod') as PaymentMethod,
    paymentSenderNumber: row.payment_number || undefined,
    paymentNumber: row.payment_number || undefined,
    senderPhone: row.payment_number || undefined,
    transactionId: row.trx_id || undefined,
    trxId: row.trx_id || undefined,
    status: (row.order_status || 'pending') as OrderStatus,
    orderStatus: (row.order_status || 'pending') as OrderStatus,
    createdAt: row.created_at || new Date().toISOString(),
    date: row.created_at ? new Date(row.created_at).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
  };
}

