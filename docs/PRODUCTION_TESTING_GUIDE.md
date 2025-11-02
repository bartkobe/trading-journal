# Production Testing Guide

This guide provides comprehensive test scenarios and procedures for thoroughly testing the Trading Journal application in production.

**Production URL**: https://trading-journal-eight-tau.vercel.app

---

## Test Execution Strategy

### When to Test

- After initial deployment
- After any code changes or updates
- After environment variable changes
- Before marking deployment as stable
- Periodically (weekly/monthly) for regression testing

### Testing Tools Needed

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Browser DevTools (F12)
- Network throttling tool (for performance testing)
- Mobile device or browser DevTools mobile emulation

---

## Test Categories

1. **Authentication & User Management**
2. **Trade Management (CRUD)**
3. **Screenshot Uploads**
4. **Analytics & Dashboard**
5. **Search, Filter & Sort**
6. **Data Export**
7. **UI/UX & Responsive Design**
8. **Performance & Load**
9. **Security**
10. **Error Handling & Edge Cases**

---

## 1. Authentication & User Management Tests

### Test 1.1: User Registration

**Scenario**: New user creates an account

**Steps**:
1. Navigate to https://trading-journal-eight-tau.vercel.app
2. Click "Register" or use registration form
3. Fill in form:
   - Email: `testuser+[timestamp]@example.com` (use unique email)
   - Password: `TestPassword123!` (meet requirements)
   - Name: `Test User` (optional)
4. Submit form

**Expected Results**:
- ✅ Registration succeeds
- ✅ Success message displayed (if applicable)
- ✅ User redirected to dashboard (`/dashboard`)
- ✅ Navigation shows user name/email
- ✅ User is logged in (can access protected routes)

**Edge Cases to Test**:
- ❌ Register with existing email → Error: "User already exists"
- ❌ Register with invalid email → Validation error
- ❌ Register with weak password → Validation error
- ❌ Register with missing required fields → Validation errors

**Validation**:
- Check browser console for errors
- Verify user created in database (via Supabase dashboard if needed)

---

### Test 1.2: User Login

**Scenario**: Existing user logs in

**Steps**:
1. Navigate to homepage
2. Enter registered email and password
3. Click "Sign In" or submit form

**Expected Results**:
- ✅ Login succeeds
- ✅ User redirected to dashboard
- ✅ User menu displays email/name
- ✅ Auth cookie set (check DevTools → Application → Cookies)

**Edge Cases to Test**:
- ❌ Login with incorrect password → Error: "Invalid email or password"
- ❌ Login with non-existent email → Error: "Invalid email or password"
- ❌ Login with empty fields → Validation errors

**Validation**:
- Check Network tab: `/api/auth/login` returns 200
- Verify JWT token in cookies (httpOnly, secure in production)

---

### Test 1.3: User Logout

**Scenario**: Logged-in user logs out

**Steps**:
1. While logged in, click logout button (in navigation)
2. Observe redirect

**Expected Results**:
- ✅ User redirected to login page (`/`)
- ✅ Auth cookie cleared
- ✅ Protected routes no longer accessible
- ✅ Navigation shows login/register options

**Validation**:
- Check cookies: `auth-token` removed
- Try accessing `/dashboard` → Should redirect to login

---

### Test 1.4: Protected Route Access

**Scenario**: Unauthenticated user tries to access protected routes

**Steps**:
1. Log out (or use incognito window)
2. Try to access:
   - `/dashboard`
   - `/trades`
   - `/trades/new`
   - `/trades/[any-id]`
3. Try API endpoints directly:
   - `GET /api/trades`
   - `GET /api/analytics/dashboard`

**Expected Results**:
- ✅ Frontend routes redirect to login page
- ✅ API endpoints return 401 Unauthorized
- ✅ No data exposed without authentication

---

### Test 1.5: Session Persistence

**Scenario**: User session persists across page refreshes

**Steps**:
1. Log in to application
2. Navigate to dashboard
3. Refresh page (F5)
4. Navigate to trades page
5. Close and reopen browser tab (same session)

**Expected Results**:
- ✅ User remains logged in after refresh
- ✅ No need to log in again
- ✅ User data persists

**Edge Case**:
- ❌ Wait for JWT expiration (7 days by default) → Should require re-login

---

## 2. Trade Management Tests

### Test 2.1: Create New Trade (Complete Workflow)

**Scenario**: User logs a complete trade entry (US-1)

**Steps**:
1. Navigate to "New Trade" or `/trades/new`
2. Fill in required fields:
   - Symbol: `AAPL`
   - Asset Type: `STOCK`
   - Currency: `USD`
   - Entry Date: Today's date
   - Entry Time: Current time
   - Entry Price: `150.00`
   - Exit Date: Today's date
   - Exit Time: 1 hour later
   - Exit Price: `152.50`
   - Quantity: `100`
   - Direction: `LONG`
3. Fill in optional fields:
   - Setup Type: `Breakout`
   - Strategy Name: `Momentum Play`
   - Stop Loss: `148.00`
   - Take Profit: `155.00`
   - Fees: `1.00`
   - Time of Day: `MARKET_OPEN`
   - Market Conditions: `TRENDING`
   - Emotional State Entry: `Confident`
   - Emotional State Exit: `Satisfied`
   - Notes: "Strong momentum, good volume"
4. Add tags: `momentum`, `breakout`, `win`
5. Submit form

**Expected Results**:
- ✅ Trade created successfully
- ✅ Redirected to trade detail page
- ✅ All entered data displayed correctly
- ✅ P&L calculated correctly: `(152.50 - 150.00) * 100 - 1.00 = $249.00`
- ✅ P&L% calculated: `(249.00 / 15000) * 100 = 1.66%`
- ✅ Risk/Reward ratio calculated (if applicable)
- ✅ Tags displayed
- ✅ Trade appears in trades list

**Validation**:
- Check Network tab: `POST /api/trades` returns 201
- Verify trade in database (via Supabase if needed)
- Check calculations match expected values

---

### Test 2.2: Create Trade - Minimal Data

**Scenario**: User logs a trade with only required fields

**Steps**:
1. Navigate to "New Trade"
2. Fill in only required fields:
   - Symbol: `TSLA`
   - Asset Type: `STOCK`
   - Currency: `USD`
   - Entry Date/Time: Current
   - Entry Price: `200.00`
   - Exit Date/Time: 30 minutes later
   - Exit Price: `198.00`
   - Quantity: `50`
   - Direction: `LONG`
3. Submit form

**Expected Results**:
- ✅ Trade created successfully
- ✅ P&L calculated: `(198.00 - 200.00) * 50 = -$100.00` (loss)
- ✅ Trade saved with minimal data

---

### Test 2.3: View Trades List

**Scenario**: User views all their trades

**Steps**:
1. Navigate to "Trades" or `/trades`
2. Observe trades list

**Expected Results**:
- ✅ All user's trades displayed
- ✅ Key information visible: Symbol, Date, P&L, Outcome
- ✅ Visual indicators (green for profit, red for loss)
- ✅ Pagination works (if > 50 trades)
- ✅ Loading state shown initially

**Edge Cases**:
- ✅ Empty state when no trades exist
- ✅ Handles large number of trades (pagination)

---

### Test 2.4: View Trade Detail

**Scenario**: User views detailed information about a trade

**Steps**:
1. Navigate to trades list
2. Click on a trade card/row
3. View trade detail page

**Expected Results**:
- ✅ All trade fields displayed
- ✅ P&L calculations shown
- ✅ Tags displayed
- ✅ Screenshots displayed (if any)
- ✅ Notes displayed (with rich text formatting if applicable)
- ✅ Edit and Delete buttons visible

---

### Test 2.5: Edit Trade

**Scenario**: User updates an existing trade

**Steps**:
1. Navigate to trade detail page
2. Click "Edit" button
3. Modify fields:
   - Change exit price from `152.50` to `153.00`
   - Update notes: "Updated: Stronger exit than expected"
   - Add tag: `strong-exit`
4. Save changes

**Expected Results**:
- ✅ Trade updated successfully
- ✅ Redirected to trade detail page
- ✅ Updated data displayed
- ✅ P&L recalculated: New P&L = `(153.00 - 150.00) * 100 - 1.00 = $299.00`
- ✅ Updated trade appears in trades list with new values

**Validation**:
- Check Network tab: `PUT /api/trades/[id]` returns 200
- Verify updated_at timestamp changed

---

### Test 2.6: Delete Trade

**Scenario**: User deletes a trade

**Steps**:
1. Navigate to trade detail page
2. Click "Delete" button
3. Confirm deletion in dialog
4. Observe redirect

**Expected Results**:
- ✅ Confirmation dialog appears
- ✅ Trade deleted after confirmation
- ✅ Redirected to trades list
- ✅ Deleted trade no longer appears in list
- ✅ Related screenshots deleted (if applicable)

**Edge Cases**:
- ❌ Cancel deletion dialog → Trade remains
- ✅ Delete trade with screenshots → Screenshots also deleted

**Validation**:
- Check Network tab: `DELETE /api/trades/[id]` returns 200
- Verify trade removed from database

---

### Test 2.7: Create Trade - Different Asset Types

**Scenario**: User creates trades for different asset types

**Test Cases**:
1. **STOCK**: Create trade with Stock asset type
2. **FOREX**: Create trade with Forex asset type, different currency (EUR)
3. **CRYPTO**: Create trade with Crypto asset type, different currency (BTC)
4. **OPTIONS**: Create trade with Options asset type

**Expected Results**:
- ✅ All asset types can be selected
- ✅ Currency changes appropriately
- ✅ Trades saved correctly
- ✅ Filtering by asset type works

---

### Test 2.8: Create Trade - Long vs Short

**Scenario**: User creates both long and short trades

**Test Cases**:
1. Create LONG trade (buy low, sell high)
2. Create SHORT trade (sell high, buy low)

**Expected Results**:
- ✅ P&L calculated correctly for both:
   - LONG: `(exit - entry) * quantity`
   - SHORT: `(entry - exit) * quantity`
- ✅ Visual indicators correct (green for profit, red for loss)

---

## 3. Screenshot Upload Tests

### Test 3.1: Upload Single Screenshot

**Scenario**: User uploads a screenshot for a trade (US-2)

**Prerequisites**: Cloud storage configured (Cloudinary or S3)

**Steps**:
1. Navigate to trade detail or edit page
2. Find screenshot upload area
3. Drag and drop an image file (JPEG, PNG, etc.)
4. Wait for upload to complete

**Expected Results**:
- ✅ Upload starts (loading indicator shown)
- ✅ Upload completes successfully
- ✅ Screenshot thumbnail/preview displayed
- ✅ Screenshot URL saved to database
- ✅ Image accessible and displays correctly

**File Types to Test**:
- ✅ JPEG (.jpg, .jpeg)
- ✅ PNG (.png)
- ✅ GIF (.gif)
- ✅ WebP (.webp)

**Edge Cases**:
- ❌ Upload invalid file type (PDF, .txt) → Error message
- ❌ Upload file > 10MB → Error: "File too large"
- ❌ Upload without cloud storage configured → Error message

---

### Test 3.2: Upload Multiple Screenshots

**Scenario**: User uploads multiple screenshots for a trade

**Steps**:
1. Navigate to trade with screenshot upload
2. Upload first screenshot
3. Upload second screenshot
4. Upload third screenshot (up to max of 10)

**Expected Results**:
- ✅ All screenshots upload successfully
- ✅ All thumbnails displayed
- ✅ Can upload up to 10 screenshots per trade
- ❌ 11th screenshot → Error: "Maximum 10 screenshots allowed"

---

### Test 3.3: Delete Screenshot

**Scenario**: User removes a screenshot from a trade

**Steps**:
1. Navigate to trade with screenshots
2. Find delete button/icon on a screenshot
3. Click delete
4. Confirm deletion (if confirmation required)

**Expected Results**:
- ✅ Screenshot removed from display
- ✅ Screenshot deleted from cloud storage
- ✅ Screenshot record removed from database

---

### Test 3.4: Screenshot Upload - Network Issues

**Scenario**: Upload fails due to network issues

**Steps**:
1. Open browser DevTools → Network tab
2. Set throttling to "Offline" or "Slow 3G"
3. Try to upload screenshot
4. Observe error handling

**Expected Results**:
- ✅ Error message displayed to user
- ✅ Upload can be retried
- ✅ No data corruption

---

## 4. Analytics & Dashboard Tests

### Test 4.1: Dashboard Metrics (US-6, FR-13)

**Scenario**: User views dashboard with key metrics

**Steps**:
1. Navigate to Dashboard (`/dashboard`)
2. Observe metrics cards at top

**Expected Results**:
- ✅ All key metrics displayed:
  - Total P&L
  - Number of trades
  - Win rate
  - Loss rate
  - Average win
  - Average loss
  - Profit factor
  - Expectancy
- ✅ Advanced metrics displayed:
  - Sharpe ratio
  - Maximum drawdown
  - Average drawdown
- ✅ Metrics calculated correctly
- ✅ Loading state shown initially
- ✅ Empty state if no trades (with helpful message)

**Validation**:
- Verify calculations match manual calculations
- Check Network tab: `GET /api/analytics/dashboard` returns 200

---

### Test 4.2: Dashboard Date Filtering (FR-16)

**Scenario**: User filters dashboard metrics by date range

**Steps**:
1. Navigate to Dashboard
2. Select date range filter (e.g., "Last 30 days" or custom range)
3. Observe metrics update

**Expected Results**:
- ✅ Metrics recalculated for filtered period
- ✅ Charts updated for filtered period
- ✅ Only trades in date range included in calculations

**Test Ranges**:
- Last 7 days
- Last 30 days
- Last 90 days
- Last year
- Custom date range (e.g., Jan 1 - Mar 31)

---

### Test 4.3: Equity Curve Chart (FR-15)

**Scenario**: User views cumulative P&L over time

**Steps**:
1. Navigate to Dashboard
2. Scroll to Equity Curve chart
3. Observe chart rendering

**Expected Results**:
- ✅ Chart renders correctly
- ✅ Cumulative P&L line visible
- ✅ X-axis: Dates
- ✅ Y-axis: Cumulative P&L
- ✅ Interactive (hover shows values)
- ✅ Empty state if no trades

**Edge Cases**:
- ✅ Single trade → Shows single point
- ✅ All losses → Line trends downward
- ✅ All wins → Line trends upward
- ✅ Mixed → Shows actual equity curve

---

### Test 4.4: Win/Loss Distribution Charts

**Scenario**: User views win/loss distribution visualizations

**Steps**:
1. Navigate to Dashboard
2. Scroll to Win/Loss Distribution section

**Expected Results**:
- ✅ Pie chart showing win/loss breakdown
- ✅ P&L distribution histogram
- ✅ Charts interactive (hover shows details)
- ✅ Percentages calculated correctly

---

### Test 4.5: Performance Breakdown Charts (FR-17)

**Scenario**: User views performance broken down by various dimensions

**Charts to Test**:
1. **P&L by Asset Type**: Bar chart showing performance by STOCK, FOREX, CRYPTO, OPTIONS
2. **P&L by Strategy**: Bar chart showing best/worst performing strategies
3. **P&L by Symbol**: Top 10 symbols with best/worst performance
4. **P&L by Setup Type**: Performance by setup (breakout, pullback, etc.)
5. **P&L by Emotional State**: Correlation between emotions and performance
6. **P&L by Time of Day**: Performance across trading sessions
7. **P&L by Day of Week**: Weekday vs weekend performance

**Expected Results**:
- ✅ All charts render correctly
- ✅ Data accurate and matches trade data
- ✅ Charts interactive
- ✅ Empty states for dimensions with no data
- ✅ Color coding (green for profit, red for loss)

---

### Test 4.6: Dashboard with No Data

**Scenario**: New user views dashboard with no trades

**Steps**:
1. Create new account (or use account with no trades)
2. Navigate to Dashboard

**Expected Results**:
- ✅ Empty state displayed
- ✅ Helpful message: "No trades yet" or similar
- ✅ Link to create first trade
- ✅ No errors in console
- ✅ Charts show empty states gracefully

---

## 5. Search, Filter & Sort Tests (FR-9, FR-10, FR-11, FR-12)

### Test 5.1: Search Trades (FR-10)

**Scenario**: User searches for trades by symbol, notes, strategy, or tags

**Steps**:
1. Navigate to Trades page
2. Enter search term in search box
3. Observe filtered results

**Test Cases**:
- Search by symbol: `AAPL`
- Search by strategy: `momentum`
- Search by tag: `win`
- Search by notes: `strong volume`
- Search with no matches: `XYZ123`

**Expected Results**:
- ✅ Results filtered in real-time (or after debounce)
- ✅ Search works across: symbol, notes, strategy, tags
- ✅ Case-insensitive search
- ✅ Empty state if no matches
- ✅ Clear search button works

---

### Test 5.2: Filter by Date Range (FR-11)

**Scenario**: User filters trades by date range

**Steps**:
1. Navigate to Trades page
2. Select date range filter
3. Choose start and end dates
4. Apply filter

**Expected Results**:
- ✅ Only trades within date range shown
- ✅ Filter persists when navigating
- ✅ Clear filter button works

**Test Cases**:
- Last 7 days
- Last 30 days
- Custom range
- Single day
- Future dates (should show no results)

---

### Test 5.3: Filter by Asset Type (FR-11)

**Scenario**: User filters trades by asset type

**Steps**:
1. Navigate to Trades page
2. Select asset type filter: `STOCK`
3. Observe filtered results

**Test Cases**:
- Filter by STOCK
- Filter by FOREX
- Filter by CRYPTO
- Filter by OPTIONS
- Clear filter

**Expected Results**:
- ✅ Only trades of selected asset type shown
- ✅ Filter works with other filters (combined filters)

---

### Test 5.4: Filter by Outcome (FR-11)

**Scenario**: User filters trades by win/loss/breakeven

**Steps**:
1. Navigate to Trades page
2. Select outcome filter: `Win`, `Loss`, or `Breakeven`
3. Observe filtered results

**Expected Results**:
- ✅ Only winning trades shown (if "Win" selected)
- ✅ Only losing trades shown (if "Loss" selected)
- ✅ Only breakeven trades shown (if "Breakeven" selected)

---

### Test 5.5: Filter by Strategy (FR-11)

**Scenario**: User filters trades by strategy name

**Steps**:
1. Navigate to Trades page
2. Select strategy from dropdown (or type to search)
3. Apply filter

**Expected Results**:
- ✅ Only trades with selected strategy shown
- ✅ Strategy autocomplete works
- ✅ Case-insensitive matching

---

### Test 5.6: Filter by Tags (FR-11)

**Scenario**: User filters trades by tags

**Steps**:
1. Navigate to Trades page
2. Select one or more tags
3. Apply filter

**Expected Results**:
- ✅ Only trades with selected tags shown
- ✅ Multiple tags work (AND logic)
- ✅ Tag selection interface user-friendly

---

### Test 5.7: Sort Trades (FR-12)

**Scenario**: User sorts trades by different criteria

**Sort Options to Test**:
- By Date (newest/oldest first)
- By P&L (highest/lowest)
- By P&L% (highest/lowest)
- By Symbol (alphabetical A-Z / Z-A)

**Expected Results**:
- ✅ Trades sorted correctly
- ✅ Sort order toggles (ascending/descending)
- ✅ Sort persists when navigating
- ✅ Sort works with filters

---

### Test 5.8: Combined Filters

**Scenario**: User applies multiple filters and sort together

**Steps**:
1. Navigate to Trades page
2. Apply multiple filters:
   - Date range: Last 30 days
   - Asset Type: STOCK
   - Outcome: Win
   - Tag: `momentum`
3. Sort by P&L (highest first)
4. Search: `AAPL`

**Expected Results**:
- ✅ All filters work together (AND logic)
- ✅ Results match all criteria
- ✅ Sort applies to filtered results
- ✅ Search further narrows results

---

## 6. Data Export Tests (FR-23)

### Test 6.1: Export to CSV

**Scenario**: User exports all trades to CSV

**Steps**:
1. Navigate to Trades page
2. Click "Export to CSV" button (if available)
3. Or navigate to `/api/export/csv` (while logged in)
4. Save/download CSV file

**Expected Results**:
- ✅ CSV file downloads
- ✅ Filename includes timestamp or date
- ✅ All trade fields included:
  - Basic fields (symbol, dates, prices, quantity, direction)
  - Calculated fields (P&L, P&L%, net P&L)
  - Metadata (strategy, setup, emotional states)
  - Tags (comma-separated)
- ✅ CSV properly formatted:
  - Headers in first row
  - Commas as delimiters
  - Strings quoted if contain commas
  - UTF-8 encoding
  - Special characters handled correctly

**Validation**:
- Open CSV in Excel/Google Sheets
- Verify all columns present
- Verify data matches database
- Verify calculations correct

---

### Test 6.2: Export Filtered Trades

**Scenario**: User exports filtered trades to CSV

**Steps**:
1. Apply filters (date range, asset type, etc.)
2. Export to CSV
3. Verify CSV contains only filtered trades

**Expected Results**:
- ✅ CSV contains only trades matching filters
- ✅ Export respects current filter state

---

## 7. UI/UX & Responsive Design Tests (FR-24, FR-25, FR-29)

### Test 7.1: Light/Dark Theme (FR-29)

**Scenario**: User toggles between light and dark themes

**Steps**:
1. Navigate to any page
2. Click theme toggle button
3. Observe theme change
4. Refresh page
5. Navigate to different pages

**Expected Results**:
- ✅ Theme toggles immediately
- ✅ All pages use selected theme
- ✅ Theme persists after refresh
- ✅ Theme persists across pages
- ✅ Good contrast ratios (accessibility)
- ✅ All UI elements visible in both themes

---

### Test 7.2: Responsive Design - Desktop (FR-25)

**Scenario**: Application on desktop (1280px+ width)

**Test Viewports**:
- 1920x1080 (Full HD)
- 1440x900
- 1280x720 (minimum recommended)

**Expected Results**:
- ✅ Layout uses full width efficiently
- ✅ Navigation always visible
- ✅ Forms properly spaced
- ✅ Charts display at good size
- ✅ Tables readable without horizontal scroll

---

### Test 7.3: Responsive Design - Tablet

**Scenario**: Application on tablet device

**Test Viewports**:
- 1024x768 (iPad)
- 768x1024 (iPad Portrait)

**Expected Results**:
- ✅ Layout adapts appropriately
- ✅ Navigation works (may use hamburger menu)
- ✅ Forms still usable
- ✅ Charts responsive
- ✅ Tables scrollable horizontally if needed

---

### Test 7.4: Responsive Design - Mobile

**Scenario**: Application on mobile device

**Test Viewports**:
- 375x667 (iPhone SE)
- 390x844 (iPhone 12)
- 414x896 (iPhone 11 Pro Max)

**Expected Results**:
- ✅ Mobile-friendly navigation (hamburger menu)
- ✅ Forms usable (inputs appropriately sized)
- ✅ Buttons touch-friendly (min 44x44px)
- ✅ Charts responsive or scrollable
- ✅ Tables scrollable
- ✅ No horizontal scroll on main content
- ✅ Text readable without zooming

---

### Test 7.5: Navigation & User Flow

**Scenario**: User navigates through the application

**Test Navigation Paths**:
1. Home → Register → Dashboard → Trades → New Trade → Trade Detail → Edit → Back to List
2. Home → Login → Dashboard → Analytics → Trades → Trade Detail
3. Navigation bar links work from any page

**Expected Results**:
- ✅ All navigation links work
- ✅ Active page highlighted in navigation
- ✅ Back button works correctly
- ✅ Breadcrumbs work (if implemented)
- ✅ No broken links

---

### Test 7.6: Loading States

**Scenario**: User observes loading states during async operations

**Operations to Test**:
- Initial page load
- API requests (trades list, dashboard metrics)
- Form submissions
- Image uploads
- Chart rendering

**Expected Results**:
- ✅ Loading indicators shown
- ✅ Skeleton screens or spinners visible
- ✅ No blank screens during loading
- ✅ Error states if loading fails

---

### Test 7.7: Empty States

**Scenario**: User sees empty states when no data exists

**Empty States to Test**:
- No trades
- No tags
- No screenshots
- No search results
- Dashboard with no data

**Expected Results**:
- ✅ Helpful messages displayed
- ✅ Clear call-to-action (e.g., "Create your first trade")
- ✅ Visually appealing empty state
- ✅ No errors in console

---

## 8. Performance & Load Tests

### Test 8.1: Page Load Performance

**Scenario**: Measure page load times

**Pages to Test**:
- Homepage (`/`)
- Dashboard (`/dashboard`)
- Trades List (`/trades`)
- Trade Detail (`/trades/[id]`)
- New Trade (`/trades/new`)

**Tools**: Browser DevTools → Network tab, Lighthouse

**Expected Results**:
- ✅ Initial page load < 3 seconds
- ✅ Time to Interactive < 5 seconds
- ✅ Lighthouse Performance score > 70

**Measurements**:
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Total Blocking Time (TBT)

---

### Test 8.2: API Response Times

**Scenario**: Measure API endpoint response times

**Endpoints to Test**:
- `GET /api/trades`
- `GET /api/analytics/dashboard`
- `GET /api/analytics/charts`
- `POST /api/trades` (create trade)

**Tools**: Browser DevTools → Network tab

**Expected Results**:
- ✅ API responses < 1 second (for typical data)
- ✅ Chart data loads < 2 seconds
- ✅ No timeout errors

**Test with Different Data Sizes**:
- Small dataset (< 10 trades)
- Medium dataset (50-100 trades)
- Large dataset (500+ trades)

---

### Test 8.3: Database Connection Pooling

**Scenario**: Verify database handles concurrent requests

**Steps**:
1. Open multiple browser tabs
2. Simultaneously load dashboard, trades list, and trade detail
3. Check Vercel logs for connection errors

**Expected Results**:
- ✅ All requests succeed
- ✅ No "too many connections" errors
- ✅ No connection pool exhaustion
- ✅ Response times acceptable

---

### Test 8.4: Large Dataset Performance

**Scenario**: Application performance with large number of trades

**Prerequisites**: Create test account with 100+ trades (or use existing data)

**Test**:
1. Load trades list with 100+ trades
2. Apply filters
3. Sort trades
4. Load dashboard with many trades

**Expected Results**:
- ✅ Pagination works correctly
- ✅ Filters perform well
- ✅ Charts render without significant delay
- ✅ No memory leaks
- ✅ Browser remains responsive

---

## 9. Security Tests

### Test 9.1: HTTPS Enforcement

**Scenario**: Verify HTTPS is enforced

**Steps**:
1. Visit http://trading-journal-eight-tau.vercel.app (HTTP)
2. Check redirect behavior

**Expected Results**:
- ✅ HTTP redirects to HTTPS
- ✅ HTTPS certificate valid
- ✅ No mixed content warnings
- ✅ Padlock icon in browser address bar

---

### Test 9.2: Authentication Security

**Scenario**: Verify authentication security measures

**Tests**:
1. Check cookie settings (DevTools → Application → Cookies)
2. Try accessing API without auth token
3. Try tampering with auth token

**Expected Results**:
- ✅ Auth cookie: `httpOnly` = true
- ✅ Auth cookie: `secure` = true (in production)
- ✅ API returns 401 without valid token
- ✅ Tampered tokens rejected

---

### Test 9.3: Input Validation & Sanitization

**Scenario**: Test input validation on frontend and backend

**Malicious Inputs to Test**:
- SQL injection: `'; DROP TABLE trades; --`
- XSS: `<script>alert('XSS')</script>`
- HTML injection: `<img src=x onerror=alert(1)>`
- Extremely long strings
- Special characters

**Expected Results**:
- ✅ SQL injection prevented (Prisma parameterized queries)
- ✅ XSS prevented (React escapes by default)
- ✅ Input validation on frontend and backend
- ✅ Error messages don't expose sensitive info
- ✅ Invalid input rejected with user-friendly errors

---

### Test 9.4: Authorization & Data Isolation

**Scenario**: Verify users can only access their own data

**Steps**:
1. Create two test accounts (User A and User B)
2. User A creates a trade
3. User B tries to access User A's trade (via API or URL)

**Expected Results**:
- ✅ User B cannot access User A's trade
- ✅ API returns 404 (not 403) to avoid information disclosure
- ✅ Trade list only shows User B's trades
- ✅ Dashboard only shows User B's metrics

---

### Test 9.5: CSRF Protection

**Scenario**: Verify CSRF protection (if implemented)

**Expected Results**:
- ✅ Forms require valid session
- ✅ API endpoints validate origin/referer (if applicable)
- ✅ Same-origin policy enforced

---

## 10. Error Handling & Edge Cases

### Test 10.1: Network Errors

**Scenario**: Application behavior during network failures

**Steps**:
1. Open browser DevTools → Network tab
2. Set throttling to "Offline"
3. Try various operations:
   - Load dashboard
   - Create trade
   - Upload screenshot

**Expected Results**:
- ✅ User-friendly error messages
- ✅ Retry options available
- ✅ No crashes or blank screens
- ✅ Application remains usable after network restored

---

### Test 10.2: Invalid API Responses

**Scenario**: Application handles unexpected API responses

**Test** (may require API mocking or temporary server errors):
- 500 Internal Server Error
- 503 Service Unavailable
- Malformed JSON response
- Empty response

**Expected Results**:
- ✅ Error messages displayed to user
- ✅ No application crashes
- ✅ Can retry operations
- ✅ Helpful error messages (not technical details)

---

### Test 10.3: Form Validation Errors

**Scenario**: User submits invalid form data

**Test Cases**:
- Missing required fields
- Invalid email format
- Negative quantities
- Exit price before entry price (temporal)
- Exit date before entry date
- Invalid file types for uploads

**Expected Results**:
- ✅ Validation errors displayed inline
- ✅ Errors highlight specific fields
- ✅ Form cannot be submitted with errors
- ✅ Error messages clear and actionable

---

### Test 10.4: Browser Compatibility

**Scenario**: Application works across different browsers

**Browsers to Test**:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Expected Results**:
- ✅ Application works in all modern browsers
- ✅ No browser-specific errors
- ✅ Consistent appearance across browsers
- ✅ All features functional

---

### Test 10.5: Concurrent User Actions

**Scenario**: User performs multiple actions simultaneously

**Steps**:
1. Open multiple tabs with the same account
2. Create trade in Tab 1
3. Edit trade in Tab 2
4. Delete trade in Tab 3

**Expected Results**:
- ✅ No data corruption
- ✅ Conflicts handled gracefully
- ✅ Latest data displayed after refresh
- ✅ No race conditions

---

## Test Execution Checklist

### Pre-Testing Setup
- [ ] Clear browser cache
- [ ] Use incognito/private window (or clear cookies)
- [ ] Open browser DevTools
- [ ] Have test data ready (or create during testing)

### Execution Order
1. [ ] Authentication tests (1.1 - 1.5)
2. [ ] Trade Management tests (2.1 - 2.8)
3. [ ] Screenshot Upload tests (3.1 - 3.4) - if storage configured
4. [ ] Analytics tests (4.1 - 4.6)
5. [ ] Search/Filter/Sort tests (5.1 - 5.8)
6. [ ] Export tests (6.1 - 6.2)
7. [ ] UI/UX tests (7.1 - 7.7)
8. [ ] Performance tests (8.1 - 8.4)
9. [ ] Security tests (9.1 - 9.5)
10. [ ] Error handling tests (10.1 - 10.5)

### After Testing
- [ ] Document any bugs found
- [ ] Note performance issues
- [ ] Record test execution time
- [ ] Update test results in deployment checklist

---

## Bug Reporting Template

If you find issues during testing, document them using this template:

```
**Bug Title**: [Brief description]

**Severity**: [Critical / High / Medium / Low]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior**: [What should happen]

**Actual Behavior**: [What actually happens]

**Environment**:
- Browser: [Chrome/Firefox/Safari/Edge]
- Version: [Version number]
- OS: [Windows/Mac/Linux]
- Viewport: [Desktop/Tablet/Mobile]

**Screenshots**: [If applicable]

**Console Errors**: [Any errors in browser console]

**Network Errors**: [Any failed API requests]
```

---

## Success Criteria

The production deployment is considered thoroughly tested when:

- ✅ All critical user workflows work end-to-end
- ✅ All API endpoints respond correctly
- ✅ Performance is acceptable (< 3s page load, < 1s API)
- ✅ No critical security vulnerabilities
- ✅ Error handling works gracefully
- ✅ Responsive design works on all devices
- ✅ No console errors during normal usage
- ✅ Data integrity maintained (calculations correct)
- ✅ User data isolated correctly

---

## References

- [DEPLOYMENT_VERIFICATION.md](./DEPLOYMENT_VERIFICATION.md) - Technical verification checklist
- [PRODUCTION_TROUBLESHOOTING.md](./PRODUCTION_TROUBLESHOOTING.md) - Common issues and fixes
- [VERCEL_ENV_CONFIGURATION.md](./VERCEL_ENV_CONFIGURATION.md) - Environment setup

---

**Last Updated**: Comprehensive production testing guide

