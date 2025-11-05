# Product Requirements Document: Record Trades at Opening

**Based on request #0002 in /requests/0002/**

## 1. Introduction/Overview

This feature enables users to record trades at the moment of opening a position, rather than waiting until the trade closes. The primary goal is to capture accurate emotional state at entry before memory fades and emotional bias (from the closing moment) contaminates recall. This addresses a critical gap in psychological tracking for day and swing traders whose positions can stay open for hours or days.

**Problem**: Currently, users can only record trades after they close, which means:
- Entry emotional state must be remembered retrospectively, leading to memory bias
- The user's emotional state at closing influences their memory of entry emotions
- Critical psychological data becomes unreliable or lost
- No ability to track or monitor open positions in real-time

**Goal**: Allow users to record trades immediately upon opening, capture accurate entry emotions, track open positions, and update trades with exit information when closing. Open trades must be excluded from analytics to maintain accurate performance metrics.

## 2. Goals

1. **Capture Entry Data at Opening**: Users must be able to create trades with only entry information (entry date, entry price, quantity, direction, emotional state at entry, etc.) without requiring exit information.

2. **Update Trades When Closing**: Users must be able to update open trades with exit information (exit date, exit price, emotional state at exit) when positions close.

3. **Distinguish Open vs Closed Trades**: The system must clearly distinguish and display open trades separately from closed trades throughout the UI.

4. **Exclude Open Trades from Analytics**: Open trades must be excluded from all performance metrics, analytics calculations, and dashboard displays. Only closed trades count toward realized performance.

5. **Maintain Data Accuracy**: Entry emotional state must be captured accurately at the moment of opening, before memory contamination occurs.

6. **Quick Recording Workflow**: The recording process must be quick and non-intrusive, not interrupting the user's trading flow.

## 3. User Stories

**US-1**: As a trader opening a position, I want to record the trade immediately after opening with my current emotional state, so that I capture accurate entry emotions before memory fades.

**US-2**: As a trader closing a position, I want to update my open trade record with exit information and closing emotional state, so that I have a complete trade record for analysis.

**US-3**: As a trader viewing my trade list, I want to see which trades are open and which are closed, so that I can quickly identify active positions.

**US-4**: As a trader analyzing my performance, I want open trades excluded from analytics, so that performance metrics reflect only realized gains/losses.

**US-5**: As a trader with multiple open positions, I want to easily find and manage open trades, so that I can update them efficiently when they close.

**US-6**: As a trader, I want to edit entry details of open trades, so that I can correct any mistakes or add information I missed during quick entry.

**US-7**: As a trader reviewing my dashboard, I want analytics to show only closed trades, so that I get accurate performance insights without unrealized P&L skewing results.

## 4. Functional Requirements

### 4.1 Database Schema Changes

**FR-1**: The system must make `exitDate` nullable in the Trade model (change from required to optional) in `prisma/schema.prisma`.

**FR-2**: The system must make `exitPrice` nullable in the Trade model (change from required to optional) in `prisma/schema.prisma`.

**FR-3**: The system must create a database migration to alter the `trades` table columns `exitDate` and `exitPrice` to allow NULL values.

**FR-4**: The system must ensure backward compatibility: existing closed trades (with exitDate and exitPrice) must continue to work without any data migration required.

### 4.2 Validation Schema Updates

**FR-5**: The system must update `tradeSchema` in `lib/validation.ts` to make `exitDate` optional (using `.optional()` instead of required).

**FR-6**: The system must update `tradeSchema` in `lib/validation.ts` to make `exitPrice` optional (using `.optional()` instead of required).

**FR-7**: The system must validate that if `exitDate` is provided, `exitPrice` must also be provided (and vice versa) - exit information must be complete or both null.

**FR-8**: The system must allow `exitDate` and `exitPrice` to be removed (set to null) when editing a closed trade, effectively reopening it.

### 4.3 Trade Creation and Editing

**FR-9**: The system must allow creating trades with only entry information (entryDate, entryPrice, quantity, direction, symbol, assetType, currency).

**FR-10**: The system must allow creating trades without exitDate and exitPrice (they can be null).

**FR-11**: The system must allow updating an open trade (trade with null exitDate/exitPrice) to add exit information.

**FR-12**: The system must allow updating a closed trade (trade with exitDate/exitPrice) to remove exit information, making it open again.

**FR-13**: The system must allow editing all entry fields of open trades (for corrections and updates).

### 4.4 Trade Status Determination

**FR-14**: The system must determine trade status as "open" when `exitDate` is null, and "closed" when `exitDate` is not null.

**FR-15**: The system must infer trade status from database fields (no separate status field needed).

**FR-16**: The system must provide a utility function `isTradeOpen(trade)` that returns true if trade is open, false if closed.

### 4.5 UI/UX - Trade Form

**FR-17**: The trade form must make exit date and exit price fields optional (not required) when creating a new trade.

**FR-18**: The trade form must allow leaving exit date and exit price empty when creating a trade.

**FR-19**: The trade form must show exit date and exit price fields when editing an open trade, allowing user to add exit information.

**FR-20**: The trade form must allow clearing exit date and exit price when editing a closed trade (to reopen it).

**FR-21**: The trade form must show appropriate labels/placeholders indicating that exit fields are optional for new trades.

**FR-22**: The trade form must validate that exit information is either completely filled or completely empty (both exitDate and exitPrice together, or both null).

### 4.6 UI/UX - Trade List and Display

**FR-23**: The trade list must display a visual indicator (badge, label, or styling) showing which trades are open vs closed.

**FR-24**: The trade list must show "OPEN" badge/status for open trades and "CLOSED" or no badge for closed trades.

**FR-25**: The trade list must display open trades with appropriate styling (e.g., different border color, background tint, or icon) to distinguish them.

**FR-26**: The trade card component must show trade status (open/closed) clearly visible.

**FR-27**: The trade card component must show entry information for all trades (open and closed).

**FR-28**: The trade card component must show exit information only for closed trades (or show "Open" or "In Progress" for open trades).

**FR-29**: The trade card component must not show P&L calculations for open trades (or show "N/A" or "Open" instead).

### 4.7 UI/UX - Trade Detail View

**FR-30**: The trade detail view must clearly indicate if a trade is open or closed (header, badge, or prominent display).

**FR-31**: The trade detail view must show exit information only for closed trades (or show "Not yet closed" for open trades).

**FR-32**: The trade detail view must not show P&L calculations for open trades (or show "Unrealized P&L" separately if displayed).

**FR-33**: The trade detail view must allow editing open trades to add exit information.

### 4.8 Analytics and Performance Metrics

**FR-34**: The system must exclude open trades from all analytics calculations in `lib/analytics.ts`.

**FR-35**: The system must filter out trades with null `exitDate` when calculating:
   - Total trades count
   - Win rate
   - Total P&L
   - Average P&L
   - Profit factor
   - Sharpe ratio
   - Maximum drawdown
   - All performance breakdowns (by symbol, strategy, asset type, etc.)

**FR-36**: The dashboard must show metrics based only on closed trades.

**FR-37**: The dashboard must not include open trades in any charts, breakdowns, or visualizations.

**FR-38**: The system must provide a count or indicator of open trades separately (optional, if needed for user awareness).

### 4.9 Trade Calculations

**FR-39**: The system must not calculate P&L for open trades (or return null/undefined for P&L when exitPrice is null).

**FR-40**: The system must update `enrichTradeWithCalculations` in `lib/trades.ts` to handle open trades (skip P&L calculations when exitDate/exitPrice is null).

**FR-41**: The system must ensure P&L calculations only occur when both entryPrice and exitPrice are present.

### 4.10 Filtering and Search

**FR-42**: The trade filters must include an "Outcome" or "Status" filter option to filter by open/closed status.

**FR-43**: The trade filters must allow filtering to show only open trades.

**FR-44**: The trade filters must allow filtering to show only closed trades.

**FR-45**: The trade filters must allow showing both open and closed trades (default behavior).

### 4.11 Export Functionality

**FR-46**: The CSV export must include open trades in the export.

**FR-47**: The CSV export must clearly indicate trade status (open/closed) in exported data (add a "Status" column or similar).

**FR-48**: The CSV export must handle null exitDate/exitPrice values appropriately (empty cells or "N/A" for open trades).

### 4.12 API Endpoints

**FR-49**: The POST `/api/trades` endpoint must accept trades without exitDate and exitPrice.

**FR-50**: The PUT `/api/trades/[id]` endpoint must allow updating exitDate/exitPrice to null (reopening closed trades).

**FR-51**: The PUT `/api/trades/[id]` endpoint must allow updating open trades to add exitDate/exitPrice.

**FR-52**: The GET `/api/trades` endpoint must return all trades (open and closed) with appropriate status indicators.

**FR-53**: All trade API endpoints must handle null exitDate/exitPrice values correctly.

## 5. Non-Goals (Out of Scope)

**NG-1**: **Unrealized P&L Tracking**: This feature does NOT include calculating or displaying unrealized P&L for open trades. Open trades are excluded from analytics entirely.

**NG-2**: **Position Management Features**: This feature does NOT include advanced position management like partial closes, multiple entries, or position sizing adjustments.

**NG-3**: **Real-time Price Updates**: This feature does NOT include automatic price updates or real-time market data integration for open positions.

**NG-4**: **Notifications or Reminders**: This feature does NOT include notifications or reminders for open trades (future enhancement).

**NG-5**: **Bulk Operations**: This feature does NOT include bulk close operations or batch updates for multiple open trades (future enhancement).

**NG-6**: **Trade Templates**: This feature does NOT include trade templates or quick-entry templates (future enhancement).

**NG-7**: **Trade Planning**: This feature does NOT include pre-trade planning or trade setup recording before opening (future enhancement).

**NG-8**: **Analytics for Open Trades**: This feature does NOT include any analytics or metrics for open trades (they are excluded from all analytics).

## 6. Design Considerations

### 6.1 UI/UX

**Trade Form**:
- Exit date and exit price fields should remain visible but be marked as optional (e.g., "(Optional)" label or lighter styling)
- Consider showing a checkbox or toggle: "Trade is still open" to automatically skip exit fields
- Form validation should allow submission with empty exit fields

**Trade List**:
- Open trades should have a clear visual distinction:
  - "OPEN" badge (e.g., blue/green badge)
  - Different border color (e.g., dashed border or accent color)
  - Icon indicator (e.g., clock icon or "in progress" icon)
- Closed trades can have no badge or a subtle "CLOSED" badge
- P&L column should show "—" or "Open" for open trades instead of a number

**Trade Detail View**:
- Clear status header: "Open Trade" or "Closed Trade"
- Exit section should be collapsible or hidden for open trades
- Show "Update Trade" button prominently for open trades

**Status Badge Design**:
- Open: Blue or green badge with "OPEN" text
- Closed: No badge or subtle gray badge (to avoid clutter)
- Badge should be small, unobtrusive, but clearly visible

### 6.2 Components

**Files to Modify**:
- `components/trades/TradeForm.tsx` - Make exit fields optional
- `components/trades/TradeCard.tsx` - Add status badge and conditional P&L display
- `components/trades/TradeDetail.tsx` - Add status indicator and conditional exit display
- `components/trades/TradeList.tsx` - Add status filtering
- `components/trades/TradeFilters.tsx` - Add status filter option

**New Components** (if needed):
- `components/trades/TradeStatusBadge.tsx` - Reusable status badge component

### 6.3 Styling

- Use consistent color scheme for status indicators (e.g., blue for open, gray for closed)
- Ensure status indicators are accessible (sufficient contrast, readable text)
- Maintain clean, professional appearance consistent with existing design

## 7. Technical Considerations

### 7.1 Database Changes

**Migration Strategy**:
- Create migration to alter `exitDate` and `exitPrice` columns from NOT NULL to nullable
- Existing data: All current trades have exitDate/exitPrice, so no data migration needed
- Backward compatibility: Existing queries and code should continue to work (they'll just have values)

**Schema Update**:
```prisma
model Trade {
  // ... existing fields ...
  exitDate  DateTime?  // Changed to optional
  exitPrice Float?     // Changed to optional
  // ... rest of fields ...
}
```

### 7.2 Validation Logic

**Trade Schema Updates**:
- Make `exitDate` and `exitPrice` optional in Zod schema
- Add validation rule: if one exit field is provided, both must be provided
- Allow both to be null (open trade) or both to have values (closed trade)

**Example Validation**:
```typescript
exitDate: z.coerce.date().optional(),
exitPrice: z.number().positive().optional(),
// Add refinement: if exitDate exists, exitPrice must exist and vice versa
```

### 7.3 API Updates

**Trade Creation (POST /api/trades)**:
- Accept trades without exitDate/exitPrice
- Set both to null if not provided
- Validate that if one is provided, both must be provided

**Trade Update (PUT /api/trades/[id])**:
- Allow setting exitDate/exitPrice to null (reopening)
- Allow adding exitDate/exitPrice to open trades (closing)
- Validate exit fields consistency

### 7.4 Analytics Filtering

**Analytics Calculations**:
- Update all analytics functions to filter out trades where `exitDate IS NULL`
- Add filtering at the start of each analytics function
- Ensure all breakdowns (by symbol, strategy, etc.) exclude open trades

**Example Pattern**:
```typescript
const closedTrades = trades.filter(trade => trade.exitDate !== null);
// Use closedTrades for all calculations
```

### 7.5 Trade Status Utility

**Helper Function**:
- Create utility function to determine if trade is open
- Use consistently across codebase
- Example: `const isOpen = trade.exitDate === null;`

### 7.6 Files to Modify

**Core Files**:
1. `prisma/schema.prisma` - Make exitDate and exitPrice optional
2. `lib/validation.ts` - Update tradeSchema validation
3. `lib/trades.ts` - Update enrichTradeWithCalculations to handle open trades
4. `lib/analytics.ts` - Filter out open trades from all calculations
5. `app/api/trades/route.ts` - Update POST handler
6. `app/api/trades/[id]/route.ts` - Update PUT handler

**Component Files**:
7. `components/trades/TradeForm.tsx` - Make exit fields optional
8. `components/trades/TradeCard.tsx` - Add status badge and conditional display
9. `components/trades/TradeDetail.tsx` - Add status indicator
10. `components/trades/TradeFilters.tsx` - Add status filter
11. `components/trades/TradeList.tsx` - Handle status filtering

**Test Files**:
12. Update existing tests to handle open trades
13. Add new tests for open trade scenarios

### 7.7 Dependencies

- No new dependencies required
- Existing Prisma, Zod, and React Hook Form should handle optional fields
- Ensure TypeScript types are updated to reflect nullable fields

### 7.8 Backward Compatibility

- All existing closed trades must continue to work without changes
- Existing queries should continue to work (they'll just have non-null values)
- No breaking changes to API responses (just additional flexibility)
- Analytics should produce same results for closed trades

## 8. Success Metrics

**SM-1**: **Trade Creation**: Users can successfully create trades with only entry information (100% success rate for open trade creation).

**SM-2**: **Trade Updates**: Users can successfully update open trades to add exit information when closing (100% success rate for trade updates).

**SM-3**: **Visual Distinction**: Open and closed trades are clearly distinguishable in all views (100% of trade displays must show status correctly).

**SM-4**: **Analytics Accuracy**: Analytics exclude open trades correctly (0% of open trades included in performance metrics).

**SM-5**: **Data Integrity**: Open trades are stored and retrieved correctly with null exitDate/exitPrice (100% data integrity).

**SM-6**: **Backward Compatibility**: All existing closed trades continue to work correctly after migration (100% backward compatibility).

**SM-7**: **User Acceptance**: Users can successfully record trades at opening and update them when closing without workarounds.

**SM-8**: **Form Validation**: Form correctly handles optional exit fields (no false validation errors, accepts valid open trades).

## 9. Open Questions

**OQ-1**: **Status Filter Default**: Should the trade list default to showing all trades (open + closed) or only closed trades?
   - Recommendation: Show all trades by default, allow filtering

**OQ-2**: **Sorting Open Trades**: How should open trades be sorted in the trade list? By entry date?
   - Recommendation: Sort by entry date (most recent first), with option to sort by other criteria

**OQ-3**: **Dashboard Open Trade Count**: Should the dashboard show a count of open trades separately (informational, not in metrics)?
   - Recommendation: Optional, can add later if needed

**OQ-4**: **Trade Detail P&L Display**: Should trade detail view show anything for open trades (current price? or just "N/A")?
   - Recommendation: Show "Open" or "N/A" - no unrealized P&L calculation

**OQ-5**: **Reopening Closed Trades**: Should we allow users to reopen closed trades (remove exit info)?
   - Answer: Yes, per FR-12 and FR-20 - allows corrections and flexibility

All open questions have reasonable recommendations and can be finalized during implementation. The core functionality is well-defined.

---

**Document Version**: 1.0  
**Created**: November 2025  
**Based on**: Request #0002, Jobs To Be Done Analysis  
**Status**: Ready for Solution Design

