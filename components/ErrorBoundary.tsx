import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-black/20 rounded-lg border border-gold-900/30">
          <h1 className="font-serif text-2xl text-gold-200 mb-4">A mysterious force has disrupted the archive.</h1>
          <p className="text-stone-400 mb-6">An unexpected error occurred. Please refresh the page to continue your journey.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gold-800 text-gold-100 rounded-md border border-gold-700 font-serif tracking-wider text-sm transition-all duration-300 ease-in-out hover:bg-gold-700 hover:shadow-lg hover:shadow-gold-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-void focus:ring-gold-500"
          >
            Refresh
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
