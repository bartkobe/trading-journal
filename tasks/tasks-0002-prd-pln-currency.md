# Task List: PLN Currency Support

**Based on:** `0002-prd-pln-currency.md`  
**Generated:** November 2025  
**Status:** In Progress  
**Solution:** Solution C (Comprehensive Implementation)

---

## Relevant Files

- `components/ui/CurrencySelector.tsx` - Currency selector component containing CURRENCIES array and formatting functions (✅ Modified - Added PLN currency)
- `components/ui/CurrencySelector.test.tsx` - Unit tests for CurrencySelector component (✅ Modified - Added PLN test cases)
- `components/trades/TradeForm.tsx` - Trade form component (✅ Modified - Refactored to use CurrencySelector component)
- `components/trades/TradeForm.test.tsx` - Unit tests for TradeForm component (✅ Modified - Added PLN test cases)
- `__tests__/lib/currency.test.ts` - Currency formatting and utility function tests (✅ Modified - Added PLN formatting tests)
- `__tests__/api/currency.test.ts` - API endpoint tests for currency support (✅ Modified - Added PLN API tests)
- `lib/trades.ts` - Trade utility functions including formatCurrency
- `README.md` - Project documentation mentioning supported currencies
- `docs/USER_GUIDE.md` - User guide documentation
- `docs/API_DOCUMENTATION.md` - API documentation

### Notes

- Unit tests are placed alongside code files or in `__tests__/` directory
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

---

## Tasks

- [x] 1.0 Add PLN to CurrencySelector Component
  - [x] 1.1 Open `components/ui/CurrencySelector.tsx` and locate the CURRENCIES array
  - [x] 1.2 Add PLN entry to CURRENCIES array: `{ code: 'PLN', name: 'Polish Złoty', symbol: 'PLN' }` after NZD entry (maintain alphabetical order after NZD)
  - [x] 1.3 Verify the CurrencyCode type automatically includes 'PLN' through TypeScript's const assertion
  - [x] 1.4 Verify `getCurrencySymbol('PLN')` returns 'PLN'
  - [x] 1.5 Verify `formatCurrencyAmount(1234.56, 'PLN')` works correctly (should use Intl.NumberFormat or fallback to 'PLN1234.56' format)

- [x] 2.0 Refactor TradeForm to Use CurrencySelector Component
  - [x] 2.1 Open `components/trades/TradeForm.tsx` and locate the currency dropdown section (around line 138-156)
  - [x] 2.2 Import CurrencySelector component at the top of the file
  - [x] 2.3 Replace the hardcoded `<select>` element and its `<option>` children with `<CurrencySelector>` component
  - [x] 2.4 Ensure CurrencySelector integrates with React Hook Form by using `{...register('currency')}` or converting to controlled component pattern
  - [x] 2.5 Verify the currency label and error display still work correctly
  - [x] 2.6 Ensure the component maintains the same styling and behavior as before (disabled state, error messages, etc.)
  - [x] 2.7 Test that the form submission includes the currency value correctly

- [x] 3.0 Add Comprehensive Test Coverage for PLN Currency
  - [x] 3.1 Update `__tests__/components/CurrencySelector.test.tsx`: Add test case to verify PLN appears in currency options list
  - [x] 3.2 Update `__tests__/components/CurrencySelector.test.tsx`: Add test case for selecting PLN currency and verifying onChange is called with 'PLN'
  - [x] 3.3 Update `__tests__/components/CurrencySelector.test.tsx`: Add test case to verify PLN option displays as "PLN - Polish Złoty (PLN)"
  - [x] 3.4 Update `__tests__/lib/currency.test.ts`: Add test case for `formatCurrency(1234.56, 'PLN')` to verify PLN formatting
  - [x] 3.5 Update `__tests__/lib/currency.test.ts`: Add test case for `formatCurrencyAmount(1234.56, 'PLN')` to verify PLN formatting with symbol
  - [x] 3.6 Update `__tests__/lib/currency.test.ts`: Add test case for `getCurrencySymbol('PLN')` to return 'PLN'
  - [x] 3.7 Update `__tests__/api/currency.test.ts`: Add test case to create a trade with PLN currency via POST /api/trades
  - [x] 3.8 Update `__tests__/api/currency.test.ts`: Add test case to retrieve and verify PLN trade via GET /api/trades/[id]
  - [x] 3.9 Update `__tests__/api/currency.test.ts`: Add test case for filtering trades by PLN currency (if currency filtering exists)
  - [x] 3.10 Update `__tests__/components/TradeForm.test.tsx`: Add test case to verify PLN appears in TradeForm currency dropdown after refactoring
  - [x] 3.11 Update `__tests__/components/TradeForm.test.tsx`: Add test case to verify creating a trade with PLN currency works correctly
  - [x] 3.12 Run all tests: `npx jest` and verify all tests pass including new PLN tests

- [ ] 4.0 Update Documentation for PLN Support
  - [ ] 4.1 Update `README.md` line 14: Change "USD, EUR, GBP, JPY, CAD, AUD, CHF, and more" to explicitly include PLN (e.g., "USD, EUR, GBP, JPY, CAD, AUD, CHF, PLN, and more")
  - [ ] 4.2 Update `docs/USER_GUIDE.md` line 140: Update currency list example to include PLN (e.g., "USD, EUR, GBP, JPY, PLN, etc.")
  - [ ] 4.3 Update `docs/API_DOCUMENTATION.md`: Add PLN to any currency code examples in request/response documentation
  - [ ] 4.4 Verify all currency-related examples in documentation include PLN where appropriate

- [ ] 5.0 Integration Verification and End-to-End Testing
  - [ ] 5.1 Manually test: Create a new trade with PLN currency through the UI and verify it saves correctly
  - [ ] 5.2 Manually test: Edit an existing trade and change currency to PLN, verify it updates correctly
  - [ ] 5.3 Manually test: View trade list and verify PLN trades display with correct currency formatting (showing "PLN" symbol)
  - [ ] 5.4 Manually test: View trade detail page and verify PLN amounts display correctly
  - [ ] 5.5 Manually test: Verify PLN trades appear in analytics dashboard with correct currency formatting
  - [ ] 5.6 Manually test: Verify PLN trades appear correctly in all chart visualizations (equity curve, P&L by dimensions, etc.)
  - [ ] 5.7 Manually test: Export trades to CSV and verify PLN trades are included with currency code "PLN"
  - [ ] 5.8 Verify type checking: Run `npm run type-check:ci` to ensure no TypeScript errors
  - [ ] 5.9 Run full test suite: Execute `npm test` and verify all tests pass
  - [ ] 5.10 Verify no console errors or warnings when using PLN currency throughout the application

