# Environment Variables Reference

Complete reference guide for all environment variables used in the Trading Journal application.

---

## Quick Reference

### Required Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ Yes | - | PostgreSQL database connection string |
| `JWT_SECRET` | ✅ Yes | - | Secret key for JWT token signing (min 32 chars) |

### Optional Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_EXPIRES_IN` | ❌ No | `7d` | JWT token expiration time |
| `DATABASE_URL_DIRECT` | ❌ No | - | Direct database connection for migrations |
| `NODE_ENV` | ❌ No | - | Environment mode (auto-set by Vercel) |

### Cloud Storage (Optional - Only for Screenshot Uploads)

**Cloudinary** (choose one set):
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

**AWS S3** (choose one set):
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET`

---

## Required Environment Variables

### DATABASE_URL

**Type**: `string`  
**Required**: ✅ Yes  
**Description**: PostgreSQL database connection string for runtime database operations

**Format**:
```
postgresql://[user]:[password]@[host]:[port]/[database]?[parameters]
```

**Examples**:

**Local PostgreSQL**:
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/trading_journal?sslmode=require"
```

**Supabase (Session Mode - port 5432)**:
```bash
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-1-[region].pooler.supabase.com:5432/postgres"
```

**Supabase (Transaction Mode - port 6543) - Recommended for Production**:
```bash
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-1-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

**Parameters**:
- `?sslmode=require` - Enforce SSL connection
- `?pgbouncer=true` - Enable connection pooling (Transaction Mode)
- `&connection_limit=1` - Limit connections per serverless function

**Where to Get**:
- **Local**: Use your local PostgreSQL connection string
- **Supabase**: Dashboard → Settings → Database → Connection string

**Validation**:
- Must be a valid PostgreSQL connection string
- Database must be accessible from your deployment environment
- SSL may be required for cloud databases

**Troubleshooting**:
- Connection errors → Verify database is running and accessible
- SSL errors → Add `?sslmode=require` to connection string
- Pool errors → Use Transaction Mode (port 6543) with connection pooling

**See**: [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed database setup.

---

### JWT_SECRET

**Type**: `string`  
**Required**: ✅ Yes  
**Description**: Secret key used to sign and verify JWT authentication tokens

**Format**: Any string, minimum 32 characters recommended

**Example**:
```bash
JWT_SECRET="i0MVRsoT5ChQ0nH/24qTxxP9NcPd7tc0gJrx9hm4ne8="
```

**Generation**:

**Using OpenSSL**:
```bash
openssl rand -base64 32
```

**Using Node.js**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Using Python**:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Security Requirements**:
- ✅ Minimum 32 characters (strongly recommended)
- ✅ Use cryptographically secure random generator
- ✅ Never commit to version control
- ✅ Use different secrets for development and production
- ✅ Rotate periodically (requires all users to re-login)

**Default Behavior**:
- If not set, uses fallback: `'fallback-secret-change-in-production'`
- ⚠️ **Never use fallback in production** - this is insecure

**Used In**:
- `lib/auth.ts` - JWT token signing and verification
- User authentication and session management

**Troubleshooting**:
- Authentication fails → Verify `JWT_SECRET` is set and correct
- Token validation errors → Ensure same secret used across all instances
- Security warnings → Use strong, randomly generated secret

---

## Optional Environment Variables

### JWT_EXPIRES_IN

**Type**: `string`  
**Required**: ❌ No  
**Default**: `7d` (7 days)  
**Description**: JWT token expiration time

**Format**: Time string compatible with `jsonwebtoken` library

**Valid Formats**:
- `7d` - 7 days
- `30d` - 30 days
- `24h` - 24 hours
- `3600` - 3600 seconds
- `2h 30m` - 2 hours 30 minutes

**Example**:
```bash
JWT_EXPIRES_IN="7d"
```

**When to Override**:
- Shorter expiration for higher security: `JWT_EXPIRES_IN="1d"`
- Longer expiration for convenience: `JWT_EXPIRES_IN="30d"`

**Used In**:
- `lib/auth.ts` - JWT token generation

**Note**: Changing this value only affects new tokens. Existing tokens will expire based on their original expiration time.

---

### DATABASE_URL_DIRECT

**Type**: `string`  
**Required**: ❌ No  
**Default**: Uses `DATABASE_URL` if not set  
**Description**: Direct database connection string for running Prisma migrations

**When to Use**:
- Running Prisma migrations (`prisma migrate deploy`)
- Database schema operations that require direct connection
- Recommended when using Supabase connection pooling

**Format**:
```
postgresql://[user]:[password]@[host]:[port]/[database]?[parameters]
```

**Example (Supabase Direct Connection)**:
```bash
DATABASE_URL_DIRECT="postgresql://postgres.[project-ref]:[password]@aws-1-[region].pooler.supabase.com:5432/postgres?sslmode=require"
```

**Differences from DATABASE_URL**:
- Uses direct connection (port 5432 for Supabase)
- Not pooled connection
- Required for migration operations

**Where to Get**:
- **Supabase**: Dashboard → Settings → Database → Connection Pooling → Direct Connection

**Used In**:
- `prisma/schema.prisma` - Prisma datasource configuration
- Migration operations

**Note**: If not set, Prisma will use `DATABASE_URL` for migrations. This may work but is not recommended for Supabase.

---

### NODE_ENV

**Type**: `string`  
**Required**: ❌ No  
**Description**: Node.js environment mode

**Valid Values**:
- `development` - Development mode
- `production` - Production mode
- `test` - Test mode

**Default Behavior**:
- **Local development**: Not automatically set (defaults to development behavior)
- **Vercel**: Automatically set to `production` for production deployments

**Usage in Code**:

**Authentication** (`lib/auth.ts`):
```typescript
secure: process.env.NODE_ENV === 'production'
```
- Cookies are `secure` (HTTPS only) in production
- Cookies are `secure: false` in development

**Database Logging** (`lib/db.ts`):
```typescript
log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
```
- Detailed query logging in development
- Error-only logging in production

**Error Messages**:
- Full error stack traces in development
- Sanitized error messages in production

**Setting Locally**:
```bash
# In .env file
NODE_ENV="development"

# Or inline
NODE_ENV=production npm run build
```

**Note**: Generally not required to set manually. Vercel automatically sets it, and development tools handle it.

---

## Cloud Storage Environment Variables

Cloud storage variables are **only required** if you want users to upload screenshots with their trades. The application will work without these variables, but screenshot uploads will fail.

### Option 1: Cloudinary (Recommended)

Cloudinary is recommended for ease of setup and generous free tier.

#### CLOUDINARY_CLOUD_NAME

**Type**: `string`  
**Required**: ✅ Yes (if using Cloudinary)  
**Description**: Your Cloudinary cloud name

**Example**:
```bash
CLOUDINARY_CLOUD_NAME="dxyzt7abc"
```

**Where to Get**:
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Log in to dashboard
3. Cloud name is displayed on main dashboard

**Validation**:
- Alphanumeric string
- Unique to your account

---

#### CLOUDINARY_API_KEY

**Type**: `string`  
**Required**: ✅ Yes (if using Cloudinary)  
**Description**: Your Cloudinary API key

**Example**:
```bash
CLOUDINARY_API_KEY="123456789012345"
```

**Where to Get**:
1. Cloudinary Dashboard
2. Main dashboard displays API Key
3. Also available in Account Settings

**Security**:
- Keep secret (similar to password)
- Don't commit to version control
- Rotate if compromised

---

#### CLOUDINARY_API_SECRET

**Type**: `string`  
**Required**: ✅ Yes (if using Cloudinary)  
**Description**: Your Cloudinary API secret

**Example**:
```bash
CLOUDINARY_API_SECRET="abcdefghijklmnopqrstuvwxyz123456"
```

**Where to Get**:
1. Cloudinary Dashboard
2. Main dashboard displays API Secret
3. Also available in Account Settings

**Security**:
- ⚠️ **Highly sensitive** - treat like a password
- Never commit to version control
- Rotate immediately if exposed
- Use different secrets for development/production

**All Three Required**:
All three Cloudinary variables (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) must be set together. The application will use Cloudinary if all three are present.

**See**: [STORAGE_SETUP.md](./STORAGE_SETUP.md) for detailed Cloudinary setup.

---

### Option 2: AWS S3

AWS S3 provides more control and may be better for scale.

#### AWS_REGION

**Type**: `string`  
**Required**: ✅ Yes (if using S3)  
**Description**: AWS region where your S3 bucket is located

**Example**:
```bash
AWS_REGION="us-east-1"
```

**Common Regions**:
- `us-east-1` - US East (N. Virginia)
- `us-west-2` - US West (Oregon)
- `eu-west-1` - Europe (Ireland)
- `ap-southeast-1` - Asia Pacific (Singapore)

**Where to Get**:
- AWS S3 bucket configuration
- Region selected when creating bucket

---

#### AWS_ACCESS_KEY_ID

**Type**: `string`  
**Required**: ✅ Yes (if using S3)  
**Description**: AWS access key ID for IAM user with S3 permissions

**Example**:
```bash
AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
```

**Where to Get**:
1. AWS Console → IAM → Users
2. Select user with S3 access
3. Security credentials tab
4. Access keys section

**Security**:
- Keep secret
- Don't commit to version control
- Rotate periodically
- Use IAM user with minimal required permissions

---

#### AWS_SECRET_ACCESS_KEY

**Type**: `string`  
**Required**: ✅ Yes (if using S3)  
**Description**: AWS secret access key for IAM user

**Example**:
```bash
AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
```

**Where to Get**:
1. Created with `AWS_ACCESS_KEY_ID`
2. ⚠️ **Shown only once** when creating access key
3. Save securely - cannot be retrieved later

**Security**:
- ⚠️ **Highly sensitive** - treat like password
- Never commit to version control
- Rotate if exposed
- Use different credentials for dev/prod

---

#### AWS_S3_BUCKET

**Type**: `string`  
**Required**: ✅ Yes (if using S3)  
**Description**: Name of your S3 bucket for storing images

**Example**:
```bash
AWS_S3_BUCKET="trading-journal-screenshots"
```

**Requirements**:
- Bucket name must be globally unique
- Must exist in specified `AWS_REGION`
- IAM user must have read/write permissions

**All Four Required**:
All four AWS S3 variables (`AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`) must be set together. The application will use S3 if all four are present.

**See**: [STORAGE_SETUP.md](./STORAGE_SETUP.md) for detailed AWS S3 setup.

---

## Environment Variable Priority

The application checks for storage providers in this order:

1. **Cloudinary** - If all three Cloudinary variables are set
2. **AWS S3** - If all four S3 variables are set
3. **None** - If neither set is complete, screenshot uploads will fail

**Note**: You can only use ONE storage provider at a time. If both are configured, Cloudinary takes precedence.

---

## Local Development Setup

### Creating .env File

1. Create `.env` file in project root:
   ```bash
   touch .env
   ```

2. Add required variables:
   ```bash
   # Required
   DATABASE_URL="postgresql://user:password@localhost:5432/trading_journal"
   JWT_SECRET="your-local-development-secret-min-32-chars"
   
   # Optional
   JWT_EXPIRES_IN="7d"
   NODE_ENV="development"
   ```

3. Add cloud storage variables (if testing screenshot uploads):
   ```bash
   # Cloudinary (if using)
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   ```

### Loading .env File

The application automatically loads `.env` file:
- Next.js automatically loads `.env` files
- `scripts/dev-local.sh` also loads `.env` explicitly
- `dotenv` package handles environment variable loading

**File Loading Order**:
1. `.env.local` (highest priority, ignored by git)
2. `.env.development` / `.env.production` (environment-specific)
3. `.env` (default)

**Note**: `.env.local` should be used for local secrets (gitignored).

---

## Production Setup (Vercel)

### Setting Environment Variables on Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Add each variable:
   - **Key**: Variable name (e.g., `DATABASE_URL`)
   - **Value**: Variable value
   - **Environment**: Select scope (Production, Preview, Development)
5. Click **Save**

### Environment Scope

**Production**: Used in production deployments  
**Preview**: Used in preview deployments (pull requests, branches)  
**Development**: Used in Vercel CLI local development

**Recommendation**: Set all variables for all three environments unless you have environment-specific requirements.

### After Adding Variables

**Important**: After adding or updating environment variables:
1. Go to **Deployments** tab
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

Environment variables don't trigger auto-deploy - manual redeploy is required.

---

## Environment Variable Validation

### Required Variables Check

The application validates required variables:

**DATABASE_URL**:
- Must be set
- Must be valid PostgreSQL connection string
- Database must be accessible

**JWT_SECRET**:
- Must be set (uses fallback if not, but warns in production)
- Should be at least 32 characters

### Runtime Checks

**Database Connection**:
- Prisma will error if `DATABASE_URL` is invalid or inaccessible
- Check connection during application startup

**Cloud Storage**:
- Storage provider checked at runtime
- Error thrown if screenshot upload attempted without storage configured

---

## Example .env Files

### Minimal Configuration (Core Features Only)

```bash
# Required
DATABASE_URL="postgresql://postgres:password@localhost:5432/trading_journal"
JWT_SECRET="your-secret-key-minimum-32-characters-long"

# Optional
JWT_EXPIRES_IN="7d"
```

**Features Available**:
- ✅ Authentication
- ✅ Trade management
- ✅ Analytics
- ❌ Screenshot uploads (not configured)

---

### Full Configuration (With Cloudinary)

```bash
# Required
DATABASE_URL="postgresql://postgres:password@localhost:5432/trading_journal"
JWT_SECRET="your-secret-key-minimum-32-characters-long"

# Optional
JWT_EXPIRES_IN="7d"
DATABASE_URL_DIRECT="postgresql://postgres:password@localhost:5432/trading_journal?sslmode=require"

# Cloudinary (for screenshot uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

**Features Available**:
- ✅ All features including screenshot uploads

---

### Production Configuration (Supabase + Cloudinary)

```bash
# Required
DATABASE_URL="postgresql://postgres.[ref]:[pass]@aws-1-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
JWT_SECRET="your-production-secret-44-characters-base64-encoded"

# Optional
JWT_EXPIRES_IN="7d"
DATABASE_URL_DIRECT="postgresql://postgres.[ref]:[pass]@aws-1-[region].pooler.supabase.com:5432/postgres?sslmode=require"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

---

## Security Best Practices

### General Security

1. **Never Commit .env Files**
   - ✅ `.env` is in `.gitignore`
   - ✅ `.env.local` should also be gitignored
   - ✅ Use `.env.example` for documentation (without secrets)

2. **Use Different Secrets Per Environment**
   - Development: Use test/development secrets
   - Production: Use strong, randomly generated secrets
   - Never share secrets between environments

3. **Rotate Secrets Regularly**
   - JWT_SECRET: Rotate periodically (requires users to re-login)
   - Cloud storage secrets: Rotate if compromised
   - Database credentials: Rotate via database provider

4. **Minimum Length Requirements**
   - `JWT_SECRET`: Minimum 32 characters (64+ recommended)
   - Generate using cryptographically secure random generators

5. **Access Control**
   - Limit who has access to production environment variables
   - Use Vercel team permissions appropriately
   - Audit environment variable access

### Production Security

1. **Strong JWT_SECRET**
   ```bash
   # Generate strong secret
   openssl rand -base64 32
   ```

2. **Secure Database Connection**
   - Use SSL/SSL mode in connection strings
   - Use connection pooling for serverless
   - Limit database user permissions

3. **Cloud Storage Security**
   - Use IAM users with minimal permissions (S3)
   - Rotate access keys periodically
   - Monitor storage access logs

4. **Environment Variable Security**
   - Store in secure vault for team access
   - Document access and rotation procedures
   - Monitor for exposed secrets in logs

---

## Troubleshooting

### Variable Not Loaded

**Symptoms**: Application can't find environment variable

**Solutions**:
1. Verify variable name is correct (case-sensitive)
2. Check `.env` file location (must be in project root)
3. Restart development server after adding variables
4. On Vercel: Redeploy after adding variables
5. Check for typos or extra spaces in variable names

### Variable Not Working

**Symptoms**: Variable is set but application behaves incorrectly

**Solutions**:
1. Verify variable value is correct
2. Check for quotes in `.env` file (may be included in value)
3. Restart application (variables loaded at startup)
4. Check application logs for errors
5. Verify variable format matches expected format

### Database Connection Errors

**Symptoms**: Cannot connect to database

**Solutions**:
1. Verify `DATABASE_URL` format is correct
2. Check database is running and accessible
3. Verify credentials are correct
4. Check network connectivity
5. Add `?sslmode=require` if SSL required

### Authentication Errors

**Symptoms**: Login/registration fails

**Solutions**:
1. Verify `JWT_SECRET` is set
2. Check `JWT_SECRET` is at least 32 characters
3. Ensure same secret used across all instances
4. Clear browser cookies and try again

### Storage Upload Errors

**Symptoms**: Screenshot uploads fail

**Solutions**:
1. Verify all storage provider variables are set
2. Check credentials are correct
3. Verify storage account is active
4. Check file size limits (10MB max)
5. Verify file types are supported (JPEG, PNG, GIF, WebP)

---

## Variable Reference by Feature

### Authentication
- `JWT_SECRET` - Required
- `JWT_EXPIRES_IN` - Optional (default: `7d`)

### Database
- `DATABASE_URL` - Required
- `DATABASE_URL_DIRECT` - Optional (for migrations)
- `NODE_ENV` - Optional (affects logging)

### Screenshot Uploads
- Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- OR AWS S3: `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`

---

## Quick Checklist

### Local Development
- [ ] `DATABASE_URL` set to local PostgreSQL
- [ ] `JWT_SECRET` set (can be simple for dev, but 32+ chars)
- [ ] Cloud storage variables set (if testing uploads)

### Production (Vercel)
- [ ] `DATABASE_URL` set to production database (Transaction Mode recommended)
- [ ] `JWT_SECRET` set to strong, randomly generated secret
- [ ] `JWT_EXPIRES_IN` set (optional, or use default)
- [ ] `DATABASE_URL_DIRECT` set (optional, but recommended for Supabase)
- [ ] Cloud storage variables set (if using screenshots)
- [ ] Variables set for Production, Preview, and Development environments
- [ ] Application redeployed after adding variables

---

## Additional Resources

- [VERCEL_ENV_CONFIGURATION.md](./VERCEL_ENV_CONFIGURATION.md) - Vercel-specific environment variable setup
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database connection string details
- [STORAGE_SETUP.md](./STORAGE_SETUP.md) - Cloud storage setup guides
- [README.md](../README.md) - Project setup instructions

---

**Last Updated**: Complete environment variables reference guide

