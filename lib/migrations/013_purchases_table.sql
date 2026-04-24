-- Migration 013: Create purchases table for digital library
-- Run this in your Supabase SQL editor: https://app.supabase.com → SQL Editor

-- The purchases table records every PDF/digital product a user has bought.
-- user_id references auth.users so it works even before a public.users profile row is created.
-- pattern_id references public.products (the "pattern" naming is legacy).
-- The UNIQUE constraint prevents duplicate entries if the same product is purchased twice.

CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, pattern_id)
);

-- Fast lookup indexes
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_pattern_id ON public.purchases(pattern_id);
CREATE INDEX IF NOT EXISTS idx_purchases_purchased_at ON public.purchases(purchased_at DESC);

-- Row Level Security: users can only read/insert their own purchases.
-- This lets the browser-side Supabase client work without needing the service role key.
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON public.purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases"
  ON public.purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);
