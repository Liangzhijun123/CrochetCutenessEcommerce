# 🔧 Registration Fix Guide

## ❌ Problem
Registration was failing because the database was missing a **Row Level Security (RLS) INSERT policy** for the `users` table.

When you signed up, Supabase Auth created your account, but the app couldn't save your profile to the database because the RLS policy didn't allow inserts.

## ✅ Solution

### Step 1: Open Supabase Dashboard
1. Go to https://app.supabase.com
2. Select your **crochet-community** project

### Step 2: Run the Fix SQL
1. Go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy and paste this SQL:

```sql
-- Add missing INSERT policy for users table
DROP POLICY IF EXISTS "Users can create their own profile" ON public.users;

CREATE POLICY "Users can create their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

4. Click **Run** (or press Ctrl+Enter)
5. You should see: ✅ Success

### Step 3: Verify the Fix
Run this query to check all policies on the users table:

```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
```

You should see 4 policies:
- ✅ Users can view their own data
- ✅ Users can create their own profile (NEWLY ADDED)
- ✅ Users can update their own data
- ✅ Admin can view all users

## 🧪 Test Registration

1. Go back to **http://localhost:3000**
2. Click **Register**
3. Fill in: Name, Email, Password
4. Submit
5. Check browser console (F12) for logs:
   - `📝 Starting signup for: your@email.com`
   - `✅ User created in auth: [user-id]`
   - `📊 Creating user profile in database...`
   - `✅ User profile created: [profile-data]`

If you see all ✅ messages, registration works! 🎉

## 📊 Check Your Data

After successful signup, verify the database stored your info:

```sql
SELECT id, email, full_name, role, created_at FROM public.users 
WHERE email = 'your@email.com';
```

You should see your profile!

## 🔐 Why This Happened

The RLS policies are security rules that control who can:
- **SELECT** (view): See which user data
- **INSERT** (create): Create new records
- **UPDATE** (modify): Update which data
- **DELETE** (remove): Delete which data

By default, the schema had SELECT, UPDATE, and ADMIN policies, but was missing the INSERT policy that allows new users to create their own profile.

## ✨ What Changed

### File: `lib/supabase-schema.sql`
- Added: `CREATE POLICY "Users can create their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);`

### File: `context/auth-context-supabase.tsx`
- Added detailed console logging to track signup progress
- Better error messages for debugging

## 💾 Does the Database Remember Me?

**YES!** After the fix:
- ✅ Your profile is stored in Supabase database
- ✅ Your password is encrypted in Supabase Auth (never stored locally)
- ✅ When you sign in, Supabase validates your credentials
- ✅ Your session is maintained via JWT token
- ✅ When you refresh, the session persists

The app should now:
1. Let you sign up ✅
2. Remember your login ✅
3. Keep you logged in even after page refresh ✅
4. Store all your profile data ✅

## 🆘 Still Having Issues?

1. **Check Supabase logs:**
   - Go to Supabase Dashboard → Logs
   - Look for RLS policy errors

2. **Check browser console (F12):**
   - Application → Cookies → Look for `sb-auth-token`
   - This JWT token is what keeps you logged in

3. **Verify table exists:**
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_name = 'users';
   ```

4. **Check all RLS policies:**
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'users' 
   ORDER BY policyname;
   ```

Need more help? Check `SETUP_SUPABASE.md` for complete setup steps!
