-- ==========================================================================
-- AUVARE CLOTHING STORE - SUPABASE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor (supabase.com -> SQL Editor -> Run)
-- ==========================================================================

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    sizes JSONB DEFAULT '["S", "M", "L", "XL", "XXL"]'::jsonb,
    chest TEXT DEFAULT '40"',
    length TEXT DEFAULT '27"',
    condition TEXT DEFAULT '9.5/10 (Mint Condition)',
    price NUMERIC NOT NULL,
    image TEXT NOT NULL,
    sold BOOLEAN DEFAULT false,
    instagram_url TEXT DEFAULT 'https://www.instagram.com/auvare_official/',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id BIGSERIAL PRIMARY KEY,
    order_id TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_zone TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    trx_id TEXT,
    items JSONB NOT NULL,
    subtotal NUMERIC NOT NULL,
    shipping_cost NUMERIC NOT NULL,
    total_amount NUMERIC NOT NULL,
    notes TEXT,
    order_status TEXT DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Store Contact Information Table
CREATE TABLE IF NOT EXISTS public.store_contact_info (
    id TEXT PRIMARY KEY DEFAULT 'main',
    whatsapp_number TEXT NOT NULL DEFAULT '01700-000000',
    bkash_number TEXT NOT NULL DEFAULT '01700-000000',
    nagad_number TEXT NOT NULL DEFAULT '01700-000000',
    instagram_handle TEXT NOT NULL DEFAULT '@auvare_official',
    instagram_url TEXT NOT NULL DEFAULT 'https://www.instagram.com/auvare_official/',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_contact_info ENABLE ROW LEVEL SECURITY;

-- 5. Create Public Policies (Allows storefront to read products & place orders)
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" ON public.products
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public and Admin can manage products" ON public.products;
CREATE POLICY "Public and Admin can manage products" ON public.products
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
CREATE POLICY "Public can insert orders" ON public.orders
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view orders" ON public.orders;
CREATE POLICY "Public can view orders" ON public.orders
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view store_contact_info" ON public.store_contact_info;
CREATE POLICY "Public can view store_contact_info" ON public.store_contact_info
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public and Admin can manage store_contact_info" ON public.store_contact_info;
CREATE POLICY "Public and Admin can manage store_contact_info" ON public.store_contact_info
    FOR ALL USING (true);

-- 6. Insert Default Seed Products with S, M, L, XL, XXL Sizes
INSERT INTO public.products (id, title, category, sizes, chest, length, condition, price, image, sold, instagram_url, description)
VALUES 
  (
    'auv-1', 
    'Vintage Japanese Minimal Graphic Tee', 
    'T-Shirts', 
    '["S", "M", "L", "XL", "XXL"]'::jsonb, 
    '38"-46"', 
    '24"-30"', 
    '9.5/10 (Mint Condition)', 
    999, 
    'assets/images/item1.jpg', 
    false, 
    'https://www.instagram.com/auvare_official/p/De4NPJkDzIY/', 
    'Authentic imported vintage tee with subtle graphics. Soft washed cotton with single-stitch detailing.'
  ),
  (
    'auv-2', 
    'Vintage Boxy Heavyweight Polo Tee', 
    'Shirts', 
    '["S", "M", "L", "XL", "XXL"]'::jsonb, 
    '40"-48"', 
    '26"-31"', 
    '9/10 (Like New)', 
    799, 
    'assets/images/item2.jpg', 
    false, 
    'https://www.instagram.com/auvare_official/p/De4M6Qpj0yl/', 
    'Thick structured collar and drop-shoulder vintage boxy silhouette. Extremely comfortable and versatile.'
  ),
  (
    'auv-3', 
    '90s Oversized Streetwear Graphic Tee', 
    'T-Shirts', 
    '["S", "M", "L", "XL", "XXL"]'::jsonb, 
    '42"-48"', 
    '27"-31"', 
    '9/10 (Vintage Fade)', 
    799, 
    'assets/images/item3.jpg', 
    true, 
    'https://www.instagram.com/auvare_official/p/De4Mk8rD-zQ/', 
    'Classic vintage sun-faded wash with authentic patina. Sold out on last drop.'
  ),
  (
    'auv-4', 
    'Vintage Washed Everyday Minimalist Tee', 
    'T-Shirts', 
    '["S", "M", "L", "XL", "XXL"]'::jsonb, 
    '38"-46"', 
    '25"-30"', 
    '9.5/10 (Near Deadstock)', 
    799, 
    'assets/images/item4.jpg', 
    false, 
    'https://www.instagram.com/auvare_official/p/De4MEWvD-4r/', 
    'Ultra-breathable premium imported cotton. Relaxed streetwear fit with reinforced crew neck.'
  ),
  (
    'auv-5', 
    'Vintage Heritage Corduroy Workshirt', 
    'Shirts', 
    '["S", "M", "L", "XL", "XXL"]'::jsonb, 
    '40"-46"', 
    '28"-31"', 
    '9.5/10 (Pristine)', 
    1250, 
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=80', 
    false, 
    'https://www.instagram.com/auvare_official/', 
    'Rich ribbed corduroy in earth-toned camel shade. Dual flap utility chest pockets.'
  ),
  (
    'auv-6', 
    'Vintage British Racing Harrington Jacket', 
    'Jackets', 
    '["S", "M", "L", "XL", "XXL"]'::jsonb, 
    '42"-48"', 
    '27"-31"', 
    '9/10 (Crisp Shell)', 
    1850, 
    'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=700&q=80', 
    false, 
    'https://www.instagram.com/auvare_official/', 
    'Classic checkered tartan inner lining, YKK brass zip, and weather-resistant shell.'
  ),
  (
    'auv-7', 
    'Vintage Wide-Leg Washed Denim Trousers', 
    'Pants', 
    '["S", "M", "L", "XL", "XXL"]'::jsonb, 
    'Waist 28"-38"', 
    '38"-42"', 
    '9/10 (Natural Whisker Fade)', 
    1450, 
    'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=700&q=80', 
    false, 
    'https://www.instagram.com/auvare_official/', 
    'Heavyweight selvedge denim with natural vintage honeycombs and vintage wash.'
  ),
  (
    'auv-8', 
    '90s Retro Colorblock Sport Windbreaker', 
    'Jackets', 
    '["S", "M", "L", "XL", "XXL"]'::jsonb, 
    '42"-48"', 
    '27"-31"', 
    '9/10 (Vibrant)', 
    1650, 
    'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=700&q=80', 
    false, 
    'https://www.instagram.com/auvare_official/', 
    'Retro lightweight nylon shell with elasticized cuffs and drawstring hem.'
  )
ON CONFLICT (id) DO NOTHING;

-- ==========================================================================
-- 7. Create Auth Users & Admin RBAC Table
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.auth_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    age INTEGER,
    date_of_birth DATE,
    gender TEXT, -- 'male', 'female', 'other'
    role TEXT NOT NULL DEFAULT 'customer', -- 'super_admin', 'admin', 'customer'
    status TEXT NOT NULL DEFAULT 'pending', -- 'approved', 'pending', 'rejected'
    request_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_sign_in_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.auth_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view auth_users" ON public.auth_users;
CREATE POLICY "Public can view auth_users" ON public.auth_users
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert into auth_users" ON public.auth_users;
CREATE POLICY "Public can insert into auth_users" ON public.auth_users
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public and Admin can update auth_users" ON public.auth_users;
CREATE POLICY "Public and Admin can update auth_users" ON public.auth_users
    FOR UPDATE USING (true);

-- Seed Permanent Super Admin: Md Abir Shikdar
INSERT INTO public.auth_users (
    email,
    display_name,
    avatar_url,
    age,
    gender,
    role,
    status
)
VALUES (
    'abirshikdar2@gmail.com',
    'Md Abir Shikdar',
    'https://lh3.googleusercontent.com/a/default-user',
    23,
    'male',
    'super_admin',
    'approved'
)
ON CONFLICT (email) DO UPDATE SET
    role = 'super_admin',
    status = 'approved',
    display_name = 'Md Abir Shikdar';

-- Seed Default Store Contact Info
INSERT INTO public.store_contact_info (
    id,
    whatsapp_number,
    bkash_number,
    nagad_number,
    instagram_handle,
    instagram_url
) VALUES (
    'main',
    '01700-000000',
    '01700-000000',
    '01700-000000',
    '@auvare_official',
    'https://www.instagram.com/auvare_official/'
) ON CONFLICT (id) DO NOTHING;

