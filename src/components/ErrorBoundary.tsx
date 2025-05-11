import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('=== ERROR BOUNDARY CAUGHT ERROR ===');
    console.error(error);
    console.error(errorInfo);
    this.setState({ 
      error,
      errorInfo
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="error-fallback p-4 bg-red-100 border border-red-300 rounded">
          <h2 className="text-red-800 text-xl font-bold mb-2">Ein Fehler ist aufgetreten</h2>
          <details className="mb-2">
            <summary className="cursor-pointer text-red-700">Fehlerdetails anzeigen</summary>
            <pre className="mt-2 p-2 bg-red-50 text-red-900 overflow-auto text-sm">
              {this.state.error?.toString()}
              <br />
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Seite neu laden
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 