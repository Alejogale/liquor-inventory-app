# 🔐 Verify Auth Settings in Supabase

## Critical Check: Ensure Unverified Users Can't Login

### Go to Supabase Dashboard:

1. **Open Supabase Dashboard**
   - https://supabase.com/dashboard
   - Select your InvyEasy project

2. **Go to Authentication Settings**
   - Click "Authentication" in left sidebar
   - Click "Policies" or "Settings"

3. **Check These Settings:**

#### ✅ Required Settings:

| Setting | Should Be | Why |
|---------|-----------|-----|
| **Enable email confirmations** | ✅ ON | Users must verify email |
| **Secure email change** | ✅ ON | Prevent email hijacking |
| **Email confirmation time window** | 24-72 hours | Link expires after this |

#### Check Auth Flow:

**Setting: "Confirm email"**
- Should be: **ENABLED** ✅
- Location: Authentication → Settings → Email Auth

**Setting: "Enable sign ups"**
- Should be: **ENABLED** ✅
- Location: Authentication → Settings

**Setting: "Redirect URLs"**
- Add: `https://invyeasy.com/**`
- Add: `http://localhost:3001/**` (for testing)
- Location: Authentication → URL Configuration

---

## Quick Test to Verify Protection:

### Test 1: Try to login without verifying

1. Sign up with a new email
2. DON'T click the verification link
3. Try to log in immediately
4. **Expected:** Should show error like:
   - "Email not confirmed"
   - "Invalid login credentials"
   - Or redirect to verify email page

### Test 2: Check database

```sql
-- See unverified users in Supabase SQL Editor
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  CASE
    WHEN email_confirmed_at IS NULL THEN '❌ NOT VERIFIED'
    ELSE '✅ VERIFIED'
  END as status
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
```

---

## If Unverified Users CAN Login (Problem):

### Fix in Supabase Dashboard:

1. Go to: **Authentication → Settings**
2. Find: **"Confirm email"** setting
3. Make sure it's: **ENABLED** ✅
4. Click **Save**

### Alternative: Add Manual Check

If Supabase settings don't block them, add this to login page:

```typescript
// After successful login, check email verification
if (data.user && !data.user.email_confirmed_at) {
  await supabase.auth.signOut()
  setError('Please verify your email address first. Check your inbox!')
  return
}
```

---

## Current Status Check:

Run this to see what's in your auth users table:

```sql
SELECT
  COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL) as verified_users,
  COUNT(*) FILTER (WHERE email_confirmed_at IS NULL) as unverified_users,
  COUNT(*) as total_users
FROM auth.users;
```

---

## Security Best Practices ✅

Your setup includes:

- ✅ Email verification required
- ✅ Password hashing (Supabase default)
- ✅ RLS policies on tables
- ✅ Secure API keys in env
- ✅ CORS protection
- ✅ No sensitive data in emails

---

## What to Do Now:

1. **Check Supabase Settings** (5 minutes)
   - Follow steps above
   - Make sure "Confirm email" is enabled

2. **Test the Flow** (5 minutes)
   - Sign up with test email
   - Try to login WITHOUT verifying
   - Should fail!

3. **If it fails correctly:** ✅ **You're done!**

4. **If unverified users can login:** Add the manual check above

---

**Let me know what you find!**
