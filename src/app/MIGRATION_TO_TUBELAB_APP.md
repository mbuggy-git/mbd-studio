# 🚀 Migration Checklist: www.mbd.studio → tubelab.app

## 📋 Pre-Migration Prep (DO FIRST)

### ✅ Code Changes

1. **Update Route Paths** (Optional - for cleaner URLs)
   - Current: All routes use `/tubelab` prefix
   - New Option: Use root `/` for main app on new domain
   - Files to update if changing:
     - `/App.tsx` - Change `/tubelab` → `/`
     - `/components/AuthDialog.tsx` - Update OAuth redirectTo
     - All navigation links in components

2. **Update Email Address** (Optional)
   - Current: `tubelab@mbd.studio` 
   - Consider: `hello@tubelab.app` or `support@tubelab.app`
   - Files to update:
     - `/components/AuthDialog.tsx` (line 154, 369)

3. **✅ DONE: Dynamic Reset Password URLs**
   - Already updated to use `window.location.origin`
   - Will automatically work on new domain!

---

## 🔧 Migration Steps (Day of Switch)

### 1️⃣ **Figma Make / Hosting**
- [ ] Point `tubelab.app` to this Figma Make project
- [ ] Update DNS records (A/CNAME)
- [ ] Wait for DNS propagation (can take 1-48 hours)
- [ ] Test that `https://tubelab.app` loads

### 2️⃣ **Supabase Configuration**
Go to: https://supabase.com/dashboard → Your Project → Authentication → URL Configuration

- [ ] **Site URL:** Change from `https://www.mbd.studio` to `https://tubelab.app`
- [ ] **Redirect URLs:** Add both:
  - `https://tubelab.app/**`
  - `https://www.tubelab.app/**` (if you want www support)

### 3️⃣ **Google Cloud Console** (CRITICAL!)
Go to: https://console.cloud.google.com → Your Project → APIs & Services → Credentials

#### **Authorized JavaScript Origins:**
- [ ] Add: `https://tubelab.app`
- [ ] Add: `https://www.tubelab.app` (if supporting www)
- [ ] **KEEP** `https://www.mbd.studio` temporarily for beta testers

#### **Authorized Redirect URIs:**
- [ ] Add: `https://tubelab.app/oauth/callback`
- [ ] Add: `https://www.tubelab.app/oauth/callback` (if supporting www)
- [ ] **KEEP** `https://www.mbd.studio/oauth/callback` temporarily

**Important:** Keep old URLs active during beta testing! Remove them only after all testers have migrated.

### 4️⃣ **Email Templates** (Supabase)
Go to: Supabase Dashboard → Authentication → Email Templates

Update the **Reset Password** template link to:
```html
{{ .SiteURL }}/reset-password?token_hash={{ .TokenHash }}&type=recovery
```

These already use `{{ .SiteURL }}` so they'll auto-update when you change Site URL! ✅
- [ ] Verify "Reset Password" template (should say `/reset-password` not `/tubelab/reset-password`)
- [ ] Verify "Confirm Signup" template (if enabled)

---

## 🧪 Testing Checklist

Once DNS propagates and all configs are updated:

- [ ] **Basic Access:** Does `https://tubelab.app` load?
- [ ] **Sign Up:** Can you create a new account?
- [ ] **Login:** Can you log in with email/password?
- [ ] **Google OAuth:** Does "Continue with Google" work?
- [ ] **Password Reset:** 
  - [ ] Request reset email
  - [ ] Receive email with correct domain
  - [ ] Click link - does it go to `tubelab.app/reset-password`?
  - [ ] Can you reset password successfully?
- [ ] **YouTube OAuth:** Does "Connect Analytics" work?
- [ ] **Data Persistence:** Do existing users see their data?

---

## 📧 Beta Tester Communication

**Before Migration:**
```
Subject: 🚀 TubeLab is Moving to tubelab.app!

Hi Beta Testers!

Great news - TubeLab is getting its own home! We're moving from 
www.mbd.studio/tubelab to our new domain: tubelab.app

📅 When: [Date]
🔗 New URL: https://tubelab.app

What you need to do:
✅ Nothing! Just use the new URL after [date]
✅ Your data and account will automatically transfer
✅ Bookmark the new URL for easy access

If you experience any issues after the move, please let us know 
in the feedback form or email support@tubelab.app

Thanks for being part of the beta!
```

**After Migration:**
```
Subject: ✅ We've Moved to tubelab.app!

The migration is complete! 🎉

🔗 New URL: https://tubelab.app
📱 Update your bookmarks
🔐 Use the same login credentials

Please test and report any issues via the feedback form.
```

---

## 🎯 Google App Verification (After Beta)

**⚠️ DO NOT SUBMIT UNTIL:**
- ✅ Domain is stable on tubelab.app
- ✅ Beta testing is complete
- ✅ No major bugs
- ✅ Privacy Policy published at `https://tubelab.app/privacy`
- ✅ Terms of Service published at `https://tubelab.app/terms`

**When Ready to Submit:**
- Domain in application: `tubelab.app`
- Authorized domains: `tubelab.app`
- Homepage URL: `https://tubelab.app`
- Privacy Policy: `https://tubelab.app/privacy`
- Terms: `https://tubelab.app/terms`

---

## 🚨 Rollback Plan (If Something Goes Wrong)

If the migration has critical issues:

1. **DNS:** Point `tubelab.app` temporarily to a "Coming Soon" page
2. **Supabase:** Revert Site URL back to `www.mbd.studio`
3. **Google Console:** Ensure old URIs are still active
4. **Communication:** Email beta testers to use old URL temporarily
5. **Debug:** Fix issues in staging/preview
6. **Retry:** Re-migrate when ready

---

## 📊 Post-Migration Monitoring

**First 24 Hours:**
- [ ] Monitor error logs in browser console
- [ ] Check Supabase Auth logs
- [ ] Monitor feedback form submissions
- [ ] Watch for beta tester reports

**First Week:**
- [ ] Confirm all OAuth flows working
- [ ] Verify email delivery on new domain
- [ ] Check analytics/tracking (if any)
- [ ] Remove old `mbd.studio` URLs from Google Console (after confirming all working)

---

## ✅ Current Status

- [x] Code updated with dynamic URLs
- [ ] Domain DNS configured
- [ ] Supabase Site URL updated
- [ ] Google OAuth URIs updated
- [ ] Email templates verified
- [ ] Beta testers notified
- [ ] Testing completed
- [ ] Migration successful!

---

**Questions?** Refer to:
- Supabase docs: https://supabase.com/docs/guides/auth
- Google OAuth: https://developers.google.com/identity/protocols/oauth2