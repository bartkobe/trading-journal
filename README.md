# Trading Journal Web App

A comprehensive single-user web application designed for day and swing traders to systematically record, analyze, and learn from their trades. Transform trading from a reactive activity into a data-driven, continuously improving process.

**Live Application**: https://trading-journal-eight-tau.vercel.app

---

## Features

### Trade Management
- ✅ Complete trade entry with all relevant fields (symbol, asset type, prices, dates, quantities)
- ✅ **Record trades at opening** - Capture trades immediately when entered, before they close
- ✅ **Open trades support** - Track active positions with optional exit information
- ✅ Support for multiple asset types: Stocks, Forex, Crypto, Options
- ✅ Multi-currency support (USD, EUR, GBP, JPY, CAD, AUD, CHF, PLN, and more)
- ✅ Automatic P&L calculations (gross, percentage, net after fees) for closed trades
- ✅ Rich text editor for trade notes and journaling
- ✅ Screenshot/image uploads for chart analysis
- ✅ Custom tags and categorization
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Trade status filtering (open/closed) and visual indicators

### Analytics & Insights
- ✅ Comprehensive dashboard with key performance metrics
- ✅ Advanced analytics: Sharpe ratio, expectancy, maximum drawdown
- ✅ Performance breakdowns by symbol, strategy, asset type, setup type
- ✅ Behavioral insights: Performance by emotional state, time of day, day of week
- ✅ Visual analytics with interactive charts:
  - Equity curve (cumulative P&L over time)
  - Win/loss distribution
  - P&L by various dimensions
- ✅ Date range filtering for period-specific analysis

### Organization & Search
- ✅ Powerful search across symbols, notes, strategies, and tags
- ✅ Advanced filtering by date range, asset type, outcome, strategy, tags, symbol, **trade status (open/closed)**
- ✅ Flexible sorting by date, P&L, P&L%, symbol
- ✅ Pagination for large trade lists
- ✅ **Open Trades Dashboard** - Dedicated section showing all active positions

### User Experience
- ✅ Clean, minimal, professional financial aesthetic
- ✅ Light and dark theme support
- ✅ Fully responsive design (desktop-first, mobile-friendly)
- ✅ Accessible (WCAG 2.1 AA compliance)
- ✅ Fast and performant
- ✅ **Bilingual support** - English and Polish languages
- ✅ Language switching with persistent preference

### Data Management
- ✅ CSV export for all trade data
- ✅ Cloud storage for screenshots (Cloudinary or AWS S3)
- ✅ Secure authentication with JWT

---

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Rich Text**: Tiptap
- **Internationalization**: next-intl (English and Polish)

### Backend
- **API**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: JWT with httpOnly cookies
- **Password Hashing**: bcryptjs

### Infrastructure
- **Hosting**: Vercel
- **Database**: Supabase (PostgreSQL)
- **Storage**: Cloudinary or AWS S3 (optional)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm (or yarn/pnpm/bun)
- **PostgreSQL database** (local or cloud - Supabase recommended)
- **Git** (for version control)

### Recommended Development Tools
- **VS Code** (or your preferred editor)
- **PostgreSQL client** (for database management - optional)
- **Supabase account** (for cloud database - recommended)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd trading-journal
```

### 2. Install Dependencies

```bash
npm install
```

This will:
- Install all Node.js dependencies
- Generate Prisma client (via postinstall script)

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env  # If .env.example exists, or create .env manually
```

**Required Environment Variables**:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/trading_journal?sslmode=require"

# Authentication
JWT_SECRET="your-secret-key-minimum-32-characters-long-change-in-production"
JWT_EXPIRES_IN="7d"  # Optional, defaults to 7d

# Cloud Storage (Optional - only needed for screenshot uploads)
# Option 1: Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# OR Option 2: AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="your-bucket-name"
```

**See**: [VERCEL_ENV_CONFIGURATION.md](./docs/VERCEL_ENV_CONFIGURATION.md) for detailed environment variable documentation.

### 4. Set Up Database

#### Option A: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database:
   ```bash
   createdb trading_journal
   ```
3. Update `DATABASE_URL` in `.env` with your local connection string

#### Option B: Supabase (Recommended)

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your connection string from **Settings** → **Database**
4. Use **Transaction Mode** connection (port 6543) for `DATABASE_URL`
5. Optionally add **Direct Connection** (port 5432) for `DATABASE_URL_DIRECT` (for migrations)

**See**: [DATABASE_SETUP.md](./docs/DATABASE_SETUP.md) for detailed database setup instructions.

### 5. Run Database Migrations

```bash
# Generate Prisma client (if not already done)
npx prisma generate

# Run migrations to create database tables
npx prisma migrate dev
```

This will:
- Create all necessary tables (User, Trade, Tag, Screenshot, etc.)
- Set up indexes and foreign keys
- Create enums for asset types, directions, etc.

**Verify Database**:
```bash
# Open Prisma Studio to view database
npx prisma studio
```

### 6. Start Development Server

```bash
npm run dev
```

Or use the local development script:
```bash
npm run dev:local
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 7. Create Your First Account

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. Click "Register" or use the registration form
3. Enter your email, password, and name (optional)
4. Click "Register"
5. You'll be redirected to the dashboard

---

## Available Scripts

### Development

```bash
# Start development server (with Turbo)
npm run dev

# Start development server (legacy mode)
npm run dev:legacy

# Start development server (with .env file loading)
npm run dev:local
```

### Building

```bash
# Build for production
npm run build

# Start production server (after build)
npm run start
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check code formatting
npm run format:check

# Type check
npm run type-check

# Type check (strict mode for CI)
npm run type-check:ci
```

### Database

```bash
# Generate Prisma client
npx prisma generate

# Create and run migration
npx prisma migrate dev

# Run migrations in production
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio

# Pull schema from database
npx prisma db pull

# Push schema to database (careful in production!)
npx prisma db push
```

---

## Project Structure

```
trading-journal/
├── app/                          # Next.js App Router pages and API routes
│   ├── [locale]/                 # Locale-aware pages (en, pl)
│   │   ├── api/                  # API endpoints (if needed)
│   │   ├── dashboard/            # Dashboard page
│   │   ├── trades/               # Trade pages
│   │   ├── layout.tsx            # Locale layout
│   │   ├── page.tsx              # Landing/login page
│   │   ├── error.tsx             # Error boundary
│   │   └── not-found.tsx         # 404 page
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── analytics/                # Analytics components
│   ├── auth/                     # Authentication components
│   ├── trades/                   # Trade-related components
│   ├── ui/                       # Reusable UI components
│   └── providers/                # Context providers
│
├── locales/                      # Translation files
│   ├── en/                       # English translations
│   │   ├── common.json
│   │   ├── navigation.json
│   │   ├── forms.json
│   │   ├── trades.json
│   │   ├── analytics.json
│   │   └── errors.json
│   └── pl/                       # Polish translations
│       ├── common.json
│       ├── navigation.json
│       ├── forms.json
│       ├── trades.json
│       ├── analytics.json
│       └── errors.json
│
├── i18n/                         # Internationalization configuration
│   ├── config.ts                 # Locale configuration
│   ├── request.ts                # Server-side i18n setup
│   └── routing.ts                # Locale-aware routing
│
├── lib/                          # Utility libraries
│   ├── analytics.ts              # Analytics calculations
│   ├── auth.ts                   # Authentication utilities
│   ├── db.ts                     # Prisma client
│   ├── storage.ts                # Cloud storage utilities
│   ├── trades.ts                 # Trade calculations
│   ├── types.ts                  # TypeScript types
│   └── validation.ts             # Zod validation schemas
│
├── prisma/                       # Prisma configuration
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Database migrations
│
├── __tests__/                    # Test files
│   ├── api/                      # API endpoint tests
│   ├── components/               # Component tests
│   └── lib/                      # Utility tests
│
├── scripts/                      # Build and setup scripts
├── public/                       # Static assets
└── docs/                         # Documentation (various .md files)
```

---

## Configuration

### Database Configuration

**File**: `prisma/schema.prisma`

The database schema defines:
- User authentication
- Trade entries with all fields
- Tags and trade-tag relationships
- Screenshot storage
- Enums for asset types, directions, time of day, market conditions

**See**: [DATABASE_SETUP.md](./docs/DATABASE_SETUP.md) for detailed database configuration.

### Environment Variables

**File**: `.env` (create from `.env.example` if available)

**Required**:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT token signing (min 32 chars)

**Optional**:
- `JWT_EXPIRES_IN` - Token expiration (default: "7d")
- `DATABASE_URL_DIRECT` - Direct database connection for migrations
- Cloud storage variables (see Cloud Storage section)

**See**: [VERCEL_ENV_CONFIGURATION.md](./docs/VERCEL_ENV_CONFIGURATION.md) for complete environment variable documentation.

### Cloud Storage (Optional)

Screenshot uploads require cloud storage configuration. Choose one:

**Cloudinary** (Recommended - easier setup):
```bash
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

**AWS S3**:
```bash
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="your-bucket-name"
```

**See**: [STORAGE_SETUP.md](./docs/STORAGE_SETUP.md) for detailed cloud storage setup.

---

## Development Workflow

### Adding a New Trade

1. Navigate to `/trades/new`
2. Fill in trade details:
   - Symbol, asset type, currency
   - Entry and exit dates/prices
   - Quantity and direction (Long/Short)
   - Optional: Strategy, setup type, emotional states, notes
3. Add tags if desired
4. Upload screenshots (if cloud storage configured)
5. Submit form

### Viewing Analytics

1. Navigate to `/dashboard`
2. View key metrics at the top
3. Scroll to see performance breakdowns
4. Use date range filter to analyze specific periods
5. Explore interactive charts

### Searching and Filtering Trades

1. Navigate to `/trades`
2. Use search box to find trades by symbol, notes, strategy, or tags
3. Apply filters (date range, asset type, outcome, etc.)
4. Sort by date, P&L, or symbol
5. Combine filters for precise searches

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- __tests__/lib/analytics.test.ts

# Run tests in watch mode
npm test:watch

# Run with coverage
npm test:coverage
```

### Test Structure

- **Unit Tests**: Test individual functions and utilities
- **API Tests**: Test API endpoints and request/response handling
- **Component Tests**: Test React components with React Testing Library
- **Integration Tests**: Test complete workflows

**See**: Test files in `__tests__/` directory for examples.

---

## Building for Production

### Build Process

```bash
# Build the application
npm run build
```

The build process:
1. Generates Prisma client
2. Type checks the codebase
3. Builds Next.js application (optimized for production)
4. Creates optimized bundles

### Build Output

- Production-ready code in `.next/` directory
- Optimized static assets
- Server-side code for API routes
- Static pages where possible

### Pre-deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] Tests passing (`npm test`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)
- [ ] Application tested locally

---

## Deployment

### Deploy to Vercel (Recommended)

The application is configured for Vercel deployment:

1. **Push to Git Repository**:
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your Git repository
   - Vercel will auto-detect Next.js configuration

3. **Configure Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add all required variables:
     - `DATABASE_URL`
     - `JWT_SECRET`
     - Cloud storage variables (if using screenshots)
   - Set scope: Production, Preview, Development

4. **Deploy**:
   - Vercel will automatically deploy on push
   - Or manually trigger deployment from dashboard

5. **Run Migrations**:
   ```bash
   # Locally, with production DATABASE_URL
   DATABASE_URL="your-production-url" npx prisma migrate deploy
   ```

**See**: [DEPLOYMENT_VERIFICATION.md](./docs/DEPLOYMENT_VERIFICATION.md) for comprehensive deployment guide.

### Production Checklist

- [ ] Database set up (Supabase recommended)
- [ ] Environment variables configured on Vercel
- [ ] Migrations run on production database
- [ ] Cloud storage configured (if using screenshots)
- [ ] HTTPS/SSL verified (automatic on Vercel)
- [ ] Application tested in production
- [ ] Database backups configured (upgrade to Pro Plan recommended)

**See**: [DEPLOYMENT_CHECKLIST.md](./docs/DEPLOYMENT_CHECKLIST.md) for complete checklist.

---

## Documentation

Comprehensive documentation is available in the repository:

### Setup & Configuration
- [ENVIRONMENT_VARIABLES.md](./docs/ENVIRONMENT_VARIABLES.md) - Complete environment variables reference
- [DATABASE_SETUP.md](./docs/DATABASE_SETUP.md) - Database setup and configuration
- [VERCEL_ENV_CONFIGURATION.md](./docs/VERCEL_ENV_CONFIGURATION.md) - Vercel-specific environment variable configuration
- [STORAGE_SETUP.md](./docs/STORAGE_SETUP.md) - Cloud storage setup (Cloudinary/S3)

### API Documentation
- [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) - Complete API endpoint reference

### User Documentation
- [USER_GUIDE.md](./docs/USER_GUIDE.md) - Complete user guide for end-users

### Deployment
- [DEPLOYMENT_VERIFICATION.md](./docs/DEPLOYMENT_VERIFICATION.md) - Deployment verification
- [DEPLOYMENT_CHECKLIST.md](./docs/DEPLOYMENT_CHECKLIST.md) - Deployment checklist
- [PRODUCTION_STORAGE_SETUP.md](./docs/PRODUCTION_STORAGE_SETUP.md) - Production storage setup
- [HTTPS_SSL_CONFIGURATION.md](./docs/HTTPS_SSL_CONFIGURATION.md) - HTTPS/SSL configuration
- [DATABASE_BACKUP_GUIDE.md](./docs/DATABASE_BACKUP_GUIDE.md) - Database backup guide

### Development & Testing
- [PRODUCTION_TESTING_GUIDE.md](./docs/PRODUCTION_TESTING_GUIDE.md) - Production testing procedures
- [PRODUCTION_TROUBLESHOOTING.md](./docs/PRODUCTION_TROUBLESHOOTING.md) - Troubleshooting guide
- [ERROR_HANDLING_GUIDE.md](./docs/ERROR_HANDLING_GUIDE.md) - Error handling patterns

### Design & Styling
- [THEME_GUIDE.md](./docs/THEME_GUIDE.md) - Theme and color system
- [AESTHETIC_GUIDE.md](./docs/AESTHETIC_GUIDE.md) - Visual design standards
- [FORM_STYLING_GUIDE.md](./docs/FORM_STYLING_GUIDE.md) - Form styling patterns
- [RESPONSIVE_DESIGN.md](./docs/RESPONSIVE_DESIGN.md) - Responsive design guide
- [ACCESSIBILITY_GUIDE.md](./docs/ACCESSIBILITY_GUIDE.md) - Accessibility standards

### Database
- [SUPABASE_POOLER_FIX.md](./docs/SUPABASE_POOLER_FIX.md) - Supabase connection pooling

---

## Troubleshooting

### Common Issues

#### Database Connection Errors

**Problem**: Cannot connect to database

**Solutions**:
1. Verify `DATABASE_URL` is correct in `.env`
2. Check database is running (if local)
3. Verify network connectivity (if cloud database)
4. Check SSL requirements (add `?sslmode=require` if needed)

**See**: [DATABASE_SETUP.md](./docs/DATABASE_SETUP.md) for detailed troubleshooting.

#### Authentication Issues

**Problem**: Login/registration not working

**Solutions**:
1. Verify `JWT_SECRET` is set in `.env`
2. Check `JWT_SECRET` is at least 32 characters
3. Clear browser cookies and try again
4. Check browser console for errors

#### Screenshot Upload Fails

**Problem**: Screenshot upload returns error

**Solutions**:
1. Verify cloud storage credentials are set
2. Check storage provider configuration (Cloudinary or S3)
3. Verify file size (max 10MB)
4. Check file type (JPEG, PNG, GIF, WebP only)

**See**: [STORAGE_SETUP.md](./docs/STORAGE_SETUP.md) for troubleshooting.

#### Build Errors

**Problem**: `npm run build` fails

**Solutions**:
1. Run `npx prisma generate` first
2. Check TypeScript errors: `npm run type-check`
3. Clear `.next` directory and rebuild
4. Verify all dependencies installed: `npm install`

#### Prisma Client Errors

**Problem**: "PrismaClient is not initialized" or similar

**Solutions**:
1. Run `npx prisma generate`
2. Restart development server
3. Clear `node_modules/.prisma` and regenerate

**See**: [PRODUCTION_TROUBLESHOOTING.md](./docs/PRODUCTION_TROUBLESHOOTING.md) for more troubleshooting help.

---

## Security Considerations

### Authentication
- ✅ Passwords hashed with bcryptjs (12 rounds)
- ✅ JWT tokens signed with strong secret
- ✅ httpOnly cookies (not accessible via JavaScript)
- ✅ Secure cookies in production (HTTPS only)

### Data Protection
- ✅ Input validation on frontend and backend (Zod schemas)
- ✅ SQL injection prevention (Prisma parameterized queries)
- ✅ XSS prevention (React automatic escaping)
- ✅ CSRF protection via same-site cookies

### Security Headers
- ✅ HTTPS enforced (automatic on Vercel)
- ✅ Security headers configured
- ✅ Secure cookie flags

**Important**: Always use strong, unique `JWT_SECRET` in production. Generate with:
```bash
openssl rand -base64 32
```

---

## Contributing

### Code Style

- **Formatting**: Prettier (configured)
- **Linting**: ESLint with Next.js config
- **TypeScript**: Strict mode enabled

Run before committing:
```bash
npm run format
npm run lint:fix
npm run type-check
```

### Testing

- Write tests for new features
- Maintain or improve test coverage
- Follow existing test patterns

### Commit Messages

Use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions/changes

---

## License

[Add your license here]

---

## Support

For issues, questions, or contributions:
- Check documentation in repository
- Review [PRODUCTION_TROUBLESHOOTING.md](./docs/PRODUCTION_TROUBLESHOOTING.md)
- Check existing GitHub issues
- Create new issue if needed

---

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org) - React framework
- [Prisma](https://www.prisma.io) - Database ORM
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [Recharts](https://recharts.org) - Chart library
- [Tiptap](https://tiptap.dev) - Rich text editor
- [Supabase](https://supabase.com) - Database hosting
- [Vercel](https://vercel.com) - Hosting platform

---

**Version**: 0.1.0  
**Last Updated**: 2024
