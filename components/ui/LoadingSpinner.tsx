interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  };

  return (
    <div
      className={`animate-spin rounded-full border-primary border-t-transparent ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 shadow-lg flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-foreground font-medium">{message}</p>
      </div>
    </div>
  );
}

interface LoadingCardProps {
  rows?: number;
  className?: string;
}

export function LoadingCard({ rows = 3, className = '' }: LoadingCardProps) {
  return (
    <div className={`bg-card rounded-lg border border-border p-6 ${className}`}>
      <div className="space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div
            key={i}
            className="h-4 bg-muted rounded animate-pulse"
            style={{ width: `${100 - i * 10}%` }}
          />
        ))}
      </div>
    </div>
  );
}

interface LoadingTableProps {
  columns?: number;
  rows?: number;
}

export function LoadingTable({ columns = 5, rows = 5 }: LoadingTableProps) {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              {[...Array(columns)].map((_, i) => (
                <th key={i} className="px-6 py-3">
                  <div className="h-4 bg-muted-foreground/20 rounded animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[...Array(rows)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(columns)].map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <div
                      className="h-4 bg-muted rounded animate-pulse"
                      style={{ width: `${70 + Math.random() * 30}%` }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface ButtonLoadingProps {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
}

export function ButtonLoading({
  children,
  isLoading = false,
  loadingText,
  disabled = false,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
}: ButtonLoadingProps) {
  const variantClasses = {
    primary: 'bg-primary hover:bg-primary-hover text-primary-foreground',
    secondary: 'border border-border hover:bg-muted text-foreground',
    danger: 'bg-danger hover:bg-danger-dark text-danger-foreground',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`inline-flex items-center justify-center px-4 py-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
    >
      {isLoading && (
        <LoadingSpinner size="sm" className="mr-2" />
      )}
      {isLoading ? loadingText || children : children}
    </button>
  );
}

