# 📧 Email Rate Limiting - Implementation Example

## 🎯 Quick Start: Apply Rate Limiting to Order Email Endpoint

This guide shows how to update ONE endpoint as an example, then apply the same pattern to others.

## 📍 Example: Order Confirmation Email

**File:** `app/api/orders/route.ts`

### BEFORE (No Rate Limiting)
```typescript
import { sendEmail } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  // ... order processing logic ...
  
  // Send email immediately (can be called multiple times)
  await sendEmail(user.email, "order-confirmation", {
    orderId: order.id,
    // ... more data
  });
  
  return NextResponse.json({ success: true });
}
```

### AFTER (With Rate Limiting)
```typescript
import { sendEmail } from "@/lib/email-service"
import { NextRequest, NextResponse } from "next/server"

// ✅ Simple in-memory rate limiter for development
const emailRequestCounts = new Map<string, number[]>();
const RATE_LIMIT = 3; // Max 3 emails per minute
const WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const oneMinuteAgo = now - WINDOW_MS;
  
  // Get existing requests
  const requests = emailRequestCounts.get(identifier) || [];
  
  // Filter out old requests
  const recentRequests = requests.filter(time => time > oneMinuteAgo);
  
  // Check limit
  if (recentRequests.length >= RATE_LIMIT) {
    return false; // Rate limit exceeded
  }
  
  // Add current request
  recentRequests.push(now);
  emailRequestCounts.set(identifier, recentRequests);
  
  return true; // OK to proceed
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, orderId } = body;
    
    // ✅ Check rate limit per user email
    if (!checkRateLimit(email)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many email requests. Please wait 1 minute before trying again.',
          }
        },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }
    
    // ... order processing logic ...
    
    // Send email (now rate limited)
    await sendEmail(email, "order-confirmation", {
      orderId: orderId,
      // ... more data
    });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('❌ Order email error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    );
  }
}
```

## 🔧 Better Version: Shared Rate Limiter Module

Create `lib/rate-limit.ts` for reuse across endpoints:

```typescript
// ✅ Shared rate limiter for all API endpoints
const requestCounts = new Map<string, number[]>();

export interface RateLimitConfig {
  limit: number; // Max requests
  windowMs: number; // Time window in milliseconds
  identifier: string; // Key for tracking (email, IP, etc)
}

export function checkRateLimit(config: RateLimitConfig): boolean {
  const { limit, windowMs, identifier } = config;
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Get existing requests for this identifier
  const requests = requestCounts.get(identifier) || [];
  
  // Filter requests within window
  const recentRequests = requests.filter(time => time > windowStart);
  
  // Exceeded limit?
  if (recentRequests.length >= limit) {
    console.warn(`⚠️ Rate limit exceeded for: ${identifier} (${recentRequests.length}/${limit})`);
    return false;
  }
  
  // Record this request
  recentRequests.push(now);
  requestCounts.set(identifier, recentRequests);
  console.log(`✅ Rate limit OK: ${identifier} (${recentRequests.length}/${limit})`);
  
  return true;
}

export const RATE_LIMITS = {
  SIGNUP: { limit: 3, windowMs: 60 * 1000 }, // 3 per minute
  LOGIN: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15 min
  EMAIL: { limit: 3, windowMs: 60 * 1000 }, // 3 per minute
};
```

Then use it in routes:

```typescript
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { sendEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, orderId } = body;
  
  // ✅ Check rate limit
  if (!checkRateLimit({
    identifier: email,
    ...RATE_LIMITS.EMAIL,
  })) {
    return NextResponse.json(
      {
        error: 'Too many email requests',
        retryAfter: 60,
      },
      { status: 429 }
    );
  }
  
  // Send email
  await sendEmail(email, "order-confirmation", { orderId });
  
  return NextResponse.json({ success: true });
}
```

## 📋 Apply to All Email Endpoints

Copy this pattern to these files:

### 1. Seller Application Email
**File:** `app/api/seller/apply/route.ts`
```typescript
// Add at top
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

// Before sending email:
if (!checkRateLimit({
  identifier: applicationData.email,
  ...RATE_LIMITS.EMAIL,
})) {
  return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
}

// Then send email as usual
await sendEmail(applicationData.email, "seller-application-submitted", { ... });
```

### 2. Seller Reports Email
**File:** `app/api/seller/reports/email/route.ts`

### 3. Seller Approval/Rejection
**File:** `app/api/seller/applications/[id]/route.ts`

### 4. Seller Onboarding
**File:** `app/api/seller/onboarding/complete/route.ts`

### 5. Order Status Updates
**File:** `app/api/orders/[id]/status/route.ts`

### 6. Order Notifications
**File:** `app/api/orders/[id]/notify/route.ts`

### 7. Order Confirmation
**File:** `app/api/orders/route.ts`

### 8. Admin Seller Status
**File:** `app/api/admin/sellers/route.ts`

### 9. Pattern Testing Disapproval
**File:** `app/api/admin/pattern-testing/disapprove/route.ts`

## 🧪 Testing the Rate Limiter

### Test 1: Direct API Call

```bash
# First request - SUCCEEDS
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","orderId":"123"}'
# Response: { "success": true }

# Second request - SUCCEEDS
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","orderId":"124"}'
# Response: { "success": true }

# Third request - SUCCEEDS
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","orderId":"125"}'
# Response: { "success": true }

# Fourth request - FAILS (rate limit)
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","orderId":"126"}'
# Response: { "error": "Too many email requests", "retryAfter": 60 }
# Status: 429 Too Many Requests
```

### Test 2: Browser Console

```javascript
// Test with fetch
async function testRateLimit() {
  for (let i = 1; i <= 5; i++) {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        orderId: `order-${i}`
      })
    });
    const data = await response.json();
    console.log(`Request ${i}:`, response.status, data);
  }
}

testRateLimit();
```

Expected output:
```
Request 1: 200 { success: true }
Request 2: 200 { success: true }
Request 3: 200 { success: true }
Request 4: 429 { error: "Too many email requests" }
Request 5: 429 { error: "Too many email requests" }
```

### Test 3: Wait and Retry

```javascript
async function testRateLimitWithWait() {
  // Send 3 emails
  for (let i = 1; i <= 3; i++) {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        orderId: `order-${i}`
      })
    });
    console.log(`Request ${i}:`, response.status);
  }
  
  // Try 4th (should fail)
  let response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      orderId: 'order-4'
    })
  });
  console.log(`Request 4 (immediate):`, response.status); // 429
  
  // Wait 61 seconds
  console.log('Waiting 61 seconds...');
  await new Promise(resolve => setTimeout(resolve, 61 * 1000));
  
  // Try again (should succeed)
  response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      orderId: 'order-5'
    })
  });
  console.log(`Request 5 (after wait):`, response.status); // 200
}
```

## 📊 Console Output When Rate Limited

Expected logs in browser DevTools:

```
✅ Rate limit OK: test@example.com (1/3)
✅ Rate limit OK: test@example.com (2/3)
✅ Rate limit OK: test@example.com (3/3)
⚠️ Rate limit exceeded for: test@example.com (3/3)
❌ Email rate limit exceeded
```

## 🎯 Summary

✅ **What we did:**
1. Created shared rate limiter module (`lib/rate-limit.ts`)
2. Added to one endpoint as example (`app/api/orders/route.ts`)
3. Provided pattern for applying to all email endpoints
4. Added testing instructions

✅ **Protection:**
- Max 3 emails per minute per user
- 429 error when limit exceeded
- Auto-resets after 1 minute
- Clear error messages

✅ **Next step:**
Apply same pattern to other 8 email endpoints!
