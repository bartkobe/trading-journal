# Task List: Record Trades at Opening

**Based on:** `0003-prd-record-trades-at-opening.md`  
**Generated:** November 2025  
**Status:** Ready for Implementation  
**Solution:** Solution C (Comprehensive Implementation with Advanced Features)

---

## Relevant Files

- `prisma/schema.prisma` - Database schema definition (✅ Modified - Made exitDate and exitPrice nullable)
- `prisma/migrations/[timestamp]_make_exit_fields_nullable/migration.sql` - Database migration file (✅ Created)
- `lib/validation.ts` - Zod validation schemas (✅ Modified - Made exitDate and exitPrice optional with cross-validation)
- `lib/trades.ts` - Trade calculation utilities (✅ Modified - Handle open trades in calculations)
- `lib/types.ts` - TypeScript type definitions (✅ Modified - Update TradeFormData interface for optional exit fields)
- `components/trades/TradeForm.tsx` - Trade creation/editing form (✅ Modified - Make exit fields optional, add UX enhancements)
- `components/trades/TradeCard.tsx` - Trade card display component (✅ Modified - Add status badge, conditional P&L display)
- `components/trades/TradeDetail.tsx` - Trade detail view component (✅ Modified - Add status indicator, conditional exit display)
- `components/trades/TradeFilters.tsx` - Trade filtering component (✅ Modified - Add status filter)
- `components/trades/TradeList.tsx` - Trade list container component (✅ Modified - Handle status filtering)
- `components/trades/TradeStatusBadge.tsx` - Reusable status badge component (✅ Created)
- `components/trades/OpenTradesSection.tsx` - Open trades section component (✅ Created - Solution C)
- `components/analytics/DashboardContent.tsx` - Dashboard main component (✅ Modified - Add open trades count)
- `components/analytics/DashboardMetrics.tsx` - Dashboard metrics component (✅ Modified - Display open trades count)
- `app/api/trades/route.ts` - Trade API endpoints (✅ Modified - Handle optional exit fields in POST/GET)
- `app/api/trades/[id]/route.ts` - Single trade API endpoint (✅ Modified - Handle exit field updates in PUT)
- `app/api/analytics/dashboard/route.ts` - Dashboard analytics endpoint (✅ Modified - Filter out open trades)
- `app/api/analytics/performance/route.ts` - Performance analytics endpoint (✅ Modified - Filter out open trades)
- `app/api/analytics/charts/route.ts` - Charts analytics endpoint (✅ Modified - Filter out open trades)
- `app/api/export/csv/route.ts` - CSV export endpoint (✅ Modified - Add status column, handle open trades)
- `lib/analytics.ts` - Analytics calculation functions (✅ Modified - Filter out open trades from all calculations)
- `lib/export.ts` - CSV export utilities (✅ Modified - Add status column, handle null exit fields)
- `__tests__/lib/trades.test.ts` - Trade calculation tests (✅ Modified - Add open trade test cases)
- `__tests__/lib/analytics.test.ts` - Analytics calculation tests (✅ Modified - Verify open trades excluded)
- `__tests__/components/TradeForm.test.tsx` - Trade form tests (✅ Modified - Test optional exit fields)
- `__tests__/components/TradeCard.test.tsx` - Trade card tests (✅ Modified - Test status badge display)
- `__tests__/api/trades.test.ts` - Trade API tests (✅ Modified - Test open trade creation/updates)
- `__tests__/api/analytics.test.ts` - Analytics API tests (✅ Modified - Verify open trades excluded)

### Notes

- Unit tests should be placed alongside code files or in `__tests__/` directory
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.
- Database migration will be required to make exitDate and exitPrice nullable
- All existing closed trades will continue to work without data migration (backward compatible)

---

## Tasks

- [x] 1.0 Database Schema and Migration Changes
  - [x] 1.1 Open `prisma/schema.prisma` and locate the Trade model
  - [x] 1.2 Change `exitDate DateTime` to `exitDate DateTime?` (make nullable)
  - [x] 1.3 Change `exitPrice Float` to `exitPrice Float?` (make nullable)
  - [x] 1.4 Save the schema file
  - [x] 1.5 Create database migration: Run `npx prisma migrate dev --name make_exit_fields_nullable`
  - [x] 1.6 Verify migration SQL file was created in `prisma/migrations/`
  - [x] 1.7 Verify migration alters columns correctly (should use `ALTER COLUMN` to remove NOT NULL constraint)
  - [x] 1.8 Run migration: Verify `npx prisma migrate dev` completes successfully
  - [x] 1.9 Verify existing trades still have exitDate/exitPrice values (no data loss)
  - [x] 1.10 Generate Prisma client: Run `npx prisma generate` to update TypeScript types

- [x] 2.0 Validation Schema and API Endpoint Updates
  - [x] 2.1 Open `lib/validation.ts` and locate `tradeSchema`
  - [x] 2.2 Change `exitDate: z.coerce.date()` to `exitDate: z.coerce.date().optional()`
  - [x] 2.3 Change `exitPrice: z.number().positive(...)` to `exitPrice: z.number().positive(...).optional()`
  - [x] 2.4 Add refinement to `tradeSchema` using `.refine()`: If exitDate is provided, exitPrice must be provided, and vice versa
  - [x] 2.5 Update `lib/types.ts` - Change `TradeFormData` interface: Make `exitDate` and `exitPrice` optional (`Date | string | undefined` and `number | undefined`)
  - [x] 2.6 Open `app/api/trades/route.ts` - Update POST handler to handle optional exitDate/exitPrice
  - [x] 2.7 In POST handler: Set `exitDate` and `exitPrice` to `null` if not provided in request body
  - [x] 2.8 In POST handler: Convert exitDate/exitPrice to Date/number only if provided, otherwise set to null
  - [x] 2.9 Open `app/api/trades/[id]/route.ts` - Update PUT handler to allow setting exitDate/exitPrice to null
  - [x] 2.10 In PUT handler: Allow updating exitDate/exitPrice from null to values (closing open trade)
  - [x] 2.11 In PUT handler: Allow updating exitDate/exitPrice from values to null (reopening closed trade)
  - [x] 2.12 In PUT handler: Validate that exit fields are both null or both have values
  - [x] 2.13 Update GET `/api/trades` handler to return trades with null exitDate/exitPrice correctly
  - [x] 2.14 Test API endpoints: Create trade without exit fields, update to add exit fields, update to remove exit fields

- [x] 3.0 Trade Status Utilities and Calculation Updates
  - [x] 3.1 Create utility function `isTradeOpen(trade)` in `lib/trades.ts`: Returns `trade.exitDate === null`
  - [x] 3.2 Export `isTradeOpen` function for use in other files
  - [x] 3.3 Update `calculateTradeMetrics` function in `lib/trades.ts` to handle open trades
  - [x] 3.4 In `calculateTradeMetrics`: Return early if `exitDate` or `exitPrice` is null (don't calculate P&L)
  - [x] 3.5 In `calculateTradeMetrics`: Return calculations object with `pnl: null`, `pnlPercent: null`, `netPnl: null` for open trades
  - [x] 3.6 In `calculateTradeMetrics`: Set `isWinner`, `isLoser`, `isBreakeven` to `false` for open trades
  - [x] 3.7 In `calculateTradeMetrics`: Skip holding period calculation if exitDate is null (set to `null` or `0`)
  - [x] 3.8 In `calculateTradeMetrics`: Set `entryValue` for all trades, `exitValue` only for closed trades
  - [x] 3.9 Update `enrichTradeWithCalculations` to handle null exitDate/exitPrice correctly
  - [x] 3.10 Update `enrichTradesWithCalculations` to process both open and closed trades
  - [x] 3.11 Update TypeScript types in `lib/types.ts` if needed: Make P&L fields nullable in TradeCalculations interface

- [x] 4.0 Core UI Components Updates (Form, Cards, Detail View)
  - [x] 4.1 Create `components/trades/TradeStatusBadge.tsx` component
  - [x] 4.2 In TradeStatusBadge: Accept `isOpen: boolean` prop
  - [x] 4.3 In TradeStatusBadge: Render blue/green "OPEN" badge with clock icon for open trades
  - [x] 4.4 In TradeStatusBadge: Render subtle gray badge or nothing for closed trades (per PRD design)
  - [x] 4.5 Open `components/trades/TradeForm.tsx` - Remove required asterisk (*) from exit date label
  - [x] 4.6 In TradeForm: Remove required asterisk (*) from exit price label
  - [x] 4.7 In TradeForm: Add "(Optional)" text to exit date and exit price labels
  - [x] 4.8 In TradeForm: Add checkbox/toggle "Trade is still open" to automatically clear exit fields (Solution C enhancement)
  - [x] 4.9 In TradeForm: Show warning message when exit fields are empty: "Trade will be marked as open"
  - [x] 4.10 In TradeForm: Add confirmation dialog when closing a trade: "Mark this trade as closed?" (Solution C)
  - [x] 4.11 In TradeForm: Update form validation to allow empty exitDate/exitPrice
  - [x] 4.12 In TradeForm: Ensure form submission sends null for exit fields if empty (not empty string)
  - [x] 4.13 Open `components/trades/TradeCard.tsx` - Import TradeStatusBadge component
  - [x] 4.14 In TradeCard: Import `isTradeOpen` utility function
  - [x] 4.15 In TradeCard: Determine trade status using `isTradeOpen(trade)`
  - [x] 4.16 In TradeCard: Display TradeStatusBadge with appropriate status
  - [x] 4.17 In TradeCard: Conditionally render exit information - only show for closed trades
  - [x] 4.18 In TradeCard: For open trades, show "Open" or "In Progress" instead of exit date/price
  - [x] 4.19 In TradeCard: Conditionally render P&L - show "—" or "Open" instead of P&L number for open trades
  - [x] 4.20 In TradeCard: Add visual distinction for open trades (different border color or background tint)
  - [x] 4.21 Open `components/trades/TradeDetail.tsx` - Add trade status header/badge at top
  - [x] 4.22 In TradeDetail: Display "Open Trade" or "Closed Trade" prominently
  - [x] 4.23 In TradeDetail: Conditionally show exit section - hide or show "Not yet closed" for open trades
  - [x] 4.24 In TradeDetail: Conditionally show P&L metrics - show "N/A" or "Open" for open trades
  - [x] 4.25 In TradeDetail: Show holding period as "N/A" or "Ongoing" for open trades
  - [x] 4.26 In TradeDetail: Add "Close Trade" quick action button for open trades (Solution C - opens edit form)

- [ ] 5.0 Trade Filtering and Status Management
  - [ ] 5.1 Open `components/trades/TradeFilters.tsx` - Add "Status" filter field
  - [ ] 5.2 In TradeFilters: Add `status: string` to TradeFiltersState interface (values: '', 'open', 'closed')
  - [ ] 5.3 In TradeFilters: Add status dropdown with options: "All", "Open", "Closed"
  - [ ] 5.4 In TradeFilters: Position status filter next to "Outcome" filter in the grid
  - [ ] 5.5 Open `components/trades/TradeList.tsx` - Update filters interface to include status
  - [ ] 5.6 In TradeList: Pass status filter to API query parameters
  - [ ] 5.7 Open `app/api/trades/route.ts` - Update GET handler to accept status query parameter
  - [ ] 5.8 In GET handler: Add status filter logic - if status='open', filter where `exitDate IS NULL`
  - [ ] 5.9 In GET handler: If status='closed', filter where `exitDate IS NOT NULL`
  - [ ] 5.10 In GET handler: If status is empty or undefined, return all trades (default behavior)
  - [ ] 5.11 Update `lib/validation.ts` - Add status to `tradeFilterSchema` (optional enum: 'open' | 'closed')
  - [ ] 5.12 Update sorting logic: Ensure open trades can be sorted by entry date (most recent first by default)
  - [ ] 5.13 Test filtering: Filter to show only open trades, only closed trades, and all trades

- [ ] 6.0 Analytics Integration (Exclude Open Trades)
  - [ ] 6.1 Open `lib/analytics.ts` - Update `calculateBasicMetrics` function
  - [ ] 6.2 In `calculateBasicMetrics`: Filter out trades where `exitDate === null` at the start of function
  - [ ] 6.3 In `calculateBasicMetrics`: Use filtered closed trades for all calculations
  - [ ] 6.4 Update `calculateExpectancy` function: Filter out open trades before calculations
  - [ ] 6.5 Update `calculateSharpeRatio` function: Filter out open trades before calculations
  - [ ] 6.6 Update `calculateDrawdown` function: Filter out open trades before calculations
  - [ ] 6.7 Update `calculateStreaks` function: Filter out open trades before calculations
  - [ ] 6.8 Update all performance breakdown functions (by symbol, strategy, asset type, etc.): Filter out open trades
  - [ ] 6.9 Open `app/api/analytics/dashboard/route.ts` - Filter trades before calculating metrics
  - [ ] 6.10 In dashboard route: Add `exitDate: { not: null }` to where clause when fetching trades
  - [ ] 6.11 Open `app/api/analytics/performance/route.ts` - Filter out open trades
  - [ ] 6.12 Open `app/api/analytics/charts/route.ts` - Filter out open trades
  - [ ] 6.13 Verify all analytics endpoints exclude open trades from calculations
  - [ ] 6.14 Test analytics: Create open trades and verify they don't appear in dashboard metrics
  - [ ] 6.15 Test analytics: Close open trades and verify they appear in metrics

- [ ] 7.0 Advanced Features (Solution C: Open Trades Section, Dashboard Enhancements, Export Updates)
  - [ ] 7.1 Create `components/trades/OpenTradesSection.tsx` component
  - [ ] 7.2 In OpenTradesSection: Fetch and display list of open trades
  - [ ] 7.3 In OpenTradesSection: Show count of open trades in section header
  - [ ] 7.4 In OpenTradesSection: Display open trades in a card/list format
  - [ ] 7.5 In OpenTradesSection: Add "Close Trade" quick action button for each open trade
  - [ ] 7.6 In OpenTradesSection: Link to trade detail page for each trade
  - [ ] 7.7 Open `app/dashboard/page.tsx` or `components/analytics/DashboardContent.tsx` - Add OpenTradesSection
  - [ ] 7.8 Add OpenTradesSection to dashboard layout (above or below metrics section)
  - [ ] 7.9 Open `components/analytics/DashboardMetrics.tsx` - Add open trades count display
  - [ ] 7.10 In DashboardMetrics: Fetch count of open trades (separate API call or include in metrics)
  - [ ] 7.11 In DashboardMetrics: Display open trades count as informational metric (not in performance calculations)
  - [ ] 7.12 Update TradeCard: Add color-coded borders (blue border for open trades, standard for closed)
  - [ ] 7.13 Update TradeStatusBadge: Add icon support (clock icon for open, checkmark icon for closed)
  - [ ] 7.14 Open `app/api/trades/route.ts` - Add query parameter support for counting open trades
  - [ ] 7.15 Open `lib/export.ts` - Update `tradesToCsv` function to handle open trades
  - [ ] 7.16 In `tradesToCsv`: Add "Status" column to CSV export (values: "Open" or "Closed")
  - [ ] 7.17 In `tradesToCsv`: Handle null exitDate/exitPrice - show "N/A" or empty string in CSV
  - [ ] 7.18 Open `app/api/export/csv/route.ts` - Ensure open trades are included in export
  - [ ] 7.19 Add separate export option for open trades only (optional enhancement - new endpoint or query param)
  - [ ] 7.20 Update navigation: Consider adding "Open Trades" link (optional - if not using dashboard section)

- [ ] 8.0 Testing and Integration Verification
  - [ ] 8.1 Update `__tests__/lib/trades.test.ts`: Add test cases for `isTradeOpen` function
  - [ ] 8.2 Add test: `isTradeOpen` returns true when exitDate is null
  - [ ] 8.3 Add test: `isTradeOpen` returns false when exitDate is not null
  - [ ] 8.4 Update `__tests__/lib/trades.test.ts`: Add test cases for open trade calculations
  - [ ] 8.5 Add test: `calculateTradeMetrics` returns null P&L for open trades
  - [ ] 8.6 Add test: `calculateTradeMetrics` calculates correctly for closed trades
  - [ ] 8.7 Update `__tests__/lib/analytics.test.ts`: Verify open trades are excluded from analytics
  - [ ] 8.8 Add test: `calculateBasicMetrics` excludes open trades from total count
  - [ ] 8.9 Add test: Analytics calculations only use closed trades
  - [ ] 8.10 Update `__tests__/components/TradeForm.test.tsx`: Test optional exit fields
  - [ ] 8.11 Add test: Trade form allows submission without exit fields
  - [ ] 8.12 Add test: Trade form validates exit fields are both filled or both empty
  - [ ] 8.13 Update `__tests__/components/TradeCard.test.tsx`: Test status badge display
  - [ ] 8.14 Add test: TradeCard shows "OPEN" badge for open trades
  - [ ] 8.15 Add test: TradeCard shows conditional P&L display for open trades
  - [ ] 8.16 Update `__tests__/api/trades.test.ts`: Test open trade creation
  - [ ] 8.17 Add test: POST /api/trades accepts trade without exitDate/exitPrice
  - [ ] 8.18 Add test: PUT /api/trades/[id] allows adding exit fields to open trade
  - [ ] 8.19 Add test: PUT /api/trades/[id] allows removing exit fields from closed trade (reopening)
  - [ ] 8.20 Add test: GET /api/trades filters by status correctly (open/closed/all)
  - [ ] 8.21 Update `__tests__/api/analytics.test.ts`: Verify open trades excluded
  - [ ] 8.22 Add test: Dashboard metrics exclude open trades
  - [ ] 8.23 Add test: Performance breakdowns exclude open trades
  - [ ] 8.24 Run full test suite: Execute `npm test` and verify all tests pass
  - [ ] 8.25 Run type checking: Execute `npm run type-check` and fix any TypeScript errors
  - [ ] 8.26 Manual testing: Create an open trade through UI and verify it saves correctly
  - [ ] 8.27 Manual testing: Update open trade to add exit information and verify it closes correctly
  - [ ] 8.28 Manual testing: Filter trades by status (open/closed) and verify results
  - [ ] 8.29 Manual testing: Verify open trades are excluded from dashboard analytics
  - [ ] 8.30 Manual testing: Verify open trades appear in trade list with correct status badges
  - [ ] 8.31 Manual testing: Verify CSV export includes status column and handles open trades correctly
  - [ ] 8.32 Manual testing: Test reopening a closed trade (removing exit information)
  - [ ] 8.33 Verify backward compatibility: Existing closed trades still work correctly after migration

