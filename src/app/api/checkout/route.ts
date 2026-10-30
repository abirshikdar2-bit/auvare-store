import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { formatOrderForSupabase } from '@/lib/supabase/products';

const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  customerPhone: z.string().min(10, 'Valid phone number is required'),
  deliveryAddress: z.string().min(5, 'Delivery address is required'),
  deliveryZone: z.enum(['inside', 'outside']),
  notes: z.string().optional(),
  paymentMethod: z.enum(['cod', 'bkash', 'nagad', 'rocket']),
  paymentSenderNumber: z.string().nullable().optional(),
  transactionId: z.string().nullable().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      title: z.string().optional(),
      price: z.number().optional(),
      size: z.string().default('M'),
      variantId: z.string().nullable().optional(),
      quantity: z.number().int().positive().default(1),
    })
  ).min(1, 'Bag cannot be empty'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = checkoutSchema.parse(body);

    const supabase = await createClient();

    // 1. Fetch live products from Supabase to verify pricing
    const productIds = data.items.map(i => i.productId);
    const { data: dbProducts, error: pErr } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    if (pErr) {
      console.warn('[Checkout API] Warning fetching products for verification:', pErr);
    }

    // 2. Authoritative Price Calculation
    let subtotal = 0;
    const verifiedItems = data.items.map(cartItem => {
      const product = (dbProducts || []).find(p => String(p.id) === String(cartItem.productId));

      let title = product?.title || cartItem.title || 'Curated Drop';
      let unitPrice = 0;
      if (product) {
        unitPrice = typeof product.price === 'number' ? product.price : parseInt(product.price || '0', 10);
      } else if (typeof cartItem.price === 'number') {
        unitPrice = cartItem.price;
      }

      let variantName: string | undefined = undefined;

      // Extract variants if any
      if (product) {
        let variants: any[] = [];
        if (Array.isArray(product.variants)) variants = product.variants;
        else if (typeof product.variants === 'string') {
          try { variants = JSON.parse(product.variants); } catch {}
        }
        if (!variants || variants.length === 0) {
          const varMatch = (product.description || '').match(/<!--AUVARE_VARIANTS:(.*?)-->/);
          if (varMatch && varMatch[1]) {
            try { variants = JSON.parse(varMatch[1]); } catch {}
          }
        }

        if (cartItem.variantId) {
          const v = variants.find((v: any) => v.id === cartItem.variantId);
          if (v) {
            variantName = v.name;
            if (v.price) unitPrice = typeof v.price === 'number' ? v.price : parseInt(v.price, 10);
          }
        }
      }

      const itemTotal = unitPrice * cartItem.quantity;
      subtotal += itemTotal;

      return {
        productId: product?.id || cartItem.productId,
        title,
        size: cartItem.size,
        variant: variantName || null,
        price: unitPrice,
        quantity: cartItem.quantity,
        total: itemTotal,
      };
    });

    const deliveryCharge = data.deliveryZone === 'inside' ? 70 : 130;
    const totalAmount = subtotal + deliveryCharge;
    const orderId = `AUV-${Math.floor(100000 + Math.random() * 900000)}`;

    // 3. Format strictly to match Supabase 'orders' PostgreSQL schema
    const orderRecord = formatOrderForSupabase({
      orderId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      deliveryAddress: data.deliveryAddress,
      deliveryZone: data.deliveryZone,
      paymentMethod: data.paymentMethod,
      paymentSenderNumber: data.paymentSenderNumber,
      transactionId: data.transactionId,
      items: verifiedItems,
      subtotal,
      shippingCost: deliveryCharge,
      totalAmount,
      notes: data.notes,
      orderStatus: 'pending',
    });

    // 4. Save order into Supabase
    const { data: insertedOrder, error: insertErr } = await supabase
      .from('orders')
      .insert([orderRecord])
      .select()
      .single();

    if (insertErr) {
      console.error('[Checkout API] Supabase insert error:', insertErr);
      return NextResponse.json({ error: `Supabase order failed: ${insertErr.message}` }, { status: 500 });
    }

    // 5. Instantly invalidate cache so Admin Portal and storefront update
    try {
      revalidatePath('/admin');
      revalidatePath('/');
    } catch {}

    return NextResponse.json({
      success: true,
      orderId,
      totalAmount,
      order: insertedOrder,
    }, { status: 201 });
  } catch (error: any) {
    console.error('[Checkout API Error]:', error);
    return NextResponse.json({ error: error.message || 'Invalid order request' }, { status: 400 });
  }
}
