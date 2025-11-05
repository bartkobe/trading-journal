# Product Requirements Document: Bilingual Localization (English and Polish)

**Based on request #0003 in /requests/0003/**

## 1. Introduction/Overview

This feature adds bilingual support (English and Polish) to the Trading Journal application, enabling users to switch between languages during a session. The primary goal is to enable sharing the app with Polish-speaking friends and contacts who do not speak English, while maintaining full functionality for English-speaking users.

**Problem**: Currently, the application is only available in English, which prevents the user from sharing it with Polish-speaking friends and contacts. The user personally knows English and can use the app, but their friends cannot use the app effectively without Polish language support. This creates a significant barrier to sharing and collaboration.

**Goal**: Enable complete bilingual support (English and Polish) with the ability to switch languages during a session, allowing the user to share the app with Polish-speaking contacts and use it for Polish market trading.

## 2. Goals

1. **Complete UI Translation**: All user interface elements must be available in both English and Polish, including navigation, forms, buttons, labels, error messages, help text, and analytics.

2. **Language Switching**: Users must be able to change the language at any time during a session, with the change applying immediately across the entire application.

3. **Language Persistence**: The selected language preference must be saved and remembered across browser sessions (browser-level persistence).

4. **Sharing Enablement**: Polish-speaking users (friends and contacts) must be able to understand and use the app effectively without knowing English.

5. **Seamless Experience**: Language switching must be smooth and non-disruptive, without requiring page reloads or causing data loss.

## 3. User Stories

**US-1**: As a user who wants to share the app with Polish-speaking friends, I want to switch the language to Polish, so that my friends can understand and use the app without needing to know English.

**US-2**: As a user switching languages, I want the language change to apply immediately across all UI elements (navigation, forms, buttons, messages), so that I can see the entire app in my selected language without delays or inconsistencies.

**US-3**: As a user changing the language during a session, I want my language preference to be remembered in my browser, so that the next time I open the app, it automatically uses my preferred language.

**US-4**: As a user demonstrating the app to Polish-speaking contacts, I want to switch to Polish quickly via a language selector in the navigation, so that I can show them the app in a language they understand.

**US-5**: As a Polish-speaking user, I want all UI elements translated (including error messages and help text), so that I can understand and use the app effectively without needing English.

**US-6**: As a user trading in Polish markets, I want to use the app in Polish, so that the language is consistent with my trading context and documentation.

**US-7**: As a user switching languages, I want to be able to change the language during a session without losing my current work or data, so that I can switch contexts seamlessly.

## 4. Functional Requirements

### 4.1 Language Infrastructure

**FR-1**: The system must implement an internationalization (i18n) framework suitable for Next.js App Router (e.g., next-intl).

**FR-2**: The system must maintain translation files (JSON or similar format) for English and Polish languages.

**FR-3**: The system must organize translations into logical namespaces (e.g., `common`, `navigation`, `forms`, `trades`, `analytics`, `errors`) for maintainability.

**FR-4**: The system must provide a translation utility/hook that components can use to access translated strings.

### 4.2 Language Switching

**FR-5**: The system must provide a language selector component in the top navigation bar.

**FR-6**: The language selector must display both available languages (English and Polish) with their native names or flags/icons.

**FR-7**: The system must allow users to change the language at any time during a session.

**FR-8**: When a user changes the language, the system must immediately update all UI text across the entire application without requiring a page reload.

**FR-9**: The system must maintain the user's current page/route and application state when switching languages.

### 4.3 Language Persistence

**FR-10**: The system must save the user's language preference in browser localStorage.

**FR-11**: The system must load and apply the saved language preference when the user visits the application.

**FR-12**: If no language preference is saved, the system must default to English.

**FR-13**: The system must update the HTML `lang` attribute dynamically based on the selected language.

### 4.4 Translation Coverage

**FR-14**: The system must translate all navigation labels (Dashboard, Trades, New Trade, Logout, etc.).

**FR-15**: The system must translate all form labels, placeholders, and help text.

**FR-16**: The system must translate all button labels and action text (Save, Edit, Delete, Cancel, etc.).

**FR-17**: The system must translate all error messages and validation messages.

**FR-18**: The system must translate all success messages and confirmation dialogs.

**FR-19**: The system must translate all analytics labels, chart titles, and metric names.

**FR-20**: The system must translate all empty states and informational messages.

**FR-21**: The system must translate all tooltips and help text.

**FR-22**: The system must translate all date range filter labels and date picker text.

**FR-23**: The system must translate all trade status labels (Open, Closed, etc.).

**FR-24**: The system must translate all asset type labels (Stock, Forex, Crypto, Options).

**FR-25**: The system must translate all direction labels (Long, Short).

**FR-26**: The system must translate all market condition labels (Trending, Ranging, Volatile, Calm).

**FR-27**: The system must translate all time of day labels (Pre Market, Market Open, Mid Day, Market Close, After Hours).

**FR-28**: The system must translate all emotional state labels.

**FR-29**: The system must translate all outcome labels (Winning, Losing, Breakeven).

### 4.5 Date and Number Formatting

**FR-30**: The system must use standard/default formatting for dates and numbers (no special Polish locale formatting required).

**FR-31**: The system must maintain consistent formatting regardless of language selection (dates remain in MM/DD/YYYY format, numbers use standard decimal separators).

### 4.6 User-Generated Content

**FR-32**: User-entered content (trade notes, tags, strategy names, symbol names) must NOT be translated and must remain in the language entered by the user.

**FR-33**: The system must display user-entered content exactly as entered, regardless of the selected UI language.

### 4.7 Technical Implementation

**FR-34**: The system must support server-side rendering (SSR) with proper language detection and handling.

**FR-35**: The system must support client-side language switching without requiring server round-trips.

**FR-36**: The system must handle language switching in both client components and server components appropriately.

**FR-37**: The system must ensure all dynamic content (loaded from API) uses the correct language for labels and messages.

### 4.8 Error Handling

**FR-38**: If a translation key is missing, the system must fall back to English text (or show the translation key) rather than breaking the UI.

**FR-39**: The system must handle language switching errors gracefully without crashing the application.

## 5. Non-Goals (Out of Scope)

**NG-1**: Polish locale-specific date and number formatting (e.g., "DD.MM.YYYY" date format, "1 234,56" number format with space separators and comma decimal) is NOT required. Standard formatting is acceptable.

**NG-2**: Account-level language preference storage in the database is NOT required for this initial implementation. Browser localStorage is sufficient.

**NG-3**: Automatic language detection based on browser settings is NOT required. Users must explicitly select their preferred language.

**NG-4**: Support for additional languages beyond English and Polish is NOT required for this feature.

**NG-5**: Translation of user documentation (USER_GUIDE.md, API documentation) is NOT required. Only the application UI needs translation.

**NG-6**: Right-to-left (RTL) language support is NOT required.

**NG-7**: Translation of currency symbols or currency-specific formatting is NOT required. Currency display remains consistent regardless of language.

**NG-8**: Multi-language support for the same user simultaneously (e.g., some fields in English, others in Polish) is NOT required. The entire UI switches to one language at a time.

## 6. Design Considerations

### 6.1 Language Selector Component

- **Location**: Top navigation bar, typically next to the theme toggle or user menu
- **Design**: Dropdown or button group showing language options
- **Visual**: Use language names (English, Polski) or flags/icons for clarity
- **Accessibility**: Must be keyboard accessible and screen reader friendly

### 6.2 Translation File Structure

Recommended structure:
```
locales/
  en/
    common.json
    navigation.json
    forms.json
    trades.json
    analytics.json
    errors.json
  pl/
    common.json
    navigation.json
    forms.json
    trades.json
    analytics.json
    errors.json
```

### 6.3 UI Consistency

- Language switching should not affect layout or component positioning
- Text length differences between languages should be handled gracefully (text wrapping, responsive design)
- All UI elements must maintain their functionality regardless of language

### 6.4 User Experience

- Language switching should be instant and smooth
- No loading spinners or delays when switching languages
- Visual feedback (e.g., subtle animation) when language changes
- Language selector should clearly indicate the currently selected language

## 7. Technical Considerations

### 7.1 Recommended Library

**next-intl** is recommended for Next.js App Router because:
- Built specifically for Next.js 13+ App Router
- Supports both server and client components
- Type-safe translations with TypeScript
- Good performance with minimal bundle size
- Active maintenance and community support

### 7.2 Implementation Approach

1. **Install next-intl**: Add the library to package.json dependencies
2. **Configure Next.js**: Set up middleware and routing for locale handling
3. **Create Translation Files**: Create JSON files for English and Polish translations
4. **Update Layout**: Modify app/layout.tsx to support dynamic language
5. **Create Language Selector**: Build a language selector component for navigation
6. **Refactor Components**: Replace hardcoded strings with translation keys across all components
7. **Add Persistence**: Implement localStorage for language preference
8. **Update HTML Lang**: Dynamically set HTML lang attribute based on selected language

### 7.3 Files to Modify

**High Priority (Core Infrastructure)**:
- `app/layout.tsx` - Add language provider and dynamic lang attribute
- `middleware.ts` - Configure locale routing (if using next-intl)
- `package.json` - Add next-intl dependency
- Create new `locales/` directory with translation files

**Medium Priority (Key Components)**:
- `components/ui/Navigation.tsx` - Add language selector, translate navigation labels
- `components/trades/TradeForm.tsx` - Translate all form labels and messages
- `components/trades/TradeCard.tsx` - Translate trade display labels
- `components/trades/TradeDetail.tsx` - Translate detail view labels
- `components/trades/TradeFilters.tsx` - Translate filter labels
- `components/analytics/DashboardContent.tsx` - Translate analytics labels
- `components/auth/LoginForm.tsx` - Translate login form
- `components/auth/RegisterForm.tsx` - Translate registration form
- `app/page.tsx` - Translate landing page

**Lower Priority (Supporting Components)**:
- All other components in `components/` directory
- Error messages in API routes
- Empty states and informational messages

### 7.4 Translation Keys Organization

Use nested keys for organization:
```json
{
  "navigation": {
    "dashboard": "Dashboard",
    "trades": "Trades",
    "newTrade": "New Trade",
    "logout": "Logout"
  },
  "forms": {
    "save": "Save",
    "cancel": "Cancel",
    "submit": "Submit",
    "required": "Required"
  },
  "trades": {
    "symbol": "Symbol",
    "assetType": "Asset Type",
    "entryDate": "Entry Date"
  }
}
```

### 7.5 Testing Considerations

- Test language switching in all major user flows
- Verify translations display correctly in all components
- Test persistence across browser sessions
- Verify no broken translations or missing keys
- Test with both English and Polish languages
- Ensure user-entered content is not affected by language switching

## 8. Success Metrics

**Primary Metrics**:
- **Translation Coverage**: 100% of UI elements translated (no hardcoded English strings remaining)
- **Language Switching Success Rate**: 100% successful language switches without errors
- **Persistence Success Rate**: 100% of users have their language preference remembered across sessions

**Secondary Metrics**:
- **Translation Quality**: User feedback on translation accuracy and appropriateness
- **Usage of Polish Language**: Percentage of users who select Polish as their language
- **Language Switching Frequency**: How often users switch languages during sessions

**User Goal Achievement**:
- **Sharing Enablement**: User can successfully share the app with Polish-speaking friends
- **Friend Usability**: Polish-speaking friends can use the app effectively without English knowledge

## 9. Open Questions

1. **Translation Quality**: Should we use professional translation services for Polish translations, or is automated translation acceptable initially?
   - **Recommendation**: Use AI translation but make sure you follow common financial terms and phrasing. 

2. **Missing Translation Keys**: During development, how should we handle missing translation keys?
   - **Recommendation**: Fallback to English text with a console warning for development; show translation key in production as a last resort

3. **Translation Review Process**: Who will review and approve Polish translations for accuracy?
   - **Recommendation**: Native Polish speaker familiar with trading terminology

4. **Future Language Support**: Should the architecture support adding more languages in the future?
   - **Recommendation**: Yes, design the structure to be extensible for future languages

5. **Currency Display**: Should currency symbols or names change based on language (e.g., "PLN" vs "zł")?
   - **Note**: User indicated no preference for formatting, so standard display (e.g., "PLN") is acceptable

6. **Date Formatting**: Should date pickers and date displays use Polish locale formatting even if we keep standard formatting elsewhere?
   - **Note**: User indicated no preference, so standard formatting is acceptable

## 10. Dependencies

- **next-intl** (or similar i18n library) - Must be installed and configured
- **Translation files** - Must be created and maintained
- **TypeScript types** - Translation keys should be type-safe

## 11. Risks and Mitigation

**Risk 1**: Translation quality may be poor if using automated translation
- **Mitigation**: Use professional translation services or native Polish speaker for review

**Risk 2**: Missing translations may break the UI
- **Mitigation**: Implement fallback to English for missing keys, comprehensive testing

**Risk 3**: Large refactoring effort across many files
- **Mitigation**: Systematic approach, component-by-component refactoring, thorough testing

**Risk 4**: Performance impact of language switching
- **Mitigation**: Use efficient i18n library, minimize re-renders, test performance

**Risk 5**: User-entered content may be accidentally translated
- **Mitigation**: Clear separation between UI translations and user content, careful implementation

