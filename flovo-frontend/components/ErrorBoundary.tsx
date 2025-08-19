"use client";

import React from 'react';
import { IconAlertTriangle, IconRefresh, IconHome } from '@tabler/icons-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error reporting service
      console.error('Error details:', { error, errorInfo });
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <this.props.fallback error={this.state.error!} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error!} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card text-center">
          <div className="card-body">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-[var(--error-bg)] rounded-full flex items-center justify-center">
                <IconAlertTriangle size={32} className="text-[var(--status-error)]" />
              </div>
            </div>
            
            <h1 className="text-heading text-[var(--font-size-2xl)] mb-2">
              Oops! Something went wrong
            </h1>
            
            <p className="text-body text-[var(--brand-text-secondary)] mb-6">
              We encountered an unexpected error. Don&apos;t worry, our team has been notified and is working to fix it.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-[var(--font-size-sm)] text-[var(--brand-text-secondary)] mb-2">
                  Error Details (Development)
                </summary>
                <pre className="bg-[var(--brand-bg)] p-3 rounded-[var(--radius-sm)] text-[var(--font-size-xs)] overflow-auto">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={resetError}
                className="btn btn-primary flex-1"
              >
                <IconRefresh size={16} />
                Try Again
              </button>
              
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="btn btn-secondary flex-1"
              >
                <IconHome size={16} />
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ErrorBoundary, DefaultErrorFallback };
export type { ErrorFallbackProps };
