-- ==========================================================================
-- AUVARE CLOTHING STORE - AUTH USERS & ADMIN RBAC SCHEMA
-- ==========================================================================

-- 1. Create auth_users table
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

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.auth_users ENABLE ROW LEVEL SECURITY;

-- 3. Policies
DROP POLICY IF EXISTS "Public can view auth_users" ON public.auth_users;
CREATE POLICY "Public can view auth_users" ON public.auth_users
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert into auth_users" ON public.auth_users;
CREATE POLICY "Public can insert into auth_users" ON public.auth_users
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public and Admin can update auth_users" ON public.auth_users;
CREATE POLICY "Public and Admin can update auth_users" ON public.auth_users
    FOR UPDATE USING (true);

-- 4. Seed Permanent Super Admin: Md Abir Shikdar
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

