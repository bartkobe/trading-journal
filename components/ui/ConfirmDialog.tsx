'use client';

import { useEffect } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isLoading, onCancel]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      button: 'bg-danger hover:bg-danger-dark text-danger-foreground',
      icon: 'text-danger',
    },
    warning: {
      button: 'bg-warning hover:bg-warning-dark text-warning-foreground',
      icon: 'text-warning',
    },
    primary: {
      button: 'bg-primary hover:bg-primary-hover text-primary-foreground',
      icon: 'text-primary',
    },
  };

  const styles = variantStyles[variant];

  const WarningIcon = () => (
    <svg className={`w-6 h-6 ${styles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onCancel();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      <div className="bg-card border border-border rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Icon and Title */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 mt-0.5">
            <WarningIcon />
          </div>
          <div className="flex-1">
            <h3 id="dialog-title" className="text-lg font-semibold text-foreground">
              {title}
            </h3>
          </div>
        </div>

        {/* Message */}
        <p id="dialog-description" className="text-sm text-muted-foreground mb-6 ml-10">
          {message}
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-3 ml-10">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-border hover:bg-muted text-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${styles.button}`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

