# Solution Alternatives - Request #0001

**Based on PRD**: `0002-prd-pln-currency.md`

## Overview

Three solution approaches to add PLN currency support. Each varies in implementation scope, with different trade-offs in terms of code consistency, maintenance burden, and development time. Since this is a straightforward feature addition, the differences are primarily around code quality and consistency improvements.

---

## Solution A: Minimal Implementation

**Tagline**: Add PLN to existing currency lists with minimal changes

### Approach

This solution makes the smallest possible changes to add PLN currency support. It adds PLN to both the `CurrencySelector.tsx` component and the hardcoded dropdown in `TradeForm.tsx` without refactoring. This is the fastest path to implementation.

### Features Included

- Add PLN to CURRENCIES array in `CurrencySelector.tsx`
- Add PLN option to hardcoded dropdown in `TradeForm.tsx`
- Verify formatting functions work with PLN
- Basic manual testing of PLN trade creation and display

### Technical Implementation

- **CurrencySelector.tsx**: Add `{ code: 'PLN', name: 'Polish Złoty', symbol: 'PLN' }` to CURRENCIES array
- **TradeForm.tsx**: Add `<option value="PLN">PLN - Polish Złoty</option>` to the hardcoded currency dropdown
- No refactoring or architectural changes
- Testing: Manual verification that PLN appears in dropdowns and formats correctly

### Pros

- Fastest implementation time
- Minimal code changes
- Lowest risk of introducing bugs
- Gets feature to user quickly
- Preserves existing code structure

### Cons

- Maintains inconsistency between CurrencySelector component and TradeForm hardcoded list
- If other currencies are added later, need to update two places
- Doesn't improve codebase quality
- TradeForm still has hardcoded list that could drift from CurrencySelector

### Complexity Estimate

- **Development Time**: 15-30 minutes
- **Technical Risk**: Very Low
- **Testing Effort**: Manual testing only (10-15 minutes)
- **Total Time**: ~30-45 minutes

---

## Solution B: Balanced Implementation (Recommended)

**Tagline**: Add PLN and refactor TradeForm to use CurrencySelector for consistency

### Approach

This solution adds PLN currency support and simultaneously improves code consistency by refactoring `TradeForm.tsx` to use the existing `CurrencySelector` component instead of maintaining a hardcoded dropdown. This eliminates duplication and ensures currency lists stay in sync.

### Features Included

- Add PLN to CURRENCIES array in `CurrencySelector.tsx`
- Refactor `TradeForm.tsx` to use `CurrencySelector` component instead of hardcoded dropdown
- Verify formatting functions work with PLN
- Add unit tests for PLN currency support
- Manual testing of PLN trade creation and display

### Technical Implementation

- **CurrencySelector.tsx**: Add `{ code: 'PLN', name: 'Polish Złoty', symbol: 'PLN' }` to CURRENCIES array
- **TradeForm.tsx**: 
  - Import CurrencySelector component
  - Replace hardcoded `<select>` dropdown with `<CurrencySelector>` component
  - Remove hardcoded currency options
  - Ensure proper integration with React Hook Form (using `{...register('currency')}` pattern or controlled component)
- **Testing**: 
  - Add PLN to existing currency tests
  - Add test case for TradeForm using CurrencySelector
  - Manual verification of all features

### Pros

- Eliminates code duplication (single source of truth for currencies)
- Improves maintainability (future currency additions only need one update)
- Consistent UI/UX across all currency selectors
- Better test coverage
- Sets good precedent for future currency additions

### Cons

- Slightly longer implementation time
- Requires refactoring existing code (slight risk)
- Need to ensure CurrencySelector integrates properly with React Hook Form

### Complexity Estimate

- **Development Time**: 1-2 hours
- **Technical Risk**: Low (CurrencySelector already exists and works)
- **Testing Effort**: Unit tests + manual testing (30-45 minutes)
- **Total Time**: ~1.5-2.5 hours

---

## Solution C: Comprehensive Implementation

**Tagline**: Add PLN, refactor TradeForm, add comprehensive tests, and update documentation

### Approach

This solution adds PLN currency support, refactors TradeForm for consistency, and includes comprehensive testing and documentation updates. This ensures the feature is fully documented and well-tested.

### Features Included

- All features from Solution B
- Comprehensive unit tests for PLN currency:
  - CurrencySelector tests for PLN
  - TradeForm tests with PLN
  - Currency formatting tests for PLN
  - API tests with PLN trades
  - Analytics tests with PLN trades
- Update README.md to explicitly mention PLN
- Update USER_GUIDE.md if it lists currencies
- Update any API documentation that lists currencies
- Integration tests verifying PLN works end-to-end

### Technical Implementation

- **All changes from Solution B**
- **Test files**:
  - Update `__tests__/components/CurrencySelector.test.tsx` with PLN tests
  - Update `__tests__/components/TradeForm.test.tsx` with PLN currency tests
  - Update `__tests__/lib/currency.test.ts` with PLN formatting tests
  - Update `__tests__/api/currency.test.ts` with PLN trade creation tests
  - Add PLN trade to analytics tests
- **Documentation**:
  - Update README.md line 14 to explicitly list PLN
  - Check USER_GUIDE.md for currency mentions and update
  - Verify API_DOCUMENTATION.md for currency examples

### Pros

- Most thorough implementation
- Best test coverage
- Well-documented for users and developers
- Highest confidence in correctness
- Best foundation for future currency additions

### Cons

- Longest implementation time
- May be overkill for a simple currency addition
- More files to modify and review
- Tests may need maintenance over time

### Complexity Estimate

- **Development Time**: 3-4 hours
- **Technical Risk**: Very Low (comprehensive testing catches issues)
- **Testing Effort**: Extensive automated tests + manual testing (1-2 hours)
- **Total Time**: ~4-6 hours

---

## Comparison Matrix

| Aspect | Solution A | Solution B | Solution C |
|--------|------------|------------|------------|
| Development Time | 30-45 min | 1.5-2.5 hours | 4-6 hours |
| Feature Completeness | 100% | 100% | 100% |
| Code Quality | Maintains status quo | Improves consistency | Best practices |
| User Experience | Same | Same | Same |
| Technical Complexity | Very Low | Low | Low |
| Maintenance Burden | Medium (2 places to update) | Low (1 place to update) | Very Low |
| Test Coverage | Minimal | Good | Comprehensive |
| Documentation | None | None | Comprehensive |
| Risk | Very Low | Low | Very Low |

## Recommendation

**Solution B (Balanced Implementation)** is recommended because:

1. **Efficiency**: It solves the immediate need (PLN support) while improving code quality
2. **Maintainability**: Eliminates duplication, making future currency additions easier
3. **Balance**: Provides good test coverage without being excessive
4. **Risk**: Low risk while providing meaningful improvements
5. **Time**: Reasonable time investment for lasting benefits

Solution A is too minimal and leaves technical debt. Solution C is comprehensive but may be overkill for this straightforward feature. Solution B strikes the right balance.

## Next Steps

Please review the solutions and indicate:
- Which solution you prefer (A, B, or C)
- Any modifications or hybrid approach you'd like
- Any questions about the solutions

**Note**: If you want to move quickly, Solution A gets PLN available fastest. If you value code quality and maintainability, Solution B is the sweet spot. If you want maximum confidence and documentation, Solution C provides that.

