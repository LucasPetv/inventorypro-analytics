import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h1 className="text-xl font-bold text-gray-900 mb-4">App Fehler</h1>
            <p className="text-gray-600 mb-4">
              Ein unerwarteter Fehler ist aufgetreten:
            </p>
            <div className="bg-gray-100 p-3 rounded text-sm text-left mb-4">
              <code className="text-red-600">
                {this.state.error?.message || 'Unbekannter Fehler'}
              </code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              🔄 Seite neu laden
            </button>
            <div className="mt-4 text-sm text-gray-500">
              Öffnen Sie die Browser-Konsole (F12) für weitere Details.
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
