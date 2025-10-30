interface ErrorMessageProps {
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  onRetry?: () => void;
  retryText?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorMessage({
  title = 'Error',
  message,
  type = 'error',
  onRetry,
  retryText = 'Try Again',
  dismissible = false,
  onDismiss,
  className = '',
}: ErrorMessageProps) {
  const typeStyles = {
    error: {
      container: 'loss-bg border-danger',
      icon: 'loss',
      title: 'loss',
    },
    warning: {
      container: 'bg-warning-light border-warning',
      icon: 'text-warning',
      title: 'text-warning-dark',
    },
    info: {
      container: 'bg-info-light border-info',
      icon: 'text-info',
      title: 'text-info-dark',
    },
  };

  const styles = typeStyles[type];

  const ErrorIcon = () => (
    <svg
      className={`w-5 h-5 ${styles.icon} flex-shrink-0`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  const WarningIcon = () => (
    <svg
      className={`w-5 h-5 ${styles.icon} flex-shrink-0`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );

  const InfoIcon = () => (
    <svg
      className={`w-5 h-5 ${styles.icon} flex-shrink-0`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <WarningIcon />;
      case 'info':
        return <InfoIcon />;
      default:
        return <ErrorIcon />;
    }
  };

  return (
    <div
      className={`rounded-lg border ${styles.container} p-4 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {getIcon()}
        
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold ${styles.title} mb-1`}>{title}</h3>
          <p className="text-sm text-foreground">{message}</p>

          {(onRetry || dismissible) && (
            <div className="mt-3 flex items-center gap-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-background hover:bg-muted border border-border rounded-md transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  {retryText}
                </button>
              )}
              {dismissible && onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>

        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon?: 'search' | 'data' | 'error';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon = 'data',
  title,
  message,
  action,
  className = '',
}: EmptyStateProps) {
  const icons = {
    search: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
    data: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
    ),
    error: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      <div className="text-muted-foreground mb-4">{icons[icon]}</div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground font-medium rounded-lg transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

