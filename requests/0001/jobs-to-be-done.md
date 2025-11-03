# Jobs To Be Done Analysis - Request #0001

## Executive Summary

The user is starting to trade Polish assets and needs PLN (Polish Złoty) currency support in the Trading Journal. Since most of their trades will be in PLN, this is a critical feature requirement. The user needs to be able to record trades, track performance, and use all existing features (analytics, export, etc.) with PLN-denominated trades. The implementation should use "PLN" as the currency symbol (not "zł") and follow standard formatting conventions.

## The Job

**Statement**: Enable comprehensive PLN currency support so the user can record, analyze, and track performance of Polish asset trades.

**Detail**: The user is expanding their trading to include Polish assets (stocks, forex pairs, and other financial instruments denominated in PLN). They need the Trading Journal to fully support PLN currency so they can:
- Record trades made in PLN
- Track performance metrics in PLN
- Use all existing analytics and reporting features with PLN trades
- Export PLN trade data

Since most of their trades will be in PLN, this is not a nice-to-have feature but a core requirement for using the application effectively.

## The Context

**When**: The user is starting to trade Polish assets now. They currently cannot record PLN trades, which means they cannot use the application for their primary trading activity.

**Where**: The need arises when:
- Creating new trades for Polish stock exchange assets
- Recording Forex pairs involving PLN (e.g., USD/PLN, EUR/PLN)
- Recording other financial instruments denominated in PLN
- Viewing analytics and performance metrics that should display PLN amounts
- Exporting trade data that includes PLN trades

**Triggers**: 
- Starting to trade Polish assets (immediate need)
- Need to accurately track performance in the currency the trades are actually made in
- Desire for accurate P&L calculations and analytics in the native currency

## Desired Outcome

**Success Criteria**: 
- User can select PLN from the currency dropdown when creating/editing trades
- PLN trades are displayed correctly throughout the application
- All existing features (analytics, export, filtering, etc.) work seamlessly with PLN trades
- PLN amounts are formatted appropriately using "PLN" as the symbol (not "zł")
- Standard/default formatting is used (no special locale requirements)

**Ideal State**: 
- PLN appears in all currency selection dropdowns
- PLN trades are treated identically to other currencies (USD, EUR, etc.) in terms of functionality
- Performance metrics, charts, and exports all correctly handle PLN
- No limitations or workarounds needed for PLN trades

**Value**: 
- Enables the user to use the Trading Journal for their primary trading activity (most trades in PLN)
- Accurate performance tracking in the actual currency of trades
- No need to record trades in incorrect currencies as a workaround
- Professional and accurate financial record-keeping

## Current Alternatives

**Current Approach**: User is not currently recording PLN trades. This means:
- Cannot use the Trading Journal for Polish asset trades
- May need to use external spreadsheets or other tools
- Cannot track performance accurately for their main trading activity

**Limitations**: 
- The application is essentially unusable for the user's primary trading needs
- Must wait to record trades until PLN support is available
- Missing accurate performance tracking for PLN-denominated positions

**Pain Points**: 
- Cannot record most trades (since most will be in PLN)
- Application lacks critical functionality for user's use case
- Blocked from using core features of the application

## Barriers

**Technical Barriers**: 
- PLN needs to be added to the currency list in multiple places:
  - `CurrencySelector.tsx` component
  - `TradeForm.tsx` hardcoded dropdown
- Need to ensure currency formatting handles "PLN" symbol correctly
- Verify all existing features (analytics, export, etc.) work with new currency

**User Barriers**: 
- None identified - standard implementation meets requirements

**Process Barriers**: 
- None - standard implementation is acceptable

## Requirements Synthesis

**Must Have**:
- PLN added to currency selection in `CurrencySelector.tsx`
- PLN added to currency dropdown in `TradeForm.tsx`
- Currency symbol displays as "PLN" (not "zł")
- Standard formatting works correctly for PLN amounts
- All existing features work with PLN (trade creation, editing, display, analytics, export)

**Should Have**:
- PLN appears in correct alphabetical or logical order in currency lists
- Consistent implementation across all currency selection points

**Nice to Have**:
- Documentation updates mentioning PLN support
- Test coverage for PLN currency

## Open Questions

None - user has provided clear requirements:
- Use "PLN" not "zł" for symbol
- Standard formatting is acceptable
- Standard implementation approach is fine

## Next Steps

Ready to proceed to PRD creation using create-prd.md guidelines.

Key implementation points:
1. Add `{ code: 'PLN', name: 'Polish Złoty', symbol: 'PLN' }` to CURRENCIES array
2. Update TradeForm.tsx to include PLN or preferably use CurrencySelector component
3. Verify formatting functions work with PLN
4. Test all features with PLN trades

