# Copy User to Production Script

This script copies a user and all their associated data from the local database to the production database.

## What Gets Copied

- ✅ User account (email, password hash, name)
- ✅ All trades
- ✅ All screenshots associated with trades
- ✅ All tags (creates if they don't exist)
- ✅ All trade-tag relationships

## Prerequisites

1. Both databases must be accessible
2. Production database must have the same schema (run migrations first)
3. Environment variables must be set (see below)

## Setup

### Option 1: Use .env file (Recommended)

Add these variables to your `.env` file:

```bash
# Local database (already configured)
DATABASE_URL="postgresql://user:password@localhost:5432/trading_journal"

# Production database (add this)
DATABASE_URL_PROD="postgresql://postgres.[project-ref]:[password]@aws-1-[region].pooler.supabase.com:5432/postgres"
```

**Note**: For Supabase production, you can use either:
- Transaction mode (port 6543): Recommended for runtime, but may work for one-time scripts
- Session mode (port 5432): Better for scripts that need full PostgreSQL features

### Option 2: Export environment variables

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/trading_journal"
export DATABASE_URL_PROD="postgresql://user:password@host:5432/production_db"
```

## Running the Script

```bash
npx tsx scripts/copy-user-to-production.ts
```

The script will:
1. Connect to local database and fetch user `demo@demo.com`
2. Check if user exists in production
3. Create user in production (if doesn't exist)
4. Copy all trades with all related data
5. Show progress and summary

## Output Example

```
🚀 Starting user migration from local to production...
📧 Source user: demo@demo.com

📥 Fetching user from local database...
✅ Found user: demo@demo.com (Demo User)
   User ID: clx123abc456
   Trades: 25

🔍 Checking if user exists in production database...
📤 Creating user in production database...
✅ Created user in production: clx789def012

📤 Copying 25 trades to production...
   📊 Progress: 10/25 trades copied...
   📊 Progress: 20/25 trades copied...
✅ Migration completed!

📊 Summary:
   ✅ Trades copied: 25
   📷 Screenshots copied: 8
   🏷️  Tags created: 12
   🔗 Trade-tag relationships created: 45

🎉 User migration completed successfully!
```

## Handling Existing Users

If the user already exists in production:
- The script will **skip user creation**
- It will copy trades to the existing user
- Duplicate trades (same symbol, entryDate, entryPrice) will be skipped

## Troubleshooting

### Error: "DATABASE_URL environment variable is not set"
- Make sure your `.env` file has `DATABASE_URL` set
- Or export it in your shell: `export DATABASE_URL="..."`

### Error: "DATABASE_URL_PROD environment variable is not set"
- Add `DATABASE_URL_PROD` to your `.env` file
- Or export it: `export DATABASE_URL_PROD="..."`

### Error: "User with email demo@demo.com not found"
- Check that the user exists in your local database
- Verify you're connecting to the correct local database

### Error: Connection timeout or connection refused
- Verify both database URLs are correct
- Check network connectivity
- For Supabase, ensure you're using the correct port and connection string
- Check if IP is whitelisted (for cloud databases)

### Error: Schema mismatch
- Run Prisma migrations on production database first: `npx prisma migrate deploy`
- Ensure both databases have the same schema version

## Security Notes

- ⚠️ **Never commit `.env` file to version control**
- ⚠️ Production database credentials should be kept secure
- ⚠️ The script preserves password hashes (no re-hashing needed)
- ⚠️ Run this script only when necessary and from a secure environment

## Verifying the Copy

After running the script, verify the data in production:

1. **Check user**: Log in with `demo@demo.com` / `Dem0dem0` on production
2. **Check trades**: Verify all trades appear in the dashboard
3. **Check screenshots**: Verify screenshots are accessible
4. **Check tags**: Verify tags are present and associated correctly

