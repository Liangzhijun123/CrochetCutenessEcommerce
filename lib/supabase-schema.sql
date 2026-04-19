-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgtrgm";

-- Users table (extends Supabase auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'seller', 'admin')),
  is_seller BOOLEAN DEFAULT FALSE,
  seller_id UUID UNIQUE,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sellers table
CREATE TABLE IF NOT EXISTS public.sellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL,
  shop_description TEXT,
  banner_url TEXT,
  rating DECIMAL(3, 2) DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products table (with FIFO tracking)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT,
  image_url TEXT,
  file_url TEXT, -- Pattern file
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  upload_order INTEGER NOT NULL, -- For FIFO algorithm
  is_featured BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  purchases INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chat sessions table
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('admin_seller', 'admin_customer', 'seller_customer')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE
);

-- Donations table
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('supporter', 'patron', 'benefactor', 'custom')),
  message TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activity log table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL, -- 'product', 'chat', 'donation', 'user', etc.
  resource_id UUID,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chat session requests (for sellers/customers to request admin help)
CREATE TABLE IF NOT EXISTS public.chat_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  requester_type TEXT NOT NULL CHECK (requester_type IN ('seller', 'customer')),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_sellers_user_id ON public.sellers(user_id);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_upload_order ON public.products(upload_order DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_admin_id ON public.chat_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON public.chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON public.donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_requests_status ON public.chat_requests(status);

-- Safe admin check function (SECURITY DEFINER bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security (RLS) Policies

-- Users table RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can create their own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Admin can view all users" ON public.users;

-- Create a simple policy that doesn't cause recursion
CREATE POLICY "Allow insert for new users"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow reading own data
CREATE POLICY "Allow select own user"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow updates to own data
CREATE POLICY "Allow update own user"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Admin can view all users (uses SECURITY DEFINER function to avoid recursion)
CREATE POLICY "Admin can view all users" ON public.users
  FOR SELECT USING (public.is_admin());

-- Products table RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Sellers can insert their own products" ON public.products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sellers 
      WHERE id = seller_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can update their own products" ON public.products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.sellers 
      WHERE id = seller_id AND user_id = auth.uid()
    )
  );

-- Chat sessions RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their chat sessions" ON public.chat_sessions
  FOR SELECT USING (
    admin_id = auth.uid() OR 
    seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()) OR
    customer_id = auth.uid() OR
    public.is_admin()
  );

CREATE POLICY "Admin can manage chat sessions" ON public.chat_sessions
  FOR UPDATE USING (public.is_admin());

-- Chat messages RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their sessions" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions cs
      WHERE cs.id = chat_messages.session_id AND (
        cs.admin_id = auth.uid() OR 
        cs.customer_id = auth.uid() OR
        cs.seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can insert messages in their sessions" ON public.chat_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.chat_sessions cs
      WHERE cs.id = session_id AND (
        cs.admin_id = auth.uid() OR 
        cs.customer_id = auth.uid() OR
        cs.seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid())
      )
    )
  );

-- Donations RLS
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view donations (non-personal data)" ON public.donations
  FOR SELECT USING (is_anonymous OR donor_id = auth.uid());

CREATE POLICY "Users can view their own donations" ON public.donations
  FOR SELECT USING (donor_id = auth.uid());

CREATE POLICY "Users can insert donations" ON public.donations
  FOR INSERT WITH CHECK (donor_id = auth.uid() OR donor_id IS NULL);

-- Activity logs RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all activity logs" ON public.activity_logs
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Users can view their own activity" ON public.activity_logs
  FOR SELECT USING (user_id = auth.uid());

-- Chat requests RLS
ALTER TABLE public.chat_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their chat requests" ON public.chat_requests
  FOR SELECT USING (requester_id = auth.uid());

CREATE POLICY "Admin can view all chat requests" ON public.chat_requests
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Users can create chat requests" ON public.chat_requests
  FOR INSERT WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Admin can update chat requests" ON public.chat_requests
  FOR UPDATE USING (public.is_admin());

-- Realtime subscriptions (enable in Supabase dashboard)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_sessions;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
