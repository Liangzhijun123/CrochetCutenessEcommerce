# Crochet Community Platform - Supabase Implementation Guide

This guide walks through setting up the complete platform with Supabase, including donations, real-time chat, activity logging, and more.

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project" and fill in:
   - **Name**: `crochet-community`
   - **Password**: Save this securely
   - **Region**: Choose closest to you
3. Wait for the project to initialize (~2 minutes)

### Step 2: Set Up Database Schema
1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `lib/supabase-schema.sql`
4. Paste into the SQL editor and click **Run**
5. You should see "✅ Success" - all 7 tables created!

### Step 3: Get Your Credentials
1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`
3. Create `.env.local` in your project root:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Step 4: Enable Realtime (Optional but Recommended)
1. In Supabase Dashboard, go to **Database** → **Publications**
2. Click on `supabase_realtime`
3. Toggle **ON** for these tables:
   - `chat_messages` (for live chat)
   - `chat_sessions` (for session updates)
   - `activity_logs` (for admin dashboard)
   - `donations` (for live donation feed)

### Step 5: Install Dependencies
```bash
npm install @supabase/supabase-js @supabase/ssr
npm install --legacy-peer-deps  # For React 19 compatibility
```

### Step 6: Update Auth Context
Replace the old auth context with Supabase version:

```bash
# Replace old auth context in your layout.tsx
# Import: import { AuthProvider } from '@/context/auth-context-supabase'
# Wrap your app: <AuthProvider>{children}</AuthProvider>
```

### Step 7: Start the App
```bash
npm run dev
```

Access at `http://localhost:3000` 🎉

---

## 📋 Complete Feature Breakdown

### 1. **Donation System** 💰

#### Files:
- `components/donation/donation-widget.tsx` - Floating donation button
- `components/donation/donation-page.tsx` - Full donation page
- `app/api/donate/route.ts` - Donation API

#### Features:
- **3 Tier System**:
  - Supporter ($5) - Thank you badge
  - Patron ($15) - Exclusive content
  - Benefactor ($50) - Premium support
- **Custom Amounts** - Donors can enter any amount
- **Anonymous Donations** - Option to hide donor name
- **Personal Messages** - Donors can leave messages
- **Real-time Stats** - Total raised, supporter count, average donation

#### Integration:
```tsx
// Add to your layout.tsx or main app
import { DonationWidget } from '@/components/donation/donation-widget';

export default function App() {
  return (
    <>
      {/* Your app content */}
      <DonationWidget />
    </>
  );
}
```

#### Add Donation Page to Navigation:
```tsx
// In your navigation/header component
<Link href="/donate">Support Us ❤️</Link>
```

Create `app/donate/page.tsx`:
```tsx
import DonationPage from '@/components/donation/donation-page';
export default DonationPage;
```

---

### 2. **Chat System** 💬

#### Files:
- `lib/supabase.ts` - Chat database helpers
- `components/chat/chat-components.tsx` - All chat UI components
- `app/api/chat/sessions/route.ts` - Create/list sessions
- `app/api/chat/sessions/[sessionId]/route.ts` - Manage sessions
- `app/api/chat/messages/route.ts` - Send/receive messages

#### Features:

**A. Admin-Seller Chat**
```tsx
// In seller dashboard
<SellerRequestChatForm 
  onSubmit={() => alert('Seller requested support!')} 
/>
```
Sellers can request admin help. Admin sees it in the admin panel and starts a chat session.

**B. Admin-Customer Mediation**
```tsx
// In customer account
<CustomerRequestMediationForm 
  onSubmit={() => alert('Mediation requested!')} 
/>
```
If customer has issue with seller, they request admin mediation.

**C. Admin Control Panel**
```tsx
// In admin dashboard
<AdminChatPanel />
```
Shows:
- Pending support requests (with reason)
- Active chat sessions
- Real-time message updates
- Ability to close conversations

**D. Real-time Messages**
Messages update in real-time using Supabase Realtime subscriptions.

---

### 3. **Activity Logging** 📊

#### Files:
- `components/admin/activity-log-viewer.tsx` - Admin activity dashboard

#### Features:
- **Real-time Activity Feed** - See all platform activity
- **Filterable** - By resource type and action
- **Resource Types**:
  - Products (uploads, updates)
  - Chat (sessions started, messages sent)
  - Donations (new donations)
  - Users (new signups, profile updates)
  - Sellers (new shops)
  - Orders (purchases)
- **Statistics** - Count by type

#### Integration:
```tsx
// In admin dashboard
import { ActivityLogViewer } from '@/components/admin/activity-log-viewer';

export default function AdminDashboard() {
  return <ActivityLogViewer />;
}
```

---

### 4. **FIFO Product Algorithm** 📦

#### Implementation:
The first product uploaded appears first in the shop.

```tsx
// When seller uploads product:
const product = await supabaseDB.createProduct({
  seller_id: sellerId,
  title: "Beautiful Amigurumi",
  price: 9.99,
  // ... other fields
  // upload_order is AUTO-INCREMENTED by the function
});

// Get products in FIFO order:
const products = await supabaseDB.getProductsByUploadOrder(20);
// Returns products ordered by upload_order DESC (newest first)
```

---

### 5. **Real-time Features** ⚡

All powered by Supabase Realtime subscriptions:

```tsx
// Subscribe to new messages
const subscription = subscribeToMessages(sessionId, (newMessage) => {
  setMessages(prev => [...prev, newMessage]);
});

// Subscribe to activity log updates
const subscription = subscribeToActivityLog((activity) => {
  setLogs(prev => [activity, ...prev]);
});

// Cleanup
return () => subscription.unsubscribe();
```

---

## 🔐 Security Features

### Row Level Security (RLS) Enabled
- Users can only see their own data
- Sellers can only manage their products
- Admins can see everything
- All policies defined in `lib/supabase-schema.sql`

### Authentication Flow
1. User signs up with email/password
2. Supabase handles password hashing
3. JWT token issued
4. User data stored in `users` table

---

## 📈 Data Flow Examples

### Example 1: Customer Purchases Product
```
1. Customer views product (upload_order used for sorting)
2. Customer clicks "Buy"
3. Creates order + updates product.purchases count
4. Activity logged: { action: 'purchased', resource_type: 'product' }
5. Admin sees in activity log instantly
```

### Example 2: Seller Requests Admin Help
```
1. Seller fills SellerRequestChatForm with issue
2. Creates chat_request record with status: 'pending'
3. Admin sees in AdminChatPanel
4. Admin clicks "Start Chat"
5. Creates chat_session with seller_id + admin_id
6. Both can now see ChatWindow and chat in real-time
7. Admin ends chat → session status: 'closed'
```

### Example 3: Customer Donates
```
1. Customer clicks donation widget or visits /donate
2. Selects tier (supporter/$5, patron/$15, benefactor/$50)
3. Submits donation via POST /api/donate
4. Creates donation record in DB
5. Activity logged
6. Stats updated in real-time
7. Recent donors list refreshes
```

---

## 🛠 API Endpoints

### Donations
- `POST /api/donate` - Create donation
- `GET /api/donate` - Get donations & stats

### Chat
- `GET/POST /api/chat/sessions` - List/create chat sessions
- `GET/PATCH /api/chat/sessions/[sessionId]` - Get/update session
- `GET/POST /api/chat/messages` - Get/send messages

### Activity
- `GET /api/activity-log` - Get activity logs (admin only)

---

## 🧪 Testing Checklist

- [ ] User sign up/login with Supabase auth
- [ ] Seller creates product (appears in shop with FIFO order)
- [ ] Customer donates ($5, $15, $50, custom)
- [ ] Seller requests admin help (appears in admin panel)
- [ ] Admin starts chat with seller
- [ ] Send messages back and forth (real-time)
- [ ] Admin closes chat session
- [ ] Customer requests mediation
- [ ] Admin accepts → chat starts
- [ ] Activity log shows all events
- [ ] Dashboard shows donation stats

---

## 🚨 Troubleshooting

### RLS Policy Errors
```
Error: new row violates row level security policy
```
**Solution**: Check that user is authenticated before operations

### Messages Not Appearing
```
Messages sent but not received
```
**Solution**: Ensure realtime is enabled in Supabase dashboard for `chat_messages`

### Activity Log Empty
```
No activities shown
```
**Solution**: Make sure `logActivity()` is called after each action, and user is admin

### Donations Not Saving
```
POST /api/donate returns 401
```
**Solution**: User must be logged in. Check auth context setup.

---

## 📱 File Structure

```
lib/
  ├── supabase.ts              # Client + DB helpers + subscriptions
  └── supabase-schema.sql      # Database schema (run in Supabase)

context/
  └── auth-context-supabase.tsx # Supabase auth provider

components/
  ├── donation/
  │   ├── donation-widget.tsx  # Floating donation button
  │   └── donation-page.tsx    # Full donation page
  ├── chat/
  │   └── chat-components.tsx  # All chat components
  └── admin/
      └── activity-log-viewer.tsx # Activity dashboard

app/api/
  ├── donate/route.ts          # Donation API
  ├── chat/
  │   ├── sessions/route.ts    # Create/list chats
  │   ├── sessions/[sessionId]/route.ts # Get/update chat
  │   └── messages/route.ts    # Send/receive messages
  └── activity-log/route.ts    # Activity logs (admin)
```

---

## 🎯 Next Steps

1. **Payment Integration** - Add Stripe to donation system
2. **Email Notifications** - Notify sellers/customers of new messages
3. **Search & Filters** - Advanced product search
4. **Reviews & Ratings** - Customer reviews for products
5. **Notifications** - Real-time notifications for chats, orders
6. **Admin Moderation** - Content moderation tools

---

## 📞 Support

For Supabase issues: [docs.supabase.com](https://docs.supabase.com)
For React issues: [react.dev](https://react.dev)

Happy building! 🎨✨
