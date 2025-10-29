# Responsive Design Guide

## Overview

The Trading Journal is designed with a **desktop-first** approach, optimized for screens **1280px and wider**. This document outlines the responsive design strategy and implementation details.

## Design Philosophy

### Desktop-First Approach
- Primary target: Desktop browsers at 1280px minimum width
- All layouts optimized for large screens first
- Responsive breakpoints used for progressive enhancement
- Maximum content width capped for readability

### PRD Requirements (FR-25)
> "The system must have a responsive layout optimized for desktop browsers (minimum 1280px width recommended)."

## Tailwind Breakpoints

We use Tailwind CSS's default breakpoints:

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm:` | 640px | Small tablets and larger phones |
| `md:` | 768px | Tablets in portrait |
| `lg:` | 1024px | Tablets in landscape, small desktops |
| `xl:` | 1280px | Standard desktops (our minimum) |
| `2xl:` | 1536px | Large desktops and monitors |

## Layout Patterns

### 1. Maximum Width Containers

All pages use a **max-w-7xl** (1280px) container for content:

```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

**Why max-w-7xl?**
- 7xl = 80rem = 1280px at default font size
- Matches our minimum target width perfectly
- Provides comfortable reading width
- Centers content on larger screens
- Consistent spacing with responsive padding

### 2. Responsive Padding

```tsx
px-4      // 1rem on mobile
sm:px-6   // 1.5rem on small screens (640px+)
lg:px-8   // 2rem on large screens (1024px+)
```

### 3. Grid Layouts

**Dashboard Metrics (4 columns on desktop):**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

**Trade Filters (4 columns on desktop):**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

**Forms (2 columns on desktop):**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
```

## Component Responsive Patterns

### Navigation

```tsx
// Desktop: Full horizontal navigation
<div className="hidden md:flex items-center space-x-1">
  {/* Desktop links */}
</div>

// Mobile: Hamburger menu (hidden by default)
<div className="md:hidden">
  {/* Mobile menu button */}
</div>
```

### Cards and Data Tables

```tsx
// Responsive cards that stack on mobile, flow horizontally on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
```

### Typography

```tsx
// Responsive heading sizes
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">

// Responsive body text
<p className="text-sm md:text-base lg:text-lg">
```

## Page-by-Page Implementation

### Landing Page (`app/page.tsx`)
- ✅ Centered login/register card
- ✅ Max width: 448px (max-w-md)
- ✅ Full screen height on all sizes
- ✅ Theme toggle positioned absolute

### Dashboard (`app/dashboard/page.tsx`)
- ✅ Max-w-7xl container
- ✅ Responsive padding (px-4 sm:px-6 lg:px-8)
- ✅ Page header with proper spacing
- ✅ Metrics grid: 1 col → 2 cols → 4 cols
- ✅ Charts adapt to container width

### Trades Page (`app/trades/page.tsx`)
- ✅ Max-w-7xl container
- ✅ Filter grid: 1 col → 2 cols → 4 cols
- ✅ Stats summary: 1 col → 2 cols → 4 cols
- ✅ Trade list with responsive cards/table
- ✅ Search bar full width with responsive controls

### Trade Detail Pages
- ✅ Max-w-7xl container
- ✅ Form grids: 1 col → 2 cols on large screens
- ✅ Responsive field layouts
- ✅ Image galleries adapt to screen size

### Navigation Component
- ✅ Sticky top navigation (64px height)
- ✅ Max-w-7xl inner container
- ✅ Hidden mobile menu (expandable)
- ✅ Responsive user info display
- ✅ Theme toggle always visible

## Desktop Optimization (1280px+)

### At 1280px Width

**Layout:**
- Navigation: Full horizontal layout with all links visible
- Content: Max 1280px wide, centered
- Sidebars: N/A (single column app)
- Grids: 4 columns for metrics/filters

**Typography:**
- Headers: Large, bold, readable
- Body: 16px base font size
- Tables: Tabular numbers enabled for alignment

**Spacing:**
- Page padding: 2rem (32px) on each side
- Card spacing: 1rem (16px) gap
- Section spacing: 2rem (32px) between sections

**Charts:**
- Full container width
- Responsive height based on content
- Legend positioned for readability
- Tooltips optimized for desktop interaction

## Responsive Utilities

### Width Constraints

```tsx
// Maximum width utilities used:
max-w-7xl    // 1280px - Main content
max-w-5xl    // 1024px - Narrower content
max-w-3xl    // 768px - Forms, articles
max-w-md     // 448px - Login card
```

### Visibility Classes

```tsx
hidden sm:block    // Hide on mobile, show on small+
md:hidden          // Hide on medium+, show on mobile
lg:flex            // Flex layout only on large screens
```

### Responsive Spacing

```tsx
// Padding
p-4 lg:p-8         // 1rem → 2rem

// Margins
mb-4 lg:mb-8       // 1rem → 2rem

// Gaps
gap-4 lg:gap-6     // 1rem → 1.5rem
```

## Browser Support

### Minimum Requirements
- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid support required
- Flexbox support required
- CSS Custom Properties (variables) required

### Tested At
- ✅ 1280px (minimum recommended)
- ✅ 1440px (common laptop)
- ✅ 1920px (full HD monitor)
- ✅ 2560px (2K monitor)

## Performance Considerations

### Image Optimization
- Screenshots: Max width 1920px
- Thumbnails: 400px for previews
- Lazy loading for off-screen images

### Layout Shifts
- Fixed navigation height (64px)
- Skeleton loaders prevent layout shift
- Reserved space for images

## Accessibility

### Desktop-Specific
- Keyboard navigation fully supported
- Focus indicators clear and visible
- Proper heading hierarchy
- ARIA labels for interactive elements

### Screen Readers
- Semantic HTML structure
- Descriptive link text
- Form labels properly associated
- Status messages announced

## Best Practices

### Do's
✅ Use max-w-7xl for main content
✅ Use responsive grid layouts
✅ Test at 1280px, 1440px, 1920px
✅ Use semantic HTML
✅ Provide hover states for desktop
✅ Use focus-visible for keyboard nav
✅ Enable tabular numbers for financial data

### Don'ts
❌ Don't use fixed pixel widths (except max-width)
❌ Don't hide critical content on desktop
❌ Don't make buttons/targets too small
❌ Don't use hover-only interactions
❌ Don't break at 1280px minimum width
❌ Don't exceed 7xl (1280px) for text content

## Testing Checklist

- [ ] All pages render correctly at 1280px
- [ ] Navigation is fully functional at 1280px+
- [ ] Grids display proper column counts
- [ ] No horizontal scrollbars at 1280px+
- [ ] Charts are readable and properly sized
- [ ] Forms are well-laid out
- [ ] Tables display all columns
- [ ] Images don't exceed containers
- [ ] Text is readable (not too wide)
- [ ] Spacing is consistent

## Maintenance

When adding new components or pages:

1. **Start with desktop design** (1280px+)
2. **Use max-w-7xl** for content containers
3. **Apply responsive padding** (px-4 sm:px-6 lg:px-8)
4. **Use grid layouts** for multi-column content
5. **Test at 1280px** before considering smaller screens
6. **Follow established patterns** from existing pages
7. **Use semantic theme colors** (no hardcoded values)
8. **Enable tabular numbers** for financial data

## Resources

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Tailwind Breakpoints](https://tailwindcss.com/docs/screens)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Desktop-First Design](https://www.uxpin.com/studio/blog/desktop-first-mobile-first/)

---

**Last Updated:** October 29, 2025  
**Design Target:** Desktop 1280px+  
**Framework:** Tailwind CSS v4

