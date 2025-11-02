# Production Database Setup Guide

## Overview

The Trading Journal application uses **Supabase** (PostgreSQL) as the production database. This guide covers the setup and configuration required.

## Database Provider: Supabase

### Why Supabase?
- Free tier available with PostgreSQL
- Built-in connection pooling for serverless
- Automatic backups
- Easy to scale

## Connection Configuration

### Runtime Connection (Transaction Mode - Recommended)

For running the application, use **Transaction Mode** (port 6543) with connection pooling:

```bash
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-1-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

**Key Parameters:**
- `port 6543` - Transaction mode (handles 200+ concurrent connections)
- `?pgbouncer=true` - Enables connection pooling
- `&connection_limit=1` - Limits each serverless function to 1 connection

### Migration Connection (Direct Connection)

For running migrations, use **Direct Connection** (port 5432):

```bash
DATABASE_URL_DIRECT="postgresql://postgres.[project-ref]:[password]@aws-1-[region].pooler.supabase.com:5432/postgres?sslmode=require"
```

**Note:** Direct connection is optional but recommended for migrations. If not set, migrations will use the pooled connection which may cause issues.

## Prisma Schema Configuration

The `prisma/schema.prisma` file is configured to support both connections:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DATABASE_URL_DIRECT")  // Optional: for migrations
}
```

- `url` - Used for runtime database operations
- `directUrl` - Used for migrations (falls back to `url` if not set)

## Environment Variables

### Required on Vercel:

1. **DATABASE_URL** (Runtime)
   - Format: Transaction mode connection string (port 6543)
   - Scope: Production, Preview, Development
   - Used for: Application runtime database operations

2. **DATABASE_URL_DIRECT** (Optional, Recommended)
   - Format: Direct connection string (port 5432)
   - Scope: Production, Preview, Development
   - Used for: Running Prisma migrations

### How to Get Connection Strings from Supabase:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **Database**
4. Under **Connection string**, select:
   - **Transaction Mode** (port 6543) → Copy for `DATABASE_URL`
   - **Direct Connection** (port 5432) → Copy for `DATABASE_URL_DIRECT`

## Running Migrations

### Option 1: Manual Migration (Recommended for Production)

```bash
# Set the direct connection URL
export DATABASE_URL_DIRECT="your-direct-connection-string"

# Run migrations
npx prisma migrate deploy
```

### Option 2: Automatic Migration (Not Currently Configured)

To enable automatic migrations on Vercel deployment, update `package.json`:

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

**Note:** Automatic migrations are disabled by default to prevent accidental schema changes in production. Use manual migrations for production deployments.

### Option 3: Supabase Migration Tool

Supabase provides a migration tool in their dashboard:
1. Go to **Database** → **Migrations**
2. Upload migration SQL files manually

## Initial Database Setup

If setting up a new production database:

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Wait for database to be provisioned

2. **Get Connection Strings**:
   - Copy Transaction Mode connection string → `DATABASE_URL`
   - Copy Direct Connection string → `DATABASE_URL_DIRECT`

3. **Set Environment Variables on Vercel**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add both `DATABASE_URL` and `DATABASE_URL_DIRECT`
   - Set scope to Production, Preview, and Development

4. **Run Initial Migrations**:
   ```bash
   # Locally, with production connection string
   export DATABASE_URL_DIRECT="your-direct-connection-string"
   npx prisma migrate deploy
   ```

5. **Verify Setup**:
   ```bash
   # Test connection
   DATABASE_URL="your-runtime-connection-string" npx prisma db pull
   ```

## Database Backups

⚠️ **IMPORTANT**: Free Plan does NOT include accessible backups.

Supabase backup access by tier:

- **Free Tier**: ❌ No backup access (daily backups exist for infrastructure only, not accessible to users)
- **Pro Tier**: ✅ Daily backups with 7-day retention (scheduled backups accessible)
- **Team Tier**: ✅ Daily backups + Point-in-time recovery
- **Enterprise**: ✅ Custom retention + Point-in-time recovery

### Verify Backup Access:

1. Go to Supabase Dashboard → **Database** → **Backups**
2. Check your plan:
   - **Free Plan**: Will show "Free Plan does not include project backups" - upgrade required
   - **Pro Plan or above**: Will show scheduled backups tab with available backups

### ⚠️ Critical: Upgrade to Pro for Production

If using Free Plan in production, you have NO backup recovery options. **Strongly recommended to upgrade to Pro Plan** for:
- Access to scheduled backups
- Ability to restore from backups
- 7-day backup retention

### Restore from Backup (Pro Plan and above):

1. Go to Supabase Dashboard → **Database** → **Backups**
2. Click **Scheduled backups** tab
3. Select backup date/time (last 7 days)
4. Click restore and confirm (⚠️ destructive operation)

## Connection Pooling Best Practices

### For Vercel Serverless:

- ✅ Use **Transaction Mode** (port 6543) for runtime
- ✅ Set `connection_limit=1` per function
- ✅ Use **Direct Connection** (port 5432) for migrations
- ✅ Enable SSL/SSL mode in connection string

### Connection Limits:

| Mode | Max Connections | Best For |
|------|----------------|----------|
| Session Mode (5432) | ~15 per database | Traditional apps |
| Transaction Mode (6543) | 200+ concurrent | Serverless (Vercel) |

## Troubleshooting

### Connection Pool Errors

**Symptoms:** 500 errors, "too many connections"

**Solution:** 
- Verify using Transaction Mode (port 6543)
- Check `connection_limit=1` is set
- See [SUPABASE_POOLER_FIX.md](./SUPABASE_POOLER_FIX.md) for details

### Migration Failures

**Symptoms:** Migrations fail to run

**Solution:**
- Use Direct Connection (port 5432) for migrations
- Set `DATABASE_URL_DIRECT` environment variable
- Run migrations manually: `npx prisma migrate deploy`

### SSL Connection Errors

**Symptoms:** "SSL connection required"

**Solution:**
- Add `?sslmode=require` to connection string
- Or `?ssl=true` (depending on provider)

## Security

- ✅ Never commit connection strings to git
- ✅ Use environment variables for all credentials
- ✅ Enable SSL/SSL mode in connection strings
- ✅ Use connection pooling to prevent connection leaks
- ✅ Restrict database access by IP if possible

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Connection Pooling](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Vercel Serverless Best Practices](https://vercel.com/docs/concepts/functions/serverless-functions)
- [SUPABASE_POOLER_FIX.md](./SUPABASE_POOLER_FIX.md) - Detailed connection pooling guide

