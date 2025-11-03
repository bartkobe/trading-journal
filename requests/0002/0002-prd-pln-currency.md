# Product Requirements Document: PLN Currency Support

**Based on request #0001 in /requests/0001/**

## 1. Introduction/Overview

This feature adds PLN (Polish Złoty) currency support to the Trading Journal application. The user is starting to trade Polish assets and requires PLN currency support as most of their trades will be denominated in PLN. Currently, the application supports 10 currencies (USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, SEK, NZD) but does not include PLN.

**Problem**: The user cannot record, track, or analyze PLN-denominated trades, which prevents them from using the Trading Journal for their primary trading activity.

**Goal**: Enable full PLN currency support across all application features, allowing users to record trades, view analytics, and export data for Polish asset trades.

## 2. Goals

1. **Currency Availability**: PLN must be available for selection in all currency dropdown menus throughout the application.

2. **Display Consistency**: PLN amounts must display correctly with "PLN" as the currency symbol (not "zł") using standard formatting conventions.

3. **Feature Compatibility**: All existing features must work seamlessly with PLN trades, including:
   - Trade creation and editing
   - Trade display in lists and detail views
   - Analytics and performance metrics
   - Charts and visualizations
   - CSV export functionality
   - Filtering and searching

4. **User Experience**: PLN should appear in currency lists in a logical position, maintaining consistency with existing currency presentation.

## 3. User Stories

**US-1**: As a trader trading Polish assets, I want to select PLN from the currency dropdown when creating a trade, so that I can accurately record trades made on the Polish stock exchange.

**US-2**: As a trader trading PLN forex pairs, I want to record trades with PLN currency, so that my performance metrics reflect the correct currency.

**US-3**: As a user viewing my trade list, I want to see PLN trades displayed with correct currency formatting (PLN symbol), so that I can easily identify and review my Polish asset trades.

**US-4**: As a user analyzing my trading performance, I want PLN trades to be included in all analytics, charts, and reports, so that I get accurate performance insights for my Polish asset trading.

**US-5**: As a user exporting my trade data, I want PLN trades to be included in CSV exports with the correct currency code, so that I can use the data in external analysis tools.

## 4. Functional Requirements

### 4.1 Currency List Updates

**FR-1**: The system must add PLN (Polish Złoty) to the CURRENCIES array in `components/ui/CurrencySelector.tsx` with the following properties:
- Code: `'PLN'`
- Name: `'Polish Złoty'`
- Symbol: `'PLN'` (not "zł")

**FR-2**: The system must update the currency dropdown in `components/trades/TradeForm.tsx` to include PLN as an option. This can be achieved by either:
- Option A: Adding PLN to the hardcoded dropdown list, OR
- Option B: Refactoring TradeForm to use the CurrencySelector component (preferred for consistency)

**FR-3**: PLN must appear in currency selection dropdowns in a logical position (alphabetically after NZD, or in a position consistent with existing currency ordering).

### 4.2 Currency Formatting

**FR-4**: The system must format PLN amounts using "PLN" as the currency symbol (e.g., "PLN 1,234.56" or "1,234.56 PLN" depending on existing formatting patterns).

**FR-5**: The system must use standard/default number formatting for PLN amounts (no special Polish locale formatting required).

**FR-6**: The existing `formatCurrencyAmount` and `getCurrencySymbol` functions in `CurrencySelector.tsx` must work correctly with PLN currency code.

### 4.3 Feature Compatibility

**FR-7**: The system must allow creation of trades with PLN currency through the trade form.

**FR-8**: The system must allow editing of existing PLN trades and changing trades to/from PLN currency.

**FR-9**: The system must display PLN trades correctly in all trade list views with proper currency formatting.

**FR-10**: The system must display PLN trades correctly in trade detail views with proper currency formatting.

**FR-11**: The system must include PLN trades in all analytics calculations (P&L, win rate, performance metrics).

**FR-12**: The system must display PLN amounts correctly in all charts and visualizations (equity curve, P&L by various dimensions, etc.).

**FR-13**: The system must include PLN trades in CSV exports with the currency code "PLN".

**FR-14**: The system must support filtering trades by PLN currency (if currency filtering exists).

### 4.4 Data Storage

**FR-15**: The system must store PLN currency code as the string "PLN" in the database (the existing schema already supports this - no migration needed).

**FR-16**: The system must retrieve and display PLN trades correctly from the database.

## 5. Non-Goals (Out of Scope)

**NG-1**: Polish locale formatting (e.g., "1 234,56 zł" with space separators and comma decimal) is NOT required. Standard formatting is acceptable.

**NG-2**: Currency conversion between PLN and other currencies is NOT included. Each trade maintains its original currency.

**NG-3**: Historical currency exchange rates for PLN are NOT required.

**NG-4**: Multi-currency portfolio aggregation with conversion is NOT part of this feature.

**NG-5**: This feature does NOT include adding other missing currencies beyond PLN.

**NG-6**: Changes to the database schema are NOT required (currency field already accepts string values).

## 6. Design Considerations

**UI/UX**:
- PLN should appear in currency dropdowns with the format: "PLN - Polish Złoty (PLN)" to be consistent with existing currency entries
- Currency symbol display should use "PLN" consistently throughout the application
- No visual design changes are required beyond adding PLN to existing dropdowns

**Components**:
- `CurrencySelector.tsx`: Update CURRENCIES array
- `TradeForm.tsx`: Update currency dropdown (consider refactoring to use CurrencySelector for consistency)
- All components that display currency amounts should already work with PLN through existing formatting functions

**Consistency**:
- Follow the same pattern used for other currencies (e.g., CHF uses "CHF" as symbol, not "Fr.")
- Maintain alphabetical or logical ordering in currency lists

## 7. Technical Considerations

**Technical Constraints**:
- The database schema (`prisma/schema.prisma`) already supports any currency string, so no migration is needed
- Currency is stored as `String @default("USD")` in the Trade model

**Dependencies**:
- Existing currency formatting uses `Intl.NumberFormat` API which supports PLN
- No new dependencies required

**Implementation Notes**:
- The `formatCurrencyAmount` function in `CurrencySelector.tsx` uses `Intl.NumberFormat` with the currency code, which should work with PLN
- If `Intl.NumberFormat` doesn't support PLN, the function has a fallback to use the symbol from the CURRENCIES array
- All existing currency-related tests should continue to pass, and new tests for PLN should be added

**Files to Modify**:
1. `components/ui/CurrencySelector.tsx` - Add PLN to CURRENCIES array
2. `components/trades/TradeForm.tsx` - Add PLN to dropdown (or refactor to use CurrencySelector)
3. Potentially: Test files that explicitly list currencies

**Files to Verify** (should work without changes, but verify):
- `lib/trades.ts` - Currency formatting functions
- All analytics components (should automatically work with PLN)
- Export functionality (should automatically include PLN)
- API routes (should already handle any currency string)

## 8. Success Metrics

**SM-1**: **Currency Selection**: User can successfully select PLN from currency dropdowns when creating or editing trades (100% of trade forms must support PLN).

**SM-2**: **Display Accuracy**: PLN trades display with "PLN" symbol (not "zł") in all views (100% of currency displays must show PLN correctly).

**SM-3**: **Feature Compatibility**: All existing features work with PLN trades:
- Trade creation: ✓
- Trade editing: ✓
- Trade display: ✓
- Analytics: ✓
- Charts: ✓
- Export: ✓

**SM-4**: **Data Integrity**: PLN currency code is stored and retrieved correctly from database (100% of PLN trades must persist and retrieve with correct currency code).

**SM-5**: **User Acceptance**: User can successfully record and track all PLN-denominated trades without workarounds.

## 9. Open Questions

None - all requirements have been clarified through the Jobs To Be Done analysis.

**Confirmed Details**:
- Currency symbol: "PLN" (not "zł") ✓
- Formatting: Standard/default formatting acceptable ✓
- Implementation approach: Standard implementation fine ✓
- Scope: Add PLN to currency lists, verify all features work ✓

---

**Document Version**: 1.0  
**Created**: November 2025  
**Based on**: Request #0001, Jobs To Be Done Analysis  
**Status**: Ready for Solution Design

