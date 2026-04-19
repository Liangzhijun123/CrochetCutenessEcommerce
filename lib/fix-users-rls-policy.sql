-- Fix: Add missing INSERT policy for users table
-- This allows authenticated users to create their own profile during signup

-- Check if policy exists before adding (safer)
DROP POLICY IF EXISTS "Users can create their own profile" ON public.users;

-- Create the missing INSERT policy
CREATE POLICY "Users can create their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Verify the policy was created
SELECT * FROM pg_policies WHERE tablename = 'users';
