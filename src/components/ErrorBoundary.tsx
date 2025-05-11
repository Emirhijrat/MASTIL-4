import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
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
    // Update state so the next render shows the fallback UI
    return { 
      hasError: true, 
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to console
    console.error('=== ERROR BOUNDARY CAUGHT ERROR ===');
    console.error(error);
    console.error('Component Stack:', errorInfo.componentStack);
    
    // Call optional onError callback
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (callbackError) {
        console.error('Error in onError callback:', callbackError);
      }
    }
    
    // Log to an error reporting service here if available
    // Example: logErrorToService(error, errorInfo);
    
    // Update state with error details
    this.setState({ 
      error,
      errorInfo
    });
  }

  handleReload = (): void => {
    // Attempt to clear the error state first
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    
    // Then reload the page
    window.location.reload();
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default fallback UI
      return (
        <div className="error-fallback p-6 m-4 bg-red-50 border border-red-300 rounded-lg max-w-2xl mx-auto shadow-lg">
          <h2 className="text-red-800 text-2xl font-bold mb-3">Ein Fehler ist aufgetreten</h2>
          <p className="text-red-700 mb-4">
            Wir entschuldigen uns für die Unannehmlichkeiten. Die Anwendung hat einen unerwarteten Fehler festgestellt.
          </p>
          
          <div className="mb-4 p-3 bg-white rounded border border-red-200">
            <p className="text-gray-700 mb-2 text-sm">
              Fehlertyp: <span className="font-mono font-medium">{this.state.error?.name || 'Unbekannter Fehler'}</span>
            </p>
            <p className="text-gray-700 text-sm">
              Fehlermeldung: <span className="font-mono font-medium">{this.state.error?.message || 'Keine Fehlermeldung verfügbar'}</span>
            </p>
          </div>
          
          <details className="mb-4">
            <summary className="cursor-pointer text-blue-700 hover:text-blue-800 focus:outline-none">
              Technische Details anzeigen
            </summary>
            <pre className="mt-3 p-3 bg-gray-800 text-gray-200 rounded overflow-auto text-xs max-h-60">
              {this.state.error?.toString()}
              <hr className="my-2 border-gray-600" />
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={this.handleReload} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300 transition-colors"
              aria-label="Seite neu laden"
            >
              Seite neu laden
            </button>
            
            <button 
              onClick={() => window.history.back()} 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring focus:ring-gray-400 transition-colors"
              aria-label="Zurück zur vorherigen Seite"
            >
              Zurück
            </button>
          </div>
        </div>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary; 