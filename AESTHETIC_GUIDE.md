# Aesthetic & Spacing Guide

This document outlines the visual design standards, spacing system, and aesthetic principles for the Trading Journal application.

## Design Philosophy

**Clean • Minimal • Professional • Spacious**

The Trading Journal embraces a minimalist design philosophy with:
- Generous white space for breathing room
- Clear visual hierarchy through typography
- Subtle, professional color palette
- Focused, distraction-free interface
- Data-first presentation

## Spacing System

### Vertical Spacing

We use a consistent spacing scale based on Tailwind's spacing utilities:

| Purpose | Class | Pixels | Use Case |
|---------|-------|--------|----------|
| Micro spacing | `space-y-1` | 4px | Grouped text (heading + subtitle) |
| Small spacing | `space-y-2` | 8px | Related elements within a component |
| Medium spacing | `space-y-4` | 16px | Form fields, list items |
| Large spacing | `space-y-6` | 24px | Sections within a card |
| XL spacing | `space-y-8` | 32px | Major sections |
| 2XL spacing | `space-y-12` | 48px | Page sections |
| 3XL spacing | `space-y-16` | 64px | Major page divisions |

### Page Layout Spacing

**Standard Page Container:**
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  {/* Content */}
</div>
```

**Page Header Spacing:**
```tsx
<div className="mb-12">
  <div className="space-y-2">
    <h1 className="text-4xl font-bold text-foreground tracking-tight">Title</h1>
    <p className="text-base text-muted-foreground">Subtitle</p>
  </div>
</div>
```

**Section Spacing:**
- Between major page sections: `space-y-12` (48px)
- Between subsections: `space-y-8` (32px)
- Within cards: `space-y-6` (24px)

### Padding Standards

**Cards:**
- Small cards: `p-6` (24px)
- Medium cards: `p-8` (32px)
- Form cards: `p-8` (32px)

**Page Containers:**
- Horizontal: `px-4 sm:px-6 lg:px-8` (responsive)
- Vertical: `py-12` (48px) for main content areas

## Typography Scale

### Headings

```tsx
// Page titles
<h1 className="text-4xl font-bold text-foreground tracking-tight">

// Section titles  
<h2 className="text-2xl font-semibold text-foreground">

// Subsection titles
<h3 className="text-xl font-semibold text-foreground">

// Card titles
<h4 className="text-lg font-medium text-foreground">
```

### Body Text

```tsx
// Standard body
<p className="text-base text-foreground">

// Large body
<p className="text-lg text-foreground">

// Small body
<p className="text-sm text-foreground">

// Muted text
<p className="text-sm text-muted-foreground">

// Extra small / captions
<p className="text-xs text-muted-foreground">
```

### Text Hierarchy Pattern

Use `space-y-1` or `space-y-2` for heading + subtitle combinations:

```tsx
<div className="space-y-1">
  <h2 className="text-2xl font-semibold text-foreground">Main Title</h2>
  <p className="text-base text-muted-foreground">Supporting description</p>
</div>
```

## Border Radius

Use rounded corners consistently:

| Element | Class | Pixels | Use Case |
|---------|-------|--------|----------|
| Small radius | `rounded-lg` | 8px | Buttons, inputs, small cards |
| Medium radius | `rounded-xl` | 12px | Cards, containers |
| Large radius | `rounded-2xl` | 16px | Feature cards, modals |

**Standard card:**
```tsx
<div className="bg-card rounded-xl border border-border shadow-sm p-8">
```

## Shadows

Use subtle shadows for depth:

```tsx
// Subtle elevation
className="shadow-sm"

// Card elevation  
className="shadow-xl"

// Elevated modals
className="shadow-2xl"
```

## Visual Patterns

### Page Header Pattern

```tsx
<div className="bg-muted/30 border-b border-border">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="space-y-1">
      <h1 className="text-4xl font-bold text-foreground tracking-tight">
        Page Title
      </h1>
      <p className="text-base text-muted-foreground">
        Page description
      </p>
    </div>
  </div>
</div>
```

### Section Header Pattern

```tsx
<div className="mb-8">
  <div className="space-y-1">
    <h2 className="text-2xl font-bold text-foreground">Section Title</h2>
    <p className="text-base text-muted-foreground">Section description</p>
  </div>
</div>
```

### Card Pattern

```tsx
<div className="bg-card rounded-xl shadow-sm border border-border p-8">
  <div className="mb-6">
    <div className="space-y-1">
      <h3 className="text-xl font-semibold text-foreground">Card Title</h3>
      <p className="text-sm text-muted-foreground">Card description</p>
    </div>
  </div>
  {/* Card content */}
</div>
```

### Interactive Element Pattern

```tsx
<Link
  href="/path"
  className="flex items-center gap-3 p-5 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors border border-transparent hover:border-blue-200"
>
  <span>Icon</span>
  <div>
    <p className="font-medium text-foreground">Action Title</p>
    <p className="text-sm text-muted-foreground">Action description</p>
  </div>
</Link>
```

## Layout Patterns

### Landing Page

```tsx
<div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
  <div className="max-w-md w-full space-y-12">
    {/* Generous spacing between sections */}
  </div>
</div>
```

### Dashboard/Content Pages

```tsx
<div className="min-h-screen bg-background">
  {/* Page Header */}
  <div className="bg-muted/30 border-b border-border">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header content */}
    </div>
  </div>

  {/* Main Content */}
  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="space-y-12">
      {/* Sections with generous spacing */}
    </div>
  </main>

  {/* Footer */}
  <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-border mt-20">
    {/* Footer content */}
  </footer>
</div>
```

### Grid Layouts

```tsx
// Form grids
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

// Card grids  
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

// Action cards
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
```

## Button Spacing

```tsx
// Single button
<button className="px-4 py-2 rounded-lg">

// Larger button  
<button className="px-6 py-3 rounded-lg">

// Button group with gap
<div className="flex gap-2">
  <button>Cancel</button>
  <button>Submit</button>
</div>

// Button group with larger gap
<div className="flex gap-4">
```

## Color Usage

### Background Layers

1. **Base**: `bg-background` - Page background
2. **Elevated**: `bg-card` - Cards and panels
3. **Muted**: `bg-muted/30` - Page headers, subtle backgrounds
4. **Interactive**: `hover:bg-muted` - Hover states

### Text Hierarchy

1. **Primary**: `text-foreground` - Main content
2. **Secondary**: `text-muted-foreground` - Supporting text
3. **Interactive**: `text-primary` - Links and actions
4. **Status**: `profit`, `loss`, `breakeven` - Financial indicators

## Transition Standards

Always include smooth transitions for interactive elements:

```tsx
className="transition-colors" // Standard transitions
className="transition-all"    // When animating multiple properties
```

**Duration:**
- Default: 150ms (Tailwind default)
- No need to specify unless using custom durations

## White Space Principles

### Do's ✅

- Use generous margins between sections (`space-y-12`)
- Give headings breathing room with margin-bottom (`mb-6`, `mb-8`)
- Use padding inside cards for comfort (`p-6`, `p-8`)
- Group related elements with less space (`space-y-1`, `space-y-2`)
- Create clear visual hierarchies with spacing

### Don'ts ❌

- Don't cram elements together without spacing
- Don't use inconsistent spacing within the same context
- Don't add unnecessary decorative elements
- Don't over-complicate with too many colors
- Don't use jarring contrast or heavy borders

## Responsive Breakpoints

| Breakpoint | Min Width | Typical Use |
|------------|-----------|-------------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large displays |

**Responsive spacing example:**
```tsx
<div className="px-4 sm:px-6 lg:px-8">
<div className="py-8 md:py-12">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
```

## Accessibility Integration

All aesthetic choices maintain accessibility:
- Color contrast meets WCAG AA
- Focus states are clearly visible
- Touch targets are adequately sized (min 44x44px)
- Spacing aids readability and scannability

## Examples from the Codebase

### Landing Page Card
```tsx
<div className="bg-card shadow-2xl rounded-2xl border border-border overflow-hidden">
  <div className="p-8">
    {/* Form content with space-y-6 */}
  </div>
</div>
```

### Dashboard Section
```tsx
<section>
  <div className="mb-8">
    <div className="space-y-1">
      <h2 className="text-2xl font-bold text-foreground">Performance Analysis</h2>
      <p className="text-base text-muted-foreground">Visual breakdown</p>
    </div>
  </div>
  {/* Chart components */}
</section>
```

### Quick Action Cards
```tsx
<Link
  href="/trades/new"
  className="flex items-center gap-3 p-5 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors border border-transparent hover:border-blue-200"
>
  <span className="text-2xl">📝</span>
  <div>
    <p className="font-medium text-foreground">Log New Trade</p>
    <p className="text-sm text-muted-foreground">Record your latest trade</p>
  </div>
</Link>
```

## Maintenance Guidelines

When adding new components:

1. **Start with spacing**: Use `space-y-12` for page sections, `space-y-6` for card interiors
2. **Follow typography patterns**: Use established heading sizes and weights
3. **Use semantic colors**: Never hardcode colors, always use theme variables
4. **Add transitions**: Interactive elements should have smooth transitions
5. **Test both themes**: Verify appearance in light and dark modes
6. **Check responsive behavior**: Test on mobile, tablet, and desktop
7. **Maintain consistency**: Match patterns from existing components

---

**Last Updated**: October 30, 2025  
**Design System Version**: 1.0  
**Status**: Active

