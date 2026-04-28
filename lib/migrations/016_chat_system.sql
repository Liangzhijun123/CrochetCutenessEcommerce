-- ============================================================
-- Migration 016: Chat System
-- Extends existing chat_sessions with product context and title.
-- Adds proper RLS policies for the two-channel chat system.
-- ============================================================

-- Add product_id and title to chat_sessions if not present
ALTER TABLE public.chat_sessions
  ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS unread_customer INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unread_seller INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unread_admin INTEGER NOT NULL DEFAULT 0;

-- Ensure seller_customer is a valid session_type (original schema had admin_seller / admin_customer)
-- We drop and recreate the check constraint to include seller_customer
ALTER TABLE public.chat_sessions
  DROP CONSTRAINT IF EXISTS chat_sessions_session_type_check;

ALTER TABLE public.chat_sessions
  ADD CONSTRAINT chat_sessions_session_type_check
  CHECK (session_type IN ('admin_seller', 'admin_customer', 'seller_customer'));

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_sessions_customer_id ON public.chat_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_seller_id ON public.chat_sessions(seller_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON public.chat_sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id, created_at);

-- ── RLS ─────────────────────────────────────────────────────

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop old policies if any exist (idempotent)
DROP POLICY IF EXISTS "chat_sessions_select" ON public.chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_insert" ON public.chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_update" ON public.chat_sessions;
DROP POLICY IF EXISTS "chat_messages_select" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_insert" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_update" ON public.chat_messages;

-- Participants can view their sessions
CREATE POLICY "chat_sessions_select" ON public.chat_sessions
  FOR SELECT USING (
    auth.uid() = customer_id
    OR auth.uid() = admin_id
    OR EXISTS (SELECT 1 FROM public.sellers s WHERE s.id = seller_id AND s.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- Any authenticated user can create a session
CREATE POLICY "chat_sessions_insert" ON public.chat_sessions
  FOR INSERT WITH CHECK (
    auth.uid() = customer_id
    OR auth.uid() = admin_id
    OR EXISTS (SELECT 1 FROM public.sellers s WHERE s.id = seller_id AND s.user_id = auth.uid())
  );

-- Participants can update (mark read, close)
CREATE POLICY "chat_sessions_update" ON public.chat_sessions
  FOR UPDATE USING (
    auth.uid() = customer_id
    OR auth.uid() = admin_id
    OR EXISTS (SELECT 1 FROM public.sellers s WHERE s.id = seller_id AND s.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- Messages: participants can read
CREATE POLICY "chat_messages_select" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions cs
      WHERE cs.id = session_id
        AND (
          cs.customer_id = auth.uid()
          OR cs.admin_id = auth.uid()
          OR EXISTS (SELECT 1 FROM public.sellers s WHERE s.id = cs.seller_id AND s.user_id = auth.uid())
          OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
        )
    )
  );

-- Messages: participants can insert
CREATE POLICY "chat_messages_insert" ON public.chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.chat_sessions cs
      WHERE cs.id = session_id
        AND (
          cs.customer_id = auth.uid()
          OR cs.admin_id = auth.uid()
          OR EXISTS (SELECT 1 FROM public.sellers s WHERE s.id = cs.seller_id AND s.user_id = auth.uid())
        )
    )
  );

-- Messages: participants can update (mark as read)
CREATE POLICY "chat_messages_update" ON public.chat_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions cs
      WHERE cs.id = session_id
        AND (
          cs.customer_id = auth.uid()
          OR cs.admin_id = auth.uid()
          OR EXISTS (SELECT 1 FROM public.sellers s WHERE s.id = cs.seller_id AND s.user_id = auth.uid())
        )
    )
  );

-- Enable realtime for live chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_sessions;
