-- Migration: Add pattern_testing_applications table + update users for pattern testing approval
-- Run this in Supabase SQL Editor

-- 1. Add pattern testing columns to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS pattern_testing_approved BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS tester_level INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tester_xp INTEGER DEFAULT 0;

-- 2. Create pattern_testing_applications table
CREATE TABLE IF NOT EXISTS public.pattern_testing_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  why_testing TEXT NOT NULL,
  experience_level TEXT NOT NULL CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  availability TEXT NOT NULL,
  comments TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'disapproved')),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_pt_applications_user_id ON public.pattern_testing_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_pt_applications_status ON public.pattern_testing_applications(status);

-- 4. Enable RLS
ALTER TABLE public.pattern_testing_applications ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies
CREATE POLICY "Users can read own pt applications"
  ON public.pattern_testing_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pt applications"
  ON public.pattern_testing_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all pt applications"
  ON public.pattern_testing_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update pt applications"
  ON public.pattern_testing_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 6. Add seller_generated_password to users (encrypted, for admin-generated seller credentials)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS seller_generated_password TEXT;

-- 7. Create orders table if not exists (for admin to see what users bought)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all orders"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
