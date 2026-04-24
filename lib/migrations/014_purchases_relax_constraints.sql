-- Migration 014: Relax NOT NULL constraints on legacy purchases columns
-- The purchases table was created by an older migration with extra required fields
-- (amount_paid, creator_commission, platform_fee, payment_method, transaction_id).
-- We only need user_id, pattern_id, and purchased_at for the digital library.
-- Run this in your Supabase SQL Editor.

ALTER TABLE public.purchases
  ALTER COLUMN amount_paid DROP NOT NULL,
  ALTER COLUMN creator_commission DROP NOT NULL,
  ALTER COLUMN platform_fee DROP NOT NULL,
  ALTER COLUMN payment_method DROP NOT NULL,
  ALTER COLUMN transaction_id DROP NOT NULL;
