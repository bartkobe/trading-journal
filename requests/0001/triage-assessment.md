# Triage Assessment - Request #0001

## Request Summary
User requests to add PLN (Polish Złoty) as a new currency option for trading.

## Documentation Review

### Current Currency Support

**README.md** (line 14):
- Lists: "Multi-currency support (USD, EUR, GBP, JPY, CAD, AUD, CHF, and more)"
- Note: Mentions "and more" but doesn't specify which additional currencies

**CurrencySelector Component** (`components/ui/CurrencySelector.tsx`):
- Currently supports 10 currencies:
  1. USD - US Dollar ($)
  2. EUR - Euro (€)
  3. GBP - British Pound (£)
  4. JPY - Japanese Yen (¥)
  5. CAD - Canadian Dollar (C$)
  6. AUD - Australian Dollar (A$)
  7. CHF - Swiss Franc (CHF)
  8. CNY - Chinese Yuan (¥)
  9. SEK - Swedish Krona (kr)
  10. NZD - New Zealand Dollar (NZ$)
- **PLN is NOT included**

**TradeForm Component** (`components/trades/TradeForm.tsx`):
- Has hardcoded currency dropdown with only 7 currencies (USD, EUR, GBP, JPY, CAD, AUD, CHF)
- Does NOT use the CurrencySelector component
- **PLN is NOT included**

**Database Schema** (`prisma/schema.prisma`):
- Currency field: `String @default("USD")` - accepts any string value
- No enum constraint, so PLN can be stored without schema changes

**Currency Formatting**:
- Uses `Intl.NumberFormat` API which supports PLN
- Helper functions in CurrencySelector.tsx should work with PLN once added

## Assessment

**Result**: **Not Fulfilled**

### Evidence
- PLN (Polish Złoty) is not in the CURRENCIES array in `CurrencySelector.tsx`
- PLN is not in the hardcoded dropdown in `TradeForm.tsx`
- No existing support found in codebase

### Rationale
The request is clear and specific: add PLN currency support. The database schema already supports any currency string, but the UI components need to be updated to include PLN in their dropdowns. The formatting infrastructure should work with PLN once it's added to the currency list.

### Required Changes (Initial Assessment)
1. Add PLN to CURRENCIES array in `components/ui/CurrencySelector.tsx`
2. Update `TradeForm.tsx` to either:
   - Use CurrencySelector component (preferred), OR
   - Add PLN to the hardcoded dropdown list
3. Consider updating README.md to reflect PLN availability
4. Update tests if they specifically list currency codes

## Recommendation

This is a straightforward feature addition. However, following the workflow, we should clarify:
- Is PLN the only currency the user needs, or are there others?
- Any specific formatting requirements for PLN?
- Should we also update TradeForm to use CurrencySelector component for consistency?

Proceeding to Step 4: PM Clarification (Jobs To Be Done) to gather requirements.

