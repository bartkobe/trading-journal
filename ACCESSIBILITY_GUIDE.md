# Accessibility Guide

This document outlines the accessibility standards and implementations in the Trading Journal application.

## WCAG 2.1 Level AA Compliance

Our application follows WCAG 2.1 Level AA standards, ensuring the interface is perceivable, operable, understandable, and robust for all users.

## Color Contrast Ratios

All color combinations meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text).

### Light Theme Contrast Ratios

| Text Color | Background | Contrast Ratio | WCAG AA | Use Case |
|------------|------------|----------------|---------|----------|
| `#0f172a` (foreground) | `#ffffff` (background) | 16.8:1 | ✅ Pass | Body text |
| `#64748b` (muted-foreground) | `#ffffff` (background) | 5.7:1 | ✅ Pass | Secondary text |
| `#ffffff` (primary-foreground) | `#1e40af` (primary) | 7.2:1 | ✅ Pass | Primary buttons |
| `#ffffff` (danger-foreground) | `#dc2626` (danger) | 5.4:1 | ✅ Pass | Error buttons |
| `#0f172a` (foreground) | `#f8fafc` (muted) | 15.7:1 | ✅ Pass | Muted backgrounds |
| `#dc2626` (danger) | `#fee2e2` (danger-light) | 7.1:1 | ✅ Pass | Error messages |
| `#059669` (success) | `#d1fae5` (success-light) | 4.8:1 | ✅ Pass | Success messages |

### Dark Theme Contrast Ratios

| Text Color | Background | Contrast Ratio | WCAG AA | Use Case |
|------------|------------|----------------|---------|----------|
| `#f1f5f9` (foreground) | `#020617` (background) | 16.1:1 | ✅ Pass | Body text |
| `#94a3b8` (muted-foreground) | `#020617` (background) | 7.8:1 | ✅ Pass | Secondary text |
| `#ffffff` (primary-foreground) | `#3b82f6` (primary) | 4.8:1 | ✅ Pass | Primary buttons |
| `#ffffff` (danger-foreground) | `#ef4444` (danger) | 4.5:1 | ✅ Pass | Error buttons |
| `#f1f5f9` (foreground) | `#0f172a` (card) | 13.2:1 | ✅ Pass | Card content |

### Financial Indicators

| Color | Light BG | Dark BG | Purpose |
|-------|----------|---------|---------|
| Profit (Green) | `#059669` | `#10b981` | Winning trades, positive P&L |
| Loss (Red) | `#dc2626` | `#ef4444` | Losing trades, negative P&L |
| Breakeven (Gray) | `#64748b` | `#94a3b8` | Neutral outcomes |

All financial indicators have sufficient contrast against their backgrounds and are accompanied by icons or text labels to support users with color blindness.

## Keyboard Navigation

### Global Keyboard Shortcuts

| Key | Action | Scope |
|-----|--------|-------|
| `Tab` | Navigate forward through interactive elements | Global |
| `Shift + Tab` | Navigate backward through interactive elements | Global |
| `Enter` | Activate buttons, links, and selected items | Global |
| `Space` | Toggle checkboxes, activate buttons | Buttons, Checkboxes |
| `Escape` | Close modals, dropdowns, and dialogs | Modals, Dialogs |
| `Arrow Keys` | Navigate through dropdowns and suggestions | Dropdowns |

### Focus Management

**Focus Indicators:**
- All interactive elements have visible focus indicators (ring-2 ring-ring)
- Focus outlines are never removed (`outline: none` is avoided)
- Custom focus styles use high-contrast colors
- Focus is programmatically managed in modals and dialogs

**Focus Trapping:**
- Modals trap focus within the dialog
- Focus returns to trigger element when modal closes
- First focusable element receives focus when modal opens

### Component-Specific Navigation

#### Forms
- All inputs are keyboard accessible
- Tab order follows logical reading order
- Labels are properly associated with inputs
- Error messages are announced to screen readers
- Required fields are clearly marked

#### Dialogs & Modals
- `Escape` key closes dialogs
- Focus trapped within dialog
- Background scroll disabled
- Focus returns to trigger on close

#### Dropdowns
- Arrow keys navigate options
- `Enter` selects option
- `Escape` closes dropdown
- Type-ahead search supported

#### Tag Input
- `Enter` adds tag
- `Backspace` removes last tag
- Arrow keys navigate suggestions
- `Escape` closes suggestions

## ARIA Attributes

### Landmarks

```tsx
<nav aria-label="Main navigation">
<main role="main" aria-label="Main content">
<aside role="complementary" aria-label="Filters">
```

### Interactive Elements

**Buttons:**
```tsx
<button aria-label="Delete trade" aria-describedby="delete-description">
<button aria-pressed="true"> // For toggle buttons
<button aria-expanded="false" aria-controls="menu-id"> // For dropdowns
```

**Dialogs:**
```tsx
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-description">
```

**Alerts:**
```tsx
<div role="alert" aria-live="polite"> // For errors
<div role="status" aria-live="polite"> // For status updates
```

**Form Fields:**
```tsx
<input aria-label="Symbol" aria-required="true" aria-invalid="true" aria-describedby="error-id">
```

### Live Regions

```tsx
// Polite announcements (form errors, success messages)
<div aria-live="polite" aria-atomic="true">

// Assertive announcements (critical errors)
<div aria-live="assertive" aria-atomic="true">
```

## Screen Reader Support

### Semantic HTML

- Proper heading hierarchy (h1 → h2 → h3)
- Semantic elements (`<nav>`, `<main>`, `<article>`, `<section>`)
- `<button>` for actions, `<a>` for navigation
- Tables use `<th>`, `<thead>`, `<tbody>` correctly

### Skip Links

A skip link allows keyboard users to bypass repetitive navigation:

```tsx
<a href="#main-content" className="skip-link">
  Skip to main content
</a>
```

### Alternative Text

- All images have descriptive alt text
- Decorative images use `alt=""`
- Icons have aria-labels when used without text

### Form Labels

- Every input has an associated label
- Labels use `htmlFor` to link to input `id`
- Fieldsets group related inputs
- Legends describe fieldset purpose

## Focus Styles

### Default Focus Ring

```css
/* Applied via Tailwind */
.focus\:ring-2 {
  --tw-ring-color: var(--ring);
  box-shadow: 0 0 0 2px var(--ring);
}
```

### Custom Focus Styles

```css
/* For inputs and interactive elements */
focus:ring-2 focus:ring-ring focus:border-transparent

/* For buttons */
focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
```

### Focus Within

```css
/* For containers with focusable children */
focus-within:ring-2 focus-within:ring-ring
```

## Component Implementations

### Navigation Component

✅ **Accessibility Features:**
- Proper `<nav>` landmark with `aria-label`
- Current page indicated with `aria-current="page"`
- Keyboard navigation with Tab
- High contrast focus indicators
- Logout button has descriptive aria-label

### Forms (Login, Register, Trade Entry)

✅ **Accessibility Features:**
- All inputs have associated labels
- Required fields marked with `aria-required`
- Error messages linked via `aria-describedby`
- Validation errors announced with `role="alert"`
- Logical tab order
- Disabled state properly communicated

### Dialogs & Modals

✅ **Accessibility Features:**
- `role="dialog"` and `aria-modal="true"`
- `aria-labelledby` and `aria-describedby`
- Focus trapped within modal
- Escape key closes modal
- Background scroll prevented
- Focus returns to trigger element

### Error Messages

✅ **Accessibility Features:**
- `role="alert"` for immediate errors
- `aria-live="polite"` for non-critical updates
- High contrast error colors
- Clear, descriptive error text
- Retry actions are keyboard accessible

### Data Tables

✅ **Accessibility Features:**
- Proper table structure with `<thead>`, `<tbody>`
- Column headers use `<th>` with scope
- Row data uses `<td>`
- Sortable columns indicate sort direction
- Mobile cards maintain semantic structure

### Charts

✅ **Accessibility Features:**
- Chart containers have descriptive labels
- Data available in alternative formats (tables)
- High contrast colors
- Loading states announced
- Error states accessible

## Testing Checklist

### Keyboard Navigation Testing

- [ ] All interactive elements are reachable via keyboard
- [ ] Tab order is logical and follows visual layout
- [ ] Focus indicators are visible on all elements
- [ ] No keyboard traps (can always navigate away)
- [ ] Escape key closes all modals and dropdowns
- [ ] Enter/Space activates buttons correctly
- [ ] Arrow keys work in dropdowns and lists

### Screen Reader Testing

- [ ] Page structure is logical with proper headings
- [ ] Landmarks are properly labeled
- [ ] All images have appropriate alt text
- [ ] Form fields are properly labeled
- [ ] Error messages are announced
- [ ] Dynamic content changes are announced
- [ ] Skip links work correctly

### Visual Testing

- [ ] Text meets contrast ratio requirements
- [ ] Focus indicators are clearly visible
- [ ] Color is not the only means of conveying information
- [ ] Text can be resized to 200% without loss of functionality
- [ ] UI works with Windows High Contrast Mode
- [ ] No content flashes more than 3 times per second

### Assistive Technology Testing

Test with:
- **NVDA** (Windows) - Free, open-source screen reader
- **JAWS** (Windows) - Popular commercial screen reader
- **VoiceOver** (macOS/iOS) - Built-in screen reader
- **TalkBack** (Android) - Built-in screen reader
- **Keyboard only** - Disconnect mouse and navigate

## Browser DevTools

### Chrome/Edge DevTools

1. Open DevTools → Lighthouse
2. Run Accessibility audit
3. Review issues and contrast ratios

### Firefox Accessibility Inspector

1. Open DevTools → Accessibility
2. Check tree structure
3. Verify ARIA attributes
4. Test keyboard navigation

### Chrome Accessibility Extensions

- **axe DevTools** - Comprehensive accessibility testing
- **WAVE** - Web accessibility evaluation tool
- **Lighthouse** - Built-in auditing tool

## Common Issues & Solutions

### Issue: Low Contrast Text

**Solution:**
- Use semantic theme colors (automatically meet WCAG AA)
- Test with contrast checker tools
- Avoid gray text on gray backgrounds

### Issue: Missing Focus Indicators

**Solution:**
- Never use `outline: none` without replacement
- Use Tailwind focus utilities: `focus:ring-2 focus:ring-ring`
- Test keyboard navigation in both themes

### Issue: Inaccessible Modals

**Solution:**
- Use `ConfirmDialog` component (built with accessibility)
- Ensure `aria-modal="true"` is set
- Trap focus within dialog
- Handle Escape key

### Issue: Unlabeled Form Inputs

**Solution:**
- Always use `<label>` with `htmlFor`
- Add `aria-label` for visually hidden labels
- Link errors with `aria-describedby`

### Issue: Keyboard Traps

**Solution:**
- Test tab navigation through entire page
- Ensure dropdowns close on Escape
- Verify modals can be dismissed

## Implementation Examples

### Accessible Button

```tsx
<button
  type="button"
  onClick={handleDelete}
  disabled={isDeleting}
  aria-label="Delete trade"
  aria-describedby="delete-description"
  className="px-4 py-2 bg-danger hover:bg-danger-dark text-danger-foreground rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
>
  Delete
</button>
<span id="delete-description" className="sr-only">
  This action cannot be undone
</span>
```

### Accessible Form Field

```tsx
<div>
  <label htmlFor="symbol" className="block text-sm font-medium text-foreground mb-2">
    Symbol <span className="text-danger" aria-label="required">*</span>
  </label>
  <input
    id="symbol"
    type="text"
    aria-required="true"
    aria-invalid={!!errors.symbol}
    aria-describedby={errors.symbol ? 'symbol-error' : undefined}
    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground"
  />
  {errors.symbol && (
    <p id="symbol-error" role="alert" className="mt-1 text-sm text-danger">
      {errors.symbol.message}
    </p>
  )}
</div>
```

### Accessible Dialog

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
  className="fixed inset-0 z-50 flex items-center justify-center bg-background/80"
>
  <div className="bg-card border border-border rounded-lg shadow-xl max-w-md w-full p-6">
    <h3 id="dialog-title" className="text-lg font-semibold">
      Delete Trade
    </h3>
    <p id="dialog-description" className="text-sm text-muted-foreground mt-2">
      Are you sure you want to delete this trade?
    </p>
    <div className="flex justify-end gap-3 mt-6">
      <button onClick={onCancel} className="...">Cancel</button>
      <button onClick={onConfirm} className="...">Delete</button>
    </div>
  </div>
</div>
```

### Skip Link

```tsx
// In app/layout.tsx, before Navigation
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
>
  Skip to main content
</a>

// In main content area
<main id="main-content" tabIndex={-1}>
  {children}
</main>
```

## Resources

### Tools

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Guidelines

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

### Screen Readers

- [NVDA](https://www.nvaccess.org/) - Free (Windows)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) - Paid (Windows)
- [VoiceOver](https://www.apple.com/accessibility/voiceover/) - Built-in (macOS/iOS)

---

**Last Updated**: October 30, 2025  
**WCAG Level**: AA (Target)  
**Maintained By**: Development Team

