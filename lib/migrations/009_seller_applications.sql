-- Migration: Add seller_applications table and pending_seller role
-- Run this in Supabase SQL Editor

-- 1. Update users table to allow 'pending_seller' role
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('customer', 'pending_seller', 'seller', 'admin'));

-- 2. Add seller_application_status column to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS seller_application_status TEXT
  DEFAULT 'none'
  CHECK (seller_application_status IN ('none', 'submitted', 'approved', 'rejected'));

-- 3. Create seller_applications table
CREATE TABLE IF NOT EXISTS public.seller_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  experience TEXT NOT NULL,
  reason TEXT NOT NULL,
  introduction TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_feedback TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 4. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_seller_applications_user_id ON public.seller_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_applications_status ON public.seller_applications(status);

-- 5. Enable RLS
ALTER TABLE public.seller_applications ENABLE ROW LEVEL SECURITY;

-- 6. RLS policies
-- Users can read their own applications
CREATE POLICY "Users can read own applications"
  ON public.seller_applications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own applications
CREATE POLICY "Users can insert own applications"
  ON public.seller_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all applications
CREATE POLICY "Admins can read all applications"
  ON public.seller_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Admins can update applications (approve/reject)
CREATE POLICY "Admins can update applications"
  ON public.seller_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
