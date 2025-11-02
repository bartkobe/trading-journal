# Vercel Environment Variables Configuration

## Current Configuration Status

### ✅ Required Variables (Configured)

#### 1. DATABASE_URL
```
DATABASE_URL=postgresql://postgres.iqvvozcizlohpzuovgab:cuhmyd-kymfa4-rahjEz@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
```

**Status**: ✅ Configured and working

**Note**: Currently using **Session Mode** (port 5432). For better scalability with serverless functions, consider upgrading to **Transaction Mode** (port 6543). See [Optimization Recommendations](#optimization-recommendations) below.

#### 2. JWT_SECRET
```
JWT_SECRET=i0MVRsoT5ChQ0nH/24qTxxP9NcPd7tc0gJrx9hm4ne8=
```

**Status**: ✅ Configured and working

**Security**: ✅ Strong secret (44 characters, meets minimum 32 character requirement)

---

### 🔧 Optional Variables (Not Required)

#### JWT_EXPIRES_IN
- **Default**: `7d` (7 days)
- **Status**: Using default value (no need to set unless you want different expiration)
- **To override**: Add `JWT_EXPIRES_IN=30d` (or any valid time string)

#### NODE_ENV
- **Status**: Automatically set to `production` by Vercel
- **Note**: No manual configuration needed

#### DATABASE_URL_DIRECT
- **Purpose**: Direct connection for running Prisma migrations
- **Status**: Optional - migrations can use DATABASE_URL if needed
- **When to add**: Only if you experience issues running migrations
- **Format**: Same as DATABASE_URL but with direct connection string from Supabase dashboard

---

### 📸 Cloud Storage Variables (Optional - Only Needed for Screenshot Uploads)

These variables are **only required** if you want users to upload screenshots with their trades. If screenshot uploads are not needed, you can skip this section.

#### Option 1: Cloudinary (Recommended for Ease)

Required variables:
```bash
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

**Status**: ⚠️ Not configured - Screenshot uploads will fail until configured

**Setup Guide**: See [STORAGE_SETUP.md](./STORAGE_SETUP.md)

#### Option 2: AWS S3

Required variables:
```bash
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="your-bucket-name"
```

**Status**: ⚠️ Not configured - Screenshot uploads will fail until configured

**Setup Guide**: See [STORAGE_SETUP.md](./STORAGE_SETUP.md)

---

## Optimization Recommendations

### 1. Upgrade to Transaction Mode for Better Connection Pooling

**Current Setup**: Session Mode (port 5432) - Limited to ~15 concurrent connections

**Recommended**: Transaction Mode (port 6543) - Handles 200+ concurrent connections

**Why Upgrade?**
- Better performance with serverless functions (Vercel)
- Handles more concurrent requests
- Recommended by Supabase for serverless applications

**How to Upgrade:**

1. Go to Supabase Dashboard → Settings → Database
2. Copy the **Transaction Mode** connection string (port 6543)
3. Update `DATABASE_URL` on Vercel:
   ```
   DATABASE_URL=postgresql://postgres.iqvvozcizlohpzuovgab:cuhmyd-kymfa4-rahjEz@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
   ```
4. Redeploy on Vercel

**Important Parameters:**
- Change port from `5432` → `6543`
- Add `?pgbouncer=true`
- Add `&connection_limit=1`

**Note**: Your current setup works fine! This is only a performance optimization. See [SUPABASE_POOLER_FIX.md](./SUPABASE_POOLER_FIX.md) for detailed information.

---

## Environment Variable Summary

### Minimal Configuration (Current - Working ✅)
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

### Recommended Production Configuration
```
DATABASE_URL=postgresql://...:6543/postgres?pgbouncer=true&connection_limit=1
JWT_SECRET=...
JWT_EXPIRES_IN=7d  # Optional: override default
DATABASE_URL_DIRECT=postgresql://...:5432/postgres?sslmode=require  # Optional: for migrations
```

### Full Configuration (With Screenshot Uploads)
```
DATABASE_URL=postgresql://...:6543/postgres?pgbouncer=true&connection_limit=1
JWT_SECRET=...
DATABASE_URL_DIRECT=postgresql://...:5432/postgres?sslmode=require

# Cloudinary (choose one)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# OR AWS S3 (choose one)
AWS_REGION=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
```

---

## How to Update Environment Variables on Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project: **Trading Journal**
3. Click **Settings** → **Environment Variables**
4. Add or edit variables as needed
5. **Important**: Set scope to:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
6. Click **Save**
7. **Redeploy** from the Deployments tab

---

## Verification

### Verify Environment Variables are Loaded

1. Check Vercel deployment logs:
   - Go to Deployments → Latest deployment → Building
   - Look for any "Environment variable not found" errors

2. Test in production:
   - Visit https://trading-journal-eight-tau.vercel.app
   - Register/Login works → JWT_SECRET is working
   - Database operations work → DATABASE_URL is working
   - Screenshot uploads work → Cloud storage is configured (if enabled)

### Common Issues

**Database Connection Errors:**
- Verify `DATABASE_URL` is correct
- Check Supabase dashboard → Database → Connection string
- Ensure database is accessible (not paused)

**Authentication Errors:**
- Verify `JWT_SECRET` is set
- Ensure JWT_SECRET is at least 32 characters
- Clear browser cookies and try again

**Screenshot Upload Errors:**
- Verify cloud storage credentials are set (Cloudinary or S3)
- Check storage provider is correctly configured
- See [STORAGE_SETUP.md](./STORAGE_SETUP.md) for troubleshooting

---

## Security Best Practices

✅ **Implemented:**
- JWT_SECRET is strong (44 characters)
- Database credentials stored in environment variables (not in code)
- HTTPS automatically enforced by Vercel

🔒 **Recommendations:**
- Never commit `.env` files to git (already in .gitignore)
- Rotate JWT_SECRET periodically (requires all users to re-login)
- Use different credentials for development/staging/production
- Enable Supabase database backups (automatic on free tier)

---

## References

- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database configuration details
- [STORAGE_SETUP.md](./STORAGE_SETUP.md) - Cloud storage setup guide
- [SUPABASE_POOLER_FIX.md](./SUPABASE_POOLER_FIX.md) - Connection pooling optimization
- [PRODUCTION_TROUBLESHOOTING.md](./PRODUCTION_TROUBLESHOOTING.md) - Common issues and fixes

