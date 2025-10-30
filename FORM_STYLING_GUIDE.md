# Form Styling Guide

This document outlines the standardized form styling patterns used throughout the Trading Journal application to ensure consistency in spacing, typography, and visual design.

## Design Principles

1. **Consistency**: All forms follow the same spacing, typography, and color patterns
2. **Semantic Colors**: Use theme variables (not hardcoded colors) for automatic theme support
3. **Accessibility**: Clear labels, sufficient color contrast, visible focus states
4. **Responsive**: Forms adapt gracefully to different screen sizes
5. **Progressive Disclosure**: Group related fields into logical sections

## Form Container

### Simple Forms (Login, Register)
```tsx
<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
  {/* Form content */}
</form>
```

### Complex Forms (Trade Entry)
```tsx
<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
  {/* Form content organized in sections */}
</form>
```

**Spacing Guidelines:**
- Simple forms: `space-y-6` (24px vertical spacing)
- Complex forms: `space-y-8` (32px vertical spacing for better section separation)

## Error Messages

### Form-Level Errors
```tsx
{error && (
  <div className="bg-danger-light border border-danger text-danger-dark px-4 py-3 rounded-lg">
    {error}
  </div>
)}
```

**Styling:**
- Background: `bg-danger-light`
- Border: `border border-danger`
- Text: `text-danger-dark`
- Padding: `px-4 py-3`
- Corners: `rounded-lg`

### Field-Level Errors
```tsx
{errors.fieldName && (
  <p className="mt-1 text-sm text-danger">
    {errors.fieldName.message}
  </p>
)}
```

**Styling:**
- Margin top: `mt-1` (4px)
- Font size: `text-sm`
- Color: `text-danger`

## Form Fields

### Basic Field Structure
```tsx
<div>
  <label htmlFor="fieldId" className="block text-sm font-medium text-foreground mb-2">
    Field Label <span className="text-danger">*</span>
  </label>
  <input
    id="fieldId"
    type="text"
    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
    placeholder="Placeholder text"
    disabled={isLoading}
  />
  {errors.fieldName && <p className="mt-1 text-sm text-danger">{errors.fieldName.message}</p>}
</div>
```

### Label Styling
```tsx
className="block text-sm font-medium text-foreground mb-2"
```

**Properties:**
- Display: `block`
- Font size: `text-sm` (14px)
- Font weight: `font-medium`
- Color: `text-foreground`
- Margin bottom: `mb-2` (8px)

**Required Field Indicator:**
```tsx
<span className="text-danger">*</span>
```

### Input Field Styling

#### Text Inputs, Number Inputs, Date Inputs
```tsx
className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
```

**Properties:**
- Width: `w-full`
- Padding: `px-4 py-2` (16px horizontal, 8px vertical)
- Border: `border border-border`
- Corners: `rounded-lg`
- Focus state: `focus:ring-2 focus:ring-ring focus:border-transparent`
- Background: `bg-card`
- Text color: `text-foreground`
- Transitions: `transition-colors`

#### Select Dropdowns
Same styling as text inputs:
```tsx
className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
```

#### Textarea
Same styling as text inputs, with additional rows attribute:
```tsx
<textarea
  rows={8}
  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
/>
```

### Help Text
```tsx
<p className="mt-1 text-xs text-muted-foreground">
  Additional information about this field
</p>
```

**Styling:**
- Margin top: `mt-1` (4px)
- Font size: `text-xs` (12px)
- Color: `text-muted-foreground`

## Form Sections (Complex Forms)

### Section Container
```tsx
<div className="bg-card shadow rounded-lg p-6">
  <h2 className="text-lg font-semibold mb-4">Section Title</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Form fields */}
  </div>
</div>
```

**Section Styling:**
- Background: `bg-card`
- Shadow: `shadow`
- Corners: `rounded-lg`
- Padding: `p-6` (24px all sides)

**Section Title:**
- Font size: `text-lg` (18px)
- Font weight: `font-semibold`
- Margin bottom: `mb-4` (16px)

### Grid Layouts

#### Two-Column Layout
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Fields */}
</div>
```

#### Three-Column Layout
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {/* Fields */}
</div>
```

**Properties:**
- Base: `grid-cols-1` (single column on mobile)
- Desktop: `md:grid-cols-2` or `md:grid-cols-3`
- Gap: `gap-4` (16px between fields)

## Buttons

### Primary Submit Button
```tsx
<button
  type="submit"
  disabled={isLoading}
  className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isLoading ? 'Loading...' : 'Submit'}
</button>
```

**Styling:**
- Width: `w-full` (for simple forms) or auto (for complex forms)
- Background: `bg-primary`
- Hover: `hover:bg-primary-hover`
- Text color: `text-primary-foreground`
- Font weight: `font-medium`
- Padding: `py-2 px-4` (8px vertical, 16px horizontal) or `py-2 px-6` (24px horizontal for wider buttons)
- Corners: `rounded-lg`
- Transitions: `transition-colors`
- Disabled: `disabled:opacity-50 disabled:cursor-not-allowed`

### Secondary/Cancel Button
```tsx
<button
  type="button"
  className="px-6 py-2 border border-border rounded-lg hover:bg-muted text-foreground transition-colors"
  disabled={isLoading}
>
  Cancel
</button>
```

**Styling:**
- Padding: `px-6 py-2`
- Border: `border border-border`
- Corners: `rounded-lg`
- Hover: `hover:bg-muted`
- Text color: `text-foreground`
- Transitions: `transition-colors`

### Button Groups
```tsx
<div className="flex justify-end space-x-4">
  <button>Cancel</button>
  <button>Submit</button>
</div>
```

**Properties:**
- Layout: `flex justify-end`
- Spacing: `space-x-4` (16px between buttons)

## Responsive Behavior

### Mobile-First Approach
1. Fields stack vertically on mobile (`grid-cols-1`)
2. Labels and inputs take full width
3. Buttons span full width in simple forms
4. Padding adjusts appropriately

### Tablet & Desktop
1. Multi-column grids activate (`md:grid-cols-2`, `md:grid-cols-3`)
2. Form sections have more generous spacing
3. Button groups align to the right

## Loading States

### Disabled State
All form elements support the `disabled` prop:
```tsx
disabled={isLoading}
```

### Loading Indicators
Buttons show loading text:
```tsx
{isLoading ? 'Saving...' : 'Save'}
```

## Color Reference

### Semantic Colors Used in Forms

| Element | Class | Purpose |
|---------|-------|---------|
| **Labels** | `text-foreground` | Primary text color |
| **Inputs** | `bg-card`, `text-foreground`, `border-border` | Background, text, and border |
| **Focus Ring** | `focus:ring-ring` | Focus indicator color |
| **Help Text** | `text-muted-foreground` | Secondary/helper text |
| **Required Indicator** | `text-danger` | Required field asterisk |
| **Error Messages** | `text-danger` | Field validation errors |
| **Error Containers** | `bg-danger-light`, `border-danger`, `text-danger-dark` | Form-level errors |
| **Primary Button** | `bg-primary`, `hover:bg-primary-hover`, `text-primary-foreground` | Submit actions |
| **Secondary Button** | `border-border`, `hover:bg-muted`, `text-foreground` | Cancel actions |

## Examples

### Simple Login Form
```tsx
<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
  {error && (
    <div className="bg-danger-light border border-danger text-danger-dark px-4 py-3 rounded-lg">
      {error}
    </div>
  )}

  <div>
    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
      Email Address
    </label>
    <input
      id="email"
      type="email"
      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
      placeholder="you@example.com"
    />
    {errors.email && <p className="mt-1 text-sm text-danger">{errors.email.message}</p>}
  </div>

  <button
    type="submit"
    className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  >
    Sign In
  </button>
</form>
```

### Complex Multi-Section Form
```tsx
<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
  {error && (
    <div className="bg-danger-light border border-danger text-danger-dark px-4 py-3 rounded-lg">
      {error}
    </div>
  )}

  <div className="bg-card shadow rounded-lg p-6">
    <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="symbol" className="block text-sm font-medium text-foreground mb-2">
          Symbol <span className="text-danger">*</span>
        </label>
        <input
          id="symbol"
          type="text"
          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground transition-colors"
        />
        {errors.symbol && <p className="mt-1 text-sm text-danger">{errors.symbol.message}</p>}
      </div>
      {/* More fields */}
    </div>
  </div>

  <div className="flex justify-end space-x-4">
    <button
      type="button"
      className="px-6 py-2 border border-border rounded-lg hover:bg-muted text-foreground transition-colors"
    >
      Cancel
    </button>
    <button
      type="submit"
      className="px-6 py-2 bg-primary hover:bg-primary-hover text-primary-foreground font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Save
    </button>
  </div>
</form>
```

## Implementation Checklist

When creating or updating a form:

- [ ] Use appropriate form spacing (`space-y-6` or `space-y-8`)
- [ ] Implement form-level error display with semantic colors
- [ ] Use consistent label styling with `text-foreground`
- [ ] Apply standard input styling with focus states
- [ ] Use semantic colors for all elements (no hardcoded colors)
- [ ] Add field-level error messages below inputs
- [ ] Include help text where appropriate
- [ ] Style buttons consistently (primary/secondary)
- [ ] Ensure responsive behavior with grid layouts
- [ ] Add loading/disabled states
- [ ] Test in both light and dark themes
- [ ] Verify keyboard navigation and accessibility

## Related Documentation

- [THEME_GUIDE.md](./THEME_GUIDE.md) - Complete theme color reference
- [RESPONSIVE_DESIGN.md](./RESPONSIVE_DESIGN.md) - Responsive design patterns
- [app/globals.css](./app/globals.css) - CSS variables and theme definitions

---

**Last Updated:** October 30, 2025  
**Status:** Active - Use this guide for all form implementations

