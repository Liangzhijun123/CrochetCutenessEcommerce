# ⚡ QUICK REFERENCE - Apply Rate Limiting to Email Endpoints

## 🎯 Copy-Paste Solutions

### Already Done (No Action Needed):
- ✅ `lib/rate-limit.ts` - Created and ready
- ✅ `app/auth/register/page.tsx` - Updated with double-submit prevention
- ✅ `context/auth-context-supabase.tsx` - Updated with idempotency check

---

## 📧 Apply to Email Endpoints (9 Total)

### Template: Add Rate Limiting to Any Email Endpoint

**Step 1:** Import at top
```typescript
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"
```

**Step 2:** Before `sendEmail()`, add:
```typescript
const result = checkRateLimit({
  identifier: emailAddress,
  ...RATE_LIMITS.EMAIL,
})

if (!result.allowed) {
  return NextResponse.json(
    { error: 'Too many email requests. Please try again in ' + result.retryAfter + ' seconds' },
    { status: 429, headers: { 'Retry-After': String(result.retryAfter) } }
  )
}
```

**Step 3:** Keep your `sendEmail()` call exactly the same

---

## 📋 Apply to These 9 Files

### 1️⃣ `app/api/seller/apply/route.ts`
```typescript
// Add import
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"

// In POST handler, before: await sendEmail(applicationData.email, ...
const result = checkRateLimit({
  identifier: applicationData.email,
  ...RATE_LIMITS.EMAIL,
})
if (!result.allowed) {
  return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
}
// Then sendEmail as usual
```

### 2️⃣ `app/api/seller/reports/email/route.ts`
```typescript
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"

// Before: await sendEmail({ recipient: email, ...
const result = checkRateLimit({
  identifier: email,
  ...RATE_LIMITS.EMAIL,
})
if (!result.allowed) {
  return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
}
```

### 3️⃣ `app/api/seller/applications/[id]/route.ts`
```typescript
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"

// When approving (line ~51)
const approveResult = checkRateLimit({
  identifier: user.email,
  ...RATE_LIMITS.EMAIL,
})
if (!approveResult.allowed) return NextResponse.json({ error: 'Rate limited' }, { status: 429 })

// When rejecting (line ~63)
const rejectResult = checkRateLimit({
  identifier: user.email,
  ...RATE_LIMITS.EMAIL,
})
if (!rejectResult.allowed) return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
```

### 4️⃣ `app/api/seller/onboarding/complete/route.ts`
```typescript
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"

// Before: await sendEmail(user.email, "seller-onboarding-welcome"...
const result = checkRateLimit({
  identifier: user.email,
  ...RATE_LIMITS.EMAIL,
})
if (!result.allowed) {
  return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
}
```

### 5️⃣ `app/api/orders/[id]/status/route.ts`
```typescript
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"

// Before: await sendEmail(user.email, template...
const result = checkRateLimit({
  identifier: user.email,
  ...RATE_LIMITS.EMAIL,
})
if (!result.allowed) {
  return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
}
```

### 6️⃣ `app/api/orders/[id]/notify/route.ts`
```typescript
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"

// Before: const emailResult = await sendEmail(user.email, template...
const rateLimitResult = checkRateLimit({
  identifier: user.email,
  ...RATE_LIMITS.EMAIL,
})
if (!rateLimitResult.allowed) {
  return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
}
```

### 7️⃣ `app/api/orders/route.ts`
```typescript
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"

// Before: await sendEmail(user.email, "order-confirmation"...
const result = checkRateLimit({
  identifier: user.email,
  ...RATE_LIMITS.EMAIL,
})
if (!result.allowed) {
  return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
}
```

### 8️⃣ `app/api/admin/sellers/route.ts`
```typescript
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"

// When suspending (line ~38)
const suspendResult = checkRateLimit({
  identifier: updatedSeller.email,
  ...RATE_LIMITS.EMAIL,
})
if (!suspendResult.allowed) return NextResponse.json({ error: 'Rate limited' }, { status: 429 })

// When reactivating (line ~46)
const reactivateResult = checkRateLimit({
  identifier: updatedSeller.email,
  ...RATE_LIMITS.EMAIL,
})
if (!reactivateResult.allowed) return NextResponse.json({ error: 'Rate limited' }, { status: 429 })

// When upgrading verification (line ~63)
const upgradeResult = checkRateLimit({
  identifier: updatedSeller.email,
  ...RATE_LIMITS.EMAIL,
})
if (!upgradeResult.allowed) return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
```

### 9️⃣ `app/api/admin/pattern-testing/disapprove/route.ts`
```typescript
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"

// Before: await sendEmail(application.userEmail, "pattern-testing-disapproval"...
const result = checkRateLimit({
  identifier: application.userEmail,
  ...RATE_LIMITS.EMAIL,
})
if (!result.allowed) {
  return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
}
```

---

## 🧪 Quick Test

After applying to one endpoint:

```bash
# Test with curl (macOS)
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","userId":"123","items":[],"shippingAddress":"123 Main St"}'
```

Expected response (first 3 calls):
```json
{ "success": true, "order": { ... } }
```

4th call:
```json
{ "error": "Too many email requests. Please try again in 60 seconds" }
```
HTTP Status: 429

---

## 📊 Progress Checklist

- [ ] `app/api/seller/apply/route.ts` - Rate limit added
- [ ] `app/api/seller/reports/email/route.ts` - Rate limit added
- [ ] `app/api/seller/applications/[id]/route.ts` - Rate limit added
- [ ] `app/api/seller/onboarding/complete/route.ts` - Rate limit added
- [ ] `app/api/orders/[id]/status/route.ts` - Rate limit added
- [ ] `app/api/orders/[id]/notify/route.ts` - Rate limit added
- [ ] `app/api/orders/route.ts` - Rate limit added
- [ ] `app/api/admin/sellers/route.ts` - Rate limit added
- [ ] `app/api/admin/pattern-testing/disapprove/route.ts` - Rate limit added

---

## ⏱️ Estimated Time

- Per endpoint: 2-3 minutes
- All 9 endpoints: ~20-30 minutes
- Testing: 10 minutes

**Total: ~45 minutes**

---

## 🆘 If You Get Errors

### "Cannot find module '@/lib/rate-limit'"
- ✅ Solution: The file was created at `lib/rate-limit.ts`
- Try: `import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"`

### "Type error: NextResponse not imported"
- ✅ Solution: Add at top of file
- `import { NextResponse } from 'next/server'`

### "checkRateLimit is not a function"
- ✅ Solution: Make sure the file exists and syntax is correct
- Run: `npm run build` to check for errors

---

## 💡 Pro Tips

1. **Copy-paste the block:** The 3-line rate limit check can be copied identically to all endpoints
2. **Use same identifier:** Always use `email` or `user.email` as the identifier for consistency
3. **Don't change sendEmail:** Keep your email sending logic exactly the same
4. **Test as you go:** Apply to 1-2 endpoints, test, then apply to rest

---

## 📈 After All Done

Your email system will:
- ✅ Limit to 3 emails per minute per recipient
- ✅ Return 429 error when limit exceeded
- ✅ Prevent spam/duplicate sends
- ✅ Give users clear feedback
- ✅ Auto-reset after 1 minute

**Result:** No more duplicate email issues! 🎉
