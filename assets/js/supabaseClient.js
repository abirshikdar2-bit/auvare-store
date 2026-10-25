/**
 * AUVARE - Supabase Integration Client
 * Handles real-time cloud database synchronization for products, orders, and inquiries.
 * Gracefully falls back to LocalStorage if Supabase credentials are not yet configured.
 */

const SupabaseService = (function() {
  // Connected to user's real Supabase project: auvare-store (Singapore - ap-southeast-1)
  const DEFAULT_CONFIG = {
    url: 'https://ypwnmocyzqwhbfptteql.supabase.co',
    anonKey: 'sb_publishable_Erw40_uRIk9yvz-nH-L8rQ_7vzIrCIA'
  };

  let client = null;
  let columnPaymentNumberSupported = true;

  function getConfig() {
    try {
      localStorage.removeItem('auvare_supabase_config');
    } catch (e) {}
    return DEFAULT_CONFIG;
  }

  function setConfig(url, anonKey) {
    const cfg = { url: url.trim(), anonKey: anonKey.trim() };
    localStorage.setItem('auvare_supabase_config', JSON.stringify(cfg));
    initClient();
    return true;
  }

  function isConfigured() {
    const cfg = getConfig();
    return cfg && cfg.url && cfg.anonKey && cfg.url.includes('supabase.co');
  }

  function initClient() {
    if (client) return client;
    const cfg = getConfig();
    if (window.supabase && isConfigured()) {
      try {
        client = window.supabase.createClient(cfg.url, cfg.anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
        console.log('✓ Connected to Supabase Cloud Database:', cfg.url);
      } catch (err) {
        console.warn('Supabase client init failed, using LocalStorage fallback:', err);
        client = null;
      }
    } else {
      client = null;
    }
    return client;
  }

  function getClient() {
    return client || initClient();
  }

  // Fetch Products
  async function getProducts() {
    initClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .order('id', { ascending: true });
        if (!error && data && data.length > 0) {
          const mapped = data.map(item => ({
            ...item,
            instagramUrl: item.instagram_url || item.instagramUrl || 'https://www.instagram.com/auvare_official/'
          }));
          // Sync with local storage
          localStorage.setItem('auvare_inventory_v1', JSON.stringify(mapped));
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase fetch failed, fallback to local storage:', err);
      }
    }
    // Fallback
    const local = localStorage.getItem('auvare_inventory_v1');
    return local ? JSON.parse(local) : null;
  }

  // Save / Insert Product
  async function insertProduct(product) {
    initClient();
    if (client) {
      try {
        const payload = {
          id: product.id || ('drop_' + Date.now()),
          title: product.title,
          category: product.category,
          sizes: product.sizes || ['S', 'M', 'L', 'XL', 'XXL'],
          chest: product.chest || '40"',
          length: product.length || '27"',
          condition: product.condition || '9.5/10 (Mint Condition)',
          price: parseInt(product.price, 10) || 0,
          image: product.image || 'assets/images/item1.jpg',
          sold: !!product.sold,
          instagram_url: product.instagramUrl || product.instagram_url || 'https://www.instagram.com/auvare_official/',
          description: product.description || ''
        };
        const { data, error } = await client.from('products').insert([payload]).select();
        if (error) throw error;
        console.log('✓ Product saved to Supabase cloud:', payload.id);
        return data?.[0] || payload;
      } catch (err) {
        console.warn('Supabase product insert error, saved locally:', err);
        throw err;
      }
    }
    return null;
  }

  // Update Product
  async function updateProduct(productId, updates) {
    initClient();
    if (client) {
      try {
        const payload = { ...updates };
        if ('instagramUrl' in payload) {
          payload.instagram_url = payload.instagramUrl;
          delete payload.instagramUrl;
        }
        delete payload.size;
        const { error } = await client.from('products').update(payload).eq('id', productId);
        if (error) throw error;
        console.log('✓ Product updated on Supabase cloud:', productId);
      } catch (err) {
        console.warn('Supabase product update error:', err);
      }
    }
  }

  // Delete Product
  async function deleteProduct(productId) {
    initClient();
    if (client) {
      try {
        const { error } = await client.from('products').delete().eq('id', productId);
        if (error) throw error;
        console.log('✓ Product deleted from Supabase cloud:', productId);
      } catch (err) {
        console.warn('Supabase product delete error:', err);
      }
    }
  }

  // Save Order
  async function insertOrder(order) {
    initClient();
    if (!client) return false;

    const paymentNumber = order.paymentNumber || order.paymentSenderNumber || order.senderPhone || null;
    const size = order.size || (order.items && order.items.length ? order.items.map(i => i.size).filter(Boolean).join(', ') : 'M');

    const basePayload = {
      order_id: order.orderId,
      customer_name: order.name,
      customer_phone: order.phone,
      delivery_address: order.address,
      delivery_zone: order.deliveryZone,
      payment_method: order.paymentMethod,
      trx_id: order.trxId || null,
      items: order.items,
      subtotal: order.subtotal || 0,
      shipping_cost: order.shipping || 0,
      total_amount: order.total,
      notes: order.notes || null,
      order_status: order.orderStatus || 'pending'
    };

    // If payment_number or size are known not to exist yet in remote table, use notes fallback directly
    if (!columnPaymentNumberSupported) {
      const extraNotes = [
        paymentNumber ? `Payment Number: ${paymentNumber}` : '',
        size ? `Size: ${size}` : ''
      ].filter(Boolean).join(' | ');

      const fallbackNotes = extraNotes
        ? `${basePayload.notes ? basePayload.notes + ' | ' : ''}${extraNotes}`
        : basePayload.notes;

      const fallbackPayload = {
        ...basePayload,
        notes: fallbackNotes
      };
      try {
        const { data, error } = await client.from('orders').insert([fallbackPayload]).select();
        if (!error) {
          console.log('✓ Order saved to Supabase cloud database!');
          return data;
        }
      } catch (e) {
        console.warn('Direct fallback insert warning:', e);
      }
    }

    // Try with payment_number and size columns
    try {
      const payloadWithColumns = {
        ...basePayload,
        payment_number: paymentNumber,
        size: size
      };
      const { data, error } = await client.from('orders').insert([payloadWithColumns]).select();
      if (!error) {
        columnPaymentNumberSupported = true;
        console.log('✓ Order saved to Supabase cloud database with payment_number & size!');
        return data;
      }
      
      // If error is about missing column in schema cache, fallback to base insert
      if (error.code === 'PGRST204' || error.message?.includes('payment_number') || error.message?.includes('size') || error.message?.includes('column')) {
        columnPaymentNumberSupported = false;
        console.warn('payment_number or size column not found in schema cache, storing in notes fallback...');
        const extraNotes = [
          paymentNumber ? `Payment Number: ${paymentNumber}` : '',
          size ? `Size: ${size}` : ''
        ].filter(Boolean).join(' | ');

        const fallbackNotes = extraNotes
          ? `${basePayload.notes ? basePayload.notes + ' | ' : ''}${extraNotes}`
          : basePayload.notes;
        
        const fallbackPayload = {
          ...basePayload,
          notes: fallbackNotes
        };
        const { data: fbData, error: fbError } = await client.from('orders').insert([fallbackPayload]).select();
        if (fbError) throw fbError;
        console.log('✓ Order saved to Supabase cloud database via fallback notes!');
        return fbData;
      }
      throw error;
    } catch (err) {
      console.error('Supabase order insert error, order kept in local storage:', err);
      return false;
    }
  }

  // Fetch Orders
  async function getOrders() {
    initClient();
    if (client) {
      try {
        const { data, error } = await client.from('orders').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          // Read local status overrides (preserves status even before Supabase RLS policy is updated)
          let statusOverrides = {};
          try {
            statusOverrides = JSON.parse(localStorage.getItem('auvare_order_statuses') || '{}');
          } catch (e) {}

          // Format orders for dashboard
          return data.map(o => {
            let pNum = o.payment_number || o.payment_sender_number || null;
            if (!pNum && o.notes && o.notes.includes('Payment Number:')) {
              const match = o.notes.match(/Payment Number:\s*([^\s|]+)/);
              if (match) pNum = match[1];
            }

            let size = o.size || null;
            if (!size && o.notes && o.notes.includes('Size:')) {
              const match = o.notes.match(/Size:\s*([^\s|]+)/);
              if (match) size = match[1];
            }
            if (!size && o.items && o.items[0]) {
              size = o.items.map(i => i.size).filter(Boolean).join(', ') || o.items[0].size || 'M';
            }
            if (!size) size = 'M';

            // Resolve status: prefer cloud status if updated; otherwise use local admin override if present
            const cloudStatus = (o.order_status || 'pending').toLowerCase();
            const overriddenStatus = statusOverrides[o.order_id];
            const finalStatus = overriddenStatus || cloudStatus;

            return {
              orderId: o.order_id,
              name: o.customer_name,
              phone: o.customer_phone,
              address: o.delivery_address,
              deliveryZone: o.delivery_zone,
              paymentMethod: o.payment_method,
              paymentNumber: pNum,
              paymentSenderNumber: pNum,
              trxId: o.trx_id || null,
              size: size,
              items: o.items,
              subtotal: o.subtotal,
              shipping: o.shipping_cost,
              total: o.total_amount,
              notes: o.notes,
              status: finalStatus,
              orderStatus: finalStatus,
              date: new Date(o.created_at).toLocaleString()
            };
          });
        }
      } catch (err) {
        console.warn('Supabase fetch orders error, fallback to local storage:', err);
      }
    }
    const local = localStorage.getItem('auvare_orders_v1');
    return local ? JSON.parse(local) : [];
  }

  // Update Order Status
  async function updateOrderStatus(orderId, newStatus) {
    initClient();

    // 1. Immediately persist to localStorage status map so admin changes never get lost or reverted
    try {
      const overrides = JSON.parse(localStorage.getItem('auvare_order_statuses') || '{}');
      overrides[orderId] = newStatus;
      localStorage.setItem('auvare_order_statuses', JSON.stringify(overrides));
    } catch (e) {}

    // 2. Update auvare_orders_v1 array in localStorage
    try {
      const local = JSON.parse(localStorage.getItem('auvare_orders_v1') || '[]');
      const target = local.find(o => o.orderId === orderId);
      if (target) {
        target.status = newStatus;
        target.orderStatus = newStatus;
        localStorage.setItem('auvare_orders_v1', JSON.stringify(local));
      }
    } catch (e) {}

    // 3. Sync to Supabase cloud database
    if (client && orderId) {
      try {
        const { data, error } = await client
          .from('orders')
          .update({ order_status: newStatus })
          .eq('order_id', orderId)
          .select();
        if (error) {
          console.warn('Supabase update order status error:', error);
        } else if (data && data.length > 0) {
          console.log(`✓ Order #${orderId} status saved to Supabase cloud as "${newStatus}"!`);
        } else {
          console.warn(`Supabase returned 0 rows updated for order #${orderId} (RLS update policy might be needed). Status preserved locally.`);
        }
      } catch (err) {
        console.warn('Supabase update order status exception:', err);
      }
    }

    return true;
  }

  // Auth Users & RBAC Methods
  async function getUserProfile(email) {
    initClient();
    if (client && email) {
      try {
        const { data, error } = await client
          .from('auth_users')
          .select('*')
          .eq('email', email.toLowerCase().trim())
          .maybeSingle();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('getUserProfile error:', err);
      }
    }
    return null;
  }

  async function registerOrRequestAdmin(user, extra = {}) {
    initClient();
    if (client && user?.email) {
      try {
        const email = user.email.toLowerCase().trim();
        const existing = await getUserProfile(email);
        
        if (existing) {
          await client
            .from('auth_users')
            .update({
              last_sign_in_at: new Date().toISOString(),
              avatar_url: user.user_metadata?.avatar_url || existing.avatar_url,
              display_name: existing.display_name || user.user_metadata?.full_name || email.split('@')[0],
              role: existing.role,
              status: existing.status
            })
            .eq('id', existing.id);

          return await getUserProfile(email);
        } else {
          // Check if this is the first user in table
          const { count } = await client.from('auth_users').select('*', { count: 'exact', head: true });
          const isFirstUser = (count === 0);

          const payload = {
            email,
            display_name: user.user_metadata?.full_name || email.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url || '',
            age: extra.age || null,
            date_of_birth: extra.date_of_birth || null,
            gender: extra.gender || null,
            role: isFirstUser ? 'super_admin' : 'customer',
            status: isFirstUser ? 'approved' : 'pending',
            request_note: extra.note || 'Requested admin portal access via Google OAuth'
          };
          const { data, error } = await client.from('auth_users').insert([payload]).select().single();
          if (error) throw error;
          return data;
        }
      } catch (err) {
        console.warn('registerOrRequestAdmin error:', err);
      }
    }
    return null;
  }

  async function getAllAuthUsers() {
    initClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('auth_users')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.warn('getAllAuthUsers error:', err);
      }
    }
    return [];
  }

  async function updateUserStatus(userId, status, role) {
    initClient();
    if (client) {
      try {
        const updates = { status };
        if (role) updates.role = role;
        const { data, error } = await client
          .from('auth_users')
          .update(updates)
          .eq('id', userId)
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('updateUserStatus error:', err);
      }
    }
    return null;
  }

  // Re-apply for Admin Access (changes rejected status back to pending, blocked users CANNOT re-apply)
  async function reapplyAdminAccess(emailOrId) {
    initClient();
    if (client && emailOrId) {
      try {
        const email = typeof emailOrId === 'string' && emailOrId.includes('@') ? emailOrId.toLowerCase().trim() : null;
        if (email) {
          const profile = await getUserProfile(email);
          if (profile && profile.status === 'blocked') {
            console.warn('⛔ Access Denied: User is permanently blocked by Super Admin.');
            throw new Error('BLOCKED_USER');
          }
        }

        const payload = {
          status: 'pending',
          role: 'admin',
          request_note: 'Re-applied for admin access after previous rejection'
        };
        let query = client.from('auth_users').update(payload);
        if (email) {
          query = query.eq('email', email);
        } else {
          query = query.eq('id', emailOrId);
        }
        const { data, error } = await query.select().single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('reapplyAdminAccess error:', err);
        throw err;
      }
    }
    return null;
  }

  async function blockUser(userId) {
    return await updateUserStatus(userId, 'blocked');
  }

  async function unblockUser(userId) {
    return await updateUserStatus(userId, 'pending');
  }

  async function updateUserProfile(userId, updates) {
    initClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('auth_users')
          .update(updates)
          .eq('id', userId)
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('updateUserProfile error:', err);
      }
    }
    return null;
  }

  // Store & Contact Information Methods
  async function getStoreContactInfo() {
    initClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('store_contact_info')
          .select('*')
          .eq('id', 'main')
          .maybeSingle();
        if (!error && data) {
          localStorage.setItem('auvare_store_contacts', JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn('getStoreContactInfo error:', err);
      }
    }
    const saved = localStorage.getItem('auvare_store_contacts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      id: 'main',
      whatsapp_number: '01700-000000',
      bkash_number: '01700-000000',
      nagad_number: '01700-000000',
      instagram_handle: '@auvare_official',
      instagram_url: 'https://www.instagram.com/auvare_official/'
    };
  }

  async function updateStoreContactInfo(contactData) {
    initClient();
    const payload = {
      id: 'main',
      whatsapp_number: contactData.whatsapp_number || '01700-000000',
      bkash_number: contactData.bkash_number || '01700-000000',
      nagad_number: contactData.nagad_number || '01700-000000',
      instagram_handle: contactData.instagram_handle || '@auvare_official',
      instagram_url: contactData.instagram_url || `https://www.instagram.com/${(contactData.instagram_handle || 'auvare_official').replace('@', '')}/`,
      updated_at: new Date().toISOString()
    };
    if (client) {
      try {
        const { data, error } = await client
          .from('store_contact_info')
          .upsert([payload])
          .select()
          .single();
        if (error) throw error;
        localStorage.setItem('auvare_store_contacts', JSON.stringify(data));
        return data;
      } catch (err) {
        console.warn('updateStoreContactInfo error:', err);
      }
    }
    localStorage.setItem('auvare_store_contacts', JSON.stringify(payload));
    return payload;
  }

  return {
    getClient,
    getConfig,
    setConfig,
    isConfigured,
    initClient,
    getProducts,
    insertProduct,
    saveProduct: insertProduct,
    updateProduct,
    deleteProduct,
    insertOrder,
    getOrders,
    updateOrderStatus,
    getUserProfile,
    registerOrRequestAdmin,
    getAllAuthUsers,
    updateUserStatus,
    updateUserProfile,
    reapplyAdminAccess,
    blockUser,
    unblockUser,
    getStoreContactInfo,
    updateStoreContactInfo
  };
})();

// Auto initialize on load
if (typeof window !== 'undefined') {
  window.SupabaseService = SupabaseService;
}

