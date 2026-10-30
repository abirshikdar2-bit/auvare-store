-- ==============================================================================
-- AUVARE Store: Store Contact Information Migration
-- Adds Email, Call/Phone Number, and Facebook/Messenger URL to store_contact_info
-- Run this script in the Supabase SQL Editor: https://supabase.com/dashboard/project/ypwnmocyzqwhbfptteql/sql
-- ==============================================================================

-- 1. Add missing columns if they do not already exist
ALTER TABLE public.store_contact_info 
ADD COLUMN IF NOT EXISTS email TEXT DEFAULT 'abirshikdar2@gmail.com',
ADD COLUMN IF NOT EXISTS call_number TEXT DEFAULT '01734018155',
ADD COLUMN IF NOT EXISTS facebook_url TEXT DEFAULT 'https://www.facebook.com/share/1JoPNYsMNz/?mibextid=wwXIfr';

-- 2. Populate the 'main' store contact info row with current official details
UPDATE public.store_contact_info
SET 
  email = 'abirshikdar2@gmail.com',
  call_number = '01734018155',
  facebook_url = 'https://www.facebook.com/share/1JoPNYsMNz/?mibextid=wwXIfr'
WHERE id = 'main';

-- 3. Enable Realtime broadcast for store_contact_info and auth_users so storefront and admin update instantly
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'store_contact_info'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.store_contact_info;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'auth_users'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.auth_users;
  END IF;
END $$;

