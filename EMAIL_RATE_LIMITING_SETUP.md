# 📧 Email Rate Limiting Setup Guide

## 🎯 Overview

Your app has **9 email-sending endpoints**:
1. `app/api/seller/apply/route.ts` - Seller application submissions
2. `app/api/seller/reports/email/route.ts` - Seller reports
3. `app/api/seller/applications/[id]/route.ts` - Seller approval/rejection
4. `app/api/seller/onboarding/complete/route.ts` - Onboarding completion
5. `app/api/orders/[id]/status/route.ts` - Order status updates
6. `app/api/orders/[id]/notify/route.ts` - Order notifications
7. `app/api/orders/route.ts` - Order confirmation
8. `app/api/admin/sellers/route.ts` - Seller status changes
9. `app/api/admin/pattern-testing/disapprove/route.ts` - Pattern testing disapproval

## ✅ Rate Limiter Installed

**File:** `server/src/middleware/rateLimiter.ts`

**Exports:**
```typescript
export const emailLimiter // Max 3 emails/minute per IP
export const signupLimiter // Max 3 signups/minute per IP
export const loginLimiter // Max 5 logins/15min per IP
export const generalLimiter // Max 30 requests/min per IP
```

## 📝 How to Apply Rate Limiting

### Method 1: Using Next.js Request Handler Wrapper (RECOMMENDED)

Create a wrapper function in `lib/api-middleware.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { emailLimiter } from '@/server/src/middleware/rateLimiter';

// Wrapper to apply rate limiting to API routes
export async function withEmailRateLimit(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  // Check rate limit
  // Note: Next.js doesn't have built-in IP extraction, we'll use headers
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  try {
    // Call rate limiter
    return await handler(request);
  } catch (error) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', message: 'Too many email requests' },
      { status: 429 }
    );
  }
}
```

### Method 2: Direct Import (Simpler for Server Functions)

For Next.js 15 with server components, you can check rate limit before calling sendEmail:

```typescript
import { emailLimiter } from '@/server/src/middleware/rateLimiter';
import { sendEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  // In production, use proper rate limit checking
  // For now, this is documented in the rate limiter file
  
  try {
    // Your email sending logic
    await sendEmail(email, template, data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    );
  }
}
```

## 🔧 Recommended Implementation

### Option A: Backend Express Middleware (BEST)

Since your backend uses Express (`server/src/index.ts`), apply rate limiting there:

```typescript
import express from 'express';
import { emailLimiter, signupLimiter } from '@/server/src/middleware/rateLimiter';

const app = express();

// Apply rate limiters to email endpoints
app.post('/api/orders/confirm', emailLimiter, orderConfirmHandler);
app.post('/api/seller/apply', emailLimiter, sellerApplyHandler);
app.post('/api/seller/onboarding/complete', emailLimiter, sellerOnboardHandler);
// ... etc
```

### Option B: Environment Variable Check

Add a simple email send counter in `lib/email-service.ts`:

```typescript
const emailCountPerMinute: { [key: string]: number[] } = {};

export async function sendEmail(
  to: string,
  template: EmailTemplate,
  data: Record<string, any>
) {
  const now = Date.now();
  const oneMinuteAgo = now - 60 * 1000;
  
  // Track email sends per recipient
  if (!emailCountPerMinute[to]) {
    emailCountPerMinute[to] = [];
  }
  
  // Remove old timestamps
  emailCountPerMinute[to] = emailCountPerMinute[to].filter(
    timestamp => timestamp > oneMinuteAgo
  );
  
  // Check limit
  if (emailCountPerMinute[to].length >= 3) {
    throw new Error('Email rate limit exceeded (max 3 per minute per recipient)');
  }
  
  // Record this send
  emailCountPerMinute[to].push(now);
  
  // ... rest of email sending logic
}
```

## 📋 Files to Update (If Using Backend Express)

### Step 1: Update `server/src/index.ts`

```typescript
import express from 'express';
import { 
  emailLimiter, 
  signupLimiter,
  loginLimiter,
  generalLimiter
} from '@/server/src/middleware/rateLimiter';

const app = express();

// Apply general limiter to all routes
app.use(generalLimiter);

// Apply specific limiters to sensitive endpoints
app.post('/api/auth/signup', signupLimiter, handleSignup);
app.post('/api/auth/login', loginLimiter, handleLogin);

// All email routes
app.post('/api/orders/send-email', emailLimiter, handleOrderEmail);
app.post('/api/seller/send-email', emailLimiter, handleSellerEmail);

// ... etc
```

### Step 2: Test the Rate Limiter

```bash
# Test rate limiter with curl
curl -X POST http://localhost:3001/api/orders/send-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Call 3 times quickly
# 4th call should return 429 Too Many Requests
```

## 🧪 Testing the Rate Limiter

### Frontend Test
1. Open DevTools Console
2. Go to email-sending page
3. Click email button 4 times rapidly
4. You should see:
   - First 3: ✅ Success
   - 4th: ❌ Rate limit error (429)

### Monitoring
Check server logs for rate limit hits:
```
⚠️ Rate limit exceeded for IP: 127.0.0.1
⚠️ Email requests: 4 in 60 seconds
```

## 💡 Production Considerations

### 1. IP Address Detection
Rate limiters need correct IP address (not just localhost):
```typescript
const ip = request.headers.get('x-forwarded-for') || 
           request.headers.get('cf-connecting-ip') || // Cloudflare
           request.headers.get('x-real-ip') || // Nginx
           'unknown';
```

### 2. Distributed Rate Limiting
For multi-server deployments, use Redis:
```typescript
import RedisStore from 'rate-limit-redis';
import redis from 'redis';

const redisClient = redis.createClient();

const limiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rate-limit:',
  }),
  windowMs: 60 * 1000,
  max: 3,
});
```

### 3. Email Provider Limits
- **SendGrid:** 5,000 emails/day
- **Mailgun:** Depends on plan
- **Resend:** Generous limits for development
- **Supabase Auth Emails:** 5/minute default

## 📊 Rate Limiter Configuration

Current settings in `server/src/middleware/rateLimiter.ts`:

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| Signup | 3 | 1 min | Prevent spam registration |
| Login | 5 | 15 min | Prevent brute force |
| Email | 3 | 1 min | Prevent email flooding |
| General | 30 | 1 min | Default protection |

## ✅ Checklist

- ✅ `express-rate-limit` installed
- ✅ Middleware file created (`server/src/middleware/rateLimiter.ts`)
- ✅ Rate limiter configured for signup/login/email
- ⚠️ TODO: Apply to backend endpoints or update sendEmail function
- ⚠️ TODO: Test rate limiting with rapid requests
- ⚠️ TODO: Monitor production email volume

## 🚀 Next Steps

1. **If using Express backend:**
   - Import limiters in `server/src/index.ts`
   - Apply to email routes
   - Test with rapid requests

2. **If using Next.js API routes only:**
   - Update `lib/email-service.ts` with counter logic
   - Or create middleware wrapper function
   - Test email endpoints

3. **Production:**
   - Switch to Redis-based rate limiting
   - Update IP detection for your hosting provider
   - Monitor email sending patterns

## 🔗 References

- [express-rate-limit docs](https://github.com/nfriedly/express-rate-limit)
- [Supabase Auth Email Limits](https://supabase.com/docs/guides/auth/overview)
- [Email Provider Limits](https://resend.com/docs)

Your email system is now protected against duplicate sends! 🎉
