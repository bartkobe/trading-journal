# Task List: Trading Journal Web App

**Based on:** `0001-prd-trading-journal.md`  
**Generated:** October 27, 2025  
**Status:** In Progress

---

## Relevant Files

### Configuration & Setup

- `package.json` - Project dependencies and scripts (✅ Created - includes all core dependencies and lint/format scripts)
- `.env.example` - Environment variable template (✅ Created - includes database, JWT, and storage configs)
- `.env` - Local environment variables (✅ Created - configured for local development)
- `.gitignore` - Git ignore patterns (✅ Created - includes .env\* and node_modules)
- `README.md` - Project documentation (✅ Created - Next.js default)
- `prisma.config.ts` - Prisma configuration (✅ Created - loads environment variables)
- `eslint.config.mjs` - ESLint configuration (✅ Created - Next.js + TypeScript + Prettier rules)
- `.prettierrc` - Prettier configuration (✅ Created - consistent code formatting)
- `.prettierignore` - Prettier ignore patterns (✅ Created - excludes build files and migrations)

### Database & Schema

- `prisma/schema.prisma` - Database schema definition (✅ Created - includes User, Trade, Tag, Screenshot, TradeTag models with all PRD fields)
- `prisma/migrations/20241027202841_init/migration.sql` - Initial database migration (✅ Created - all tables, enums, indexes, and foreign keys)
- `lib/db.ts` - Database client initialization (✅ Created - Prisma singleton)

### Authentication

- `app/api/auth/register/route.ts` - User registration endpoint
- `app/api/auth/login/route.ts` - User login endpoint
- `app/api/auth/logout/route.ts` - User logout endpoint
- `lib/auth.ts` - Authentication utilities and session management
- `middleware.ts` - Authentication middleware for protected routes

### Trade Management (API)

- `app/api/trades/route.ts` - GET (list) and POST (create) trades
- `app/api/trades/[id]/route.ts` - GET, PUT (update), DELETE specific trade
- `app/api/trades/[id]/screenshots/route.ts` - Upload screenshots for a trade
- `lib/trades.ts` - Trade business logic and calculations

### Analytics (API)

- `app/api/analytics/dashboard/route.ts` - Dashboard metrics endpoint
- `app/api/analytics/performance/route.ts` - Performance breakdown endpoint
- `app/api/analytics/charts/route.ts` - Chart data endpoint
- `lib/analytics.ts` - Analytics calculations (Sharpe ratio, expectancy, drawdown, etc.)

### Data Export

- `app/api/export/csv/route.ts` - CSV export endpoint
- `lib/export.ts` - CSV generation logic

### Tags

- `app/api/tags/route.ts` - GET tags, POST new tag
- `app/api/tags/[id]/route.ts` - Update/delete tags

### Frontend - Pages

- `app/page.tsx` - Landing/login page
- `app/dashboard/page.tsx` - Main analytics dashboard
- `app/trades/page.tsx` - Trade list view
- `app/trades/new/page.tsx` - New trade entry form
- `app/trades/[id]/page.tsx` - Trade detail/edit view
- `app/layout.tsx` - Root layout with navigation

### Frontend - Components

- `components/auth/LoginForm.tsx` - Login form component
- `components/auth/RegisterForm.tsx` - Registration form component
- `components/trades/TradeForm.tsx` - Trade entry/edit form
- `components/trades/TradeList.tsx` - Trade list table/cards
- `components/trades/TradeCard.tsx` - Individual trade card
- `components/trades/TradeFilters.tsx` - Search and filter controls
- `components/trades/TradeDetail.tsx` - Trade detail view
- `components/trades/ScreenshotUpload.tsx` - Image upload component
- `components/analytics/DashboardMetrics.tsx` - Key metrics display
- `components/analytics/PerformanceCharts.tsx` - Chart components
- `components/analytics/EquityCurve.tsx` - Equity curve chart
- `components/ui/Navigation.tsx` - Main navigation component
- `components/ui/ThemeToggle.tsx` - Light/dark mode toggle
- `components/ui/TagInput.tsx` - Tag input with autocomplete
- `components/ui/CurrencySelector.tsx` - Currency dropdown

### Utilities & Types

- `lib/types.ts` - TypeScript interfaces and types
- `lib/utils.ts` - Helper functions
- `lib/validation.ts` - Input validation schemas
- `lib/storage.ts` - Cloud storage integration for images (✅ Created - supports Cloudinary and AWS S3)
- `STORAGE_SETUP.md` - Cloud storage setup documentation (✅ Created - comprehensive guide for both providers)

### Styling

- `app/globals.css` - Global styles and theme variables
- `tailwind.config.js` - Tailwind configuration with theme colors

### Testing

- `__tests__/lib/analytics.test.ts` - Analytics calculation tests
- `__tests__/lib/trades.test.ts` - Trade logic tests
- `__tests__/api/trades.test.ts` - Trade API endpoint tests
- `__tests__/components/TradeForm.test.tsx` - Trade form component tests

---

## Tasks

- [x] 1.0 Project Setup & Infrastructure
  - [x] 1.1 Initialize Next.js project with TypeScript and App Router (`npx create-next-app@latest`)
  - [x] 1.2 Install core dependencies (Prisma, bcryptjs, Tailwind CSS, chart library)
  - [x] 1.3 Set up Prisma ORM and connect to PostgreSQL database (local or cloud)
  - [x] 1.4 Create database schema in `prisma/schema.prisma` with models: User, Trade, Tag, Screenshot
  - [x] 1.5 Run initial database migration (`npx prisma migrate dev`)
  - [x] 1.6 Set up cloud storage integration for image uploads (AWS S3, Cloudinary, or similar)
  - [x] 1.7 Configure environment variables (.env file) for database URL, storage credentials, JWT secret
  - [x] 1.8 Create `.env.example` template file for documentation
  - [x] 1.9 Set up ESLint and Prettier for code quality
  - [x] 1.10 Create basic project structure (lib/, components/, app/ directories)

- [ ] 2.0 Authentication System
  - [ ] 2.1 Create User model in database schema with email, hashed password, timestamps
  - [ ] 2.2 Implement password hashing utilities using bcryptjs in `lib/auth.ts`
  - [ ] 2.3 Create user registration API endpoint (`app/api/auth/register/route.ts`)
  - [ ] 2.4 Create user login API endpoint with JWT token generation (`app/api/auth/login/route.ts`)
  - [ ] 2.5 Create logout API endpoint (`app/api/auth/logout/route.ts`)
  - [ ] 2.6 Implement authentication middleware in `middleware.ts` to protect routes
  - [ ] 2.7 Create session management utilities (verify token, get current user)
  - [ ] 2.8 Build LoginForm component (`components/auth/LoginForm.tsx`)
  - [ ] 2.9 Build RegisterForm component (`components/auth/RegisterForm.tsx`)
  - [ ] 2.10 Create landing/login page (`app/page.tsx`)
  - [ ] 2.11 Test authentication flow (register, login, protected route access)

- [ ] 3.0 Trade Management (CRUD Operations)
  - [ ] 3.1 Define Trade model in database schema with all required fields (symbol, asset type, currency, dates, prices, quantities, etc.)
  - [ ] 3.2 Define Screenshot model with relationship to Trade (one-to-many)
  - [ ] 3.3 Define Tag model and Trade-Tag many-to-many relationship
  - [ ] 3.4 Create TypeScript interfaces for Trade in `lib/types.ts`
  - [ ] 3.5 Create trade calculation utilities in `lib/trades.ts` (P&L, P&L%, net P&L after fees)
  - [ ] 3.6 Create input validation schemas in `lib/validation.ts` using Zod or similar
  - [ ] 3.7 Build POST /api/trades endpoint to create new trade
  - [ ] 3.8 Build GET /api/trades endpoint to list all trades with filtering (date range, asset type, outcome, etc.)
  - [ ] 3.9 Build GET /api/trades/[id] endpoint to fetch single trade with all details
  - [ ] 3.10 Build PUT /api/trades/[id] endpoint to update trade
  - [ ] 3.11 Build DELETE /api/trades/[id] endpoint with confirmation
  - [ ] 3.12 Build POST /api/trades/[id]/screenshots endpoint for image uploads
  - [ ] 3.13 Create TradeForm component with all fields from FR-1, FR-2, FR-3
  - [ ] 3.14 Create CurrencySelector dropdown component with major currencies
  - [ ] 3.15 Create TagInput component with autocomplete for existing tags
  - [ ] 3.16 Create ScreenshotUpload component with preview and multi-file support
  - [ ] 3.17 Create rich text editor integration for trade notes
  - [ ] 3.18 Build New Trade page (`app/trades/new/page.tsx`)
  - [ ] 3.19 Build Trade List page (`app/trades/page.tsx`)
  - [ ] 3.20 Build TradeList component with table/card layout
  - [ ] 3.21 Build TradeCard component showing key info (symbol, date, P&L, visual indicator)
  - [ ] 3.22 Build Trade Detail page (`app/trades/[id]/page.tsx`)
  - [ ] 3.23 Build TradeDetail component showing all trade information
  - [ ] 3.24 Add edit functionality to Trade Detail page (reuse TradeForm)
  - [ ] 3.25 Implement delete trade with confirmation dialog

- [ ] 4.0 Analytics & Reporting Dashboard
  - [ ] 4.1 Create analytics calculation utilities in `lib/analytics.ts`
  - [ ] 4.2 Implement basic metrics calculations (total P&L, win rate, loss rate, average win/loss, profit factor)
  - [ ] 4.3 Implement expectancy calculation (average expected profit per trade)
  - [ ] 4.4 Implement Sharpe ratio calculation (risk-adjusted returns)
  - [ ] 4.5 Implement drawdown calculations (max drawdown, average drawdown)
  - [ ] 4.6 Create GET /api/analytics/dashboard endpoint returning key metrics
  - [ ] 4.7 Create GET /api/analytics/performance endpoint for performance breakdowns (by symbol, strategy, asset type, time of day, emotional state)
  - [ ] 4.8 Create GET /api/analytics/charts endpoint for chart data (equity curve, win/loss distribution, P&L by dimension)
  - [ ] 4.9 Support date range filtering for all analytics endpoints
  - [ ] 4.10 Install and configure charting library (Chart.js, Recharts, or similar)
  - [ ] 4.11 Build DashboardMetrics component displaying key metrics (FR-13, FR-14)
  - [ ] 4.12 Build EquityCurve component (cumulative P&L over time)
  - [ ] 4.13 Build win/loss distribution chart component
  - [ ] 4.14 Build P&L by asset type chart component
  - [ ] 4.15 Build P&L by strategy chart component
  - [ ] 4.16 Build P&L by time of day chart component
  - [ ] 4.17 Build P&L by day of week chart component
  - [ ] 4.18 Create PerformanceCharts component grouping all visualizations
  - [ ] 4.19 Build Dashboard page (`app/dashboard/page.tsx`)
  - [ ] 4.20 Add date range filter controls to dashboard
  - [ ] 4.21 Display performance breakdowns by symbol, strategy, setup type, emotional state

- [ ] 5.0 UI/UX Implementation (Theming, Navigation, Responsive Design)
  - [ ] 5.1 Configure Tailwind CSS with custom theme colors (professional/financial aesthetic)
  - [ ] 5.2 Set up CSS variables for light and dark themes in `app/globals.css`
  - [ ] 5.3 Create ThemeProvider context for theme state management
  - [ ] 5.4 Build ThemeToggle component (`components/ui/ThemeToggle.tsx`)
  - [ ] 5.5 Implement theme persistence (localStorage)
  - [ ] 5.6 Apply theme classes throughout all components
  - [ ] 5.7 Build Navigation component with links to Dashboard, Trades, New Trade
  - [ ] 5.8 Create root layout (`app/layout.tsx`) with Navigation and ThemeProvider
  - [ ] 5.9 Ensure responsive design for desktop (minimum 1280px width)
  - [ ] 5.10 Style all forms with consistent spacing and typography
  - [ ] 5.11 Add visual indicators: green for profits, red for losses
  - [ ] 5.12 Implement loading states for async operations
  - [ ] 5.13 Add error states and user-friendly error messages
  - [ ] 5.14 Create confirmation dialogs for destructive actions
  - [ ] 5.15 Ensure accessibility standards (WCAG contrast ratios, keyboard navigation)
  - [ ] 5.16 Polish overall aesthetic: clean, minimal, plenty of white space

- [ ] 6.0 Data Export & Additional Features
  - [ ] 6.1 Create CSV generation utility in `lib/export.ts`
  - [ ] 6.2 Build GET /api/export/csv endpoint to export all trade data
  - [ ] 6.3 Include all trade fields and calculated metrics in CSV export
  - [ ] 6.4 Add "Export to CSV" button on trades list page
  - [ ] 6.5 Build GET /api/tags endpoint to list all unique tags
  - [ ] 6.6 Build POST /api/tags endpoint to create new tag
  - [ ] 6.7 Implement tag autocomplete in TagInput component
  - [ ] 6.8 Build TradeFilters component with search and filter controls
  - [ ] 6.9 Implement search functionality across symbol, notes, strategy, tags
  - [ ] 6.10 Implement filtering by date range, asset type, outcome, strategy, tags, symbol
  - [ ] 6.11 Implement sorting by date, P&L, P&L%, symbol
  - [ ] 6.12 Add pagination or infinite scroll for trade lists

- [ ] 7.0 Testing & Quality Assurance
  - [ ] 7.1 Set up Jest and React Testing Library
  - [ ] 7.2 Write unit tests for analytics calculations (`__tests__/lib/analytics.test.ts`)
  - [ ] 7.3 Write unit tests for trade calculations (`__tests__/lib/trades.test.ts`)
  - [ ] 7.4 Write tests for P&L calculation, P&L%, net P&L after fees
  - [ ] 7.5 Write tests for Sharpe ratio, expectancy, drawdown calculations
  - [ ] 7.6 Write API endpoint tests for trade CRUD operations
  - [ ] 7.7 Write API endpoint tests for analytics endpoints
  - [ ] 7.8 Write component tests for TradeForm
  - [ ] 7.9 Write component tests for critical UI components
  - [ ] 7.10 Test authentication flow (register, login, logout, protected routes)
  - [ ] 7.11 Test multi-currency support
  - [ ] 7.12 Test theme toggle functionality
  - [ ] 7.13 Test CSV export with sample data
  - [ ] 7.14 Test image upload functionality
  - [ ] 7.15 Test search and filter functionality
  - [ ] 7.16 Perform manual end-to-end testing of complete user workflows
  - [ ] 7.17 Fix any bugs discovered during testing

- [ ] 8.0 Deployment & Documentation
  - [ ] 8.1 Choose cloud hosting platform (Vercel, Netlify, Railway, or similar)
  - [ ] 8.2 Set up production database (PostgreSQL on cloud provider)
  - [ ] 8.3 Configure environment variables on hosting platform
  - [ ] 8.4 Set up cloud storage for production (S3, Cloudinary, etc.)
  - [ ] 8.5 Deploy application to production
  - [ ] 8.6 Test production deployment thoroughly
  - [ ] 8.7 Set up database backups
  - [ ] 8.8 Configure HTTPS/SSL
  - [ ] 8.9 Write comprehensive README.md with setup instructions
  - [ ] 8.10 Document environment variables required
  - [ ] 8.11 Document API endpoints (optional: use Swagger/OpenAPI)
  - [ ] 8.12 Create user guide for the application features
  - [ ] 8.13 Set up monitoring/error tracking (optional: Sentry or similar)
  - [ ] 8.14 Verify 99.9% uptime target and zero data loss

---

## Notes

### Tech Stack Recommendations

**Frontend Framework**: Next.js 14+ with App Router and TypeScript

- Modern React framework with excellent developer experience
- Built-in API routes for backend
- Server-side rendering and static generation support
- TypeScript for type safety

**Database**: PostgreSQL with Prisma ORM

- Robust relational database perfect for structured trade data
- Prisma provides type-safe database access and easy migrations
- Can be hosted on Supabase, Railway, Neon, or other cloud providers

**Authentication**: JWT with httpOnly cookies

- Simple email/password authentication using bcryptjs for hashing
- JSON Web Tokens for stateless session management
- Secure cookie storage

**Cloud Storage**: Cloudinary or AWS S3

- Cloudinary: Easier setup, automatic image optimization, generous free tier
- AWS S3: More control, lower cost at scale

**Styling**: Tailwind CSS

- Utility-first CSS framework
- Easy to implement light/dark themes
- Fast development with minimal custom CSS

**Charts**: Recharts or Chart.js

- Recharts: React-first, composable, works well with Next.js
- Chart.js: Powerful, well-documented, wide variety of chart types

**Form Handling**: React Hook Form with Zod validation

- Performant form library with minimal re-renders
- Zod for runtime type validation

**Rich Text Editor**: Tiptap or Quill

- Tiptap: Modern, extensible, headless editor
- Quill: Mature, feature-rich, easy to integrate

### Development Approach

1. **Start with Infrastructure**: Database schema and authentication are foundational
2. **Build Core Features First**: Trade CRUD is the heart of the application
3. **Add Analytics Layer**: Once trades are working, implement calculations and visualizations
4. **Polish UI/UX**: Theme, navigation, and responsive design throughout
5. **Test Thoroughly**: Focus on calculation accuracy and data integrity
6. **Deploy Early**: Get to production quickly, iterate based on real usage

### Key Considerations

- **Single User**: Simplified authentication and data model (no multi-tenancy)
- **Multi-Currency**: Store currency per trade, display in original currency (no conversion needed)
- **One Entry/Exit**: Simpler data model, no position scaling
- **Manual Fees**: User enters total commission amount, no auto-calculation
- **Desktop First**: Optimize for minimum 1280px width
- **No Notifications**: Purely on-demand, no email/push features
- **CSV Export Only**: Single export format for initial version

### Testing Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- __tests__/lib/analytics.test.ts

# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Estimated Timeline

- **Phase 1 (Setup & Auth)**: 2-3 days
- **Phase 2 (Trade CRUD)**: 4-5 days
- **Phase 3 (Analytics)**: 3-4 days
- **Phase 4 (UI/UX)**: 2-3 days
- **Phase 5 (Features)**: 2-3 days
- **Phase 6 (Testing)**: 2-3 days
- **Phase 7 (Deployment)**: 1-2 days

**Total Estimated Time**: 16-23 days for a junior developer working full-time

### Success Criteria

The implementation will be complete when:

- ✅ All 29 functional requirements from PRD are implemented
- ✅ User can register, login, and access protected routes
- ✅ User can create, read, update, delete trades with all required fields
- ✅ Advanced analytics (Sharpe ratio, expectancy, drawdown) are accurately calculated
- ✅ All charts and visualizations display correctly
- ✅ Light and dark themes work properly
- ✅ CSV export includes all trade data
- ✅ Search, filter, sort, and tag functionality works
- ✅ Image uploads work reliably
- ✅ Application is deployed and accessible online
- ✅ Zero critical bugs; data integrity is maintained
