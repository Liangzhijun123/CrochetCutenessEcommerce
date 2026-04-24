-- Migration 015: Fix purchases.pattern_id foreign key to point at public.products
-- The old migration referenced public.patterns; the app uses public.products.
-- Run this in your Supabase SQL Editor.

-- Drop the old FK constraint (name may vary — find the real name below if this fails)
ALTER TABLE public.purchases
  DROP CONSTRAINT IF EXISTS purchases_pattern_id_fkey;

-- Re-add the FK pointing at public.products
ALTER TABLE public.purchases
  ADD CONSTRAINT purchases_pattern_id_fkey
    FOREIGN KEY (pattern_id)
    REFERENCES public.products(id)
    ON DELETE CASCADE;
