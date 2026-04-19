# 🚀 Supabase Setup - Quick Start Guide

Complete this checklist in order. Takes ~10 minutes.

## ✅ Step 1: Create Supabase Project (2 min)
- [ ] Go to https://supabase.com
- [ ] Sign up / Log in
- [ ] Click "New Project"
  - Project name: `crochet-community`
  - Pick a region
  - Create strong password
- [ ] Wait for initialization (~2 min)

## ✅ Step 2: Run Database Schema (2 min)
- [ ] In Supabase Dashboard → SQL Editor → New Query
- [ ] Open `lib/supabase-schema.sql`
- [ ] Copy ALL content and paste into SQL editor
- [ ] Click "Run"
- [ ] Check for ✅ Success message
- [ ] Should see tables: users, sellers, products, chat_sessions, etc.

## ✅ Step 3: Get Credentials (1 min)
- [ ] Go to Settings → API
- [ ] Copy these 3 values:
  ```
  1. Project URL → NEXT_PUBLIC_SUPABASE_URL
  2. anon public key → NEXT_PUBLIC_SUPABASE_ANON_KEY
  3. service_role key → SUPABASE_SERVICE_ROLE_KEY
  ```

## ✅ Step 4: Create .env.local (1 min)
```bash
cp .env.example .env.local
```

Edit `.env.local` and paste your 3 values:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## ✅ Step 5: Enable Realtime (Optional, 1 min)
For real-time chat & activity logs:

- [ ] Supabase Dashboard → Database → Publications
- [ ] Click `supabase_realtime`
- [ ] Toggle ON:
  - `chat_messages`
  - `chat_sessions`
  - `activity_logs`
  - `donations`

## ✅ Step 6: Install Dependencies (2 min)
```bash
npm install @supabase/supabase-js @supabase/ssr
npm install --legacy-peer-deps
```

## ✅ Step 7: Update Auth Context
In `app/layout.tsx`:

**OLD:**
```tsx
import { AuthProvider } from '@/context/auth-context';
```

**NEW:**
```tsx
import { AuthProvider } from '@/context/auth-context-supabase';
```

That's it! Supabase auth now handles all passwords (secure in cloud).

## ✅ Step 8: Add Donation Widget
In your layout or main app component:

```tsx
'use client';

import { DonationWidget } from '@/components/donation/donation-widget';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
          <DonationWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
```

## ✅ Step 9: Add Donation Page
Create `app/donate/page.tsx`:

```tsx
import DonationPage from '@/components/donation/donation-page';

export default function DonatePage() {
  return <DonationPage />;
}
```

Add link in navigation (header/navbar):
```tsx
<Link href="/donate">Support Us ❤️</Link>
```

## ✅ Step 10: Add Admin Activity Log
In your admin dashboard:

```tsx
import { ActivityLogViewer } from '@/components/admin/activity-log-viewer';

export default function AdminDashboard() {
  return (
    <div>
      {/* Other admin stuff */}
      <ActivityLogViewer />
    </div>
  );
}
```

## ✅ Step 11: Add Chat to Seller Dashboard
In seller dashboard:

```tsx
import { SellerRequestChatForm } from '@/components/chat/chat-components';

export default function SellerDashboard() {
  return (
    <div>
      {/* Other seller stuff */}
      <SellerRequestChatForm />
    </div>
  );
}
```

## ✅ Step 12: Add Chat to Admin Dashboard
In admin dashboard:

```tsx
import { AdminChatPanel } from '@/components/chat/chat-components';

export default function AdminDashboard() {
  return (
    <div>
      {/* Other admin stuff */}
      <AdminChatPanel />
    </div>
  );
}
```

## ✅ Step 13: Start the App
```bash
npm run dev
```

Visit http://localhost:3000 🎉

## 🧪 Test Everything
- [ ] Sign up a new account
- [ ] User → Seller dashboard → Request help → Message shows in admin panel
- [ ] Admin → Responds → Real-time message appears
- [ ] Visit /donate → Donate $5 → Stats update
- [ ] Activity log shows: donation created, chat started, etc.

## ✅ Done!
You now have:
- ✅ Cloud database (no local setup)
- ✅ Cloud auth (passwords secure)
- ✅ Donation system
- ✅ Real-time chat
- ✅ Activity logging
- ✅ FIFO products

## 📚 Reference
- Full guide: `IMPLEMENTATION.md`
- Supabase docs: https://docs.supabase.com
- See examples in: `lib/supabase.ts`

## 🆘 Troubleshooting
**"RLS policy error"** → User not logged in
**"Messages not showing"** → Enable realtime for chat_messages in Supabase
**"No activities"** → Check admin role in users table
**"Donations fail"** → Make sure auth context is updated

Need more help? Check `IMPLEMENTATION.md` for detailed explanations!
