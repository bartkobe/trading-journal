# Supabase Pooler Connection Fix

## The Problem

You're using **Session Mode** (port 5432) which has a **limited connection pool** (typically 15 connections max). When multiple serverless functions on Vercel try to connect simultaneously, you hit the limit and get 500 errors.

## The Solution

Switch to **Transaction Mode** (port 6543) which can handle **200+ concurrent connections** and is optimized for serverless environments.

## Updated Connection String

### ❌ Old (Session Mode - Limited)
```
postgresql://postgres.iqvvozcizlohpzuovgab:cuhmyd-kymfa4-rahjEz@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
```

### ✅ New (Transaction Mode - Recommended)
```
postgresql://postgres.iqvvozcizlohpzuovgab:cuhmyd-kymfa4-rahjEz@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

## Steps to Fix

### 1. Update Vercel Environment Variable

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Find `DATABASE_URL`
3. Update it to use **port 6543** instead of 5432:
   ```
   postgresql://postgres.iqvvozcizlohpzuovgab:cuhmyd-kymfa4-rahjEz@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
   ```
4. **Important Parameters:**
   - `?pgbouncer=true` - Tells Prisma it's a pooled connection
   - `&connection_limit=1` - Limits each function to 1 connection (important for serverless)

### 2. Direct Connection for Migrations

For running Prisma migrations, you might need a **direct connection** (not pooled). 

Create a separate `DATABASE_URL_DIRECT` for migrations:
```
postgresql://postgres.iqvvozcizlohpzuovgab:cuhmyd-kymfa4-rahjEz@aws-1-eu-north-1.pooler.supabase.com:5432/postgres?sslmode=require
```

Then update `prisma/schema.prisma` to use it for migrations:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DATABASE_URL_DIRECT")  // For migrations
}
```

**Or** just use the direct connection URL from Supabase Dashboard (Connection Pooling → Direct Connection).

### 3. Redeploy on Vercel

After updating the environment variable:
1. Go to **Deployments** tab
2. Click **•••** on latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

## Why Transaction Mode?

| Feature | Session Mode (5432) | Transaction Mode (6543) |
|---------|---------------------|------------------------|
| **Max Connections** | ~15 per database | 200+ concurrent |
| **Best For** | Traditional apps | Serverless (Vercel) |
| **Connection Pooling** | Limited | Full support |
| **Limitations** | Can't handle many concurrent requests | None (for most use cases) |

## Connection String Breakdown

```
postgresql://{user}:{password}@{host}:{port}/{database}?{params}
```

- **Port 5432** = Session Mode (pool size limited)
- **Port 6543** = Transaction Mode (pool size ~200)
- **`pgbouncer=true`** = Required for Transaction Mode
- **`connection_limit=1`** = Each serverless function uses max 1 connection (allows more functions)

## Testing the Fix

After updating and redeploying:

1. **Try logging in** - Should work now
2. **Check Vercel logs** - Should see no connection pool errors
3. **Test multiple simultaneous requests** - Should all succeed

## Troubleshooting

### Still Getting Errors?

1. **Check Supabase Dashboard:**
   - Go to Database → Connection Pooling
   - Verify pooler is enabled
   - Check pool size settings

2. **Verify Connection String:**
   - Must use port **6543** (not 5432)
   - Must include `?pgbouncer=true`
   - Must include `&connection_limit=1`

3. **Check Vercel Logs:**
   - Go to Vercel → Your Project → Logs
   - Filter by "Error"
   - Look for database connection errors

### Alternative: Increase Pool Size (Not Recommended)

If you must use Session Mode, you can:
1. Go to Supabase Dashboard → Database → Connection Pooling
2. Increase "Pool Size" from 15 to higher
3. But this is **not recommended** - Transaction Mode is better

## Resources

- [Supabase Connection Pooling Docs](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Prisma Connection Pooling](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#connection-pooling)
- [Vercel Serverless Best Practices](https://vercel.com/docs/concepts/functions/serverless-functions)

---

**Bottom Line:** Change port from **5432 → 6543** and add `?pgbouncer=true&connection_limit=1` to your DATABASE_URL!

