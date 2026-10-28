import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

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

    if (pErr || !dbProducts || dbProducts.length === 0) {
      return NextResponse.json({ error: 'Failed to verify items in bag' }, { status: 400 });
    }

    // 2. Authoritative Price Calculation
    let subtotal = 0;
    const verifiedItems = data.items.map(cartItem => {
      const product = dbProducts.find(p => p.id === cartItem.productId);
      if (!product) {
        throw new Error(`Product not found: ${cartItem.productId}`);
      }

      let unitPrice = typeof product.price === 'number' ? product.price : parseInt(product.price || '0', 10);
      let variantName: string | undefined = undefined;

      let variants: any[] = [];
      if (Array.isArray(product.variants)) variants = product.variants;
      else if (typeof product.variants === 'string') {
        try { variants = JSON.parse(product.variants); } catch {}
      }

      if (cartItem.variantId) {
        const v = variants.find(v => v.id === cartItem.variantId);
        if (v) {
          variantName = v.name;
          if (v.price) unitPrice = typeof v.price === 'number' ? v.price : parseInt(v.price, 10);
        }
      }

      const itemTotal = unitPrice * cartItem.quantity;
      subtotal += itemTotal;

      return {
        productId: product.id,
        title: product.title,
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

    const orderRecord = {
      order_id: orderId,
      orderId: orderId,
      name: data.customerName,
      customer_name: data.customerName,
      phone: data.customerPhone,
      customer_phone: data.customerPhone,
      address: data.deliveryAddress,
      delivery_address: data.deliveryAddress,
      delivery_zone: data.deliveryZone,
      deliveryZone: data.deliveryZone,
      notes: data.notes || null,
      items: verifiedItems,
      subtotal,
      shipping: deliveryCharge,
      delivery_charge: deliveryCharge,
      total: totalAmount,
      total_amount: totalAmount,
      payment_method: data.paymentMethod,
      paymentMethod: data.paymentMethod,
      payment_number: data.paymentSenderNumber || null,
      paymentNumber: data.paymentSenderNumber || null,
      payment_sender_number: data.paymentSenderNumber || null,
      paymentSenderNumber: data.paymentSenderNumber || null,
      trx_id: data.transactionId || null,
      trxId: data.transactionId || null,
      status: 'pending',
      order_status: 'pending',
      orderStatus: 'pending',
      date: new Date().toLocaleString(),
      created_at: new Date().toISOString(),
    };

    // 3. Save order into Supabase
    const { error: insertErr } = await supabase
      .from('orders')
      .insert([orderRecord]);

    if (insertErr) {
      console.warn('[Checkout API] Supabase insert error:', insertErr);
    }

    return NextResponse.json({
      success: true,
      orderId,
      totalAmount,
    }, { status: 201 });
  } catch (error: any) {
    console.error('[Checkout API Error]:', error);
    return NextResponse.json({ error: error.message || 'Invalid order request' }, { status: 400 });
  }
}
