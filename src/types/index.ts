/**
 * AUVARE - Core TypeScript Domain Models
 * Strictly type-checked contracts for Products, Variants, Orders, and Admin Users.
 */

export type GarmentCategory = 'T-Shirts' | 'Shirts' | 'Jackets' | 'Pants' | 'Accessories';

export type GarmentSize = 'S' | 'M' | 'L' | 'XL' | 'XXL';

export type ProductStatus = 'available' | 'sold' | 'archived';

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Washed Black", "Acid Wash Edition"
  price?: number | null; // Optional override price in BDT; falls back to base price
  sizes: GarmentSize[];
  status: ProductStatus;
  sku?: string;
}

export interface Product {
  id: string;
  title: string;
  slug?: string;
  description: string;
  category: string;
  price: number; // Base price in BDT
  chest?: string;
  length?: string;
  condition: string;
  status: ProductStatus;
  image: string; // Primary cover image
  images: string[]; // Multi-image gallery URLs
  sizes: GarmentSize[];
  size?: GarmentSize;
  variants: ProductVariant[];
  instagramUrl?: string;
  sold?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'rocket';
export type DeliveryZone = 'inside' | 'outside';
export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  title: string;
  size: GarmentSize | string;
  variantId?: string;
  variantName?: string;
  unitPrice: number;
  quantity: number;
  totalPrice?: number;
}

export interface Order {
  id: string; // e.g. "AUV-727907"
  orderId?: string;
  customerName: string;
  name?: string;
  customerPhone: string;
  phone?: string;
  deliveryAddress: string;
  address?: string;
  deliveryZone: DeliveryZone;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  shipping?: number;
  totalAmount: number;
  total?: number;
  paymentMethod: PaymentMethod;
  paymentNumber?: string;
  paymentSenderNumber?: string;
  senderPhone?: string;
  transactionId?: string;
  trxId?: string;
  status: OrderStatus;
  orderStatus?: OrderStatus;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UserRole = 'super_admin' | 'admin' | 'moderator';
export type UserStatus = 'active' | 'pending' | 'blocked';

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface SiteSettings {
  whatsapp_number: string;
  bkash_number: string;
  nagad_number: string;
  instagram_handle: string;
  instagram_url: string;
  inside_dhaka_delivery: number;
  outside_dhaka_delivery: number;
}
