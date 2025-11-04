# Testing Guide: Task 3.10 - Locale Routing with Protected Routes

## Prerequisites

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open browser DevTools** (F12 or Cmd+Option+I) to monitor:
   - Network tab (to see redirects)
   - Console (for any errors)
   - Application tab → Cookies (to check auth-token)

3. **Clear localStorage** (optional, for fresh testing):
   ```javascript
   localStorage.clear()
   ```

## Test Scenarios

### 1. Test Root Path Without Locale (Not Authenticated)

**Expected:** Should redirect to `/en/` (default locale)

- **Action:** Navigate to `http://localhost:3000/`
- **Expected Result:**
  - Redirects to `http://localhost:3000/en/`
  - Login page displays
  - No console errors

**Test:**
```bash
curl -I http://localhost:3000/
# Should show Location: /en/ with 307 or 308 status
```

---

### 2. Test Root Path With Locale (Not Authenticated)

**Expected:** Should display login page without redirect

- **Action:** Navigate to `http://localhost:3000/en/` or `http://localhost:3000/pl/`
- **Expected Result:**
  - Login page displays
  - No redirect occurs
  - URL stays as `/en/` or `/pl/`

---

### 3. Test Protected Route Without Locale (Not Authenticated)

**Expected:** Should redirect to login with locale prefix and redirect param

- **Action:** Navigate to `http://localhost:3000/dashboard` (while logged out)
- **Expected Result:**
  - Redirects to `http://localhost:3000/en/?redirect=/dashboard`
  - Login page displays
  - Redirect parameter is preserved

**Test:**
```bash
curl -I http://localhost:3000/dashboard
# Should show Location: /en/?redirect=/dashboard
```

---

### 4. Test Protected Route With Locale (Not Authenticated)

**Expected:** Should redirect to login with same locale and redirect param

- **Action:** Navigate to:
  - `http://localhost:3000/en/dashboard` (while logged out)
  - `http://localhost:3000/pl/dashboard` (while logged out)
- **Expected Result:**
  - For `/en/dashboard`: Redirects to `http://localhost:3000/en/?redirect=/dashboard`
  - For `/pl/dashboard`: Redirects to `http://localhost:3000/pl/?redirect=/dashboard`
  - Login page displays in correct locale
  - Redirect parameter preserves the path without locale

**Test:**
```bash
curl -I http://localhost:3000/en/dashboard
# Should show Location: /en/?redirect=/dashboard

curl -I http://localhost:3000/pl/dashboard
# Should show Location: /pl/?redirect=/dashboard
```

---

### 5. Test Protected Routes (Authenticated)

**Note:** These tests will only work fully once pages are moved to `app/[locale]/`

**While logged in, test:**
- `http://localhost:3000/en/dashboard`
- `http://localhost:3000/pl/dashboard`
- `http://localhost:3000/en/trades`
- `http://localhost:3000/pl/trades`
- `http://localhost:3000/en/analytics`
- `http://localhost:3000/pl/analytics`

**Expected Result:**
- If pages exist in `app/[locale]/`: Should display the page
- If pages don't exist yet: May show 404 (expected until pages are moved)

---

### 6. Test Auth Route Redirect (Authenticated)

**Expected:** Should redirect to dashboard with locale prefix

- **Action:** Navigate to `http://localhost:3000/en/` or `http://localhost:3000/pl/` (while logged in)
- **Expected Result:**
  - Redirects to `http://localhost:3000/en/dashboard` or `http://localhost:3000/pl/dashboard`
  - Dashboard displays (if page exists in `app/[locale]/`)

---

### 7. Test Invalid Locale

**Expected:** Should redirect to default locale or show 404

- **Action:** Navigate to `http://localhost:3000/fr/dashboard` (invalid locale)
- **Expected Result:**
  - Should redirect to default locale or show 404
  - No crashes or errors

---

### 8. Test Locale Preservation During Navigation

**Expected:** Locale should be preserved when navigating between pages

1. Navigate to `http://localhost:3000/en/dashboard` (if page exists)
2. Navigate to another page using internal links
3. **Expected:** URL should maintain `/en/` prefix

---

## Automated Testing with curl

Run these commands to test redirects:

```bash
# Test root redirect
echo "=== Root redirect ==="
curl -I http://localhost:3000/ 2>&1 | grep -i location

# Test protected route redirect (not authenticated)
echo "=== Protected route redirect (EN) ==="
curl -I http://localhost:3000/en/dashboard 2>&1 | grep -i location

echo "=== Protected route redirect (PL) ==="
curl -I http://localhost:3000/pl/dashboard 2>&1 | grep -i location

# Test locale preservation
echo "=== Locale preservation ==="
curl -I http://localhost:3000/en/trades 2>&1 | grep -i location
curl -I http://localhost:3000/pl/trades 2>&1 | grep -i location
```

---

## Manual Browser Testing Checklist

### Test Case 1: Root Path
- [ ] `/` redirects to `/en/`
- [ ] `/en/` shows login page
- [ ] `/pl/` shows login page

### Test Case 2: Protected Routes (Not Authenticated)
- [ ] `/dashboard` redirects to `/en/?redirect=/dashboard`
- [ ] `/en/dashboard` redirects to `/en/?redirect=/dashboard`
- [ ] `/pl/dashboard` redirects to `/pl/?redirect=/dashboard`
- [ ] `/trades` redirects to `/en/?redirect=/trades`
- [ ] `/en/trades` redirects to `/en/?redirect=/trades`
- [ ] `/pl/trades` redirects to `/pl/?redirect=/trades`
- [ ] `/analytics` redirects to `/en/?redirect=/analytics`
- [ ] `/en/analytics` redirects to `/en/?redirect=/analytics`
- [ ] `/pl/analytics` redirects to `/pl/?redirect=/analytics`

### Test Case 3: Auth Route Redirect (Authenticated)
- [ ] `/en/` (logged in) redirects to `/en/dashboard`
- [ ] `/pl/` (logged in) redirects to `/pl/dashboard`

### Test Case 4: Locale Preservation
- [ ] Locale prefix is maintained in redirects
- [ ] Redirect parameter does not include locale prefix

---

## Known Limitations (Until Pages Are Moved)

**Current Status:** Pages are still at:
- `app/page.tsx`
- `app/dashboard/page.tsx`
- `app/trades/page.tsx`

**What Won't Work Yet:**
- Accessing `/en/dashboard` directly will show 404 (page doesn't exist in `app/[locale]/dashboard/page.tsx`)
- Accessing `/pl/dashboard` directly will show 404
- Full locale routing will work once pages are moved to `app/[locale]/`

**What Should Work:**
- Middleware redirects (all tests above)
- Locale prefix preservation in redirects
- Auth logic with locale routing

---

## Success Criteria

✅ **Task 3.10 is complete when:**
1. All redirects preserve locale prefix correctly
2. Protected routes redirect to login with correct locale
3. Auth routes redirect to dashboard with correct locale
4. No console errors during testing
5. Middleware handles locale routing correctly

---

## Next Steps After Testing

Once 3.10 is verified, proceed with:
- Moving pages to `app/[locale]/` structure
- Creating language selector component (Section 4.0)
- Translating all UI components (Section 5.0)

