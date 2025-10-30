# Error Handling Guide

This guide documents the error handling patterns and user-friendly error messages used throughout the Trading Journal application.

## Core Principles

1. **Be Specific**: Tell users exactly what went wrong
2. **Be Actionable**: Provide clear next steps or retry options
3. **Be Empathetic**: Use friendly, non-technical language
4. **Be Consistent**: Use the same patterns across all components

## Components

### ErrorMessage Component

The `ErrorMessage` component is a reusable component for displaying errors with optional retry actions.

**Location**: `components/ui/ErrorMessage.tsx`

**Props**:
- `title` (optional): Error title (default: "Error")
- `message` (required): Detailed error message
- `type` (optional): "error" | "warning" | "info" (default: "error")
- `onRetry` (optional): Callback function for retry button
- `retryText` (optional): Text for retry button (default: "Try Again")
- `dismissible` (optional): Whether error can be dismissed
- `onDismiss` (optional): Callback for dismiss action

**Example Usage**:
```tsx
<ErrorMessage
  title="Failed to Load Trades"
  message="Unable to connect to the server. Please check your internet connection."
  onRetry={fetchTrades}
  retryText="Reload Trades"
/>
```

### EmptyState Component

The `EmptyState` component is used when there's no data to display.

**Location**: `components/ui/ErrorMessage.tsx`

**Props**:
- `icon` (optional): "search" | "data" | "error"
- `title` (required): Empty state title
- `message` (required): Helpful message explaining the situation
- `action` (optional): Object with `label` and `onClick` for a CTA button

**Example Usage**:
```tsx
<EmptyState
  icon="data"
  title="No Trade Data"
  message="Start logging trades to see your equity curve."
  action={{
    label: 'Record First Trade',
    onClick: () => router.push('/trades/new'),
  }}
/>
```

### ConfirmDialog Component

The `ConfirmDialog` component replaces browser `confirm()` with a better UI.

**Location**: `components/ui/ConfirmDialog.tsx`

**Props**:
- `isOpen` (required): Whether dialog is visible
- `title` (required): Dialog title
- `message` (required): Confirmation message
- `confirmLabel` (optional): Text for confirm button (default: "Confirm")
- `cancelLabel` (optional): Text for cancel button (default: "Cancel")
- `variant` (optional): "danger" | "warning" | "primary" (default: "primary")
- `onConfirm` (required): Callback when user confirms
- `onCancel` (required): Callback when user cancels
- `isLoading` (optional): Show loading state on confirm button

**Example Usage**:
```tsx
<ConfirmDialog
  isOpen={showDialog}
  title="Delete Trade"
  message="Are you sure you want to delete this trade? This action cannot be undone."
  confirmLabel="Delete Trade"
  variant="danger"
  onConfirm={handleDelete}
  onCancel={() => setShowDialog(false)}
  isLoading={isDeleting}
/>
```

## Error Message Patterns

### HTTP Status Code Mapping

**401 Unauthorized**:
- Message: "Your session has expired. Please log in again."
- Use when: User's JWT token is invalid or expired

**400 Bad Request**:
- Message: "Invalid [entity] data. Please check all required fields and try again."
- Use when: Client sent invalid data

**404 Not Found**:
- Message: "[Entity] not found. It may have been deleted."
- Use when: Requested resource doesn't exist

**409 Conflict**:
- Message: "An account with this email already exists. Please log in or use a different email."
- Use when: Unique constraint violation (e.g., duplicate email)

**500 Server Error**:
- Message: "Unable to [action] due to a server error. Please try again in a moment."
- Use when: Server-side error occurred

**Network Error (Failed to fetch)**:
- Message: "Unable to connect to the server. Please check your internet connection and try again."
- Use when: Network request fails (no response from server)

### Component-Specific Patterns

#### Authentication Forms

**Login - Invalid Credentials**:
```
Invalid email or password. Please check your credentials and try again.
```

**Register - Email Already Exists**:
```
An account with this email already exists. Please log in or use a different email address.
```

#### Trade Forms

**Create/Edit Trade - Validation Error**:
```
Invalid trade data. Please check all required fields and try again.
```

**Edit Trade - Not Found**:
```
Trade not found. It may have been deleted.
```

#### Data Loading

**Trade List - Failed to Load**:
```
Failed to load trades. Please try again.
```

**Charts - Failed to Load**:
```
Unable to load [chart name] (Error [status code])
```

**No Trades with Filters**:
```
No trades match your current filters. Try adjusting your date range, asset type, or other criteria.
```

**No Trades at All**:
```
You haven't recorded any trades yet. Start building your trading journal by recording your first trade.
```

## Implementation Checklist

When implementing error handling in a new component:

- [ ] Import ErrorMessage, EmptyState, or ConfirmDialog as needed
- [ ] Add state for error message: `const [error, setError] = useState<string>('')`
- [ ] Wrap fetch calls in try-catch blocks
- [ ] Check HTTP status codes and provide specific error messages
- [ ] Handle network errors (TypeError: 'Failed to fetch')
- [ ] Provide retry functionality where appropriate
- [ ] Replace browser `alert()` and `confirm()` with ConfirmDialog
- [ ] Use EmptyState for "no data" scenarios
- [ ] Test error states in both light and dark themes
- [ ] Ensure error messages are accessible (proper ARIA attributes)

## Accessibility

All error components include:
- `role="alert"` on error containers
- `aria-live="polite"` for screen reader announcements
- `aria-modal="true"` on dialogs
- `aria-labelledby` and `aria-describedby` for dialog content
- Keyboard navigation support (ESC to close, focus trapping in dialogs)

## Best Practices

1. **Always log errors to console**: Include `console.error()` for debugging
2. **Never expose technical details**: Don't show stack traces or database errors to users
3. **Provide context**: Tell users what they were trying to do
4. **Suggest solutions**: Give users actionable next steps
5. **Be consistent**: Use the same wording for the same errors across the app
6. **Test error states**: Manually test all error scenarios during development
7. **Consider edge cases**: Handle network timeouts, CORS errors, etc.

## Testing Error States

To test error handling during development:

1. **Network Errors**: Disconnect from internet or block API domain
2. **401 Errors**: Clear cookies/localStorage to invalidate session
3. **500 Errors**: Temporarily break server code or database connection
4. **Validation Errors**: Submit forms with invalid data
5. **Not Found**: Request non-existent resource IDs
6. **Slow Connections**: Use browser dev tools to throttle network speed

## Future Improvements

Potential enhancements to error handling:

- [ ] Global error boundary for catching React errors
- [ ] Error logging service integration (Sentry, LogRocket, etc.)
- [ ] Offline detection and queue for failed requests
- [ ] Automatic retry with exponential backoff
- [ ] Toast notifications for non-critical errors
- [ ] Error reporting feedback form for users
- [ ] Analytics tracking for error frequency

---

**Last Updated**: October 30, 2025  
**Maintainer**: Development Team

