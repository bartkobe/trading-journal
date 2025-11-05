# Triage Assessment - Request #0003

## Request Summary
User requests bilingual support (English and Polish) for the Trading Journal application. The language setting should be changeable by the user during a session.

## Documentation Review

### Current Localization State

**README.md** (line 60):
- Application language: TypeScript (programming language, not UI language)
- No mention of UI localization or internationalization features
- No mention of language support or switching

**USER_GUIDE.md**:
- Entire guide written in English only
- No language switching instructions
- No mention of localization features

**Package.json**:
- No i18n or localization libraries installed
- No `next-intl`, `react-i18next`, `next-i18next`, or similar packages
- No language-related dependencies

**App Layout** (`app/layout.tsx`, line 53):
- HTML lang attribute hardcoded to `"en"`: `<html lang="en" suppressHydrationWarning>`
- No language switching mechanism
- No locale/language context provider

### Codebase Analysis

**Text Strings**:
- All UI text is hardcoded in English throughout components
- Examples found:
  - Navigation: "Dashboard", "Trades", "New Trade", "Logout"
  - Forms: "Symbol", "Asset Type", "Entry Date", "Save Trade", etc.
  - Buttons: "Sign In", "Create Account", "Edit Trade", "Delete Trade"
  - Error messages: "Failed to load trades", "Unable to connect to server"
  - Analytics labels: "Total Trades", "Win Rate", "Total P&L"
  - Empty states: "No trades found", "Start logging trades"

**Date Formatting** (`lib/chart-config.ts`):
- Uses `toLocaleDateString('en-US', ...)` with hardcoded 'en-US' locale
- No dynamic locale support

**Date Formatting** (`components/ui/DateRangeFilter.tsx`):
- Uses `toLocaleDateString()` without locale parameter (defaults to browser locale)
- Inconsistent locale handling

**Component Examples**:
- `Navigation.tsx`: All labels hardcoded ("Dashboard", "Trades", "New Trade", "Logout")
- `TradeForm.tsx`: All form labels, placeholders, and buttons in English
- `app/page.tsx`: "Trading Journal", "Track, analyze, and improve your trading performance", "Sign In", "Create Account"

### Existing Infrastructure

**No i18n Infrastructure**:
- No translation files (JSON, YAML, etc.)
- No translation keys or namespaces
- No language context or hooks
- No language selector component
- No language persistence mechanism (localStorage, cookies, user preferences)

**Theme System**:
- Theme switching exists (`ThemeProvider`, `ThemeToggle`)
- Theme preference is persisted (could be used as reference for language persistence pattern)
- However, this is a different concern from localization

## Assessment

**Result**: **Not Fulfilled**

### Evidence
- No i18n/localization libraries installed
- All UI text is hardcoded in English
- HTML lang attribute is hardcoded to "en"
- No language switching mechanism exists
- No Polish translations anywhere in the codebase
- No translation infrastructure or file structure

### Rationale
The request is clear: the user wants bilingual support (English and Polish) with the ability to change languages during a session. Currently, the application is entirely in English with no localization infrastructure. This is a significant feature that requires:

1. **Infrastructure Setup**: Installing and configuring an i18n library (e.g., next-intl for Next.js)
2. **Translation Files**: Creating translation files for English and Polish
3. **Component Updates**: Replacing hardcoded strings with translation keys throughout the application
4. **Language Switching**: Implementing a language selector component and persistence mechanism
5. **Locale Handling**: Updating date/number formatting to use the selected locale
6. **Testing**: Ensuring all text displays correctly in both languages

This is a comprehensive feature that will touch many components and require careful implementation to ensure all UI elements are properly localized.

### Required Changes (Initial Assessment)
1. Install i18n library (next-intl recommended for Next.js App Router)
2. Create translation files for English and Polish
3. Update `app/layout.tsx` to support dynamic language
4. Create language selector component
5. Replace all hardcoded strings with translation keys
6. Update date/number formatting to use selected locale
7. Add language preference persistence
8. Update all components to use translation hooks/utilities

### Scope Estimate
- **Files Affected**: 50+ files (components, pages, API routes with error messages)
- **Translation Keys Needed**: 200+ (estimated based on UI complexity)
- **Complexity**: High - requires systematic refactoring across the entire codebase

