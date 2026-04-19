-- ============================================================
-- XP / Rewards System Tables
-- Run this in Supabase SQL Editor after the main schema
-- ============================================================

-- User XP profiles (one row per user, created on signup)
CREATE TABLE IF NOT EXISTS public.user_xp (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- XP transaction history (append-only log)
CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'pattern_pdf', 'plushie', 'pattern_testing', 'signup_bonus', 'review', 'referral', 'admin_adjustment'
  )),
  xp_amount INTEGER NOT NULL,
  description TEXT,
  order_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for leaderboard queries (sorted by total_xp descending)
CREATE INDEX IF NOT EXISTS idx_user_xp_total_xp ON public.user_xp(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_xp_user_id ON public.user_xp(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON public.xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_created_at ON public.xp_transactions(created_at DESC);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;

-- Leaderboard: all authenticated users can read all user_xp rows
CREATE POLICY "Anyone authenticated can read leaderboard"
  ON public.user_xp FOR SELECT
  TO authenticated
  USING (true);

-- Users can read their own XP transactions
CREATE POLICY "Users can read own XP history"
  ON public.xp_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admin can read all XP transactions
CREATE POLICY "Admin can read all XP transactions"
  ON public.xp_transactions FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- NOTE: INSERT/UPDATE on user_xp and xp_transactions is done via
-- service_role key from API routes (bypasses RLS). This prevents
-- users from inflating their own XP.

-- ============================================================
-- Helper: compute tier from XP
-- ============================================================
CREATE OR REPLACE FUNCTION public.compute_tier(xp INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF xp >= 3000 THEN RETURN 'platinum';
  ELSIF xp >= 1000 THEN RETURN 'gold';
  ELSIF xp >= 200 THEN RETURN 'silver';
  ELSE RETURN 'bronze';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- Trigger: auto-update tier when total_xp changes
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_xp_tier()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tier := public.compute_tier(NEW.total_xp);
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_xp_tier ON public.user_xp;
CREATE TRIGGER trg_update_xp_tier
  BEFORE UPDATE ON public.user_xp
  FOR EACH ROW
  EXECUTE FUNCTION public.update_xp_tier();
