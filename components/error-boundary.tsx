'use client';

import { Component, type ReactNode } from 'react';
import { Button } from './ui/button';
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-6 rounded-lg border border-destructive/20 bg-destructive/5 gap-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangleIcon className="w-5 h-5" />
            <span className="font-medium">Something went wrong</span>
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleReset}
            className="gap-2"
          >
            <RefreshCwIcon className="w-4 h-4" />
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier use with hooks
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

// Chat-specific error boundary with better messaging
export function ChatErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center h-full p-8 gap-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangleIcon className="w-6 h-6" />
            <span className="text-lg font-medium">Chat Error</span>
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            There was a problem loading the chat. Please refresh the page to try again.
          </p>
          <Button
            variant="default"
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCwIcon className="w-4 h-4" />
            Refresh page
          </Button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

// Message-specific error boundary
export function MessageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5 text-sm text-muted-foreground">
          Failed to render this message. Please try refreshing.
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

// Artifact-specific error boundary
export function ArtifactErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center h-full p-6 gap-3">
          <AlertTriangleIcon className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            Failed to load artifact. Please try again.
          </p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
