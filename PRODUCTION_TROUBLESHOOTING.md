# Production Deployment Troubleshooting

## Chart Loading Errors

If you're seeing "Error Loading Chart" or "Failed to fetch equity curve data" on production, follow these steps:

### 1. Check Vercel Environment Variables

The most common issue is **missing environment variables** on Vercel.

**Required Environment Variables:**

```bash
DATABASE_URL="your-database-url"
JWT_SECRET="your-secret-key-minimum-32-chars"
JWT_EXPIRES_IN="7d"

# Cloud Storage (choose one)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# OR for AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="your-bucket-name"
STORAGE_PROVIDER="cloudinary"  # or "s3"
```

**How to Set on Vercel:**

1. Go to your project on [vercel.com](https://vercel.com)
2. Click **Settings** → **Environment Variables**
3. Add each variable above
4. **Important**: Set for "Production", "Preview", and "Development"
5. Click **Save**
6. **Redeploy** from the Deployments tab

### 2. Check Database Connection

**Verify your database is accessible:**

```bash
# Test locally with production DATABASE_URL
DATABASE_URL="your-prod-url" npx prisma db pull
```

**Common Database Issues:**

❌ **IP not whitelisted** - If using hosted database (Supabase, PlanetScale, etc.), add Vercel's IP to allowlist
❌ **SSL required** - Add `?sslmode=require` or `?ssl=true` to DATABASE_URL
❌ **Database doesn't exist** - Run migrations:

```bash
# On Vercel, migrations run automatically via build script
# Locally, run:
npx prisma migrate deploy
```

### 3. Check Authentication

**Symptoms:**
- Charts fail to load
- 401 Unauthorized errors in browser console

**Solutions:**

1. **Check JWT_SECRET is set** on Vercel
2. **Clear cookies** and log in again
3. **Check cookie settings** - Make sure `secure: true` in production

### 4. Check API Responses

**In browser console (F12 → Network tab):**

1. Look for failed requests to `/api/analytics/charts`
2. Click the failed request
3. Check the **Response** tab for actual error message

**Common API Errors:**

| Error | Cause | Solution |
|-------|-------|----------|
| 500 Internal Server Error | Database connection | Check DATABASE_URL |
| 401 Unauthorized | Not logged in / JWT issue | Check JWT_SECRET, re-login |
| 404 Not Found | API route not deployed | Check Vercel deployment logs |
| Empty response | No trades in database | Add a test trade |

### 5. Check Vercel Deployment Logs

**View build logs:**

1. Go to **Deployments** tab on Vercel
2. Click your latest deployment
3. Click **Building** to see build logs
4. Look for errors like:
   - `Prisma schema error`
   - `Environment variable not found`
   - `Database connection failed`

**View runtime logs:**

1. Go to your project on Vercel
2. Click **Logs** tab (or **Monitoring** → **Logs**)
3. Filter by "Error"
4. Look for errors from `/api/analytics/*` routes

### 6. Test Database with No Data

If your database is **empty** (no trades), the charts will show "No data available" - this is normal!

**To test:**
1. Log in to production
2. Navigate to **New Trade**
3. Add a test trade
4. Go back to Dashboard
5. Charts should now load

### 7. Common Production Fixes

#### Fix 1: Database URL Format

**PostgreSQL:**
```bash
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
```

**Supabase:**
```bash
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
```

**PlanetScale:**
```bash
DATABASE_URL="mysql://user:password@host/database?ssl={"rejectUnauthorized":true}"
```

#### Fix 2: Run Migrations on Production

If tables don't exist:

1. Set `DATABASE_URL` locally to production URL
2. Run: `npx prisma migrate deploy`
3. Or use Vercel's Postgres: Run migrations in their dashboard

#### Fix 3: Cookie Issues

If auth cookies not working in production:

Update `lib/auth.ts`:
```typescript
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // ✓ Must be true in prod
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}
```

### 8. Enable Better Error Logging

**Temporarily add detailed logging:**

In `app/api/analytics/charts/route.ts`, add:

```typescript
export async function GET(request: NextRequest) {
  try {
    console.log('Charts API called');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    
    const user = await requireAuth();
    console.log('User authenticated:', user.id);
    
    // ... rest of code
  } catch (error) {
    console.error('Charts API error:', error);
    return NextResponse.json(
      { error: error.message, stack: error.stack }, // Add stack trace
      { status: 500 }
    );
  }
}
```

Then check **Vercel Logs** to see the console output.

### 9. Quick Checklist

- [ ] DATABASE_URL set on Vercel
- [ ] JWT_SECRET set on Vercel (min 32 chars)
- [ ] Database accessible (IP whitelisted if needed)
- [ ] Migrations ran successfully
- [ ] Can log in successfully
- [ ] At least one trade exists in database
- [ ] Browser console shows no auth errors
- [ ] Vercel deployment logs show no errors

### 10. Still Not Working?

**Get detailed error info:**

1. **Check improved error messages** - The code now shows HTTP status codes
2. **Check browser console** - Press F12, go to Console tab
3. **Check Network tab** - Look at failed API calls, see response
4. **Check Vercel logs** - Runtime errors appear here
5. **Test API directly** - Visit `https://your-app.vercel.app/api/analytics/dashboard` in browser

**Common patterns:**

```
Error 500 → Database/Environment issue
Error 401 → Authentication issue
Error 404 → Deployment issue
```

## Next Steps

After fixing the environment variables:

1. **Redeploy on Vercel** (needed for env vars to take effect)
2. **Clear browser cache and cookies**
3. **Log in again**
4. **Add a test trade if database is empty**
5. **Check dashboard** - charts should now load!

---

**Need Help?**

Check these logs in order:
1. Browser Console (F12)
2. Browser Network Tab (F12 → Network)
3. Vercel Deployment Logs
4. Vercel Runtime Logs
5. Database provider logs

The error message will guide you to the root cause!

