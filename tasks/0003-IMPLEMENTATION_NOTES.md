# Implementation Notes: Record Trades at Opening Feature

**Feature PRD:** `0003-prd-record-trades-at-opening.md`  
**Implementation Date:** November 2025  
**Status:** In Progress

---

## Issues Encountered and Resolved

### Issue 1: Optional Number Field Validation
**Problem:** Empty number inputs (stopLoss, takeProfit, riskRewardRatio) were causing validation errors because react-hook-form's `valueAsNumber: true` converts empty inputs to `NaN`, which Zod rejected.

**Solution:** 
- Updated `lib/validation.ts` to use `.preprocess()` for optional number fields, converting `NaN`, empty strings, and `null` to `undefined`
- Added client-side cleaning in `TradeForm.tsx` `doSubmit` function to convert `NaN` to `undefined` before sending to API

**Files Modified:**
- `lib/validation.ts` - Added preprocessing for `stopLoss`, `takeProfit`, `riskRewardRatio`, `actualRiskReward`, `exitPrice`, `fees`
- `components/trades/TradeForm.tsx` - Added `cleanNumber()` helper function

### Issue 2: Exit Date/Price Validation Cross-Reference
**Problem:** Form validation was failing when exitDate was an empty string while exitPrice was null, causing the cross-validation refinement to fail.

**Solution:**
- Updated `TradeForm.tsx` to properly handle empty exitDate strings and convert them to `null`
- Added preprocessing in validation schema to handle Date objects and empty strings
- Ensured both exit fields are set to `null` when trade is marked as open

**Files Modified:**
- `lib/validation.ts` - Added preprocessing for `exitDate` to handle Date objects and empty strings
- `components/trades/TradeForm.tsx` - Improved exit field cleaning logic

### Issue 3: Prisma Client Type Issues
**Problem:** After regenerating Prisma client, the create operation was expecting explicit field mapping.

**Solution:**
- Changed from spreading `...tradeData` to explicitly setting each field in Prisma data object
- This prevents passing invalid or unexpected fields to Prisma

**Files Modified:**
- `app/api/trades/route.ts` - Explicit field mapping for Prisma create
- `app/api/trades/[id]/route.ts` - Explicit field mapping for Prisma update

### Issue 4: Null Value Formatting Errors
**Problem:** `formatPercent` and `formatCurrency` functions were being called with `null` values for open trades, causing "null is not an object (evaluating 'value.toFixed')" errors.

**Solution:**
- Updated `formatPercent` and `formatCurrency` to accept `null | undefined` and return "—" for null values
- Updated `TradeList.tsx` to properly handle open trades in both table and mobile views

**Files Modified:**
- `lib/trades.ts` - Updated `formatCurrency` and `formatPercent` to handle null values
- `components/trades/TradeList.tsx` - Added open trade handling, imported `isTradeOpen` utility

---

## Additional Improvements Made

### TradeList Component
- Added `isTradeOpen` utility import
- Updated table view to show "In Progress" for open trades
- Updated mobile card view to show OPEN badge and handle open trades
- Updated `getOutcomeColor` and `getOutcomeIcon` to handle open trades

---

## Documentation Updates Needed

The following documentation files need to be updated after implementation is complete:

1. **`docs/USER_GUIDE.md`**
   - Update "Adding Trades" section to explain open trades feature
   - Document the "Trade is still open" checkbox
   - Explain how to close an open trade later
   - Document status badges and visual indicators

2. **`docs/API_DOCUMENTATION.md`**
   - Document optional `exitDate` and `exitPrice` fields in POST/PUT endpoints
   - Document status filtering in GET `/api/trades`
   - Update request/response examples to show open trades

3. **`README.md`**
   - Update Features section to mention open trades support
   - Note that trades can be recorded before they close

4. **`tasks/0003-prd-record-trades-at-opening.md`**
   - Mark completed sections
   - Add implementation notes about issues encountered

---

## Testing Notes

- Manual testing confirmed: Creating open trades works correctly
- Manual testing confirmed: Viewing trades list with open trades works
- Manual testing confirmed: Format functions handle null values correctly

---

## Next Steps

1. Complete remaining task sections (5.0, 6.0, 7.0, 8.0)
2. Update all documentation files listed above
3. Run full test suite and ensure all tests pass
4. Update USER_GUIDE.md with complete open trades workflow

