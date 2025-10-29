# Trading Journal Theme Guide

## Overview

The Trading Journal application uses a professional financial aesthetic built on **Tailwind CSS v4**. The theme is designed to provide excellent readability for numerical data, clear visual hierarchy, and appropriate color coding for financial contexts.

## Color Palette

### Brand Colors

**Primary (Professional Blue)**
- Light theme: `#1e40af` (Deep blue)
- Dark theme: `#3b82f6` (Lighter blue)
- Usage: Primary buttons, links, key actions

**Secondary (Slate)**
- Light theme: `#475569`
- Dark theme: `#64748b`
- Usage: Secondary buttons, subtle emphasis

### Financial Status Colors

**Success/Profit (Green)**
- Main: `#059669` (light) / `#10b981` (dark)
- Light variant: `#d1fae5` (light) / `#064e3b` (dark)
- Dark variant: `#047857` (light) / `#34d399` (dark)
- Usage: Winning trades, positive P&L, profit indicators

**Danger/Loss (Red)**
- Main: `#dc2626` (light) / `#ef4444` (dark)
- Light variant: `#fee2e2` (light) / `#7f1d1d` (dark)
- Dark variant: `#b91c1c` (light) / `#f87171` (dark)
- Usage: Losing trades, negative P&L, loss indicators

**Warning (Amber)**
- Main: `#f59e0b` (light) / `#fbbf24` (dark)
- Usage: Alerts, caution states, breakeven trades

**Info (Sky Blue)**
- Main: `#0ea5e9` (light) / `#38bdf8` (dark)
- Usage: Information messages, neutral indicators

### Base Colors

- **Background**: White (`#ffffff`) in light mode, Dark slate (`#020617`) in dark mode
- **Foreground**: Dark slate (`#0f172a`) in light mode, Light slate (`#f1f5f9`) in dark mode
- **Muted**: Very light gray backgrounds for secondary content
- **Border**: Subtle gray borders (`#e2e8f0` / `#1e293b`)

### Chart Colors

Eight distinct colors for data visualization:
1. `--chart-1`: Blue (`#3b82f6`)
2. `--chart-2`: Purple (`#8b5cf6`)
3. `--chart-3`: Green (`#10b981`)
4. `--chart-4`: Amber (`#f59e0b`)
5. `--chart-5`: Red (`#ef4444`)
6. `--chart-6`: Cyan (`#06b6d4`)
7. `--chart-7`: Pink (`#ec4899`)
8. `--chart-8`: Lime (`#84cc16`)

## Typography

### Font Families

- **Sans-serif**: System font stack for optimal performance
  ```
  system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif
  ```
- **Monospace**: Geist Mono (for code and technical data)

### Font Features

- **Tabular Numbers**: Enabled by default on `<body>` for consistent financial data alignment
- Use `.tabular-nums` class to explicitly enable tabular numerals on specific elements

## Using Theme Colors

### In Tailwind Classes

```jsx
// Background colors
<div className="bg-background text-foreground">
<div className="bg-card text-card-foreground">
<div className="bg-muted text-muted-foreground">

// Primary/Secondary actions
<button className="bg-primary text-primary-foreground hover:bg-primary-hover">
<button className="bg-secondary text-secondary-foreground hover:bg-secondary-hover">

// Financial status
<div className="text-success">+$1,234.56</div>
<div className="text-danger">-$567.89</div>
<div className="bg-success-light text-success-dark">Profitable</div>
<div className="bg-danger-light text-danger-dark">Loss</div>

// Chart colors
<div className="bg-chart-1">...</div>
```

### Utility Classes for Financial Data

#### Text Colors
```jsx
<span className="profit">+$1,234.56</span>
<span className="loss">-$567.89</span>
<span className="breakeven">$0.00</span>
```

#### Background Colors
```jsx
<div className="profit-bg">Winning Trade</div>
<div className="loss-bg">Losing Trade</div>
```

#### Tabular Numbers
```jsx
<table className="tabular-nums">
  <!-- All numbers will be monospaced for perfect alignment -->
</table>
```

### Direct CSS Variables

```css
.custom-element {
  background-color: var(--background);
  color: var(--foreground);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
}
```

## Shadows

Five shadow levels for depth hierarchy:
- `shadow-sm`: Subtle shadow for minimal elevation
- `shadow`: Default shadow for cards
- `shadow-md`: Medium shadow for elevated elements
- `shadow-lg`: Large shadow for modals/overlays
- `shadow-xl`: Extra large shadow for prominent elements

```jsx
<div className="shadow-md">Elevated Card</div>
```

## Border Radius

Five radius sizes for consistent rounded corners:
- `radius-sm`: `0.25rem` (4px)
- `radius`: `0.5rem` (8px) - Default
- `radius-md`: `0.75rem` (12px)
- `radius-lg`: `1rem` (16px)
- `radius-xl`: `1.5rem` (24px)

## Theme Switching

The application supports both light and dark themes:

- By default, it follows the system preference (`prefers-color-scheme`)
- Future implementation will include manual theme toggle with localStorage persistence
- All color variables automatically switch between light/dark variants

## Best Practices

### Financial Data Display

1. **Always use tabular numbers** for tables and numeric comparisons
2. **Use semantic colors** consistently:
   - Green for profits/wins
   - Red for losses
   - Gray/muted for breakeven or neutral
3. **Provide sufficient contrast** for accessibility (WCAG AA minimum)

### Visual Hierarchy

1. **Primary actions**: Use `bg-primary` with white text
2. **Secondary actions**: Use `bg-secondary` or outlined buttons
3. **Destructive actions**: Use `bg-destructive` with confirmation
4. **Cards**: Use `bg-card` with `shadow-md` for elevation

### Spacing

- Use Tailwind's default spacing scale (4px increments)
- Maintain generous white space for a clean, uncluttered look
- Group related information with consistent padding

### Responsive Design

- Desktop-first approach (minimum 1280px width)
- Use Tailwind responsive prefixes when needed: `md:`, `lg:`, `xl:`

## Examples

### Trade Card
```jsx
<div className="bg-card text-card-foreground rounded-lg shadow-md p-6">
  <div className="flex justify-between items-start">
    <h3 className="text-lg font-semibold">AAPL</h3>
    <span className="profit tabular-nums">+$1,234.56</span>
  </div>
</div>
```

### Metric Display
```jsx
<div className="bg-muted rounded-md p-4">
  <p className="text-muted-foreground text-sm">Total P&L</p>
  <p className="text-2xl font-bold profit tabular-nums">
    +$12,345.67
  </p>
</div>
```

### Button Variants
```jsx
{/* Primary */}
<button className="bg-primary text-primary-foreground hover:bg-primary-hover px-4 py-2 rounded-md">
  Save Trade
</button>

{/* Secondary */}
<button className="bg-secondary text-secondary-foreground hover:bg-secondary-hover px-4 py-2 rounded-md">
  Cancel
</button>

{/* Destructive */}
<button className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-md">
  Delete Trade
</button>
```

## Color Accessibility

All color combinations meet WCAG 2.1 Level AA contrast requirements:
- Normal text: minimum 4.5:1 contrast ratio
- Large text: minimum 3:1 contrast ratio
- UI components: minimum 3:1 contrast ratio

## Design Principles

1. **Professional**: Blue and gray tones convey trust and reliability
2. **Clear**: High contrast and generous spacing ensure readability
3. **Financial**: Green/red color coding aligns with universal financial conventions
4. **Minimal**: Clean design without unnecessary decoration
5. **Data-Focused**: Typography optimized for numerical data display

