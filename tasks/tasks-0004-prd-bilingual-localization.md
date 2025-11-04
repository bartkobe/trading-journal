# Task List: Bilingual Localization (English and Polish)

**Based on PRD**: `0004-prd-bilingual-localization.md`

## Relevant Files

### Infrastructure and Configuration
- `package.json` - Add next-intl dependency
- `middleware.ts` - Update to handle locale routing with next-intl
- `app/layout.tsx` - Add next-intl provider and dynamic lang attribute
- `i18n/request.ts` - Next-intl request configuration (new file)
- `i18n/config.ts` - Next-intl configuration (new file)
- `lib/i18n.ts` - Translation utilities and helpers (new file)

### Translation Files
- `locales/en/common.json` - Common translations (English)
- `locales/en/navigation.json` - Navigation labels (English)
- `locales/en/forms.json` - Form labels and buttons (English)
- `locales/en/trades.json` - Trade-related translations (English)
- `locales/en/analytics.json` - Analytics labels (English)
- `locales/en/errors.json` - Error messages (English)
- `locales/pl/common.json` - Common translations (Polish)
- `locales/pl/navigation.json` - Navigation labels (Polish)
- `locales/pl/forms.json` - Form labels and buttons (Polish)
- `locales/pl/trades.json` - Trade-related translations (Polish)
- `locales/pl/analytics.json` - Analytics labels (Polish)
- `locales/pl/errors.json` - Error messages (Polish)

### Language Components
- `components/ui/LanguageSelector.tsx` - Language selector component (new file)
- `components/ui/LanguageSelector.test.tsx` - Tests for LanguageSelector
- `components/providers/LanguageProvider.tsx` - Language context provider (new file, optional if using next-intl directly)

### Components to Translate - Navigation and Auth
- `components/ui/Navigation.tsx` - Translate navigation labels
- `components/auth/LoginForm.tsx` - Translate login form
- `components/auth/RegisterForm.tsx` - Translate registration form

### Components to Translate - Trades
- `components/trades/TradeForm.tsx` - Translate trade form labels
- `components/trades/TradeCard.tsx` - Translate trade card labels
- `components/trades/TradeDetail.tsx` - Translate trade detail view
- `components/trades/TradeList.tsx` - Translate trade list labels
- `components/trades/TradeFilters.tsx` - Translate filter labels
- `components/trades/TradeStatusBadge.tsx` - Translate status labels
- `components/trades/TradeActions.tsx` - Translate action buttons
- `components/trades/OpenTradesSection.tsx` - Translate open trades section

### Components to Translate - Analytics
- `components/analytics/DashboardContent.tsx` - Translate dashboard content
- `components/analytics/DashboardMetrics.tsx` - Translate metric labels
- `components/analytics/EquityCurve.tsx` - Translate chart labels
- `components/analytics/PerformanceCharts.tsx` - Translate chart titles
- `components/analytics/PnlBySymbol.tsx` - Translate chart labels
- `components/analytics/PnlByStrategy.tsx` - Translate chart labels
- `components/analytics/PnlByAssetType.tsx` - Translate chart labels
- `components/analytics/PnlBySetupType.tsx` - Translate chart labels
- `components/analytics/PnlByTimeOfDay.tsx` - Translate chart labels
- `components/analytics/PnlByDayOfWeek.tsx` - Translate chart labels
- `components/analytics/PnlByEmotionalState.tsx` - Translate chart labels
- `components/analytics/WinLossDistribution.tsx` - Translate chart labels

### Components to Translate - UI
- `components/ui/ErrorMessage.tsx` - Translate error messages
- `components/ui/ConfirmDialog.tsx` - Translate dialog labels
- `components/ui/DateRangeFilter.tsx` - Translate filter labels
- `components/ui/CurrencySelector.tsx` - Translate currency labels (if any text)
- `components/ui/TagInput.tsx` - Translate tag input labels
- `components/ui/ScreenshotUpload.tsx` - Translate upload labels
- `components/ui/LoadingSpinner.tsx` - Translate loading text (if any)

### Pages to Translate
- `app/page.tsx` - Translate landing/login page
- `app/dashboard/page.tsx` - Translate dashboard page
- `app/trades/page.tsx` - Translate trades page
- `app/trades/new/page.tsx` - Translate new trade page
- `app/trades/[id]/page.tsx` - Translate trade detail page
- `app/trades/[id]/edit/page.tsx` - Translate edit trade page
- `app/trades/[id]/not-found.tsx` - Translate not found page
- `app/trades/TradesClient.tsx` - Translate client component

### API Routes (Error Messages)
- `app/api/auth/login/route.ts` - Translate error messages
- `app/api/auth/register/route.ts` - Translate error messages
- `app/api/trades/route.ts` - Translate error messages
- `app/api/trades/[id]/route.ts` - Translate error messages
- `app/api/analytics/route.ts` - Translate error messages (if any)

### Tests
- `__tests__/lib/i18n.test.ts` - Tests for i18n utilities
- `__tests__/components/LanguageSelector.test.tsx` - Tests for language selector
- Update existing component tests to handle translations

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.
- Translation files should use proper financial/trading terminology in Polish
- All user-entered content (notes, tags, symbols) must remain untranslated
- Use AI translation but ensure proper financial terms and phrasing

## Tasks

- [x] 1.0 Set up i18n infrastructure and dependencies
  - [x] 1.1 Install next-intl package using npm: `npm install next-intl`
  - [x] 1.2 Verify next-intl compatibility with Next.js 16.0.0
  - [x] 1.3 Check TypeScript types are available (should be included with next-intl)
  - [x] 1.4 Run `npm install` to ensure dependencies are properly installed
  - [x] 1.5 Verify installation by checking package.json contains "next-intl" in dependencies

- [x] 2.0 Create translation files for English and Polish
  - [x] 2.1 Create `locales/` directory structure in project root
  - [x] 2.2 Create `locales/en/` and `locales/pl/` subdirectories
  - [x] 2.3 Create namespace files: `common.json`, `navigation.json`, `forms.json`, `trades.json`, `analytics.json`, `errors.json` in both `en/` and `pl/` directories
  - [x] 2.4 Extract all hardcoded English strings from components and create translation keys in English files
  - [x] 2.5 Organize translation keys logically using nested structure (e.g., `navigation.dashboard`, `forms.save`, `trades.symbol`)
  - [x] 2.6 Translate all English strings to Polish using AI translation, ensuring proper financial/trading terminology
  - [x] 2.7 Review Polish translations for accuracy, especially financial terms (e.g., "P&L", "Sharpe Ratio", "Drawdown")
  - [x] 2.8 Ensure all translation keys are consistent between English and Polish files (no missing keys)
  - [x] 2.9 Add translation keys for enum values (AssetType, Direction, MarketCondition, TimeOfDay, EmotionalState, TradeStatus)

- [x] 3.0 Configure Next.js for language support and update core infrastructure
  - [x] 3.1 Create `i18n/config.ts` file with next-intl configuration (locales: ['en', 'pl'], defaultLocale: 'en')
  - [x] 3.2 Create `i18n/request.ts` file for server-side request configuration using `getRequestConfig` from next-intl
  - [x] 3.3 Update `middleware.ts` to integrate next-intl middleware with existing auth middleware
  - [x] 3.4 Ensure middleware handles locale routing (e.g., `/en/dashboard`, `/pl/dashboard`) while preserving auth logic
  - [x] 3.5 Update `app/layout.tsx` to wrap children with `NextIntlClientProvider` from next-intl
  - [x] 3.6 Modify `app/layout.tsx` to dynamically set HTML `lang` attribute based on current locale
  - [x] 3.7 Create language persistence utility using localStorage (similar to ThemeProvider pattern)
  - [x] 3.8 Implement language preference loading from localStorage on app initialization
  - [x] 3.9 Ensure default language is English if no preference is stored
  - [x] 3.10 Test that locale routing works correctly with existing protected routes
    - ✅ Middleware redirects root path `/` to `/en/` (307 redirect confirmed)
    - ✅ Middleware handles locale routing correctly
    - ⚠️ 404 on `/en/` is expected until pages are moved to `app/[locale]/` structure (will be done in section 5.0)

- [ ] 4.0 Create language selector component and integrate into navigation
  - [ ] 4.1 Create `components/ui/LanguageSelector.tsx` component with dropdown/button group UI
  - [ ] 4.2 Display language options: "English" and "Polski" with appropriate styling
  - [ ] 4.3 Implement language switching logic using next-intl's `useRouter` and `useLocale` hooks
  - [ ] 4.4 Add visual indicator for currently selected language (highlighted/active state)
  - [ ] 4.5 Ensure language selector is keyboard accessible (tab navigation, Enter/Space to select)
  - [ ] 4.6 Add ARIA labels for screen reader accessibility
  - [ ] 4.7 Save language preference to localStorage when language is changed
  - [ ] 4.8 Update `components/ui/Navigation.tsx` to include LanguageSelector component
  - [ ] 4.9 Position LanguageSelector next to ThemeToggle in navigation bar
  - [ ] 4.10 Ensure LanguageSelector styling matches existing navigation aesthetic
  - [ ] 4.11 Test language switching works without page reload and maintains current route
  - [ ] 4.12 Create `components/ui/LanguageSelector.test.tsx` with tests for language switching

- [ ] 5.0 Translate all UI components and pages
  - [ ] 5.1 Update `components/ui/Navigation.tsx`: Replace hardcoded strings with `useTranslations('navigation')` hook
  - [ ] 5.2 Update `components/auth/LoginForm.tsx`: Replace all labels, placeholders, buttons, and error messages with translation keys
  - [ ] 5.3 Update `components/auth/RegisterForm.tsx`: Replace all labels, placeholders, buttons, and error messages with translation keys
  - [ ] 5.4 Update `app/page.tsx`: Replace landing page text with translation keys
  - [ ] 5.5 Update `components/trades/TradeForm.tsx`: Replace all form labels, placeholders, help text, buttons, and validation messages
  - [ ] 5.6 Update `components/trades/TradeCard.tsx`: Replace status labels, action buttons, and display text
  - [ ] 5.7 Update `components/trades/TradeDetail.tsx`: Replace all labels, buttons, and status indicators
  - [ ] 5.8 Update `components/trades/TradeList.tsx`: Replace empty states, labels, and action text
  - [ ] 5.9 Update `components/trades/TradeFilters.tsx`: Replace filter labels, options, and button text
  - [ ] 5.10 Update `components/trades/TradeStatusBadge.tsx`: Replace "Open" and "Closed" status text
  - [ ] 5.11 Update `components/trades/TradeActions.tsx`: Replace action button labels
  - [ ] 5.12 Update `components/trades/OpenTradesSection.tsx`: Replace section title and labels
  - [ ] 5.13 Update `components/analytics/DashboardContent.tsx`: Replace all metric labels and section titles
  - [ ] 5.14 Update `components/analytics/DashboardMetrics.tsx`: Replace metric names and labels
  - [ ] 5.15 Update all chart components (`EquityCurve.tsx`, `PerformanceCharts.tsx`, `PnlBySymbol.tsx`, etc.): Replace chart titles, axis labels, and legend text
  - [ ] 5.16 Update `components/ui/ErrorMessage.tsx`: Replace error message templates and default text
  - [ ] 5.17 Update `components/ui/ConfirmDialog.tsx`: Replace dialog titles, messages, and button labels
  - [ ] 5.18 Update `components/ui/DateRangeFilter.tsx`: Replace filter labels and date picker text
  - [ ] 5.19 Update `components/ui/ScreenshotUpload.tsx`: Replace upload labels, error messages, and button text
  - [ ] 5.20 Update `app/dashboard/page.tsx`: Replace any hardcoded strings in server component
  - [ ] 5.21 Update `app/trades/page.tsx`: Replace any hardcoded strings
  - [ ] 5.22 Update `app/trades/TradesClient.tsx`: Replace labels, buttons, and empty states
  - [ ] 5.23 Update API route error messages in `app/api/auth/login/route.ts`, `register/route.ts`, `trades/route.ts`, etc. to use translation keys
  - [ ] 5.24 Verify all enum labels are translated (AssetType, Direction, MarketCondition, TimeOfDay, EmotionalState, TradeStatus)
  - [ ] 5.25 Test that user-entered content (notes, tags, symbols) is NOT translated and displays as entered
  - [ ] 5.26 Test language switching in all major user flows (login, create trade, view dashboard, edit trade, etc.)
  - [ ] 5.27 Verify no hardcoded English strings remain in any component
  - [ ] 5.28 Update existing component tests to work with translations (mock translation hooks if needed)

