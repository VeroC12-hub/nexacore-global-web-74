import React, { Component, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isChunkError: boolean;
}

// Detects Vite/Rollup chunk-load failures that happen when a new Vercel
// deployment replaces old asset hashes and the user still has the old
// index.html cached. These errors look like:
//   "Failed to fetch dynamically imported module: .../assets/Foo-ABC123.js"
//   "Expected a JavaScript-or-Wasm module script but the server responded
//    with a MIME type of text/html"
function isChunkLoadError(error: Error): boolean {
  const msg = error?.message || '';
  return (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('ChunkLoadError') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('MIME type of "text/html"')
  );
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, isChunkError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const chunkErr = isChunkLoadError(error);
    // If it's a chunk error, trigger a reload immediately via side-effect
    // in componentDidCatch to avoid blocking the render cycle here.
    return { hasError: true, error, isChunkError: chunkErr };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (isChunkLoadError(error)) {
      // Hard reload fetches fresh index.html with updated chunk URLs.
      // Guard against infinite reload loops: only reload once per session
      // for this error type using sessionStorage.
      const reloadKey = 'chunk_error_reload';
      const alreadyReloaded = sessionStorage.getItem(reloadKey);
      if (!alreadyReloaded) {
        sessionStorage.setItem(reloadKey, '1');
        window.location.reload();
        return;
      }
      // If we already tried a reload and still failing, fall through to
      // show the error UI so the user isn't stuck in a reload loop.
    }
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReset = () => {
    sessionStorage.removeItem('chunk_error_reload');
    this.setState({ hasError: false, error: null, isChunkError: false });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // While reload is in progress (isChunkError && not yet reloaded twice)
      // render nothing — the page is about to reload anyway.
      if (this.state.isChunkError) {
        return (
          <div className="flex items-center justify-center p-8">
            <div className="text-center text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-sm">Loading updated version...</p>
            </div>
          </div>
        );
      }

      return (
        <div className="p-6 max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-lg font-semibold">
              Something went wrong
            </AlertTitle>
            <AlertDescription className="mt-3">
              <p className="mb-4 text-sm">
                {this.state.error?.message || 'An unexpected error occurred. Please try refreshing the page.'}
              </p>
              <Button
                onClick={this.handleReset}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}
