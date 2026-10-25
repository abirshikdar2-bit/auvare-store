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

  function getConfig() {
    const saved = localStorage.getItem('auvare_supabase_config');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
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
          id: product.id,
          title: product.title,
          category: product.category,
          sizes: product.sizes || ['S', 'M', 'L', 'XL', 'XXL'],
          chest: product.chest || '40"',
          length: product.length || '27"',
          condition: product.condition || '9.5/10 (Mint Condition)',
          price: product.price,
          image: product.image,
          sold: !!product.sold,
          instagram_url: product.instagramUrl || product.instagram_url || 'https://www.instagram.com/auvare_official/',
          description: product.description || ''
        };
        const { data, error } = await client.from('products').insert([payload]).select();
        if (error) throw error;
        console.log('✓ Product saved to Supabase cloud:', product.id);
      } catch (err) {
        console.warn('Supabase product insert error, saved locally:', err);
      }
    }
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
    if (client) {
      try {
        const payload = {
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
          order_status: 'pending'
        };
        const { error } = await client.from('orders').insert([payload]);
        if (error) throw error;
        console.log('✓ Order saved to Supabase cloud database!');
      } catch (err) {
        console.warn('Supabase order insert error, order kept in local storage:', err);
      }
    }
  }

  // Fetch Orders
  async function getOrders() {
    initClient();
    if (client) {
      try {
        const { data, error } = await client.from('orders').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          // Format orders for dashboard
          return data.map(o => ({
            orderId: o.order_id,
            name: o.customer_name,
            phone: o.customer_phone,
            address: o.delivery_address,
            deliveryZone: o.delivery_zone,
            paymentMethod: o.payment_method,
            items: o.items,
            total: o.total_amount,
            date: new Date(o.created_at).toLocaleString()
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch orders error, fallback to local storage:', err);
      }
    }
    const local = localStorage.getItem('auvare_orders_v1');
    return local ? JSON.parse(local) : [];
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
        
        // Permanent Super Admin protection for Abir Shikdar
        const isPermanentSuperAdmin = email === 'abirshikdar2@gmail.com';

        if (existing) {
          await client
            .from('auth_users')
            .update({
              last_sign_in_at: new Date().toISOString(),
              avatar_url: user.user_metadata?.avatar_url || existing.avatar_url,
              display_name: existing.display_name || user.user_metadata?.full_name || email.split('@')[0],
              role: isPermanentSuperAdmin ? 'super_admin' : existing.role,
              status: isPermanentSuperAdmin ? 'approved' : existing.status
            })
            .eq('id', existing.id);

          return await getUserProfile(email);
        } else {
          const payload = {
            email,
            display_name: user.user_metadata?.full_name || email.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url || '',
            age: extra.age || null,
            date_of_birth: extra.date_of_birth || null,
            gender: extra.gender || null,
            role: isPermanentSuperAdmin ? 'super_admin' : 'admin',
            status: isPermanentSuperAdmin ? 'approved' : 'pending',
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
    updateProduct,
    deleteProduct,
    insertOrder,
    getOrders,
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

